// Everything EduFlow saves, all on this device under `eduflow-*`
// (DECISIONS D6, extended in BUILD-LOG). The PRD's versioned
// `eduflow-enrollments` keeps its exact shape; the rest are the new tools'
// keys. Each has a validator, so a hand-edited or stale value is cleaned or
// reset — it can never blank a page.

import { isLocalDate } from './dates.js';
import { createStore } from './storage.js';

const isObject = (v) => v != null && typeof v === 'object' && !Array.isArray(v);
const isId = (s) => typeof s === 'string' && /^[a-z0-9][\w-]{0,79}$/.test(s);
const isIso = (s) => typeof s === 'string' && !Number.isNaN(Date.parse(s));
const finite = (v, min, max) => Number.isFinite(v) && v >= min && v <= max;
const oneOf = (values) => (v) => (values.includes(v) ? v : undefined);

// ── eduflow-enrollments (PRD TECHNICAL-PLAN §5.1) ──
export const ENROLLMENTS_VERSION = 1;
export const emptyEnrollments = () => ({ version: ENROLLMENTS_VERSION, enrollments: {}, activityLog: [] });

/**
 * The PRD's guard: a different `version` resets to the initial state;
 * malformed entries are dropped; ids the catalog doesn't know are kept
 * (and ignored by derivation), so content changes never lose progress.
 */
export function validateEnrollments(v) {
  if (!isObject(v) || v.version !== ENROLLMENTS_VERSION || !isObject(v.enrollments)) return undefined;
  const enrollments = {};
  for (const [id, e] of Object.entries(v.enrollments)) {
    if (!isId(id) || !isObject(e) || !isIso(e.enrolledAt)) continue;
    enrollments[id] = {
      enrolledAt: e.enrolledAt,
      completedLessonIds: Array.isArray(e.completedLessonIds) ? [...new Set(e.completedLessonIds.filter(isId))] : [],
      lastVisitedLessonId: isId(e.lastVisitedLessonId) ? e.lastVisitedLessonId : null,
    };
  }
  const activityLog = Array.isArray(v.activityLog) ? [...new Set(v.activityLog.filter(isLocalDate))].sort() : [];
  return { version: ENROLLMENTS_VERSION, enrollments, activityLog };
}
export const enrollmentsStore = createStore('enrollments', emptyEnrollments(), validateEnrollments);

// ── Quiz, checkpoint and final scores ──
const validScore = (s) => isObject(s) && finite(s.best, 0, 100) && finite(s.total, 1, 100) && s.best <= s.total && finite(s.attempts ?? 1, 1, 10000);
const cleanScores = (map, extra) => {
  if (!isObject(map)) return {};
  const out = {};
  for (const [id, s] of Object.entries(map)) if (isId(id) && validScore(s)) out[id] = { best: s.best, total: s.total, attempts: s.attempts ?? 1, at: isIso(s.at) ? s.at : null, ...extra(s) };
  return out;
};
export function validateScores(v) {
  if (!isObject(v)) return undefined;
  return {
    lessons: cleanScores(v.lessons, () => ({})),
    checkpoints: cleanScores(v.checkpoints, () => ({})),
    finals: cleanScores(v.finals, (s) => ({ passedAt: isIso(s.passedAt) ? s.passedAt : null })),
  };
}
export const scoresStore = createStore('scores', { lessons: {}, checkpoints: {}, finals: {} }, validateScores);

// ── Exercises: solved state + the learner's code drafts ──
export const exercisesStore = createStore('exercises', {}, (v) => {
  if (!isObject(v)) return undefined;
  const out = {};
  for (const [id, e] of Object.entries(v)) if (isId(id) && isObject(e)) out[id] = { solvedAt: isIso(e.solvedAt) ? e.solvedAt : null, attempts: finite(e.attempts, 0, 1e6) ? e.attempts : 0, revealed: e.revealed === true };
  return out;
});
export const draftsStore = createStore('drafts', {}, (v) => {
  if (!isObject(v)) return undefined;
  const out = {};
  for (const [id, d] of Object.entries(v).slice(-120)) {
    if (!isId(id) || !isObject(d)) continue;
    const files = {};
    for (const [k, code] of Object.entries(d.files ?? {})) if (/^[a-z]{1,8}$/.test(k) && typeof code === 'string' && code.length < 60000) files[k] = code;
    out[id] = { files, at: isIso(d.at) ? d.at : null };
  }
  return out;
});

