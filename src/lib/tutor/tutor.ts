// AI tutor: "Ask" action in the selection toolbar -> bottom sheet / side panel.
import './tutor.css';
import { page } from '../lesson-client';
import { registerAction, type Sel } from '../selection';
import { store, isAttempted } from '../store';

interface Turn { role: 'user' | 'assistant'; content: string; err?: boolean }
interface Ctx { sel: Sel; mode: 'hint' | 'explain'; sec: HTMLElement | null }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let katex: typeof import('katex').default | undefined;

/** Lesson text for the model: maths back to TeX, symbol box removed, hidden quiz answers removed in hint mode. */
function sectionText(sec: HTMLElement, hint: boolean): string {
  const c = sec.cloneNode(true) as HTMLElement;
  c.querySelectorAll('.symbox, button.flag, script, style').forEach((e) => e.remove());
  c.querySelectorAll('.qz').forEach((q) => {
    if (hint && (q as HTMLElement).dataset.attempted === '0') q.querySelectorAll('[hidden], .qz-why, .qz-bar').forEach((e) => e.remove());
    if (hint) q.querySelectorAll('[data-ok]').forEach((e) => e.removeAttribute('data-ok'));
  });
  c.querySelectorAll<HTMLElement>('.katex-display, .katex').forEach((k) => {
    if (!k.isConnected) return;
    const tex = k.querySelector('annotation')?.textContent ?? '';
    const d = k.classList.contains('katex-display');
    k.replaceWith(document.createTextNode(d ? `\n$$${tex}$$\n` : `$${tex}$`));
  });
  return (c.textContent || '').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim().slice(0, 6000);
}

function renderMath(src: string): string {
  const out: string[] = [];
  let last = 0;
  for (const m of src.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g)) {
    out.push(fmt(src.slice(last, m.index)));
    try { out.push(katex!.renderToString((m[1] ?? m[2]).trim(), { displayMode: m[1] !== undefined, throwOnError: false })); }
    catch { out.push(esc(m[0])); }
    last = m.index! + m[0].length;
  }
  out.push(fmt(src.slice(last)));
  return out.join('');
}
const fmt = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

// ---- UI ----
let root: HTMLElement, thread: HTMLElement, quote: HTMLElement, input: HTMLInputElement, cfg: HTMLElement;
let ctx: Ctx | undefined;
let busy = false;
let pendingQ: string | undefined; // question waiting for the passcode to be entered

const skey = (id: string) => `lh-tutor:${page.slug}:${id}`;
function load(id: string): Turn[] { try { return JSON.parse(sessionStorage.getItem(skey(id)) || '[]'); } catch { return []; } }
function save(id: string, t: Turn[]) { try { sessionStorage.setItem(skey(id), JSON.stringify(t.slice(-20))); } catch {} }

function build() {
  root = document.createElement('div');
  root.className = 'tutor'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Tutor');
  root.innerHTML = `<header><b>Tutor</b><button type="button" class="gear" aria-label="Passcode settings">⚙</button><button type="button" class="close" aria-label="Close">×</button></header>
  <div class="cfg"><input type="password" placeholder="Tutor passcode" autocomplete="off"><button type="button">Save</button></div>
  <div class="quote"></div><div class="thread"></div>
  <form><input type="text" placeholder="Ask a follow-up…" enterkeyhint="send"><button>Send</button></form>`;
  document.body.append(root);
  thread = root.querySelector('.thread')!; quote = root.querySelector('.quote')!;
  cfg = root.querySelector('.cfg')!; input = root.querySelector('form input')!;
  const pc = cfg.querySelector('input')!;
  root.querySelector('.close')!.addEventListener('click', () => root.classList.remove('show'));
  root.querySelector('.gear')!.addEventListener('click', () => { pc.value = store.passcode; cfg.classList.toggle('show'); });
  cfg.querySelector('button')!.addEventListener('click', async () => {
    store.passcode = pc.value.trim();
    if (!store.passcode) return;
    cfg.classList.remove('show');
    if (pendingQ) { const q = pendingQ; pendingQ = undefined; katex ??= (await import('katex')).default; void send(q); }
  });
  root.querySelector('form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (v) { input.value = ''; void send(v); }
  });
  thread.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('.rep');
    if (!b || !ctx) return;
    const i = +b.dataset.i!, t = load(ctx.sel.sectionId);
    store.addReport({ page: page.slug, section: ctx.sel.sectionId, selection: ctx.sel.text, answer: t[i]?.content ?? '' });
    b.textContent = 'Reported, thanks'; b.disabled = true;
  });
}

