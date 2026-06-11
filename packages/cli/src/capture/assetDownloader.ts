/**
 * Download assets (SVGs, images, favicon, video posters) from extracted tokens + asset catalog.
 *
 * Uses the asset catalog (which already deduplicates srcset variants and keeps the highest
 * resolution) as the single source of truth for images. Favicon links are passed separately.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, extname } from "node:path";
import type { DesignTokens, DownloadedAsset } from "./types.js";
import type { CatalogedAsset } from "./assetCataloger.js";

export async function downloadAssets(
  tokens: DesignTokens,
  outputDir: string,
  catalogedAssets?: CatalogedAsset[],
  faviconLinks?: Array<{ rel: string; href: string }>,
): Promise<DownloadedAsset[]> {
  const assetsDir = join(outputDir, "assets");
  mkdirSync(assetsDir, { recursive: true });

  const assets: DownloadedAsset[] = [];
  const downloadedUrls = new Set<string>();

  // 1. ALL inline SVGs — save as files with content-addressable names.
  // Pattern: `<role>-<slug>-<hash8>.svg` where role∈{logo,icon}, slug is from
  // svg.label (filtered to reject CSS-in-JS class hashes), hash is SHA-256 of
  // the bytes. The hash makes refs stable across captures even when slug is bad.
  mkdirSync(join(outputDir, "assets", "svgs"), { recursive: true });
  const usedSvgNames = new Set<string>();
  for (let i = 0; i < tokens.svgs.length && i < 30; i++) {
    const svg = tokens.svgs[i]!;
    if (!svg.outerHTML || svg.outerHTML.length < 50) continue;
    const name = deriveInlineSvgName(svg, i, usedSvgNames);
    usedSvgNames.add(name);
    const localPath = `assets/svgs/${name}.svg`;
    try {
      writeFileSync(join(outputDir, localPath), svg.outerHTML, "utf-8");
      assets.push({ url: "", localPath, type: "svg" });
    } catch {
      /* skip */
    }
  }

  // 2. Favicon
  for (const icon of faviconLinks || []) {
    if (!icon.href) continue;
    try {
      const ext = extname(new URL(icon.href).pathname) || ".ico";
      const name = `favicon${ext}`;
      const localPath = `assets/${name}`;
      const buffer = await fetchBuffer(icon.href);
      if (buffer) {
        writeFileSync(join(outputDir, localPath), buffer);
        assets.push({ url: icon.href, localPath, type: "favicon" });
        break;
      }
    } catch {
      /* skip */
    }
  }

  // 3. Images — use the catalog as the single source of truth (highest resolution, deduplicated)
  // If the catalog is empty, asset download produces zero images — this is surfaced as a warning
  // so the capture doesn't silently produce a half-empty dataset.
  const imageUrls: { url: string; isPoster: boolean }[] = [];

  if (catalogedAssets && catalogedAssets.length > 0) {
    // Use catalog — already deduplicated with highest-res srcset variants
    for (const a of catalogedAssets) {
      if (a.type !== "Image" && a.type !== "Background") continue;
      if (!a.url.startsWith("http")) continue;
      // Skip junk
      if (a.url.includes("pixel") || a.url.includes("beacon") || a.url.includes("analytics"))
        continue;
      if (a.url.includes("/favicon")) continue;
      // Download images from standard img/video contexts + CSS backgrounds (for hero sections, feature illustrations)
      const hasGoodContext = a.contexts.some(
        (c) =>
          c === "img[src]" ||
          c === "img[srcset]" ||
          c === "video[poster]" ||
          c === "source[srcset]" ||
          c === "data-src" ||
          c === "css url()",
      );
      if (!hasGoodContext) continue;
      const isPoster = a.contexts.includes("video[poster]");
      imageUrls.push({ url: a.url, isPoster });
    }
  }

  // Download all images — use catalog context for human-readable filenames.
  // Pre-filter to deduplicate before downloading.
  const toDownload: {
    url: string;
    isPoster: boolean;
    normalized: string;
    catalog?: CatalogedAsset;
  }[] = [];
  for (const { url, isPoster } of imageUrls) {
    const normalized = normalizeUrl(url);
    if (downloadedUrls.has(normalized)) continue;
    downloadedUrls.add(normalized);
    const catalog = catalogedAssets?.find((a) => normalizeUrl(a.url) === normalized);
    toDownload.push({ url, isPoster, normalized, catalog });
  }

  // Download in parallel batches of 5
  const BATCH_SIZE = 5;
  let imgIdx = 0;
  const usedNames = new Set<string>();
  for (let i = 0; i < toDownload.length; i += BATCH_SIZE) {
    const batch = toDownload.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async ({ url, isPoster, catalog }) => {
        const parsedUrl = new URL(url);
        const pathExt = extname(parsedUrl.pathname);
        const ext = pathExt && pathExt.length <= 5 ? pathExt : ".jpg";
        const buffer = await fetchBuffer(url);
        if (!buffer) return null;
        const isSvg = ext === ".svg" || url.includes(".svg");
        const minSize = isSvg ? 200 : 10000;
        if (buffer.length < minSize) return null;
        return { url, isPoster, parsedUrl, ext, buffer, catalog };
      }),
    );
    for (const result of results) {
      if (result.status !== "fulfilled" || !result.value) continue;
      const { url, isPoster, parsedUrl, ext, buffer, catalog } = result.value;
      try {
        // Generate human-readable name from catalog context + content hash
        const slug = deriveAssetName(parsedUrl, catalog, isPoster, imgIdx, usedNames, buffer);
        const name = `${slug}${ext}`;
        usedNames.add(slug);
        const localPath = `assets/${name}`;
        writeFileSync(join(outputDir, localPath), buffer);
        assets.push({ url, localPath, type: "image" });
        imgIdx++;
      } catch {
        /* skip */
      }
    }
  }

  // 4. OG image (if not already downloaded)
  if (tokens.ogImage && !downloadedUrls.has(normalizeUrl(tokens.ogImage))) {
    try {
      const ext = extname(new URL(tokens.ogImage).pathname) || ".jpg";
      const localPath = `assets/og-image${ext}`;
      const buffer = await fetchBuffer(tokens.ogImage);
      if (buffer && buffer.length > 5000) {
        writeFileSync(join(outputDir, localPath), buffer);
        assets.push({ url: tokens.ogImage, localPath, type: "image" });
      }
    } catch {
      /* skip */
    }
  }

  return assets;
}

