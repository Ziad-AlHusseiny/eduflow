#!/usr/bin/env node
// Fails if a page's first-load JavaScript exceeds the budget: 180 KB gzipped
// on the heaviest page (the owner's bar, tighter than the BRIEF's). "Initial"
// is what each prerendered page loads before it's interactive: the entry,
// its imports, the page's own chunk, the outline text on pages that need it
// and, on /ar pages, the Arabic text. The code editor, TypeScript, Sucrase,
// SQLite and Python engines load only when a learner opens an exercise, so
// they're listed but not counted.
//
//   npm run check:bundle   (after npm run build)

import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BUDGET_KB = 180;
const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const gz = new Map();
const gzKB = async (file) => {
  if (!gz.has(file)) gz.set(file, gzipSync(await readFile(join(DIST, file)), { level: 9 }).length / 1024);
  return gz.get(file);
};

const PAGES = {
  '/': ['index.html', 'HomePage'],
  '/courses': ['courses/index.html', 'CoursesPage'],
  '/courses/:id': ['courses/react-fundamentals/index.html', 'CourseDetailPage'],
  '/lesson/:c/:l': ['lesson/react-fundamentals/l-rf-2-3/index.html', 'LessonPage'],
  '/learning': ['learning/index.html', 'MyLearningPage'],
  '/review': ['review/index.html', 'ReviewPage'],
  '/stats': ['stats/index.html', 'StatsPage'],
  '/glossary': ['glossary/index.html', 'GlossaryPage'],
  '/courses/:id/final': ['courses/react-fundamentals/final/index.html', 'AssessmentPage'],
  '/ar': ['ar/index.html', 'HomePage'],
  '/ar/lesson/:c/:l': ['ar/lesson/react-fundamentals/l-rf-2-3/index.html', 'LessonPage'],
  '/ar/courses/:id': ['ar/courses/react-fundamentals/index.html', 'CourseDetailPage'],
};

let worst = 0;
for (const [route, [file, chunk]] of Object.entries(PAGES)) {
  let html;
  try {
    html = await readFile(join(DIST, file), 'utf8');
  } catch {
    console.error(`dist/${file} not found — run \`npm run build\` first.`);
    process.exit(1);
  }
  const scripts = new Set();
  for (const [, src] of html.matchAll(/<script[^>]+src="\/([^"]+\.js)"/g)) scripts.add(src);
  for (const [, href] of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/([^"]+\.js)"/g)) scripts.add(href);
  if (![...scripts].some((f) => f.startsWith(`assets/${chunk}-`))) {
    console.error(`${route}: the page's own chunk (${chunk}) isn't preloaded.`);
    process.exit(1);
  }
  let kb = 0;
  for (const s of scripts) kb += await gzKB(s);
  const htmlKB = gzipSync(html, { level: 9 }).length / 1024;
  worst = Math.max(worst, kb);
  console.log(`${kb.toFixed(1).padStart(7)} KB gz  ${route.padEnd(18)} initial JavaScript   (HTML ${htmlKB.toFixed(1)} KB gz, CSS inlined)`);
}

const all = (await readdir(join(DIST, 'assets'))).filter((f) => f.endsWith('.js'));
let lazy = 0;
for (const f of all) lazy += await gzKB(`assets/${f}`);
console.log(`${lazy.toFixed(1).padStart(7)} KB gz  all JavaScript, ${all.length} chunks (lazy ones load on demand: editor, TypeScript, SQLite, Python…)`);
console.log(`${worst.toFixed(1).padStart(7)} KB gz  heaviest first load (budget ${BUDGET_KB} KB)`);
if (worst > BUDGET_KB) {
  console.error(`A page's initial JavaScript exceeds the ${BUDGET_KB} KB budget by ${(worst - BUDGET_KB).toFixed(1)} KB.`);
  process.exit(1);
}
