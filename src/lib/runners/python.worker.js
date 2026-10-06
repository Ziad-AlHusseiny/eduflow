// Python (Pyodide 0.29: CPython 3.13, pandas 2.x, NumPy, scikit-learn) in a
// worker. Loaded only when a learner presses Run; the service worker
// caches the engine so it works offline afterwards.
import { CONTENT_VERSION } from '../../generated/version.js';
import { PY_HARNESS } from '../../lib/python/harness.js';

const VERSION = '0.29.3';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
let pyPromise = null;
const loaded = new Set();

const py = () =>
  (pyPromise ??= import(/* @vite-ignore */ `${BASE}pyodide.mjs`).then(async ({ loadPyodide }) => {
    const p = await loadPyodide({ indexURL: BASE });
    await p.runPythonAsync(PY_HARNESS);
    return p;
  }));

async function ensureFiles(p, files) {
  for (const f of files ?? []) {
    if (loaded.has(f)) continue;
    const r = await fetch(`/data/csv/${f}?v=${CONTENT_VERSION}`);
    if (!r.ok) throw new Error(`Couldn't load ${f}`);
    p.FS.writeFile(f, new Uint8Array(await r.arrayBuffer()));
    loaded.add(f);
  }
}

self.onmessage = async (e) => {
  const { id, code, checks, files } = e.data;
  try {
    self.postMessage({ id, status: 'loading' });
    const p = await py();
    await ensureFiles(p, files);
    await p.loadPackagesFromImports(code);
    self.postMessage({ id, status: 'running' });
    p.globals.set('__code', code);
    p.globals.set('__checks', p.toPy(checks ?? []));
    const out = await p.runPythonAsync('__eduflow_run(__code, [dict(c) for c in __checks])');
    self.postMessage({ id, ok: true, result: JSON.parse(out) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err.message ?? err) });
  }
};
