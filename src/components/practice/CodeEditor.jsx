import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';

/**
 * A code editor that costs nothing until it's needed: the code shows as
 * text first; CodeMirror loads when the editor scrolls into view (and a
 * plain textarea takes over if it can't load, e.g. offline and uncached).
 */
export default function CodeEditor({ value, onChange, language, label, readOnly = false, onRun, minHeight = 220, hintId, testId }) {
  const wrap = useRef(null);
  const host = useRef(null);
  const editor = useRef(null);
  const [mode, setMode] = useState('static');
  // The latest props, for the editor created later: a saved draft can
  // replace `value` after mount but before CodeMirror arrives.
  const latest = useRef({ value, onChange, onRun });
  useEffect(() => {
    latest.current = { value, onChange, onRun };
  });

  useEffect(() => {
    const el = host.current;
    // Watch the visible wrapper: the editor's own host is display:none until it loads.
    const target = wrap.current;
    if (!el || !target) return undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import('./cm.js')
          .then(({ createEditor }) => {
            if (cancelled) return;
            editor.current = createEditor(el, { doc: latest.current.value, language, readOnly, label, hint: hintId, onChange: (v) => latest.current.onChange?.(v), onRun: () => latest.current.onRun?.() });
            setMode('cm');
          })
          .catch(() => !cancelled && setMode('textarea'));
      },
      { rootMargin: '300px' },
    );
    io.observe(target);
    return () => {
      cancelled = true;
      io.disconnect();
      editor.current?.destroy();
      editor.current = null;
    };
    // The editor is created once; later value changes are pushed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External value changes (reset, show solution): push into CodeMirror.
  useEffect(() => {
    const ed = editor.current;
    if (ed && ed.view.state.doc.toString() !== value) ed.setValue(value);
  }, [value]);

  return (
    <div ref={wrap} className="relative overflow-hidden rounded-[12px] border border-border bg-code-bg text-start" dir="ltr" style={{ minHeight }} data-testid={testId} data-editor={mode}>
      <div ref={host} className={mode === 'cm' ? 'h-full' : 'hidden'} style={{ minHeight }} />
      {mode === 'static' && (
        <pre tabIndex={0} className="m-0 overflow-auto py-[10px] ps-[44px] pe-4 font-mono text-[14px] leading-[1.6] text-ink" style={{ minHeight }} aria-label={label}>
          <code>{value}</code>
          <span className="sr-only">{t('exercise.loadingEditor')}</span>
        </pre>
      )}
      {mode === 'textarea' && (
        <textarea value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={readOnly} aria-label={label} spellCheck={false} className="block w-full resize-y bg-transparent p-4 font-mono text-[14px] leading-[1.6] text-ink" style={{ minHeight }} onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && onRun?.()} />
      )}
    </div>
  );
}
