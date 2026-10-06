import { describe, expect, test } from 'vitest';
import ar from './ar.js';
import en from './en.js';
import { interpolate, registerDictionary, t } from './index.js';
import { setActiveLocale } from './state.js';

const PLURAL = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
const isPlural = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).every((k) => PLURAL.has(k));
const placeholders = (s) => new Set([...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]));

function walk(a, b, path, problems) {
  if (typeof a === 'string') {
    if (typeof b !== 'string') return problems.push(`${path}: missing or not a string`);
    for (const p of placeholders(a)) if (!placeholders(b).has(p) && p !== 'count') problems.push(`${path}: Arabic lacks {${p}}`);
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return problems.push(`${path}: array length differs`);
    return a.forEach((x, i) => walk(x, b[i], `${path}[${i}]`, problems));
  }
  if (isPlural(a)) {
    if (!isPlural(b) || !b.other) return problems.push(`${path}: Arabic needs plural forms with "other"`);
    // zero/one/two may spell the number out ("متعلّم واحد", "درسان"); the rest must show it.
    for (const p of placeholders(a.other)) for (const [form, v] of Object.entries(b)) if (p !== 'count' && !['zero', 'one', 'two'].includes(form) && !placeholders(v).has(p)) problems.push(`${path}.${form}: lacks {${p}}`);
    return;
  }
  for (const [k, v] of Object.entries(a)) {
    if (!b || typeof b !== 'object') return problems.push(`${path}: missing`);
    walk(v, b[k], path ? `${path}.${k}` : k, problems);
  }
}

describe('dictionaries', () => {
  test('Arabic has every English key, with the same placeholders', () => {
    const problems = [];
    walk(en, ar, '', problems);
    expect(problems).toEqual([]);
  });
  test('interpolation and Arabic plural categories', () => {
    registerDictionary('en', en);
    registerDictionary('ar', ar);
    expect(interpolate('{a} of {b}', { a: 1, b: 2 })).toBe('1 of 2');
    setActiveLocale('en');
    expect(t('units.lessons', { count: 1 })).toBe('1 lesson');
    expect(t('units.lessons', { count: 18 })).toBe('18 lessons');
    setActiveLocale('ar');
    const forms = [0, 1, 2, 3, 11, 100].map((count) => t('units.lessons', { count }));
    expect(new Set(forms).size).toBeGreaterThanOrEqual(5);
    setActiveLocale('en');
  });
});
