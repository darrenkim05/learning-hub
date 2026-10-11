# Synthesis: a learning hub for advanced STEM

Sources: `01-learning-science.md`, `02-existing-tools.md`, `03-interaction-and-correctness.md`, `04-kit-and-tokens.md`. Claims those files mark [bg] are background knowledge that was not re-verified. The Sinha & Kapur study counts differ between 01 and 03; check the paper before quoting a number.

## 1. Core learning principles

The central finding: **learning that feels smooth is usually learning that doesn't stick.** In Deslauriers et al. (2019), students learned more in active sections but rated their own learning lower. This explains why you can follow a derivation but not reproduce it, since recognising something feels like knowing it. So every page should make you produce, not just view.

1. **Commit before reveal.** Before every key result or visual, make a prediction, attempt or sketch. The reveal overlays your guess on the truth, then asks "why was I off?" (Generation effect, productive failure, Mazur/Sokoloff ILDs. Watching a demo alone does little.)
2. **Every interactive needs a task.** Give each slider a goal ("find ζ so overshoot is below 5%"), a readout, and at most 1-3 parameters. Animation rarely beats static images when content is equal. PhET's large effect comes from guided inquiry around the sim.
3. **Worked example, then fade.** Show the full derivation with a reason for each step, then blank steps one at a time from the end. Let competence shorten the scaffolding (expertise reversal).
4. **Self-explain the steps.** At each important step, ask "why is this allowed?" and get an answer before showing the justification.
5. **Check at the step, not just the answer.** Step-based tutoring reaches d ≈ 0.76, close to human tutors. Answer-only checking is clearly weaker.
6. **Retrieve, space, interleave.** Each page ends with closed-book questions, including "re-derive without looking". A review queue brings old topics back as mixed problems where you must first pick the method.
7. **Train expert habits explicitly.** Each major result gets an estimate, a limiting-case check, a units check, and at least two representations (equation ↔ graph ↔ physical picture ↔ number).

## 2. Gaps this site should fill

None of the tools reviewed covers these together:

- **Explore → predict → derive in one place.** 3B1B gives intuition but is passive. Desmos is manipulable but has no curriculum. Paul's Notes derives but is static.
- **Masters-level coverage on demand.** Brilliant and Khan stop at roughly first-year university. Nothing covers control, state space, optimisation or ML maths interactively.
- **Practice on derivations, checked by computation.** AI tutors make algebra slips you can't catch yourself. Wolfram is correct but skips the skill.
- **Spaced review of reasoning, not just facts.** Anki schedules well but suits atomic facts, and writing cards is the bottleneck. Here, cards come with each page.
- **Transfer across topics.** The same idea recurs across courses (eigenvalues in vibration, control and ML), but no tool connects those uses.
- **Durable, owned artefacts.** The AI writes and checks pages once, ahead of time. It doesn't answer live as an oracle that can be wrong.

## 3. Proposed kit

**Stack.** Keep what exists: plain HTML, KaTeX from jsDelivr with a text fallback, and `kit/build.js` inlining `kit.css` and `kit.js`. Add **no plotting or maths library**. Hand-roll a small numeric core in `kit.js` (RK4, complex numbers, 2×2/3×3 matrix helpers including eigenvalues, under 150 lines) and an ~80-line canvas `plot()`. Add uPlot (~22 KB) only if a page needs zoomable or very large series.

**Components.** All take `(root, opts)` and return `{update, destroy}`.

| Component | Purpose | Status |
|---|---|---|
| `predict` | lock-in prediction, then reveal overlaid on truth, then "why was I off?" | partly exists (`mcq` predict mode) |
| `derive` | step-through derivation with a reason per step, faded mode, "why is this allowed?" prompts | new |
| `problem` | hint ladder (nudge → principle → first step → solution), step checks, parametrised re-roll | extend `numq` |
| `paramPlot` | slider-driven curves, each with a task and a readout | new |
| `ode` | RK4 time-domain simulator (step response, transients) | new |
| `linmap` | 2×2 matrix acting on a grid, with eigenvectors and det | new |
| `field2d` | vector field / phase portrait, tap to seed trajectories | new |
| `phasor` | complex plane, poles/zeros, Bode mode | new, build once a page needs it |

