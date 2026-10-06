import { describe, expect, test } from 'vitest';
import { search } from './search.js';

const entries = [
  { type: 'course', id: 'react-fundamentals', title: 'React Fundamentals', text: 'Go from zero to shipping UIs' },
  { type: 'lesson', id: 'l1', course: 'react-fundamentals', title: 'useState Fundamentals', text: 'State in function components' },
  { type: 'term', id: 'jsx', course: 'react-fundamentals', title: 'JSX', text: 'A syntax extension' },
  { type: 'lesson', id: 'l2', course: 'css', title: 'Container queries', text: 'Components that respond to their container', h: 'container-type · @container' },
];

describe('⌘K search', () => {
  test('title matches beat body matches; every word must match', () => {
    expect(search(entries, 'fundamentals').map((e) => e.id)).toEqual(['react-fundamentals', 'l1']);
    expect(search(entries, 'react zero').map((e) => e.id)).toEqual(['react-fundamentals']);
    expect(search(entries, 'react nothing')).toEqual([]);
  });
  test('matches headings and is case-insensitive', () => {
    expect(search(entries, '@CONTAINER').map((e) => e.id)).toEqual(['l2']);
  });
  test('empty query → nothing', () => {
    expect(search(entries, '   ')).toEqual([]);
  });
});
