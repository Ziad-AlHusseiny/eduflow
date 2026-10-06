import { imageFor } from '../../data/images.js';

const TINTS = { 'web-development': 'from-primary/70 to-accent/60', 'data-science': 'from-accent/70 to-success/50', design: 'from-primary/60 to-star/60', 'mobile-development': 'from-accent/60 to-primary/60', 'devops-cloud': 'from-ink/70 to-accent/60', 'ai-machine-learning': 'from-primary/80 to-ink/60' };

/** A course's 16:9 thumbnail (lazy unless `eager`), with a gradient stand-in when the photo is missing. */
export default function CourseImage({ course, sizes = '(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw', eager = false, className = '', imgClassName = '' }) {
  const img = imageFor(course.id, { kind: 'course' });
  if (!img) return <div aria-hidden="true" className={`aspect-video bg-gradient-to-br ${TINTS[course.category] ?? TINTS['web-development']} ${className}`} />;
  return (
    <picture className={`block aspect-video overflow-hidden bg-surface-muted ${className}`}>
      <source type="image/avif" srcSet={img.avif} sizes={sizes} />
      <img src={img.src} srcSet={img.webp} sizes={sizes} alt="" width={img.width} height={img.height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" className={`size-full object-cover ${imgClassName}`} />
    </picture>
  );
}
