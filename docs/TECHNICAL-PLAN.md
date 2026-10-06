# EduFlow — Technical Plan

Dependencies, architecture, component inventory, data shapes, persistence, animation implementation, and build milestones.

| | |
|---|---|
| **Project** | EduFlow |
| **Document** | Technical Plan |
| **Status** | Approved |
| **Owner** | Ziad |
| **Date** | 2026-08-28 |

---

## 1. Stack & dependencies

| Package | Version target | Purpose |
|---|---|---|
| `vite` | ^7 | Build tool / dev server |
| `react`, `react-dom` | ^19 | UI |
| `react-router-dom` | ^7 | Routing (library mode, `createBrowserRouter`) |
| `tailwindcss` + `@tailwindcss/vite` | ^4 | Styling; tokens via CSS-first `@theme` |
| `motion` | latest | Animation (Framer Motion — import from `motion/react`) |
| `lucide-react` | latest | Icons |

Dev-only: `@vitejs/plugin-react`, `eslint` + `eslint-plugin-react-hooks`, `prettier`. No other runtime dependencies. Fonts (Sora, Inter) load from Google Fonts (`<link>` with `preconnect`, `display=swap`).

## 2. Folder structure (`src/`)

```
src/
├── main.jsx                  # Router + EnrollmentProvider mount
├── App.jsx                   # Layout route: Navbar, PageTransition/Outlet, Footer, Toast + BadgeUnlockModal hosts
├── index.css                 # Tailwind v4 import, @theme tokens, base styles, font links companion
├── assets/
│   ├── courses/              # 12 thumbnails, 1280×720 .webp (e.g. react-fundamentals.webp)
│   ├── avatars/              # 5 instructor + 6 reviewer/testimonial headshots, 400×400 .webp
│   └── hero/                 # hero.webp (landing visual)
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── Footer.jsx
│   │   ├── PageTransition.jsx
│   │   └── ScrollToTop.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Badge.jsx
│   │   ├── StarRating.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── SectionHeading.jsx
│   │   ├── GradientBlob.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Accordion.jsx     # exports Accordion + AccordionItem
│   │   ├── Avatar.jsx
│   │   └── Toast.jsx
│   ├── landing/
│   │   ├── Hero.jsx
│   │   ├── StatCounter.jsx
│   │   ├── FloatingCourseCard.jsx
│   │   ├── CategoryGrid.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── FeaturedCourses.jsx
│   │   ├── InstructorHighlights.jsx
│   │   ├── TestimonialCard.jsx
│   │   └── CtaBanner.jsx
│   ├── catalog/
│   │   ├── SearchBar.jsx
│   │   ├── FilterSidebar.jsx
│   │   ├── FilterGroup.jsx
│   │   ├── SortSelect.jsx
│   │   └── ActiveFilterChips.jsx
│   ├── course/
│   │   ├── CourseCard.jsx        # shared: landing featured + catalog
│   │   ├── CourseHero.jsx
│   │   ├── LearnChecklist.jsx
│   │   ├── CurriculumAccordion.jsx
│   │   ├── InstructorCard.jsx    # variants: compact (landing) / detailed (course page)
│   │   ├── ReviewCard.jsx
│   │   └── EnrollCard.jsx
│   ├── learning/
│   │   ├── EnrolledCourseCard.jsx
│   │   ├── StreakCalendar.jsx
│   │   ├── AchievementsGrid.jsx
│   │   └── AchievementBadge.jsx
│   └── lesson/
│       ├── FakeVideoPlayer.jsx
│       ├── LessonSidebar.jsx
│       ├── MarkCompleteButton.jsx
│       └── BadgeUnlockModal.jsx
├── context/
│   └── EnrollmentContext.jsx     # EnrollmentProvider + useEnrollments()
├── hooks/
│   ├── useCourseFilters.js       # URL-synced catalog filter/search/sort state
│   └── useLocalStorage.js        # versioned, try/catch-guarded storage binding
├── data/
│   ├── courses.js                # 12 courses w/ sections + lessons
│   ├── categories.js
│   ├── instructors.js
│   ├── testimonials.js
│   ├── reviews.js
│   └── achievements.js
├── lib/
│   ├── progress.js               # progressFor(course, completedIds), nextLesson(), flatLessons()
│   ├── streak.js                 # currentStreak(activityLog, today), lastNDays()
│   └── format.js                 # formatDuration(min) → "5h 20m", formatCount(12400) → "12,400"
└── pages/
    ├── LandingPage.jsx
    ├── CoursesPage.jsx
    ├── CourseDetailPage.jsx
    ├── MyLearningPage.jsx
    ├── LessonPage.jsx
    └── NotFoundPage.jsx
```

