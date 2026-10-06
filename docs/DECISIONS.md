# EduFlow — Decision Log

The twelve architectural and design decisions behind EduFlow, each with the options weighed and the trade-offs accepted.

| | |
|---|---|
| **Project** | EduFlow |
| **Document** | Decision Log |
| **Status** | Approved |
| **Owner** | Ziad |
| **Date** | 2026-08-28 |

---

| # | Decision | Outcome |
|---|---|---|
| D1 | Framework | Vite 7 + React 19 SPA |
| D2 | Styling | Tailwind CSS v4, CSS-first `@theme` tokens |
| D3 | Animation library | `motion` (Framer Motion) only |
| D4 | Routing | react-router-dom v7, library mode, `createBrowserRouter` + route `lazy` |
| D5 | Data strategy | Static mock JS modules in `src/data/` |
| D6 | Persistence | Single versioned localStorage key `eduflow-enrollments`; everything else derived |
| D7 | App state | React Context + `useReducer`, no state library |
| D8 | Catalog filter state | URL query params via `useSearchParams` |
| D9 | Theming | Single light theme, no dark mode |
| D10 | Video | Fake player, no real playback |
| D11 | Images | Unsplash/Pexels downloaded to `src/assets/` as `.webp` |
| D12 | Deployment | Vercel static site + SPA rewrites |

---

## D1 — Framework: Vite 7 + React 19 SPA

**Context.** EduFlow is a front-end-only portfolio piece: 6 routes, mock data, localStorage persistence, deployed as a static site. It must showcase modern React skills recruiters recognize.

**Options considered.** (a) Vite + React SPA; (b) Next.js App Router; (c) Astro with React islands.

**Decision.** Vite 7 + React 19 single-page app — the fixed stack for every project in this workspace.

**Rationale.** There is no server: no data fetching, no SSR benefit, no API routes. Next.js would add server/client component ceremony and deployment weight to render 12 objects imported from a JS module. Astro's islands model fights the app-like interactivity (shared enrollment state across every route). Vite gives instant HMR, a trivial build, and React 19 keeps the codebase on current idioms. A consistent stack across all portfolio projects also lets shared conventions (tokens, folder shape, deploy flow) transfer.

**Consequences.** SEO is limited to one `index.html` head — irrelevant for a demo behind a portfolio link. Client-side routing needs a rewrite rule at the host (handled in D12). All rendering cost is on the client, which is trivial at this data size.

## D2 — Styling: Tailwind CSS v4 with CSS-first `@theme` tokens

**Context.** The design (DESIGN-SYSTEM.md) is token-driven: one palette, one radius signature, named shadows/easings. BRIEF §4 explicitly sells "design-token discipline" as a recruiter-facing skill.

**Options considered.** (a) Tailwind v4; (b) CSS Modules with custom properties; (c) styled-components/Emotion.

**Decision.** Tailwind CSS v4 via `@tailwindcss/vite`, with every token declared in an `@theme` block in `src/index.css` and zero hard-coded hex in components.

**Rationale.** v4's CSS-first `@theme` makes the design system a literal artifact: `--color-primary: #7C3AED` in one file becomes `bg-primary` everywhere, so the DESIGN-SYSTEM doc maps 1:1 to code. Utilities colocate styling with markup for 50+ components without naming hundreds of classes (CSS Modules) or paying a runtime and a styling-in-JS story that's fallen out of favor (styled-components). Purge keeps the shipped CSS tiny.

**Consequences.** Long class strings in JSX — mitigated by extracting variants into small maps inside `Button`/`Badge`. The "no raw hex" rule needs review discipline; the Do/Do-not list in DESIGN-SYSTEM §8 is the checklist.

## D3 — Animation: `motion` (Framer Motion) only, no GSAP

**Context.** Motion is a core feature, not garnish: badge spring pops, bar fills, count-ups, accordion physics, `AnimatePresence` grid reflow, route transitions — all specced in PRD/TECHNICAL-PLAN §6.

