/**
 * `hyperframes music` — search and download background music from the HeyGen
 * catalog. Subverbs live in `./music/<name>.ts`, loaded dynamically so this
 * surface doesn't affect CLI cold-start.
 *
 * Music has a different discovery flow from SFX (bed-style, longer, ducks
 * under VO) and deserves its own command surface, but the wire shape is the
 * same — the cloud API exposes `type: "music" | "sound_effects"` on the same
 * `searchSounds` endpoint. Auth + analyze are shared verbatim with `sfx`.
 */

import { defineCommand } from "citty";
import type { Example } from "./_examples.js";
import { c } from "../ui/colors.js";

export const examples: Example[] = [
  ["Search music by mood", 'hyperframes music search "ambient pad slow build"'],
  ["Download a track into the project", "hyperframes music add 8b1ac2f2e69edd9b"],
  ["Measure a clip (loudness, peak time)", "hyperframes music inspect 8b1ac2f2e69edd9b"],
];

const HELP = `
${c.bold("hyperframes music")} ${c.dim("<subcommand>")}

Find and use background music from the HeyGen catalog — searchable by mood,
genre, instrument, or feel. Tracks are AI-generated, ready for ducking
under voiceover, and downloaded as local files keyed by id.

${c.bold("SUBCOMMANDS")}
  ${c.accent("search")} ${c.dim('"<description>"')}   Search the catalog by mood / feel
  ${c.accent("add")} ${c.dim("<id>")}              Download a track into ./assets/music/
  ${c.accent("inspect")} ${c.dim("<id>")}          Measure loudness, peak time, onset/tail

${c.bold("EXAMPLE")}
  hyperframes music search "moody ambient pad"
  hyperframes music add <id>
  hyperframes music inspect <id>

See ${c.accent("skills/website-to-hyperframes/references/background-music.md")} for
when music helps vs hurts, the volume hierarchy (BGM ducks under VO),
and the motif rule (one bed per scene).
`;

export default defineCommand({
  meta: { name: "music", description: "Search and download background music from the HeyGen catalog" },
  subCommands: {
    search: () => import("./music/search.js").then((m) => m.default),
    add: () => import("./music/add.js").then((m) => m.default),
    inspect: () => import("./music/inspect.js").then((m) => m.default),
  },
  run({ args }) {
    if (!args._?.[0]) console.log(HELP);
  },
});