Routing: `createBrowserRouter` in `main.jsx` with `App` as the layout route and children `/`, `/courses`, `/courses/:id`, `/learning`, `/lesson/:courseId/:lessonId`, `*`. Each page is registered with the router's `lazy` option for route-level code splitting. `vercel.json` adds an SPA rewrite (`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`) so deep links survive hard refresh.

## 3. Component inventory

| Component | Purpose | Key props |
|---|---|---|
| `Navbar` | Sticky top nav, active-link underline, enrolled-count pill | — (reads router + `useEnrollments`) |
| `MobileMenu` | Right-side nav drawer with focus trap | `open`, `onClose` |
| `Footer` | Brand, explore links, category deep links, copyright | — |
| `PageTransition` | `AnimatePresence` wrapper keyed by pathname | `children` |
| `ScrollToTop` | Scroll reset on pathname change (not on search-param change) | — |
| `Button` | Pill button/link, 4 variants, 3 sizes | `variant` (primary/secondary/ghost/inverse), `size` (sm/md/lg), `to`, `onClick`, `icon`, `disabled`, `fullWidth` |
| `Badge` | Small label pill | `variant` (beginner/intermediate/advanced/free/category/success), `children` |
| `StarRating` | Read-only stars with optional value/count text | `value`, `count`, `size`, `showValue` |
| `ProgressBar` | Animated fill bar with a11y attrs | `value` (0–100), `size` (xs/sm/md), `tone` (violet/green), `label` |
| `SectionHeading` | Eyebrow + title + subtitle block | `eyebrow`, `title`, `subtitle`, `align` |
| `GradientBlob` | Absolutely-positioned decorative blur blob | `color` (violet/blue/yellow), `size`, `className` |
| `EmptyState` | Icon, title, message, CTA | `icon`, `title`, `message`, `actionLabel`, `actionTo`, `onAction` |
| `Accordion` / `AccordionItem` | Generic animated disclosure list | Accordion: `children`; Item: `id`, `header`, `meta`, `defaultOpen`, `children` |
| `Avatar` | Rounded image w/ fallback initials | `src`, `alt`, `size` |
| `Toast` | Bottom-right notification w/ actions + countdown line | `message`, `actions`, `duration`, `onTimeout`, `onDismiss` |
| `Hero` | Landing hero: copy, CTAs, stats, photo + floats | — |
| `StatCounter` | Count-up stat (value + label) | `value`, `suffix`, `label`, `decimals` |
| `FloatingCourseCard` | Bobbing mini course card over hero photo | `course`, `position`, `delay` |
| `CategoryGrid` | Six-category section | — |
| `CategoryCard` | Icon + name + count, links to filtered catalog | `category` |
| `FeaturedCourses` | Featured 4-course section + browse-all CTA | — |
| `InstructorHighlights` | 4 compact instructor cards section | — |
| `TestimonialCard` | Quote, stars, avatar, name, role | `testimonial` |
| `CtaBanner` | Gradient CTA panel | — |
| `SearchBar` | Debounced search input synced to `?q=` | `value`, `onChange`, `placeholder` |
| `FilterSidebar` | Filter groups; sidebar ≥1024px, bottom sheet below | `filters`, `onChange`, `onClearAll`, `variant` (sidebar/sheet), `open`, `onClose` |
| `FilterGroup` | One checkbox/radio group | `label`, `options`, `selected`, `mode` (multi/single), `onToggle` |
| `SortSelect` | Styled native select for sort order | `value`, `onChange` |
| `ActiveFilterChips` | Removable chips + clear-all | `chips`, `onRemove`, `onClearAll` |
| `CourseCard` | Course tile: thumb, badges, rating, meta | `course`, `index` (stagger delay) |
| `CourseHero` | Detail-page header block | `course`, `instructor` |
| `LearnChecklist` | "What you'll learn" 6-item card | `items` |
| `CurriculumAccordion` | Sections/lessons accordion; link + completed modes | `course`, `interactive`, `activeLessonId`, `completedLessonIds` |
| `InstructorCard` | Instructor block | `instructor`, `variant` (compact/detailed) |
| `ReviewCard` | Single review | `review` |
| `EnrollCard` | Sticky price/CTA/progress card + mobile bottom bar | `course` (reads enrollment state internally) |
| `EnrolledCourseCard` | My Learning course tile w/ progress + continue | `course`, `enrollment` |
| `StreakCalendar` | 7/14-day activity strip + streak pill | `activityLog` |
| `AchievementsGrid` | 8-badge grid + earned counter | — (derives from `useEnrollments`) |
| `AchievementBadge` | Single earned/locked badge | `achievement`, `earned`, `justEarned` |
| `FakeVideoPlayer` | Demo player: thumbnail, overlay, fake controls | `course`, `lesson` |
| `LessonSidebar` | Course progress + interactive curriculum | `course`, `activeLessonId` |
| `MarkCompleteButton` | Complete/un-complete toggle | `completed`, `onToggle` |
| `BadgeUnlockModal` | Spring-pop achievement/course-complete modal | `badge`, `title`, `message`, `actions`, `onClose` |
| `LandingPage` … `NotFoundPage` | Route pages composing the above | — |

