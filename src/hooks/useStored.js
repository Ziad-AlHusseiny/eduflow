import { useSyncExternalStore } from 'react';

/**
 * [value, setValue] for a persisted store. The prerendered HTML and the
 * hydration pass use the default; the saved value follows right after.
 */
export function useStored(store) {
  const value = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  return [value, store.set];
}
