// The page side of the Pyodide worker. A run that takes too long (an
// infinite loop) terminates the worker; the next run starts a fresh one.
let worker = null;
let seq = 0;
const pending = new Map();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./python.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const entry = pending.get(e.data.id);
      if (!entry) return;
      if (e.data.status) return entry.onStatus?.(e.data.status);
      entry.resolve(e.data);
      pending.delete(e.data.id);
    };
    worker.onerror = (e) => {
      for (const { resolve } of pending.values()) resolve({ ok: false, error: e.message || 'The Python engine failed to load.' });
      pending.clear();
      worker = null;
    };
  }
  return worker;
}

/** Runs Python → { ok, result: { stdout, error, checks }, error }. `onStatus('loading'|'running')`. */
export function runPython(code, { checks = [], files = [], onStatus, timeout = 120000 } = {}) {
  return new Promise((resolve) => {
    const id = ++seq;
    const timer = setTimeout(() => {
      pending.delete(id);
      worker?.terminate();
      worker = null;
      resolve({ ok: false, error: 'timeout', timedOut: true });
    }, timeout);
    pending.set(id, {
      onStatus,
      resolve: (data) => {
        clearTimeout(timer);
        resolve(data);
      },
    });
    getWorker().postMessage({ id, code, checks, files });
  });
}
