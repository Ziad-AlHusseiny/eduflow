// README screenshots, step 1 of 3: raw 2x captures of the production build.
// Serves dist/ itself (run `npm run build` first) and writes PNGs to
// .cache/shots/raw/. Then frame.mjs and tour.mjs turn them into the
// images in docs/screenshots/. All three: `npm run shots`.
//
//   node scripts/readme-shots/capture.mjs [name …]   (only some shots)

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const OUT = '.cache/shots/raw/';
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const server = spawn(process.execPath, ['scripts/serve.mjs', String(PORT)], { stdio: 'ignore' });
for (let i = 0; i < 50; i++) {
  if (await fetch(BASE).then(() => true, () => false)) break;
  await new Promise((r) => setTimeout(r, 100));
}

const pad = (n) => String(n).padStart(2, '0');
const day = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ago = (n, h = 20) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 15, 0, 0);
  return d;
};
const ids = (abbrev, sections) => sections.flatMap((n, s) => Array.from({ length: n }, (_, l) => `l-${abbrev}-${s + 1}-${l + 1}`));
const RF = ids('rf', [4, 5, 5, 4]);
const JS = ids('js', [4, 4, 4, 5, 5]);
const CSS = ids('css', [5, 5, 5, 5]);
const SQL = ids('sql', [4, 4, 4, 4]);
const PDA = ids('pda', [4, 4, 5, 5, 4]);

function learner() {
  const completed = { 'javascript-fundamentals': JS, 'react-fundamentals': RF, 'css-mastery': CSS.slice(0, 12), 'sql-for-analysts': SQL.slice(0, 9), 'python-data-analysis': PDA.slice(0, 6) };
  const all = Object.values(completed).flat();
  const events = [];
  const activity = new Set();
  all.forEach((id, i) => {
    const d = ago(Math.max(0, 70 - Math.round(i * 1.05)), [7, 13, 19, 21, 22, 23][i % 6]);
    events.push(['lesson', id, d.toISOString()], ['quiz', id, d.toISOString()]);
    if (i % 2) events.push(['exercise', id, d.toISOString()]);
    activity.add(day(d));
  });
  for (let i = 0; i < 13; i++) activity.add(day(ago(i)));
  const time = {};
  for (const d of activity) time[d] = 900 + ((d.charCodeAt(9) * 37) % 2400);
  const lessons = Object.fromEntries(all.map((id, i) => [id, { best: i % 5 === 0 ? 3 : 4, total: 4, attempts: 1, at: ago(10).toISOString() }]));
  const exercises = Object.fromEntries(all.filter((_, i) => i % 2).map((id) => [id, { solvedAt: ago(20).toISOString(), attempts: 2, revealed: false }]));
  const cards = {};
  ['jsx', 'props', 'state', 'component', 'hook', 'key', 'effect', 'controlled-input'].forEach((t, i) => (cards[`react-fundamentals:${t}`] = { box: 1 + (i % 5), due: day(ago(i % 3 === 0 ? 0 : -2)), reviews: 2 + i, lapses: i % 2, last: day(ago(2)) }));
  return {
    enrollments: { version: 1, enrollments: Object.fromEntries(Object.entries(completed).map(([c, l]) => [c, { enrolledAt: ago(72).toISOString(), completedLessonIds: l, lastVisitedLessonId: l.at(-1) }])), activityLog: [...activity].sort() },
    scores: { lessons, checkpoints: { 's-rf-1': { best: 5, total: 5, attempts: 1, at: null }, 's-rf-2': { best: 4, total: 5, attempts: 1, at: null } }, finals: { 'react-fundamentals': { best: 11, total: 12, attempts: 2, at: ago(3).toISOString(), passedAt: ago(3).toISOString() }, 'javascript-fundamentals': { best: 12, total: 12, attempts: 1, at: ago(30).toISOString(), passedAt: ago(30).toISOString() } } },
    exercises,
    events: events.sort((a, b) => a[2].localeCompare(b[2])),
    time,
    srs: { cards, days: { [day(ago(1))]: 12, [day(ago(2))]: 9, [day(ago(4))]: 15 } },
    notes: { 'l-rf-3-5': { text: 'Effects synchronise with something outside React. If it can be computed during render, it is not an effect.', at: ago(4).toISOString() } },
    settings: { textScale: 1, goalUnit: 'lessons', goalTarget: 5, autoAdvance: true, certificateName: 'Layla Haddad' },
    path: 'front-end-developer',
  };
}

