// Course text per language, compiled from content/ by scripts/content/build.mjs,
// in three chunks so each page loads only what it shows:
//
//   text.<lang>     course titles and taglines, paths, testimonials, instructor names
//   outline.<lang>  section and lesson titles             (OUTLINE_PAGES)
//   details.<lang>  descriptions, learn items, reviews,   (DETAIL_PAGES)
//                   instructor bios, the placement quiz
//
// main.jsx loads a page's chunks before hydrating it; pages call
// useOutline() / useDetails(), which suspend until the chunk is there on
// client-side navigation.

import { use } from 'react';
import { activeLocale } from './state.js';

const LOADERS = {
  text: { en: () => import('../generated/text.en.js'), ar: () => import('../generated/text.ar.js') },
  outline: { en: () => import('../generated/outline.en.js'), ar: () => import('../generated/outline.ar.js') },
  details: { en: () => import('../generated/details.en.js'), ar: () => import('../generated/details.ar.js') },
};
const DATA = { text: {}, outline: {}, details: {} };
const pending = { text: {}, outline: {}, details: {} };

export const OUTLINE_PAGES = new Set(['course', 'lesson', 'learning', 'notes', 'review', 'glossary', 'assessment', 'certificate']);
export const DETAIL_PAGES = new Set(['course', 'instructors', 'instructor', 'placement']);

/** Prerendering registers everything up front. */
export function registerContent(kind, locale, value) {
  DATA[kind][locale] = value;
}

function load(kind, locale) {
  if (DATA[kind][locale]) return Promise.resolve(DATA[kind][locale]);
  pending[kind][locale] ??= LOADERS[kind][locale]().then(
    (m) => (DATA[kind][locale] = m.default),
    (e) => {
      pending[kind][locale] = undefined;
      throw e;
    },
  );
  return pending[kind][locale];
}
export const loadText = (locale) => load('text', locale);
export const loadOutline = (locale) => load('outline', locale);
export const loadDetails = (locale) => load('details', locale);

/** Everything a page needs before it can render (main.jsx, the language switch). */
export function loadPageText(page, locale) {
  return Promise.all([loadText(locale), OUTLINE_PAGES.has(page) ? loadOutline(locale) : null, DETAIL_PAGES.has(page) ? loadDetails(locale) : null]);
}

const useChunk = (kind) => {
  const locale = activeLocale();
  return DATA[kind][locale] ?? use(load(kind, locale));
};
/** Suspends until the section/lesson titles are loaded. */
export const useOutline = () => useChunk('outline');
/** Suspends until course details, reviews, bios and the placement quiz are loaded. */
export const useDetails = () => useChunk('details');

const get = (kind) => DATA[kind][activeLocale()] ?? DATA[kind].en;

/** { title, tagline } always; plus description[], audience, prerequisites, learnItems[] with details loaded; sections{}, lessons{} with the outline. */
export const courseText = (id) => ({ ...(get('text')?.courses?.[id] ?? {}), ...(get('outline')?.courses?.[id] ?? {}), ...(get('details')?.courses?.[id] ?? {}) });
export const lessonTitle = (courseId, lessonId) => get('outline')?.courses?.[courseId]?.lessons?.[lessonId] ?? '';
export const sectionTitle = (courseId, sectionId) => get('outline')?.courses?.[courseId]?.sections?.[sectionId] ?? '';
/** Catalog copy: instructors (bios with details), reviews and placement (details), testimonials and paths (text). */
export const catalogText = (name) => get('details')?.catalog?.[name] ?? get('text')?.catalog?.[name];