**Options considered.** (a) `motion` (the Framer Motion package); (b) GSAP (+ ScrollTrigger); (c) CSS transitions/keyframes only.

**Decision.** The `motion` npm package exclusively, importing from `motion/react`.

**Rationale.** Every EduFlow effect is state-driven and component-scoped — exactly Framer Motion's model: `animate={{ width: pct + '%' }}` on a progress bar, `AnimatePresence` for cards entering/leaving the filtered grid, `layoutId` for the nav underline, springs as first-class config (`stiffness: 260, damping: 18`). GSAP excels at timeline/scroll choreography (that's why nova-studio uses it), but EduFlow has no scrubbed timelines, and running two animation runtimes in one app is unjustifiable weight. CSS alone can't do presence animations, layout projection, or interruptible springs. `useReducedMotion()` gives the accessibility gate in one hook.

**Consequences.** ~32KB gzipped runtime — accepted for the feature set. Accordion animates `height` (a layout property) — scoped to short 250ms transitions, noted in TECHNICAL-PLAN §8.

## D4 — Routing: react-router-dom v7 in library mode

**Context.** Five real routes plus a 404, two with dynamic params (`/courses/:id`, `/lesson/:courseId/:lessonId`), deep-linkable filters, and shareable URLs are a stated portfolio goal (BRIEF §4).

**Options considered.** (a) react-router-dom v7 library mode; (b) React Router v7 framework mode; (c) TanStack Router; (d) hash-based routing.

**Decision.** react-router-dom v7, `createBrowserRouter` in `main.jsx`, `App` as the layout route, pages registered with the router's `lazy` option.

**Rationale.** It's the workspace convention for multi-page projects and the router recruiters expect to see. Library mode keeps Vite as the build tool; framework mode would re-introduce D1's rejected complexity. `createBrowserRouter` unlocks the data-router APIs (`useSearchParams` for D8, `lazy` for route-level code splitting). Clean paths (`/courses/design-systems`) beat hash URLs for the shareable-deep-link story, at the cost of one rewrite rule (D12). TanStack Router's type-safety shines in TS monorepos; this is a JS project on a fixed stack.

**Consequences.** `vercel.json` must ship the SPA rewrite or hard refreshes 404. `ScrollToTop` must distinguish pathname changes from query-param changes so filtering doesn't jump the catalog scroll position.

## D5 — Data: static mock JS modules in `src/data/`

**Context.** Front-end-only rule: no backend, no database. The app needs 12 courses with full curricula, 6 categories, 5 instructors, 36 reviews, 3 testimonials, 8 achievements.

**Options considered.** (a) Plain JS modules exporting arrays; (b) JSON files fetched at runtime; (c) a mock API layer (MSW/json-server).

**Decision.** Six plain JS modules in `src/data/` (`courses.js`, `categories.js`, `instructors.js`, `testimonials.js`, `reviews.js`, `achievements.js`), imported directly.

**Rationale.** Modules are bundled, typed-by-shape, and synchronous — no loading states, no fetch error handling, no spinner flash for data that never changes. They can hold non-JSON values the app actually needs: imported image references (`image: reactFundamentalsImg`) and achievement `check` functions. MSW would simulate latency and failure modes EduFlow deliberately doesn't have — impressive in an interview only if the app also handled those states, which is scope creep against the brief.

**Consequences.** All data ships in the JS bundle (~fine at this size; curricula are text). "Loading skeleton" skills aren't demonstrated here — accepted; other portfolio projects cover that. Derived values (course counts per category, instructor totals, lesson counts) are computed, never stored, so data edits can't drift out of sync.

## D6 — Persistence: one versioned localStorage key, everything else derived

**Context.** Enrollments, lesson completion, streaks, achievements, and "continue where you left off" must survive reload with no backend.

**Options considered.** (a) Single versioned key `eduflow-enrollments` holding a small store; (b) one key per concern (`eduflow-progress`, `eduflow-streak`, `eduflow-badges`…); (c) IndexedDB; (d) a state library's persist middleware.

