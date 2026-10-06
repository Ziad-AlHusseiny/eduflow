import { Check, Clock, Code2, FlaskConical, PlayCircle, Star, Target, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import CurriculumAccordion from '../components/course/CurriculumAccordion.jsx';
import EnrollCard from '../components/course/EnrollCard.jsx';
import { useCourseEnrollment } from '../hooks/useCourseEnrollment.js';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import GradientBlob from '../components/ui/GradientBlob.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import { getCourse } from '../data/courses.js';
import { getInstructor, instructorName, reviewsFor, instructorStats } from '../data/people.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useLearningState } from '../hooks/useLearning.js';
import { courseText, useDetails, useOutline } from '../i18n/content.js';
import { t } from '../i18n/index.js';
import { formatCount, formatDuration, formatMonth, formatRelative } from '../lib/format.js';
import NotFoundPage from './NotFoundPage.jsx';

/** A course (PRD §5): hero, what you'll learn, practice, curriculum, instructor, reviews, sticky enroll card. */
export default function CourseDetailPage() {
  useOutline();
  useDetails();
  const { id } = useParams();
  const course = getCourse(id);
  const text = course ? courseText(course.id) : null;
  useDocumentTitle(text ? `${text.title} · EduFlow` : null);
  if (!course) return <NotFoundPage />;
  return <CourseDetail course={course} text={text} />;
}

function CourseDetail({ course, text }) {
  const instructor = getInstructor(course.instructorId);
  const stats = instructorStats(course.instructorId);
  const reviews = reviewsFor(course.id);
  const { enrolled, enrollment } = useCourseEnrollment(course);
  const { scores } = useLearningState();
  const engines = [...new Set(course.lessons.filter((l) => l.ex).map((l) => (['order', 'spot-bug', 'fill', 'choice'].includes(l.ex) ? 'guided' : l.ex)))];

  return (
    <div className="container-page pt-6 pb-28 lg:pb-8">
      <nav aria-label={t('a11y.breadcrumb')} className="text-sm text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/courses" className="hover:text-primary-ink hover:underline">
              {t('detail.breadcrumb')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {text.title}
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-10">
          <header className="relative overflow-hidden rounded-2xl bg-primary-soft/40 p-6 md:p-8">
            <GradientBlob color="violet" className="-end-40 -top-40 size-80 opacity-60" />
            <div className="relative">
              <Badge variant="category">{t(`categories.${course.category}`)}</Badge>
              <h1 className="type-h1 mt-4 text-ink">{text.title}</h1>
              <p className="type-body-lg mt-3 max-w-2xl text-ink-muted">{text.tagline}</p>
              <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
                <li className="inline-flex items-center gap-1.5">
                  <StarRating value={course.rating} showValue={false} size={16} />
                  <span className="font-semibold text-ink">{t('course.ratingsLong', { value: course.rating.toFixed(1), count: course.ratingCount, formatted: formatCount(course.ratingCount) })}</span>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Users aria-hidden="true" size={16} />
                  {t('detail.learners', { count: formatCount(course.students) })}
                </li>
                <li>
                  <Badge variant={course.level}>{t(`levels.${course.level}`)}</Badge>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden="true" size={16} />
                  {t('detail.total', { duration: formatDuration(course.durationMinutes) })}
                </li>
                <li>{t('detail.updated', { date: formatMonth(course.updatedAt) })}</li>
              </ul>
              {instructor && (
                <p className="mt-4 text-sm text-ink">
                  <a href="#instructor" className="font-medium text-primary-ink underline-offset-4 hover:underline">
                    {t('detail.createdBy', { name: instructorName(instructor) })}
                  </a>
                </p>
              )}
            </div>
          </header>

          <section aria-labelledby="learn-title" className="card p-6 md:p-8">
            <h2 id="learn-title" className="type-h3 text-ink">
              {t('detail.learn')}
            </h2>
            <ul className="mt-5 grid gap-x-8 gap-y-3 md:grid-cols-2">
              {text.learnItems.map((item, i) => (
                <li key={item} className="flex items-start gap-3" data-reveal style={{ '--i': i * 0.67 }}>
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success-soft text-success-deep">
                    <Check aria-hidden="true" size={15} strokeWidth={2.5} />
                  </span>
                  <span className="text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="about-title">
            <h2 id="about-title" className="sr-only">
              {t('detail.audience')}
            </h2>
            <div className="space-y-4 text-ink">
              {text.description.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="card p-5">
                <dt className="flex items-center gap-2 font-display font-semibold text-ink">
                  <Target aria-hidden="true" size={18} className="text-primary" /> {t('detail.audience')}
                </dt>
                <dd className="mt-2 text-[15px] text-ink-muted">{text.audience}</dd>
              </div>
              <div className="card p-5">
                <dt className="flex items-center gap-2 font-display font-semibold text-ink">
                  <FlaskConical aria-hidden="true" size={18} className="text-primary" /> {t('detail.prerequisites')}
                </dt>
                <dd className="mt-2 text-[15px] text-ink-muted">{text.prerequisites}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="practice-title" className="card p-6 md:p-8">
            <h2 id="practice-title" className="type-h3 flex items-center gap-2 text-ink">
              <Code2 aria-hidden="true" size={22} className="text-primary" /> {t('detail.practiceTitle')}
            </h2>
            <ul className="mt-4 space-y-2">
              {engines.map((e) => (
                <li key={e} className="flex items-start gap-3 text-ink">
                  <Check aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-success" />
                  {t(`detail.practiceText.${e}`)}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="content-title">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="content-title" className="type-h2 text-ink">
                {t('detail.content')}
              </h2>
              <p className="text-sm text-ink-muted">{t('detail.contentSummary', { sections: t('units.sections', { count: course.sectionCount }), lessons: t('units.lessons', { count: course.lessonCount }), duration: formatDuration(course.durationMinutes) })}</p>
            </div>
            <div className="mt-5">
              <CurriculumAccordion course={course} interactive={enrolled} completedIds={enrollment?.completedLessonIds ?? []} checkpointScores={scores.checkpoints} />
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-ink-muted">
              <PlayCircle aria-hidden="true" size={18} className="text-primary" />
              <span className="flex-1">
                <span className="font-semibold text-ink">{t('detail.finalTitle')}</span> · {t('detail.finalMeta')}
              </span>
              {enrolled && (
                <Link to={`/courses/${course.id}/final`} className="font-semibold text-primary-ink hover:underline">
                  {t('assessment.start')}
                </Link>
              )}
            </div>
          </section>

          {instructor && (
            <section id="instructor" aria-labelledby="instructor-title" className="scroll-mt-24">
              <h2 id="instructor-title" className="type-h2 text-ink">
                {t('detail.instructor')}
              </h2>
              <div className="card mt-5 flex flex-col gap-5 p-6 sm:flex-row md:p-8">
                <Avatar id={instructor.id} name={instructor.name} size={96} />
                <div>
                  <h3 className="type-h3 text-ink">
                    <Link to={`/instructors/${instructor.id}`} className="hover:text-primary-ink hover:underline">
                      {instructorName(instructor)}
                    </Link>
                  </h3>
                  <p className="text-ink-muted">
                    {instructor.role} · {instructor.company}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
                    <li className="inline-flex items-center gap-1.5">
                      <Star aria-hidden="true" size={15} className="fill-star text-star" />
                      {t('detail.instructorStats.rating', { value: stats.rating.toFixed(1) })}
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <Users aria-hidden="true" size={15} />
                      {t('detail.instructorStats.learners', { count: formatCount(stats.learners) })}
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <PlayCircle aria-hidden="true" size={15} />
                      {t('detail.instructorStats.courses', { count: stats.courses.length })}
                    </li>
                  </ul>
                  <p className="mt-4 text-ink">{instructor.bio[0]}</p>
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="reviews-title">
            <h2 id="reviews-title" className="type-h2 text-ink">
              {t('detail.reviews')}
            </h2>
            <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr]">
              <div className="card flex flex-col items-center justify-center p-6 text-center">
                <p className="type-stat text-ink">{course.rating.toFixed(1)}</p>
                <StarRating value={course.rating} showValue={false} className="mt-2" />
                <p className="mt-2 text-sm text-ink-muted">{t('detail.ratingsCount', { count: formatCount(course.ratingCount) })}</p>
              </div>
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="card p-5">
                    <div className="flex items-center gap-3">
                      <Avatar id={avatarFor(r.name)} name={r.name} size={40} />
                      <div className="flex-1">
                        <p className="font-semibold text-ink">{r.name}</p>
                        <p className="flex items-center gap-2 text-[13px] text-ink-muted">
                          <StarRating value={r.rating} showValue={false} size={14} />
                          <span>{formatRelative(r.date, new Date('2026-10-05T12:00:00'))}</span>
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-ink">{r.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[84px] lg:self-start" aria-label={t('detail.enroll')}>
          <EnrollCard course={course} />
        </aside>
      </div>
    </div>
  );
}

const AVATARS = { 'Alicia Grant': 'alicia-grant', 'Tom Nakamura': 'tom-nakamura', 'Fatima El-Sayed': 'fatima-el-sayed' };
const avatarFor = (name) => AVATARS[name] ?? null;
