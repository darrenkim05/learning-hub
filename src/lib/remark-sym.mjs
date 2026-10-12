// Rewrites \sym{key} (or \sym{key_1}) inside maths to a tappable symbol using the lesson's own symbol TeX.
// Symbols come from frontmatter: "z: meaning" uses the key as TeX; "sigma: {tex, means}" uses tex.
// A subscript suffix is kept: \sym{w_1} -> w_1 tapped as "w". Unknown keys fail the build.
import { visit } from 'unist-util-visit';

export default function remarkSym() {
  return (tree, file) => {
    const fm = file.data?.astro?.frontmatter ?? {};
    const symbols = fm.symbols ?? {};
    visit(tree, (node) => {
      if ((node.type !== 'math' && node.type !== 'inlineMath') || !node.value.includes('\\sym')) return;
      node.value = node.value.replace(/\\sym\{([A-Za-z]+)((?:_\{?[A-Za-z0-9]+\}?)?)\}/g, (_, key, sub) => {
        const def = symbols[key];
        if (def === undefined) throw new Error(`\\sym{${key}} in ${file.path}: no such symbol in frontmatter`);
        const tex = typeof def === 'string' ? key : def.tex;
        return `\\htmlData{sym=${key}}{${tex}${sub}}`;
      });
      // remark-math copied the text into hChildren, which is what rehype-katex reads.
      visit({ type: 'root', children: node.data?.hChildren ?? [] }, 'text', (t) => { t.value = node.value; });
      if (node.value.includes('\\sym')) throw new Error(`Bad \\sym in ${file.path}: ${node.value}`);
    });
  };
}
