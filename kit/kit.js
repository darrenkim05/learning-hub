/* ===================== learning-hub kit (inlined into each page by kit/build.js) ===================== */
'use strict';
const DPR = 2;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const fmtInt = n => Math.round(n).toLocaleString('en-US');
function fmt(v, d = 2) { let s = v.toFixed(d); if (/^-0\.?0*$/.test(s)) s = s.slice(1); return s; }
/* number for TeX: keeps the minus sign a proper minus and wraps negatives in brackets when asked */
function tn(v, d = 2, paren = false) { const s = fmt(v, d); return paren && v < 0 && s !== '0' ? `(${s})` : s; }
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
/* Canvas drawn in logical px (w × h), crisp at 2×, scales down to fit the phone. */
function setupCanvas(cv, w, hh) {
  cv.width = w * DPR; cv.height = hh * DPR; cv.style.width = '100%'; if (!cv.style.maxWidth) cv.style.maxWidth = w + 'px';
  cv._w = w; cv._h = hh; const c = cv.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0); return c;
}
function evPos(cv, e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv._w / r.width, (e.clientY - r.top) * cv._h / r.height]; }
function tween(dur, step, done) {
  let start = null, id, dead = false;
  function f(ts) { if (dead) return; if (start === null) start = ts; const t = Math.min(1, (ts - start) / dur); step(t); if (t < 1) id = requestAnimationFrame(f); else if (done) done(); }
  id = requestAnimationFrame(f); return () => { dead = true; cancelAnimationFrame(id); };
}
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r()); }
const COL = { bg: [17, 21, 28], blue: [88, 196, 221], red: [252, 98, 85], yellow: [255, 210, 63], green: [131, 193, 103], orange: [255, 159, 67], purple: [180, 142, 240] };
const HEX = { blue: '#58c4dd', red: '#fc6255', yellow: '#ffd23f', green: '#83c167', orange: '#ff9f43', purple: '#b48ef0', text: '#e7eaf0', muted: '#98a2b3', line: '#3a4252', panel: '#141821' };
function mix(a, b, t) { return `rgb(${a[0] + (b[0] - a[0]) * t | 0},${a[1] + (b[1] - a[1]) * t | 0},${a[2] + (b[2] - a[2]) * t | 0})`; }
/* Diverging colour: blue = positive, red = negative, scaled by m. */
function divCol(v, m) { const t = clamp(Math.abs(v) / (m || 1), 0, 1); return mix(COL.bg, v >= 0 ? COL.blue : COL.red, Math.pow(t, .7)); }
function grayCol(v) { const g = clamp(v, 0, 1) * 255 | 0; return `rgb(${g},${g},${g})`; }
function maxAbs(a) { let m = 0; for (const v of a) { const x = Math.abs(v); if (x > m) m = x; } return m || 1; }
/* Loud failure: red banner at the top. */
function showFatal(msg) {
  const f = $('#fatal'); f.hidden = false; f.textContent = (f.textContent ? f.textContent + '\n' : '') + '⚠ ' + msg;
  console.error(msg);
}
window.addEventListener('error', e => showFatal('Script error: ' + e.message));

/* ===================== Maths (KaTeX from jsDelivr; falls back to plain TeX text offline) =====================
   Static: <span class="m">x^2</span> (inline) or <div class="M">\frac{a}{b}</div> (display).
   Dynamic: tex(el, 'z = ' + tn(z), display?).
   Colour macros match the page's colour key:
   \pw{} purple = weights, \og{} orange = loss/gradients, \bl{} blue = inputs/positive,
   \rd{} red = negative, \yl{} yellow = focus, \gr{} green = true/correct.               */
const TEX_MACROS = {
  '\\pw': '\\textcolor{##b48ef0}{#1}', '\\og': '\\textcolor{##ff9f43}{#1}', '\\bl': '\\textcolor{##58c4dd}{#1}',
  '\\rd': '\\textcolor{##fc6255}{#1}', '\\yl': '\\textcolor{##ffd23f}{#1}', '\\gr': '\\textcolor{##83c167}{#1}',
};
function tex(el, src, display) {
  if (typeof el === 'string') el = $(el);
  if (!el) return;
  if (window.katex) { try { katex.render(src, el, { displayMode: !!display, throwOnError: false, macros: { ...TEX_MACROS }, strict: false }); return; } catch (e) { /* fall through */ } }
  el.textContent = src;
}
function renderMath(root = document) {
  for (const el of $$('.m, .M', root)) { if (el.dataset.done) continue; el.dataset.done = 1; tex(el, el.textContent.trim(), el.classList.contains('M')); }
}

