---
name: explainer
description: Build an interactive, phone-first learning page (Brilliant-style sections, 3Blue1Brown-style visuals) for Darren from kit/template.html, test it at 380px, and add it to the learning-hub site. Use when Darren asks for an explainer, an interactive page to learn a topic, or says "use my explainer skill".
---

# Explainer skill

Output: one self-contained HTML file at `explainers/<slug>-explorer.html`, listed in `index.html`, pushed to `main` (the site auto-deploys from `main`).

## The learner
Darren: aerospace engineering undergrad (linear algebra, differential equations), ML beginner, reads on a phone (~380px).
- Plain language and pictures first, then light maths. Define every term the moment it appears (`.def` box, or `<span class="t" data-d="…">` for re-used terms).
- One idea per section. Each section ends with a check question whose wrong answers are real misconceptions, each with its own explanation.
- Use "predict, then reveal" (`mcq(..., {mode:'predict'})`) before showing any answer the learner could guess.

## Honesty rules (non-negotiable)
- Anything not computed live or taken from Darren's real data gets `<span class="illus">illustrative</span>` (or "simulated").
- Never invent his results (accuracy, losses). Show "—" with a note instead.
- If something is meant to be real (training, a forward pass), it must actually run in the page, and be checked (see Verify).

## Colour meanings (keep consistent across pages)
blue = positive, red = negative, yellow = look here now, purple = learned weights, orange = loss & gradients, green = correct / true label. Use `divCol(v, maxAbs)` for signed values.

## Build steps
1. **Agree the outline in chat first**: a section list with one line each, plus any real data needed (weights, logs). Ask only if something can't be defaulted.
2. **Copy `kit/template.html`** to `explainers/<slug>-explorer.html`. Keep the utilities, `mcq()`, the pinned map/progress strip and the CSS. Edit `STEPS`, the sections and `CHECKS`.
3. **Ship in slices.** Write sections 1–3, run the test, send the file, then continue. Don't build everything silently.
4. Canvases: `setupCanvas(cv, w, h)` with a logical width ≤ 320, so they fit a 380px phone with page and card padding. Set touch-action none (class `draw`) only on canvases you drag on.
5. Put each section's code in an `initX()` called from `boot()`. Set `window.__ready = true` at the end of `boot()`.
6. Use unique function names across sections (a duplicate `function` declaration silently overrides the first). Prefix by section if in doubt.
7. Link explainers to each other with relative sibling links (`href="phase0-cnn-explorer.html"`).

## Verify (before every delivery)
1. `node kit/test-phone.js explainers/<slug>-explorer.html --shots /tmp/shots`. It must PASS (no console errors, no overflow, every check answerable).
2. Look at the section screenshots for clipped labels, empty canvases, and unreadable text.
3. Write a page-specific check for anything claimed to be real: compare against numpy, or confirm training reaches a target. Report the numbers.
4. Add the page to `index.html` and commit to `main` with a clear message.

## Existing pages
- `nn-basics-explorer.html`: ML → neurons → layers → backprop → live playground (real MLP + backprop in JS, gradient-checked) → bridge to CNNs. Prequel to the CNN page.
- `phase0-cnn-explorer.html`: the FashionMNIST CNN from Phase 0, with a JSON weight loader and Colab export snippet.
