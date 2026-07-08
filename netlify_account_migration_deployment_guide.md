# COPS Pendency DB - Netlify Account Migration Guide

Use this when moving the dashboard to a new Netlify account while keeping the same GitHub repo.

## Current Storage Design

- GitHub remains the source repo.
- Netlify hosts the dashboard and runs the `shipment-store` function.
- Admin upload updates `cops_shared_store.json` in GitHub through `COPS_GITHUB_TOKEN`.
- View-only users read the latest stored DB through the Netlify function.
- Netlify Blobs is no longer used.

## Files To Deploy

Upload/keep these files at GitHub repo root:

```text
_headers
_redirects
cops_live_data.js
cops_pendency_dashboard.html
cops_shared_store.json
netlify.toml
package.json
PRODUCTION_DEPLOYMENT_README.md
netlify/functions/shipment-store.js
```

Do not keep these old/wrong files:

```text
shipment-store.js
netlify/functions/netlify/
```

## New Netlify Site Setup

1. Login to the new Netlify account.
2. Select **Add new project**.
3. Select **Import an existing project**.
4. Connect GitHub.
5. Select repo:

```text
bharatiomkar18-hue/Cops-Pendency-Dashboard
```

6. Use these build settings:

```text
Base directory: blank
Build command: blank
Publish directory: .
Functions directory: netlify/functions
```

7. Deploy the site.

## Required Environment Variable

Create a GitHub token with repo contents read/write access.

Recommended simple option:

1. GitHub profile > **Settings**.
2. **Developer settings**.
3. **Personal access tokens**.
4. **Tokens classic**.
5. Generate token with `repo` permission.
6. Copy token immediately.

Add this in Netlify site environment variables:

```text
COPS_GITHUB_TOKEN
```

Value: the GitHub token.

Optional variables:

```text
COPS_GITHUB_OWNER=bharatiomkar18-hue
COPS_GITHUB_REPO=Cops-Pendency-Dashboard
COPS_GITHUB_BRANCH=main
```

These are optional because defaults are already built into the function.

## Variables No Longer Needed

Do not add these old variables:

```text
COPS_NETLIFY_SITE_ID
COPS_NETLIFY_TOKEN
NETLIFY_BLOBS_TOKEN
```

## Final Test

After deploy, open:

```text
https://YOUR-SITE.netlify.app/.netlify/functions/shipment-store
```

Expected before admin upload:

```json
{"hasData":false}
```

or, if placeholder exists:

```json
{"hasData":false}
```

Then:

1. Open dashboard.
2. Enable Admin Mode.
3. Select `Replace Data`.
4. Upload latest Excel.
5. Confirm dashboard populates.
6. Open incognito/private browser.
7. Confirm view-only users can see data.

## Common Errors

- `Bad credentials`: recreate `COPS_GITHUB_TOKEN` with `repo` permission and redeploy.
- `404` on `/.netlify/functions/shipment-store`: function path is missing or wrong. Must be `netlify/functions/shipment-store.js`.
- Stuck on `Checking stored shipment DB`: upload the latest package and hard refresh with `Ctrl + F5`.
- Viewers see old data: wait for Netlify redeploy after admin upload, then hard refresh.
