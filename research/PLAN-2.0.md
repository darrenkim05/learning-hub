# learning-hub 2.0: build plan

Status: **plan only, not built.** Decisions are in `DECISIONS.md`. 1.0 = the current site.

## 1. Goal and scope
Turn the site from static explainers into an **AI personal teacher**. Pages teach a new concept well; the site remembers what you're shaky on; an AI tutor answers questions about any selected text, knowing where you are and what you've struggled with.

**In 2.0:**
- Template v2: "where am I" pipeline strip, symbol glossary, writing rules, non-blocking questions, choose-the-next-line derivations, simulations with a task.
- Learner memory: 🚩 "not yet" flags, wrong-answer tracking with misconception tags, shaky-concepts list, exam-prep view.
- AI tutor: select text → ask → bottom sheet; hint ladder on unattempted questions; passcode-protected endpoint.
- Correctness: per-page SymPy check that gates the build.
- Authoring: `KIT.md`, updated explainer skill.

**Out of 2.0:** AI-generated replacement questions (paused), cross-device sync, spaced-repetition scheduling.

## 2. Architecture
Same model as 1.0, with three additions:

```
src/<page>.html ──kit/build.js──▶ explainers/<page>.html   (kit inlined, as now)
checks/<page>.py ─(run by build)─▶ "verified" stamp in footer; build fails if a check fails
api/ask.js       ── Vercel serverless function: passcode check → free-tier model → answer
localStorage "lh2" ── flags, attempts, tutor passcode, settings (one browser)
shaky.html       ── shaky concepts + exam prep view, built from localStorage + page index
```

Vercel serves `api/*.js` as functions automatically with the "Other" preset, so no framework is needed. The site stays static apart from that one function.

## 3. Data model

**Concept IDs: defined per page.** Each topic declares its own concepts; there's no site-wide list. IDs are namespaced by page, e.g. `classification/sigmoid`, so they never collide. (I read "site specific" as "each topic defines its own". Correct me if you meant one shared list.)

**Page meta block** (in each source page, read by the kit and collected by the build):
```json
{ "id": "classification", "title": "Classification", "prereqs": ["nn-basics"],
  "pipeline": ["data", "model", "prediction", "loss", "optimiser"],
  "concepts": { "sigmoid": "Squashes any score into a probability between 0 and 1" },
  "symbols": { "p": "model's probability the point is blue", "y": "true label: 1 blue, 0 red" },
  "ref": "Bishop, PRML §4.3" }
```
Sections carry `data-stage="model loss"` (which pipeline boxes they change) and `data-concepts="sigmoid boundary"`.

**localStorage `lh2`:**
```json
{ "flags":    [{ "page", "section", "concept?", "text?", "at" }],
  "attempts": [{ "page", "q", "concept", "ok", "pick", "misconception?", "shown": false, "at" }],
  "passcode": "…", "v": 2 }
```
Includes one-tap **export/import** (JSON file) so a wiped browser doesn't lose everything.

## 4. Features: how each works

| # | Feature | Design |
|---|---|---|
| 1 | Pipeline strip | Row of boxes under the header; boxes in the current section's `data-stage` light up as you scroll. Reuses the existing scroll tracking. |
| 2 | Symbol glossary | "Symbols in this section" box at the top of each section, built from meta. In prose, symbols are tappable (extends the existing `.t` term popup). **Inside equations:** try KaTeX `\htmlData` so symbols there are tappable too; if it's unreliable on phones, fall back to a symbol chip row under each equation. Spike in phase 1. |
| 3 | Writing rules | In the skill and template: at most 2-3 new ideas per section, picture before formula, every transition says "same example, new twist" or "new example". |
| 4 | Non-blocking questions | `mcq` updated: never blocks scrolling; answer hidden until you pick or tap **just show me** (logged as `shown`). Each wrong option carries a `mis` (misconception) note. Every question has a `concept`. |
| 5 | Choose the next line | New `nextline(root, {steps, at, options})`: the derivation shows up to step `at`, you pick the next line from 3-4 options (wrong ones are common errors), feedback explains why. |
| 6 | Simulations with a task | Convention, not a component: every widget gets a goal line ("find ζ so overshoot < 5%") and optional predict. |
| 7 | 🚩 Not yet flags | Flag button on each section heading, plus in the selection toolbar. Clearing is manual (✕ on the shaky page or tap the flag again). |
| 8 | Wrong-answer tracking | Every attempt is saved with its concept and misconception. |
| 9 | Shaky concepts list | Small badge in the header ("3 shaky") linking to `shaky.html`; purely visual reminder. |
| 10 | Exam prep view | `shaky.html`: concepts grouped by topic, each showing flags, wrong answers and the misconception behind them, with links back to the exact section. Filter by topic. |
| 11 | Selection toolbar | When you select text: a small floating toolbar **at the bottom of the screen**, with **Ask tutor** and **🚩 Not yet**. It sits at the bottom so it doesn't fight the phone's own copy/paste menu. |
| 12 | Tutor bottom sheet | Slides up to ~60% height; answer rendered with KaTeX; follow-up box; **"this seems wrong"** button (saved locally). On wide screens (≥900px) it becomes a right side panel. |
| 13 | Topic map (light) | `index.html` lists pages with their prerequisites, generated from the meta blocks at build time. |

