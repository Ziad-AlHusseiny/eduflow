// SQLite in a worker (sql.js), so a slow query never freezes the page.
// Downloads the Cartwheel database once; every query runs on a fresh copy,
// so a learner's DELETE or DROP never leaks into the next exercise, and the
// reference solution never sees what the learner's query changed.
import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { CONTENT_VERSION } from '../../generated/version.js';

let enginePromise = null;
const engine = () =>
  (enginePromise ??= Promise.all([initSqlJs({ locateFile: () => wasmUrl }), fetch(`/data/shop.sqlite?v=${CONTENT_VERSION}`).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.arrayBuffer();
  })]).then(([SQL, buf]) => ({ SQL, bytes: new Uint8Array(buf) })));

self.onmessage = async (e) => {
  const { id, sql, also } = e.data;
  try {
    const { SQL, bytes } = await engine();
    const run = (q) => {
      const d = new SQL.Database(bytes);
      try {
        const started = performance.now();
        const sets = d.exec(q);
        return { sets, ms: performance.now() - started };
      } finally {
        d.close();
      }
    };
    const extra = also ? run(also) : null;
    const main = run(sql);
    self.postMessage({ id, ok: true, sets: main.sets, ms: main.ms, also: extra?.sets ?? null });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err.message ?? err) });
  }
};
