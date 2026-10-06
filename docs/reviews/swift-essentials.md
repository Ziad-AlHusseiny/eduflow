# Review: swift-essentials

## Verdict

This is a strong, coherent course. The 15 lessons build one app, Pocket Budget, from a playground of `let`s to a SwiftData app with Swift Testing tests on TestFlight. Each lesson teaches one idea with a running example and names the common mistake. The content is current for Swift 6.2/6.3, Xcode 26 and iOS 17+: `@Observable`, `@Bindable`, value-based `NavigationStack`, typed throws, Default Actor Isolation, Approachable Concurrency and `@concurrent`, SwiftData `@Query`, and Swift Testing. I compiled every non-trivial sample with the local toolchain (Swift 6.3.1, `-swift-version 6`). SwiftUI and SwiftData code was typechecked against the iPhoneSimulator 26.4 SDK and run through SIL diagnostics, so region-based isolation errors would show up. I tried both the default isolation and `-default-isolation MainActor`. I also ran the lesson 4-4 tests with `swift test`. Every spot-bug exercise flags exactly the line the compiler rejects, and the quoted error messages match the compiler's output word for word. Two samples would not compile as written: a test called a `remaining` property that `CategoryBudget` doesn't have, and the `@concurrent` decoding tip fails under main-actor default isolation without `nonisolated`. The other findings were imprecisions (`some` in return position, `Decimal` float literals, `remove(atOffsets:)` needing SwiftUI, SwiftData renames) and a few Arabic phrases where "throw away" became "throw", "pushed" became "paid", or "concurrent" became "synchronous". IDs, answer positions, minutes and structure are unchanged.

## Issues found and fixed

| File | Category | Severity | What was wrong | What changed |
|---|---|---|---|---|
| lessons/l-sw-4-4.en/.ar.md | accuracy | high | The first Swift Testing sample used `#expect(food.remaining == 235.8)`, but `CategoryBudget` (lesson 2-4) has no `remaining` property, so the test target wouldn't compile. | Now `#expect(food.limit - food.spent == 235.8)`. Verified with `swift test`: all 4 tests pass. |
| lessons/l-sw-4-2.en/.ar.md | accuracy | high | The tip said that under main-actor default isolation you just "mark the decoding function `@concurrent`". Compiling shows `main actor-isolated conformance of 'RatesResponse' to 'Decodable' cannot be used in nonisolated context` (Swift 6.2 isolated conformances). | The tip now says to move decoding into an `async @concurrent` function and declare `nonisolated struct RatesResponse`, and explains why. Verified to compile. |
| lessons/l-sw-2-3.en/.ar.md | accuracy | medium | It said `some Protocol` is always "chosen by the caller" and that `var body: some View` is "the same idea". In return position the implementation picks the type, not the caller. | The takeaway is scoped to parameters, and the body text explains that the roles flip in return position. |
| lessons/l-sw-1-1.en/.ar.md | accuracy | medium | It presented `Decimal` as exact without saying that a fractional literal goes through `Double` first (`let x: Decimal = 0.07` gives `0.07000000000000001024`; verified). | Added a paragraph: short literals like `4.5` or `12.99` come through clean, and amounts that matter should use `Decimal(string:)` or whole cents. |
| lessons/l-sw-3-3.en/.ar.md | accuracy | medium | It said the store's `delete(at:)` is one line, `expenses.remove(atOffsets:)`, but `BudgetStore.swift` only imports Observation and Foundation. `remove(atOffsets:)` lives in SwiftUI (verified: it doesn't compile with Foundation alone). | It now notes that the file needs `import SwiftUI`. |
| lessons/l-sw-4-3.en/.ar.md | accuracy | medium | "Renames and type changes need a versioned schema." A rename can be handled with `@Attribute(originalName:)`. | Now says a rename needs `@Attribute(originalName:)`, and a type change needs a versioned schema and a migration plan. |
| lessons/l-sw-2-1.en/.ar.md | accuracy | low | "SwiftUI's `@Observable`". The macro comes from the Observation framework. | Now "The Observation framework's `@Observable`". |
| lessons/l-sw-2-1.en/.ar.md | accuracy | low | "Structs can't form these cycles" overstates it: a struct that holds a class can be part of a cycle. | Now "A struct on its own can't form these cycles". |
| lessons/l-sw-1-3.en/.ar.md | accuracy | low | The diagram footer said "No gaps and no overlaps: the compiler accepts the switch". The compiler never checks range coverage for `Int`; it accepts the switch because of `default`. | Footer now: "The ranges never overlap; default catches every other Int". |
| lessons/l-sw-1-3.en/.ar.md | pedagogy | low | `print(amounts.first)` gives a compiler warning (implicit coercion to `Any`), and the `where` example used a limit of 0, which made little sense. | Now `print(amounts.first as Any)`, matching lesson 1-2, and the limit is 10. |
| lessons/l-sw-3-1.en/.ar.md | accuracy | low | The tap-area mistake said only the text responds when `.onTapGesture` comes before `.padding()`, which is imprecise. | It now says the padding wraps the tappable view from outside, says to move the gesture after the padding, and mentions `.contentShape(Rectangle())` for empty areas. |
| lessons/l-sw-1-2.en/.ar.md | accuracy | low | A quiz `why` said that "only exists inside `else`" is "`if let`'s scoping". `if let` binds in its braces, not in `else`. | It now explains that nothing is bound inside `else` because the value is missing. |
| lessons/l-sw-3-2.en/.ar.md | pedagogy | low | `ExpensesScreen(store: store)` appeared right after an `ExpensesScreen` that had no `store` property. | Added a code comment saying `ExpensesScreen` now has `let store: BudgetStore`. |
| lessons/l-sw-4-4.en/.ar.md | consistency | low | "You've built Pocket Budget across fifteen lessons", but this is the fifteenth lesson. | Changed to "over fourteen lessons". |
| assessments.en.yaml | pedagogy | low | "matching falls through to the next case" is confusing in a course that teaches Swift has no fall-through. | Now "moves on to". The Arabic was already correct. |
| lessons/l-sw-4-1.ar.md | arabic | medium | "concurrent code" was rendered as "الكود المتزامن", which reads as *synchronous*. "Fetch concurrently" was "بالتزامن". The heading "compiler الـ Swift 6" was awkward. | Now "الكود الذي يعمل بالتوازي", "بالتوازي", and "## سباقات البيانات والـ compiler في Swift 6". |
| lessons/l-sw-2-4.ar.md, assessments.ar.yaml | arabic | medium | "throws away the reason" became "ترمي السبب" or "رمت `try?` الخطأ". In a lesson about `throw`, this says the opposite of what `try?` does. | Now "تتخلّص من"، "أهدرت". |
| lessons/l-sw-3-3.ar.md, assessments.ar.yaml | arabic | low | "pushed screen" was "مدفوعة", which in a budget app reads as "paid". | Now "عبر push" (diagram) and "شاشة دُفعت إلى مكدّس التنقّل". |
| lessons/l-sw-2-2.ar.md | arabic | low | Calques: "يُبقيك صادقًا" (keep you honest) and "حساء القيم المنطقية" (boolean soup). | Now "يتولّى تذكيرك بكل حالة تنساها" and "فوضى القيم المنطقية". |
| lessons/l-sw-4-2.ar.md | arabic | low | "ترمّز القيم ترميز النسبة المئوية" is a literal translation of "percent-encodes". | Now "تطبّق الـ percent-encoding على القيم". |
| lessons/l-sw-1-3.ar.md, l-sw-3-2.ar.md | arabic | low | "لتجميع المجاميع" (redundant) and "مراسم أقل" (calque of "less ceremony"). | Now "لحساب المجاميع التراكمية" and "كود تمهيدي أقل". |
| assessments.ar.yaml | arabic | low | "classes لغة Objective-C" was ungrammatical. | Now "الـ classes في Objective-C". |
| exercises/l-sw-4-1.ar.json | arabic | low | "يرفض compiler الـ Swift 6" was awkward. | Now "يرفض الـ compiler في Swift 6". |
| glossary.ar.json | arabic | low | The TestFlight definition repeated "تصل إلى ما يصل إلى". | Rephrased with "كحدّ أقصى". |

