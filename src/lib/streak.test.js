import { describe, expect, test } from 'vitest';
import { currentStreak, longestStreak } from './streak.js';

describe('currentStreak (PRD §6.2)', () => {
  test('PRD acceptance: lessons on 08-27 and 08-28, opened on 08-28 → 2', () => {
    expect(currentStreak(['2026-08-27', '2026-08-28'], '2026-08-28')).toBe(2);
  });
  test('yesterday keeps the streak alive until midnight', () => {
    expect(currentStreak(['2026-08-27', '2026-08-28'], '2026-08-29')).toBe(2);
  });
  test('a missed day breaks it', () => {
    expect(currentStreak(['2026-08-27', '2026-08-28'], '2026-08-30')).toBe(0);
    expect(currentStreak(['2026-08-25', '2026-08-27', '2026-08-28'], '2026-08-28')).toBe(2);
  });
  test('empty, unsorted, duplicated and malformed logs', () => {
    expect(currentStreak([], '2026-08-28')).toBe(0);
    expect(currentStreak(undefined, '2026-08-28')).toBe(0);
    expect(currentStreak(['2026-08-28', '2026-08-27', '2026-08-28', 'not-a-date', '2026-02-30'], '2026-08-28')).toBe(2);
  });
  test('crosses month and year boundaries and DST', () => {
    expect(currentStreak(['2026-12-31', '2027-01-01'], '2027-01-01')).toBe(2);
    expect(currentStreak(['2026-03-28', '2026-03-29', '2026-03-30'], '2026-03-30')).toBe(3);
    expect(currentStreak(['2026-02-28', '2026-03-01'], '2026-03-02')).toBe(2);
  });
  test('only today active → 1', () => {
    expect(currentStreak(['2026-08-28'], '2026-08-28')).toBe(1);
  });
});

describe('longestStreak', () => {
  test('finds the longest run anywhere in the log', () => {
    expect(longestStreak(['2026-01-01', '2026-01-02', '2026-01-03', '2026-02-01', '2026-02-02'])).toBe(3);
    expect(longestStreak([])).toBe(0);
    expect(longestStreak(['2026-05-05'])).toBe(1);
  });
});
