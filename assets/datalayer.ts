// ════════════════════════════════════════════════════════════════════════════
// GENERIC DATA LAYER — the ONLY file that touches the Lark Base SDK.
// Config-driven: edit FIELDS / READ_SPEC / WRITE_SPEC for your Base, the rest is reusable.
// Handles the gotchas: formula/lookup ARRAY values, flexible field-name matching,
// permission-safe reads, and out-of-Base DEMO fallback.
// ════════════════════════════════════════════════════════════════════════════
import { bitable, IOpenSegmentType, type IOpenCellValue, type IOpenSegment } from '@lark-opdev/block-bitable-api';

// ── 1) CONFIG: logical key -> exact Base field name (or shortest stable prefix) ──
export const FIELDS: Record<string, string> = {
  id: 'account_name',
  // month: 'Month',
  // status: 'Dự báo tái ký',          // prefix-matches 'Dự báo tái ký (đầu quý)'
  // license25: '2025 số license', price25: '2025 giá mỗi license', arr25: '2025 ARR',
  // license26: '2026 số license (Partner điền)', price26: '2026 giá mỗi license (partner điền)',
  // reason: 'Lý do (partner điền)', fixedPrice: 'Fixed price',
};

type Kind = 'str' | 'num' | 'select';
// How to interpret each field when LOADING (omit a key to skip it).
export const READ_SPEC: Record<string, Kind> = { id: 'str' };
// How to ENCODE each editable field when SAVING.
export const WRITE_SPEC: Record<string, 'num' | 'text' | 'select'> = {};

// ── module state ──
let table: any = null;
let metaByName = new Map<string, any>();
let mockMode = false;
export const isMock = () => mockMode;

// ── 2) Bind to the active table; timeout ⇒ not inside Base ⇒ DEMO mode ──
// Only this error means "not in Base". Anything else (permissions, a broken bridge)
// is a real failure and must reach the UI, never be hidden behind DEMO data.
class NotInBaseError extends Error {
  constructor() { super('not-in-base'); }
}
async function ensureTable(): Promise<void> {
  if (table) return;
  table = await Promise.race([
    (async () => {
      const sel = await bitable.base.getSelection();
      if (!sel.tableId) throw new Error('no-table-selected');
      return bitable.base.getTableById(sel.tableId);
    })(),
    // Generous timeout: a real in-Base session on a slow network/host bridge can take a
    // few seconds. Too short and a slow-but-real session gets misclassified as DEMO mode.
    new Promise((_, rej) => setTimeout(() => rej(new NotInBaseError()), 4000)),
  ]);
  const metas: any[] = await table.getFieldMetaList();
  metaByName = new Map(metas.map((m) => [m.name, m]));
  console.log('[view] Base fields:\n' + metas.map((m) => `  • ${m.name} (type ${m.type})`).join('\n'));
}

// ── 3) Flexible field matcher: exact → normalized(case/space) → prefix ──
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
function resolveMeta(name: string): any {
  const exact = metaByName.get(name);
  if (exact) return exact;
  const target = norm(name);
  let prefixHit: any;
  for (const [k, v] of metaByName) {
    const nk = norm(k);
    if (nk === target) return v;
    if (!prefixHit && nk.startsWith(target)) prefixHit = v;
  }
  return prefixHit;
}
function fid(key: string): string {
  const m = resolveMeta(FIELDS[key] ?? key);
  if (!m) console.warn('[view] field not found:', key, '->', FIELDS[key]);
  return m?.id ?? '';
}

// ── 4) Value normalizers — MUST unwrap arrays (formula/lookup) and bare numbers ──
function segStr(s: any): string {
  if (s == null) return '';
  if (typeof s === 'string') return s;
  if (typeof s === 'number') return String(s);
  if (typeof s === 'object') return s.text ?? s.name ?? (s.value != null ? toStr(s.value) : '');
  return '';
}
export function toStr(v: any): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map(segStr).join('');
  if (typeof v === 'object') return v.text ?? v.name ?? (v.value != null ? toStr(v.value) : '');
  return String(v);
}
export function toNum(v: any): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v;
  if (Array.isArray(v)) return v.length ? toNum(v[0]) : null;     // formula: [3] -> 3
  if (typeof v === 'object' && v.value != null) return toNum(v.value);
  let t = toStr(v).trim();
  // When both '.' and ',' appear, the LAST one is the decimal separator — covers both
  // "1,234.56" (en-US) and "1.234,56" (vi-VN/European); strip the other as a thousands separator.
  const lastComma = t.lastIndexOf(',');
  const lastDot = t.lastIndexOf('.');
  if (lastComma !== -1 && lastDot !== -1) {
    t = lastComma > lastDot ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  }
  t = t.replace(/[^\d.-]/g, '');
  if (!t) return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}

