import { CheckCircle2, Play, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useHydrated } from '../../hooks/useMedia.js';
import { t } from '../../i18n/index.js';
import { recordExercise, revealSolution } from '../../lib/learning.js';
import { compileReact, compileTs } from '../../lib/playground/compile.js';
import { buildDocument } from '../../lib/playground/document.js';
import { loadReactRuntime, loadSucrase, loadTypeScript } from '../../lib/playground/load.js';
import { draftsStore } from '../../lib/stores.js';
import Button from '../ui/Button.jsx';
import CodeEditor from './CodeEditor.jsx';
import { ChecksList, SolutionToggle, SolvedBanner } from './shared.jsx';

const FILES = { js: ['js'], dom: ['html', 'css', 'js'], react: ['jsx', 'css'], ts: ['ts'], test: ['js'] };
const LANG = { html: 'html', css: 'css', js: 'js', jsx: 'jsx', ts: 'ts' };
const VISIBLE = new Set(['dom', 'react']);

/** The in-browser code playground: edit, run in a sandboxed iframe, check automatically. */
export default function WebPractice({ exercise, lessonId }) {
  const files = FILES[exercise.mode].filter((f) => exercise.starter[f] !== undefined || exercise.solution[f] !== undefined);
  const hydrated = useHydrated();
  const [code, setCode] = useState(() => ({ ...Object.fromEntries(files.map((f) => [f, ''])), ...exercise.starter }));
  const [tab, setTab] = useState(exercise.mode === 'test' ? 'subject' : files[0]);
  const [frame, setFrame] = useState(null);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [suite, setSuite] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [status, setStatus] = useState('idle');
  const [solved, setSolved] = useState(false);
  const frameRef = useRef(null);
  const tokenRef = useRef(null);
  const watchdog = useRef(0);
  const tabsId = useId();
  const hintId = `${tabsId}-hint`;

  // Your draft from last time (after hydration: the HTML shows the starter).
  const [loadedDraft, setLoadedDraft] = useState(false);
  if (hydrated && !loadedDraft) {
    setLoadedDraft(true);
    const draft = draftsStore.get()[lessonId]?.files;
    if (draft) setCode((c) => ({ ...c, ...draft }));
  }
  useEffect(() => {
    if (!loadedDraft) return undefined;
    const timer = setTimeout(() => {
      const changed = files.some((f) => (code[f] ?? '') !== (exercise.starter[f] ?? ''));
      draftsStore.set((d) => {
        const next = { ...d };
        if (changed) next[lessonId] = { files: code, at: new Date().toISOString() };
        else delete next[lessonId];
        return next;
      });
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, loadedDraft, lessonId]);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.source !== frameRef.current?.contentWindow || e.data?.source !== 'eduflow-playground' || e.data.token !== tokenRef.current) return;
      if (e.data.type === 'log') setLogs((l) => [...l, { level: e.data.level, text: e.data.text }].slice(-200));
      if (e.data.type === 'suite') setSuite(e.data.suite);
      if (e.data.type === 'done') {
        clearTimeout(watchdog.current);
        setStatus('idle');
        if (e.data.checks) {
          setResults(e.data.checks);
          const ok = e.data.checks.every((c) => c.pass);
          setSolved(ok);
          recordExercise(lessonId, ok);
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(watchdog.current);
    };
  }, [lessonId]);

  const execute = useCallback(
    async (action) => {
      setStatus(action === 'check' ? 'checking' : 'running');
      setLogs([]);
      setSuite(null);
      if (action === 'check') setResults(null);
      clearTimeout(watchdog.current);
      try {
        let js = code.js ?? '';
        let diags = [];
        let runtime = '';
        const sucrase = await loadSucrase();
        if (exercise.mode === 'react') {
          runtime = await loadReactRuntime();
          ({ js, diagnostics: diags } = compileReact(sucrase, code.jsx ?? ''));
        }
        if (exercise.mode === 'ts') {
          const { ts, libs } = await loadTypeScript();
          ({ js, diagnostics: diags } = compileTs(ts, libs, code.ts ?? ''));
        }
        setDiagnostics(diags);
        js = sucrase.guardLoops(js);
        const token = Math.random().toString(36).slice(2);
        tokenRef.current = token;
        // The loop guard stops runaway loops; this catches anything else that
        // never reports back (a frame running out of process, a hung promise).
        watchdog.current = setTimeout(() => {
          tokenRef.current = null;
          setFrame(null);
          setStatus('timeout');
        }, 10000);
        const doc = buildDocument({ mode: exercise.mode, html: code.html ?? '', css: code.css ?? '', js, runtime, action, token, checks: exercise.checks, subject: exercise.subject ?? '', mutants: exercise.mutants ?? [], typecheckPassed: exercise.mode !== 'ts' || diags.length === 0 });
        setFrame({ doc, token });
      } catch {
        setStatus('error');
      }
    },
    [code, exercise],
  );

  // Show the starter running once the page is interactive (previews only).
  const ran = useRef(false);
  useEffect(() => {
    if (!loadedDraft || ran.current || !VISIBLE.has(exercise.mode)) return;
    ran.current = true;
    execute('run');
  }, [loadedDraft, exercise.mode, execute]);

  const tabs = exercise.mode === 'test' ? ['subject', 'js'] : files;
  const label = (f) => (f === 'js' && exercise.mode === 'test' ? t('exercise.tests') : t(`exercise.files.${f}`));
  const busy = status === 'running' || status === 'checking';

  return (
    <div className="space-y-4">
      <div>
        <div role="tablist" aria-label={t('exercise.title')} className="flex gap-1 overflow-x-auto">
          {tabs.map((f) => (
            <button key={f} type="button" role="tab" id={`${tabsId}-tab-${f}`} aria-selected={tab === f} aria-controls={`${tabsId}-panel-${f}`} tabIndex={tab === f ? 0 : -1} onClick={() => setTab(f)} onKeyDown={(e) => {
              const i = tabs.indexOf(f);
              const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!dir) return;
              const n = tabs[(i + dir + tabs.length) % tabs.length];
              setTab(n);
              requestAnimationFrame(() => document.getElementById(`${tabsId}-tab-${n}`)?.focus());
            }} className={`min-h-10 rounded-t-[10px] border border-b-0 px-4 font-mono text-[13px] font-medium transition-colors ${tab === f ? 'border-border bg-code-bg text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`}>
              {label(f)}
            </button>
          ))}
        </div>
        {tabs.map((f) => (
          <div key={f} role="tabpanel" id={`${tabsId}-panel-${f}`} aria-labelledby={`${tabsId}-tab-${f}`} hidden={tab !== f}>
            <CodeEditor
              value={f === 'subject' ? exercise.subject : (code[f] ?? '')}
              readOnly={f === 'subject'}
              language={f === 'subject' ? 'js' : LANG[f]}
              label={t('exercise.editorLabel', { file: label(f) })}
              hintId={hintId}
              onChange={(v) => setCode((c) => ({ ...c, [f]: v }))}
              onRun={() => execute('run')}
              testId={`editor-${f}`}
            />
          </div>
        ))}
        <p id={hintId} className="mt-1.5 text-xs text-ink-muted">
          {t('exercise.shortcutHint')} · {t('exercise.sandbox')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button icon={Play} variant="secondary" onClick={() => execute('run')} disabled={busy} aria-keyshortcuts="Control+Enter Meta+Enter" data-testid="run-button">
          {t('exercise.run')}
        </Button>
        <Button icon={ShieldCheck} onClick={() => execute('check')} disabled={busy} data-testid="check-button">
          {t('exercise.check')}
        </Button>
        <Button icon={RotateCcw} variant="ghost" onClick={() => {
          if (!window.confirm(t('exercise.resetConfirm'))) return;
          setCode({ ...Object.fromEntries(files.map((f) => [f, ''])), ...exercise.starter });
          setResults(null);
          setSolved(false);
        }} data-testid="reset-button">
          {t('exercise.reset')}
        </Button>
      </div>

      {status === 'timeout' && (
        <p role="alert" className="text-sm text-danger-ink" data-testid="run-timeout">
          {t('exercise.timeout')}
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="text-sm text-danger-ink">
          {t('exercise.loadFailed', { engine: t(`exercise.engines.${exercise.mode === 'ts' ? 'ts' : 'react'}`) })}
        </p>
      )}
      {exercise.mode === 'ts' && (results || diagnostics.length > 0) && (
        <div className={`rounded-[12px] border p-3 text-sm ${diagnostics.length ? 'border-danger/50 bg-danger-soft' : 'border-success/40 bg-success-soft/50'}`} role="status" data-testid="ts-diagnostics">
          <p className="font-semibold text-ink">{diagnostics.length ? t('exercise.typeErrors', { count: diagnostics.length }) : t('exercise.noTypeErrors')}</p>
          {diagnostics.length > 0 && (
            <ul className="mt-2 space-y-1 font-mono text-[12.5px] text-ink" dir="ltr">
              {diagnostics.slice(0, 12).map((d, i) => (
                <li key={i}>
                  {d.line ? `L${d.line}: ` : ''}
                  {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {exercise.mode === 'react' && diagnostics.length > 0 && (
        <p role="alert" className="rounded-[12px] bg-danger-soft p-3 font-mono text-[12.5px] text-danger-ink" dir="ltr">
          {diagnostics[0].line ? `L${diagnostics[0].line}: ` : ''}
          {diagnostics[0].message}
        </p>
      )}

      <div className={VISIBLE.has(exercise.mode) ? 'grid gap-3 md:grid-cols-2' : ''}>
        {/* The preview's space is reserved before the first run (no layout shift). */}
        {(frame || VISIBLE.has(exercise.mode)) && (
          <div className={VISIBLE.has(exercise.mode) ? '' : 'sr-only'} aria-hidden={VISIBLE.has(exercise.mode) ? undefined : 'true'}>
            {VISIBLE.has(exercise.mode) && <p className="mb-1.5 text-xs font-semibold text-ink-muted">{t('exercise.preview')}</p>}
            {frame ? (
              <iframe key={frame.token} ref={frameRef} title={t('exercise.preview')} sandbox="allow-scripts allow-forms" srcDoc={frame.doc} className="h-[300px] w-full rounded-[12px] border border-border bg-white" tabIndex={VISIBLE.has(exercise.mode) ? 0 : -1} data-testid="preview-frame" />
            ) : (
              <div className="h-[300px] w-full rounded-[12px] border border-border bg-white" aria-hidden="true" />
            )}
          </div>
        )}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-muted">{exercise.mode === 'test' ? t('exercise.results') : t('exercise.console')}</p>
          <div tabIndex={0} className="max-h-[300px] min-h-24 overflow-auto rounded-[12px] border border-border bg-code-bg p-3 font-mono text-[12.5px] leading-relaxed" dir="ltr" role="log" aria-live="polite" data-testid="console">
            {busy && <p className="text-ink-muted">{t('lesson.running')}</p>}
            {exercise.mode === 'test' && suite && (
              <ul className="mb-2 space-y-1">
                {suite.results.map((r) => (
                  <li key={r.name} className="flex items-start gap-1.5">
                    {r.pass ? <CheckCircle2 aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-success-deep" /> : <XCircle aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-danger-ink" />}
                    <span className="text-ink">
                      {r.name}
                      {r.error && <span className="block text-danger-ink">{r.error}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {logs.map((l, i) => (
              <div key={i} className={l.level === 'error' ? 'text-danger-ink' : l.level === 'warn' ? 'text-star-ink' : 'text-ink'}>
                {l.text}
              </div>
            ))}
            {!busy && !logs.length && !suite && <p className="text-ink-muted">{t('lesson.noOutput')}</p>}
          </div>
        </div>
      </div>

      <ChecksList checks={exercise.checks} labels={exercise.checkLabels} results={results} />
      {solved && <SolvedBanner explanation={exercise.explanation} />}
      <SolutionToggle onReveal={() => revealSolution(lessonId)}>
        <p className="mb-2 text-sm font-semibold text-ink">{t('exercise.solutionTitle')}</p>
        <div className="space-y-3">
          {files.map((f) => (
            <CodeEditor key={f} value={exercise.solution[f] ?? ''} readOnly language={LANG[f]} label={`${t('exercise.solutionTitle')} · ${label(f)}`} minHeight={80} />
          ))}
        </div>
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => setCode({ ...code, ...exercise.solution })}>
          {t('exercise.useSolution')}
        </Button>
        {!solved && <div className="prose-sm mt-3 text-ink" dangerouslySetInnerHTML={{ __html: exercise.explanation }} />}
      </SolutionToggle>
    </div>
  );
}
