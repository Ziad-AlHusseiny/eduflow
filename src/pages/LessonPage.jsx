import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, ChevronDown, ClipboardCheck, Clock, Code2, ExternalLink, Focus, Keyboard, ListTree, Minus, NotebookPen, Plus, Printer, Trophy } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import CurriculumAccordion from '../components/course/CurriculumAccordion.jsx';
import AdvanceToast from '../components/lesson/AdvanceToast.jsx';
import LessonBody from '../components/lesson/LessonBody.jsx';
import MarkCompleteButton from '../components/lesson/MarkCompleteButton.jsx';
import NotesPanel from '../components/lesson/NotesPanel.jsx';
import Quiz from '../components/lesson/Quiz.jsx';
import Practice from '../components/practice/Practice.jsx';
import ShortcutsDialog from '../components/lesson/ShortcutsDialog.jsx';
import Button from '../components/ui/Button.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { findLesson, getCourse } from '../data/courses.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useEnrollments } from '../hooks/useLearning.js';
import { useStored } from '../hooks/useStored.js';
import { useHydrated } from '../hooks/useMedia.js';
import { useStudyTimer } from '../hooks/useStudyTimer.js';
import { courseText, lessonTitle, sectionTitle, useOutline } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { activeLocale } from '../i18n/state.js';
import { holdBadges, releaseBadges } from '../lib/badges.js';
import { recordScore, setLastVisited, toggleBookmark, toggleLessonComplete } from '../lib/learning.js';
import { nextLesson, previousLesson, progressFor } from '../lib/progress.js';
import { lessonUrl, useResource } from '../lib/resources.js';
import { bookmarksStore, readingStore, scoresStore, settingsStore } from '../lib/stores.js';
import NotFoundPage from './NotFoundPage.jsx';

const SCALES = [0.9, 1, 1.1, 1.2, 1.3];

/** The lesson player (PRD §7). Guards first: unknown → 404; not enrolled → the course page; unknown lesson → lesson 1. */
export default function LessonPage() {
  useOutline();
  const { courseId, lessonId } = useParams();
  const course = getCourse(courseId);
  const found = findLesson(lessonId);
  const hydrated = useHydrated();
  const enrollments = useEnrollments();
  if (!course) return <NotFoundPage />;
  const enrolled = Boolean(enrollments.enrollments[course.id]);
  if (hydrated && !enrolled) return <Navigate to={`/courses/${course.id}`} replace />;
  if (!found || found.course.id !== course.id) return hydrated ? <Navigate to={`/lesson/${course.id}/${course.lessons[0].id}`} replace /> : <NotFoundPage />;
  return <Lesson key={lessonId} course={course} lesson={found.lesson} />;
}

function useReadingProgress(articleRef, lessonId, hydrated) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!hydrated) return undefined;
    let raf = 0;
    let lastSave = 0;
    // Only real scrolling saves the position: the first measure runs at the
    // top of the page, before the resume scroll, and would erase it.
    const measure = (save = true) => {
      raf = 0;
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight * 0.6;
      const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, total)));
      setPct(Math.round(p * 100));
      const now = Date.now();
      if (save && now - lastSave > 1000) {
        lastSave = now;
        const headings = [...el.querySelectorAll('h2[id^="sec-"], h3[id^="sec-"]')];
        const anchor = headings.filter((h) => h.getBoundingClientRect().top < 120).at(-1)?.id ?? null;
        readingStore.set((s) => ({ ...s, [lessonId]: { scroll: Math.round(p * 1000) / 1000, anchor, at: new Date().toISOString() } }));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    measure(false);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [articleRef, lessonId, hydrated]);
  return pct;
}

