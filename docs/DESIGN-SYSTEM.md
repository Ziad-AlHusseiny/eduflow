# EduFlow — Design System

Color, typography, spacing, motion, and component styling tokens — the single visual source of truth for every EduFlow surface.

| | |
|---|---|
| **Project** | EduFlow |
| **Document** | Design System |
| **Status** | Approved |
| **Owner** | Ziad |
| **Date** | 2026-08-28 |

---

## 1. Design principles

1. **Bright, calm, encouraging.** EduFlow is a light-only product (`#FAFAFF` ground, no dark mode — see DECISIONS D9). Violet carries the brand; green means progress; yellow means reward. Color is meaning, never decoration.
2. **Rounded-2xl everywhere.** Cards, panels, players, and modals share one 16px radius signature; controls are full pills. Nothing sharp, nothing over-rounded.
3. **Motion signals progress.** Bars fill, counters count, badges spring — animation is reserved for the momentum loop and fully collapses under `prefers-reduced-motion`.

All tokens below live in `src/index.css` inside Tailwind v4's `@theme` block. Components consume tokens only — **zero hard-coded hex in JSX** (enforced at code review; BRIEF §4 "design-token discipline").

## 2. Color palette

Single light theme. `@theme` token names map to Tailwind utilities (e.g. `--color-primary` → `bg-primary`, `text-primary`).

### 2.1 Neutrals & surfaces

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FAFAFF` | App/page background (`<body>`). The faint violet cast is the brand ground — never pure white pages. |
| `surface` | `#FFFFFF` | Cards, navbar, modals, inputs, filter sidebar/sheet. |
| `surface-muted` | `#F4F2FB` | Tinted panels: accordion lesson-row hover, ghost-button hover, locked-badge tiles, decorative fills. |
| `border` | `#E7E5F2` | 1px hairlines: card borders, dividers, input borders, navbar bottom border. |
| `ink` | `#1B1830` | Headings and body text. 16.5:1 on `bg`. |
| `ink-muted` | `#4F4B66` | Secondary text: subtitles, meta rows, captions. 8.0:1 on `bg` — safe for body copy. |
| `ink-faint` | `#8A8699` | Placeholders, disabled labels, decorative icons only (3.5:1 — **never** running text). |

### 2.2 Brand & semantic colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#7C3AED` | The violet. Primary buttons, active nav underline/link, filled streak dots, focus rings, progress fill (violet tone), active lesson tint. |
| `primary-deep` | `#6D28D9` | Primary button hover/pressed; link hover. |
| `primary-ink` | `#5B21B6` | Violet **text** on `primary-soft` tints (7.6:1 on `primary-soft`). |
| `primary-soft` | `#EDE9FE` | Violet tints: eyebrow pills, logo square, icon squares, `CourseHero` panel (at 40% opacity), progress track, active-lesson row bg. |
| `accent` | `#3B82F6` | The blue. Gradient partner, `GradientBlob` color, decorative chart-like accents. Never text on white (3.7:1) — fills and gradients only. |
| `accent-soft` | `#DBEAFE` | Blue tints: Beginner level badge bg, decorative fills. |
| `star` | `#FBBF24` | The yellow. Star fills, earned `AchievementBadge` circles, `Trophy` medal circle, yellow `GradientBlob`. **Never text, never thin strokes** on light bg. |
| `star-soft` | `#FEF3C7` | Yellow tints: earned-badge tile bg, Intermediate level badge bg. |
| `star-ink` | `#78350F` | Text paired with yellow tints (8.2:1 on `star-soft`). |
| `success` | `#10B981` | Green fills: completed progress bars, `CheckCircle2` / `Check` icons, completed thumbnail overlay badge bg. |
| `success-deep` | `#047857` | Green **text** on white (5.5:1): "Free" price line on `EnrollCard`, completed labels. |
| `success-soft` | `#D1FAE5` | Green tints: Free/Completed badge bg, checklist check circles. |
| `success-ink` | `#065F46` | Text on `success-soft` (6.8:1). |

### 2.3 Gradient

| Token | Value | Usage |
|---|---|---|
| `gradient-brand` | `linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)` | Hero headline span ("one lesson at a time", via `background-clip: text`), `CtaBanner` panel bg, decorative blob pairings. White text on this gradient is ≥ 3.7:1 at its lightest stop — use Sora 600+ at ≥ 18px only. |

### 2.4 Contrast rules (verified)

