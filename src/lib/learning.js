// The learner's actions (enroll, complete a lesson, save a quiz score …)
// and everything derived from them (progress, streaks, XP, badges). One
// place writes the stores; components only call these.

import { courses, findLesson, getCourse } from '../data/courses.js';
import { addDays, toLocalDate, weekStart } from './dates.js';
import { continueTarget, progressFor } from './progress.js';
import { buildQueue } from './srs.js';
import { schedule } from './srs.js';
import { bookmarksStore, enrollmentsStore, eventsStore, exercisesStore, notesStore, scoresStore, srsStore, timeStore } from './stores.js';
import { currentStreak, longestStreak } from './streak.js';
import { levelFor, totalXp } from './xp.js';

import { PASS_MARK } from './quiz.js';
export { PASS_MARK };

function logActivity(state, now) {
  const day = toLocalDate(now);
  return state.activityLog.includes(day) ? state.activityLog : [...state.activityLog, day].sort();
}
/** Records a learning activity day (quizzes, exercises and reviews count, as well as the PRD's enroll + complete). */
export function markActive(now = new Date()) {
  enrollmentsStore.set((s) => {
    const log = logActivity(s, now);
    return log === s.activityLog ? s : { ...s, activityLog: log };
  });
}
export function logEvent(type, id, now = new Date()) {
  eventsStore.set((list) => [...list, [type, id, now.toISOString()]].slice(-4000));
}

// ── Enrollment + lessons (PRD §5.6, §7.3) ──
export function enroll(courseId, now = new Date()) {
  if (!getCourse(courseId)) return;
  enrollmentsStore.set((s) => {
    if (s.enrollments[courseId]) return s;
    return { ...s, enrollments: { ...s.enrollments, [courseId]: { enrolledAt: now.toISOString(), completedLessonIds: [], lastVisitedLessonId: null } }, activityLog: logActivity(s, now) };
  });
  logEvent('enroll', courseId, now);
}

export function unenroll(courseId) {
  enrollmentsStore.set((s) => {
    if (!s.enrollments[courseId]) return s;
    const enrollments = { ...s.enrollments };
    delete enrollments[courseId];
    return { ...s, enrollments };
  });
}

/** Toggles a lesson; returns true when it is now complete. */
export function toggleLessonComplete(courseId, lessonId, now = new Date()) {
  let completed = false;
  enrollmentsStore.set((s) => {
    const e = s.enrollments[courseId];
    if (!e) return s;
    const done = e.completedLessonIds.includes(lessonId);
    completed = !done;
    const completedLessonIds = done ? e.completedLessonIds.filter((id) => id !== lessonId) : [...e.completedLessonIds, lessonId];
    return { ...s, enrollments: { ...s.enrollments, [courseId]: { ...e, completedLessonIds } }, activityLog: done ? s.activityLog : logActivity(s, now) };
  });
  if (completed) logEvent('lesson', lessonId, now);
  return completed;
}

export function setLastVisited(courseId, lessonId) {
  enrollmentsStore.set((s) => {
    const e = s.enrollments[courseId];
    if (!e || e.lastVisitedLessonId === lessonId) return s;
    return { ...s, enrollments: { ...s.enrollments, [courseId]: { ...e, lastVisitedLessonId: lessonId } } };
  });
}

// ── Scores ──
/** Saves a quiz/checkpoint/final attempt; keeps the best. kind: 'lessons' | 'checkpoints' | 'finals'. */
export function recordScore(kind, id, correct, total, now = new Date()) {
  const passed = correct / total >= PASS_MARK;
  scoresStore.set((s) => {
    const prev = s[kind][id];
    const best = Math.max(prev?.best ?? 0, correct);
    const entry = { best, total, attempts: (prev?.attempts ?? 0) + 1, at: now.toISOString() };
    if (kind === 'finals') entry.passedAt = prev?.passedAt ?? (passed ? now.toISOString() : null);
    return { ...s, [kind]: { ...s[kind], [id]: entry } };
  });
  logEvent(kind === 'lessons' ? 'quiz' : kind === 'checkpoints' ? 'checkpoint' : 'final', id, now);
  markActive(now);
  return passed;
}

