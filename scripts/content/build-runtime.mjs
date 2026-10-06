#!/usr/bin/env node
// Builds what the playground iframe needs and can't import itself:
//   public/playground/react-runtime.js  React 19 + react-dom as globals
//   public/playground/ts-libs.json      the TypeScript ES2022 lib files
// Both are fetched (and cached offline) only when a learner opens an exercise.

import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'public', 'playground');
mkdirSync(OUT, { recursive: true });
const require = createRequire(import.meta.url);

await build({
  stdin: {
    contents: "import * as React from 'react'; import * as ReactDOM from 'react-dom'; import * as ReactDOMClient from 'react-dom/client'; window.React = React; window.ReactDOM = ReactDOM; window.ReactDOMClient = ReactDOMClient;",
    resolveDir: ROOT,
    loader: 'js',
  },
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2022',
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: join(OUT, 'react-runtime.js'),
  logLevel: 'warning',
});

const libDir = dirname(require.resolve('typescript/lib/lib.es2022.d.ts'));
const libs = {};
const visit = (name) => {
  if (libs[name]) return;
  const text = readFileSync(join(libDir, name), 'utf8');
  libs[name] = text;
  for (const [, ref] of text.matchAll(/\/\/\/\s*<reference lib="([^"]+)"/g)) visit(`lib.${ref.toLowerCase()}.d.ts`);
};
visit('lib.es2022.d.ts');
writeFileSync(join(OUT, 'ts-libs.json'), JSON.stringify(libs));
console.log(`[runtime] react-runtime.js + ts-libs.json (${Object.keys(libs).length} lib files)`);
