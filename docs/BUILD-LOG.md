# Build log

Every place the build departs from the approved docs (BRIEF, PRD, TECHNICAL-PLAN, DESIGN-SYSTEM, DECISIONS), with the reason. Built 2026-10-05 → 2026-10-06.

The owner's brief for the build: keep everything the PRD specifies (the five routes, the landing page, the catalog with URL-synced search, filters and sort, the course page with the curriculum accordion and sticky enroll card, My Learning with the streak calendar and the 8 achievements, the lesson page with mark complete, auto-advance and the badge pop), but make EduFlow a platform a career switcher can genuinely learn from every evening: real lessons, real code, quizzes, spaced review, and motivation that grows. Break the BRIEF's non-goals wherever that makes the product better. Those reversals come first, then content, then the smaller design and engineering departures.

## Non-goals reversed (owner request: a product people actually learn from)

| # | Spec says | Build does | Why |
|---|---|---|---|
| 1 | BRIEF §5, PRD §8: 12 mock courses with lesson *titles* | **16 courses, 303 complete written lessons** in English and Arabic (≈214,000 English words, ≈200,000 Arabic): explanations, worked examples, syntax-highlighted code, 200+ hand-drawn SVG diagrams, tip / common-mistake / why-it-matters callouts, key takeaways and official-docs links in every lesson. Written by one author agent per course against `docs/CONTENT-GUIDE.md`, translated by a second, reviewed by a third (reports in `docs/reviews/`) | The owner's central requirement: quality and quantity of real content. The 12 PRD courses keep their exact section/lesson/minute counts (tested); React Fundamentals keeps its canonical curriculum verbatim. |
| 2 | PRD §8: 12 courses | **Four new courses** for the career-switcher persona: JavaScript Fundamentals (22 lessons, free), Git & GitHub (16, free), Web Accessibility in Practice (18), Testing JavaScript Apps (18); **two new instructors** (Leila Haddad, Kenji Watanabe) | Obvious gaps on the path to a first developer job. Consequences: the catalog shows 16 courses (header copy and the hero's "12" are computed), **6 free courses** (PRD §3.1 acceptance said "exactly the 4 free courses"), Web Development lists 6 courses and DevOps & Cloud 3, and `?q=maya` matches 3 courses (Maya also teaches JavaScript Fundamentals). |
| 3 | PRD §7.2 / D10: a fake video player | Replaced by **Lesson at a glance**: the lesson's summary and its sections as a numbered, clickable outline, with a line saying plainly there's no video — the lesson is the real thing | The owner: "never imply a real video exists". A clickable outline is honest and useful. |
| 4 | BRIEF §5 scope-out: no quizzes or exercises | **A quiz in every lesson** (3–5 questions, every option explained: 1,073 questions), **a 5-question checkpoint per section**, **a 12-question final per course** (70% pass mark, unlimited retakes, best score saved: 520 more questions) | Checking understanding is how learning sticks. Scoring is a tested pure function (`lib/quiz.js`). |
| 5 | Not in the docs | **Hands-on practice in every section** (297 exercises): a sandboxed **code playground** (HTML/CSS/JS, React 19, TypeScript with real type-checking, and a Vitest-style test runner whose checks require learners' tests to catch real bugs — mutation testing); **real SQL** against a generated sample business (sql.js in a worker); **real Python 3.13 + pandas 2.x + scikit-learn** (Pyodide in a worker, loaded on first Run, cached offline); **guided exercises** for design, mobile, DevOps and cloud (order the steps, spot the bug, fill the command, choose). Starter code, automatic checks, hints, a reference solution, reset, and saved drafts | Owner request. Every solution passes its checks and every starter fails (`scripts/content/check-exercises.mjs`, in `npm run verify`). Engines load only when an exercise needs them. |
| 6 | Not in the docs | **Runnable examples inside lessons** (300 blocks): JavaScript in a sandbox, SQL against the sample database, Python in Pyodide — a Run button and the output under the code | Reading code and running it are different things. The validator executes every block at build time. |
| 7 | Not in the docs | **Spaced-repetition flashcards** (Leitner, 5 boxes: 1/2/4/8/16 days) built from each course's glossary; a term unlocks when you complete the lesson that teaches it; a daily queue (due first, ≤10 new per day), box counts and a 7-day forecast; browse any deck in practice mode | "Review what they learned last week so it sticks." Deterministic and unit-tested (`lib/srs.js`). |
| 8 | Not in the docs | **Glossaries** per track (448 terms, both languages) at `/glossary`; **notes** per lesson (autosaved, searchable, exported as Markdown), **bookmarks** | Owner request. |
| 9 | PRD §6.4: 8 achievements | The PRD's 8, exactly as specified, **plus 18**: Hands On, Builder, Quiz Master, Checkpoint Champ, Sharp Shooter, Certified, Summit, Triple Crown, Pathfinder, Polymath, Unstoppable, Card Collector, Spaced Out, Note Taker, Night Owl, Early Bird, Goal Getter, Rising Star. Still derived live, never stored | Motivation is the heart of the BRIEF. The counter reads "N of 26 earned". |
| 10 | Not in the docs | **XP and levels** (derived), a **weekly goal** in lessons or minutes shown as a ring, a **year-long activity heatmap**, a **stats page** with hand-rolled SVG charts (lessons per week, minutes per day, quiz accuracy by course) each with a table view | Owner request. XP and levels are computed from progress so they can't drift (tested). |
| 11 | BRIEF scope-out: no certificates | A **certificate of completion** when every lesson is done and the final is passed: the learner types their name (stays on the device), prints it or downloads a PNG; a clear line says EduFlow is a portfolio project, not an accredited provider | Owner request. |
| 12 | Not in the docs | **Learning paths** (Front-End Developer, Data Analyst, Product Designer, Mobile Developer, Cloud Engineer, ML Engineer) with follow/progress, and a 6-question **"Where should I start?"** placement quiz | Owner request. Scoring is pure and tested; every path is reachable. |
| 13 | Not in the docs | **Instructor pages** for all seven instructors (bio, expertise, highlights, courses) | Owner request. |
| 14 | Not in the docs | A **⌘K command palette** searching courses, lessons, glossary terms, paths, pages and your own notes, from a prebuilt index loaded on first open | Owner request (Pulse's palette pattern). |
| 15 | PRD §4.2: four filter groups | Adds **Duration** (under 4 h, 4–6 h, over 6 h) and **Practice** (runnable code / guided), URL-synced like the rest | Owner request. |
| 16 | BRIEF scope-out: i18n | **English and Arabic** everywhere (UI, all 303 lessons, quizzes, exercises, glossaries, catalog copy), full RTL with code kept LTR, `/ar/…` twins of every page, a toggle that keeps the page, IBM Plex Sans Arabic + Readex Pro paired with Inter + Sora, all six Arabic plural forms (tested) | Owner request. |
| 17 | D9: light theme only | A **dark theme** for studying at night: designed, not inverted, keeping violet = brand, green = progress, yellow = reward; matching syntax-highlighting themes (GitHub light/dark default, both ≥ 4.5:1) | Owner request. Follows the system, toggle remembered, applied before first paint. |
| 18 | Not in the docs | **Installable PWA that works offline**: the app shell precached, lessons cached as you read them, and **"Download for offline"** on every course caching all its lessons; the Python engine cached after first use | "Lessons, notes and progress work on a train with no signal." |
| 19 | PRD §9: a storage-blocked banner | Keeps the banner, plus a **Your data** page: what's saved under each `eduflow-` key, **export a backup**, **restore** (merges: lessons unioned, best scores kept, newer notes win), **delete everything** (typed confirmation) | Owner request: data stays on the device, said clearly. |
| 20 | Not in the docs | The lesson page: **reading progress**, estimated time, **text size**, **focus mode**, **resume where you stopped** (scroll position per lesson), **keyboard shortcuts** with a `?` help sheet (J/K next/previous, C complete, N notes, B bookmark, F focus, +/−), and a **print** layout | Owner request. |

## Content

| # | Spec says | Build does | Why |
|---|---|---|---|
| 21 | TECHNICAL-PLAN §4: course data in `src/data/courses.js` | Course content lives in `content/<course>/` (Markdown lessons with YAML front matter, JSON exercises, YAML assessments, JSON glossaries) and is compiled at build time (`scripts/content/build.mjs`): HTML with Shiki highlighting baked in, per-lesson JSON under `/content/<lang>/…`, and small generated modules for titles. Catalog metadata (price, rating, level) stays in `src/data/courses.js`; counts and durations are computed from the content | 400k words can't live in a JS bundle. Reading a lesson ships no highlighter. |
| 22 | Not in the docs | A **sample business** for SQL and Python: "Cartwheel", a generated online store (9 tables, ~14k rows, deterministic; `scripts/content/make-dataset.mjs`) plus a messy CSV and a churn feature table | Real analysis needs realistic data with one right answer. Two deliberate data-quality quirks are taught in the SQL course. |
| 23 | Not in the docs | `docs/CONTENT-GUIDE.md` (voice, structure, lengths, quiz rules, exercise kinds, Arabic terminology) and a **validator** that enforces it; content-integrity tests fail the build if counts drift, lessons go short, placeholders appear, links break or solutions stop passing | The owner's "content integrity tests". |
| 24 | PRD §5.5: 36 reviews | 48 reviews (3 per course), React Fundamentals' three verbatim | New courses need reviews too. |

## Design

| # | Spec says | Build does | Why |
|---|---|---|---|
| 25 | PRD §2.1: navbar underline via Motion `layoutId` | One underline element measured and moved with a CSS transition | Same slide, without Motion in the entry chunk (budget). |
| 26 | PRD §2.3: route fade-out + fade-in | Incoming page rises 8 px and fades in (CSS); no exit fade | Prerendered pages hydrate in place; an exit animation would delay every navigation. Reduced motion: none. |
| 27 | PRD §3.1: count-up with Motion | A pure-CSS count-up (`@property` integer animation) | Runs from the static HTML with no JavaScript and no flash; reduced motion shows the final value. |
| 28 | PRD §5.3: accordion height via Motion | CSS `grid-template-rows: 0fr → 1fr` transition | Same effect, no measuring, no JS. |
| 29 | PRD §2.2: three footer columns | Adds a "Keep learning" column (review, notes, stats, glossary, placement, your data) and the developer credit | The new pages need a home. |
| 30 | DESIGN-SYSTEM §6.5: footer bottom bar in `ink-faint` | `ink-muted` | `ink-faint` fails 4.5:1 for running text (axe). |
| 31 | DESIGN-SYSTEM §6.6: locked badges at 60% opacity | Only the medal is dimmed; the name and rule stay full contrast | Readable hints (axe). |
| 32 | DESIGN-SYSTEM §2: dark tokens not specified | Dark theme keeps `primary` #7C3AED for fills (white text 5.7:1) and uses `primary-ink` #C4B5FD for violet text | Contrast in both themes. |
| 33 | TECHNICAL-PLAN §1: Google Fonts | Self-hosted Sora and Inter (variable, Latin) plus IBM Plex Sans Arabic and Readex Pro (Arabic, `font-display: optional`) | No third-party requests; offline; no layout shift from Arabic font swaps. |
| 34 | D11: `.webp` | Responsive AVIF + WebP (`scripts/images.mjs`), hero preloaded with `fetchpriority=high` | LCP. |

## Behaviour

| # | Spec says | Build does | Why |
|---|---|---|---|
| 35 | PRD §6.2: activity = enrolling or completing a lesson | Also finishing a quiz, solving an exercise or a flashcard session | They are learning; the streak should count them. The PRD's acceptance cases are unchanged (tested). |
| 36 | TECHNICAL-PLAN §4: `streak-3`/`streak-7` check `currentStreak` | They check the **longest** run of days | A badge you earned shouldn't vanish because you missed a Sunday. Still derived from `activityLog`, so removing activity re-locks it. |
| 37 | PRD §7.4: badges pop after the toast | Badges wait while the auto-advance countdown runs, then pop on the next lesson; the first enrollment pops "First Step" | As specified, applied to all badges. |
| 38 | PRD §7.5: redirect non-enrolled visitors to the course | Kept, after hydration: every lesson page is prerendered in full (search engines and the offline cache get the real lesson); a visitor who isn't enrolled is sent to the course page | Prerendering every lesson was an owner requirement. |

## Engineering

| # | Spec says | Build does | Why |
|---|---|---|---|
| 39 | D1/D12: SPA with a rewrite | Every route **prerendered** in both languages (896 pages + 404) with React 19 `prerenderToNodeStream`, CSS inlined, the page's chunk and content preloaded, then hydrated | First paint from static HTML; the owner's performance bar. |
| 40 | D6: one storage key | `eduflow-enrollments` keeps its exact versioned shape and guard; new keys (`scores`, `exercises`, `drafts`, `reading`, `time`, `events`, `srs`, `notes`, `bookmarks`, `settings`, `theme`, `locale`, `placement`, `path`, `offline`, `dismissed`) each validate on read | The new tools need their own state; everything else stays derived. |
| 41 | D7: Context + `useReducer` | Small stores read through `useSyncExternalStore` (`lib/storage.js`) | Hydration-safe with prerendering (server snapshot = defaults), cross-tab sync, no provider. |
| 42 | TECHNICAL-PLAN §1: no other runtime dependencies | Lazy-only extras: CodeMirror 6 (editor), Sucrase (JSX), TypeScript (type-checking), sql.js (SQLite), Pyodide (from its CDN, cached). Dev-only: Shiki, markdown-it, yaml, sharp, Playwright, axe | Each loads only when an exercise needs it (the owner's rule). |
| 43 | Text in one bundle | Course text split into `text` (titles, taglines), `outline` (lesson titles) and `details` (descriptions, reviews, bios) chunks per language; dictionaries per language | Keeps the heaviest first load under 180 KB gzipped in Arabic too. |
| 44 | Learner code runs as written | Loops in learner code get a guard in their condition (`lib/playground/loop-guard.js`, Sucrase's tokenizer) that throws after 1.5 s in one task, plus a 10 s watchdog per run | The sandbox iframe shares the app's thread in most browsers: `while (true)` would freeze the tab (code review #1). |
| 45 | Offline = cached pages | "Download for offline" saves the course's lesson JSON, assessments and glossary per language with the content version; pages are rendered offline by the precached app shell. The SW drops content of older versions on update and the course card offers "Update offline copy" | Cached HTML pointed at scripts the next deploy deletes; version-stamped JSON stays correct (code review #3, #5). |
| 46 | — | Every page sits behind an error boundary with Try again / Reload; failed chunk and content loads are not memoized | A failed fetch (offline, after a deploy) used to unmount the whole app (code review #2). |

## Not verified

- Python exercises are verified in Pyodide 0.29.3 under Node (the browser's engine and package versions); the in-browser run itself is covered by one e2e smoke test, not per exercise.
