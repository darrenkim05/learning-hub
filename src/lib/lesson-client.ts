// Client script for lesson pages: pipeline strip highlighting + symbol popover.
export interface PageData {
  slug: string; title: string;
  concepts: Record<string, string>;
  symbols: Record<string, { html: string; tex: string; means: string; cls: string }>;
}
export const page: PageData = JSON.parse(document.getElementById('lesson-data')!.textContent!);

// Pipeline strip: light the stage boxes of the section nearest the top of the screen.
const boxes = [...document.querySelectorAll<HTMLElement>('.pipe .box')];
const secs = [...document.querySelectorAll<HTMLElement>('section.sec')];
// Only touches the strip's own horizontal scroll, and only when the section changes: calling
// scrollIntoView on every scroll event fought the page's own scrolling on phones.
const strip = document.querySelector<HTMLElement>('.pipe-row');
const pos = document.querySelector<HTMLElement>('.pipe .pos');
let lastSec: HTMLElement | undefined | null = null;
let queued = false;
function light() {
  queued = false;
  const y = innerHeight * 0.35;
  let cur: HTMLElement | undefined;
  for (const s of secs) if (s.getBoundingClientRect().top <= y) cur = s;
  if (cur === lastSec) return;
  lastSec = cur;
  if (pos) pos.textContent = cur ? `${secs.indexOf(cur) + 1} / ${secs.length}` : '';
  const on = new Set((cur?.dataset.stage || '').split(' ').filter(Boolean));
  for (const b of boxes) b.classList.toggle('on', on.has(b.dataset.stage!));
  const first = boxes.find((b) => on.has(b.dataset.stage!));
  if (strip && first && strip.scrollWidth > strip.clientWidth) {
    strip.scrollTo({ left: first.offsetLeft - strip.clientWidth / 2 + first.offsetWidth / 2, behavior: 'smooth' });
  }
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(light); } }, { passive: true });
light();

// Symbol popover: any [data-sym] (prose <S>, symbol boxes, \sym{} in equations).
const pop = document.getElementById('sym-pop')!;
const body = pop.querySelector('.body')!;
document.addEventListener('click', (e) => {
  const t = (e.target as Element).closest<HTMLElement>('[data-sym]');
  if (t) {
    const s = page.symbols[t.dataset.sym!];
    if (!s) return;
    body.innerHTML = `<span class="${s.cls}">${s.html}</span> &nbsp;${s.means.replace(/</g, '&lt;')}`;
    pop.classList.add('show');
  } else if (!(e.target as Element).closest('#sym-pop') || (e.target as Element).closest('.x')) {
    pop.classList.remove('show');
  }
});

// Faint underline on a symbol's first appearance in each section only (not in the symbols row).
for (const sec of secs) {
  const seen = new Set<string>();
  for (const el of sec.querySelectorAll<HTMLElement>('[data-sym]')) {
    if (el.closest('.symbox')) continue;
    const k = el.dataset.sym!;
    if (seen.has(k)) continue;
    seen.add(k);
    el.classList.add('first');
  }
}
