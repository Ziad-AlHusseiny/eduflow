# EduFlow code review (src/, scripts/, e2e/)

Reviewed 2026-10-06 against branch `eduflow` (src unchanged since `cc856e7`; `dist/` built from it). Course content was out of scope.

How it was checked: I read the code, then ran the built app (`dist/` served by `scripts/serve.mjs`) in headless Chromium with ad-hoc Playwright scripts. Findings marked **Verified** were reproduced that way. `npx vitest run` passes: 95 tests in 15 files.

Count: **3 high, 9 medium, 7 low.**

## Status: all 19 fixed (2026-10-06)

| # | Fix | Regression test |
|---|---|---|
| 1 | Loop guard in every learner loop condition (`lib/playground/loop-guard.js` + harness `__eduflowLoop`), 10 s watchdog in `WebPractice`, guard in `runJs` and the exercise checker | `loop-guard.test.js`; e2e `regressions` #1 |
| 2 | `PageErrorBoundary` around every page (Try again / Reload); pages load with `use()` instead of `lazy()`; failed page, text, engine loads aren't memoized; `main.jsx` leaves the static HTML if the page chunk fails | e2e `regressions` #2 |
| 3 | `CONTENT_VERSION` hashes every file written to `public/content` plus `/data` and `/playground` files | content build |
| 4 | Saved position read once before anything writes; the first measure doesn't save | e2e `regressions` #4 |
| 5 | `/data` and `/playground` URLs versioned; SW prunes old-version content on activate; pages cached in the versioned cache only; downloads stored per language with their version ("Update offline copy"); `offline` not restored | `pwa.spec.js`, `backup.test.js` |
| 6 | Scroll lock owned by the open effect and released in its cleanup (shared `lib/dialogs.js`) | e2e `regressions` #6 |
| 7 | `useScrollReset` scrolls to the hash target once it renders | e2e `regressions` #7 |
| 8 | `useHydratedSearchParams`: filters apply right after hydration | e2e `regressions` #8 |
| 9 | Disclaimer as SVG `<text>`/`<tspan>`; export wrapped in try/catch with a toast | e2e `regressions` #9 |
| 10 | A fresh database per query; the reference runs on its own copy | `check:content` (SQL) |
| 11 | Flashcard keys ignored inside or behind an open dialog | — (one-line guard) |
| 12 | Cards record the day first seen; in-session repeats aren't rescheduled | `srs.test.js` |
| 13 | Focus restored to the opener (or `#main`) when the palette or badge modal unmounts | e2e `regressions` #13 |
| 14 | Shortcuts match `event.code` for letters | — |
| 15 | The lesson subscribes to enrollments, scores and settings only | — |
| 16 | Badge pops are quiet for a moment after a restore (baseline = restored state) | — |
| 17 | Restore validates through each store and never re-reads blocked storage | `backup.memory.test.js` |
| 18 | Minutes goals count weekly minutes | `achievements.test.js` |
| 19 | `offline`, `locale`, `theme`, `dismissed` are device settings: not restored | `backup.test.js` |

---

## High

### 1. An infinite loop in learner code freezes the tab, and Run/Check stay disabled for good

- **Where:** `src/components/practice/WebPractice.jsx:77-106` (no watchdog), `:157` and `:160` (`disabled={busy}`); `src/lib/runners/js.js:26`.
- **What's wrong:** The playground runs learner JS synchronously inside a `srcdoc` iframe that has no `allow-same-origin`.
  - Chromium headless, Safari and Firefox run that iframe in the same process and on the same thread as the app.
  - `WebPractice` has no timeout at all: `status` only goes back to `idle` when the iframe posts `done`.
  - `runJs` does have a 5 s timer, but that timer can't fire while the loop holds the thread.
- **Failure scenario (Verified):**
  1. Open `/lesson/javascript-fundamentals/l-js-2-3` with the draft `while (true) { i++; }` (a classic beginner mistake, e.g. `for (let i = 0; i < 10; i--)`).
  2. Press Run.
  3. `page.evaluate` on the parent page doesn't return within 5 s: the whole app is frozen (scrolling, navigation, notes), and the learner has to kill the tab.
  4. Where the iframe does run out of process, Run and Check stay disabled forever, because `done` never arrives.
