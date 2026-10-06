#!/usr/bin/env node
// Serves dist/ the way Vercel does (vercel.json): /recipes → recipes/index.html,
// a trailing slash redirects to the bare path, unknown paths get 404.html with
// a 404 status, gzip for text. Used by `npm run preview` and the e2e tests.
//
//   node scripts/serve.mjs [port]

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';

const DIST = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};
const COMPRESS = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg', '.txt', '.xml']);

const isFile = (p) => existsSync(p) && statSync(p).isFile();

function resolve(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const direct = join(DIST, safe);
  if (!direct.startsWith(DIST)) return null;
  if (isFile(direct)) return direct;
  const index = join(direct, 'index.html');
  if (isFile(index)) return index;
  if (isFile(`${direct}.html`)) return `${direct}.html`;
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    res.writeHead(308, { Location: url.pathname.replace(/\/+$/, '') + url.search });
    res.end();
    return;
  }
  let file = resolve(url.pathname);
  let status = 200;
  if (!file) {
    file = join(DIST, '404.html');
    status = 404;
  }
  const ext = extname(file);
  const headers = {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': url.pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
  };
  if (url.pathname === '/sw.js') headers['Service-Worker-Allowed'] = '/';
  const gzip = COMPRESS.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
  if (gzip) headers['Content-Encoding'] = 'gzip';
  res.writeHead(status, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  const stream = createReadStream(file);
  (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
}).listen(port, () => console.log(`[serve] dist/ on http://localhost:${port}`));
