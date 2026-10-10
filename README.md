# learning-hub

Interactive, phone-first explainers. Each page in `explainers/` is one self-contained HTML file: no build step, and it works offline.

- `index.html`: the home page listing every explainer
- `explainers/`: the pages, linked to each other as siblings
- `kit/template.html`: the starting point for a new page (pinned map, check questions, colour key, canvas helpers)
- `kit/test-phone.js`: a 380px smoke test (`node kit/test-phone.js explainers/<page>.html --shots /tmp/shots`)
- `.claude/skills/explainer/SKILL.md`: how Claude builds and verifies a new explainer

Deploys as a static site (Vercel) from `main`.
