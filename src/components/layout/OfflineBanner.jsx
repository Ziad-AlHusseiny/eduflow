import { WifiOff } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { t } from '../../i18n/index.js';

const subscribe = (fn) => {
  window.addEventListener('online', fn);
  window.addEventListener('offline', fn);
  return () => {
    window.removeEventListener('online', fn);
    window.removeEventListener('offline', fn);
  };
};

/** A slim notice while offline: downloaded lessons and progress still work. */
export default function OfflineBanner() {
  const offline = useSyncExternalStore(subscribe, () => !navigator.onLine, () => false);
  if (!offline) return null;
  return (
    <div role="status" className="border-b border-border bg-star-soft text-star-ink" data-chrome>
      <p className="container-page flex items-center gap-2 py-2 text-sm font-medium">
        <WifiOff aria-hidden="true" size={16} />
        {t('offline.status')}
      </p>
    </div>
  );
}
