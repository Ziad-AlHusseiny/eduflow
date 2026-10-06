import { Compass } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { t } from '../i18n/index.js';

/** 404 (PRD §9). */
export default function NotFoundPage() {
  useDocumentTitle(t('meta.notFound'));
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
        <Compass aria-hidden="true" size={30} />
      </span>
      <h1 className="type-h1 mt-6 text-ink">{t('notFound.title')}</h1>
      <p className="type-body-lg mt-3 max-w-lg text-ink-muted">{t('notFound.text')}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to="/">{t('notFound.home')}</Button>
        <Button to="/courses" variant="secondary">
          {t('notFound.browse')}
        </Button>
      </div>
    </div>
  );
}
