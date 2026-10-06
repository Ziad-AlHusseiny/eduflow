---
summary: Read optional types, unwrap them safely with if let, guard let and ??, and explain why a force unwrap is a crash waiting to happen.
takeaways:
  - An optional such as `Decimal?` either holds a value or holds `nil`, and Swift won't let you use it as a plain value until you unwrap it.
  - Use `guard let` to unwrap at the top of a function and exit early, so the rest of the function works with a real value.
  - Use `if let` when you only need the value inside one branch, and `??` when a sensible default exists.
  - A force unwrap (`!`) crashes the app the moment the value is `nil`; treat every `!` as a claim you must be able to prove.
further:
  - title: Optionals (The Basics)
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/#Optionals
  - title: Optional
    url: https://developer.apple.com/documentation/swift/optional
quiz:
  - q: "`let note: String? = nil`. What does `note?.count ?? 0` evaluate to?"
    options:
      - text: "`nil`"
        why: "Optional chaining does produce `nil` here, but `?? 0` then replaces it with the default."
      - text: "`0`"
        why: "Correct. `note?.count` short-circuits to `nil`, and `??` supplies `0`."
      - text: The program crashes.
        why: Only a force unwrap (`!`) crashes on `nil`. `?.` and `??` are the safe forms.
      - text: It doesn't compile, because you can't call `count` on an optional.
        why: "You can't call it directly, but `?.` is exactly the syntax that makes the call legal."
    answer: 1
  - q: Inside a function, after `guard let amount = parseAmount(text) else { return }`, what is true about `amount` on the next line?
    options:
      - text: It is still a `Decimal?`, so you need another unwrap.
        why: "`guard let` binds a non-optional value; that's the whole point of it."
      - text: It only exists inside the `else` block.
        why: "Inside `else`, the value is missing, so there is nothing to bind. A `guard let` binding is available after the guard, for the rest of the scope."
      - text: It is a non-optional `Decimal` you can use until the end of the function.
        why: Correct. The `else` branch must leave the scope, so the compiler knows `amount` has a value afterwards.
    answer: 2
  - q: 'When is a force unwrap like `URL(string: "https://example.com")!` reasonable?'
    options:
      - text: When the input is a fixed literal you wrote and tested, so `nil` would be a programmer error.
        why: Correct. A crash here points at a typo in your own code, not at bad user input.
      - text: Whenever the value comes from the user, because they usually type valid text.
        why: User input is exactly where `nil` happens. Unwrap it with `guard let` or `if let`.
      - text: Never; `!` is deprecated in Swift 6.
        why: "`!` is not deprecated. It's a deliberate tool with a sharp edge."
      - text: Whenever you want slightly faster code than `if let`.
        why: There is no meaningful speed difference. The choice is about safety.
    answer: 0
  - q: "Which line compiles when `limit` is an `Int?`?"
    options:
      - text: "`let doubled = limit * 2`"
        why: "You can't do arithmetic on an optional; Swift needs to know what to do when it's `nil`."
      - text: "`let doubled = (limit ?? 0) * 2`"
        why: "Correct. `??` turns the `Int?` into an `Int`, so the multiplication is well defined."
      - text: "`let doubled: Int = limit`"
        why: "An `Int?` can't be assigned to an `Int` without unwrapping it first."
    answer: 1
---

The user taps Add Expense, types "12.50" into the amount field, and taps Save. Your code receives a `String`. Turning it into a number can fail: the field might be empty, or the user might have typed "twelve". Many languages hand you a `NaN`, a zero or an exception for that. Swift hands you an **optional**, and makes you deal with the missing case before the code compiles.

## What an optional is

```swift
import Foundation

let typed = "12.50"
let amount = Decimal(string: typed)   // amount is Decimal?, not Decimal
```

The question mark in `Decimal?` means "a `Decimal`, or nothing". The "nothing" is spelled `nil`. Under the hood an optional is an enum with two cases, `.some(value)` and `.none`, which is why you can picture it as a box that is either full or empty.