## Verified and left as is

- Every spot-bug `bugLines` matches the compiler's actual error line: 1-2 line 4 (runtime crash on `Decimal(string: "")` → nil, verified), 2-3 line 12, 3-2 line 5 (the error appears at the `toggle()` call, and the prompt says so), and 4-1 line 11 (`SendingClosureRisksDataRace` under default isolation, and the main-actor error under `-default-isolation MainActor`; both texts are quoted correctly).
- Predict-the-output exercises 1-3, 2-1 and 2-4 were executed. The outputs match the marked answers, including `Rejected: emptyTitle` while the `LocalizedError` extension is present.
- Typed throws: `do throws(BudgetError)` and the plain `do` inference both compile, and the plain `do` infers `BudgetError` in Swift 6.3, as the lesson says.
- `TextField(value:format: .currency(code:))` parses "12,50" in `de_DE` as 12.5 (verified), so the quiz claim holds.
- The TestFlight figures (100 internal, 10,000 external, 90 days) and the Xcode 26 Default Actor Isolation and Approachable Concurrency claims are current.

## Not fixed or not verifiable

- The fill exercise in l-sw-4-4 puts the `#` of `#require` and `#expect` inside the blanks, while `@Test` keeps its `@` outside. That's slightly inconsistent, but the hints make it clear, so I left the template unchanged.
- I couldn't check the claim that SwiftData `#Predicate` filtering on enum properties "has historically been unreliable" against a 2026 source. The wording is already hedged and the advice is safe, so I left it.
- Previews, `.refreshable`, sheets and the TestFlight steps were checked by typechecking and against the docs, not by running them in a simulator.

Validator: `node scripts/content/validate.mjs swift-essentials` gives 0 errors and 0 warnings. Exercise checker: 0 runnable exercises and 0 problems. All exercises in this course are guided ones.
