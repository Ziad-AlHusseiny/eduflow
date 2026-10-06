import { Award, CheckCircle2, ClipboardList, Clock, CloudDownload, Code2, ListChecks, MonitorPlay, Trophy, WifiOff } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseEnrollment } from '../../hooks/useCourseEnrollment.js';
import { useHydrated } from '../../hooks/useMedia.js';
import { t } from '../../i18n/index.js';
import { activeLocale } from '../../i18n/state.js';
import { formatDuration, formatPrice } from '../../lib/format.js';
import { enroll } from '../../lib/learning.js';
import { downloadCourse, downloadStatus, offlineSupported, removeCourse } from '../../lib/offline.js';
import { offlineStore } from '../../lib/stores.js';
import { toast } from '../../lib/toast.js';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import CourseImage from '../ui/CourseImage.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';

function Actions({ course, compact = false }) {
  const navigate = useNavigate();
  const { enrolled, progress, target } = useCourseEnrollment(course);
  const done = enrolled && progress.pct === 100;
  if (!enrolled)
    return (
      <Button
        fullWidth
        size="lg"
        onClick={() => {
          enroll(course.id);
          toast(t('detail.enrolled'));
        }}
        data-testid="enroll-button"
      >
        {t('detail.enroll')}
      </Button>
    );
  return (
    <div className={compact ? 'flex items-center gap-3' : 'space-y-3'}>
      <div className={compact ? 'min-w-0 flex-1' : ''}>
        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
          {done ? (
            <Badge variant="success">
              <CheckCircle2 aria-hidden="true" size={14} /> {t('detail.completed')}
            </Badge>
          ) : (
            <span className="font-medium text-ink-muted" data-testid="enroll-progress">{t('detail.complete', { pct: progress.pct })}</span>
          )}
        </div>
        <ProgressBar value={progress.pct} size="md" />
      </div>
      <Button fullWidth={!compact} size={compact ? 'md' : 'lg'} variant={done ? 'secondary' : 'primary'} onClick={() => navigate(`/lesson/${course.id}/${done ? course.lessons[0].id : target}`)} data-testid="continue-button">
        {done ? t('detail.review') : t('detail.continue')}
      </Button>
    </div>
  );
}

function OfflineButton({ course }) {
  const saved = useSyncExternalStore(offlineStore.subscribe, offlineStore.get, offlineStore.getServer);
  const hydrated = useHydrated();
  const [state, setState] = useState(null);
  if (!hydrated || !offlineSupported()) return null;
  const status = downloadStatus(saved, course.id, activeLocale());
  if (status === 'current' && !state)
    return (
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-success-deep">
          <WifiOff aria-hidden="true" size={16} />
          {t('detail.downloaded')}
        </span>
        <button type="button" className="min-h-9 rounded-full px-2 text-ink-muted underline-offset-4 hover:underline" onClick={() => removeCourse(course, activeLocale())}>
          {t('detail.removeOffline')}
        </button>
      </div>
    );
  return (
    <div>
      <Button
        variant="secondary"
        fullWidth
        icon={CloudDownload}
        disabled={state?.busy}
        onClick={async () => {
          setState({ busy: true, done: 0, total: course.lessons.length + 2 });
          try {
            await downloadCourse(course, activeLocale(), (done, total) => setState({ busy: true, done, total }));
            setState(null);
          } catch {
            setState({ error: true });
          }
        }}
        data-testid="download-offline"
      >
        {state?.busy ? t('detail.downloading', { done: state.done, total: state.total }) : status === 'outdated' ? t('detail.updateOffline') : t('detail.downloadOffline')}
      </Button>
      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-danger-ink">
          {t('detail.downloadFailed')}
        </p>
      )}
    </div>
  );
}

/** The sticky enroll card (PRD §5.6); on phones the price + CTA become a fixed bottom bar (§5.7). */
export default function EnrollCard({ course }) {
  const items = [
    [MonitorPlay, t('detail.includes.minutes', { duration: formatDuration(course.durationMinutes) })],
    [ListChecks, t('detail.includes.lessons', { lessons: t('units.lessons', { count: course.lessonCount }), sections: t('units.sections', { count: course.sectionCount }) })],
    [Code2, t('detail.includes.exercises', { count: course.exerciseCount })],
    [ClipboardList, t('detail.includes.quizzes')],
    [Trophy, t('detail.includes.badge')],
    [Clock, t('detail.includes.pace')],
    [WifiOff, t('detail.includes.offline')],
  ];
  const price = (
    <p className="flex items-baseline gap-2">
      {course.price === 0 ? (
        <span className="type-h3 text-success-deep">{t('course.free')}</span>
      ) : (
        <>
          <span className="type-h3 text-ink">{formatPrice(course.price)}</span>
          {course.anchorPrice && <s className="text-ink-muted">{formatPrice(course.anchorPrice)}</s>}
        </>
      )}
    </p>
  );
  return (
    <>
      <div className="card overflow-hidden" data-testid="enroll-card">
        <CourseImage course={course} sizes="360px" className="hidden lg:block" />
        <div className="space-y-5 p-6">
          <div className="hidden lg:block">{price}</div>
          <div className="hidden lg:block">
            <Actions course={course} />
          </div>
          <ul className="space-y-2.5">
            {items.map(([I, text]) => (
              <li key={text} className="flex items-start gap-3 text-[15px] text-ink">
                <I aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
          <OfflineButton course={course} />
          {course.price > 0 && <p className="text-xs text-ink-muted">{t('detail.priceNote')}</p>}
          <CertificateLink course={course} />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-modal lg:hidden" data-chrome data-testid="enroll-bar">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="shrink-0">{price}</div>
          <div className="min-w-0 flex-1">
            <Actions course={course} compact />
          </div>
        </div>
      </div>
    </>
  );
}

function CertificateLink({ course }) {
  const { progress } = useCourseEnrollment(course);
  if (progress.pct !== 100) return null;
  return (
    <Button to={`/courses/${course.id}/certificate`} variant="ghost" fullWidth icon={Award}>
      {t('detail.certificate')}
    </Button>
  );
}