## 4. Mock-data shapes (`src/data/`)

### `courses.js` — array of 12 (inventory table in PRD §8 is authoritative for counts/values)

```js
{
  id: 'react-fundamentals',
  title: 'React Fundamentals',
  tagline: 'Go from zero to shipping interactive UIs with React 19.',
  description: 'Two paragraphs of course description…',
  category: 'web-development',          // categories.js id
  level: 'beginner',                    // 'beginner' | 'intermediate' | 'advanced'
  price: 0,                             // USD; 0 = Free
  anchorPrice: null,                    // e.g. 79 → strikethrough on EnrollCard; null for free
  rating: 4.8,
  ratingCount: 1284,
  students: 12400,
  featured: true,
  publishedAt: '2026-03-14',            // drives "Newest" sort
  updatedAt: '2026-06-01',              // "Updated June 2026"
  image: reactFundamentalsImg,          // imported from assets/courses/
  instructorId: 'maya-chen',
  learnItems: [ /* exactly 6 strings — PRD §5.2 */ ],
  sections: [
    {
      id: 's-rf-1',
      title: 'Getting Started',
      lessons: [
        { id: 'l-rf-1-1', title: 'Why React in 2026', durationMinutes: 9 },
        // …
      ],
    },
    // …
  ],
}
```

Lesson id convention: `l-<course-abbrev>-<sectionIndex>-<lessonIndex>` (e.g. `l-rf-2-3`). Derived helpers in `lib/progress.js` — never store totals that can be computed (`lessonCount`, `durationMinutes` totals are computed from sections).

### `categories.js` — array of 6

```js
{ id: 'web-development', name: 'Web Development', icon: 'Code2', blurb: 'React, TypeScript, and modern CSS.' }
```

