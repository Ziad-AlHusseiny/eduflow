import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { t } from '../../i18n/index.js';
import { saveNote } from '../../lib/learning.js';
import { notesStore } from '../../lib/stores.js';
import Modal from '../ui/Modal.jsx';

/** A lesson's notes: a drawer with a textarea that saves as you type (on this device). */
export default function NotesPanel({ open, onClose, lessonId, title }) {
  const notes = useSyncExternalStore(notesStore.subscribe, notesStore.get, notesStore.getServer);
  const saved = notes[lessonId]?.text ?? '';
  const [text, setText] = useState(saved);
  const [status, setStatus] = useState('saved');
  const area = useRef(null);
  const [lastLesson, setLastLesson] = useState(lessonId);
  if (lastLesson !== lessonId) {
    setLastLesson(lessonId);
    setText(saved);
  }
  useEffect(() => {
    if (text === saved) return undefined;
    const timer = setTimeout(() => {
      saveNote(lessonId, text);
      setStatus('saved');
    }, 500);
    return () => clearTimeout(timer);
  }, [text, saved, lessonId]);
  return (
    <Modal open={open} onClose={() => {
      if (text !== saved) saveNote(lessonId, text);
      onClose();
    }} title={t('notes.panelTitle')} description={title} initialFocus={area} size="lg" testId="notes-panel">
      <label htmlFor="lesson-notes" className="sr-only">
        {t('notes.panelTitle')}
      </label>
      <textarea
        id="lesson-notes"
        ref={area}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus('saving');
        }}
        placeholder={t('notes.placeholder')}
        rows={12}
        className="w-full resize-y rounded-[12px] border border-border bg-surface p-4 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-primary"
        data-testid="notes-textarea"
      />
      <p className="mt-2 text-end text-xs text-ink-muted" role="status">
        {status === 'saving' ? t('notes.saving') : t('notes.saved')}
      </p>
    </Modal>
  );
}
