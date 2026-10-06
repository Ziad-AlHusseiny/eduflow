import { Menu, Search } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import { useEnrollments } from '../../hooks/useLearning.js';
import { useDueCount } from '../../hooks/useDueCount.js';
import { t } from '../../i18n/index.js';
import { openPalette } from '../../lib/palette.js';
import { COURSE_IDS } from '../../data/courses.js';
import Button from '../ui/Button.jsx';
import Logo from '../ui/Logo.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import MobileMenu from './MobileMenu.jsx';
import { NAV_LINKS } from './navLinks.js';
import ThemeToggle from './ThemeToggle.jsx';

function Pill({ count, label, testId }) {
  if (!count) return null;
  return (
    <span className="ms-1.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[11px] leading-none font-semibold text-white" data-testid={testId}>
      <span aria-hidden="true">{count}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Sticky navbar (PRD §2.1): logo, the links with a sliding active underline
 * (Motion layoutId), the My Learning count pill, search (⌘K), language,
 * theme and "Explore courses". Below 1024px the links move into a drawer.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { enrollments } = useEnrollments();
  const enrolled = Object.keys(enrollments).filter((id) => COURSE_IDS.has(id)).length;
  const due = useDueCount();
  const list = useRef(null);
  const [bar, setBar] = useState(null);
  const { pathname } = useLocation();
  // The active underline slides between links (PRD §2.1): one bar, moved with a CSS transition.
  useLayoutEffect(() => {
    const measure = () => {
      const active = list.current?.querySelector('a[aria-current="page"]');
      if (!active) return setBar(null);
      const box = list.current.getBoundingClientRect();
      const r = active.getBoundingClientRect();
      setBar({ left: r.left - box.left + 12, width: r.width - 24 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [pathname, enrolled, due]);

  return (
    <header className="sticky top-0 z-40 h-[68px] border-b border-border bg-surface/80 backdrop-blur-md" data-chrome>
      <div className="container-page flex h-full items-center gap-1">
        <Link to="/" className="me-auto shrink-0 rounded-[12px] py-1 pe-2" aria-label="EduFlow">
          <Logo />
        </Link>
        <nav aria-label={t('a11y.mainNav')} className="hidden lg:block">
          <ul ref={list} className="relative flex items-center">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <NavLink to={link.to} end={link.end} className={({ isActive }) => `relative inline-flex min-h-11 items-center px-3 text-[15px] font-medium transition-colors duration-(--duration-fast) hover:text-primary-ink ${isActive ? 'text-primary-ink' : 'text-ink-muted'}`}>
                  {() => (
                    <>
                      {t(`nav.${link.id}`)}
                      {link.id === 'learning' && <Pill count={enrolled} label={t('nav.enrolledCount', { count: enrolled })} testId="nav-enrolled-count" />}
                      {link.id === 'review' && <Pill count={due} label={t('nav.dueCount', { count: due })} testId="nav-due-count" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            {bar && <li aria-hidden="true" className="pointer-events-none absolute -bottom-[13px] h-0.5 rounded-full bg-primary transition-[left,width] duration-(--duration-base) ease-(--ease-out-soft)" style={{ left: bar.left, width: bar.width }} />}
          </ul>
        </nav>
        <button type="button" onClick={openPalette} className="ms-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 text-sm text-ink-muted transition-colors hover:border-primary hover:text-ink" aria-label={t('search.shortcut')} aria-keyshortcuts="Control+K Meta+K" data-testid="search-button">
          <Search aria-hidden="true" size={18} />
          <span className="hidden xl:inline">{t('search.open')}</span>
          <kbd className="kbd hidden xl:inline-grid" aria-hidden="true">
            ⌘K
          </kbd>
        </button>
        <div className="hidden sm:block">
          <LanguageToggle />
        </div>
        <ThemeToggle />
        <div className="ms-1 hidden lg:block">
          <Button to="/courses" size="md">
            {t('nav.explore')}
          </Button>
        </div>
        <button type="button" className="-me-2 grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={t('a11y.menu')} onClick={() => setOpen(true)} data-testid="menu-button">
          <Menu aria-hidden="true" size={24} />
        </button>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} enrolled={enrolled} due={due} />
    </header>
  );
}
