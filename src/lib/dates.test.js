import { describe, expect, test } from 'vitest';
import { addDays, daysBetween, isLocalDate, lastNDays, toLocalDate, weekStart } from './dates.js';

describe('local dates', () => {
  test('toLocalDate uses the local calendar, not UTC', () => {
    expect(toLocalDate(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
    expect(toLocalDate(new Date(2026, 0, 1, 23, 59))).toBe('2026-01-01');
  });
  test('addDays crosses months, years and DST changes', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30'); // EU DST start
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31'); // US DST end
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  test('daysBetween and weekStart (Monday)', () => {
    expect(daysBetween('2026-10-01', '2026-10-05')).toBe(4);
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(weekStart('2026-10-05')).toBe('2026-10-05'); // a Monday
    expect(weekStart('2026-10-11')).toBe('2026-10-05'); // Sunday belongs to the week before it
    expect(weekStart('2026-10-12')).toBe('2026-10-12');
  });
  test('isLocalDate rejects malformed and impossible dates', () => {
    expect(isLocalDate('2026-02-29')).toBe(false);
    expect(isLocalDate('2026-13-01')).toBe(false);
    expect(isLocalDate('2026-1-01')).toBe(false);
    expect(isLocalDate(20261001)).toBe(false);
    expect(isLocalDate('2026-10-05')).toBe(true);
  });
  test('lastNDays ends today, oldest first', () => {
    expect(lastNDays('2026-10-02', 3)).toEqual(['2026-09-30', '2026-10-01', '2026-10-02']);
  });
});
