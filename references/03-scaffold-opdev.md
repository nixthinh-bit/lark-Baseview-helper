# Phase 3 — Create app + scaffold with opdev

## Step 1 — Create the custom app (Developer Console, manual)
opdev does NOT create the app registration; do this in the web Console:
1. Easiest entry: open the target Base → extension/widget panel → **"Developer / 开发"** — this routes to the correct Console for that tenant (avoids guessing feishu.cn vs larksuite.com).
2. Create a **custom app** (企业自建 / self-built).
3. Add capability **Base Extension (多维表格插件) → Data Table View (数据表视图)**.
4. Copy the **App ID** (`cli_...`) and **BlockTypeID** (`blk_...`).
5. Permissions: add `base:table:read`, `base:field:read`, `base:record:read`, and `base:record:update` (so Save can write). Get them approved.

## Step 2 — Login
```bash
export PATH="$HOME/.npm-global/bin:$PATH"
opdev login -e lark      # *.larkoffice.com → 'lark'; *.feishu.cn → 'feishu'
opdev whoami             # confirm User / Tenant / Environment
```
Login is OAuth (opens a browser) — the user completes it.

## Step 3 — Scaffold (non-interactive flags)
Discovered valid values: appType `bitable-extensions`; subtypes `record-view | automated-action | table-view`; table-view templates `table-view-task-manager` (React) | `table-view-vue`.
```bash
opdev create ./<project> -a bitable-extensions -s table-view -t table-view-task-manager
```
After the template downloads, `opdev create` asks **interactive prompts** (the flags don't cover these):

| Prompt | Answer |
|--------|--------|
| `Do you need to create a new application? (Y/n)` | **n** (you already created the app) |
| `Please enter appid` | your `cli_...` App ID |
| `Do you need to create a new block? (Y/n)` | **n** (you already have a BlockTypeID) |
| `Please enter blockTypeID` | your `blk_...` BlockTypeID |

### Driving the prompts non-interactively (optional)
inquirer drops piped input that arrives before a prompt renders, so feed answers **staggered** (let the build/download finish first):
```bash
( sleep 6;  printf 'n\n';                       # new application? -> No
  sleep 5;  printf 'cli_xxx\n';                  # appid
  sleep 5;  printf 'n\n';                         # new block? -> No
  sleep 5;  printf 'blk_xxx\n';                   # blockTypeID
  sleep 8 ) | opdev create ./<project> -a bitable-extensions -s table-view -t table-view-task-manager
```
On success it prints: `The project has been successfully created`. The generated `block.json` holds `blockTypeID`; opdev stores the appid in its own config (the dist build also writes `dist/project.config.json` with `appid`).

## Step 4 — Two mandatory template fixes (or dev breaks)
The fresh scaffold is built for an older webpack; before `npm run dev` works:
1. **Remove `new WebpackBar()`** from the dev plugins array in `config/webpack.config.js` (it feeds invalid options to ProgressPlugin and crashes `webpack-dev-server`). Change `[new ReactRefreshWebpackPlugin(), new WebpackBar()]` → `[new ReactRefreshWebpackPlugin()]`.
2. **Add a `url`** to `block.json` (the canonical Base URL) — otherwise the BitableAppWebpackPlugin prints `Create bitable failure. Please set url of bitable to 'url' property in block.json` and exits:
```json
{ "manifestVersion": 1, "blockTypeID": "blk_...", "projectName": "<name>",
  "url": "https://<tenant>.larkoffice.com/base/<APP_TOKEN>?table=<TABLE_ID>&view=<VIEW_ID>" }
```

Then `npm install` and proceed to Phase 4.
