import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLearning } from '../../hooks/useLearning.js';
import { useHydrated } from '../../hooks/useMedia.js';
import { t } from '../../i18n/index.js';
import { isPaletteOpen, openPalette, subscribePalette } from '../../lib/palette.js';
import Toaster from '../ui/Toaster.jsx';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';
import OfflineBanner from './OfflineBanner.jsx';
import PageErrorBoundary from './PageErrorBoundary.jsx';

const CommandPalette = lazy(() => import('../search/CommandPalette.jsx'));
const BadgeHost = lazy(() => import('../learning/BadgeHost.jsx'));

function PageFallback() {
  return (
    <div className="container-page py-16" aria-busy="true">
      <span className="sr-only">{t('a11y.loading')}</span>
      <div className="h-10 w-2/3 animate-pulse rounded-xl bg-surface-muted" />
      <div className="mt-6 h-4 w-full animate-pulse rounded bg-surface-muted" />
      <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}

/**
 * On a new page, scroll to the top — or, for a #link (a glossary term from
 * ⌘K, "View all achievements"), to that element once the page has rendered
 * it (the page may still be loading). Query changes keep the position.
 */
function useScrollReset(pathname, hash) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return undefined;
    }
    let id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      id = hash.slice(1);
    }
    let raf = 0;
    const started = performance.now();
    const find = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: 'start', behavior: 'instant' });
        if (el.hasAttribute('tabindex') || el.tabIndex >= 0) el.focus({ preventScroll: true });
      } else if (performance.now() - started < 4000) raf = requestAnimationFrame(find);
      else window.scrollTo({ top: 0, behavior: 'instant' });
    };
    find();
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
}

/** The badge pop and the ⌘K palette, mounted after hydration (in their own
 * component, so the layout itself never re-renders while the page hydrates). */
function LateHosts() {
  const hydrated = useHydrated();
  const paletteOpen = useSyncExternalStore(subscribePalette, isPaletteOpen, () => false);
  const { earned, stats } = useLearning();
  // What was already earned when the app started: that never pops. Taken
  // here (in the entry), not in the lazy badge host, so a lesson completed
  // before its chunk arrives still pops.
  const [baseline, setBaseline] = useState(null);
  if (hydrated && !baseline) setBaseline({ earned: new Set(earned), courses: new Set(stats.completedCourseIds) });
  if (!hydrated || !baseline) return null;
  return (
    <Suspense fallback={null}>
      <BadgeHost baseline={baseline} />
      {paletteOpen && <CommandPalette />}
    </Suspense>
  );
}

/**
 * The layout route (PRD §2): skip link, navbar, the page, footer, and the
 * app-wide hosts — toasts, the badge pop, the ⌘K palette.
 */
export default function RootLayout() {
  const { pathname, hash } = useLocation();
  // The first page is already painted (prerendered): only later pages rise in.
  const [navigated, setNavigated] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setNavigated(true);
  }
  useScrollReset(pathname, hash);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.code === 'KeyK' || e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        {t('a11y.skip')}
      </a>
      <Navbar />
      <OfflineBanner />
      <main id="main" tabIndex={-1} className="outline-none">
        <div key={pathname} className={navigated ? 'motion-safe:animate-[page-in_250ms_var(--ease-out-soft)]' : undefined}>
          <PageErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </PageErrorBoundary>
        </div>
      </main>
      <Footer />
      <Toaster />
      <LateHosts />
    </>
  );
}
