import Button from './Button.jsx';

/** Icon, title, message, action (DESIGN-SYSTEM §6.7). */
export default function EmptyState({ icon: IconC, title, message, actionLabel, actionTo, onAction, headingLevel: H = 'h2', className = '' }) {
  return (
    <div className={`mx-auto flex max-w-[420px] flex-col items-center py-12 text-center ${className}`}>
      <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
        <IconC aria-hidden="true" size={28} />
      </span>
      <H className="type-h3 mt-5 text-ink">{title}</H>
      {message && <p className="mt-2 text-ink-muted">{message}</p>}
      {actionLabel && (
        <Button to={actionTo} onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
