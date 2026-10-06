import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHydratedSearchParams } from '../hooks/useHydratedSearchParams.js';
import { categories } from '../data/categories.js';
import { findLesson, getCourse } from '../data/courses.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { courseText, lessonTitle, useOutline } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { activeLocale } from '../i18n/state.js';
import { glossaryUrl, useResource } from '../lib/resources.js';

/** Every course's key terms, grouped by track (the per-track glossaries), filterable. */
export default function GlossaryPage() {
  useOutline();
  useDocumentTitle(`${t('meta.pages.glossary')} · EduFlow`);
  const terms = useResource(glossaryUrl(activeLocale()));
  const [params, setParams] = useHydratedSearchParams();
  const track = categories.some((c) => c.id === params.get('track')) ? params.get('track') : null;
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    const out = [];
    for (const cat of categories) {
      if (track && cat.id !== track) continue;
      const items = terms
        .filter((x) => getCourse(x.course)?.category === cat.id)
        .filter((x) => !needle || x.term.toLocaleLowerCase().includes(needle) || x.definition.toLocaleLowerCase().includes(needle))
        .sort((a, b) => a.term.localeCompare(b.term, activeLocale()));
      if (items.length) out.push({ cat, items });
    }
    return out;
  }, [terms, q, track]);

  return (
    <div className="container-page pt-10 pb-12 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('glossary.title')}</h1>
      <p className="type-body-lg mt-2 text-ink-muted">{t('glossary.subtitle', { count: terms.length })}</p>
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search aria-hidden="true" size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('glossary.search')} aria-label={t('glossary.search')} className="h-11 w-full rounded-full border border-border bg-surface ps-11 pe-4 text-ink placeholder:text-ink-faint" />
        </div>
        <label className="sr-only" htmlFor="glossary-track">{t('catalog.groups.category')}</label>
        <select id="glossary-track" value={track ?? ''} onChange={(e) => setParams(e.target.value ? { track: e.target.value } : {})} className="h-11 rounded-[12px] border border-border bg-surface px-3 text-sm text-ink">
          <option value="">{t('glossary.all')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{t(`categories.${c.id}`)}</option>
          ))}
        </select>
      </div>
      {!groups.length && <p className="mt-8 text-ink-muted">{t('glossary.empty', { q })}</p>}
      {groups.map(({ cat, items }) => (
        <section key={cat.id} aria-labelledby={`g-${cat.id}`} className="mt-10">
          <h2 id={`g-${cat.id}`} className="type-h2 text-ink">
            {t(`categories.${cat.id}`)} <span className="text-base font-normal text-ink-muted">· {t('glossary.count', { count: items.length })}</span>
          </h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {items.map((x) => {
              const f = findLesson(x.lesson);
              return (
                <div key={`${x.course}-${x.id}`} id={`${x.course}-${x.id}`} className="card p-4">
                  <dt className="font-display font-semibold text-ink">{x.term}</dt>
                  <dd className="prose-sm mt-1 text-ink-muted" dangerouslySetInnerHTML={{ __html: x.definition }} />
                  {f && (
                    <dd className="mt-2 text-xs">
                      <Link to={`/courses/${f.course.id}`} className="text-primary-ink underline underline-offset-2">
                        {courseText(f.course.id).title}
                      </Link>
                      <span className="text-ink-muted"> · {t('glossary.taught', { lesson: lessonTitle(f.course.id, f.lesson.id) })}</span>
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
