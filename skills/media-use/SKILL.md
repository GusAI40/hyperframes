---
name: media-use
description: Agent Media OS — resolve any media need (BGM, SFX, voice, image, icon, brand asset) into a frozen local file + ledger record. One verb (`resolve`) handles the full cascade: project cache, global cache, provider search, generation fallback, freeze, register. Keeps search noise on disk, hands the agent a path. Use when a composition needs audio, images, icons, or brand assets.
---

# media-use

Resolve media needs into frozen local files. One verb, all types, zero context noise.

## Quick start

```bash
node <SKILL_DIR>/scripts/resolve.mjs --type bgm --intent "subtle confident tech" --project .
# → resolved bgm_001 → .media/audio/bgm/bgm_001.wav (bgm, 11s)
```

## Supported types

| Type    | What it finds       | Search provider      | Fallback                    |
| ------- | ------------------- | -------------------- | --------------------------- |
| `bgm`   | Background music    | HeyGen audio catalog | hyperframes bgm (local gen) |
| `sfx`   | Sound effects       | HeyGen audio catalog | Bundled SFX library         |
| `voice` | TTS voiceover       | HeyGen voice         | hyperframes tts (Kokoro)    |
| `image` | Photos, backgrounds | HeyGen asset search  | Agent-selected URL          |
| `icon`  | Icons, logos        | HeyGen asset search  | Agent-selected URL          |
| `brand` | Brand kit assets    | HeyGen brand kits    | —                           |

## How it works

1. Check project `.media/manifest.jsonl` for exact-prompt match
2. Check global cache `~/.media/` for reusable asset
3. Search via provider (HeyGen catalog, asset search, brand kits)
4. Fall back to generation (local BGM/TTS) or agent-selected URL
5. Freeze file to `.media/<type>/`, register in manifest, regenerate `index.md`

The agent gets back **one line**. Candidates, scores, provenance stay on disk.

## Files

- `.media/manifest.jsonl` — machine SSOT, one JSON record per line
- `.media/index.md` — agent-readable table (id, type, dur, dims, path, description)
- `~/.media/` — global cross-project reuse cache (content-addressed, SHA-256)

## References

- `references/resolve-types.md` — per-type provider chains and manifest fields
- `references/manifest-schema.md` — JSONL record schema and index format
