// The playground's heavy parts, each loaded once, only when an exercise runs.
import { CONTENT_VERSION } from '../../generated/version.js';

let sucrase;
let ts;
let runtime;
// A failed load (offline, a deploy replaced the chunk) is forgotten, so Run retries.
const retryable = (p, reset) => p.catch((e) => {
  reset();
  throw e;
});

export const loadSucrase = () => (sucrase ??= retryable(import('./sucrase.js'), () => (sucrase = undefined)));
export const loadTypeScript = () =>
  (ts ??= retryable(Promise.all([import('typescript'), fetch(`/playground/ts-libs.json?v=${CONTENT_VERSION}`).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })]).then(([mod, libs]) => ({ ts: mod.default ?? mod, libs })), () => (ts = undefined)));
export const loadReactRuntime = () =>
  (runtime ??= retryable(fetch(`/playground/react-runtime.js?v=${CONTENT_VERSION}`).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  }), () => (runtime = undefined)));
