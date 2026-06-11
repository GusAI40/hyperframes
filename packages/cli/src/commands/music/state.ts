/**
 * Local state for the `music` commands — mirrors `sfx/state.ts` but the
 * cache + downloads live under `<assets>/music/` so SFX and music don't
 * collide.
 *
 * The public catalog API is search-only (no fetch-by-id), and presigned
 * `audio_url`s expire (~15 min). So `music search` caches each result's
 * download URL + the query that produced it, and `music add <id>` reads
 * that cache — refreshing a stale URL by re-running the cached query.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadProjectConfig } from "../../utils/projectConfig.js";

export interface CachedMusic {
  id: string;
  name: string;
  description: string;
  duration: number | null;
  score: number;
  audio_url: string;
  /** The search query that surfaced this track — used to refresh an expired URL. */
  query: string;
  /** Epoch ms when audio_url was fetched (presigned URLs expire). */
  fetchedAt: number;
}

const CACHE_FILE = ".catalog-cache.json";

/** Directory music clips download into: `<project>/<assets>/music`. */
export function musicDir(projectDir: string): string {
  const config = loadProjectConfig(projectDir);
  return join(resolve(projectDir), config.paths.assets, "music");
}

function cachePath(projectDir: string): string {
  return join(musicDir(projectDir), CACHE_FILE);
}

/** Merge `items` into the per-project search cache (keyed by id). */
export function writeSearchCache(projectDir: string, items: CachedMusic[]): void {
  const dir = musicDir(projectDir);
  mkdirSync(dir, { recursive: true });
  let all: Record<string, CachedMusic> = {};
  try {
    all = JSON.parse(readFileSync(cachePath(projectDir), "utf-8")) as Record<string, CachedMusic>;
  } catch {
    /* no cache yet */
  }
  for (const it of items) all[it.id] = it;
  writeFileSync(cachePath(projectDir), JSON.stringify(all, null, 2) + "\n", "utf-8");
}

/** Look up a cached track by id, or undefined if not in the cache. */
export function readCachedMusic(projectDir: string, id: string): CachedMusic | undefined {
  try {
    const all = JSON.parse(readFileSync(cachePath(projectDir), "utf-8")) as Record<
      string,
      CachedMusic
    >;
    return all[id];
  } catch {
    return undefined;
  }
}
