import { CheckCircle2, Circle } from 'lucide-react';
import { t } from '../../i18n/index.js';

/** Mark complete ↔ Completed (PRD §7.3); clicking again un-completes. */
export default function MarkCompleteButton({ completed, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={completed}
      aria-keyshortcuts="C"
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-[background-color,border-color,color,transform] duration-(--duration-fast) active:scale-[0.98] ${completed ? 'bg-success-deep text-white hover:brightness-110 [[data-theme=dark]_&]:text-[#06281f]' : 'border-2 border-primary bg-surface text-primary-ink hover:bg-primary-soft'} ${className}`}
      data-testid="mark-complete"
    >
      <span key={completed ? 'done' : 'todo'} className="inline-flex motion-safe:animate-[pop-in_350ms_cubic-bezier(0.34,1.56,0.64,1)]">
        {completed ? <CheckCircle2 aria-hidden="true" size={20} /> : <Circle aria-hidden="true" size={20} />}
      </span>
      {completed ? t('lesson.completed') : t('lesson.markComplete')}
    </button>
  );
}
