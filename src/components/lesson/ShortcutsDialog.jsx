import { t } from '../../i18n/index.js';
import Modal from '../ui/Modal.jsx';

const KEYS = [
  ['J', 'next'],
  ['K', 'prev'],
  ['C', 'complete'],
  ['N', 'notes'],
  ['B', 'bookmark'],
  ['F', 'focus'],
  ['+ / −', 'bigger'],
  ['⌘K / Ctrl K', 'search'],
  ['?', 'help'],
  ['Esc', 'close'],
];

export default function ShortcutsDialog({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={t('shortcuts.title')} size="sm" testId="shortcuts-dialog">
      <dl className="divide-y divide-border">
        {KEYS.map(([k, id]) => (
          <div key={id} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[15px] text-ink">{t(`shortcuts.${id}`)}</dt>
            <dd>
              <kbd className="kbd" dir="ltr">{k}</kbd>
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
