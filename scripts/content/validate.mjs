#!/usr/bin/env node
// Content validator (docs/CONTENT-GUIDE.md). Checks every course against the
// plan (content/plan.json) and the guide's measurable rules: structure,
// lengths, quizzes, exercises' shape, glossary, assessments, links, banned
// phrases, Arabic parity, and runs every `js run` / `sql run` / `python run`
// block for real.
//
//   node scripts/content/validate.mjs                 all courses, strict
//   node scripts/content/validate.mjs css-mastery     one course
//   node scripts/content/validate.mjs css-mastery --lang=en --partial
//        (while writing: English only, missing files are warnings)
//   --no-run   skip executing runnable blocks

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import YAML from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT = join(ROOT, 'content');
const plan = JSON.parse(readFileSync(join(CONTENT, 'plan.json'), 'utf8'));

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const langArg = args.find((a) => a.startsWith('--lang='))?.split('=')[1] ?? 'all';
const LANGS = langArg === 'all' ? ['en', 'ar'] : [langArg];
const PARTIAL = flags.has('--partial');
const RUN = !flags.has('--no-run');
const only = args.filter((a) => !a.startsWith('--'));
const courses = plan.courses.filter((c) => (only.length ? only.includes(c.id) : existsSync(join(CONTENT, c.id))));

export const ALLOWED_DOMAINS = [
  'developer.mozilla.org', 'react.dev', 'vite.dev', 'www.typescriptlang.org', 'typescriptlang.org', 'docs.python.org', 'pandas.pydata.org', 'numpy.org', 'scikit-learn.org',
  'sqlite.org', 'www.sqlite.org', 'www.postgresql.org', 'postgresql.org', 'help.figma.com', 'www.figma.com', 'figma.com', 'developer.apple.com', 'www.swift.org', 'swift.org', 'docs.swift.org',
  'reactnative.dev', 'docs.expo.dev', 'docs.docker.com', 'kubernetes.io', 'docs.aws.amazon.com', 'aws.amazon.com', 'git-scm.com', 'docs.github.com', 'www.w3.org', 'w3.org', 'web.dev',
  'vitest.dev', 'playwright.dev', 'testing-library.com', 'tailwindcss.com', 'vercel.com', 'nodejs.org', 'tc39.es', 'css-tricks.com', 'www.nngroup.com', 'm3.material.io',
  'designsystem.digital.gov', 'webaim.org', 'www.webaim.org', 'github.com', 'expressjs.com', 'eslint.org', 'prettier.io', 'jestjs.io', 'docs.npmjs.com', 'www.apple.com', 'pyodide.org', 'matplotlib.org', 'seaborn.pydata.org',
];
const CODE_LANGS = new Set(['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'bash', 'sh', 'sql', 'python', 'swift', 'yaml', 'dockerfile', 'diff', 'text', 'ini', 'toml', 'kotlin', 'graphql', 'xml', 'markdown', 'md', 'scss', 'svg']);
const CALLOUTS = new Set(['tip', 'mistake', 'why', 'note', 'figure']);
export const BANNED = [
  /in today's fast[- ]paced/i, /\bin this lesson,? we will\b/i, /let's dive in/i, /\bdive into\b/i, /\bdeep dive\b/i, /\bdelve/i, /\bembark/i, /\bjourney\b/i,
  /unlock the power/i, /harness the power/i, /game[- ]changer/i, /\bseamless(ly)?\b/i, /\bsupercharge/i, /\belevate your\b/i, /\bthe realm of\b/i, /\btapestry\b/i,
  /\bleverag(e|es|ed|ing)\b/i, /it'?s important to note/i, /it'?s worth noting/i, /whether you'?re a (beginner|seasoned|newcomer)/i, /\bin conclusion\b/i, /happy coding/i,
  /\blorem\b/i, /\bipsum\b/i, /\bTODO\b/, /\bTBD\b/, /coming soon/i, /\bplaceholder text\b/i, /\bFIXME\b/, /\bXXX\b/,
  /(?<![\u0600-\u06FF])قريب(?:ًا|ا)(?![\u0600-\u06FF])|سيتم إضافة|محتوى تجريبي/,
];

let errors = 0;
let warnings = 0;
const report = { error: [], warn: [] };
const err = (where, msg) => { errors += 1; report.error.push(`✖ ${where}: ${msg}`); };
const warn = (where, msg) => { warnings += 1; report.warn.push(`⚠ ${where}: ${msg}`); };
const missing = (where, msg) => (PARTIAL ? warn(where, msg) : err(where, msg));

const readJson = (file, where) => {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch (e) { err(where, `invalid JSON: ${e.message.split('\n')[0]}`); return null; }
};
const readYaml = (file, where) => {
  try { return YAML.parse(readFileSync(file, 'utf8')); } catch (e) { err(where, `invalid YAML: ${e.message.split('\n')[0]}`); return null; }
};

/** Split a lesson file into front matter and body. */
export function splitLesson(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { data: YAML.parse(m[1]), body: m[2] };
}

/** Prose only: no code fences, no figures/SVG, no HTML, no inline code. */
export function prose(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/:::figure[\s\S]*?\n:::/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/^:::.*$/gm, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*_>|[\]-]/g, ' ');
}
export const wordCount = (text) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
export const codeBlocks = (body) => [...body.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)].map((m) => ({ info: m[1].trim(), code: m[2] }));

