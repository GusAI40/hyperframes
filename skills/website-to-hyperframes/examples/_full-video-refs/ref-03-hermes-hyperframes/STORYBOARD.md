# Hermes × Hyperframes — Storyboard v1

**Format:** 1920×1080 | ~30 seconds
**Audio:** ElevenLabs voiceover + SFX underscore
**VO direction:** Female. Cool, detached, precise. Blade Runner briefing-officer register — Rachael's composure, not Joi's warmth. Unhurried cadence with deliberate pauses between phrases. Slight vocal fry at sentence ends. She's introducing a weapon, not selling a product. Economy of words. Every syllable is chosen.
**ElevenLabs voice:** Use a low-register female voice with slight breathiness. Stability ~0.45, similarity ~0.70, style exaggeration ~0.25. Slow delivery — aim for ~110 words per minute. Add 0.5–1s silence between sentences in the audio generation.
**Aesthetic:** Nous Research 90s hacker dystopian — dark terminals, CRT phosphor glow, VHS analog distortion, chromatic aberration, multi-color shader backgrounds. The palette is NOT monochrome green — it's warm amber (#FFD080), cool cyan (#88BBFF), phosphor green (#33FF33), hot magenta (#CC00FF), with black as ground truth.
**Built with:** Hyperframes (the video is its own proof)

---

## Color & Style Direction

**Root aesthetic: late-90s hacker workstation with analog video decay.**

Every frame should feel like it was captured off a CRT monitor by a VHS deck. Persistent layers across the entire video:
- **Scanlines:** 2–3px repeating horizontal bands at 12–15% opacity
- **Vignette:** Radial darkening from 35% outward, 55–60% opacity at edges
- **Color bleed bars:** Thin gradient strips at top/bottom edges — chromatic, shifting per beat
- **Chromatic aberration:** 2–4px red/blue channel offset on hero text elements
- **Noise field:** Sparse colored particles (100–150 dots, 6 colors, low opacity)

**Typography:**
- VT323 for terminal/system text, boot sequences, labels
- IBM Plex Mono for code, commands, technical content
- Never use a sans-serif. Everything is monospace. This is a terminal world.

**Transitions:** Hard cuts with 1–2 frame interference bursts (binary flash, horizontal shear, or white noise band). No dissolves. No fades. Everything switches like a corrupt signal.

---

## Underscore Direction

Dark ambient electronic. Low-frequency drone with intermittent digital artifacts — bit-crushed clicks, filtered static bursts, distant metallic resonance. Reference: Vangelis "Blade Runner Blues" meets Aphex Twin's ambient work meets a dial-up handshake slowed to 10%. The drone should feel like a machine idling — alive but patient. Swell subtly during the capabilities section (KF03), drop to near-silence for the closer, resolve on a single sustained tone that decays to nothing.

---

## VO Script (~70 words, ~30s at Blade Runner cadence)

```
Hermes has learned a new skill.

[pause — 1s]

Hyperframes. Open source. HTML to video.

[pause — 0.5s]

GSAP timelines. WebGL shaders. Lottie. Captions. Word-synced.
Every frame rendered. Deterministic. Identical. Every time.

[pause — 0.5s]

One command to install. One slash command to create.

[pause — 1s]

Your agent makes videos now.
```

---

## Beat-by-Beat

---

### BEAT 1 — SKILL BOOT SEQUENCE (0:00–0:07)

**VO:** "Hermes has learned a new skill."

**Keyframe ref:** `kf01-skill-boot.html`

**Concept:** We open mid-boot. The Hermes BIOS is already running — the viewer walks into a process in progress. Lines have already scrolled. The system is alive. Then it detects something new.

**Visual sequence:**

0:00–0:02 — Boot lines are mid-scroll. NOUS RESEARCH SYSTEMS header already on screen. Lines printing in rapid succession: neural memory check, tool subsystems (61 registered), skill libraries (666 indexed), language core (claude-opus-4-6). VHS noise bands drift across the screen — amber, teal, magenta horizontal interference. Chromatic aberration on all text (2px red/blue offset).

0:02–0:04 — On "learned a new skill" — boot sequence HALTS. A bright amber flash pulses across the screen. `[ NEW SKILL DETECTED ]` appears in a highlighted block. The VHS tracking goes haywire for 2–3 frames — horizontal displacement, static burst.

