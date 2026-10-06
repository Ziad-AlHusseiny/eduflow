/** Eyebrow + title + subtitle (PRD §3). */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', id, as: H = 'h2', className = '' }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`} data-reveal>
      {eyebrow && <p className="type-eyebrow inline-flex rounded-full bg-primary-soft px-3 py-1.5 text-primary-ink">{eyebrow}</p>}
      <H id={id} className="type-h2 mt-4 text-ink">
        {title}
      </H>
      {subtitle && <p className="type-body-lg mt-3 text-ink-muted">{subtitle}</p>}
    </div>
  );
}
