const COLORS = { violet: 'bg-primary/35', blue: 'bg-accent/30', yellow: 'bg-star/35' };

/** A decorative blurred blob (DESIGN-SYSTEM §6.7), never over text. */
export default function GradientBlob({ color = 'violet', className = '' }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute rounded-full blur-[80px] ${COLORS[color]} ${className}`} />;
}
