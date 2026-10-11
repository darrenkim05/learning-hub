#!/usr/bin/env node
/*
  Inlines the shared kit into a page so every published explainer stays one self-contained file.
    node kit/build.js            → builds every src/*.html into explainers/
    node kit/build.js src/x.html → builds one
  In a source page, put  /*@kit.css*\/  inside <style> and  /*@kit.js*\/  inside <script>.
  Edit src/ and kit/, never explainers/ directly (those files are overwritten).
*/
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'kit/kit.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'kit/kit.js'), 'utf8');
const args = process.argv.slice(2);
const files = args.length ? args : fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.html')).map(f => 'src/' + f);
for (const f of files) {
  const src = fs.readFileSync(path.resolve(root, f), 'utf8');
  if (!src.includes('/*@kit.css*/') || !src.includes('/*@kit.js*/')) { console.error(`${f}: missing /*@kit.css*/ or /*@kit.js*/ placeholder`); process.exit(1); }
  const out = src.replace('/*@kit.css*/', () => css).replace('/*@kit.js*/', () => js);
  const dest = path.join(root, 'explainers', path.basename(f));
  const note = `<!-- Built by kit/build.js from ${f}. Edit the source, not this file. -->`;
  fs.writeFileSync(dest, out.replace(/^<!doctype html>/i, m => m + '\n' + note));
  console.log(`built ${path.relative(root, dest)} (${(out.length / 1024).toFixed(0)} KB)`);
}
