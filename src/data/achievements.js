// Badges, derived live from your progress (never stored), so un-completing
// a lesson re-locks a badge. The first eight are the PRD's (§6.4), in its
// order; the rest are BUILD-LOG additions. Names and rules are in the
// dictionaries (achievements.<id>.name / .rule).

export const achievements = [
  { id: 'first-enrollment', icon: 'Footprints', check: (s) => s.enrollmentCount >= 1 },
  { id: 'first-lesson', icon: 'Rocket', check: (s) => s.totalCompletedLessons >= 1 },
  { id: 'ten-lessons', icon: 'Zap', check: (s) => s.totalCompletedLessons >= 10 },
  { id: 'twenty-five-lessons', icon: 'Anchor', check: (s) => s.totalCompletedLessons >= 25 },
  { id: 'three-enrollments', icon: 'Compass', check: (s) => s.enrollmentCount >= 3 },
  { id: 'first-course-complete', icon: 'Trophy', check: (s) => s.completedCourseCount >= 1 },
  { id: 'streak-3', icon: 'Sunrise', check: (s) => s.longestStreak >= 3 },
  { id: 'streak-7', icon: 'Flame', check: (s) => s.longestStreak >= 7 },
  // Additions
  { id: 'first-exercise', icon: 'Code2', check: (s) => s.exercisesSolved >= 1 },
  { id: 'builder', icon: 'Hammer', check: (s) => s.exercisesSolved >= 25 },
  { id: 'quiz-master', icon: 'Brain', check: (s) => s.perfectQuizzes >= 10 },
  { id: 'checkpoint', icon: 'Flag', check: (s) => s.checkpointsPassed >= 5 },
  { id: 'sharp-shooter', icon: 'Crosshair', check: (s) => s.perfectFinals >= 1 },
  { id: 'certified', icon: 'Award', check: (s) => s.certificates >= 1 },
  { id: 'fifty-lessons', icon: 'Mountain', check: (s) => s.totalCompletedLessons >= 50 },
  { id: 'triple-crown', icon: 'Gem', check: (s) => s.completedCourseCount >= 3 },
  { id: 'path-finisher', icon: 'Map', check: (s) => s.pathsCompleted >= 1 },
  { id: 'polymath', icon: 'Shapes', check: (s) => s.categoriesEnrolled >= 4 },
  { id: 'streak-30', icon: 'Crown', check: (s) => s.longestStreak >= 30 },
  { id: 'card-collector', icon: 'Layers', check: (s) => s.reviews >= 100 },
  { id: 'flashcard-habit', icon: 'Repeat', check: (s) => s.reviewDays >= 5 },
  { id: 'note-taker', icon: 'NotebookPen', check: (s) => s.notesCount >= 10 },
  { id: 'night-owl', icon: 'Moon', check: (s) => s.nightOwl },
  { id: 'early-bird', icon: 'Coffee', check: (s) => s.earlyBird },
  { id: 'goal-getter', icon: 'Target', check: (s) => s.goalMet },
  { id: 'level-5', icon: 'Star', check: (s) => s.level.level >= 5 },
];

export const PRD_ACHIEVEMENTS = achievements.slice(0, 8).map((a) => a.id);

/** The ids of every badge `stats` earns. */
export const earnedIds = (stats) => new Set(achievements.filter((a) => a.check(stats)).map((a) => a.id));
