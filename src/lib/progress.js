// Progress is derived, never stored (TECHNICAL-PLAN §5.2): everything here
// is computed from the enrollment store and the catalog. Unknown course or
// lesson ids in the store are ignored, so a stale save never breaks the math.

/** Lessons of a course in order: [{ id, minutes, sectionId, … }]. */
export const flatLessons = (course) => course?.lessons ?? [];

/** { pct, completed, total } — pct rounded, 0 when a course has no lessons. */
export function progressFor(course, completedIds = []) {
  const lessons = flatLessons(course);
  const total = lessons.length;
  if (!total) return { pct: 0, completed: 0, total: 0 };
  const done = new Set(completedIds);
  const completed = lessons.filter((l) => done.has(l.id)).length;
  return { pct: Math.round((completed / total) * 100), completed, total };
}

/** The lesson after `lessonId` (next in its section, else first of the next section), or null. */
export function nextLesson(course, lessonId) {
  const lessons = flatLessons(course);
  const i = lessons.findIndex((l) => l.id === lessonId);
  return i >= 0 && i < lessons.length - 1 ? lessons[i + 1] : null;
}

export function previousLesson(course, lessonId) {
  const lessons = flatLessons(course);
  const i = lessons.findIndex((l) => l.id === lessonId);
  return i > 0 ? lessons[i - 1] : null;
}

/** Continue target (PRD §5.6): last visited → first incomplete → lesson 1. */
export function continueTarget(course, enrollment) {
  const lessons = flatLessons(course);
  if (!lessons.length) return null;
  const ids = new Set(lessons.map((l) => l.id));
  if (enrollment?.lastVisitedLessonId && ids.has(enrollment.lastVisitedLessonId)) return enrollment.lastVisitedLessonId;
  const done = new Set(enrollment?.completedLessonIds ?? []);
  return (lessons.find((l) => !done.has(l.id)) ?? lessons[0]).id;
}

/** Minutes of a section / course. */
export const sectionMinutes = (section) => section.lessons.reduce((s, l) => s + l.minutes, 0);

/** Every lesson of a section complete? */
export const sectionComplete = (section, completedIds) => {
  const done = new Set(completedIds);
  return section.lessons.every((l) => done.has(l.id));
};
