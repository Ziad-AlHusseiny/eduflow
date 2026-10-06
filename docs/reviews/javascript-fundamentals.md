# Review: JavaScript Fundamentals (`javascript-fundamentals`)

## Verdict

A strong beginner course. It has one running project (Pocket), explains what the engine does before naming each idea, and covers the right traps for 2026: floating-point money, `+` joining strings, `==` coercion, TDZ, `var` in loops, closures, `sort` without a comparator and its mutation, `??` versus `||`, `textContent` versus `innerHTML`, `fetch` resolving on a 404, microtasks before tasks, and the lost `this`. I checked every runnable sample and every tricky claim in Node 22 or against the spec. The code is correct almost everywhere. I found no high-severity errors.

The real problems were:

- **Four explanations that were confidently wrong:**
  - the `var` distractor in the scope quiz
  - the claim that Enter "skips" a click handler
  - an event-listener `this` quiz that gave the wrong error
  - a misquoted `reduce` error message
- **A storage API that changed between lessons.** Lesson 4-4 had `loadExpenses()` and 5-4 had `loadExpenses(localStorage)`.
- **Three exercises that still carried sandbox workarounds.** The playground no longer needs them.

The Arabic is natural, consistent MSA. It had a handful of agreement slips. It also had one misleading term: "الدمج الصفري" for *nullish*, which suggests "zero", the very value `??` keeps.

## Issues found and fixed

