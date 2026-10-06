import { continueTarget, progressFor } from '../lib/progress.js';
import { useEnrollments } from './useLearning.js';

/** { enrolled, enrollment, progress, target } for a course. */
export function useCourseEnrollment(course) {
  const state = useEnrollments();
  const e = state.enrollments[course.id];
  const progress = progressFor(course, e?.completedLessonIds ?? []);
  return { enrolled: Boolean(e), enrollment: e, progress, target: e ? continueTarget(course, e) : course.lessons[0].id };
}

