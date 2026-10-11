# Existing Learning Tools: What Works, What Fails at Masters Level

## 3Blue1Brown / Manim
- Works: geometric, animated visual metaphors (linear maps as moving grids, etc.) build intuition before formalism; Manim makes each frame a deliberate argument.
- Fails: passive. Watching invites the illusion of explanatory depth (Rozenblit and Keil: confidence drops once you must write a real explanation) [3]. No problems, no feedback, no derivation practice, no memory model. Topic coverage is selective, not syllabus-shaped. Pace is fixed; you cannot poke the parameters.

## Brilliant
- Works: tiny interactive steps, immediate feedback, learn-by-doing before the rule is stated; manipulable widgets; low friction daily streaks.
- Fails: reviewers disagree on ceiling, but several say it stops at introductory university level, not graduate topics [2]. Hand-authored, so fixed content; no derivation or proof writing (mostly multiple choice or slider answers); no credentials; free tier limits practice. Generic, not adapted to your gaps.

## Khan Academy
- Works: mastery learning (levelled exercises, hints, retry until mastered), huge structured syllabus, free.
- Fails: ends around first-year calculus/linear algebra. Video-plus-quiz pattern rewards procedure matching over understanding. Little on engineering applications, control, or ML maths.

## Desmos
- Works: instant-feedback direct manipulation. Sliders turn a parameter into something you feel; Classroom Activities add predict-then-reveal.
- Fails: a graphing tool, not a curriculum. Weak on symbolic work, multivariable/matrix/ODE systems, and no notion of checking your reasoning or sequencing a topic.

## Wolfram Alpha / Demonstrations
- Works: Alpha is a trustworthy symbolic and numeric oracle (integrals, ODEs, eigenvalues, with steps in Pro); Demonstrations offers thousands of explorable models on advanced topics.
- Fails: Alpha invites answer-getting that skips the derivation skill; step-by-step is paywalled and not pedagogical. Demonstrations vary wildly in quality, are uncurated, have no narrative, no practice, and are not tied to what you already know.

## Paul's Online Notes
- Works: clear worked examples with every algebra step shown; answers hidden until you try; dependable for Calc I-III and Diff Eq.
- Fails: static text, stops at ODE/Laplace/series level; no interactivity or visuals beyond plots, no adaptive practice, nothing on masters topics (control, optimisation, probabilistic ML).

## Anki
- Works: FSRS models retrievability, stability and difficulty per card, so it schedules reviews at the point of near-forgetting; active recall plus spacing is the best-evidenced retention mechanism [4].
- Fails: models discrete facts, not multi-step reasoning. Users debate how to fit problem-solving cards, and a card you can rebuild once may not mean you understand [4]. Card authoring is the bottleneck and bad cards teach rote recall. It has no explanations, no concept graph, and no sense of prerequisites.

## AI tutors (Khanmigo, ChatGPT Study Mode, Claude Learning Mode)
- Work: Socratic questioning and hints instead of answers; unlimited patience; can adapt to any question [5].
- Fail: arithmetic and symbolic slips, and hallucinations; Common Sense Media found Khanmigo's maths unreliable and that persistent prompting extracts answers [1]. You cannot catch errors in a field you do not yet know [5]. Strict Socratic mode can frustrate. Memory across sessions is weak, so there is no durable model of what you know. Conversation is linear text, with no persistent artefact, visuals, or scheduled review. Evidence for university-level performance is thin and mostly anecdotal.

## Gaps none of them fill
1. Explore, predict, then derive in one page: a manipulable model plus a prompt to commit to a prediction, then reveal, then write the derivation step by step.
2. Derivation and proof practice with step-level checking, done by a CAS or numeric check (sympy, numerical substitution) rather than an LLM's trust-me answer, so correctness is verifiable.
3. Masters-level coverage on demand: control (root locus, state space), PDEs, optimisation, ML maths, with application context, in the order you need them.
4. A memory model of concepts and skills, not facts: per-concept mastery, prerequisite graph, and spaced re-testing of derivations and "why" questions, with cards generated automatically.
5. Error-driven personalisation: log your mistakes, then generate targeted variants and misconception tests.
6. Forced self-explanation: attack the illusion of understanding with "explain it back", "what breaks if X changes", and confidence ratings against results (calibration).
7. Persistent, owned artefacts: pages and progress that accumulate in one site, not ephemeral chats, with the AI as author-time generator, not a live unreliable oracle.
8. Transfer practice: mixed, interleaved problems that cross topics (e.g. eigenvalues in control, in ML, in vibration).

## Sources
1. Common Sense Media, Khanmigo AI rating: https://www.commonsensemedia.org/ai-ratings/khanmigo
2. Brilliant review (skillscouter): https://skillscouter.com/brilliant-review-math-science-coding/
3. Illusion of explanatory depth (learning wiki): https://learning.subwiki.org/wiki/Illusion_of_explanatory_depth
4. Anki forum, tuning FSRS for math cards: https://forums.ankiweb.net/t/questions-about-tuning-fsrs-for-math-logical-reasoning-problem-cards/70949
5. Tom's Guide, Claude learning modes vs ChatGPT Study Mode: https://www.tomsguide.com/ai/claudes-new-learning-modes-take-on-chatgpts-study-mode-heres-what-they-do
6. Anki FAQ, spaced repetition algorithm: https://faqs.ankiweb.net/what-spaced-repetition-algorithm
7. Glasp, AI study modes compared: https://glasp.ai/articles/ai-study-modes-compared
(Desmos, Wolfram, Paul's Online Notes, Khan, 3B1B/Manim bullets rely on established general knowledge, not fetched sources.)
