# learning-hub

Interactive, phone-first explainers. Each published page in `explainers/` is one self-contained HTML file (formulas use KaTeX from jsDelivr and fall back to plain text offline).

- `index.html`: the home page listing every explainer
- `src/`: page sources, which is where to edit
- `explainers/`: built pages (from `src/` via `node kit/build.js`), linked to each other as siblings
- `kit/kit.css`, `kit/kit.js`: shared styles and helpers (maths, question types, progress strip, canvas helpers)
- `kit/template.html`: starting point for a new page
- `kit/build.js`: inlines the kit into each source page
- `kit/test-phone.js`: 380px smoke test with phone-sized screenshots (`node kit/test-phone.js explainers/<page>.html --katex <katex>/package --shots /tmp/shots`)
- `.claude/skills/explainer/SKILL.md`: how Claude builds and verifies a new explainer

Deploys as a static site (Vercel, framework preset "Other", no build command) from `main`. The built files are committed, so the host needs no build step.
