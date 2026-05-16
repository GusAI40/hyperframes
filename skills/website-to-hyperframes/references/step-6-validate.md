# Step 6: Validate & Deliver

This is the quality gate. Before the user sees anything, YOU verify that the video matches the storyboard, the creative direction from Step 2, and DESIGN.md. Deliver something you'd be proud to post with your name on it.

## Lint + Validate + Snapshot

The `hyperframes` skill (which you loaded in Step 5) already covers the mechanics of linting, validating, and snapshotting. Follow those rules — run lint, validate, take snapshots scaled to the video length (formula: `max(beats × 3, ceil(duration_seconds / 2))`). Fix errors. This step adds the **pipeline-specific verification** on top of that.

**Errors:** Fix ALL of them. These are real problems — missing timeline registration, broken scripts, missing assets.

**Warnings:** Read each one and decide. Some are real quality issues you must fix:

- **GSAP tween overlaps** — elements fighting over the same property = visual glitches
- **Unscoped selectors** — will target elements in ALL compositions when bundled, causing data loss
- **Missing `class="clip"`** — element visible for entire video instead of its scheduled time
- **Missing `data-start` on root** — playback won't begin

Some are style suggestions you can safely ignore:

- **File too large** — composition works fine, just harder to read
- **Deprecated attributes** (data-layer, data-end) — still work, just not preferred
- **Dense tracks** — informational, not a bug

Don't blindly ignore 158 warnings. Don't blindly fix all of them either. Read them.

## Visual Verification (snapshot)

After lint and validate pass, capture snapshot frames to SEE your own output. **Take many snapshots — as much as you can actually read and view all of them without hitting diminishing returns**. This is your only visual feedback before the user sees the project. You wanna be honored and proud of what you give to the user.

Scale snapshot count to the video — not a fixed number. Formula: `max(beats × 3, ceil(duration_seconds / 2))`. A 3-beat 10s video: max(9, 5) = 9 frames. An 8-beat 60s video: max(24, 30) = 30 frames. Aim for at least 3 frames per beat: entrance, hold, and near-exit.

**⚠ NEVER use `npx hyperframes snapshot`.** The published CLI (0.6.6) is missing critical fixes: sub-comps load before capturing, local-time seek for last beats, Gemini vision descriptions. Always use the local CLI below or all beats after the first may appear black and descriptions.md won't be generated.

```bash
# Standard snapshot — Gemini vision runs automatically if GEMINI_API_KEY is set:
npx tsx packages/cli/src/cli.ts snapshot <project-dir> --frames <N>

# Pass a custom question to Gemini instead of the default prompt:
npx tsx packages/cli/src/cli.ts snapshot <project-dir> --frames <N> \
  --describe "Is the brand logo visible in every beat? Is any beat showing a black or blank frame?"
```

Output lands in `<project-dir>/snapshots/`. Gemini writes `snapshots/descriptions.md` automatically.

**Two required reads — both, not one:**

1. **Read `snapshots/descriptions.md`** — Gemini's objective written analysis of every frame. Any description mentioning "black frame", "blank screen", or "loading overlay" for a content beat is a bug. Compare each line against the storyboard beat spec for that timestamp.

2. **View `snapshots/contact-sheet.jpg`** — the full grid view. The descriptions tell you what to look for; the contact sheet lets you see it.

Fix every issue you find before continuing — re-snapshot after fixing to confirm the fix.

## Critic Sub-Agent (required before preview)

After reviewing descriptions and contact sheet, spawn a sub-agent with this exact prompt:

```
You are a senior motion designer and creative director reviewing a brand video before it ships to a client. You've seen hundreds of these. You have high standards.

Read these files:
- STORYBOARD.md (what was planned)
- DESIGN.md (brand rules)
- snapshots/descriptions.md (what Gemini sees in each frame)
- snapshots/contact-sheet.jpg (view it)

Then give honest, specific, constructive feedback:
1. What's working well? (be specific — name the beat and what's strong about it)
2. What's not working? (name exact beats, describe the specific problem)
3. What's the single biggest quality gap between what was planned and what was built?
4. Brand accuracy: does this video feel like it was made FOR THIS BRAND, or could it be for any brand?
5. What would you fix if you had 15 more minutes?

Be honest. Don't soften real problems. Don't be harsh for the sake of it. Think like someone who wants this video to be genuinely good, not just technically complete.
```

Read the critic's assessment carefully. Fix the issues they flag before showing the user anything.

## Preview (always do this)

Always start the preview so the user can see and scrub through the project:

```bash
npx hyperframes preview
```

The Studio URL is the deliverable. In your final response, always include it:

```text
http://localhost:<port>/#project/<project-name>
```

Use the actual port and project name from the preview command output. Do NOT present `index.html` as the project link — that's the source file. The user-facing project is the running Studio preview.

## Render (on-demand only)

**Do NOT render automatically.** Preview is the delivery — the user scrubs, spots tweaks, and you iterate. Rendering takes minutes per pass and is wasted if the user wants changes.

Only render when the user **explicitly asks** — "render it", "make the final", "export the MP4", "I'm happy, produce the file."

When rendering, **always specify quality and resolution explicitly.** Don't use defaults silently — pick the right settings for the use case and tell the user what you're rendering:

```bash
# Standard quality, 1080p landscape (default for most videos)
npx hyperframes render --output renders/<name>.mp4 --quality standard --fps 30

# High quality for final delivery
npx hyperframes render --output renders/<name>.mp4 --quality high --fps 30

# Portrait for Instagram Stories / TikTok
npx hyperframes render --output renders/<name>.mp4 --quality standard --fps 30 --resolution portrait

# 4K for premium output
npx hyperframes render --output renders/<name>.mp4 --quality high --fps 30 --resolution 4k
```

**Available options:**

| Flag              | Values                                                                                     | Notes                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `--quality`       | `draft`, `standard`, `high`                                                                | draft = fast/low, standard = balanced, high = slow/best                            |
| `--fps`           | `24`, `30`, `60`                                                                           | 30 is standard, 24 for cinematic feel, 60 for smooth motion                        |
| `--resolution`    | `landscape` (1920×1080), `portrait` (1080×1920), `landscape-4k` (3840×2160), `portrait-4k` | Aliases: `1080p`, `4k`, `uhd`                                                      |
| `--format`        | `mp4`, `webm`, `mov`, `png-sequence`                                                       | mp4 default. mov/webm for transparency. png-sequence for AE/Nuke                   |
| `--output`        | path                                                                                       | Always set to `renders/<project-name>.mp4` for readable names                      |
| `--gpu`           | flag                                                                                       | Use GPU encoding if available (faster)                                             |
| `--crf`           | integer                                                                                    | Override encoder quality (lower = better, mutually exclusive with --video-bitrate) |
| `--video-bitrate` | e.g. `10M`                                                                                 | Target bitrate (mutually exclusive with --crf)                                     |

Tell the user what you're rendering and why: "Rendering at standard quality, 1080p landscape, 30fps — this gives good quality with reasonable render time. Want me to use high quality or 4K instead?"
