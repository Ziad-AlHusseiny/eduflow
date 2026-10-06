import { memo, useEffect, useRef } from 'react';
import { t } from '../../i18n/index.js';

function setOutput(block, lines, { error = false, pending = false } = {}) {
  const out = block.querySelector('[data-run-output]');
  if (!out) return;
  out.hidden = false;
  out.replaceChildren();
  out.setAttribute('role', 'status');
  out.setAttribute('aria-live', 'polite');
  out.setAttribute('aria-busy', pending ? 'true' : 'false');
  for (const line of lines) {
    const div = document.createElement('div');
    div.textContent = line.text;
    if (line.level === 'error' || error) div.style.color = 'var(--color-danger-ink)';
    out.append(div);
  }
}

function table(sets) {
  const last = sets.at(-1);
  if (!last) return [{ text: t('lesson.noOutput') }];
  const widths = last.columns.map((c, i) => Math.min(24, Math.max(String(c).length, ...last.values.slice(0, 20).map((r) => String(r[i] ?? 'NULL').length))));
  const fmt = (row) => row.map((v, i) => String(v ?? 'NULL').slice(0, 24).padEnd(widths[i])).join(' │ ');
  const lines = [fmt(last.columns), widths.map((w) => '─'.repeat(w)).join('─┼─'), ...last.values.slice(0, 20).map(fmt)];
  if (last.values.length > 20) lines.push(`… ${t('exercise.rows', { count: last.values.length })}`);
  else lines.push(t('exercise.rows', { count: last.values.length }));
  return lines.map((text) => ({ text }));
}

/**
 * The lesson's HTML (compiled and syntax-highlighted at build time), plus
 * the two things that make it interactive: Copy on every code block and
 * Run on runnable examples (JavaScript in a sandbox, SQL in SQLite, Python
 * in Pyodide — each engine loads only when first used).
 */
function LessonBody({ html }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const onClick = async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || !root.contains(btn)) return;
      const block = btn.closest('.code-block');
      const code = block?.querySelector('pre')?.textContent ?? '';
      if (btn.dataset.action === 'copy') {
        const label = btn.querySelector('span');
        const before = label?.textContent;
        try {
          await navigator.clipboard.writeText(code);
          if (label) label.textContent = t('lesson.copied');
        } catch {
          if (label) label.textContent = t('lesson.copyFailed');
        }
        setTimeout(() => label && (label.textContent = before), 1600);
        return;
      }
      if (btn.dataset.action === 'run') {
        const lang = btn.dataset.lang;
        btn.disabled = true;
        setOutput(block, [{ text: t('lesson.running') }], { pending: true });
        try {
          if (lang === 'js') {
            const { runJs } = await import('../../lib/runners/js.js');
            const r = await runJs(code);
            setOutput(block, r.timedOut ? [{ level: 'error', text: t('exercise.timeout') }] : r.lines.length ? r.lines : [{ text: t('lesson.noOutput') }]);
          } else if (lang === 'sql') {
            const { runSql } = await import('../../lib/runners/sql.js');
            const r = await runSql(code);
            setOutput(block, r.ok ? table(r.sets) : [{ level: 'error', text: `${t('lesson.runError')}: ${r.error}` }]);
          } else if (lang === 'python') {
            const { runPython } = await import('../../lib/runners/python.js');
            const r = await runPython(code, {
              files: [...new Set([...code.matchAll(/["']([\w-]+\.csv)["']/g)].map((m) => m[1]))],
              onStatus: (s) => s === 'loading' && setOutput(block, [{ text: t('exercise.loadingEngine', { engine: t('exercise.engines.python') }) }], { pending: true }),
            });
            if (!r.ok) setOutput(block, [{ level: 'error', text: r.timedOut ? t('exercise.timeout') : t('exercise.loadFailed', { engine: t('exercise.engines.python') }) }]);
            else {
              const lines = r.result.stdout ? r.result.stdout.replace(/\n$/, '').split('\n').map((text) => ({ text })) : [];
              if (r.result.error) lines.push({ level: 'error', text: `${r.result.error.type}: ${r.result.error.message}` });
              setOutput(block, lines.length ? lines : [{ text: t('lesson.noOutput') }]);
            }
          }
        } catch (err) {
          setOutput(block, [{ level: 'error', text: String(err.message ?? err) }]);
        } finally {
          btn.disabled = false;
        }
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [html]);
  return <div ref={ref} className="prose" dangerouslySetInnerHTML={{ __html: html }} data-testid="lesson-body" />;
}

export default memo(LessonBody);
