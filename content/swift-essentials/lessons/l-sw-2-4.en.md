---
summary: Describe failures as error enums, throw and propagate them with try, handle them with do-catch, and decide when Swift 6 typed throws are worth it.
takeaways:
  - Model the ways an operation can fail as an enum that conforms to `Error`, with associated values for the details.
  - Every call to a throwing function is marked with `try`, so readers can see exactly where control might jump out.
  - "`do`-`catch` handles errors; `catch` clauses can pattern-match specific cases, and a final `catch` gets the rest as `error`."
  - "`try?` turns failure into `nil` and throws away the reason, so use it only when the reason truly doesn't matter."
  - Typed throws (`throws(BudgetError)`) fit code where callers handle every case; untyped `throws` stays the better default for public APIs.
further:
  - title: Error Handling
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling/
  - title: LocalizedError
    url: https://developer.apple.com/documentation/foundation/localizederror
quiz:
  - q: "`func record(...) throws`. What does `let result = try? budget.record(title: \"Tea\", amount: 3)` give you when it fails?"
    options:
      - text: The error, stored in `result`.
        why: "`try?` discards the error entirely; you only learn that something failed."
      - text: "`nil`, and the reason is lost."
        why: Correct. That's the trade-off with `try?`, and why it suits only failures you'd ignore anyway.
      - text: A crash with the error's description.
        why: That's `try!`. `try?` never crashes.
    answer: 1
  - q: "A function calls `try budget.record(...)` but has no `do`-`catch`. When does that compile?"
    options:
      - text: When the function itself is marked `throws`, so the error propagates to its caller.
        why: Correct. Errors travel up the call chain until something catches them.
      - text: Never; every `try` must sit inside a `do` block.
        why: A throwing function can let errors pass through to its caller without catching them.
      - text: Always; uncaught errors are logged and ignored.
        why: Swift checks error handling at compile time. An uncaught error from a non-throwing function is a build error.
    answer: 0
  - q: When is typed throws, such as `throws(BudgetError)`, the better choice?
    options:
      - text: For every function, because typed errors are always more precise.
        why: Apple's guidance is the opposite; untyped `throws` remains the default because it lets an API add new failure types later.
      - text: For public library APIs that other teams depend on.
        why: That's where the fixed error type hurts most; adding a failure later becomes a breaking change.
      - text: For code inside your module where callers handle every case exhaustively.
        why: Correct. That's where knowing the exact type pays off, with a `switch` and no catch-all.
    answer: 2
---

What should happen when a user tries to save an expense with no title, a negative amount, or one that blows straight through the month's food budget? Returning an optional, as you did in the optionals lesson, tells the caller *that* it failed but not *why*, and Pocket Budget needs the why to show the right message. Swift's error handling makes failure part of a function's signature, with the reasons spelled out as types.

## Errors are enums

Start by listing the ways recording an expense can fail:

```swift title=BudgetError.swift
import Foundation

enum BudgetError: Error, Equatable {
    case emptyTitle
    case nonPositiveAmount
    case overLimit(by: Decimal)
}
```

Any type that conforms to `Error` can be thrown, and an enum with associated values is the natural fit: each case is one failure, and `overLimit` carries how far over the user would go. `Error` has no requirements; it marks the type as throwable. `Equatable` will help with tests in the last lesson.

## throw and try

A function that can fail says so with `throws` and stops with `throw`:

```swift title=CategoryBudget.swift
struct CategoryBudget {
    var limit: Decimal
    private(set) var spent: Decimal = 0

    mutating func record(title: String, amount: Decimal) throws {
        guard !title.trimmingCharacters(in: .whitespaces).isEmpty else {
            throw BudgetError.emptyTitle
        }
        guard amount > 0 else {
            throw BudgetError.nonPositiveAmount
        }
        let newTotal = spent + amount
        guard newTotal <= limit else {
            throw BudgetError.overLimit(by: newTotal - limit)
        }
        spent = newTotal
    }
}
```

`guard` and `throw` pair perfectly: each guard states a rule, and its `else` throws the matching error. `private(set)` lets anyone read `spent` but only the budget itself change it, so the only way to spend money is through `record`, which enforces the rules.

Every call to a throwing function must be marked with `try`. That keyword is for humans: scan a function for `try` and you see every line where control might leave early.

## Handling errors with do-catch

