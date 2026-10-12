---
name: plan-version
description: "Grill me about the next version, then write one spec issue that /build-version can hand to parallel agents."
disable-model-invocation: true
argument-hint: "The idea or problem for the next version"
---

You turn an idea into **one spec issue** on the project's GitHub repo: a living spec with slices, checkpoints and a decision log. No separate ticket issues: the slices live in the spec, so agents read one place.

The user works from a phone, in short bursts. Everything you hand them must be doable in a phone browser.

## 0. Project setup

Read `CLAUDE.md`. If it has no `## Version builds` section, ask for what's missing in one round, then add the section and commit it:

```
## Version builds
- Issues: <owner/repo>
- Decides the look: <names, e.g. "Darren and Char">
- Learnings: <doc to read before risky work, and when>
- Checks: <commands every slice must pass>
- Visual check: <how to take a phone-size screenshot>
```

## 1. Grill

Call the Skill tool with `grilling`. Keep each round to 3–5 questions, each with your recommended answer. Look up facts yourself (code, `CONTEXT.md`, `docs/adr/`, the learnings docs, closed issues): the questions are only for decisions.

Grill until every branch below is settled:
- **The look.** For anything visual or interactive, what "looks right" means, concretely enough that a screenshot can pass or fail it: a reference (a photo, an app, a sketch) and what must be visible. A feeling ("tender", "cosy") is not a bar.
- **Known limits.** Anything the learnings docs or past issues say the project can't do. If the idea needs it, say so now and offer the simpler version.
- **Phone setup.** How each step works for the real users on their phones (sign-in, permissions, widgets). Anything fiddly gets redesigned here, before code depends on it.
- **Other people's calls.** Which choices belong to someone other than the user. Turn them into checkpoint questions.

Done when the user confirms nothing is left open.

## 2. Write the spec

Create the issue with the `ready-for-agent` label and this shape:

- **Why**: the problem in the user's words, with their example.
- **Branch**: `X.Y`; workers branch as `X.Y-<slice>`. Ship to `main` only when the user says so.
- **Read first**: the files and dev pages a builder needs, a line each on what they do.
- **Slices**: per slice: name, branch, model (Sonnet by default; Haiku for mechanical re-runs), what it builds, the files it shares with other slices, and its **done bar**: the screenshot that proves it and the look it must pass. Mark which slice goes first and which run in parallel (3 at most).
- **Options first**: any slice whose look is unproven starts with a cheap sheet of 2–3 options; a ✋ checkpoint picks one before polishing.
- **✋ Checkpoints**: where people look at screenshots or the preview, with numbered questions and your recommended answers.
- **Tests**: name the tricky pure logic that gets a test, if any (time zones, ordering, expiry: bugs you can't see by looking). Everything else is checked by screenshot and on the phone.
- **Decisions**: an empty log. Every answer goes here in the person's own words: `<Name> (date): …`.
- **Rules**: this version's guardrails (what must not change, schema rules, privacy).

Keep the body under about 8k characters: a builder reads only "Read first", "Rules", "Decisions" and its own slice, so shared material goes there, not repeated per slice.

## 3. Start the branch

Create `X.Y` from `main`, bump `version` in `package.json` to match, push. Tell the user, in under 100 words: the issue link, the first checkpoint, and that `/build-version <issue>` starts the build.
