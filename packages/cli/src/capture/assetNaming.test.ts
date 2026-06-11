import { describe, it, expect } from "vitest";
import { detectPartnerWallsAndAssignSlotRoles, type CatalogedAsset } from "./assetCataloger.js";
import { deriveAssetName, deriveInlineSvgName } from "./assetDownloader.js";

function asset(partial: Partial<CatalogedAsset> & { url: string }): CatalogedAsset {
  return {
    type: "Image",
    contexts: ["img[src]"],
    ...partial,
  } as CatalogedAsset;
}

describe("detectPartnerWallsAndAssignSlotRoles", () => {
  it("flags a partner-wall cluster (≥4 small imgs sharing y-coord + height)", () => {
    // 6 logos in a horizontal strip — all bbox~(80×40) at y=2400, x varies
    const catalog: CatalogedAsset[] = [
      asset({ url: "https://x/h.svg", bbox: { x: 100, y: 2400, width: 80, height: 40 } }),
      asset({ url: "https://x/g.svg", bbox: { x: 220, y: 2402, width: 75, height: 38 } }),
      asset({ url: "https://x/n.svg", bbox: { x: 340, y: 2398, width: 82, height: 41 } }),
      asset({ url: "https://x/a.svg", bbox: { x: 460, y: 2400, width: 80, height: 40 } }),
      asset({ url: "https://x/m.svg", bbox: { x: 580, y: 2401, width: 78, height: 39 } }),
      asset({ url: "https://x/z.svg", bbox: { x: 700, y: 2399, width: 76, height: 40 } }),
    ];
    detectPartnerWallsAndAssignSlotRoles(catalog);
    // All 6 should be in the same partner-strip cluster, sorted by x-coord
    const roles = catalog.map((a) => a.slotRole);
    expect(roles).toEqual([
      "partner-strip-1-1",
      "partner-strip-1-2",
      "partner-strip-1-3",
      "partner-strip-1-4",
      "partner-strip-1-5",
      "partner-strip-1-6",
    ]);
  });

  it("does NOT flag clusters with fewer than 4 members", () => {
    // 3 imgs at the same y — not enough for partner-wall heuristic
    const catalog: CatalogedAsset[] = [
      asset({ url: "https://x/a.svg", bbox: { x: 100, y: 500, width: 80, height: 40 }, parentLandmark: "header" }),
      asset({ url: "https://x/b.svg", bbox: { x: 220, y: 502, width: 80, height: 40 }, parentLandmark: "header" }),
      asset({ url: "https://x/c.svg", bbox: { x: 340, y: 500, width: 80, height: 40 }, parentLandmark: "header" }),
    ];
    detectPartnerWallsAndAssignSlotRoles(catalog);
    // Falls through to parentLandmark → all get "header"
    expect(catalog.every((a) => a.slotRole === "header")).toBe(true);
  });

  it("assigns isCanonicalLogo→header-logo regardless of cluster", () => {
    const catalog: CatalogedAsset[] = [
      asset({
        url: "https://x/brand.svg",
        bbox: { x: 50, y: 30, width: 120, height: 40 },
        isCanonicalLogo: true,
        parentLandmark: "header",
      }),
    ];
    detectPartnerWallsAndAssignSlotRoles(catalog);
    expect(catalog[0]!.slotRole).toBe("header-logo");
  });

  it("uses parentLandmark fallback (main → hero, header → header)", () => {
    const catalog: CatalogedAsset[] = [
      asset({ url: "https://x/hero.png", bbox: { x: 200, y: 100, width: 800, height: 600 }, parentLandmark: "main" }),
      asset({ url: "https://x/foot.svg", bbox: { x: 50, y: 5000, width: 100, height: 30 }, parentLandmark: "footer" }),
      asset({ url: "https://x/nav.svg", bbox: { x: 20, y: 10, width: 80, height: 30 }, parentLandmark: "nav" }),
    ];
    detectPartnerWallsAndAssignSlotRoles(catalog);
    expect(catalog.map((a) => a.slotRole)).toEqual(["hero", "footer", "nav"]);
  });

  it("respects container-has-logo-regex inside header → header-logo", () => {
    const catalog: CatalogedAsset[] = [
      asset({
        url: "https://x/brand.svg",
        bbox: { x: 40, y: 20, width: 100, height: 35 },
        parentLandmark: "header",
        containerHasLogoRegex: true,
      }),
    ];
    detectPartnerWallsAndAssignSlotRoles(catalog);
    expect(catalog[0]!.slotRole).toBe("header-logo");
  });

  it("falls through to 'content' when no landmark or signals", () => {
    const catalog: CatalogedAsset[] = [asset({ url: "https://x/random.png" })];
    detectPartnerWallsAndAssignSlotRoles(catalog);
    expect(catalog[0]!.slotRole).toBe("content");
  });
});

