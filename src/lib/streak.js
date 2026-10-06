// Learning streaks (PRD §6.2): consecutive active days ending today or
// yesterday — yesterday keeps the streak alive until midnight.

import { addDays, isLocalDate } from './dates.js';

const cleanDays = (log) => [...new Set((log ?? []).filter(isLocalDate))].sort();

/** The current streak, as of local date `today`. */
export function currentStreak(log, today) {
  const days = new Set(cleanDays(log));
  let cursor = days.has(today) ? today : addDays(today, -1);
  if (!days.has(cursor)) return 0;
  let n = 0;
  while (days.has(cursor)) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

/** The longest run of consecutive active days ever. */
export function longestStreak(log) {
  const days = cleanDays(log);
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export { lastNDays } from './dates.js';
