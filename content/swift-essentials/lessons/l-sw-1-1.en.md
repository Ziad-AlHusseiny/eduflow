---
kind: intro
summary: Declare constants and variables, read the types Swift infers for you, and pick the right number type for money in Pocket Budget.
takeaways:
  - Use `let` by default and switch to `var` only when the compiler tells you the value must change.
  - Swift infers a type from the first value you assign, and that type never changes afterwards.
  - Swift never converts between `Int` and `Double` silently; you convert explicitly, so mixed-type maths can't surprise you.
  - Store money as `Decimal`, not `Double`, because binary floating point can't represent most cents exactly.
further:
  - title: The Basics (The Swift Programming Language)
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/
  - title: Decimal
    url: https://developer.apple.com/documentation/foundation/decimal
quiz:
  - q: "You write `let limit = 300` and later `limit = 350`. What happens?"
    options:
      - text: It compiles, and `limit` is now 350.
        why: That would be true for `var`. A `let` constant can be assigned exactly once.
      - text: "The compiler rejects the second line: `limit` is a `let` constant."
        why: Correct. Swift catches the reassignment at compile time, before the app runs.
      - text: It compiles, but the app crashes when that line runs.
        why: Swift doesn't defer this to runtime. Mutability is checked by the compiler.
    answer: 1
  - q: "What type does Swift infer for `let coffee = 4.5`?"
    options:
      - text: "`Float`"
        why: "Swift picks `Double` for a decimal literal unless you ask for `Float` explicitly."
      - text: "`Decimal`"
        why: "`Decimal` is never inferred from a literal; you have to annotate it, as in `let coffee: Decimal = 4.5`."
      - text: "`Double`"
        why: Correct. A literal with a fractional part defaults to `Double`.
    answer: 2
  - q: "`let rent = 1200` and `let fee = 2.5` are both declared. Why does `rent + fee` fail to compile?"
    options:
      - text: "`rent` is an `Int` and `fee` is a `Double`, and Swift never mixes them without an explicit conversion."
        why: Correct. Write `Double(rent) + fee` and you have said out loud which conversion you want.
      - text: Constants can't be used in arithmetic; only variables can.
        why: Constants work in any expression. The problem is the two different types.
      - text: "`+` only works on strings in Swift."
        why: "`+` works on numbers and strings, but both sides must be the same type."
    answer: 0
---

Every year I review code from new iOS developers, and the most common crash reports trace back to the same few habits: values that change when nobody expected them to, numbers that quietly lose precision, and assumptions the compiler could have caught. Swift is designed to catch exactly those mistakes, but only if you work with the type system instead of around it.

Over this course you build **Pocket Budget**, a small iPhone app that tracks what you spend. It starts here, with a handful of values in an Xcode playground, and ends as a SwiftUI app on TestFlight. To follow along, open Xcode, choose File › New › Playground, pick the Blank template, and type the examples. A playground runs your code as you type and shows each result in the sidebar.

## let and var

Swift has two ways to name a value. `let` declares a constant, which is assigned once. `var` declares a variable, which can change.

```swift title=PocketBudget.playground
let monthlyLimit = 1500
var spentSoFar = 0

spentSoFar = spentSoFar + 42
spentSoFar += 18          // shorthand for the line above
// monthlyLimit = 2000    // error: cannot assign to value: 'monthlyLimit' is a 'let' constant
```

Use `let` by default. When a value is a constant, you never have to wonder who changed it. If you later need to change it, the compiler tells you, and Xcode offers a one-click fix to turn `let` into `var`. Going the other way, Xcode warns you when a `var` is never mutated. Treat that warning as a request to tidy up.

## Type inference

You didn't write a single type above, yet every value has one. Swift **infers** the type from the first value you assign:

```swift
let category = "Coffee"     // String
let cups = 3                // Int
let pricePerCup = 4.5       // Double
let isRecurring = false     // Bool
```

Option-click any name in Xcode to see its inferred type. You can also write the type yourself with an annotation, which is useful when the literal alone would pick the wrong one:

```swift
let fee: Double = 3         // without the annotation, 3 would be an Int
```

Once a value has a type, it keeps it. You can't put a `String` into `cups` later. This is what makes Swift code readable months later: a name means one kind of thing, forever.

## No silent conversions

Here is the line that surprises people coming from JavaScript or Python:

```swift
let cups = 3
let pricePerCup = 4.5
// let total = cups * pricePerCup   // error: binary operator '*' cannot be applied to operands of type 'Int' and 'Double'
let total = Double(cups) * pricePerCup   // 13.5
```

Swift never converts an `Int` to a `Double` (or back) behind your back. You write the conversion, so the reader can see it. Converting a `Double` to an `Int` with `Int(13.5)` drops the fraction and gives 13, which is exactly the kind of decision you want to be visible in a code review.

:::note Literals are flexible, values are not
`let total = 1200 + 4.5` compiles, because two bare literals have no type yet and Swift picks `Double` for both. The error only appears once a value already has a fixed type.
:::

## Money is not a Double

`Double` is binary floating point. It's fast and perfect for distances or animation timing, but it can't store most decimal fractions exactly. Add ten cents ten times and look at the result:

```swift
import Foundation

var withDouble = 0.0
var withDecimal: Decimal = 0
for _ in 1...10 {
    withDouble += 0.1
    withDecimal += 0.1
}
print(withDouble)    // 0.9999999999999999
print(withDecimal)   // 1
```

A budget app that says you spent $0.9999999999999999 loses the user's trust immediately. `Decimal`, from Foundation, stores base-10 digits, so cents stay exact. Pocket Budget uses `Decimal` for every amount, and you will see it in almost every lesson from here on.

One catch: a fractional literal such as `let tip: Decimal = 0.07` is read as a `Double` first and then converted, so it can arrive as `0.07000000000000001024`. Short example amounts like `4.5` or `12.99` come through clean, but for amounts that matter, build the `Decimal` from text (`Decimal(string: "0.07")`) or from whole cents (`Decimal(7) / 100`).

:::mistake Formatting money by hand
`"$" + String(describing: amount)` breaks the first time a user in Germany or Japan opens your app. Use `amount.formatted(.currency(code: "USD"))`, which applies the right symbol, separators and decimal places for the user's locale.
:::

You now have constants, variables and the types behind them. In the next lesson you meet the type that makes Swift famous for safety: the optional, Swift's way of saying "there might not be a value here".
