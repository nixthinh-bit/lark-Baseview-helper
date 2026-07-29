# Phase 1 — Requirements & UI plan

Goal: end this phase with (a) the sample Base identified, and (b) a written, user-confirmed UI plan that classifies every field.

## 1a. Get the sample Base
Ask the user for the Base as a **share link** or an **`app_token`**. Examples:
- Share view link: `https://<tenant>.larkoffice.com/share/base/view/shr...`
- Canonical base link: `https://<tenant>.larkoffice.com/base/<app_token>?table=<table_id>&view=<view_id>`

A share `shr...` token is NOT an `app_token` — Phase 2 resolves it. The Base is both the **data source** (for preview) and the **schema contract** (field names you bind to).

## 1b. Plan the UI with the user
Do this conversationally BEFORE scaffolding. Sketch the layout, then classify every data point into exactly one role. This classification drives the whole implementation.

| Role | Meaning | Implementation |
|------|---------|----------------|
| **Displayed (read-only)** | A Base column shown as-is for context | value already on the `Row` from `loadRows` → render text |
| **Editable** | User changes it; persisted on Save | bound `<input>/<textarea>/<select>`; written in `saveRecord` |
| **Estimated (preview)** | Computed client-side, NOT written; the Base's formula recomputes the real value after Save | a `calc.ts` helper from editable inputs; render with a `≈` prefix |
| **Fixed** | A constant, or a Base column shown as a fixed reference value | value from `loadRows`'s `Row`, or a literal |

### Questions to nail down
- What is the **primary identifier** per row (e.g. `account_name`) and what shows in the left list?
- Which **filters** are needed (search, chips by month/status, dropdowns)? Are filter options static or read dynamically from a select field's options?
- Which fields are **editable** and what are their Base column names + types?
- Which numbers are **estimated** and with what formula? (Write the exact formula — e.g. `ARR = license × price × 12`, `growth = (arr_new − arr_old) / arr_old`.) Confirm units (monthly vs annual, ratio vs percent).
- What **warnings** (non-blocking) does the user want? (e.g. "license dropped but reason empty", "value < 0", "unsaved changes when switching record".)
- Save behavior: button disabled until dirty? toast on success? update the list badge?

### Output of this phase
Write the plan back to the user and confirm. A good plan looks like:
> Left: search + month chips (from `Month`) + status chips (from select `Status` options) + list of `account_name` with a colored badge.
> Right: compare 2025→2026 (license, price both editable; **ARR estimated = license×price×12**; **growth estimated = (arrEst−arr2025)/arr2025**), read-only context (Fixed price, Discount), editable Reason + Status, Save.

Only proceed to Phase 2 once the field roles are agreed — they determine the `FIELDS` map and which `calc` helpers you need.