function checkQuestion(q, where, lang) {
  if (!q || typeof q.q !== 'string' || !q.q.trim()) return err(where, 'question text missing');
  if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 4) return err(where, 'needs 3 or 4 options');
  q.options.forEach((o, i) => {
    if (!o || typeof o.text !== 'string' || !o.text.trim()) err(where, `option ${i + 1} has no text`);
    if (!o || typeof o.why !== 'string' || o.why.trim().split(/\s+/).length < (lang === 'en' ? 5 : 3)) err(where, `option ${i + 1} needs a real "why" explanation`);
  });
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(where, 'answer must be a valid 0-based index');
  if (q.options.some((o) => /all of the above|none of the above|جميع ما سبق/i.test(o?.text ?? ''))) err(where, 'no "all/none of the above" options');
}

function checkBanned(text, where) {
  for (const re of BANNED) {
    const m = text.match(re);
    if (m) err(where, `banned phrase "${m[0]}" (CONTENT-GUIDE §2)`);
  }
}

function checkUrl(url, where) {
  let u;
  try { u = new URL(url); } catch { return err(where, `bad URL ${url}`); }
  if (u.protocol !== 'https:') err(where, `URL must be https: ${url}`);
  if (!ALLOWED_DOMAINS.includes(u.hostname)) err(where, `URL domain not on the official-docs allowlist: ${u.hostname}`);
}

const allLessonIds = new Set();
const allCourseIds = new Set(plan.courses.map((c) => c.id));
for (const c of plan.courses) {
  const f = join(CONTENT, c.id, 'course.json');
  if (!existsSync(f)) continue;
  try { JSON.parse(readFileSync(f, 'utf8')).sections.forEach((s) => s.lessons.forEach((l) => allLessonIds.add(l.id))); } catch { /* reported per course */ }
}

