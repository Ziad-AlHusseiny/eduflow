// Spaced repetition for the flashcards: a Leitner system with five boxes.
// A card you know moves up a box and comes back later (1, 2, 4, 8, 16
// days); a card you miss drops to box 1 and returns tomorrow. Pure and
// deterministic: dates are local 'YYYY-MM-DD' strings passed in.

import { addDays } from './dates.js';

export const INTERVALS = [1, 2, 4, 8, 16];
export const NEW_PER_DAY = 10;

/** The next state of a card after a review. `card` is undefined for a new card. */
export function schedule(card, grade, today) {
  const box = card?.box ?? 0;
  const base = { reviews: (card?.reviews ?? 0) + 1, lapses: card?.lapses ?? 0, last: today, first: card ? (card.first ?? null) : today };
  if (grade === 'again') return { ...base, box: 1, due: addDays(today, 1), lapses: base.lapses + (card ? 1 : 0) };
  const next = Math.min(5, box + (grade === 'easy' ? 2 : 1));
  return { ...base, box: next, due: addDays(today, INTERVALS[next - 1]) };
}

/**
 * Today's queue from the cards you've unlocked (ids, in course order):
 * everything due (oldest first, then lowest box), then up to `newLimit`
 * new cards minus the new cards already introduced today.
 */
export function buildQueue(unlocked, state, today, { newLimit = NEW_PER_DAY } = {}) {
  const cards = state?.cards ?? {};
  const due = unlocked.filter((id) => cards[id] && cards[id].due <= today).sort((a, b) => cards[a].due.localeCompare(cards[b].due) || cards[a].box - cards[b].box || unlocked.indexOf(a) - unlocked.indexOf(b));
  // New cards first seen today (by the date they were first reviewed, so a
  // card missed and then passed in the same session still counts).
  const introducedToday = unlocked.filter((id) => (cards[id]?.first ?? (cards[id]?.reviews === 1 ? cards[id].last : null)) === today).length;
  const fresh = unlocked.filter((id) => !cards[id]).slice(0, Math.max(0, newLimit - introducedToday));
  return { due, fresh, queue: [...due, ...fresh] };
}

/** How many cards sit in each box (box 0 = not started). */
export function boxCounts(unlocked, state) {
  const counts = [0, 0, 0, 0, 0, 0];
  for (const id of unlocked) counts[state?.cards?.[id]?.box ?? 0] += 1;
  return counts;
}

/** Cards that become due on each of the next n days (a forecast). */
export function forecast(unlocked, state, today, n = 7) {
  const out = Array.from({ length: n }, (_, i) => ({ date: addDays(today, i), count: 0 }));
  for (const id of unlocked) {
    const c = state?.cards?.[id];
    if (!c) continue;
    const i = c.due <= today ? 0 : out.findIndex((d) => d.date === c.due);
    if (i >= 0) out[i].count += 1;
  }
  return out;
}
