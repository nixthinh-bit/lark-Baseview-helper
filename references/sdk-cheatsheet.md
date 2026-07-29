# SDK cheatsheet — `@lark-opdev/block-bitable-api`

The opdev table-view template uses `@lark-opdev/block-bitable-api` (NOT the public `@lark-base-open/js-sdk`). Same concepts, granular API.

## Getting the table
No `getActiveTable()`. Use the selection:
```ts
import { bitable } from '@lark-opdev/block-bitable-api';
const sel = await bitable.base.getSelection();        // { tableId, viewId, recordId, fieldId }
const table = await bitable.base.getTableById(sel.tableId);
// also available: bitable.base.getTableByName(name), getTableMetaList()
```

## Reading
```ts
const metas = await table.getFieldMetaList();          // [{ id, name, type, property }]
const ids   = await table.getRecordIdList();           // (string|undefined)[]  ALL records (perm-filtered)
const cell  = await table.getCellValue(fieldId, recordId);
// select field options: meta.property.options = [{ id, name, color }]
```
Records respect the viewer's permissions automatically: `getRecordIdList` returns only visible records; `getCellValue` only readable fields. (For view-scoped records: `view.getVisibleRecordIdList()`.)

## Writing (Save)
```ts
await table.setRecord(recordId, { fields: { [fieldId]: value } });   // or setCellValue(fieldId, recordId, value)
```

## Cell VALUE SHAPES (the thing that bites you)
`getCellValue` returns different shapes per field type:
| Field type | Runtime shape | Extract |
|------------|---------------|---------|
| number | `number` | as-is |
| text | `IOpenSegment[]` = `[{type, text}]` | join `.text` |
| single select | `{ id, text }` | `.id`, `.text` |
| multi select | `{id,text}[]` | map |
| datetime | `number` (ms) | as-is |
| **formula** | `number \| string \| number[] \| IOpenSegment[] \| IOpenSingleCellValue[]` | **may be an ARRAY** — `Month → [3]`, `price → [9.6]` |
| **lookup** | array of single values | **ARRAY** — unwrap first / join |

→ Your `toStr`/`toNum` MUST unwrap arrays and bare-number elements, or formula/lookup fields silently become `null`/empty. (The provided `datalayer.ts` already does this.)

### Write shapes (setRecord `fields`)
- number → `number`
- text → `[{ type: IOpenSegmentType.Text, text }]`  (an `IOpenSegment[]`)
- single select → `{ id, text }`  (resolve `text` from the field's options)

## Record-list (lark-cli, for schema reading) vs SDK
The lark-cli REST `record-list` simplifies values (e.g. lookup `"12"`, formula `"3"`) and nests rows under `.data.data`. The in-Base **SDK wraps the same values as arrays/objects** as above. Always design `toStr`/`toNum` against the SDK shapes, and use lark-cli only to learn names/types/nullness.
