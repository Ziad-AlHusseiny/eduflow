import { ArrowLeft, Award, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { QuizQuestion } from '../components/lesson/Quiz.jsx';
import Button from '../components/ui/Button.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { getCourse } from '../data/courses.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useLearningState } from '../hooks/useLearning.js';
import { useStudyTimer } from '../hooks/useStudyTimer.js';
import { courseText, sectionTitle, useOutline } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { activeLocale } from '../i18n/state.js';
import { PASS_MARK, recordScore } from '../lib/learning.js';
import { scoreAnswers } from '../lib/quiz.js';
import { progressFor } from '../lib/progress.js';
import { courseContentUrl, useResource } from '../lib/resources.js';
import NotFoundPage from './NotFoundPage.jsx';

/** A section checkpoint (5 questions) or the course's final assessment (12, pass mark 70%, unlimited retakes). */
export default function AssessmentPage() {
  useOutline();
  const { id, sectionId } = useParams();
  const { pathname } = useLocation();
  const course = getCourse(id);
  const final = pathname.endsWith('/final');
  if (!course || (!final && !course.sections.some((s) => s.id === sectionId))) return <NotFoundPage />;
  return <Assessment key={pathname} course={course} sectionId={final ? null : sectionId} />;
}

function Assessment({ course, sectionId }) {
  const data = useResource(courseContentUrl(activeLocale(), course.id));
  const questions = sectionId ? data.checkpoints[sectionId] ?? [] : data.final;
  const { scores, enrollments } = useLearningState();
  const kind = sectionId ? 'checkpoints' : 'finals';
  const key = sectionId ?? course.id;
  const best = scores[kind][key];
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const name = useId();
  const title = sectionId ? t('assessment.checkpointTitle', { section: sectionTitle(course.id, sectionId) }) : t('assessment.finalTitle');
  useDocumentTitle(`${title} · ${courseText(course.id).title} · EduFlow`);
  useStudyTimer();
  const { correct: score, pct, passed, answered } = scoreAnswers(questions, answers);
  const unanswered = questions.length - answered;
  const lessonsDone = progressFor(course, enrollments.enrollments[course.id]?.completedLessonIds ?? []).pct === 100;

  const submit = () => {
    setSubmitted(true);
    recordScore(kind, key, score, questions.length);
    requestAnimationFrame(() => document.getElementById('assessment-result')?.focus());
  };

  return (
    <div className="container-page max-w-3xl pt-8 pb-16">
      <Link to={`/courses/${course.id}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft aria-hidden="true" size={18} className="rtl:-scale-x-100" /> {courseText(course.id).title}
      </Link>
      <h1 className="type-h1 mt-3 text-ink">{title}</h1>
      <p className="type-body-lg mt-3 text-ink-muted">{sectionId ? t('assessment.intro.checkpoint') : t('assessment.intro.final')}</p>
      {best && <p className="mt-3 text-sm font-medium text-ink-muted">{t('assessment.best', { pct: Math.round((best.best / best.total) * 100) })} · {t('assessment.attempts', { count: best.attempts })}</p>}
      {!sectionId && !lessonsDone && <p className="mt-3 rounded-[12px] bg-star-soft p-3 text-sm text-star-ink">{t('assessment.needLessons')}</p>}

      {submitted && (
        <div id="assessment-result" tabIndex={-1} className={`mt-8 rounded-2xl border p-6 outline-none ${passed ? 'border-success/40 bg-success-soft/50' : 'border-border bg-surface'}`} role="status" data-testid="assessment-result">
          <p className="type-h2 text-ink">{passed ? t('assessment.passed') : t('assessment.failed')}</p>
          <p className="mt-2 text-ink-muted">{t('assessment.scoreLine', { score, total: questions.length, pct, mark: PASS_MARK * 100 })}</p>
          <ProgressBar value={pct} size="md" className="mt-4" tone={passed ? 'green' : 'violet'} />
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="secondary" icon={RotateCcw} onClick={() => {
              setAnswers(questions.map(() => null));
              setSubmitted(false);
              setAttempt((n) => n + 1);
              window.scrollTo({ top: 0 });
            }}>
              {t('assessment.retake')}
            </Button>
            {!sectionId && passed && lessonsDone && (
              <Button to={`/courses/${course.id}/certificate`} icon={Award}>
                {t('assessment.certificate')}
              </Button>
            )}
            <Button to={`/courses/${course.id}`} variant="ghost">
              {t('assessment.backToCourse')}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {questions.map((q, i) => (
          <QuizQuestion key={`${attempt}-${i}`} q={q} index={i} total={questions.length} name={`${name}-${attempt}-${i}`} value={answers[i]} revealed={submitted} onChange={(v) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))} />
        ))}
      </div>
      {!submitted && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={submit} disabled={unanswered > 0} data-testid="submit-assessment">
            {t('assessment.submit')}
          </Button>
          {unanswered > 0 && <p className="text-sm text-ink-muted">{t('assessment.unanswered', { count: unanswered })}</p>}
        </div>
      )}
    </div>
  );
}
