#!/usr/bin/env node
// Playwright's web server: serves the prerendered production build.
// Rebuilds first if dist/ is missing or older than any source file, so
// `npm run test:e2e` never tests a stale bundle (`npm run verify` has just
// built, so it skips straight to serving).

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = process.argv[2] ?? '4325';

function newest(path) {
  if (!existsSync(path)) return 0;
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  return Math.max(stat.mtimeMs, ...readdirSync(path).map((name) => newest(join(path, name))));
}

const built = existsSync(join(ROOT, 'dist', 'index.html')) ? statSync(join(ROOT, 'dist', 'index.html')).mtimeMs : 0;
const source = Math.max(...['src', 'scripts', 'content', 'index.html', 'vite.config.js'].map((p) => newest(join(ROOT, p))));
if (source > built) {
  console.log('[serve-e2e] dist/ is stale; building…');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['run', 'build'], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const server = spawn(process.execPath, [join(ROOT, 'scripts', 'serve.mjs'), port], { cwd: ROOT, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', (code) => process.exit(code ?? 0));
