# Production Deployment Bundle

## What This Folder Contains

- `cops_pendency_dashboard.html`
  - Production dashboard file.
  - Does not auto-load preview shipment data.
  - Admin mode is password-gated before upload, base export, RCA export, and RCA updates.
  - Admin must upload the approved production-format Excel file.
  - The latest admin upload/append is saved to Netlify shared storage so view-only users can see it from the same URL.
  - The latest admin upload is also saved in that browser so a new tab on the same browser can restore it if shared storage is unavailable.

- `netlify/functions/shipment-store.js`
  - Netlify Function used by viewer mode to load the last stored shipment DB.
  - Admin upload/append commits the latest DB into GitHub as `cops_shared_store.json`.

- `package.json`
  - Minimal package metadata for Netlify deployment.

- `cops_shared_store.json`
  - Shared DB placeholder. The Netlify Function updates this file after admin upload/append.

- `cops_live_data.js`
  - Empty fallback live-data snapshot.
  - Not required for normal production use once Netlify Functions are working.

- `_redirects`
  - Netlify redirect rules for drag-and-drop deployment.

- `_headers`
  - Netlify security and cache headers for drag-and-drop deployment.

- `netlify.toml`
  - Netlify config if this folder is deployed as the site root.

## Important Production Difference

The non-prod/demo folder includes `cops_preview_data.js` so the dashboard opens pre-populated.

This production bundle intentionally does not include or reference `cops_preview_data.js`.
Production can load `cops_live_data.js` only when you intentionally publish a live snapshot into this folder.

Reason:

- Avoid shipping sample shipment data.
- Avoid stale preview data.
- Force production users/admins to upload the latest approved Excel extract.
- Keep the production URL populated from the latest admin-uploaded shared DB.

## Important Shared-Data Behavior

This version requires Netlify Functions and a GitHub token with repository contents write access. Do not use a plain static drag-and-drop deploy for the final production site, because the viewer-wide store will not run there.

What works now:

- Admin uploads with `Replace Data`: shared DB is overwritten in `cops_shared_store.json`.
- Admin uploads with `Append Data`: current loaded DB and new file are merged/deduped by `ID` / `AWB No`, then the merged DB is stored in `cops_shared_store.json`.
- View-only users open or refresh the same production URL and the latest shared DB loads automatically.
- Same admin browser/new tab also restores from browser storage if the shared function is unavailable.

Optional fallback:

`Export Live Snapshot` can still create a `cops_live_data.js` file, but this is only a backup/manual fallback. Normal production flow should use the shared store.

## Deployment Option A: Git-Based Netlify

Recommended settings:

- Base directory: `outputs/production_deploy`
- Build command: leave blank
- Publish directory: `.`
- Functions directory: `netlify/functions`

Netlify will install `@netlify/blobs` from this folder's `package.json`.

Optional environment variable:

- `COPS_GITHUB_TOKEN`
  - GitHub token with contents read/write access to this repo.
- `COPS_ADMIN_PASSWORD_HASH`
  - Optional SHA-256 hash of the admin password.
  - If not set, the bundled default password hash is used.

## Deployment Option B: Netlify CLI

Use this only if you deploy manually from your machine and want Functions included.

1. Open terminal in:

   `C:\Users\omkar.bharati_elasti\Documents\Codex\2026-07-02\att\outputs\production_deploy`

2. Run install once:

   `npm install`

3. Deploy the site with functions using Netlify CLI.

Plain drag-and-drop is not recommended for this version because it may publish only static files.

## Production Smoke Test

1. Open production URL.
2. Confirm no preview data is loaded.
3. Confirm viewer cannot upload or update RCA.
4. Click Enable Admin Mode and confirm a password dialog opens.
5. Try a wrong password and confirm admin controls stay hidden.
6. Enter the approved admin password.
7. Choose upload mode:
   - `Replace Data` for the normal daily fresh load.
   - `Append Data` only when intentionally adding to existing loaded data; this dedupes by `ID` / `AWB No`.
8. Upload approved production-format Excel.
9. Open the same URL in a new incognito/private browser or another machine as view-only.
10. Confirm the uploaded data reflects without admin login.
11. Open the same URL in a new tab and confirm the uploaded data restores in that browser.
12. Confirm Summary tab populates.
13. Confirm Loss, Wrong Facility, RTO Depart Facility, Backdate OOR, and No Scan buckets populate where applicable.
14. Confirm Backdate OOR includes only `Status = Out On Road` with modified age greater than 24 hours.
15. Confirm RCA Pending excludes FM/Pickup pendency rows.
16. Confirm Hub-Level Bucket Summary populates.
17. Confirm Lane view populates.
18. Confirm COD tab shows only `Payment Method = cod/cash`.
19. Search one Tracking ID in RCA tab.
20. Save one controlled RCA test record.
21. Export:
    - One summary drilldown.
    - One lane view.
    - Hub-Level Bucket Summary.
    - COD detail.
    - Base Tracking Data.
    - Summary Data.
    - Live Snapshot.
    - RCA CSV.

## Go/No-Go Checks

Do not release to users if:

- Preview data appears automatically.
- Admin Mode opens without password.
- View-only users do not see the latest uploaded/appended DB after refresh.
- New tab in the same browser loses the uploaded data.
- The Netlify Function URL `/.netlify/functions/shipment-store` returns an error.
- Upload fails.
- COD includes prepay rows.
- Backdate OOR includes statuses other than `Out On Road`.
- RCA saves against wrong Tracking ID.
- Export Base Tracking Data fails.
- Export Summary Data fails.
- FM/Pickup pendency is counted as RCA Pending.
- Browser console shows token/auth errors.

## Rollback

Use Netlify deploy history to restore the last signed-off deploy.

After rollback:

- Tell users to refresh.
- Preserve screenshots/logs.
- Fix in non-prod before redeploying.
