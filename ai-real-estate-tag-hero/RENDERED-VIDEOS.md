# AI for Real Estate by TAG - Rendered Videos

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

This iteration reframes the product from a literal workflow explainer into a premium umbrella brand film:

- Lead message: `AI for Real Estate by TAG`
- Emotional promise: `Where AI agents meet real estate agents.`
- Proof points:
  - Listings become campaigns.
  - Websites become intelligent lead hubs.
  - Open houses become future seller opportunities.
- Final CTA: `Send Maya an address. Get a premium real estate deliverable back.`

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
