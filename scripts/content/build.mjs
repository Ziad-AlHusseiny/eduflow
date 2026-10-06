#!/usr/bin/env node
// Compiles the course content (content/**, docs/CONTENT-GUIDE.md) into what
// the app ships:
//
//   src/generated/structure.js          ids, minutes, exercise kinds (language-neutral, in the entry)
//   src/generated/text.en.js / .ar.js   course, section and lesson titles + catalog copy (Arabic is a lazy chunk)
//   public/content/<lang>/lessons/<id>.json       a lesson: HTML (highlighted at build time), quiz, exercise
//   public/content/<lang>/courses/<id>.json       a course's checkpoints, final assessment and glossary
//   public/content/<lang>/glossary.json           every term, for /glossary and flashcards
//   public/content/<lang>/search.json            the ⌘K index
//   public/data/…                                 the Cartwheel database and CSVs (SQL/Python exercises)
//   public/playground/…                          the React runtime + TypeScript libs (scripts/content/build-runtime.mjs)
//
// Syntax highlighting happens here (Shiki, light + dark themes), so reading a
// lesson ships no highlighter.
//
// CONTENT_STRICT=1 fails on any missing file (CI / production);
// otherwise courses whose English lessons aren't all written yet are skipped,
// and Arabic falls back to English while a translation is in progress.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import { createHighlighter } from 'shiki';
import YAML from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT = join(ROOT, 'content');
const OUT_PUBLIC = join(ROOT, 'public', 'content');
const OUT_SRC = join(ROOT, 'src', 'generated');
const STRICT = process.env.CONTENT_STRICT === '1';
// Development only: include courses still being written (their missing lessons are simply absent).
const PARTIAL = !STRICT && process.env.CONTENT_PARTIAL === '1';
const LANGS = ['en', 'ar'];
const plan = JSON.parse(readFileSync(join(CONTENT, 'plan.json'), 'utf8'));
const started = Date.now();

const warnings = [];
const fail = (msg) => {
  if (STRICT) {
    console.error(`[content] ✖ ${msg}`);
    process.exitCode = 1;
  } else warnings.push(msg);
};

