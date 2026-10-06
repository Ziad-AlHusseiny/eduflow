// Prerendering (scripts/prerender.mjs): every page, once per language,
// rendered to static HTML. Lazy pages and content are awaited, so the HTML
// is complete — every lesson, in full, in both languages.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';
import { courses, findLesson, getCourse } from './data/courses.js';
import detailsAr from './generated/details.ar.js';
import detailsEn from './generated/details.en.js';
import outlineAr from './generated/outline.ar.js';
import outlineEn from './generated/outline.en.js';
import textAr from './generated/text.ar.js';
import textEn from './generated/text.en.js';
import ar from './i18n/ar.js';
import en from './i18n/en.js';
import { catalogText, courseText, lessonTitle, registerContent, sectionTitle } from './i18n/content.js';
import { registerDictionary, t } from './i18n/index.js';
import { LOCALES, localizedPath, setActiveLocale } from './i18n/state.js';
import { peekResource, seedResource } from './lib/resources.js';
import { pageOf, resourcesFor } from './routes.js';

registerDictionary('en', en);
registerDictionary('ar', ar);
for (const [kind, en_, ar_] of [['text', textEn, textAr], ['outline', outlineEn, outlineAr], ['details', detailsEn, detailsAr]]) {
  registerContent(kind, 'en', en_);
  registerContent(kind, 'ar', ar_);
}

const PUBLIC = join(process.cwd(), 'public');

/** Every page to prerender (in-app paths), plus the 404 fallback. */
export function allPaths() {
  const paths = ['/', '/courses', '/learning', '/review', '/notes', '/stats', '/paths', '/placement', '/glossary', '/instructors', '/privacy'];
  for (const c of courses) {
    paths.push(`/courses/${c.id}`, `/courses/${c.id}/final`, `/courses/${c.id}/certificate`);
    for (const s of c.sections) paths.push(`/courses/${c.id}/checkpoint/${s.id}`);
    // (A lesson still being written — development builds only — has no page yet.)
    for (const l of c.lessons) if (existsSync(join(PUBLIC, 'content', 'en', 'lessons', `${l.id}.json`))) paths.push(`/lesson/${c.id}/${l.id}`);
  }
  for (const p of catalogText('paths') ?? []) paths.push(`/paths/${p.id}`);
  for (const i of catalogText('instructors') ?? []) paths.push(`/instructors/${i.id}`);
  return paths;
}
export const notFoundPath = '/404';
export const locales = Object.keys(LOCALES);

function seed(path, locale) {
  for (const url of resourcesFor(path, locale)) {
    if (peekResource(url)) continue;
    seedResource(url, JSON.parse(readFileSync(join(PUBLIC, url.split('?')[0]), 'utf8')));
  }
}

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function metaFor(path, locale) {
  const page = pageOf(path);
  const parts = path.split('/');
  const site = t('meta.siteName');
  const base = { title: t('meta.title'), description: t('meta.description'), image: '/og.jpg' };
  if (page === 'course' || page === 'assessment' || page === 'certificate') {
    const c = getCourse(parts[2]);
    if (!c) return { ...base, title: t('meta.notFound') };
    const ct = courseText(c.id);
    if (page === 'course') return { title: `${ct.title} · ${site}`, description: ct.tagline, image: `/og/${c.id}.jpg` };
    if (page === 'certificate') return { title: `${t('certificate.title')} · ${ct.title} · ${site}`, description: ct.tagline, image: `/og/${c.id}.jpg` };
    const section = parts[3] === 'checkpoint' ? sectionTitle(c.id, parts[4]) : null;
    return { title: `${section ? t('assessment.checkpointTitle', { section }) : t('assessment.finalTitle')} · ${ct.title} · ${site}`, description: ct.tagline, image: `/og/${c.id}.jpg` };
  }
  if (page === 'lesson') {
    const found = findLesson(parts[3]);
    if (!found) return { ...base, title: t('meta.notFound') };
    const lesson = peekResource(resourcesFor(path, locale)[0]);
    return { title: `${lessonTitle(found.course.id, found.lesson.id)} · ${courseText(found.course.id).title} · ${site}`, description: strip(lesson?.summary) || courseText(found.course.id).tagline, image: `/og/${found.course.id}.jpg` };
  }
  if (page === 'path') {
    const p = (catalogText('paths') ?? []).find((x) => x.id === parts[2]);
    if (p) return { ...base, title: `${p.title} · ${site}`, description: p.tagline };
  }
  if (page === 'instructor') {
    const i = (catalogText('instructors') ?? []).find((x) => x.id === parts[2]);
    if (i) return { ...base, title: `${locale === 'ar' ? i.nameAr : i.name} · ${site}`, description: `${i.role} · ${i.company}` };
  }
  if (page === 'home') return base;
  return { ...base, title: `${t(`meta.pages.${page}`)} · ${site}` };
}

export async function render(locale, path) {
  setActiveLocale(locale);
  if (path !== notFoundPath) seed(path, locale);
  const base = LOCALES[locale].base;
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={localizedPath(path, locale)} basename={base || undefined}>
      <App />
    </StaticRouter>,
    // Never outline a big Suspense boundary behind an inline reveal script:
    // every page must be complete, in place, in the static HTML.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  );
  let html = '';
  for await (const chunk of prelude) html += chunk;
  return { html, lang: locale, dir: LOCALES[locale].dir, page: pageOf(path), resources: path === notFoundPath ? [] : resourcesFor(path, locale), ...metaFor(path, locale) };
}

export { HERO_SIZES, heroImage } from './data/images.js';