const browser = await chromium.launch();
const DESKTOP = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

async function page(ctxOpts, { theme = 'light', values = learner(), locale } = {}) {
  const ctx = await browser.newContext({ ...ctxOpts, colorScheme: theme, reducedMotion: 'reduce', timezoneId: 'Africa/Cairo', locale: 'en-US', serviceWorkers: 'block' });
  const data = { ...values, theme, ...(locale ? { locale } : {}) };
  await ctx.addInitScript((d) => {
    if (sessionStorage.getItem('__seeded')) return;
    sessionStorage.setItem('__seeded', '1');
    for (const [k, v] of Object.entries(d)) localStorage.setItem(`eduflow-${k}`, JSON.stringify(v));
  }, data);
  const p = await ctx.newPage();
  p.go = async (path) => {
    await p.goto(BASE + path);
    await p.waitForFunction(() => document.documentElement.dataset.ready === location.pathname);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
  };
  return p;
}
const scrollTo = (p, sel, off = -90) => p.evaluate(([s, o]) => {
  const el = document.querySelector(s);
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + o, behavior: 'instant' });
}, [sel, off]);
const save = (p, name) => p.screenshot({ path: `${OUT}${name}.png` });
const dismiss = async (p) => {
  for (let i = 0; i < 6; i++) {
    const m = p.getByTestId('badge-modal');
    if (!(await m.waitFor({ state: 'visible', timeout: i ? 700 : 300 }).then(() => true, () => false))) return;
    await p.keyboard.press('Escape');
    await m.waitFor({ state: 'hidden' }).catch(() => {});
  }
};

