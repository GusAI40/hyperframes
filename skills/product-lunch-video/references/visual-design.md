# Visual design — product-launch per-frame enrichment method

> The method behind **Step 4 (Frame visual design)**. You (the orchestrator) read it to **enrich `STORYBOARD.md` frames in place** — story-design wrote the skeleton (each frame's `scene`, `voiceover`, `transition_in`, the five narrative fields, and its `asset_candidates`); you add how each frame **looks and moves**. You write **no HTML** (that's the frame workers), you **never read `capture/`** (story already chose the assets), and you do **not** select assets or name transitions (story owns both). `frame.md` is your palette/type truth. Composition / motion detail lives in `composition.md` + `motion-language.md`; effect & blueprint **bodies** live in `hyperframes-animation`. Adding palette theory or a generic font rule here? Wrong home — `frame.md` + `hyperframes-creative`.

## What you add to each frame

Story-design's `## Frame N` block already carries the narrative. You append the visual layer as frame metadata + one composition note (story's role/message prose stays):

```
## Frame 3 — The problem
- scene: a 20-minute timer spins on a stack of rejected takes   ← refine only if it could read sharper
- voiceover: "…"            ← story's; leave it
- transition_in: crossfade  ← story's; leave it
- type: pain_point          ← story's
- persuasion: Pain agitation
- beat: frustration
- effects: slow-push, vignette-pulse        ← you add: cite effect ids
- blueprint: messaging-multi-phrase         ← you add (optional): one multi-phase blueprint id
- focal: public/timer-stack.png             ← you add: which existing candidate is the hero
- roles: timer-stack = background (dim ~40%) ← you add: cutout / background / supporting per candidate
- sfx: impact-soft, riser                    ← you add: the sound the beat wants (fetched + mounted at root; never yours to embed)

A dense, edge-anchored frame: timer pinned upper-left, the rejected-takes stack growing toward the band.
```

- **`effects`** — name atomic effect **ids** from `hyperframes-animation`'s rules index. **Cite ≥3 when you name no `blueprint`** (the worker free-composes them into the beat; fewer than 3 reads as generic motion); 1+ as accents when a blueprint already carries the choreography. The names are a shared vocabulary; the recipe lives there — you cite, the worker **reads the body and reproduces it** (not a name-guess).
- **`blueprint`** — name **one** multi-phase blueprint id from `hyperframes-animation/blueprints-index.md` when a frame matches one (multi-phase reveal, orbit-collapse, …); the worker reads its body and **reproduces the phases faithfully**, so write the frame's composition note shot-by-shot to match (below). Omit it when no blueprint fits — then the `effects` (≥3) carry the motion.
- **`focal` / `roles`** — story listed `asset_candidates`; you pick the **focal** hero and each candidate's role (`cutout` = foreground subject, lay text around it; `background` = full-bleed, dim 30-50%; supporting = secondary). You **consume** the candidates — never add, swap, or drop one (coverage is story's call; if a frame truly has the wrong candidates, flag it back, don't reach into `capture/`).
- **`sfx`** — name the sound the beat wants (an impact for a slam, a whoosh for a push). The audio script's `fetch-sfx` pass retrieves it from HeyGen and the assembler mounts it at the root — you only **name** it, never embed an `<audio>` element.
- **composition note** — the frame's visual brief: layout, hero, depth layers, the one macro move. One line is enough for a single-shot frame. **When the beat is multi-phase — especially when you named a `blueprint` — write it shot-by-shot** (`shot 1: … → shot 2: … → shot 3: …`), each shot naming what's on screen and when it fires, so the worker reproduces the choreography instead of flattening it to one move. Full method → `composition.md`.

## Video direction — write the invariants ONCE

The whole video shares one look and one motion grammar. State it **once**, at the top of `STORYBOARD.md` (a `## Video direction` block), so every frame inherits it and per-frame metadata carries only the **delta**:

- **palette system** — from `frame.md`: which roles map to which hues. Never invent.
- **motion defaults + budget** — default eases + the per-frame motion budget (→ `motion-language.md`).
- **negative list** — what never appears (effects the pack forbids, off-brand textures, …).
- **stillness allocation** — name the 2-3 frames that hold still before a climax (the anti-repetition discipline; → `motion-language.md`).

Do **not** repeat these in every frame — restating video-level rules per frame is exactly the bloat this layer prevents. Each frame's metadata is the delta on top of Video direction.

## Palette & type — from `frame.md`, never invented

- **Palette** — `frame.md` (the adopted pack) is the color truth; apply its roles per frame. Generic basics (one accent, tint neutrals, avoid pure `#000`/`#fff`) → `hyperframes-creative/references/house-style.md`.
- **Type** — fonts resolve via `frame.md`'s type tokens; reference them **by role** (display / body / mono / the pack's ramp), never by raw family or px. Generic typography craft (embedded fonts, dark-bg optical compensation, `tabular-nums`) → `hyperframes-creative/references/typography.md`.

## Caption-band keep-out (plan side)

The bottom ~17% of the canvas is reserved for the caption pill. Plan every frame's content into the **top ~83%** so nothing important lands in the band (the worker enforces the pixel cutoff; you plan the layout). Holds even when captions are disabled — bottom-edge consistency. Geometry detail → `composition.md`.

## Where the detail lives

| For…                                                                        | Read                                                                                         |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| composition — zones, density, templates, asset prominence, caption geometry | `composition.md` (local)                                                                     |
| motion — budget, beat structure, stillness, eases                           | `motion-language.md` (local)                                                                 |
| effect ids + blueprint ids (vocabulary + recipes)                           | `../hyperframes-animation/blueprints-index.md` + `../hyperframes-animation/rules-index.md`   |
| palette + type tokens                                                       | the project's `frame.md`; basics → `hyperframes-creative` `house-style.md` / `typography.md` |
| "produced, not generated" foreground density                                | `hyperframes-creative/references/video-composition.md`                                       |
| transitions                                                                 | story-design owns `transition_in`; you don't touch it                                        |

## Before you finish — checklist

- Every frame has `effects` (≥1 cited id; **≥3 when no `blueprint` is named**); a `blueprint` where the frame matches one, with a shot-by-shot composition note.
- Each visual frame's `asset_candidates` have a `focal` + per-candidate `roles`; none added or dropped.
- **Video direction** stated once at the top; per-frame entries are deltas, not restatements.
- Content planned into the top ~83% (caption band clear).
- Palette / type pulled from `frame.md` by role — nothing invented.
- You wrote no HTML and never read `capture/`.
