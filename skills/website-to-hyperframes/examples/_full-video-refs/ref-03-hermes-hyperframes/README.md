# ref-03 — hermes-hyperframes

A multi-beat HyperFrames showcase reel from the team archive. **41.0s, 1080×1080 (square)**, narrated, captioned, music. **Different from refs 01 + 02 — this uses a single-composition-with-20-beats architecture.** One 1367-line composition (`compositions/parade.html`) renders 20 beats internally with VHS noise, CRT scanlines, and chunky terminal aesthetics.

**Watch the assembled MP4:** https://www.heygenverse.com/s/51dbc7ce-42df-4a94-84ef-a10c302b4a2f/raw

---

## What this teaches

A third architectural pattern (different from refs 01 + 02):

- **ref-01 (launch-video-2):** stacked-beats architecture — 4 acts as `<div>` slots with `data-start`/`data-duration`, live sub-compositions, hard cuts between acts
- **ref-02 (claude-design):** render-each-beat-then-stitch — 10 pre-rendered MP4 clips stitched via `<video>` tags + caption overlays
- **ref-03 (hermes):** single-composition-with-many-beats — ONE `parade.html` runs 20 internal beats over 41 seconds, plus a separate `captions.html` sub-comp for the lower-third caption track

The trade-offs:
- **ref-01 pattern** is best for narrative arcs (multi-act story) where each act is conceptually distinct
- **ref-02 pattern** is best for fast-iteration workflows (only re-render the changed beat) and large compositions that are too heavy to run live
- **ref-03 pattern** is best for "kinetic typography parade" style videos where beats share a common visual idiom (terminal aesthetic, CRT scanlines, ASCII art) and the whole reel feels like ONE continuous piece

**Highest novelty in this ref:**

- **VHS-noise terminal aesthetic** — `boot-sequence.html` uses canvas-based VHS noise bands + skill detection flash + CRT scanline overlay. Different from library's matrix-style `12-02-binary-rain-boot`.
- **WebGL shader + GLSL code + render terminal composite** — `shader-render.html` (323 lines) shows a WebGL fragment shader background WITH a floating GLSL code snippet WITH a render terminal showing FFmpeg output, all CRT-treated. Layered composite the library doesn't have.
- **Lottie integration** — `lottie-captions.html` (566 lines) shows Lottie animations driving caption beats. The library doesn't have a Lottie-integration ref.
- **Square format (1080×1080)** — only ref in the library that demonstrates square aspect-ratio composition. Useful for Instagram/Twitter video.

---

## How to study

1. **Watch the MP4** at https://www.heygenverse.com/s/51dbc7ce-42df-4a94-84ef-a10c302b4a2f/raw.
2. **Read `index.html`** — 84 lines, very simple. One root composition (1080×1080), two sub-comps (parade + captions), audio (music + VO), fade-to-black overlay at the end. Master timeline only drives the fade — the actual beat orchestration lives inside `parade.html`.
3. **Read `compositions/parade.html`** — 1367 lines, the load-bearing file. Canvas-based rendering with `gsap.ticker.add()` + `tl.time()` (the canonical seekable-canvas pattern). 20 beats orchestrated internally with VHS noise + CRT overlays + ASCII art.
4. **Read each of the 7 other `compositions/*.html`** (boot-sequence, binary-break, gsap-grid, shader-render, lottie-captions, deploy-cta, captions) — these are ALTERNATIVE single-beat compositions. They were authored as **mockup keyframes** during planning but the final video used `parade.html` as the master. They demonstrate techniques in isolation.
5. **Browse `mockups/`** — 14 keyframe mockups from planning (act1-boot through act5-close, plus kf01-kf04 keyframe variations). These are pre-vis HTMLs showing how the team explored the design.

---

## BEAT MAP — `parade.html` internal beats

