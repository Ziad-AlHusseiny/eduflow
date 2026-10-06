# EduFlow — Product Requirements Document

Complete page-by-page requirements, copy, interactions, acceptance criteria, and responsive rules for the EduFlow e-learning platform.

| | |
|---|---|
| **Project** | EduFlow |
| **Document** | PRD |
| **Status** | Approved |
| **Owner** | Ziad |
| **Date** | 2026-08-28 |

---

## 1. Overview

EduFlow is a front-end-only, multi-page e-learning SPA (react-router-dom v7). All data comes from mock modules in `src/data/`. Enrollments and lesson completion persist to localStorage key `eduflow-enrollments`; progress, streaks, and achievements are derived from that store. Routes:

| Route | Page component | Purpose |
|---|---|---|
| `/` | `LandingPage` | Marketing home: hero, categories, featured courses, instructors, testimonials, CTA |
| `/courses` | `CoursesPage` | Catalog with search, filters, sorting |
| `/courses/:id` | `CourseDetailPage` | Course overview, curriculum, instructor, reviews, sticky enroll card |
| `/learning` | `MyLearningPage` | Enrolled courses w/ progress, streak calendar, achievements |
| `/lesson/:courseId/:lessonId` | `LessonPage` | Fake video player, curriculum sidebar, mark complete, auto-advance |
| `*` | `NotFoundPage` | 404 edge-case handling |

Breakpoints used throughout: **Mobile** = 375–767px, **Tablet** = 768–1023px, **Desktop** = 1024px+.

## 2. Global shell

### 2.1 Navbar (`Navbar`, `MobileMenu`)

- Sticky top, white at 80% opacity with backdrop blur, 1px bottom border, height 68px.
- Left: logo — `GraduationCap` lucide icon in a violet rounded square + wordmark **"EduFlow"** (Sora 700). Links to `/`.
- Center links (desktop): **"Home"**, **"Courses"**, **"My Learning"**. Active route: violet text + 2px violet underline that slides between links (motion `layoutId`). "My Learning" shows a violet count pill with the number of enrolled courses when ≥ 1.
- Right (desktop): primary button **"Explore courses"** → `/courses`.
- Mobile/tablet: links collapse into a hamburger (`Menu` icon, 44×44px tap target). `MobileMenu` is a full-height drawer sliding from the right with the three links, the "Explore courses" button, and a close (`X`) button. Focus is trapped while open; Esc closes.

**Acceptance criteria**
- Given any route, When I press Tab from page load, Then the first focusable element is a skip link "Skip to content" that jumps to `<main>`.
- Given I am enrolled in 2 courses, When the navbar renders, Then "My Learning" shows a pill containing "2".
- Given the mobile menu is open, When I press Esc or tap the backdrop, Then it closes and focus returns to the hamburger button.

### 2.2 Footer (`Footer`)

- Three columns (stacked on mobile): 
  - Brand: logo + **"Learn tech skills through guided, trackable courses."**
  - **"Explore"**: Home → `/`, All courses → `/courses`, My Learning → `/learning`.
  - **"Top categories"**: Web Development → `/courses?category=web-development`, Data Science → `/courses?category=data-science`, Design → `/courses?category=design`, DevOps & Cloud → `/courses?category=devops-cloud`.
- Bottom bar: **"© 2026 EduFlow. A portfolio project by Ziad — not a real school."**

### 2.3 Route transitions (`PageTransition`, `ScrollToTop`)

- On route change: outgoing page fades out, incoming fades in and rises 8px (250ms, ease-out-soft). Scroll resets to top on navigation (not on query-param changes within `/courses`).
- Given `prefers-reduced-motion: reduce`, When routes change, Then only an opacity crossfade plays (no translation).

---

## 3. `/` — Landing page

Section order (authoritative): Hero → Category grid → Featured courses → Instructor highlights → Testimonials → CTA banner.

### 3.1 Hero (`Hero`, `StatCounter`, `FloatingCourseCard`)