Ids: `web-development`, `data-science`, `design`, `mobile-development`, `devops-cloud`, `ai-machine-learning`. Course counts are computed from `courses.js`, never stored.

### `instructors.js` — array of 5

```js
{
  id: 'maya-chen',
  name: 'Maya Chen',
  role: 'Senior Frontend Engineer',
  company: 'Verse',
  avatar: mayaChenImg,
  bio: 'Maya has shipped React apps to millions of users…',
  featured: true,                        // 4 of 5 shown on landing
}
```

Ids: `maya-chen`, `daniel-okafor`, `sofia-reyes`, `liam-patel`, `amara-diallo`. Instructor learner totals / course counts / rating are computed from `courses.js`.

### `testimonials.js` — array of 3

```js
{ id: 't-1', quote: '…', name: 'Jasmine Torres', role: 'Junior Frontend Developer', avatar: jasmineImg }
```

### `reviews.js` — 3 per course (36 total)

```js
{ id: 'r-rf-1', courseId: 'react-fundamentals', name: 'Alicia Grant', avatar: aliciaImg, rating: 5, date: '2026-06-18', text: '…' }
```

### `achievements.js` — array of 8 (ids/names/rules in PRD §6.4)

```js
{
  id: 'ten-lessons',
  name: 'Momentum',
  description: 'Complete 10 lessons',
  icon: 'Zap',
  check: (derived) => derived.totalCompletedLessons >= 10,
}
```

`check` receives a derived-stats object: `{ enrollmentCount, totalCompletedLessons, completedCourseCount, currentStreak }`.

## 5. State & persistence

### 5.1 localStorage

Single key: **`eduflow-enrollments`**. Stored shape:

```json
{
  "version": 1,
  "enrollments": {
    "react-fundamentals": {
      "enrolledAt": "2026-08-28T09:12:44.000Z",
      "completedLessonIds": ["l-rf-1-1", "l-rf-1-2"],
      "lastVisitedLessonId": "l-rf-1-3"
    }
  },
  "activityLog": ["2026-08-27", "2026-08-28"]
}
```

- `activityLog`: deduped, sorted `YYYY-MM-DD` local-date strings; a date is appended on enrollment and on lesson completion.
- `useLocalStorage` guards: `try/catch` around read/parse/write; `version !== 1` or parse failure → reset to initial state; storage-unavailable → in-memory fallback + `storageBlocked: true` flag (drives the PRD §9 banner).
- Writes happen synchronously with each action (single `useEffect` on state change).

### 5.2 `EnrollmentContext` (`useEnrollments()`)

State is `useReducer` over the stored shape. Public API:

| Member | Type | Notes |
|---|---|---|
| `enrollments` | object | Raw map (above) |
| `isEnrolled(courseId)` | fn → bool | |
| `enroll(courseId)` | fn | Adds entry, logs activity |
| `toggleLessonComplete(courseId, lessonId)` | fn | Add/remove id; logs activity on add only |
| `setLastVisited(courseId, lessonId)` | fn | Called by `LessonPage` on mount |
| `progressFor(courseId)` | fn → `{ pct, completed, total }` | `pct = Math.round(completed / total * 100)`, 0-guarded |
| `continueTarget(courseId)` | fn → lessonId | lastVisited → first incomplete → first lesson |
| `activityLog`, `currentStreak` | array, number | Streak via `lib/streak.js` |
| `earnedAchievements` | Set of ids | Derived each render from `achievements.js` checks — never persisted |
| `pendingUnlocks` / `consumeUnlock()` | array / fn | Session-only queue diffed on state change; feeds `BadgeUnlockModal` |
| `storageBlocked` | bool | Private-mode banner |

Everything except the stored shape is **derived** — progress, streaks, badges, counts. This is the project's core state-design thesis.

### 5.3 Catalog filter state (`useCourseFilters`)

