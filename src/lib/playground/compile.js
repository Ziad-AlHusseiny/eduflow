// Turns an exercise's files into what the iframe runs. React: JSX + imports
// through Sucrase. TypeScript: a real type-check (TypeScript 5, in memory)
// and a transpile. The heavy compilers are passed in, so the browser can
// lazy-load them and Node (check-exercises.mjs) can import them directly.

/** Global helper types for type-level exercises, plus `console` (no DOM lib). */
export const TS_PRELUDE = `type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;
declare var console: { log(...data: any[]): void; error(...data: any[]): void; warn(...data: any[]): void; info(...data: any[]): void; table(data: any): void };
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearTimeout(id: number | undefined): void;
declare function structuredClone<T>(value: T): T;
`;

export const TS_OPTIONS = { strict: true, target: 'ES2022', noEmit: true, exactOptionalPropertyTypes: false, noUncheckedIndexedAccess: false, lib: ['lib.es2022.d.ts'] };

/** Sucrase: JSX (classic runtime, React global) + ES imports → CommonJS. */
export function compileReact(sucrase, source) {
  try {
    const { code } = sucrase.transform(source, { transforms: ['jsx', 'imports'], production: true, jsxPragma: 'React.createElement', jsxFragmentPragma: 'React.Fragment' });
    return { js: code, diagnostics: [] };
  } catch (e) {
    const line = e.loc?.line ?? null;
    return { js: '', diagnostics: [{ line, message: String(e.message).replace(/\s*\(\d+:\d+\)$/, '') }] };
  }
}

/**
 * Type-checks `source` against ES2022 + the prelude, then transpiles it.
 * @param ts the `typescript` module
 * @param libs { 'lib.es2022.d.ts': '…', … } every lib file it references
 */
export function compileTs(ts, libs, source) {
  const files = { '/exercise.ts': source, '/prelude.d.ts': TS_PRELUDE };
  const options = { strict: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None, noEmit: true, lib: ['lib.es2022.d.ts'], types: [], skipLibCheck: true };
  const read = (name) => files[name] ?? libs[name.replace(/^\//, '')];
  const host = {
    getSourceFile: (name, lang) => {
      const text = read(name);
      return text === undefined ? undefined : ts.createSourceFile(name, text, lang);
    },
    getDefaultLibFileName: () => '/lib.es2022.d.ts',
    getDefaultLibLocation: () => '/',
    writeFile: () => {},
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: (f) => read(f) !== undefined,
    readFile: read,
  };
  const program = ts.createProgram(['/exercise.ts', '/prelude.d.ts'], options, host);
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((d) => !d.file || d.file.fileName === '/exercise.ts')
    .map((d) => {
      const pos = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      return { line: pos ? pos.line + 1 : null, col: pos ? pos.character + 1 : null, message: ts.flattenDiagnosticMessageText(d.messageText, '\n'), code: d.code };
    });
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None, removeComments: false }, reportDiagnostics: false });
  return { js: outputText.replace(/^"use strict";\s*/, '').replace(/^export \{\};\s*$/m, ''), diagnostics };
}
