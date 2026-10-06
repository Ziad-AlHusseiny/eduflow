import { Trophy } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourse } from '../../data/courses.js';
import { courseText } from '../../i18n/content.js';
import { t } from '../../i18n/index.js';
import { restoreFocus } from '../../lib/dialogs.js';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';

/**
 * The badge pop (PRD §7.4, DESIGN-SYSTEM §6.7): a native modal dialog —
 * focus trapped, Esc closes — with the medal springing in (scale 0,
 * rotate −12° → rest). Reduced motion: it simply appears.
 */
export default function BadgeUnlockModal({ item, badge, onClose }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const d = ref.current;
    const opener = document.activeElement;
    if (d && !d.open) d.showModal();
    // Closing unmounts the dialog, so the browser can't restore focus itself.
    return () => {
      if (d?.open) d.close();
      restoreFocus(opener);
    };
  }, []);
  const go = (to) => {
    onClose();
    navigate(to);
  };
  const course = item.type === 'course' ? getCourse(item.id) : null;
  const title = course ? t('badge.courseTitle') : t(`achievements.${badge.id}.name`);
  const text = course ? t('badge.courseText', { course: courseText(course.id).title }) : t(`achievements.${badge.id}.rule`);
  return (
    <dialog ref={ref} aria-labelledby="badge-title" aria-describedby="badge-text" className="modal m-auto w-[calc(100%-32px)] max-w-[400px] rounded-2xl bg-surface p-8 text-center text-ink shadow-modal" onClose={onClose} data-testid="badge-modal">
      {!course && <p className="type-eyebrow text-primary-ink">{t('badge.unlocked')}</p>}
      <div className="mx-auto mt-4 grid size-24 place-items-center rounded-full bg-star-soft text-star-ink animate-[pop-in_700ms_cubic-bezier(0.34,1.56,0.64,1)_both]" data-testid="badge-medal">
        {course ? <Trophy aria-hidden="true" size={44} /> : <Icon name={badge.icon} size={44} />}
      </div>
      <h2 id="badge-title" className="type-h2 mt-6">
        {title}
      </h2>
      <p id="badge-text" className="mt-2 text-ink-muted">
        {text}
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={() => go('/learning#achievements')}>{t('badge.viewAll')}</Button>
        {course ? (
          <Button variant="secondary" onClick={() => go(`/courses/${course.id}`)}>
            {t('badge.backToCourse')}
          </Button>
        ) : (
          <Button variant="secondary" onClick={onClose} autoFocus>
            {t('badge.nice')}
          </Button>
        )}
      </div>
    </dialog>
  );
}
