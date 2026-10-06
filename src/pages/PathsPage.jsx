import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { pathCourses, paths } from '../data/people.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { courseText } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { formatDuration } from '../lib/format.js';

/** Learning paths: courses sequenced into a goal. */
export default function PathsPage() {
  useDocumentTitle(`${t('meta.pages.paths')} · EduFlow`);
  return (
    <div className="container-page pt-10 pb-12 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('paths.title')}</h1>
      <p className="type-body-lg mt-2 max-w-2xl text-ink-muted">{t('paths.subtitle')}</p>
      <Button to="/placement" variant="secondary" icon={Sparkles} className="mt-6">
        {t('paths.quizCta')}
      </Button>
      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {paths().map((p, i) => {
          const list = pathCourses(p);
          return (
            <li key={p.id} data-reveal style={{ '--i': i }}>
              <Link to={`/paths/${p.id}`} className="card lift flex h-full flex-col p-6" data-testid={`path-${p.id}`}>
                <span className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-[12px] bg-primary-soft text-primary">
                    <Icon name={p.icon} size={24} />
                  </span>
                  <span>
                    <span className="type-h3 block text-ink">{p.title}</span>
                    <span className="text-sm text-ink-muted">
                      {t('paths.courses', { count: list.length })} · {t('paths.hours', { duration: formatDuration(list.reduce((s, c) => s + c.durationMinutes, 0)) })}
                    </span>
                  </span>
                </span>
                <span className="mt-4 text-ink-muted">{p.tagline}</span>
                <ol className="mt-4 flex flex-wrap gap-1.5">
                  {list.map((c, n) => (
                    <li key={c.id} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink">
                      {n + 1}. {courseText(c.id).title}
                    </li>
                  ))}
                </ol>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
