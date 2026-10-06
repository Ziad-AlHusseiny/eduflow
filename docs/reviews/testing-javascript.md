# Review: testing-javascript

## Verdict

A strong, coherent course. Splitwise-lite carries the learner from a ten-line home-made runner through behaviour tests, boundaries, async, test doubles, DOM and React tests, Playwright, TDD, coverage, mutation testing and CI, and every test-mode exercise is a genuine "catch the realistic bug" task. Mutants are plausible slips (`<` vs `<=`, floor vs round, a forgotten `return`/`await`, swapped arguments, snake_case leaking) and each one is killed by the reference suite. I verified the version-sensitive claims against the official docs: Vitest 4 (unawaited `resolves`/`rejects` now fail the test; coverage only lists loaded files unless `coverage.include` is set; default include glob; `CI` disables watch mode and `.only`; fake timers; `test.each` `%s`/`$field`), Testing Library (query priority, `getBy`/`queryBy`/`findBy` semantics, 1000 ms/50 ms defaults, user-event sequences, RTL auto-cleanup only with globals), Playwright (actionability checks, 5 s web-first timeout, strict mode, fixtures with teardown after `use`, setup projects, `page.clock`, `--repeat-each`, `--fail-on-flaky-tests`, sharding and blob reports) and StrykerJS (packages, config keys, statuses, `MinToMax` method mutator, `// Stryker disable next-line` syntax). No high-severity errors were found. The fixes were a handful of overstated or slightly wrong technical claims (the `toBeCloseTo` "temptation" that would not actually pass, RTL cleanup, trace recording), two exercise texts that contradicted their own starters, and a round of Arabic polish, most importantly one consistent, correct rendering of "accessible name". Ids, answer positions and structure are unchanged.

## Issues found and fixed

