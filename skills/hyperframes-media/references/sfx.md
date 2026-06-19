# Sound effects (SFX)

Named sound effects **retrieved** from HeyGen's audio library (`/v3/audio/sounds`, `type=sound_effects`) — search-and-download, **not generation**. Same `~/.heygen` / `$HEYGEN_API_KEY` credential as `tts`. There is no `hyperframes sfx` CLI command; SFX runs through a self-contained script (reference impl: the product-launch workflow's `scripts/audio.mjs` `fetch-sfx` mode; HeyGen client in its `scripts/lib/heygen.mjs`).

## How retrieval works

`searchSounds(name, "sound_effects", { limit })` → `GET /audio/sounds?query=<name>&type=sound_effects&limit=<n>`. Results are ranked by `score` (best first); each item carries a presigned `audio_url`, plus `duration`, `description`, `score`. Download the top hit.

## Flow — per-frame named cues

1. Each scene/frame names the SFX it wants — a comma-separated `sfx` field (e.g. `sfx: whoosh, ui click`). One search per name.
2. For each name: search `sound_effects`, take the top result, download to `assets/sfx/<slug>.mp3` (slugified name). Dedupe repeats by `frame:name` — the same name reused downloads once.
3. Write one cue per downloaded effect into `audio_meta.json` → `sfx[]`.

## Cue shape (`audio_meta.json` → `sfx[]`)

```jsonc
{
  "frame": 3, // which scene the cue fires in
  "file": "assets/sfx/whoosh.mp3", // downloaded asset, relative to project root
  "offset_s": 0, // delay from the scene's start
  "duration_s": 1.0, // from the result's `duration`, else 1.0
  "volume": 0.35, // SFX sit UNDER voice + BGM
}
```

## Rules

- **Volume ~0.35.** SFX must sit under narration and BGM, not fight them.
- **No match → skip, don't fail.** A missing effect logs and moves on; it is never a render blocker.
- **Retrieval, not generation.** You search a fixed library by text — name the effect concretely (`glass shatter`, not `dramatic sound`); a vague query returns a poor match.
- **One asset per distinct name.** Reuse across frames is deduped to a single download, many cues.
