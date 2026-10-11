---
name: explainer
description: Build an interactive, phone-first learning page (Brilliant-style sections, 3Blue1Brown-style visuals, worked maths) for Darren from kit/template.html, test it at 380px, and add it to the learning-hub site. Use when Darren asks for an explainer, an interactive page to learn a topic, or says "use my explainer skill".
---

# Explainer skill

Output: one self-contained HTML file at `explainers/<slug>-explorer.html`, built from `src/<slug>-explorer.html`, listed in `index.html`, pushed to `main` (the site deploys from `main`).

## The learner
Darren: aerospace engineering undergrad (linear algebra, differential equations), ML beginner, reads on a phone (~380px). Feedback so far: showing results isn't enough; he needs **the why and the maths behind every result**, for an absolute beginner with no scaffolding.
- Each section is one idea, in this order: **why it matters → plain words → a picture or analogy (`.analogy`) → the formula (KaTeX) → a worked example with real numbers (`.steps-math`) → something live to play with → his turn (`numq`/`orderq`) → one-line `.takeaway` → a check question (`mcq`).**
- Derive results instead of stating them. Put long algebra in `details.show` so the main line stays readable.
- Use his background: `.ode` boxes linking to ODEs, Euler's method, linear algebra (normal vectors, matrix shapes).
- Define every term the moment it appears (`.def`, or `<span class="t" data-d="…">` for re-used terms).
- Colour carries meaning, everywhere (canvas, text and KaTeX macros): blue `\bl{}` inputs / positive, red `\rd{}` negative, yellow `\yl{}` look here, purple `\pw{}` learned weights, orange `\og{}` loss & gradients, green `\gr{}` true / correct.

## Honesty rules (non-negotiable)
- Anything not computed live or taken from Darren's real data gets `<span class="illus">illustrative</span>` (or "simulated").
- Never invent his results (accuracy, losses). Show "—" with a note instead.
- Every number in the text must be checked: compute worked examples with a script before writing them, and verify every claim like "converges", "diverges" or "reaches X%" by running the page's own code (see Verify). Text that depends on a live result (e.g. trained weights) should be generated from that result, not hard-coded.

## Build steps
1. **Tell him the plan first**: a short outline in chat (one line per section). Don't block on approval unless something can't be defaulted.
2. Copy `kit/template.html` to `src/<slug>-explorer.html`. Shared code lives in `kit/kit.css` and `kit/kit.js`; fix kit bugs there, not in a page.
3. **Ship in slices** of 2–4 sections: build, test, look at the screenshots, send him the file, continue. Never go quiet for a long stretch.
4. `node kit/build.js` inlines the kit and writes `explainers/`. Never hand-edit `explainers/` (kit/build.js overwrites it). The old `explainers/phase0-cnn-explorer.html` predates the kit and is self-contained; edit it directly.

## Gotchas learned the hard way
- KaTeX macros: a literal `#` must be written `##` (e.g. `\textcolor{##b48ef0}{#1}`).
- Formulas: keep each display line under ~30 characters for a phone. Use `aligned` with one step per line, never two side-by-side columns.
- `.lbl` is uppercase: never put a formula or a variable name in it unless it's in KaTeX or `.nocase`.
- Plots: **clip, don't clamp**. Clamping made ReLU look flat at the top.
- Text that changes during an animation needs a fixed `min-height`, or the page jumps and taps land on the wrong thing.
- Unique function names per section (`s5_draw`, `s8_step`…); a duplicate `function` silently overrides the first.
- Canvases: logical width ≤ 320. Class `draw` (touch-action none) only on canvases you drag or tap.

## Verify (before every delivery)
1. `node kit/test-phone.js explainers/<slug>-explorer.html --katex <katex>/package --shots /tmp/shots`. It must PASS: no console errors, no overflow, no blank canvases, no KaTeX errors, every check answerable. Get KaTeX for testing with `npm pack katex@0.16.11 && tar xzf katex-0.16.11.tgz` in a scratch folder.
2. Also run it **without** `--katex` (offline fallback) and make sure it still passes.
3. **Read** the `view-NN.png` screenshots (phone-sized, readable): clipped formulas, overlaps, misleading pictures. Screenshot interactive states (after Train etc.) separately.
4. Page-specific checks: gradient-check any hand-written backprop against finite differences, train every dataset you claim learns, and confirm every number in the text.
5. Add the page to `index.html`, commit to `main` with a clear message, push.

## Existing pages
- `nn-basics-explorer.html` (source `src/`): 12 sections. Model → loss → gradient descent (with the Euler-stability view) → logistic regression → neuron → feature engineering → ReLU hinges (1D, live, with per-neuron blame) → creases (2D, live, trained matrices) → backprop → playground (real MLP, gradient-checked) → CNN bridge. Prequel to the CNN page.
- `phase0-cnn-explorer.html` (self-contained, pre-kit): the FashionMNIST CNN from Phase 0, with a JSON weight loader and Colab export snippet.
