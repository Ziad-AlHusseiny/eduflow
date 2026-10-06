import { BarChart3 } from 'lucide-react';
import { BarChart, HBarList } from '../components/learning/Charts.jsx';
import { ActivityHeatmap } from '../components/learning/Widgets.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { findLesson } from '../data/courses.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useLearning } from '../hooks/useLearning.js';
import { useHydrated } from '../hooks/useMedia.js';
import { courseText } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { intlLocale } from '../i18n/state.js';
import { activityCounts } from '../lib/activity.js';
import { fromLocalDate, lastNDays, toLocalDate } from '../lib/dates.js';
import { formatCount } from '../lib/format.js';
import { weeklyLessons } from '../lib/learning.js';

const short = (d) => new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'short' }).format(fromLocalDate(d));

/** Stats: totals, lessons per week, minutes per day, quiz accuracy, a year of activity — hand-rolled SVG. */
export default function StatsPage() {
  useDocumentTitle(`${t('meta.pages.stats')} · EduFlow`);
  const hydrated = useHydrated();
  const L = useLearning();
  const s = L.stats;
  const today = toLocalDate(L.now);
  const lessonScores = Object.entries(L.scores.lessons).filter(([id]) => findLesson(id));
  const pts = lessonScores.reduce((a, [, x]) => a + x.best, 0);
  const tot = lessonScores.reduce((a, [, x]) => a + x.total, 0);
  const accuracy = tot ? Math.round((pts / tot) * 100) : 0;
  const byCourse = {};
  for (const [id, x] of lessonScores) {
    const c = findLesson(id).course.id;
    byCourse[c] ??= [0, 0];
    byCourse[c][0] += x.best;
    byCourse[c][1] += x.total;
  }
  const tiles = [
    ['lessons', formatCount(s.completedLessons)],
    ['minutes', formatCount(s.minutes)],
    ['xp', formatCount(s.xp)],
    ['streak', formatCount(s.longestStreak)],
    ['quizzes', tot ? `${accuracy}%` : '—'],
    ['exercises', formatCount(s.exercisesSolved)],
    ['cards', formatCount(s.reviews)],
    ['courses', formatCount(s.coursesCompleted)],
  ];
  const weeks = weeklyLessons(L.events, today, 12).map((w) => ({ key: w.week, label: w.week, value: w.count, full: t('stats.week', { date: short(w.week) }) }));
  const days = lastNDays(today, 30).map((d) => ({ key: d, label: d, value: Math.round((L.time[d] ?? 0) / 60), full: short(d) }));
  const empty = !s.completedLessons && !s.minutes && !tot;

  return (
    <div className="container-page pt-10 pb-12 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('stats.title')}</h1>
      <p className="type-body-lg mt-2 text-ink-muted">{t('stats.subtitle')}</p>
      {hydrated && (
        <>
          <p className="mt-4 font-display font-semibold text-primary-ink">{t('stats.xpLevel', { level: s.level.level, xp: formatCount(s.xp) })}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map(([k, v]) => (
              <div key={k} className="card p-4">
                <dt className="text-sm text-ink-muted">{t(`stats.totals.${k}`)}</dt>
                <dd className="type-stat mt-1 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          {empty ? (
            <EmptyState icon={BarChart3} title={t('stats.title')} message={t('stats.empty')} actionLabel={t('nav.learning')} actionTo="/learning" />
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="card p-5" aria-labelledby="wk-title">
                <h2 id="wk-title" className="type-h4 text-ink">{t('stats.lessonsPerWeek')}</h2>
                <p className="text-sm text-ink-muted">{t('stats.lessonsPerWeekDesc')}</p>
                <div className="mt-4">
                  <BarChart data={weeks} label={t('stats.lessonsPerWeek')} formatX={short} />
                </div>
              </section>
              <section className="card p-5" aria-labelledby="time-title">
                <h2 id="time-title" className="type-h4 text-ink">{t('stats.timePerDay')}</h2>
                <p className="text-sm text-ink-muted">{t('stats.timePerDayDesc')}</p>
                <div className="mt-4">
                  <BarChart data={days} label={t('stats.timePerDay')} formatX={short} unit=" min" />
                </div>
              </section>
              <section className="card p-5" aria-labelledby="acc-title">
                <h2 id="acc-title" className="type-h4 text-ink">{t('stats.accuracy')}</h2>
                <p className="text-sm text-ink-muted">{t('stats.accuracyDesc')}</p>
                <div className="mt-4">
                  <HBarList rows={Object.entries(byCourse).map(([c, [p, q]]) => ({ key: c, label: courseText(c).title, value: Math.round((p / q) * 100) }))} />
                </div>
              </section>
              <section className="card p-5" aria-labelledby="hm-title">
                <h2 id="hm-title" className="type-h4 text-ink">{t('stats.heatmap')}</h2>
                <p className="text-sm text-ink-muted">{t('stats.heatmapDesc')}</p>
                <div className="mt-4">
                  <ActivityHeatmap counts={activityCounts(L.events, L.enrollments.activityLog)} today={today} />
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
