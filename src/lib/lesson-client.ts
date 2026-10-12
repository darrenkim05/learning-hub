// Client script for lesson pages: pipeline strip highlighting + symbol popover.
export interface PageData {
  slug: string; title: string;
  concepts: Record<string, string>;
  symbols: Record<string, { html: string; tex: string; means: string }>;
}
export const page: PageData = JSON.parse(document.getElementById('lesson-data')!.textContent!);

// Pipeline strip: light the stage boxes of the section nearest the top of the screen.
const boxes = [...document.querySelectorAll<HTMLElement>('.pipe .box')];
const secs = [...document.querySelectorAll<HTMLElement>('section.sec')];
function light() {
  const y = innerHeight * 0.35;
  let cur: HTMLElement | undefined;
  for (const s of secs) if (s.getBoundingClientRect().top <= y) cur = s;
  const on = new Set((cur?.dataset.stage || '').split(' ').filter(Boolean));
  for (const b of boxes) b.classList.toggle('on', on.has(b.dataset.stage!));
  const first = boxes.find((b) => on.has(b.dataset.stage!));
  if (first) first.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
addEventListener('scroll', light, { passive: true });
light();

// Symbol popover: any [data-sym] (prose <S>, symbol boxes, \sym{} in equations).
const pop = document.getElementById('sym-pop')!;
const body = pop.querySelector('.body')!;
document.addEventListener('click', (e) => {
  const t = (e.target as Element).closest<HTMLElement>('[data-sym]');
  if (t) {
    const s = page.symbols[t.dataset.sym!];
    if (!s) return;
    body.innerHTML = `${s.html} &nbsp;${s.means.replace(/</g, '&lt;')}`;
    pop.classList.add('show');
  } else if (!(e.target as Element).closest('#sym-pop') || (e.target as Element).closest('.x')) {
    pop.classList.remove('show');
  }
});
