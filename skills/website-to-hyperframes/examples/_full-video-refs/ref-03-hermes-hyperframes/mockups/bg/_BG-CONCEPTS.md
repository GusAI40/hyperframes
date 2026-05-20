# Background Aesthetic Plan — Hermes × Hyperframes

Source vocabulary: [NousResearch/hermes-agent — `skills/creative/ascii-video`](https://github.com/NousResearch/hermes-agent/tree/main/skills/creative/ascii-video).

The skill is a Python ASCII video pipeline; we are translating its **visual vocabulary** (character palettes, value field effects, color systems, shader moods) into Hyperframes-compatible HTML/Canvas backgrounds. Every scene must feel like the same video — but every scene must look different.

---

## Cohesion rules (apply to every scene)

- **One engine:** every scene uses `vf_domain_warp(fbm)` as the underlying value field. Per-scene differentiation comes from color ramp, character palette, warp parameters (frequency / warp strength / temporal speed), and additive event layers — not from completely different effects. This produces a unified "shape language" across 30s.
- **Density:** full-screen ASCII presence. Render every cell where the value field exceeds a low threshold (~0.16). Never sparse, never flat-black zones.
- **Type world:** VT323 (terminal/system) + IBM Plex Mono (labels/hero). No sans-serif, ever.
- **Ground truth:** black `#000`. No flat color backgrounds.
- **Always-on overlays:** scanlines @ 12% black opacity (2-3px repeat), CRT vignette (35→100% radial), color-bleed bars top/bottom (1-3px gradients).
- **Hero text:** 2–4px chromatic aberration (red/blue channel offset).
- **Motion grammar:** continuous flowing warp evolution + per-scene event layer (scan-pulse / slice tear / hue cycle / spark drift).

---

## Master palette (the warm→cool thermal arc)

| Token | Hex | OKLCH | Role |
|-------|-----|-------|------|
| `amber` | `#FFD080` | L 0.86 C 0.10 H 0.18 | Hermes/Hyperframes brand anchor |
| `amber-deep` | `#FF6B3D` | L 0.66 C 0.18 H 0.07 | Warm low |
| `phosphor` | `#33FF77` | L 0.86 C 0.21 H 0.40 | Terminal accent |
| `cyan` | `#66DDFF` | L 0.85 C 0.10 H 0.65 | Cool counter |
| `nous-blue` | `#4A88FF` | L 0.65 C 0.16 H 0.74 | Nous brand |
| `magenta` | `#CC44FF` | L 0.62 C 0.22 H 0.88 | Psychedelic accent (sparingly) |
| `bone` | `#F0E8D0` | L 0.93 C 0.03 H 0.20 | Hot highlight |

The 30-second video traces a thermal journey through these: mono-amber → white-hot break → polychromatic lattice → molten teal/amber → triadic split → warm partnership.

---

## Per-scene specifications

All six share the same `vf_domain_warp(fbm)` engine; the table below is what differs.

| Scene | File | Color ramp | Char palette | Warp params (FREQ / WARP / SP) | Event layer |
|-------|------|-----------|--------------|-------------------------------|-------------|
| BG-01 Boot | `bg-01-boot-data-field.html` | mono-amber: `#180E04` → `#783410` → `#FFB446` → `#FFEC C8` | block ramp + sparse hex digits | 0.038 / 10 / 0.16 (calm) | 3 phosphor-green scan-pulse waves rolling top→bottom at varied rates |
| BG-02 Break | `bg-02-binary-break-collapse.html` | white-hot center → red/blue chromatic split → polychrome aberrant edges | binary 0/1 + dense blocks + hex peaks | 0.050 / 22 / 0.85 (violent) | 5–8 horizontal slice-tears (`getImageData` displacement) + radial shockwave + occasional full-frame flash |
| BG-03A GSAP | `bg-03a-gsap-voronoi-lattice.html` | OKLCH-uniform rainbow, hue = angle-from-center + warp + slow time | block elements + quadrant blocks `▙▟▛▜` | 0.040 / 14 / 0.22 (medium) | none — the rainbow + flowing warp IS the spectacle |
| BG-03B Shader | `bg-03b-shader-domain-warp.html` | OKLAB-ish 4-stop: `#002A44` (deep teal) → `#B6546C` (plum bridge) → `#FFB260` (amber) → `#FFECC8` (bone) | halffill `◔◐◒◕◑` + dense ramp | 0.045 / 14 / 0.18 (medium) | sparse hex strings drifting horizontally (diagnostic feel) |
| BG-03C Triadic | `bg-03c-triptych-fields.html` | triadic anchors (green `#00DDAA` / amber `#FFB446` / magenta `#CC00FF`) selected by an independent secondary fbm hue field | halffill + dots + dense ramp | 0.038 / 16 / 0.18 (medium) | three hue clusters flow through each other organically; no event |
| BG-04 Deploy | `bg-04-deploy-warm-closer.html` | earth ramp: `#1A0C04` (umber) → `#6E3412` (rust) → `#E68C37` (amber) → `#FFC880` (gold) → `#FFECC8` (bone), radially center-biased | block ramp | 0.024 / 18 / 0.07 (very slow) | upper-third cool-blue Nous wedge + 70 golden sparks drifting upward + sparse blue dot pulses |

### Scene-by-scene rationale

**BG-01 (Boot):** boot text already carries the narrative; the bg must read as "system computing at scale" without competing. Dense amber field with 3 rolling phosphor-green scan-pulse rows = visualization of a CPU clock pulse touring memory. Hex digits scattered through the block ramp give "register/memory address" semantics.

**BG-02 (Break):** 2-second visceral shock cut. Same warp engine but velocity ×4 and warp strength ×1.5. Slice tears physically displace strips of the canvas every frame. Full-frame flashes punch through. Binary 0/1 palette + chromatic-split coloring = "information destroyed and reconstituted."

**BG-03A (GSAP grid):** the 24-cell foreground demands a polychromatic ground that doesn't compete. Hue mapped from angle-from-center produces an OKLCH-uniform rainbow wheel in the warp blobs — as the grid above shows 24 simultaneous animations, the bg shows a continuous rainbow of those same flowing shapes.

**BG-03B (Shader):** the canonical Inigo Quilez domain-warp shader rendered AS ASCII = meta-proof of the scene's claim ("WebGL shaders. Every frame rendered."). The 4-stop ramp goes through plum to avoid the muddy mid-hues a direct teal→amber lerp would produce.

**BG-03C (Triadic field):** dropping the literal 3-column division — instead a single field where green/amber/magenta clusters flow through each other via an independent secondary fbm hue selector. Triadic 120° spacing produces three perceptually balanced color domains that mix organically.

**BG-04 (Deploy):** warp parameters slowed dramatically (FREQ 0.024, SP 0.07) so shapes are big and breathing, not flowing. Radial center-bias + earth ramp produces a glowing horizon. Cool-blue wedge in upper-third visually encodes the Hyperframes/Nous partnership. Golden sparks drift upward like embers — "your agent makes videos now" lands warm, not cold.

---

## File map

```
mockups/bg/
├── _BG-CONCEPTS.md              ← this file
├── _contact-sheet.html          ← all 6 in iframes side-by-side
├── bg-01-boot-data-field.html
├── bg-02-binary-break-collapse.html
├── bg-03a-gsap-voronoi-lattice.html
├── bg-03b-shader-domain-warp.html
├── bg-03c-triptych-fields.html
└── bg-04-deploy-warm-closer.html
```

Each mockup is a standalone HTML file using requestAnimationFrame for preview. When promoted into compositions, the rAF loops will be rewritten as GSAP-proxy tweens for deterministic frame capture (per the `master-timeline-no-pad` and Hyperframes runtime conventions in the project handoff).
