# ManimGX: what it is and whether it fits learning-hub

Checked 2026-10-17: read the repo docs and test-rendered one scene in a Claude Code cloud container.

## What it is
- **An open-source animation engine (v0.1.1, Academa Labs).** It keeps **Manim Community Edition's Python API** but renders through a **Rust + wgpu** core. Most Manim CE code runs after `import manimgx as m`.
- **Output:** **MP4 video**, 2D and 3D in one scene (surfaces, moving cameras, text, equations, plots).
  - `manimgx inspect` writes a storyboard PNG and checks the 2D layout without making a video. That's useful for agents.
- **Maths without a LaTeX install:** `MathTex` is converted to Typst. LaTeX packages and `\def` don't convert.
- **Built-ins:** voiceover (`self.say`), sound, subtitles, and sections shown as slides (`manimgx present`).
- **Browser player:** the npm package `manimgx` has a `<manimgx-player>` tag. Pyodide runs the Python in the page and WebGPU draws it.
  - First load is about 26 MB (Pyodide ~6 MB + ManimGX ~20 MB).
  - It needs WebGPU with float32 blending: Chrome/Edge 113+, Safari 26.
- **Licence:** ManimGX's own code is MIT. The native wheels bundle x264, so they are GPL-3.0 as a whole. That's fine for making videos; the videos aren't GPL.
- **Speed claim:** "90× faster than Manim CE". This is the authors' own benchmark (36 s of 1080p60 in 3 s on an Apple M4 Pro). No independent reproduction found.

## What it is NOT
- **Not interactive in the explorable sense.** The output is a film: play, pause and seek on a timeline. The reader can't drag a parameter and watch the maths respond. Our sliders, quizzes and diagrams stay SVG/canvas.
- **Not 3Blue1Brown's own library (ManimGL).** It copies Manim *Community's* API, not 3b1b's.
- **Not mature.** Version 0.1, about 2 contributors and very new. Expect API churn and gaps from Manim CE.
- **Not a teaching method.** A video is passive. On its own it risks exactly the fluency illusion the research warns about (`TAKEAWAYS.md` §10, §13).

## Test in this container (Python 3.13, no GPU)
- **Install:** `uv pip install manimgx` gave a 284 MB virtualenv. There's no GPU here, so it falls back to Mesa lavapipe on the CPU.
- **Render:** a 5 s sigmoid scene (axes, `MathTex`, curve, a dot driven by a `ValueTracker`) took **7.5 s** to render on the CPU. The result is a **48 KB** 720p60 MP4.
- **Quality:** the storyboard looked clean, with crisp maths (σ, fractions, superscripts). Layout check: "no problems".

## Fit with learning-hub
| Option | Verdict |
|---|---|
| **Pre-render short clips at build time and embed as `<video>`** | **Good fit.** Clips are tiny (tens of KB), work on any phone and need no WebGPU. Claude writes Python it already knows (Manim), and `inspect` lets it check frames cheaply. |
| Embed the browser player | Poor fit for now: a 26 MB first load, WebGPU only, heavy on a phone, and still not parameter-interactive. |
| Replace our SVG figures and widgets | No. They're interactive and lighter. Video is for motion we *can't* hand you as a slider. |

**Where video earns its place:**
- Processes that unfold over time: a derivation morphing step by step, gradient descent on a 3D loss surface, a linear map transforming a grid, Fourier sums building up.
- Real 3D, which our SVG kit can't do cheaply.

**Rule to keep it active (same as diagrams):** every clip sits behind a task.
1. **Predict first.** The clip is hidden until you guess, like the `Figure` predict task.
2. **Pause at the key frame.** Use `next_section` so the clip stops at the question and continues after you answer.
3. **Short clips:** at most 10–20 s, one idea each.

**Possible slice later:** a `<Clip>` component (MP4 + poster frame + required `task`) and `npm run clips`, which renders `clips/*.py` with ManimGX into `public/clips/`.
- Rendering happens in Claude Code sessions, not on Vercel. The clips are committed like our check results.
- Pilot: a 3D loss-surface descent clip for a future gradient-descent lesson.

## Sources
- Repo and README: https://github.com/academa-labs/manimgx
- Browser player README: `browser/README.md` in the repo
- "Coming from Manim CE": `docs/content/user-guide/coming-from-manim-ce.md` in the repo
- Show HN: https://news.ycombinator.com/item?id=50037852
- Write-up: https://eraofminds.com/blog/manimgx-3d-animation-for-ai-agents/
- Listing (licence, version): https://www.everydev.ai/tools/manimgx
