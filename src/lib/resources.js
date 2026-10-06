// Course content that isn't in the JavaScript bundle (lesson bodies,
// assessments, the glossary) is fetched as JSON from /content/… and cached
// here. Prerendering seeds this cache from disk; the client fetches what a
// page needs before hydrating (main.jsx), so React's `use()` finds it
// already resolved and the static HTML hydrates without flashing.

import { use } from 'react';
import { CONTENT_VERSION } from '../generated/structure.js';

const cache = new Map();

const settle = (promise) => {
  promise.status = 'pending';
  promise.then(
    (value) => {
      promise.status = 'fulfilled';
      promise.value = value;
    },
    (reason) => {
      promise.status = 'rejected';
      promise.reason = reason;
    },
  );
  return promise;
};

export const contentUrl = (lang, path) => `/content/${lang}/${path}.json?v=${CONTENT_VERSION}`;
export const lessonUrl = (lang, lessonId) => contentUrl(lang, `lessons/${lessonId}`);
export const courseContentUrl = (lang, courseId) => contentUrl(lang, `courses/${courseId}`);
export const glossaryUrl = (lang) => contentUrl(lang, 'glossary');
export const searchUrl = (lang) => contentUrl(lang, 'search');

/** A cached thenable for a URL (React's `use()` reads .status/.value). */
export function resource(url) {
  let p = cache.get(url);
  if (!p) {
    p = settle(
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    );
    cache.set(url, p);
    // A failure isn't cached forever: the next render can retry (back online).
    p.catch(() => setTimeout(() => cache.get(url) === p && cache.delete(url), 0));
  }
  return p;
}

/** Prerender: put a value in the cache, already resolved. */
export function seedResource(url, value) {
  const p = Promise.resolve(value);
  p.status = 'fulfilled';
  p.value = value;
  cache.set(url, p);
}

export const peekResource = (url) => (cache.get(url)?.status === 'fulfilled' ? cache.get(url).value : undefined);
export const preload = (url) => resource(url).catch(() => null);
export const useResource = (url) => use(resource(url));
