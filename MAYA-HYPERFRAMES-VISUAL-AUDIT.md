# Maya HyperFrames Visual Audit

Generated on 2026-07-01.

## Executive Summary

The two Maya HyperFrames videos are technically solid V1 explainers. They pass HyperFrames lint with no errors, validate with no console errors, inspect with zero layout issues, and render correctly as H.264/AAC MP4s in landscape, portrait, and square formats.

Creative grade: strong B / B+. The work is clean, readable, restrained, and on-brand for a white-label real estate AI product. It is not yet an Apple-level, luxury real estate hero film. The biggest gap is cinematic distinctiveness: the videos use elegant SaaS UI cards and abstract data motion, but they lack a memorable hero image, luxury-home atmosphere, deeper motion choreography, and a sharper first-three-second value hook.

Final recommendation: revise before using as the flagship "AI for Real Estate by TAG" website hero. Shipable as internal/product explainers and social proof-of-concept. Not yet the million-dollar hero.

## Scope Audited

- `maya-showing-planner-explainer`
- `maya-cma-generator-explainer`
- Landscape, portrait, and square renders for each.
- Official repo context: current workspace already has `origin` set to `https://github.com/heygen-com/hyperframes.git`.

## Scorecard

| Category                | Showing Planner | CMA Generator | Notes                                                                                                             |
| ----------------------- | --------------: | ------------: | ----------------------------------------------------------------------------------------------------------------- |
| Brand fit               |               8 |             8 | Clear Maya/TAG white-label direction, but not broad enough for the full AI for Real Estate by TAG platform story. |
| Luxury real estate feel |               7 |             7 | Dark, gold, glass, and serif create premium tone; missing actual luxury home atmosphere.                          |
| Website hero usability  |               7 |             7 | Readable and calm, but too explanatory/scene-heavy for a looping hero.                                            |
| Visual hierarchy        |               8 |             8 | Main scene headlines are clear; first-three-second platform value could be stronger.                              |
| Typography              |               7 |             7 | Readable and elegant; Georgia is safe but not distinctive. Captions are functional, not premium.                  |
| Motion quality          |               7 |             7 | Smooth entrances and focus-pull transitions; motion vocabulary is repetitive.                                     |
| Transitions             |               8 |             8 | No jump cuts; transition wash works. Could be more cinematic and less uniform.                                    |
| Layout and spacing      |               9 |             9 | HyperFrames inspect found 0 layout issues across all formats.                                                     |
| Technical compliance    |               8 |             8 | Strong compliance; one maintainability warning remains. Animation-map audit could not run.                        |
| Conversion quality      |               7 |             8 | CMA has clearer compliance-safe value. Showing Planner is useful but less emotionally urgent.                     |

Overall score:

- Showing Planner: 76 / 100, Grade B
- CMA Generator: 79 / 100, Grade B+
- Combined platform hero readiness: 72 / 100, Grade B-

## Technical Findings

### Passed

- `DESIGN.md` exists for both projects.
- Visual identity is defined before composition.
- `data-composition-id`, `data-start`, `data-duration`, `data-width`, `data-height`, and `data-track-index` are present.
- Scene clips are timed deterministically.
- GSAP timeline is created with `{ paused: true }`.
- Timeline is registered as `window.__timelines["main"]`.
- No `repeat: -1` was found.
- No async timeline construction was found.
- Audio is separate `<audio>` and includes `data-volume`.
- No video element handling problems were found.
- Scene transitions exist between scenes via `.transition-wash`.
- Entrance animations exist for each scene.
- No illegal pre-transition exit animations were found.
- `ffprobe` confirms H.264 video and AAC audio.

### Warnings

- Minor / accepted V1: `timeline_track_too_dense` appears once per format. Each `index.html` has 8 timed scene clips on track 0. This is not a playback defect, but it makes iteration harder than a sub-composition structure.
- Important / blocked: `animation-map.mjs` could not complete. First it required helper package bootstrapping. With `HYPERFRAMES_SKILL_BOOTSTRAP_DEPS=1`, the bootstrap failed on Windows with `spawnSync npm.cmd EINVAL`.

## Command Results

Commands run:

```powershell
git remote -v
npx hyperframes lint
npx hyperframes validate --timeout 30000
npx hyperframes inspect --samples 15
node skills\hyperframes-animation\scripts\animation-map.mjs <composition-dir> --out <composition-dir>\.hyperframes\anim-map
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,duration:format=duration,size -of json <mp4>
ffmpeg ... contact sheets
```

Results:

- `git remote -v`: `origin` is `https://github.com/heygen-com/hyperframes.git`.
- `lint`: 0 errors, 1 warning per format (`timeline_track_too_dense`).
- `validate`: no console errors for all audited formats.
- `inspect --samples 15`: 0 layout issues for all audited formats.
- `animation-map`: failed due missing helper package; bootstrap then failed with `spawnSync npm.cmd EINVAL`.
- `ffprobe`: all landscape checks confirmed H.264/AAC at 1920x1080, approximately 30.04 seconds. Prior render manifests also verify portrait and square.

## Visual / Design Findings

