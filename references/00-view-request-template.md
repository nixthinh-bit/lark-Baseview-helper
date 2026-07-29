# View request template

> Fill in what you can, in plain language — you don't need to know React or the Base SDK. This file
> is optimized to be **read directly by Claude** (structured headers + tables parse faster and more
> reliably than a paragraph), so the more of it you fill before starting, the fewer interview
> questions Phase 1 needs to ask. Leave anything unclear blank or write "not sure" — the skill will
> ask.
>
> **A picture is worth a thousand words here too.** If you have a screenshot, a mockup (Figma,
> PowerPoint, even a phone photo of a hand-drawn sketch), or a link to a similar view someone already
> built, attach or paste the image/link in Part D. It's the fastest way to communicate layout — the
> table in Part C nails down exactly *which Base column* feeds *which piece of UI* and what happens
> to it on Save, which an image alone can't show.

---

## Part A — The sample Base
- **Share link or `app_token`:** …
  (e.g. `https://<tenant>.larkoffice.com/share/base/view/shr...` or the canonical
  `.../base/<app_token>?table=<table_id>&view=<view_id>` link)
- **Table name / `table_id` (if you know it):** …
- **Tenant:** Lark (larksuite.com / larkoffice.com) or Feishu (feishu.cn)? — …

## Part B — The custom app
- **Do you already have a custom app with the "Base Extension → Data Table View" capability?**
  - Yes → **App ID:** … **BlockTypeID:** …
  - No → that's fine, the skill walks you through creating one in the Developer Console (Phase 3).
- **Do you have Developer Console access on this tenant** (to create/manage the app)? yes / no / not sure

## Part C — Field plan  ← most important part
List every piece of data the view touches. One row per field. This table becomes the `FIELDS` map
directly, so exact Base column names matter.

| Base column name (exact) | Role | Notes (formula if Estimated, options if Select, etc.) |
|---------------------------|------|----------------------------------------------------------|
| e.g. `account_name` | Displayed | primary identifier, shown in the left list |
| e.g. `license` | Editable | number |
| e.g. `price` | Editable | number |
| e.g. `ARR` | Estimated | `license × price × 12`, not written — Base formula recomputes after Save |
| e.g. `Fixed price` | Fixed | shown as read-only reference |
| e.g. `Status` | Editable | Select field — reuse the Base's existing options |
| … | … | … |

**Role legend** (pick exactly one per row):
- **Displayed** — read from a column, shown as-is, never written.
- **Editable** — user changes it in the UI; written back on Save.
- **Estimated** — computed client-side from other fields for instant feedback; NOT written (the
  Base's own formula field recomputes the real value after Save). Write the exact formula.
- **Fixed** — a constant, or a Base column always shown as a fixed reference (never edited).

## Part D — Layout & look
- **Primary identifier per row** (what the user picks from, e.g. account name / order number): …
- **List/left panel:** what shows in the list, and how it's filtered (search box? chips by
  month/status? dropdown?) — …
- **Detail/right panel:** what's grouped together, in what order (e.g. "compare 2025 vs 2026 side by
  side, then editable reason + status, then Save") — …
- **Warnings you want** (non-blocking hints, e.g. "flag if a value dropped but reason is empty",
  "flag negative values") — …
- **Reference image / mockup / similar existing view** (attach a screenshot, paste a Figma/image
  link, or name a view you've seen and liked, e.g. "like the renewal-updater view but for X"): …

---

### If you'd rather not fill this out
Totally fine — just describe what you want in a sentence or two, or paste a screenshot of a similar
tool, and the skill will ask the Phase 1 questions conversationally. This template just makes that
conversation faster when you already know the answers.
