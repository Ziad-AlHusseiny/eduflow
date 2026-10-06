const VARIANTS = {
  beginner: 'bg-accent-soft text-accent-ink',
  intermediate: 'bg-star-soft text-star-ink',
  advanced: 'bg-primary-soft text-primary-ink',
  free: 'bg-success-soft text-success-ink',
  success: 'bg-success-soft text-success-ink',
  category: 'border border-border bg-surface text-ink-muted',
  primary: 'bg-primary-soft text-primary-ink',
  muted: 'bg-surface-muted text-ink-muted',
};

/** A small pill label (DESIGN-SYSTEM §6.2). */
export default function Badge({ variant = 'muted', className = '', children, ...rest }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs leading-none font-semibold ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </span>
  );
}
