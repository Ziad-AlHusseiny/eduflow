import { ArrowDown, ArrowUp, CheckCircle2, XCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { t } from '../../i18n/index.js';
import { recordExercise, revealSolution } from '../../lib/learning.js';
import Button from '../ui/Button.jsx';
import { seededShuffle } from '../../lib/shuffle.js';
import { SolutionToggle, SolvedBanner } from './shared.jsx';

function useAttempt(lessonId) {
  const [result, setResult] = useState(null);
  const submit = (ok) => {
    setResult(ok ? 'solved' : 'wrong');
    recordExercise(lessonId, ok);
  };
  return [result, submit, () => setResult(null)];
}

function Feedback({ result, wrongText, explanation }) {
  if (result === 'solved') return <SolvedBanner explanation={explanation} />;
  if (result === 'wrong')
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-danger-ink">
        <XCircle aria-hidden="true" size={18} /> {wrongText ?? t('exercise.tryAgain')}
      </p>
    );
  return null;
}

/** Put the steps in order: keyboard-friendly up/down buttons (no drag needed). */
export function OrderPractice({ exercise, lessonId }) {
  const [order, setOrder] = useState(() => seededShuffle(exercise.items, lessonId));
  const [result, submit, clear] = useAttempt(lessonId);
  const [announce, setAnnounce] = useState('');
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    clear();
    setAnnounce(t('exercise.order.moved', { n: j + 1 }));
    requestAnimationFrame(() => document.getElementById(`${lessonId}-move-${next[j]}-${dir < 0 ? 'up' : 'down'}`)?.focus());
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">{t('exercise.order.instructions')}</p>
      <ol className="space-y-2" data-testid="order-list">
        {order.map((id, i) => {
          const wrong = result === 'wrong' && exercise.items[i] !== id;
          return (
            <li key={id} className={`flex items-center gap-3 rounded-[12px] border bg-surface p-3 ${wrong ? 'border-danger' : result === 'solved' ? 'border-success' : 'border-border'}`} data-id={id}>
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary-ink">{i + 1}</span>
              <span className="prose-sm min-w-0 flex-1 text-ink" dangerouslySetInnerHTML={{ __html: exerciseItem(exercise, id) }} />
              <span className="flex shrink-0 gap-1">
                <button type="button" id={`${lessonId}-move-${id}-up`} onClick={() => move(i, -1)} disabled={i === 0} className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink disabled:opacity-30" aria-label={`${t('exercise.order.up')}: ${plain(exerciseItem(exercise, id))}`}>
                  <ArrowUp aria-hidden="true" size={18} />
                </button>
                <button type="button" id={`${lessonId}-move-${id}-down`} onClick={() => move(i, 1)} disabled={i === order.length - 1} className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink disabled:opacity-30" aria-label={`${t('exercise.order.down')}: ${plain(exerciseItem(exercise, id))}`}>
                  <ArrowDown aria-hidden="true" size={18} />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => submit(order.every((id, i) => id === exercise.items[i]))} data-testid="check-button">
          {t('exercise.check')}
        </Button>
        <Button variant="ghost" onClick={() => { setOrder([...exercise.items]); revealSolution(lessonId); }} data-testid="solution-button">
          {t('exercise.solution')}
        </Button>
      </div>
      <Feedback result={result} wrongText={t('exercise.wrongItems')} explanation={exercise.explanation} />
    </div>
  );
}

/** An order item's text (the ids are in `items`, the text in `itemText`). */
const exerciseItem = (exercise, id) => exercise.itemText?.[id] ?? id;
const plain = (html) => String(html ?? '').replace(/<[^>]+>/g, '');

/** Spot the bug: select the wrong line(s), then check. */
export function SpotBugPractice({ exercise, lessonId }) {
  const lines = exercise.code.split('\n');
  const [picked, setPicked] = useState(() => new Set());
  const [result, submit, clear] = useAttempt(lessonId);
  const bugs = new Set(exercise.bugLines);
  const toggle = (n) => {
    clear();
    setPicked((s) => {
      const x = new Set(s);
      if (x.has(n)) x.delete(n);
      else x.add(n);
      return x;
    });
  };
  const check = () => submit(picked.size === bugs.size && [...picked].every((n) => bugs.has(n)));
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">{t('exercise.spot.instructions')}</p>
      <div className="overflow-hidden rounded-[12px] border border-border bg-code-bg" dir="ltr" data-testid="spot-code">
        <ol className="overflow-x-auto py-2 font-mono text-[13.5px] leading-relaxed">
          {lines.map((line, i) => {
            const n = i + 1;
            const on = picked.has(n);
            const revealed = result === 'solved' && bugs.has(n);
            return (
              <li key={n}>
                <button type="button" onClick={() => toggle(n)} aria-pressed={on} className={`flex w-full min-w-max items-start gap-3 px-3 py-0.5 text-start transition-colors ${on ? 'bg-primary-soft' : 'hover:bg-surface-muted'} ${revealed ? 'outline-2 -outline-offset-2 outline-success' : ''}`} aria-label={`${t('exercise.spot.line', { n })}: ${line.trim() || '—'}`}>
                  <span className="w-6 shrink-0 text-end text-ink-faint select-none">{n}</span>
                  <span className="whitespace-pre text-ink">{line || ' '}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={check} disabled={!picked.size} data-testid="check-button">
          {t('exercise.check')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setPicked(new Set(bugs));
            revealSolution(lessonId);
          }}
          data-testid="solution-button"
        >
          {t('exercise.solution')}
        </Button>
      </div>
      <Feedback result={result} wrongText={t('exercise.missedBugs')} explanation={exercise.explanation} />
    </div>
  );
}

/** Fill in the blanks of a command or snippet. */
export function FillPractice({ exercise, lessonId }) {
  const [values, setValues] = useState(() => exercise.blanks.map(() => ''));
  const [result, submit, clear] = useAttempt(lessonId);
  const [marks, setMarks] = useState(null);
  const id = useId();
  const norm = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase();
  const parts = exercise.template.split(/(\{\{\d+\}\})/);
  const check = () => {
    const ok = exercise.blanks.map((b, i) => b.answers.some((a) => norm(a) === norm(values[i])));
    setMarks(ok);
    submit(ok.every(Boolean));
  };
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[12px] border border-border bg-code-bg p-4 font-mono text-[14px] leading-[2.4] text-ink" dir="ltr" data-testid="fill-template">
        {parts.map((p, i) => {
          const m = p.match(/^\{\{(\d+)\}\}$/);
          if (!m) return <span key={i} className="whitespace-pre-wrap">{p}</span>;
          const n = Number(m[1]);
          const width = Math.max(4, ...exercise.blanks[n].answers.map((a) => a.length)) + 2;
          return (
            <input
              key={i}
              id={`${id}-${n}`}
              value={values[n]}
              onChange={(e) => {
                clear();
                setMarks(null);
                setValues((v) => v.map((x, j) => (j === n ? e.target.value : x)));
              }}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              aria-label={t('exercise.fill.blank', { n: n + 1 })}
              aria-invalid={marks ? !marks[n] : undefined}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className={`mx-1 rounded-md border-b-2 bg-surface px-2 py-0.5 font-mono text-[14px] ${marks ? (marks[n] ? 'border-success' : 'border-danger') : 'border-primary'}`}
              style={{ width: `${width}ch` }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={check} data-testid="check-button">
          {t('exercise.check')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setValues(exercise.blanks.map((b) => b.answers[0]));
            revealSolution(lessonId);
          }}
          data-testid="solution-button"
        >
          {t('exercise.solution')}
        </Button>
      </div>
      <Feedback result={result} explanation={exercise.explanation} />
    </div>
  );
}

/** A scenario with one or several right answers; every option explains itself after checking. */
export function ChoicePractice({ exercise, lessonId }) {
  const [picked, setPicked] = useState(() => new Set());
  const [checked, setChecked] = useState(false);
  const [result, submit, clear] = useAttempt(lessonId);
  const name = useId();
  const correct = new Set(exercise.correct);
  const toggle = (o) => {
    clear();
    setChecked(false);
    setPicked((s) => {
      if (!exercise.multiple) return new Set([o]);
      const x = new Set(s);
      if (x.has(o)) x.delete(o);
      else x.add(o);
      return x;
    });
  };
  const check = () => {
    setChecked(true);
    submit(picked.size === correct.size && [...picked].every((o) => correct.has(o)));
  };
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="sr-only">{exercise.title}</legend>
        <ul className="space-y-2">
          {exercise.options.map((o) => {
            const text = exercise.optionText?.[o];
            const isRight = correct.has(o);
            const chosen = picked.has(o);
            const state = !checked ? (chosen ? 'border-primary bg-primary-soft/50' : 'border-border hover:border-primary/60') : isRight ? 'border-success bg-success-soft/50' : chosen ? 'border-danger bg-danger-soft' : 'border-border';
            return (
              <li key={o}>
                <label className={`flex cursor-pointer gap-3 rounded-[12px] border p-3 transition-colors ${state}`}>
                  <input type={exercise.multiple ? 'checkbox' : 'radio'} name={name} checked={chosen} onChange={() => toggle(o)} className="mt-1 size-[18px] shrink-0 accent-[var(--color-primary)]" />
                  <span className="min-w-0 flex-1">
                    <span className="prose-sm block text-ink" dangerouslySetInnerHTML={{ __html: text?.text ?? o }} />
                    {checked && (
                      <span className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-muted">
                        {isRight ? <CheckCircle2 aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-success-deep" /> : <XCircle aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-danger-ink" />}
                        <span className="prose-sm" dangerouslySetInnerHTML={{ __html: text?.why ?? '' }} />
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button onClick={check} disabled={!picked.size} data-testid="check-button">
          {t('exercise.check')}
        </Button>
        <SolutionToggle onReveal={() => revealSolution(lessonId)}>
          <div className="prose-sm text-ink" dangerouslySetInnerHTML={{ __html: exercise.explanation }} />
        </SolutionToggle>
      </div>
      <Feedback result={result} explanation={exercise.explanation} />
    </div>
  );
}
