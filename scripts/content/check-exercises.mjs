#!/usr/bin/env node
// Runs every exercise for real: each reference solution must pass all of its
// checks and each starter must fail at least one (CONTENT-GUIDE §7).
//   web    → compiled like the app, run in the same sandboxed iframe, in Chromium
//   sql    → sql.js against content/data/shop.sqlite (the browser's engine)
//   python → Pyodide 0.29 in Node (the browser's exact engine: CPython 3.13,
//            pandas 2.3, scikit-learn 1.7), same harness; --engine=cpython uses .venv
//
//   node scripts/content/check-exercises.mjs [course-id …] [--only=l-xx-1-2] [--engine=cpython]

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import initSqlJs from 'sql.js';
import * as sucrase from 'sucrase';
import ts from 'typescript';
import { compileReact, compileTs } from '../../src/lib/playground/compile.js';
import { buildDocument } from '../../src/lib/playground/document.js';
import { guardLoopsWith } from '../../src/lib/playground/loop-guard.js';
import { PY_HARNESS } from '../../src/lib/python/harness.js';
import { compareResults, lastResult } from '../../src/lib/sql/compare.js';

// Sucrase's CommonJS parser (its ES build has extensionless imports Node can't load).
const require = createRequire(import.meta.url);
const sucraseParser = { parse: require('sucrase/dist/parser/index.js').parse, TokenType: require('sucrase/dist/parser/tokenizer/types.js').TokenType };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT = join(ROOT, 'content');
const plan = JSON.parse(readFileSync(join(CONTENT, 'plan.json'), 'utf8'));
const args = process.argv.slice(2);
const onlyLesson = args.find((a) => a.startsWith('--only='))?.split('=')[1];
const ENGINE = args.find((a) => a.startsWith('--engine='))?.split('=')[1] ?? 'pyodide';
const ids = args.filter((a) => !a.startsWith('--'));
const courses = plan.courses.filter((c) => (ids.length ? ids.includes(c.id) : existsSync(join(CONTENT, c.id, 'exercises'))));

const runtimeFile = join(ROOT, 'public', 'playground', 'react-runtime.js');
if (!existsSync(runtimeFile)) execFileSync(process.execPath, [join(ROOT, 'scripts', 'content', 'build-runtime.mjs')], { stdio: 'inherit' });
const runtime = readFileSync(runtimeFile, 'utf8');
const tsLibs = JSON.parse(readFileSync(join(ROOT, 'public', 'playground', 'ts-libs.json'), 'utf8'));

let failures = 0;
let passed = 0;
const fail = (where, msg) => {
  failures += 1;
  console.log(`✖ ${where}: ${msg}`);
};

let browser;
let page;
async function runWeb(ex, files, action) {
  if (!browser) {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.setContent('<!doctype html><html><body></body></html>');
  }
  let js = files.js ?? '';
  let diagnostics = [];
  if (ex.mode === 'react') ({ js, diagnostics } = compileReact(sucrase, files.jsx ?? ''));
  if (ex.mode === 'ts') ({ js, diagnostics } = compileTs(ts, tsLibs, files.ts ?? ''));
  js = guardLoopsWith(sucraseParser, js);
  const token = Math.random().toString(36).slice(2);
  const doc = buildDocument({ mode: ex.mode, html: files.html ?? '', css: files.css ?? '', js, runtime, action, token, checks: ex.checks, subject: ex.subject ?? '', mutants: ex.mutants ?? [], typecheckPassed: ex.mode !== 'ts' || diagnostics.length === 0 });
  const result = await page.evaluate(
    ({ doc, token }) =>
      new Promise((resolve) => {
        document.body.innerHTML = '';
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-scripts allow-forms');
        const timer = setTimeout(() => resolve({ timeout: true }), 20000);
        const onMessage = (e) => {
          if (e.data?.source !== 'eduflow-playground' || e.data.token !== token || e.data.type !== 'done') return;
          clearTimeout(timer);
          window.removeEventListener('message', onMessage);
          resolve(e.data);
        };
        window.addEventListener('message', onMessage);
        frame.srcdoc = doc;
        document.body.append(frame);
      }),
    { doc, token },
  );
  return { ...result, diagnostics };
}

let SQL;
let db;
function runSql(query) {
  try {
    return { result: lastResult(db.exec(query)) };
  } catch (e) {
    return { error: e.message };
  }
}

