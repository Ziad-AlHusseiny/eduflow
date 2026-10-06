import { BookA, BookOpen, Compass, FileText, Map, NotebookPen, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { findLesson } from '../../data/courses.js';
import { courseText, lessonTitle, useOutline } from '../../i18n/content.js';
import { t } from '../../i18n/index.js';
import { activeLocale } from '../../i18n/state.js';
import { closePalette } from '../../lib/palette.js';
import { restoreFocus } from '../../lib/dialogs.js';
import { resource, searchUrl } from '../../lib/resources.js';
import { search } from '../../lib/search.js';
import { notesStore } from '../../lib/stores.js';

const ICONS = { course: BookOpen, lesson: FileText, term: BookA, path: Map, note: NotebookPen, page: Compass };
const PAGES = ['courses', 'learning', 'review', 'notes', 'stats', 'paths', 'glossary', 'placement', 'instructors', 'privacy'];

function href(e) {
  if (e.type === 'course') return `/courses/${e.id}`;
  if (e.type === 'lesson' || e.type === 'note') return `/lesson/${e.course}/${e.id}`;
  if (e.type === 'term') return `/glossary#${e.course}-${e.id}`;
  if (e.type === 'path') return `/paths/${e.id}`;
  return `/${e.id}`;
}

/** ⌘K: search courses, lessons, glossary terms, paths and your notes (BUILD-LOG). */
export default function CommandPalette() {
  useOutline();
  const ref = useRef(null);
  const input = useRef(null);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const notes = useSyncExternalStore(notesStore.subscribe, notesStore.get, notesStore.getServer);

  useEffect(() => {
    const d = ref.current;
    const opener = document.activeElement;
    d.showModal();
    input.current?.focus();
    resource(searchUrl(activeLocale())).then(setIndex, () => setFailed(true));
    // Closing unmounts the dialog, so the browser can't restore focus itself.
    return () => {
      if (d.open) d.close();
      restoreFocus(opener);
    };
  }, []);

  const entries = useMemo(() => {
    const pages = PAGES.map((id) => ({ type: 'page', id, title: t(`meta.pages.${id}`) }));
    const noteEntries = Object.entries(notes)
      .map(([id, n]) => ({ found: findLesson(id), id, n }))
      .filter((x) => x.found)
      .map(({ found, id, n }) => ({ type: 'note', id, course: found.course.id, title: lessonTitle(found.course.id, id), text: n.text }));
    return [...pages, ...(index ?? []), ...noteEntries];
  }, [index, notes]);
  const results = useMemo(() => search(entries, q, 40), [entries, q]);
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setActive(0);
  }

  const go = (e) => {
    closePalette();
    navigate(href(e));
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };
  useEffect(() => {
    document.getElementById(`cmd-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <dialog ref={ref} className="modal mx-auto mt-[10vh] mb-auto w-[calc(100%-24px)] max-w-[640px] overflow-hidden rounded-2xl bg-surface p-0 text-ink shadow-modal" aria-label={t('search.shortcut')} onClose={closePalette} onCancel={(e) => { e.preventDefault(); closePalette(); }} onClick={(e) => e.target === ref.current && closePalette()} data-testid="command-palette">
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search aria-hidden="true" size={20} className="shrink-0 text-ink-muted" />
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder={t('search.placeholder')} aria-label={t('search.placeholder')} role="combobox" aria-expanded={results.length > 0} aria-controls="cmd-list" aria-activedescendant={results.length ? `cmd-${active}` : undefined} aria-autocomplete="list" className="h-14 w-full bg-transparent text-[16px] text-ink placeholder:text-ink-faint focus:outline-none" data-testid="palette-input" />
        <kbd className="kbd hidden sm:inline-grid">Esc</kbd>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {!q && <p className="p-4 text-sm text-ink-muted">{failed ? t('search.offline') : index ? t('search.hint') : t('search.loading')}</p>}
        {q && !results.length && <p className="p-4 text-sm text-ink-muted" role="status">{t('search.empty', { q })}</p>}
        <ul id="cmd-list" role="listbox" aria-label={t('search.open')}>
          {results.map((e, i) => {
            const I = ICONS[e.type];
            const sub = e.type === 'lesson' || e.type === 'note' || e.type === 'term' ? courseText(e.course)?.title : t(`search.groups.${e.type}`);
            return (
              <li key={`${e.type}-${e.course ?? ''}-${e.id}`} id={`cmd-${i}`} role="option" aria-selected={i === active} onMouseMove={() => setActive(i)} onClick={() => go(e)} className={`flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 ${i === active ? 'bg-primary-soft' : ''}`}>
                <I aria-hidden="true" size={18} className="shrink-0 text-ink-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">{e.title}</span>
                  <span className="block truncate text-xs text-ink-muted">{sub}{e.type === 'note' ? ` · ${String(e.text).slice(0, 60)}` : ''}</span>
                </span>
                <span className="shrink-0 text-xs text-ink-faint">{t(`search.groups.${e.type}`)}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="hidden border-t border-border px-4 py-2 text-xs text-ink-muted sm:block" aria-hidden="true">
        ↑↓ {t('search.navigate')} · ↵ {t('search.select')} · Esc {t('search.dismiss')}
      </p>
    </dialog>
  );
}
