# Phase 2 — Read the real schema with lark-cli

Goal: exact field **names + types + select options**, the **runtime value shape** of each cell, and the `app_token` + `table_id`. Everything here is **read-only**.

All commands assume: `export LARK_CLI_NO_PROXY=1` and the CLI is authenticated (`npx --no-install @larksuite/cli auth status` → user identity ready, scopes include `base:table:read base:field:read base:record:read`).

## Step 1 — Resolve a share link → app_token + table_id
A `shr...` share token is not usable as a base token. Options:

**A. Browser (most reliable).** Open the share link in Chrome (Claude-in-Chrome), then read the page's "Go to Base" link or the data API requests — the canonical URL is `.../base/<app_token>?table=<table_id>&view=<view_id>`. The `read_page` accessibility tree often exposes a link like:
```
link href="https://<tenant>.larkoffice.com/base/<APP_TOKEN>?table=<TABLE_ID>&view=<VIEW_ID>&ccm_open_type=bitable_shared_grid"
```
Grab `app_token`, `table_id`, `view_id` from it.

**B. Ask the user** to open the Base (not the share view) and paste the URL — it contains `/base/<app_token>?table=<table_id>`.

> The share view loads the grid via a `mockBitableToken...` placeholder in network calls — that masks the real token, so prefer the "Go to Base" link.

## Step 2 — List tables (pick the renewal/target table)
```bash
npx --no-install @larksuite/cli base +table-list --base-token <APP_TOKEN> --as user \
  --jq '.data.tables[]? // .data.items[]? // (.data|.items // .tables)' 
# tables live under .data.tables (with .data.total). Each: {table_id, name}
```

## Step 3 — Field list (names, types, options)  ← the contract
```bash
npx --no-install @larksuite/cli base +field-list --base-token <APP_TOKEN> --table-id <TABLE_ID> --as user \
  --jq '.data.fields[] | "\(.type)\t[opts:\(.options|length)]\t\(.name)"' | sort
```
Note for each field you need: exact `name`, `type` (`text`, `number`, `formula`, `lookup`, `select`, `datetime`, …), and for `select` the options:
```bash
npx --no-install @larksuite/cli base +field-list --base-token <APP_TOKEN> --table-id <TABLE_ID> --as user \
  --jq '.data.fields[] | select(.name=="<SELECT FIELD>") | {name, type, options: (.options|map(.name))}'
```
`field-list` response: fields under **`.data.fields`**; each select field has `.options[] = {id,name,color}`.

## Step 4 — Sample a few records (learn value shapes)
```bash
npx --no-install @larksuite/cli base +record-list --base-token <APP_TOKEN> --table-id <TABLE_ID> --as user \
  --limit 5 --field-id "<FieldA>" --field-id "<FieldB>" --jq '.data.data'
```
`record-list` response: rows under **`.data.data`** as arrays aligned to `.data.fields` (NOT objects). Use `--field-id` (repeatable) to project specific fields → each row becomes a small array.

What to look for (the REST API simplifies values; the **front-end SDK wraps them differently** — see `sdk-cheatsheet.md`):
- Which columns are **null for some records** (so the UI shows "—" legitimately, not a bug).
- Whether numeric fields are **monthly vs annual**, **ratio vs percent** (e.g. a `% Growth` formula returning `0.2` means 20%). This decides your `calc` helpers and formatting.
- Confirm the **estimate formulas** from Phase 1 against real rows (e.g. verify `arr = license × price × 12` by checking `license × price × 12 == ARR` on a couple records).

## Step 5 — Build the FIELDS map
Translate the plan into logical-key → exact Base field name. Mismatched names = empty UI. Suffixes like `(partner điền)` / `(đầu quý)` vary between Bases — the data layer's `resolveMeta` matches by exact → normalized → prefix, so configure the **shortest stable prefix** when unsure (e.g. `"Dự báo tái ký"` matches `"Dự báo tái ký (đầu quý)"`).