- **Fix:**
  - **Required:** add loop protection to compiled learner code before building the document. Insert an iteration/time guard into every `for`/`while`/`do` body (CodePen-style loop-protect; Sucrase or a small regex/AST pass on the transpiled output), throwing `Error('Loop ran too long')` after about 1 s.
  - **Also:** in `WebPractice`, start a timer in `execute()` (e.g. 10 s). When it fires, drop the frame (`setFrame(null)`), set `status: 'error'` with `exercise.timeout`, and clear `tokenRef`.
  - **Optional:** run the non-DOM modes (`js`, `test`, `ts`) in a dedicated Worker that can be `terminate()`d.

### 2. No error boundary: any failed fetch or chunk blanks the whole app, and failed loads never retry

- **Where:**
  - `src/App.jsx` and `src/components/layout/RootLayout.jsx:94`: Suspense, but no error boundary anywhere.
  - `src/lib/resources.js:60`: `use()` throws on rejection.
  - `src/routes.js:12`: `p ??= load()` memoizes rejected imports.
  - `src/i18n/content.js:34`: `pending[...] ??=`, same problem.
  - `src/lib/playground/load.js:6-16`: same problem for Sucrase, TypeScript and the React runtime.
  - `src/main.jsx:23`: swallows the chunk failure, then hydrates anyway.
- **What's wrong:**
  - In React 19, an error with no boundary unmounts the entire root.
  - Lessons, assessments and the glossary are fetched with `use(resource(url))`. Offline, any lesson you haven't opened rejects.
  - After a deploy, a stale tab's lazy page chunk returns 404 and rejects too.
  - The memoized loaders keep the rejected promise, so even after reconnecting, that page type fails until a full reload.
- **Failure scenario (Verified):**
  1. Enroll in Git & GitHub and let the service worker take control.
  2. Go offline and navigate in the app to a lesson you never opened.
  3. `#root` becomes empty (`innerHTML.length === 0`), with an uncaught "Failed to fetch". The navbar, the offline banner and your notes all disappear.
  4. Same result for `/glossary` or `/review` offline before they were ever visited.
  5. On a direct load where the page chunk fails, `main.jsx` hydrates anyway. The `lazy()` rejection then wipes a prerendered page that was perfectly readable.
- **Fix:**
  - Wrap `<Outlet/>` (inside the per-path Suspense in `RootLayout`) in an error boundary keyed by pathname. It should render "This page isn't available offline / failed to load", with a Retry that clears the cache entry and re-renders.
  - Don't memoize rejections: in `once()`, `content.js` `load()` and `load.js`, reset the stored promise in a `.catch`, as `resource()` already does.
  - In `main.jsx`, if the page chunk failed, skip hydration and leave the static HTML in place.

### 3. Content fixes never reach returning learners: `CONTENT_VERSION` ignores most of `/content`, which is cached as immutable

- **Where:** `scripts/content/build.mjs:232`, `:274`, `:402` and `:419`; `vercel.json:20-22`; `scripts/sw.template.js:89`.
- **What's wrong:**
  - The version hash only covers lesson Markdown sources and catalog JSON.
  - It does not cover the things that are also written into `/content/<lang>/…json`:
    - exercise JSON and exercise text (inside each lesson JSON)
    - `assessments.*.yaml` (`courses/<id>.json`)
    - `glossary.*.json` (`glossary.json`, `search.json`)
    - `course.*.json` lesson titles (`search.json`)
    - the renderer itself (Shiki theme, markdown-it plugins)
  - Those URLs are served `public, max-age=31536000, immutable` (vercel.json).
  - The service worker serves `/content/` cache-first from `eduflow-content`, which is never purged.
- **Failure scenario:**
  1. A reviewer fixes a wrong check in `content/ml-crash-course/exercises/l-ml-4-4.json` (the working tree has exactly such edits right now) or a wrong final-exam answer.
  2. After deploy, `?v=` is unchanged.
  3. Every learner who opened that lesson before keeps the old JSON, with the broken starter/solution/checks or the wrong answer key, for a year in the HTTP cache and forever in the SW cache.
- **Fix:**
  - Hash every file emitted to `public/content`: compute the hash over the written JSON strings inside `write()`, or over all of `content/**` plus `scripts/content/*.mjs`.
  - Better still, version per file (a content hash in each URL) so one edit doesn't bust everything.

