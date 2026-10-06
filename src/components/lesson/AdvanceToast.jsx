import { useEffect, useRef } from 'react';
import { t } from '../../i18n/index.js';
import Button from '../ui/Button.jsx';

/**
 * "Up next" (PRD §7.4): auto-navigates after `seconds` unless Stay is
 * pressed; a draining line shows the countdown. Announced politely.
 */
export default function AdvanceToast({ title, seconds = 3, onGo, onStay }) {
  const go = useRef(onGo);
  useEffect(() => {
    go.current = onGo;
  });
  useEffect(() => {
    const timer = setTimeout(() => go.current(), seconds * 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-end p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-6" data-chrome>
      <div role="status" aria-live="polite" className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-modal motion-safe:animate-[rise-in_250ms_var(--ease-out-soft)] md:max-w-[380px]" data-testid="advance-toast">
        <p className="text-sm font-medium text-ink">{t('lesson.upNext', { title })}</p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={onGo} data-testid="advance-go">
            {t('lesson.goNow')}
          </Button>
          <Button size="sm" variant="ghost" onClick={onStay} data-testid="advance-stay" autoFocus>
            {t('lesson.stay')}
          </Button>
        </div>
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-primary rtl:origin-right" style={{ animation: `drain ${seconds}s linear forwards` }} />
      </div>
    </div>
  );
}