/** Normalize URL for deduplication — unwrap Next.js image proxy, strip w/q params */
function normalizeUrl(u: string): string {
  try {
    const parsed = new URL(u);
    if (parsed.pathname.includes("_next/image") && parsed.searchParams.has("url")) {
      return decodeURIComponent(parsed.searchParams.get("url")!);
    }
    parsed.searchParams.delete("w");
    parsed.searchParams.delete("q");
    parsed.searchParams.delete("dpr");
    return parsed.toString();
  } catch {
    return u;
  }
}

/**
 * Download fonts referenced in CSS and rewrite URLs to local paths.
 * Returns the modified CSS string with local font paths.
 */
export async function downloadAndRewriteFonts(css: string, outputDir: string): Promise<string> {
  const assetsDir = join(outputDir, "assets", "fonts");
  mkdirSync(assetsDir, { recursive: true });

  const fontUrlRegex = /url\(['"]?(https?:\/\/[^'")\s]+\.(?:woff2?|ttf|otf)[^'")\s]*?)['"]?\)/g;
  const fontUrls = new Set<string>();
  let match;
  while ((match = fontUrlRegex.exec(css)) !== null) {
    if (match[1]) fontUrls.add(match[1]);
  }

  if (fontUrls.size === 0) return css;

  // Limit font downloads to avoid bloat. Google Fonts serves 20+ unicode-range
  // subsets per weight — we only need a few per family for video production.
  const MAX_FONTS_PER_FAMILY = 6;
  const MAX_TOTAL_FONTS = 30;
  const familyCounts = new Map<string, number>();

  // Extract font-family from the @font-face rule containing each URL
  const getFamilyForUrl = (url: string): string => {
    const idx = css.indexOf(url);
    if (idx === -1) return "_unknown";
    const blockStart = css.lastIndexOf("@font-face", idx);
    if (blockStart === -1) return "_unknown";
    const blockSlice = css.slice(blockStart, idx);
    const familyMatch = blockSlice.match(/font-family\s*:\s*['"]?([^'";}\n]+)/i);
    return familyMatch?.[1] ? familyMatch[1].trim().toLowerCase() : "_unknown";
  };

  // Prioritize Latin subsets over CJK/Arabic/etc unicode ranges
  const sortedUrls = Array.from(fontUrls).sort((a, b) => {
    const aLatin = /latin|[A-Za-z0-9]{10,}\.woff/.test(a) ? 0 : 1;
    const bLatin = /latin|[A-Za-z0-9]{10,}\.woff/.test(b) ? 0 : 1;
    return aLatin - bLatin;
  });

  let rewritten = css;
  let count = 0;

  for (const fontUrl of sortedUrls) {
    if (count >= MAX_TOTAL_FONTS) break;
    const family = getFamilyForUrl(fontUrl);
    const familyCount = familyCounts.get(family) || 0;
    if (familyCount >= MAX_FONTS_PER_FAMILY) continue;

    try {
      const urlObj = new URL(fontUrl);
      const filename = urlObj.pathname.split("/").pop() || `font-${count}.woff2`;
      const localPath = join(assetsDir, filename);
      const relativePath = `assets/fonts/${filename}`;

      const buffer = await fetchBuffer(fontUrl);
      if (buffer) {
        writeFileSync(localPath, buffer);
        rewritten = rewritten.split(fontUrl).join(relativePath);
        familyCounts.set(family, familyCount + 1);
        count++;
      }
    } catch {
      /* skip */
    }
  }

  return rewritten;
}

/** Block requests to private/internal IP ranges to prevent SSRF */
export function isPrivateUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    // Block cloud metadata, localhost, and private IP ranges
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") return true;
    if (hostname === "169.254.169.254") return true; // AWS/GCP metadata
    if (hostname.endsWith(".internal") || hostname.endsWith(".local")) return true;
    // IPv4 private ranges
    const parts = hostname.split(".").map(Number);
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      if (parts[0] === 10) return true; // 10.0.0.0/8
      if (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) return true; // 172.16.0.0/12
      if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
      if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16 (link-local)
    }
    // Block non-HTTP(S) schemes
    const scheme = new URL(url).protocol;
    if (scheme !== "http:" && scheme !== "https:") return true;
    return false;
  } catch {
    return true; // reject unparseable URLs
  }
}

