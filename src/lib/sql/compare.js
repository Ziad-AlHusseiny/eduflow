// Compares a learner's SQL result with the reference solution's result.
// Same number of columns, same values row by row (numbers to 2 decimals,
// column names ignored); row order matters only when the exercise says so.

const norm = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' || typeof v === 'bigint') return Math.round(Number(v) * 100) / 100;
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) return Math.round(Number(v) * 100) / 100;
  return String(v);
};
const rowKey = (row) => JSON.stringify(row.map(norm));

/** The last result set of sql.js `db.exec()` output, as { columns, values }. */
export const lastResult = (sets) => (sets && sets.length ? sets[sets.length - 1] : { columns: [], values: [] });

/**
 * @returns {{ pass: boolean, reason: null | 'columns' | 'rows' | 'values' | 'order', expected: number, actual: number }}
 */
export function compareResults(expected, actual, orderMatters = false) {
  const e = expected ?? { columns: [], values: [] };
  const a = actual ?? { columns: [], values: [] };
  const base = { expected: e.values.length, actual: a.values.length };
  if (e.columns.length !== a.columns.length) return { pass: false, reason: 'columns', ...base, expectedColumns: e.columns.length, actualColumns: a.columns.length };
  if (e.values.length !== a.values.length) return { pass: false, reason: 'rows', ...base };
  const ek = e.values.map(rowKey);
  const ak = a.values.map(rowKey);
  if (orderMatters) {
    if (ek.every((k, i) => k === ak[i])) return { pass: true, reason: null, ...base };
    const sameSet = [...ek].sort().join('\n') === [...ak].sort().join('\n');
    return { pass: false, reason: sameSet ? 'order' : 'values', ...base };
  }
  return [...ek].sort().join('\n') === [...ak].sort().join('\n') ? { pass: true, reason: null, ...base } : { pass: false, reason: 'values', ...base };
}
