import { describe, expect, test } from 'vitest';
import { continueTarget, nextLesson, previousLesson, progressFor, sectionComplete } from './progress.js';

const course = {
  sections: [
    { id: 's1', lessons: [{ id: 'a', minutes: 5 }, { id: 'b', minutes: 5 }] },
    { id: 's2', lessons: [{ id: 'c', minutes: 5 }] },
  ],
};
course.lessons = course.sections.flatMap((s) => s.lessons);

describe('progressFor', () => {
  test('rounds the percentage', () => {
    expect(progressFor(course, ['a'])).toEqual({ pct: 33, completed: 1, total: 3 });
    expect(progressFor(course, ['a', 'b'])).toEqual({ pct: 67, completed: 2, total: 3 });
    expect(progressFor(course, ['a', 'b', 'c'])).toEqual({ pct: 100, completed: 3, total: 3 });
  });
  test('ignores unknown lesson ids (stale saves)', () => {
    expect(progressFor(course, ['a', 'zzz', 'gone'])).toEqual({ pct: 33, completed: 1, total: 3 });
  });
  test('guards a course with no lessons (no division by zero)', () => {
    expect(progressFor({ lessons: [] }, ['a'])).toEqual({ pct: 0, completed: 0, total: 0 });
    expect(progressFor(null, [])).toEqual({ pct: 0, completed: 0, total: 0 });
  });
});

describe('navigation', () => {
  test('next is the next in the section, else the first of the next section', () => {
    expect(nextLesson(course, 'a').id).toBe('b');
    expect(nextLesson(course, 'b').id).toBe('c');
    expect(nextLesson(course, 'c')).toBeNull();
    expect(previousLesson(course, 'c').id).toBe('b');
    expect(previousLesson(course, 'a')).toBeNull();
  });
  test('continue: last visited → first incomplete → first lesson (PRD §5.6)', () => {
    expect(continueTarget(course, { lastVisitedLessonId: 'c', completedLessonIds: [] })).toBe('c');
    expect(continueTarget(course, { lastVisitedLessonId: 'gone', completedLessonIds: ['a'] })).toBe('b');
    expect(continueTarget(course, { lastVisitedLessonId: null, completedLessonIds: ['a', 'b', 'c'] })).toBe('a');
    expect(continueTarget(course, undefined)).toBe('a');
  });
  test('sectionComplete', () => {
    expect(sectionComplete(course.sections[0], ['a', 'b'])).toBe(true);
    expect(sectionComplete(course.sections[0], ['a'])).toBe(false);
  });
});
