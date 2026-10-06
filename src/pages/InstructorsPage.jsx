import { Link } from 'react-router-dom';
import Avatar from '../components/ui/Avatar.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import { instructorName, instructors, instructorStats } from '../data/people.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useDetails } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { formatCount } from '../lib/format.js';

export default function InstructorsPage() {
  useDetails();
  useDocumentTitle(`${t('meta.pages.instructors')} · EduFlow`);
  return (
    <div className="container-page pt-10 pb-12 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('instructors.title')}</h1>
      <p className="type-body-lg mt-2 text-ink-muted">{t('instructors.subtitle')}</p>
      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instructors().map((i) => {
          const s = instructorStats(i.id);
          return (
            <li key={i.id}>
              <Link to={`/instructors/${i.id}`} className="card lift flex h-full flex-col items-center p-6 text-center">
                <Avatar id={i.id} name={i.name} size={96} />
                <span className="type-h3 mt-4 text-ink">{instructorName(i)}</span>
                <span className="mt-1 text-sm text-ink-muted">{i.role} · {i.company}</span>
                <StarRating value={s.rating} className="mt-3" />
                <span className="mt-2 text-sm text-ink-muted">{t('detail.instructorStats.learners', { count: formatCount(s.learners) })} · {t('detail.instructorStats.courses', { count: s.courses.length })}</span>
                <span className="mt-4 text-sm italic text-ink">“{i.quote}”</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
