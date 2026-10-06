import { Play, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useHydrated } from '../../hooks/useMedia.js';
import { t } from '../../i18n/index.js';
import { recordExercise, revealSolution } from '../../lib/learning.js';
import { runPython } from '../../lib/runners/python.js';
import { draftsStore } from '../../lib/stores.js';
import Button from '../ui/Button.jsx';
import CodeEditor from './CodeEditor.jsx';
import { ChecksList, SolutionToggle, SolvedBanner } from './shared.jsx';

/** Real Python 3.13 + pandas in the browser (Pyodide in a worker, loaded on first Run, cached offline). */
export default function PythonPractice({ exercise, lessonId }) {
  const hydrated = useHydrated();
  const [code, setCode] = useState(exercise.starter);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState({ status: 'idle' });
  const [solved, setSolved] = useState(false);
  if (hydrated && !loaded) {
    setLoaded(true);
    const draft = draftsStore.get()[lessonId]?.files?.py;
    if (draft) setCode(draft);
  }
  useEffect(() => {
    if (!loaded) return undefined;
    const timer = setTimeout(() => draftsStore.set((d) => {
      const next = { ...d };
      if (code !== exercise.starter) next[lessonId] = { files: { py: code }, at: new Date().toISOString() };
      else delete next[lessonId];
      return next;
    }), 600);
    return () => clearTimeout(timer);
  }, [code, loaded, lessonId, exercise.starter]);

  const run = async (check) => {
    setState({ status: 'starting' });
    const r = await runPython(code, { checks: exercise.checks, files: exercise.files ?? [], onStatus: (s) => setState({ status: s }) });
    if (!r.ok) return setState({ status: 'error', error: r.timedOut ? t('exercise.timeout') : t('exercise.loadFailed', { engine: t('exercise.engines.python') }) });
    const { stdout, error, checks } = r.result;
    if (check) {
      const ok = !error && checks.every((c) => c.pass);
      setSolved(ok);
      recordExercise(lessonId, ok);
    }
    setState({ status: 'done', stdout, error, checks: check ? checks : null });
  };
  const busy = ['starting', 'loading', 'running'].includes(state.status);

  return (
    <div className="space-y-4">
      {exercise.files?.length > 0 && <p className="text-sm text-ink-muted">{t('exercise.datasets', { files: exercise.files.join(', ') })}</p>}
      <CodeEditor value={code} onChange={setCode} language="python" label={t('exercise.editorLabel', { file: 'Python' })} onRun={() => run(false)} minHeight={200} testId="editor-python" />
      <p className="text-xs text-ink-muted">{t('exercise.shortcutHint')} · {t('exercise.sandbox')}</p>
      <div className="flex flex-wrap gap-2">
        <Button icon={Play} variant="secondary" onClick={() => run(false)} disabled={busy} data-testid="run-button">
          {t('exercise.run')}
        </Button>
        <Button icon={ShieldCheck} onClick={() => run(true)} disabled={busy} data-testid="check-button">
          {t('exercise.check')}
        </Button>
        <Button icon={RotateCcw} variant="ghost" onClick={() => window.confirm(t('exercise.resetConfirm')) && setCode(exercise.starter)} data-testid="reset-button">
          {t('exercise.reset')}
        </Button>
      </div>
      <div tabIndex={0} className="max-h-[320px] min-h-20 overflow-auto rounded-[12px] border border-border bg-code-bg p-3 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-ink" dir="ltr" role="log" aria-live="polite" data-testid="console">
        {state.status === 'loading' || state.status === 'starting' ? <span className="text-ink-muted">{t('exercise.loadingEngine', { engine: t('exercise.engines.python') })}</span> : null}
        {state.status === 'running' && <span className="text-ink-muted">{t('lesson.running')}</span>}
        {state.status === 'error' && <span className="text-danger-ink">{state.error}</span>}
        {state.status === 'done' && (
          <>
            {state.stdout}
            {state.error && <span className="block text-danger-ink">{`${state.error.type}: ${state.error.message}${state.error.line ? ` (line ${state.error.line})` : ''}`}</span>}
            {!state.stdout && !state.error && <span className="text-ink-muted">{t('lesson.noOutput')}</span>}
          </>
        )}
        {state.status === 'idle' && <span className="text-ink-muted">{t('lesson.noOutput')}</span>}
      </div>
      <ChecksList checks={exercise.checks} labels={exercise.checkLabels} results={state.checks} />
      {solved && <SolvedBanner explanation={exercise.explanation} />}
      <SolutionToggle onReveal={() => revealSolution(lessonId)}>
        <CodeEditor value={exercise.solution} readOnly language="python" label={t('exercise.solutionTitle')} minHeight={80} />
        {!solved && <div className="prose-sm mt-3 text-ink" dangerouslySetInnerHTML={{ __html: exercise.explanation }} />}
      </SolutionToggle>
    </div>
  );
}
