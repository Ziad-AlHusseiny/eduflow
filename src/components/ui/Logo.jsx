import { GraduationCap } from 'lucide-react';

/** GraduationCap in a violet square + "EduFlow" (PRD §2.1). */
export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-9 place-items-center rounded-[12px] bg-primary text-white">
        <GraduationCap aria-hidden="true" size={20} />
      </span>
      <span className="font-display text-xl font-bold tracking-[-0.01em] text-ink" dir="ltr">
        EduFlow
      </span>
    </span>
  );
}