:::figure An optional is a box that is either full or empty
<svg viewBox="0 0 640 220" role="img" aria-labelledby="t1">
  <title id="t1">Decimal(string:) returns a Decimal optional. For "12.50" the box holds 12.5; for an empty string the box is empty, which is nil. Unwrapping opens the box.</title>
  <rect class="d-box" x="20" y="80" width="170" height="56" rx="10"/>
  <text class="d-code" x="105" y="113" text-anchor="middle">Decimal(string:)</text>
  <path class="d-arrow" d="M190 100 L300 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M190 116 L300 170" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="305" y="20" width="150" height="60" rx="10"/>
  <text class="d-code" x="380" y="47" text-anchor="middle">.some(12.5)</text>
  <text class="d-label-muted" x="380" y="68" text-anchor="middle">"12.50"</text>
  <rect class="d-box-warn" x="305" y="140" width="150" height="60" rx="10"/>
  <text class="d-code" x="380" y="167" text-anchor="middle">nil</text>
  <text class="d-label-muted" x="380" y="188" text-anchor="middle">"" or "twelve"</text>
  <path class="d-arrow" d="M455 50 L540 50" marker-end="url(#arrow)"/>
  <text class="d-label" x="590" y="55" text-anchor="middle">unwrap</text>
  <path class="d-arrow" d="M455 170 L540 170" marker-end="url(#arrow)"/>
  <text class="d-label" x="590" y="175" text-anchor="middle">handle</text>
</svg>
:::

An optional is not the value inside it. Try `amount + 5` and the compiler stops you with "value of optional type 'Decimal?' must be unwrapped to a value of type 'Decimal'". That error is the feature. Every place a value might be missing is marked in the type, and Swift won't let you forget it.

## if let: use the value in one branch

`if let` checks the box and, when it's full, gives you the value under a new non-optional name:

```swift
if let amount = Decimal(string: typed) {
    print("Adding \(amount)")          // amount is a Decimal here
} else {
    print("That isn't a number")
}
```

When the unwrapped name matches an existing optional, Swift 5.7 and later let you drop the right-hand side: `if let amount { … }`. The new `amount` exists only inside the braces, which is perfect when the value matters for one small branch.

## guard let: exit early, keep the happy path flat

Most of the time, a missing value means "stop here". `guard let` says exactly that. Here is the function Pocket Budget uses to validate the amount field:

```swift title=AmountParser.swift
import Foundation

func parseAmount(_ text: String) -> Decimal? {
    let trimmed = text.trimmingCharacters(in: .whitespaces)
    guard let amount = Decimal(string: trimmed), amount > 0 else {
        return nil
    }
    return amount
}

print(parseAmount("12.50") as Any)   // Optional(12.5)
print(parseAmount("") as Any)        // nil
print(parseAmount("-3") as Any)      // nil
```

The `else` block must leave the current scope with `return`, `throw`, `break` or `continue`, and the compiler enforces it. In exchange, `amount` stays available as a plain `Decimal` for the rest of the function. The comma adds a second condition, so one guard rejects both "not a number" and "zero or negative". Code written this way reads top to bottom: checks first, real work after, no pyramid of nested `if`s.

:::tip Default to guard
Reach for `guard let` at the top of functions and `if let` for short, local branches. If you find yourself three `if let`s deep, rewrite them as guards.
:::

## ?? and optional chaining

Sometimes a missing value has an obvious default. The nil-coalescing operator `??` supplies it:

```swift
let note: String? = nil
let label = note ?? "No note"        // "No note"
let noteLength = note?.count ?? 0    // 0
```

`note?.count` is **optional chaining**: if `note` is `nil`, the whole expression becomes `nil` instead of crashing, and `??` turns that into `0`. Chains can be long (`expense?.category?.name`), and they stop at the first `nil`.

Optionals are also a design decision, not only something functions hand you. In Pocket Budget an expense always has a title and an amount, so those are plain `String` and `Decimal`. A note is genuinely optional, so it's `String?`. Resist making things optional "to be safe": every `?` you add is a question every reader of that value has to answer. Make a property optional only when "no value" is a real, meaningful state.

## The force unwrap

There is one more way to open the box: `!`.

```swift
let amount = Decimal(string: typed)!
```

If `typed` is "12.50", this works. If the field is empty, your app dies with "Fatal error: Unexpectedly found nil while unwrapping an Optional value". There's no error message for the user and no chance to recover.

:::mistake Force unwrapping user input
`Decimal(string: field)!` passes every test you write with sensible numbers and then crashes for the first user who taps Save on an empty field. Anything that comes from a person, a file or the network can be `nil`. Use `guard let` and show a message instead.
:::

`!` has legitimate uses, such as `URL(string: "https://example.com")!` built from a literal you wrote yourself. There, `nil` would mean a typo in your code, and crashing during development is the fastest way to find it. Be ready to defend every `!` in code review.

:::note A lenient parser
`Decimal(string:)` reads as many leading digits as it can: `Decimal(string: "12,50")` gives `12`, not `nil`. In [Lists, Navigation and Forms](lesson:l-sw-3-3) you replace hand parsing with a `TextField` that understands the user's locale.
:::

With optionals in hand you can handle one missing value safely. Next you'll store many values at once in arrays, dictionaries and sets, and steer through them with loops and `switch`.
