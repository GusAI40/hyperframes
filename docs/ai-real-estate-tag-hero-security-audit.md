# AI Real Estate TAG Hero - Security Audit

## Scope

This audit covers the public Vercel media-kit deployment at `ai-real-estate-tag-hero` and the files required to ship the video download page.

## Current Controls

- Static-only deployment: no server runtime, no API routes, no database connection, no form submission, and no client-side JavaScript.
- Direct media delivery: MP4/JPG/MP3 assets are served from the deployment only.
- `vercel.json` security headers:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Cross-Origin-Opener-Policy`
  - `Cross-Origin-Resource-Policy`
  - `X-DNS-Prefetch-Control`
- Immutable caching only for generated media assets.
- HTML/default routes use revalidation instead of long immutable caching.
- `.env`, `.env.local`, `.env.*.local`, and `.vercel` are ignored.
- Rendered MP4s are stored through Git LFS, not raw Git blobs.

## Verified Risks

- Real secrets exist in local `.env`, which is expected for local/private work. `.env` is ignored and not tracked.
- `.env.example` contains placeholder variable names only. It does not contain real key values.
- The Vercel project currently has no custom Firewall rules or bypass rules. Vercel platform DDoS mitigation remains enabled by default.
- The page has no script execution surface. CSP sets `script-src 'none'`.

## Required Checks Before Every Deployment

1. Run the local security check:

   ```powershell
   node scripts\security-check-ai-real-estate-tag-hero.mjs
   ```

2. Confirm Vercel config parses:

   ```powershell
   node -e "JSON.parse(require('fs').readFileSync('ai-real-estate-tag-hero/vercel.json','utf8')); console.log('vercel config ok')"
   ```

3. Deploy as preview first:

   ```powershell
   vercel deploy -y --target=preview
   ```

4. Verify deployed response headers:

   ```powershell
   Invoke-WebRequest -Uri <preview-url> -Method Head -UseBasicParsing
   ```

## Recommended Vercel Dashboard Settings

These require account/project dashboard access and should be reviewed by the owner:

- Enable Deployment Protection for non-public preview URLs when assets are not meant for public distribution.
- Enable Logs and Source Protection where available.
- Keep Attack Mode off during normal traffic; enable only during an active attack.
- Add WAF rules in staged mode first:
  - log requests for sensitive probes such as `/.env`, `/.git`, `/wp-admin`, and `/phpmyadmin`;
  - review traffic;
  - move to deny/challenge only after confirming no legitimate traffic matches.

## Security Position

This does not make the system mathematically "hole-free." It materially reduces the attack surface by removing runtime code, denying script execution, locking browser policy, keeping secrets out of Git, and relying on Vercel platform protections for DDoS and edge delivery.
