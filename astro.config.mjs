// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

// KaTeX macros shared by every lesson.
// \sym{p} makes a tappable symbol inside an equation; \symt{yhat}{\hat y} when the key differs from the TeX.
const macros = {
  '\\sym': '\\htmlData{sym=#1}{#1}',
  '\\symt': '\\htmlData{sym=#1}{#2}',
};

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [mdx()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { trust: true, strict: false, macros }]],
    }),
  },
  redirects: {
    '/explainers/nn-basics-explorer.html': '/legacy/nn-basics-explorer.html',
    '/explainers/phase0-cnn-explorer.html': '/legacy/phase0-cnn-explorer.html',
  },
});
