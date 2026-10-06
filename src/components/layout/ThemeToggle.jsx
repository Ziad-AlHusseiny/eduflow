import { Moon, Sun } from 'lucide-react';
import { t } from '../../i18n/index.js';
import { toggleTheme, useTheme } from '../../lib/theme.js';

export default function ThemeToggle({ className = '' }) {
  const theme = useTheme();
  const dark = theme === 'dark';
  return (
    <button type="button" onClick={toggleTheme} className={`grid size-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink ${className}`} aria-label={dark ? t('theme.toLight') : t('theme.toDark')} data-testid="theme-toggle">
      {dark ? <Sun aria-hidden="true" size={20} /> : <Moon aria-hidden="true" size={20} />}
    </button>
  );
}
