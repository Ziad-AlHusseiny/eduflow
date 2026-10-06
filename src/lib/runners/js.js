// Runs a `js run` lesson example in a throwaway sandboxed iframe (the same
// harness as the playground) and resolves with its console output.

import { buildDocument } from '../playground/document.js';
import { loadSucrase } from '../playground/load.js';

export async function runJs(source, { timeout = 5000 } = {}) {
  let code = source;
  try {
    code = (await loadSucrase()).guardLoops(source);
  } catch {
    // Offline before the tokenizer was cached: run unguarded.
  }
  return new Promise((resolve) => {
    const token = Math.random().toString(36).slice(2);
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts allow-forms');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;inset-inline-start:-9999px';
    const lines = [];
    const done = (result) => {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      frame.remove();
      resolve(result);
    };
    const onMessage = (e) => {
      if (e.source !== frame.contentWindow || e.data?.source !== 'eduflow-playground' || e.data.token !== token) return;
      if (e.data.type === 'log') lines.push({ level: e.data.level, text: e.data.text });
      if (e.data.type === 'done') setTimeout(() => done({ lines, errors: e.data.errors }), 50);
    };
    const timer = setTimeout(() => done({ lines, errors: ['timeout'], timedOut: true }), timeout);
    window.addEventListener('message', onMessage);
    frame.srcdoc = buildDocument({ mode: 'js', js: code, token, action: 'run' });
    document.body.append(frame);
  });
}
