import { describe, expect, test } from 'vitest';
import { activeCount, clearedParams, durationBucket, filterCourses, parseFilters, practiceKind, sortCourses, toggleParam } from './filters.js';

const CATS = ['web-development', 'data-science', 'design', 'mobile-development', 'devops-cloud', 'ai-machine-learning'];
const C = (id, o) => ({ id, title: id, instructor: '', students: 0, rating: 4.5, ratingCount: 1, publishedAt: '2026-01-01', price: 0, durationMinutes: 300, engines: ['guided'], level: 'beginner', category: 'design', ...o });
const courses = [
  C('react-fundamentals', { category: 'web-development', price: 0, rating: 4.8, ratingCount: 1284, students: 12400, publishedAt: '2026-03-14', instructor: 'Maya Chen', durationMinutes: 320, engines: ['web:react'] }),
  C('figma-ui-design', { category: 'design', price: 0, rating: 4.8, ratingCount: 1368, students: 11700, publishedAt: '2025-10-15', instructor: 'Sofia Reyes', durationMinutes: 295 }),
  C('design-systems', { category: 'design', price: 59, level: 'advanced', rating: 4.9, ratingCount: 612, students: 4900, publishedAt: '2026-04-21', instructor: 'Sofia Reyes', durationMinutes: 365 }),
  C('react-native-apps', { category: 'mobile-development', price: 49, level: 'intermediate', rating: 4.5, ratingCount: 803, students: 7400, instructor: 'Maya Chen', durationMinutes: 390 }),
  C('swift-essentials', { category: 'mobile-development', price: 29, rating: 4.4, ratingCount: 589, students: 5600, instructor: 'Daniel Okafor', durationMinutes: 255 }),
  C('aws', { category: 'devops-cloud', price: 0, rating: 4.5, ratingCount: 1204, students: 10800, instructor: 'Amara Diallo', durationMinutes: 230 }),
];
const hay = (c) => [c.title, c.instructor, c.category];
const run = (qs) => sortCourses(filterCourses(courses, parseFilters(new URLSearchParams(qs), { categories: CATS }), hay), parseFilters(new URLSearchParams(qs), { categories: CATS }).sort).map((c) => c.id);

describe('catalog filters (PRD §4)', () => {
  test('Design + Free → only UI Design with Figma', () => {
    expect(run('category=design&price=free')).toEqual(['figma-ui-design']);
  });
  test('?q=maya matches the instructor', () => {
    expect(run('q=maya').sort()).toEqual(['react-fundamentals', 'react-native-apps']);
  });
  test('OR within a group, AND across groups', () => {
    expect(run('category=design&category=mobile-development&level=beginner').sort()).toEqual(['figma-ui-design', 'swift-essentials']);
  });
  test('rating is a minimum; unknown values are ignored', () => {
    expect(run('rating=4.5').length).toBe(5);
    expect(run('rating=9&category=nope&level=expert').length).toBe(6);
  });
  test('duration buckets and practice kind', () => {
    expect(durationBucket(230)).toBe('short');
    expect(durationBucket(240)).toBe('medium');
    expect(durationBucket(360)).toBe('medium');
    expect(durationBucket(361)).toBe('long');
    expect(practiceKind(courses[0])).toBe('code');
    expect(practiceKind(courses[1])).toBe('guided');
    expect(run('duration=long').sort()).toEqual(['design-systems', 'react-native-apps']);
    expect(run('practice=code')).toEqual(['react-fundamentals']);
  });
  test('sorts: popular (default), rating then count, newest, price both ways', () => {
    expect(run('')[0]).toBe('react-fundamentals');
    expect(run('sort=rating').slice(0, 3)).toEqual(['design-systems', 'figma-ui-design', 'react-fundamentals']);
    expect(run('sort=newest')[0]).toBe('design-systems');
    expect(run('sort=price-desc')[0]).toBe('design-systems');
    expect(run('sort=price-asc').slice(0, 3)).toEqual(['react-fundamentals', 'figma-ui-design', 'aws']);
  });
  test('search ignores case and Arabic diacritics', () => {
    const ar = [C('x', { title: 'تصميم الواجهات' })];
    expect(filterCourses(ar, parseFilters(new URLSearchParams('q=تَصميم'), { categories: CATS }), (c) => [c.title])).toHaveLength(1);
    expect(run('q=SOFIA').length).toBe(2);
  });
});

describe('URL helpers', () => {
  test('toggleParam adds and removes repeatable values; rating is single', () => {
    let p = toggleParam(new URLSearchParams(), 'category', 'design');
    p = toggleParam(p, 'category', 'devops-cloud');
    expect(p.getAll('category')).toEqual(['design', 'devops-cloud']);
    p = toggleParam(p, 'category', 'design');
    expect(p.getAll('category')).toEqual(['devops-cloud']);
    p = toggleParam(p, 'rating', '4.5');
    p = toggleParam(p, 'rating', '4.0');
    expect(p.get('rating')).toBe('4.0');
    p = toggleParam(p, 'rating', '4.0');
    expect(p.has('rating')).toBe(false);
  });
  test('clear all keeps only the sort (PRD §4.5)', () => {
    expect(clearedParams(new URLSearchParams('q=x&category=design&sort=rating')).toString()).toBe('sort=rating');
    expect(clearedParams(new URLSearchParams('q=x')).toString()).toBe('');
  });
  test('activeCount counts every chip', () => {
    expect(activeCount(parseFilters(new URLSearchParams('category=design&price=free&rating=4.5&q=x'), { categories: CATS }))).toBe(3);
  });
});
