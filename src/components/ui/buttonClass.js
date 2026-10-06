// Pill button classes (DESIGN-SYSTEM §6.1), for links and buttons alike.
const SIZES = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-5 text-[15px]', lg: 'h-12 px-6 text-base' };
const VARIANTS = {
  primary: 'bg-primary text-on-primary shadow-card hover:bg-primary-deep',
  secondary: 'border border-border bg-surface text-ink hover:border-primary hover:text-primary-ink',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  inverse: 'bg-white text-primary-ink hover:bg-surface-muted [[data-theme=dark]_&]:text-[#5b21b6]',
  success: 'bg-success-deep text-white hover:brightness-110 [[data-theme=dark]_&]:text-[#06281f]',
  danger: 'bg-danger-ink text-white hover:brightness-110 [[data-theme=dark]_&]:text-[#2a0a0d]',
};

/** The class string for a pill button (DESIGN-SYSTEM §6.1), for links and buttons alike. */
export const buttonClass = ({ variant = 'primary', size = 'md', fullWidth = false, className = '' } = {}) =>
  `inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