function draw() {
  if (!ctx) return;
  const t = load(ctx.sel.sectionId);
  thread.innerHTML = t.map((m, i) => m.err ? `<div class="m err">${esc(m.content)}</div>`
    : m.role === 'user' ? `<div class="m u">${esc(m.content)}</div>`
    : `<div class="m">${katex ? renderMath(m.content) : esc(m.content)}<button type="button" class="rep" data-i="${i}">This seems wrong</button></div>`).join('')
    + (busy ? '<div class="m muted">Thinking…</div>' : '');
  thread.scrollTop = thread.scrollHeight;
}

async function open(sel: Sel) {
  if (!root) build();
  const sec = sel.el?.closest<HTMLElement>('section.sec') ?? null;
  const qz = sel.el?.closest<HTMLElement>('.qz');
  const hint = !!qz && qz.dataset.attempted === '0' && !isAttempted(page.slug, qz.dataset.q ?? '');
  ctx = { sel, mode: hint ? 'hint' : 'explain', sec };
  quote.textContent = sel.text.length > 200 ? sel.text.slice(0, 200) + '…' : sel.text;
  root.classList.add('show');
  if (!store.passcode) {
    // First use on this device: ask for the passcode, then send the question automatically.
    pendingQ = hint ? `Give me a hint on: "${sel.text}"` : `Explain this: "${sel.text}"`;
    thread.innerHTML = '<div class="m">Enter your tutor passcode above to start. It is saved on this device, so you only do this once.</div>';
    cfg.classList.add('show');
    cfg.querySelector('input')!.focus();
    return;
  }
  katex ??= (await import('katex')).default;
  const t = load(sel.sectionId);
  // New selection in an existing thread: add it as a fresh question.
  const q = t.length && t.at(-1)!.role === 'assistant' ? `Now about this: "${sel.text}"` : hint ? `Give me a hint on: "${sel.text}"` : `Explain this: "${sel.text}"`;
  await send(q);
}

async function send(text: string) {
  if (!ctx || busy) return;
  const id = ctx.sel.sectionId;
  const t = load(id).filter((m) => !m.err);
  t.push({ role: 'user', content: text });
  save(id, t); busy = true; draw();
  const fail = (msg: string) => { const u = load(id).filter((m) => !m.err); u.push({ role: 'assistant', content: msg, err: true }); save(id, u); };
  if (!store.passcode) {
    fail('Enter your tutor passcode first (it opens below ⚙), then ask again.');
    cfg.classList.add('show'); busy = false; draw(); return;
  }
  try {
    if (!navigator.onLine) throw new Error('offline');
    const turns = t.filter((m) => !m.err).slice(-5).map(({ role, content }) => ({ role, content }));
    if (turns[0].role === 'assistant') turns.shift();
    const hint = ctx.mode === 'hint';
    const r = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-passcode': store.passcode },
      body: JSON.stringify({
        mode: ctx.mode, lesson: page.title,
        section: { id, title: ctx.sec?.dataset.title ?? '' },
        selection: ctx.sel.text.slice(0, 2000),
        sectionText: ctx.sec ? sectionText(ctx.sec, hint) : '',
        symbols: Object.fromEntries(Object.entries(page.symbols).map(([k, s]) => [k, { tex: s.tex, means: s.means }])),
        flags: store.flagsFor(page.slug).slice(-10).map((f) => ({ section: f.section, concept: f.concept, text: f.text })),
        wrong: store.recentWrong(page.slug, 5).map((a) => ({ q: a.q, concept: a.concept, misconception: a.misconception })),
        turns,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { fail('Check your passcode.'); cfg.classList.add('show'); }
    else if (r.status === 429) fail('Free tier limit hit, try again in a minute.');
    else if (!r.ok || !j.answer) fail(j.error || 'Something went wrong. Try again.');
    else { const u = load(id).filter((m) => !m.err); u.push({ role: 'assistant', content: j.answer }); save(id, u); }
  } catch {
    fail(navigator.onLine ? 'Could not reach the tutor. Try again.' : 'You seem to be offline. The tutor needs a connection.');
  }
  busy = false; draw();
}

registerAction({ label: 'Ask', onClick: (s) => { void open(s); } });
