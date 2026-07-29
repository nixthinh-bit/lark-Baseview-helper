---
name: lark-baseview-helper
description: Build a custom Lark/Feishu Base "Data Table View" extension from an existing Base. Use when the user wants to create a Base view/extension, turn a Base table into a custom interactive UI (forms, dashboards, review panes), scaffold an opdev `bitable-extensions` project, or replicate a renewal-updater–style view. Walks through: gather the sample Base + plan which fields are displayed / estimated / fixed, read the real schema with lark-cli, create the app + scaffold with opdev (bitable-extensions → table-view), port a React + `@lark-opdev/block-bitable-api` data layer, preview live in-Base, then upload + release.
---

# Lark Base View Builder

Build a **custom Data Table View extension** for a Lark/Feishu Base: the user opens it as a new "view" on a table, and it renders your own React UI that reads and writes that table's records through the Base SDK.

This skill encodes a battle-tested end-to-end workflow. Follow the phases in order. Each phase links to a reference file with exact commands, gotchas, and templates — **read the linked reference before executing that phase.**

## Language (always)
**Detect the user's language from their messages and respond + work in that language for the entire session.** If the user writes in Vietnamese, reply in Vietnamese; in Chinese, reply in Chinese; in English, English; etc. This applies to all explanations, questions, plans, summaries, and confirmations. If they switch languages mid-session, switch with them. Keep code identifiers, commands, file paths, and Base field names verbatim (don't translate them) — only the prose around them follows the user's language. The reference files here are in English for portability; translate their guidance into the user's language when you speak to the user.

## When to use
- "Create a Base view / extension", "turn this Base table into a custom UI / form / review panel", "make a table-view plugin", "build a quick-entry view over my renewal table", etc.
- The user has (or will share) an existing Base to use as the data source and schema.

## Prerequisites (check first, install what's missing)
- **Node 18+** and npm.
- **lark-cli** (`@larksuite/cli`) — read Base schema/data via Open API. Verify: `npx --no-install @larksuite/cli auth status`. If not logged in, run the `lark-cli-setup` skill first.
- **opdev CLI** (`@lark-opdev/cli`) — scaffold/preview/upload the extension. Install: `npm install @lark-opdev/cli@latest -g`. The binary may land in `~/.npm-global/bin` (not on PATH) — use the full path or `export PATH="$HOME/.npm-global/bin:$PATH"`.
- A **Chrome with the Claude-in-Chrome extension** is very helpful for in-Base preview and for resolving a share link to an `app_token` (optional but recommended).

> **This skill needs a custom app with a specific capability — unlike most other lark-* skills.**
> Most Lark skills only need `lark-cli` authenticated (a bot or user identity with API scopes). This
> one additionally needs a **custom app in the Developer Console with the "Base Extension → Data
> Table View" capability enabled** — that's what lets the extension be added as a view on a table at
> all. If you don't have one yet, that's fine: Phase 3 walks you through creating it. If you already
> have one, have its **App ID** and **BlockTypeID** ready.

> **Platform note:** Feishu (open.feishu.cn, *.feishu.cn) and Lark (open.larksuite.com, *.larkoffice.com) are separate. `opdev login -e lark` vs `-e feishu` must match the tenant. A custom app lives in ONE tenant; to use the view on another tenant you re-create the app there (the extension code is reusable).

## The workflow (5 phases)

### Phase 1 — Requirements & UI plan  → `references/01-requirements-and-plan.md`
0. If the user already filled `references/00-view-request-template.md` (or pasted its content / attached a mockup image), read it directly and only ask about gaps — skip re-asking what's already answered.
1. Get the **sample Base** from the user (share link or `app_token`). This is both the data source and the schema contract.
2. **Plan the UI together** before any code. For every piece of data decide its role:
   - **Displayed (read-only)** — shown from a Base column as-is.
   - **Editable** — user edits it; written back on Save.
   - **Estimated (preview)** — computed client-side for guidance and NOT written (e.g. `ARR = license × price × 12`, `growth = (arr2026−arr2025)/arr2025`). After Save, the Base's own formula fields recompute these for real.
   - **Fixed** — a constant or a Base column shown as a fixed reference (e.g. "Fixed price").
   Record the plan (layout, field roles, save targets, warnings) and confirm with the user.

### Phase 2 — Read the real schema  → `references/02-read-schema-lark-cli.md`
Resolve the share link to `app_token` + `table_id`, then `lark-cli base +field-list` to get exact field **names, types, and select options**, and sample a few records to learn each cell's **runtime value shape**. Field names must match exactly (or by prefix) — this is the #1 source of "empty UI" bugs.

### Phase 3 — Create app + scaffold  → `references/03-scaffold-opdev.md`
Create the custom app in the Developer Console, add capability **Base Extension → Data Table View**, copy the **App ID** + **BlockTypeID**. Then scaffold:
```
opdev login -e lark            # or -e feishu
opdev create ./<name> -a bitable-extensions -s table-view -t table-view-task-manager
```
The reference documents the exact interactive prompts and how to drive them.

### Phase 4 — Port the data layer + build the UI  → `references/04-data-layer-and-ui.md`
Drop the generic data layer (`assets/`) into `src/`, fill the `FIELDS` map from Phase 2, and build the UI to match the Phase 1 plan. The data layer already handles every gotcha (formula/lookup arrays, flexible field-name matching, CSS-in-iframe). Read `references/sdk-cheatsheet.md` for the SDK API and value shapes.

### Phase 5 — Preview, upload, release  → `references/05-preview-and-publish.md`
`npm run dev` → open the printed debug URL in the Base → add the extension as a view → verify with real data → `npm run upload` → create a version + apply for release in the Console.

## Critical gotchas (read before coding)  → `references/gotchas.md`
The non-obvious failures that cost the most time:
- Fresh scaffold's `npm run dev` crashes on `WebpackBar`; `dev`/`preview` exits without a `url` in `block.json`.
- The opdev SDK value shapes: **formula & lookup cells come back as ARRAYS** (`Month → [3]`), select cells are `{id,text}`, text cells are `IOpenSegment[]`.
- Standalone `localhost:8080` never renders — preview ONLY through the in-Base debug URL.
- CSS must be injected as a `<style>` string inside the React tree to apply inside the extension iframe.
- Field names differ across Bases ("Dự báo tái ký" vs "Dự báo tái ký (đầu quý)") → use the included flexible `resolveMeta` matcher.
- Blank page right after release = CDN propagation delay → hard-reload.

## Golden rules
- **Never modify the user's Base data** while exploring. lark-cli `field-list` / `record-list` are read-only; use them. Only the extension's Save (user-initiated) writes.
- **The extension binds to Base columns by name.** A different Base works only if its field names match (exactly or by prefix). For true multi-Base reuse, expose a field-mapping config.
- Estimated/preview values are client-side only; the source of truth stays the Base's formula fields, which recompute after Save.