// ── Reading: where you stopped in each lesson (resume), time studied per day ──
export const readingStore = createStore('reading', {}, (v) => {
  if (!isObject(v)) return undefined;
  const out = {};
  for (const [id, r] of Object.entries(v)) if (isId(id) && isObject(r) && finite(r.scroll, 0, 1)) out[id] = { scroll: r.scroll, anchor: typeof r.anchor === 'string' && /^sec-\d+$/.test(r.anchor) ? r.anchor : null, at: isIso(r.at) ? r.at : null };
  return out;
});
export const timeStore = createStore('time', {}, (v) => {
  if (!isObject(v)) return undefined;
  const out = {};
  for (const [day, s] of Object.entries(v)) if (isLocalDate(day) && finite(s, 0, 86400)) out[day] = Math.round(s);
  return out;
});

// ── Event log (stats, weekly goal, time-of-day badges): [type, id, isoTime] ──
export const EVENT_TYPES = ['lesson', 'quiz', 'exercise', 'checkpoint', 'final', 'review', 'enroll'];
export const eventsStore = createStore('events', [], (v) =>
  Array.isArray(v) ? v.filter((e) => Array.isArray(e) && EVENT_TYPES.includes(e[0]) && typeof e[1] === 'string' && isIso(e[2])).slice(-4000) : undefined,
);

// ── Flashcards (spaced repetition, lib/srs.js) ──
export const srsStore = createStore('srs', { cards: {}, days: {} }, (v) => {
  if (!isObject(v)) return undefined;
  const cards = {};
  for (const [id, c] of Object.entries(isObject(v.cards) ? v.cards : {})) {
    if (typeof id !== 'string' || id.length > 120 || !isObject(c)) continue;
    if (!finite(c.box, 1, 5) || !isLocalDate(c.due)) continue;
    cards[id] = { box: Math.round(c.box), due: c.due, reviews: finite(c.reviews, 0, 1e6) ? c.reviews : 0, lapses: finite(c.lapses, 0, 1e6) ? c.lapses : 0, last: isLocalDate(c.last) ? c.last : null, first: isLocalDate(c.first) ? c.first : null };
  }
  const days = {};
  for (const [d, n] of Object.entries(isObject(v.days) ? v.days : {})) if (isLocalDate(d) && finite(n, 0, 1e5)) days[d] = n;
  return { cards, days };
});

// ── Notes and bookmarks ──
export const notesStore = createStore('notes', {}, (v) => {
  if (!isObject(v)) return undefined;
  const out = {};
  for (const [id, n] of Object.entries(v)) if (isId(id) && isObject(n) && typeof n.text === 'string' && n.text.length <= 20000) out[id] = { text: n.text, at: isIso(n.at) ? n.at : new Date(0).toISOString() };
  return out;
});
export const bookmarksStore = createStore('bookmarks', {}, (v) => {
  if (!isObject(v)) return undefined;
  const out = {};
  for (const [id, at] of Object.entries(v)) if (isId(id) && isIso(at)) out[id] = at;
  return out;
});

// ── Settings ──
export const DEFAULT_SETTINGS = { textScale: 1, goalUnit: 'lessons', goalTarget: 5, autoAdvance: true, certificateName: '' };
export function validateSettings(v) {
  if (!isObject(v)) return undefined;
  const out = { ...DEFAULT_SETTINGS };
  if ([0.9, 1, 1.1, 1.2, 1.3].includes(v.textScale)) out.textScale = v.textScale;
  if (v.goalUnit === 'lessons' || v.goalUnit === 'minutes') out.goalUnit = v.goalUnit;
  if (finite(v.goalTarget, 1, out.goalUnit === 'minutes' ? 3000 : 100)) out.goalTarget = Math.round(v.goalTarget);
  if (typeof v.autoAdvance === 'boolean') out.autoAdvance = v.autoAdvance;
  if (typeof v.certificateName === 'string') out.certificateName = v.certificateName.slice(0, 80);
  return out;
}
export const settingsStore = createStore('settings', DEFAULT_SETTINGS, validateSettings);

export const localeStore = createStore('locale', null, oneOf(['en', 'ar']));
export const themeStore = createStore('theme', null, oneOf(['light', 'dark']));
export const placementStore = createStore('placement', null, (v) => (v === null ? null : isObject(v) && isId(v.path) && isIso(v.at) ? { path: v.path, at: v.at } : undefined));
export const pathStore = createStore('path', null, (v) => (v === null || isId(v) ? v : undefined));
/** Downloaded courses: { [courseId]: { [locale]: { at, version } } } (older entries without a language or version are dropped). */
export const offlineStore = createStore('offline', {}, (v) => {
  if (!isObject(v)) return undefined;
  const out = {};
  for (const [id, byLocale] of Object.entries(v)) {
    if (!isId(id) || !isObject(byLocale)) continue;
    for (const [locale, e] of Object.entries(byLocale)) {
      if ((locale === 'en' || locale === 'ar') && isObject(e) && isIso(e.at) && typeof e.version === 'string') (out[id] ??= {})[locale] = { at: e.at, version: e.version };
    }
  }
  return out;
});
export const dismissedStore = createStore('dismissed', [], (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 50) : undefined));
