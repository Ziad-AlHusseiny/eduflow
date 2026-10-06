import { describe, expect, it } from 'vitest';
import { guardLoops } from './sucrase.js';

const run = (code, limit = 5000) => {
  let calls = 0;
  const guard = () => {
    if (++calls > limit) throw new RangeError('too long');
    return true;
  };
  return new Function('__eduflowLoop', `${guardLoops(code)}; return typeof out === 'undefined' ? undefined : out;`)(guard);
};

describe('guardLoops', () => {
  it('stops infinite while, for(;;) and do…while loops', () => {
    expect(() => run('while (true) {}')).toThrow('too long');
    expect(() => run('for (;;) {}')).toThrow('too long');
    expect(() => run('let i = 0; do { i++ } while (i > 0)')).toThrow('too long');
    expect(() => run('for (let i = 0; i < 10; i--) {}')).toThrow('too long');
    expect(() => run('let i = 0; while (i < 10) i--;')).toThrow('too long');
  });

  it('keeps finite loops working, including nested and braceless ones', () => {
    expect(run('let out = 0; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) out++;')).toBe(15);
    expect(run('let out = 0, i = 0; while (i < 4) { out += i; i++ }')).toBe(6);
    expect(run('let out = 0; do out++; while (out < 3)')).toBe(3);
    expect(run('let out = []; for (const x of [1, 2]) out.push(x); for (const k in { a: 1 }) out.push(k);')).toEqual([1, 2, 'a']);
    expect(run('let out = 0; for (let i = 0, j = 9; i < j; i++, j--) out++;')).toBe(5);
  });

  it('ignores loop words in strings, comments, regexes and templates', () => {
    const code = "const s = 'while (true) {}'; // for (;;)\nconst r = /for(;;)/; const t = `${'while'} (x)`; let out = s + t;";
    expect(guardLoops(code)).toBe(code);
  });

  it('handles semicolons inside a for header’s function and template', () => {
    expect(run('let out = 0; for (let f = function () { return 1; }; out < f() * 3; out++) {}')).toBe(3);
    expect(run('let out = 0; for (let i = 0; `${(() => { return i; })()}`.length < 0; i++) {}')).toBe(0);
  });

  it('returns code that does not parse unchanged', () => {
    expect(guardLoops('while (')).toBe('while (');
  });
});
