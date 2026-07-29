# Gotchas — the non-obvious failures, with fixes

Ordered by how much time they cost.

### 1. Formula & lookup cells come back as ARRAYS
`getCellValue` on a formula returns `[3]` not `3`; on a lookup, an array of values. Naive `toStr`/`toNum` that only handle `{text}`/`{name}` turn these into `''`/`null` → the field looks empty (and dependent UI like month chips disappears). **Fix:** unwrap arrays and bare-number elements (the provided `datalayer.ts` does). Verify with `Month`, a formula price, `% Growth`.

### 2. Field name mismatch between Bases → empty UI
The extension binds by name. `"Dự báo tái ký"` on one Base is `"Dự báo tái ký (đầu quý)"` on another → exact match fails → select options + dropdown empty. **Fix:** `resolveMeta` matches exact → normalized (case/space) → **prefix**. Configure `FIELDS` with the shortest stable prefix.

### 3. `npm run dev` crashes on WebpackBar
Fresh scaffold's `config/webpack.config.js` does `new WebpackBar()` which feeds invalid options to webpack's ProgressPlugin (version mismatch) → dev-server won't start (prod `build` is unaffected). **Fix:** delete `new WebpackBar()` from the dev plugins array.

### 4. `dev`/`preview` exits with "Create bitable failure"
BitableAppWebpackPlugin needs a `url` to open. **Fix:** add `"url": "https://<tenant>/base/<APP_TOKEN>?table=<TABLE_ID>&view=<VIEW_ID>"` to `block.json`.

### 5. CSS doesn't apply (everything looks like raw default buttons)
The extension renders in an iframe; a `import './x.css'` via style-loader / HTML injection doesn't reliably reach it, and the opdev template never imports a local CSS anyway. **Fix:** render the stylesheet as a `<style>` element inside the React tree (`assets/style-inject.tsx`). Put `<Style/>` at the top of every returned tree, including the loading state.

### 6. localhost:8080 is blank — that's expected
Standalone the bundle has no Base host bridge and `main.js` 404s at the bare root. **Only** preview via the in-Base debug URL (`...?debugPort=8080...`). Don't waste time debugging the blank localhost page.

### 7. Blank page right after release
CDN propagation delay for the just-published `offlineWeb` bundle. **Fix:** wait a few minutes, hard-reload. Not a code bug.

### 8. opdev interactive prompts swallow piped input
inquirer discards stdin that arrives before the prompt renders. **Fix:** feed answers staggered with `sleep`s (see `03-scaffold-opdev.md`), or just answer them by hand in a real terminal.

### 9. esbuild-loader doesn't typecheck
`npm run build` won't catch type errors. **Fix:** run `npx tsc --noEmit` yourself before uploading.

### 10. Permissions are enforced per end-user
The Base's advanced permissions (record/field/role) apply automatically through the SDK — `getRecordIdList` hides records the viewer can't see, and `setRecord` fails without edit rights. Catch the Save error and show a friendly message; don't assume the app scope alone grants write.
