# Review: react-fundamentals

## Verdict

This is a strong course. The 18 lessons build one Watchlist app from start to finish. The React 19 content is sound: render as a snapshot, updater functions, immutable updates, keys, StrictMode's double render and double Effect run, cleanup, "you might not need an Effect", form actions and `useActionState`, `ref` as a prop, and the React Compiler as optional. Every React exercise runs in the playground, and every check uses only the documented helpers. The main problems were about tooling that has changed since the course was written. `npm create vite@latest` now installs Vite 8, and since June 2026 the React templates use Oxlint by default instead of ESLint (verified against the create-vite source and the npm registry). Lesson 1-2 and the lint references in lessons 3-1 and 3-5 described the older setup. The rest were small accuracy overstatements, one quiz that referred to a "Clear watched" handler the app never builds, and a handful of Arabic phrases that were awkward or, in one case, said the opposite of the English. The PRD titles, minutes, ids and answer positions are unchanged.

## Issues found and fixed

| File | Category | Severity | What was wrong | What changed |
|---|---|---|---|---|
| lessons/l-rf-1-2.en/.ar.md | accuracy | medium | Said "Vite 7 needs Node 20.19+/22.12+" and implied the scaffold is Vite 7. `npm create vite@latest` now installs Vite 8 (8.3.x, create-vite 9.2.x); the Node requirement is the same. The quiz distractor said "removed from Vite 7". | The text now says "Current Vite (7 and 8)" needs Node 20.19+/22.12+, and that `@latest` installs the newest major (Vite 8 at the time of writing) and that the course works the same on either. The distractor now says "recent versions of Vite". |
| lessons/l-rf-1-2.en/.ar.md | accuracy | medium | "`npm run lint` runs ESLint" and "`eslint.config.js` configures the linter". Since create-vite PR #22638 (June 2026), React templates use Oxlint (`.oxlintrc.json` with `react/rules-of-hooks`) and offer ESLint as an option. | The scripts table and the folder tour now describe the linter in neutral terms and name both config files. |
| lessons/l-rf-3-1.en/.ar.md | accuracy | low | Said the "`eslint-plugin-react-hooks` rules that Vite set up" would catch Hook mistakes, which is no longer the default. | Now names Oxlint's `react/rules-of-hooks` or `eslint-plugin-react-hooks`. |
| lessons/l-rf-3-5.en/.ar.md | accuracy | low | Named the lint rule only as `react-hooks/exhaustive-deps`. | Now names both `react/exhaustive-deps` (Oxlint, correctness category, on by default) and `react-hooks/exhaustive-deps` (ESLint). |
| lessons/l-rf-3-1, l-rf-3-5 (.en/.ar) | accuracy | low | Said a `useState` initializer is "called only once" or "reads storage once". StrictMode calls initializers twice in development. | Now says it runs "only for the first render, not on every render". |
| lessons/l-rf-3-5.en/.ar.md | accuracy | low | Quiz Q2: the explanation for the "missing dependency array" distractor was self-contradictory. | Rewritten: a page load renders once, so a missing array can't explain a cleanup immediately after the first run. |
| lessons/l-rf-3-5.en/.ar.md | accuracy | low | The infinite-loop callout said any object or array dependency loops. It only loops if the Effect also sets state. | Now limited to an Effect that sets state. |
| lessons/l-rf-3-2.en/.ar.md | accuracy | low | The tip said "Cannot read properties of undefined" usually means a handler received the event object. In practice that mistake usually fails silently, for example `filter` removes nothing. | Now describes the real symptom: the handler does nothing, or logs an event object where you expected an id. |
| lessons/l-rf-3-2.en/.ar.md | consistency | low | Said `preventDefault` is needed "on every form in the next lesson", but that lesson shows form actions, which don't need it. | Now refers to the Watchlist's form. |
| exercises/l-rf-1-4.en/.ar.json | accuracy | low | The explanation said real `jsx()` differs because "children live inside props", but the learner's `h()` also puts children in props. | Now lists the real differences: children arrive inside the props argument, a single child isn't wrapped in an array, and the key is passed separately. |
| lessons/l-rf-1-3.en/.ar.md | accuracy | low | Quiz Q4 said an array "works only with keys". An array without keys still renders; React only warns. | Corrected. |
| lessons/l-rf-1-3.en/.ar.md | pedagogy | low | Quiz Q1 had an implausible distractor ("the `function` keyword with an arrow inside"). | Replaced with a plausible misconception: components must be arrow functions. |
| lessons/l-rf-2-4.en/.ar.md | pedagogy | low | The "Name the condition" tip used `isEmpty` for an expression that checks "no unwatched movies". | Renamed it `allWatched`. |
| exercises/l-rf-2-5.en/.ar.json | pedagogy | low | The explanation said Arrival's row is "key 0", but after sorting newest first it isn't. | Clarified that this is key 0 in the starter, and that the row is reused for whichever movie now sits in that position. |
| lessons/l-rf-4-1.en/.ar.md | consistency | medium | Quiz Q1 and Q4 described the finished app as having a "Clear watched" button and handler. The lesson's App has three handlers and no such button. | Both questions now present it as an extension the learner adds. |
| lessons/l-rf-4-2.en/.ar.md | accuracy | low | Said "Restart `npm run dev` after changing the Vite config". Vite restarts itself when you save the config. | Now says Vite restarts automatically; restart by hand only if styles still don't appear. |
| exercises/l-rf-4-4.en/.ar.json | accuracy | low | Said that fetching during render, or in an Effect with no dependency array, "fetches forever / an endless loop". With a string state, React's bail-out can stop that loop. The real faults are a request on every render and races. | Now says a request is sent on every render, each state update causes another render and request, and nothing stops a stale response from winning. |
| lessons/l-rf-2-1.ar.md | arabic | medium | "تُبقي component من 100 سطر **على أن** تقسّمه" means "on condition that you split it", the opposite of the English "rather than". | Changed to "بدل أن تقسّمه". |
| lessons/l-rf-1-3.ar.md | arabic | low | "الدوال المتداخلة JavaScript صحيحة" (missing noun), "الـ componentين", "كمعادلة". | Changed to "كود JavaScript صحيح", "الـ componentَين", "كالمعادلة الرياضية". |
| lessons/l-rf-2-3.ar.md | arabic | low | "نسخ الـ component لكل نسخة مختلفة" (the same word used twice for different meanings), "يرمي بتهريب React", and "النسخ" used for variants. | Changed to "لكل شكل (variant)", "يتخلّى كليًا عن تهريب React للنصوص", "كل الأشكال المشتقّة منه". |
| lessons/l-rf-3-2.ar.md | arabic | low | "إعادة نموذج تحميل الصفحة" was garbled. | Changed to "إعادة تحميل الصفحة عند إرسال نموذج". |
| lessons/l-rf-3-3.ar.md | arabic | low | "صفحات تُعاد تحميلها" (agreement error) and "الحقل فقط يصبح للقراءة فقط" (فقط used twice). | Fixed both. |
| lessons/l-rf-3-4.ar.md, exercises/l-rf-3-4.ar.json | arabic | low | "components أخوة" should be "إخوة". "تتميّز الأزرار" is a calque of "highlight". | Changed to "إخوة" and "يظهر الزر النشط مميّزًا". |
| lessons/l-rf-3-5.ar.md | arabic | low | Used "مفتاحًا" in the same sentence as "الـ key", against the course's term. | Changed to "قيمة key". |
| lessons/l-rf-1-1.ar.md | arabic | low | "حلّها" referred to a singular antecedent (تمرين). | Changed to "لا تتخطَّ هذه التمارين". |
| assessments.ar.yaml | arabic | low | "تُعاد تحميل الصفحة", "طول الاسم لا علاقة له" (incomplete), "بشكل عام" for a global install. | Changed to "يُعاد تحميل", "لا علاقة له بالمشكلة", "تثبيتًا عامًا (global)". |
| glossary.ar.json | arabic | low | The term "التحديث غير المُعدِّل" is unidiomatic. | Changed to "التحديث بلا تعديل مباشر (immutable update)". |

