# Andromeda HTML Dashboard - GitHub Deployment Guide

This package publishes the dashboard as a static HTML page.

The page now tries to load live shared data from the Andromeda Google Sheet
Backup first. If that shared source is unavailable, it still opens with the
embedded local data from the last packaged dashboard.

## What To Upload

Upload these files to the GitHub repository root:

- `index.html`
- `.nojekyll`
- `UPDATE FROM ANDROMEDA DASHBOARD.bat` is optional and is only for the laptop that runs Andromeda.

## First-Time GitHub Setup

1. Create a GitHub repository for the dashboard.
2. Keep the repository private/internal if shipment and tracking ID data should not be public.
3. Upload `index.html` and `.nojekyll` to the repository root.
4. Go to repository `Settings`.
5. Open `Pages` from the left menu.
6. Under `Build and deployment`, set `Source` to `Deploy from a branch`.
7. Select the branch, usually `main`, and folder `/root`.
8. Save.
9. Wait a few minutes and open the Pages URL shown by GitHub.

GitHub's docs describe Pages as static hosting for HTML/CSS/JavaScript files from a repository:
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

GitHub's quickstart shows the Pages branch deployment flow:
https://docs.github.com/en/pages/quickstart

## Daily Refresh

For daily data refresh, no GitHub upload is required if the Apps Script has
been updated with the latest `AndromedaBaseSync.gs` and the BAT run successfully
updates the shared Google Sheet.

After any teammate runs Andromeda successfully:

1. The BAT updates Google Sheet `Base`, `Backup`, and `Overall Report`.
2. The Apps Script also rebuilds `DA Performance` and `DA Monitoring` when
   `DA Trips.xlsx` was included in the run.
3. The deployed dashboard reads the latest hub-date rows from `Backup` and DA
   productivity/monitoring rows from `DA Performance` and `DA Monitoring`.
4. KPI tracking drilldowns query `Overall Report` only when a block is clicked.

Upload `index.html` again only when the dashboard design/code changes.

To refresh the deployed HTML after a dashboard code change:

1. Open `C:\Andromeda\Dashboard`.
2. Confirm `Andromeda_Dashboard.html` is updated.
3. Copy it into this GitHub package/repository folder.
4. Rename or overwrite it as `index.html`.
5. Commit/upload the changed `index.html` to GitHub.
6. Wait for GitHub Pages to refresh.

On the Andromeda laptop, you can use `UPDATE FROM ANDROMEDA DASHBOARD.bat` to copy the latest dashboard into this folder as `index.html`.

## Important Security Note

Keep the GitHub repository private/internal. The dashboard can read shared
summary data and tracking-ID drilldown data through the Apps Script web app, so
the Apps Script deployment should also be restricted to approved ElasticRun
users.
