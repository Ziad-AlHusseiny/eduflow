// Switching language in place: load the dictionary, remount the app in the
// new locale, and move the address bar to the same page in the other
// language (/courses ↔ /ar/courses), so a reload or a shared link lands in
// the same language on the same page.

import { loadDictionary } from '../i18n/index.js';
import { activeLocale, appPath, LOCALES, localizedPath, setActiveLocale } from '../i18n/state.js';
import { loadPageText } from '../i18n/content.js';
import { preload } from './resources.js';
import { localeStore } from './stores.js';
import { pageOf, resourcesFor } from '../routes.js';

const listeners = new Set();

export const subscribeLocale = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const otherLocale = () => (activeLocale() === 'ar' ? 'en' : 'ar');

/** The other language's address for an in-app path (what the toggle links to without JS). */
export function localeHref(locale, path, search = '') {
  const target = localizedPath(path, locale);
  const q = search.replace(/^\?/, '');
  if (locale === 'en') return `${target}?${q ? `${q}&` : ''}lang=en`;
  return q ? `${target}?${q}` : target;
}

export async function switchLocale(next) {
  if (!LOCALES[next] || next === activeLocale()) return;
  const path = appPath(location.pathname);
  // The page's content in the other language arrives before the swap.
  await Promise.all([loadDictionary(next), loadPageText(pageOf(path), next), ...resourcesFor(path, next).map(preload)]);
  setActiveLocale(next);
  localeStore.set(next);
  const root = document.documentElement;
  root.lang = next;
  root.dir = LOCALES[next].dir;
  document.querySelector('link[rel="manifest"]')?.setAttribute('href', next === 'ar' ? '/manifest-ar.webmanifest' : '/manifest.webmanifest');
  history.replaceState(history.state, '', localizedPath(path, next) + location.search.replace(/[?&]lang=en\b/, '').replace(/^&/, '?') + location.hash);
  listeners.forEach((fn) => fn());
}
