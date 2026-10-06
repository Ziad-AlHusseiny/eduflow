import { describe, expect, test } from 'vitest';
import { restoreBackup } from './backup.js';
import { storageAvailable } from './storage.js';
import * as stores from './stores.js';

// Storage blocked (private mode, site data off): everything lives in memory.
globalThis.localStorage = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
  removeItem() {},
  key: () => null,
  length: 0,
};

describe('restore with storage blocked', () => {
  test('restored progress stays in memory instead of being wiped', () => {
    expect(storageAvailable()).toBe(false);
    restoreBackup({
      app: 'eduflow',
      version: 1,
      data: {
        notes: { 'l-rf-1-1': { text: 'kept', at: '2026-08-01T00:00:00.000Z' } },
        time: { '2026-08-01': 600 },
        events: [['lesson', 'l-rf-1-1', '2026-08-01T10:00:00.000Z']],
        srs: { cards: { 'react-fundamentals:jsx': { box: 2, due: '2026-08-03', reviews: 3, lapses: 0, last: '2026-08-01' } }, days: { '2026-08-01': 3 } },
        settings: { goalUnit: 'minutes', goalTarget: 90 },
      },
    });
    expect(stores.notesStore.get()['l-rf-1-1'].text).toBe('kept');
    expect(stores.timeStore.get()['2026-08-01']).toBe(600);
    expect(stores.eventsStore.get()).toHaveLength(1);
    expect(stores.srsStore.get().cards['react-fundamentals:jsx'].box).toBe(2);
    expect(stores.settingsStore.get()).toMatchObject({ goalUnit: 'minutes', goalTarget: 90 });
    stores.notesStore.reload();
    expect(stores.notesStore.get()['l-rf-1-1'].text).toBe('kept');
  });
});
