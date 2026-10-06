import { CheckCircle2, ChevronDown, ClipboardCheck, Code2, Lock, Play, PlayCircle } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessonTitle, sectionTitle } from '../../i18n/content.js';
import { t } from '../../i18n/index.js';
import { sectionMinutes } from '../../lib/progress.js';

/**
 * Sections and lessons (PRD §5.3, §7.5). On the course page rows are plain
 * text until you enroll; in interactive mode every lesson is a link, the
 * active one is tinted, completed ones show a green check. Multiple
 * sections can be open at once.
 */
export default function CurriculumAccordion({ course, interactive = false, activeLessonId = null, completedIds = [], checkpointScores = {}, compact = false, onNavigate }) {
  const done = new Set(completedIds);
  const activeSection = course.sections.find((s) => s.lessons.some((l) => l.id === activeLessonId))?.id;
  const [open, setOpen] = useState(() => new Set([activeSection ?? course.sections[0].id]));
  const base = useId();
  const activeRef = useRef(null);

  // Keep the active lesson's section open when the lesson changes.
  const [lastActive, setLastActive] = useState(activeSection);
  if (activeSection !== lastActive) {
    setLastActive(activeSection);
    if (activeSection && !open.has(activeSection)) setOpen(new Set([...open, activeSection]));
  }
  // Bring the active lesson into view inside the sidebar's own scroll area
  // only (scrollIntoView would also scroll the page under the reader).
  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    let box = el.parentElement;
    while (box && !(box.scrollHeight > box.clientHeight && /(auto|scroll)/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
    if (!box || box === document.scrollingElement || box === document.body) return;
    const r = el.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    if (r.top < b.top || r.bottom > b.bottom) box.scrollTop += r.top - b.top - b.height / 2 + r.height / 2;
  }, [activeLessonId]);

  const toggle = (id) => setOpen((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface" data-testid="curriculum">
      {course.sections.map((s, si) => {
        const isOpen = open.has(s.id);
        const sectionDone = s.lessons.filter((l) => done.has(l.id)).length;
        const panelId = `${base}-${s.id}`;
        const cp = checkpointScores[s.id];
        return (
          <div key={s.id} className="border-b border-border last:border-0">
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(s.id)} className={`flex w-full items-center gap-3 px-4 text-start transition-colors hover:bg-surface-muted md:px-5 ${compact ? 'min-h-14' : 'min-h-16'}`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-semibold text-ink md:text-base">
                    <span className="text-ink-muted">{si + 1}. </span>
                    {sectionTitle(course.id, s.id)}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink-muted">
                    {interactive ? `${sectionDone}/${s.lessons.length} · ` : ''}
                    {t('detail.sectionMeta', { lessons: t('units.lessons', { count: s.lessons.length }), minutes: sectionMinutes(s) })}
                  </span>
                </span>
                <ChevronDown aria-hidden="true" size={18} className={`shrink-0 text-ink-muted transition-transform duration-(--duration-base) ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            <div id={panelId} className="disclosure" data-open={isOpen}>
              <div>
                <ul className="border-t border-border py-1">
                  {s.lessons.map((l) => {
                    const complete = done.has(l.id);
                    const active = l.id === activeLessonId;
                    const IconC = complete ? CheckCircle2 : active ? Play : PlayCircle;
                    const inner = (
                      <>
                        <IconC aria-hidden="true" size={18} className={`shrink-0 ${complete ? 'text-success' : active ? 'text-primary' : 'text-ink-muted'}`} />
                        <span className="min-w-0 flex-1 text-[14px] leading-snug">{lessonTitle(course.id, l.id)}</span>
                        {l.ex && <Code2 aria-hidden="true" size={15} className="shrink-0 text-ink-faint" />}
                        <span className="shrink-0 text-[13px] text-ink-muted tabular-nums">{t('units.min', { count: l.minutes })}</span>
                        {complete && <span className="sr-only">({t('lesson.completed')})</span>}
                      </>
                    );
                    return (
                      <li key={l.id}>
                        {interactive ? (
                          <Link ref={active ? activeRef : undefined} to={`/lesson/${course.id}/${l.id}`} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={`flex min-h-12 items-center gap-3 px-4 py-2 transition-colors md:px-5 ${active ? 'bg-primary-soft font-medium text-primary-ink' : 'text-ink hover:bg-surface-muted'}`} data-testid={`lesson-link-${l.id}`}>
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex min-h-12 items-center gap-3 px-4 py-2 text-ink md:px-5">{inner}</div>
                        )}
                      </li>
                    );
                  })}
                  <li>
                    {interactive ? (
                      <Link to={`/courses/${course.id}/checkpoint/${s.id}`} onClick={onNavigate} className="flex min-h-12 items-center gap-3 px-4 py-2 text-ink-muted transition-colors hover:bg-surface-muted md:px-5">
                        <ClipboardCheck aria-hidden="true" size={18} className={cp && cp.best / cp.total >= 0.7 ? 'text-success' : 'text-ink-muted'} />
                        <span className="flex-1 text-[14px]">{t('detail.checkpoint')}</span>
                        <span className="text-[13px]">{cp ? `${cp.best}/${cp.total}` : t('detail.checkpointMeta')}</span>
                      </Link>
                    ) : (
                      <div className="flex min-h-12 items-center gap-3 px-4 py-2 text-ink-muted md:px-5">
                        <Lock aria-hidden="true" size={16} />
                        <span className="flex-1 text-[14px]">{t('detail.checkpoint')}</span>
                        <span className="text-[13px]">{t('detail.checkpointMeta')}</span>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