// ── Shiki ──
const SHIKI_LANGS = ['javascript', 'jsx', 'typescript', 'tsx', 'html', 'css', 'json', 'bash', 'sql', 'python', 'swift', 'yaml', 'docker', 'diff', 'ini', 'toml', 'kotlin', 'graphql', 'xml', 'markdown', 'scss'];
const ALIAS = { js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', dockerfile: 'docker', svg: 'xml', md: 'markdown', text: 'text', plaintext: 'text' };
const LABEL = { js: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX', html: 'HTML', css: 'CSS', json: 'JSON', bash: 'Terminal', sh: 'Terminal', sql: 'SQL', python: 'Python', swift: 'Swift', yaml: 'YAML', dockerfile: 'Dockerfile', diff: 'Diff', text: 'Text', ini: 'INI', toml: 'TOML', kotlin: 'Kotlin', graphql: 'GraphQL', xml: 'XML', markdown: 'Markdown', md: 'Markdown', scss: 'SCSS', svg: 'SVG' };
const highlighter = await createHighlighter({ themes: ['github-light-default', 'github-dark-default'], langs: SHIKI_LANGS });
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function highlight(code, lang) {
  const id = ALIAS[lang] ?? lang;
  if (id === 'text' || !SHIKI_LANGS.includes(id)) return `<pre class="shiki" tabindex="0"><code>${escapeHtml(code)}</code></pre>`;
  return highlighter
    .codeToHtml(code, { lang: id, themes: { light: 'github-light-default', dark: 'github-dark-default' }, defaultColor: 'light' })
    .replace(/<pre class="shiki[^"]*"[^>]*>/, '<pre class="shiki" tabindex="0">');
}

// ── UI words baked into lesson HTML (the rest of the UI lives in src/i18n) ──
const WORDS = {
  en: { tip: 'Tip', mistake: 'Common mistake', why: 'Why this matters', note: 'Note', copy: 'Copy', copyLabel: 'Copy code', run: 'Run', runLabel: 'Run this example', code: 'Code', scroll: 'Scrollable table', figure: 'Figure' },
  ar: { tip: 'نصيحة', mistake: 'خطأ شائع', why: 'لماذا يهمّ هذا', note: 'ملاحظة', copy: 'نسخ', copyLabel: 'نسخ الكود', run: 'تشغيل', runLabel: 'شغّل هذا المثال', code: 'كود', scroll: 'جدول قابل للتمرير', figure: 'شكل' },
};
// lucide-react v1 icon paths (Lightbulb, TriangleAlert, Target, Info, Copy, Play), inlined.
const ICONS = {
  tip: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  mistake: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  why: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  note: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  run: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

// ── Markdown ──
function makeMd(lang, ctx) {
  const W = WORDS[lang];
  const md = new MarkdownIt({ html: true, linkify: false, typographer: true });
  let headingIndex = 0;
  let codeIndex = 0;
  md.renderer.rules.fence = (tokens, idx) => {
    const t = tokens[idx];
    const [rawLang = 'text', ...meta] = t.info.trim().split(/\s+/);
    const title = meta.find((m) => m.startsWith('title='))?.slice(6);
    const runnable = meta.includes('run') && ['js', 'sql', 'python'].includes(rawLang);
    const code = t.content.replace(/\n$/, '');
    const n = codeIndex++;
    ctx.codeLangs.add(rawLang);
    if (runnable) ctx.runnable.push(rawLang);
    const head = `<div class="code-head"><span class="code-title">${title ? escapeHtml(title) : escapeHtml(LABEL[rawLang] ?? rawLang)}</span><span class="code-actions">${runnable ? `<button type="button" class="code-btn code-run" data-action="run" data-lang="${rawLang}" data-index="${n}" aria-label="${W.runLabel}">${icon('run')}<span>${W.run}</span></button>` : ''}<button type="button" class="code-btn" data-action="copy" aria-label="${W.copyLabel}">${icon('copy')}<span>${W.copy}</span></button></span></div>`;
    return `<div class="code-block" dir="ltr" data-lang="${rawLang}"${runnable ? ` data-run="${rawLang}"` : ''} data-index="${n}">${head}${highlight(code, rawLang)}${runnable ? `<div class="run-output" data-run-output="${n}" hidden></div>` : ''}</div>\n`;
  };
  md.renderer.rules.code_inline = (tokens, idx) => `<code dir="ltr">${escapeHtml(tokens[idx].content)}</code>`;
  md.renderer.rules.heading_open = (tokens, idx) => {
    const t = tokens[idx];
    if (t.tag === 'h2' || t.tag === 'h3') {
      const id = `sec-${++headingIndex}`;
      const text = tokens[idx + 1].children.map((c) => c.content).join('');
      ctx.toc.push({ id, text, level: Number(t.tag[1]) });
      return `<${t.tag} id="${id}" tabindex="-1">`;
    }
    return `<${t.tag}>`;
  };
  md.renderer.rules.table_open = () => `<div class="table-wrap" role="region" aria-label="${W.scroll}" tabindex="0"><table>`;
  md.renderer.rules.table_close = () => '</table></div>';
  const defaultLink = md.renderer.rules.link_open ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const t = tokens[idx];
    const href = t.attrGet('href') ?? '';
    const prefix = lang === 'ar' ? '/ar' : '';
    const m = href.match(/^(lesson|course):(.+)$/);
    if (m) {
      const [, kind, id] = m;
      if (kind === 'lesson') {
        const courseId = ctx.lessonCourse.get(id);
        if (!courseId) ctx.errors.push(`link to unknown lesson ${id}`);
        t.attrSet('href', `${prefix}/lesson/${courseId}/${id}`);
      } else {
        if (!ctx.courseIds.has(id)) ctx.errors.push(`link to unknown course ${id}`);
        t.attrSet('href', `${prefix}/courses/${id}`);
      }
    } else if (/^https?:/.test(href)) {
      t.attrSet('target', '_blank');
      t.attrSet('rel', 'noopener noreferrer');
    }
    return defaultLink(tokens, idx, options, env, self);
  };
  for (const type of ['tip', 'mistake', 'why', 'note']) {
    md.use(container, type, {
      render(tokens, idx) {
        const t = tokens[idx];
        if (t.nesting === 1) {
          const title = t.info.trim().slice(type.length).trim();
          return `<aside class="callout callout-${type}" role="note"><p class="callout-title">${icon(type)}<span><span class="callout-kind">${W[type]}</span>${title ? `<span class="callout-sep" aria-hidden="true"> · </span>${md.renderInline(title)}` : ''}</span></p>\n`;
        }
        return '</aside>\n';
      },
    });
  }
  return md;
}

/** Figures are cut out before Markdown parsing (SVG can't be Markdown), then put back. */
function renderLesson(body, lang, ctx, lessonId) {
  const figures = [];
  const src = body.replace(/^:::figure([^\n]*)\n([\s\S]*?)\n:::\s*$/gm, (_, caption, svg) => {
    figures.push({ caption: caption.trim(), svg: svg.trim() });
    return `\n<!--FIGURE:${figures.length - 1}-->\n`;
  });
  const md = makeMd(lang, ctx);
  let html = md.render(src);
  html = html.replace(/(?:<p>)?<!--FIGURE:(\d+)-->(?:<\/p>)?/g, (_, i) => {
    const f = figures[Number(i)];
    const n = Number(i) + 1;
    const marker = `arrow-${lessonId}-${n}`;
    let svg = f.svg
      .replace(/url\(#arrow\)/g, `url(#${marker})`)
      .replace(/\bid="([^"]+)"/g, (m, id) => `id="${lessonId}-${id}"`)
      .replace(/aria-labelledby="([^"]+)"/g, (m, ids) => `aria-labelledby="${ids.split(/\s+/).map((x) => `${lessonId}-${x}`).join(' ')}"`)
      .replace(/<svg\b/, '<svg class="diagram-svg" focusable="false"');
    svg = svg.replace(/(<svg[^>]*>)/, `$1<defs><marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="d-arrowhead"/></marker></defs>`);
    ctx.figures += 1;
    return `<figure class="diagram">${svg}<figcaption>${md.renderInline(f.caption)}</figcaption></figure>`;
  });
  return html;
}

const inline = (md, s) => (s == null ? '' : md.renderInline(String(s)));
const block = (md, s) => (s == null ? '' : md.render(String(s)));
const words = (text) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const plain = (html) => html.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');

function renderQuiz(md, quiz = []) {
  return quiz.map((q) => ({
    q: q.q.includes('\n') ? block(md, q.q) : `<p>${inline(md, q.q)}</p>`,
    options: q.options.map((o) => ({ text: inline(md, o.text), why: inline(md, o.why) })),
    answer: q.answer,
  }));
}

function splitLesson(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] };
}
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
// CONTENT_VERSION (the ?v= on every /content, /data and /playground URL) is
// a hash of exactly what is served there, so any change to a lesson,
// exercise, assessment, glossary, dataset or the renderer busts the
// immutable HTTP cache and the service worker's content cache.
const hash = createHash('sha256');
const write = (file, data) => {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
  if (file.startsWith(OUT_PUBLIC)) hash.update(relative(OUT_PUBLIC, file)).update('\0').update(text);
};

