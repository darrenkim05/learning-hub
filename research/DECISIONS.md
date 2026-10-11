# Planning decisions log

**Versions:** 1.0 = the current site (nn-basics and CNN explorers, existing kit). 2.0 = the redesign planned here.

Brainstorming phase: nothing here is final. Features will be cut before building.

## Product direction
- **Goal:** turn the site from static pages into an active AI personal teacher. Pages are the teaching material; the AI tutor knows where you are and what you're shaky on.
- **Focus:** first-time learning of new concepts. Consolidation (review) is secondary, but exam-prep review of weak concepts is wanted (see below).

## Decided
| # | Topic | Decision |
|---|---|---|
| 1 | AI tutor answer rules | On explanation text: explain directly and fully. On a question you haven't attempted: hint ladder, full solution only after an attempt (Bastani et al. 2025). |
| 2 | AI provider | Free tier for the MVP (e.g. Gemini Flash). Still needs a small serverless function on Vercel to hide the key. Put the provider behind one small wrapper so it can be swapped. |
| 3 | New questions on missed concepts | Paused. |
| 4 | Step-level feedback | "Choose the next line" (3-4 candidate lines, wrong ones = common errors). No typing, no paper checkpoints. |
| 5 | Review | Wanted for exam prep: "show me the concepts I'm weak on". Fed by wrong answers and "not yet" flags. |
| 6 | Predictions and questions | Never forced. You can skim the whole page. Answers stay hidden until you attempt or tap "show answer". |
| 7 | Tutor interface | Bottom sheet: select text → ask → answer slides up from the bottom. |
| 8 | Learner data storage | localStorage for now (one browser). |

## Proposed from the NN-basics review (input for the 2.0 redesign)
- "Where am I" pipeline strip on every section (data → model → loss → optimiser), highlighting which box the section changes.
- Symbol glossary: tap any symbol to see what it means. Defined once per page, attached automatically by the kit.
- "Not yet" flag on any section or selected text. Stored locally, shown as a shaky-concepts list, sent to the AI tutor as context, and used for exam-prep review.
- Rule for new sections: introduce at most 2-3 new ideas per section, picture before formula, and say explicitly "same example, new twist" or "new example".
