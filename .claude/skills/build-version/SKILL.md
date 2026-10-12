---
name: build-version
description: "Build a version spec issue with parallel slice-builder agents, then review, merge and report back. Run on Opus."
disable-model-invocation: true
argument-hint: "Issue number (and optionally which slices)"
---

You are the orchestrator. You plan waves, brief, review and merge. The `slice-builder` agents write the code. Write code yourself only for merge conflicts and small review fixes.

The user works from a phone: everything you hand them must be doable in a phone browser. If they're around, stop at each ✋ checkpoint and wait. If they said they're away, take the recommended answers, log them as yours in **Decisions**, and keep going.

## Setup

1. Read `CLAUDE.md` (its `## Version builds` section names the repo, who decides the look, the learnings, checks and visual check), the issue and its comments (GitHub MCP `issue_read`), and `git log --oneline -15` on the version branch. Build only slices not marked ✅.
2. If `.claude/agents/slice-builder.md` is missing, copy [`slice-builder.md`](slice-builder.md) from this skill's folder there and commit it. Agents load when a session starts, so for this run spawn `general-purpose` workers and paste that file's body at the top of each brief.
3. Check out the version branch. Its checks pass before any worker starts.
4. Plan **waves**: slices that share files go in different waves; at most 3 workers at once; the slice marked first runs alone.

## Each worker

Spawn with the Agent tool: `subagent_type: "slice-builder"`, `isolation: "worktree"`, `run_in_background: true`, all of a wave in one message. The brief is short pointers, not copied spec: the issue number, the slice, the branch (`X.Y-<slice>` from the current version branch), the other slices running now (so it keeps edits to shared files small), and anything a merged slice built that it should reuse.

## Review and merge (as each finishes, one at a time)

1. Read the report, `git diff <version>...origin/<branch> --stat` and the shared files' diff. Open its screenshots and judge them against the slice's done bar and any art direction doc.
2. **Two strikes.** A slice whose look fails review twice gets no third fix. Send the user a ✋ with the screenshot and two choices: the simpler version, or a new approach. Record the answer in **Decisions**.
3. Small problems: fix them yourself. Bigger ones: `SendMessage` the same worker with exact fixes.
4. `git merge --no-ff origin/<branch>`, resolve conflicts (append-only files like schema and glossary: keep both sides), run the checks, push. A broken build gets fixed before the next merge.
5. Edit the issue body: mark the slice ✅ with one line on what was built, and add flagged defaults to its "To check".

## Feedback

Whenever someone says how something looks or should work, copy it into the issue's **Decisions** in their words before acting on it. If it teaches something future builds need (a limit, a tool gotcha), add a line to the learnings doc.

## Never

Push to `main`; open a PR; delete branches; skip a failing check; hand the user anything that needs a terminal.

## At the end

1. Remove merged workers' worktrees: `git worktree remove .claude/worktrees/<name>`.
2. Reply under 250 words, scannable on a phone:
   1. what's on the branch now, slice by slice
   2. tap-by-tap what to check on the preview link
   3. **Needs a human look**: every default a worker flagged, with who decides it
   4. anything unfinished and why