function checkBody(body, where, lang) {
  // Callout / figure containers: balanced, known types.
  let open = null;
  body.split('\n').forEach((line, i) => {
    const m = line.match(/^:::\s*(\w+)?/);
    if (!m) return;
    if (m[1]) {
      if (open) err(where, `line ${i + 1}: ":::${m[1]}" opened inside ":::${open}"`);
      if (!CALLOUTS.has(m[1])) err(where, `line ${i + 1}: unknown container ":::${m[1]}"`);
      open = m[1];
    } else {
      if (!open) err(where, `line ${i + 1}: stray ":::"`);
      open = null;
    }
  });
  if (open) err(where, `unclosed ":::${open}"`);
  if (/^#\s/m.test(body.replace(/```[\s\S]*?```/g, ''))) err(where, 'no H1 in the body (the page renders the title)');
  for (const { info } of codeBlocks(body)) {
    const lang0 = info.split(/\s+/)[0];
    if (!lang0) err(where, 'every code fence needs a language');
    else if (!CODE_LANGS.has(lang0)) err(where, `unknown code language "${lang0}"`);
  }
  for (const fig of body.matchAll(/:::figure([^\n]*)\n([\s\S]*?)\n:::/g)) {
    const [, caption, svg] = fig;
    if (!caption.trim()) err(where, 'figure needs a caption');
    if (!/<svg[^>]*viewBox=/.test(svg)) err(where, 'figure SVG needs a viewBox');
    if (!/role="img"/.test(svg)) err(where, 'figure SVG needs role="img"');
    if (!/<title id="[^"]+">[^<]{8,}<\/title>/.test(svg)) err(where, 'figure SVG needs a <title id="…"> description');
    if (/<svg[^>]*\s(width|height)=/.test(svg)) err(where, 'figure SVG: use viewBox only, no width/height on <svg>');
    if (/(fill|stroke|color|stop-color)\s*[=:]\s*"?\s*(#|rgb|hsl|oklch|red|blue|green|black|white\b)/i.test(svg)) err(where, 'figure SVG: no hard-coded colors, use the d-* classes');
  }
  for (const m of body.matchAll(/\]\((lesson|course):([^)]+)\)/g)) {
    if (m[1] === 'lesson' && !allLessonIds.has(m[2])) err(where, `link to unknown lesson ${m[2]}`);
    if (m[1] === 'course' && !allCourseIds.has(m[2])) err(where, `link to unknown course ${m[2]}`);
  }
  checkBanned(prose(body), where);
  if (lang === 'ar' && /[؀-ۿ]/.test(codeBlocks(body).map((b) => b.code).join('\n'))) err(where, 'Arabic text inside a code block (code stays English)');
}

// ── Runnable blocks ──
const runQueue = [];
function runJs(code, where) {
  const out = [];
  const fmt = (v) => (typeof v === 'string' ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })());
  const sandbox = { console: { log: (...a) => out.push(a.map(fmt).join(' ')), error: (...a) => out.push(a.map(fmt).join(' ')), warn: (...a) => out.push(a.map(fmt).join(' ')), table: (v) => out.push(fmt(v)), info: (...a) => out.push(a.map(fmt).join(' ')) }, structuredClone, setTimeout, clearTimeout, queueMicrotask, Intl, URL, TextEncoder };
  try {
    vm.runInNewContext(code, sandbox, { timeout: 2000 });
  } catch (e) {
    return err(where, `js run block throws: ${e.message}`);
  }
  if (!out.length && !/setTimeout|await|Promise|then\(/.test(code)) warn(where, 'js run block prints nothing');
}
function runSql(code, where) {
  try {
    execFileSync('sqlite3', ['-bail', '-readonly', join(CONTENT, 'data', 'shop.sqlite')], { input: code, stdio: ['pipe', 'pipe', 'pipe'], timeout: 10000 });
  } catch (e) {
    err(where, `sql run block fails: ${String(e.stderr || e.message).trim().split('\n')[0]}`);
  }
}
function runPython(code, where) {
  const py = join(ROOT, '.venv', 'bin', 'python');
  if (!existsSync(py)) return warn(where, 'python venv missing (.venv); python run block not executed');
  try {
    execFileSync(py, ['-c', code], { cwd: join(CONTENT, 'data', 'csv'), stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 });
  } catch (e) {
    err(where, `python run block fails: ${String(e.stderr || e.message).trim().split('\n').slice(-1)[0]}`);
  }
}

