import { describe, expect, test } from 'vitest';
import { achievements, earnedIds, PRD_ACHIEVEMENTS } from '../data/achievements.js';
import { getCourse } from '../data/courses.js';
import { deriveStats } from './learning.js';
import { DEFAULT_SETTINGS, emptyEnrollments } from './stores.js';

const rf = getCourse('react-fundamentals');
const ids = rf.lessons.map((l) => l.id);
const base = () => ({ enrollments: emptyEnrollments(), scores: { lessons: {}, checkpoints: {}, finals: {} }, exercises: {}, events: [], srs: { cards: {}, days: {} }, notes: {}, time: {}, settings: DEFAULT_SETTINGS });
const withLessons = (n, extra = {}) => {
  const s = base();
  s.enrollments.enrollments['react-fundamentals'] = { enrolledAt: '2026-08-01T10:00:00.000Z', completedLessonIds: ids.slice(0, n), lastVisitedLessonId: null };
  Object.assign(s.enrollments, extra);
  return s;
};
const earned = (state, now = new Date(2026, 7, 28, 12)) => earnedIds({ ...deriveStats(state, now), pathsCompleted: 0 });

describe('achievements (PRD §6.4), derived live', () => {
  test('the PRD eight come first, in order', () => {
    expect(PRD_ACHIEVEMENTS).toEqual(['first-enrollment', 'first-lesson', 'ten-lessons', 'twenty-five-lessons', 'three-enrollments', 'first-course-complete', 'streak-3', 'streak-7']);
    expect(achievements.length).toBeGreaterThanOrEqual(24);
  });
  test('10 lessons → Momentum earned, Deep Diver locked (PRD acceptance)', () => {
    const e = earned(withLessons(10));
    expect(e.has('ten-lessons')).toBe(true);
    expect(e.has('twenty-five-lessons')).toBe(false);
  });
  test('un-completing a lesson below a threshold re-locks the badge', () => {
    expect(earned(withLessons(10)).has('ten-lessons')).toBe(true);
    expect(earned(withLessons(9)).has('ten-lessons')).toBe(false);
  });
  test('finishing every lesson earns Finisher; one fewer does not', () => {
    expect(earned(withLessons(ids.length)).has('first-course-complete')).toBe(true);
    expect(earned(withLessons(ids.length - 1)).has('first-course-complete')).toBe(false);
  });
  test('Goal Getter works with a minutes goal too (code review #18)', () => {
    const s = withLessons(1);
    s.settings = { ...DEFAULT_SETTINGS, goalUnit: 'minutes', goalTarget: 60 };
    s.time = { '2026-08-24': 1800, '2026-08-25': 1500 }; // 55 min in the week of Aug 24
    expect(earned(s).has('goal-getter')).toBe(false);
    s.time['2026-08-26'] = 600; // 65 min
    expect(earned(s).has('goal-getter')).toBe(true);
    // Minutes spread over two weeks don't add up to one week's goal.
    s.time = { '2026-08-23': 1800, '2026-08-24': 1800 };
    expect(earned(s).has('goal-getter')).toBe(false);
  });
  test('streak badges use the longest run of days', () => {
    const days = ['2026-08-20', '2026-08-21', '2026-08-22'];
    expect(earned(withLessons(1, { activityLog: days })).has('streak-3')).toBe(true);
    expect(earned(withLessons(1, { activityLog: days.slice(0, 2) })).has('streak-3')).toBe(false);
  });
  test('unknown course ids and lesson ids never count', () => {
    const s = withLessons(2);
    s.enrollments.enrollments['retired-course'] = { enrolledAt: '2026-08-01T10:00:00.000Z', completedLessonIds: ['x', 'y', 'z'], lastVisitedLessonId: null };
    s.enrollments.enrollments['react-fundamentals'].completedLessonIds.push('not-a-lesson');
    const st = deriveStats(s, new Date(2026, 7, 28));
    expect(st.enrollmentCount).toBe(1);
    expect(st.totalCompletedLessons).toBe(2);
  });
  test('night owl and early bird come from the local hour of completions', () => {
    const s = withLessons(1);
    s.events = [['lesson', ids[0], new Date(2026, 7, 27, 23, 15).toISOString()]];
    expect(earned(s).has('night-owl')).toBe(true);
    expect(earned(s).has('early-bird')).toBe(false);
  });
  test('XP and level grow with lessons, quizzes and exercises', () => {
    const s = withLessons(5);
    s.scores.lessons[ids[0]] = { best: 4, total: 4, attempts: 1, at: null };
    s.exercises[ids[0]] = { solvedAt: '2026-08-02T10:00:00Z', attempts: 1, revealed: false };
    const st = deriveStats(s, new Date(2026, 7, 28));
    expect(st.xp).toBe(5 * 20 + 4 * 5 + 30);
    expect(st.level.level).toBe(2);
  });
});
