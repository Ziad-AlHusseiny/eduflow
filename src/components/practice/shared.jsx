import { CheckCircle2, Circle, Eye, EyeOff, Lightbulb, XCircle } from 'lucide-react';
import { useState } from 'react';
import { t } from '../../i18n/index.js';
import Button from '../ui/Button.jsx';

export function Prompt({ html }) {
  return <div className="prose-sm text-ink" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Hints, one at a time. */
export function Hints({ hints }) {
  const [shown, setShown] = useState(0);
  if (!hints?.length) return null;
  return (
    <div className="space-y-2">
      {hints.slice(0, shown).map((h, i) => (
        <p key={i} className="flex gap-2 rounded-[12px] bg-star-soft px-3 py-2 text-sm text-star-ink" role="note">
          <Lightbulb aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
          <span>
            <span className="sr-only">{t('exercise.hintN', { n: i + 1, total: hints.length })}: </span>
            <span dangerouslySetInnerHTML={{ __html: h }} />
          </span>
        </p>
      ))}
      {shown < hints.length && (
        <Button variant="ghost" size="sm" icon={Lightbulb} onClick={() => setShown((n) => n + 1)} data-testid="hint-button">
          {shown ? t('exercise.nextHint') : t('exercise.hint')}
        </Button>
      )}
    </div>
  );
}

/** The checks list with pass/fail marks. */
export function ChecksList({ checks, labels, results }) {
  if (!checks?.length) return null;
  const passed = results ? results.filter((r) => r.pass).length : 0;
  return (
    <div>
      <p className="text-sm font-semibold text-ink" role="status" data-testid="checks-summary">
        {results ? (passed === checks.length ? t('exercise.allPass') : t('exercise.passing', { passed, total: checks.length })) : t('exercise.checks')}
      </p>
      <ul className="mt-2 space-y-1.5">
        {checks.map((c) => {
          const r = results?.find((x) => x.id === c.id);
          const I = !r ? Circle : r.pass ? CheckCircle2 : XCircle;
          return (
            <li key={c.id} className="flex items-start gap-2 text-sm text-ink" data-pass={r ? String(r.pass) : undefined}>
              <I aria-hidden="true" size={17} className={`mt-0.5 shrink-0 ${!r ? 'text-ink-faint' : r.pass ? 'text-success-deep' : 'text-danger-ink'}`} />
              <span>
                <span dangerouslySetInnerHTML={{ __html: labels?.[c.id] ?? c.id }} />
                {r && <span className="sr-only"> — {r.pass ? t('quiz.correct') : t('quiz.incorrect')}</span>}
                {r && !r.pass && r.message && <span className="block text-xs text-ink-muted">{r.message}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SolvedBanner({ explanation }) {
  return (
    <div className="rounded-[12px] border border-success/40 bg-success-soft/60 p-4" role="status" data-testid="solved-banner">
      <p className="flex items-center gap-2 font-display font-semibold text-success-ink">
        <CheckCircle2 aria-hidden="true" size={20} /> {t('exercise.solved')}
      </p>
      {explanation && <div className="prose-sm mt-2 text-ink" dangerouslySetInnerHTML={{ __html: explanation }} />}
    </div>
  );
}

/** "Show solution" toggle: reveals the reference code (and the explanation). */
export function SolutionToggle({ children, onReveal }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="ghost" size="sm" icon={open ? EyeOff : Eye} aria-expanded={open} onClick={() => {
        if (!open) onReveal?.();
        setOpen((v) => !v);
      }} data-testid="solution-button">
        {open ? t('exercise.hideSolution') : t('exercise.solution')}
      </Button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

