/**
 * Comprehensive asset cataloger.
 *
 * Scans rendered HTML and CSS for every referenced asset (images, videos,
 * fonts, icons, stylesheets, backgrounds) and records the HTML context
 * where each was found (e.g., img[src], css url(), link[rel=preload]).
 *
 * This is the programmatic Part 1 of DESIGN.md generation — deterministic
 * extraction, no AI involved.
 */

import type { Page } from "puppeteer-core";

export interface CatalogedAsset {
  url: string;
  type: "Image" | "Video" | "Font" | "Icon" | "Background" | "Other";
  contexts: string[];
  notes?: string;
  /** Alt text, figcaption, or aria-label (soft mashup — kept for legacy consumers) */
  description?: string;
  /** Nearest heading (h1-h4) text */
  nearestHeading?: string;
  /** Parent section/container class names */
  sectionClasses?: string;
  /** Whether the image is above the fold (visible without scrolling) */
  aboveFold?: boolean;
  // ── New (June 2026 best-practice signal cascade) ──
  /** Raw `<img alt>` only — no fallback. Cleaner than `description`. */
  altText?: string;
  /** Raw `aria-label` or `<svg><title>` text. */
  ariaLabel?: string;
  /** Last path segment of the closest enclosing `<a href>` (e.g. /partners/google → "google"). */
  enclosingHref?: string;
  /** The closest HTML landmark ancestor: header / nav / main / footer / aside. */
  parentLandmark?: "header" | "nav" | "main" | "footer" | "aside" | null;
  /** True when any class/id on the asset OR its container matches /logo|brand|mark/i. */
  containerHasLogoRegex?: boolean;
  /** Rendered bbox via getBoundingClientRect — used server-side for partner-wall cluster detection. */
  bbox?: { x: number; y: number; width: number; height: number };
  /** True when the asset URL matches schema.org/Organization.logo (JSON-LD canonical brand mark). */
  isCanonicalLogo?: boolean;
  /** Computed server-side after cataloging:
   *  - "header-logo" — canonical brand logo (JSON-LD or header+logo-regex)
   *  - "partner-strip-N-i" — i-th asset in the N-th detected partner-wall cluster
   *  - "nav" / "hero" / "footer" / "content" — from parentLandmark fallback
   */
  slotRole?: string;
}

/**
 * Extract all referenced assets from the rendered page with their HTML contexts.
 */