// ── Per course ──
const answerStats = new Map();
for (const course of courses) {
  const dir = join(CONTENT, course.id);
  const W = course.id;
  if (!existsSync(dir)) { missing(W, 'course folder missing'); continue; }
  const struct = existsSync(join(dir, 'course.json')) ? readJson(join(dir, 'course.json'), `${W}/course.json`) : (missing(W, 'course.json missing'), null);
  if (!struct) continue;
  const stats = [0, 0, 0, 0];
  answerStats.set(course.id, stats);
  const tally = (q) => { if (Number.isInteger(q?.answer)) stats[q.answer] += 1; };

  if (struct.id !== course.id) err(`${W}/course.json`, `id must be "${course.id}"`);
  if (!struct.project || struct.project.length < 20) err(`${W}/course.json`, 'describe the running project/example in "project"');
  const sections = struct.sections ?? [];
  const lessons = sections.flatMap((s) => s.lessons ?? []);
  if (sections.length !== course.sections) err(`${W}/course.json`, `${sections.length} sections, plan says ${course.sections}`);
  if (lessons.length !== course.lessons) err(`${W}/course.json`, `${lessons.length} lessons, plan says ${course.lessons}`);
  const minutes = lessons.reduce((s, l) => s + (l.minutes ?? 0), 0);
  if (minutes !== course.minutes) err(`${W}/course.json`, `lesson minutes sum to ${minutes}, plan says ${course.minutes}`);
  sections.forEach((s, si) => {
    if (s.id !== `s-${course.abbrev}-${si + 1}`) err(`${W}/course.json`, `section ${si + 1} id should be s-${course.abbrev}-${si + 1}`);
    (s.lessons ?? []).forEach((l, li) => {
      if (l.id !== `l-${course.abbrev}-${si + 1}-${li + 1}`) err(`${W}/course.json`, `lesson id ${l.id} should be l-${course.abbrev}-${si + 1}-${li + 1}`);
      if (!Number.isInteger(l.minutes) || l.minutes < 5 || l.minutes > 45) err(`${W}/course.json`, `${l.id}: minutes must be an integer 5–45`);
    });
  });
  const canonical = plan.canonical[course.id];

  const texts = {};
  for (const lang of LANGS) {
    const f = join(dir, `course.${lang}.json`);
    if (!existsSync(f)) { missing(W, `course.${lang}.json missing`); continue; }
    const t = readJson(f, `${W}/course.${lang}.json`);
    if (!t) continue;
    texts[lang] = t;
    const w = `${W}/course.${lang}.json`;
    for (const k of ['title', 'tagline', 'audience', 'prerequisites']) if (typeof t[k] !== 'string' || !t[k].trim()) err(w, `"${k}" missing`);
    if (lang === 'en' && t.title !== course.title) err(w, `title must be "${course.title}"`);
    if (!Array.isArray(t.description) || t.description.length !== 2) err(w, 'description must be 2 paragraphs');
    else t.description.forEach((p, i) => { const n = wordCount(p); if (n < (lang === 'en' ? 35 : 25) || n > 110) err(w, `description paragraph ${i + 1} has ${n} words (40–80)`); });
    if (!Array.isArray(t.learnItems) || t.learnItems.length !== 6) err(w, 'learnItems must have exactly 6 items');
    else t.learnItems.forEach((x) => { if (lang === 'en' && x.length > 72) err(w, `learn item too long (${x.length} chars): ${x}`); });
    sections.forEach((s, si) => {
      if (!t.sections?.[s.id]) err(w, `missing section title ${s.id}`);
      if (lang === 'en' && canonical && t.sections?.[s.id] !== canonical[si].title) err(w, `${s.id} title must be "${canonical[si].title}" (PRD §5.3)`);
      (s.lessons ?? []).forEach((l, li) => {
        if (!t.lessons?.[l.id]) err(w, `missing lesson title ${l.id}`);
        if (lang === 'en' && canonical) {
          const [title, min] = canonical[si].lessons[li] ?? [];
          if (t.lessons?.[l.id] !== title) err(w, `${l.id} title must be "${title}" (PRD §5.3)`);
          if (l.minutes !== min) err(`${W}/course.json`, `${l.id} minutes must be ${min} (PRD §5.3)`);
        }
      });
    });
    checkBanned(JSON.stringify(t), w);
  }

  // Lessons
  const enWords = new Map();
  const enCode = new Map();
  const enAnswers = new Map();
  const firstId = lessons[0]?.id;
  const lastId = lessons[lessons.length - 1]?.id;
  for (const lang of LANGS) {
    for (const l of lessons) {
      const f = join(dir, 'lessons', `${l.id}.${lang}.md`);
      const w = `${W}/lessons/${l.id}.${lang}.md`;
      if (!existsSync(f)) { missing(w, 'missing'); continue; }
      let parsed;
      try { parsed = splitLesson(readFileSync(f, 'utf8')); } catch (e) { err(w, `front matter YAML: ${e.message.split('\n')[0]}`); continue; }
      if (!parsed) { err(w, 'needs --- front matter ---'); continue; }
      const { data, body } = parsed;
      const kind = data.kind ?? 'lesson';
      if (!['lesson', 'intro', 'wrapup'].includes(kind)) err(w, `unknown kind ${kind}`);
      if (kind === 'intro' && l.id !== firstId) err(w, 'only the first lesson of a course may be kind: intro');
      if (kind === 'wrapup' && l.id !== lastId) err(w, 'only the last lesson of a course may be kind: wrapup');
      const sw = wordCount(String(data.summary ?? ''));
      if (lang === 'en' && (sw < 12 || sw > 35)) err(w, `summary has ${sw} words (12–35)`);
      if (lang === 'ar' && sw < 8) err(w, 'summary missing');
      if (!Array.isArray(data.takeaways) || data.takeaways.length < 3 || data.takeaways.length > 5) err(w, 'takeaways: 3–5 items');
      if (!Array.isArray(data.further) || data.further.length < 1 || data.further.length > 4) err(w, 'further: 1–4 official-docs links');
      else data.further.forEach((x) => { if (!x?.title) err(w, 'further item needs a title'); checkUrl(x?.url, w); });
      if (!Array.isArray(data.quiz) || data.quiz.length < 3 || data.quiz.length > 5) err(w, 'quiz: 3–5 questions');
      else data.quiz.forEach((q, i) => { checkQuestion(q, `${w} quiz ${i + 1}`, lang); if (lang === 'en') tally(q); });
      checkBody(body, w, lang);
      checkBanned(JSON.stringify(data), w);
      const words = wordCount(prose(body));
      const blocks = codeBlocks(body);
      if (lang === 'en') {
        enWords.set(l.id, words);
        enCode.set(l.id, blocks.map((b) => b.code));
        enAnswers.set(l.id, (data.quiz ?? []).map((q) => q.answer));
        const [min, max] = kind === 'lesson' ? [550, 1500] : [350, 900];
        if (words < min || words > max) err(w, `${words} prose words (${kind}: ${kind === 'lesson' ? '600–1,200' : '350–800'})`);
        else if (kind === 'lesson' && words < 600) warn(w, `${words} prose words — aim for 600+`);
        if (RUN) {
          for (const b of blocks) {
            const [lng, ...meta] = b.info.split(/\s+/);
            if (!meta.includes('run')) continue;
            if (lng === 'js') runQueue.push(() => runJs(b.code, w));
            else if (lng === 'sql') runQueue.push(() => runSql(b.code, w));
            else if (lng === 'python') runQueue.push(() => runPython(b.code, w));
            else err(w, `"run" is only supported on js, sql and python blocks (got ${lng})`);
          }
        }
      } else {
        const en = enWords.get(l.id) ?? (existsSync(join(dir, 'lessons', `${l.id}.en.md`)) ? wordCount(prose(splitLesson(readFileSync(join(dir, 'lessons', `${l.id}.en.md`), 'utf8'))?.body ?? '')) : 0);
        if (en && words < en * 0.7) err(w, `Arabic body is ${words} words vs ${en} in English (needs ≥ 70%: translate everything)`);
        const enLesson = existsSync(join(dir, 'lessons', `${l.id}.en.md`)) ? splitLesson(readFileSync(join(dir, 'lessons', `${l.id}.en.md`), 'utf8')) : null;
        if (enLesson) {
          const ec = codeBlocks(enLesson.body).map((b) => b.code.trim());
          const ac = blocks.map((b) => b.code.trim());
          if (ec.length !== ac.length) err(w, `${ac.length} code blocks vs ${ec.length} in English`);
          else ec.forEach((c, i) => { if (c !== ac[i]) err(w, `code block ${i + 1} differs from English (code stays identical)`); });
          const ea = (enLesson.data.quiz ?? []).map((q) => q.answer).join(',');
          const aa = (data.quiz ?? []).map((q) => q.answer).join(',');
          if (ea !== aa) err(w, `quiz answers ${aa} differ from English ${ea}`);
          if ((enLesson.data.kind ?? 'lesson') !== kind) err(w, 'kind differs from English');
          const eu = (enLesson.data.further ?? []).map((x) => x.url).join(' ');
          if (eu !== (data.further ?? []).map((x) => x.url).join(' ')) err(w, 'further URLs differ from English');
          (data.quiz ?? []).forEach((q, i) => { if ((q.options?.length ?? 0) !== (enLesson.data.quiz?.[i]?.options?.length ?? -1)) err(w, `quiz ${i + 1} option count differs from English`); });
          const ef = (enLesson.body.match(/:::figure/g) ?? []).length;
          if (ef !== (body.match(/:::figure/g) ?? []).length) err(w, 'figure count differs from English');
        }
        if (!/[؀-ۿ]/.test(body)) err(w, 'no Arabic text found');
      }
    }
  }

  // Exercises
  const exDir = join(dir, 'exercises');
  const exIds = existsSync(exDir) ? [...new Set(readdirSync(exDir).filter((f) => /^l-[\w-]+\.json$/.test(f)).map((f) => f.replace(/\.json$/, '')))] : [];
  const lessonSet = new Set(lessons.map((l) => l.id));
  for (const id of exIds) {
    const w = `${W}/exercises/${id}`;
    if (!lessonSet.has(id)) err(w, 'exercise for a lesson that does not exist');
    const ex = readJson(join(exDir, `${id}.json`), `${w}.json`);
    if (!ex) continue;
    const kinds = ['web', 'sql', 'python', 'order', 'spot-bug', 'fill', 'choice'];
    if (!kinds.includes(ex.kind)) { err(w, `unknown kind ${ex.kind}`); continue; }
    let checkIds = [];
    if (ex.kind === 'web') {
      const modes = { js: ['js'], dom: ['html', 'css', 'js'], react: ['jsx', 'css'], ts: ['ts'], test: ['js'] };
      if (!modes[ex.mode]) err(w, `unknown web mode ${ex.mode}`);
      for (const side of ['starter', 'solution']) {
        if (!ex[side] || typeof ex[side] !== 'object') { err(w, `${side} files missing`); continue; }
        for (const k of Object.keys(ex[side])) if (!modes[ex.mode]?.includes(k)) err(w, `${side}: file "${k}" not used in mode ${ex.mode}`);
        if (ex.mode === 'react' && !/export\s+default\s+function\s+App\b/.test(ex[side].jsx ?? '')) err(w, `${side}.jsx must export default function App`);
      }
      if (ex.mode === 'test') {
        if (typeof ex.subject !== 'string') err(w, 'test mode needs "subject"');
        if (!Array.isArray(ex.mutants) || !ex.mutants.length) err(w, 'test mode needs "mutants"');
      }
      if (!Array.isArray(ex.checks) || !ex.checks.length) err(w, 'needs checks');
      else ex.checks.forEach((c) => { if (!c.id) err(w, 'check needs an id'); if (!c.test && !c.typecheck && !c.suite) err(w, `check ${c.id} needs test/typecheck/suite`); if (c.test) { try { new Function(`return (async () => { ${c.test} })`); } catch (e) { err(w, `check ${c.id} is not valid JS: ${e.message}`); } } });
      checkIds = (ex.checks ?? []).map((c) => c.id);
    } else if (ex.kind === 'sql') {
      if (!ex.starter || !ex.solution) err(w, 'sql needs starter and solution');
    } else if (ex.kind === 'python') {
      if (!ex.starter || !ex.solution) err(w, 'python needs starter and solution');
      if (!Array.isArray(ex.checks) || !ex.checks.length) err(w, 'python needs checks');
      for (const f of ex.files ?? []) if (!existsSync(join(CONTENT, 'data', 'csv', f))) err(w, `unknown data file ${f}`);
      checkIds = (ex.checks ?? []).map((c) => c.id);
    } else if (ex.kind === 'order') {
      if (!Array.isArray(ex.items) || ex.items.length < 4 || ex.items.length > 8) err(w, 'order needs 4–8 items');
    } else if (ex.kind === 'spot-bug') {
      const n = String(ex.code ?? '').split('\n').length;
      if (!Array.isArray(ex.bugLines) || !ex.bugLines.length || ex.bugLines.some((x) => x < 1 || x > n)) err(w, 'bugLines must be valid 1-based line numbers');
      if (n < 5) err(w, 'spot-bug code should be at least 5 lines');
    } else if (ex.kind === 'fill') {
      const holes = [...String(ex.template ?? '').matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
      if (!holes.length || holes.length !== (ex.blanks ?? []).length) err(w, 'fill: every {{n}} needs a blank and vice versa');
      (ex.blanks ?? []).forEach((b, i) => { if (!Array.isArray(b.answers) || !b.answers.length) err(w, `blank ${i} needs answers`); });
    } else if (ex.kind === 'choice') {
      if (!Array.isArray(ex.options) || ex.options.length < 3) err(w, 'choice needs ≥ 3 options');
      if (!Array.isArray(ex.correct) || !ex.correct.length || ex.correct.some((x) => !ex.options?.includes(x))) err(w, 'choice: correct must list option ids');
    }
    for (const lang of LANGS) {
      const tf = join(exDir, `${id}.${lang}.json`);
      if (!existsSync(tf)) { missing(w, `${lang} text missing`); continue; }
      const t = readJson(tf, `${w}.${lang}.json`);
      if (!t) continue;
      for (const k of ['title', 'prompt', 'explanation']) if (typeof t[k] !== 'string' || !t[k].trim()) err(`${w}.${lang}.json`, `"${k}" missing`);
      if (!Array.isArray(t.hints) || t.hints.length < 1 || t.hints.length > 4) err(`${w}.${lang}.json`, 'hints: 1–4');
      for (const c of checkIds) if (!t.checks?.[c]) err(`${w}.${lang}.json`, `missing label for check ${c}`);
      if (ex.kind === 'order') for (const it of ex.items ?? []) if (!t.items?.[it]) err(`${w}.${lang}.json`, `missing text for item ${it}`);
      if (ex.kind === 'choice') for (const o of ex.options ?? []) if (!t.options?.[o]?.text || !t.options?.[o]?.why) err(`${w}.${lang}.json`, `option ${o} needs text and why`);
      if (ex.kind === 'test') for (const m of ex.mutants ?? []) if (!t.checks?.[`catches-${m.id}`] && !(ex.checks ?? []).some((c) => c.suite === m.id)) err(w, `mutant ${m.id} has no check`);
      checkBanned(JSON.stringify(t), `${w}.${lang}.json`);
    }
  }
  sections.forEach((s) => { if (!s.lessons.some((l) => exIds.includes(l.id))) missing(`${W}/${s.id}`, 'every section needs at least one exercise'); });
  const runnable = course.engines.some((e) => e.startsWith('web') || e === 'sql' || e === 'python');
  if (runnable && exIds.length < Math.ceil(lessons.length * 0.6)) missing(W, `${exIds.length} exercises for ${lessons.length} lessons — aim for ≥ 60% in a ${course.engines.join('/')} course`);

  // Assessments
  for (const lang of LANGS) {
    const f = join(dir, `assessments.${lang}.yaml`);
    const w = `${W}/assessments.${lang}.yaml`;
    if (!existsSync(f)) { missing(w, 'missing'); continue; }
    const a = readYaml(f, w);
    if (!a) continue;
    for (const s of sections) {
      const qs = a.checkpoints?.[s.id];
      if (!Array.isArray(qs) || qs.length !== 5) err(w, `${s.id}: checkpoint needs exactly 5 questions`);
      else qs.forEach((q, i) => { checkQuestion(q, `${w} ${s.id} q${i + 1}`, lang); if (lang === 'en') tally(q); });
    }
    if (!Array.isArray(a.final) || a.final.length !== 12) err(w, 'final needs exactly 12 questions');
    else a.final.forEach((q, i) => { checkQuestion(q, `${w} final q${i + 1}`, lang); if (lang === 'en') tally(q); });
    checkBanned(JSON.stringify(a), w);
    if (lang === 'ar' && existsSync(join(dir, 'assessments.en.yaml'))) {
      const en = YAML.parse(readFileSync(join(dir, 'assessments.en.yaml'), 'utf8'));
      const sig = (x) => JSON.stringify({ c: Object.fromEntries(Object.entries(x?.checkpoints ?? {}).map(([k, v]) => [k, v.map((q) => q.answer)])), f: (x?.final ?? []).map((q) => q.answer) });
      if (sig(en) !== sig(a)) err(w, 'answer indices differ from English');
    }
  }

  // Glossary
  for (const lang of LANGS) {
    const f = join(dir, `glossary.${lang}.json`);
    const w = `${W}/glossary.${lang}.json`;
    if (!existsSync(f)) { missing(w, 'missing'); continue; }
    const g = readJson(f, w);
    if (!Array.isArray(g)) { err(w, 'must be an array'); continue; }
    if (g.length < 18 || g.length > 30) err(w, `${g.length} terms (18–30)`);
    const ids = new Set();
    for (const t of g) {
      if (!t.id || ids.has(t.id)) err(w, `duplicate or missing id ${t.id}`);
      ids.add(t.id);
      if (!t.term) err(w, `${t.id}: term missing`);
      const n = wordCount(String(t.definition ?? ''));
      if (n < (lang === 'en' ? 12 : 8) || n > 60) err(w, `${t.id}: definition has ${n} words (15–45)`);
      if (!lessonSet.has(t.lesson)) err(w, `${t.id}: lesson ${t.lesson} not in this course`);
    }
    if (lang === 'ar' && existsSync(join(dir, 'glossary.en.json'))) {
      const en = JSON.parse(readFileSync(join(dir, 'glossary.en.json'), 'utf8'));
      if (en.map((t) => t.id).join() !== g.map((t) => t.id).join()) err(w, 'term ids/order differ from English');
    }
    checkBanned(JSON.stringify(g), w);
  }

  // Answer distribution
  const total = stats.reduce((a, b) => a + b, 0);
  if (total >= 20) {
    const top = Math.max(...stats);
    if (top / total > 0.4) err(W, `correct answers are bunched: ${stats.join('/')} by index (max 40% on one index)`);
  }
}

for (const run of runQueue) run();

for (const line of [...report.error, ...(errors ? report.warn.slice(0, 40) : report.warn)]) console.log(line);
console.log(`\n${courses.length} course(s) checked: ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
