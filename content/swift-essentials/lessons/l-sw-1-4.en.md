---
summary: Write functions with clear argument labels and default values, then replace hand-written loops with closures passed to filter, map, reduce and sorted.
takeaways:
  - Argument labels make call sites read like sentences; use `_` only when the label would add nothing.
  - A closure is a function without a name, and trailing closure syntax lets you write it after the call's parentheses.
  - "`filter` keeps elements, `map` transforms them, `reduce` combines them into one value, and `sorted(by:)` returns a new ordered array."
  - A closure captures the variables it uses, so it can carry context such as a limit to wherever it's called later.
further:
  - title: Functions
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/functions/
  - title: Closures
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/closures/
quiz:
  - q: "Given `func total(of expenses: [Expense], in category: String? = nil) -> Decimal`, which call compiles?"
    options:
      - text: "`total(expenses, \"Food\")`"
        why: Both parameters have argument labels, so the call must use them.
      - text: "`total(expenses: expenses)`"
        why: "`expenses` is the parameter name used inside the function. Callers use the label `of`."
      - text: "`total(of: expenses)`"
        why: Correct. The second parameter has a default value, so you can leave it out.
    answer: 2
  - q: "What does `[3, 8, 12].map { $0 * 2 }.filter { $0 > 10 }` produce?"
    options:
      - text: "`[16, 24]`"
        why: "Correct. `map` doubles every number to `[6, 16, 24]`, then `filter` keeps those above 10."
      - text: "`[24]`"
        why: "That would be filtering before mapping (`12` is the only value above 10). The chain runs left to right."
      - text: "`[6, 16, 24]`"
        why: That's the result after `map` only; `filter` still has to remove 6.
      - text: "`40`"
        why: A single combined value is what `reduce` produces. `map` and `filter` both return arrays.
    answer: 0
  - q: You write `expenses.sorted { $0.amount > $1.amount }` on its own line and nothing changes. Why?
    options:
      - text: The closure compares the wrong way round.
        why: The comparison is fine (largest first). The result is the problem.
      - text: "`sorted` returns a new array, and the code throws that result away."
        why: Correct. Assign it (`let biggestFirst = …`) or call `sort` on a `var` to sort in place. Xcode warns about the unused result.
      - text: "Closures can't read properties like `amount`."
        why: Closures can read anything in scope, including properties of their parameters.
    answer: 1
  - q: "`let check = makeLimitCheck(limit: 60)` returns a closure `{ amount in amount > limit }`. What does `check(64)` return, long after `makeLimitCheck` finished?"
    options:
      - text: It doesn't compile, because `limit` no longer exists.
        why: The closure captured `limit`, so it lives as long as the closure does.
      - text: "`false`, because captured values reset to zero."
        why: Captures keep their values; nothing resets.
      - text: "`true`"
        why: Correct. The closure captured `limit` as 60, and 64 is greater than 60.
    answer: 2
---

The `for` loops from the last lesson work, but they make you read five lines to learn one fact, such as "the total spent on food". Functions give a piece of logic a name. Closures let you hand a small piece of logic to someone else, like "keep the ones over 50", and Swift's collection methods are built around them. Together they turn most loops in Pocket Budget into one readable line.

For the examples, here is a minimal expense type. You'll learn what `struct` really means in the next section; for now, read it as "a value with a title, an amount and a category".

```swift title=Expense.swift
import Foundation

struct Expense {
    let title: String
    let amount: Decimal
    let category: String
}

let expenses = [
    Expense(title: "Groceries", amount: 64.2, category: "Food"),
    Expense(title: "Bus pass", amount: 45, category: "Transport"),
    Expense(title: "Coffee", amount: 4.5, category: "Food"),
    Expense(title: "Concert", amount: 80, category: "Fun"),
]
```

## Functions that read like sentences

```swift
func total(of expenses: [Expense], in category: String? = nil) -> Decimal {
    var sum: Decimal = 0
    for expense in expenses where category == nil || expense.category == category {
        sum += expense.amount
    }
    return sum
}

total(of: expenses)                  // 193.7
total(of: expenses, in: "Food")      // 68.7
```

Each parameter has two names. The **argument label** (`of`, `in`) is what callers write; the **parameter name** (`expenses`, `category`) is what the body uses. That split is why Swift call sites read like English: "total of expenses in Food". The `= nil` gives `category` a default value, so callers can leave it out. Write `_` as the label when it adds nothing, as in `print(_:)`.

The `-> Decimal` declares the return type. A function that returns nothing omits the arrow.

## Closures: functions without names

A closure is a block of code you can store in a constant or pass as an argument. Here is a closure that decides whether an expense is large:

```swift
let isLarge: (Expense) -> Bool = { expense in
    expense.amount > 50
}
isLarge(expenses[0])     // true
```

