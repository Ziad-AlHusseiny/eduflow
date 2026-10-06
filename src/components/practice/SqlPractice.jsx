import { Database, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useHydrated } from '../../hooks/useMedia.js';
import { t } from '../../i18n/index.js';
import { recordExercise, revealSolution } from '../../lib/learning.js';
import { runSql } from '../../lib/runners/sql.js';
import { compareResults, lastResult } from '../../lib/sql/compare.js';
import { draftsStore } from '../../lib/stores.js';
import Button from '../ui/Button.jsx';
import CodeEditor from './CodeEditor.jsx';
import { SolutionToggle, SolvedBanner } from './shared.jsx';

import { SCHEMA } from '../../lib/sql/schema.js';

const MAX_ROWS = 100;

export function ResultTable({ result }) {
  if (!result) return null;
  if (!result.columns.length) return <p className="text-sm text-ink-muted">{t('exercise.noRows')}</p>;
  return (
    <div>
      <div className="max-h-[320px] overflow-auto rounded-[12px] border border-border" tabIndex={0} role="region" aria-label={t('exercise.results')} dir="ltr">
        <table className="w-full border-collapse font-mono text-[12.5px]">
          <thead className="sticky top-0 bg-surface-muted">
            <tr>
              {result.columns.map((c, i) => (
                <th key={i} scope="col" className="border-b border-border px-3 py-2 text-start font-semibold text-ink">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.values.slice(0, MAX_ROWS).map((row, i) => (
              <tr key={i} className="odd:bg-surface even:bg-code-bg">
                {row.map((v, j) => (
                  <td key={j} className={`border-b border-border px-3 py-1.5 whitespace-nowrap ${v === null ? 'text-ink-faint italic' : 'text-ink'}`}>
                    {v === null ? 'NULL' : String(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-xs text-ink-muted">
        {t('exercise.rows', { count: result.values.length })}
        {result.values.length > MAX_ROWS ? ` · ${t('exercise.truncated', { count: MAX_ROWS })}` : ''}
      </p>
    </div>
  );
}

/** Real SQL against the Cartwheel database (sql.js in a worker); checked against the reference result. */
export default function SqlPractice({ exercise, lessonId }) {
  const hydrated = useHydrated();
  const [sql, setSql] = useState(exercise.starter);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState({ status: 'idle' });
  const [solved, setSolved] = useState(false);
  if (hydrated && !loaded) {
    setLoaded(true);
    const draft = draftsStore.get()[lessonId]?.files?.sql;
    if (draft) setSql(draft);
  }
  useEffect(() => {
    if (!loaded) return undefined;
    const timer = setTimeout(() => draftsStore.set((d) => {
      const next = { ...d };
      if (sql !== exercise.starter) next[lessonId] = { files: { sql }, at: new Date().toISOString() };
      else delete next[lessonId];
      return next;
    }), 600);
    return () => clearTimeout(timer);
  }, [sql, loaded, lessonId, exercise.starter]);

  const run = async (check) => {
    setState({ status: 'loading' });
    const r = await runSql(sql, check ? exercise.solution : null);
    if (!r.ok) return setState({ status: 'error', error: r.timedOut ? t('exercise.timeout') : r.error });
    const result = lastResult(r.sets);
    if (!check) return setState({ status: 'done', result });
    const cmp = compareResults(lastResult(r.also), result, exercise.orderMatters);
    setSolved(cmp.pass);
    recordExercise(lessonId, cmp.pass);
    setState({ status: 'done', result, cmp });
  };

  return (
    <div className="space-y-4">
      <details className="rounded-[12px] border border-border bg-surface-muted/50 px-4 py-2 text-sm">
        <summary className="flex min-h-9 cursor-pointer items-center gap-2 font-semibold text-ink">
          <Database aria-hidden="true" size={16} /> {t('exercise.schema')}
        </summary>
        <dl className="mt-2 space-y-1.5 pb-2 font-mono text-[12px]" dir="ltr">
          {Object.entries(SCHEMA).map(([name, cols]) => (
            <div key={name}>
              <dt className="inline font-semibold text-primary-ink">{name}</dt> <dd className="inline text-ink-muted">({cols})</dd>
            </div>
          ))}
        </dl>
      </details>
      <CodeEditor value={sql} onChange={setSql} language="sql" label={t('exercise.editorLabel', { file: 'SQL' })} onRun={() => run(false)} minHeight={160} testId="editor-sql" />
      <p className="text-xs text-ink-muted">{t('exercise.shortcutHint')} · {t('exercise.sandbox')}</p>
      <div className="flex flex-wrap gap-2">
        <Button icon={Play} variant="secondary" onClick={() => run(false)} disabled={state.status === 'loading'} data-testid="run-button">
          {t('exercise.run')}
        </Button>
        <Button icon={ShieldCheck} onClick={() => run(true)} disabled={state.status === 'loading'} data-testid="check-button">
          {t('exercise.check')}
        </Button>
        <Button icon={RotateCcw} variant="ghost" onClick={() => window.confirm(t('exercise.resetConfirm')) && setSql(exercise.starter)} data-testid="reset-button">
          {t('exercise.reset')}
        </Button>
      </div>
      <div role="status" aria-live="polite">
        {state.status === 'loading' && <p className="text-sm text-ink-muted">{t('lesson.running')}</p>}
        {state.status === 'error' && <p className="rounded-[12px] bg-danger-soft p-3 font-mono text-[12.5px] text-danger-ink" dir="ltr">{state.error}</p>}
        {state.cmp && !state.cmp.pass && (
          <p className="mb-3 rounded-[12px] bg-danger-soft p-3 text-sm text-danger-ink" data-testid="sql-mismatch">
            {t(`exercise.sqlMismatch.${state.cmp.reason}`, { expected: state.cmp.reason === 'columns' ? state.cmp.expectedColumns : state.cmp.expected, actual: state.cmp.reason === 'columns' ? state.cmp.actualColumns : state.cmp.actual })}
          </p>
        )}
      </div>
      {state.result && <ResultTable result={state.result} />}
      {solved && <SolvedBanner explanation={exercise.explanation} />}
      <SolutionToggle onReveal={() => revealSolution(lessonId)}>
        <CodeEditor value={exercise.solution} readOnly language="sql" label={t('exercise.solutionTitle')} minHeight={80} />
        {!solved && <div className="prose-sm mt-3 text-ink" dangerouslySetInnerHTML={{ __html: exercise.explanation }} />}
      </SolutionToggle>
    </div>
  );
}
