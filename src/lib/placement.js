// The placement quiz's scoring (pure, unit-tested).
/** Scores the answers; ties go to the earlier path (pure, unit-tested). */
export function scorePlacement(questions, answers, pathIds) {
  const totals = Object.fromEntries(pathIds.map((id) => [id, 0]));
  questions.forEach((q, i) => {
    const o = q.options.find((x) => x.id === answers[i]);
    for (const [p, w] of Object.entries(o?.weights ?? {})) if (p in totals) totals[p] += w;
  });
  return [...pathIds].sort((a, b) => totals[b] - totals[a] || pathIds.indexOf(a) - pathIds.indexOf(b));
}

