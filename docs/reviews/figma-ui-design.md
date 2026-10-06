# Review: UI Design with Figma (`figma-ui-design`)

Reviewed 2026-10-06. I checked every file in both languages: the course files, 17 lessons, 16 exercises (neutral, EN and AR), the assessments and the glossary.

## Verdict

The English course is technically strong and current for 2026. I checked these Figma claims against help.figma.com and all of them hold:
- Auto layout has Vertical, Horizontal and Grid flows, and Wrap works on both horizontal and vertical flows.
- Gap can be set to Auto, with Between, Around and Evenly.
- "Ignore auto layout" was formerly called absolute position.
- "Layout guides" were renamed from layout grids in May 2025, and their types are Uniform grid, Columns and Rows.
- Slots are a component property available on all plans, and so are preferred values and exposed nested instances.
- Variables come in color, number, string, boolean, timing and easing types.
- Mode limits: none on Starter, 10 on Professional, 20 on Organization.
- Dev Mode needs a paid plan and a Full or Dev seat. Its statuses are Ready for dev, Changed (set automatically) and Completed (Organization and Enterprise).
- Annotations have Development, Interaction, Accessibility and Content categories, with Shift+T to annotate and Shift+M to measure.
- Check designs is Organization and Enterprise only.
- Overlay settings are stored on the overlay frame.
- Smart animate matches layers by name and hierarchy, and you should use 0% opacity rather than hiding a layer.

I recomputed every contrast ratio in the course with the WCAG formula, about 25 pairs, and all were correct. WCAG 2.2 figures are also right: 4.5:1 and 3:1, large text at 24 px or 18.66 px bold, SC 2.5.8 at 24×24 CSS px, Apple at 44 pt and Material at 48 dp.

The problems were narrower:
- A few guided exercises allowed more than one defensible answer.
- One plan note was incomplete.
- One spacing description contradicted a later lesson.
- One distractor didn't make sense.
- The Arabic was a fluent translation with many small calques, gender-agreement slips (especially "instance" and "variant"), and inconsistent renderings of "semantic variable" and "accessible name".

Everything below is fixed. `validate.mjs` reports 0 errors and 0 warnings. `check-exercises.mjs` reports 0 problems; the course has no runnable exercises because all of them are guided.

## Issues found and fixed

