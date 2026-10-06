// Your data, in your hands: a JSON backup of everything EduFlow saved, a
// restore that merges (never wipes), and "delete everything".

import { readRaw, savedKeys } from './storage.js';
import { bookmarksStore, enrollmentsStore, eventsStore, exercisesStore, notesStore, scoresStore, srsStore, timeStore, validateEnrollments, validateScores } from './stores.js';
import { allStores } from './storage.js';

export const BACKUP_APP = 'eduflow';
/** Settings of this device, not of the learner: never restored (downloads live in this browser's cache; language and theme follow the device). */
const DEVICE_KEYS = new Set(['offline', 'locale', 'theme', 'dismissed']);

export function buildBackup(now = new Date()) {
  const data = {};
  for (const key of savedKeys()) {
    try {
      data[key] = JSON.parse(readRaw(key));
    } catch {
      // Skip anything unreadable.
    }
  }
  return { app: BACKUP_APP, version: 1, exportedAt: now.toISOString(), data };
}

const maxIso = (a, b) => (!a ? b : !b ? a : a > b ? a : b);

/**
 * Merges a backup into what's here: enrollments and completed lessons are
 * unioned, best scores kept, notes keep the newer text, flashcards keep the
 * more-reviewed card, logs are combined. Settings are replaced. Throws if
 * the file isn't an EduFlow backup.
 */
export function restoreBackup(backup) {
  if (!backup || backup.app !== BACKUP_APP || typeof backup.data !== 'object' || backup.data === null || Array.isArray(backup.data)) throw new Error('not-a-backup');
  const { data } = backup;
  const merged = new Set(['enrollments', 'scores', 'exercises', 'events', 'srs', 'notes', 'bookmarks', 'time']);

  const inEnroll = validateEnrollments(data.enrollments);
  if (inEnroll) {
    enrollmentsStore.set((cur) => {
      const enrollments = { ...cur.enrollments };
      for (const [id, e] of Object.entries(inEnroll.enrollments)) {
        const mine = enrollments[id];
        enrollments[id] = mine
          ? { enrolledAt: mine.enrolledAt < e.enrolledAt ? mine.enrolledAt : e.enrolledAt, completedLessonIds: [...new Set([...mine.completedLessonIds, ...e.completedLessonIds])], lastVisitedLessonId: mine.lastVisitedLessonId ?? e.lastVisitedLessonId }
          : e;
      }
      return { ...cur, enrollments, activityLog: [...new Set([...cur.activityLog, ...inEnroll.activityLog])].sort() };
    });
  }
  const inScores = validateScores(data.scores);
  if (inScores) {
    scoresStore.set((cur) => {
      const out = { ...cur };
      for (const kind of ['lessons', 'checkpoints', 'finals']) {
        out[kind] = { ...cur[kind] };
        for (const [id, s] of Object.entries(inScores[kind])) {
          const m = out[kind][id];
          out[kind][id] = !m ? s : { best: Math.max(m.best, s.best), total: s.total, attempts: m.attempts + s.attempts, at: maxIso(m.at, s.at), ...(kind === 'finals' ? { passedAt: m.passedAt && s.passedAt ? (m.passedAt < s.passedAt ? m.passedAt : s.passedAt) : (m.passedAt ?? s.passedAt) } : {}) };
        }
      }
      return out;
    });
  }
  // Every merged value goes through the store's validator and set() (no
  // re-read from storage), so a restore also works when storage is blocked.
  const mergeMap = (store, incoming, pick) => {
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return;
    store.set((cur) => {
      const out = { ...cur };
      for (const [k, v] of Object.entries(incoming)) out[k] = out[k] ? pick(out[k], v) : v;
      return store.parse(out) ?? cur;
    });
  };
  mergeMap(exercisesStore, data.exercises, (a, b) => ({ solvedAt: a.solvedAt ?? b.solvedAt, attempts: Math.max(a.attempts, b.attempts), revealed: a.revealed || b.revealed }));
  mergeMap(notesStore, data.notes, (a, b) => (a.at >= b.at ? a : b));
  mergeMap(bookmarksStore, data.bookmarks, (a) => a);
  mergeMap(timeStore, data.time, (a, b) => Math.max(a, b));
  if (data.srs && typeof data.srs === 'object') {
    srsStore.set((cur) => {
      const cards = { ...cur.cards };
      for (const [id, c] of Object.entries(data.srs.cards ?? {})) if (!cards[id] || (c?.reviews ?? 0) > cards[id].reviews) cards[id] = c;
      const days = { ...cur.days };
      for (const [d, n] of Object.entries(data.srs.days ?? {})) days[d] = Math.max(days[d] ?? 0, n);
      return srsStore.parse({ cards, days }) ?? cur;
    });
  }
  if (Array.isArray(data.events)) {
    eventsStore.set((cur) => {
      const seen = new Set(cur.map((e) => e.join('|')));
      const next = [...cur, ...data.events.filter((e) => Array.isArray(e) && !seen.has(e.join('|')))].sort((a, b) => String(a[2]).localeCompare(String(b[2])));
      return eventsStore.parse(next) ?? cur;
    });
  }
  for (const store of allStores()) {
    if (merged.has(store.key) || DEVICE_KEYS.has(store.key) || !Object.hasOwn(data, store.key)) continue;
    const value = store.parse(data[store.key]);
    if (value !== undefined) store.set(value);
  }
}

/** Saves text as a file (no network involved). */
export function downloadFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
