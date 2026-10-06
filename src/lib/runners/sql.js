// The page side of the SQLite worker.
let worker = null;
let seq = 0;
const pending = new Map();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./sql.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      pending.get(e.data.id)?.(e.data);
      pending.delete(e.data.id);
    };
    worker.onerror = () => {
      for (const resolve of pending.values()) resolve({ ok: false, error: 'The SQL engine failed to load.' });
      pending.clear();
      worker = null;
    };
  }
  return worker;
}

/** Runs `sql` (and optionally `also`, e.g. the reference solution) → { ok, sets, also, error, ms }. */
export function runSql(sql, also = null, { timeout = 15000 } = {}) {
  return new Promise((resolve) => {
    const id = ++seq;
    const timer = setTimeout(() => {
      pending.delete(id);
      worker?.terminate();
      worker = null;
      resolve({ ok: false, error: 'timeout', timedOut: true });
    }, timeout);
    pending.set(id, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
    getWorker().postMessage({ id, sql, also });
  });
}
