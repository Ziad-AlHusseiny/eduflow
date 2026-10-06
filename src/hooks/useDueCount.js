import { useMemo, useSyncExternalStore } from 'react';
import { toLocalDate } from '../lib/dates.js';
import { reviewQueue } from '../lib/learning.js';
import { enrollmentsStore, srsStore } from '../lib/stores.js';

/** Flashcards waiting today (due + new), 0 while prerendering. */
export function useDueCount() {
  const es = useSyncExternalStore(enrollmentsStore.subscribe, enrollmentsStore.get, enrollmentsStore.getServer);
  const srs = useSyncExternalStore(srsStore.subscribe, srsStore.get, srsStore.getServer);
  return useMemo(() => reviewQueue(es, srs, toLocalDate()).queue.length, [es, srs]);
}