**Copy**
- Eyebrow (pill, violet-soft bg): **"★ 4.7 average rating across 12 expert-led courses"**
- Headline (display): **"Master tech skills, one lesson at a time."** — "one lesson at a time" rendered in the violet→blue brand gradient.
- Subheadline: **"Guided courses in development, design, and data — with streaks, badges, and progress tracking that keep you coming back until you finish."**
- Primary CTA: **"Explore courses"** → `/courses`. Secondary CTA (secondary variant): **"Start learning free"** → `/courses?price=free`.
- Stats row (4 `StatCounter`s): **"12" / "Expert-led courses"**, **"40K+" / "Active learners"**, **"4.7" / "Average rating"**, **"92%" / "Say they learn faster"**.

**Layout & visuals**
- Desktop: two columns — copy left (55%), visual right: a large rounded-2xl hero photo (learner at a desk, warm light) with two decorative `GradientBlob`s behind it (violet top-left, yellow bottom-right) and three `FloatingCourseCard`s overlapping the photo edges. Floating cards are mini course cards (thumbnail, title, star rating) for **React Fundamentals**, **UI Design with Figma**, and **Machine Learning Crash Course**; each links to its detail page.
- One extra floating chip on the photo: **"🔥 5-day streak"** styled like the streak pill (pure decoration, `aria-hidden`).

**Motion**
- Entrance: eyebrow → headline → sub → CTAs → stats, staggered 80ms, each fading up 16px (400ms ease-out-soft).
- Floating cards: continuous vertical bob ±10px, 6s ease-in-out loop, delays offset 0s/0.8s/1.6s. Disabled under reduced motion.
- `StatCounter`: numbers count up from 0 over 1.2s when scrolled into view, once. Reduced motion: render final values immediately.

**Acceptance criteria**
- Given the landing page loads, When the hero enters, Then all copy above is rendered verbatim.
- Given I click "Start learning free", When `/courses` opens, Then the Free price filter is pre-applied via the URL and shows exactly the 4 free courses.

### 3.2 Category grid (`CategoryGrid`, `CategoryCard`)

**Copy** — `SectionHeading`: eyebrow **"Categories"**, title **"Find your path"**, subtitle **"Six focused tracks. Pick one and start building real skills."**

Six `CategoryCard`s (icon in tinted rounded square, name, course count):

| Category | lucide icon | Count label |
|---|---|---|
| Web Development | `Code2` | "3 courses" |
| Data Science | `BarChart3` | "2 courses" |
| Design | `Palette` | "2 courses" |
| Mobile Development | `Smartphone` | "2 courses" |
| DevOps & Cloud | `Cloud` | "2 courses" |
| AI & Machine Learning | `BrainCircuit` | "1 course" |

Each card links to `/courses?category=<slug>`. Hover: lift −4px, icon square tints to full violet with white icon (150ms).

**Acceptance criteria**
- Given I click the "Design" card, When the catalog opens, Then only the 2 Design courses are listed and the Design filter checkbox is checked.

### 3.3 Featured courses (`FeaturedCourses`, `CourseCard`)

**Copy** — eyebrow **"Featured"**, title **"Courses learners love"**, subtitle **"The highest-rated picks across every track."** Below the grid, a secondary button: **"Browse all 12 courses"** → `/courses`.

- Shows the 4 courses flagged `featured: true`: React Fundamentals, Advanced TypeScript Patterns, Design Systems That Scale, Machine Learning Crash Course.
- `CourseCard` spec (used here and in the catalog): 16:9 thumbnail with level `Badge` overlaid top-left and price top-right (**"Free"** green badge, or **"$49"** on a white pill); below: category caption, course title (2-line clamp), instructor name, `StarRating` (value + "(1,284)" count), meta row "18 lessons · 5h 20m".
- Cards stagger-fade in on scroll (60ms stagger); hover lifts −4px with `shadow-lift` and thumbnail scales to 1.04 inside its clipped container.

### 3.4 Instructor highlights (`InstructorHighlights`, `InstructorCard`)

**Copy** — eyebrow **"Instructors"**, title **"Learn from people who build for a living"**, subtitle **"Practitioners first, teachers second — every course is grounded in real production work."**

Four `InstructorCard`s (compact variant: avatar, name, role, star rating + total students):

