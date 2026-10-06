// Content integrity: fails the build (npm test, in npm run verify) if the
// course content slips. Run after `npm run content`.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import { describe, expect, test } from 'vitest';
import YAML from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT = join(ROOT, 'content');
const PUBLIC = join(ROOT, 'public', 'content');
const plan = JSON.parse(readFileSync(join(CONTENT, 'plan.json'), 'utf8'));
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

// PRD §8, verbatim: id → [sections, lessons, minutes].
const PRD = {
  'react-fundamentals': [4, 18, 320],
  'advanced-typescript': [5, 22, 405],
  'css-mastery': [4, 20, 350],
  'python-data-analysis': [5, 24, 430],
  'sql-for-analysts': [4, 16, 270],
  'figma-ui-design': [4, 17, 295],
  'design-systems': [5, 19, 365],
  'react-native-apps': [5, 21, 390],
  'swift-essentials': [4, 15, 255],
  'docker-kubernetes': [5, 20, 380],
  'aws-cloud-foundations': [4, 14, 230],
  'ml-crash-course': [5, 23, 445],
};

describe('course inventory', () => {
  test('16+ courses and 300+ lessons are planned and written', () => {
    expect(plan.courses.length).toBeGreaterThanOrEqual(16);
    const lessons = plan.courses.reduce((n, c) => n + readJson(join(CONTENT, c.id, 'course.json')).sections.flatMap((s) => s.lessons).length, 0);
    expect(lessons).toBeGreaterThanOrEqual(300);
  });
  test.each(Object.entries(PRD))('%s matches PRD §8 exactly', (id, [sections, lessons, minutes]) => {
    const c = readJson(join(CONTENT, id, 'course.json'));
    const all = c.sections.flatMap((s) => s.lessons);
    expect(c.sections.length).toBe(sections);
    expect(all.length).toBe(lessons);
    expect(all.reduce((s, l) => s + l.minutes, 0)).toBe(minutes);
  });
  test('React Fundamentals keeps the canonical curriculum (PRD §5.3)', () => {
    const c = readJson(join(CONTENT, 'react-fundamentals', 'course.json'));
    const t = readJson(join(CONTENT, 'react-fundamentals', 'course.en.json'));
    plan.canonical['react-fundamentals'].forEach((s, si) => {
      expect(t.sections[c.sections[si].id]).toBe(s.title);
      s.lessons.forEach(([title, minutes], li) => {
        const l = c.sections[si].lessons[li];
        expect([t.lessons[l.id], l.minutes]).toEqual([title, minutes]);
      });
    });
  });
});

