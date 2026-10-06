import { Check, CheckCircle2, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import CourseImage from '../components/ui/CourseImage.jsx';
import Icon from '../components/ui/Icon.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { getPath, pathCourses } from '../data/people.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useEnrollments } from '../hooks/useLearning.js';
import { useStored } from '../hooks/useStored.js';
import { courseText } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { formatDuration } from '../lib/format.js';
import { progressFor } from '../lib/progress.js';
import { pathStore } from '../lib/stores.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function PathDetailPage() {
  const { id } = useParams();
  const p = getPath(id);
  useDocumentTitle(p ? `${p.title} · EduFlow` : null);
  const es = useEnrollments();
  const [followed, setFollowed] = useStored(pathStore);
  if (!p) return <NotFoundPage />;
  const list = pathCourses(p);
  const following = followed === p.id;
  return (
    <div className="container-page max-w-4xl pt-10 pb-12 lg:pt-14">
      <Link to="/paths" className="text-sm font-medium text-ink-muted hover:text-ink">
        {t('paths.title')}
      </Link>
      <div className="mt-4 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Icon name={p.icon} size={28} />
        </span>
        <h1 className="type-h1 text-ink">{p.title}</h1>
      </div>
      <p className="type-body-lg mt-4 text-ink-muted">{p.description}</p>
      <p className="mt-2 text-sm text-ink-muted">
        {t('paths.courses', { count: list.length })} · {t('paths.hours', { duration: formatDuration(list.reduce((s, c) => s + c.durationMinutes, 0)) })}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant={following ? 'secondary' : 'primary'} icon={following ? Check : undefined} onClick={() => setFollowed(following ? null : p.id)} aria-pressed={following} data-testid="follow-path">
          {following ? t('paths.following') : t('paths.follow')}
        </Button>
        <Button to="/placement" variant="ghost" icon={Sparkles}>
          {t('paths.quizCta')}
        </Button>
      </div>
      <section aria-labelledby="outcomes" className="card mt-10 p-6">
        <h2 id="outcomes" className="type-h3 text-ink">{t('paths.outcomes')}</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {p.outcomes.map((o) => (
            <li key={o} className="flex gap-3 text-ink">
              <Check aria-hidden="true" size={18} className="mt-1 shrink-0 text-success" />
              {o}
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="seq" className="mt-10">
        <h2 id="seq" className="type-h2 text-ink">{t('paths.sequence')}</h2>
        <ol className="mt-5 space-y-4">
          {list.map((c, i) => {
            const e = es.enrollments[c.id];
            const pr = progressFor(c, e?.completedLessonIds ?? []);
            return (
              <li key={c.id}>
                <Link to={`/courses/${c.id}`} className="card lift flex items-center gap-4 overflow-hidden">
                  <CourseImage course={c} sizes="160px" className="w-28 shrink-0 sm:w-40" />
                  <span className="min-w-0 flex-1 py-3 pe-4">
                    <span className="text-[13px] font-semibold text-primary-ink">{t('paths.step', { n: i + 1 })}</span>
                    <span className="type-h4 block truncate text-ink">{courseText(c.id).title}</span>
                    <span className="block text-sm text-ink-muted">{formatDuration(c.durationMinutes)}</span>
                    {e && (
                      <span className="mt-2 flex items-center gap-2">
                        <ProgressBar value={pr.pct} size="sm" className="flex-1" />
                        {pr.pct === 100 ? <CheckCircle2 aria-label={t('paths.done')} size={18} className="text-success" /> : <span className="text-xs text-ink-muted">{t('paths.inProgress', { pct: pr.pct })}</span>}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