**Totals:** 27 issues. By category: accuracy 13, pedagogy 3, consistency 2, arabic 9. By severity: medium 4, low 23, high 0.

## Verified as correct (no change)

- The `npm create vite@latest … -- --template react` separator. The `react`, `react-ts`, `react-compiler` and `react-compiler-ts` templates exist. The template's `main.jsx` still uses `StrictMode` and `createRoot`.
- Node 20 end of life (April 2026); Vite 8 engines `^20.19.0 || >=22.12.0`.
- React 19: `ref` as a prop, `forwardRef` planned for deprecation, form actions resetting uncontrolled fields, the `useActionState` signature and return tuple, `useFormStatus` from `react-dom`, development-only props freezing, and returning `undefined` from a component being allowed.
- Tailwind v4: the `@tailwindcss/vite` plugin, `@import "tailwindcss"`, no config file needed, `aria-pressed:` and `dark:` variants, `@theme` tokens generating utilities, and the scanner missing interpolated class names.
- Vercel: the Vite preset (`vite build` → `dist`), preview deployments commented on the PR, the CLI with `vercel` and `vercel --prod`, `VITE_` values inlined into the bundle, and the SPA rewrite applying only when no file matches.
- Every React exercise uses only the documented helpers and React 19 globals. The playground iframe is sandboxed without `allow-same-origin`, so exercise 4-1's note that "the playground blocks storage" is accurate.

## Not fixed / could not verify

- **Exercise l-rf-3-5, task 1** ("remove the unnecessary Effect") isn't enforced. The `count-derived` check runs after the app settles, so a solution that keeps the Effect still passes it. The `title-*` checks make sure the starter fails, so the exercise is valid, but a learner could skip task 1. Enforcing it would need render instrumentation the harness doesn't offer.
- **Terminology for "render" in Arabic:** the noun stays as "render" and the verb mostly appears as "يرسم/رسم". This matches how Arab developers write and is applied fairly consistently, so I didn't normalise it.
- **Vite 7 in the PRD versus Vite 8 in practice:** the text now covers both, and nothing else in the course depends on the major version.
- **Form actions:** React resets uncontrolled fields after an action finishes, even when `useActionState` returns a validation error. The lesson doesn't mention this side effect. That's an omission, not an error, so I left it.

## Validation

- `node scripts/content/validate.mjs react-fundamentals`: 0 errors, 0 warnings
- `node scripts/content/check-exercises.mjs react-fundamentals`: 12 runnable exercises, 0 problems