```swift
var food = CategoryBudget(limit: 50)

do {
    try food.record(title: "Dinner", amount: 62)
    print("Saved")
} catch BudgetError.overLimit(let by) {
    print("That's \(by) over your food budget")
} catch {
    print("Couldn't save: \(error)")
}
```

When `record` throws, execution jumps straight to the first `catch` whose pattern matches, skipping `print("Saved")`. Catch clauses use the same pattern matching as `switch`, so you can bind associated values. The final bare `catch` handles everything else and gives you the error as a constant named `error`.

If a function can't sensibly handle an error, it doesn't have to. Mark it `throws` too, call with `try` and no `do`, and the error travels up to its caller.

:::tip Catch where you can act
Handle an error at the level that can do something useful with it. The budget model can't show an alert, and a helper that parses CSV can't decide whether to retry. Usually that means models and helpers throw, and the screen that started the action catches, shows a message and lets the user try again.
:::

:::figure An error travels up until something catches it
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">record throws overLimit. saveExpense is marked throws and passes the error up. The Save button handler has a do-catch that catches it and shows a message.</title>
  <rect class="d-box-warn" x="20" y="150" width="190" height="60" rx="10"/>
  <text class="d-code" x="115" y="177" text-anchor="middle">record(...)</text>
  <text class="d-label-muted" x="115" y="198" text-anchor="middle">throw .overLimit</text>
  <rect class="d-box" x="245" y="85" width="190" height="60" rx="10"/>
  <text class="d-code" x="340" y="112" text-anchor="middle">saveExpense()</text>
  <text class="d-label-muted" x="340" y="133" text-anchor="middle">throws: passes it up</text>
  <rect class="d-box-success" x="470" y="20" width="190" height="60" rx="10"/>
  <text class="d-code" x="565" y="47" text-anchor="middle">Save button</text>
  <text class="d-label-muted" x="565" y="68" text-anchor="middle">do-catch: shows alert</text>
  <path class="d-arrow" d="M210 165 L245 135" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M435 100 L470 70" marker-end="url(#arrow)"/>
</svg>
:::

## try? and try!

Two shortcuts exist. `try?` converts the result into an optional: success gives a value, failure gives `nil`. `try!` asserts that the call can't fail and crashes if it does, with the same risk as a force unwrap.

:::mistake Using try? to make the compiler stop complaining
`try? food.record(title: title, amount: amount)` compiles, and the user taps Save and nothing happens: no expense, no message. You threw away the one piece of information the UI needed. Use `try?` only when you would genuinely ignore the reason, such as deleting a cache file that may not exist.
:::

## Messages users can read

`print(error)` shows `overLimit(by: 12)`, which is fine for a log and useless in an alert. Conform to `LocalizedError` to supply human text:

```swift
extension BudgetError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .emptyTitle: "Give the expense a name."
        case .nonPositiveAmount: "Enter an amount greater than zero."
        case .overLimit(let by): "This puts you \(by.formatted(.currency(code: "USD"))) over budget."
        }
    }
}
```

Now `error.localizedDescription` returns that sentence, ready for a SwiftUI alert.

## Typed throws in Swift 6

Plain `throws` means "can throw any `Error`". Swift 6 adds **typed throws**, where the signature names the exact type:

```swift
mutating func record(title: String, amount: Decimal) throws(BudgetError) {
    // same body; inside, `throw .emptyTitle` can drop the type name
}
```

The payoff is at the call site. When every `try` in a `do` block throws `BudgetError`, the `error` in `catch` is a `BudgetError`, not `any Error`, so you can switch over it exhaustively with no catch-all. Write `do throws(BudgetError)` to state that explicitly:

```swift
do throws(BudgetError) {
    try food.record(title: "Snack", amount: 100)
} catch {
    switch error {
    case .emptyTitle: print("Give it a name")
    case .nonPositiveAmount: print("Amount must be positive")
    case .overLimit(let by): print("That's \(by) over budget")
    }
}
```

The cost is rigidity: once a function promises `BudgetError`, it can't start throwing a decoding or network error without changing its signature and every caller. The Swift project's own guidance is to keep untyped `throws` as the default and use typed throws inside a module where callers handle every case, as Pocket Budget's validation does. For networking later in the course you'll stay with plain `throws`, because those calls can fail in more ways than you control.

That completes the modelling section. You can now describe Pocket Budget's data and its failures precisely. Next, you put that data on screen with SwiftUI.
