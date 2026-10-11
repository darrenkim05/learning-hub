#!/usr/bin/env node
/*
  Phone-width smoke test for an explainer page.
    node kit/test-phone.js explainers/<slug>-explorer.html [--width 380] [--shots out-dir] [--katex dir]

  Fails (exit 1) on: console errors, page errors, a visible #fatal banner, horizontal
  page overflow, a blank visible canvas, KaTeX parse errors, the page never setting
  window.__ready, or a multiple-choice question that never reaches a right answer.
  It clicks every button and option once.
  --shots writes viewport-sized screenshots (380×800, readable) of the whole page before clicking.
  --katex points at an unpacked katex package (…/package) so pages that load KaTeX from
  jsDelivr can be tested offline; without it the page falls back to plain TeX text.
  Page-specific checks (does the model learn, do numbers match a reference) belong in a
  separate script.
*/
const path = require('path'), fs = require('fs');
let chromium;
for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) {
  try { ({ chromium } = require(p)); break; } catch (e) { /* try next */ }
}
if (!chromium) { console.error('playwright not found: npm i -D playwright'); process.exit(2); }

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const file = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const width = +(opt('width') || 380), shots = opt('shots'), katexDir = opt('katex') || process.env.KATEX_DIR;
if (!file) { console.error('usage: node kit/test-phone.js <page.html> [--width 380] [--shots dir] [--katex dir]'); process.exit(2); }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = [];
  if (katexDir) await page.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/(.*)$/, (route, req) => {
    const rel = decodeURIComponent(new URL(req.url()).pathname.replace(/^.*\/dist\//, ''));
    const f = path.join(katexDir, 'dist', rel);
    fs.existsSync(f) ? route.fulfill({ path: f }) : route.abort();
  });
  else await page.route(/^https?:\/\//, r => r.abort()); // offline: no network at all
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.goto('file://' + path.resolve(file));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 }).catch(() => errs.push('window.__ready never became true'));
  await page.waitForTimeout(300);

  const overflow = () => page.evaluate(() => {
    const W = document.documentElement.clientWidth, bad = [];
    const scrolls = e => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return true; } return false; };
    document.querySelectorAll('body *').forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width && (r.right > W + .5 || r.left < -.5) && getComputedStyle(e).position !== 'absolute' && !e.closest('[hidden]') && !scrolls(e))
        bad.push(`${e.tagName.toLowerCase()}#${e.id}.${String(e.className).slice(0, 30)} [${Math.round(r.left)}, ${Math.round(r.right)}]`);
    });
    return { scrollWidth: document.documentElement.scrollWidth, W, bad: bad.slice(0, 10) };
  });
  const blankCanvases = () => page.evaluate(() => [...document.querySelectorAll('canvas')].filter(c => {
    if (!c.offsetParent || !c.width) return false;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, seen = new Set();
    for (let i = 0; i < d.length && seen.size < 4; i += 4 * 97) seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]);
    return seen.size < 3;
  }).map(c => '#' + (c.id || c.className)));
  const katexErrors = await page.evaluate(() => [...document.querySelectorAll('.katex-error')].map(e => e.getAttribute('title') || e.textContent).slice(0, 5));
  const katexLoaded = await page.evaluate(() => !!window.katex);
  const o1 = await overflow(), blank1 = await blankCanvases();

  if (shots) {
    fs.mkdirSync(shots, { recursive: true });
    for (const f of fs.readdirSync(shots)) if (/^view-\d+\.png$/.test(f)) fs.unlinkSync(path.join(shots, f));
    const H = await page.evaluate(() => document.documentElement.scrollHeight); let k = 0;
    for (let y = 0; y < H; y += 700) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(120); await page.screenshot({ path: path.join(shots, `view-${String(++k).padStart(2, '0')}.png`) }); }
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  // Click every non-option button once (skip file inputs), then answer every multiple-choice question.
  const n = await page.$$eval('button:not(.opt)', bs => bs.length);
  for (let i = 0; i < n; i++) {
    const b = (await page.$$('button:not(.opt)'))[i];
    if (!b || !(await b.isVisible()) || await b.isDisabled()) continue;
    if (await b.evaluate(e => e.hasAttribute('data-loadw'))) continue;
    await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(60);
  }
  const unanswered = [];
  for (const q of await page.$$('.check, .predict')) {
    const id = await q.evaluate(e => e.id);
    const opts = await q.$$('.opt'); if (!opts.length) continue; // e.g. a number-input prediction
    for (const o of opts) if (!(await o.isDisabled())) { await o.scrollIntoViewIfNeeded(); await o.click({ timeout: 5000 }).catch(() => errs.push(`could not click an option in #${id} (covered or moving)`)); }
    if (!(await q.$('.opt.right'))) unanswered.push(id);
  }
  await page.waitForTimeout(500);
  const o2 = await overflow();
  const fatal = await page.$eval('#fatal', e => e.hidden ? null : e.textContent).catch(() => null);
  const katexErrors2 = await page.evaluate(() => [...document.querySelectorAll('.katex-error')].map(e => e.getAttribute('title') || e.textContent).slice(0, 5));
  await browser.close();

  const problems = [...errs];
  if (fatal) problems.push('fatal banner: ' + fatal);
  for (const [k, o] of [['initial', o1], ['after clicks', o2]]) if (o.scrollWidth > o.W || o.bad.length) problems.push(`overflow (${k}): scrollWidth ${o.scrollWidth} > ${o.W}; ${o.bad.join(' | ')}`);
  if (blank1.length) problems.push('blank canvases: ' + blank1.join(', '));
  if (katexErrors.length || katexErrors2.length) problems.push('KaTeX errors: ' + [...katexErrors, ...katexErrors2].join(' | '));
  if (unanswered.length) problems.push('questions with no right answer: ' + unanswered.join(', '));
  console.log(`${file} @ ${width}px: ${n} buttons clicked, KaTeX ${katexLoaded ? 'loaded' : 'not loaded (fallback text)'}, ${problems.length ? 'FAIL' : 'PASS'}`);
  problems.forEach(p => console.log('  - ' + p));
  process.exit(problems.length ? 1 : 0);
})();
