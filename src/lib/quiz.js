// Quiz scoring, shared by lesson quizzes, checkpoints and the final assessment.
export const PASS_MARK = 0.7;

/** { correct, total, pct, passed, answered } for answers (indices or null) against questions. */
export function scoreAnswers(questions, answers) {
  const total = questions.length;
  const correct = questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  const answered = answers.filter((a) => a != null).length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  return { correct, total, pct, passed: total > 0 && correct / total >= PASS_MARK, answered };
}