// ── Gather ──
rmSync(OUT_PUBLIC, { recursive: true, force: true });
const courseIds = new Set();
const lessonCourse = new Map();
const included = [];
for (const c of plan.courses) {
  const dir = join(CONTENT, c.id);
  if (!existsSync(join(dir, 'course.json')) || !existsSync(join(dir, 'course.en.json'))) {
    fail(`${c.id}: course.json / course.en.json missing`);
    continue;
  }
  const struct = readJson(join(dir, 'course.json'));
  const lessons = struct.sections.flatMap((s) => s.lessons);
  const missingEn = lessons.filter((l) => !existsSync(join(dir, 'lessons', `${l.id}.en.md`)));
  if (missingEn.length && !PARTIAL) {
    fail(`${c.id}: ${missingEn.length} English lesson(s) missing — course skipped`);
    continue;
  }
  courseIds.add(c.id);
  lessons.forEach((l) => lessonCourse.set(l.id, c.id));
  included.push({ plan: c, struct, dir });
}

const structure = [];
// text.<lang>.js: what every page shows — course titles and taglines, paths,
// testimonials, instructor names. outline.<lang>.js: section and lesson
// titles (pages that list lessons). details.<lang>.js: course descriptions,
// reviews, instructor bios, the placement quiz (the few pages that show them).
const text = { en: { courses: {}, catalog: {} }, ar: { courses: {}, catalog: {} } };
const outline = { en: { courses: {} }, ar: { courses: {} } };
const details = { en: { courses: {}, catalog: {} }, ar: { courses: {}, catalog: {} } };
const search = { en: [], ar: [] };
const glossaryAll = { en: [], ar: [] };
const totals = { lessons: 0, words: { en: 0, ar: 0 }, quiz: 0, exercises: 0, figures: 0, runnable: 0, terms: 0, checkpointQs: 0, finalQs: 0, fallbacks: 0 };