describe("deriveAssetName", () => {
  const buf1 = Buffer.from("fixture-bytes-1");
  const buf2 = Buffer.from("fixture-bytes-2");

  it("prefers altText over enclosingHref over URL path over nearestHeading (priority chain)", () => {
    // Same URL, but altText="Stripe Logo" should win over every other signal
    const url = new URL("https://cdn.example.com/img/abc123.svg");
    const catalog: CatalogedAsset = {
      url: url.href,
      type: "Image",
      contexts: [],
      altText: "Stripe Logo",
      enclosingHref: "google",
      nearestHeading: "Trusted by these companies",
      slotRole: "partner-strip-1-3",
    };
    const name = deriveAssetName(url, catalog, false, 0, new Set(), buf1);
    expect(name).toMatch(/^partner-strip-1-3-stripe-logo-[A-Za-z0-9_-]{8}$/);
  });

  it("falls through to enclosingHref when altText is missing", () => {
    const url = new URL("https://cdn.example.com/img/8a1f2.svg");
    const catalog: CatalogedAsset = {
      url: url.href,
      type: "Image",
      contexts: [],
      enclosingHref: "google",
      nearestHeading: "Our customers",
      slotRole: "partner-strip-1-4",
    };
    const name = deriveAssetName(url, catalog, false, 0, new Set(), buf1);
    expect(name).toMatch(/^partner-strip-1-4-google-[A-Za-z0-9_-]{8}$/);
  });

  it("rejects trivial alt text ('image', 'logo') and keeps walking the chain", () => {
    const url = new URL("https://cdn.example.com/img/meaningful-slug.svg");
    const catalog: CatalogedAsset = {
      url: url.href,
      type: "Image",
      contexts: [],
      altText: "image", // trivial — should be rejected
      ariaLabel: "Logo", // also trivial
      enclosingHref: "stripe",
      slotRole: "header",
    };
    const name = deriveAssetName(url, catalog, false, 0, new Set(), buf1);
    // 'stripe' wins (first non-trivial in priority chain)
    expect(name).toMatch(/^header-stripe-[A-Za-z0-9_-]{8}$/);
  });

  it("includes content-hash for collision-safety and dedup signal", () => {
    const url = new URL("https://cdn.example.com/img/x.svg");
    const catalog: CatalogedAsset = {
      url: url.href,
      type: "Image",
      contexts: [],
      altText: "Brand Mark",
      slotRole: "header-logo",
    };
    const name1 = deriveAssetName(url, catalog, false, 0, new Set(), buf1);
    const name2 = deriveAssetName(url, catalog, false, 0, new Set(), buf2);
    // Same slug, different content → different hash suffix → different name
    expect(name1).not.toBe(name2);
    expect(name1).toMatch(/^header-logo-brand-mark-[A-Za-z0-9_-]{8}$/);
    expect(name2).toMatch(/^header-logo-brand-mark-[A-Za-z0-9_-]{8}$/);
  });

  it("emits stable hash for the same content", () => {
    const url = new URL("https://cdn.example.com/img/x.svg");
    const catalog: CatalogedAsset = {
      url: url.href,
      type: "Image",
      contexts: [],
      altText: "Brand",
      slotRole: "header-logo",
    };
    const name1 = deriveAssetName(url, catalog, false, 0, new Set(), buf1);
    const name2 = deriveAssetName(url, catalog, false, 0, new Set(), buf1);
    expect(name1).toBe(name2);
  });

  it("uses isPoster → 'poster' role (with unhelpful URL slug, falls through to idx)", () => {
    // URL path is a hex hash → rejected by the meaningful-slug filter → no semantic signal
    const url = new URL("https://cdn.example.com/v/8a1f29ab2c3d.jpg");
    const name = deriveAssetName(url, undefined, true, 5, new Set(), buf1);
    expect(name).toMatch(/^poster-5-[A-Za-z0-9_-]{8}$/);
  });

  it("uses isPoster + meaningful URL path → poster-<slug>-<hash>", () => {
    const url = new URL("https://cdn.example.com/v/intro-frame.jpg");
    const name = deriveAssetName(url, undefined, true, 5, new Set(), buf1);
    expect(name).toMatch(/^poster-intro-frame-[A-Za-z0-9_-]{8}$/);
  });

  it("falls back to '<role>-<idx>' when no semantic signal is available", () => {
    const url = new URL("https://cdn.example.com/8a1f29ab.png");
    const name = deriveAssetName(url, asset({ url: url.href }), false, 7, new Set(), buf1);
    // role defaults to 'content', slug empty → "content-7-<hash>"
    expect(name).toMatch(/^content-7-[A-Za-z0-9_-]{8}$/);
  });

  it("rejects CSS-in-JS class hashes from inline SVG labels", () => {
    // Real-world leakage: linear renders SVGs with class="sx-1fwcy2r" → label="sx-1fwcy2r"
    const svg = {
      outerHTML: "<svg xmlns='http://www.w3.org/2000/svg'><path d='M0 0'/></svg>".padEnd(60, " "),
      label: "sx-1fwcy2r",
      isLogo: false,
    };
    const name = deriveInlineSvgName(svg, 27, new Set());
    // slug rejected → falls back to `icon-<idx>-<hash>`
    expect(name).toMatch(/^icon-27-[A-Za-z0-9_-]{8}$/);
  });

  it("uses meaningful labels for inline SVGs and emits content hash", () => {
    const svg = {
      outerHTML: "<svg xmlns='http://www.w3.org/2000/svg' aria-label='Stripe'><path d='M0 0'/></svg>".padEnd(60, " "),
      label: "Stripe",
      isLogo: true,
    };
    const name = deriveInlineSvgName(svg, 0, new Set());
    expect(name).toMatch(/^logo-stripe-[A-Za-z0-9_-]{8}$/);
  });

  it("emits stable hash for the same inline SVG bytes (content-addressable)", () => {
    const svg = {
      outerHTML: "<svg xmlns='http://www.w3.org/2000/svg'><circle r='10'/></svg>".padEnd(60, " "),
      label: "Brand",
      isLogo: true,
    };
    const a = deriveInlineSvgName(svg, 0, new Set());
    const b = deriveInlineSvgName(svg, 5, new Set()); // different idx, same content
    expect(a).toBe(b);
  });

  it("sanitizes forbidden chars and uniquifies on collision", () => {
    const url = new URL("https://cdn.example.com/img/x.svg");
    const catalog: CatalogedAsset = {
      url: url.href,
      type: "Image",
      contexts: [],
      altText: "Some/Slash/Asset",
      slotRole: "content",
    };
    const used = new Set<string>();
    const name1 = deriveAssetName(url, catalog, false, 0, used, buf1);
    expect(name1).not.toContain("/"); // slug splits at non-alphanum
    used.add(name1);
    // Force an identical-bytes collision (same buffer) — uniquifier kicks in
    const name2 = deriveAssetName(url, catalog, false, 1, used, buf1);
    expect(name2).toBe(`${name1}-2`);
  });
});
