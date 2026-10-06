import { Star } from 'lucide-react';
import { t } from '../../i18n/index.js';
import { formatCount } from '../../lib/format.js';

/** Read-only stars with one accessible label (TECHNICAL-PLAN §9). */
export default function StarRating({ value, count, size = 16, showValue = true, className = '' }) {
  const label = count != null ? t('a11y.rating', { value, count: formatCount(count) }) : t('a11y.ratingShort', { value });
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} role="img" aria-label={label}>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 fill-border text-border" strokeWidth={0} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star size={size} className="fill-star text-star" strokeWidth={0} />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showValue && (
        <span aria-hidden="true" className="text-sm font-semibold text-ink">
          {value.toFixed(1)}
          {count != null && <span className="ms-1 font-medium text-ink-muted">({formatCount(count)})</span>}
        </span>
      )}
    </span>
  );
}
