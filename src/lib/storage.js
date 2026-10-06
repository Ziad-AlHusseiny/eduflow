// Everything EduFlow saves lives in localStorage under `eduflow-*`
// (DECISIONS D6: the docs' `eduflow-plan` and `eduflow-target`, plus the
// keys the real tools need, listed in BUILD-LOG). Each key is a small store
// that React reads through useSyncExternalStore: the prerendered HTML uses
// the defaults, and saved values appear right after hydration. If storage
// throws (private mode, blocked site data), values live in memory and
// nothing ever crashes.

export const PREFIX = 'eduflow-';

function storage() {
  try {
    const s = globalThis.localStorage;
    if (!s) return null;
    const probe = `${PREFIX}__probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

let cached;
const store = () => (cached === undefined ? (cached = storage()) : cached);

/** True when values will survive a reload. */
export const storageAvailable = () => store() !== null;

export function readRaw(key) {
  try {
    return store()?.getItem(PREFIX + key) ?? null;
  } catch {
    return null;
  }
}

export function writeRaw(key, value) {
  try {
    if (value == null) store()?.removeItem(PREFIX + key);
    else store()?.setItem(PREFIX + key, value);
  } catch {
    // Quota or a revoked permission: keep going in memory.
  }
}

/** Every nutriplan key currently saved (for export and "delete all"). */
export function savedKeys() {
  const s = store();
  if (!s) return [];
  const keys = [];
  try {
    for (let i = 0; i < s.length; i += 1) {
      const key = s.key(i);
      if (key?.startsWith(PREFIX) && !key.endsWith('__probe')) keys.push(key.slice(PREFIX.length));
    }
  } catch {
    return [];
  }
  return keys.sort();
}

const registry = new Map();

/**
 * A persisted value. `validate(parsed)` returns the cleaned value, or
 * undefined for anything stale or malformed, which falls back to `fallback`.
 * Unparseable JSON is replaced on disk by the fallback straight away (PRD
 * §6.5: "the key is rewritten with the empty shape").
 */
export function createStore(key, fallback, validate = (v) => v) {
  if (registry.has(key)) return registry.get(key);
  const listeners = new Set();
  let loaded = false;
  let value = fallback;

  const load = () => {
    const raw = readRaw(key);
    let next = fallback;
    if (raw != null) {
      try {
        const parsed = validate(JSON.parse(raw));
        if (parsed !== undefined) next = parsed;
        else writeRaw(key, JSON.stringify(fallback));
      } catch {
        writeRaw(key, JSON.stringify(fallback));
      }
    }
    value = next;
    loaded = true;
  };

  const api = {
    key,
    fallback,
    get() {
      if (!loaded) load();
      return value;
    },
    getServer: () => fallback,
    set(next) {
      const resolved = typeof next === 'function' ? next(api.get()) : next;
      if (Object.is(resolved, value) && loaded) return;
      value = resolved;
      loaded = true;
      writeRaw(key, resolved === undefined ? null : JSON.stringify(resolved));
      listeners.forEach((fn) => fn());
    },
    reset() {
      value = fallback;
      loaded = true;
      writeRaw(key, null);
      listeners.forEach((fn) => fn());
    },
    /** Re-read after another tab (or a restore) changed storage. */
    /** The validator: a cleaned value, or undefined for anything malformed. */
    parse(v) {
      try {
        return validate(v);
      } catch {
        return undefined;
      }
    },
    reload() {
      // Without storage there's nothing to re-read: keep what's in memory.
      if (storageAvailable()) load();
      listeners.forEach((fn) => fn());
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
  registry.set(key, api);
  return api;
}

export const allStores = () => [...registry.values()];

/** Removes every nutriplan key and resets every store to its default. */
export function clearAll() {
  for (const key of savedKeys()) writeRaw(key, null);
  for (const s of registry.values()) s.reset();
}

if (typeof window !== 'undefined') {
  // Another tab changed the plan or the list: follow along.
  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      registry.forEach((s) => s.reload());
      return;
    }
    if (!event.key.startsWith(PREFIX)) return;
    registry.get(event.key.slice(PREFIX.length))?.reload();
  });
}

/** Test hook: forget the cached storage handle and every store. */
export function __resetStorageForTests() {
  cached = undefined;
  registry.clear();
}
