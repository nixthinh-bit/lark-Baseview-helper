# Install — lark-Baseview-helper

## 1. Prerequisites
- **Claude Code** (CLI, desktop, or IDE).
- **Node 18+** and npm.
- **`lark-cli`**, installed and authenticated.

**Never set up `lark-cli` before?** Send this one message to Claude Code — it installs the CLI, wires
up token auto-refresh, and walks you through the QR login:
```
Pull repo https://github.com/nixthinh-bit/lark-cli-onboarding giúp tôi, rồi kết nối lark-cli theo hướng dẫn trong đó.
```
(Or run the **lark-cli-setup** skill.)

Verify auth:
```bash
lark-cli auth status
# expect identities.user.tokenStatus == "valid"
```

## 2. Install the skill

```bash
git clone https://github.com/nixthinh-bit/lark-Baseview-helper.git \
  ~/.claude/skills/lark-baseview-helper
```

Or copy the folder into `~/.claude/skills/` (personal) or a plugin's `skills/` directory. Restart
your Claude Code session to load it.

## 3. Prepare before your first run
Have these ready (the skill will ask for anything missing):
1. `lark-cli` authenticated, `@lark-opdev/cli` installed (or let the skill install it).
2. The **sample Base** you want a view for — share link or `app_token`.
3. A **custom app** with the "Base Extension → Data Table View" capability (App ID + BlockTypeID), or
   Developer Console access so the skill can walk you through creating one. Unlike most other `lark-*`
   skills (which only need `lark-cli` auth), this one needs that capability enabled — it's what makes
   the extension installable as a Base view at all. See [README.md](README.md#before-you-start--what-to-prepare)
   for why.
4. A concrete description of the view — a reference image/mockup, and/or a filled copy of
   [`references/00-view-request-template.md`](references/00-view-request-template.md) (Vietnamese:
   [`00-view-request-template.vi.md`](references/00-view-request-template.vi.md)).

## 4. Use it
In Claude Code:
```
/lark-baseview-helper
```
The skill runs 5 phases: requirements & UI plan → read the real schema → create the app & scaffold →
port the data layer & build the UI → preview, upload, release. Read `SKILL.md` for the full playbook.

## Troubleshooting
- **"not logged in" / tokenStatus not valid** → run **lark-cli-setup** to (re)authenticate.
- **`opdev` not found after install** → it may land in `~/.npm-global/bin`; add it to `PATH` or use
  the full path.
- **Blank/empty UI after wiring `FIELDS`** → field names don't match the real Base exactly; re-check
  Phase 2's `field-list` output. See `references/gotchas.md`.
- **`npm run dev` crashes on `WebpackBar`, or preview never gets a `url`** → known fresh-scaffold
  issue, documented with the fix in `references/gotchas.md`.
