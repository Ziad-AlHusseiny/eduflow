// Notes export: every note as Markdown, grouped by course.
import { findLesson } from '../data/courses.js';
import { courseText, lessonTitle } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { formatDate } from './format.js';

/** Every note as Markdown, grouped by course in course order. */
export function notesToMarkdown(notes, now = new Date()) {
  const rows = Object.entries(notes)
    .map(([id, n]) => ({ id, n, found: findLesson(id) }))
    .filter((r) => r.found)
    .sort((a, b) => a.found.course.id.localeCompare(b.found.course.id) || a.found.course.lessons.indexOf(a.found.lesson) - b.found.course.lessons.indexOf(b.found.lesson));
  let md = `# ${t('notes.exportHeading')}\n\n_${formatDate(now.toISOString())}_\n`;
  let course = null;
  for (const r of rows) {
    if (r.found.course.id !== course) {
      course = r.found.course.id;
      md += `\n## ${courseText(course).title}\n`;
    }
    md += `\n### ${lessonTitle(course, r.id)}\n\n${r.n.text.trim()}\n`;
  }
  return md;
}

