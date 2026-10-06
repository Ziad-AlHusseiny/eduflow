import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { t } from '../../i18n/index.js';
import { scoreAnswers } from '../../lib/quiz.js';
import Button from '../ui/Button.jsx';

/** One question: radio options, a Check button, then why every option is right or wrong. */
export function QuizQuestion({ q, index, total, value, onChange, revealed, onCheck, name }) {
  const legendId = useId();
  const correct = value === q.answer;
  return (
    <fieldset className="card p-5 md:p-6" aria-describedby={revealed ? `${legendId}-result` : undefined} data-testid="quiz-question">
      <legend className="sr-only">{t('quiz.question', { n: index + 1, total })}</legend>
      <p className="text-[13px] font-semibold text-ink-muted" aria-hidden="true">
        {t('quiz.question', { n: index + 1, total })}
      </p>
      <div id={legendId} className="prose-sm mt-2 font-medium text-ink" dangerouslySetInnerHTML={{ __html: q.q }} />
      <ul className="mt-4 space-y-2">
        {q.options.map((o, i) => {
          const isAnswer = i === q.answer;
          const chosen = value === i;
          const state = !revealed ? (chosen ? 'border-primary bg-primary-soft/50' : 'border-border hover:border-primary/60') : isAnswer ? 'border-success bg-success-soft/50' : chosen ? 'border-danger bg-danger-soft' : 'border-border opacity-80';
          return (
            <li key={i}>
              <label className={`flex cursor-pointer gap-3 rounded-[12px] border p-3 transition-colors ${state} ${revealed ? 'cursor-default' : ''}`}>
                <input type="radio" name={name} checked={chosen} disabled={revealed} onChange={() => onChange(i)} className="mt-1 size-[18px] shrink-0 accent-[var(--color-primary)]" />
                <span className="min-w-0 flex-1">
                  <span className="prose-sm block text-ink" dangerouslySetInnerHTML={{ __html: o.text }} />
                  {revealed && (
                    <span className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-muted">
                      {isAnswer ? <CheckCircle2 aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-success-deep" /> : <XCircle aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-danger-ink" />}
                      <span className="sr-only">{isAnswer ? t('quiz.rightAnswer') : ''}{chosen && !isAnswer ? t('quiz.yourAnswer') : ''}: </span>
                      <span className="prose-sm" dangerouslySetInnerHTML={{ __html: o.why }} />
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {onCheck && !revealed && (
        <Button size="sm" className="mt-4" disabled={value == null} onClick={onCheck}>
          {t('quiz.check')}
        </Button>
      )}
      {revealed && (
        <p id={`${legendId}-result`} role="status" className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${correct ? 'text-success-deep' : 'text-danger-ink'}`}>
          {correct ? <CheckCircle2 aria-hidden="true" size={18} /> : <XCircle aria-hidden="true" size={18} />}
          {correct ? t('quiz.correct') : t('quiz.incorrect')}
        </p>
      )}
    </fieldset>
  );
}

/** A lesson quiz (3–5 questions), checked one by one; the best score is saved. */
export default function Quiz({ questions, best, onComplete }) {
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [revealed, setRevealed] = useState(() => questions.map(() => false));
  const [attempt, setAttempt] = useState(0);
  const name = useId();
  const done = revealed.every(Boolean);
  const score = scoreAnswers(questions, answers).correct;

  const check = (i) => {
    const next = revealed.map((r, j) => (j === i ? true : r));
    setRevealed(next);
    if (next.every(Boolean)) onComplete?.(scoreAnswers(questions, answers).correct, questions.length);
  };

  return (
    <section aria-labelledby="quiz-title" className="mt-14" data-testid="quiz">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="quiz-title" className="type-h2 text-ink">
          {t('quiz.title')}
        </h2>
        <p className="text-sm text-ink-muted">
          {t('quiz.subtitle', { count: questions.length })}
          {best ? ` · ${t('quiz.best', { best: best.best, total: best.total })}` : ''}
        </p>
      </div>
      <div className="mt-5 space-y-4">
        {questions.map((q, i) => (
          <QuizQuestion key={`${attempt}-${i}`} q={q} index={i} total={questions.length} name={`${name}-${attempt}-${i}`} value={answers[i]} revealed={revealed[i]} onChange={(v) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))} onCheck={() => check(i)} />
        ))}
      </div>
      {done && (
        <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 p-5" role="status" data-testid="quiz-result">
          <p className="font-display text-lg font-semibold text-ink">
            {score === questions.length ? t('quiz.perfect') : t('quiz.score', { score, total: questions.length })}
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => {
              setAnswers(questions.map(() => null));
              setRevealed(questions.map(() => false));
              setAttempt((n) => n + 1);
            }}
          >
            {t('quiz.retry')}
          </Button>
        </div>
      )}
    </section>
  );
}
