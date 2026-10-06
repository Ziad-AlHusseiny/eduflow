import { describe, expect, test } from 'vitest';
import { levelFor, totalXp, XP, xpForLevel } from './xp.js';

describe('XP and levels', () => {
  const none = { completedLessons: 0, quizPoints: 0, exercisesSolved: 0, checkpointsPassed: 0, finalsPassed: 0, coursesCompleted: 0, reviews: 0 };
  test('XP adds up from what you did', () => {
    expect(totalXp(none)).toBe(0);
    expect(totalXp({ ...none, completedLessons: 3, quizPoints: 4, exercisesSolved: 1, reviews: 10 })).toBe(3 * XP.lesson + 4 * XP.quizPoint + XP.exercise + 10 * XP.review);
  });
  test('level thresholds: 0, 100, 300, 600, 1000 …', () => {
    expect([1, 2, 3, 4, 5].map(xpForLevel)).toEqual([0, 100, 300, 600, 1000]);
    expect(levelFor(0)).toMatchObject({ level: 1, current: 0, next: 100, progress: 0 });
    expect(levelFor(99).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(299).level).toBe(2);
    expect(levelFor(300).level).toBe(3);
    expect(levelFor(1000).level).toBe(5);
    expect(levelFor(450).progress).toBeCloseTo(0.5);
    expect(levelFor(-5).level).toBe(1);
  });
});
