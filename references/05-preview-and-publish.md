# Phase 5 — Preview, upload, release

## Step 1 — Dev preview (the ONLY way to see it work)
```bash
export PATH="$HOME/.npm-global/bin:$PATH"
npm run dev
```
It serves on `localhost:8080` and prints:
```
Open url: https://<tenant>.larkoffice.com/base/<APP_TOKEN>?debugPort=8080&table=<TABLE_ID>&view=<VIEW_ID>
```
- **Open that debug URL in the Base** (logged-in browser). Do NOT open `localhost:8080` directly — it never renders (the opdev SDK needs the Base host bridge; the bundle is injected into the Base, and `main.js` 404s at the bare localhost root).
- In the Base: click **"+" (add view) → scroll to "Phần mở rộng / Extensions" → pick your `blk_...` entry**. It loads the local dev build as a new view.
- Open DevTools; the data layer logs the real field names so you can confirm `FIELDS` resolved.
- HMR works: edit `src/`, the iframe reloads. If the page hangs, reload the Base tab.

> Adding a dev view is a small, reversible change to the Base — fine for a test Base. Don't pollute a production Base; use a dedicated "Extension testing" copy.

## Step 2 — Build & upload
```bash
npm run upload      # = npm run build && opdev upload ./dist
```
Interactive prompts (drive staggered if scripting):
```
? Please enter version (e.g. 1.0.0)     -> 1.0.1
? Please enter description (Optional)    -> short changelog
```
On success: `✔ Upload succeed` + `Go to https://open.larksuite.com/app/<APP_ID>/blocks/ ...`. Each new upload needs a new version number.

Verify the prod artifact wired the IDs:
- `dist/index.html` injects `runtime~main.js` + `vendor.js` + `main.js`.
- `dist/index.json` → `{"blockTypeID":"blk_...","blockRenderType":"offlineWeb"}`.
- `dist/project.config.json` → `{"appid":"cli_..."}`.

## Step 3 — Release (Console, manual)
At `https://open.<lark|feishu>.../app/<APP_ID>/blocks/`:
1. Set up the Block: icon, display name, description.
2. Ensure permissions (incl. `base:record:update`) are approved.
3. Create the version → **Apply for release (申请线上发布)** → tenant admin approves.

## Step 4 — Post-release checks
- **Blank page right after release = CDN propagation delay**, not a bug. Hard-reload (Cmd/Ctrl+Shift+R) after a few minutes.
- The view appears under **"+ → Extensions / Phần mở rộng khác"** in Bases within the app's availability scope; new releases take a few minutes to propagate.
- It only shows real data on tables whose field names match `FIELDS` (exactly or by prefix). On a Base missing a field, that cell shows `—`.
