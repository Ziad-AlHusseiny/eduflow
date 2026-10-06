import { describe, expect, test } from 'vitest';
import { boxCounts, buildQueue, forecast, INTERVALS, schedule } from './srs.js';

describe('Leitner schedule', () => {
  test('a new card you know goes to box 1, due tomorrow', () => {
    expect(schedule(undefined, 'good', '2026-10-05')).toEqual({ box: 1, due: '2026-10-06', reviews: 1, lapses: 0, last: '2026-10-05', first: '2026-10-05' });
  });
  test('good moves up one box with the box interval; easy two', () => {
    const c = { box: 2, due: '2026-10-05', reviews: 3, lapses: 0, last: '2026-10-03' };
    expect(schedule(c, 'good', '2026-10-05')).toMatchObject({ box: 3, due: '2026-10-09', reviews: 4 });
    expect(schedule(c, 'easy', '2026-10-05')).toMatchObject({ box: 4, due: '2026-10-13' });
  });
  test('box 5 stays at 5 (16 days)', () => {
    expect(schedule({ box: 5, due: '2026-10-05', reviews: 9, lapses: 1, last: null }, 'easy', '2026-10-05')).toMatchObject({ box: 5, due: '2026-10-21' });
    expect(INTERVALS).toEqual([1, 2, 4, 8, 16]);
  });
  test('again drops to box 1, back tomorrow, counts a lapse (not for new cards)', () => {
    expect(schedule({ box: 4, due: '2026-10-05', reviews: 5, lapses: 0, last: null }, 'again', '2026-10-05')).toMatchObject({ box: 1, due: '2026-10-06', lapses: 1 });
    expect(schedule(undefined, 'again', '2026-10-05')).toMatchObject({ box: 1, lapses: 0 });
  });
  test('is deterministic', () => {
    const c = { box: 1, due: '2026-10-01', reviews: 1, lapses: 0, last: '2026-09-30' };
    expect(schedule(c, 'good', '2026-10-05')).toEqual(schedule(c, 'good', '2026-10-05'));
  });
});

describe('daily queue', () => {
  const state = {
    cards: {
      a: { box: 2, due: '2026-10-04', reviews: 2, lapses: 0, last: '2026-10-02' },
      b: { box: 1, due: '2026-10-04', reviews: 1, lapses: 0, last: '2026-10-03' },
      c: { box: 3, due: '2026-10-10', reviews: 3, lapses: 0, last: '2026-10-06' },
      d: { box: 1, due: '2026-10-01', reviews: 1, lapses: 1, last: '2026-09-30' },
    },
  };
  test('due cards oldest first then lowest box; future cards wait', () => {
    const { due } = buildQueue(['a', 'b', 'c', 'd'], state, '2026-10-05');
    expect(due).toEqual(['d', 'b', 'a']);
  });
  test('new cards are capped per day, counting ones introduced today', () => {
    const ids = ['a', ...Array.from({ length: 15 }, (_, i) => `n${i}`)];
    expect(buildQueue(ids, state, '2026-10-05').fresh).toHaveLength(10);
    const today = { cards: { ...state.cards, n0: { box: 1, due: '2026-10-06', reviews: 1, lapses: 0, last: '2026-10-05' } } };
    expect(buildQueue(ids, today, '2026-10-05', { newLimit: 3 }).fresh).toEqual(['n1', 'n2']);
  });
  test('box counts and a 7-day forecast', () => {
    expect(boxCounts(['a', 'b', 'c', 'd', 'x'], state)).toEqual([1, 2, 1, 1, 0, 0]);
    const f = forecast(['a', 'b', 'c', 'd'], state, '2026-10-05');
    expect(f[0]).toEqual({ date: '2026-10-05', count: 3 });
    expect(f[5]).toEqual({ date: '2026-10-10', count: 1 });
  });
});

describe('a card missed and passed in one session (code review #12)', () => {
  test('still counts as introduced today, so the new-card cap holds', () => {
    const today = '2026-10-05';
    const ids = Array.from({ length: 25 }, (_, i) => `c:${i}`);
    const cards = {};
    for (const id of ids.slice(0, 10)) cards[id] = schedule(schedule(undefined, 'again', today), 'good', today);
    expect(cards['c:0'].reviews).toBe(2);
    const { fresh } = buildQueue(ids, { cards }, today);
    expect(fresh).toEqual([]);
    expect(buildQueue(ids, { cards }, '2026-10-06').fresh).toHaveLength(10);
  });

  test('older saved cards without `first` fall back to reviews === 1', () => {
    const today = '2026-10-05';
    const cards = { 'c:0': { box: 1, due: '2026-10-06', reviews: 1, lapses: 0, last: today } };
    expect(buildQueue(['c:0', 'c:1'], { cards }, today, { newLimit: 1 }).fresh).toEqual([]);
  });
});
