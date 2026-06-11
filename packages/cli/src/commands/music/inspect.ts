import { defineCommand } from "citty";
import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Example } from "../_examples.js";
import { c } from "../../ui/colors.js";
import { errorBox } from "../../ui/format.js";
import { musicDir } from "./state.js";
import { analyzeAudio, FFmpegNotFoundError, formatAnalysisLines } from "../sfx/analyze.js";

export const examples: Example[] = [
  ["Analyze a downloaded track by id", "hyperframes music inspect 8b1ac2f2e69edd9b"],
  ["Analyze a file by path (JSON)", "hyperframes music inspect ./assets/music/bed.mp3 --json"],
];

const AUDIO_EXTS = [".mp3", ".flac", ".wav", ".m4a", ".ogg"];

/** Resolve an id (downloaded into assets/music/) or a direct file path to a track on disk. */
// fallow-ignore-next-line complexity
function resolveClipPath(projectDir: string, idOrPath: string): string | undefined {
  if (existsSync(idOrPath) && statSync(idOrPath).isFile()) return resolve(idOrPath);
  const dir = musicDir(projectDir);
  for (const ext of AUDIO_EXTS) {
    const p = join(dir, `${idOrPath}${ext}`);
    if (existsSync(p)) return p;
  }
  return undefined;
}

export default defineCommand({
  meta: {
    name: "inspect",
    description:
      "Measure a downloaded music track: loudness, true peak, peak time, onset/tail silence",
  },
  args: {
    id: {
      type: "positional",
      description: "Music id (downloaded via `music add`) or a path to an audio file",
      required: true,
    },
    dir: { type: "string", description: "Project directory (default: current directory)" },
    json: { type: "boolean", description: "Output the analysis as JSON", default: false },
  },
  // CLI entrypoint: resolve + json/human + ffmpeg error paths.
  // fallow-ignore-next-line complexity
  async run({ args }) {
    const projectDir = resolve(args.dir ?? ".");
    const clip = resolveClipPath(projectDir, args.id);
    if (!clip) {
      errorBox(
        "Track not found",
        `No downloaded music "${args.id}" in ${musicDir(projectDir)} and no file at that path.`,
        "Run `hyperframes music add <id>` first, or pass a path to an audio file.",
      );
      process.exit(1);
    }

    try {
      const analysis = await analyzeAudio(clip);
      if (args.json) {
        console.log(JSON.stringify(analysis));
        return;
      }
      console.log(`  ${c.bold(args.id)}`);
      for (const line of formatAnalysisLines(analysis)) console.log(`  ${c.dim(line)}`);
    } catch (err) {
      if (err instanceof FFmpegNotFoundError) {
        errorBox("ffmpeg not found", "Analysis needs ffmpeg.", `Install it: ${err.hint}`);
        process.exit(1);
      }
      errorBox("Analysis failed", err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  },
});
