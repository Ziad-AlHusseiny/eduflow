import { CheckCircle2 } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { t } from '../../i18n/index.js';
import { exercisesStore } from '../../lib/stores.js';
import { ChoicePractice, FillPractice, OrderPractice, SpotBugPractice } from './GuidedPractice.jsx';
import { Hints, Prompt } from './shared.jsx';

import PythonPractice from './PythonPractice.jsx';
import SqlPractice from './SqlPractice.jsx';
import WebPractice from './WebPractice.jsx';

const GUIDED = { order: OrderPractice, 'spot-bug': SpotBugPractice, fill: FillPractice, choice: ChoicePractice };
const CODE = { web: WebPractice, sql: SqlPractice, python: PythonPractice };

/** The lesson's hands-on exercise (CONTENT-GUIDE §7), whatever its kind. */
export default function Practice({ exercise, lessonId }) {
  const state = useSyncExternalStore(exercisesStore.subscribe, exercisesStore.get, exercisesStore.getServer);
  const solvedBefore = Boolean(state[lessonId]?.solvedAt);
  const Guided = GUIDED[exercise.kind];
  const Code = CODE[exercise.kind];
  return (
    <div className="card mt-5 overflow-hidden" data-testid={`exercise-${exercise.kind}`}>
      <div className="border-b border-border bg-surface-muted/60 px-5 py-4 md:px-6">
        <p className="type-eyebrow text-primary-ink">{t(`exercise.kinds.${exercise.kind}`)}</p>
        <h3 className="type-h3 mt-1 text-ink">{exercise.title}</h3>
        {solvedBefore && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-success-deep">
            <CheckCircle2 aria-hidden="true" size={16} /> {t('exercise.solvedBefore')}
          </p>
        )}
      </div>
      <div className="space-y-5 p-5 md:p-6">
        <Prompt html={exercise.prompt} />
        {Guided ? (
          <Guided exercise={exercise} lessonId={lessonId} />
        ) : (
          <Code exercise={exercise} lessonId={lessonId} />
        )}
        <Hints hints={exercise.hints} />
      </div>
    </div>
  );
}
