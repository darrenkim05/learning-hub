# Learning science for advanced STEM pages

Evidence base is thin on some points; claims from my background knowledge (not searched this session) are marked [bg].

## What the evidence says

**Retrieval, spacing, interleaving.** Dunlosky et al.'s review rated practice testing and distributed practice "high utility" and interleaving, self-explanation and elaborative interrogation "moderate" (limited evidence). Rereading, highlighting and summarising rated low [1]. Retrieval effects are typically moderate-to-large in the lab (d about 0.5-0.8 [bg]); the main caveat is that most evidence uses recall tasks, and less covers multi-step derivations. Interleaving helps discrimination between problem types (maths classes [bg]) but feels worse to learners.

**Worked examples and fading.** Novices learn more from studying worked examples than from solving unaided, but the advantage shrinks and then reverses as expertise grows (expertise reversal) [2]. Fading, which removes solution steps progressively, moves learners toward independent solving, and adaptive fading (tied to the learner's progress) beat fixed fading and plain problem solving in two experiments [2][3]. Caveat: these were mostly tutored, well-structured domains.

**Desirable difficulties and the fluency illusion.** In a randomised Harvard physics comparison, students in active sections learned more but rated their own learning lower than students in polished lectures [4]. Effortful methods feel worse while working better. This also explains why people can follow a derivation but not reproduce it: recognition feels like mastery. Retrieval, self-explanation and generation expose that gap.

**Productive failure.** Attempting problems before instruction beat instruction-first in Sinha & Kapur's meta-analysis (118 comparisons, 33 articles): adjusted g about 0.55-0.64 [5]. Unadjusted comparison with alternative sense-making designs was not significant (g = 0.22, CI -0.06 to 0.51), and adding scaffolds to the problem phase made no significant difference [5]. Best for conceptual understanding and transfer, not for procedural speed. Some individual studies show null results.

**Does interaction or animation help?** Animation versus static graphics: when content and procedure are equated, animation rarely wins. It can be too fast or complex to perceive, and it raised liking and perceived comprehensibility without raising test scores [6]. Interactivity may mitigate this [6]. PhET simulations show a large pooled effect (d = 0.83, 20 studies, 47 effect sizes) [7], but those studies are small, often quasi-experimental, and compare with traditional teaching, not with equally active non-simulation work. The gain comes from guided inquiry and prediction around the sim, not from watching it [bg].

**Self-explanation and generation.** Self-explanation (explaining why each step follows) is a moderate-utility technique [1] and works best paired with worked examples [bg: Chi, Renkl]. The generation effect (producing an answer beats reading it) supports predict-then-reveal designs.

**How experts build intuition [bg, not searched].** Estimation first (order of magnitude), limiting and special cases (does the formula behave when a parameter goes to 0 or infinity?), dimensional analysis and unit checks, and moving among multiple representations (equation, graph, physical picture, numerical example). Experts also categorise problems by deep structure (conservation law, linear system) rather than surface features.

## Principles for page design

1. **Make the learner commit before the reveal.** Put a prediction, sketch, or attempt before each key result, with feedback after it (generation, productive failure [5]).
2. **Retrieve, don't re-show.** End every section with closed-book questions on earlier material, and "re-derive without looking" prompts for derivations [1][4].
3. **Start with worked examples, then fade.** Remove one step at a time, and let a self-reported or scored "I got this" shorten the scaffolding (expertise reversal) [2][3].
4. **Require self-explanation.** At each derivation step ask "why is this step allowed?" and have the learner answer before showing the justification [1].
5. **Space and interleave.** Keep a review queue that resurfaces old topics on a widening schedule, with mixed problems whose method the learner must identify [1].
6. **Simulations need a task.** Every interactive visual gets a prediction first, a specific parameter to vary, and a question about the result. Prefer learner-controlled, slow, segmented visuals over autoplay animation [6][7].
7. **Build the expert habits explicitly.** Each result gets an order-of-magnitude check, a limiting-case check, a units check, and at least two representations of the same fact.

Also: measure learning with unaided tests, not self-rating. Learners will prefer the smoother page [4].

## Sources
1. Dunlosky et al. (2013), Improving Students' Learning With Effective Learning Techniques, Psychological Science in the Public Interest. https://stafforini.com/works/dunlosky-2013-improving-students-learning/ (summary: https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)
2. Kalyuga et al. (2003) and expertise reversal overview. https://en.wikipedia.org/wiki/Expertise_reversal_effect (secondary; check primary)
3. Salden, Aleven, Schwonke & Renkl (2010), The expertise reversal effect and worked examples in tutored problem solving, Instructional Science 38(3). https://researchportal.hw.ac.uk/en/publications/the-expertise-reversal-effect-and-worked-examples-in-tutored-prob/
4. Deslauriers, McCarty, Miller, Callaghan & Kestin (2019), PNAS 116(39). https://www.pnas.org/doi/10.1073/pnas.1821936116
5. Sinha & Kapur (2021), When problem solving followed by instruction works, Review of Educational Research. https://journals.sagepub.com/doi/10.3102/00346543211019105 (g values via search snippets; verify)
6. Tversky, Morrison & Betrancourt (2002), Animation: can it facilitate?, Int. J. Human-Computer Studies. https://hci.stanford.edu/courses/cs448b/papers/Tversky_AnimationFacilitate_IJHCS02.pdf
7. Meta-Analysis of the Effectiveness of PhET Simulations in Physics Education (2018-2023 studies). https://online-journals.org/index.php/i-joe/article/view/59007
