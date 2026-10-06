// A small translator: nested dictionaries, {placeholders}, CLDR plural forms
// (Arabic has six), and rich templates that can embed elements. English is
// bundled; Arabic (the UI and all course text) loads on demand and is
// preloaded on /ar pages.

import { createElement, Fragment } from 'react';
import { activeLocale, LOCALES } from './state.js';

// Each page loads only its own language's dictionary (main.jsx, before
// hydrating; prerendering registers both).
const DICTS = {};

export function registerDictionary(locale, dict) {
  DICTS[locale] = dict;
}

export const hasDictionary = (locale) => Boolean(DICTS[locale]);

/** Loads a locale's dictionary (a lazy chunk per language). */
export async function loadDictionary(locale) {
  if (DICTS[locale]) return;
  const dict = await (locale === 'ar' ? import('./ar.js') : import('./en.js'));
  registerDictionary(locale, dict.default);
}

// Own properties only: a stray key like "constructor" must never resolve.
function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node != null && typeof node === 'object' && Object.hasOwn(node, part) ? node[part] : undefined), dict);
}

export function interpolate(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (match, name) => (params[name] == null ? match : String(params[name])));
}

function resolve(locale, key, params) {
  let value = lookup(DICTS[locale] ?? DICTS.en, key) ?? lookup(DICTS.en, key);
  if (value == null || (typeof value !== 'string' && typeof value !== 'object')) return key;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const count = params?.count ?? 0;
    const category = count === 0 && value.zero ? 'zero' : new Intl.PluralRules(LOCALES[locale].plural).select(count);
    value = value[category] ?? value.other;
  }
  return typeof value === 'string' ? value : key;
}

/** t('nav.courses'), t('catalog.showing', { count: 8, total: 16 }) */
export function t(key, params) {
  return interpolate(resolve(activeLocale(), key, params), params);
}

/** Always English: stable values for exports and tests. */
export function tEn(key, params) {
  return interpolate(resolve('en', key, params), params);
}

export function has(key) {
  return lookup(DICTS[activeLocale()] ?? DICTS.en, key) != null || lookup(DICTS.en, key) != null;
}

/** A list from the dictionary. */
export function list(key) {
  const value = lookup(DICTS[activeLocale()] ?? DICTS.en, key) ?? lookup(DICTS.en, key);
  return Array.isArray(value) ? value : [];
}

/** Like t(), but placeholders can be React elements. */
export function rich(key, params = {}) {
  const template = resolve(activeLocale(), key, params);
  return template
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((part, i) => {
      const name = part.match(/^\{(\w+)\}$/)?.[1];
      return createElement(Fragment, { key: i }, name && params[name] != null ? params[name] : part);
    });
}

export { DICTS };
