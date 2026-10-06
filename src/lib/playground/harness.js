// The code that runs inside the sandboxed playground iframe, before and after
// the learner's code: console capture, error capture, the check helpers, a
// small Vitest-compatible test runner (describe/test/expect/vi) and the
// check runner. It is serialised with Function#toString into the iframe's
// srcdoc (lib/playground/document.js), so it must be self-contained: no
// imports, no closures over module scope.
//
// The iframe is sandboxed without allow-same-origin, so it can't touch the
// app, its storage or its cookies; it reports back with postMessage only.

export function harness(config) {
  const { token, action, checks = [], subject = '', mutants = {}, typecheckPassed = true } = config;
  const logs = [];
  const errors = [];
  const post = (msg) => parent.postMessage({ source: 'eduflow-playground', token, ...msg }, '*');

  // ── Formatting (a small util.inspect) ──
  function inspect(value, depth = 0, seen = new WeakSet()) {
    if (typeof value === 'string') return depth ? JSON.stringify(value) : value;
    if (typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) return Object.is(value, -0) ? '-0' : String(value);
    if (typeof value === 'bigint') return `${value}n`;
    if (typeof value === 'symbol') return value.toString();
    if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (typeof Node !== 'undefined' && value instanceof Node) return value.nodeType === 1 ? `<${value.tagName.toLowerCase()}>` : `#${value.nodeName}`;
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    if (depth > 3) return Array.isArray(value) ? '[Array]' : '[Object]';
    if (Array.isArray(value)) return `[${value.map((v) => inspect(v, depth + 1, seen)).join(', ')}]`;
    if (value instanceof Map) return `Map(${value.size}) {${[...value].map(([k, v]) => ` ${inspect(k, depth + 1, seen)} => ${inspect(v, depth + 1, seen)}`).join(',')} }`;
    if (value instanceof Set) return `Set(${value.size}) {${[...value].map((v) => ` ${inspect(v, depth + 1, seen)}`).join(',')} }`;
    if (value instanceof Date) return isNaN(value) ? 'Invalid Date' : value.toISOString();
    if (value instanceof RegExp) return String(value);
    if (value instanceof Promise) return 'Promise { <pending> }';
    const entries = Object.entries(value);
    const name = value.constructor && value.constructor !== Object && value.constructor.name ? `${value.constructor.name} ` : '';
    if (!entries.length) return `${name}{}`;
    return `${name}{ ${entries.map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${inspect(v, depth + 1, seen)}`).join(', ')} }`;
  }
  const format = (args) => args.map((a) => inspect(a)).join(' ');

  // ── Shims: the sandbox has an opaque origin, so storage and randomUUID
  // aren't available; lessons still use them, so give each run its own. ──
  const memoryStorage = () => {
    const data = new Map();
    return {
      getItem: (k) => (data.has(String(k)) ? data.get(String(k)) : null),
      setItem: (k, v) => data.set(String(k), String(v)),
      removeItem: (k) => data.delete(String(k)),
      clear: () => data.clear(),
      key: (i) => [...data.keys()][i] ?? null,
      get length() {
        return data.size;
      },
    };
  };
  for (const name of ['localStorage', 'sessionStorage']) {
    try {
      window[name].getItem('x');
    } catch {
      Object.defineProperty(window, name, { value: memoryStorage(), configurable: true });
    }
  }
  if (window.crypto && !window.crypto.randomUUID) {
    window.crypto.randomUUID = () => '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  }

  // Loop protection (lib/playground/loop-guard.js puts a call in every loop
  // condition): once one task has looped for 1.5 s, every guarded loop throws,
  // so `while (true) {}` ends with an error instead of freezing the tab.
  let loopStart = 0;
  let loopCalls = 0;
  window.__eduflowLoop = () => {
    if (!loopStart) {
      loopStart = performance.now();
      setTimeout(() => (loopStart = 0), 0);
    }
    if ((++loopCalls & 1023) === 0 && performance.now() - loopStart > 1500) {
      throw new RangeError('This loop ran for too long and was stopped. Check that its condition eventually becomes false.');
    }
    return true;
  };

  // A form submit never navigates the sandbox away (handlers still run first).
  window.addEventListener('submit', (e) => e.preventDefault());

  // ── Console + errors ──
  const record = (level) => (...args) => {
    const text = format(args);
    logs.push(text);
    post({ type: 'log', level, text });
  };
  window.console = { ...window.console, log: record('log'), info: record('log'), debug: record('log'), warn: record('warn'), error: record('error'), table: (v) => record('log')(v) };
  window.alert = (msg) => record('log')(`[alert] ${msg}`);
  window.prompt = () => null;
  window.confirm = () => false;
  window.addEventListener('error', (e) => {
    const msg = e.error ? `${e.error.name}: ${e.error.message}` : e.message;
    errors.push(msg);
    post({ type: 'log', level: 'error', text: msg + (e.lineno ? ` (line ${e.lineno})` : '') });
  });
  window.addEventListener('unhandledrejection', (e) => {
    const msg = `Uncaught (in promise) ${inspect(e.reason)}`;
    errors.push(msg);
    post({ type: 'log', level: 'error', text: msg });
  });

  // ── Check helpers ──
  const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const text = (sel) => (typeof sel === 'string' ? $(sel) : sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const exists = (sel) => !!$(sel);
  const style = (el, prop) => (el ? getComputedStyle(typeof el === 'string' ? $(el) : el).getPropertyValue(prop) : '');
  const click = async (el) => {
    el = typeof el === 'string' ? $(el) : el;
    if (!el) throw new Error('click(): element not found');
    el.click();
    await tick(16);
  };
  const input = async (el, value) => {
    el = typeof el === 'string' ? $(el) : el;
    if (!el) throw new Error('input(): element not found');
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await tick(16);
  };
  const press = async (el, key) => {
    el = typeof el === 'string' ? $(el) : el;
    if (!el) throw new Error('press(): element not found');
    el.focus();
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
    await tick(16);
  };

  // ── A small Vitest-compatible test runner ──
  function equals(a, b, strict) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (a.__anything) return a.test(b);
    if (b.__anything) return b.test(a);
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return String(a) === String(b);
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    if (a instanceof Map && b instanceof Map) return a.size === b.size && [...a].every(([k, v]) => b.has(k) && equals(v, b.get(k), strict));
    if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every((v) => [...b].some((w) => equals(v, w, strict)));
    const ka = Object.keys(a).filter((k) => strict || a[k] !== undefined);
    const kb = Object.keys(b).filter((k) => strict || b[k] !== undefined);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && equals(a[k], b[k], strict));
  }

  function createMock(impl) {
    let implementation = impl;
    const once = [];
    const mock = function (...args) {
      mock.mock.calls.push(args);
      try {
        const value = once.length ? once.shift()(...args) : implementation ? implementation.apply(this, args) : undefined;
        mock.mock.results.push({ type: 'return', value });
        return value;
      } catch (error) {
        mock.mock.results.push({ type: 'throw', value: error });
        throw error;
      }
    };
    mock._isMock = true;
    mock.mock = { calls: [], results: [] };
    mock.mockImplementation = (fn) => ((implementation = fn), mock);
    mock.mockReturnValue = (v) => ((implementation = () => v), mock);
    mock.mockReturnValueOnce = (v) => (once.push(() => v), mock);
    mock.mockResolvedValue = (v) => ((implementation = () => Promise.resolve(v)), mock);
    mock.mockResolvedValueOnce = (v) => (once.push(() => Promise.resolve(v)), mock);
    mock.mockRejectedValue = (v) => ((implementation = () => Promise.reject(v)), mock);
    mock.mockRejectedValueOnce = (v) => (once.push(() => Promise.reject(v)), mock);
    mock.mockImplementationOnce = (fn) => (once.push(fn), mock);
    mock.mockClear = () => ((mock.mock.calls = []), (mock.mock.results = []), mock);
    mock.mockReset = () => (mock.mockClear(), (implementation = undefined), mock);
    return mock;
  }

  function createTestApi() {
    const root = { name: '', tests: [], children: [], before: [], after: [] };
    let current = root;
    const describe = (name, fn) => {
      const scope = { name, tests: [], children: [], before: [], after: [], parent: current };
      current.children.push(scope);
      const prev = current;
      current = scope;
      try {
        fn();
      } finally {
        current = prev;
      }
    };
    const test = (name, fn) => current.tests.push({ name, fn, scope: current });
    test.skip = () => {};
    test.todo = () => {};
    // test.each([[1, 2, 3], …])('adds %i + %i', (a, b, sum) => …) and test.each([{ a, b }])('…', ({ a, b }) => …)
    test.each = (table) => (name, fn) =>
      table.forEach((row, i) => {
        const args = Array.isArray(row) ? row : [row];
        let k = 0;
        const title = String(name)
          .replace(/%[sdifjo#%]/g, (m) => (m === '%%' ? '%' : m === '%#' ? String(i) : inspect(args[k++], 1)))
          .replace(/\$(\w+)/g, (m, key) => (!Array.isArray(row) && row && key in row ? inspect(row[key], 1) : m));
        test(title, () => fn(...args));
      });
    const beforeEach = (fn) => current.before.push(fn);
    const afterEach = (fn) => current.after.push(fn);

    function expect(actual) {
      const make = (negate, mode) => {
        const assert = (pass, msg) => {
          if (negate ? pass : !pass) throw new Error(negate ? `Expected not: ${msg}` : msg);
        };
        const show = (v) => inspect(v, 1);
        const m = {
          toBe: (e) => assert(Object.is(actual, e), `expected ${show(actual)} to be ${show(e)}`),
          toEqual: (e) => assert(equals(actual, e, false), `expected ${show(actual)} to equal ${show(e)}`),
          toStrictEqual: (e) => assert(equals(actual, e, true), `expected ${show(actual)} to strictly equal ${show(e)}`),
          toBeTruthy: () => assert(!!actual, `expected ${show(actual)} to be truthy`),
          toBeFalsy: () => assert(!actual, `expected ${show(actual)} to be falsy`),
          toBeNull: () => assert(actual === null, `expected ${show(actual)} to be null`),
          toBeUndefined: () => assert(actual === undefined, `expected ${show(actual)} to be undefined`),
          toBeDefined: () => assert(actual !== undefined, 'expected value to be defined'),
          toBeNaN: () => assert(Number.isNaN(actual), `expected ${show(actual)} to be NaN`),
          toContain: (e) => assert(actual != null && (typeof actual === 'string' ? actual.includes(e) : [...actual].includes(e)), `expected ${show(actual)} to contain ${show(e)}`),
          toContainEqual: (e) => assert([...actual].some((x) => equals(x, e, false)), `expected ${show(actual)} to contain an item equal to ${show(e)}`),
          toHaveLength: (n) => assert(actual != null && actual.length === n, `expected length ${n}, got ${actual?.length}`),
          toMatch: (re) => assert(typeof actual === 'string' && (typeof re === 'string' ? actual.includes(re) : re.test(actual)), `expected ${show(actual)} to match ${show(re)}`),
          toBeGreaterThan: (n) => assert(actual > n, `expected ${show(actual)} > ${n}`),
          toBeGreaterThanOrEqual: (n) => assert(actual >= n, `expected ${show(actual)} >= ${n}`),
          toBeLessThan: (n) => assert(actual < n, `expected ${show(actual)} < ${n}`),
          toBeLessThanOrEqual: (n) => assert(actual <= n, `expected ${show(actual)} <= ${n}`),
          toBeCloseTo: (n, digits = 2) => assert(Math.abs(actual - n) < Math.pow(10, -digits) / 2, `expected ${show(actual)} to be close to ${n}`),
          toBeInstanceOf: (C) => assert(actual instanceof C, `expected value to be an instance of ${C?.name}`),
          toHaveProperty: (path, ...value) => {
            const keys = Array.isArray(path) ? path : String(path).split('.');
            let obj = actual;
            let has = true;
            for (const k of keys) {
              if (obj != null && k in Object(obj)) obj = obj[k];
              else {
                has = false;
                break;
              }
            }
            assert(has && (!value.length || equals(obj, value[0], false)), `expected ${show(actual)} to have property ${keys.join('.')}${value.length ? ` = ${show(value[0])}` : ''}`);
          },
          toThrow: (expected) => {
            let threw = false;
            let error;
            try {
              actual();
            } catch (e) {
              threw = true;
              error = e;
            }
            const matches = !threw ? false : expected === undefined ? true : typeof expected === 'string' ? String(error?.message).includes(expected) : expected instanceof RegExp ? expected.test(String(error?.message)) : typeof expected === 'function' ? error instanceof expected : equals(error?.message, expected?.message, false);
            assert(matches, threw ? `expected the thrown error to match ${show(expected)}, got ${show(error)}` : 'expected the function to throw');
          },
          toHaveBeenCalled: () => assert(actual?.mock?.calls.length > 0, 'expected the mock to have been called'),
          toHaveBeenCalledTimes: (n) => assert(actual?.mock?.calls.length === n, `expected ${n} calls, got ${actual?.mock?.calls.length}`),
          toHaveBeenCalledWith: (...args) => assert(actual?.mock?.calls.some((c) => equals(c, args, false)), `expected a call with ${show(args)}, got ${show(actual?.mock?.calls)}`),
          toHaveBeenLastCalledWith: (...args) => assert(equals(actual?.mock?.calls.at(-1), args, false), `expected last call with ${show(args)}`),
        };
        if (mode) {
          const wrapped = {};
          for (const k of Object.keys(m)) {
            wrapped[k] = async (...a) => {
              let value;
              let rejected = false;
              try {
                value = await actual;
              } catch (e) {
                rejected = true;
                value = e;
              }
              if (mode === 'resolves' && rejected) throw new Error(`expected promise to resolve, it rejected with ${show(value)}`);
              if (mode === 'rejects' && !rejected) throw new Error(`expected promise to reject, it resolved with ${show(value)}`);
              const inner = expect(k === 'toThrow' && mode === 'rejects' ? () => { throw value; } : value);
              return (negate ? inner.not : inner)[k](...a);
            };
          }
          return wrapped;
        }
        return m;
      };
      const api = make(false);
      api.not = make(true);
      api.resolves = make(false, 'resolves');
      api.rejects = make(false, 'rejects');
      api.resolves.not = make(true, 'resolves');
      api.rejects.not = make(true, 'rejects');
      return api;
    }
    expect.any = (C) => ({ __anything: true, test: (v) => (C === Number ? typeof v === 'number' : C === String ? typeof v === 'string' : C === Boolean ? typeof v === 'boolean' : C === Function ? typeof v === 'function' : v instanceof C) });
    expect.anything = () => ({ __anything: true, test: (v) => v != null });

    const spies = [];
    const vi = {
      fn: (impl) => createMock(impl),
      restoreAllMocks: () => spies.splice(0).forEach((m) => m.mockRestore()),
      clearAllMocks: () => spies.forEach((m) => m.mockClear()),
      spyOn: (obj, key) => {
        const original = obj[key];
        const mock = createMock((...a) => original.apply(obj, a));
        mock.mockRestore = () => {
          obj[key] = original;
        };
        obj[key] = mock;
        spies.push(mock);
        return mock;
      },
    };

    async function run() {
      const results = [];
      const visit = async (scope, path, before, after) => {
        const b = [...before, ...scope.before];
        const a = [...scope.after, ...after];
        for (const t of scope.tests) {
          const name = [...path, t.name].filter(Boolean).join(' › ');
          try {
            for (const h of b) await h();
            await Promise.race([Promise.resolve().then(t.fn), new Promise((_, rej) => setTimeout(() => rej(new Error('Test timed out after 2000 ms')), 2000))]);
            for (const h of a) await h();
            results.push({ name, pass: true });
          } catch (e) {
            results.push({ name, pass: false, error: e instanceof Error ? e.message : inspect(e) });
          }
        }
        for (const child of scope.children) await visit(child, [...path, child.name], b, a);
      };
      await visit(root, [], [], []);
      return results;
    }
    return { describe, test, it: test, expect, vi, beforeEach, afterEach, run };
  }

  async function runSuite(code, tests) {
    const api = createTestApi();
    try {
      new Function('describe', 'test', 'it', 'expect', 'vi', 'beforeEach', 'afterEach', `${code}\n;\n${tests}`)(api.describe, api.test, api.it, api.expect, api.vi, api.beforeEach, api.afterEach);
    } catch (e) {
      return { total: 0, failed: 1, results: [{ name: 'Loading the test file', pass: false, error: `${e.name}: ${e.message}` }] };
    }
    const results = await api.run();
    return { total: results.length, failed: results.filter((r) => !r.pass).length, results };
  }

  // ── React mount + require shim (react mode) ──
  const modules = { react: () => window.React, 'react-dom': () => window.ReactDOM, 'react-dom/client': () => window.ReactDOMClient };
  const require = (name) => {
    if (!modules[name]) throw new Error(`Only "react" and "react-dom/client" can be imported here (got "${name}")`);
    return modules[name]();
  };
  const mountReact = (App) => {
    if (typeof App !== 'function') throw new Error('Export your component: export default function App() { … }');
    const root = window.ReactDOMClient.createRoot(document.getElementById('root'));
    window.ReactDOM.flushSync(() => root.render(window.React.createElement(App)));
  };

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`Check timed out after ${ms} ms`)), ms))]);

  async function start() {
    await tick(30);
    let suite = null;
    if (config.mode === 'test') {
      suite = await runSuite(subject, config.tests ?? '');
      post({ type: 'suite', suite });
    }
    if (action !== 'check') {
      post({ type: 'done', logs, errors, suite });
      return;
    }
    const results = [];
    for (const c of checks) {
      let pass;
      let message = '';
      try {
        if (c.typecheck) pass = typecheckPassed;
        else if (c.suite) {
          const code = c.suite === 'subject' ? subject : mutants[c.suite];
          if (code === undefined) throw new Error(`Unknown suite ${c.suite}`);
          const r = c.suite === 'subject' && suite ? suite : await runSuite(code, config.tests ?? '');
          pass = c.suite === 'subject' ? r.total > 0 && r.failed === 0 : r.failed > 0;
          if (!pass) message = c.suite === 'subject' ? (r.total ? `${r.failed} test(s) fail against the real code` : 'No tests ran') : 'Every test still passes against this buggy version';
        } else {
          const fn = new AsyncFunction('$', '$$', 'text', 'exists', 'style', 'click', 'input', 'press', 'tick', 'logs', 'errors', c.test);
          pass = (await withTimeout(fn($, $$, text, exists, style, click, input, press, tick, logs, errors), 3000)) === true;
        }
      } catch (e) {
        pass = false;
        message = e instanceof Error ? e.message : String(e);
      }
      results.push({ id: c.id, pass, message });
    }
    post({ type: 'done', logs, errors, suite, checks: results });
  }

  window.__eduflow = { require, mountReact, start, runSuite };
}