0:04–0:07 — The HYPERFRAMES skill block prints itself: version, source (heygen/hyperframes), category (creative/media). Validation lines fire rapidly: `SKILL.md... PASSED`, `Registering /hyperframes`. A 3×3 module grid appears — compositions, gsap-engine, captions, rendering, studio, templates, registry, cli, lint+validate — each with a green `OK` that stamps in with a flash. Final line: `SKILL INSTALLED ✓ • 667 skills • /hyperframes ready`.

**SFX:** CRT hum baseline. Rapid-fire keyboard/teletype clicks on boot lines. On skill detection — a single analog warning tone (low, resonant). Module stamps get crisp digital chirps.

**Camera:** Static. Locked. The content moves, the frame doesn't. Terminal footage.

---

### BEAT 2 — BINARY BREAK (0:07–0:09)

**VO:** (silence — the visual IS the transition)

**Keyframe ref:** `kf02-binary-break.html`

**Concept:** The boot screen shatters. A violent 2-second signal break — the system is rebooting into something new. Binary rain + screen displacement + chromatic explosion.

**Visual sequence:**

0:07–0:07.5 — The boot terminal fractures. Screen splits into 8–10 horizontal shards that displace laterally (±20–60px) with slight skew. Each shard carries a different color gradient tint — the mono-green terminal bleeds into multi-color. 0.5s of pure broken signal.

