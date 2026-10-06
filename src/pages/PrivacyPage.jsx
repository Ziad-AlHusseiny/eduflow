import { Download, ShieldCheck, Trash2, Upload, WifiOff } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { getCourse } from '../data/courses.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useStorageBlocked } from '../hooks/useLearning.js';
import { useHydrated } from '../hooks/useMedia.js';
import { useStored } from '../hooks/useStored.js';
import { courseText } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { buildBackup, downloadFile, restoreBackup } from '../lib/backup.js';
import { quietBadges } from '../lib/badges.js';
import { formatDate } from '../lib/format.js';
import { clearAll, readRaw, savedKeys } from '../lib/storage.js';
import { offlineStore } from '../lib/stores.js';
import { toast } from '../lib/toast.js';

/** Your data (PRD §9 extended): what's saved, export, restore (merge), delete everything. */
export default function PrivacyPage() {
  useDocumentTitle(`${t('meta.pages.privacy')} · EduFlow`);
  const hydrated = useHydrated();
  const blocked = useStorageBlocked();
  const [offline] = useStored(offlineStore);
  const [confirm, setConfirm] = useState(false);
  const [word, setWord] = useState('');
  const [, setTick] = useState(0);
  const file = useRef(null);
  const wordId = useId();
  const keys = hydrated ? savedKeys() : [];
  const kb = hydrated ? keys.reduce((s, k) => s + (readRaw(k)?.length ?? 0), 0) / 1024 : 0;

  return (
    <div className="container-page max-w-3xl pt-10 pb-12 lg:pt-14">
      <span className="grid size-14 place-items-center rounded-2xl bg-success-soft text-success-deep">
        <ShieldCheck aria-hidden="true" size={28} />
      </span>
      <h1 className="type-h1 mt-5 text-ink">{t('privacy.title')}</h1>
      <p className="type-body-lg mt-2 text-ink-muted">{t('privacy.subtitle')}</p>
      {blocked && <p className="mt-4 rounded-[12px] bg-star-soft p-3 text-sm text-star-ink">{t('privacy.blocked')}</p>}

      <section aria-labelledby="stored" className="card mt-8 p-6">
        <h2 id="stored" className="type-h3 text-ink">{t('privacy.stored')}</h2>
        <ul className="mt-4 space-y-2">
          {STORED_KEYS.map((k) => (
            <li key={k} className="flex items-start gap-3 text-[15px]">
              <code dir="ltr" className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 text-xs">eduflow-{k}</code>
              <span className={keys.includes(k) ? 'text-ink' : 'text-ink-muted'}>{t(`privacy.keys.${k}`)}</span>
            </li>
          ))}
        </ul>
        {hydrated && <p className="mt-4 text-sm text-ink-muted">{t('privacy.size', { kb: kb.toFixed(1) })}</p>}
      </section>

      <section aria-labelledby="backup" className="card mt-6 space-y-6 p-6">
        <div>
          <h2 id="backup" className="type-h4 text-ink">{t('privacy.export')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('privacy.exportText')}</p>
          <Button className="mt-3" variant="secondary" icon={Download} onClick={() => downloadFile(`eduflow-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(buildBackup(), null, 2), 'application/json')} data-testid="export-backup">
            {t('privacy.export')}
          </Button>
        </div>
        <div>
          <h2 className="type-h4 text-ink">{t('privacy.restore')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('privacy.restoreText')}</p>
          <input ref={file} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            try {
              const backup = JSON.parse(await f.text());
              quietBadges();
              restoreBackup(backup);
              toast(t('privacy.restored'));
              setTick((n) => n + 1);
            } catch {
              toast(t('privacy.restoreFailed'));
            }
          }} data-testid="restore-input" />
          <Button className="mt-3" variant="secondary" icon={Upload} onClick={() => file.current?.click()}>
            {t('privacy.restore')}
          </Button>
        </div>
        <div>
          <h2 className="type-h4 text-ink">{t('privacy.delete')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('privacy.deleteText')}</p>
          <Button className="mt-3" variant="danger" icon={Trash2} onClick={() => setConfirm(true)} data-testid="delete-all">
            {t('privacy.delete')}
          </Button>
        </div>
      </section>

      <section aria-labelledby="offline" className="card mt-6 p-6">
        <h2 id="offline" className="type-h4 flex items-center gap-2 text-ink">
          <WifiOff aria-hidden="true" size={18} /> {t('privacy.offline')}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t('privacy.offlineText')}</p>
        <h3 className="mt-4 text-sm font-semibold text-ink">{t('privacy.offlineCourses')}</h3>
        {Object.keys(offline).filter(getCourse).length ? (
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {Object.entries(offline).filter(([id]) => getCourse(id)).flatMap(([id, byLocale]) =>
              Object.entries(byLocale).map(([locale, e]) => (
                <li key={`${id}-${locale}`}>
                  {courseText(id).title} · {locale === 'ar' ? 'العربية' : 'English'} · {formatDate(e.at)}
                </li>
              )),
            )}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">{t('privacy.noOffline')}</p>
        )}
      </section>

      <Modal open={confirm} onClose={() => setConfirm(false)} title={t('privacy.delete')} description={t('privacy.deleteText')} size="sm" footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(false)}>{t('privacy.cancel')}</Button>
          <Button variant="danger" disabled={word.trim().toUpperCase() !== t('privacy.deleteWord').toUpperCase()} onClick={() => {
            clearAll();
            setConfirm(false);
            setWord('');
            toast(t('privacy.deleted'));
          }} data-testid="confirm-delete">
            {t('privacy.delete')}
          </Button>
        </div>
      }>
        <label htmlFor={wordId} className="text-sm font-medium text-ink">{t('privacy.deleteConfirm')}</label>
        <input id={wordId} value={word} onChange={(e) => setWord(e.target.value)} autoComplete="off" className="mt-2 h-11 w-full rounded-[12px] border border-border bg-surface px-3 text-ink" data-testid="delete-word" data-autofocus />
      </Modal>
    </div>
  );
}

const STORED_KEYS = ['enrollments', 'scores', 'exercises', 'drafts', 'reading', 'time', 'events', 'srs', 'notes', 'bookmarks', 'settings', 'theme', 'locale', 'placement', 'path', 'offline', 'dismissed'];
