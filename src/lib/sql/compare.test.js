import { describe, expect, test } from 'vitest';
import { compareResults } from './compare.js';

const r = (columns, values) => ({ columns, values });

describe('SQL result comparison', () => {
  test('same rows, any order, when order does not matter; names ignored', () => {
    expect(compareResults(r(['a', 'b'], [[1, 'x'], [2, 'y']]), r(['A', 'B'], [[2, 'y'], [1, 'x']])).pass).toBe(true);
  });
  test('order matters when asked', () => {
    expect(compareResults(r(['a'], [[1], [2]]), r(['a'], [[2], [1]]), true)).toMatchObject({ pass: false, reason: 'order' });
  });
  test('numbers compare to 2 decimals; numeric strings count as numbers', () => {
    expect(compareResults(r(['n'], [[10.004]]), r(['n'], [['10.00']])).pass).toBe(true);
    expect(compareResults(r(['n'], [[10.01]]), r(['n'], [[10.02]])).pass).toBe(false);
  });
  test('reports column count, row count and value mismatches', () => {
    expect(compareResults(r(['a', 'b'], [[1, 2]]), r(['a'], [[1]])).reason).toBe('columns');
    expect(compareResults(r(['a'], [[1], [2]]), r(['a'], [[1]])).reason).toBe('rows');
    expect(compareResults(r(['a'], [[1]]), r(['a'], [[3]])).reason).toBe('values');
    expect(compareResults(r(['a'], [[null]]), r(['a'], [[null]])).pass).toBe(true);
  });
});