**Decision.** One key — **`eduflow-enrollments`** — storing `{ version, enrollments, activityLog }` (exact shape in TECHNICAL-PLAN §5.1). Progress %, streaks, achievements, counts are always derived at render, never persisted.

**Rationale.** The store is the minimal set of facts only the user can produce: what they enrolled in, which lessons they completed, which days they were active. Everything else is a pure function of those facts + static data, so it can never desync — un-completing a lesson correctly revokes the "Momentum" badge because badges aren't stored (PRD §6.4 acceptance criterion). One key means one atomic read/write, one `version` field for schema migration, one corruption guard (parse failure → clean reset), and one place to implement the private-mode in-memory fallback. IndexedDB's async API buys nothing for a sub-kilobyte payload. This derived-state thesis is the project's core state-design demonstration (BRIEF §4).

**Consequences.** Derivations run per render — memoized with `useMemo`, trivially cheap at 12 courses. A `version` bump wipes user progress by design (documented migration point); acceptable for a demo. Achievement "unlock moments" need a session-only diff queue (`pendingUnlocks`) since earned state itself is stateless.

## D7 — App state: React Context + `useReducer`, no state library

**Context.** Enrollment state is read by the navbar pill, enroll card, learning page, lesson sidebar, and progress bars — cross-route shared state.

**Options considered.** (a) One `EnrollmentContext` with `useReducer`; (b) Zustand; (c) Redux Toolkit; (d) Jotai.

**Decision.** A single `EnrollmentContext` exposing `useEnrollments()` (API table in TECHNICAL-PLAN §5.2), reduced over exactly the persisted shape; catalog filter state lives in the URL instead (D8).

**Rationale.** There is precisely one shared store and it's small; React's built-ins model it cleanly and demonstrate that the developer knows when a state library is *not* needed — a stronger senior signal than reflexively reaching for Redux. The reducer state mirrors the localStorage shape 1:1, so persistence is a single `useEffect`. Re-render blast radius from context updates is a non-issue: enrollment actions are rare, user-initiated events.

**Consequences.** If the app grew multiple stores or high-frequency updates, context would need selectors or a swap to Zustand — a consciously deferred cost. Provider must mount above the router's layout route so every page and the navbar share it.

## D8 — Catalog filter state lives in the URL

**Context.** `/courses` combines search, four filter groups, and sort. Landing-page category cards and footer links deep-link into pre-filtered views ("Start learning free" → `/courses?price=free`).

**Options considered.** (a) `useSearchParams` as the single source of truth; (b) component state with optional URL sync; (c) filter state in the enrollment context.

**Decision.** All filter/search/sort state is stored only in query params (`?q=&category=&level=&price=&rating=&sort=`), wrapped by the `useCourseFilters` hook.

**Rationale.** URL-as-state makes filters shareable, bookmarkable, refresh-proof, and back/forward-navigable for free — and every landing deep link becomes a plain `<Link>` with no imperative wiring. It also eliminates a whole class of bugs (state ≠ URL). This is a deliberate recruiter-facing pattern (BRIEF §4 "URL-synced UI state").

**Consequences.** Search input must debounce (200ms) before writing to the URL to keep history sane. `ScrollToTop` must ignore search-param-only changes. Multi-select needs repeatable params (`getAll('category')`).

## D9 — Theming: single light theme, no dark mode

**Context.** The workspace requires a decision on theming; some sibling projects ship a toggle. EduFlow's brand direction is a bright `#FAFAFF` ground with violet/blue/yellow accents.

**Options considered.** (a) Light-only; (b) light + dark with a toggle; (c) auto-follow `prefers-color-scheme` without a toggle.

**Decision.** One committed light theme. No toggle, no dark palette. Dark mode is listed as explicitly out of scope in BRIEF §5 and PRD §10.

**Rationale.** The design identity — warm photography, soft violet tints, yellow rewards — is authored for a light ground; a dark variant would double the palette-QA surface (every tint, scrim, and shadow re-checked for contrast) for zero new skill demonstrated: the token architecture (D2) already proves theming discipline, since a dark theme would be one more `@theme` block. Budget goes to the momentum loop (streaks, badges, progress) — the features this project is actually selling.

