// Light (the approved theme) and dark (BUILD-LOG: D9 reversed for evening
// study). With no saved choice, EduFlow follows the system setting.
// index.html applies the theme before first paint, so there's no flash.

import { useSyncExternalStore } from 'react';
import { themeStore } from './stores.js';

const COLORS = { light: '#fafaff', dark: '#110e1c' };
const QUERY = '(prefers-color-scheme: dark)';
const systemDark = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.(QUERY).matches);

export const effectiveTheme = (saved = themeStore.get()) => saved ?? (systemDark() ? 'dark' : 'light');

export function applyTheme(theme = effectiveTheme()) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLORS[theme]);
}

export function toggleTheme() {
  const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
  themeStore.set(next);
  applyTheme(next);
}

function subscribe(onChange) {
  const offStore = themeStore.subscribe(onChange);
  const mql = typeof window !== 'undefined' ? window.matchMedia?.(QUERY) : null;
  const onSystem = () => {
    if (!themeStore.get()) applyTheme();
    onChange();
  };
  mql?.addEventListener('change', onSystem);
  return () => {
    offStore();
    mql?.removeEventListener('change', onSystem);
  };
}

if (typeof document !== 'undefined') themeStore.subscribe(() => applyTheme());

/** 'light' | 'dark' as live state ('light' while prerendering). */
export const useTheme = () => useSyncExternalStore(subscribe, () => effectiveTheme(), () => 'light');
