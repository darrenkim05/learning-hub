// Lesson-page behaviour backed by the store: quizzes, section flags, "Not yet" selection action.
import { page } from './lesson-client';
import { store, latest } from './store';
import { registerAction } from './selection';

// ---- Quiz / NextLine -------------------------------------------------------
const qzs = [...document.querySelectorAll<HTMLElement>('.qz')];
const opts = (q: HTMLElement) => [...q.querySelectorAll<HTMLElement>('.qz-opt')];

function reveal(q: HTMLElement, pick: number) {
  const os = opts(q);
  const ok = os.find((o) => o.dataset.ok === '1')!;
  q.classList.add('done');
  q.dataset.attempted = '1';
  for (const o of os) o.classList.remove('right', 'wrong', 'picked');
  ok.classList.add('right');
  ok.querySelector<HTMLElement>('.qz-why')!.hidden = false;
  const p = os[pick];
  if (p) {
    p.classList.add('picked');
    if (p !== ok) p.classList.add('wrong');
    p.querySelector<HTMLElement>('.qz-why')!.hidden = false;
  }
  q.querySelector<HTMLElement>('.qz-show')!.hidden = true;
  q.querySelector<HTMLElement>('.qz-retry')!.hidden = false;
}
function reset(q: HTMLElement) {
  q.classList.remove('done');
  for (const o of opts(q)) { o.classList.remove('right', 'wrong', 'picked'); o.querySelector<HTMLElement>('.qz-why')!.hidden = true; }
  q.querySelector<HTMLElement>('.qz-show')!.hidden = false;
  q.querySelector<HTMLElement>('.qz-retry')!.hidden = true;
}
function record(q: HTMLElement, pick: number) {
  const o = opts(q)[pick];
  const ok = !!o && o.dataset.ok === '1';
  store.addAttempt({
    page: page.slug, q: q.dataset.q!, concept: q.dataset.concept!, ok, pick, shown: pick < 0,
    misconception: o && !ok ? o.querySelector('.qz-why')!.textContent!.trim() : undefined,
  });
  reveal(q, pick);
}

for (const q of qzs) {
  q.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('.qz-retry')) return reset(q);
    if (t.closest('.qz-show') && !q.classList.contains('done')) return record(q, -1);
    const o = t.closest<HTMLElement>('.qz-pick')?.parentElement;
    if (o && !q.classList.contains('done')) record(q, +o.dataset.i!);
  });
}
// Restore previous attempts on load.
for (const a of latest(store.load().attempts)) {
  if (a.page !== page.slug) continue;
  const q = qzs.find((x) => x.dataset.q === a.q);
  if (q) reveal(q, a.pick);
}

// ---- Flags -----------------------------------------------------------------
const secOf = (id: string) => document.getElementById(id);
const firstConcept = (sec: HTMLElement | null) => {
  const c = sec?.dataset.concepts?.split(' ')[0];
  return c ? `${page.slug}/${c}` : undefined;
};
const sectionFlag = (id: string) => store.flagsFor(page.slug).find((f) => f.section === id && !f.text);

function paintFlags() {
  for (const b of document.querySelectorAll<HTMLElement>('.flag')) {
    const on = !!sectionFlag(b.dataset.flag!);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  }
}
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('.flag');
  if (!b) return;
  const id = b.dataset.flag!;
  const f = sectionFlag(id);
  if (f) store.clearFlag(f);
  else store.addFlag({ page: page.slug, section: id, concept: firstConcept(secOf(id)) });
});
store.onChange(paintFlags);
paintFlags();

registerAction({
  label: 'Not yet',
  onClick: (s) => store.addFlag({
    page: page.slug, section: s.sectionId, concept: firstConcept(secOf(s.sectionId)), text: s.text.slice(0, 500),
  }),
});
