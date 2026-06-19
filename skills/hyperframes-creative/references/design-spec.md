# Design Spec — `frame.md` / `design.md`

The single source of truth for **what a design spec is, how to find it, and how to read it.** Other references defer here for resolution + format; the _consumption_ contract ("brand, not layout") lives in `video-composition.md`.

## What `frame.md` is

`frame.md` is the **frame-scale design system** for a video / hyperframes project — the video-first companion to `design.md` (which is written for web / static pages). Same file format as `design.md`; it reframes the brand with the frame as the unit.

A spec is **YAML frontmatter + a markdown body**, and the two layers are not equal:

- **Frontmatter is the normative layer** — `colors`, `typography`, `spacing`, `components` are the real, machine-readable values. Quote them verbatim (exact hex, font family, weight); never invent or round them.
- **Prose is context** — the `##` sections (Overview, The Frame, Composition Rules, …) carry intent, when-to-use, and constraints the tokens can't hold. Read them for judgment, not for values.

## Resolving which spec to read

Precedence — read the **first that exists**, ignore the rest:

```
frame.md  →  design.md  →  DESIGN.md
```

```bash
SPEC=$(ls frame.md design.md DESIGN.md 2>/dev/null | head -1)
```

- `frame.md` is the preferred spec for video / hyperframes projects and wins when more than one exists.
- `frame.md` is **always lowercase** — there is no `FRAME.md` variant. (`design.md` and `DESIGN.md` are genuinely different files on Linux; a frame-preset ships an uppercase `FRAME.md` _template_, adopted as lowercase `frame.md` — see "Starting from a preset" below.)

Load the spec **once, in Step 1**; every later step (expansion, authoring, adherence) consumes the already-loaded spec rather than re-resolving it.

## Starting from a preset (optional)

Optionally seed `frame.md` from a ready-made **frame-preset** in `[../frame-presets/](../frame-presets/)` — a fixed set, each shipping a `FRAME.md` template a workflow's design step copies in and overlays with brand tokens. Referencing a preset is **not required**; a bespoke or [picker](design-picker.md)-generated spec is equally valid.

| Preset                                               | Look                                                                                                                                                                      | Pick when                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `[blockframe](../frame-presets/blockframe/FRAME.md)` | Maximalist neobrutalist — 4px black borders, 8px hard offset shadows, five candy pastels, Inter 800–900 uppercase, square corners, tilted decorations                     | bold / punchy / playful-loud; a product that wants to feel confident and graphic |
| `[capsule](../frame-presets/capsule/FRAME.md)`       | Playful editorial — every container a pill (2px ink outline), cream canvas, nine candy accents, Bodoni Moda + Space Grotesk, soft offset shadows, floating-pill wallpaper | friendly / soft / editorial; a product that wants warmth and approachability     |

Each preset folder also ships a `frame-showcase.html` — a preview contact sheet of its frame treatments; open it to _see_ the look, never include it in a project.

## Consuming it

How to apply the spec to a frame — strict on brand (hex, fonts, weight relationships, Do's / Don'ts), free on layout — is the consumption contract in `[video-composition.md](video-composition.md)` ("The Design Spec Is Brand, Not Layout"). Read it before choosing colors or writing HTML; this doc only covers finding and parsing the spec.
