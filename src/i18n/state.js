// The active locale, shared by the translator and the formatters. The app
// remounts its tree when the locale changes, so module-level reads are safe.

export const LOCALES = {
  en: { dir: 'ltr', intl: 'en-US', label: 'English', short: 'EN', plural: 'en', base: '' },
  // Arabic text with Latin digits: amounts, progress and times read (and align) better.
  ar: { dir: 'rtl', intl: 'ar-EG-u-nu-latn', label: 'العربية', short: 'ع', plural: 'ar', base: '/ar' },
};

let active = 'en';

export function setActiveLocale(locale) {
  active = LOCALES[locale] ? locale : 'en';
}

export const activeLocale = () => active;
export const isRTL = () => LOCALES[active].dir === 'rtl';
export const intlLocale = () => LOCALES[active].intl;

const LRI = '⁦';
const PDI = '⁩';

/**
 * Keeps a number, time, or Latin name left-to-right inside Arabic text
 * (Unicode bidi isolate), so "1,450 / 2,000" never reorders. No-op in English.
 */
export function isolate(text) {
  return isRTL() ? `${LRI}${text}${PDI}` : String(text);
}

/** The locale an address belongs to: /ar/... is Arabic, everything else English. */
export const localeFromPath = (pathname) => (pathname === '/ar' || pathname.startsWith('/ar/') ? 'ar' : 'en');

/** The address of `path` (an in-app path like /recipes) in `locale`. */
export function localizedPath(path, locale) {
  const base = LOCALES[locale].base;
  if (!base) return path;
  return path === '/' ? base : `${base}${path}`;
}

/** Strips the /ar prefix: the in-app path the router sees. */
export function appPath(pathname) {
  if (pathname === '/ar' || pathname === '/ar/') return '/';
  return pathname.startsWith('/ar/') ? pathname.slice(3) : pathname;
}