| File | Category | Severity | What was wrong | What changed |
|---|---|---|---|---|
| lessons/l-tj-1-3.{en,ar}.md | accuracy | medium | Mistake callout and quiz distractor said the tempting fix was `toBeCloseTo(29, 0)` / `toBeCloseTo(29)`; neither passes for 28 vs 29 (threshold 0.5 / 0.005), so the "temptation" was technically false | Rewrote as changing the expectation to 28 / rounding inside the test (EN+AR) |
| exercises/l-tj-2-3.{en,ar}.json | accuracy | medium | Explanation said the retries-everything bug is "invisible to the rejection assertion" then that it "fails the rejects assertion too"; hint 3 said call count is "the only way" to catch it, which is false with this stub | Rewrote both to explain when the rejection alone is blind (stub fails every time) and why the call count pins the rule regardless |
| lessons/l-tj-3-1.{en,ar}.md | accuracy | medium | Said React Testing Library "does this cleanup for you", but its auto-cleanup only runs when a global afterEach exists (Vitest `globals: true`), as lesson 3-4 correctly states | Softened to "can do this cleanup for you; lesson four shows when" |
| lessons/l-tj-3-1.ar.md, l-tj-3-2.ar.md, glossary.ar.json, assessments.ar.yaml, exercises/l-tj-4-1.ar.json | arabic | medium | "accessible name" rendered "الاسم المتاح" (literally "the available name"), which misstates the concept | "الاسم القابل للوصول" everywhere (one rendering course-wide) |
| lessons/l-tj-2-3.ar.md | consistency | medium | "a dozen lines" rendered as "عشرات الأسطر" (dozens of lines); "promise" rendered once as "وعدًا" against the course-wide "promise" | "نحو اثني عشر سطرًا"; "promise" |
| lessons/l-tj-3-1.{en,ar}.md | consistency | medium | EN said the playground stand-ins are "a dozen lines" (they are ~40; AR said "dozens") and implied they match `screen.*`, while they take the container as first argument | Both now say about forty lines and explain they mirror the non-`screen` exports of @testing-library/dom (`getByRole(container, 'list')`) |
| exercises/l-tj-5-3.{en,ar}.json | consistency | medium | Prompt said Stryker's report lists four survivors, but the starter comment (correctly) shows three from Stryker plus one from code review; explanation said Math.max survived because "the only multi-step input had equal amounts", but the starter has no multi-step input | Prompt now separates the three Stryker survivors from the code-review bug; explanation says every test had debtor = creditor amounts so min and max agreed |
| exercises/l-tj-1-1.{en,ar}.json | accuracy | low | Hint 3 nested backticks inside single-backtick inline code (`console.log(`PASS ${name}`)`) break Markdown rendering | Switched to double-backtick inline code spans |
| exercises/l-tj-2-4.{en,ar}.json | accuracy | low | Explanation called -100/-99 "the only pair that tells < from <=" — -100 alone does that | Reworded: one input on each side, -100 (on the limit) is the discriminating one |
| exercises/l-tj-3-1.{en,ar}.json | accuracy | low | Explanation suggested rendering balances as "a <table> with role=list items" (semantically muddled) | "a <div role=list> with role=listitem rows" |
| lessons/l-tj-3-4.{en,ar}.md | accuracy | low | Browser Mode described as running "through Playwright"; Playwright is one of several providers (webdriverio, preview) | "driven by a provider such as Playwright" |
| lessons/l-tj-4-3.{en,ar}.md | accuracy | low | First-person anecdote named a real company ("At Trellis we once had…") | "At a previous job…" (no real organisation named) |
| lessons/l-tj-4-3.{en,ar}.md | accuracy | low | Said `trace: 'on-first-retry'` records a trace "whenever it retries"; it records only on the first retry | "on the first retry of a failed test" |
| lessons/l-tj-5-1.{en,ar}.md | accuracy | low | Listed "a typo in `test.skip`" as a way a test never runs (not a meaningful failure mode) | "a `.skip` left in place"; "never actually check anything" |
| assessments.{en,ar}.yaml (s-tj-2 test.each question) | accuracy | low | Distractor's why claimed `%s` on object rows prints "[object Object]"; Vitest formats objects for `%s`, so the explanation was unreliable | Why now explains that `$total`/`$people` read the row properties, so the real values appear |
| lessons/l-tj-1-3.ar.md | arabic | low | "يقوم matcher‏ان (أداتا مطابقة)" — hybrid dual with a hidden RLM, awkward | "يقوم اثنان من الـ matchers (أدوات المطابقة)" |
| lessons/l-tj-2-1.ar.md | arabic | low | Calques: "أن يقود الذيلُ الكلب" (tail wagging the dog) and "وما يكفي منها يعلّم" (enough of them teach) | "قلبٌ للأولويات: الاختبار يخدم الكود لا العكس" / "وتراكمها يعلّم" |
| exercises/l-tj-2-2.ar.json | arabic | low | Number agreement "1205 سنتات" (numbers above 10 take a singular tamyiz) | "1205 سنتًا" (prompt + check label) |
| assessments.ar.yaml, exercises/l-tj-5-3.ar.json, lessons/l-tj-5-2.ar.md, lessons/l-tj-5-3.ar.md | arabic | low | Hybrid dual forms glued with hidden RLM characters ("matcher‏ين", "mutant‏ين", "mutant‏ان") and stray RLMs before Latin text | Rewrote as "هذين الـ matchers" / "اثنين من الـ mutants" / "الـ mutants الاثنان"; removed stray RLMs |
| lessons/l-tj-2-4.ar.md | arabic | low | "مؤلم الاختبار بالوقت الحقيقي" ungrammatical construct | "اختباره بالوقت الحقيقي مؤلم" |
| lessons/l-tj-3-1.ar.md | arabic | low | "لكل query ثلاث نكهات" mixed the English term into a sentence that otherwise uses استعلام | "لكل استعلام" |
| lessons/l-tj-3-3.ar.md | arabic | low | Heading "The wrong way: sleeping" rendered literally as "النوم" | "الانتظار الثابت (sleep)" |
| lessons/l-tj-4-2.ar.md | arabic | low | Summary "توجيه موجّه" (targeted routing) is a tautology | "توجيه انتقائي" |
| lessons/l-tj-4-3.ar.md | arabic | low | Broken emphasis "كود*ك*" (asterisks inside a word don't render in Arabic), "جرس إنذار للدخان" calque, "صفحة غير المتوقّعة" ungrammatical | "كودك *أنت*", "كاشف دخان", "صفحة غير التي توقّعتها" |
| lessons/l-tj-5-1.ar.md | arabic | low | "turn" and "cycle" both rendered دورة (the TDD cycle vs each red-green turn), confusing; "always truthy" rendered "صحيحة" (reads as "correct") | Turns are now "الجولة 1…4"; "قيمته truthy دائمًا" |
| lessons/l-tj-5-2.ar.md | arabic | low | "أصرم" (non-standard comparative) and "أقرب إلى الفعل" (calque of "more actionable") | "أكثر صرامة"; "أنفع عمليًا" |
| course.ar.json | arabic | low | Lesson title "الـ Coverage وحدوده" uses masculine agreement while the course treats coverage as feminine everywhere else | "الـ Coverage وحدودها" |
| assessments.ar.yaml | arabic | low | "تقنّع التصادم" (unidiomatic for "mask") | "تحجب التصادم" |
| exercises/l-tj-2-4.json | pedagogy | low | Starter/solution restored the console.warn spy with `warn.mockRestore()` while the lesson teaches `vi.restoreAllMocks()` in `afterEach` (now supported by the playground) | Switched starter and solution to `vi.restoreAllMocks()` |
| assessments.en.yaml | pedagogy | low | "can not" used seven times (house style and standard English: "cannot") | Replaced with "cannot" |

## Playground API

The playground now supports `mockImplementationOnce`, `mockRejectedValueOnce`, `vi.restoreAllMocks` and `vi.clearAllMocks`. The only exercise that worked around them was l-tj-2-4, which restored its `console.warn` spy by hand; it now uses `vi.restoreAllMocks()` in `afterEach`, matching the lesson. The other exercises already read naturally (l-tj-3-3's "reject, then switch the mock to resolve before clicking Try again" mirrors the lesson text), so I left them alone.

## Could not fix or verify

- `vitest.dev` was unreachable from the review sandbox (all requests timed out). I confirmed that every linked Vitest page exists in the `vitest-dev/vitest` repo's `docs/` tree (api/expect, api/mock, api/test, api/vi, config/coverage, config/testtimeout, guide/coverage, guide/environment, guide/filtering, guide/mocking, guide/mocking/requests, guide/mocking/timers, guide/why, guide/reporters) and checked their content with context7, but I couldn't load the live URLs or their `#anchors`. Every Playwright, Testing Library, MDN, GitHub and GitHub Docs link returned 200.
- Lesson 5-4's workflow pins `actions/checkout@v6`, `actions/setup-node@v6` and `actions/upload-artifact@v4`. These were valid at the time of review; `upload-artifact` has newer majors, but v4 still works, so I left it as is.
- The Arabic renders CSS classes as "الأصناف". This is consistent across the course and acceptable MSA, so I kept it rather than churn a dozen files.

## Verification

- `node scripts/content/validate.mjs testing-javascript`: 0 errors, 0 warnings.
- `node scripts/content/check-exercises.mjs testing-javascript`: 14 runnable exercises, 0 problems (every solution passes and every starter fails).
