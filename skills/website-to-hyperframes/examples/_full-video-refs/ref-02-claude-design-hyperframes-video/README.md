# ref-02 — claude-design-hyperframes-video

The "Claude Design × HyperFrames" launch reel. **43.5s, 10 beats**, narrated, captioned, music + 6 SFX tracks. The richest single compositions in any production project — `claude-ui.html` is 1209 lines, `dashboard.html` is 1525 lines, `grid.html` is 1621 lines.

**Watch the assembled MP4:** https://www.heygenverse.com/s/0e1f0a40-351d-4a2d-9b18-139c095a42dd/raw

---

## What this teaches

This ref demonstrates a **different assembly pattern than ref-01**: each beat was rendered to its own MP4 clip first (`clip-01-opener.mp4`, `clip-02-claude-ui.mp4`, etc.), then the root `index.html` stitches the pre-rendered MP4s together with caption overlays + music + SFX. **The `compositions/` directory has the SOURCE compositions** that produced each clip — `opener.html`, `claude-ui.html`, `moodboard.html`, `dashboard.html`, `grid.html`, `phones.html`, `letters.html`.

**Highest novelty in this ref:**

- **`claude-ui.html` (1209 lines)** — full Claude AI interface mockup (top bar with tabs + sub-toolbar + 540px sidebar + main canvas). The library's `scene-12-claude-code-ide` is a single chat panel; this is the full Claude.ai application UI composed from divs.
- **`dashboard.html` (1525 lines)** — dense analytical dashboard with 4-column layout, 8+ KPI cards, sparklines, donuts, status pills. Way denser than the library's `scene-05-dashboard-counters` (4 KPI cards).
- **`grid.html` (1621 lines)** — 24-cell technique grid (already lifted as scene 12-01) — but here in context, used as a 2.5-second peak beat at ~24.5s in the assembled video.

---

## How to study

1. **Watch the MP4 once** at https://www.heygenverse.com/s/0e1f0a40-351d-4a2d-9b18-139c095a42dd/raw.
2. **Read `index.html`** — note the architecture: each beat is a `<video class="clip" src="clip-NN-NAME.mp4">` tag with `data-start`/`data-duration` for placement. Captions are 19 `<div class="sub clip">` entries, 6 SFX tracks, 1 music track. **This is the "render-each-beat-then-stitch" pattern** — different from ref-01's live-sub-composition pattern.
3. **Read each `compositions/<name>.html`** in pair with the BEAT MAP. These are the SOURCE files that produced each `clip-NN-*.mp4` referenced by `index.html`. The clip MP4s themselves are NOT bundled in this ref (they live in the production project at `claude-design-hyperframes-video/`).
4. The `compositions/captions.html` shows the per-word caption pattern (separate file, not used in this assembled video but illustrates an alternative caption approach).

---

## BEAT MAP

