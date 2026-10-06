// Instructors, reviews, testimonials and paths (content/catalog, compiled
// into src/generated/text.<lang>.js), with helpers for the active language.

import { catalogText } from '../i18n/content.js';
import { courses, getCourse } from './courses.js';
import { activeLocale } from '../i18n/state.js';

export const instructors = () => catalogText('instructors') ?? [];
export const getInstructor = (id) => instructors().find((i) => i.id === id) ?? null;
export const instructorName = (i) => (i ? (activeLocale() === 'ar' && i.nameAr ? i.nameAr : i.name) : '');
export const reviewsFor = (courseId) => (catalogText('reviews') ?? []).filter((r) => r.courseId === courseId);
export const testimonials = () => catalogText('testimonials') ?? [];
export const paths = () => catalogText('paths') ?? [];
export const getPath = (id) => paths().find((p) => p.id === id) ?? null;
export const placement = () => catalogText('placement') ?? null;

/** Instructor learner totals and ratings are computed from the catalog. */
export function instructorStats(id) {
  const own = courses.filter((c) => c.instructorId === id);
  const learners = own.reduce((s, c) => s + c.students, 0);
  const rating = own.length ? Math.round((own.reduce((s, c) => s + c.rating * c.ratingCount, 0) / own.reduce((s, c) => s + c.ratingCount, 0)) * 10) / 10 : 0;
  return { courses: own, learners, rating };
}


/** A path's courses that exist in the catalog, in order. */
export const pathCourses = (p) => p.courses.map(getCourse).filter(Boolean);
