import React from 'react';

// Render CSS as a <style> inside the React tree so it applies inside the extension iframe.
// Put <Style/> at the top of EVERY returned tree (including the loading state).
// Keep your component CSS here as a template string, or import a string from elsewhere.
export const APP_CSS = `
* { box-sizing: border-box; }
:root { --blue:#1456f0; --blue-soft:#eaf0ff; --ink:#1f2329; --muted:#646a73; --line:#e4e6eb; --bg:#f5f6f7; --green:#1a7f5a; }
body { margin:0; background:var(--bg); color:var(--ink); font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif; font-size:14px; }
.app { height:100vh; display:flex; flex-direction:column; }
.layout { flex:1; display:grid; grid-template-columns:320px 1fr; min-height:0; }
.list-pane { border-right:1px solid var(--line); background:#fff; padding:16px; overflow-y:auto; }
.detail-pane { padding:22px 26px; overflow-y:auto; }
.search { width:100%; padding:8px 10px; border:1px solid var(--line); border-radius:8px; font-size:13px; }
.chips { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0; }
.chip { border:1px solid var(--line); background:#fff; border-radius:999px; padding:4px 12px; font-size:12px; color:var(--muted); cursor:pointer; }
.chip.on { background:var(--blue-soft); border-color:var(--blue); color:var(--blue); font-weight:600; }
.list-item { display:flex; justify-content:space-between; align-items:center; gap:8px; width:100%; text-align:left; border:1px solid transparent; background:none; border-radius:8px; padding:10px; cursor:pointer; }
.list-item.active { background:var(--blue-soft); border-color:#cfdcff; }
.btn-primary { background:var(--blue); color:#fff; border:none; border-radius:8px; padding:9px 22px; font-weight:600; cursor:pointer; }
.btn-primary:disabled { opacity:.45; cursor:not-allowed; }
.muted { color:var(--muted); }
/* …add the rest of your component styles here… */
`;

export const Style = () => <style dangerouslySetInnerHTML={{ __html: APP_CSS }} />;
