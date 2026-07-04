# Maya Listing Launch Pack - Rendered Videos

## Output Files

| Format         | Use                         | Resolution | Duration | Codec       | File                                        |
| -------------- | --------------------------- | ---------: | -------: | ----------- | ------------------------------------------- |
| Landscape 16:9 | Website hero / presentation |  1920x1080 |   15.04s | H.264 + AAC | `landscape-16x9/renders/landscape-16x9.mp4` |
| Portrait 9:16  | Facebook Stories / Reels    |  1080x1920 |   15.04s | H.264 + AAC | `portrait-9x16/renders/portrait-9x16.mp4`   |
| Square 1:1     | Feed / square social        |  1080x1080 |   15.04s | H.264 + AAC | `square-1x1/renders/square-1x1.mp4`         |

## Verification

- `npx hyperframes lint`: passed with 0 errors and 0 warnings for all three compositions.
- `npx hyperframes validate --timeout 30000`: passed with no console errors for all three compositions.
- `npx hyperframes inspect --samples 15`: passed with 0 layout issues across 15 samples for all three compositions.
- `ffprobe`: confirmed correct duration, resolution, H.264 video, and AAC audio.
- Visual contact sheet review: no clipped text, no unreadable captions, no fake brokerage branding, no Michelle-specific contact details.

## Creative Direction

This iteration reframes the proof video from a broad umbrella brand film into a direct 24-hour listing-launch offer:

- Lead message: `Maya Listing Launch Pack`
- Emotional promise: `Launch the listing like it matters.`
- Proof points:
  - One MLS number or address starts the request.
  - Maya returns website, story/reel, square, captions, CTA, and handoff assets.
  - The workflow captures media, compliance notes, and agent-review requirements.
- Final CTA: `Send the MLS number. Receive the launch pack.`

## Source Files

- Generator: `../scripts/create-ai-real-estate-tag-hero.mjs`
- Design system: `DESIGN.md`
- Voice-over script: `SCRIPT.md`
- Storyboard: `STORYBOARD.md`
- Narration: `assets/narration.mp3`

## Notes

- Uses the existing Cartesia voice-over configuration from `.env`.
- Does not use Michelle personal branding, brokerage logos, Coldwell Banker marks, or fake performance claims.
- Uses layout-first compositions for each aspect ratio instead of cropping one master canvas.

## Vercel Delivery Upgrade

- `index.html` is now a complete static media kit with hero preview, direct download buttons, format specs, delivery notes, and post-ready copy.
- `vercel.json` adds security headers and immutable cache headers for rendered MP4, JPG, and MP3 assets.
- `robots.txt` and `site.webmanifest` are included for clean share/crawl behavior.
- The design direction follows a preview-first Vercel handoff model: static when static is enough, cacheable media assets, clear provenance, and no unnecessary runtime.

## Research Inputs

- Vercel Ship 2026: Vercel Services, broader backend/framework support, enterprise apps and agents, and Vercel Agent.
- Vercel Skills documentation and skills.sh: reusable agent capabilities, Vercel React/Next.js skills, deployment skills, workflow skills, and the skills.sh API.
- Vercel Ship 2025: Fluid Compute, AI-oriented infrastructure, Sandbox, and preview-driven workflows.
