import { ArrowLeft, Download, Lock, Printer } from 'lucide-react';
import { useId, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { getCourse } from '../data/courses.js';
import { getInstructor, instructorName } from '../data/people.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useLearningState } from '../hooks/useLearning.js';
import { useHydrated } from '../hooks/useMedia.js';
import { useStored } from '../hooks/useStored.js';
import { courseText, useOutline } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { isRTL } from '../i18n/state.js';
import { certificateId } from '../lib/certificate.js';
import { formatDate } from '../lib/format.js';
import { PASS_MARK } from '../lib/learning.js';
import { progressFor } from '../lib/progress.js';
import { settingsStore } from '../lib/stores.js';
import { toast } from '../lib/toast.js';
import NotFoundPage from './NotFoundPage.jsx';

/** Splits text into lines of at most `max` characters, at spaces. */
function wrapLines(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

/** The certificate of completion: every lesson done + the final passed. Your name stays on this device. */
export default function CertificatePage() {
  useOutline();
  const { id } = useParams();
  const course = getCourse(id);
  useDocumentTitle(course ? `${t('certificate.title')} · ${courseText(course.id).title} · EduFlow` : null);
  if (!course) return <NotFoundPage />;
  return <Certificate course={course} />;
}

function Certificate({ course }) {
  const { enrollments, scores } = useLearningState();
  const hydrated = useHydrated();
  const [settings, setSettings] = useStored(settingsStore);
  const nameId = useId();
  const svgRef = useRef(null);
  const progress = progressFor(course, enrollments.enrollments[course.id]?.completedLessonIds ?? []);
  const final = scores.finals[course.id];
  const earned = progress.pct === 100 && final?.passedAt;
  const ct = courseText(course.id);
  const instructor = getInstructor(course.instructorId);
  const name = settings.certificateName.trim();

  if (!hydrated || !earned)
    return (
      <div className="container-page max-w-2xl py-16 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-surface-muted text-ink-muted">
          <Lock aria-hidden="true" size={28} />
        </span>
        <h1 className="type-h1 mt-6 text-ink">{t('certificate.locked')}</h1>
        <p className="mt-3 text-ink-muted">{t('certificate.lockedText', { mark: PASS_MARK * 100 })}</p>
        <p className="mt-6 text-sm font-medium text-ink">{t('certificate.progress', { done: progress.completed, total: progress.total, final: final ? `${Math.round((final.best / final.total) * 100)}%` : t('certificate.finalNotTaken') })}</p>
        <ProgressBar value={progress.pct} size="md" className="mx-auto mt-3 max-w-sm" />
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to={`/courses/${course.id}/final`}>{t('certificate.takeFinal')}</Button>
          <Button to={`/courses/${course.id}`} variant="secondary">
            {t('certificate.continue')}
          </Button>
        </div>
      </div>
    );

  const pct = Math.round((final.best / final.total) * 100);
  const date = formatDate(final.passedAt);
  const certId = certificateId(course.abbrev, final.passedAt, name);
  const rtl = isRTL();

  // The SVG drawn onto a canvas, saved as PNG. It must stay plain SVG (no
  // <foreignObject>): that would taint the canvas and block the export.
  const download = () => {
    const failed = () => toast(t('certificate.downloadFailed'));
    const svg = svgRef.current;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      failed();
    };
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 2000;
        canvas.height = 1414;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((png) => {
          if (!png) return failed();
          const a = document.createElement('a');
          a.href = URL.createObjectURL(png);
          a.download = `eduflow-certificate-${course.id}.png`;
          document.body.append(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }, 'image/png');
      } catch {
        failed();
      }
    };
    img.src = url;
  };

  const F = 'Sora, Inter, system-ui, sans-serif';
  return (
    <div className="container-page max-w-4xl pt-8 pb-16">
      <Link to={`/courses/${course.id}`} className="no-print inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink" data-chrome>
        <ArrowLeft aria-hidden="true" size={18} className="rtl:-scale-x-100" /> {ct.title}
      </Link>
      <h1 className="type-h1 no-print mt-3 text-ink" data-chrome>
        {t('certificate.title')}
      </h1>
      <div className="no-print mt-6 max-w-md" data-chrome>
        <label htmlFor={nameId} className="text-sm font-semibold text-ink">
          {t('certificate.nameLabel')}
        </label>
        <input id={nameId} value={settings.certificateName} onChange={(e) => setSettings((s) => ({ ...s, certificateName: e.target.value.slice(0, 80) }))} placeholder={t('certificate.namePlaceholder')} autoComplete="name" className="mt-1.5 h-11 w-full rounded-[12px] border border-border bg-surface px-4 text-ink placeholder:text-ink-faint focus:border-primary" data-testid="certificate-name" />
        <p className="mt-1.5 text-xs text-ink-muted">{t('certificate.nameHelp')}</p>
      </div>

      <figure className="certificate mt-8" data-testid="certificate">
        <svg ref={svgRef} viewBox="0 0 1000 707" role="img" aria-label={`${t('certificate.heading')}: ${name || '—'} · ${ct.title}`} className="h-auto w-full rounded-2xl shadow-lift" xmlns="http://www.w3.org/2000/svg" direction={rtl ? 'rtl' : 'ltr'}>
          <defs>
            <linearGradient id="cert-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7c3aed" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <rect width="1000" height="707" fill="#ffffff" />
          <rect x="18" y="18" width="964" height="671" rx="20" fill="none" stroke="url(#cert-g)" strokeWidth="6" />
          <rect x="34" y="34" width="932" height="639" rx="14" fill="none" stroke="#e7e5f2" strokeWidth="1.5" />
          <circle cx="500" cy="108" r="34" fill="#7c3aed" />
          <path d="M500 92 l-26 12 26 12 26-12z M484 110 v10 c0 6 32 6 32 0 v-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          <text x="500" y="182" textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="34" fill="#1b1830">{t('certificate.heading')}</text>
          <text x="500" y="232" textAnchor="middle" fontFamily={F} fontSize="17" fill="#4f4b66">{t('certificate.awarded')}</text>
          <text x="500" y="300" textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="44" fill="#5b21b6">{name || '—'}</text>
          <line x1="300" y1="322" x2="700" y2="322" stroke="#e7e5f2" strokeWidth="2" />
          <text x="500" y="364" textAnchor="middle" fontFamily={F} fontSize="17" fill="#4f4b66">{t('certificate.completed')}</text>
          <text x="500" y="414" textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="30" fill="#1b1830">{ct.title}</text>
          <text x="500" y="452" textAnchor="middle" fontFamily={F} fontSize="15" fill="#4f4b66">{t('certificate.with', { lessons: progress.total, pct })}</text>
          <text x="160" y="548" textAnchor="middle" fontFamily={F} fontSize="15" fill="#1b1830">{date}</text>
          <line x1="80" y1="560" x2="240" y2="560" stroke="#8a8699" />
          <text x="160" y="582" textAnchor="middle" fontFamily={F} fontSize="12" fill="#4f4b66">{t('certificate.date', { date: '' }).trim()}</text>
          <text x="840" y="548" textAnchor="middle" fontFamily={F} fontSize="15" fill="#1b1830">{instructorName(instructor)}</text>
          <line x1="760" y1="560" x2="920" y2="560" stroke="#8a8699" />
          <text x="840" y="582" textAnchor="middle" fontFamily={F} fontSize="12" fill="#4f4b66">{t('certificate.instructor')}</text>
          <text x="500" y="560" textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="20" fill="#1b1830" direction="ltr">EduFlow</text>
          <text x="500" y="582" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="11" fill="#8a8699" direction="ltr">{certId}</text>
          <text x="500" y="622" textAnchor="middle" fontFamily={F} fontSize="11" fill="#4f4b66" direction={rtl ? 'rtl' : 'ltr'} data-testid="certificate-disclaimer">
            {wrapLines(t('certificate.disclaimer'), 125).map((line, i) => (
              <tspan key={i} x="500" dy={i ? 16 : 0}>
                {line}
              </tspan>
            ))}
          </text>
        </svg>
        <figcaption className="mt-3 text-sm text-ink-muted">{t('certificate.disclaimer')}</figcaption>
      </figure>
      <div className="no-print mt-6 flex flex-wrap gap-3" data-chrome>
        <Button icon={Printer} onClick={() => window.print()}>
          {t('certificate.print')}
        </Button>
        <Button icon={Download} variant="secondary" onClick={download} data-testid="download-certificate">
          {t('certificate.download')}
        </Button>
      </div>
    </div>
  );
}
