# lark-Baseview-helper

*English below · **[Tiếng Việt ở cuối trang](#tiếng-việt)** · the skill replies in whatever language
you write in.*

A Claude Code skill that builds a **custom Lark/Feishu Base "Data Table View" extension** from an
existing Base: you open it as a new view on a table, and it renders your own React UI — reading and
writing that table's records through the Base SDK. Think custom forms, review panes, side-by-side
comparison views, quick-entry screens — anything a plain grid view can't do.

> Trigger: **`/lark-baseview-helper`** · Bilingual EN/VI · Read-only on your Base until you hit Save
> inside the built extension

## Why

A Base grid is great for raw data, but not for a guided workflow — comparing two years side by side,
flagging anomalies before save, or giving one field group its own screen. This skill encodes the
full, battle-tested path from "I have a Base and an idea" to a released extension: plan the fields →
read the real schema → scaffold the app → port a proven data layer → preview live inside the Base →
upload and release. It has already shipped a renewal-comparison view end to end, and the 10 gotchas
that cost the most time along the way are written down so you don't hit them again.

---

## What it does — 5 phases

1. **Requirements & UI plan** — you describe the view; every field is classified as **Displayed**
   (read-only), **Editable** (written on Save), **Estimated** (computed client-side for preview, not
   written — the Base's own formula recomputes it after Save), or **Fixed** (constant/reference).
2. **Read the real schema** — resolves your share link to `app_token`/`table_id`, pulls exact field
   names/types/select-options with `lark-cli` (read-only), and samples a few records to learn each
   cell's runtime shape.
3. **Create the app + scaffold** — walks you through the Developer Console (capability: Base
   Extension → Data Table View) and scaffolds the project with `opdev`.
4. **Port the data layer + build the UI** — drops in a generic, config-driven data layer that already
   handles the non-obvious SDK gotchas (formula/lookup arrays, flexible field-name matching, CSS
   inside an iframe), then builds the UI to match your plan.
5. **Preview, upload, release** — live preview inside the real Base, then `opdev upload` and a
   release through the Console.

## Before you start — what to prepare

Having these ready turns the first conversation from a long interview into a quick confirmation.
Nothing here is strictly mandatory except the Base — the skill will ask for whatever's missing — but
the more you bring, the faster Phase 1 goes.

| # | What | Why it's needed |
|---|------|------------------|
| 1 | **`lark-cli` installed and authenticated** (`@larksuite/cli`) | Reads the Base schema and sample records read-only in Phase 2. First time? Run the **lark-cli-setup** skill. |
| 2 | **`opdev` CLI** (`@lark-opdev/cli`) — the skill installs it if missing | Scaffolds, previews, and uploads the extension in Phases 3 & 5. |
| 3 | **The Base you want to build a view for** — a share link or `app_token` | The data source *and* the schema contract: field names in your plan must match this Base exactly. |
| 4 | **A custom app** — either one you already made (App ID + BlockTypeID with the "Base Extension → Data Table View" capability), or Developer Console access so the skill can walk you through creating one | The extension is installed and previewed through this app. Know which tenant — Lark (larksuite.com/larkoffice.com) or Feishu (feishu.cn) — it lives on. |
| 5 | **A concrete description of the view you want** — a reference image/mockup/screenshot of a similar tool, **and/or** a filled copy of [`references/00-view-request-template.md`](references/00-view-request-template.md) | This is the part worth doing right. See below. |

> **About #4 — this is different from most other `lark-*` skills.** Skills like `lark-base-architect`
> or `lark-anybase-report` only need `lark-cli` authenticated (a bot/user identity with API scopes) —
> no separate app to configure. This skill is different: because the output is an **installable Base
> extension**, it needs a **custom app in the Lark/Feishu Developer Console with the "Base Extension →
> Data Table View" capability explicitly enabled**. That capability is what makes "add as a view on a
> table" show up as an option at all. You can either bring an app that already has it (its **App ID**
> and **BlockTypeID**), or let the skill walk you through turning it on for a new or existing app in
> Phase 3 — but either way, this is a one-time setup step this skill needs that most other Lark skills
> don't.

### How to describe the view so Claude reads it fastest

A picture communicates layout; it doesn't say *which exact Base column* feeds *which piece of UI*, or
what's allowed to be edited. Bring both if you can:

- **Visual reference** — a screenshot, a Figma/mockup link, or even a phone photo of a hand-drawn
  sketch. Attach it directly in chat.
- **Structured field plan** — fill
  [`references/00-view-request-template.md`](references/00-view-request-template.md) (Vietnamese:
  [`00-view-request-template.vi.md`](references/00-view-request-template.vi.md)). It's plain Markdown
  headers and tables — the format an AI parses fastest and most reliably, faster than free-form
  prose. The core of it is one table, one row per field:

  | Base column name | Role | Notes |
  |---|---|---|
  | `account_name` | Displayed | primary identifier, shown in the left list |
  | `license` | Editable | number |
  | `ARR` | Estimated | `license × price × 12`, not written — Base formula recomputes after Save |
  | `Fixed price` | Fixed | shown as read-only reference |

  Don't want to fill a form? Just describe it in a sentence or two, or paste an image — the skill
  interviews you from there (Phase 1). The template just makes that conversation shorter when you
  already know the answers.

## Safety

- **Never modifies your Base data while exploring.** Schema/record reads in Phases 1–2 are read-only.
  The only write path is the extension's own Save button, which you build and trigger yourself.
- **Base access only via `lark-cli`** (Open API) and, once built, the extension's own Base SDK calls
  — no browser scraping of Base URLs.
- **Field binding is by name.** Reusing the extension on a different Base only works if that Base's
  field names match (exactly or by prefix); for true multi-Base reuse, expose a field-mapping config.

## Requirements

- [Claude Code](https://claude.com/claude-code)
- Node 18+ and npm.
- `lark-cli` (`@larksuite/cli`), authenticated.
- `@lark-opdev/cli` (the skill can install it for you).
- A Lark/Feishu tenant where you can create a custom app (Developer Console).
- A sample Base — share link or `app_token`.
- Optional but recommended: Chrome with the Claude-in-Chrome extension, for in-Base preview and
  resolving share links.

## Install

As a personal skill:
```bash
git clone https://github.com/nixthinh-bit/lark-Baseview-helper.git \
  ~/.claude/skills/lark-baseview-helper
```
Or copy the folder into `~/.claude/skills/` (personal) or a plugin's `skills/` directory. Restart
your Claude Code session, then say "create a Lark Base view" or invoke `/lark-baseview-helper`.

**First time with `lark-cli`?** Send this one message to Claude Code:
```
Pull repo https://github.com/nixthinh-bit/lark-cli-onboarding giúp tôi, rồi kết nối lark-cli theo hướng dẫn trong đó.
```
(Or run the **lark-cli-setup** skill.)

## Repo layout

```
SKILL.md                              the playbook (5 phases) — start here; loaded at runtime
references/
  00-view-request-template.md         fill-in-advance template for the view you want (English)
  00-view-request-template.vi.md      same template (Vietnamese)
  01-requirements-and-plan.md         Phase 1: sample Base + classify every field
  02-read-schema-lark-cli.md          Phase 2: resolve token, field-list, sample records (read-only)
  03-scaffold-opdev.md                Phase 3: Console app + `opdev create` flags & prompts
  04-data-layer-and-ui.md             Phase 4: wire FIELDS, build the UI
  05-preview-and-publish.md           Phase 5: dev preview → upload → release
  sdk-cheatsheet.md                   @lark-opdev/block-bitable-api API + cell value shapes
  gotchas.md                          the 10 non-obvious failures + fixes
assets/
  datalayer.ts                        generic, config-driven SDK data layer (handles all gotchas)
  calc.ts                             formatting + client-side estimate helpers
  style-inject.tsx                    CSS-as-<style> (required for iframe styling)
  App.example.tsx                     full reference UI (two-pane, filters, estimates, save)
scripts/
  read-schema.sh                      Phase 2 helper
```

## License

MIT — see [LICENSE](LICENSE).

---

## Tiếng Việt

Một skill cho Claude Code, dùng để build một **extension "Data Table View" tuỳ chỉnh cho Lark/Feishu
Base** từ một Base có sẵn: bạn mở nó như một view mới trên bảng, và nó hiển thị giao diện React của
riêng bạn — đọc và ghi record của bảng đó qua Base SDK. Nghĩ tới form tuỳ chỉnh, màn hình review, view
so sánh cạnh nhau, màn hình nhập nhanh — bất cứ thứ gì view lưới bình thường không làm được.

> Kích hoạt: **`/lark-baseview-helper`** · Song ngữ Anh/Việt · Chỉ đọc Base cho tới khi bạn bấm Save
> bên trong extension đã build

### Vì sao

View lưới của Base rất tốt cho dữ liệu thô, nhưng không hợp cho quy trình có hướng dẫn — so sánh hai
năm cạnh nhau, gắn cờ bất thường trước khi lưu, hay cho một nhóm trường màn hình riêng. Skill này đóng
gói toàn bộ đường đi đã được thử lửa từ "mình có một Base và một ý tưởng" tới một extension đã release:
lên kế hoạch trường → đọc schema thật → scaffold app → gắn data layer đã kiểm chứng → xem trước trực
tiếp trong Base → upload và release. Nó đã từng build xong một view so sánh tái ký từ đầu tới cuối, và
10 gotcha tốn thời gian nhất trên đường đi đã được ghi lại để bạn không dính lại.

### Skill làm gì — 5 giai đoạn

1. **Yêu cầu & kế hoạch UI** — bạn mô tả view; mỗi trường được phân vào đúng một vai trò: **Displayed**
   (chỉ đọc), **Editable** (ghi lại khi Save), **Estimated** (tính trên client để xem trước, không ghi
   lại — công thức của Base tự tính lại sau khi Save), hoặc **Fixed** (hằng số/tham chiếu).
2. **Đọc schema thật** — chuyển link chia sẻ thành `app_token`/`table_id`, lấy đúng tên trường/kiểu/tuỳ
   chọn select bằng `lark-cli` (chỉ đọc), và lấy mẫu vài record để biết hình dạng giá trị thực tế.
3. **Tạo app + scaffold** — hướng dẫn bạn qua Developer Console (capability: Base Extension → Data
   Table View) và scaffold project bằng `opdev`.
4. **Gắn data layer + build UI** — đưa vào một data layer chung, cấu hình được, đã xử lý sẵn các
   gotcha khó thấy của SDK (mảng formula/lookup, khớp tên trường linh hoạt, CSS trong iframe), rồi
   build UI theo đúng kế hoạch của bạn.
5. **Xem trước, upload, release** — xem trước trực tiếp trong Base thật, rồi `opdev upload` và release
   qua Console.

### Trước khi bắt đầu — cần chuẩn bị gì

Chuẩn bị sẵn những thứ này biến cuộc trò chuyện đầu tiên từ một buổi phỏng vấn dài thành một lượt xác
nhận nhanh. Không có gì ở đây là bắt buộc tuyệt đối ngoài cái Base — skill sẽ hỏi thêm nếu thiếu — nhưng
bạn mang càng nhiều, Phase 1 càng nhanh.

| # | Cái gì | Vì sao cần |
|---|--------|------------|
| 1 | **`lark-cli` đã cài & đăng nhập** (`@larksuite/cli`) | Đọc schema Base và record mẫu (chỉ đọc) ở Phase 2. Lần đầu? Chạy skill **lark-cli-setup**. |
| 2 | **CLI `opdev`** (`@lark-opdev/cli`) — skill tự cài nếu thiếu | Scaffold, xem trước, upload extension ở Phase 3 & 5. |
| 3 | **Base bạn muốn tạo view** — link chia sẻ hoặc `app_token` | Vừa là nguồn dữ liệu, vừa là hợp đồng schema: tên trường trong kế hoạch phải khớp chính xác với Base này. |
| 4 | **Custom app** — hoặc app bạn đã tạo sẵn (App ID + BlockTypeID có capability "Base Extension → Data Table View"), hoặc quyền Developer Console để skill hướng dẫn tạo mới | Extension được cài và xem trước qua app này. Xác định rõ tenant — Lark (larksuite.com/larkoffice.com) hay Feishu (feishu.cn). |
| 5 | **Mô tả cụ thể về view bạn muốn** — ảnh tham chiếu/mockup/screenshot của công cụ tương tự, **và/hoặc** một bản đã điền của [`references/00-view-request-template.vi.md`](references/00-view-request-template.vi.md) | Đây là phần đáng đầu tư nhất. Xem bên dưới. |

> **Về mục #4 — cái này khác với hầu hết các skill `lark-*` khác.** Các skill như
> `lark-base-architect` hay `lark-anybase-report` chỉ cần `lark-cli` đã đăng nhập (định danh
> bot/user có scope API) — không cần cấu hình app riêng. Skill này thì khác: vì đầu ra là một
> **Base extension cài đặt được**, nó cần một **custom app trong Developer Console của Lark/Feishu có
> bật rõ capability "Base Extension → Data Table View"**. Chính capability đó khiến tuỳ chọn "thêm
> làm view trên một bảng" hiện ra được. Bạn có thể mang sẵn một app đã có capability này (App ID +
> BlockTypeID), hoặc để skill hướng dẫn bật nó cho app mới/app có sẵn ở Phase 3 — nhưng dù theo cách
> nào, đây là bước thiết lập một lần mà skill này cần, khác với hầu hết skill Lark khác.

#### Cách mô tả view để Claude đọc nhanh nhất

Một tấm ảnh truyền đạt bố cục; nhưng không nói được *chính xác cột Base nào* nuôi *phần UI nào*, hay
thứ gì được phép sửa. Mang cả hai nếu có thể:

- **Tham chiếu hình ảnh** — ảnh chụp màn hình, link Figma/mockup, hoặc thậm chí ảnh chụp bản vẽ tay.
  Đính kèm trực tiếp trong chat.
- **Kế hoạch trường có cấu trúc** — điền
  [`references/00-view-request-template.vi.md`](references/00-view-request-template.vi.md) (tiếng
  Anh: [`00-view-request-template.md`](references/00-view-request-template.md)). Đây là Markdown
  thuần với tiêu đề + bảng — định dạng AI đọc nhanh và chính xác nhất, nhanh hơn văn xuôi tự do. Cốt
  lõi là một bảng, mỗi dòng một trường:

  | Tên cột Base | Vai trò | Ghi chú |
  |---|---|---|
  | `account_name` | Displayed | định danh chính, hiện ở danh sách bên trái |
  | `license` | Editable | số |
  | `ARR` | Estimated | `license × price × 12`, không ghi lại — công thức Base tự tính lại sau khi Save |
  | `Fixed price` | Fixed | hiện như tham chiếu chỉ đọc |

  Không muốn điền form? Chỉ cần mô tả trong một hai câu, hoặc dán ảnh — skill sẽ hỏi tiếp từ đó (Phase
  1). Template chỉ giúp cuộc trò chuyện đó ngắn hơn khi bạn đã biết sẵn câu trả lời.

### An toàn

- **Không bao giờ sửa dữ liệu Base khi đang khảo sát.** Việc đọc schema/record ở Phase 1–2 chỉ đọc.
  Đường ghi duy nhất là nút Save của chính extension, do bạn build và tự bấm.
- **Chỉ truy cập Base qua `lark-cli`** (Open API) và, sau khi build xong, qua chính lời gọi Base SDK
  của extension — không scrape trình duyệt trên URL Base.
- **Gắn trường theo tên.** Dùng lại extension trên Base khác chỉ chạy nếu tên trường của Base đó khớp
  (chính xác hoặc theo tiền tố); muốn tái sử dụng nhiều Base thật sự, cần thêm config ánh xạ trường.

### Yêu cầu

- [Claude Code](https://claude.com/claude-code)
- Node 18+ và npm.
- `lark-cli` (`@larksuite/cli`), đã đăng nhập.
- `@lark-opdev/cli` (skill có thể tự cài giúp bạn).
- Một tenant Lark/Feishu mà bạn tạo được custom app (Developer Console).
- Một Base mẫu — link chia sẻ hoặc `app_token`.
- Khuyến khích (không bắt buộc): Chrome có extension Claude-in-Chrome, để xem trước trong Base và
  resolve link chia sẻ.

### Cài đặt

Cài như một skill cá nhân:
```bash
git clone https://github.com/nixthinh-bit/lark-Baseview-helper.git \
  ~/.claude/skills/lark-baseview-helper
```
Hoặc copy thư mục vào `~/.claude/skills/` (cá nhân) hoặc thư mục `skills/` của một plugin. Khởi động
lại phiên Claude Code, rồi nói "tạo view cho Base" hoặc gõ `/lark-baseview-helper`.

**Lần đầu dùng `lark-cli`?** Nhắn đúng một câu này cho Claude Code:
```
Pull repo https://github.com/nixthinh-bit/lark-cli-onboarding giúp tôi, rồi kết nối lark-cli theo hướng dẫn trong đó.
```
(Hoặc chạy skill **lark-cli-setup**.)

### License

MIT — xem [LICENSE](LICENSE).
