import { Layers, RotateCcw } from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { courses, findLesson, getCourse } from '../data/courses.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useLearningState } from '../hooks/useLearning.js';
import { useHydrated } from '../hooks/useMedia.js';
import { useStudyTimer } from '../hooks/useStudyTimer.js';
import { courseText, lessonTitle, useOutline } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { activeLocale, intlLocale } from '../i18n/state.js';
import { daysBetween, fromLocalDate, toLocalDate } from '../lib/dates.js';
import { finishReviewSession, reviewCard, reviewQueue, unlockedCards } from '../lib/learning.js';
import { glossaryUrl, useResource } from '../lib/resources.js';
import { boxCounts, forecast, schedule } from '../lib/srs.js';
import { srsStore } from '../lib/stores.js';

/** Flashcards: today's spaced-repetition queue, or practice any course's deck. */
export default function ReviewPage() {
  useOutline();
  useDocumentTitle(`${t('meta.pages.review')} · EduFlow`);
  const hydrated = useHydrated();
  return (
    <div className="container-page max-w-4xl pt-10 pb-12 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('review.title')}</h1>
      <p className="type-body-lg mt-2 text-ink-muted">{t('review.subtitle')}</p>
      {hydrated ? (
        <Suspense fallback={<p className="mt-8 text-ink-muted">{t('a11y.loading')}</p>}>
          <Review />
        </Suspense>
      ) : (
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-surface-muted" aria-hidden="true" />
      )}
    </div>
  );
}

