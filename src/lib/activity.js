// Activity per local day (the heatmap and stats): lessons, quizzes,
// exercises and reviews from the event log, plus days in the PRD activity log.
import { toLocalDate } from './dates.js';

export function activityCounts(events, activityLog = []) {
  const counts = {};
  for (const [type, , at] of events) {
    if (type === 'enroll') continue;
    const d = toLocalDate(new Date(at));
    counts[d] = (counts[d] ?? 0) + 1;
  }
  for (const d of activityLog) counts[d] = Math.max(1, counts[d] ?? 0);
  return counts;
}
