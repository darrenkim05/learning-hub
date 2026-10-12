# learning-hub 2.0: build plan

Status: **planned, not built.** Decisions: `research/DECISIONS.md`. Work items: GitHub issues labelled `2.0` (one per slice below). 1.0 = the current hand-written HTML site.

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
- **Playwright** phone tests at 380px (Chromium is pre-installed in Claude Code cloud sessions).

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
checks/<slug>.py                 SymPy checks; write src/data/checks.json
public/legacy/                   1.0 pages, served unchanged
tests/                           Playwright phone tests
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
check: true                     # requires a passing checks/<slug>.py
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
- **Correctness:** `npm run check` runs every `checks/*.py` and writes `src/data/checks.json` (lesson hash + date + pass). The build **fails** if a `check: true` lesson has no passing entry or the lesson changed since its check. The footer shows "✓ checked <date> · ref".

## 6. Vertical slices (= GitHub issues)
Issues: tracker #1 · S0 #2 · S1 #3 · S2 #4 · S3 #5 · S4 #6 · S5 #7 · S6 #8 · S7 #9 · S8 #10 · S9 #11 · S10 #12 · S11 #13 · S12 #14 · S13 #15 · manual setup #16.

Each slice works end to end and is shippable on its own. "Done when" is the acceptance test.

| ID | Slice | Depends on | Done when |
|---|---|---|---|
| S0 | **Walking skeleton:** Astro + MDX + TS project, Vercel adapter, 1.0 pages moved to `public/legacy/`, Playwright phone test, CLAUDE.md commands | none | Vercel preview deploys; home links legacy pages; `npm test` passes at 380px |
| S1 | **Lesson schema + first lesson:** content collection + zod schema, lesson layout, build-time KaTeX, index lists lessons with prereqs; stub `classification` lesson with one section | S0 | A typo'd concept ID or prereq fails `npm run build`; stub renders maths with no client JS |
| S2 | **Pipeline strip** in the lesson layout; highlights the section's `stage` boxes on scroll | S1 | Scrolling the stub lights the right boxes (phone test) |
| S3 | **Symbol glossary:** per-section symbols box; tappable symbols in prose and inside equations (spike KaTeX `\htmlData`; fallback chip row) | S1 | Tapping `p` shows its definition at 380px |
| S4 | **Quiz + store:** non-blocking `<Quiz>` with misconceptions and "just show me"; `store.ts` with export/import | S1 | An answer is saved, survives reload, and appears in an exported JSON |
| S5 | **NextLine** derivation component, recording attempts in the store | S4 | Picking a wrong line shows the error explanation and logs it |
| S6 | **Flags + selection toolbar (flag action) + shaky badge** in the header | S4 | Flag a section and a selection; badge count updates; survives reload |
| S7 | **Review page:** shaky concepts and wrong answers grouped by lesson → concept, with misconceptions, links back to sections, manual clear, export/import | S4, S6 | Data from the stub lesson shows grouped; links scroll to the right section |
| S8 | **Tutor, explain mode:** `/api/ask` with passcode + Gemini provider + mock provider; bottom sheet; "Ask" in the selection toolbar; passcode settings panel; context payload | S1 (S6 for toolbar, or adds it) | Live answer on the Vercel preview; wrong passcode → 401; phone test passes with the mock |
| S9 | **Tutor, hint mode and polish:** hint ladder on unattempted questions, per-section threads, "this seems wrong", desktop side panel, friendly offline/limit errors | S4, S8 | Selecting an unattempted question gives a level-1 hint, not the answer |
| S10 | **Correctness gate:** `npm run check`, `checks/classification.py`, checks.json with hashes, build gate, footer stamp | S1 | A deliberately wrong number makes the build fail; a stale check fails too |
| S11 | **Pilot lesson: classification, full content.** Rebuild nn-basics §5 with every component: "same recipe, new problem" opener, 1D threshold → 2D shaded probability plane widget, sigmoid as the fix for scores outside 0-1, symbols, quizzes with misconceptions, NextLine for the gradient. ⏸ **Stop for Darren's review.** | S2-S6, S10 | Darren has used it on his phone and given feedback |
| S12 | **Authoring docs + second lesson:** `docs/COMPONENTS.md`, rewritten explainer skill for 2.0, then an `eigenvalues` lesson built from those docs alone | S11 | The second lesson builds and passes checks without reading component source |
| S13 | *(optional)* **PWA:** installable, works offline | S1 | Installs to the home screen; lessons open offline |

## 7. Running several agents
Each issue is sized for one session. Some can run in parallel, each on its own branch and PR, in separate worktrees:

| Wave | Slices | Agents |
|---|---|---|
| 1 | S0 → S1 | 1 (sequential foundation) |
| 2 | S2, S3, S4, S8, S10 | up to 3 at a time |
| 3 | S5, S6, S9 | up to 3 |
| 4 | S7, then S11 | 1 (S11 needs judgement and your review) |
| 5 | S12, S13 | 1-2 |

**Rules for parallel work:**
- Each slice touches its own component files.
- Shared files (lesson layout, `store.ts`, the stub lesson) get small, additive edits only.
- Merge in wave order and rebase before opening a PR.

**Tradeoff:** parallel agents finish sooner, but they cost more tokens in total (each starts cold) and risk merge conflicts. One agent working through the waves in order is the cheaper default.

## 8. Manual setup (Darren)
See issue #16. Summary:
1. **Gemini API key:** create it in Google AI Studio with a **personal** Google account.
2. **Vercel:**
   - add env vars `GEMINI_API_KEY` and `TUTOR_PASSCODE`;
   - after S0, set the framework preset to Astro (or let it auto-detect);
   - make sure preview deploys are on.
3. **Phone:** enter the passcode once in the tutor settings panel.
4. **Review gate:** try the pilot lesson (S11) on your phone and give feedback before S12.
