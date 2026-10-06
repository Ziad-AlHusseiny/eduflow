// Certificate ids: short, stable, derived (never stored).
/** A short, stable id for a certificate (course + date + name). */
export function certificateId(courseAbbrev, passedAt, name) {
  let h = 2166136261;
  for (const ch of `${courseAbbrev}|${passedAt}|${name}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `EF-${courseAbbrev.toUpperCase()}-${(h >>> 0).toString(36).toUpperCase().padStart(7, '0')}`;
}

