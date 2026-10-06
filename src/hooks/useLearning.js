import { useMemo, useSyncExternalStore } from 'react';
import { earnedIds } from '../data/achievements.js';
import { getCourse } from '../data/courses.js';
import { catalogText } from '../i18n/content.js';
import { deriveStats } from '../lib/learning.js';
import { storageAvailable } from '../lib/storage.js';
import { enrollmentsStore, eventsStore, exercisesStore, notesStore, scoresStore, settingsStore, srsStore, timeStore } from '../lib/stores.js';
import { useNow } from './useNow.js';

const useStoreValue = (store) => useSyncExternalStore(store.subscribe, store.get, store.getServer);

/** The raw saved state (defaults while prerendering and hydrating). */
export function useLearningState() {
  return {
    enrollments: useStoreValue(enrollmentsStore),
    scores: useStoreValue(scoresStore),
    exercises: useStoreValue(exercisesStore),
    events: useStoreValue(eventsStore),
    srs: useStoreValue(srsStore),
    notes: useStoreValue(notesStore),
    time: useStoreValue(timeStore),
    settings: useStoreValue(settingsStore),
  };
}

/** Raw state + derived stats + earned badge ids. */
export function useLearning() {
  const state = useLearningState();
  const now = useNow(60_000);
  const day = now.toDateString();
  const stats = useMemo(() => {
    const s = deriveStats(state, now);
    const paths = catalogText('paths') ?? [];
    s.pathsCompleted = paths.filter((p) => {
      const ids = p.courses.filter((id) => getCourse(id));
      return ids.length > 0 && ids.every((id) => s.completedCourseIds.includes(id));
    }).length;
    return s;
    // `now` only matters at day granularity here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.enrollments, state.scores, state.exercises, state.events, state.srs, state.notes, state.time, state.settings, day]);
  const earned = useMemo(() => earnedIds(stats), [stats]);
  return { ...state, stats, earned, now };
}

export const useEnrollments = () => useStoreValue(enrollmentsStore);
export const useStorageBlocked = () => useSyncExternalStore(enrollmentsStore.subscribe, () => !storageAvailable(), () => false);
