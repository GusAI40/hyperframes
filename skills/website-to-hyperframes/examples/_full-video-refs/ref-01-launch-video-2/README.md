# ref-01 — launch-video-2

The HyperFrames `website-to-hyperframes` skill launch reel. **41.8s, 4 acts**, narrated, captioned. Real production work — read it to see how a multi-beat video assembles.

**Watch the assembled MP4:** https://www.heygenverse.com/s/fb0a115b-81e6-4e3f-acae-6dbe8ef3def7/raw

---

## What this teaches

Single-scene refs in the library show you what a beat *can be*. This ref shows you what a beat *fits into* — how 4 acts orchestrate through `index.html`, how the narration drives `data-start`/`data-duration` per beat, how the intro hook (act-1) stops scrollers in the first 1.5 seconds, how the CTA close (act-4) holds for 2-3 seconds without dead silence.

**Highest novelty in this ref:** act-1-cold-open. 4 AI-agent IDEs (Claude Code, Cursor, Codex, Gemini CLI) in quadrants with synchronized mouse cursors clicking "send," prompts typing in, sent-message bubbles materializing, then a centered "Now / any site becomes / video." phrase + YEAHH celebration. The library's single-scene scene-12-claude-code-ide is one panel; this is the full quartet.

---

## How to study

1. **Watch the MP4 once** at https://www.heygenverse.com/s/fb0a115b-81e6-4e3f-acae-6dbe8ef3def7/raw — get the full flow before reading.
2. **Read `index.html`** — see how the 4 acts are wired via stacked `<div data-composition-id>` slots with `data-start`/`data-duration` values pulled from the narration timing. Note the captions track at the bottom (every spoken phrase is its own `<div class="cap clip">`). HyperShader isn't used here — this video runs as a stacked-beats composition with hard cuts between acts.
3. **Open each composition in `compositions/`** and pair with the BEAT MAP below.
4. **Read `SCRIPT.md` + `STORYBOARD.md`** if present — see how the planning translated into beat code.

---

## BEAT MAP

| Beat | File | Duration | Techniques | Closest single-scene reference |
|------|------|----------|------------|---------------------------------|
| **act-1 (Cold open)** | `compositions/act-1-cold-open.html` (931 lines) | 0.0s – 12.0s | 4 AI-agent IDE quadrants (Claude Code / Cursor / Codex / Gemini CLI) with chrome (traffic-lights + brand logo + title bar) + animated mouse cursors with click ripples + sent-message bubbles + phrase reveal "Now / any site becomes / video." + YEAHH celebration with star particles + flash transitions | `examples/04-composed-ui/scene-12-claude-code-ide/` is one of the four panels at single-scene scale. This act is the 4-panel quartet extension — the same pattern repeated four times with synchronized clicks. |
| **act-2 (Extraction)** | `compositions/act-2-extraction.html` (475 lines) | 12.0s – 33.8s (partial overlap with act-3) | MacBook frame (left) with `assets/heygen-fullpage.png` ⚠ + `design.md` panel (right) being progressively written line-by-line (Colors → Typography → Assets → Layout) + 16 callout tags pinning at design elements (LOGO, DISPLAY, ASSET·3D, BUTTON·PRIMARY, STAT, BRAND·CLOUD, etc.) + EXTRACTING…→EXTRACTED stamp transition + bottom stats counter | `examples/12-combined-vignettes/scene-06-design-extraction/` is the library's decontextualized version of this exact beat (rebranded HEYGEN → LUMEN). Study them side-by-side — the lift is faithful but the production original has different timing nuances. |
| **act-3 (Reel)** | `compositions/act-3-reel.html` (49 lines, very lightweight) + `compositions/act-3-beats/a3-beat-NN.html` (10 beats × 78 lines each) | 12.0s – 33.8s | 11 brand-clip videos (Stripe / Tailwind / Framer / Spotify / HeyGen / Vercel / Vibecode / Linear / Dribbble / GitHub) with caption overlays (`01 · Product Launch / stripe.com`, etc.). Each clip is a real recorded MP4 played for ~1.5-3s with a captioned overlay. **Note: the underlying brand-clip MP4s are NOT bundled in this ref** — they live in `launch-video-2/compositions/act-3-clips/` in the production project. You're reading the markup, not the rendered output. | No library equivalent — video-clip reels are video-asset-driven and outside compose-from-divs scope. The TEACHING value here is how to ORCHESTRATE 11 short clips with synchronized caption overlays in a single timeline. |
| **act-4 (End card)** | `compositions/act-4-end-card.html` (292 lines) | 33.8s – 41.8s | Aurora radial-gradient background blooming in + 12 floating particles + tri-color "HYPERFRAMES" wordmark with `background-clip: text` + "Give your agent a URL / Go make something" promise lines + `npx skills add heygen-com/hyperframes` install command typing in with cursor blink + breath accent dot | `examples/10-particles-and-ambient/scene-02-aurora-end-card/` is the library's decontextualized version of this exact beat (rebranded HyperFrames → MOTION STUDIO). Same scene, different brand. |

---

## Captions track

`index.html` includes ~30 `<div class="cap clip">` entries — one per spoken phrase. Each has `data-start` aligned to the narration audio (`assets/narration.wav` referenced by the `<audio>` tag, not bundled in this ref).

This is the canonical pattern for **narration-synced captions at video scale.** When agents build captioned videos, they should read this pattern: one DIV per phrase, all on track 100+ to avoid overlapping with beat tracks, `data-start` from `transcript.json`.

---

## ⚠ Assets not bundled

To keep this ref slim (940K total instead of 60+MB), the following production-project assets are NOT included:

- `assets/heygen-fullpage.png` (8MB site screenshot referenced by act-2-extraction) — you can read the markup; the rendered video shows what it looks like
- `compositions/act-3-clips/*.mp4` (11 brand-clip recordings, ~30MB total) — act-3 markup references them; the rendered video shows them in context
- `assets/narration.wav` (TTS narration audio) — listen to the rendered MP4
- `transcript.json` (word timestamps) — only useful for re-rendering

If you want to re-render or modify this reel, the production project lives at `launch-video-2/` in the repo root (not in this `examples/` lift).

---

## What this ref teaches that single scenes don't

- **Stacked-beats architecture** (NOT HyperShader). 4 acts as overlapping `<div>` slots with `data-start`/`data-duration` values; act-2 and act-3 partially overlap (12.0-33.8s window) because the MacBook + design.md from act-2 stay on screen as the act-3 brand clips play as inset video overlays.
- **Narration-synced caption tracks** — 30+ caption divs all aligned to spoken phrases.
- **Intro hook stopping scrollers** — act-1's first 1.5s lands all 4 IDE panels with their typing prompts. Punch from frame 1.
- **CTA hold rhythm** — act-4 ends 2-3 seconds after the last spoken word ("Go make something"), not 8s of silence.
- **Asset accent restraint** — only 1 substantial captured asset (heygen-fullpage.png in act-2's laptop), plus brand-logo SVGs for the AI agents (act-1) and the install-command in act-4. Everything else composed from divs.
- **Multi-clip video reel orchestration** (act-3) — pattern for "show 10 brand examples in 20 seconds" beats.