export async function catalogAssets(page: Page): Promise<CatalogedAsset[]> {
  const assets = await page.evaluate(`(() => {
    var assetMap = {};
    var LOGO_REGEX = /logo|brand|mark/i;

    // Page-level pre-pass: canonical-logo URLs (JSON-LD schema.org/Organization.logo).
    // This is the highest-trust signal — the site's own self-declaration of its primary
    // brand mark, used by Google for Knowledge Panels. We collect them once per page and
    // tag matching assets later.
    var canonicalLogoUrls = new Set();
    try {
      var ldNodes = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i = 0; i < ldNodes.length; i++) {
        try {
          var parsed = JSON.parse(ldNodes[i].textContent || 'null');
          var queue = Array.isArray(parsed) ? parsed.slice() : (parsed ? [parsed] : []);
          while (queue.length) {
            var item = queue.shift();
            if (!item || typeof item !== 'object') continue;
            if (Array.isArray(item['@graph'])) queue.push.apply(queue, item['@graph']);
            var t = item['@type'];
            var isOrg = t === 'Organization' || (Array.isArray(t) && t.indexOf('Organization') >= 0)
                     || t === 'WebSite' || t === 'WebPage' || t === 'LocalBusiness';
            if (isOrg && item.logo) {
              var logoUrl = typeof item.logo === 'string' ? item.logo : (item.logo.url || item.logo['@id']);
              if (logoUrl) {
                try { canonicalLogoUrls.add(new URL(logoUrl, document.baseURI).href); } catch(e) {}
              }
            }
          }
        } catch(e) {}
      }
    } catch(e) {}

    // Extract rich DOM context from any element (heading, section, position, slot signals)
    function getElementContext(el) {
      var ctx = {};
      // Alt text + aria-label (raw, separately) — for the new naming cascade
      if (el.alt) ctx.altText = String(el.alt).slice(0, 150);
      var aria = el.getAttribute('aria-label');
      if (aria) ctx.ariaLabel = String(aria).slice(0, 150);
      // SVG <title> child — common for inline SVG icons/logos
      if (!ctx.ariaLabel && el.tagName === 'svg') {
        var titleEl = el.querySelector('title');
        if (titleEl && titleEl.textContent) ctx.ariaLabel = titleEl.textContent.trim().slice(0, 150);
      }
      // description = soft mashup (legacy): alt || aria || title || figcaption
      var desc = el.alt || el.getAttribute('aria-label') || el.getAttribute('title') || '';
      var fig = el.closest('figure');
      if (fig) {
        var cap = fig.querySelector('figcaption');
        if (cap) desc = desc || cap.textContent.trim().slice(0, 100);
      }
      var ariaBy = el.getAttribute('aria-describedby');
      if (ariaBy) {
        var descEl = document.getElementById(ariaBy);
        if (descEl) desc = desc || descEl.textContent.trim().slice(0, 100);
      }
      if (desc) ctx.description = desc.slice(0, 150);
      // Enclosing anchor → last path segment (often the brand name: /partners/google → "google")
      var anchor = el.closest('a[href]');
      if (anchor) {
        try {
          var href = anchor.getAttribute('href') || '';
          var parsed = new URL(href, document.baseURI);
          var segs = parsed.pathname.split('/').filter(function(s) { return s.length > 0 && s.length < 40; });
          if (segs.length > 0) ctx.enclosingHref = segs[segs.length - 1];
        } catch(e) {}
      }
      // Parent HTML landmark (header/nav/main/footer/aside) — for slot-role classification
      var landmark = el.closest('header, nav, main, footer, aside');
      if (landmark) ctx.parentLandmark = landmark.tagName.toLowerCase();
      // Container-has-logo-regex: scan the asset's own classes + nearest 3 ancestors
      var node = el, hops = 0;
      while (node && hops < 4) {
        var cls = (node.className || '').toString();
        var nid = node.id || '';
        if (LOGO_REGEX.test(cls) || LOGO_REGEX.test(nid)) {
          ctx.containerHasLogoRegex = true;
          break;
        }
        node = node.parentElement;
        hops++;
      }
      // Nearest heading + section classes (legacy, kept)
      var section = el.closest('section, article, header, footer, main, [class*="hero"], [class*="banner"], [class*="feature"]');
      if (section) {
        var heading = section.querySelector('h1, h2, h3, h4');
        if (heading) ctx.nearestHeading = heading.textContent.trim().slice(0, 80);
        ctx.sectionClasses = (section.className || '').toString().slice(0, 120);
      }
      // Bbox (rendered position + size) — used server-side for partner-wall cluster detection.
      // aboveFold is kept as a derived legacy field.
      try {
        var rect = el.getBoundingClientRect();
        ctx.aboveFold = rect.top < window.innerHeight;
        if (rect.width > 0 && rect.height > 0) {
          ctx.bbox = {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          };
        }
      } catch(e) {}
      return ctx;
    }

    function add(url, type, context, notes, richCtx) {
      if (!url || url === '' || url.startsWith('data:') || url.startsWith('blob:') || url === 'about:blank') return;
      // Normalize URL
      try { url = new URL(url, document.baseURI).href; } catch(e) { return; }
      // Skip tiny inline data URIs but keep base64 SVGs
      if (url.length > 50000) return;
      // Filter tracking pixels and analytics
      var lurl = url.toLowerCase();
      if (lurl.indexOf('analytics.') > -1 || lurl.indexOf('adsct') > -1 || lurl.indexOf('pixel.') > -1 || lurl.indexOf('tracking.') > -1 || lurl.indexOf('pdscrb.') > -1 || lurl.indexOf('doubleclick') > -1 || lurl.indexOf('googlesyndication') > -1 || lurl.indexOf('facebook.com/tr') > -1 || lurl.indexOf('bat.bing') > -1 || lurl.indexOf('clarity.ms') > -1) return;
      if (lurl.indexOf('bci=') > -1 && lurl.indexOf('twpid=') > -1) return;
      if (lurl.indexOf('cachebust=') > -1 || lurl.indexOf('event_id=') > -1) return;
      // Filter CSS fragment references to SVG filter IDs (not real downloadable assets)
      if (url.indexOf('.css#') > -1) return;
      if (url.indexOf('.css%23') > -1) return;
      // Filter same-page fragment references like "https://site.com/#clip-1"
      try { var parsed = new URL(url); if (parsed.hash && parsed.pathname.length <= 1) return; } catch(e2) {}

      if (!assetMap[url]) {
        assetMap[url] = { url: url, type: type, contexts: [], notes: null };
      }
      var entry = assetMap[url];
      if (entry.contexts.indexOf(context) === -1) {
        entry.contexts.push(context);
      }
      if (notes && !entry.notes) {
        entry.notes = notes;
      }
      // Highest-trust signal: site's own JSON-LD declaration of its primary brand mark.
      if (canonicalLogoUrls.has(url) && !entry.isCanonicalLogo) entry.isCanonicalLogo = true;
      // Merge rich context (first one wins for each field)
      if (richCtx) {
        if (richCtx.description && !entry.description) entry.description = richCtx.description;
        if (richCtx.nearestHeading && !entry.nearestHeading) entry.nearestHeading = richCtx.nearestHeading;
        if (richCtx.sectionClasses && !entry.sectionClasses) entry.sectionClasses = richCtx.sectionClasses;
        if (richCtx.aboveFold !== undefined && entry.aboveFold === undefined) entry.aboveFold = richCtx.aboveFold;
        // New signal cascade fields
        if (richCtx.altText && !entry.altText) entry.altText = richCtx.altText;
        if (richCtx.ariaLabel && !entry.ariaLabel) entry.ariaLabel = richCtx.ariaLabel;
        if (richCtx.enclosingHref && !entry.enclosingHref) entry.enclosingHref = richCtx.enclosingHref;
        if (richCtx.parentLandmark && !entry.parentLandmark) entry.parentLandmark = richCtx.parentLandmark;
        if (richCtx.containerHasLogoRegex && !entry.containerHasLogoRegex) entry.containerHasLogoRegex = true;
        if (richCtx.bbox && !entry.bbox) entry.bbox = richCtx.bbox;
      }
    }

    // ── Images: <img src="..."> and <img srcset="..."> ──
    document.querySelectorAll('img[src]').forEach(function(img) {
      var notes = img.alt || img.getAttribute('aria-label') || null;
      var ctx = getElementContext(img);
      add(img.src, 'Image', 'img[src]', notes, ctx);
      if (img.srcset) {
        img.srcset.split(',').forEach(function(entry) {
          var u = entry.trim().split(/\\s+/)[0];
          if (u) add(u, 'Image', 'img[srcset]', notes, ctx);
        });
      }
    });

    // ── Lazy-loaded images: data-src, data-lazy-src, data-original ──
    document.querySelectorAll('img[data-src], img[data-lazy-src], img[data-original], [data-background-image]').forEach(function(el) {
      var dataSrc = el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || el.getAttribute('data-original') || el.getAttribute('data-background-image');
      if (dataSrc) add(dataSrc, 'Image', 'data-src', el.alt || el.getAttribute('aria-label') || null, getElementContext(el));
    });

    // ── CSS background-image on divs (Framer, Webflow, etc.) ──
    document.querySelectorAll('div, section, [class*="hero"], [class*="card"], [class*="image"], [data-framer-background]').forEach(function(el) {
      var bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        var match = bg.match(/url\\(["']?(https?:\\/\\/[^"')]+)["']?\\)/);
        if (match && match[1]) {
          add(match[1], 'Background', 'css url()', el.getAttribute('aria-label') || null, getElementContext(el));
        }
      }
    });

    // ── Picture sources: <source srcset="..."> ──
    document.querySelectorAll('source[srcset]').forEach(function(src) {
      src.srcset.split(',').forEach(function(entry) {
        var u = entry.trim().split(/\\s+/)[0];
        if (u) add(u, 'Image', 'source[srcset]', null);
      });
    });

    // ── Videos: <video src="..."> and <video poster="..."> ──
    document.querySelectorAll('video[src]').forEach(function(v) {
      add(v.src, 'Video', 'video[src]', null);
    });
    document.querySelectorAll('video source[src]').forEach(function(s) {
      add(s.src, 'Video', 'video source[src]', null);
    });
    document.querySelectorAll('video[poster]').forEach(function(v) {
      add(v.poster, 'Image', 'video[poster]', null);
    });

    // ── Links: preload, icon, apple-touch-icon, stylesheet ──
    document.querySelectorAll('link[rel]').forEach(function(link) {
      var rel = link.rel.toLowerCase();
      var href = link.href;
      if (!href) return;

      if (rel.includes('preload')) {
        var asType = link.getAttribute('as') || '';
        if (asType === 'font') add(href, 'Font', 'link[rel="preload"]', null);
        else if (asType === 'image') add(href, 'Image', 'link[rel="preload"]', null);
        else if (asType === 'video') add(href, 'Video', 'link[rel="preload"]', null);
        else if (asType === 'style') add(href, 'Other', 'link[rel="preload"]', null);
        else add(href, 'Other', 'link[rel="preload"]', null);
      }
      if (rel.includes('icon')) add(href, 'Icon', 'link[rel="' + rel + '"]', null);
      if (rel === 'apple-touch-icon') add(href, 'Icon', 'link[rel="apple-touch-icon"]', null);
    });

    // ── Meta: og:image, twitter:image ──
    document.querySelectorAll('meta[property="og:image"], meta[content][name="twitter:image"]').forEach(function(m) {
      var content = m.getAttribute('content');
      if (content) {
        var prop = m.getAttribute('property') || m.getAttribute('name') || '';
        add(content, 'Image', 'meta[' + prop + ']', null);
      }
    });

    // ── CSS url() references from all stylesheets ──
    try {
      for (var i = 0; i < document.styleSheets.length; i++) {
        try {
          var sheet = document.styleSheets[i];
          var rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;
          for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            var cssText = rule.cssText || '';
            var urlMatches = cssText.match(/url\\(["']?([^"')]+)["']?\\)/g);
            if (urlMatches) {
              urlMatches.forEach(function(m) {
                var u = m.replace(/url\\(["']?/, '').replace(/["']?\\)/, '');
                if (u.startsWith('data:')) return;
                // Classify by file extension
                if (/\\.(woff2?|ttf|otf|eot)$/i.test(u)) {
                  add(u, 'Font', 'css url()', null);
                } else if (/\\.(png|jpg|jpeg|gif|webp|avif|svg)$/i.test(u)) {
                  add(u, 'Background', 'css url()', null);
                } else {
                  add(u, 'Other', 'css url()', null);
                }
              });
            }
          }
        } catch(e) { /* cross-origin stylesheet */ }
      }
    } catch(e) {}

    // ── Inline style url() references ──
    document.querySelectorAll('[style]').forEach(function(el) {
      var style = el.getAttribute('style') || '';
      var urlMatches = style.match(/url\\(["']?([^"')]+)["']?\\)/g);
      if (urlMatches) {
        urlMatches.forEach(function(m) {
          var u = m.replace(/url\\(["']?/, '').replace(/["']?\\)/, '');
          if (u.startsWith('data:')) return;
          if (/\\.(woff2?|ttf|otf|eot)$/i.test(u)) {
            add(u, 'Font', 'html inline style url()', null);
          } else {
            add(u, 'Other', 'html inline style url()', null);
          }
        });
      }
    });

    return Object.values(assetMap);
  })()`);

  const raw = (assets as CatalogedAsset[]) || [];

  // Deduplicate srcset resolution variants — keep highest resolution per base URL
  const deduped = deduplicateSrcsetVariants(raw);

  // ── Server-side post-pass: partner-wall cluster detection + slot-role classification ──
  // The browser-side cataloger captured bbox + altText + ariaLabel + parentLandmark + …
  // We run cluster detection HERE (cleaner in TS than in injected JS) and tag each asset
  // with its slotRole. Layer 0 of the June 2026 best-practice signal cascade.
  detectPartnerWallsAndAssignSlotRoles(deduped);

  return deduped;
}

