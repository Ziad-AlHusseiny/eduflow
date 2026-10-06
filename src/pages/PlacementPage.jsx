import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { getPath, paths, placement } from '../data/people.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useStored } from '../hooks/useStored.js';
import { useDetails } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { scorePlacement } from '../lib/placement.js';
import { pathStore, placementStore } from '../lib/stores.js';

/** "Where should I start?" — six questions, a recommended path. */
export default function PlacementPage() {
  useDetails();
  useDocumentTitle(`${t('meta.pages.placement')} · EduFlow`);
  const quiz = placement();
  const [answers, setAnswers] = useState([]);
  const [step, setStep] = useState(0);
  const [, setResult] = useStored(placementStore);
  const [followed, setFollowed] = useStored(pathStore);
  if (!quiz) return null;
  const qs = quiz.questions;
  const done = step >= qs.length;
  const ranking = done ? scorePlacement(qs, answers, paths().map((p) => p.id)) : [];
  const best = done ? getPath(ranking[0]) : null;
  const runner = done ? getPath(ranking[1]) : null;
  const q = qs[step];

  return (
    <div className="container-page max-w-2xl pt-10 pb-12 lg:pt-14">
      <h1 className="type-h1 text-ink">{t('placement.title')}</h1>
      {!done ? (
        <>
          <p className="type-body-lg mt-2 text-ink-muted">{quiz.intro}</p>
          <ProgressBar value={(step / qs.length) * 100} size="sm" className="mt-6" animate={false} />
          <fieldset className="card mt-6 p-6" key={q.id}>
            <legend className="sr-only">{q.q}</legend>
            <p className="text-sm font-semibold text-ink-muted">{t('placement.question', { n: step + 1, total: qs.length })}</p>
            <p className="type-h3 mt-2 text-ink" aria-hidden="true">{q.q}</p>
            <ul className="mt-5 space-y-2">
              {q.options.map((o) => (
                <li key={o.id}>
                  <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[12px] border p-3 transition-colors ${answers[step] === o.id ? 'border-primary bg-primary-soft/50' : 'border-border hover:border-primary/60'}`}>
                    <input type="radio" name={q.id} checked={answers[step] === o.id} onChange={() => setAnswers((a) => Object.assign([...a], { [step]: o.id }))} className="size-[18px] accent-[var(--color-primary)]" />
                    <span className="text-ink">{o.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <div className="mt-5 flex justify-between gap-3">
            <Button variant="ghost" icon={ArrowLeft} disabled={!step} onClick={() => setStep((s) => s - 1)}>
              {t('placement.back')}
            </Button>
            <Button iconEnd={ArrowRight} disabled={!answers[step]} onClick={() => {
              if (step === qs.length - 1) setResult({ path: scorePlacement(qs, answers, paths().map((p) => p.id))[0], at: new Date().toISOString() });
              setStep((s) => s + 1);
            }} data-testid="placement-next">
              {t('placement.next')}
            </Button>
          </div>
        </>
      ) : (
        <div className="card mt-8 p-6 md:p-8" role="status" data-testid="placement-result">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Icon name={best.icon} size={28} />
          </span>
          <h2 className="type-h2 mt-5 text-ink">{t('placement.result', { path: best.title })}</h2>
          <p className="mt-3 text-ink">{quiz.results?.[best.id]?.why}</p>
          <p className="mt-2 text-ink-muted">{quiz.results?.[best.id]?.firstStep}</p>
          {runner && <p className="mt-4 text-sm text-ink-muted">{t('placement.runnerUp', { path: runner.title })}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setFollowed(best.id)} disabled={followed === best.id}>
              {followed === best.id ? t('paths.following') : t('placement.followPath')}
            </Button>
            <Button to={`/paths/${best.id}`} variant="secondary">
              {t('placement.viewPath')}
            </Button>
            <Button variant="ghost" icon={RotateCcw} onClick={() => {
              setAnswers([]);
              setStep(0);
            }}>
              {t('placement.restart')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
