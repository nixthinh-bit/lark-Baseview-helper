// Pure helpers for formatting + client-side ESTIMATES. Adjust formulas to your plan.

// Number with grouping separators: 3455.99 -> "3,455.99".
export function num(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// Estimated annual ARR = licenses × price-per-license × months. Reference only — NOT written;
// the Base's own ARR formula recomputes after Save. Confirm `months` against real data.
export const MONTHS_PER_YEAR = 12;
export function previewArr(license: number | null, price: number | null, months = MONTHS_PER_YEAR): number | null {
  if (license == null || price == null) return null;
  return license * price * months;
}

// Estimated growth % = (to − from) / from × 100. e.g. growthPct(arr2025, arrPreview2026).
export function growthPct(from: number | null, to: number | null): number | null {
  if (from == null || to == null || from === 0) return null;
  return ((to - from) / from) * 100;
}

// Format a growth number as a signed percent: 25 -> "+25.0%".
export function pct(n: number | null): string {
  if (n == null) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

// Deterministic badge color by name (for status chips/badges).
const PALETTE = [
  { bg: '#e9f7f0', fg: '#1a7f5a' }, { bg: '#eaf0ff', fg: '#1456f0' },
  { bg: '#fff1e8', fg: '#d9730d' }, { bg: '#fdeaea', fg: '#d83931' },
  { bg: '#f3ecfb', fg: '#7b3fe4' }, { bg: '#eef0f2', fg: '#646a73' },
];
export function badgeColor(name: string): { bg: string; fg: string } {
  if (!name) return PALETTE[5];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % (PALETTE.length - 1)];
}