| Pair | Ratio | Verdict |
|---|---|---|
| `ink` on `bg` / `surface` | 16.5:1 / 17.2:1 | AAA |
| `ink-muted` on `bg` / `surface-muted` | 8.0:1 / 7.5:1 | AAA |
| White on `primary` (buttons) | 5.7:1 | AA |
| White on `primary-deep` (hover) | 7.1:1 | AAA |
| `primary-ink` on `primary-soft` | 7.6:1 | AAA |
| `success-ink` on `success-soft` | 6.8:1 | AA |
| `star-ink` on `star-soft` | 8.2:1 | AAA |
| `#1E40AF` on `accent-soft` (Beginner badge) | 7.2:1 | AAA |

Rules: `star` and `accent` are fill-only colors. `primary` as text is 5.7:1 on white — fine for links/labels, prefer `primary-ink` on tinted backgrounds. `success` fills pair with `success-deep`/`success-ink` for any accompanying text.

## 3. Typography

Two Google Fonts, loaded with `preconnect` + `display=swap`, only the weights below (TECHNICAL-PLAN §8):

| Family | Weights | Role |
|---|---|---|
| **Sora** | 600, 700 | Headings, stats, prices, buttons ≥ md, eyebrow labels, wordmark |
| **Inter** | 400, 500, 600 | Body, UI labels, meta text, inputs |

Fallback stacks: `Sora, 'Inter', system-ui, sans-serif` / `Inter, system-ui, -apple-system, sans-serif`.

### 3.1 Type scale

| Token | Family / weight | Desktop | Mobile (≤767px) | Line-height | Used for |
|---|---|---|---|---|---|
| `display` | Sora 700 | 56px | 36px (`clamp(2.25rem, 5vw + 1rem, 3.5rem)`) | 1.1, tracking −0.02em | Hero headline "Master tech skills, one lesson at a time." |
| `h1` | Sora 700 | 40px | 30px | 1.15 | Page titles ("All courses", "My Learning", course title, lesson title, "404 — this page dropped out") |
| `h2` | Sora 700 | 30px | 24px | 1.2 | Section titles ("Find your path", "Course content", "Achievements", CTA banner heading) |
| `h3` | Sora 600 | 22px | 20px | 1.3 | Card-group headers, `EnrollCard` price, `BadgeUnlockModal` heading, accordion section titles |
| `h4` | Sora 600 | 18px | 17px | 1.4 | `CourseCard` titles, instructor names, achievement names |
| `stat` | Sora 700 | 36px | 28px | 1.1 | `StatCounter` values ("40K+"), reviews average ("4.8") |
| `body-lg` | Inter 400 | 18px | 17px | 1.6 | Hero subheadline, section subtitles, course taglines |
| `body` | Inter 400 | 16px | 16px | 1.6 | Descriptions, review text, bios, checklist items |
| `body-sm` | Inter 500 | 14px | 14px | 1.5 | Meta rows ("18 lessons · 5h 20m"), lesson durations, chips, footer links |
| `caption` | Inter 500 | 13px | 13px | 1.4 | Category captions on cards, streak weekday initials, badge unlock rules |
| `eyebrow` | Sora 600 | 13px | 12px | 1.2, uppercase, tracking 0.08em | `SectionHeading` eyebrows ("Categories", "Featured", "Instructors", "Testimonials") |

Buttons use Inter 600 at the sizes in §6.1. Course titles in cards clamp to 2 lines (`line-clamp-2`); taglines to 2 lines on cards.

## 4. Spacing, radius, shadow & layout tokens

### 4.1 Spacing & layout

4px base scale (Tailwind default). Key layout constants — these match the PRD and must not drift:

| Token | Value | Where |
|---|---|---|
| `container` | max-width 1200px, padding-inline 16px / 24px / 32px (375 / 768 / 1024+) | Every page section |
| `section-y` | 64px mobile, 96px ≥ 1024px | Vertical rhythm between landing/detail sections |
| `nav-h` | 68px | Navbar height (PRD §2.1) |
| `sticky-offset` | 84px | `EnrollCard` / `FilterSidebar` / `LessonSidebar` sticky top (nav 68 + 16 gap) |
| `rail-w` | 360px | Detail right rail, lesson sidebar |
| `filter-w` | 260px | Catalog filter sidebar ≥ 1024px |
| `card-gap` | 24px | All card grids |
| `card-pad` | 20px mobile, 24px ≥ 768px | Card interior padding |
| `tap-min` | 44×44px | Minimum tap target (hamburger, checkboxes' hit area, player controls) |

### 4.2 Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | Checkboxes, small icon squares, active-filter chips' inner close button |
| `radius-md` | 12px | Inputs, select, icon squares (category/logo), thumbnails inside horizontal cards |
| `radius-2xl` | 16px | **Signature radius**: cards, panels, player, modals, accordion, toasts, hero photo |
| `radius-pill` | 9999px | Buttons, badges, chips, pills, progress bars, streak dots, avatars |

Nested rule: inner radius = outer radius − padding (a 16px card with 12px padding clips its thumbnail at ~8–12px, top corners of full-bleed thumbnails at 16px).

### 4.3 Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 1px 2px rgb(27 24 48 / 0.04), 0 4px 12px rgb(27 24 48 / 0.06)` | Resting cards, navbar (when scrolled), `EnrollCard` |
| `shadow-lift` | `0 2px 6px rgb(27 24 48 / 0.05), 0 8px 24px rgb(124 58 237 / 0.12)` | Hovered cards (paired with −4px lift), floating hero cards |
| `shadow-modal` | `0 24px 64px rgb(27 24 48 / 0.24)` | `BadgeUnlockModal`, `MobileMenu` drawer, filter bottom sheet, mobile enroll bottom bar, `Toast` |

## 5. Motion tokens

Implementation lives in TECHNICAL-PLAN §6; these are the shared values it references.

### 5.1 Durations & easing

| Token | Value | Usage |
|---|---|---|
| `duration-fast` | 150ms | Hovers: card lift, icon-square tint, chevron color, button bg |
| `duration-base` | 250ms | Route transitions, accordion open/close, toast slide |
| `duration-slow` | 400ms | Scroll-entrance fade-ups (hero, sections) |
| `duration-progress` | 800ms | `ProgressBar` fills |
| `duration-count` | 1200ms | `StatCounter` count-up |
| `duration-bob` | 6s loop, ±10px | `FloatingCourseCard` vertical bob (delays 0 / 0.8s / 1.6s) |
| `ease-out-soft` | `cubic-bezier(0.16, 1, 0.3, 1)` | The house ease — all fades, rises, fills |
| CSS hover ease | `ease-out` | Plain CSS color/shadow transitions |

### 5.2 Springs (motion `type: 'spring'`)

| Token | Stiffness / damping | Usage |
|---|---|---|
| `spring-pop` | 260 / 18 | Badge unlock pop (scale 0, rotate −12° → rest), newly-earned `AchievementBadge` |
| `spring-ui` | 300 / 24 | Streak dots scale-in, mark-complete icon morph |
| `spring-sheet` | 320 / 30 | Filter bottom sheet, `MobileMenu` drawer slide |

### 5.3 Staggers

| Token | Value | Usage |
|---|---|---|
| `stagger-tight` | 40ms | Streak dots, checklist items, catalog grid reflow |
| `stagger-cards` | 60ms | Featured/catalog card entrances |
| `stagger-hero` | 80ms | Hero copy sequence (eyebrow → headline → sub → CTAs → stats) |

### 5.4 Reduced motion

With `prefers-reduced-motion: reduce` (via `useReducedMotion()`): entrances become opacity-only, bobs and count-ups are skipped (final values render immediately), springs become instant, progress bars snap to value, route transitions crossfade. No content is ever motion-gated.

## 6. Component styling specs

### 6.1 `Button`

Pill (`radius-pill`), Inter 600, icon gap 8px, focus ring 2px `primary` at `outline-offset: 2px` (universal — every interactive element), `whileTap` scale 0.98, disabled 50% opacity + `pointer-events: none`.

| Size | Height | Padding-x | Text |
|---|---|---|---|
| `sm` | 36px | 16px | 14px |
| `md` (default) | 44px | 20px | 15px |
| `lg` | 48px | 24px | 16px |

| Variant | Resting | Hover | Used for |
|---|---|---|---|
| `primary` | `primary` bg, white text, `shadow-card` | `primary-deep` bg | "Explore courses", "Enroll now", "Continue learning", "Continue", "Go now" |
| `secondary` | `surface` bg, 1px `border`, `ink` text | border + text → `primary` | "Start learning free", "Browse all 12 courses", "Review course", "Stay" |
| `ghost` | Transparent, `ink-muted` text | `surface-muted` bg, `ink` text | "Clear all", toast dismiss, back links |
| `inverse` | White bg, `primary` text | `surface-muted` bg | "Get started free" on the gradient `CtaBanner` |

### 6.2 `Badge`

Pill, Inter 600 12px, padding 4px 10px, uppercase-free.

| Variant | Bg / text | Used for |
|---|---|---|
| `beginner` | `accent-soft` / `#1E40AF` | Level overlay + hero meta |
| `intermediate` | `star-soft` / `star-ink` | Level overlay + hero meta |
| `advanced` | `primary-soft` / `primary-ink` | Level overlay + hero meta |
| `free` | `success-soft` / `success-ink` | Price overlay on free-course thumbnails |
| `category` | `surface` bg, 1px `border`, `ink-muted` text | Category label on `CourseHero` |
| `success` | `success-soft` / `success-ink` | "Completed" states (`EnrollCard`, `EnrolledCourseCard` thumbnail) |

Paid price on thumbnails is not a `Badge`: white pill (`surface` bg, `shadow-card`, `ink` Sora 600 14px), e.g. "$49".

### 6.3 Cards

- **Base card** (`CourseCard`, `TestimonialCard`, `InstructorCard`, `EnrolledCourseCard`, review/checklist/streak panels): `surface` bg, 1px `border`, `radius-2xl`, `shadow-card`, `card-pad`.
- **Hover (linked cards only):** lift −4px + `shadow-lift` (150ms); `CourseCard` thumbnail scales 1.04 inside its clipped container. Non-interactive cards (testimonials, reviews) do not lift.
- **`FloatingCourseCard`:** compact base card at ~220px wide, `shadow-lift` at rest, continuous bob (§5.1).
- **`EnrollCard`:** base card + `shadow-card`; sticky at `sticky-offset` ≥ 1024px; on mobile the price + CTA + progress portion becomes a fixed bottom bar — `surface` bg, top 1px `border`, `shadow-modal`, safe-area padding.
- **`CategoryCard`:** base card, centered; 48px icon square (`radius-md`, `primary-soft` bg, `primary` icon 24px) → hover: square fills `primary`, icon white (150ms).

### 6.4 Inputs & filters

| Element | Spec |
|---|---|
| `SearchBar` | 44px height, `radius-pill`, `surface` bg, 1px `border`, `Search` icon 18px `ink-faint` left, placeholder `ink-faint`; focus: border `primary` + 2px ring |
| Checkbox / radio (`FilterGroup`) | Native inputs, 18px, `accent-color: #7C3AED`, `radius-sm` (checkbox); label Inter 400 14px `ink`, count suffix `ink-faint`; 44px-tall row hit area |
| `SortSelect` | Styled native `<select>`: 44px, `radius-md`, `surface` bg, 1px `border`, Inter 500 14px, `ChevronDown` 16px `ink-muted` |
| `ActiveFilterChips` | Pill chip: `primary-soft` bg, `primary-ink` Inter 500 13px, `X` 14px; hover bg deepens toward `#DDD3FC`; "Clear all" is a `ghost` sm button |
| Filters trigger (mobile) | `secondary` md button "Filters" + count badge (`primary` bg, white, pill, 11px) |

### 6.5 Navigation

- **`Navbar`:** 68px, `rgb(255 255 255 / 0.8)` + `backdrop-blur(12px)`, 1px `border` bottom. Logo: 36px `radius-md` `primary` square, white `GraduationCap` 20px + "EduFlow" Sora 700 20px `ink`. Links Inter 500 15px `ink-muted`; active: `primary` text + 2px `primary` sliding underline (`layoutId`). Count pill on "My Learning": `primary` bg, white Inter 600 11px, pill, min-width 18px.
- **`MobileMenu`:** right drawer, 320px max-width (100vw − 48px), `surface` bg, `shadow-modal`, links as 48px rows Sora 600 18px; backdrop `rgb(27 24 48 / 0.4)`.
- **`Footer`:** `surface` bg, top 1px `border`; column headings Sora 600 14px `ink`; links Inter 400 14px `ink-muted` → hover `primary`; bottom bar `caption` `ink-faint`.

### 6.6 Progress & gamification

| Element | Spec |
|---|---|
| `ProgressBar` | Track `primary-soft`, pill. Fill `primary` (tone `violet`) or `success` (tone `green`, at 100%). Sizes: `xs` 4px (lesson top bar), `sm` 6px (cards), `md` 8px (`EnrollCard`, `LessonSidebar`). Label `body-sm` `ink-muted` ("67% complete") |
| `StreakCalendar` dots | 36px circles: active `primary` bg + white `Check` 16px; today +2px `primary` ring (`offset` 2px); inactive `surface` + 1px `border`. Weekday initials `caption` `ink-faint`. Flame pill: `star-soft` bg, `star-ink` text, `Flame` 16px |
| `AchievementBadge` (earned) | 64px circle `star-soft` bg, icon 28px `star-ink`; tile `surface` + `border`; name `h4`, rule `caption` `ink-muted`; subtle idle sheen (slow diagonal highlight sweep, disabled under reduced motion) |
| `AchievementBadge` (locked) | Circle `surface-muted`, icon `ink-faint`, tile at 60% opacity, `Lock` 14px corner mini-icon; rule text as hint |
| `StarRating` | `star` filled stars 16px (20px in hero eyebrow context), empty stars `border`; value Inter 600 14px `ink`, count `ink-faint` |

### 6.7 Overlays

| Element | Spec |
|---|---|
| `Toast` | `surface` bg (on `bg` pages), `radius-2xl`, `shadow-modal`, max-width 380px bottom-right 24px (full-width bottom banner ≤ 767px); message Inter 500 14px `ink`; actions: `primary` sm + `ghost` sm; countdown line 3px `primary`, `scaleX` 1→0 |
| `BadgeUnlockModal` | Backdrop `rgb(27 24 48 / 0.5)` fade; panel `surface`, `radius-2xl`, `shadow-modal`, max-width 400px, centered, 32px padding; 96px medal circle `star-soft` with `star-ink` icon 44px (spring-pop entrance); heading `h2`, text `body` `ink-muted` |
| `Accordion` | Container `surface` + 1px `border` + `radius-2xl`; section headers 64px rows Sora 600 16px, chevron `ink-muted` rotates 180°; open panel separated by inner 1px `border`; lesson rows 48px, hover `surface-muted`; active lesson (sidebar mode): `primary-soft` bg + `primary-ink` text; completed icon `success` |
| `FakeVideoPlayer` | 16:9, `radius-2xl`, thumbnail + bottom scrim `linear-gradient(rgb(27 24 48 / 0) 55%, rgb(27 24 48 / 0.72))`; play overlay 72px white circle + `primary` `Play` 28px, `shadow-lift`; control bar white icons 20px on scrim, decorative controls at 60% opacity with "Demo player" tooltip |
| `EmptyState` | Centered, max-width 420px: 64px `primary-soft` circle with `primary` icon 28px, title `h3`, message `body` `ink-muted`, `primary` md button |
| `GradientBlob` | 320–480px blurred (`blur(80px)`) radial circles in `primary` / `accent` / `star` at 25–40% opacity, absolutely positioned, `aria-hidden`, never overlapping text blocks |

## 7. Imagery & art direction

- **Source & pipeline:** free stock from Unsplash/Pexels, downloaded and converted to `.webp` in `src/assets/` (never hotlinked). Sizes/budgets per TECHNICAL-PLAN: course thumbnails 1280×720 ≤ 120KB, avatars 400×400 ≤ 30KB, hero ≤ 200KB.
- **Mood:** bright, natural daylight with warm highlights that flatter the `#FAFAFF` ground; real people mid-work (desks, laptops, whiteboards, tablets) — candid over posed, no fake-smiling-at-camera stock clichés, no watermarks, no visible brand logos.
- **Course thumbnails:** subject matter matches the track (code editor close-ups for Web Dev, dashboards/notebooks for Data Science, Figma-style canvases for Design, devices for Mobile, server/terminal scenes for DevOps, abstract-tech for AI/ML). Consistent warm-neutral grade across all 12 so the catalog grid reads as one family.
- **Hero photo:** a learner at a desk in warm window light, laptop open — cropped to leave clean edge space for the three `FloatingCourseCard`s and the streak chip.
- **Avatars:** 11 headshots (5 instructors, 6 reviewers/testimonial authors), tight head-and-shoulders crops, varied and diverse subjects, neutral backgrounds; rendered as circles (`radius-pill`).
- **Overlays:** thumbnails under text always get the player scrim (§6.7); decorative color comes from `GradientBlob`s, never from tinting photos violet.

## 8. Do / Do not

**Do**
- Pull every color, radius, shadow, duration, and font size from `@theme` tokens.
- Keep `radius-2xl` (16px) on every card-like surface and pills on every control.
- Reserve yellow for stars, streaks, and achievements — it should always mean "reward".
- Pair every green/yellow/violet tint with its matching `-ink` text token.
- Use `Sora` only at weights 600/700 and only for headings, stats, prices, and buttons.
- Gate every transform/loop animation behind `useReducedMotion()`.

**Do not**
- Do not hard-code hex values, px shadows, or bezier curves in components.
- Do not set `star` (`#FBBF24`) or `accent` (`#3B82F6`) as text on light backgrounds.
- Do not use `ink-faint` for running text — placeholders and disabled labels only.
- Do not add lift/hover states to non-interactive cards (testimonials, reviews).
- Do not introduce a second gradient, a new radius, or pure-white page backgrounds.
- Do not hotlink imagery or ship any photo over its size budget.
