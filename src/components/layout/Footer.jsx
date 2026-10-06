import { Link } from 'react-router-dom';
import { t } from '../../i18n/index.js';
import DeveloperCredit from '../ui/DeveloperCredit.jsx';
import Logo from '../ui/Logo.jsx';

const linkCls = 'inline-flex min-h-8 items-center text-sm text-ink-muted transition-colors hover:text-primary-ink';

/** Footer (PRD §2.2) + a "Keep learning" column and the developer credit. */
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface" data-chrome>
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex rounded-[12px]" aria-label="EduFlow">
            <Logo />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-ink-muted">{t('footer.tagline')}</p>
          <p className="mt-3 max-w-xs text-xs text-ink-muted">{t('footer.privacy')}</p>
        </div>
        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className="font-display text-sm font-semibold text-ink">
            {t('footer.explore')}
          </h2>
          <ul className="mt-3 space-y-1">
            <li><Link className={linkCls} to="/">{t('nav.home')}</Link></li>
            <li><Link className={linkCls} to="/courses">{t('footer.allCourses')}</Link></li>
            <li><Link className={linkCls} to="/learning">{t('nav.learning')}</Link></li>
            <li><Link className={linkCls} to="/paths">{t('nav.paths')}</Link></li>
            <li><Link className={linkCls} to="/instructors">{t('nav.instructors')}</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-categories">
          <h2 id="footer-categories" className="font-display text-sm font-semibold text-ink">
            {t('footer.topCategories')}
          </h2>
          <ul className="mt-3 space-y-1">
            {['web-development', 'data-science', 'design', 'devops-cloud'].map((c) => (
              <li key={c}>
                <Link className={linkCls} to={`/courses?category=${c}`}>
                  {t(`categories.${c}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-learn">
          <h2 id="footer-learn" className="font-display text-sm font-semibold text-ink">
            {t('footer.learn')}
          </h2>
          <ul className="mt-3 space-y-1">
            {['review', 'notes', 'stats', 'glossary', 'placement', 'privacy'].map((id) => (
              <li key={id}>
                <Link className={linkCls} to={`/${id}`}>
                  {t(`nav.${id}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-ink-muted">{t('footer.copyright')}</p>
          <DeveloperCredit />
        </div>
      </div>
    </footer>
  );
}