const shots = {
  async home() {
    const p = await page(DESKTOP, { values: {} });
    await p.go('/');
    await save(p, 'home');
  },
  async catalog() {
    const p = await page(DESKTOP, { values: {} });
    await p.go('/courses?category=web-development&level=beginner&level=intermediate&sort=rating');
    await save(p, 'catalog');
  },
  async course() {
    const p = await page(DESKTOP);
    await p.go('/courses/css-mastery');
    await save(p, 'course');
  },
  async lesson() {
    const p = await page(DESKTOP);
    await p.go('/lesson/react-fundamentals/l-rf-3-1');
    await scrollTo(p, '[data-testid=lesson-body] .code-block', -260);
    await p.waitForTimeout(300);
    await save(p, 'lesson');
  },
  async playground() {
    const p = await page({ ...DESKTOP, viewport: { width: 1280, height: 1240 } });
    await p.go('/lesson/react-fundamentals/l-rf-3-1');
    const ex = p.getByTestId('exercise-web');
    await ex.scrollIntoViewIfNeeded();
    await ex.getByTestId('solution-button').click();
    await ex.getByRole('button', { name: 'Load it into the editor' }).click();
    await ex.getByRole('button', { name: 'Hide solution' }).click();
    await ex.getByTestId('check-button').click();
    await ex.getByTestId('solved-banner').waitFor({ timeout: 20000 });
    await dismiss(p);
    await p.waitForTimeout(1200);
    await scrollTo(p, '[data-testid=exercise-web] [data-testid=preview-frame]', -700);
    await save(p, 'playground');
  },
  async sql() {
    const p = await page({ ...DESKTOP, viewport: { width: 1280, height: 860 } });
    await p.go('/lesson/sql-for-analysts/l-sql-2-2');
    const ex = p.getByTestId('exercise-sql');
    await ex.scrollIntoViewIfNeeded();
    await ex.getByTestId('solution-button').click();
    await ex.getByTestId('run-button').click();
    await ex.getByRole('region', { name: 'Results' }).waitFor({ timeout: 20000 });
    await p.waitForTimeout(800);
    await scrollTo(p, '[data-testid=exercise-sql] [data-testid=editor-sql]', -40);
    await save(p, 'sql');
  },
  async python() {
    const solution = JSON.parse(readFileSync('content/python-data-analysis/exercises/l-pda-3-1.json', 'utf8')).solution;
    const v = learner();
    v.drafts = { 'l-pda-3-1': { files: { py: solution }, at: ago(0).toISOString() } };
    const p = await page({ ...DESKTOP, viewport: { width: 1280, height: 1100 } }, { values: v });
    await p.go('/lesson/python-data-analysis/l-pda-3-1');
    const ex = p.getByTestId('exercise-python');
    await ex.scrollIntoViewIfNeeded();
    await ex.getByTestId('check-button').click();
    await ex.getByTestId('solved-banner').waitFor({ timeout: 180000 });
    await dismiss(p);
    await p.waitForTimeout(800);
    await scrollTo(p, '[data-testid=exercise-python] [data-testid=console]', -560);
    await save(p, 'python');
  },
  async quiz() {
    const p = await page(DESKTOP);
    await p.go('/lesson/css-mastery/l-css-2-2');
    const q = p.getByTestId('quiz-question').first();
    await q.scrollIntoViewIfNeeded();
    await q.getByRole('radio').nth(1).check();
    await q.getByRole('button', { name: 'Check answer' }).click();
    await p.waitForTimeout(400);
    await scrollTo(p, '[data-testid=quiz]', -24);
    await save(p, 'quiz');
  },
  async learning() {
    const p = await page(DESKTOP);
    await p.go('/learning');
    await save(p, 'learning');
    await scrollTo(p, '#achievements', -90);
    await save(p, 'achievements');
  },
  async badge() {
    const v = learner();
    v.enrollments.enrollments['sql-for-analysts'].completedLessonIds = SQL.slice(0, 15);
    const p = await page(DESKTOP, { values: v });
    await p.go('/lesson/sql-for-analysts/l-sql-4-4');
    await p.getByTestId('mark-complete').click();
    await p.getByTestId('badge-modal').waitFor();
    await p.waitForTimeout(1000);
    await save(p, 'badge-pop');
  },
  async flashcards() {
    const p = await page(DESKTOP);
    await p.go('/review');
    await p.getByTestId('start-review').click();
    await p.getByTestId('show-answer').click();
    await p.waitForTimeout(800);
    await save(p, 'flashcards');
  },
  async certificate() {
    const p = await page(DESKTOP);
    await p.go('/courses/react-fundamentals/certificate');
    await dismiss(p);
    await scrollTo(p, 'figure', -96);
    await save(p, 'certificate');
  },
  async stats() {
    const p = await page(DESKTOP);
    await p.go('/stats');
    await save(p, 'stats');
  },
  async palette() {
    const p = await page(DESKTOP);
    await p.go('/courses');
    await p.keyboard.press('Control+k');
    await p.getByTestId('palette-input').fill('useEffect');
    await p.waitForTimeout(900);
    await save(p, 'palette');
  },
  async paths() {
    const p = await page(DESKTOP);
    await p.go('/paths/front-end-developer');
    await save(p, 'path');
  },
  async arabic() {
    const p = await page(DESKTOP, { locale: 'ar' });
    await p.go('/ar/lesson/react-fundamentals/l-rf-2-2');
    await save(p, 'arabic-lesson');
    const h = await page(DESKTOP, { locale: 'ar', values: {} });
    await h.go('/ar');
    await save(h, 'arabic-home');
  },
  async dark() {
    const p = await page(DESKTOP, { theme: 'dark' });
    await p.go('/lesson/javascript-fundamentals/l-js-3-1');
    await scrollTo(p, '[data-testid=lesson-body] .code-block', -200);
    await save(p, 'dark-lesson');
    const l = await page(DESKTOP, { theme: 'dark' });
    await l.go('/learning');
    await save(l, 'dark-learning');
    const h = await page(DESKTOP, { theme: 'dark', values: {} });
    await h.go('/');
    await save(h, 'dark-home');
  },
  async mobile() {
    const a = await page(PHONE);
    await a.go('/lesson/css-mastery/l-css-2-3');
    await scrollTo(a, '[data-testid=lesson-body] .code-block', -160);
    await save(a, 'phone-lesson');
    const b = await page(PHONE);
    await b.go('/learning');
    await save(b, 'phone-learning');
    const c = await page(PHONE, { values: {} });
    await c.go('/');
    await save(c, 'phone-home');
    const d = await page(PHONE);
    await d.go('/review');
    await d.getByTestId('start-review').click();
    await d.getByTestId('show-answer').click();
    await d.waitForTimeout(800);
    await save(d, 'phone-flashcards');
    const e = await page(PHONE, { locale: 'ar' });
    await e.go('/ar/learning');
    await save(e, 'phone-arabic');
  },
};

for (const [name, fn] of Object.entries(shots)) {
  if (only.length && !only.includes(name)) continue;
  const t = Date.now();
  try {
    await fn();
    console.log(`✓ ${name} (${((Date.now() - t) / 1000).toFixed(1)}s)`);
  } catch (e) {
    console.log(`✖ ${name}: ${e.message.split('\n')[0]}`);
  }
}
await browser.close();
server.kill();