**Page template** (sections in order):
1. Meta block: `<script type="application/json" id="meta">` holding id, title, prereqs, tags, reference textbook and chapter, and 5-8 review cards.
2. Prereq links and a two-minute warm-up retrieving earlier material.
3. Problem-first hook: one problem you can attempt but probably not finish, used once per page.
4. Core sections. Each one follows predict → explore (a widget with a task) → explain → derivation (full, then faded) → self-check.
5. Expert-habits box: estimate, limiting cases, units, a second representation.
6. Problem set of 3-5, going from near-identical to transfer, plus 1-2 interleaved problems from earlier pages.
7. "Re-derive without looking" closer.
8. Footer: textbook reference, date and result of the check script, and an "I think this is wrong" note link.

**Docs for cheap generation.** Write one `kit/KIT.md` of about 150 lines (~1.5k tokens). For each component: signature, one line per option, a 3-5 line example, and gotchas. End with a minimal complete page skeleton. The explainer SKILL keeps the teaching rules and points to KIT.md. Don't add a CLAUDE.md that repeats either.

**Linking and review.** `build.js` gathers every `#meta` into `graph.json`. `index.html` shows the prerequisite map. `review.html` runs SM-2 over all page cards in localStorage, keeping the state schema FSRS-compatible, and has export/import buttons.

## 4. How correctness is checked

LLMs often reach right answers through flawed steps and are poor at spotting errors, so treat every generated equation as unverified until checked. For each page:

1. **Reference.** Name one textbook and chapter in the meta block. Compare key results against it.
2. **`check.py` (SymPy).** Re-derive each displayed result (`simplify(lhs - rhs) == 0`, plus a numeric spot-check at random points). Differentiate claimed integrals and substitute ODE solutions back in.
3. **Sims against closed forms.** Compare each simulator against the analytic solution where one exists, within a tolerance.
4. **Units and limiting cases.** Assert dimensional consistency, and assert behaviour at ζ→0, ζ=1, t→∞ and zero input.
5. **Answer keys as code.** Generate practice answers from the same parametrised function that the page grades with, never from prose.
6. **Fresh-eyes review.** A separate model reads only the page and hunts for errors. It isn't told the page is correct. Each flag is resolved by computation or reference, not by argument.
7. **Ship gate.** The page publishes only when `check.py` passes. Deliberate "spot the mistake" blocks are labelled and excluded.

What remains is conceptual or modelling errors that algebra checks can't catch. The reference comparison (1), limiting cases (4) and review (6) cover those partly.

## 5. MVP plan

Build three real pages on the existing kit, adding helpers inline as needed. Then promote into the kit only what at least two pages used.

1. **Second-order systems: damping, overshoot and poles** (control). Uses predict, `ode`, `paramPlot`, a faded derivation of the step response, and limiting cases. It is very checkable, with closed forms for every regime.
2. **Eigenvalues and eigenvectors as what a matrix does** (engineering maths). Uses `linmap`, predict ("where does this vector land?") and `derive` for the characteristic equation. It is a prerequisite for the other two.
3. **Gradient descent on a quadratic: why the learning rate blows up** (ML). Uses `paramPlot`/`field2d` and an iteration simulator. The stability limit η < 2/λ_max ties back to eigenvalues, giving the first cross-topic transfer problems and interleaved review.

These three share the eigenvalue thread, so the prereq graph, interleaving and review page get tested on real links. They use 6 of the 8 proposed components.

**Order of work.** Page 2 → page 1 → page 3, each with its `check.py`. Then extract the kit, write KIT.md, and update the SKILL. Then add `graph.json`, `index.html` and `review.html`. Compare the token cost of page 3 with pages 1-2 to see whether the kit actually saves anything.

## 6. Open questions for you

1. **Topic priority.** Do these three match what you're studying now? If a current course is pressing, start there instead.
2. **Python in the repo.** Is a SymPy `check.py` per page (run locally or in GitHub Actions) acceptable, or should checks stay in JS?
3. **Typed derivations.** Should derivation steps accept free-form typed algebra, checked numerically in the browser (more effort, closer to real skill), or multiple choice / ordering only at first?
4. **Review home.** A standalone `review.html` in localStorage, or export cards to your second-brain vault or Anki?
5. **Existing pages.** Retrofit the two neural-network pages to the new template (problem-first, faded derivations, meta block), or leave them as they are?
6. **Phone-first constraint.** The current kit targets 380px. Some widgets (phase portraits, Bode plots) are cramped there. Should those also get a desktop layout?
7. **Success measure.** How will you know a page worked? I'd suggest a closed-book re-derivation a week later, logged on the review page.