describe('every rule in docs/CONTENT-GUIDE.md (scripts/content/validate.mjs, strict, both languages)', () => {
  test('the validator passes with no errors', () => {
    const run = () => {
      try {
        return execFileSync(process.execPath, [join(ROOT, 'scripts', 'content', 'validate.mjs'), '--no-run'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      } catch (e) {
        return String(e.stdout);
      }
    };
    const out = run();
    expect(out, out.split('\n').slice(0, 40).join('\n')).toMatch(/ 0 error\(s\)/);
  }, 120_000);
});

const builtLessons = (lang) => (existsSync(join(PUBLIC, lang, 'lessons')) ? readdirSync(join(PUBLIC, lang, 'lessons')).map((f) => readJson(join(PUBLIC, lang, 'lessons', f))) : []);
const knownPaths = (() => {
  const set = new Set(['/', '/courses', '/learning', '/review', '/notes', '/stats', '/paths', '/placement', '/glossary', '/instructors', '/privacy']);
  for (const c of plan.courses) {
    set.add(`/courses/${c.id}`);
    const s = readJson(join(CONTENT, c.id, 'course.json'));
    for (const sec of s.sections) for (const l of sec.lessons) set.add(`/lesson/${c.id}/${l.id}`);
  }
  return set;
})();

describe('built lessons', () => {
  test.each(['en', 'ar'])('every lesson is built in %s with a body and a quiz with explanations', (lang) => {
    const lessons = builtLessons(lang);
    expect(lessons.length).toBeGreaterThanOrEqual(300);
    for (const l of lessons) {
      expect(l.words, l.id).toBeGreaterThan(l.kind === 'lesson' ? 380 : 250);
      expect(l.quiz.length, l.id).toBeGreaterThanOrEqual(3);
      for (const q of l.quiz) for (const o of q.options) expect(o.why.length, l.id).toBeGreaterThan(10);
      if (lang === 'ar') expect(l.lang, `${l.id} is still in English`).toBe('ar');
    }
  });
  test('no TODO, lorem or placeholder text anywhere in the shipped content', () => {
    // TODO/TBD/FIXME in capitals only (a GitHub board's "Todo" column is real content).
    const bannedTest = (text) => /\b(TODO|TBD|FIXME)\b/.test(text) || /\b(lorem|ipsum)\b|coming soon|placeholder text|محتوى تجريبي/i.test(text);
    for (const lang of ['en', 'ar']) {
      for (const file of ['search.json', 'glossary.json']) expect(bannedTest(readFileSync(join(PUBLIC, lang, file), 'utf8')), `${lang}/${file}`).toBe(false);
      for (const l of builtLessons(lang)) {
        const text = JSON.stringify({ ...l, html: l.html.replace(/<pre[\s\S]*?<\/pre>/g, '') });
        expect(bannedTest(text), `${lang} ${l.id}`).toBe(false);
      }
    }
  });
  test('every internal link resolves to a real page', () => {
    for (const lang of ['en', 'ar']) {
      for (const l of builtLessons(lang)) {
        for (const [, href] of l.html.matchAll(/href="(\/[^"#?]*)/g)) {
          const path = lang === 'ar' ? href.replace(/^\/ar(?=\/|$)/, '') || '/' : href;
          expect(knownPaths.has(path), `${lang} ${l.id} → ${href}`).toBe(true);
        }
      }
    }
  });
  test('further reading links are https on official docs', () => {
    for (const l of builtLessons('en')) for (const f of l.further) expect(f.url, l.id).toMatch(/^https:\/\//);
  });
});

describe('practice', () => {
  test('every SQL solution and every sql run block runs against the sample database', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database(readFileSync(join(CONTENT, 'data', 'shop.sqlite')));
    let n = 0;
    for (const c of plan.courses) {
      const dir = join(CONTENT, c.id, 'exercises');
      if (existsSync(dir)) {
        for (const f of readdirSync(dir).filter((x) => /^l-[\w-]+\.json$/.test(x))) {
          const ex = readJson(join(dir, f));
          if (ex.kind !== 'sql') continue;
          const res = db.exec(ex.solution);
          expect(res.at(-1)?.values.length, `${c.id}/${f}`).toBeGreaterThan(0);
          n += 1;
        }
      }
      const ldir = join(CONTENT, c.id, 'lessons');
      for (const f of readdirSync(ldir).filter((x) => x.endsWith('.en.md'))) {
        for (const [, code] of readFileSync(join(ldir, f), 'utf8').matchAll(/```sql run\n([\s\S]*?)```/g)) {
          expect(() => db.exec(code), `${c.id}/${f}`).not.toThrow();
          n += 1;
        }
      }
    }
    expect(n).toBeGreaterThan(50);
  });
  test('every course has hands-on practice in every section', () => {
    for (const c of plan.courses) {
      const s = readJson(join(CONTENT, c.id, 'course.json'));
      for (const sec of s.sections) expect(sec.lessons.some((l) => existsSync(join(CONTENT, c.id, 'exercises', `${l.id}.json`))), `${c.id} ${sec.id}`).toBe(true);
    }
  });
  test('every checkpoint has 5 questions and every final 12, in both languages', () => {
    for (const c of plan.courses) {
      for (const lang of ['en', 'ar']) {
        const a = YAML.parse(readFileSync(join(CONTENT, c.id, `assessments.${lang}.yaml`), 'utf8'));
        expect(a.final.length, `${c.id} ${lang}`).toBe(12);
        for (const qs of Object.values(a.checkpoints)) expect(qs.length).toBe(5);
      }
    }
  });
});
