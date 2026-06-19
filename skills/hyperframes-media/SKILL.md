---
name: hyperframes-media
description: Audio and media assets for HyperFrames compositions — multi-provider TTS (HeyGen / ElevenLabs / Kokoro local), background music + sound effects retrieved from the HeyGen audio library (local Lyria / MusicGen as a BGM alternative), Whisper transcription, background removal, and caption authoring. Use for voiceover / TTS, BGM, SFX / sound effects, transcription, captions / subtitles / lyrics / karaoke / per-word styling, voice + provider selection, and music-mood prompting.
---

# HyperFrames Media

Create the audio and media assets a composition needs — voiceover (TTS), background music + sound effects (HeyGen audio library), transcription, captions, background removal — then consume and animate that data in HTML. The `hyperframes` CLI ships `tts` / `transcribe` / `remove-background`; HeyGen TTS / BGM / SFX run through self-contained scripts (there is no `hyperframes bgm` or `hyperframes sfx` command). For placing assets into compositions, see `hyperframes-core`.

## Provider chains (auto-detected from env)

**TTS** — `npx hyperframes tts "..."` picks the first available provider:

| Order | Provider                      | Detected when                                | Word timestamps                                                  |
| ----- | ----------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| 1     | HeyGen (Starfish)             | `$HEYGEN_API_KEY` / `hyperframes auth login` | **Yes, native** — pass `--words narration.words.json` to capture |
| 2     | ElevenLabs                    | `$ELEVENLABS_API_KEY` set                    | No — chain `transcribe` after                                    |
| 3     | Kokoro-82M (local, 54 voices) | always (no key required)                     | No — chain `transcribe` after                                    |

> If the installed `hyperframes tts` is the local-only build (its `--help` says "Kokoro-82M" and has no `--provider`/`--words` flags), it silently falls back to Kokoro even with `$HEYGEN_API_KEY` set. To force HeyGen regardless of CLI version, use the self-contained `scripts/heygen-tts.mjs` (see `references/tts.md`).

**BGM & SFX** — **retrieved** from the HeyGen audio library (`/v3/audio/sounds` — retrieval, not generation), same credential as HeyGen TTS:

| Asset | `type`          | Lands in                | Cue in `audio_meta.json`           |
| ----- | --------------- | ----------------------- | ---------------------------------- |
| BGM   | `music`         | `assets/bgm/track.mp3`  | `bgm` — top track for a mood query |
| SFX   | `sound_effects` | `assets/sfx/<slug>.mp3` | `sfx[]` — per-frame named cues     |

Local BGM **generation** (Lyria / MusicGen) is an alternative — see `references/bgm.md`. SFX is retrieval-only.

## Routing

| Task                                                              | Read                                               |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| `npx hyperframes tts` — provider chain, voice IDs, words.json     | `references/tts.md`                                |
| HeyGen without the CLI — self-contained REST script (wav + words) | `scripts/heygen-tts.mjs` (see `references/tts.md`) |
| BGM — HeyGen music retrieval (mood) + local Lyria / MusicGen      | `references/bgm.md`                                |
| SFX — HeyGen sound-effects retrieval, per-frame named cues        | `references/sfx.md`                                |
| `npx hyperframes transcribe` — Whisper, model rules, output shape | `references/transcribe.md`                         |
| `npx hyperframes remove-background` — transparent cutouts         | `references/remove-background.md`                  |
| TTS → transcription → captions (no recorded voiceover)            | `references/tts-to-captions.md`                    |
| Caption authoring — style detection, layout, word grouping, exit  | `references/captions/authoring.md`                 |
| Transcript handling — input formats, quality gates, cleanup, APIs | `references/captions/transcript-handling.md`       |
| Caption motion — karaoke, marker effects, audio-reactive          | `references/captions/motion.md`                    |
| Model caches, system dependencies, troubleshooting                | `references/requirements.md`                       |

## Non-negotiable rules

- **Voice IDs are provider-specific.** `am_michael` is Kokoro-only; HeyGen UUIDs don't work on Kokoro. If you pass `--voice`, also pin `--provider` to avoid silent provider drift when the user's env changes.
- **Always pass `--model` to `transcribe`.** The CLI default `small.en` silently translates non-English audio. See `references/transcribe.md` → "Language Rule".
- **HeyGen returns word timestamps; ElevenLabs / Kokoro do not.** When you want captions, either pass `--words` to HeyGen and use that JSON directly, or run `transcribe` against the audio file. Don't assume word data is always there.
- **Captions consume the flat word-array format** with `{ id, text, start, end }`. See `references/transcribe.md` → "Output Shape".
- **`remove-background --background-output` is hole-cut, not inpainted.** For "scene without the person", a different tool is needed. See `references/remove-background.md` → "When NOT the right tool".
- **BGM & SFX are retrieved from a fixed library, not generated.** `/audio/sounds` ranks by a text query — name effects concretely (`glass shatter`, not `dramatic sound`); a no-match **skips**, never blocks the render. SFX sit at volume ~0.35 under voice + BGM. See `references/sfx.md`.
