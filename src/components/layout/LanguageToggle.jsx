import { Languages } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { t } from '../../i18n/index.js';
import { localeHref, otherLocale, switchLocale } from '../../lib/locale.js';

/**
 * The other language, on the same page. A real link (works before
 * hydration and without JS); with JS it swaps in place.
 */
export default function LanguageToggle({ onSwitch, className = '' }) {
  const { pathname, search } = useLocation();
  const next = otherLocale();
  return (
    <a
      href={localeHref(next, pathname, search)}
      hrefLang={next}
      lang={next}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onSwitch?.();
        switchLocale(next);
      }}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink ${className}`}
      aria-label={t('language.label')}
      data-testid="language-toggle"
    >
      <Languages aria-hidden="true" size={18} />
      <span>{t('language.switchTo')}</span>
    </a>
  );
}