`parade.html` is a SINGLE composition, but it renders 20 internal beats sequentially via canvas drawing. Read its `tl` timeline (search for the beat boundaries — they're commented in the source). High-level breakdown:

| Beats | Time slot | Visual idiom | Closest library reference |
|-------|-----------|--------------|---------------------------|
| 1-3 (cold open) | 0-5s | VHS-noise terminal boot + skill detection + CRT scanlines | `boot-sequence.html` (alt composition, study side-by-side) |
| 4-7 (binary break) | 5-12s | Matrix-style binary rain transitioning to ASCII art reveal | `binary-break.html` (alt composition) + library scene `12-02-binary-rain-boot` |
| 8-11 (capabilities) | 12-22s | Kinetic capability badges (GSAP, Three.js, Canvas, Lottie) with chunky CRT type | `gsap-grid.html` (alt composition) |
| 12-14 (shader render) | 22-28s | WebGL shader bg + floating GLSL code snippet + render terminal showing FFmpeg progress | `shader-render.html` (alt composition) — highest-novelty single composition |
| 15-17 (lottie captions) | 28-34s | Lottie animations + caption-sync beat | `lottie-captions.html` (alt composition) |
| 18-20 (deploy CTA) | 34-41s | "Deploy to anywhere" CTA + final logo lock + fade-to-black | `deploy-cta.html` (alt composition) |

---

## Standalone compositions (alternates to parade.html)

These compositions exist in `compositions/` AS SEPARATE FILES — they were authored during planning as alternative single-beat versions of what eventually became sections of `parade.html`. **Read them as standalone references** of the techniques they demonstrate:

| File | Lines | Technique |
|------|-------|-----------|
| `boot-sequence.html` | 252 | VHS-noise terminal boot + skill detection flash + CRT overlays. Three layers: canvas noise + terminal text + scanline ::after pseudo. **Canonical pattern for retro/CRT mood.** |
| `binary-break.html` | 202 | Matrix-style binary cascade with character-by-character break + ASCII art reveal. |
| `gsap-grid.html` | 499 | GSAP capability technique grid — different aesthetic from library's `12-01-techniques-grid` (24-cell variety). This one is chunkier, more terminal-themed. |
| `shader-render.html` | 323 | **The novel one.** WebGL fragment shader background + floating GLSL code snippet (showing the shader source) + render terminal (FFmpeg output) + CRT scanline overlay. 4-layer composite. |
| `lottie-captions.html` | 566 | Lottie animation integration with caption sync. Demonstrates `lottie-web` library integration in a HyperFrames composition. |
| `parade.html` | 1367 | The master 20-beat reel. Canvas-based rendering with `gsap.ticker.add()` reading `tl.time()`. |
| `deploy-cta.html` | — | Closing CTA with deploy command + logo lock + fade-out. |
| `captions.html` | — | Lower-third caption overlay used by `index.html` as a sub-composition over `parade.html`. |

---

## Mockups (planning artifacts)

`mockups/` contains 14 keyframe mockups from the planning phase. These are pre-vis HTMLs showing the team explored variations before committing to `parade.html` as the master. Useful as **process artifacts** — see how production teams iterate from mockup → final composition.

| File | What it explored |
|------|------------------|
| `act1-boot.html` | Act 1 (boot sequence) initial mockup |
| `act2-what-it-is.html` | Act 2 (skill explanation) mockup |
| `act3-showcase.html` | Act 3 (capability showcase) mockup |
| `act4-workflow.html` | Act 4 (workflow demo) mockup |
| `act5-close.html` | Act 5 (closer) mockup |
| `kf01-skill-boot.html` | Keyframe alt: skill boot variation |
| `kf02-binary-break.html` | Keyframe alt: binary break variation |
| `kf02-html-to-video.html` | Keyframe alt: html-to-video transition |
| `kf03-capabilities.html` | Keyframe alt: capabilities grid variation |
| `kf03a-gsap-grid.html` | Keyframe alt: GSAP grid variation |
| `kf03b-shader-render.html` | Keyframe alt: shader render variation |
| `kf03c-lottie-captions.html` | Keyframe alt: Lottie captions variation |
| `kf04-deploy.html` | Keyframe alt: deploy CTA variation |
| `contact-sheet*.html` | Contact-sheet renderer (preview all mockups in one grid) |

---

## ⚠ Assets not bundled

To keep this ref slim (652K total instead of 74MB), the following production-project assets are NOT included:

- `assets/bg-music.wav` (background music track)
- `assets/vo.mp3` (TTS narration)
- `assets/*` (any other captured/generated assets the compositions reference)
- `renders/*.mp4` (rendered output — listen to the assembled MP4 on Verse instead)
- `snapshots/*` (gitignored anyway)
- `transcript.json`, `SCRIPT-V3.md`, `SCRIPT-VARIANTS.md`, `_generate_vo*.py`, `_transcribe_vo.py` — VO generation tooling, not relevant to reading the compositions

The compositions in `compositions/` reference assets at paths like `assets/bg-music.wav` and `assets/vo.mp3`. These won't load if you try to re-render this ref standalone — you'd need the original production project at `~/Downloads/Archive/hermes-hyperframes/` for that.

---

## What this ref teaches that single scenes don't

- **Single-composition-with-many-beats architecture** — `parade.html` is 1367 lines orchestrating 20 internal beats over 41s. Different from ref-01's per-act sub-compositions and ref-02's per-beat MP4 stitching. Use this pattern when beats share a common visual idiom and you want the whole video to feel like one continuous piece.
- **Canvas-based beat rendering with `gsap.ticker.add()` + `tl.time()`** — the canonical seekable-canvas pattern, used at video scale. Single-scene examples (07-02 canvas-ascii) show the pattern; here it's the engine of a 41-second production reel.
- **CRT / VHS / retro-tech aesthetic vocabulary** — `boot-sequence.html`, `shader-render.html`, `binary-break.html` all share a coherent visual language. Useful reference when a video should feel "developer-tools" / "hacker-aesthetic" / "tech-retro."
- **Lottie integration in HyperFrames** — `lottie-captions.html` shows how `lottie-web` integrates as a composition layer. The library doesn't have a Lottie scene.
- **Mockup-to-final iteration** — the 14 `mockups/` files show how the production team explored variations before committing. Useful pattern for any agent that wants to "draft 3 visual directions before committing."
- **Square (1080×1080) format composition** — only ref in the library demonstrating square aspect-ratio. Critical for Instagram feed / Twitter / certain LinkedIn formats.
