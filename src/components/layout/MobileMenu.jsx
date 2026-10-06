import { BarChart3, BookA, NotebookPen, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { t } from '../../i18n/index.js';
import { lockScroll, unlockScroll } from '../../lib/dialogs.js';
import Button from '../ui/Button.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import { NAV_LINKS } from './navLinks.js';

const MORE = [
  { id: 'notes', to: '/notes', icon: NotebookPen },
  { id: 'stats', to: '/stats', icon: BarChart3 },
  { id: 'glossary', to: '/glossary', icon: BookA },
  { id: 'instructors', to: '/instructors', icon: Users },
  { id: 'placement', to: '/placement', icon: Sparkles },
  { id: 'privacy', to: '/privacy', icon: ShieldCheck },
];

const row = ({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-3 font-display text-lg font-semibold transition-colors hover:bg-surface-muted ${isActive ? 'bg-primary-soft text-primary-ink' : 'text-ink'}`;

/**
 * The phone/tablet menu (PRD §2.1): a full-height drawer from the inline end
 * on the native modal <dialog> — focus trapped, Esc and the backdrop close
 * it, focus returns to the hamburger.
 */
export default function MobileMenu({ open, onClose, enrolled, due }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const lastPath = useRef(pathname);

  // Open ↔ the modal dialog and the scroll lock, released by the cleanup, so
  // it is also released when the menu unmounts before its close event (the
  // language switch remounts the whole app).
  useEffect(() => {
    const d = ref.current;
    if (!d || !open) return undefined;
    if (!d.open) d.showModal();
    lockScroll();
    return () => {
      unlockScroll();
      if (d.open) d.close();
    };
  }, [open]);

  useEffect(() => {
    if (pathname !== lastPath.current) {
      lastPath.current = pathname;
      if (open) onClose();
    }
  }, [pathname, open, onClose]);

  return (
    <dialog
      ref={ref}
      id="mobile-menu"
      aria-label={t('a11y.mainNav')}
      className="drawer m-0 ms-auto h-dvh max-h-dvh w-[min(320px,calc(100vw-48px))] max-w-none bg-surface p-0 text-ink shadow-modal open:flex open:flex-col"
      onClose={() => {
        onClose();
        document.querySelector('[data-testid="menu-button"]')?.focus();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      data-testid="mobile-menu"
    >
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-border px-4">
        <span className="font-display font-semibold">EduFlow</span>
        <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full hover:bg-surface-muted" aria-label={t('a11y.close')}>
          <X aria-hidden="true" size={22} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <NavLink to={l.to} end={l.end} className={row}>
                <l.icon aria-hidden="true" size={20} className="text-ink-muted" />
                <span className="flex-1">{t(`nav.${l.id}`)}</span>
                {l.id === 'learning' && enrolled > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">{enrolled}</span>}
                {l.id === 'review' && due > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">{due}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 border-t border-border pt-3">
          {MORE.map((l) => (
            <li key={l.id}>
              <NavLink to={l.to} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors hover:bg-surface-muted ${isActive ? 'text-primary-ink' : 'text-ink-muted'}`}>
                <l.icon aria-hidden="true" size={18} />
                {t(`nav.${l.id}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-wrap items-center gap-3 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button to="/courses" className="grow">
          {t('nav.explore')}
        </Button>
        <LanguageToggle onSwitch={onClose} />
      </div>
    </dialog>
  );
}