async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    if (isPrivateUrl(url)) return null;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "HyperFrames/1.0" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    // Reject XML/HTML error pages disguised as 200 OK (common with S3/CloudFront)
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/xml") || ct.includes("text/html") || ct.includes("application/xml")) {
      return null;
    }
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

/**
 * Slugify text → kebab-case identifier suitable for a filename component.
 * Caller passes the per-layer max length (kept tight to leave room for prefix+hash).
 */
function slugify(text: string, maxLen = 40): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen);
}

/**
 * SingleFile-style character sanitization for the COMPOSED filename (slug + hash).
 * Drops the small set of chars filesystems hate plus control chars; never touches
 * dots (we need the extension boundary) or the kebab separator.
 */
function sanitizeFilename(name: string): string {
  return name
    // eslint-disable-next-line no-control-regex
    .replace(/[~+?%*:|"<>\\/\x00-\x1f]/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Trivial-name rejector — these are placeholder DOM signals that mean nothing
 * about the asset's actual identity. If the priority chain hits one of these,
 * we keep walking down the chain instead of using it.
 */
const TRIVIAL_SLUG = /^(image|img|photo|picture|logo|icon|svg|file|asset|item|element)$/i;

/**
 * CSS-in-JS class hashes leak into svg.label when the SVG has no aria-label/id
 * and tokenExtractor falls through to class names. Patterns like `sx-1fwcy2r`,
 * `css-1abc23`, `_logo_3a4b5c`, etc. are useless as filenames — they encode
 * style hashes, not content identity. Reject them so the hash-based fallback
 * names the file by content instead.
 */
const CSS_IN_JS_HASH = /^(sx|css|jsx|emotion)-[a-z0-9]{4,}$|^_[a-z]+_[a-z0-9]+$|^[a-z]+-\d+[a-z]+\d*$/i;

/**
 * Inline-SVG filename. Content-addressable so the same SVG bytes always produce
 * the same filename (great for diffs + collision-safety). When the label is a
 * CSS-in-JS class hash, the slug is dropped and only role + hash remain.
 */
export function deriveInlineSvgName(
  svg: {
    outerHTML: string;
    label?: string;
    isLogo: boolean;
    parentLandmark?: string | null;
    inPartnerContext?: boolean;
  },
  idx: number,
  usedNames: Set<string>,
): string {
  // Role priority: partner-logo (logo walls) > header-logo (visible brand mark)
  // > nav-icon (nav controls) > logo (other branded marks) > icon.
  let role: string;
  if (svg.isLogo && svg.inPartnerContext) {
    role = "partner-logo";
  } else if (svg.isLogo && svg.parentLandmark === "header") {
    role = "header-logo";
  } else if (!svg.isLogo && svg.parentLandmark === "nav") {
    role = "nav-icon";
  } else if (svg.isLogo) {
    role = "logo";
  } else {
    role = "icon";
  }

  let slug = "";
  if (svg.label) {
    const cleaned = svg.label.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();
    if (cleaned) {
      const s = slugify(cleaned, 40);
      if (s.length > 2 && !TRIVIAL_SLUG.test(s) && !CSS_IN_JS_HASH.test(s)) slug = s;
    }
  }

  const hash = contentHash8(Buffer.from(svg.outerHTML, "utf-8"));
  let composed = slug ? `${role}-${slug}-${hash}` : `${role}-${idx}-${hash}`;
  composed = sanitizeFilename(composed);
  if (composed.length > 100) composed = composed.slice(0, 100).replace(/-+$/, "");

  let final = composed;
  let suffix = 2;
  while (usedNames.has(final)) {
    final = `${composed}-${suffix}`;
    suffix++;
  }
  return final;
}

/**
 * Layer 4 — content-hash suffix. SHA-256, 8 base64url chars (~48 bits, ~16M
 * collision-bound by birthday paradox — matches Vite default at the cache layer).
 *
 * Using Node's built-in `crypto.createHash('sha256')` (no new dep). BLAKE3 would
 * be ~3x faster but requires `@noble/hashes` and we hash images once per capture —
 * SHA-256 is fast enough.
 *
 * The hash:
 *   1. dedupes filenames when two assets share a slug but have different bytes
 *      (different SVGs both named "Logo" → "logo-AB12cD34.svg" vs "logo-EF56gH78.svg")
 *   2. doubles as a content fingerprint for downstream tools
 *   3. is stable across captures of the same asset (great for diffs)
 */
function contentHash8(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("base64url").slice(0, 8);
}

/**
 * Derive a filename from catalog context using the June 2026 best-practice
 * signal cascade (see CHANGELOG Session 10).
 *
 * Filename pattern: `<slot-role>-<semantic-slug>-<hash8>` (extension appended
 * by caller). Examples:
 *   - header-logo-heygen-a1b2c3d4
 *   - partner-strip-1-3-google-e5f6g7h8         (4th of cluster 1)
 *   - hero-product-shot-i9j0k1l2
 *   - content-image-7-m3n4o5p6                  (no semantic signals available)
 *
 * Signal priority (highest trust first):
 *   1. isCanonicalLogo (JSON-LD schema.org/Organization.logo) → role=header-logo
 *   2. slotRole from cluster detection or parentLandmark
 *   3. semantic slug: altText → ariaLabel → enclosingHref → URL path → nearestHeading (demoted)
 *   4. SHA-256 hash suffix for collision-safety + content fingerprint
 *
 * Why DOM-heading is demoted: it's the root cause of the partner-wall bug
 * (8/12 multi-URL retros). N≥4 logos under the same heading inherited the
 * same slug ("trusted-by"); deduplication then appended counters that
 * didn't match content. Cluster detection (Layer 0, in assetCataloger.ts)
 * now solves this by giving each cluster member a unique slot-role; the
 * heading is only a last-resort signal.
 */
export function deriveAssetName(
  parsedUrl: URL,
  catalog: CatalogedAsset | undefined,
  isPoster: boolean,
  idx: number,
  usedNames: Set<string>,
  buffer: Buffer,
): string {
  // Layer 1 — slot role
  let role: string;
  if (isPoster) {
    role = "poster";
  } else if (catalog?.slotRole) {
    role = catalog.slotRole;
  } else if (catalog?.aboveFold) {
    role = "hero";
  } else {
    role = "content";
  }

  // Layer 2 — semantic slug priority chain.
  // Each candidate is tried in order; first non-trivial, non-empty result wins.
  let slug = "";
  const trySlug = (raw: string | undefined | null): void => {
    if (slug) return;
    if (!raw) return;
    const s = slugify(raw, 40);
    if (s.length > 2 && !TRIVIAL_SLUG.test(s)) slug = s;
  };

  trySlug(catalog?.altText);
  trySlug(catalog?.ariaLabel);
  trySlug(catalog?.enclosingHref);
  if (!slug) {
    // URL path segment (same heuristic as legacy, kept here as Layer 2.5).
    const rawName =
      parsedUrl.pathname
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") || "";
    const isMeaningful =
      rawName.length > 2 &&
      rawName.length < 50 &&
      !/^[a-f0-9]{8,}$/i.test(rawName) &&
      !/^\d+$/.test(rawName) &&
      !rawName.includes("_next") &&
      !rawName.includes("?");
    if (isMeaningful) trySlug(rawName);
  }
  // Legacy fallback — nearestHeading, but DEMOTED to the last semantic signal.
  // On partner walls this would have been the BUG (N logos share one heading);
  // the cluster detection above already gave those a unique slot-role, so by
  // the time we get here we're either NOT on a partner wall OR slot-role + hash
  // disambiguate enough that heading misattribution doesn't matter.
  trySlug(catalog?.nearestHeading);
  // Description (legacy alt+aria+title+figcaption mashup) — even lower priority.
  trySlug(catalog?.description);

  // Layer 4 — hash suffix (always, for collision-safety + dedup signal)
  const hash = contentHash8(buffer);

  // Compose final name. Cap total length at ~100 to keep filenames reasonable.
  let composed = slug ? `${role}-${slug}-${hash}` : `${role}-${idx}-${hash}`;
  composed = sanitizeFilename(composed);
  if (composed.length > 100) composed = composed.slice(0, 100).replace(/-+$/, "");

  // SingleFile-style uniquify: if name is taken (cross-batch dedup happens at
  // the URL layer; this only fires for same-slug + same-hash truncated to 8
  // chars, vanishingly rare in practice) append a counter.
  let final = composed;
  let suffix = 2;
  while (usedNames.has(final)) {
    final = `${composed}-${suffix}`;
    suffix++;
  }

  return final;
}
