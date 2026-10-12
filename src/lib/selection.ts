// Fixed bottom toolbar shown when text inside the lesson article is selected.
// Other code adds buttons with registerAction (#4 adds "Ask").
export interface Sel { text: string; sectionId: string; el: HTMLElement | null }
export interface Action { label: string; onClick(sel: Sel): void }

const actions: Action[] = [];
let bar: HTMLElement | undefined;
let current: Sel | undefined;

export function registerAction(a: Action) { actions.push(a); render(); }

function render() {
  if (!bar) return;
  bar.replaceChildren(...actions.map((a) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = a.label;
    b.onclick = () => { if (current) { const s = current; clear(); a.onClick(s); } };
    return b;
  }));
}
function clear() { current = undefined; getSelection()?.removeAllRanges(); bar?.classList.remove('show'); }

function read(): Sel | undefined {
  const s = getSelection();
  if (!s || s.isCollapsed || !s.rangeCount) return;
  const text = s.toString().trim();
  const node = s.getRangeAt(0).commonAncestorContainer;
  const el = (node.nodeType === 1 ? node : node.parentElement) as HTMLElement | null;
  if (!text || !el || !el.closest('article.lesson')) return;
  return { text, el, sectionId: el.closest<HTMLElement>('section.sec')?.id ?? '' };
}

let timer: number | undefined;
function init() {
  bar = document.createElement('div');
  bar.className = 'seltool';
  bar.addEventListener('pointerdown', (e) => e.preventDefault()); // keep the selection alive
  document.body.append(bar);
  render();
  document.addEventListener('selectionchange', () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => { current = read(); bar!.classList.toggle('show', !!current); }, 200);
  });
}
init();