| Beat | Composition source | Time slot | Techniques | Closest single-scene reference |
|------|--------------------|-----------|------------|---------------------------------|
| **1 · Opener** | `compositions/opener.html` (416 lines) | 0.0s – 3.0s | Light-ball orb appears tiny → blooms with halo → orb dissolves into glow → horizontal beam emerges → title "Claude Design × HyperFrames" fades up with italic ampersand → date subtitle → breathing hold → fade to black | `examples/12-combined-vignettes/scene-05-cinematic-opener/` — the library's decontextualized version (rebranded to HYPER · FRAMES). Same opener pattern, different brand. |
| **2 · Claude UI** | `compositions/claude-ui.html` (1209 lines) | 3.0s – 13.5s | Full Claude AI interface: top bar with project name + tabs ("Composition", "Chat", "Files") + sub-toolbar with model selector + 540px left sidebar showing chat thread + main canvas showing composed UI being built. Mouse cursor types the prompt "What if you could just describe a video, drop in a skill file, and hit send?", the chat reply appears, the canvas builds the resulting composition live | No direct library equivalent. `examples/04-composed-ui/scene-12-claude-code-ide/` is the chat-panel-only sibling. This composition shows the FULL Claude.ai app structure. |
| **3 · Moodboard** | `compositions/moodboard.html` (692 lines) | 13.5s – 19.0s | Brand book moodboard — Claude Design crown header + color swatches + logo card + sticky note + reference cards stacked + Fraunces/Archivo typography sample + 6 SVG hub-spoke connectors from logo to each element | `examples/12-combined-vignettes/scene-04-brand-moodboard/` — the library's decontextualized version (rebranded to "Aurora Studio"). Same scene, different brand identity. |
| **4 · Dashboard** | `compositions/dashboard.html` (1525 lines) | 19.0s – 23.0s | Dense analytical dashboard with 4-column grid (320px sidebar + 3 main panels), 8+ KPI cards, sparklines, multi-stat panels, status pills in pink/rose/amber/cyan/teal/violet/purple palette. Top rail with system status pills. | `examples/04-composed-ui/scene-05-dashboard-counters/` (4-card lightweight version) + `examples/09-counters-and-data/scene-05-sparkline-draw/` (4-card sparklines). This composition is denser than either single-scene ref. |
| **5 · Globe** | (not in `compositions/` — rendered separately, maybe in iteration dirs) | 23.0s – 24.5s | 3D animated globe (1.5s peak beat) | No direct library equivalent. Three.js 3D scenes in library are `11-02-vercel-triangle-roll` (pyramid) and `11-04-anamorphic-text-crt` (text geometry). |
| **6 · Grid** | `compositions/grid.html` (1621 lines) | 24.5s – 27.0s | 24-cell technique grid — clock, concentric rings, diagonal stripes, 3D cube, dot grid, QR code, stock chart, liquid blob, particle vortex, glowing orb, spirograph, DNA helix, neural network, radial burst rays, kinetic 3D MOTION word, glitch SYSTEM→RENDER text, sine waves, code editor mockup, loading spinners, binary rain, maze pattern, audio bars, neon globe, weather card | `examples/12-combined-vignettes/scene-01-techniques-grid/` — the library's decontextualized version (rebranded CLAUDE→MOTION, DESIGN→RENDER). Same scene; here it's 2.5s of a 43s reel. |
| **7 · Phones** | `compositions/phones.html` (682 lines) | 27.0s – 30.5s | Two 3D iPhone mockups in perspective with realistic bezel + dynamic island + home indicator. Scene 1: fictional fitness app "Pulse" (orange ride card, athlete name, animated metrics, route polyline, activity rings, calendar). Scene 2: fictional music player "Echo" (purple-gradient album cover, waveform progress, visualizer EQ bars, lyric card swap) | `examples/04-composed-ui/scene-09-phone-mockups/` — the library's lift of this scene (rebranded). Identical pattern. |
| **8 · Feature** | (not in `compositions/`) | 30.5s – 32.0s | Feature highlight beat (1.5s) | Likely a static-y feature card with motion overlay. |
| **9 · Hero** | (not in `compositions/`) | 32.0s – 34.0s | Hero composition (2s) | Static composition with light hero text + brand mark. |
| **10 · Letters / Close** | `compositions/letters.html` (349 lines) | 34.0s – 40.0s | Orbital title — "HYPER FRAMES" letters burst in from alternating sides with rotation and offset, bounce into place with `back.out(2.0)` overshoot, accent line draws across the width, orbit ring expands with glowing dot tracing 360°, tagline "HTML in. Video out." types in mechanical pacing, breathing hold | `examples/01-typography/scene-11-orbital-title/` — the library's lift (rebranded HYPER FRAMES → KINETIC TYPE; HTML in. Video out. → Code in. Motion out.). Identical pattern. |

---

## Captions track

`index.html` has 19 `<div class="sub clip">` entries on track 90, one per spoken phrase. Pattern matches narration onsets at sentence-fragment granularity (not per-word). The last two captions (`.sub-accent`) flip color to `#d97757` (Claude orange) on the brand closer phrases "HyperFrames." and "Download the skill."

Compare with ref-01's caption track (~30 phrases, also one-div-per-phrase pattern) — same idiom, different timing density (ref-01 narrates more, ref-02 lets visuals carry more).

---

## ⚠ Assets not bundled

To keep this ref slim (316K total instead of 217MB), the following production-project assets are NOT included:

- `clip-NN-*.mp4` files (10 pre-rendered beat clips referenced by `index.html`)
- All music + 6 SFX MP3 files (~5-15MB)
- Iteration directories (`video-7-2/`, `video-9-2/`, `video-5/`, `video-10-2/`, `video-11-fixed/`, `demov3-5/`, `demov4-2 (1)/`, etc.) — these are version snapshots with redundant content
- Captured website assets

The compositions in `compositions/` are the SOURCE files. The MP4 clips referenced by `index.html` were rendered FROM those compositions. To re-render, the production project lives at `claude-design-hyperframes-video/` in the repo root.

---

## What this ref teaches that single scenes don't

- **The "render-each-beat-then-stitch" architecture** (alternative to live sub-compositions). Each beat is rendered standalone, then `index.html` stitches the MP4s as `<video class="clip">` tags. This is faster to iterate (only re-render the changed beat) and lower-runtime-cost (the player just plays MP4s + overlays captions).
- **Dense compositions at scale.** `claude-ui.html` (1209), `dashboard.html` (1525), `grid.html` (1621) — these are 1500+ line single compositions, way bigger than the library's average ~300-500 line scenes. The teaching: a real production beat can be that dense.
- **Per-track stacking discipline.** 10 clips on track 0, 19 captions on track 90, 1 music on track 5, 6 SFX on tracks 6-11. Clean separation prevents layering bugs.
- **SFX-per-event choreography.** SFX align to specific visual moments (keyboard typing at 4.0s, pop at 7.5s, mouse click at 8.5s, notification at 15.0s). Read the audio tags in `index.html` for the canonical pattern.
- **Caption styling with brand-accent color swaps** — the `.sub-accent` class color-flip on the final 2 captions makes the closer feel branded vs. instructional.