/**
 * Partner-wall cluster detection.
 *
 * The bug we're fixing: on partner/customer/logo walls (e.g. Airbnb's "Trusted by"),
 * N≥4 logos share the same parent section + same nearest heading. The legacy
 * heading-as-slug approach mislabeled them (`heygen-logo.svg` → Google's content)
 * because slug priority was DOM-context, not asset-content.
 *
 * The 2026-consensus fix is to detect the cluster geometrically: imgs with similar
 * bbox height + same y-coord (±20px) + N≥4 members form a horizontal partner strip.
 * Each member gets `slotRole = "partner-strip-{cluster}-{position}"` instead of
 * inheriting the section's heading.
 *
 * After detection, the remaining assets get a slot-role from their parentLandmark
 * (header / nav / main / footer / aside) + isCanonicalLogo flag.
 *
 * In-place mutation of the input array (sets `slotRole` per asset).
 */
export function detectPartnerWallsAndAssignSlotRoles(catalog: CatalogedAsset[]): void {
  // Step 1: filter to logo-shaped candidates (small, has bbox).
  // Empirical thresholds for partner-wall logos: width 40–300px, height 16–100px.
  const candidates = catalog.filter((a) => {
    if (!a.bbox) return false;
    if (a.type !== "Image" && a.type !== "Icon" && a.type !== "Background") return false;
    const { width: w, height: h } = a.bbox;
    return w >= 40 && w <= 300 && h >= 16 && h <= 100;
  });

  // Step 2: cluster by similar y-coord and similar height.
  // Each candidate joins the first existing group whose ref bbox matches; else
  // starts a new group. (Greedy single-pass — good enough for typical partner walls.)
  const groups: CatalogedAsset[][] = [];
  for (const c of candidates) {
    const cb = c.bbox!;
    let placed = false;
    for (const g of groups) {
      const ref = g[0]!.bbox!;
      const yClose = Math.abs(cb.y - ref.y) < 20;
      const hSim = Math.abs(cb.height - ref.height) / Math.max(ref.height, 1) < 0.3;
      if (yClose && hSim) {
        g.push(c);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([c]);
  }

  // Step 3: clusters with ≥4 members are partner walls. Tag each member with
  // slotRole = "partner-strip-{ci}-{pi}" (sorted by x-coord = reading order).
  const partnerClusters = groups.filter((g) => g.length >= 4);
  partnerClusters.forEach((cluster, ci) => {
    cluster.sort((a, b) => a.bbox!.x - b.bbox!.x);
    cluster.forEach((asset, pi) => {
      asset.slotRole = `partner-strip-${ci + 1}-${pi + 1}`;
    });
  });

  // Step 4: assign slot-role to remaining assets that don't have one yet.
  // Highest trust first: canonical logo → container regex → parent landmark.
  for (const a of catalog) {
    if (a.slotRole) continue; // already set by cluster detection
    if (a.isCanonicalLogo) {
      a.slotRole = "header-logo";
      continue;
    }
    if (a.containerHasLogoRegex && (a.parentLandmark === "header" || a.parentLandmark === "nav")) {
      a.slotRole = "header-logo";
      continue;
    }
    if (a.parentLandmark) {
      // header / nav / main / footer / aside → "header" | "nav" | "hero" | "footer" | "aside"
      a.slotRole = a.parentLandmark === "main" ? "hero" : a.parentLandmark;
      continue;
    }
    a.slotRole = "content";
  }
}

/**
 * Deduplicate Next.js image variants (same image at different w= sizes).
 * Keeps the highest resolution version and merges contexts.
 */
function deduplicateSrcsetVariants(assets: CatalogedAsset[]): CatalogedAsset[] {
  const byBase = new Map<string, CatalogedAsset>();

  for (const a of assets) {
    // Extract base URL by stripping w= and q= params from _next/image URLs
    let baseKey = a.url;
    try {
      const u = new URL(a.url);
      if (u.pathname.includes("_next/image") || u.searchParams.has("w")) {
        u.searchParams.delete("w");
        u.searchParams.delete("q");
        baseKey = u.toString();
      }
    } catch {
      /* not a valid URL, keep as-is */
    }

    const existing = byBase.get(baseKey);
    if (existing) {
      // Merge contexts
      for (const ctx of a.contexts) {
        if (!existing.contexts.includes(ctx)) {
          existing.contexts.push(ctx);
        }
      }
      // Keep notes from whichever has them
      if (a.notes && !existing.notes) {
        existing.notes = a.notes;
      }
      // Keep the URL with highest w= value (largest image)
      const existingW = getWidthParam(existing.url);
      const newW = getWidthParam(a.url);
      if (newW > existingW) {
        existing.url = a.url;
      }
    } else {
      byBase.set(baseKey, { ...a, contexts: [...a.contexts] });
    }
  }

  return [...byBase.values()];
}

function getWidthParam(url: string): number {
  try {
    const u = new URL(url);
    const w = u.searchParams.get("w");
    return w ? parseInt(w) : 0;
  } catch {
    return 0;
  }
}