**Consequences.** Users with OS dark mode get a light app; acceptable for a portfolio demo. Because components consume only tokens, adding dark later is contained to `index.css` — the door stays open without paying for it now.

## D10 — Video: fake player, no real playback

**Context.** The lesson page needs a "video" surface, but shipping real course video means sourcing hours of content, streaming costs, and licensing — all out of scope for a front-end demo.

**Options considered.** (a) Fully fake player (thumbnail + simulated playhead); (b) embedded YouTube/Vimeo iframes; (c) a few real `<video>` files with stock footage.

**Decision.** `FakeVideoPlayer`: course thumbnail with scrim, functional play/pause toggling a simulated 45-second playhead, decorative controls marked `aria-disabled` with a "Demo player" tooltip (PRD §7.2).

**Rationale.** The portfolio value is the *learning flow around* the player — mark-complete, recalculating progress, auto-advance, badge pop — not video engineering. Honest fakery (an explicit "Demo player" affordance) reads better in review than 12 unrelated YouTube embeds pretending to be a curriculum, and iframes would drag in third-party scripts, consent implications, and CLS that would wreck the Lighthouse ≥ 90 target. Stock `<video>` files would blow the static-hosting size budget for zero interaction value.

**Consequences.** The player must clearly communicate its demo nature (tooltip + README note) so it never reads as broken. Play state is ephemeral by design — only completion persists.

## D11 — Images: stock photos downloaded into `src/assets/` as `.webp`

**Context.** 12 course thumbnails, 11 avatars, and a hero photo are needed. Workspace rule: free stock (Unsplash/Pexels), never hotlinked.

**Options considered.** (a) Download, convert to `.webp`, import from `src/assets/`; (b) hotlink `images.unsplash.com` URLs; (c) an image CDN (Cloudinary) fetch layer; (d) illustrations/gradients instead of photos.

**Decision.** All imagery downloaded once, converted to `.webp` at fixed sizes with budgets (thumbnails 1280×720 ≤ 120KB, avatars 400×400 ≤ 30KB, hero ≤ 200KB), committed to `src/assets/`, and imported as modules.

**Rationale.** Local imports make the deploy self-contained and deterministic — no broken cards when a stock URL rots or rate-limits, no third-party request waterfall dragging LCP, and Vite hashes/optimizes the files at build. Explicit `width`/`height` plus local files is the reliable path to the CLS and Performance ≥ 90 targets. An image CDN is a paid dependency for 24 static files. Real photography (over illustration) is a deliberate art-direction call — warm, human imagery sells the "learning platform" fiction (DESIGN-SYSTEM §7).

**Consequences.** Repo gains ~2MB of binary assets — fine for git at this scale. Sourcing/converting is a one-time M2 task; each photo's crop must respect the thumbnail scrim and hero float-card layout.

## D12 — Deployment: Vercel static site with SPA rewrites

**Context.** Every workspace project deploys as a static site. EduFlow uses clean browser-history URLs (D4) whose deep links must survive hard refresh (BRIEF success criterion #7).

**Options considered.** (a) Vercel; (b) Netlify; (c) GitHub Pages.

**Decision.** Vercel, building `vite build` output, with `vercel.json` rewriting all paths to `/index.html`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.

**Rationale.** Vercel is the workspace standard: zero-config Vite detection, preview deployments per push (useful for the M1–M8 milestone cadence), a global CDN, and first-class SPA rewrite support — which GitHub Pages lacks natively (it needs the `404.html` redirect hack, ugly for a portfolio piece meant to look production-grade). Netlify is equivalent technically; standardizing on one host across all projects keeps the deploy story uniform and the portfolio domain management simple.

**Consequences.** The rewrite file must land in M1 (it's in the M1 definition of done) so deep-link regressions are caught from the first deploy. `NotFoundPage` handles unknown routes at the app layer since the host now serves `index.html` for everything.