| File | Category | Severity | What was wrong | What I changed |
|---|---|---|---|---|
| exercises/l-fig-1-4 (.json, .en, .ar) | accuracy | high | The spot-bug tree gave Habit row, Icon and Check button no constraints. In a plain frame they would default to Left/Top, so the row would not stretch at 430 px either. That made more lines "wrong" than the two the exercise accepts. | Added explicit constraints to lines 6, 7 and 10 (row Left and right/Top, icon Left/Center, check Right/Center). Line numbers are unchanged, and the explanation now says why those lines are fine. |
| exercises/l-fig-2-4 (.en, .ar) | pedagogy | high | In the order exercise, "set Fill container" and "set constraints" are independent steps, so either order was correct, but only one was accepted. | The constraints step now ends with "then drag the screen wider to check the rows stretch". That check only works after the fills are set, so the order is now forced. Hint and explanation updated. |
| exercises/l-fig-3-5 (.json, .en, .ar) | pedagogy | high | The prompt said "check against the component checklist". That checklist requires focused states, so the Button, Check button and Chip lines could also be flagged, but they weren't accepted. Button also lacked the Icon instance swap the explanation relied on. | The prompt now focuses on duplication, naming and variables, and says states are reviewed in Lesson 4.2. Line 5 now lists `Icon: instance swap`. Explanation updated. |
| exercises/l-fig-4-3 (.en, .ar) | pedagogy | medium | In the order exercise, "clean", "group into section" and "add states" had only weak dependencies, so other orders were arguable. | Item text now creates the dependencies: "Group the **remaining** screens…" and "Add the missing states **to that section**…". |
| lessons/l-fig-1-1 (.en, .ar) | accuracy | medium | The plan note said Starter lacks only variable modes and Dev Mode. Per Figma's plan comparison, libraries are also paid-only, and Lesson 3.5 publishes one. | Added "publishing a library (Lesson 3.5)". |
| lessons/l-fig-1-2 (.en, .ar) | consistency | medium | Applied spacing said "8 px of padding plus a 1 px divider, or 12 px if rows are cards". Lesson 2.1 builds rows with 12 px padding as cards 8 px apart. | Changed to "each row is its own card, and cards sit 8 px apart", which matches 2.1 and 2.3. |
| lessons/l-fig-2-1 (.en, .ar) | pedagogy | medium | Quiz distractor: "The rectangle should be 15 px so the total stays on the 8-point grid". 15 is off the grid, so the option was incoherent. | Changed to 8 px, so the total is 24 and the option is now a plausible wrong idea. |
| lessons/l-fig-2-3 (.en, .ar) | accuracy | low | Quiz "why" said each value moves to "the nearest step". 14, 10 and 22 are each equidistant between two steps on Steady's 4-point scale. | Now "a neighbouring step… keeps inside-smaller-than-outside (8, then 16, then 24)". |
| lessons/l-fig-1-3 (.en, .ar) | accuracy | low | "Steady's scale is close to Apple's default text sizes". Apple's line heights differ, and its 13 pt style is Footnote, not Caption (Caption 1 is 12 pt). | Now says the scale borrows most sizes from Apple, rounds line heights to multiples of 4, and uses 13 px (Apple's footnote size) for captions. |
| exercises/l-fig-2-1 (.json, .en, .ar) | pedagogy | low | The alignment blank had no naming guidance, so any synonym could be marked wrong. Chip padding of 6 px is off the course's own spacing scale with no stated reason. | The prompt now names Top/Center/Bottom, and I added accepted spellings (Centred, Vertical center, Left center, Center left). The explanation states the reason for 6 px (it gives an even 32 px chip height), which models Lesson 2.3's "off-scale needs a written reason". |
| assessments (.en, .ar), final Q11 | accuracy | low | "Close is not passing" for 20 px icons 4 px apart. Under SC 2.5.8's spacing exception (24 px circles, centers 24 px apart) they technically scrape past. | The "why" now says that even if the spacing exception lets them pass, they're far below the 44 pt guideline and invite mis-taps. |
| assessments.ar.yaml | consistency | medium | "المتغيّرات الدلالية" was used while lessons keep Variable in English. "outline" was rendered as "إطار", which clashes with Frame. "accessible name" was rendered "الاسم المتاح" ("available name"). | Changed to "الـ variables الدلالية", "الحدّ الخارجي (outline)" and "الـ accessible name (الاسم الذي تنطقه قارئات الشاشة)". |
| assessments.ar.yaml | arabic | medium | final Q1 "المشكلة المنافسة" ("the competing problem") was a mistranslation, plus about 20 calques ("يفوز"، "يعيش"، "مبهم أكثر من أن"، "القرب ليس نجاحًا"…). | Rewritten in natural MSA. |
| glossary.ar.json | arabic | medium | variant "توصفها" (grammar). main-component's instance was masculine and then feminine in one sentence. Human plurals were used for layers. Unclear phrasing in ready-for-dev, library and semantic-token. | Fixed agreement and verb forms, and rephrased those definitions. |
| course.ar.json | arabic | medium | "يقدّم… صوفيا" (masculine verb for a feminine subject). "حقيقية" was added beyond the English. Agreement errors in learnItems. | Fixed. |
| lessons/l-fig-3-1, 3-2, 4-1 and exercises 3-1 (.ar) | arabic | medium | "instance" was treated as both masculine and feminine. | Made feminine throughout, per the glossary. |
| lessons/l-fig-3-3, 3-4 and exercise 3-3 (.ar) | consistency | medium | "المتغيّر/المتغيّرات الدلالية" was used although Variable stays in English. | Changed to "الـ variable(s) الدلالي(ة)". |
| lessons/l-fig-4-2, 4-3 and exercise 4-3 (.ar) | arabic | medium | "الاسم/الأسماء المتاحة" means "available name", not accessible name. | Changed to "الـ accessible name(s)" with a gloss on first use. |
| lessons/l-fig-4-3.ar.md | arabic | high | The figure caption was ungrammatical ("حالات Dev Mode وهي ينتقل التصميم…"). "Done with changes" was calqued. | Rewrote the caption. Now "اكتملت التغييرات". |
| lessons/l-fig-4-4.ar.md | arabic | medium | The critique goal and case-study examples were left in English while sibling examples were translated. | Translated them. |
| lessons/l-fig-2-4 and exercise 2-4 (.ar) | arabic | medium | "اضغط على المحتوى" for "stress the content" (literally "press on the content"). | Changed to "اختبر المحتوى تحت الضغط". |
| lessons/l-fig-1-2.ar.md | consistency | medium | Added a claim not in the English ("ومن أعلى اليمين في العربية"). Agreement errors ("كل مبتدئ… يومهم", "يبرز قائمة"). | Removed the claim and fixed agreement. |
| lessons/l-fig-2-1, 2-2 (.ar) | arabic | medium | "تموضع ابنًا", a transitive use of an intransitive verb. Disagreement in "الحدّ الأدنى والأقصى… تضع". | Changed to "تحديد موضع", and fixed the agreement. |
| lessons/l-fig-2-3.ar.md | consistency | medium | "سلّم الخط" instead of the glossary's "سلّم أحجام الخط". | Unified. |
| All Arabic lessons and exercises (about 80 edits) | arabic | low | Calques ("تجلس"، "تعيش"، "يسافر"، "كاذبة"، "امشِ عبر"، "فترة بعد الظهر"), lowercase "layout guide" and "wrap", "الفجوة" for gap, and "kit" left in English. | Rewritten idiomatically. Figma feature names now follow the glossary casing. |

### Summary counts

| Category | High | Medium | Low |
|---|---|---|---|
| Accuracy | 1 | 1 | 3 |
| Pedagogy | 2 | 2 | 1 |
| Consistency | 0 | 5 | 0 |
| Arabic | 1 | 8 | about 80 small edits, grouped as one row in the table |

## Checked and left as is

- **Palette naming.** Steady's own primitives call #111827 `gray/950` and #1A1A1A `gray/900`. Tailwind uses gray-900 = #111827 and gray-950 = #030712. Every figure is consistent inside the course, so I left it. A learner who knows Tailwind may notice the difference.
- **Arabic for "visual hierarchy".** The glossary uses "التسلسل البصري". "التسلسل الهرمي البصري" is the more standard rendering, but the shorter form appears in 14 places and is clear, so I kept it.
- **Exercise l-fig-3-5.** The Text field sits under "Section: Rows", which is slightly odd file organisation, but it isn't a checklist failure.
- **Lesson 3.5's checklist and the kit table.** The checklist asks for focused states, while the kit table shows Check button and Chip without them. Lesson 4.2 adds Focused to those components later, so the course resolves it. The exercise prompt now scopes this out.
- **Plan details.** Mode limits, Dev Mode seats and Check designs availability are marked "at the time of writing" in the lessons, and they match help.figma.com as of October 2026.
