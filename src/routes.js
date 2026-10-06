// The pages, their code-split chunks, and the content each one needs before
// it can render. main.jsx preloads the page's chunk and content;
// prerender.mjs adds <link rel="modulepreload"> / <link rel="preload"> for them.

import { courseContentUrl, glossaryUrl, lessonUrl } from './lib/resources.js';

// Each loader is memoized: the page, main.jsx and the idle warm-up share one
// promise, so a page loaded before hydration renders without suspending.
// A failed load is forgotten, so "Try again" (PageErrorBoundary) re-imports.
const once = (load) => {
  let p;
  let mod;
  const loader = () =>
    (p ??= load().then(
      (m) => (mod = m),
      (e) => {
        p = undefined;
        throw e;
      },
    ));
  loader.loaded = () => mod;
  return loader;
};

export const pageLoaders = {
  home: once(() => import('./pages/HomePage.jsx')),
  courses: once(() => import('./pages/CoursesPage.jsx')),
  course: once(() => import('./pages/CourseDetailPage.jsx')),
  assessment: once(() => import('./pages/AssessmentPage.jsx')),
  certificate: once(() => import('./pages/CertificatePage.jsx')),
  lesson: once(() => import('./pages/LessonPage.jsx')),
  learning: once(() => import('./pages/MyLearningPage.jsx')),
  review: once(() => import('./pages/ReviewPage.jsx')),
  notes: once(() => import('./pages/NotesPage.jsx')),
  stats: once(() => import('./pages/StatsPage.jsx')),
  paths: once(() => import('./pages/PathsPage.jsx')),
  path: once(() => import('./pages/PathDetailPage.jsx')),
  placement: once(() => import('./pages/PlacementPage.jsx')),
  glossary: once(() => import('./pages/GlossaryPage.jsx')),
  instructors: once(() => import('./pages/InstructorsPage.jsx')),
  instructor: once(() => import('./pages/InstructorPage.jsx')),
  privacy: once(() => import('./pages/PrivacyPage.jsx')),
  notFound: once(() => import('./pages/NotFoundPage.jsx')),
};

const PATTERNS = [
  ['home', /^\/$/],
  ['courses', /^\/courses$/],
  ['course', /^\/courses\/[^/]+$/],
  ['assessment', /^\/courses\/[^/]+\/(checkpoint\/[^/]+|final)$/],
  ['certificate', /^\/courses\/[^/]+\/certificate$/],
  ['lesson', /^\/lesson\/[^/]+\/[^/]+$/],
  ['learning', /^\/learning$/],
  ['review', /^\/review$/],
  ['notes', /^\/notes$/],
  ['stats', /^\/stats$/],
  ['paths', /^\/paths$/],
  ['path', /^\/paths\/[^/]+$/],
  ['placement', /^\/placement$/],
  ['glossary', /^\/glossary$/],
  ['instructors', /^\/instructors$/],
  ['instructor', /^\/instructors\/[^/]+$/],
  ['privacy', /^\/privacy$/],
];

/** Which page an in-app path (no /ar prefix) renders. */
export function pageOf(path) {
  const p = path.replace(/\/+$/, '') || '/';
  return PATTERNS.find(([, re]) => re.test(p))?.[0] ?? 'notFound';
}

/** The content JSON a page renders from (fetched before hydration). */
export function resourcesFor(path, locale) {
  const p = path.replace(/\/+$/, '') || '/';
  const page = pageOf(p);
  const parts = p.split('/');
  if (page === 'lesson') return [lessonUrl(locale, parts[3])];
  if (page === 'assessment') return [courseContentUrl(locale, parts[2])];
  if (page === 'glossary') return [glossaryUrl(locale)];
  return [];
}
