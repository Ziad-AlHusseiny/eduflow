import { AnimatePresence, LazyMotion, m } from 'motion/react';
import { ChevronDown, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useHydratedSearchParams } from '../hooks/useHydratedSearchParams.js';
import CourseCard from '../components/course/CourseCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { CATEGORY_IDS } from '../data/categories.js';
import { courses } from '../data/courses.js';
import { getInstructor } from '../data/people.js';
import { useDebounced } from '../hooks/useDebounced.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useReducedMotion } from '../hooks/useMedia.js';
import en from '../generated/text.en.js';
import { courseText } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { activeCount, clearedParams, DURATIONS, filterCourses, LEVELS, parseFilters, PRACTICES, PRICES, RATINGS, SORTS, sortCourses, toggleParam } from '../lib/filters.js';
import { loadFeatures, useMotionReady } from '../lib/motion.js';

/** Search matches title, tagline, category and instructor, in this language and English (PRD §4.1). */
const haystack = (c) => {
  const ins = getInstructor(c.instructorId);
  return [courseText(c.id).title, courseText(c.id).tagline, en.courses[c.id]?.title, en.courses[c.id]?.tagline, t(`categories.${c.category}`), ins?.name, ins?.nameAr];
};

function FilterGroup({ legend, name, options, selected, single, onToggle, counts }) {
  return (
    <fieldset className="border-b border-border py-4 last:border-0">
      <legend className="float-start mb-2 w-full font-display text-sm font-semibold text-ink">{legend}</legend>
      <div className="clear-both space-y-0.5">
        {options.map((o) => (
          <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-2 text-sm text-ink hover:bg-surface-muted">
            <input type={single ? 'radio' : 'checkbox'} name={name} value={o.value} checked={selected.includes(o.value)} onChange={() => onToggle(name, o.value)} onClick={single && selected.includes(o.value) ? () => onToggle(name, o.value) : undefined} className="size-[18px] accent-[var(--color-primary)]" />
            <span className="flex-1">{o.label}</span>
            {counts && <span className="text-xs text-ink-muted">{counts[o.value] ?? 0}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Filters({ f, onToggle }) {
  const count = (key, fn) => Object.fromEntries((key === 'category' ? CATEGORY_IDS : []).map((v) => [v, courses.filter((c) => fn(c, v)).length]));
  return (
    <div>
      <FilterGroup legend={t('catalog.groups.category')} name="category" selected={f.category} onToggle={onToggle} options={CATEGORY_IDS.map((v) => ({ value: v, label: t(`categories.${v}`) }))} counts={count('category', (c, v) => c.category === v)} />
      <FilterGroup legend={t('catalog.groups.level')} name="level" selected={f.level} onToggle={onToggle} options={LEVELS.map((v) => ({ value: v, label: t(`levels.${v}`) }))} />
      <FilterGroup legend={t('catalog.groups.price')} name="price" selected={f.price} onToggle={onToggle} options={PRICES.map((v) => ({ value: v, label: t(`catalog.price.${v}`) }))} />
      <FilterGroup legend={t('catalog.groups.rating')} name="rating" single selected={f.rating ? [f.rating] : []} onToggle={onToggle} options={RATINGS.map((v) => ({ value: v, label: t(`catalog.rating.${v}`) }))} />
      <FilterGroup legend={t('catalog.groups.duration')} name="duration" selected={f.duration} onToggle={onToggle} options={DURATIONS.map((v) => ({ value: v, label: t(`catalog.duration.${v}`) }))} />
      <FilterGroup legend={t('catalog.groups.practice')} name="practice" selected={f.practice} onToggle={onToggle} options={PRACTICES.map((v) => ({ value: v, label: t(`catalog.practice.${v}`) }))} />
    </div>
  );
}

/** The catalog (PRD §4): search, filters and sort, all in the URL. */
export default function CoursesPage() {
  useDocumentTitle(`${t('meta.pages.courses')} · EduFlow`);
  const [params, setParams] = useHydratedSearchParams();
  const f = useMemo(() => parseFilters(params, { categories: CATEGORY_IDS }), [params]);
  const [q, setQ] = useState(f.q);
  const debounced = useDebounced(q, 200);
  const [sheet, setSheet] = useState(false);
  const sortId = useId();
  const ready = useMotionReady();
  const reduced = useReducedMotion();

  // Back/forward changes ?q=: follow it.
  const [lastParamQ, setLastParamQ] = useState(f.q);
  if (f.q !== lastParamQ) {
    setLastParamQ(f.q);
    setQ(f.q);
  }
  // Push the debounced search into the URL — only when the typing changed it.
  // (setParams changes identity whenever the URL does, so the effect re-runs
  // after a "Clear all"; comparing with the last pushed value keeps a stale
  // debounced query from coming back.)
  const lastPushed = useRef(debounced);
  useEffect(() => {
    if (debounced === lastPushed.current) return;
    lastPushed.current = debounced;
    setParams(
      (prev) => {
        if (debounced === (prev.get('q') ?? '')) return prev;
        const next = new URLSearchParams(prev);
        if (debounced.trim()) next.set('q', debounced);
        else next.delete('q');
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [debounced, setParams]);

  const results = useMemo(() => sortCourses(filterCourses(courses, f, haystack), f.sort), [f]);
  const onToggle = (key, value) => setParams(toggleParam(params, key, value), { preventScrollReset: true });
  const clearAll = () => {
    setQ('');
    setParams(clearedParams(params), { preventScrollReset: true });
  };
  const chips = [
    ...f.category.map((v) => ['category', v, t(`categories.${v}`)]),
    ...f.level.map((v) => ['level', v, t(`levels.${v}`)]),
    ...f.price.map((v) => ['price', v, t(`catalog.price.${v}`)]),
    ...(f.rating ? [['rating', f.rating, t(`catalog.rating.${f.rating}`)]] : []),
    ...f.duration.map((v) => ['duration', v, t(`catalog.duration.${v}`)]),
    ...f.practice.map((v) => ['practice', v, t(`catalog.practice.${v}`)]),
  ];
  const n = activeCount(f);
  const animate = ready && !reduced;

  return (
    <LazyMotion features={loadFeatures}>
    <div className="container-page pt-10 pb-8 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('catalog.title')}</h1>
      <p className="type-body-lg mt-2 text-ink-muted">{t('catalog.subtitle', { count: courses.length })}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label={t('catalog.filters')}>
          <div className="card sticky top-[84px] max-h-[calc(100vh-100px)] overflow-y-auto px-4 py-1">
            <Filters f={f} onToggle={onToggle} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search aria-hidden="true" size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('catalog.searchPlaceholder')} aria-label={t('catalog.searchLabel')} className="h-11 w-full rounded-full border border-border bg-surface ps-11 pe-4 text-[15px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-2 focus:outline-primary/30" data-testid="catalog-search" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="lg:hidden" icon={SlidersHorizontal} onClick={() => setSheet(true)} data-testid="filters-button">
                {n ? t('catalog.filtersCount', { count: n }) : t('catalog.filters')}
              </Button>
              <label htmlFor={sortId} className="sr-only">
                {t('catalog.sortLabel')}
              </label>
              <div className="relative flex-1 md:flex-none">
                <select id={sortId} value={f.sort} onChange={(e) => {
                  const next = new URLSearchParams(params);
                  if (e.target.value === 'popular') next.delete('sort');
                  else next.set('sort', e.target.value);
                  setParams(next, { preventScrollReset: true });
                }} className="h-11 w-full appearance-none rounded-[12px] border border-border bg-surface ps-4 pe-10 text-sm font-medium text-ink" data-testid="sort-select">
                  {SORTS.map((s) => (
                    <option key={s} value={s}>
                      {t(`catalog.sort.${s}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label={t('catalog.filters')}>
              {chips.map(([key, value, label]) => (
                <li key={`${key}-${value}`}>
                  <button type="button" onClick={() => onToggle(key, value)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary-soft py-1 ps-3 pe-2 text-[13px] font-medium text-primary-ink transition-colors hover:brightness-95" aria-label={t('catalog.remove', { name: label })}>
                    {label}
                    <X aria-hidden="true" size={14} />
                  </button>
                </li>
              ))}
              {chips.length >= 2 && (
                <li>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    {t('catalog.clearAll')}
                  </Button>
                </li>
              )}
            </ul>
          )}

          <p className="mt-5 text-sm font-medium text-ink-muted" role="status" data-testid="results-count">
            {t('catalog.showing', { shown: results.length, total: courses.length })}
          </p>

          <h2 className="sr-only">{t('catalog.results')}</h2>
          {results.length === 0 ? (
            <EmptyState icon={SearchX} title={t('catalog.empty.title')} message={t('catalog.empty.message')} actionLabel={t('catalog.empty.action')} onAction={clearAll} />
          ) : (
            <ul className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="course-grid">
              {animate ? (
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.map((c, i) => (
                    <m.li key={c.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="flex">
                      <CourseCard course={c} className="w-full" />
                    </m.li>
                  ))}
                </AnimatePresence>
              ) : (
                results.map((c) => (
                  <li key={c.id} className="flex">
                    <CourseCard course={c} className="w-full" />
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      <Modal open={sheet} onClose={() => setSheet(false)} title={t('catalog.filters')} footer={<Button fullWidth onClick={() => setSheet(false)}>{t('catalog.apply')}</Button>} testId="filter-sheet">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border md:hidden" aria-hidden="true" />
        <Filters f={f} onToggle={onToggle} />
      </Modal>
    </div>
    </LazyMotion>
  );
}
