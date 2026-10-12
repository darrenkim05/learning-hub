# learning-hub

Personal site of interactive lessons for hard university and masters STEM topics (engineering maths, physics, control, ML), aimed at **first-time learning** of new concepts, with an AI tutor. The owner, Darren, is the only user and reads on a phone.

## Status
- **1.0** (live): hand-written HTML in `explainers/`, built from `src/` + `kit/`. Legacy: don't extend it.
- **2.0** (in progress): Astro + MDX rebuild. Plan: `research/PLAN-2.0.md`. Decisions: `research/DECISIONS.md`. Work items: issues #2–#6, done in order (tracker #1).

## How to work
- **Darren is on the Pro plan: keep token use low.** One session = one issue, one agent, no subagents unless he asks. Read the issue and PLAN-2.0 §§2-5 only.
- **No automated test suites** (no unit, e2e or Playwright files). Done = `npm run build` passes + Darren checks the Vercel preview. At most one quick screenshot if a layout is uncertain.
- Check the issue's "Depends on" first. Say plainly what you didn't verify.
- #5 (pilot lesson) is a review gate: stop and wait for Darren's feedback before #6.
- Never put API keys in the repo. The tutor key and passcode live in Vercel env vars.

## Commands
Filled in by #2. Planned: `npm run dev`, `npm run build`, `npm run check` (SymPy maths checks, lessons only).

## Teaching rules (all lessons)
- Each section introduces at most 2-3 new ideas, puts the picture before the formula, and says whether it's the same example or a new one.
- Define every symbol (glossary). Every widget gets a goal. Questions never block scrolling.
- Wrong quiz options are real misconceptions. Use "choose the next line" for derivations.
- Lesson maths must pass `npm run check` before deploy.
- Research behind these rules: `research/TAKEAWAYS.md`.