| Name | Role line | Rating / students |
|---|---|---|
| Maya Chen | Senior Frontend Engineer · Verse | 4.7 · 19,800 learners |
| Sofia Reyes | Principal Product Designer · Northwind | 4.8 · 25,900 learners |
| Liam Patel | Lead Data Scientist · Datawheel | 4.7 · 32,900 learners |
| Amara Diallo | Cloud Architect · Skylane | 4.7 · 19,700 learners |

(The fifth instructor, Daniel Okafor, exists in data and appears on his course detail pages; the landing grid shows four for layout balance.)

**Motion** — cards stagger-fade up on scroll into view (60ms stagger, 400ms ease-out-soft, once). No hover lift: instructor cards on the landing page are not links (DESIGN-SYSTEM §6.3, non-interactive cards). Reduced motion: opacity-only entrance.

### 3.5 Testimonials (`TestimonialCard`)

**Copy** — eyebrow **"Testimonials"**, title **"Loved by learners worldwide"**. Three cards, each: quote, 5-star row (yellow), avatar (`Avatar`), name, role.

1. **"The streak calendar sounds like a gimmick until it rewires your evenings. I finished two courses in six weeks."** — Jasmine Torres, Junior Frontend Developer
2. **"EduFlow's curriculum view is the clearest I've used. I always know exactly what's next and how far I've come."** — Marcus Webb, Career Switcher
3. **"I landed my first data role three months after finishing Python for Data Analysis. The progress tracking kept me honest."** — Priya Nair, Data Analyst

**Motion** — cards stagger-fade up on scroll into view (60ms stagger, 400ms ease-out-soft, once). No hover lift (non-interactive cards, DESIGN-SYSTEM §6.3). Reduced motion: opacity-only entrance.

### 3.6 CTA banner (`CtaBanner`)

- Full-width rounded-2xl panel with the violet→blue gradient background and two soft blob decorations; white text.
- Heading: **"Your next skill is one lesson away."** Subtext: **"Join 40,000+ learners building their careers on EduFlow — free courses included."** Button (inverse variant, white bg / violet text): **"Get started free"** → `/courses?price=free`.

**Motion** — the panel fades up 16px on scroll into view (400ms ease-out-soft, once); blob decorations are static. Reduced motion: opacity-only entrance.

### 3.7 Landing responsive rules

| Breakpoint | Rules |
|---|---|
| 375px | Hero single column: copy, then photo with only 1 floating card (React Fundamentals) to avoid clutter; stats 2×2 grid. Categories 2-col. Featured/testimonials/instructors: 1-col stack. CTA banner text-centered, button full-width. |
| 768px | Hero still stacked but photo shows all 3 floating cards; stats 4-across. Categories 3-col. Featured 2-col. Instructors 2-col. Testimonials 1-col centered (max-w-2xl). |
| 1024px+ | Hero two-column. Categories 3-col (2 rows). Featured 4-col. Instructors 4-col. Testimonials 3-col. |

---

## 4. `/courses` — Catalog

### 4.1 Header & search (`SearchBar`)

- h1: **"All courses"**. Subtitle: **"12 courses across six tracks — filter, sort, and find your fit."**
- `SearchBar` with `Search` icon, placeholder **"Search courses, topics, or instructors…"**. Matches against course title, tagline, category name, and instructor name (case-insensitive substring). Debounced 200ms; syncs to `?q=`.

### 4.2 Filters (`FilterSidebar`, `FilterGroup`, `ActiveFilterChips`)

Filter groups (all real checkboxes; multi-select within a group, AND across groups, OR within):

| Group | Options |
|---|---|
| **Category** | Web Development, Data Science, Design, Mobile Development, DevOps & Cloud, AI & Machine Learning |
| **Level** | Beginner, Intermediate, Advanced |
| **Price** | Free, Paid |
| **Rating** | "4.5 & up", "4.0 & up" (radio behavior — one at a time) |

- All filter state lives in URL query params (`?category=design&level=beginner&price=free&rating=4.5&q=figma&sort=rating`). Back/forward navigates filter history; links are shareable.
- `ActiveFilterChips` renders above results: one removable chip per active filter (e.g. "Design ×", "Free ×") plus **"Clear all"** when ≥ 2 chips.
- Results header: **"Showing 8 of 12 courses"** (live counts) next to `SortSelect`.