## 5. AI tutor

**Request** (page → `api/ask`):
```json
{ "mode": "explain | hint", "hintLevel": 1, "page": "classification", "section": "s3",
  "selection": "…", "sectionText": "…(trimmed)", "symbols": {…},
  "shaky": ["classification/sigmoid"], "recentWrong": [{ "q", "misconception" }],
  "history": [ …last few turns… ] }
```
Header: `x-passcode`.

**Mode is chosen by the page, not by the model:**
- **explain**: the selection is explanation text, or a question you've already attempted. The tutor explains directly and fully.
- **hint**: the selection is inside a question you haven't attempted. Hint level 1 = nudge, 2 = the relevant principle, 3 = the first step. The full solution is only offered once you've attempted the question.

**System prompt rules:** use this page's notation and symbols; ground answers in the section text; keep answers short (phone-sized), maths in LaTeX; if your flags or recent misconceptions are relevant, say so ("this is the same issue as your 🚩 in §3"); say when unsure rather than guess.

**Function (`api/ask.js`):**
- Rejects a request unless `x-passcode` matches the `TUTOR_PASSCODE` env var, using a constant-time compare. Wrong passcode → 401.
- The model call sits in `api/_provider.js` behind one function, `callModel(system, messages)`. It starts with the Gemini Flash free tier (`GEMINI_API_KEY` env var); switching provider means editing that one file.
- Caps input size, so a huge selection can't be sent.

**Passcode on the page:** you enter it once in a small settings panel; it's saved in localStorage and sent with each request. That's fine for a personal site.

**Failure handling:**
- Offline, rate-limited or server error → friendly message, plus "🚩 flag it instead".
- Wrong passcode → re-prompt.

**Conversation memory:** one thread per section, kept for the browser session (sessionStorage). It doesn't persist across days.

**Setup you'll need to do once:** in Vercel project settings, add `GEMINI_API_KEY` and `TUTOR_PASSCODE`. Check the Gemini free-tier terms; free-tier prompts may be used to improve Google's products.

## 6. Correctness check
- `checks/<page>.py` (Python + SymPy): re-derives each displayed result, checks each quiz answer and each "choose the next line" correct option, and tests limiting cases and numbers shown on the page.
- `build.js` runs the check if one exists. If the check passes, the footer gets "✓ checked <date> · ref: <textbook>". If it fails, the build fails.
- Pages without a check build as now but show "unchecked".

## 7. What happens to 1.0 pages
**Left as they are.** Kit changes stay backward compatible: new features only switch on when a page has a meta block. The phone test runs on the 1.0 pages after every kit change, to make sure they still work.

## 8. Build phases

| Phase | Builds | Done when |
|---|---|---|
| **1. Foundations** | Meta block + `lh2` store with export/import; template v2 skeleton; KaTeX tappable-symbol spike | Template builds; store survives reload; 1.0 pages pass the phone test |
| **2. Page structure** | Pipeline strip, symbol glossary, non-blocking `mcq` with "just show me", `nextline`, flags, selection toolbar | **Pilot page:** nn-basics §5 rebuilt as a standalone v2 page, `classification` (1D threshold → 2D shaded plane, "same recipe, new problem" opener, sigmoid introduced as the fix for scores outside 0-1) |
| **3. Learner memory** | Shaky badge, `shaky.html` exam-prep view, topic list on index | Flags and wrong answers from the pilot show up grouped, with working links back |
| **4. AI tutor** | `api/ask.js`, provider wrapper, bottom sheet, passcode panel, explain/hint modes | Works on a Vercel preview deploy; wrong passcode gets 401; phone test passes with a mocked endpoint |
| **5. Correctness** | `checks/classification.py`, build gate, footer stamp | A deliberately wrong number fails the build |
| **6. Authoring** | `KIT.md` (~150 lines), skill updated with writing rules and the v2 checklist | A second v2 page (e.g. eigenvalues) is built from `KIT.md` + skill alone |

Each phase gets its own commit set and phone test; I'll stop for your review after phase 2 (the pilot page), since that's where the teaching design is tested.

## 9. Testing
Extend `kit/test-phone.js` at 380px to check:
- the pipeline strip lights up
- symbol taps open the popup
- "just show me" reveals the answer
- `nextline` gives feedback
- a flag survives reload
- the selection toolbar appears
- the bottom sheet opens with a mocked tutor reply

## 10. Risks and open points
- **Tappable symbols inside KaTeX** may be fiddly on phones. The phase 1 spike decides it; the chip-row fallback is ready.
- **Selecting text on phones** varies between iOS and Android. A bottom toolbar avoids the native menu, but needs testing on your actual phone.
- **Free-tier limits and terms** may change; the provider wrapper keeps switching cheap.
- **How to judge 2.0 vs 1.0:** suggestion: learn the classification topic on the v2 pilot, then do a closed-book quiz a week later, and compare with how §5 felt in 1.0.
