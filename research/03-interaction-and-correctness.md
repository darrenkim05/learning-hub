# Interaction patterns, practice, and correctness

Evidence tags: [S#] = from a source below; [bg] = background knowledge, not re-verified this session.

## 1. Interaction patterns: teach vs decorate

Test for any widget: does the learner have to commit to something (a prediction, a step, a diagnosis) before the page responds? If not, it is probably decoration.

**Predict-then-reveal (ILDs, Crouch/Mazur).** Sokoloff and Thornton's format is: predict, discuss, observe, then reconcile [S1]. Crouch et al. report that watching a demo improves prediction of the outcome somewhat, but not concept understanding [S2]. Passive watching teaches little. The commitment and the explanation step do the work.
- Helps: where a strong misconception exists (e.g. "heavier falls faster", "force implies velocity", a step response with a wrong sign).
- Decoration: a "reveal" that follows a trivial question, or a prediction that is never compared with the result.
- Rule: the learner locks in a prediction (number, sketch, or multiple choice with a plausible wrong option) before the plot appears. The reveal overlays their guess on the truth. Then require a one-sentence "why was I off?" before moving on.

**Manipulable parameters / explorable explanations** (Victor, Nicky Case, Distill [S5]). Research Debt argues for explanation as real labour, not polish [S5].
- Helps: the sliders expose structure (poles moving, damping ratio vs overshoot, learning rate vs divergence).
- Decoration: free play with no question. Learners fiddle and conclude nothing [bg].
- Rule: each slider comes with a task ("find the damping where overshoot is below 5%") and a visible invariant or readout. Limit it to 1-3 parameters. Say what to notice. Pair it with the predict step above.

**Guided/faded derivations** (worked-example fading, Renkl/Atkinson [bg]). Show the full derivation first, then blank out one step at a time.
- Helps: novices. For experts, full worked steps can hurt (expertise reversal [bg]).
- Decoration: click-to-reveal of every line, which is just a slower page.
- Rule: justify each step in a short margin note ("product rule"). Fade the last steps first, then earlier ones. The learner types or selects the next step, with CAS-checked feedback.

**Self-checks.** Retrieval beats rereading [bg]. Place 1-3 low-stakes questions at the end of each section, asked before the answer is shown, with the answer and a misconception explanation afterwards. Make them test transfer ("what changes if the mass doubles?"), not recall of a sentence.

**Problem-first / productive failure.** The Sinha and Kapur meta-analysis (53 studies, 166 comparisons) favours problem-solving before instruction, with stronger effects for secondary and undergraduate learners [S4]. The authors' own "up to 3x" framing comes from a press release, so discount it.
- Helps: concepts that build on prior knowledge, such as variance, Lyapunov-style energy arguments, or why regularisation matters.
- Decoration/harm: a problem with no foothold, or one the learner cannot attempt without hints and then gives up.
- Rule: use it sparingly, perhaps once per page. Give the problem, a scratch area, and a "stuck? see the idea" option. Then instruct, and explicitly contrast the learner's attempt with the canonical method. Always include the consolidation step.

**Spot the mistake.** Good for the common errors (sign, dropped factor, unit mismatch, invalid assumption).
- Rule: plant one realistic error, drawn from known mistakes (the Laplace sign, a missing Jacobian, a transposed matrix), not a random typo. Ask for the line number and the reason. Never show a wrong derivation without a clear "this contains an error" label. For a single learner, tag wrong-derivation blocks visibly so they are not memorised as true.

## 2. Practice problems and hints

- Step-based tutoring (feedback on each step) gives d ≈ 0.76 vs no tutoring, close to human tutors at 0.79. Answer-based tutoring is clearly weaker [S3]. So check intermediate steps, not just final answers, wherever possible.
- Hint ladder: (1) a conceptual nudge, (2) the relevant principle or equation, (3) a worked first step, (4) the full solution. Each rung costs the learner an explicit click. Log hint use so the page can say "you used 3 hints, retry a variant" [bg].
- Feedback: immediate for new skills and for mistakes caused by procedure; delay or batch it for consolidation and review sessions [bg]. A good default is immediate per-step feedback during learning and a delayed mixed quiz.
- Quantity: 3-5 problems per page, progressing from near-isomorphic (consolidation) to varied (transfer). Add 1-2 "later" problems, tied to earlier pages, for spaced and interleaved review [bg].
- Placement: a prediction question before an explanation; a faded example immediately after the worked example; the problem set at the end; a review question on the next page.
- Generate problem variants from parametrised templates so the answers are computable, and re-roll after a correct answer.

## 3. Correctness verification

Risk: LLMs often reach a right answer through flawed reasoning, and often miss errors in given reasoning [S6]. Even the best models trail humans on error detection [S7]. Treat every generated equation as unverified.

**Lightweight pipeline (one person, per page):**
1. **Source.** Name one reference textbook and chapter in the page footer. Compare the key results against it, since this is a check against an independent source.
2. **CAS script.** For each derivation, write a `check.py` that re-derives it with SymPy: substitute and `simplify(lhs-rhs)==0`, differentiate the claimed antiderivative, and check solutions of ODEs by plugging them back in. Run a numeric spot-check at random points, because `simplify` can time out [S8].
3. **Numerics vs analytic.** For every simulation (ODE solver, gradient descent), compare against the closed form (RK4 vs `exp(-ζωt)...`) and assert error under a tolerance.
4. **Units and dimensions.** Use `pint` or SymPy units. Every formula and every slider has a unit. Assert that both sides agree.
5. **Limit cases.** Test each formula at ζ→0, ζ=1, large t, zero input, and known special cases, and assert the expected behaviour.
6. **Practice answers.** Store the answer key as code (SymPy or numpy), not prose. The page's grader and the check script share this one implementation. Accept equivalent forms and tolerances.
7. **Second-model review.** Give a fresh model only the page text and ask for a hunt for errors, with the CAS output attached. Do not tell it that the page is "correct". Resolve each flagged item with a reference or computation, not by argument.
8. **Ship gate.** `python check.py` must pass, with the report (checks passed, textbook ref, date) in the page footer. Wrong-on-purpose "spot the mistake" blocks are marked and excluded from checks. The learner also has a visible "report an error" link.

Residual risk: conceptual or physical-modelling mistakes pass the algebra checks. Steps 1, 5 and 7 address these, and they cannot be fully automated.

## Sources
1. Sokoloff and Thornton, Interactive Lecture Demonstrations (AAPT slides), https://aapt.org/Conferences/newfaculty/upload/Sokoloff-Thornton_Interactive_Lecture_Demos.pdf
2. Crouch, Fagen, Callan, Mazur, demonstrations and learning (BCCE 2006), https://materials.physics.swarthmore.edu/wp-content/uploads/2012/07/BCCEAug06final.pdf
3. VanLehn (2011), The relative effectiveness of human tutoring, ITS and other tutoring systems, Educational Psychologist (slides), https://quality.mit.edu/files/2012/01/Quality-Symposium-Kurt-VanLehn.pdf
4. Sinha and Kapur (2021), When problem solving followed by instruction works, Review of Educational Research, https://doi.org/10.3102/00346543211019105 (press summary: https://www.weforum.org/stories/2021/09/students-who-productively-fail-learn-more/)
5. Olah and Carter (2017), Research Debt, Distill, https://distill.pub/2017/research-debt/
6. Singh et al. (2025), Exposing the Achilles' Heel (MWP-MISTAKE), ACL 2025, https://preview.aclanthology.org/setup/2025.acl-long.1313
7. Yan et al. (2025), ErrorRadar, ICLR 2025, https://iclr.cc/virtual/2025/32708
8. HELIOS (SymPy verification loop; arXiv), https://arxiv.org/pdf/2607.24051
