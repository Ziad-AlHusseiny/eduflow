import { BarChart3, BookOpen, Layers, Map, PlayCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { achievements } from '../data/achievements.js';
import { getCourse } from '../data/courses.js';
import { getPath } from '../data/people.js';
import { ActivityHeatmap, AchievementsGrid, EnrolledCourseCard, Ring, StreakCalendar } from '../components/learning/Widgets.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Icon from '../components/ui/Icon.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { useDueCount } from '../hooks/useDueCount.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useLearning, useStorageBlocked } from '../hooks/useLearning.js';
import { useStored } from '../hooks/useStored.js';
import { courseText, lessonTitle, useOutline } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { activityCounts } from '../lib/activity.js';
import { toLocalDate } from '../lib/dates.js';
import { enrolledCourses, weeklyLessons, weekMinutes } from '../lib/learning.js';
import { dismissedStore, pathStore, settingsStore } from '../lib/stores.js';

/** My Learning (PRD §6): streak, weekly goal, level, courses, path, achievements, a year of activity. */
export default function MyLearningPage() {
  useOutline();
  useDocumentTitle(`${t('meta.pages.learning')} · EduFlow`);
  const L = useLearning();
  const blocked = useStorageBlocked();
  const [dismissed, setDismissed] = useStored(dismissedStore);
  const [settings, setSettings] = useStored(settingsStore);
  const [pathId] = useStored(pathStore);
  const due = useDueCount();
  const today = toLocalDate(L.now);
  const list = enrolledCourses(L.enrollments, L.events);
  const n = list.length;

  const banner = blocked && !dismissed.includes('storage') && (
    <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl border border-star/50 bg-star-soft p-4 text-star-ink" data-testid="storage-banner">
      <p className="flex-1 text-sm font-medium">{t('learning.blocked')}</p>
      <button type="button" onClick={() => setDismissed((d) => [...d, 'storage'])} className="grid size-9 place-items-center rounded-full hover:bg-white/40" aria-label={t('learning.dismiss')}>
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  );

  if (!n)
    return (
      <div className="container-page pt-10 pb-8 lg:pt-14">
        <h1 className="type-h1 text-ink">{t('learning.title')}</h1>
        {banner}
        <div data-empty-learning>
          <EmptyState icon={BookOpen} title={t('learning.empty.title')} message={t('learning.empty.message')} actionLabel={t('learning.empty.action')} actionTo="/courses" />
        </div>
      </div>
    );

  const s = L.stats;
  const latest = list[0];
  const goalDone = settings.goalUnit === 'lessons' ? weeklyLessons(L.events, today, 1)[0].count : weekMinutes(L.time, today);
  const path = pathId ? getPath(pathId) : null;
  const pathCourses = path ? path.courses.filter((id) => getCourse(id)) : [];

  return (
    <div className="container-page pt-10 pb-8 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('learning.title')}</h1>
      <p className="type-body-lg mt-2 text-ink-muted">{t('learning.subtitle', { count: n })}</p>
      {banner}

      {latest && latest.progress.pct < 100 && (
        <Link to={`/lesson/${latest.course.id}/${latest.continueId}`} className="card lift mt-8 flex items-center gap-4 p-4 md:p-5" data-testid="resume-card">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-white">
            <PlayCircle aria-hidden="true" size={24} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-primary-ink">{t('learning.nextUp')}</span>
            <span className="block truncate font-display font-semibold text-ink">{lessonTitle(latest.course.id, latest.continueId)}</span>
            <span className="block truncate text-sm text-ink-muted">{courseText(latest.course.id).title}</span>
          </span>
        </Link>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <StreakCalendar activityLog={L.enrollments.activityLog} today={today} streak={s.currentStreak} longest={s.longestStreak} />
        <section aria-labelledby="goal-title" className="card flex items-center gap-5 p-5 md:p-6" data-testid="weekly-goal">
          <Ring value={goalDone} max={settings.goalTarget} label={settings.goalUnit === 'lessons' ? t('learning.goal.lessons', { done: goalDone, count: settings.goalTarget }) : t('learning.goal.minutes', { done: goalDone, count: settings.goalTarget })}>
            <span>
              <span className="block font-display text-2xl font-bold text-ink">{goalDone}</span>
              <span className="block text-xs text-ink-muted">/ {settings.goalTarget}</span>
            </span>
          </Ring>
          <div className="min-w-0">
            <h2 id="goal-title" className="type-h4 text-ink">
              {t('learning.goal.title')}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{goalDone >= settings.goalTarget ? t('learning.goal.met') : settings.goalUnit === 'lessons' ? t('learning.goal.lessons', { done: goalDone, count: settings.goalTarget }) : t('learning.goal.minutes', { done: goalDone, count: settings.goalTarget })}</p>
            <details className="mt-2 text-sm">
              <summary className="min-h-9 cursor-pointer font-medium text-primary-ink">{t('learning.goal.edit')}</summary>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <label className="text-xs text-ink-muted">
                  {t('learning.goal.unit')}
                  <select value={settings.goalUnit} onChange={(e) => setSettings((x) => ({ ...x, goalUnit: e.target.value, goalTarget: e.target.value === 'minutes' ? 120 : 5 }))} className="mt-1 block h-10 rounded-[10px] border border-border bg-surface px-2 text-sm text-ink">
                    <option value="lessons">{t('learning.goal.unitLessons')}</option>
                    <option value="minutes">{t('learning.goal.unitMinutes')}</option>
                  </select>
                </label>
                <label className="text-xs text-ink-muted">
                  {t('learning.goal.target')}
                  <input type="number" min={1} max={settings.goalUnit === 'minutes' ? 3000 : 100} value={settings.goalTarget} onChange={(e) => setSettings((x) => ({ ...x, goalTarget: Math.max(1, Math.round(Number(e.target.value) || 1)) }))} className="mt-1 block h-10 w-24 rounded-[10px] border border-border bg-surface px-2 text-sm text-ink" />
                </label>
              </div>
            </details>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="level-title" className="card p-5 md:p-6" data-testid="level-card">
          <div className="flex items-center justify-between gap-3">
            <h2 id="level-title" className="type-h4 text-ink">
              {t('learning.level', { level: s.level.level })}
            </h2>
            <span className="font-display font-semibold text-primary-ink">{t('learning.xp', { xp: s.xp })}</span>
          </div>
          <ProgressBar value={s.level.progress * 100} size="md" className="mt-3" label={t('learning.toNext', { xp: s.level.next - s.xp, level: s.level.level + 1 })} />
          <p className="mt-2 text-sm text-ink-muted">{t('learning.toNext', { xp: s.level.next - s.xp, level: s.level.level + 1 })}</p>
          <Link to="/stats" className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary-ink hover:underline">
            <BarChart3 aria-hidden="true" size={16} /> {t('learning.statsLink')}
          </Link>
        </section>
        <section aria-labelledby="cards-title" className="card flex flex-col justify-between gap-3 p-5 md:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[12px] bg-primary-soft text-primary">
              <Layers aria-hidden="true" size={22} />
            </span>
            <h2 id="cards-title" className="type-h4 text-ink">
              {t('learning.dueCards', { count: due })}
            </h2>
          </div>
          {due > 0 && (
            <Button to="/review" size="sm" className="self-start">
              {t('learning.startReview')}
            </Button>
          )}
        </section>
      </div>

      <section aria-labelledby="courses-title" className="mt-12">
        <h2 id="courses-title" className="type-h2 text-ink">
          {t('nav.courses')}
        </h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {list.map((x) => (
            <li key={x.course.id} className="flex">
              <div className="w-full">
                <EnrolledCourseCard course={x.course} progress={x.progress} continueId={x.continueId} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="path-title" className="card mt-10 p-5 md:p-6">
        <h2 id="path-title" className="type-h4 flex items-center gap-2 text-ink">
          <Map aria-hidden="true" size={18} className="text-primary" /> {t('learning.pathTitle')}
        </h2>
        {path ? (
          <div className="mt-3">
            <Link to={`/paths/${path.id}`} className="inline-flex items-center gap-2 font-display font-semibold text-ink hover:text-primary-ink">
              <Icon name={path.icon} size={18} /> {path.title}
            </Link>
            <p className="mt-1 text-sm text-ink-muted">{t('learning.pathProgress', { done: pathCourses.filter((id) => s.completedCourseIds.includes(id)).length, total: pathCourses.length })}</p>
            <ProgressBar value={(pathCourses.filter((id) => s.completedCourseIds.includes(id)).length / Math.max(1, pathCourses.length)) * 100} size="sm" className="mt-2" />
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">{t('learning.noPath')}</p>
            <Button to="/paths" size="sm" variant="secondary">
              {t('learning.choosePath')}
            </Button>
          </div>
        )}
      </section>

      <section id="achievements" aria-labelledby="achievements-title" className="mt-12 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="achievements-title" className="type-h2 text-ink">
            {t('learning.achievements')}
          </h2>
          <p className="text-sm font-medium text-ink-muted" data-testid="achievements-count">
            {t('learning.earnedCount', { earned: L.earned.size, total: achievements.length })}
          </p>
        </div>
        <div className="mt-5">
          <AchievementsGrid earned={L.earned} />
        </div>
      </section>

      <section aria-labelledby="activity-title" className="card mt-12 p-5 md:p-6">
        <h2 id="activity-title" className="type-h4 text-ink">
          {t('learning.activity')}
        </h2>
        <div className="mt-4">
          <ActivityHeatmap counts={activityCounts(L.events, L.enrollments.activityLog)} today={today} />
        </div>
      </section>
    </div>
  );
}
