# Review: Web Accessibility in Practice (`web-accessibility`)

## Verdict

A strong course. The Ticketly running project holds it together, each lesson fixes one real defect, the exercises check behaviour rather than variable names, and the Arabic reads like a practitioner wrote it, with consistent terms throughout. The WCAG 2.2 criteria (numbers, names, levels), the ARIA/APG patterns, the `<dialog>`/`inert` behaviour, the contrast maths (all seven ratios recomputed) and the NVDA/VoiceOver commands were nearly all correct. The real problems were one quiz with a wrong "correct" answer on accessible-name computation, legal and statistics facts that had gone stale during 2026 (EN 301 549 v4.1.1, the ADA Title II interim rule, the WebAIM Screen Reader Survey #11), and a few overstated or imprecise claims. The author's open question in lesson 3-4 is settled: when a button opens a popover through `popovertarget`, browsers do expose its expanded state automatically. They don't when script opens it with `showPopover()`. The lesson now says both. Validator and exercise checker are clean.

## Issues found and fixed

| File | Category | Severity | What was wrong | What I changed |
|---|---|---|---|---|
| lessons/l-a11y-4-3.{en,ar}.md (quiz 1) | accuracy | high | `<button id="b1" aria-label="Buy" aria-labelledby="b1 fri">Book now</button>` was keyed as "Book now Friday pass". Under accname 1.2 the self-reference skips aria-labelledby and resolves to aria-label, so the name is **"Buy Friday pass"** (see accname Example 5). | Replaced the "Buy Book now Friday pass" option with "Buy Friday pass", made it the answer (index 2 kept), moved "Book now Friday pass" to a distractor and rewrote every `why`. |
| lessons/l-a11y-4-3.{en,ar}.md (body) | accuracy | medium | Said "if aria-labelledby exists, aria-label is never used". This is false for self-references. | Added the self-reference exception. |
| exercises/l-a11y-4-3.json (5 checks) | accuracy | low | The checker's name function used content for a self-reference even when aria-label was present (not how accname works). | The self-reference now uses aria-label first, then content. The solution still passes. |
| lessons/l-a11y-3-4.{en,ar}.md (popover tip) | accuracy | medium | The author was unsure about automatic expanded state. The tip claimed it with no conditions. | Verified against HTML-AAM §popovertarget (aria-expanded true/false mapping) and implementation notes (Chrome, Edge, Firefox, Safari). The tip now says it is automatic for declarative `popovertarget`, so don't add aria-expanded yourself, but you must manage it yourself when script calls `showPopover()`. |
| lessons/l-a11y-1-3.{en,ar}.md, glossary.{en,ar}.json | accuracy | medium | Said "the harmonised standard EN 301 549 maps to WCAG 2.1 AA". This is out of date: v4.1.1 (WCAG 2.2) was published in Sept 2026, and v3.2.1 stays the reference until it is cited in the Official Journal. | Rewrote both to give that status. |
| lessons/l-a11y-1-3.{en,ar}.md | accuracy | low | ADA Title II deadlines had no source or size criterion. | Now says the April 2026 interim rule moved the deadlines to April 2027 (≥50,000 population) and April 2028 (smaller entities). Verified. |
| lessons/l-a11y-1-3.{en,ar}.md | accuracy | low | The Target Size exceptions list was missing "essential". | Added it. |
| lessons/l-a11y-1-2, 2-1, 5-2 (en+ar) | accuracy | medium | WebAIM screen reader figures came from the 2024 survey (71.6% headings; JAWS 40.5 / NVDA 37.7 / VO 9.7; iOS VO 70.6). Survey #11 (Jul–Aug 2026) has since been published. | Updated to 2026: headings 67.8%; JAWS 55.0%, NVDA 32.9%, VoiceOver 6.5%; mobile VoiceOver 72.2%, TalkBack 29.5%. Taken from the survey page's own chart data. |
| lessons/l-a11y-5-2.{en,ar}.md | accuracy | low | "NVDA key … Caps Lock in the laptop layout". Caps Lock is an opt-in NVDA key, not part of the layout. | Corrected. |
| lessons/l-a11y-5-2.{en,ar}.md | consistency | low | "A finding … has five parts", but the example shows six fields. | Changed to "six parts". |
| lessons/l-a11y-2-2.{en,ar}.md | accuracy | low | Said `disabled` means screen reader users "may never learn it exists". Browse mode still finds it, announced "unavailable". | Reworded: keyboard users tab past it, SR browse mode finds it with no reason given. |
| lessons/l-a11y-2-4.{en,ar}.md (quiz 2) | accuracy | low | "The browser doesn't fill in alt". Some browsers and screen readers offer opt-in AI descriptions. | Softened to "nothing fills in alt by default…". |
| lessons/l-a11y-3-2.{en,ar}.md | accuracy | low | Suggested `autofocus` on "the dialog's heading container". autofocus needs a focusable element. | Now: the Close button, or the heading made focusable with `tabindex="-1"`. |
| lessons/l-a11y-4-2.{en,ar}.md | accuracy | low | 2.3.1 was called "Three Flashes" with no mention of the threshold. | Full name "Three Flashes or Below Threshold" and the below-threshold allowance added. |
| lessons/l-a11y-3-1.{en,ar}.md | consistency | low | The header's Tab stops (logo + 8 links + search + account = 11) didn't match the figure ("13 stops", "twelve more presses"). | Changed to ten menu links, "thirteen Tab stops". |
| lessons/l-a11y-1-1.{en,ar}.md | consistency | low | The figure's `<title>` said "a blind user", but the box reads "Low vision". | Title now says "a person with low vision". |
| lessons/l-a11y-1-1.{en,ar}.md | accuracy | low | "Most social video is watched with the sound off". The figure is contested. | Softened to "a large share". |
| exercises/l-a11y-3-4.{en,ar}.json | pedagogy | low | The explanation quotes the "Festival days, tab list" announcement, but the prompt never asked for a tablist name. | Prompt now asks for `aria-label="Festival days"`. |
| exercises/l-a11y-5-3.{en,ar}.json | pedagogy | low | Ordering exercise: nothing justified placing the visual/content checks after the screen reader pass, so a reasonable order could be marked wrong. | Hint 3 now says testing ends with a visual/content sweep. |
| course.ar.json | arabic | low | Awkward word order: «تكاد كل صفحة رئيسية تفشل على الويب». | Changed to «…على الويب تفشل». |
| lessons/l-a11y-1-1.ar.md | arabic | low | Awkward clitic order: «لم يُعلن عنها قارئ الشاشة أي شيء». | Changed to «لم يُعلن قارئ الشاشة عنها شيئًا». |
| lessons/l-a11y-1-2.ar.md | arabic | low | «حين يكون التصميم البصري ينقل» (redundant كان + verb). | Changed to «حين ينقل التصميم البصري». |
| lessons/l-a11y-2-3.ar.md | arabic | low | Clumsy «لا يستطيع أي شخص لا يرى أن يدركه». | Changed to «لا يدركه من لا يرى الشاشة». |
| lessons/l-a11y-3-3.ar.md | arabic | low | «خصائص ARIA» (attributes) collided with «الخصائص (properties)». | Glossed as «(attributes)» and «الخصائص بالمعنى الدقيق (properties)». Kept the course-wide مهذّبة/حازمة for polite/assertive. |
| lessons/l-a11y-4-2.ar.md | arabic | low | «يتجاوز المستخدمون ارتفاع السطر» mistranslated "override". «256px مع الحشو» changed the meaning. | Changed to «يفرض… ارتفاع سطر قدره 1.5» and «256px يُضاف إليها الحشو». |
| lessons/l-a11y-4-4.ar.md | arabic | low | Callout title said «بدلًا من الكود» for "markup", which is vague. | Changed to «بدلًا من HTML». |
| lessons/l-a11y-5-1.ar.md | arabic | low | «عام 2017 ‏142 عائقًا»: two numbers run together. | Changed to «عام 2017 ما مجموعه 142 عائقًا». |
| lessons/l-a11y-5-2.ar.md | arabic | low | «في عصرية واحدة» is colloquial. | Changed to «في بضع ساعات». |
| assessments.ar.yaml | arabic | low | «يتحدّث عدّاد» means "a counter talks", not "updates". The AAA question also had awkward word order. | Changed to «يتغيّر عدّاد» and «أيّ هذه المعايير في WCAG 2.2…». |

**Totals: 29 issues.** By category: accuracy 15, arabic 10, consistency 3, pedagogy 2. By severity: high 1, medium 5, low 23.

## Verified as correct (no change needed)

- **WCAG 2.2:** published October 2023; 13 guidelines; 4.1.1 removed; nine new criteria, six at A/AA with their levels; 1.4.3/1.4.6/1.4.11 thresholds; large text = 24px or 18.66px bold; the 1.4.12 values; 2.4.11 wording; the 2.5.8 spacing rule (the 20px/30px final question works out); 3.2.6 "same relative order".
- **WebAIM Million 2026:** 95.9%; 56.1 errors per page; contrast 83.9%, alt 53.1%, labels 51%, links 46.3%, buttons 30.6%, lang 13.5%; ARIA pages 59.1 errors vs 42.
- **Legal:** EAA in force 28 June 2025, the microenterprise exemption, and its reach to non-EU sellers. Section 508 → WCAG 2.0 AA.
- **Other studies:** GDS 2017 tool audit (142 barriers, best tool 40%); Deque's ~57% figure.
- **Contrast ratios:** all recomputed with the WCAG formula (2.81, 4.54, 2.06, 8.35, 7.00, 4.67, 1.36, 7.27).
- **`<dialog>`:** `showModal()` focus order, focus restore on close, top layer, Escape. `inert` supported in all major browsers since 2023.
- **APG patterns and key commands:** tabs (roving tabindex, wrapping, automatic vs manual activation, tabpanel `tabindex="0"`), disclosure, menu button. NVDA keys (H/D/F/B/K/T, Ctrl+Alt+arrows, NVDA+F7, NVDA+Space). VoiceOver keys (Cmd+F5, VO+U, VO+Cmd+H, VO+A) and Safari's "Press Tab to highlight each item".

## Could not fully verify / notes

- **Speech output samples:** the exact NVDA phrasing in examples (word order such as "heading level 3, Friday" vs "Friday, heading level 3") varies by version and verbosity settings. These are illustrative, so I left them.
- **Survey #11 publication:** WebAIM Screen Reader Survey #11 is live at webaim.org/projects/screenreadersurvey11/ (survey dates July–August 2026). I used its published chart data.
- **EN 301 549 v4.1.1 citation:** it is expected to be cited in the Official Journal around November 2026. If that happens, lesson 1-3 and the glossary entry can drop the "once cited" wording.
- **Lesson 4-4 code sample:** the code shows the Arabic title as `…` (`<h3 lang="ar" dir="rtl">…</h3>`). That is deliberate, to avoid bidi rendering in code blocks, so I left it.

## Verification

- `node scripts/content/validate.mjs web-accessibility`: 0 errors, 0 warnings
- `node scripts/content/check-exercises.mjs web-accessibility`: 12 runnable exercises, 0 problems
