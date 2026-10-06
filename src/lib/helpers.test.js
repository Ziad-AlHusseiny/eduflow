import { describe, expect, test } from 'vitest';
import { certificateId } from './certificate.js';
import { scorePlacement } from './placement.js';
import { seededShuffle } from './shuffle.js';

describe('placement quiz scoring', () => {
  const qs = [
    { options: [{ id: 'a', weights: { fe: 3 } }, { id: 'b', weights: { data: 3 } }] },
    { options: [{ id: 'a', weights: { fe: 1, data: 2 } }, { id: 'b', weights: { cloud: 2 } }] },
  ];
  test('ranks paths by total weight', () => {
    expect(scorePlacement(qs, ['b', 'a'], ['fe', 'data', 'cloud'])[0]).toBe('data');
    expect(scorePlacement(qs, ['a', 'b'], ['fe', 'data', 'cloud'])).toEqual(['fe', 'cloud', 'data']);
  });
  test('ties go to the earlier path; unanswered questions add nothing', () => {
    expect(scorePlacement(qs, [null, null], ['fe', 'data', 'cloud'])).toEqual(['fe', 'data', 'cloud']);
  });
});

describe('certificate ids', () => {
  test('stable for the same inputs, different for a different name', () => {
    const a = certificateId('rf', '2026-10-01T10:00:00.000Z', 'Layla Haddad');
    expect(a).toBe(certificateId('rf', '2026-10-01T10:00:00.000Z', 'Layla Haddad'));
    expect(a).not.toBe(certificateId('rf', '2026-10-01T10:00:00.000Z', 'Omar Haddad'));
    expect(a).toMatch(/^EF-RF-[0-9A-Z]{7}$/);
  });
});

describe('order exercise shuffle', () => {
  test('deterministic per seed, a permutation, never already solved', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const s = seededShuffle(items, 'l-dk-1-1');
    expect(s).toEqual(seededShuffle(items, 'l-dk-1-1'));
    expect([...s].sort()).toEqual(items);
    for (let i = 0; i < 50; i++) expect(seededShuffle(['x', 'y'], `seed-${i}`)).not.toEqual(['x', 'y']);
  });
});
