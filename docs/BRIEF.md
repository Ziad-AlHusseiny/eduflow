# EduFlow — Product Brief

Learn tech skills through guided, trackable courses.

| | |
|---|---|
| **Project** | EduFlow |
| **Document** | Product Brief |
| **Status** | Approved |
| **Owner** | Ziad |
| **Date** | 2026-08-28 |

---

## 1. One-liner

EduFlow is an e-learning platform where learners enroll in expert-led tech courses and stay motivated through visible progress, learning streaks, and achievement badges.

## 2. Elevator pitch

Most online courses are abandoned at lesson three — not because the content is bad, but because nothing pulls the learner back. EduFlow is built around momentum. Every course is broken into short, sequenced lessons; every completed lesson moves a progress bar you can feel; every consecutive learning day extends a streak; and finishing a course pops a badge you actually earned. Twelve courses across six tracks — Web Development, Data Science, Design, Mobile Development, DevOps & Cloud, and AI & Machine Learning — taught by five practitioners who build for a living. Enroll in seconds, pick up exactly where you left off, and watch "someday I'll learn React" turn into an 18-for-18 checklist.

## 3. Target users (of the fictional product)

| Persona | Situation | What EduFlow gives them |
|---|---|---|
| **Career switcher** | Learning to code nights and weekends, easily derailed | Streak calendar and progress bars that make consistency visible |
| **Junior developer** | Employed, upskilling toward a promotion (TypeScript, design systems, k8s) | Advanced tracks with clear curricula and durations they can budget time against |
| **Student on a budget** | Wants structured learning without a subscription | Free tier courses (4 of 12) with the same tracking features as paid |

## 4. Portfolio goals — what this project proves to recruiters

This is a front-end portfolio piece. Each feature exists to demonstrate a specific, hireable skill:

| Skill demonstrated | Where it shows up |
|---|---|
| Multi-route SPA architecture (react-router-dom v7, dynamic params, catch-all 404) | 5 routes incl. `/courses/:id` and `/lesson/:courseId/:lessonId` |
| Derived state design — one persisted store, everything else computed | Progress %, streaks, and achievements are all derived from `eduflow-enrollments` |
| Client-side persistence done properly (versioned schema, corruption guard) | Enrollment store in localStorage |
| URL-synced UI state | Catalog filters/search/sort live in query params; deep links from landing work |
| Complex list UI: search + multi-facet filtering + sorting + empty states | `/courses` catalog |
| Motion design with intent (springs, `AnimatePresence`, staggering, reduced-motion) | Badge pop, accordion, route transitions, animated progress fills |
| Design-token discipline in Tailwind CSS v4 | Single source of truth in `@theme`; zero hard-coded hex in components |
| Accessibility: keyboard flows, ARIA, focus management, `prefers-reduced-motion` | Entire enroll → learn → complete journey is keyboard-operable |
| Responsive layout systems from 375px up | Sticky enroll card ↔ bottom bar; sidebar ↔ drawer patterns |

## 5. Scope

> **Updated at build (2026-10-06, owner request).** The owner asked for a platform people genuinely learn from and allowed the non-goals below to be broken where that makes the product better. Every departure is logged in `docs/BUILD-LOG.md`; the PRD's five routes and behaviours are all kept.

### In scope (as built)
- The PRD's 5 routes (Landing, Catalog, Course detail, My Learning, Lesson) + 404, **plus** checkpoints, final assessments, certificates, flashcard review, notes & bookmarks, stats, learning paths, a placement quiz, a glossary, instructor pages and a Your data page — every page prerendered in **English and Arabic**.
- **16 courses / 303 real written lessons** (the PRD's 12 with their exact counts, plus JavaScript Fundamentals, Git & GitHub, Web Accessibility in Practice and Testing JavaScript Apps), each lesson with a quiz; checkpoints, final assessments, glossaries and hands-on exercises in every course (a code playground, SQL and Python in the browser, guided exercises).
- One-click enrollment; lesson completion; progress, streaks, XP, levels and 26 achievements, all derived from the saved state; `eduflow-enrollments` keeps its versioned shape.
- Spaced-repetition flashcards, a weekly goal, an activity heatmap, ⌘K search, dark mode, an installable offline PWA with per-course downloads, and export / restore / delete of all data.
- Full motion pass with reduced-motion support; responsive from 375px; static deploy on Vercel.

### Still out of scope
- Real video, a backend, accounts, payments (prices remain display-only), user-generated public content (reviews, comments), email or push notifications.

### Originally out of scope, now built (see BUILD-LOG)
- Certificates, i18n (English + Arabic), dark mode, real exercises and quizzes.

## 6. Measurable success criteria

1. All 5 routes render correctly at 375px, 768px, and 1440px with no horizontal scroll.
2. Enroll → complete all 18 lessons of React Fundamentals → badge pop, performed entirely with a keyboard.
3. Reload at any point restores enrollments, per-lesson completion, progress %, streak, and badges from `eduflow-enrollments`.
4. Lighthouse (mobile, production build): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95.
5. Marking the final lesson complete triggers the 100% recalculation, the badge spring pop, and auto-advance/completion flow with no console errors.
6. With `prefers-reduced-motion: reduce`, no floating, counting, or slide animations play; all content remains reachable.
7. Deployed on Vercel as a static site; deep links (e.g. `/courses/design-systems`, `/lesson/react-fundamentals/l-rf-2-3`) resolve on hard refresh.