Strengths:

- Dark navy/black, gold, and electric-blue palette fits luxury tech.
- Text is readable across landscape and portrait.
- Glass UI cards are calm and professional.
- CMA flow correctly avoids unsafe direct client auto-send.
- The videos feel restrained, not cheesy or cartoonish.

Issues:

- The visual system is too abstract for luxury real estate. It shows workflow cards, but not the emotional world of listings, homes, clients, premium reports, or agent trust.
- The hero frame does not instantly say "AI for Real Estate by TAG"; it says "Maya product demo."
- The background treatment is tasteful but generic. It needs a signature image language: luxury home silhouettes, editorial report pages, premium listing campaign artifacts, or cinematic glass/data fusion.
- The TAG mark appears late and simply; brand payoff is modest.
- Captions are useful but feel like accessibility captions, not designed hero-video typography.
- The copy is clear, but not yet Apple-level. It explains; it rarely seduces.
- The same layout pattern repeats across scenes, which weakens the cinematic arc.
- There is no true climax/reveal moment.
- The serif/sans/mono system is competent but safe. It does not feel bespoke.
- The videos are better as product explainers than silent website hero loops.

## Motion Findings

Strengths:

- Smooth entrances.
- No harsh cuts.
- Transition wash/focus-pull language fits premium tech.
- Pacing stays calm and readable.

Issues:

- Motion grammar is repetitive: headline in, card in, caption in, transition, repeat.
- Visual blocks do not transform meaningfully from one state to the next.
- The route/data lines are more implied than cinematic.
- There is not enough depth: no parallax, camera move, elegant report assembly, or premium paper/web artifact reveal.
- The final CTA does not feel like a strong hero close.

## Website Hero Usability

Good:

- Calm enough not to fight page copy.
- Readable at desktop scale.
- 30 seconds is acceptable for a long-form hero background with audio optional.

Needs work:

- A true website hero should communicate value in 3 seconds, even muted.
- Current captions and narration make it feel like a standalone explainer, not a looping atmospheric hero.
- Desktop hero likely needs a shorter 10-15 second loop variant.
- Mobile hero needs fewer scenes and bigger text.

## Top 5 Strengths

1. Technically clean HyperFrames implementation.
2. Strong readability across three aspect ratios.
3. Premium color palette and restrained motion.
4. Clear product workflows.
5. Compliance-safe CMA review flow.

## Top 10 Issues

1. Not cinematic enough for a flagship hero.
2. Too much abstract SaaS UI, not enough luxury real estate atmosphere.
3. Missing "AI for Real Estate by TAG" platform-level story.
4. First three seconds are clear but not emotionally magnetic.
5. Motion vocabulary repeats.
6. No hero climax or memorable visual reveal.
7. Typography is polished but not distinctive.
8. Captions feel functional, not designed.
9. Eight scenes in one file creates maintainability warning.
10. Animation-map script could not run due dependency bootstrap failure.

## Prioritized Improvement Plan

### Phase 1: Technical Compliance

- Split each scene into sub-compositions to remove `timeline_track_too_dense`.
- Resolve animation-map bootstrap on Windows or run it in a clean Node/npm environment.
- Save machine-readable `inspect --json` artifacts with each render.

### Phase 2: Layout, Typography, Contrast

- Create a stronger visual identity for the umbrella brand: `AI for Real Estate by TAG`.
- Upgrade display typography from safe Georgia to a more distinctive supported serif or editorial face.
- Redesign captions as premium kinetic lower-thirds or integrated card text.
- Reduce small UI text in the hero version.

### Phase 3: Motion Choreography

- Add more varied scene motion: report assembly, route lines drawing, page morphs, glass panels folding in, data threads connecting cards.
- Add one hero reveal moment around "Where AI Agents Meet Real Estate Agents."
- Use a slower, more luxurious transition for the final brand reveal.

### Phase 4: Cinematic Polish

- Add luxury home atmosphere or generated/curated visual assets: twilight exterior, editorial interior detail, report mockup on glass, premium campaign artifacts.
- Add subtle parallax/camera drift.
- Add tasteful grain/vignette and better light shaping.
- Build a distinct TAG end-card with a more premium lockup.

### Phase 5: Hero and Social Variants

- Create a 10-15 second website hero loop.
- Keep the 30-second versions as explainer/social videos.
- Make vertical story cuts more direct: hook, workflow, payoff, CTA.
- Make a silent-first hero version with no reliance on voiceover.

## Files Likely To Edit

- `scripts/create-maya-showing-planner-explainer.mjs`
- `scripts/create-maya-cma-generator-explainer.mjs`
- `maya-showing-planner-explainer/DESIGN.md`
- `maya-cma-generator-explainer/DESIGN.md`
- Future: new `ai-real-estate-tag-hero/` project for the umbrella brand hero.

## Final Recommendation

Revise, do not rebuild from zero. The technical foundation is sound. The creative direction needs one more layer: less "workflow diagram," more "premium real estate AI operating system."

Best next move: create a new `AI for Real Estate by TAG` 15-second hero loop using these two product workflows as supporting proof, not the main hero itself.
