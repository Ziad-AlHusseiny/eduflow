import { useParams } from 'react-router-dom';
import CourseCard from '../components/course/CourseCard.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import { getInstructor, instructorName, instructorStats } from '../data/people.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useDetails } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { formatCount } from '../lib/format.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function InstructorPage() {
  useDetails();
  const { id } = useParams();
  const i = getInstructor(id);
  useDocumentTitle(i ? `${instructorName(i)} · EduFlow` : null);
  if (!i) return <NotFoundPage />;
  const s = instructorStats(i.id);
  return (
    <div className="container-page pt-10 pb-12 lg:pt-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar id={i.id} name={i.name} size={128} eager />
        <div>
          <h1 className="type-h1 text-ink">{instructorName(i)}</h1>
          <p className="type-body-lg mt-1 text-ink-muted">{i.role} · {i.company}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            <StarRating value={s.rating} />
            <span>{t('detail.instructorStats.learners', { count: formatCount(s.learners) })}</span>
            <span>{t('detail.instructorStats.courses', { count: s.courses.length })}</span>
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 text-[17px] leading-relaxed text-ink">
          {i.bio.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
          <blockquote className="border-s-4 border-primary ps-4 text-ink-muted italic">“{i.quote}”</blockquote>
        </div>
        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="type-h4 text-ink">{t('instructors.expertise')}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {i.expertise.map((x) => (
                <li key={x}><Badge variant="primary">{x}</Badge></li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="type-h4 text-ink">{t('instructors.highlights')}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {i.highlights.map((x) => (
                <li key={x} className="flex gap-2"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{x}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
      <section className="mt-12" aria-labelledby="ins-courses">
        <h2 id="ins-courses" className="type-h2 text-ink">{t('instructors.courses', { name: instructorName(i) })}</h2>
        <ul className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {s.courses.map((c) => (
            <li key={c.id} className="flex"><CourseCard course={c} className="w-full" /></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
