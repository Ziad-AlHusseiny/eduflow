import { imageFor } from '../../data/images.js';

const initials = (name) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** A round photo (AVIF/WebP), or initials when there's no photo. */
export default function Avatar({ id, name, size = 48, className = '', eager = false }) {
  const img = id ? imageFor(id, { kind: 'avatar', max: size * 2 >= 192 ? 400 : 192 }) : null;
  if (!img)
    return (
      <span aria-hidden="true" className={`inline-grid shrink-0 place-items-center rounded-full bg-primary-soft font-display font-semibold text-primary-ink ${className}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
        {initials(name)}
      </span>
    );
  return (
    <picture className={`inline-block shrink-0 overflow-hidden rounded-full bg-surface-muted ${className}`} style={{ width: size, height: size }}>
      <source type="image/avif" srcSet={img.avif} sizes={`${size}px`} />
      <img src={img.src} srcSet={img.webp} sizes={`${size}px`} alt="" width={size} height={size} loading={eager ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover" />
    </picture>
  );
}
