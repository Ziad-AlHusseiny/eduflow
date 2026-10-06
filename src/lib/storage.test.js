import { beforeEach, describe, expect, test } from 'vitest';
import { __resetStorageForTests, clearAll, createStore, savedKeys, storageAvailable } from './storage.js';
import { emptyEnrollments, validateEnrollments } from './stores.js';

class MemoryStorage {
  constructor(seed = {}) {
    this.data = new Map(Object.entries(seed));
  }
  getItem(k) {
    return this.data.has(k) ? this.data.get(k) : null;
  }
  setItem(k, v) {
    this.data.set(k, String(v));
  }
  removeItem(k) {
    this.data.delete(k);
  }
  key(i) {
    return [...this.data.keys()][i] ?? null;
  }
  get length() {
    return this.data.size;
  }
}

const install = (s) => {
  globalThis.localStorage = s;
  __resetStorageForTests();
};
const enrollmentStore = () => createStore('enrollments', emptyEnrollments(), validateEnrollments);

describe('eduflow-enrollments storage (PRD §9)', () => {
  beforeEach(() => install(new MemoryStorage()));

  test('persists across reloads (a new store reads what the last one wrote)', () => {
    const a = enrollmentStore();
    a.set((s) => ({ ...s, enrollments: { 'react-fundamentals': { enrolledAt: '2026-08-28T09:12:44.000Z', completedLessonIds: ['l-rf-1-1'], lastVisitedLessonId: 'l-rf-1-2' } }, activityLog: ['2026-08-28'] }));
    const raw = JSON.parse(localStorage.getItem('eduflow-enrollments'));
    expect(raw.version).toBe(1);
    __resetStorageForTests();
    const b = enrollmentStore();
    expect(b.get().enrollments['react-fundamentals'].completedLessonIds).toEqual(['l-rf-1-1']);
    expect(b.get().activityLog).toEqual(['2026-08-28']);
  });

  test('corrupt JSON resets to the empty state (and rewrites the key)', () => {
    localStorage.setItem('eduflow-enrollments', '{not json');
    const s = enrollmentStore();
    expect(s.get()).toEqual(emptyEnrollments());
    expect(JSON.parse(localStorage.getItem('eduflow-enrollments'))).toEqual(emptyEnrollments());
  });

  test('a different version resets (the documented migration point)', () => {
    localStorage.setItem('eduflow-enrollments', JSON.stringify({ version: 2, enrollments: { x: { enrolledAt: '2026-01-01T00:00:00Z', completedLessonIds: [] } }, activityLog: [] }));
    expect(enrollmentStore().get()).toEqual(emptyEnrollments());
  });

  test('malformed entries are dropped; unknown course ids are kept (derivation ignores them)', () => {
    localStorage.setItem(
      'eduflow-enrollments',
      JSON.stringify({ version: 1, enrollments: { good: { enrolledAt: '2026-01-01T00:00:00Z', completedLessonIds: ['a', 'a', 5] }, bad: { enrolledAt: 'nope' }, 'some-retired-course': { enrolledAt: '2026-01-01T00:00:00Z', completedLessonIds: [] } }, activityLog: ['2026-01-02', 'x', '2026-01-01', '2026-01-01'] }),
    );
    const v = enrollmentStore().get();
    expect(Object.keys(v.enrollments).sort()).toEqual(['good', 'some-retired-course']);
    expect(v.enrollments.good.completedLessonIds).toEqual(['a']);
    expect(v.activityLog).toEqual(['2026-01-01', '2026-01-02']);
  });

  test('blocked storage: runs in memory, never throws', () => {
    install({
      getItem() {
        throw new Error('SecurityError');
      },
      setItem() {
        throw new Error('SecurityError');
      },
      removeItem() {
        throw new Error('SecurityError');
      },
    });
    expect(storageAvailable()).toBe(false);
    const s = enrollmentStore();
    s.set((x) => ({ ...x, activityLog: ['2026-08-28'] }));
    expect(s.get().activityLog).toEqual(['2026-08-28']);
    expect(savedKeys()).toEqual([]);
  });

  test('clearAll removes every eduflow key and resets stores', () => {
    localStorage.setItem('other-app', 'keep');
    const s = enrollmentStore();
    s.set((x) => ({ ...x, activityLog: ['2026-08-28'] }));
    clearAll();
    expect(localStorage.getItem('eduflow-enrollments')).toBeNull();
    expect(localStorage.getItem('other-app')).toBe('keep');
    expect(s.get()).toEqual(emptyEnrollments());
  });
});