function Review() {
  const terms = useResource(glossaryUrl(activeLocale()));
  const byId = useMemo(() => new Map(terms.map((x) => [`${x.course}:${x.id}`, x])), [terms]);
  const { enrollments, srs } = useLearningState();
  const [params, setParams] = useSearchParams();
  const deck = getCourse(params.get('deck'))?.id ?? null;
  const today = toLocalDate();
  const unlocked = unlockedCards(enrollments, deck);
  const { due, fresh, queue } = reviewQueue(enrollments, srs, today, deck);
  const [session, setSession] = useState(null);
  const counts = boxCounts(unlocked, srs);
  const fc = forecast(unlocked, srs, today);
  const decks = courses.filter((c) => enrollments.enrollments[c.id]);
  useStudyTimer();

  if (session) return <Session session={session} byId={byId} onDone={() => setSession(null)} />;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="deck" className="text-sm font-semibold text-ink">
          {t('review.deck')}
        </label>
        <select id="deck" value={deck ?? ''} onChange={(e) => setParams(e.target.value ? { deck: e.target.value } : {})} className="h-11 rounded-[12px] border border-border bg-surface px-3 text-sm text-ink">
          <option value="">{t('review.allDecks')}</option>
          {decks.map((c) => (
            <option key={c.id} value={c.id}>
              {courseText(c.id).title}
            </option>
          ))}
        </select>
        <span className="text-sm text-ink-muted">{t('review.deckCount', { count: unlocked.length })}</span>
      </div>

      {!unlocked.length ? (
        <EmptyState icon={Layers} title={t('review.nothing')} message={t('review.nothingText')} actionLabel={t('nav.learning')} actionTo="/learning" />
      ) : (
        <>
          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="type-h2 text-ink" data-testid="due-count">
                {t('review.due', { count: due.length })}
              </p>
              {fresh.length > 0 && <p className="mt-1 text-sm text-ink-muted">+ {t('review.newCards', { count: fresh.length })}</p>}
            </div>
            <Button size="lg" disabled={!queue.length} onClick={() => setSession({ ids: queue, graded: true })} data-testid="start-review">
              {t('review.start')}
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <section className="card p-5" aria-labelledby="boxes-title">
              <h2 id="boxes-title" className="type-h4 text-ink">
                {t('review.boxes')}
              </h2>
              <ul className="mt-4 space-y-2">
                {counts.map((n, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-16 shrink-0 text-ink-muted">{i === 0 ? t('review.newBox') : t('review.box', { n: i })}</span>
                    <ProgressBar value={(n / Math.max(1, unlocked.length)) * 100} size="sm" className="flex-1" animate={false} label={`${i === 0 ? t('review.newBox') : t('review.box', { n: i })}: ${n}`} />
                    <span className="w-8 text-end font-semibold text-ink tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="card p-5" aria-labelledby="forecast-title">
              <h2 id="forecast-title" className="type-h4 text-ink">
                {t('review.forecast')}
              </h2>
              <ol className="mt-4 flex h-28 items-end gap-2">
                {fc.map((d) => {
                  const max = Math.max(1, ...fc.map((x) => x.count));
                  return (
                    <li key={d.date} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-ink tabular-nums">{d.count}</span>
                      <span className="w-full rounded-t-md bg-primary/70" style={{ height: `${(d.count / max) * 64 + 2}px` }} aria-hidden="true" />
                      <span className="text-[11px] text-ink-muted">{new Intl.DateTimeFormat(intlLocale(), { weekday: 'narrow' }).format(fromLocalDate(d.date))}</span>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
          {deck && (
            <Button variant="secondary" icon={RotateCcw} onClick={() => setSession({ ids: unlocked, graded: false })}>
              {t('review.studyAll', { count: unlocked.length })}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function Session({ session, byId, onDone }) {
  const [queue, setQueue] = useState(session.ids);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  // Cards missed this session: they come back at the end of it, but they
  // were already scheduled (box 1, tomorrow); passing them now doesn't
  // reschedule them again.
  const [missed, setMissed] = useState(() => new Set());
  const total = session.ids.length;
  const id = queue[0];
  const today = toLocalDate();
  const inDays = (g) => (missed.has(id) ? 1 : daysBetween(today, schedule(srsStore.get().cards[id], g, today).due));
  const term = byId.get(id);

  const grade = (g) => {
    if (session.graded && !missed.has(id)) reviewCard(id, g);
    if (session.graded && g === 'again') setMissed((m) => new Set(m).add(id));
    setReviewed((n) => n + 1);
    setFlipped(false);
    // "Again" comes back at the end of today's session.
    setQueue((q) => (g === 'again' && session.graded ? [...q.slice(1), q[0]] : q.slice(1)));
  };
  useEffect(() => {
    if (!queue.length && session.graded) finishReviewSession(reviewed);
    // Only when the queue empties.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length]);
  useEffect(() => {
    const onKey = (e) => {
      // Not while typing, and not behind a dialog (a badge can pop mid-session).
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"], dialog') || document.querySelector('dialog[open]')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (!flipped) {
          e.preventDefault();
          setFlipped(true);
        }
      } else if (flipped && ['1', '2', '3'].includes(e.key)) grade(['again', 'good', 'easy'][Number(e.key) - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!queue.length || !term)
    return (
      <div className="card mt-8 p-8 text-center" role="status" data-testid="review-done">
        <p className="type-h2 text-ink">{t('review.done')}</p>
        <p className="mt-2 text-ink-muted">{t('review.doneText', { count: reviewed })}</p>
        <Button className="mt-6" onClick={onDone}>
          {t('a11y.close')}
        </Button>
      </div>
    );
  const lesson = findLesson(term.lesson);
  const card = session.graded ? null : 'practice';
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>{t('review.progress', { n: Math.min(reviewed + 1, total), total })}</span>
        <span>{t('review.keys')}</span>
      </div>
      <ProgressBar value={(reviewed / Math.max(total, reviewed + queue.length)) * 100} size="xs" className="mt-2" animate={false} />
      {card && <p className="mt-3 text-sm text-ink-muted">{t('review.practiceMode')}</p>}
      <div className="mt-5 [perspective:1400px]">
        <button type="button" onClick={() => setFlipped((v) => !v)} aria-label={t('review.flip')} aria-pressed={flipped} className={`relative grid min-h-72 w-full place-items-center transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${flipped ? '[transform:rotateY(180deg)]' : ''}`} data-testid="flashcard">
          <span className={`card absolute inset-0 grid place-items-center p-8 text-center [backface-visibility:hidden] ${flipped ? 'invisible' : ''}`}>
            <span>
              <span className="type-eyebrow text-primary-ink">{courseText(term.course).title}</span>
              <span className="type-h1 mt-3 block text-ink">{term.term}</span>
            </span>
          </span>
          <span className={`card absolute inset-0 grid place-items-center overflow-auto p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${flipped ? '' : 'invisible'}`}>
            <span>
              <span className="type-h3 block text-ink">{term.term}</span>
              <span className="prose-sm mt-3 block text-[17px] text-ink" dangerouslySetInnerHTML={{ __html: term.definition }} />
              {lesson && <span className="mt-4 block text-sm text-ink-muted">{t('review.from', { lesson: lessonTitle(lesson.course.id, lesson.lesson.id) })}</span>}
            </span>
          </span>
        </button>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3" aria-live="polite">
        {flipped ? (
          [
            ['again', t('review.again'), t('review.againHint'), 'secondary'],
            ['good', t('review.good'), t('review.goodHint', { count: inDays('good') }), 'primary'],
            ['easy', t('review.easy'), t('review.easyHint', { count: inDays('easy') }), 'secondary'],
          ].map(([g, label, hint, variant], i) => (
            <button key={g} type="button" onClick={() => grade(g)} className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border px-2 py-2 font-semibold transition-colors ${variant === 'primary' ? 'border-primary bg-primary text-white hover:bg-primary-deep' : 'border-border bg-surface text-ink hover:border-primary'}`} data-testid={`grade-${g}`}>
              <span>
                <kbd className="kbd me-1.5 opacity-80" aria-hidden="true">{i + 1}</kbd>
                {label}
              </span>
              {session.graded && <span className="text-xs font-normal opacity-80">{hint}</span>}
            </button>
          ))
        ) : (
          <Button size="lg" className="col-span-3" onClick={() => setFlipped(true)} data-testid="show-answer">
            {t('review.show')}
          </Button>
        )}
      </div>
      <p className="mt-6 text-center">
        <Link to="/glossary" className="text-sm text-primary-ink hover:underline">
          {t('nav.glossary')}
        </Link>
      </p>
    </div>
  );
}
