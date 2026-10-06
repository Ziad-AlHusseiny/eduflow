import { Check, Flame, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { achievements } from '../../data/achievements.js';
import { courseText } from '../../i18n/content.js';
import { t } from '../../i18n/index.js';
import { intlLocale } from '../../i18n/state.js';
import { justEarned } from '../../lib/badges.js';
import { addDays, fromLocalDate, lastNDays, weekStart } from '../../lib/dates.js';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import CourseImage from '../ui/CourseImage.jsx';
import Icon from '../ui/Icon.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';

const weekday = (d) => new Intl.DateTimeFormat(intlLocale(), { weekday: 'narrow' }).format(fromLocalDate(d));
const longDate = (d) => new Intl.DateTimeFormat(intlLocale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(fromLocalDate(d));

/** The streak strip (PRD §6.2): 14 days (7 on phones), today ringed. */
export function StreakCalendar({ activityLog, today, streak, longest }) {
  const active = new Set(activityLog);
  const days = lastNDays(today, 14);
  return (
    <section aria-labelledby="streak-title" className="card p-5 md:p-6" data-testid="streak">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="streak-title" className="type-h3 text-ink">
          {t('learning.streak')}
        </h2>
        {streak > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-star-soft px-3 py-1.5 text-sm font-semibold text-star-ink" data-testid="streak-pill">
            <Flame aria-hidden="true" size={16} /> {t('learning.streakPill', { count: streak })}
          </span>
        ) : (
          <p className="text-sm text-ink-muted" data-testid="streak-pill">
            {t('learning.noStreak')}
          </p>
        )}
      </div>
      <ol className="mt-5 grid grid-cols-7 gap-2 md:grid-cols-14">
        {days.map((d, i) => {
          const on = active.has(d);
          const isToday = d === today;
          return (
            <li key={d} className={`flex flex-col items-center gap-1.5 ${i < 7 ? 'hidden md:flex' : ''}`}>
              <span aria-hidden="true" className="text-[13px] font-medium text-ink-muted">
                {weekday(d)}
              </span>
              <span className={`grid size-9 place-items-center rounded-full motion-safe:animate-[pop-in_400ms_cubic-bezier(0.34,1.56,0.64,1)_both] ${on ? 'bg-primary text-white' : 'border border-border bg-surface'} ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`} style={{ animationDelay: `${(i % 7) * 40}ms` }} data-active={on}>
                {on && <Check aria-hidden="true" size={16} strokeWidth={3} />}
                <span className="sr-only">{(on ? t('learning.activeDay', { date: longDate(d) }) : t('learning.inactiveDay', { date: longDate(d) })) + (isToday ? ` (${t('learning.today')})` : '')}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {longest > 0 && <p className="mt-4 text-sm text-ink-muted">{t('learning.longest', { count: longest })}</p>}
    </section>
  );
}

/** A progress ring (SVG). */
export function Ring({ value, max, size = 112, stroke = 12, children, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, max ? value / max : 0);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-primary-soft" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className={`transition-[stroke-dashoffset] duration-(--duration-progress) ease-(--ease-out-soft) ${pct >= 1 ? 'stroke-success' : 'stroke-primary'}`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** One enrolled course (PRD §6.3). */
export function EnrolledCourseCard({ course, progress, continueId }) {
  const done = progress.pct === 100;
  return (
    <article className="card flex overflow-hidden md:flex-col" data-testid="enrolled-card">
      <div className="relative w-32 shrink-0 md:w-auto">
        <CourseImage course={course} sizes="(min-width: 768px) 360px, 128px" className="h-full md:h-auto" />
        {done && (
          <Badge variant="success" className="absolute start-2 top-2">
            {t('learning.completed')}
          </Badge>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
        <p className="text-[13px] font-medium text-ink-muted">{t(`categories.${course.category}`)}</p>
        <h3 className="type-h4 mt-0.5 line-clamp-2 text-ink">
          <Link to={`/courses/${course.id}`} className="hover:text-primary-ink">
            {courseText(course.id).title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-ink-muted">{t('learning.lessonsOf', { done: progress.completed, total: progress.total })}</p>
        <div className="mt-2 flex items-center gap-3">
          <ProgressBar value={progress.pct} size="sm" className="flex-1" />
          <span className="text-sm font-semibold text-ink tabular-nums">{progress.pct}%</span>
        </div>
        <div className="mt-4 md:mt-auto md:pt-4">
          <Button to={`/lesson/${course.id}/${done ? course.lessons[0].id : continueId}`} variant={done ? 'secondary' : 'primary'} size="sm">
            {done ? t('learning.review') : t('learning.continue')}
          </Button>
        </div>
      </div>
    </article>
  );
}

/** One badge, earned or locked (PRD §6.4). */
export function AchievementBadge({ achievement, earned }) {
  const name = t(`achievements.${achievement.id}.name`);
  const rule = t(`achievements.${achievement.id}.rule`);
  const fresh = earned && justEarned.has(achievement.id);
  return (
    <li className="relative flex flex-col items-center rounded-2xl border border-border bg-surface p-4 text-center" data-testid={`badge-${achievement.id}`} data-earned={earned}>
      <span className={`relative grid size-16 place-items-center overflow-hidden rounded-full ${earned ? 'bg-star-soft text-star-ink' : 'bg-surface-muted text-ink-faint opacity-60 grayscale'} ${fresh ? 'motion-safe:animate-[pop-in_700ms_cubic-bezier(0.34,1.56,0.64,1)]' : ''}`}>
        <Icon name={achievement.icon} size={28} />
        {earned && <span aria-hidden="true" className="absolute inset-y-0 w-1/3 bg-white/40 motion-safe:animate-sheen" />}
      </span>
      {!earned && (
        <span className="absolute end-3 top-3 text-ink-faint">
          <Lock aria-hidden="true" size={14} />
        </span>
      )}
      <h3 className="type-h4 mt-3 text-[15px] text-ink">{name}</h3>
      <p className="mt-1 text-[13px] leading-snug text-ink-muted">{earned ? rule : t('achievements.locked', { rule })}</p>
      <span className="sr-only">{earned ? t('achievements.earned') : t('achievements.lockedLabel')}</span>
    </li>
  );
}

export function AchievementsGrid({ earned, limit }) {
  const list = limit ? achievements.slice(0, limit) : achievements;
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4" data-testid="achievements">
      {list.map((a) => (
        <AchievementBadge key={a.id} achievement={a} earned={earned.has(a.id)} />
      ))}
    </ul>
  );
}

/** A year of activity, GitHub-style: 53 weeks × 7 days. */
export function ActivityHeatmap({ counts, today }) {
  const end = today;
  const start = addDays(weekStart(end), -52 * 7);
  const weeks = [];
  for (let w = 0; w < 53; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(start, w * 7 + d);
      col.push(day <= end ? day : null);
    }
    weeks.push(col);
  }
  const max = Math.max(1, ...Object.values(counts));
  const level = (n) => (!n ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
  const fills = ['fill-surface-muted', 'fill-primary/30', 'fill-primary/55', 'fill-primary/80', 'fill-primary'];
  const cell = 11;
  const gap = 3;
  const fmt = (d) => new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(fromLocalDate(d));
  return (
    <div>
      <div className="overflow-x-auto pb-2" dir="ltr" tabIndex={0} role="region" aria-label={t('stats.heatmap')}>
        <svg width={53 * (cell + gap)} height={7 * (cell + gap)} role="img" aria-label={t('stats.heatmapDesc')} className="block">
          {weeks.map((col, w) =>
            col.map((day, d) =>
              day ? (
                <rect key={day} x={w * (cell + gap)} y={d * (cell + gap)} width={cell} height={cell} rx={2.5} className={fills[level(counts[day] ?? 0)]}>
                  <title>{t('stats.dayCell', { date: fmt(day), count: counts[day] ?? 0 })}</title>
                </rect>
              ) : null,
            ),
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-ink-muted" aria-hidden="true">
        {t('stats.less')}
        {fills.map((f) => (
          <svg key={f} width={cell} height={cell}>
            <rect width={cell} height={cell} rx={2.5} className={f} />
          </svg>
        ))}
        {t('stats.more')}
      </div>
    </div>
  );
}
