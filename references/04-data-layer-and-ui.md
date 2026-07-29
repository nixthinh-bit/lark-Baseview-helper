# Phase 4 — Port the data layer + build the UI

The data layer is the ONLY file that touches the SDK; keep all `@lark-opdev/block-bitable-api` calls there so the UI stays portable and the gotchas live in one place.

## Step 1 — Drop in the generic assets
Copy from this skill's `assets/` into the project `src/`:
- `assets/datalayer.ts`  → `src/lib/datalayer.ts` — SDK primitives: `ensureTable`, `resolveMeta`, `toStr`/`toNum`/`toSelect` (array-aware), `loadRows`, `getSelectOptions`, `saveRecord`, `isMock`. Handles every value-shape gotcha.
- `assets/calc.ts`       → `src/lib/calc.ts` — `num` (number formatting), `previewArr` (license×price×months), `growthPct`, deterministic `badgeColor`. Adjust formulas to the Phase-1 plan.
- `assets/style-inject.tsx` → `src/Style.tsx` — renders your CSS as a `<style>` element inside the React tree (required to style inside the extension iframe).

## Step 2 — Fill the FIELDS map (from Phase 2)
In `src/lib/datalayer.ts`, set `FIELDS` = logical key → exact Base field name. Use the **shortest stable prefix** for names whose suffix varies between Bases. Mark which are editable. Example:
```ts
export const FIELDS = {
  id:        'account_name',                 // primary / list label
  month:     'Month',                        // formula → number, for a month filter
  status:    'Dự báo tái ký',                // select; prefix-matches 'Dự báo tái ký (đầu quý)'
  license25: '2025 số license',  price25: '2025 giá mỗi license',  arr25: '2025 ARR',
  license26: '2026 số license (Partner điền)',  // editable
  price26:   '2026 giá mỗi license (partner điền)', // editable
  reason:    'Lý do (partner điền)',         // editable (text)
  fixedPrice:'Fixed price',                  // displayed (lookup)
};
export const EDITABLE = ['license26','price26','reason','status'] as const;
```

## Step 3 — Wire the SDK entry
The opdev template's `src/index.tsx` renders a named `App`. Either export `App` named, or change `index.tsx` to `import App from './App'`. The template's `utils.ts` / `render_helper.tsx` are unused for a custom UI — delete them.

## Step 4 — Build the UI to match the Phase-1 plan
Patterns that worked well (see `assets/App.example.tsx` for a full reference implementation):
- **Two-pane layout**: left = search + filter chips + record list; right = detail/edit form.
- **Dynamic filters**: month chips from distinct `FIELDS.month` values in loaded rows; status chips from `getSelectOptions('status')`. Combined filter = `search ∧ month ∧ status`.
- **Estimated fields**: compute from the editable draft via `calc` helpers and render with `≈`. Never write them. Example: `arrPreview = previewArr(license26, price26)` (=`license×price×12`); `growthPreview = growthPct(arr25, arrPreview)`.
- **Displayed/fixed fields**: already on the `Row` returned by `loadRows` — render `row.<key>` directly; show `—` when null (legitimate for empty cells).
- **Dirty-aware Save**: disable until the draft differs; on Save call `saveRecord(recordId, {...editable})`; toast; update the list. Guard record-switching when there are unsaved changes.
- **Non-blocking warnings** per the plan (license dropped + empty reason, value < 0, etc.).
- **Always render `<Style/>`** at the top of every returned tree (including the loading state).

### Save semantics (important)
On Save, write ONLY the editable fields. The Base's formula/rollup fields (real ARR, growth, etc.) **recompute on their own after the write** — your estimated values were just a preview. Map values to the SDK write shapes (see `sdk-cheatsheet.md`): number→number, text→`IOpenSegment[]`, select→`{id,text}`.

## Step 5 — Typecheck
`npx --no-install tsc --noEmit -p tsconfig.json` must be clean (esbuild-loader does NOT typecheck, so run tsc yourself).
