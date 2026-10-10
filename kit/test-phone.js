#!/usr/bin/env node
/*
  Phone-width smoke test for an explainer page.
    node kit/test-phone.js explainers/<slug>-explorer.html [--width 380] [--shots out-dir]

  Fails (exit 1) on: console errors, page errors, a visible #fatal banner,
  horizontal overflow, the page never setting window.__ready, or a check
  question that never reaches a right answer.
  It clicks every button and option once. Page-specific checks (does the model
  learn, do numbers match a reference) belong in a script next to the page.
*/
const path = require('path');
let chromium;
for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) {
  try { ({ chromium } = require(p)); break; } catch (e) { /* try next */ }
}
if (!chromium) { console.error('playwright not found: npm i -D playwright'); process.exit(2); }

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const width = +(opt('width') || 380), shots = opt('shots');
if (!file) { console.error('usage: node kit/test-phone.js <page.html> [--width 380] [--shots dir]'); process.exit(2); }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.goto('file://' + path.resolve(file));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 }).catch(() => errs.push('window.__ready never became true'));

  const overflow = () => page.evaluate(() => {
    const W = document.documentElement.clientWidth, bad = [];
    document.querySelectorAll('body *').forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width && (r.right > W + .5 || r.left < -.5) && !e.closest('pre') && getComputedStyle(e).position !== 'absolute' && !e.closest('[hidden]'))
        bad.push(`${e.tagName.toLowerCase()}#${e.id}.${e.className} [${Math.round(r.left)}, ${Math.round(r.right)}]`);
    });
    return { scrollWidth: document.documentElement.scrollWidth, W, bad: bad.slice(0, 10) };
  });
  const o1 = await overflow();

  // Click every non-option button once (skip file inputs / links), then answer every check.
  const n = await page.$$eval('button:not(.opt)', bs => bs.length);
  for (let i = 0; i < n; i++) {
    const b = (await page.$$('button:not(.opt)'))[i];
    if (!b || !(await b.isVisible()) || await b.isDisabled()) continue;
    if (await b.evaluate(e => e.hasAttribute('data-loadw'))) continue;
    await b.scrollIntoViewIfNeeded(); await b.click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(60);
  }
  const unanswered = [];
  for (const q of await page.$$('.check, .predict')) {
    const id = await q.evaluate(e => e.id);
    const opts = await q.$$('.opt'); if (!opts.length) continue; // e.g. a number-input prediction
    for (const o of opts) if (!(await o.isDisabled())) { await o.scrollIntoViewIfNeeded(); await o.click(); }
    if (!(await q.$('.opt.right'))) unanswered.push(id);
  }
  await page.waitForTimeout(500);
  const o2 = await overflow();
  const fatal = await page.$eval('#fatal', e => e.hidden ? null : e.textContent).catch(() => null);

  if (shots) {
    require('fs').mkdirSync(shots, { recursive: true });
    for (const s of await page.$$('section.sec')) { const id = await s.evaluate(e => e.id); await s.screenshot({ path: path.join(shots, id + '.png') }); }
  }
  await browser.close();

  const problems = [...errs];
  if (fatal) problems.push('fatal banner: ' + fatal);
  for (const [k, o] of [['initial', o1], ['after clicks', o2]]) if (o.scrollWidth > o.W || o.bad.length) problems.push(`overflow (${k}): scrollWidth ${o.scrollWidth} > ${o.W}; ${o.bad.join(' | ')}`);
  if (unanswered.length) problems.push('questions with no right answer: ' + unanswered.join(', '));
  console.log(`${file} @ ${width}px: ${n} buttons clicked, ${problems.length ? 'FAIL' : 'PASS'}`);
  problems.forEach(p => console.log('  - ' + p));
  process.exit(problems.length ? 1 : 0);
})();
