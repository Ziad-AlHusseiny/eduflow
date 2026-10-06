// "Download this course for offline": the course's lesson content,
// assessments and the glossary (in the current language) go into the
// `eduflow-content` cache that the service worker reads from. Pages need no
// download: the precached app shell renders any lesson from its content.
// A download is recorded per language with the content version it saved, so
// after an update that changed the content it shows as out of date (the
// service worker drops the old files).

import { CONTENT_VERSION } from '../generated/version.js';
import { courseContentUrl, glossaryUrl, lessonUrl } from './resources.js';
import { offlineStore } from './stores.js';

const CACHE = 'eduflow-content';

export const offlineSupported = () => typeof caches !== 'undefined' && 'serviceWorker' in navigator;

export function courseUrls(course, locale) {
  return [courseContentUrl(locale, course.id), glossaryUrl(locale), ...course.lessons.map((l) => lessonUrl(locale, l.id))];
}

/** 'current' | 'outdated' | null for a course in a language. */
export function downloadStatus(saved, courseId, locale) {
  const entry = saved[courseId]?.[locale];
  if (!entry) return null;
  return entry.version === CONTENT_VERSION ? 'current' : 'outdated';
}

/** Caches a course; calls onProgress(done, total). Resolves true when every file is saved. */
export async function downloadCourse(course, locale, onProgress) {
  const cache = await caches.open(CACHE);
  const urls = courseUrls(course, locale);
  let done = 0;
  for (const url of urls) {
    const res = await fetch(url, { cache: 'reload' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await cache.put(url, res);
    done += 1;
    onProgress?.(done, urls.length);
  }
  offlineStore.set((s) => ({ ...s, [course.id]: { ...s[course.id], [locale]: { at: new Date().toISOString(), version: CONTENT_VERSION } } }));
  return true;
}

export async function removeCourse(course, locale) {
  const cache = await caches.open(CACHE);
  // The glossary is shared with other downloaded courses: keep it.
  await Promise.all(courseUrls(course, locale).filter((u) => u !== glossaryUrl(locale)).map((u) => cache.delete(u)));
  offlineStore.set((s) => {
    const n = { ...s };
    const rest = { ...n[course.id] };
    delete rest[locale];
    if (Object.keys(rest).length) n[course.id] = rest;
    else delete n[course.id];
    return n;
  });
}
