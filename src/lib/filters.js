// Catalog filtering, search and sort (PRD §4), pure and URL-shaped:
// ?q=&category=&level=&price=&rating=&sort=&duration=&practice=
// OR within a group, AND across groups.

export const SORTS = ['popular', 'rating', 'newest', 'price-asc', 'price-desc'];
export const LEVELS = ['beginner', 'intermediate', 'advanced'];
export const PRICES = ['free', 'paid'];
export const RATINGS = ['4.5', '4.0'];
export const DURATIONS = ['short', 'medium', 'long'];
export const PRACTICES = ['code', 'guided'];
const MULTI = ['category', 'level', 'price', 'duration', 'practice'];

/** Filters from URLSearchParams, keeping only known values. */
export function parseFilters(params, { categories }) {
  const all = (key, allowed) => [...new Set(params.getAll(key).filter((v) => allowed.includes(v)))];
  const rating = params.get('rating');
  const sort = params.get('sort');
  return {
    q: (params.get('q') ?? '').slice(0, 80),
    category: all('category', categories),
    level: all('level', LEVELS),
    price: all('price', PRICES),
    duration: all('duration', DURATIONS),
    practice: all('practice', PRACTICES),
    rating: RATINGS.includes(rating) ? rating : null,
    sort: SORTS.includes(sort) ? sort : 'popular',
  };
}

/** 'short' < 4h, 'medium' 4–6h, 'long' > 6h. */
export const durationBucket = (minutes) => (minutes < 240 ? 'short' : minutes <= 360 ? 'medium' : 'long');
/** Code you run in the browser (web, SQL, Python) vs guided practice. */
export const practiceKind = (course) => (course.engines.some((e) => e.startsWith('web') || e === 'sql' || e === 'python') ? 'code' : 'guided');

const norm = (s) => String(s ?? '').toLocaleLowerCase().normalize('NFKD').replace(/[ً-ٰٟ]/g, '');

/** `haystack(course)` returns the strings to search (title, tagline, category, instructor, in both languages). */
export function filterCourses(courses, f, haystack) {
  const q = norm(f.q.trim());
  return courses.filter((c) => {
    if (q && !haystack(c).some((s) => norm(s).includes(q))) return false;
    if (f.category.length && !f.category.includes(c.category)) return false;
    if (f.level.length && !f.level.includes(c.level)) return false;
    if (f.price.length && !f.price.includes(c.price === 0 ? 'free' : 'paid')) return false;
    if (f.duration.length && !f.duration.includes(durationBucket(c.durationMinutes))) return false;
    if (f.practice.length && !f.practice.includes(practiceKind(c))) return false;
    if (f.rating && c.rating < Number(f.rating)) return false;
    return true;
  });
}

export function sortCourses(list, sort) {
  const out = [...list];
  const by = {
    popular: (a, b) => b.students - a.students,
    rating: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
    newest: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
    'price-asc': (a, b) => a.price - b.price || b.students - a.students,
    'price-desc': (a, b) => b.price - a.price || b.students - a.students,
  };
  return out.sort(by[sort] ?? by.popular);
}

/** Number of active filters (the mobile "Filters · 3" badge). */
export const activeCount = (f) => MULTI.reduce((n, k) => n + f[k].length, 0) + (f.rating ? 1 : 0);

/** URLSearchParams with every filter cleared but the sort (PRD §4.5). */
export function clearedParams(params) {
  const next = new URLSearchParams();
  if (params.get('sort')) next.set('sort', params.get('sort'));
  return next;
}

export function toggleParam(params, key, value) {
  const next = new URLSearchParams(params);
  if (key === 'rating') {
    if (next.get('rating') === value) next.delete('rating');
    else next.set('rating', value);
    return next;
  }
  const values = next.getAll(key);
  next.delete(key);
  const set = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
  set.forEach((v) => next.append(key, v));
  return next;
}