The type `(Expense) -> Bool` reads "takes an `Expense`, returns a `Bool`". Parameters go before `in`, the body after it. A single-expression body returns its value without writing `return`.

Now pass logic like that to `filter`. These three lines are the same call, progressively shortened:

```swift
let large1 = expenses.filter({ (expense: Expense) -> Bool in
    return expense.amount > 50
})
let large2 = expenses.filter { expense in expense.amount > 50 }
let large3 = expenses.filter { $0.amount > 50 }
```

When a closure is the last argument, you can write it after the parentheses (**trailing closure syntax**) and drop empty parentheses entirely. Swift already knows the types from `filter`'s signature, so you can drop those too. `$0` is the first parameter, `$1` the second.

:::tip When to stop shortening
Use `$0` for one-line closures where the meaning is obvious. Once a closure spans several lines or takes two parameters you need to tell apart, name the parameters. Your future self is the main reader.
:::

## filter, map, reduce, sorted

These four cover most of what you do with collections:

```swift
let food = expenses.filter { $0.category == "Food" }        // keep matching expenses
let titles = food.map { $0.title }                           // ["Groceries", "Coffee"]
let foodTotal = food.reduce(0) { $0 + $1.amount }            // 68.7
let biggestFirst = expenses.sorted { $0.amount > $1.amount } // Concert, Groceries, ...
```

`reduce` starts from an initial value (0) and folds each element into a running result: `$0` is the total so far and `$1` is the next expense. `sorted(by:)` asks your closure "should `$0` come before `$1`?".

Chain them, and the pipeline reads in the order it runs:

```swift
let foodSpend = expenses
    .filter { $0.category == "Food" }
    .map(\.amount)
    .reduce(0, +)
```

`\.amount` is a **key path**, a shorthand for `{ $0.amount }`, and `+` is itself a function that takes two values and returns their sum, so you can pass it straight to `reduce`.

:::figure filter, map and reduce as a pipeline
<svg viewBox="0 0 700 170" role="img" aria-labelledby="t1">
  <title id="t1">Four expenses flow into filter, which keeps the two food expenses; map turns them into two amounts; reduce adds them into one total of 68.7.</title>
  <rect class="d-box" x="10" y="50" width="130" height="70" rx="10"/>
  <text class="d-label-strong" x="75" y="80" text-anchor="middle">4 expenses</text>
  <text class="d-label-muted" x="75" y="102" text-anchor="middle">[Expense]</text>
  <path class="d-arrow" d="M140 85 L185 85" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="190" y="50" width="140" height="70" rx="10"/>
  <text class="d-code" x="260" y="80" text-anchor="middle">filter</text>
  <text class="d-label-muted" x="260" y="102" text-anchor="middle">2 food items</text>
  <path class="d-arrow" d="M330 85 L375 85" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="380" y="50" width="140" height="70" rx="10"/>
  <text class="d-code" x="450" y="80" text-anchor="middle">map(\.amount)</text>
  <text class="d-label-muted" x="450" y="102" text-anchor="middle">[64.2, 4.5]</text>
  <path class="d-arrow" d="M520 85 L565 85" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="570" y="50" width="120" height="70" rx="10"/>
  <text class="d-code" x="630" y="80" text-anchor="middle">reduce</text>
  <text class="d-label-muted" x="630" y="102" text-anchor="middle">68.7</text>
  <text class="d-label-muted" x="350" y="155" text-anchor="middle">Each step returns a new value; the original array never changes</text>
</svg>
:::

:::mistake Calling sorted and ignoring the result
`expenses.sorted { … }` on a line by itself does nothing useful: it returns a new array and throws it away, and Xcode warns "result of call to 'sorted(by:)' is unused". Assign the result, or call `sort(by:)` on a `var` array to sort it in place.
:::

## Closures capture their surroundings

A closure can use variables from the scope where it was created, and it keeps them alive:

```swift
func makeLimitCheck(limit: Decimal) -> (Decimal) -> Bool {
    return { amount in amount > limit }
}

let overFoodLimit = makeLimitCheck(limit: 60)
overFoodLimit(64.2)     // true
```

`makeLimitCheck` has returned, yet the closure still knows `limit` is 60. When a function stores a closure parameter to call later, instead of calling it before returning, Swift makes you mark that parameter `@escaping`. The keyword is a warning label for readers: this closure outlives the call, so whatever it captures stays alive too.

This **capturing** is what lets SwiftUI buttons run code that refers to your view's data long after the view was built. It has one sharp edge, a reference cycle when a class and a closure capture each other, which you'll meet with classes in the next lesson.

You can now name logic, pass it around and replace loops with pipelines. That finishes the core language. The next section is about modelling: deciding whether Pocket Budget's data should be structs, classes or enums, and why that choice changes how your app behaves.
