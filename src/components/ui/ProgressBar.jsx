import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n/index.js';

const SIZES = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' };

/**
 * An animated fill bar (DESIGN-SYSTEM §6.6): fills from 0 on first mount,
 * then from the previous value; green at 100%; snaps under reduced motion
 * (CSS). role="progressbar" with its value.
 */
export default function ProgressBar({ value, size = 'sm', tone, label, className = '', animate = true }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const [shown, setShown] = useState(animate ? 0 : pct);
  const first = useRef(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(pct));
    first.current = false;
    return () => cancelAnimationFrame(id);
  }, [pct]);
  const green = tone === 'green' || (tone == null && pct === 100);
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? t('a11y.progress', { pct })} className={`w-full overflow-hidden rounded-full bg-primary-soft ${SIZES[size]} ${className}`}>
      <div className={`h-full rounded-full transition-[width] duration-(--duration-progress) ease-(--ease-out-soft) ${green ? 'bg-success' : 'bg-primary'}`} style={{ width: `${shown}%` }} />
    </div>
  );
}