### 4.3 Sorting (`SortSelect`)

Native `<select>`, styled. Options, in order: **"Most popular"** (default; students desc), **"Highest rated"** (rating desc, then count desc), **"Newest"** (`publishedAt` desc), **"Price: low to high"**, **"Price: high to low"**.

### 4.4 Results grid

- `CourseCard` grid (same card spec as §3.3). Cards animate in with a 40ms stagger when the filtered set changes (motion `layout` + `AnimatePresence` fade/scale 0.98→1 for entering/leaving cards).

### 4.5 Empty state (`EmptyState`)

- When 0 results: `SearchX` icon in a violet-soft circle, title **"No courses match your filters"**, message **"Try removing a filter or searching for something broader."**, button **"Clear all filters"** (resets all params except `sort`).

**Acceptance criteria**
- Given filters Category=Design and Price=Free, When the grid updates, Then only "UI Design with Figma" is shown and the count reads "Showing 1 of 12 courses".
- Given `?q=maya`, When results render, Then React Fundamentals and Build Mobile Apps with React Native are listed (instructor match).
- Given active filters, When I reload the page, Then identical filters, search text, and sort order are restored from the URL.
- Given 0 results, When I click "Clear all filters", Then all 12 courses return and the URL query is cleared (sort preserved).

### 4.6 Catalog responsive rules

| Breakpoint | Rules |
|---|---|
| 375px | Filters hidden behind a **"Filters"** button (with active-count badge, e.g. "Filters · 3") that opens a bottom sheet (85vh, drag handle, spring slide-up, `Apply` button closes). Grid 1-col. Search full-width above sort. |
| 768px | Same filter bottom sheet. Grid 2-col. Search and sort share one row. |
| 1024px+ | Persistent `FilterSidebar` left (260px, sticky below navbar); grid 3-col right. |

---

## 5. `/courses/:id` — Course detail

