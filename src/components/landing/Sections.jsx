import { ArrowRight, BookOpenText, Code2, Quote, Repeat, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories.js';
import { courses, getCourse } from '../../data/courses.js';
import { getInstructor, instructorName, instructorStats, paths, testimonials } from '../../data/people.js';
import { list, t } from '../../i18n/index.js';
import { formatCount } from '../../lib/format.js';
import CourseCard from '../course/CourseCard.jsx';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import GradientBlob from '../ui/GradientBlob.jsx';
import Icon from '../ui/Icon.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import StarRating from '../ui/StarRating.jsx';

export function CategoryGrid() {
  return (
    <section className="container-page py-16 lg:py-24" aria-labelledby="categories-title">
      <SectionHeading id="categories-title" eyebrow={t('landing.categories.eyebrow')} title={t('landing.categories.title')} subtitle={t('landing.categories.subtitle')} />
      <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {categories.map((c, i) => {
          const count = courses.filter((x) => x.category === c.id).length;
          return (
            <li key={c.id} data-reveal style={{ '--i': i }}>
              <Link to={`/courses?category=${c.id}`} className="card lift group flex h-full flex-col items-center gap-3 p-5 text-center md:p-6" data-testid={`category-${c.id}`}>
                <span className="grid size-12 place-items-center rounded-[12px] bg-primary-soft text-primary transition-colors duration-(--duration-fast) group-hover:bg-primary group-hover:text-white">
                  <Icon name={c.icon} size={24} />
                </span>
                <span className="type-h4 text-ink">{t(`categories.${c.id}`)}</span>
                <span className="text-sm text-ink-muted">{t('units.courses', { count })}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function FeaturedCourses() {
  const featured = courses.filter((c) => c.featured);
  return (
    <section className="bg-surface-muted/60 py-16 lg:py-24" aria-labelledby="featured-title">
      <div className="container-page">
        <SectionHeading id="featured-title" eyebrow={t('landing.featured.eyebrow')} title={t('landing.featured.title')} subtitle={t('landing.featured.subtitle')} />
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((c, i) => (
            <li key={c.id} data-reveal style={{ '--i': i }} className="flex">
              <CourseCard course={c} className="w-full" />
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <Button to="/courses" variant="secondary" iconEnd={ArrowRight}>
            {t('landing.featured.browse', { count: courses.length })}
          </Button>
        </div>
      </div>
    </section>
  );
}

const HOW_ICONS = [BookOpenText, Code2, Target, Repeat];
export function HowItWorks() {
  const steps = list('landing.how.steps');
  return (
    <section className="container-page py-16 lg:py-24" aria-labelledby="how-title">
      <SectionHeading id="how-title" eyebrow={t('landing.how.eyebrow')} title={t('landing.how.title')} subtitle={t('landing.how.subtitle')} />
      <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => {
          const I = HOW_ICONS[i];
          return (
            <li key={s.title} className="card relative p-6" data-reveal style={{ '--i': i }}>
              <span className="absolute end-5 top-5 font-display text-4xl font-bold text-primary-soft" aria-hidden="true">
                {i + 1}
              </span>
              <span className="grid size-11 place-items-center rounded-[12px] bg-primary-soft text-primary">
                <I aria-hidden="true" size={22} />
              </span>
              <h3 className="type-h4 mt-4 text-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] text-ink-muted">{s.text}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function PathsTeaser() {
  const list_ = paths();
  return (
    <section className="bg-surface-muted/60 py-16 lg:py-24" aria-labelledby="paths-title">
      <div className="container-page">
        <SectionHeading id="paths-title" eyebrow={t('landing.paths.eyebrow')} title={t('landing.paths.title')} subtitle={t('landing.paths.subtitle')} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list_.map((p, i) => (
            <li key={p.id} data-reveal style={{ '--i': i }}>
              <Link to={`/paths/${p.id}`} className="card lift flex h-full items-start gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
                  <Icon name={p.icon} size={22} />
                </span>
                <span>
                  <span className="type-h4 block text-ink">{p.title}</span>
                  <span className="mt-1 block text-sm text-ink-muted">{p.tagline}</span>
                  <span className="mt-2 block text-[13px] font-medium text-primary-ink">{t('landing.paths.courses', { count: p.courses.filter((id) => getCourse(id)).length })}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/placement" icon={Sparkles}>
            {t('landing.paths.quiz')}
          </Button>
          <Button to="/paths" variant="secondary">
            {t('landing.paths.all')}
          </Button>
        </div>
      </div>
    </section>
  );
}

const LANDING_INSTRUCTORS = ['maya-chen', 'sofia-reyes', 'liam-patel', 'amara-diallo'];
export function InstructorHighlights() {
  return (
    <section className="container-page py-16 lg:py-24" aria-labelledby="instructors-title">
      <SectionHeading id="instructors-title" eyebrow={t('landing.instructors.eyebrow')} title={t('landing.instructors.title')} subtitle={t('landing.instructors.subtitle')} />
      <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {LANDING_INSTRUCTORS.map((id, i) => {
          const ins = getInstructor(id);
          if (!ins) return null;
          const s = instructorStats(id);
          return (
            <li key={id} className="card flex flex-col items-center p-6 text-center" data-reveal style={{ '--i': i }}>
              <Avatar id={id} name={ins.name} size={88} />
              <h3 className="type-h4 mt-4 text-ink">{instructorName(ins)}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {ins.role} · {ins.company}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-muted">
                <StarRating value={s.rating} showValue={false} size={14} />
                <span>{t('landing.learnersCount', { rating: s.rating.toFixed(1), count: formatCount(s.learners) })}</span>
              </p>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 text-center">
        <Button to="/instructors" variant="secondary" iconEnd={ArrowRight}>
          {t('landing.instructors.meet')}
        </Button>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-surface-muted/60 py-16 lg:py-24" aria-labelledby="testimonials-title">
      <div className="container-page">
        <SectionHeading id="testimonials-title" eyebrow={t('landing.testimonials.eyebrow')} title={t('landing.testimonials.title')} />
        <ul className="mx-auto mt-12 grid max-w-2xl gap-6 lg:max-w-none lg:grid-cols-3">
          {testimonials().map((x, i) => (
            <li key={x.id} className="card flex flex-col p-6" data-reveal style={{ '--i': i }}>
              <Quote aria-hidden="true" size={28} className="text-primary-soft" />
              <StarRating value={5} showValue={false} className="mt-3" />
              <blockquote className="mt-3 flex-1 text-ink">“{x.quote}”</blockquote>
              <div className="mt-5 flex items-center gap-3">
                <Avatar id={x.id === 't-1' ? 'jasmine-torres' : x.id === 't-2' ? 'marcus-webb' : 'priya-nair'} name={x.name} size={44} />
                <div>
                  <p className="font-semibold text-ink">{x.name}</p>
                  <p className="text-sm text-ink-muted">{x.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="container-page pt-16 lg:pt-24" aria-labelledby="cta-title">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] px-6 py-14 text-center text-white md:px-12" data-reveal>
        <GradientBlob color="yellow" className="-end-20 -top-24 size-72 opacity-60" />
        <GradientBlob color="blue" className="-bottom-24 -start-16 size-72" />
        <h2 id="cta-title" className="type-h2 relative">
          {t('landing.cta.title')}
        </h2>
        <p className="type-body-lg relative mx-auto mt-3 max-w-xl text-white/90">{t('landing.cta.text')}</p>
        <div className="relative mt-8">
          <Button to="/courses?price=free" variant="inverse" size="lg" className="w-full sm:w-auto">
            {t('landing.cta.button')}
          </Button>
        </div>
      </div>
    </section>
  );
}
