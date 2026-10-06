import { useId, useState } from 'react';
import { t } from '../../i18n/index.js';

/**
 * A single-series bar chart in plain SVG (no chart library): thin bars
 * with rounded data-ends on the baseline, a recessive grid, a hover/focus
 * tooltip per bar, and a table view for screen readers and anyone who
 * prefers numbers.
 */
export function BarChart({ data, label, height = 180, formatX = (x) => x, unit = '' }) {
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);
  const id = useId();
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = Math.ceil(max / Math.max(1, 10 ** Math.floor(Math.log10(max)))) * 10 ** Math.floor(Math.log10(max));
  const W = 640;
  const pad = { l: 32, r: 8, t: 12, b: 26 };
  const bw = (W - pad.l - pad.r) / data.length;
  const y = (v) => pad.t + (height - pad.t - pad.b) * (1 - v / nice);
  const ticks = [0, nice / 2, nice];
  return (
    <div>
      {table ? (
        <div className="table-wrap" tabIndex={0} role="region" aria-label={label}>
          <table>
            <thead>
              <tr>
                <th scope="col">{t('stats.day')}</th>
                <th scope="col">{t('stats.value')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.key}>
                  <td>{d.full ?? formatX(d.label)}</td>
                  <td>{d.value}{unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative" dir="ltr">
          <svg viewBox={`0 0 ${W} ${height}`} className="h-auto w-full" role="img" aria-labelledby={`${id}-t`}>
            <title id={`${id}-t`}>{label}</title>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={1} />
                <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" className="fill-ink-muted text-[11px]">
                  {Math.round(v)}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const x = pad.l + i * bw + bw * 0.18;
              const w = Math.max(2, bw * 0.64);
              const top = y(d.value);
              const h = height - pad.b - top;
              return (
                <g key={d.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={pad.l + i * bw} y={pad.t} width={bw} height={height - pad.t - pad.b} fill="transparent" />
                  {d.value > 0 && <path d={`M${x},${height - pad.b} V${top + Math.min(4, h)} q0,-4 4,-4 h${w - 8} q4,0 4,4 V${height - pad.b} Z`} className={hover === i ? 'fill-primary-deep' : 'fill-primary'} />}
                  {(i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) && (
                    <text x={x + w / 2} y={height - 8} textAnchor="middle" className="fill-ink-muted text-[11px]">
                      {formatX(d.label)}
                    </text>
                  )}
                </g>
              );
            })}
            <line x1={pad.l} x2={W - pad.r} y1={height - pad.b} y2={height - pad.b} className="stroke-ink-faint" strokeWidth={1} />
          </svg>
          {hover != null && (
            <div className="pointer-events-none absolute top-0 rounded-[10px] border border-border bg-surface px-2.5 py-1.5 text-xs shadow-card" style={{ left: `${((pad.l + hover * bw + bw / 2) / W) * 100}%`, transform: 'translateX(-50%)' }} role="status">
              <span className="block text-ink-muted">{data[hover].full ?? formatX(data[hover].label)}</span>
              <span className="font-semibold text-ink">{data[hover].value}{unit}</span>
            </div>
          )}
        </div>
      )}
      <button type="button" className="mt-2 min-h-9 text-sm font-medium text-primary-ink hover:underline" aria-pressed={table} onClick={() => setTable((v) => !v)}>
        {t('stats.table')}
      </button>
    </div>
  );
}

/** Horizontal bars for a value per item (0–100%), labeled directly. */
export function HBarList({ rows }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink">{r.label}</span>
            <span className="font-semibold text-ink tabular-nums">{r.value}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-primary-soft" role="img" aria-label={`${r.label}: ${r.value}%`}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${r.value}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
