// Builds the srcdoc of the sandboxed playground iframe: the harness first
// (console + error capture, helpers), then the learner's page and code, then
// the start call that runs the checks and reports back with postMessage.
// Pure string building, shared by the app and scripts/content/check-exercises.mjs.

import { harness } from './harness.js';

const scriptSafe = (code) => code.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
const styleSafe = (css) => css.replace(/<\/(style)/gi, '<\\/$1');
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16)}`);

const BASE_CSS = `:root{color-scheme:light}html{-webkit-text-size-adjust:100%}body{margin:16px;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1b1830;background:#fff}`;

/**
 * @param {object} o
 * @param {'js'|'dom'|'react'|'ts'|'test'} o.mode
 * @param {string} [o.html]  body markup (dom mode)
 * @param {string} [o.css]
 * @param {string} [o.js]    compiled JavaScript (react: CommonJS from Sucrase; ts: transpiled)
 * @param {string} [o.runtime]  the React runtime script (react mode)
 * @param {'run'|'check'} [o.action]
 * @param {string} o.token   identifies this run's messages
 */
export function buildDocument({ mode, html = '', css = '', js = '', runtime = '', action = 'run', token, checks = [], subject = '', mutants = [], typecheckPassed = true }) {
  const config = { token, action, mode, checks, typecheckPassed, subject, tests: mode === 'test' ? js : '', mutants: Object.fromEntries(mutants.map((m) => [m.id, m.code])) };
  const user =
    mode === 'react'
      ? `<div id="root"></div><script>(function(){var module={exports:{}},exports=module.exports,require=window.__eduflow.require;try{\n${scriptSafe(js)}\n;window.__eduflow.mountReact(module.exports.default||exports.default)}catch(e){console.error(e.name+': '+e.message)}})();</script>`
      : mode === 'test'
        ? ''
        : `${mode === 'dom' ? html : ''}<script>\n${scriptSafe(js)}\n</script>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${BASE_CSS}${styleSafe(css)}</style>${mode === 'react' ? `<script>${scriptSafe(runtime)}</script>` : ''}<script>(${harness.toString()})(${json(config)});</script></head><body>${user}<script>window.__eduflow.start();</script></body></html>`;
}
