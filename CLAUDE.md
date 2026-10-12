# learning-hub

Personal site of interactive lessons for hard university and masters STEM topics (engineering maths, physics, control, ML), aimed at **first-time learning** of new concepts, with an AI tutor. The owner, Darren, is the only user and reads on a phone.

## Status
- **1.0** (live): hand-written HTML in `explainers/`, built from `src/` + `kit/`. Legacy: don't extend it.
- **2.0** (in progress): Astro + MDX rebuild. Plan: `research/PLAN-2.0.md`. Decisions: `research/DECISIONS.md`. Work items: GitHub issues labelled `2.0` (tracker #1).

## How to work
- One session = one issue (slice). Read the issue, then PLAN-2.0 §§2-5. Don't re-read the whole `research/` folder.
- Check the issue's "Depends on" first; stop if a dependency isn't merged.
- Meet the issue's "Done when" before calling it done. Say plainly what you didn't verify.
- Keep shared files (lesson layout, `src/lib/store.ts`) to small, additive edits so parallel slices don't conflict.
- S11 is a review gate: stop and wait for Darren's feedback before S12.
- Never put API keys in the repo. The tutor key and passcode live in Vercel env vars.

## Commands
Filled in by S0. Planned: `npm run dev`, `npm run build`, `npm test` (Playwright at 380px), `npm run check` (SymPy maths checks).
- Cloud sessions: Chromium is pre-installed. Never run `playwright install`.

## Teaching rules (all lessons)
- Each section introduces at most 2-3 new ideas, puts the picture before the formula, and says whether it's the same example or a new one.
- Define every symbol (glossary). Every widget gets a goal. Questions never block scrolling.
- Wrong quiz options are real misconceptions. Use "choose the next line" for derivations.
- Maths must pass `npm run check` before deploy.
- Research behind these rules: `research/TAKEAWAYS.md`.
