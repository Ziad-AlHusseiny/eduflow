import { beforeEach, describe, expect, test } from 'vitest';
import { buildBackup, restoreBackup } from './backup.js';
import { allStores } from './storage.js';
import * as stores from './stores.js';

class MemoryStorage {
  data = new Map();
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

const mem = new MemoryStorage();
globalThis.localStorage = mem;

describe('backup and restore', () => {
  beforeEach(() => {
    mem.data.clear();
    allStores().forEach((s) => s.reset());
  });

  test('a backup contains every saved key', () => {
    stores.notesStore.set({ 'l-rf-1-1': { text: 'hello', at: '2026-08-01T00:00:00.000Z' } });
    const b = buildBackup(new Date('2026-10-05T00:00:00Z'));
    expect(b.app).toBe('eduflow');
    expect(b.data.notes['l-rf-1-1'].text).toBe('hello');
  });

  test('restore merges instead of wiping', () => {
    stores.enrollmentsStore.set({ version: 1, enrollments: { 'react-fundamentals': { enrolledAt: '2026-08-02T00:00:00.000Z', completedLessonIds: ['l-rf-1-1'], lastVisitedLessonId: null } }, activityLog: ['2026-08-02'] });
    stores.scoresStore.set({ lessons: { 'l-rf-1-1': { best: 2, total: 4, attempts: 1, at: null } }, checkpoints: {}, finals: {} });
    restoreBackup({
      app: 'eduflow',
      version: 1,
      data: {
        enrollments: { version: 1, enrollments: { 'react-fundamentals': { enrolledAt: '2026-08-01T00:00:00.000Z', completedLessonIds: ['l-rf-1-2'], lastVisitedLessonId: 'l-rf-1-2' } }, activityLog: ['2026-08-01'] },
        scores: { lessons: { 'l-rf-1-1': { best: 4, total: 4, attempts: 2, at: null } }, checkpoints: {}, finals: {} },
        notes: { 'l-rf-1-2': { text: 'from backup', at: '2026-08-01T00:00:00.000Z' } },
        settings: { goalUnit: 'minutes', goalTarget: 90 },
      },
    });
    const e = stores.enrollmentsStore.get().enrollments['react-fundamentals'];
    expect(e.completedLessonIds.sort()).toEqual(['l-rf-1-1', 'l-rf-1-2']);
    expect(e.enrolledAt).toBe('2026-08-01T00:00:00.000Z');
    expect(stores.enrollmentsStore.get().activityLog).toEqual(['2026-08-01', '2026-08-02']);
    expect(stores.scoresStore.get().lessons['l-rf-1-1']).toMatchObject({ best: 4, attempts: 3 });
    expect(stores.notesStore.get()['l-rf-1-2'].text).toBe('from backup');
    expect(stores.settingsStore.get()).toMatchObject({ goalUnit: 'minutes', goalTarget: 90 });
  });

  test('device settings (downloads, language, theme) are not restored', () => {
    stores.localeStore.set('en');
    restoreBackup({ app: 'eduflow', version: 1, data: { offline: { 'react-fundamentals': { en: { at: '2026-08-01T00:00:00.000Z', version: 'abc' } } }, locale: 'ar', theme: 'dark', dismissed: ['x'], path: 'data-analyst' } });
    expect(stores.offlineStore.get()).toEqual({});
    expect(stores.localeStore.get()).toBe('en');
    expect(stores.themeStore.get()).toBe(null);
    expect(stores.dismissedStore.get()).toEqual([]);
    expect(stores.pathStore.get()).toBe('data-analyst');
  });

  test('malformed entries in a backup are dropped, valid ones kept', () => {
    restoreBackup({ app: 'eduflow', version: 1, data: { notes: { 'l-rf-1-1': { text: 'ok', at: '2026-08-01T00:00:00.000Z' }, 'l-rf-1-2': 42 }, settings: 'nope' } });
    expect(Object.keys(stores.notesStore.get())).toEqual(['l-rf-1-1']);
    expect(stores.settingsStore.get()).toEqual(stores.settingsStore.fallback);
  });

  test('rejects anything that is not an EduFlow backup', () => {
    expect(() => restoreBackup({ app: 'nutriplan', data: {} })).toThrow();
    expect(() => restoreBackup(null)).toThrow();
    expect(() => restoreBackup({ app: 'eduflow', data: [] })).toThrow();
  });
});
