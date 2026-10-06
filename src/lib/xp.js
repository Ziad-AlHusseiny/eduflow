// XP and levels, derived from what you've done (never stored), so they
// always agree with your progress.

export const XP = { lesson: 20, quizPoint: 5, exercise: 30, checkpoint: 50, final: 150, course: 100, review: 2 };

/** Total XP for {completedLessons, quizPoints, exercisesSolved, checkpointsPassed, finalsPassed, coursesCompleted, reviews}. */
export const totalXp = (s) =>
  s.completedLessons * XP.lesson + s.quizPoints * XP.quizPoint + s.exercisesSolved * XP.exercise + s.checkpointsPassed * XP.checkpoint + s.finalsPassed * XP.final + s.coursesCompleted * XP.course + s.reviews * XP.review;

/** XP needed to reach `level` (level 1 = 0, 2 = 100, 3 = 300, 4 = 600 …). */
export const xpForLevel = (level) => (100 * (level - 1) * level) / 2;

/** { level, current, next, progress (0–1) } for an XP total. */
export function levelFor(xp) {
  const level = Math.max(1, Math.floor((Math.sqrt(1 + (8 * Math.max(0, xp)) / 100) - 1) / 2) + 1);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current, next, progress: (xp - current) / (next - current) };
}
