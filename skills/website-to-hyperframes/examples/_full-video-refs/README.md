# Full-Video References

A **second tier** in the example library. The 81 numbered scenes (sections 01-13) teach vocabulary — what individual beats and techniques can look like. The 3 refs here teach **grammar** — how 4-10 beats assemble into a 40-second video with HyperShader transitions or pre-rendered clip stitching, narration sync, intro hook, CTA close.

Single scenes give you a beat catalog. Full-video refs give you a sense for **how the whole thing fits together.**

---

## When to study

- **Before writing your first storyboard.** Watch one ref MP4 end-to-end to feel the rhythm of 4-10 beats over 40 seconds — pacing of opener, build, peak, close.
- **When picking architecture for index.html.** The 3 refs demonstrate 3 different patterns (live sub-comps / pre-rendered clip stitch / single-composition-with-many-beats) — pick the one that fits your project.
- **When stuck on caption-track design.** All 3 refs show the canonical pattern: one `<div class="cap clip">` per spoken phrase, on a dedicated track index, with `data-start` from `transcript.json`.
- **When stuck on intro hook.** Each ref's first 1.5 seconds is a different but valid way to stop scrollers — read the first beat and pattern-match.

---

## Roster

| Ref | Project | Duration | Assembled MP4 | Architecture | Highest novelty |
|-----|---------|----------|---------------|--------------|-----------------|
| **ref-01** | [`ref-01-launch-video-2/`](ref-01-launch-video-2/) | 41.8s | https://www.heygenverse.com/s/fb0a115b-81e6-4e3f-acae-6dbe8ef3def7/raw | 4 acts as stacked `<div>` slots with `data-start`/`data-duration`, live sub-comps | Act-1's 4-panel AI-agent IDE quartet (Claude Code + Cursor + Codex + Gemini CLI) with synchronized mouse cursors, click ripples, sent-message bubbles |
| **ref-02** | [`ref-02-claude-design-hyperframes-video/`](ref-02-claude-design-hyperframes-video/) | 43.5s | https://www.heygenverse.com/s/0e1f0a40-351d-4a2d-9b18-139c095a42dd/raw | 10 pre-rendered MP4 clips stitched via `<video class="clip">` tags + caption + music + 6 SFX overlays | `claude-ui.html` (1209 lines — full Claude.ai interface), `dashboard.html` (1525 lines — dense analytical dashboard), `grid.html` (1621 lines — 24-cell technique grid) |
| **ref-03** | [`ref-03-hermes-hyperframes/`](ref-03-hermes-hyperframes/) | 41.0s, **1080×1080 square** | https://www.heygenverse.com/s/51dbc7ce-42df-4a94-84ef-a10c302b4a2f/raw | Single 1367-line composition (`parade.html`) renders 20 internal beats + separate captions sub-comp | VHS-noise boot + WebGL shader + GLSL code + render terminal composite + Lottie integration + 14 planning mockups (process artifact) |

---

## How to study each ref

Every ref has the same structure:

```
ref-NN-name/
├── README.md             ← project intro + per-beat map + closest single-scene refs
├── index.html            ← the orchestrator
├── compositions/         ← the actual beat HTMLs
├── SCRIPT.md             ← narration script (if present)
├── STORYBOARD.md         ← planning doc (if present)
└── fonts/ + logos/       ← brand fonts and logo SVGs the compositions reference
```

**Reading order per ref:**

1. Watch the assembled MP4 first (link in the ref's README + above)
2. Read the ref's `README.md` — has the BEAT MAP
3. Read `index.html` to see the orchestration pattern
4. Open each `compositions/<beat>.html` paired with the BEAT MAP row

Don't try to render these refs standalone — they reference production assets (audio, brand-clip MP4s, captured screenshots) that aren't bundled here to keep the lifts under 1MB each. The point is to **read the source**, not re-render.

---

## What's deliberately not bundled

- **Audio files** (narration, music, SFX) — listen to the assembled MP4 on Verse
- **Brand-clip MP4s** (ref-01's act-3 references 11 brand-recording MP4s; ref-02's clips were pre-rendered from compositions) — watch the assembled MP4
- **`transcript.json`** — only useful for re-rendering; the captions in `index.html` already encode the timing
- **`renders/`** — the assembled MP4s live on Verse
- **`snapshots/`** — gitignored anyway
- **Iteration directories** (ref-02's production project has 9+ `video-*/` snapshots; only the root `compositions/` is lifted)
- **VO generation tooling** (ref-03's `_generate_vo*.py` scripts) — production tooling, not relevant to reading the compositions

If you need to re-render or modify any ref, the production projects live at:
- ref-01: `launch-video-2/` in the repo root
- ref-02: `claude-design-hyperframes-video/` in the repo root
- ref-03: `~/Downloads/Archive/hermes-hyperframes/` (external archive)

---

## Architectural patterns at a glance

| Pattern | When to use | Demonstrated in |
|---------|-------------|-----------------|
| **Stacked live sub-comps** (ref-01) | Multi-act narrative where each act is conceptually distinct, fast iteration on per-act compositions, runtime can handle the load | ref-01 launch-video-2 |
| **Pre-rendered clip stitching** (ref-02) | Heavy compositions (1500+ lines each), wanting to iterate on one beat without re-rendering the rest, or wanting the final to play as MP4 (cheaper at runtime) | ref-02 claude-design |
| **Single composition with many beats** (ref-03) | Beats share a common visual idiom (terminal aesthetic, kinetic typography, music video), want the whole video to feel like one continuous piece, square or unusual aspect ratios | ref-03 hermes |
| **HyperShader.init() transitions** | Multi-beat with shader-transition wipes between beats — **not demonstrated in current refs.** The library's `examples/05-transitions-shader/` shows the shader effects; ref-01 + ref-02 use hard cuts and ref-03 uses internal beat transitions. A future ref-04 could demonstrate HyperShader orchestration. | (gap — see future work) |

---

## Future work

This tier ships with 3 refs. Potential additions:

- **ref-04 launch-video** (the original HyperFrames launch reel) — would demonstrate HyperShader orchestration. Most compositions already individually lifted as scenes (anatomy → 09-01, engine → 09-02, flex-shader → 07-01, canvas-close → 07-02, flex-threejs → 11-01, flex-gsap → 10-01, cta → 04-10). Adding it would teach the assembly grammar with HyperShader transitions.
- **ref-05 inspector-logo-intro** (12.75s standalone composition) — a single-file production composition demonstrating Figma-style inspector reveal at production density. Already partially mined as `examples/04-composed-ui/scene-13-design-inspector/` but the production original is significantly denser.
- **ref-06 timeline-launch-video** (multi-act feature breakdown) — has 9 acts; only one already lifted (timeline-editor → 04-11). Would demonstrate "feature explanation" video grammar.

Add these if the library expands further. Don't add more than ~6 refs total — diluting risks the "what's load-bearing" signal.
