import { Bookmark, Download, NotebookPen, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { findLesson } from '../data/courses.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useHydrated } from '../hooks/useMedia.js';
import { useStored } from '../hooks/useStored.js';
import { courseText, lessonTitle, useOutline } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { downloadFile } from '../lib/backup.js';
import { formatDate } from '../lib/format.js';
import { saveNote, toggleBookmark } from '../lib/learning.js';
import { notesToMarkdown } from '../lib/notes.js';
import { bookmarksStore, notesStore } from '../lib/stores.js';
import { toast } from '../lib/toast.js';

/** Notes & bookmarks: searchable, exportable as Markdown, all on this device. */
export default function NotesPage() {
  useOutline();
  useDocumentTitle(`${t('meta.pages.notes')} · EduFlow`);
  const hydrated = useHydrated();
  const [notes] = useStored(notesStore);
  const [bookmarks] = useStored(bookmarksStore);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return Object.entries(notes)
      .map(([id, n]) => ({ id, ...n, found: findLesson(id) }))
      .filter((x) => x.found)
      .filter((x) => !needle || x.text.toLocaleLowerCase().includes(needle) || lessonTitle(x.found.course.id, x.id).toLocaleLowerCase().includes(needle))
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [notes, q]);
  const marks = Object.entries(bookmarks).filter(([id]) => findLesson(id)).sort((a, b) => b[1].localeCompare(a[1]));
  const total = Object.keys(notes).filter((id) => findLesson(id)).length;

  return (
    <div className="container-page pt-10 pb-12 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('notes.title')}</h1>
      <p className="type-body-lg mt-2 text-ink-muted">{t('notes.subtitle')}</p>
      {hydrated && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section aria-labelledby="notes-list-title">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="notes-list-title" className="type-h3 me-auto text-ink">
                {t('notes.count', { count: total })}
              </h2>
              <Button variant="secondary" size="sm" icon={Download} disabled={!total} onClick={() => downloadFile('eduflow-notes.md', notesToMarkdown(notes), 'text/markdown')} data-testid="export-notes">
                {t('notes.export')}
              </Button>
            </div>
            {total > 0 && (
              <div className="relative mt-4">
                <Search aria-hidden="true" size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('notes.search')} aria-label={t('notes.search')} className="h-11 w-full rounded-full border border-border bg-surface ps-11 pe-4 text-ink placeholder:text-ink-faint" />
              </div>
            )}
            {!total ? (
              <EmptyState icon={NotebookPen} title={t('notes.title')} message={t('notes.empty')} headingLevel="h3" />
            ) : !list.length ? (
              <p className="mt-6 text-ink-muted">{t('notes.noMatch', { q })}</p>
            ) : (
              <ul className="mt-5 space-y-4">
                {list.map((x) => (
                  <li key={x.id} className="card p-5" data-testid="note">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-ink-muted">{courseText(x.found.course.id).title}</p>
                        <h3 className="type-h4 text-ink">
                          <Link to={`/lesson/${x.found.course.id}/${x.id}`} className="hover:text-primary-ink hover:underline">
                            {lessonTitle(x.found.course.id, x.id)}
                          </Link>
                        </h3>
                      </div>
                      <button type="button" className="grid size-10 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-danger-ink" aria-label={t('notes.delete')} onClick={() => {
                        const text = x.text;
                        saveNote(x.id, '');
                        toast(t('notes.deleted'), { action: { label: t('notes.undo'), onClick: () => saveNote(x.id, text) } });
                      }}>
                        <Trash2 aria-hidden="true" size={17} />
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-[15px] text-ink">{x.text}</p>
                    <p className="mt-3 text-xs text-ink-muted">{t('notes.edited', { date: formatDate(x.at) })}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="bookmarks-title">
            <h2 id="bookmarks-title" className="type-h3 flex items-center gap-2 text-ink">
              <Bookmark aria-hidden="true" size={20} className="text-primary" /> {t('notes.bookmarks')}
            </h2>
            {!marks.length ? (
              <p className="mt-4 text-sm text-ink-muted">{t('notes.noBookmarks')}</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {marks.map(([id]) => {
                  const f = findLesson(id);
                  return (
                    <li key={id} className="flex items-center gap-2 rounded-[12px] border border-border bg-surface p-3">
                      <Link to={`/lesson/${f.course.id}/${id}`} className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink hover:text-primary-ink">{lessonTitle(f.course.id, id)}</span>
                        <span className="block truncate text-xs text-ink-muted">{courseText(f.course.id).title}</span>
                      </Link>
                      <button type="button" onClick={() => toggleBookmark(id)} className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-muted" aria-label={`${t('lesson.bookmarked')}: ${lessonTitle(f.course.id, id)}`} aria-pressed="true">
                        <Bookmark aria-hidden="true" size={16} className="fill-primary text-primary" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
