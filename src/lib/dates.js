// Local calendar dates as 'YYYY-MM-DD' strings (the learner's own midnight,
// not UTC's): streaks, the activity log, flashcard due dates, weekly goals.

const pad = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' for a Date in local time. */
export const toLocalDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** A local Date at noon (safe across DST changes) from 'YYYY-MM-DD'. */
export function fromLocalDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export const isLocalDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && toLocalDate(fromLocalDate(s)) === s;

/** 'YYYY-MM-DD' n days after (or before) a local date. */
export function addDays(s, n) {
  const d = fromLocalDate(s);
  d.setDate(d.getDate() + n);
  return toLocalDate(d);
}

/** Whole days from a to b (b − a), both local dates. */
export const daysBetween = (a, b) => Math.round((fromLocalDate(b) - fromLocalDate(a)) / 86400000);

/** Monday of the week containing a local date. */
export function weekStart(s) {
  const d = fromLocalDate(s);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return toLocalDate(d);
}

/** The last n local dates ending at `end` (oldest first). */
export const lastNDays = (end, n) => Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
