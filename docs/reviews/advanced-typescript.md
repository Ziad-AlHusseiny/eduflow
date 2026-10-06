# Review: Advanced TypeScript Patterns (`advanced-typescript`)

## Verdict

A strong, well-built course. The Cartwheel checkout type layer really does run from the first lesson to the last. Each lesson teaches one mechanism, names the trap and ends on an exercise whose type tests (`Expect<Equal<…>>` plus `@ts-expect-error`) check behaviour rather than one particular solution. I checked every type-level claim, every error message quoted in a code comment and every quiz and assessment answer against TypeScript 5.9.3 (the playground's compiler) using scratch files under `--strict`. That covered distribution and `never`, homomorphic mapped types on arrays, `-?` dropping `undefined`, `const` type parameters, `NoInfer`, `satisfies` contextual typing, the closure-narrowing rules, inferred type predicates, `${number}` matching, the instantiation-depth limits (non-tail recursion fails between 40 and 50 levels; tail recursion reaches 999), the `using` disposal order (also run natively in Node 24), standard decorator ordering, and the `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` behaviour. Almost all of it was right. I also checked the TypeScript 6.0 and 7.0 claims against typescriptlang.org and the TypeScript blog: `strict` is on by default from 6.0, `node10`, `classic`, `baseUrl` and `es5` are deprecated in 6.0 and removed in 7.0, 7.0 shipped on 8 July 2026 with no programmatic API and 8–12x faster builds, and 5.9's `tsc --init` turns on both extra strictness flags. All of those claims are correct. The real problems were these:

- **`using` support.** A lesson said `using` is "built into current browsers". Safari still does not support it, so it is not Baseline.
- **Arabic answer reversed.** One Arabic quiz option said the opposite of the English, turning "Nowhere" into "anywhere".
- **Wrong inference result.** One worked example gave the wrong inferred type, contradicting the lesson's own next section.
- **Wrong exercise hint.** A hint claimed `as const` was needed when `satisfies` alone keeps the literal.
- **Smaller fixes.** A few version and wording details were off.

The Arabic reads naturally on the whole. Most fixes there were calques, such as "bivariantly" rendered adverbially, «يمتدّ من» for `extends`, «أكياس» for "bags", and "operator" rendered as «معامل», which this course already uses for "parameter". «شحن» for software "shipping" was ambiguous in a store whose orders are being shipped, and bare «الخصم» for a card charge clashed with coupon "discount". All 53 unique further-reading URLs resolve. The validator and the exercise checker are both clean.

## Issues found and fixed

| File | Category | Severity | What was wrong | What I changed |
|---|---|---|---|---|
| lessons/l-at-5-2.{en,ar}.md | accuracy | high | Said `using` "is now built into current browsers and Node 24". Safari does not support explicit resource management (web-features: limited availability, blocked by Safari), so shipping the native syntax to browsers breaks Safari users | Stated real support (Node 24, Chrome/Edge 134+, Firefox 141+, no Safari, not Baseline) and told readers to let TypeScript or the bundler downlevel it and to polyfill `Symbol.dispose` |
| lessons/l-at-4-1.ar.md | consistency | high | Quiz option "Nowhere; brands should be created with `satisfies`" was translated as «في أي مكان» ("anywhere"), which reverses its meaning | «لا مكان لها؛ …» |
| lessons/l-at-2-2.{en,ar}.md | accuracy | medium | `same('processing', 'shipped')` with return type `T[]` was annotated `T = 'processing' \| 'shipped'`. TypeScript infers `string` (verified), because `T` is not returned at the top level, which is the rule the next section teaches. The figure repeated the wrong type | Fixed the code comment (`T = string, so string[]`), rewrote the paragraph to say the candidates are combined and then widened, and changed the figure's chosen T to `string` |
| exercises/l-at-1-5.{en,ar}.json | accuracy | medium | Hint and explanation said `as const` is needed on the currency table so `'EUR'` stays literal. `satisfies Record<Country, Currency>` alone keeps it (verified), as the lesson itself says | Hint now uses plain `satisfies` and notes that `as const` only adds readonly. Corrected the explanation to match |
| lessons/l-at-1-5.ar.md, l-at-2-4.ar.md, l-at-3-1.ar.md | arabic | medium | "Type operators" rendered as «معاملات», the course's word for parameters. In 2-4, "derive even more from a single source of truth" became «تشتقّ أكثر من مصدر حقيقة واحد» ("derive more than one source of truth") | «عوامل الأنواع (type operators)» and «العامل»; «كي تشتقّ المزيد من مصدر حقيقة واحد» |
| course.ar.json | arabic | medium | learnItem rendered "generic APIs" as «APIs عامة» (reads as general or public APIs). Section 5 and a learnItem used «شحن» (shipping parcels) for shipping software | «APIs من نوع generic»; «إيصال TypeScript إلى الإنتاج»; «اعتماد tsconfig صارم…» |
| lessons/l-at-1-4.{en,ar}.md | accuracy | low | Destructured-discriminant narrowing (`const { status } = order` narrows `order`) was dated TypeScript 4.6. It arrived in 4.4 (4.6 added narrowing of other destructured variables) | "Since TypeScript 4.4" |
| lessons/l-at-2-2.{en,ar}.md | accuracy | low | The mistake callout listed "give the later parameters defaults" as a fix for partial inference without saying that defaulted parameters are not inferred | Added "(they then take the default type, not an inferred one)" |
| lessons/l-at-1-2.{en,ar}.md | accuracy | low | The spread excess-property quiz option ("the spread object has an extra `notes` field") was ambiguous, and its why implied spread-in properties are checked. Only properties written directly in the literal are checked (verified) | Option now reads "where `Order` has no `notes` field". The why says `notes` is written directly and that fields arriving through `...order` are not checked |
| lessons/l-at-1-2.{en,ar}.md | accuracy | low | Figure `<title>` described arrows that the SVG does not draw | Replaced with "every value in an inner set also belongs to the sets around it" |
| lessons/l-at-1-5.{en,ar}.md | accuracy | low | Called the `erasableSyntaxOnly` flag a "type-stripping tool" | Reworded: type stripping rejects enums, and so does the flag |
| lessons/l-at-3-3.{en,ar}.md | accuracy | low | "This is how the lib defines `ReturnType`": the lib version constrains `F` and falls back to `any`, not `never` | "essentially how…", with the difference noted |
| lessons/l-at-3-4.{en,ar}.md | accuracy | low | Quiz why said `${number}` accepts strings that "round-trip" as numbers, but `'12.50'` does not round-trip. TypeScript also accepts `'0x1F'` and `' 12'` (verified) | "Any string that JavaScript parses as a number fits… (and even `'0x1F'`)" |
| lessons/l-at-5-1.{en,ar}.md | accuracy | low | `erasableSyntaxOnly` list omitted `import x = require()` and `export =` | Added them |
| exercises/l-at-5-1.{en,ar}.json | accuracy | low | Bug 2 did not say `formValue.coupon` is typed `string \| undefined`. `exactOptionalPropertyTypes` only catches it when the type includes `undefined` (verified) | Stated the type in the scenario |
| exercises/l-at-1-3.{en,ar}.json | pedagogy | low | "Fix them without using `!`" could be read as banning `!==`, which the intended fix needs | "the non-null assertion `!`" |
| lessons/l-at-1-1.ar.md | arabic | low | «مُنَمَّطًا» for "typed" is not a word developers use. «الشحن» for shipping code was confusing in a store context | «محدَّد النوع»; «الوصول إلى الإنتاج» |
| lessons/l-at-1-2.ar.md, exercises/l-at-1-2.ar.json | arabic | low | «تُفحص ثنائيَّ التغاير» is an ungrammatical adverbial calque of "bivariantly" | «تُفحص فحصًا ثنائي التغاير (bivariant)» |
| lessons/l-at-1-3.ar.md | arabic | low | «الصدقية» (truthiness) used without a gloss. Feminine agreement was wrong after the subject changed. A relative clause was missing («…`const`، لا يمكن أن يتغيّر») | Added «(truthiness)», fixed the agreement, added «وهو» |
| lessons/l-at-1-4.ar.md | arabic | low | «التجئ» is not the imperative of لجأ. «أكياس الحقول الاختيارية» calqued "bags of optionals" | «الجأ»; «الأنواع المكدَّسة بالحقول الاختيارية»; «حالات لا يمكن أن تقع في عملك» |
| exercises/l-at-3-2.ar.json | arabic | low | «مفاتيح الأرقام والرموز» for number and symbol keys reads as digits and symbols | «مفاتيح `number` و`symbol`» |
| lessons/l-at-3-3.ar.md | arabic | low | Three calques: «تكرّر» for "loop" (means repeat), «يبسطه» for the rest spread, «يمتدّ من unknown» for `extends` | «تمرّ على المفاتيح»; «ينشره معامل البقية (rest parameter)»; «قابل للإسناد إلى `unknown`» |
| lessons/l-at-4-1.ar.md | arabic | low | «دزينة» (loanword), verb agreement, and «يقاطع نوعًا أوليًا مع» for "intersects" | «نحو اثني عشر وسمًا… يلتقط»; «تقاطع (intersection) بين نوع أولي وخاصية» |
| lessons/l-at-4-2.ar.md | arabic | low | «المقابل الخطئي» was awkward. "Stack trace" was rendered «مسار الاستدعاء» | Rephrased; kept «الـ stack trace» as developers write it |
| exercises/l-at-4-3.ar.json | arabic | low | «والـ predicateان» is an Arabic dual suffix glued onto an English word | «والـ predicates الاثنان» |
| lessons/l-at-4-4.ar.md | arabic | low | Two plurals of "builders" in one lesson («بنّاؤون» and «بنّاءات»). «شحن» for shipping code | «بنّاؤو الاستعلامات»; «إيصال كل هذا إلى الإنتاج» |
| exercises/l-at-5-2.ar.json, assessments.ar.yaml | arabic | low | Bare «الخصم» for a card charge is ambiguous with the coupon "discount" used elsewhere in the course | «الخصم من البطاقة» / «استدعاء `charge`» |
| lessons/l-at-5-3.ar.md | arabic | low | «تشحنه» and «يُشحن إليها» for shipping code | «تضمّنه»; «يعمل عليها» |
| lessons/l-at-5-4.ar.md, exercises/l-at-5-4.ar.json, lessons/l-at-3-5.ar.md | arabic | low | «الشحن» / «يُشحن» for releasing software. Quiz option «تعليقات `any`» could be read as code comments, right after an option about comments | «نشر التحديثات» / «يُنشر» / «اعتماد»; «تعليقات نوعية بـ `any`» |
| assessments.ar.yaml | arabic | low | «الخصائص المنطقية» for boolean properties is unclear | «الخصائص من نوع boolean» |
| glossary.ar.json | arabic | low | `satisfies` called «معامل» (parameter). Branded type «مقاطَع مع». «interfaceين» glued an Arabic dual onto an English word | «عامل (operator)»; «تقاطع (intersection) بين…»; «تصريحَي interface» |

## Verified and left unchanged (selected)

- Every quoted compiler error (TS2367, TS2561, TS2353, TS2322 chains, TS18047, TS18046, TS2366, TS2589, TS2590, TS2713, TS7053, TS2769, TS2775, TS2558, TS2554, TS2678, TS1484, TS2375).
- `keyof Record<string, number>` is `string`, while `keyof { [k: string]: number }` is `string | number`. The lesson's distinction is right.
- Readonly properties also lose narrowing inside callbacks ("properties never do").
- The checkout `Result` composition, including the claim that a forgotten error type in a new step fails to compile.
- All checkpoint and final-assessment answers, each reproduced in a scratch file.
- TypeScript 6.0 and 7.0 facts against the 6.0 release notes, the 7.0 announcement (8 July 2026) and the 5.9 release notes.

## Could not fix or verify

- The playground still runs TypeScript 5.9 with the ES2022 lib, while 7.0 is the current release. The course handles this honestly (shims for `Symbol.dispose` and `findLast`, "TypeScript 5.9" named where it matters). Moving the playground to a newer compiler is a platform change outside this folder.
- The first-person anecdotes (the refund bug, "the 400,000-line migration I led") are persona framing that I cannot verify. They are plausible and used consistently.
- TypeScript 7.1's future API is not mentioned, and the lesson only says 7.0 "does not yet ship a programmatic API", which matches the announcement.