Backed by `useSearchParams`. Params: `q`, `category` (repeatable), `level` (repeatable), `price` (repeatable), `rating`, `sort`. Returns `{ filters, results, counts, setParam, toggleParam, clearAll }`. Filtering pipeline: search match → category OR → level OR → price OR → rating gate → sort. All pure functions, unit-testable in isolation.

## 6. Animation implementation notes

All imports from `motion/react`. Global: wrap app usage with `useReducedMotion()`; when true, replace transforms with opacity-only and set durations to 0 where specified in PRD.

| Effect (PRD ref) | Implementation |
|---|---|
| Route transitions (§2.3) | `AnimatePresence mode="wait"` in `PageTransition`; child `motion.div` keyed by `location.pathname`; variants `initial={opacity:0, y:8}` → `animate` → `exit={opacity:0}`; 0.25s, ease `[0.16, 1, 0.3, 1]` |
| Hero entrance (§3.1) | Parent variants with `staggerChildren: 0.08`; children `{opacity: 0, y: 16}` → `{opacity: 1, y: 0}` |
| Floating cards (§3.1) | `animate={{ y: [0, -10, 0] }}`, `transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}`; skipped entirely under reduced motion |
| Stat count-up (§3.1) | `useMotionValue(0)` + `animate(mv, value, { duration: 1.2, ease: 'easeOut' })` inside `useInView` (`once: true`); render via `useTransform` + rounding |
| Card hover (§3.3) | `whileHover={{ y: -4 }}` on card + CSS transition for shadow; thumbnail `whileHover={{ scale: 1.04 }}` on inner `motion.img` |
| Catalog grid reflow (§4.4) | `motion.div layout` per card inside `AnimatePresence`; enter/exit `{opacity, scale: 0.98}`; `layout` handles reposition |
| Accordion (§5.3) | `AnimatePresence initial={false}`; panel `motion.div` `initial/exit={{ height: 0, opacity: 0 }}` `animate={{ height: 'auto', opacity: 1 }}`; chevron `animate={{ rotate: open ? 180 : 0 }}` |
| Progress fill (§5.6, §6.3, §7.3) | `ProgressBar` inner `motion.div` `animate={{ width: pct + '%' }}`, `transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}`; `initial={{ width: 0 }}` on first mount so bars visibly fill; re-animates from previous width on change |
| Badge spring pop (§7.4, §6.4) | `motion.div initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}`; modal backdrop plain opacity fade |
| Streak dots (§6.2) | Parent `staggerChildren: 0.04`; dots `initial={{ scale: 0 }} animate={{ scale: 1 }}` spring `{ stiffness: 300, damping: 24 }` |
| Filter bottom sheet (§4.6) | `motion.div` `initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}` spring `{ stiffness: 320, damping: 30 }` in `AnimatePresence` |
| Toast + countdown (§7.4) | Slide/fade via `AnimatePresence`; countdown line is a `motion.div` animating `scaleX 1 → 0` linearly over the 3s duration, `transformOrigin: left`; `onTimeout` fires navigation |
| Navbar active underline (§2.1) | `motion.span layoutId="nav-underline"` under the active `NavLink` |
| Mark-complete morph (§7.3) | Icon swap inside `AnimatePresence` with scale pop (spring `{ 300, 24 }`) |

## 7. Build milestones

