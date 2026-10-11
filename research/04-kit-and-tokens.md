# Kit design and token cost

## What exists
Static site: `src/` pages are built by `node kit/build.js`, which inlines `kit/kit.css` and `kit/kit.js` into `explainers/`. KaTeX 0.16.11 loads from jsDelivr with a plain-text fallback. `kit.js` already has maths helpers (`tex`, `renderMath`), question types (`mcq`, `numq`, `orderq`), canvas helpers (`setupCanvas`, `evPos`, `tween`, `divCol`) and a seeded RNG/gauss. `kit/template.html` documents the box classes in a header comment. The explainer SKILL covers pedagogy, honesty rules, gotchas and a 380px test. Missing: simulation, plotting and complex-plane components, a component reference doc, and any prerequisite or review metadata.

## 1. Stack recommendation
Keep plain HTML plus KaTeX, with hand-rolled canvas/SVG and a tiny numeric core.
- **KaTeX over MathJax.** KaTeX is synchronous and fast, roughly 250 KB gzipped with fonts against about 1.6 MB for MathJax's default bundle [1]. Its LaTeX subset is enough here. Only fall back to MathJax if a page needs unsupported macros.
- **Plotting.** Most of these topics need custom pictures (phasors, vector fields, matrices), which are easier on canvas than in a chart library. For ordinary line plots, uPlot is about 22 KB gzipped [2]. Chart.js is about 45-58 KiB in one controlled build, and older reports are much larger [2]. I found no size data for function-plot or JSXGraph. Mafs needs React and a build, so it is out. The existing `setupCanvas` plus about 80 lines of `plot(cv, series, opts)` covers line plots with no new dependency. Add uPlot only if a page needs zoomable or very large series.
- **Numerics.** Skip math.js, which is large. Hand-roll in `kit.js`: RK4 (~15 lines), small dense matrix helpers (mul, solve, 2x2 eig), and a complex number type. That is under 150 lines and works offline.

## 2. Components (6-8)
1. `paramPlot(root,{f:(x,p)=>y, params:{a:[min,max,init]}, xr, yr})`: slider-driven curve.
2. `ode(root,{rhs:(t,x,u)=>dx, x0, dt, T, input:'step'|fn, show:[...]})`: step-response and time-domain simulator using RK4, with optional sliders for ζ, ωn and so on.
3. `phasor(root,{z:[re,im] or fn(p), params})`: complex plane, plus Bode or pole-zero view via `mode`.
4. `field2d(root,{f:(x,y)=>[dx,dy], trajectories:[[x0,y0]], xr, yr})`: vector field and phase portrait, with tap-to-seed trajectories.
5. `linmap(root,{A:[[..],[..]], editable:true})`: unit-grid transform with eigenvectors and det.
6. `derive(root,{steps:[{tex, why}]})`: step-through derivation, revealing one line at a time.
7. `predict(root,{q, opts, answer, reveal})`: predict-then-reveal. This already exists as `mcq` with `mode:'predict'`.
8. `hints(root,{q, hints:[..], answer, tol, solution})`: hint ladder. Extend `numq`. Retrieval cards are covered by section 4.

All components take `(root, opts)`, return `{update, destroy}`, and use `HEX`/`divCol` for colour.

## 3. Reference doc
- **Format.** One `kit/KIT.md`, around 150 lines or about 1.5k tokens, no prose intro. Per component: a signature line, an options table in one line per option, one 3-5 line example, and 1-2 gotchas. End with a minimal complete page skeleton.
- **Placement.** The root CLAUDE.md or SKILL should only point to KIT.md. Advice on CLAUDE.md says to keep it short, since models follow only so many instructions, and to move task-specific material into separate, descriptively named files that are read on demand [3]. That is progressive disclosure.
- **Include.** Exact function names and option names, units and coordinate conventions, the colour semantics, and failure modes (for example "canvas width at most 320", "unique function names per section").
- **Exclude.** Pedagogy, which stays in SKILL.md. Also style rules, internals, and long code that goes stale. Link to `kit.js` line ranges instead. Add `kit/KIT.md` to the SKILL "read first" list.
- **llms.txt.** I found no source for this in the search. The convention (from memory, unverified) is a short Markdown index with a link and a one-line description per doc. A `kit/index.md` listing each component with one line would be the same idea if the kit grows.

## 4. Linking and review
- **Per-page JSON block.** Put `<script type="application/json" id="meta">{"id","title","prereqs":["id"],"tags":[],"cards":[{"q","a","tex?"}]}</script>` in every source page. Each page gets 5-8 cards written as part of the page.
- **Topic map.** `kit/build.js` collects every `#meta` into `graph.json`. `index.html` renders a prerequisite graph or a sorted list and shows "prereqs" links at the top of each page.
- **Review page.** `review.html` loads `graph.json`, keeps card state in localStorage, and schedules with FSRS. The ts-fsrs package exposes `repeat()` and `next()`, and an `afterHandler` converts Dates to timestamps for JSON storage [4]. For no dependencies, a ~30-line SM-2 is enough [5]. FSRS is more accurate but needs a tuned optimizer [6]. Start with SM-2, keep the card state schema compatible, and switch later.
- **Data safety.** Add an export/import JSON button, because localStorage is per-browser.

## Sources
1. KKaTeX: math in the browser, fast - https://cuberoot.me/code/language/katex
2. TanStack charts comparison (uPlot ~22 KB gzip, Chart.js ~45-58 KiB), via search - https://tanstack.com/charts/latest/docs/comparison
3. Writing a good CLAUDE.md (HumanLayer) - https://www.humanlayer.dev/blog/writing-a-good-claude-md
4. ts-fsrs README - https://cdn.jsdelivr.net/npm/ts-fsrs@5.4.1/README.md
5. SM-2 summary (mindomax) - https://www.mindomax.com/fsrs-vs-sm2-spaced-repetition-algorithm
6. Differences between SM-2 and FSRS - https://l-m-sherlock.notion.site/What-are-the-main-differences-between-SM-2-and-FSRS-135c250163a180ca9029ea460136254c