Layout desktop: main column (breadcrumb, hero, what-you'll-learn, curriculum, instructor, reviews) + right rail with sticky `EnrollCard` (top offset 84px).

### 5.1 Course hero (`CourseHero`)

- Breadcrumb: "Courses / {course title}" — "Courses" links back to `/courses`.
- Category `Badge`, course title (h1), tagline, then a meta row: `StarRating` with numeric value and count (e.g. **"4.8 (1,284 ratings)"**), **"12,400 learners"**, level badge, **"5h 20m total"**, **"Updated June 2026"**.
- Byline: **"Created by Maya Chen"** — links (anchor scroll) to the instructor card.
- Background: soft violet-tinted panel (`primary-soft` at 40%) with one gradient blob, rounded-2xl.

### 5.2 What you'll learn (`LearnChecklist`)

- Card titled **"What you'll learn"**; 6 items per course, each with a green `Check` icon. Two columns on ≥768px, one on mobile. Items stagger-fade in on scroll (40ms).
- Canonical copy for React Fundamentals: "Build interactive UIs with components, props, and state", "Set up a modern React 19 + Vite workflow from scratch", "Handle events, forms, and controlled inputs confidently", "Manage side effects with useEffect the right way", "Compose complex screens from small, testable pieces", "Ship a finished project to production on Vercel". (Every course defines its own 6 items in `src/data/courses.js`.)

### 5.3 Curriculum (`CurriculumAccordion`, `Accordion`, `AccordionItem`)

- Header row: **"Course content"** + summary line **"4 sections · 18 lessons · 5h 20m total"** (computed from data).
- One `AccordionItem` per section: section title, "5 lessons · 92 min" meta, chevron. First section open by default; multiple sections may be open at once.
- Lesson rows: `PlayCircle` icon, lesson title, duration right-aligned ("18 min"). On this page lesson rows are not links (enrollment is the entry point); for an enrolled course each row becomes a link to `/lesson/:courseId/:lessonId` and completed lessons swap the icon for a green `CheckCircle2`.
- Motion: panel height animates open/closed (250ms ease-out-soft), chevron rotates 180°.
- Canonical curriculum for React Fundamentals (authoritative; the other 11 courses are authored in data with counts matching §8):
  - **Getting Started** (4 lessons · 58 min): Why React in 2026 (9), Setting Up with Vite (14), Your First Component (18), JSX Rules of the Road (17)
  - **Components & Props** (5 · 92): Thinking in Components (16), Props In Depth (21), Composition Patterns (19), Conditional Rendering (14), Rendering Lists with Keys (22)
  - **State & Events** (5 · 96): useState Fundamentals (20), Handling Events (15), Forms & Controlled Inputs (24), Lifting State Up (18), useEffect Essentials (19)
  - **Shipping a Project** (4 · 74): Building the Watchlist App (26), Styling with Tailwind (17), Deploying to Vercel (12), Where to Go Next (19)

### 5.4 Instructor (`InstructorCard`, detailed variant)

- Heading **"Your instructor"**: large avatar, name, role · company, stat row (`Star` 4.7 instructor rating · `Users` 19,800 learners · `PlayCircle` 2 courses), then a 2–3 sentence bio from data.

### 5.5 Reviews (`ReviewCard`)

- Heading **"What learners say"**. Summary block: big average ("4.8"), yellow star row, "1,284 ratings".
- 3 `ReviewCard`s per course from `src/data/reviews.js`: avatar, name, star row, relative date ("2 months ago"), review text. Canonical React Fundamentals reviews:
  1. Alicia Grant ★5 — **"I'd bounced off React twice before. The pacing here finally made components click."**
  2. Tom Nakamura ★5 — **"Short lessons, real project, zero filler. Finished it in two weeks of lunch breaks."**
  3. Fatima El-Sayed ★4 — **"Great fundamentals. I'd love a deeper section on useEffect edge cases, but it's an excellent start."**

### 5.6 Sticky enroll card (`EnrollCard`)

- Card: course thumbnail, price line (**"Free"** in green, or **"$49"**; paid courses also show a muted strikethrough anchor price, e.g. "$79"), CTA, and an includes list with lucide icons: `MonitorPlay` "5h 20m of guided lessons", `ListChecks` "18 lessons in 4 sections", `Trophy` "Finisher badge on completion", `Clock` "Learn at your own pace, forever".
- **Not enrolled:** primary button **"Enroll now"**. Clicking enrolls instantly (no checkout — front-end only), writes to `eduflow-enrollments`, morphs the button to the enrolled state, and shows a `Toast`: **"Enrolled! Your first lesson is ready."**
- **Enrolled:** an animated `ProgressBar` with **"32% complete"** label + primary button **"Continue learning"** → last-visited lesson, else first incomplete, else lesson 1. At 100%: green **"Completed"** badge + button **"Review course"** → first lesson.

**Acceptance criteria**
- Given I am not enrolled, When I click "Enroll now", Then `eduflow-enrollments` contains the course id with `enrolledAt` set, the navbar "My Learning" pill increments, and the card shows "Continue learning" with a 0% progress bar — without a page reload.
- Given I am enrolled with `lastVisitedLessonId` = `l-rf-2-3`, When I click "Continue learning", Then I land on `/lesson/react-fundamentals/l-rf-2-3`.
- Given the course id in the URL doesn't exist in data, When the page loads, Then `NotFoundPage` renders with a "Browse all courses" link.

### 5.7 Detail responsive rules

| Breakpoint | Rules |
|---|---|
| 375px | Single column. `EnrollCard` content splits: thumbnail/includes render inline after the hero; price + CTA + progress become a fixed bottom bar (safe-area padded, shadow-modal). Checklist 1-col. |
| 768px | Same as mobile but checklist 2-col; bottom bar persists. |
| 1024px+ | Two columns: main (minmax) + 360px right rail; `EnrollCard` sticky at top 84px; no bottom bar. |

---

## 6. `/learning` — My Learning

Section order: header → streak calendar → enrolled courses → achievements.

### 6.1 Header

- h1: **"My Learning"**. Dynamic subtitle: **"You're enrolled in {n} course{s} — keep the momentum going."** With 1 course: "…in 1 course…".

### 6.2 Learning streak (`StreakCalendar`)

- Card titled **"Learning streak"** with a flame pill: `Flame` icon + **"{n}-day streak"** (current streak; "No streak yet — today's a good day to start." replaces the pill at 0).
- Strip of the last 14 days (7 on mobile): weekday initial above, a circle per day. Active days (≥1 lesson completed or enrollment that day, from `activityLog`): violet-filled circle with white `Check`. Today has a violet ring. Inactive: border-only circle.
- Circles stagger-scale in (40ms) on mount.
- Streak definition: consecutive active days ending today or yesterday (yesterday keeps the streak alive until midnight).

### 6.3 Enrolled courses (`EnrolledCourseCard`)

- One card per enrollment, most recently active first: thumbnail, category caption, title, **"12 of 18 lessons"**, `ProgressBar` + **"67% complete"**, primary button **"Continue"** (→ same target logic as §5.6). Progress bar animates from 0 to value on mount (800ms ease-out-soft).
- At 100%: green **"Completed"** badge over the thumbnail, bar full in green, button becomes secondary **"Review course"**.

### 6.4 Achievements (`AchievementsGrid`, `AchievementBadge`)

- Heading **"Achievements"** + counter **"3 of 8 earned"**. Grid of 8 badges:

| id | Name | Unlock rule | lucide icon |
|---|---|---|---|
| `first-enrollment` | First Step | Enroll in your first course | `Footprints` |
| `first-lesson` | Lift Off | Complete your first lesson | `Rocket` |
| `ten-lessons` | Momentum | Complete 10 lessons | `Zap` |
| `twenty-five-lessons` | Deep Diver | Complete 25 lessons | `Anchor` |
| `three-enrollments` | Explorer | Enroll in 3 courses | `Compass` |
| `first-course-complete` | Finisher | Complete every lesson in a course | `Trophy` |
| `streak-3` | Warming Up | Learn 3 days in a row | `Sunrise` |
| `streak-7` | On Fire | Learn 7 days in a row | `Flame` |

- Earned: yellow-tinted circle, colored icon, name + unlock rule as caption. Locked: grayscale, `Lock` mini-icon in the corner, 60% opacity, rule text reads as the hint (e.g. "Complete 10 lessons to unlock"). Earned badges have a subtle idle sheen; a newly earned badge (this session) plays the spring pop (scale 0 → 1, stiffness 260 / damping 18).

### 6.5 Empty state

- With 0 enrollments the page shows only the header and an `EmptyState`: `BookOpen` icon, title **"Your learning journey starts here"**, message **"Enroll in a course and it will appear on this page with progress tracking, streaks, and badges."**, button **"Explore courses"** → `/courses`. Streak and achievements sections are hidden.

**Acceptance criteria**
- Given I completed lessons on 2026-08-27 and 2026-08-28, When I open My Learning on 2026-08-28, Then the flame pill reads "2-day streak" and both day circles are filled.
- Given I have completed 10 total lessons across courses, When the achievements grid renders, Then "Momentum" is earned and "Deep Diver" remains locked.
- Given I un-complete a lesson (toggle off) dropping totals below a threshold, When state recomputes, Then the affected badge reverts to locked (achievements are derived, never stored).

### 6.6 Learning responsive rules

| Breakpoint | Rules |
|---|---|
| 375px | Streak strip shows 7 days. Course cards 1-col (horizontal layout: small thumbnail left, content right). Achievements 2-col. |
| 768px | Streak 14 days. Course cards 2-col (vertical card layout). Achievements 4-col. |
| 1024px+ | Course cards 3-col. Achievements 4-col, larger badges. |

---

## 7. `/lesson/:courseId/:lessonId` — Lesson player

Layout desktop: main column (player + lesson info) left, `LessonSidebar` right (360px). 

### 7.1 Top bar

- Back link: `ArrowLeft` + **"My Learning"** → `/learning`. Course title (truncated) center/left. Right: **"12 of 18 lessons · 67%"** + a slim 4px `ProgressBar`.

### 7.2 Fake video player (`FakeVideoPlayer`)

- 16:9 rounded-2xl container: course thumbnail with a dark gradient scrim, centered play overlay (72px white circle, violet `Play` icon).
- Clicking play (or pressing Space/Enter while the player is focused) toggles a fake "playing" state: overlay fades out, a decorative playhead advances along the scrubber over 45 seconds regardless of lesson duration, timestamp counts up against the lesson's real duration label ("03:12 / 18:00" scaled).
- Control bar (visible on hover/focus, always visible on touch): play/pause toggle (functional), scrubber (decorative, not draggable), volume `Volume2`, settings `Settings`, fullscreen `Maximize` (all decorative, `aria-disabled`, tooltip **"Demo player"**).
- If the fake playhead reaches the end, the player pauses and shows the overlay again.

### 7.3 Lesson info & mark complete (`MarkCompleteButton`)

- Below the player: section caption ("Section 2 · Components & Props"), lesson title (h1), duration ("21 min").
- `MarkCompleteButton`: 
  - Incomplete: outlined button `Circle` + **"Mark as complete"**.
  - Complete: green filled `CheckCircle2` + **"Completed"** (clicking again un-completes — toggle).
- Marking complete: writes the lesson id into `eduflow-enrollments`, records today in the activity log, and recalculates progress everywhere (top bar, sidebar, enroll card, My Learning) — bars animate from previous value to new value.

### 7.4 Auto-advance & badge pop (`Toast`, `BadgeUnlockModal`)

- On marking complete (not on un-complete), if a next lesson exists (next in section, else first of next section): a `Toast` slides in bottom-right — **"Up next: Composition Patterns"** with actions **"Go now"** and **"Stay"** — and the app auto-navigates after 3 seconds unless "Stay" is clicked. The toast shows a draining progress line for the countdown.
- If the completed lesson brings the course to **100%**: no auto-advance; instead `BadgeUnlockModal` opens — backdrop fade, badge medal (`Trophy` in a yellow circle) springs in (scale 0, rotate −12° → rest; stiffness 260, damping 18), heading **"Course complete!"**, text **"You finished React Fundamentals — the Finisher badge is yours."**, buttons **"View achievements"** → `/learning` and **"Back to course"** → `/courses/:id`. Focus is trapped; Esc closes.
- Any other achievement earned by this completion (e.g. Momentum) also pops via `BadgeUnlockModal` with that badge's icon, name, and rule as the text, queued after the toast/navigation settles — one modal at a time.

### 7.5 Curriculum sidebar (`LessonSidebar`)

- Header: course title + overall `ProgressBar` with "67%". Body: the course's sections/lessons (reusing `CurriculumAccordion` in interactive mode): every lesson is a link, the active lesson row is violet-tinted with a `Play` indicator, completed rows show green `CheckCircle2`. The section containing the active lesson is auto-expanded; the active row is scrolled into view on mount.

**Acceptance criteria**
- Given I am on lesson `l-rf-2-2` and mark it complete, When 3 seconds pass without clicking "Stay", Then the route changes to `/lesson/react-fundamentals/l-rf-2-3` and the sidebar highlight moves.
- Given 17 of 18 lessons are complete, When I mark the last lesson complete, Then progress hits 100%, `BadgeUnlockModal` opens with the Finisher badge spring pop, and no auto-advance occurs.
- Given I open a lesson URL for a course I'm not enrolled in, When the page loads, Then I am redirected to `/courses/:courseId` (enrollment is the entry point).
- Given an invalid `lessonId` for a valid enrolled course, When the page loads, Then I am redirected to that course's first lesson.
- Given `prefers-reduced-motion: reduce`, When the badge modal opens, Then the badge appears without spring/rotation (opacity only) and progress bars update instantly.

### 7.6 Lesson responsive rules

| Breakpoint | Rules |
|---|---|
| 375px | Single column: top bar (progress % only, no slim bar), player full-bleed within padding, lesson info, then curriculum in a collapsible **"Course content"** panel below (`Accordion`, collapsed by default). Mark-complete button full-width. Toast becomes full-width bottom banner. |
| 768px | Same stack; curriculum panel expanded by default. |
| 1024px+ | Two columns: player main + 360px sticky sidebar with its own scroll (`max-height: calc(100vh − 84px)`). |

---

## 8. Course inventory (authoritative data)

All 12 courses. Counts and totals below are the source of truth for `src/data/courses.js` (full lesson lists are authored in data at build milestone M2; React Fundamentals' curriculum in §5.3 is canonical).

| id (slug) | Title | Category | Level | Price | Rating (count) | Students | Sections | Lessons | Duration | Instructor | Featured |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `react-fundamentals` | React Fundamentals | Web Development | Beginner | Free | 4.8 (1,284) | 12,400 | 4 | 18 | 5h 20m | Maya Chen | Yes |
| `advanced-typescript` | Advanced TypeScript Patterns | Web Development | Advanced | $49 | 4.9 (861) | 6,850 | 5 | 22 | 6h 45m | Daniel Okafor | Yes |
| `css-mastery` | Modern CSS Mastery | Web Development | Intermediate | $29 | 4.7 (1,052) | 9,300 | 4 | 20 | 5h 50m | Sofia Reyes | No |
| `python-data-analysis` | Python for Data Analysis | Data Science | Beginner | Free | 4.6 (1,730) | 15,200 | 5 | 24 | 7h 10m | Liam Patel | No |
| `sql-for-analysts` | SQL for Analysts | Data Science | Intermediate | $39 | 4.7 (940) | 8,100 | 4 | 16 | 4h 30m | Liam Patel | No |
| `figma-ui-design` | UI Design with Figma | Design | Beginner | Free | 4.8 (1,368) | 11,700 | 4 | 17 | 4h 55m | Sofia Reyes | No |
| `design-systems` | Design Systems That Scale | Design | Advanced | $59 | 4.9 (612) | 4,900 | 5 | 19 | 6h 05m | Sofia Reyes | Yes |
| `react-native-apps` | Build Mobile Apps with React Native | Mobile Development | Intermediate | $49 | 4.5 (803) | 7,400 | 5 | 21 | 6h 30m | Maya Chen | No |
| `swift-essentials` | Swift Essentials for iOS | Mobile Development | Beginner | $29 | 4.4 (589) | 5,600 | 4 | 15 | 4h 15m | Daniel Okafor | No |
| `docker-kubernetes` | Docker & Kubernetes: Ship with Confidence | DevOps & Cloud | Intermediate | $59 | 4.8 (976) | 8,900 | 5 | 20 | 6h 20m | Amara Diallo | No |
| `aws-cloud-foundations` | AWS Cloud Foundations | DevOps & Cloud | Beginner | Free | 4.5 (1,204) | 10,800 | 4 | 14 | 3h 50m | Amara Diallo | No |
| `ml-crash-course` | Machine Learning Crash Course | AI & Machine Learning | Intermediate | $69 | 4.9 (1,090) | 9,600 | 5 | 23 | 7h 25m | Liam Patel | Yes |

## 9. Cross-cutting edge cases

| Case | Behavior |
|---|---|
| Corrupt / unparsable `eduflow-enrollments` JSON | Caught on read; store resets to the empty initial state; app renders as first visit (no crash). |
| localStorage unavailable (private mode / disabled) | Store runs in-memory for the session; dismissible banner on `/learning`: **"Heads up — this browser is blocking storage, so progress won't be saved."** |
| Store `version` ≠ current | Store resets to initial state (documented migration point). |
| Unknown course/lesson ids in the store (data changed) | Ignored during derivation; never crash progress math. |
| Enrolled in 0 / catalog filtered to 0 | Empty states per §6.5 / §4.5. |
| Unknown route | `NotFoundPage`: h1 **"404 — this page dropped out"**, text **"The page you're looking for doesn't exist. Your courses are still right where you left them."**, buttons **"Go home"** → `/` and **"Browse courses"** → `/courses`. |
| Division by zero (course with 0 lessons) | `progress = 0`; cannot occur with shipped data but guarded in `lib/progress.js`. |

## 10. Non-goals

- No real video, no backend, no auth, no payments/checkout, no user-generated reviews or ratings, no certificates, no notifications/email, no i18n, no dark mode, no lesson locking, no infinite scroll/pagination (12 courses render in one grid).