| # | Milestone | Definition of done |
|---|---|---|
| M1 | **Scaffold & shell** | Vite 7 + React 19 + Tailwind v4 + router installed; `@theme` tokens from DESIGN-SYSTEM.md in `index.css`; fonts loading; `App` layout route with `Navbar`, `MobileMenu`, `Footer`, `ScrollToTop`, `NotFoundPage`; all 6 routes render placeholder pages; deployed once to Vercel with SPA rewrites working. |
| M2 | **Data & store** | All 6 data modules authored (12 full curricula matching PRD §8 counts; 36 reviews; images downloaded, converted to .webp, imported); `EnrollmentContext` + `useLocalStorage` complete with version guard and in-memory fallback; `lib/progress.js`, `lib/streak.js`, `lib/format.js` pure and correct (manual test via a temporary debug page). |
| M3 | **Landing page** | All 6 sections per PRD §3 with final copy; stat count-up, floating cards, staggered entrances; category cards deep-link with working query params; responsive per §3.7. |
| M4 | **Catalog** | Search/filter/sort fully URL-synced via `useCourseFilters`; chips, counts, empty state; grid reflow animation; mobile filter bottom sheet; responsive per §4.6. |
| M5 | **Course detail & enrollment** | Hero, checklist, curriculum accordion, instructor, reviews, sticky `EnrollCard` + mobile bottom bar; enroll writes `eduflow-enrollments`; Continue-learning target logic; 404 on bad id; Toast on enroll. |
| M6 | **My Learning** | Enrolled cards with animated progress, streak calendar with correct streak math (incl. "yesterday keeps streak" rule), achievements grid derived live, empty state; responsive per §6.6. |
| M7 | **Lesson player** | `FakeVideoPlayer` with play state + decorative controls; `LessonSidebar` interactive curriculum; mark-complete toggle recalculating progress everywhere; auto-advance toast with cancel; `BadgeUnlockModal` on 100% and on achievement unlocks; redirect guards (not enrolled → detail; bad lesson → first lesson); responsive per §7.6. |
| M8 | **Polish & ship** | Route transitions; full `prefers-reduced-motion` pass; keyboard walkthrough of BRIEF success criterion #2; axe DevTools clean on all routes; Lighthouse mobile ≥ 90/95/95; final Vercel deploy + README with screenshots. |

## 8. Performance notes

- Route-level code splitting via router `lazy`; landing is the only eagerly-loaded page.
- Images: local .webp, thumbnails ≤ 120KB, hero ≤ 200KB, avatars ≤ 30KB; explicit `width`/`height` to prevent CLS; `loading="lazy"` on everything below the fold; hero image `fetchpriority="high"`.
- Fonts: `preconnect` to `fonts.gstatic.com`, `display=swap`, only used weights (Sora 600/700, Inter 400/500/600).
- Derivations (`progressFor`, filtering) memoized with `useMemo` keyed on store/searchParams; 12 courses means costs are trivial — memoization is for discipline, not need.
- Animate only `transform`/`opacity` (exception: accordion `height`, scoped and short); no layout thrash from scroll listeners — `useInView` uses IntersectionObserver.

## 9. Accessibility notes

- Landmarks: `header`/`nav`/`main`/`footer`; one `h1` per route; skip link first in DOM.
- Focus: visible 2px violet ring (`outline-offset: 2px`) on every interactive element; focus trapped in `MobileMenu`, filter sheet, and `BadgeUnlockModal` (Esc closes, focus returns to trigger).
- ARIA: accordion triggers are `<button aria-expanded aria-controls>`; `ProgressBar` = `role="progressbar"` + `aria-valuenow/min/max` + visually-hidden label; `StarRating` = single `aria-label` ("Rated 4.8 out of 5, 1,284 ratings") with decorative star icons hidden; decorative controls in `FakeVideoPlayer` are `aria-disabled` with tooltip; toast region = `role="status"`, modal = `role="dialog" aria-modal="true"`.
- Filters are real `<input type="checkbox">`/`<input type="radio">` in `<fieldset>`s with `<legend>`s; sort is a native `<select>` with a `<label>`.
- Color: body text uses ink tokens (≥ 7:1); white-on-violet buttons ≈ 5.7:1 (AA); yellow `#FBBF24` is never text on white — icon fills and tinted backgrounds only, paired with `#78350F` text when needed.
- `useReducedMotion` gates every transform/loop animation per PRD; auto-advance countdown is cancellable ("Stay") and announced via the toast's `role="status"`.