/* ===================== Questions =====================
   mcq(root, {q, opts:[{t, ok?, why}], mode?:'predict', after?(right)})
     check mode: wrong picks explain and stay retryable; a right pick locks and lists why others are wrong.
     predict mode: the first pick locks, reveals the answer, then calls after().
   numq(root, {q, answer, tol, hint, solution, after?})   — type a number; hint on a miss; "show me" reveals the worked solution.
   orderq(root, {q, items:[...in correct order], why})      — tap the items in the right order.            */
function mcq(root, spec) {
  const predict = spec.mode === 'predict';
  root.innerHTML = '';
  root.append(h('div', { class: 'qh' }, predict ? 'Predict, then reveal' : 'Check'));
  const qd = h('div', { class: 'q', html: spec.q }); root.append(qd);
  const fb = h('div'); const btns = [];
  spec.opts.forEach((o, i) => {
    const b = h('button', { class: 'opt', html: o.t });
    b.addEventListener('click', () => {
      if (b.disabled) return;
      const right = !!o.ok;
      b.classList.add(right ? 'right' : 'wrong');
      fb.innerHTML = '';
      fb.append(h('div', { class: 'fb ' + (right ? 'ok' : 'no'), html: (right ? '<b class="c-green">✓ Right.</b> ' : '<b class="c-red">✗ Not quite.</b> ') + o.why }));
      if (right || predict) {
        btns.forEach((bb, j) => { bb.disabled = true; if (spec.opts[j].ok) bb.classList.add('right'); });
        if (!right) fb.append(h('div', { class: 'fb ok', html: '<b class="c-green">Answer:</b> ' + spec.opts.find(x => x.ok).why }));
        const others = spec.opts.filter((x, j) => j !== i && !x.ok);
        if (others.length) {
          const d = h('details'); d.append(h('summary', {}, 'Why the other answers are wrong'));
          const ul = h('ul', { class: 'others' }); others.forEach(x => ul.append(h('li', { html: `<b>${x.t}</b>: ${x.why}` }))); d.append(ul); fb.append(d);
        }
        if (spec.after) spec.after(right);
      } else b.disabled = true;
      renderMath(fb);
    });
    btns.push(b); root.append(b);
  });
  root.append(fb); renderMath(root);
}
function numq(root, spec) {
  root.innerHTML = ''; root.classList.add('tryit');
  root.append(h('div', { class: 'qh' }, 'Your turn: work it out'), h('div', { class: 'q', html: spec.q }));
  const inp = h('input', { type: 'text', inputmode: 'decimal', placeholder: 'your answer', 'aria-label': 'your answer' });
  const go = h('button', { class: 'btn primary' }, 'Check'), show = h('button', { class: 'btn' }, 'Show me');
  const fb = h('div'); let tries = 0, solved = false;
  const reveal = (right) => {
    solved = true; inp.disabled = true; go.disabled = true; show.disabled = true;
    fb.append(h('div', { class: 'fb ok', html: (right ? '' : '<b class="c-green">Worked solution:</b><br>') + spec.solution }));
    renderMath(fb); if (spec.after) spec.after(right);
  };
  go.onclick = () => {
    if (solved) return; const v = parseFloat(String(inp.value).replace('−', '-').replace(',', '.'));
    fb.innerHTML = '';
    if (Number.isNaN(v)) { fb.append(h('div', { class: 'fb no', html: 'Type a number first (decimals are fine).' })); return; }
    tries++;
    if (Math.abs(v - spec.answer) <= (spec.tol ?? 0.01)) { fb.append(h('div', { class: 'fb ok', html: '<b class="c-green">✓ Right.</b>' })); reveal(true); }
    else { fb.append(h('div', { class: 'fb no', html: `<b class="c-red">✗ Not quite</b> (you said ${v}). ` + (spec.hint || '') + (tries >= 2 ? ' Or press <b>Show me</b>.' : '') })); renderMath(fb); }
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
  show.onclick = () => { fb.innerHTML = ''; reveal(false); };
  root.append(h('div', { class: 'numrow' }, inp, go, show), fb); renderMath(root);
}
function orderq(root, spec) {
  root.innerHTML = ''; root.classList.add('tryit', 'ordq');
  root.append(h('div', { class: 'qh' }, 'Your turn: put them in order'), h('div', { class: 'q', html: spec.q }));
  const done = h('div', { class: 'done' }), pool = h('div', { class: 'pool' }), fb = h('div'); let next = 0;
  const shuffled = spec.items.map((t, i) => ({ t, i })); const r = mulberry32(spec.items.length * 97 + 5);
  for (let i = shuffled.length - 1; i > 0; i--) { const j = r() * (i + 1) | 0; [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  if (shuffled.every((x, k) => x.i === k)) shuffled.reverse();
  shuffled.forEach(x => { const b = h('button', { class: 'chip', html: x.t }); b.onclick = () => {
    if (x.i === next) { done.append(b); b.disabled = true; next++; fb.innerHTML = ''; if (next === spec.items.length) { fb.append(h('div', { class: 'fb ok', html: '<b class="c-green">✓ Right order.</b> ' + spec.why })); renderMath(fb); } }
    else { fb.innerHTML = ''; fb.append(h('div', { class: 'fb no', html: `<b class="c-red">✗ Not next.</b> ${spec.hints?.[x.i] || 'Think about what each step needs from the one before.'}` })); }
  }; pool.append(b); });
  root.append(done, pool, fb); renderMath(root);
}

/* ===================== Progress strip (one dot per section) + tap-to-define terms ===================== */
let __activeSec = '';
function initStrip(shorts) {
  const strip = $('#strip'); const secs = $$('section.sec');
  secs.forEach((s, i) => {
    const b = h('button', { class: 'pstep', 'aria-label': `Section ${i + 1}: ${s.dataset.title}` }, h('span', { class: 'pn' }, String(i + 1)), shorts ? h('span', { class: 'pl' }, shorts[i]) : null);
    b.onclick = () => s.scrollIntoView({ behavior: 'smooth' }); strip.append(b);
  });
  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; updateStrip(); }); } }, { passive: true });
  updateStrip();
}
function updateStrip() {
  const secs = $$('section.sec'); if (!secs.length) return;
  const line = $('#pipe').getBoundingClientRect().bottom + window.innerHeight * .3;
  let cur = secs[0]; for (const s of secs) if (s.getBoundingClientRect().top < line) cur = s;
  if (cur.id === __activeSec) return; __activeSec = cur.id; const n = secs.indexOf(cur) + 1;
  $$('.pstep').forEach((b, j) => { b.classList.toggle('active', j === n - 1); b.classList.toggle('done', j < n - 1); });
  $('#here').innerHTML = `<b>§${n} ${cur.dataset.title}</b> · ${n} of ${secs.length}`;
}
function initTerms() {
  const pop = $('#pop'); if (!pop) return;
  document.addEventListener('click', e => {
    const t = e.target.closest('.t');
    if (!t) { pop.hidden = true; return; }
    pop.innerHTML = t.dataset.d; renderMath(pop); pop.hidden = false;
    const r = t.getBoundingClientRect(); const w = Math.min(300, window.innerWidth - 32);
    pop.style.width = w + 'px'; pop.style.left = clamp(r.left + window.scrollX, 16, window.innerWidth - w - 16) + 'px'; pop.style.top = (r.bottom + window.scrollY + 6) + 'px';
  });
}

/* ===================== Boot =====================
   kitBoot({ shorts, inits:[fn...], checks:{id: spec} }) runs after KaTeX (deferred) has loaded. */
function kitBoot(cfg) {
  const run = () => {
    try {
      if (!window.katex) document.body.classList.add('nomath');
      renderMath(); initStrip(cfg.shorts); initTerms();
      for (const f of cfg.inits || []) f();
      for (const [id, spec] of Object.entries(cfg.checks || {})) mcq($('#' + id), spec);
      if (!window.katex) { document.body.classList.add('nomath'); const n = $('#mathnote'); if (n) n.hidden = false; }
      window.__ready = true; // the phone test waits for this
    } catch (e) { showFatal('Startup failed: ' + e.message); throw e; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
}
