import { useSyncExternalStore } from 'react';

function subscribeTo(query) {
  return (onChange) => {
    if (typeof window === 'undefined' || !window.matchMedia) return () => {};
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  };
}

const cache = new Map();

/** A media query as live state (false while prerendering and hydrating). */
export function useMedia(query) {
  if (!cache.has(query)) cache.set(query, subscribeTo(query));
  return useSyncExternalStore(
    cache.get(query),
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  );
}

/** prefers-reduced-motion: reduce, followed live (BRIEF criterion 9). */
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');

const noop = () => () => {};

/** False in the prerendered HTML and during hydration, true after. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);