/** The reading progress line (its own component: scrolling re-renders only this). */
function ReadingBar({ articleRef, lessonId, hydrated }) {
  const pct = useReadingProgress(articleRef, lessonId, hydrated);
  return (
    <div className="sticky top-[68px] z-30 h-1 bg-transparent" aria-hidden="true" data-chrome>
      <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Lesson({ course, lesson }) {
  const navigate = useNavigate();
  const locale = activeLocale();
  const data = useResource(lessonUrl(locale, lesson.id));
  const hydrated = useHydrated();
  // Only the stores this page shows (the study timer writes `time` every
  // 15 s; subscribing to it would re-render the whole lesson each time).
  const enrollments = useEnrollments();
  const [scores] = useStored(scoresStore);
  const [settings] = useStored(settingsStore);
  const bookmarks = useSyncExternalStore(bookmarksStore.subscribe, bookmarksStore.get, bookmarksStore.getServer);
  const enrollment = enrollments.enrollments[course.id];
  const completedIds = enrollment?.completedLessonIds ?? [];
  const completed = completedIds.includes(lesson.id);
  const progress = progressFor(course, completedIds);
  const next = nextLesson(course, lesson.id);
  const prev = previousLesson(course, lesson.id);
  const section = course.sections[lesson.sectionIndex];
  const lastInSection = section.lessons.at(-1).id === lesson.id;
  const title = lessonTitle(course.id, lesson.id);
  const [advance, setAdvance] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const articleRef = useRef(null);
  useDocumentTitle(`${title} · ${courseText(course.id).title} · EduFlow`);
  useStudyTimer();

  useEffect(() => {
    if (enrollment) setLastVisited(course.id, lesson.id);
  }, [course.id, lesson.id, enrollment]);

  // Resume where you stopped reading (not when following a #link). The saved
  // position is read once, before anything on this visit can overwrite it.
  const [resume] = useState(() => readingStore.get()[lesson.id]);
  useEffect(() => {
    if (!hydrated || location.hash) return;
    const saved = resume;
    if (!saved || saved.scroll < 0.03 || saved.scroll > 0.97) return;
    const el = saved.anchor && document.getElementById(saved.anchor);
    requestAnimationFrame(() => {
      if (el) el.scrollIntoView({ block: 'start' });
      else window.scrollTo({ top: (articleRef.current?.offsetTop ?? 0) + saved.scroll * (articleRef.current?.offsetHeight ?? 0) });
    });
  }, [hydrated, resume]);

  // Text size and focus mode live on <html> (no hydration mismatch, survives navigation).
  useEffect(() => {
    document.documentElement.style.setProperty('--lesson-scale', settings.textScale);
  }, [settings.textScale]);
  useEffect(() => {
    document.documentElement.classList.toggle('focus-mode', focus);
    return () => document.documentElement.classList.remove('focus-mode');
  }, [focus]);

  const scale = (dir) => {
    const i = SCALES.indexOf(settings.textScale);
    const nextScale = SCALES[Math.max(0, Math.min(SCALES.length - 1, (i < 0 ? 1 : i) + dir))];
    settingsStore.set((s) => ({ ...s, textScale: nextScale }));
  };

  const toggleComplete = () => {
    const now = toggleLessonComplete(course.id, lesson.id);
    if (!now) {
      setAdvance(null);
      releaseBadges();
      return;
    }
    const after = progressFor(course, [...completedIds, lesson.id]);
    if (after.pct === 100 || !next || !settings.autoAdvance) return;
    holdBadges(3500);
    setAdvance(next);
  };

  // Keyboard shortcuts (not while typing; ? shows them).
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target;
      if (el.closest?.('input, textarea, select, [contenteditable="true"], .cm-editor, dialog')) return;
      // Letters by physical key, so they work with an Arabic layout too.
      const k = /^Key[A-Z]$/.test(e.code ?? '') && !e.shiftKey ? e.code.slice(3).toLowerCase() : e.key;
      if (k === 'j' && next) navigate(`/lesson/${course.id}/${next.id}`);
      else if (k === 'k' && prev) navigate(`/lesson/${course.id}/${prev.id}`);
      else if (k === 'c') toggleComplete();
      else if (k === 'n') setNotesOpen(true);
      else if (k === 'b') toggleBookmark(lesson.id);
      else if (k === 'f') setFocus((v) => !v);
      else if (k === '+' || k === '=') scale(1);
      else if (k === '-') scale(-1);
      else if (k === '?') setHelpOpen(true);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const bookmarked = Boolean(bookmarks[lesson.id]);
  const lessonHref = (l) => `/lesson/${course.id}/${l.id}`;
  const toolBtn = 'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink';

  return (
    <div className="pb-16">
      <ReadingBar articleRef={articleRef} lessonId={lesson.id} hydrated={hydrated} />

      {/* Top bar (PRD §7.1) */}
      <div className="border-b border-border bg-surface" data-chrome>
        <div className="container-page flex min-h-14 items-center gap-4 py-2">
          <Link to="/learning" aria-label={t('lesson.back')} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full pe-2 text-sm font-medium text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" size={18} className="rtl:-scale-x-100" />
            <span className="hidden sm:inline">{t('lesson.back')}</span>
          </Link>
          <Link to={`/courses/${course.id}`} className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold text-ink hover:text-primary-ink">
            {courseText(course.id).title}
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm whitespace-nowrap text-ink-muted md:inline" data-testid="lesson-progress">
              {t('lesson.progress', { done: progress.completed, total: progress.total, pct: progress.pct })}
            </span>
            <span className="text-sm font-semibold text-ink md:hidden">{t('lesson.progressShort', { pct: progress.pct })}</span>
            <ProgressBar value={progress.pct} size="xs" className="hidden w-28 md:block" animate={false} />
          </div>
        </div>
      </div>

      <div className="container-page mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <article ref={articleRef} aria-labelledby="lesson-title" lang={data.lang !== locale ? data.lang : undefined}>
            <p className="text-sm font-semibold text-primary-ink">{t('lesson.section', { n: lesson.sectionIndex + 1, title: sectionTitle(course.id, section.id) })}</p>
            <h1 id="lesson-title" className="type-h1 mt-2 text-ink">
              {title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden="true" size={15} />
                {t('lesson.minutes', { count: lesson.minutes })}
              </span>
              <span>{t('lesson.readTime', { count: data.readMinutes })}</span>
              {data.exercise && (
                <span className="inline-flex items-center gap-1.5">
                  <Code2 aria-hidden="true" size={15} />
                  {t(`exercise.kinds.${data.exercise.kind}`)}
                </span>
              )}
            </p>

            {/* Lesson at a glance (replaces the PRD's demo video player: BUILD-LOG) */}
            <section aria-labelledby="glance-title" className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft/70 via-surface to-accent-soft/50 p-5 md:p-7" data-testid="lesson-glance">
              <h2 id="glance-title" className="type-eyebrow text-primary-ink">
                {t('lesson.overview')}
              </h2>
              <p className="type-body-lg mt-3 text-ink" dangerouslySetInnerHTML={{ __html: data.summary }} />
              {data.toc.filter((x) => x.level === 2).length > 0 && (
                <ol className="mt-5 grid gap-2 sm:grid-cols-2">
                  {data.toc
                    .filter((x) => x.level === 2)
                    .map((x, i) => (
                      <li key={x.id}>
                        <a href={`#${x.id}`} className="flex min-h-11 items-center gap-3 rounded-[12px] bg-surface/80 px-3 py-2 text-sm font-medium text-ink shadow-card transition-colors hover:text-primary-ink" onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(x.id);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          el?.focus({ preventScroll: true });
                        }}>
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-white">{i + 1}</span>
                          <span className="line-clamp-2">{x.text}</span>
                        </a>
                      </li>
                    ))}
                </ol>
              )}
              <p className="mt-4 text-xs text-ink-muted">{t('lesson.overviewText')}</p>
            </section>

            {/* Toolbar */}
            <div className="no-print mt-6 flex flex-wrap items-center gap-1 border-y border-border py-1.5" role="toolbar" aria-label={t('lesson.textSize')}>
              <button type="button" className={toolBtn} onClick={() => scale(-1)} aria-label={t('lesson.smaller')} disabled={settings.textScale <= SCALES[0]}>
                <Minus aria-hidden="true" size={16} />
              </button>
              <span className="px-1 text-sm text-ink-muted tabular-nums" aria-live="polite">
                {Math.round(settings.textScale * 100)}%
              </span>
              <button type="button" className={toolBtn} onClick={() => scale(1)} aria-label={t('lesson.larger')} disabled={settings.textScale >= SCALES.at(-1)}>
                <Plus aria-hidden="true" size={16} />
              </button>
              <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
              <button type="button" className={toolBtn} onClick={() => setFocus((v) => !v)} aria-pressed={focus} aria-keyshortcuts="F" aria-label={focus ? t('lesson.exitFocus') : t('lesson.focus')}>
                <Focus aria-hidden="true" size={17} />
                <span className="hidden sm:inline">{focus ? t('lesson.exitFocus') : t('lesson.focus')}</span>
              </button>
              <button type="button" className={toolBtn} onClick={() => toggleBookmark(lesson.id)} aria-pressed={bookmarked} aria-keyshortcuts="B" aria-label={t('lesson.bookmark')} data-testid="bookmark-button">
                {bookmarked ? <BookmarkCheck aria-hidden="true" size={17} className="text-primary" /> : <Bookmark aria-hidden="true" size={17} />}
                <span className="hidden sm:inline">{bookmarked ? t('lesson.bookmarked') : t('lesson.bookmark')}</span>
              </button>
              <button type="button" className={toolBtn} onClick={() => setNotesOpen(true)} aria-keyshortcuts="N" aria-label={t('lesson.notes')} data-testid="notes-button">
                <NotebookPen aria-hidden="true" size={17} />
                <span className="hidden sm:inline">{t('lesson.notes')}</span>
              </button>
              <button type="button" className={toolBtn} onClick={() => window.print()} aria-label={t('lesson.print')}>
                <Printer aria-hidden="true" size={17} />
                <span className="hidden sm:inline">{t('lesson.print')}</span>
              </button>
              <button type="button" className={`${toolBtn} ms-auto`} onClick={() => setHelpOpen(true)} aria-keyshortcuts="?" data-testid="shortcuts-button">
                <Keyboard aria-hidden="true" size={17} />
                <span className="sr-only">{t('lesson.shortcuts')}</span>
              </button>
            </div>

            <div className="mt-8" style={{ '--scale': 'var(--lesson-scale, 1)' }}>
              <LessonBody html={data.html} />
            </div>

            {data.takeaways.length > 0 && (
              <section aria-labelledby="takeaways-title" className="mt-12 rounded-2xl border border-border bg-success-soft/40 p-6">
                <h2 id="takeaways-title" className="type-h3 text-ink">
                  {t('lesson.takeaways')}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {data.takeaways.map((x) => (
                    <li key={x} className="flex gap-3 text-ink">
                      <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-success" />
                      <span className="prose-sm" dangerouslySetInnerHTML={{ __html: x }} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.further.length > 0 && (
              <section aria-labelledby="further-title" className="mt-8">
                <h2 id="further-title" className="type-h4 text-ink">
                  {t('lesson.further')}
                </h2>
                <ul className="mt-3 space-y-2">
                  {data.further.map((x) => (
                    <li key={x.url}>
                      <a href={x.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-primary-ink underline-offset-4 hover:underline">
                        <ExternalLink aria-hidden="true" size={16} className="mt-1 shrink-0" />
                        <span lang="en" dir="ltr">{x.title}</span>
                        <span className="sr-only">{t('a11y.opensInNewTab')}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {data.quiz.length > 0 && <Quiz key={lesson.id} questions={data.quiz} best={scores.lessons[lesson.id]} onComplete={(correct, total) => recordScore('lessons', lesson.id, correct, total)} />}

          {data.exercise && (
            <section aria-labelledby="practice-title" className="no-print mt-14" data-testid="practice">
              <h2 id="practice-title" className="type-h2 text-ink">
                {t('exercise.title')}
              </h2>
              <Practice exercise={data.exercise} lessonId={lesson.id} courseId={course.id} />
            </section>
          )}

          {/* Complete + navigation */}
          <div className="no-print mt-14 rounded-2xl border border-border bg-surface p-5 md:p-6">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <MarkCompleteButton completed={completed} onToggle={toggleComplete} className="w-full sm:w-auto" />
              <div className="flex gap-2">
                {prev && (
                  <Button to={lessonHref(prev)} variant="secondary" icon={ArrowLeft} aria-keyshortcuts="K" className="flex-1 sm:flex-none [&_svg]:rtl:-scale-x-100">
                    {t('lesson.previous')}
                  </Button>
                )}
                {next && (
                  <Button to={lessonHref(next)} variant="secondary" iconEnd={ArrowRight} aria-keyshortcuts="J" className="flex-1 sm:flex-none">
                    {t('lesson.next')}
                  </Button>
                )}
              </div>
            </div>
            {lastInSection && (
              <Link to={`/courses/${course.id}/checkpoint/${section.id}`} className="mt-5 flex items-center gap-3 rounded-[12px] bg-primary-soft/60 p-4 text-ink transition-colors hover:bg-primary-soft">
                <ClipboardCheck aria-hidden="true" size={22} className="shrink-0 text-primary" />
                <span>
                  <span className="block font-semibold">{t('lesson.checkpointCta')}</span>
                  <span className="text-sm text-ink-muted">{t('lesson.checkpointText', { section: sectionTitle(course.id, section.id) })}</span>
                </span>
              </Link>
            )}
            {!next && (
              <Link to={`/courses/${course.id}/final`} className="mt-3 flex items-center gap-3 rounded-[12px] bg-star-soft p-4 text-ink transition-colors hover:brightness-95">
                <Trophy aria-hidden="true" size={22} className="shrink-0 text-star-ink" />
                <span>
                  <span className="block font-semibold">{t('lesson.finalCta')}</span>
                  <span className="text-sm text-ink-muted">{t('lesson.finalText')}</span>
                </span>
              </Link>
            )}
          </div>
          <p className="print-only mt-8 text-xs">{t('lesson.printedFrom', { url: `eduflow-lf-2.vercel.app/lesson/${course.id}/${lesson.id}` })}</p>
        </div>

        {/* Curriculum: sticky sidebar ≥1024px, a collapsible panel below (PRD §7.5–7.6). */}
        <aside className="no-print lg:sticky lg:top-[90px] lg:max-h-[calc(100vh-106px)] lg:self-start lg:overflow-y-auto" aria-label={t('lesson.courseContent')} data-chrome>
          <div className="mb-3 hidden lg:block">
            <p className="font-display font-semibold text-ink">{courseText(course.id).title}</p>
            <div className="mt-2 flex items-center gap-3">
              <ProgressBar value={progress.pct} size="md" className="flex-1" />
              <span className="text-sm font-semibold text-ink tabular-nums">{progress.pct}%</span>
            </div>
          </div>
          <button type="button" className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 font-display font-semibold text-ink lg:hidden" aria-expanded={contentOpen} aria-controls="lesson-curriculum" onClick={() => setContentOpen((v) => !v)}>
            <span className="inline-flex items-center gap-2">
              <ListTree aria-hidden="true" size={18} /> {t('lesson.courseContent')}
            </span>
            <ChevronDown aria-hidden="true" size={18} className={`transition-transform ${contentOpen ? 'rotate-180' : ''}`} />
          </button>
          <div id="lesson-curriculum" className={`mt-3 lg:mt-0 lg:block ${contentOpen ? 'block' : 'hidden'}`}>
            <CurriculumAccordion course={course} interactive activeLessonId={lesson.id} completedIds={completedIds} checkpointScores={scores.checkpoints} compact />
          </div>
        </aside>
      </div>

      {advance && (
        <AdvanceToast
          title={lessonTitle(course.id, advance.id)}
          onGo={() => {
            setAdvance(null);
            releaseBadges();
            navigate(lessonHref(advance));
          }}
          onStay={() => {
            setAdvance(null);
            releaseBadges();
          }}
        />
      )}
      <NotesPanel open={notesOpen} onClose={() => setNotesOpen(false)} lessonId={lesson.id} title={title} />
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