for (const { plan: c, struct, dir } of included) {
  const t = { en: readJson(join(dir, 'course.en.json')) };
  t.ar = existsSync(join(dir, 'course.ar.json')) ? readJson(join(dir, 'course.ar.json')) : (fail(`${c.id}: course.ar.json missing (English used)`), t.en);
  const exDir = join(dir, 'exercises');
  const sections = [];
  for (const s of struct.sections) {
    const lessons = [];
    for (const l of s.lessons) {
      const exFile = join(exDir, `${l.id}.json`);
      const ex = existsSync(exFile) ? readJson(exFile) : null;
      const entry = { id: l.id, minutes: l.minutes };
      if (ex) entry.ex = ex.kind === 'web' ? `web:${ex.mode}` : ex.kind;
      lessons.push(entry);
    }
    sections.push({ id: s.id, lessons });
  }

  for (const lang of LANGS) {
    const T = t[lang];
    text[lang].courses[c.id] = { title: T.title, tagline: T.tagline };
    outline[lang].courses[c.id] = { sections: T.sections, lessons: T.lessons };
    details[lang].courses[c.id] = { description: T.description, audience: T.audience, prerequisites: T.prerequisites, learnItems: T.learnItems };
    search[lang].push({ type: 'course', id: c.id, title: T.title, text: T.tagline });
  }

  const flat = struct.sections.flatMap((s) => s.lessons.map((l) => ({ ...l, section: s.id })));
  const lessonMeta = {};
  for (const lang of LANGS) {
    for (const l of flat) {
      const file = join(dir, 'lessons', `${l.id}.${lang}.md`);
      if (PARTIAL && !existsSync(join(dir, 'lessons', `${l.id}.en.md`))) continue;
      let srcLang = lang;
      let src;
      if (existsSync(file)) src = readFileSync(file, 'utf8');
      else {
        fail(`${l.id}.${lang}.md missing${lang === 'ar' ? ' (English used)' : ''}`);
        src = readFileSync(join(dir, 'lessons', `${l.id}.en.md`), 'utf8');
        srcLang = 'en';
        totals.fallbacks += 1;
      }
      hash.update(src);
      let parsed;
      try {
        parsed = splitLesson(src);
      } catch (e) {
        fail(`${l.id}.${lang}.md: ${e.message.split('\n')[0]}`);
        if (lang === 'en' || STRICT) continue;
        // A translation mid-edit: show the English lesson until it parses.
        src = readFileSync(join(dir, 'lessons', `${l.id}.en.md`), 'utf8');
        srcLang = 'en';
        parsed = splitLesson(src);
      }
      if (!parsed) {
        fail(`${l.id}.${lang}.md: no front matter`);
        continue;
      }
      const ctx = { toc: [], codeLangs: new Set(), runnable: [], figures: 0, errors: [], lessonCourse, courseIds };
      const html = renderLesson(parsed.body, srcLang, ctx, l.id);
      ctx.errors.forEach((e) => fail(`${l.id}.${lang}: ${e}`));
      const md = makeMd(srcLang, { toc: [], codeLangs: new Set(), runnable: [], errors: [], lessonCourse, courseIds });
      const n = words(plain(html));
      totals.words[lang] += n;
      if (lang === 'en') {
        totals.lessons += 1;
        totals.quiz += parsed.data.quiz?.length ?? 0;
        totals.figures += ctx.figures;
        totals.runnable += ctx.runnable.length;
        lessonMeta[l.id] = { words: n, code: ctx.codeLangs.size > 0 };
      }
      // The exercise: language-neutral code + this language's text.
      let exercise = null;
      const exFile = join(exDir, `${l.id}.json`);
      if (existsSync(exFile)) {
        const neutral = readJson(exFile);
        const tf = join(exDir, `${l.id}.${lang}.json`);
        const textFile = existsSync(tf) ? tf : join(exDir, `${l.id}.en.json`);
        if (!existsSync(tf)) fail(`${l.id}.${lang}: exercise text missing${lang === 'ar' ? ' (English used)' : ''}`);
        if (existsSync(textFile)) {
          const et = readJson(textFile);
          const exMd = makeMd(existsSync(tf) ? lang : 'en', { toc: [], codeLangs: new Set(), runnable: [], errors: [], lessonCourse, courseIds });
          exercise = {
            ...neutral,
            title: et.title,
            prompt: block(exMd, et.prompt),
            hints: (et.hints ?? []).map((h) => inline(exMd, h)),
            explanation: block(exMd, et.explanation),
            checkLabels: Object.fromEntries(Object.entries(et.checks ?? {}).map(([k, v]) => [k, inline(exMd, v)])),
            itemText: et.items ? Object.fromEntries(Object.entries(et.items).map(([k, v]) => [k, inline(exMd, v)])) : undefined,
            optionText: et.options ? Object.fromEntries(Object.entries(et.options).map(([k, v]) => [k, { text: inline(exMd, v.text), why: inline(exMd, v.why) }])) : undefined,
          };
          if (lang === 'en') totals.exercises += 1;
        }
      }
      const readMinutes = Math.max(3, Math.round(n / (lang === 'ar' ? 170 : 210)));
      write(join(OUT_PUBLIC, lang, 'lessons', `${l.id}.json`), {
        id: l.id,
        courseId: c.id,
        lang: srcLang,
        kind: parsed.data.kind ?? 'lesson',
        summary: inline(md, parsed.data.summary),
        html,
        toc: ctx.toc,
        takeaways: (parsed.data.takeaways ?? []).map((x) => inline(md, x)),
        further: (parsed.data.further ?? []).map((x) => ({ title: x.title, url: x.url })),
        quiz: renderQuiz(md, parsed.data.quiz),
        exercise,
        words: n,
        readMinutes,
      });
      search[lang].push({ type: 'lesson', id: l.id, course: c.id, title: t[lang].lessons?.[l.id] ?? t.en.lessons[l.id], text: String(parsed.data.summary ?? '').replace(/`/g, ''), h: ctx.toc.map((x) => x.text).join(' · ') });
    }
  }

  // Assessments + glossary per course.
  for (const lang of LANGS) {
    const af = join(dir, `assessments.${lang}.yaml`);
    const gf = join(dir, `glossary.${lang}.json`);
    const aFile = existsSync(af) ? af : join(dir, 'assessments.en.yaml');
    const gFile = existsSync(gf) ? gf : join(dir, 'glossary.en.json');
    if (!existsSync(af)) fail(`${c.id}: assessments.${lang}.yaml missing`);
    if (!existsSync(gf)) fail(`${c.id}: glossary.${lang}.json missing`);
    const md = makeMd(existsSync(af) ? lang : 'en', { toc: [], codeLangs: new Set(), runnable: [], errors: [], lessonCourse, courseIds });
    let a = { checkpoints: {}, final: [] };
    try {
      if (existsSync(aFile)) a = YAML.parse(readFileSync(aFile, 'utf8')) ?? a;
    } catch (e) {
      fail(`${c.id}: assessments.${lang}.yaml: ${e.message.split('\n')[0]}`);
    }
    const g = existsSync(gFile) ? readJson(gFile) : [];
    const gmd = makeMd(existsSync(gf) ? lang : 'en', { toc: [], codeLangs: new Set(), runnable: [], errors: [], lessonCourse, courseIds });
    const glossary = g.map((x) => ({ id: x.id, term: x.term, definition: inline(gmd, x.definition), lesson: x.lesson }));
    write(join(OUT_PUBLIC, lang, 'courses', `${c.id}.json`), {
      checkpoints: Object.fromEntries(Object.entries(a.checkpoints ?? {}).map(([k, v]) => [k, renderQuiz(md, v)])),
      final: renderQuiz(md, a.final ?? []),
      glossary,
    });
    if (lang === 'en') {
      totals.terms += g.length;
      totals.checkpointQs += Object.values(a.checkpoints ?? {}).reduce((s, v) => s + v.length, 0);
      totals.finalQs += (a.final ?? []).length;
    }
    for (const x of glossary) {
      glossaryAll[lang].push({ ...x, course: c.id });
      search[lang].push({ type: 'term', id: x.id, course: c.id, title: x.term, text: plain(x.definition).replace(/\s+/g, ' ').trim().slice(0, 160) });
    }
  }

  structure.push({ id: c.id, abbrev: c.abbrev, engines: c.engines, project: struct.project, sections, words: lessonMeta, glossary: existsSync(join(dir, 'glossary.en.json')) ? readJson(join(dir, 'glossary.en.json')).map((x) => [x.id, x.lesson]) : [], checkpoints: struct.sections.map((s) => s.id) });
}

// ── Catalog copy (instructors, reviews, testimonials, paths, placement) ──
const CAT = join(CONTENT, 'catalog');
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'ar' in v) ? (v[lang] ?? v.en) : v);
const localize = (value, lang) => {
  if (Array.isArray(value)) return value.map((x) => localize(x, lang));
  if (value && typeof value === 'object') {
    if ('en' in value && Object.keys(value).every((k) => k === 'en' || k === 'ar')) return pick(value, lang);
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(v, lang)]));
  }
  return value;
};
for (const name of ['instructors', 'reviews', 'testimonials', 'paths', 'placement']) {
  const f = join(CAT, `${name}.json`);
  if (!existsSync(f)) {
    fail(`catalog/${name}.json missing`);
    continue;
  }
  const raw = readJson(f);
  hash.update(JSON.stringify(raw));
  for (const lang of LANGS) {
    const value = localize(raw, lang);
    if (name === 'instructors') {
      text[lang].catalog.instructors = value.map(({ id, name: n, nameAr, role, company, quote }) => ({ id, name: n, nameAr, role, company, quote }));
      details[lang].catalog.instructors = value;
    } else if (name === 'reviews' || name === 'placement') details[lang].catalog[name] = value;
    else text[lang].catalog[name] = value;
  }
}
for (const lang of LANGS) for (const p of text[lang].catalog.paths ?? []) search[lang].push({ type: 'path', id: p.id, title: p.title, text: p.tagline });

for (const lang of LANGS) {
  write(join(OUT_PUBLIC, lang, 'glossary.json'), glossaryAll[lang]);
  write(join(OUT_PUBLIC, lang, 'search.json'), search[lang]);
}

// Sample data for the SQL and Python exercises.
const DATA = join(ROOT, 'public', 'data');
rmSync(DATA, { recursive: true, force: true });
mkdirSync(join(DATA, 'csv'), { recursive: true });
cpSync(join(CONTENT, 'data', 'shop.sqlite'), join(DATA, 'shop.sqlite'));
for (const f of readdirSync(join(CONTENT, 'data', 'csv'))) cpSync(join(CONTENT, 'data', 'csv', f), join(DATA, 'csv', f));

// The playground runtime (React as globals, TypeScript libs).
if (!existsSync(join(ROOT, 'public', 'playground', 'react-runtime.js')) || process.env.CONTENT_RUNTIME === '1' || STRICT) execFileSync(process.execPath, [join(ROOT, 'scripts', 'content', 'build-runtime.mjs')], { stdio: 'inherit' });

for (const f of [join(DATA, 'shop.sqlite'), ...readdirSync(join(DATA, 'csv')).sort().map((f) => join(DATA, 'csv', f)), join(ROOT, 'public', 'playground', 'react-runtime.js'), join(ROOT, 'public', 'playground', 'ts-libs.json')]) {
  if (existsSync(f)) hash.update(relative(ROOT, f)).update('\0').update(readFileSync(f));
}

const version = hash.digest('hex').slice(0, 10);
mkdirSync(OUT_SRC, { recursive: true });
write(join(OUT_SRC, 'version.js'), `// Generated by scripts/content/build.mjs — do not edit.\nexport const CONTENT_VERSION = ${JSON.stringify(version)};\n`);
write(join(OUT_SRC, 'structure.js'), `// Generated by scripts/content/build.mjs — do not edit.\nexport { CONTENT_VERSION } from './version.js';\nexport const STRUCTURE = ${JSON.stringify(structure)};\nexport const TOTALS = ${JSON.stringify({ courses: structure.length, lessons: totals.lessons, exercises: totals.exercises, quiz: totals.quiz + totals.checkpointQs + totals.finalQs, terms: totals.terms })};\n`);
for (const lang of LANGS) {
  write(join(OUT_SRC, `text.${lang}.js`), `// Generated by scripts/content/build.mjs — do not edit.\nexport default ${JSON.stringify(text[lang])};\n`);
  write(join(OUT_SRC, `outline.${lang}.js`), `// Generated by scripts/content/build.mjs — do not edit.\nexport default ${JSON.stringify(outline[lang])};\n`);
  write(join(OUT_SRC, `details.${lang}.js`), `// Generated by scripts/content/build.mjs — do not edit.\nexport default ${JSON.stringify(details[lang])};\n`);
}

write(join(ROOT, '.content-stats.json'), JSON.stringify({ version, ...totals }, null, 2));
console.log(`[content] ${structure.length} courses, ${totals.lessons} lessons, ${totals.words.en.toLocaleString()} EN / ${totals.words.ar.toLocaleString()} AR words, ${totals.quiz} lesson quiz + ${totals.checkpointQs} checkpoint + ${totals.finalQs} final questions, ${totals.exercises} exercises, ${totals.terms} terms, ${totals.figures} diagrams, ${totals.runnable} runnable blocks — v${version} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
if (warnings.length) console.log(`[content] ${warnings.length} warning(s) (lenient build): ${warnings.slice(0, 6).join('; ')}${warnings.length > 6 ? '; …' : ''}`);
