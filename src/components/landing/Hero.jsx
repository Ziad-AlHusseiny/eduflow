import { Link } from 'react-router-dom';
import { averageRating, courses, getCourse } from '../../data/courses.js';
import { HERO_SIZES, heroImage } from '../../data/images.js';
import { courseText } from '../../i18n/content.js';
import { t } from '../../i18n/index.js';
import Button from '../ui/Button.jsx';
import CourseImage from '../ui/CourseImage.jsx';
import GradientBlob from '../ui/GradientBlob.jsx';
import StarRating from '../ui/StarRating.jsx';

const FLOATS = [
  { id: 'react-fundamentals', pos: 'start-[-6%] top-[8%] sm:start-[-10%]', delay: '0s', show: '' },
  { id: 'figma-ui-design', pos: 'end-[-6%] top-[44%] sm:end-[-10%]', delay: '0.8s', show: 'hidden md:block' },
  { id: 'ml-crash-course', pos: 'start-[4%] bottom-[-6%]', delay: '1.6s', show: 'hidden md:block' },
];

function Stat({ to, prefix = '', suffix = '', decimals, label }) {
  // "4.7" counts as two integers; "40K+" and "92%" count the integer part.
  const text = `${prefix}${decimals != null ? `${to}.${decimals}` : to}${suffix}`;
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="type-stat text-ink">
        <span className="sr-only">{text}</span>
        <span aria-hidden="true" dir="ltr" className="inline-flex">
          {prefix}
          <span className="count-up" style={{ '--to': to }} />
          {decimals != null && (
            <>
              .<span className="count-up" style={{ '--to': decimals }} />
            </>
          )}
          {suffix}
        </span>
      </dd>
      <dd aria-hidden="true" className="mt-1 text-sm text-ink-muted">
        {label}
      </dd>
    </div>
  );
}

/** The landing hero (PRD §3.1): copy + CTAs + stats; photo with floating course cards. */
export default function Hero() {
  const img = heroImage();
  const rating = averageRating();
  const [whole, dec] = String(rating.toFixed(1)).split('.');
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="container-page grid items-center gap-12 pt-10 pb-20 md:pt-14 lg:grid-cols-[55fr_45fr] lg:gap-10 lg:pt-20 lg:pb-28">
        <div className="hero-in">
          <p style={{ '--i': 0 }} className="inline-flex rounded-full bg-primary-soft px-3.5 py-1.5 text-sm font-semibold text-primary-ink">
            {t('landing.eyebrow', { rating: rating.toFixed(1), count: courses.length })}
          </p>
          <h1 id="hero-title" style={{ '--i': 1 }} className="type-display mt-6 text-ink">
            {t('landing.headline')}{' '}
            <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent [-webkit-box-decoration-break:clone]">{t('landing.headlineAccent')}</span>
          </h1>
          <p style={{ '--i': 2 }} className="type-body-lg mt-5 max-w-xl text-ink-muted">
            {t('landing.sub')}
          </p>
          <div style={{ '--i': 3 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/courses" size="lg">
              {t('landing.ctaPrimary')}
            </Button>
            <Button to="/courses?price=free" variant="secondary" size="lg">
              {t('landing.ctaSecondary')}
            </Button>
          </div>
          <dl style={{ '--i': 4 }} className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
            <Stat to={courses.length} label={t('landing.stats.courses')} />
            <Stat to={40} suffix="K+" label={t('landing.stats.learners')} />
            <Stat to={Number(whole)} decimals={Number(dec)} label={t('landing.stats.rating')} />
            <Stat to={92} suffix="%" label={t('landing.stats.faster')} />
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <GradientBlob color="violet" className="-start-16 -top-16 size-[360px]" />
          <GradientBlob color="yellow" className="-end-16 -bottom-20 size-[320px]" />
          <div className="relative overflow-hidden rounded-2xl bg-surface-muted shadow-lift">
            {img ? (
              <picture>
                <source type="image/avif" srcSet={img.avif} sizes={HERO_SIZES} />
                <img src={img.src} srcSet={img.webp} sizes={HERO_SIZES} width={img.width} height={img.height} alt={t('landing.heroAlt')} fetchPriority="high" decoding="async" className="aspect-[4/5] w-full object-cover" />
              </picture>
            ) : (
              <div className="aspect-[4/5] w-full bg-gradient-to-br from-primary-soft to-accent-soft" />
            )}
          </div>
          {FLOATS.map((f) => {
            const c = getCourse(f.id);
            if (!c) return null;
            return (
              <Link key={f.id} to={`/courses/${c.id}`} className={`card absolute w-[220px] p-2.5 shadow-lift motion-safe:animate-bob ${f.pos} ${f.show}`} style={{ animationDelay: f.delay }}>
                <CourseImage course={c} sizes="200px" className="rounded-[10px]" />
                <p className="mt-2 line-clamp-1 px-1 text-sm font-semibold text-ink">{courseText(c.id).title}</p>
                <StarRating value={c.rating} size={13} className="px-1 pb-0.5" />
              </Link>
            );
          })}
          <span aria-hidden="true" className="absolute end-[6%] top-[-4%] inline-flex items-center gap-1.5 rounded-full bg-star-soft px-3.5 py-2 text-sm font-semibold text-star-ink shadow-lift">
            {t('landing.streakChip')}
          </span>
        </div>
      </div>
    </section>
  );
}