/** Single/multi-select cell -> { id, name }, unwrapping the array shape lookup/formula cells use. */
export function toSelect(v: any): { id: string; name: string } | null {
  if (v == null) return null;
  const item = Array.isArray(v) ? (v.length ? v[0] : null) : v;
  if (item == null) return null;
  return { id: (item as any).id, name: (item as any).text ?? (item as any).name };
}

// ── 5) Public API ──
export type Row = { recordId: string } & Record<string, any>;

// Max SDK calls in flight. Firing one call per record all at once floods the host
// bridge on big tables, and the resulting timeouts look like real failures.
const CONCURRENCY = 20;
async function mapLimit<T, R>(items: T[], fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return out;
}

/**
 * Load all visible records, each as { recordId, <key>: value } per READ_SPEC.
 * Falls back to `demoRows` ONLY when not running inside a Base; any other error
 * (no permission, SDK failure) is thrown so the UI can show it.
 */
export async function loadRows(demoRows: Row[] = []): Promise<Row[]> {
  try {
    await ensureTable();
  } catch (e) {
    if (!(e instanceof NotInBaseError)) throw e;
    mockMode = true;
    console.warn('[view] DEMO mode (not in Base)');
    return demoRows;
  }
  // Resolve field ids once, not per record.
  const cols = Object.entries(READ_SPEC).map(([key, kind]) => ({ key, kind, id: fid(key) }));
  const ids: (string | undefined)[] = await table.getRecordIdList();
  return mapLimit(
    ids.filter((x): x is string => !!x),
    async (recordId) => {
      // One call per record (all fields) instead of one per record × field.
      const { fields } = await table.getRecordById(recordId);
      const row: Row = { recordId };
      for (const { key, kind, id } of cols) {
        const raw: IOpenCellValue = id ? fields[id] ?? null : null;
        row[key] =
          kind === 'num' ? toNum(raw)
          : kind === 'select' ? toSelect(raw)
          : toStr(raw);
      }
      return row;
    },
  );
}

/** Options of a single-select field, for filter chips / dropdowns. */
export async function getSelectOptions(key: string): Promise<{ id: string; name: string }[]> {
  try {
    await ensureTable();
  } catch (e) {
    if (!(e instanceof NotInBaseError)) throw e;
    mockMode = true;
    return [];
  }
  const opts: any[] = resolveMeta(FIELDS[key] ?? key)?.property?.options ?? [];
  return opts.map((o) => ({ id: o.id, name: o.name }));
}

/**
 * Save editable fields (keys must be in WRITE_SPEC). select value = option id.
 * Throws, writing nothing, if any key is not in WRITE_SPEC or its field can't be
 * found in the Base, so a renamed field never turns into a silent partial save.
 */
export async function saveRecord(recordId: string, values: Record<string, any>): Promise<void> {
  if (mockMode) { console.log('[view][DEMO] save', recordId, values); return; }
  await ensureTable();
  const bad = Object.keys(values).filter((key) => !WRITE_SPEC[key] || !fid(key));
  if (bad.length) {
    throw new Error(`Not saved: field(s) not editable or not found in this Base: ${bad.join(', ')}`);
  }
  const fields: Record<string, IOpenCellValue> = {};
  for (const [key, val] of Object.entries(values)) {
    const id = fid(key);
    const kind = WRITE_SPEC[key];
    if (kind === 'num') fields[id] = (val ?? null) as IOpenCellValue;
    else if (kind === 'text') {
      const segs: IOpenSegment[] = val ? [{ type: IOpenSegmentType.Text, text: String(val) }] : [];
      fields[id] = segs as unknown as IOpenCellValue;
    } else if (kind === 'select') {
      if (val) {
        const opt = (resolveMeta(FIELDS[key] ?? key)?.property?.options ?? []).find((o: any) => o.id === val);
        fields[id] = { id: val, text: opt?.name ?? '' } as IOpenCellValue;
      } else {
        // Explicitly clear — mirrors the 'text' branch's `[]`. Omitting the key here
        // (like the old code did) leaves the Base's previous value untouched.
        fields[id] = null as unknown as IOpenCellValue;
      }
    }
  }
  await table.setRecord(recordId, { fields });
}
