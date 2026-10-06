// The ⌘K search: a small ranked matcher over the prebuilt index
// (public/content/<lang>/search.json) plus your notes. Pure and tested.

const norm = (s) => String(s ?? '').toLocaleLowerCase().normalize('NFKD').replace(/[̀-ًͯ-ٰٟ]/g, '');

/** Score an entry against the query words (0 = no match). */
export function scoreEntry(entry, words) {
  const title = norm(entry.title);
  const rest = norm(`${entry.text ?? ''} ${entry.h ?? ''}`);
  let score = 0;
  for (const w of words) {
    if (title.startsWith(w)) score += 12;
    else if (title.includes(` ${w}`)) score += 9;
    else if (title.includes(w)) score += 6;
    else if (rest.includes(w)) score += 2;
    else return 0;
  }
  const bonus = { course: 4, path: 3, lesson: 2, term: 1, note: 1, page: 2 }[entry.type] ?? 0;
  return score + bonus;
}

export function search(entries, query, limit = 30) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return entries
    .map((e) => ({ e, s: scoreEntry(e, words) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.e);
}
