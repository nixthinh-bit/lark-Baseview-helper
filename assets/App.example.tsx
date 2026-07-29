// REFERENCE IMPLEMENTATION (renewal-updater style). Copy + adapt to your Phase-1 plan.
// Demonstrates: two-pane layout, dynamic month + status chips, combined filter,
// editable inputs, client-side ESTIMATES (ARR ×12, growth), dirty-aware Save, warnings.
// Assumes datalayer FIELDS/READ_SPEC/WRITE_SPEC include: id, month, status,
// license25, price25, arr25, license26(editable), price26(editable), reason(editable), status(editable), fixedPrice.
import { useEffect, useMemo, useState } from 'react';
import { loadRows, getSelectOptions, saveRecord, isMock, type Row } from './lib/datalayer';
import { num, previewArr, growthPct, pct, badgeColor } from './lib/calc';
import { Style } from './Style';

const ALL = '__all__';
type Draft = { license26: number | null; price26: number | null; reason: string; status: string | null };
const draftOf = (r: Row): Draft => ({ license26: r.license26, price26: r.price26, reason: r.reason, status: r.status?.id ?? null });
const dirty = (r: Row, d: Draft) =>
  r.license26 !== d.license26 || r.price26 !== d.price26 || r.reason !== d.reason || (r.status?.id ?? null) !== d.status;

export default function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [monthF, setMonthF] = useState(ALL);
  const [statusF, setStatusF] = useState(ALL);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { (async () => {
    const [r, o] = await Promise.all([loadRows(), getSelectOptions('status')]);
    setRows(r); setOptions(o); setLoading(false);
    if (r.length) select(r[0], r);
  })(); }, []);

  const selected = rows.find((r) => r.recordId === selId) ?? null;
  function select(r: Row, list = rows) {
    if (selId && draft) { const cur = list.find((x) => x.recordId === selId);
      if (cur && dirty(cur, draft) && !confirm('Unsaved changes — discard?')) return; }
    setSelId(r.recordId); setDraft(draftOf(r)); setMsg(null);
  }
  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const months = useMemo(() => [...new Set(rows.map((r) => r.month).filter((m) => m != null))].sort((a, b) => a - b), [rows]);
  const filtered = useMemo(() => rows.filter((r) =>
    (monthF === ALL || r.month === Number(monthF)) &&
    (statusF === ALL || r.status?.id === statusF) &&
    (!search || String(r.id).toLowerCase().includes(search.toLowerCase()))), [rows, monthF, statusF, search]);

  const arrPreview = draft ? previewArr(draft.license26, draft.price26) : null;          // license × price × 12
  const growthPreview = arrPreview != null ? growthPct(selected?.arr25 ?? null, arrPreview) : null;
  const isDirty = selected && draft ? dirty(selected, draft) : false;

  async function onSave() {
    if (!selected || !draft) return;
    setSaving(true);
    try {
      await saveRecord(selected.recordId, draft);
      const name = options.find((o) => o.id === draft.status)?.name ?? '';
      setRows((p) => p.map((r) => r.recordId === selected.recordId ? { ...r, ...draft, status: draft.status ? { id: draft.status, name } : null } : r));
      setMsg(isMock() ? 'Saved (DEMO)' : 'Saved to Base.');
    } catch (e) { setMsg('Save failed — maybe no edit permission. ' + (e as Error).message); }
    finally { setSaving(false); }
  }

  if (loading) return (<><Style /><div className="muted" style={{ padding: 24 }}>Loading…</div></>);

  return (
    <div className="app"><Style />
      <div className="layout">
        <aside className="list-pane">
          <h1>Update status</h1>
          <input className="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {months.length > 0 && <div className="chips">
            <button className={`chip ${monthF === ALL ? 'on' : ''}`} onClick={() => setMonthF(ALL)}>All months</button>
            {months.map((m) => <button key={m} className={`chip ${monthF === String(m) ? 'on' : ''}`} onClick={() => setMonthF(String(m))}>Month {m}</button>)}
          </div>}
          <div className="chips">
            <button className={`chip ${statusF === ALL ? 'on' : ''}`} onClick={() => setStatusF(ALL)}>All</button>
            {options.map((o) => <button key={o.id} className={`chip ${statusF === o.id ? 'on' : ''}`} onClick={() => setStatusF(o.id)}>{o.name}</button>)}
          </div>
          <div className="list">
            {filtered.map((r) => { const c = badgeColor(r.status?.name ?? ''); return (
              <button key={r.recordId} className={`list-item ${selId === r.recordId ? 'active' : ''}`} onClick={() => select(r)}>
                <span style={{ flex: 1, fontWeight: 600 }}>{r.id}</span>
                {r.month != null && <span className="muted" style={{ fontSize: 10 }}>M{r.month}</span>}
                <span style={{ background: c.bg, color: c.fg, fontSize: 11, padding: '2px 8px', borderRadius: 999 }}>{r.status?.name ?? 'None'}</span>
              </button>); })}
          </div>
        </aside>

        <main className="detail-pane">
          {!selected || !draft ? <p className="muted">Pick a record.</p> : <>
            <h2>{selected.id}</h2>
            <table style={{ width: '100%' }}><tbody>
              <tr><td>Licenses</td><td>{selected.license25 ?? '—'}</td><td><input type="number" value={draft.license26 ?? ''} onChange={(e) => patch({ license26: e.target.value === '' ? null : Number(e.target.value) })} /></td></tr>
              <tr><td>Price</td><td>{num(selected.price25)}</td><td><input type="number" value={draft.price26 ?? ''} onChange={(e) => patch({ price26: e.target.value === '' ? null : Number(e.target.value) })} /></td></tr>
              <tr><td>ARR (×12)</td><td>{num(selected.arr25)}</td><td style={{ color: 'var(--green)' }}>{arrPreview == null ? '—' : `≈ ${num(arrPreview)}`}</td></tr>
              <tr><td>% Growth (est.)</td><td>—</td><td style={{ color: 'var(--green)' }}>{growthPreview == null ? '—' : `≈ ${pct(growthPreview)}`}</td></tr>
            </tbody></table>
            <p className="muted">Fixed price: {selected.fixedPrice || '—'}</p>
            <label>Reason<textarea value={draft.reason} onChange={(e) => patch({ reason: e.target.value })} /></label>
            <label>Status
              <select value={draft.status ?? ''} onChange={(e) => patch({ status: e.target.value || null })}>
                <option value="">— select —</option>
                {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </label>
            {selected.license25 != null && draft.license26 != null && draft.license26 < selected.license25 && !draft.reason.trim() &&
              <div className="muted">License dropped — please add a reason.</div>}
            {msg && <div className="muted">{msg}</div>}
            <div className="save-bar">
              <span className="muted">{isDirty ? 'Unsaved changes' : 'No changes'}</span>
              <button className="btn-primary" disabled={!isDirty || saving} onClick={onSave}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </>}
        </main>
      </div>
    </div>
  );
}