// ── Exercises ──
export function recordExercise(lessonId, solved, now = new Date()) {
  let first = false;
  exercisesStore.set((s) => {
    const prev = s[lessonId] ?? { solvedAt: null, attempts: 0, revealed: false };
    first = solved && !prev.solvedAt;
    return { ...s, [lessonId]: { ...prev, attempts: prev.attempts + 1, solvedAt: prev.solvedAt ?? (solved ? now.toISOString() : null) } };
  });
  if (first) {
    logEvent('exercise', lessonId, now);
    markActive(now);
  }
  return first;
}
export function revealSolution(lessonId) {
  exercisesStore.set((s) => ({ ...s, [lessonId]: { solvedAt: null, attempts: 0, ...s[lessonId], revealed: true } }));
}

// ── Flashcards ──
export function reviewCard(cardId, grade, now = new Date()) {
  const today = toLocalDate(now);
  srsStore.set((s) => ({ cards: { ...s.cards, [cardId]: schedule(s.cards[cardId], grade, today) }, days: { ...s.days, [today]: (s.days[today] ?? 0) + 1 } }));
}
/** After a review session: one event and one active day. */
export function finishReviewSession(count, now = new Date()) {
  if (!count) return;
  logEvent('review', String(count), now);
  markActive(now);
}

// ── Study time ──
export function addStudySeconds(seconds, now = new Date()) {
  const day = toLocalDate(now);
  timeStore.set((t) => ({ ...t, [day]: Math.min(86400, (t[day] ?? 0) + seconds) }));
}

// ── Notes + bookmarks ──
export function saveNote(lessonId, text, now = new Date()) {
  notesStore.set((n) => {
    const next = { ...n };
    if (text.trim()) next[lessonId] = { text, at: now.toISOString() };
    else delete next[lessonId];
    return next;
  });
}
export function toggleBookmark(lessonId, now = new Date()) {
  let on = false;
  bookmarksStore.set((b) => {
    const next = { ...b };
    if (next[lessonId]) delete next[lessonId];
    else {
      next[lessonId] = now.toISOString();
      on = true;
    }
    return next;
  });
  return on;
}

// ── Derived ──
/** Enrolled, known courses with their progress, most recently active first. */
export function enrolledCourses(enrollState, events = []) {
  const lastActive = new Map();
  for (const [type, id, at] of events) {
    if (type === 'lesson' || type === 'enroll') {
      const c = type === 'enroll' ? id : findLesson(id)?.course.id;
      if (c) lastActive.set(c, at);
    }
  }
  return Object.entries(enrollState.enrollments)
    .filter(([id]) => getCourse(id))
    .map(([id, e]) => {
      const course = getCourse(id);
      return { course, enrollment: e, progress: progressFor(course, e.completedLessonIds), continueId: continueTarget(course, e), lastActive: lastActive.get(id) ?? e.enrolledAt };
    })
    .sort((a, b) => b.lastActive.localeCompare(a.lastActive));
}

/** Flashcard ids unlocked by completed lessons: "<courseId>:<termId>", in course order. */
export function unlockedCards(enrollState, courseFilter = null) {
  const out = [];
  for (const c of courses) {
    if (courseFilter && c.id !== courseFilter) continue;
    const done = new Set(enrollState.enrollments[c.id]?.completedLessonIds ?? []);
    for (const [termId, lessonId] of c.glossary) if (done.has(lessonId)) out.push(`${c.id}:${termId}`);
  }
  return out;
}

export function reviewQueue(enrollState, srs, today, courseFilter = null) {
  return buildQueue(unlockedCards(enrollState, courseFilter), srs, today);
}

/** Lessons completed per local week (Mon start) and minutes per day, for /stats and the weekly goal. */
export function weeklyLessons(events, today, weeks = 12) {
  const start = weekStart(today);
  const buckets = Array.from({ length: weeks }, (_, i) => ({ week: addDays(start, (i - (weeks - 1)) * 7), lessons: new Set() }));
  for (const [type, id, at] of events) {
    if (type !== 'lesson') continue;
    const w = weekStart(toLocalDate(new Date(at)));
    buckets.find((b) => b.week === w)?.lessons.add(id);
  }
  return buckets.map((b) => ({ week: b.week, count: b.lessons.size }));
}

