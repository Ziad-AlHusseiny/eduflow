import { X } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import { t } from '../../i18n/index.js';
import { dismissToast, getToast, subscribeToast } from '../../lib/toast.js';

/** Notifications (DESIGN-SYSTEM §6.7): bottom-right card, full-width banner on phones; announced politely. */
export default function Toaster() {
  const item = useSyncExternalStore(subscribeToast, getToast, () => null);

  useEffect(() => {
    if (!item || item.persistent) return undefined;
    const timer = setTimeout(() => {
      if (getToast()?.id === item.id) dismissToast();
    }, item.duration);
    return () => clearTimeout(timer);
  }, [item]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-6" data-chrome>
      <div role="status" aria-live="polite" className="w-full md:w-auto">
        {item && (
          <div key={item.id} className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-border bg-surface py-2 ps-4 pe-2 text-ink shadow-modal motion-safe:animate-[rise-in_250ms_var(--ease-out-soft)] md:max-w-[380px]" data-testid="toast">
            <p className="flex-1 py-1.5 text-sm font-medium">{item.message}</p>
            {item.action && (
              <button
                type="button"
                className="min-h-9 shrink-0 rounded-full px-3 text-sm font-semibold text-primary-ink hover:bg-primary-soft"
                onClick={() => {
                  item.action.onClick();
                  dismissToast();
                }}
              >
                {item.action.label}
              </button>
            )}
            <button type="button" onClick={dismissToast} className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink" aria-label={t('toast.dismiss')}>
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
