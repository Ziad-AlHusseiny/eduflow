// Number, duration and date formatting in the active language (Latin digits
// in Arabic too: LOCALES.ar uses -u-nu-latn).

import { t } from '../i18n/index.js';
import { intlLocale } from '../i18n/state.js';

/** 320 → "5h 20m", 45 → "45m" (localized units). */
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (!h) return t('units.m', { m });
  if (!m) return t('units.h', { h });
  return t('units.hm', { h, m });
}

/** 12400 → "12,400" */
export const formatCount = (n) => new Intl.NumberFormat(intlLocale()).format(n);

/** 40000 → "40K" */
export const formatCompact = (n) => new Intl.NumberFormat(intlLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export const formatPrice = (usd) => (usd === 0 ? t('course.free') : new Intl.NumberFormat(intlLocale(), { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd));

/** "June 2026" */
export const formatMonth = (iso) => new Intl.DateTimeFormat(intlLocale(), { month: 'long', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));

/** "5 Oct 2026" */
export const formatDate = (iso) => new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso));

/** "2 months ago", relative to `now`. */
export function formatRelative(iso, now = new Date()) {
  const days = Math.round((now - new Date(`${iso.slice(0, 10)}T12:00:00`)) / 86400000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(), { numeric: 'auto' });
  if (Math.abs(days) < 7) return rtf.format(-days, 'day');
  if (Math.abs(days) < 35) return rtf.format(-Math.round(days / 7), 'week');
  if (Math.abs(days) < 365) return rtf.format(-Math.round(days / 30), 'month');
  return rtf.format(-Math.round(days / 365), 'year');
}

export const formatPercent = (pct) => new Intl.NumberFormat(intlLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(pct / 100);
