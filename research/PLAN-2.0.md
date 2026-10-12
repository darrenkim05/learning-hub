# learning-hub 2.0: build plan

Status: **planned, not built.** Decisions: `research/DECISIONS.md`. Work items: GitHub issues #2–#6 (tracker #1). 1.0 = the current hand-written HTML site.

## 1. Goal
Turn the site into an **AI personal teacher** for first-time learning of hard STEM concepts:
- Lessons teach a concept well (research: `research/TAKEAWAYS.md`).
- The site remembers what you're shaky on.
- An AI tutor answers questions about any text you select, knowing where you are and what you've struggled with.

**Out of 2.0:** AI-generated replacement questions (paused), cross-device sync, spaced-repetition scheduling.

## 2. Stack
- **Astro** (latest stable at setup), **MDX** lessons, **TypeScript** components.
- **KaTeX rendered at build time** (remark-math + rehype-katex). No maths library loads on the phone.
- **Vercel** with the Astro adapter. Pages are pre-rendered (static); one server route, `/api/ask`.
- **localStorage** behind a small `store` module, so it can be swapped for Supabase later.
- **Python + SymPy** correctness checks, run before deploy (not inside Vercel's build).

## 3. Repo layout (target)
```
src/content/lessons/<slug>.mdx   lesson = frontmatter + prose + components
src/content.config.ts            lesson schema (zod): fails the build on bad data
src/components/                  Pipeline, Symbols, Quiz, NextLine, Flag, Sim widgets…
src/lib/store.ts                 localStorage "lh2": flags, attempts, passcode, export/import
src/lib/tutor/                   bottom sheet, selection toolbar, client
src/pages/index.astro            topic list with prerequisites
src/pages/review.astro           shaky concepts + exam prep
src/pages/api/ask.ts             tutor route: passcode → provider → answer
src/pages/api/_provider.ts       callModel(system, messages); Gemini first
checks/<slug>.py                 SymPy maths checks (run before deploy)
public/legacy/                   1.0 pages, served unchanged
docs/COMPONENTS.md               component reference for authoring (~150 lines)
```

## 4. Data model
**Lesson frontmatter** (validated by the schema):
```yaml
title: Classification
prereqs: [nn-basics]            # lesson slugs
pipeline: [data, model, prediction, loss, optimiser]
concepts: { sigmoid: "Squashes any score into a probability between 0 and 1" }
symbols:  { p: "model's probability the point is blue", y: "true label: 1 blue, 0 red" }
ref: "Bishop, PRML §4.3"
```
- **Concept IDs** are defined per lesson and namespaced as `<slug>/<concept>`.
- **Sections** declare `stage` (which pipeline boxes they change) and `concepts`. Components refer to concepts by ID; an unknown ID fails the build.

**localStorage `lh2`:** `{ v: 2, flags: [{page, section, concept?, text?, at}], attempts: [{page, q, concept, ok, pick, misconception?, shown, at}], passcode }`, with export/import as a JSON file.

## 5. Feature rules (decided)
- **Questions never block you.** Answers stay hidden until you pick an option or tap "just show me" (logged as `shown`). Each wrong option names a misconception.
- **Derivations:** "choose the next line" from 3-4 options. Wrong options are common errors.
- **Each section:** at most 2-3 new ideas, picture before formula, and an explicit "same example, new twist" or "new example". Opens with a symbols box; symbols are tappable.
- **Simulations:** each has a goal line. Predictions are optional.
- **🚩 Not yet flags:** on section headings and on selected text. Cleared manually only.
- **Tutor:** select text → toolbar at the bottom of the screen → bottom sheet (a right-hand panel at ≥900px).
  - **Explain mode:** on explanation text, or on a question you've already attempted. Explains directly.
  - **Hint mode:** on a question you haven't attempted. Hints in order: nudge → principle → first step; full solution only after an attempt.
  - **Context sent:** section text, symbols, your flags, recent wrong answers.
  - **Thread:** one per section, kept for the session.
  - **"This seems wrong" button:** saves the answer locally.
  - **Passcode:** checked server-side with a constant-time compare.
  - **Provider:** behind `callModel`, Gemini free tier first.
- **Correctness:** `npm run check` runs each lesson's `checks/<slug>.py` before deploy. No build gate.

## 6. Issues (one session each, in order)
| Issue | Covers | Done when |
|---|---|---|
| #2 **A** Foundation | Astro + MDX + Vercel, legacy pages, lesson schema, KaTeX, pipeline strip, symbol glossary, stub lesson | Build passes; Darren checks the preview |
| #3 **B** Learner memory | store, Quiz, NextLine, 🚩 flags + selection toolbar + badge, `/review` | Build passes; answer/flag/reload shows on `/review` |
| #4 **C** AI tutor | `/api/ask` + passcode + Gemini, bottom sheet, explain + hint modes | Works on the preview with real keys |
| #5 **D** Pilot lesson | Full classification lesson + `checks/classification.py` | Check passes; ⏸ Darren's phone review |
| #6 **E** Authoring | `docs/COMPONENTS.md`, 2.0 explainer skill, delete 1.0 sources | Merged |

Tracker #1. Darren's manual setup: #16. #7–#15 were merged into the above.

## 7. Keeping token use low (Pro plan)
- **One agent, one issue per session.** Start each session fresh; `CLAUDE.md` points to the right files. No parallel agents.
- **No automated test suites** (no unit, e2e or Playwright files). "Done" = `npm run build` passes + Darren checks the Vercel preview on his phone. At most one quick screenshot when a layout is uncertain.
- **Maths is still checked:** a SymPy script per lesson, run with `npm run check` before deploy. It isn't a build gate.
- **Read narrowly:** the issue + PLAN §§2-5, not the whole `research/` folder.
- Out of 2.0: PWA, AI-generated questions, sync, spaced repetition.

## 8. Manual setup (Darren)
See issue #16: Gemini key (personal account), Vercel env vars `GEMINI_API_KEY` + `TUTOR_PASSCODE`, Astro preset after #2, phone review at #5.