| File | Category | Severity | What was wrong | What I changed |
|---|---|---|---|---|
| lessons/l-js-2-4.{en,ar}.md | accuracy | medium | Quiz 1 `why` said `var` would make `check(500)` log `undefined`. With `var` and 500 the `if` runs, so it would log `big`. | Rewrote the `why`: `undefined` only when the `if` is skipped (`check(50)`), and `var` with 500 gives `big`. With `const`, using the name outside its block is an error. |
| lessons/l-js-4-3.{en,ar}.md | accuracy | medium | Quiz 1's correct option and takeaway 1 said pressing Enter "skips your code" when you listen for `click`. In fact, implicit submission fires `click` on the default button. The real problem is that the native submit still happens, and other submission paths (`requestSubmit`, assistive tech, forms without a submit button) are not covered. | Rewrote the correct option, its `why`, the second option's `why` and takeaway 1 to state this accurately. |
| lessons/l-js-5-2.{en,ar}.md | accuracy | medium | Quiz 2 said `addEventListener("click", store.clear)` throws "Cannot read properties of undefined". The browser calls listeners with `this` set to the element, so with private fields the error is about `#expenses` "from an object whose class did not declare it". | Fixed the question text, and added to the `why` that `this` is the button. |
| exercises/l-js-5-1.{en,ar}.json | accuracy | medium | The spot-bug prompt said the page is served "from a dev server". A dev server such as Vite resolves the extensionless `./money` import, yet line 10 is marked as a bug. | The prompt now says "a plain static file server (no build tool such as Vite)", which matches the hint and the explanation. |
| lessons/l-js-3-3.{en,ar}.md | accuracy | low | The mistake callout said a missing `return totals` throws "Cannot set properties of undefined". With the lesson's code, the right-hand side reads `totals[e.category]` first, so V8 throws "Cannot read properties of undefined". I verified this in Node. | Corrected the message. |
| assessments.{en,ar}.yaml (final, `totalsByCategory`) | accuracy | low | Same wrong error message. | "Cannot read properties of undefined". |
| lessons/l-js-2-1.{en,ar}.md | accuracy | low | "Most editors warn about `if (x = …)`" is not true of a default editor setup. | Now credits linters such as ESLint. |
| lessons/l-js-5-1.{en,ar}.md | accuracy | low | The Node ESM rule omitted that current Node.js also detects `import` syntax in plain `.js` files. | Added a one-sentence aside recommending an explicit `"type"`. |
| lessons/l-js-4-5.{en,ar}.md | accuracy | low | The `Promise.all` snippet uses top-level `await` without saying where it may appear. | Added "(inside an `async` function, like every `await`)". |
| lessons/l-js-1-1.{en,ar}.md | accuracy | low | "Each line ending in a semicolon is a statement" defines statements by their semicolon. | "Each of these lines is a statement, usually ended with a semicolon." |
| lessons/l-js-3-1.{en,ar}.md | pedagogy | low | "Three methods answer search questions", followed by four (`find`, `findIndex`, `some`, `every`). | "Four methods…". |
| exercises/l-js-4-3.json + text files | pedagogy | medium | The starter and solution HTML carried a 10-line "playground helper" script that faked submit events. The prompt told learners to leave it in. The sandbox now allows forms and the harness blocks navigation. | Removed the script and the prompt note. Rewrote the `prevents-default` check: it listens on `document` and reads `event.defaultPrevented` during a real submit. I probed it: the solution passes, and the solution minus `preventDefault()` fails only that check. |
| exercises/l-js-4-4.json + text files | pedagogy | medium | The exercise used a `storage` parameter and a `createMemoryStorage` stand-in "because the sandbox blocks localStorage". That is no longer true, and it did not match the lesson's `saveExpenses(expenses)` / `loadExpenses()`. | The exercise now uses the real `localStorage` with the lesson's exact signatures. Checks `localStorage.clear()` before each case. I updated the prompt and explanation (EN/AR). The starter still fails all 5 checks. |
| exercises/l-js-5-4.json | pedagogy | medium | It still had the submit helper script and a memory-storage stand-in. | Removed both. Real `localStorage` is seeded once with the three sample expenses, and the comment explains why. Checks read `localStorage`. The solution passes and the starter fails 4 of 5 checks. |
| lessons/l-js-5-4.{en,ar}.md | consistency | medium | `loadExpenses(localStorage)` / `saveExpenses(localStorage, …)` contradicted lesson 4-4's API and lesson 5-1's "storage.js is the only file that knows about localStorage". | Changed to `loadExpenses()` and `saveExpenses(state.expenses)`. |
| exercises/l-js-2-4.{en,ar}.json | pedagogy | low | Hint 2 names the parameter `cents`, but hint 3 used `spentCents`. | Hint 3 now says `remaining -= cents`. |
| glossary.ar.json, lessons/l-js-3-4.ar.md | arabic | medium | "الدمج الصفري" for *nullish coalescing* reads as "zero coalescing", the exact misconception the lesson fights. | Uses the term "nullish coalescing" in Latin script, with a gloss on first use ("البديل عند غياب القيمة"). |
| lessons/l-js-1-1.ar.md | arabic | low | "تُعاد تحميل الصفحة" (agreement). "تعليمة بتسجيل نصّ" was awkward. "هذه الدورة" for *loop* clashes with "course". | يُعاد تحميل؛ تعليمةً تطلب طباعة نصّ؛ هذه الحلقة. |
| lessons/l-js-4-3.ar.md, assessments.ar.yaml | arabic | low | "تُعاد تحميل" ×2 and "تُعاد عرض" (agreement). | يُعاد تحميل / يُعاد عرض. |
| exercises/l-js-1-2.ar.json, lessons/l-js-3-1.ar.md (×2), lessons/l-js-3-2.ar.md | arabic | low | "من نوع `const`" presents `const` as a type. | "مُصرَّح به/بها بـ `const`". |
| lessons/l-js-1-2.ar.md | arabic | low | "و`let` تُنشئ اسمًا يمكن ذلك" was ungrammatical. | "…اسمًا يمكن توجيهه". |
| lessons/l-js-2-3.ar.md, lessons/l-js-5-2.ar.md | arabic | low | "عشرات" (tens) for "a dozen". | "أماكن كثيرة" / "نحو اثنتي عشرة دالة". |
| lessons/l-js-3-2.ar.md | arabic | low | "تُتشارك عبر المرجع" was an awkward passive. | "تُتداوَل عبر المرجع". |
| lessons/l-js-5-4.ar.md | arabic | low | "أن يتناقضوا" (human plural for things). "آخر تغييرات". | أن تتناقض؛ آخر تغيير. |
| lessons/l-js-5-5.ar.md | arabic | low | "تطبيق اختبارات" for *quiz app* collides with "tests". | "تطبيق مسابقات (quiz)". |
| assessments.ar.yaml | arabic | low | "`||` ترمي الصفر" used "throw" for "discard", in a course where ترمي means throws an error. "لا يُرجع `return totals`" was redundant. | "تتخلّص من الصفر"; "ليس فيه `return totals`". |
| glossary.ar.json, course.ar.json | arabic | low | The *type* definition opened with "صنف" (the course's word for class). "مجاميع تتحدّث" means "totals that speak". | "طبيعة القيمة"; "تُحدَّث تلقائيًا". |

**Totals: 27 issues.** By category: accuracy 10, pedagogy 5, consistency 1, Arabic 11. By severity: high 0, medium 9, low 18.

## Verified and left as is

- **Runnable code.** Every `js run` block and every quiz output I could compute, checked in Node:
  - the `4.1 + 12.2 + 2.7` result and `4.1 * 100`
  - the `[450, 1220, 99].sort()` and `[5, 25, 100].sort()` results
  - `localeCompare` order
  - the `JSON.stringify` of Date, Set and `NaN`
  - `450 * 0.86` rounding
  - the `forEach(store.add)` error text
  - the event-loop orders (A D C B; B D C A)
- **APIs and dates.** `Object.groupBy` (ES2024), `toSorted` (ES2023), Set `union`/`intersection` (available in current browsers), `structuredClone`, and `crypto.randomUUID()` on secure contexts are all current and correctly described.
- **Exercise checks.** All are behavioural and accept any correct solution. Every starter fails at least one check.

## Not changed or not fully verifiable

- **"Eight falsy values"** (l-js-2-1, glossary, one checkpoint) leaves out the legacy `document.all` host quirk. I kept the standard teaching list on purpose.
- **"أصناف" means both CSS classes (4-1) and JS classes (5-2) in Arabic.** English uses one word for both too. Changing it would ripple through many files, so I left it.
- **Three exercises depend on the playground harness.** 4-3, 4-4 and 5-4 now rely on two harness behaviours: the window-level `submit` `preventDefault()` (it stops navigation and runs after the learner's handler), and fresh in-memory `localStorage` on every run. Both are in `src/lib/playground/harness.js` and in the Chromium checker. If the harness changes, re-run the checker.
- **Lesson snippets marked `title=…` and not `run`** (DOM, `fetch`, modules) are not executed by the validator. I reviewed them by hand.

## Final status

- `node scripts/content/validate.mjs javascript-fundamentals`: 0 errors, 0 warnings.
- `node scripts/content/check-exercises.mjs javascript-fundamentals`: 20 runnable exercises, 0 problems.
