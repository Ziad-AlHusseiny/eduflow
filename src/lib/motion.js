// Motion's animation features load in their own chunk after the page is
// interactive (LazyMotion), so the first paint never waits for them.
//
// Until they arrive, nothing may rely on an exit animation finishing (an
// AnimatePresence child removed before the features load never reports its
// exit done, and its replacement would never mount). Components check
// useMotionReady() and render plainly until then.

import { useSyncExternalStore } from 'react';

let ready = false;
let pending = null;
const listeners = new Set();

export function loadFeatures() {
  pending ??= import('./motionFeatures.js').then((m) => {
    ready = true;
    listeners.forEach((fn) => fn());
    return m.default;
  });
  return pending;
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** True once Motion's features are loaded (false while prerendering and hydrating). */
export const useMotionReady = () => useSyncExternalStore(subscribe, () => ready, () => false);

export const SPRING = { type: 'spring', stiffness: 350, damping: 32 };
export const EASE = [0.22, 1, 0.36, 1];