---

## Medium

### 4. "Resume where you stopped" never works: the saved position is overwritten with 0 on every open

- **Where:** `src/pages/LessonPage.jsx:52-72` (ReadingBar's `measure()` saves immediately) and `:121-130` (resume effect).
- **What's wrong:** `ReadingBar` is a child of `Lesson`, so its effect runs first. Its initial `measure()` runs with the page at the top: `p = 0`, and `lastSave = 0`, so it saves straight away. It writes `{ scroll: 0, anchor: null }` before `Lesson`'s resume effect reads `readingStore`. The resume effect then sees `scroll < 0.03` and returns.
- **Failure scenario (Verified):**
  1. Read `l-js-1-2` to 52%. Storage holds `{"scroll":0.517,"anchor":"sec-2"}`.
  2. Open the lesson again: `scrollY` is 0, and storage now holds `{"scroll":0,"anchor":null}`.
  3. Every visit erases the bookmark. This is BUILD-LOG #20's "resume" feature, and it's dead.
- **Fix:**
  - Capture the saved entry before anything writes, e.g. `const [resume] = useState(() => readingStore.get()[lesson.id])` in `Lesson`, and use it in the effect.
  - Don't save from the initial `measure()`: only save from real scroll events, and only after the resume scroll has happened.
  - Add an e2e test.

### 5. "Download for offline" and the SW caches go stale or broken after any deploy

- **Where:** `scripts/sw.template.js:26-31`, `:48` and `:89`; `src/lib/offline.js:13-33`; `scripts/prerender.mjs:153` (`/data/` and `/playground/` are excluded from precache).
- **What's wrong:**
  - **Downloaded lesson HTML:** it's stored in `eduflow-content`, which survives activation. The HTML references hashed `/assets/*` that live only in the versioned cache, and `activate` deletes that cache. Offline, a downloaded lesson then loads with no JS: no Mark complete, no quiz, no notes.
  - **Downloaded JSON:** it's keyed `?v=OLD`. After a content deploy, the new bundle requests `?v=NEW`, which misses the cache and, combined with #2, gives a blank page. `offlineStore` still says "Available offline".
  - **Unversioned engine files:** `/data/shop.sqlite`, `/data/csv/*`, `/playground/react-runtime.js` and `/playground/ts-libs.json` are cache-first in `eduflow-content` and never refreshed. A regenerated dataset or React upgrade never reaches existing users.
  - **Storage growth:** `eduflow-content` grows forever, with every version of every lesson.
  - **Locale and restore:** `offlineStore` is keyed by course only, while `courseUrls()` uses the current locale. A course downloaded in English shows "Available offline" in Arabic (where nothing is cached), and "Remove" in Arabic deletes nothing. A restored backup (`backup.js:92-96` writes the `offline` key verbatim) claims downloads that the new device's Cache Storage doesn't have.
- **Fix:**
  - Version `/data` and `/playground` URLs, or precache them by hash.
  - On `activate`, re-fetch or purge content-cache entries whose `?v` differs from the current version.
  - Store downloads as `{ [courseId]: { [locale]: { at, version } } }`. Show "Available offline" only when the version matches, and offer "Update download" otherwise.
  - Keep assets referenced by cached pages: either keep the previous asset cache, or rewrite cached lesson HTML on activate. Simplest: on activate, delete cached lesson pages and keep only the JSON, since the shell renders lessons fine.
  - Exclude `offline` from backup restore.

### 6. Switching language from the mobile menu twice leaves the page unscrollable

- **Where:** `src/components/layout/MobileMenu.jsx:30-39` and `:54-58`; `src/lib/locale.js:42`; `src/Root.jsx:15`.
- **What's wrong:**
  - `showModal()` sets `html { overflow: hidden }`, and only the dialog's `close` event resets it.
  - The language toggle calls `onClose()` (state update, then `d.close()`, which queues the `close` event as a task) and then `switchLocale()`.
  - When the dictionary and text chunk are already loaded (always true when switching back), `switchLocale` resolves in microtasks. The remount of `BrowserRouter` (keyed by locale) then detaches the dialog before the `close` task runs.
  - React's root listener never sees the event, so the overflow reset never runs.
- **Failure scenario (Verified, Pixel 7 viewport):**
  1. On `/courses`, switch to Arabic from the menu: overflow is `""`.
  2. Switch back to English from the menu: `html.style.overflow === "hidden"`.
  3. The English page can't scroll until reload.
- **Fix:**
  - Don't keep scroll-lock state in an event handler. Set and clear overflow in the `[open]` effect, and clear it in that effect's cleanup and in an unmount cleanup.
  - Or reuse `Modal`'s `lockScroll`/`unlockScroll`, which already handle unmount-while-open.

### 7. Hash links don't scroll: ⌘K glossary results and the badge modal's "View all" land at an arbitrary position

- **Where:** `src/components/layout/RootLayout.jsx:27-36`; `src/components/search/CommandPalette.jsx:19`; `src/components/learning/BadgeUnlockModal.jsx:43`.
- **What's wrong:**
  - With `BrowserRouter` there is no `ScrollRestoration` and no hash scrolling.
  - `useScrollReset` deliberately skips scroll-to-top when the URL has a hash, but nothing then scrolls to the hash target, so the previous page's `scrollY` is kept.
- **Failure scenario (Verified):**
  1. On `/courses` scrolled to y = 1500, open ⌘K, type "closure" and press Enter.
  2. The URL becomes `/glossary#swift-essentials-closure`, `scrollY` stays 1500, and the term sits 25,826 px down the page.
  3. Same with "View all achievements" → `/learning#achievements` from a scrolled lesson.
- **Fix:** In `useScrollReset`, when `location.hash` is present, wait for the page to render (the page can suspend), then scroll to `document.getElementById(decodeURIComponent(hash.slice(1)))` and focus it with `preventScroll`. Fall back to the top.

### 8. Deep-linked catalog filters (and `/glossary?track=`) cause a hydration mismatch

- **Where:** `src/pages/CoursesPage.jsx:61-62`, `:96` and `:178`; `src/pages/GlossaryPage.jsx:18`; `src/main.jsx:33` (compares `data-path` without the query).
- **What's wrong:**
  - Only the bare `/courses` is prerendered, and it shows all 16 courses.
  - A shared link like `/courses?category=data-science&sort=rating` hydrates that HTML while `useSearchParams()` already returns the filters.
  - The text differs, so React throws #418 and client-renders the page boundary.
- **Failure scenario (Verified):** Loading `/courses?category=data-science&sort=rating` logs "Minified React error #418 (text)". The grid of 16 cards is torn down and rebuilt: a flash and layout shift on exactly the URL-synced links the PRD promises. `/glossary?track=…` behaves the same way.
- **Fix:**
  - Gate the query-dependent parts on hydration: on the first render, use empty filters (`useHydrated() ? params : new URLSearchParams()`), then apply the real ones.
  - Or have `main.jsx` call `createRoot` instead of `hydrateRoot` when `location.search` carries filter keys.

### 9. Certificate "Download PNG" silently fails: the canvas is tainted

- **Where:** `src/pages/CertificatePage.jsx:69-90` and `:137-141`.
- **What's wrong:** The SVG contains a `<foreignObject>` (the disclaimer). Chromium and Safari taint a canvas when such an SVG is drawn into it, so `canvas.toBlob` throws a SecurityError inside `img.onload`. Nothing is shown to the user.
- **Failure scenario (Verified):** With a completed course and a passed final, clicking `download-certificate` downloads nothing. The page error reads "Failed to execute 'toBlob' on 'HTMLCanvasElement': Tainted canvases may not be exported."
- **Fix:**
  - Replace the `foreignObject` with SVG `<text>`/`<tspan>` lines (wrap the disclaimer manually), or draw the certificate on the canvas directly.
  - Wrap the export in try/catch and toast on failure.
  - Add an e2e test that asserts the `download` event.

### 10. SQL practice shares one mutable database for the whole session

- **Where:** `src/lib/runners/sql.worker.js:6-24`; `src/components/practice/SqlPractice.jsx:79-83`.
- **What's wrong:**
  - The worker builds one `SQL.Database` and runs every learner query on it. Nothing stops `INSERT`/`UPDATE`/`DELETE`/`DROP`/`CREATE`, and changes persist across exercises and lesson examples until reload.
  - Check runs the reference solution *after* the learner's SQL, on the same database.
- **Failure scenario:**
  1. A curious learner runs `DELETE FROM orders` (or `DROP TABLE customers`) in one exercise.
  2. From then on, every later example shows wrong numbers, every Check compares two results computed on corrupted data, and `CREATE TABLE x` exercises fail the second time with "table already exists".
  3. `DELETE FROM t; SELECT …` can also make a wrong answer "pass".
- **Fix:**
  - Open a fresh `new SQL.Database(buffer)` per message (keep the `ArrayBuffer`; about 0.9 MB, cheap).
  - Or run each request inside `BEGIN; … ROLLBACK;`.
  - At minimum, run the reference solution first, on a pristine copy.

### 11. Flashcard keyboard handler hijacks Enter, Space and 1–3 while a modal is open

- **Where:** `src/pages/ReviewPage.jsx:156-168`.
- **What's wrong:** The window `keydown` handler only ignores `input`/`textarea`/`select`. Unlike `LessonPage`, it doesn't ignore events coming from a `<dialog>`.
- **Failure scenario:**
  1. Badges are derived live, so "Card Collector" (100 reviews) or "Spaced Out" pops mid-session.
  2. A keyboard user presses Enter on the focused "Nice" button. The handler calls `preventDefault()` (cancelling the button activation) and flips the card behind the modal.
  3. Pressing 1–3 grades cards they can't see.
- **Fix:** Add `dialog` (and `[contenteditable]`) to the `closest()` exclusion, or return early when `document.querySelector('dialog[open]')`.

### 12. SRS: "Again" followed by "Good" in the same session skips tomorrow's review and bypasses the daily new-card cap

- **Where:** `src/pages/ReviewPage.jsx:144-150`; `src/lib/srs.js:15-17` and `:28`.
- **What's wrong:**
  - **Skipped review:** A missed card is re-queued in the same session and graded again. The second `schedule()` sees box 1 and promotes it to box 2, due in 2 days. That contradicts the stated rule ("a card you miss drops to box 1 and returns tomorrow").
  - **Cap bypass:** `introducedToday` counts only cards with `reviews === 1`. A new card that was "Again"-ed then "Good"-ed has `reviews === 2`, so it no longer counts.
- **Failure scenario:**
  1. Miss 10 new cards, then pass them at the end of the session.
  2. All 10 are due in 2 days instead of tomorrow.
  3. Back on the overview, 10 more "new" cards are offered the same day.
- **Fix:**
  - For in-session repeats, don't call `reviewCard` a second time; just re-show the card, keeping box 1, due tomorrow.
  - Or record a `firstSeen` date and count `introducedToday` by it.

---

## Low

### 13. Focus is dropped to `<body>` when the ⌘K palette or the badge modal closes

- **Where:** `src/components/search/CommandPalette.jsx:36-42`; `src/components/layout/RootLayout.jsx:54`; `src/components/learning/BadgeUnlockModal.jsx:18-22` and `:49`.
- **What's wrong:** Both dialogs are unmounted while still open (closing is done by unmounting), so the native "restore focus" never runs.
- **Failure scenario (Verified):**
  - Open ⌘K from the search button and press Esc: `document.activeElement` is `body`.
  - Enroll and press "Nice" on the "First Step" pop: focus is on `body`.
  - Keyboard and screen-reader users lose their place.
- **Fix:** Call `dialog.close()` first and unmount in the `close` handler. Or save `document.activeElement` on open and refocus it (if still connected) on unmount; for the badge modal, fall back to `#main`.

### 14. Keyboard shortcuts don't work with an Arabic keyboard layout

- **Where:** `src/pages/LessonPage.jsx:166-175`; `src/components/layout/RootLayout.jsx:76`.
- **What's wrong:** Shortcuts compare `e.key` with Latin letters.
- **Failure scenario:** With an Arabic layout active (normal for the `/ar` audience), J sends `ت`, K sends `ن`, and so on. None of J/K/C/N/B/F work, and ⌘K may not work either.
- **Fix:** Match on `e.code` (`KeyJ`, `KeyK`, …), keeping `e.key` for `?`, `+` and `-`.

### 15. The whole lesson page re-renders every 15 seconds

- **Where:** `src/pages/LessonPage.jsx:96`; `src/hooks/useLearning.js:13-24`; `src/hooks/useStudyTimer.js:20`.
- **What's wrong:** `Lesson` calls `useLearningState()`, which subscribes to all 8 stores, including `timeStore`. `useStudyTimer` writes `timeStore` every 15 s.
- **Effect:** The entire lesson tree re-renders on every tick while the learner reads (curriculum sidebar, quiz, practice, editors' parents). `LateHosts` and `deriveStats` recompute too.
- **Fix:** Subscribe `Lesson` only to the stores it uses (`enrollments`, `scores`, `settings`).

### 16. Restoring a backup pops every badge, one modal after another

- **Where:** `src/components/layout/RootLayout.jsx:48-49`; `src/components/learning/BadgeHost.jsx:24-36`.
- **What's wrong:** The "already earned" baseline is fixed at hydration.
- **Failure scenario:** Restoring a backup on a fresh device derives up to 26 badges plus a "Course complete!" modal per finished course, each queued and each needing dismissal.
- **Fix:** After `restoreBackup()` (and after "delete everything"), reset the baseline to the current earned set. For example, emit a "baseline reset" event that `BadgeHost` listens to.

### 17. Restore wipes in-memory progress when storage is blocked

- **Where:** `src/lib/backup.js:82`, `:89` and `:91`; `src/lib/storage.js:116-119`.
- **What's wrong:** After each merged `set()`, `restoreBackup` calls `store.reload()`. With storage unavailable, `reload()` re-reads nothing and resets the store to its fallback.
- **Failure scenario:** In a private window, a learner restores a backup to keep studying. srs, events, exercises, notes, bookmarks and time all become empty (enrollments and scores survive), while the toast says "Restored".
- **Fix:** Validate incoming data with the store validators before merging, and drop the `reload()` calls. Or make `reload()` a no-op when `!storageAvailable()`.

### 18. The "Goal Getter" badge can't be earned with a minutes goal, and re-locks when the unit changes

- **Where:** `src/lib/learning.js:237`.
- **What's wrong:** `goalMet` is hard-coded to `false` when `goalUnit === 'minutes'`, although My Learning offers a minutes goal and draws its ring.
- **Failure scenario:** A learner who earned the badge in lessons mode and switches to minutes sees it re-lock. If they switch back, it pops again.
- **Fix:** Compute weekly minutes from `time` (as `weekMinutes` does) for minutes mode. Alternatively, record that the goal was met once, so the badge doesn't depend on the current setting.

### 19. Restored `offline` and `locale` keys don't match the device

- **Where:** `src/lib/backup.js:92-96`.
- **What's wrong:** Non-merged keys are written verbatim. `offline` is covered in #5. `locale` is also restored without switching the UI: the next visit to an English URL redirects to `/ar` unexpectedly.
- **Fix:** Exclude device-specific keys (`offline`, `locale`, `theme`, `dismissed`) from restore.

---

## Checked and fine

- **Playground message handling:** `e.source === frame.contentWindow`, the `source` tag and a per-run token are all checked, in both `WebPractice` and `runJs`.
- **Sandbox:** `allow-scripts allow-forms` only, with no `allow-same-origin`, `allow-top-navigation` or `allow-popups`. `document.js` escapes `</script`, `<!--` and `</style`, and JSON-escapes the config.
- **`dangerouslySetInnerHTML`:** only build-time content reaches it (lesson HTML, quiz, exercise text, glossary). Notes, certificate name and search entries render as text.
- **Hydration of every prerendered route:** no errors in both languages, with seeded storage and a far-off timezone (`Pacific/Kiritimati`). The stores' `getServerSnapshot` pattern holds; the problem is only query strings (#8).
- **Saved code drafts after a reload:** CodeMirror shows them correctly (checked; not a bug).
- **Storage validators** handle corrupt JSON, wrong versions and unknown course or lesson ids without crashing.

## e2e gaps worth closing

These are the cases where the bugs above were found. There are no tests for:

- resume position (#4)
- an infinite loop in the playground (#1)
- offline navigation to an unread lesson (#2)
- the certificate download (#9)
- hash navigation (#7)
- a deep-linked catalog URL hydrating without console errors (#8)
- switching language twice from the mobile menu (#6)
