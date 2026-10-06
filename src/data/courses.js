// The catalog (PRD §8, plus the four courses added in BUILD-LOG): price,
// level, ratings and the instructor live here; sections, lessons and
// minutes come from the compiled content (src/generated/structure.js), so
// counts and durations are always computed, never typed in twice.

import { STRUCTURE } from '../generated/structure.js';

const META = [
  { id: 'react-fundamentals', category: 'web-development', level: 'beginner', price: 0, anchorPrice: null, rating: 4.8, ratingCount: 1284, students: 12400, featured: true, publishedAt: '2026-03-14', updatedAt: '2026-06-01', instructorId: 'maya-chen' },
  { id: 'advanced-typescript', category: 'web-development', level: 'advanced', price: 49, anchorPrice: 79, rating: 4.9, ratingCount: 861, students: 6850, featured: true, publishedAt: '2026-02-02', updatedAt: '2026-07-10', instructorId: 'daniel-okafor' },
  { id: 'css-mastery', category: 'web-development', level: 'intermediate', price: 29, anchorPrice: 49, rating: 4.7, ratingCount: 1052, students: 9300, featured: false, publishedAt: '2025-11-20', updatedAt: '2026-06-18', instructorId: 'sofia-reyes' },
  { id: 'python-data-analysis', category: 'data-science', level: 'beginner', price: 0, anchorPrice: null, rating: 4.6, ratingCount: 1730, students: 15200, featured: false, publishedAt: '2025-09-08', updatedAt: '2026-05-22', instructorId: 'liam-patel' },
  { id: 'sql-for-analysts', category: 'data-science', level: 'intermediate', price: 39, anchorPrice: 59, rating: 4.7, ratingCount: 940, students: 8100, featured: false, publishedAt: '2026-01-12', updatedAt: '2026-06-30', instructorId: 'liam-patel' },
  { id: 'figma-ui-design', category: 'design', level: 'beginner', price: 0, anchorPrice: null, rating: 4.8, ratingCount: 1368, students: 11700, featured: false, publishedAt: '2025-10-15', updatedAt: '2026-05-05', instructorId: 'sofia-reyes' },
  { id: 'design-systems', category: 'design', level: 'advanced', price: 59, anchorPrice: 99, rating: 4.9, ratingCount: 612, students: 4900, featured: true, publishedAt: '2026-04-21', updatedAt: '2026-08-12', instructorId: 'sofia-reyes' },
  { id: 'react-native-apps', category: 'mobile-development', level: 'intermediate', price: 49, anchorPrice: 79, rating: 4.5, ratingCount: 803, students: 7400, featured: false, publishedAt: '2025-12-03', updatedAt: '2026-07-01', instructorId: 'maya-chen' },
  { id: 'swift-essentials', category: 'mobile-development', level: 'beginner', price: 29, anchorPrice: 49, rating: 4.4, ratingCount: 589, students: 5600, featured: false, publishedAt: '2026-01-28', updatedAt: '2026-06-09', instructorId: 'daniel-okafor' },
  { id: 'docker-kubernetes', category: 'devops-cloud', level: 'intermediate', price: 59, anchorPrice: 99, rating: 4.8, ratingCount: 976, students: 8900, featured: false, publishedAt: '2025-11-04', updatedAt: '2026-07-22', instructorId: 'amara-diallo' },
  { id: 'aws-cloud-foundations', category: 'devops-cloud', level: 'beginner', price: 0, anchorPrice: null, rating: 4.5, ratingCount: 1204, students: 10800, featured: false, publishedAt: '2025-08-26', updatedAt: '2026-04-30', instructorId: 'amara-diallo' },
  { id: 'ml-crash-course', category: 'ai-machine-learning', level: 'intermediate', price: 69, anchorPrice: 119, rating: 4.9, ratingCount: 1090, students: 9600, featured: true, publishedAt: '2026-05-18', updatedAt: '2026-08-28', instructorId: 'liam-patel' },
  { id: 'javascript-fundamentals', category: 'web-development', level: 'beginner', price: 0, anchorPrice: null, rating: 4.8, ratingCount: 2140, students: 18600, featured: false, publishedAt: '2026-06-09', updatedAt: '2026-09-14', instructorId: 'maya-chen' },
  { id: 'git-github', category: 'devops-cloud', level: 'beginner', price: 0, anchorPrice: null, rating: 4.7, ratingCount: 1517, students: 14300, featured: false, publishedAt: '2026-07-07', updatedAt: '2026-09-08', instructorId: 'kenji-watanabe' },
  { id: 'web-accessibility', category: 'web-development', level: 'intermediate', price: 39, anchorPrice: 59, rating: 4.9, ratingCount: 498, students: 3900, featured: false, publishedAt: '2026-08-04', updatedAt: '2026-09-22', instructorId: 'leila-haddad' },
  { id: 'testing-javascript', category: 'web-development', level: 'intermediate', price: 49, anchorPrice: 79, rating: 4.8, ratingCount: 642, students: 5200, featured: false, publishedAt: '2026-07-28', updatedAt: '2026-09-18', instructorId: 'kenji-watanabe' },
];

/** Courses whose content is compiled, in PRD order, with derived totals. */
export const courses = META.flatMap((meta) => {
  const s = STRUCTURE.find((c) => c.id === meta.id);
  if (!s) return [];
  const lessons = s.sections.flatMap((sec, si) => sec.lessons.map((l, li) => ({ ...l, sectionId: sec.id, sectionIndex: si, index: li })));
  return [
    {
      ...meta,
      abbrev: s.abbrev,
      engines: s.engines,
      sections: s.sections,
      lessons,
      lessonCount: lessons.length,
      sectionCount: s.sections.length,
      durationMinutes: lessons.reduce((sum, l) => sum + l.minutes, 0),
      exerciseCount: lessons.filter((l) => l.ex).length,
      glossary: s.glossary,
      words: s.words,
    },
  ];
});

const byId = new Map(courses.map((c) => [c.id, c]));
export const getCourse = (id) => byId.get(id) ?? null;
export const COURSE_IDS = new Set(courses.map((c) => c.id));

const lessonIndex = new Map();
for (const c of courses) for (const l of c.lessons) lessonIndex.set(l.id, { course: c, lesson: l });
export const findLesson = (lessonId) => lessonIndex.get(lessonId) ?? null;
export const ALL_LESSON_IDS = new Set(lessonIndex.keys());

/** The average rating across the catalog (hero eyebrow), one decimal. */
export const averageRating = () => Math.round((courses.reduce((s, c) => s + c.rating, 0) / Math.max(1, courses.length)) * 10) / 10;
