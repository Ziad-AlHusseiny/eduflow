import { useEffect, useState } from 'react';
import { achievements } from '../../data/achievements.js';
import { useLearning } from '../../hooks/useLearning.js';
import { badgeHoldRemaining, badgesQuiet, justEarned } from '../../lib/badges.js';
import BadgeUnlockModal from './BadgeUnlockModal.jsx';

const keyOf = (set) => [...set].sort().join('|');

/**
 * Watches derived progress and pops what was just earned, one modal at a
 * time (PRD §7.4): a finished course first ("Course complete!"), then any
 * badge the same action unlocked. What was already earned when the app
 * loaded never pops; a badge that re-locks and is earned again pops again.
 */
export default function BadgeHost({ baseline }) {
  const { earned, stats } = useLearning();
  const courses = new Set(stats.completedCourseIds);
  const [seen, setSeen] = useState(() => ({ ...baseline, key: `${keyOf(baseline.earned)}#${keyOf(baseline.courses)}` }));
  const [queue, setQueue] = useState([]);
  const [now, setNow] = useState(0);

  // New badges/courses since the last render: queue them (state updates during render, not in an effect).
  const key = `${keyOf(earned)}#${keyOf(courses)}`;
  if (key !== seen.key && badgesQuiet()) {
    setSeen({ earned: new Set(earned), courses, key });
  } else if (key !== seen.key) {
    const items = [];
    for (const id of courses) if (!seen.courses.has(id)) items.push({ type: 'course', id });
    for (const id of earned) {
      if (seen.earned.has(id)) continue;
      justEarned.add(id);
      // The course modal already announces the Finisher badge.
      if (id === 'first-course-complete' && items.some((i) => i.type === 'course')) continue;
      items.push({ type: 'badge', id });
    }
    setSeen({ earned: new Set(earned), courses, key });
    if (items.length) setQueue((q) => [...q, ...items]);
  }

  // Wait while an auto-advance countdown is running (PRD §7.4: after the navigation settles).
  const hold = queue.length ? badgeHoldRemaining() : 0;
  useEffect(() => {
    if (!hold) return undefined;
    const timer = setTimeout(() => setNow(Date.now()), hold + 50);
    return () => clearTimeout(timer);
  }, [hold, now]);

  const current = !hold ? queue[0] : null;
  if (!current) return null;
  const badge = current.type === 'badge' ? achievements.find((a) => a.id === current.id) : null;
  return <BadgeUnlockModal key={`${current.type}-${current.id}`} item={current} badge={badge} onClose={() => setQueue((q) => q.slice(1))} />;
}
