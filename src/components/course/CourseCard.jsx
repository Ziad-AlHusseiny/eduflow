import { Link } from 'react-router-dom';
import { getInstructor, instructorName } from '../../data/people.js';
import { courseText } from '../../i18n/content.js';
import { t } from '../../i18n/index.js';
import { formatDuration, formatPrice } from '../../lib/format.js';
import Badge from '../ui/Badge.jsx';
import CourseImage from '../ui/CourseImage.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import StarRating from '../ui/StarRating.jsx';

/** The course tile (PRD §3.3), shared by the landing page and the catalog. */
export default function CourseCard({ course, progress, headingLevel: H = 'h3', className = '', style }) {
  const text = courseText(course.id);
  const instructor = getInstructor(course.instructorId);
  return (
    <article className={`card lift group relative flex flex-col overflow-hidden ${className}`} style={style} data-testid="course-card">
      <div className="relative">
        <CourseImage course={course} className="lift-zoom" sizes="(min-width: 1024px) 300px, (min-width: 768px) 45vw, 100vw" />
        <Badge variant={course.level} className="absolute start-3 top-3">
          {t(`levels.${course.level}`)}
        </Badge>
        {course.price === 0 ? (
          <Badge variant="free" className="absolute end-3 top-3">
            {t('course.free')}
          </Badge>
        ) : (
          <span className="absolute end-3 top-3 rounded-full bg-surface px-2.5 py-1 font-display text-sm font-semibold text-ink shadow-card">{formatPrice(course.price)}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[13px] font-medium text-ink-muted">{t(`categories.${course.category}`)}</p>
        <H className="type-h4 mt-1 line-clamp-2 text-ink">
          <Link to={`/courses/${course.id}`} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary">
            {text.title}
          </Link>
        </H>
        {instructor && <p className="mt-1 text-sm text-ink-muted">{instructorName(instructor)}</p>}
        <StarRating value={course.rating} count={course.ratingCount} className="mt-3" />
        <p className="mt-auto pt-3 text-sm font-medium text-ink-muted">
          {t('course.meta', { lessons: t('units.lessons', { count: course.lessonCount }), duration: formatDuration(course.durationMinutes) })}
        </p>
        {progress && (
          <div className="mt-3">
            <ProgressBar value={progress.pct} size="sm" />
          </div>
        )}
      </div>
    </article>
  );
}