let pyodide;
async function runPyodide(ex, code) {
  if (!pyodide) {
    const { loadPyodide } = await import('pyodide');
    pyodide = await loadPyodide({ packageBaseUrl: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/', packageCacheDir: join(ROOT, '.cache', 'pyodide'), stdout: () => {}, stderr: () => {} });
    await pyodide.loadPackage(['pandas', 'scikit-learn'], { messageCallback: () => {} });
    await pyodide.runPythonAsync(PY_HARNESS);
  }
  for (const f of ex.files ?? []) pyodide.FS.writeFile(f, readFileSync(join(CONTENT, 'data', 'csv', f)));
  await pyodide.loadPackagesFromImports(code, { messageCallback: () => {} });
  pyodide.globals.set('__code', code);
  pyodide.globals.set('__checks', pyodide.toPy(ex.checks ?? []));
  return JSON.parse(await pyodide.runPythonAsync('__eduflow_run(__code, [dict(c) for c in __checks])'));
}

async function runPython(ex, code) {
  if (ENGINE === 'pyodide') return runPyodide(ex, code);
  const py = join(ROOT, '.venv', 'bin', 'python');
  if (!existsSync(py)) throw new Error('Python venv missing: uv venv --python 3.13 .venv && VIRTUAL_ENV=.venv uv pip install pandas numpy scikit-learn');
  const dir = mkdtempSync(join(tmpdir(), 'eduflow-py-'));
  try {
    for (const f of ex.files ?? []) cpSync(join(CONTENT, 'data', 'csv', f), join(dir, f));
    const program = `${PY_HARNESS}\nimport json, sys\nspec = json.loads(sys.stdin.read())\nprint(__eduflow_run(spec["code"], spec["checks"]))\n`;
    const out = execFileSync(py, ['-c', program], { cwd: dir, input: JSON.stringify({ code, checks: ex.checks }), timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] }).toString();
    return JSON.parse(out.trim().split('\n').pop());
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const course of courses) {
  const dir = join(CONTENT, course.id, 'exercises');
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => /^l-[\w-]+\.json$/.test(f)).sort()) {
    const id = file.replace(/\.json$/, '');
    if (onlyLesson && id !== onlyLesson) continue;
    const where = `${course.id}/${id}`;
    const ex = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    try {
      if (ex.kind === 'web') {
        const sol = await runWeb(ex, ex.solution, 'check');
        if (sol.timeout) fail(where, 'solution timed out');
        else {
          if (sol.diagnostics.length) fail(where, `solution has ${ex.mode === 'ts' ? 'type' : 'compile'} errors: ${sol.diagnostics.map((d) => `L${d.line}: ${d.message}`).join(' | ')}`);
          const bad = sol.checks.filter((c) => !c.pass);
          if (bad.length) fail(where, `solution fails check(s): ${bad.map((c) => `${c.id}${c.message ? ` (${c.message})` : ''}`).join(', ')}`);
          if (sol.errors?.length) fail(where, `solution throws: ${sol.errors.join(' | ')}`);
          if (ex.mode === 'test' && sol.suite?.failed) fail(where, `solution tests fail: ${sol.suite.results.filter((r) => !r.pass).map((r) => `${r.name}: ${r.error}`).join(' | ')}`);
        }
        const st = await runWeb(ex, ex.starter, 'check');
        if (!st.timeout && st.checks.every((c) => c.pass)) fail(where, 'starter already passes every check');
      } else if (ex.kind === 'sql') {
        if (!SQL) {
          SQL = await initSqlJs();
          db = new SQL.Database(readFileSync(join(CONTENT, 'data', 'shop.sqlite')));
        }
        const sol = runSql(ex.solution);
        if (sol.error) fail(where, `solution errors: ${sol.error}`);
        else if (!sol.result.values.length) fail(where, 'solution returns no rows');
        else {
          const st = runSql(ex.starter);
          if (!st.error && compareResults(sol.result, st.result, ex.orderMatters).pass) fail(where, 'starter already matches the solution');
        }
      } else if (ex.kind === 'python') {
        const sol = await runPython(ex, ex.solution);
        if (sol.error) fail(where, `solution raises ${sol.error.type}: ${sol.error.message} (line ${sol.error.line})`);
        const bad = sol.checks.filter((c) => !c.pass);
        if (bad.length) fail(where, `solution fails check(s): ${bad.map((c) => `${c.id}${c.message ? ` (${c.message})` : ''}`).join(', ')}`);
        const st = await runPython(ex, ex.starter);
        if (st.checks.every((c) => c.pass)) fail(where, 'starter already passes every check');
      } else {
        continue;
      }
      passed += 1;
    } catch (e) {
      fail(where, e.message);
    }
  }
}
await browser?.close();
console.log(`\n${passed} runnable exercise(s) checked, ${failures} problem(s).`);
process.exit(failures ? 1 : 0);
