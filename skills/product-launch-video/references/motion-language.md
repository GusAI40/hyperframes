# Motion language — product-launch visual-design judgment

> The motion-judgment layer for **Step 4 (Visual design)**. You name **spring intent, beat rhythm, holds, the per-frame motion budget, and stillness** while enriching `STORYBOARD.md` frames; the **frame worker** maps intent to concrete GSAP eases / ms / stagger / code (via `hyperframes-animation`). A good promo feels like one continuous whole — consistent ease intent, rhythmic timing, one spring feel — not a pile of animated slides. You reference motion by **role**, never by curve: eases / durations resolve from `frame.md`'s motion tokens, named `entry` / `emphasis` / `exit` / `drift` (the pack's exact keys may differ); the worker maps the curve. Between-frame **transitions are not yours** — story names `transition_in`, the harness injects it.

## Spring intent (by role, not curve)

| Intent     | Feel                                        | Use                                               |
| ---------- | ------------------------------------------- | ------------------------------------------------- |
| **entry**  | confident slight overshoot, settles quickly | primary element entry (default)                   |
| **gentle** | soft slide-in, no overshoot                 | background elements, subtle motion                |
| **snappy** | tight overshoot, nearly instant             | UI elements, small icons, buttons                 |
| **heavy**  | weighted deceleration                       | large images, prototype screenshots, hero visuals |
| **slam**   | bouncy overshoot, intentionally loud        | logo / bell / impact moments                      |

**Consistency:** similar elements share one intent (all icons `snappy`, all hero images `heavy`). Don't invent a unique ease + duration per element.

**Forbidden:** `bounce.out` / `elastic.out` (dated; real objects decelerate, they don't bounce — low overshoot for `entry` is fine, high overshoot only for clearly playful moments); a unique ease+duration per element (visual noise).

## Duration intent

Reference by **tier** ("instant feedback" / "state change" / "layout change" / "entry animation"); the worker maps concrete ms / frames at 30fps. **A single entry should not exceed ~800ms** — for a longer buildup, use multi-element stagger, not one long tween.

**Exit ≈ 75% of entry** — arrival deliberate, departure swift but not abrupt. Too fast → flash; equal to entry → sluggish, blocks the next frame. (The cut-the-curve transition deliberately reverses this, but that's the harness's transition, not your within-frame motion.)

## Stagger cap

When staggering N elements, **total ≤ 500ms** (longer feels dragged):

- **3-7 elements** — normal stagger, total 300-700ms.
- **8+ elements** — tighten per-item delay, or stagger only the first few and enter the rest with the last.
- Never let stagger run past 500ms.

## Beat structure (core tool)

Rhythmic videos breathe: tension → release → tension → release. A clean reference shape for a ~46s video:

| Phase          | Duration | Rhythm             | Frame type                         |
| -------------- | -------- | ------------------ | ---------------------------------- |
| Slow setup     | 6-10s    | slow build         | hero establish, VO not yet present |
| Fast montage   | 6-10s    | ~2s each           | quick cuts every 1.5-2s            |
| Process reveal | 12-18s   | continuous, no cut | screen recording, real workflow    |
| Closure        | 3-5s     | still, breathable  | logo, URL, CTA                     |

Allocate motion by a frame's energy: **high-energy** (hook, CTA) → faster entry, tighter stagger, `snappy`; **breathable** (brand reveal, emotional beat) → slower entry, `gentle`, longer hold; **data** (stat, feature) → medium rhythm, clean stagger, count-up.

## Hold time

After an element enters it must hold long enough to read (the worker maps concrete frames):

| Content                              | Minimum hold |
| ------------------------------------ | ------------ |
| display text (1-3 words)             | ~1s          |
| short sentence                       | ~1.5s        |
| data / statistic                     | ~1.5s        |
| product screenshot                   | ~2s          |
| complex visual (diagram, comparison) | ~2.5s        |
| hero / climax word                   | ~1-1.4s      |

Narration shorter than the needed hold → the frame's `duration` should still give the visual its read time.

## "Stillness before climax" beat

Archive signature: a **0.3-0.75s pause** between the major action and its confirmation / result — the silence builds tension before the landing. **Allocate it to only 2-3 frames per video, named in the `## Video direction` block**, where the narration lands a payoff. Stamped on every frame it stops being a comma and becomes a tic, flattening the rhythm. Name `stillness-before-climax` in that frame's motion note; an allocated frame that jumps straight from action to result loses the comma, a non-allocated frame that adds one dilutes it.

## Motion budget — one macro move, few live elements

A real camera gives **globally correlated** motion: the lens drifts and every layer moves together, differentiated by depth — viewers read that as _someone is filming this_; many small independent motions read as _UI animation / screensaver_. So the unit of "aliveness" is the **frame**, not the element. Per frame:

1. **ONE macro motion (required)** — a camera-style move on the frame root: slow drift, dolly in/out, push, parallax pan. This alone keeps everything moving coherently for the whole beat.
2. **At most 1-2 secondary live elements** — on the elements that carry the beat (hero, CTA).
3. **Everything else rests.** Stillness is a tool — "one element moving vs all else static" is a strong hierarchy contrast; if everything moves, motion stops carrying information. Prefer macro move + depth parallax over many independent floats.

Secondary-slot menu (formulas are the worker's): **multiplicative breathing** (hero image — small ±2-5% on final scale, not yoyo) · **glow pulse** (CTA / click target) · **sine float** (one decorative cluster at most) · **rotational drift** (3D cards, hero logo) · **orbit** (surrounding icons; counts as the one decorative cluster) · **halftone breathing** (atmospheric frames).

Multiplicative breathing is the signature for a hero **that holds a live slot** — not stamped on every hero. **Forbid yoyo** (it overwrites entry scale). **Minimum amplitude ±6px or ±2-5% scale** — a 3px micro-float doesn't count; the budget caps how many things move, it doesn't license invisible motion.

## Motion note example

> "Macro: slow dolly-in on the frame root across the whole beat. Hero enters `EASE.entry` (heavy) → icons enter snappy-stagger (5 items, ~400ms) then rest → **stillness-before-climax 0.6s** (allocated frame; only the dolly continues) → result emphasis: text gentle entry + double-layer glow → idle hold, hero breathing ±3% as the one live element."

One line per frame; never concrete ease curves / ms / stagger formulas / JS (the worker writes those).
