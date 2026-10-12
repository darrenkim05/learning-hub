// Server-side maths for component props: converts $..$ segments in a string to KaTeX HTML.
import katex from 'katex';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const opts = { throwOnError: true, trust: true, strict: false } as const;

/** "What is $\sigma(0)$?" -> HTML with the maths rendered, the rest escaped. */
export function inlineTex(s: string): string {
  return s.split(/(\$[^$]+\$)/g)
    .map((part) => (/^\$[^$]+\$$/.test(part) ? katex.renderToString(part.slice(1, -1), opts) : esc(part)))
    .join('');
}

/** A whole string as display maths. */
export const displayTex = (tex: string) => katex.renderToString(tex, { ...opts, displayMode: true });
