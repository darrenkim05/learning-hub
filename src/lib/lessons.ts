// 1.0 pages in public/legacy/. Lessons may list these as prereqs.
export const LEGACY = {
  'nn-basics': { title: 'Neural network basics', href: '/legacy/nn-basics-explorer.html',
    blurb: 'From a straight line to a network you train yourself. Ends at CNNs.' },
  'phase0-cnn': { title: 'Inside my first CNN', href: '/legacy/phase0-cnn-explorer.html',
    blurb: 'The FashionMNIST model from Phase 0, layer by layer.' },
} as const;

export type Sym = string | { tex: string; means: string };
export const symTex = (k: string, s: Sym) => (typeof s === 'string' ? k : s.tex);
export const symMeans = (s: Sym) => (typeof s === 'string' ? s : s.means);

/** Lesson data the page puts in Astro.locals so components can validate IDs. */
export interface LessonCtx {
  slug: string;
  pipeline: string[];
  concepts: Record<string, string>;
  symbols: Record<string, Sym>;
}

export function ctx(locals: App.Locals): LessonCtx {
  const l = (locals as any).lesson as LessonCtx | undefined;
  if (!l) throw new Error('Lesson component used outside a lesson page');
  return l;
}

/** Throws (fails the build) on an unknown ID. */
export function need(kind: string, id: string, known: Record<string, unknown> | string[], slug: string) {
  const ok = Array.isArray(known) ? known.includes(id) : id in known;
  if (!ok) throw new Error(`[${slug}] unknown ${kind} "${id}". Known: ${(Array.isArray(known) ? known : Object.keys(known)).join(', ')}`);
}