/** Minutes studied in each of the last `weeks` local weeks (Mon start), oldest first. */
export function weeklyMinutes(time, today, weeks = 12) {
  const start = weekStart(today);
  const seconds = Array.from({ length: weeks }, () => 0);
  for (const [day, s] of Object.entries(time)) {
    const i = weeks - 1 - Math.round((Date.parse(`${start}T00:00:00Z`) - Date.parse(`${weekStart(day)}T00:00:00Z`)) / (7 * 864e5));
    if (i >= 0 && i < weeks) seconds[i] += s;
  }
  return seconds.map((s) => Math.round(s / 60));
}

export function weekMinutes(time, today) {
  const start = weekStart(today);
  let s = 0;
  for (let i = 0; i < 7; i++) s += time[addDays(start, i)] ?? 0;
  return Math.round(s / 60);
}

/**
 * Everything the badges, XP and stats need, from the raw stores. Unknown
 * ids are ignored; nothing here is persisted.
 */
export function deriveStats({ enrollments: es, scores, exercises, events, srs, notes, time, settings }, now = new Date()) {
  const today = toLocalDate(now);
  const known = Object.entries(es.enrollments).filter(([id]) => getCourse(id));
  let completedLessons = 0;
  let coursesCompleted = 0;
  const categories = new Set();
  const completedCourseIds = [];
  for (const [id, e] of known) {
    const course = getCourse(id);
    const p = progressFor(course, e.completedLessonIds);
    completedLessons += p.completed;
    categories.add(course.category);
    if (p.total && p.completed === p.total) {
      coursesCompleted += 1;
      completedCourseIds.push(id);
    }
  }
  const lessonScores = Object.entries(scores.lessons).filter(([id]) => findLesson(id));
  const quizPoints = lessonScores.reduce((s, [, x]) => s + x.best, 0);
  const perfectQuizzes = lessonScores.filter(([, x]) => x.best === x.total).length;
  const checkpointsPassed = Object.values(scores.checkpoints).filter((x) => x.best / x.total >= PASS_MARK).length;
  const finals = Object.entries(scores.finals).filter(([id]) => getCourse(id));
  const finalsPassed = finals.filter(([, x]) => x.passedAt).length;
  const perfectFinals = finals.filter(([, x]) => x.best === x.total).length;
  const certificates = finals.filter(([id, x]) => x.passedAt && completedCourseIds.includes(id)).length;
  const exercisesSolved = Object.entries(exercises).filter(([id, x]) => x.solvedAt && findLesson(id)).length;
  const reviews = Object.values(srs.cards).reduce((s, c) => s + c.reviews, 0);
  const reviewDays = Object.keys(srs.days).length;
  const hours = events.filter(([type]) => type === 'lesson').map(([, , at]) => new Date(at).getHours());
  const minutes = Math.round(Object.values(time).reduce((s, x) => s + x, 0) / 60);
  const weekly = weeklyLessons(events, today, 26);
  // Any week (of the last 26) that met the goal, in the unit chosen now.
  const goalMet = settings.goalUnit === 'minutes' ? weeklyMinutes(time, today, 26).some((m) => m >= settings.goalTarget) : weekly.some((w) => w.count >= settings.goalTarget);
  const base = { completedLessons, quizPoints, exercisesSolved, checkpointsPassed, finalsPassed, coursesCompleted, reviews };
  const xp = totalXp(base);
  return {
    ...base,
    enrollmentCount: known.length,
    totalCompletedLessons: completedLessons,
    completedCourseCount: coursesCompleted,
    completedCourseIds,
    currentStreak: currentStreak(es.activityLog, today),
    longestStreak: longestStreak(es.activityLog),
    perfectQuizzes,
    perfectFinals,
    certificates,
    reviewDays,
    nightOwl: hours.some((h) => h >= 22 || h < 5),
    earlyBird: hours.some((h) => h >= 5 && h < 7),
    notesCount: Object.keys(notes).filter((id) => findLesson(id)).length,
    categoriesEnrolled: categories.size,
    minutes,
    goalMet,
    xp,
    level: levelFor(xp),
  };
}