0:07.5–0:08.5 — Binary rain takes over. 96 columns of falling 0s and 1s in bright green (#33FF33) with varying opacity and speed. Some columns glow hot (text-shadow pulse). The shards dissolve into the rain. Behind the rain, a radial warm burst grows from center — amber/magenta/purple glow.

0:08.5–0:09 — Through the rain, HYPERFRAMES punches in center-screen. Massive VT323 type. Heavy chromatic aberration (8px red/blue ghosts). Radial light burst behind it. "HTML TO VIDEO" subtitle fades in below. The binary rain thins and the title holds for half a beat.

**SFX:** Glass-shatter impact. Digital static roar (0.5s). Binary rain gets a cascading bit-noise texture. Title punch — deep sub-bass hit with analog distortion.

**Camera:** Static, then subtle 1–2px screen shake during the shatter.

---

### BEAT 3A — GSAP CAPABILITIES (0:09–0:14)

**VO:** "Hyperframes. Open source. HTML to video. GSAP timelines."

**Keyframe ref:** `kf03a-gsap-grid.html`

**Concept:** HARD CUT from the binary break into a wall of living animation. 24 cells in a 6×4 grid, every single one running a different CSS/GSAP animation. This is the "proof by overwhelming evidence" beat — the sheer quantity of simultaneous motion says more than any text could.

**Visual sequence:**

0:09 — Hard cut. Grid appears fully populated. No build-in. All 24 cells are already animating when we arrive. The effect is immediate sensory overload in the best way.

0:09–0:12 — The grid lives and breathes. Each cell runs its own loop:
- Rotating geometric shapes (squares, hexagons, triangles)
- Pulsing circles with expanding rings
- Audio visualizer bars (8 bars, staggered phase)
- Orbiting dots with perspective (3D feel)
- Elastic bounce animations
- Gradient-sweep text revealing "GSAP"
- SVG motion path with trailing ghost
- 5×5 stagger grid (25 squares rippling)
- 3D card flip
- Sine wave lines
- Morphing blob
- Bouncing loader dots
- Progress bars filling
- Breathing circles
- Crosshair + ring
- Waveform bars (20-bar EQ)

Behind the grid: dark ground with colored radial light pools — warm orange bottom-left, cyan top-right, purple center. The pools drift slowly.

0:12–0:14 — Center overlay fades in over the grid with a backdrop-filter blur: "GSAP 3.14 / ANIMATION ENGINE" in IBM Plex Mono. The grid continues animating behind the frosted glass. The overlay establishes what we're looking at without stopping the show.

**SFX:** Ambient electronic pulse — rhythmic, mechanical, like a factory floor of tiny machines all running in sync. Subtle. Not musical. Industrial-ambient.

**Camera:** Static hold, then a very slow drift (2–3px/s) to give parallax life.

---

### BEAT 3B — SHADERS + RENDER PIPELINE (0:14–0:20)

**VO:** "WebGL shaders. [pause] Every frame rendered. Deterministic. Identical. Every time."

**Keyframe ref:** `kf03b-shader-render.html`

**Concept:** Two things at once — the left side shows a LIVE WebGL shader (the capability), the right side shows the render terminal processing it (the pipeline). The shader proves the visual range; the terminal proves the engineering.

**Visual sequence:**

0:14 — Hard cut. Full-screen WebGL fragment shader — FBM domain warping with cosine color palette. Organic, flowing, hypnotic. Warm tones dominant (amber, deep purple, teal accents). The shader is LIVE — animated, evolving, never static.

0:14–0:15 — Floating code snippet fades in top-left. Actual GLSL source: `vec3 col = palette(fbm(p + fbm(p)));` and related lines. Syntax-highlighted: purple keywords, teal functions, amber numbers. Semi-transparent black background with left border accent. This is the source code that generates what you're seeing.

0:15–0:16 — "SHADERS" label appears bottom-left. VT323, 64px, amber with heavy chromatic aberration (4px red/blue ghosts) and warm glow. Subtitle: "WEBGL FRAGMENT SHADERS • FBM • DOMAIN WARPING".

0:16–0:20 — Render terminal slides in from the right. Dark glass panel with traffic-light dots. Shows the full pipeline:
- `$ npx hyperframes render --output renders/out.mp4`
- Validation checklist fires line by line (✓ 6 compositions, ✓ GSAP, ✓ WebGL shader compiled, ✓ Lottie assets, ✓ Fonts loaded)
- Progress bar fills from 0→100%: `Rendering... frame 702/900 → 900/900`
- Output stats appear: H.264 MP4, 1920×1080, 30fps, 14.2 MB

The VO "Deterministic. Identical. Every time." lands as the progress bar completes and the terminal shows final output.

**SFX:** Shader section gets an ambient wash — airy, reverbed, almost vocal. Terminal section adds soft digital chirps on each checkmark. Progress bar gets a rising tone. Completion — satisfying lock/latch click.

**Camera:** Static. The shader moves. The terminal builds. The frame is a window.

---

### BEAT 3C — LOTTIE, CAPTIONS, TEMPLATES (0:20–0:25)

**VO:** "Lottie. Captions. Word-synced."

**Keyframe ref:** `kf03c-lottie-captions.html`

**Concept:** Three glass panels side by side. Each showcases a different Hyperframes capability with a live visual demonstration. The triptych format lets us cover three features in 5 seconds without rushing any of them.

**Visual sequence:**

0:20 — Hard cut. Three panels appear simultaneously, each 540px wide with glass-like backdrop-filter and a distinct accent color.

**Left panel — LOTTIE (green #00DDAA):**
- Animated bell icon (dome, handle, clapper swinging)
- Expanding ring waves radiating outward
- JSON code overlay showing Lottie format structure: `"op": 140, "fr": 30, "layers": [...]`
- Comment: `// GSAP-driven: proxy.frame 0→140`
- Header: "LOTTIE ANIMATIONS"

**Center panel — CAPTIONS (amber #FFB446):**
- Fake video frame with speaker silhouette
- Word-synced caption overlay: "Your code **renders** to video" — the active word highlighted
- 120-bar waveform visualization pulsing below the video frame
- Transcript sidebar with timestamped lines (00:01, 00:03, 00:05...)
- Header: "CAPTIONS + WORD SYNC"

**Right panel — TEMPLATES (purple #CC00FF):**
- Three template cards stacked: product-launch, swiss-grid, dev-demo
- Each card has a mini visual preview, name, description, and init command
- `npx hyperframes init --template <name>` at bottom of each
- Header: "TEMPLATES + REGISTRY"

0:20–0:25 — Each panel's internal animations run continuously. The bell swings, the waveform pulses, the caption words highlight in sequence. The panels don't build in — they're alive from frame one.

**SFX:** Three-tone chord — each panel gets a frequency. Low hum (Lottie), mid tone (Captions), high shimmer (Templates). They harmonize.

**Camera:** Static. The three-column layout IS the composition.

---

### BEAT 4 — DEPLOY / CTA (0:25–0:30)

**VO:** "One command to install. One slash command to create. [pause] Your agent makes videos now."

**Keyframe ref:** `kf04-deploy.html`

**Concept:** The capabilities section ends. We pull back to the partnership — Hyperframes × Hermes. This is the closer. Warm radial burst, dual branding, clear call to action. The energy shifts from proving capability to inviting action.

**Visual sequence:**

0:25 — Hard cut. Dark field with a warm radial burst growing from center — amber/gold core fading through purple to deep blue at edges. Slowly rotating conic ray lines add subtle texture. 100+ noise particles in 6 colors drift across the field.

0:25–0:26 — Dual logo lockup fades in center-screen:
- Left: Hyperframes icon (amber `</>` in rounded square, warm glow, chromatic aberration ring)
- Center: `×` separator
- Right: Nous Research icon (blue "NOUS / RESEARCH" in rounded square, cool glow)
- Below: "HYPERFRAMES" (amber) and "HERMES AGENT" (blue) labels

0:26–0:28 — On "One command to install" — the install command types itself out below the logos:
`$ hermes skills install hyperframes`
Green terminal styling. Cursor blink. The command IS the CTA.

0:28–0:29 — On "One slash command to create" — below the install line:
`/hyperframes create a product launch video`
Amber slash command, white natural language. Shows the user exactly what using this looks like.

0:29–0:30 — On "Your agent makes videos now." — Bottom meta appears:
- `OPEN SOURCE • MIT LICENSE • AGENTSKILLS.IO` in phosphor green
- `WORKS WITH 35+ AGENTS • CLAUDE CODE • COPILOT • CURSOR • GEMINI CLI` in dim white
- Hold for 1.5s. Let it land.

**SFX:** The drone drops to near-silence at the cut. A single sustained warm tone rises slowly under the logos. On the final line — the tone resolves to a clean harmonic and decays. Silence before the video ends.

**Camera:** Static. Centered. Symmetric. This frame should feel like a poster.

---

## Timing Summary

| Time | Beat | Duration | VO |
|------|------|----------|-----|
| 0:00–0:07 | KF01 — Boot | 7s | "Hermes has learned a new skill." |
| 0:07–0:09 | KF02 — Binary Break | 2s | (silence) |
| 0:09–0:14 | KF03-A — GSAP Grid | 5s | "Hyperframes. Open source. HTML to video. GSAP timelines." |
| 0:14–0:20 | KF03-B — Shaders + Render | 6s | "WebGL shaders. Every frame rendered. Deterministic. Identical. Every time." |
| 0:20–0:25 | KF03-C — Lottie/Captions/Templates | 5s | "Lottie. Captions. Word-synced." |
| 0:25–0:30 | KF04 — Deploy/CTA | 5s | "One command to install. One slash command to create. Your agent makes videos now." |

**Total: ~30 seconds**

---

## Production Notes

### ElevenLabs VO Generation
1. Use a female voice with low register — Rachel / Freya / similar
2. Settings: Stability 0.45, Similarity 0.70, Style 0.25
3. Generate each sentence separately with silence padding between them
4. Stitch in post or generate as a single take with explicit `[pause]` markers
5. Target ~110 WPM — this script should feel slow, deliberate, weighty
6. Export as WAV 48kHz for maximum quality, convert to MP3 for Hyperframes

### SFX Design
- CRT hum: constant low-frequency baseline across entire video
- Transition hits: sub-bass + distortion on beat changes
- UI sounds: digital chirps, analog clicks, bit-crushed pings
- Keep SFX mono or narrow stereo — should feel like it's coming from the monitor

### Render Settings
- `npx hyperframes render --output renders/hermes-hyperframes.mp4`
- 1920×1080, 30fps, H.264
- Total frames: ~900

### Assets Needed
- ElevenLabs VO audio file → `assets/vo.mp3`
- SFX/underscore → `assets/underscore.mp3` (or composed in Hyperframes)
- Fonts: VT323, IBM Plex Mono (Google Fonts, loaded per-composition)
- No external images or video footage required — everything is code-generated
