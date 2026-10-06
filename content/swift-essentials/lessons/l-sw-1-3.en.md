---
summary: Store expenses in arrays, dictionaries and sets, loop over them with for-in, and branch with an exhaustive switch that the compiler checks for you.
takeaways:
  - An array is ordered and indexed from 0; reading past the end crashes, so prefer `first`, `last` and `for-in` over manual indexes.
  - A dictionary lookup always returns an optional, because the key might not exist; `dict[key, default: 0]` gives you a fallback.
  - A set stores unique values with fast `contains` checks and no order.
  - A Swift `switch` must cover every possible value, has no implicit fallthrough, and can match ranges and `where` conditions.
further:
  - title: Collection Types
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/collectiontypes/
  - title: Control Flow
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/controlflow/
quiz:
  - q: "`let limits = [\"Food\": 300]`. What is the type of `limits[\"Fun\"]`?"
    options:
      - text: "`Int`, with the value 0"
        why: Swift doesn't invent a value for a missing key. You ask for a default explicitly with `default:`.
      - text: "`Int?`, with the value `nil`"
        why: "Correct. Every dictionary subscript returns an optional, because any key might be missing."
      - text: It crashes because the key doesn't exist.
        why: That's arrays with a bad index. Dictionaries return `nil` for a missing key.
    answer: 1
  - q: "You `switch` on a `String` category and write cases for \"Food\" and \"Transport\" only. What does the compiler say?"
    options:
      - text: Nothing; unmatched strings fall through silently.
        why: Swift has no silent fall-through for unmatched values. Every value must hit a case.
      - text: It warns that the switch might be slow.
        why: Performance isn't the issue. Exhaustiveness is a hard error, not a warning.
      - text: "\"Switch must be exhaustive\", so you add a `default:` case."
        why: Correct. A `String` has infinitely many values, so only `default` can cover the rest.
    answer: 2
  - q: Which collection fits "the tags a user has applied to an expense, with no duplicates"?
    options:
      - text: "`Set<String>`"
        why: Correct. A set ignores duplicate inserts and answers `contains` quickly; tag order doesn't matter.
      - text: "`[String]`"
        why: An array allows duplicates, so you would have to check before every append.
      - text: "`[String: Bool]`"
        why: It works, but it's a set in disguise. Use the type that says what you mean.
      - text: "`[Int: String]`"
        why: Integer keys add nothing here; you'd be rebuilding an array with extra steps.
    answer: 0
  - q: "`let amounts: [Decimal] = []`. What does `amounts[0]` do at runtime?"
    options:
      - text: It returns `nil`.
        why: "That's what `amounts.first` does. Subscripting an array never returns an optional."
      - text: It crashes with "Index out of range".
        why: Correct. Array subscripts trust you; an empty array has no index 0.
      - text: It returns 0.
        why: Arrays don't fill gaps with default values.
    answer: 1
---

One expense is a value. A month of expenses is a collection. Pocket Budget needs three shapes of collection: an ordered list of amounts, a lookup from category to monthly limit, and a bag of unique tags. Swift gives you exactly those three, and all of them are typed, so an array of amounts can never accidentally contain a `String`.

## Arrays: ordered, indexed, typed

```swift
import Foundation

var amounts: [Decimal] = [12.5, 4.25, 60]
amounts.append(18)

print(amounts.count)     // 4
print(amounts[0])        // 12.5
print(amounts.first as Any)   // Optional(12.5)
```

`[Decimal]` reads "array of `Decimal`". Indexes start at 0. Notice the difference between `amounts[0]` and `amounts.first`: the subscript trusts you and crashes with "Index out of range" on an empty array, while `first` returns an optional and lets you handle the empty case with the tools from the previous lesson.

Most of the time you don't need indexes at all. A `for-in` loop visits every element:

```swift
var total: Decimal = 0
for amount in amounts {
    total += amount
}
print(total)             // 94.75

for (index, amount) in amounts.enumerated() {
    print("\(index + 1). \(amount)")
}
```

`enumerated()` hands you pairs of position and value, which is the safe way to number rows. Ranges work with `for-in` too, in two flavours:

```swift
for day in 1...30 { }               // closed range: 1 through 30
for i in 0..<amounts.count { }      // half-open: stops before count
```

The closed range includes its upper bound; the half-open range stops one short, which is exactly what array indexes need.

## Dictionaries: lookups that might miss

A dictionary maps keys to values. Pocket Budget keeps a monthly limit per category:

```swift
let limits: [String: Decimal] = ["Food": 300, "Transport": 120]
var spent: [String: Decimal] = ["Food": 280]

let foodLimit = limits["Food"]          // Decimal?, Optional(300)
let funLimit = limits["Fun"] ?? 0       // Decimal, 0

spent["Fun", default: 0] += 15          // creates "Fun": 15
```

Every lookup returns an optional, because the key might not be there. That's the same safety idea again, now built into a collection. The `default:` subscript is the idiomatic way to accumulate totals: it reads the existing value or starts from your default, then writes the result back.

:::mistake Expecting a dictionary to keep its order
`for (category, limit) in limits` visits pairs in an order that can change between runs. If the UI needs a stable order, sort first: `for category in limits.keys.sorted()`.
:::

## Sets: unique values

```swift
var tags: Set<String> = ["work", "travel"]
tags.insert("work")          // already there, nothing changes
print(tags.count)            // 2
print(tags.contains("travel"))  // true
```

A set has no order and no duplicates, and `contains` stays fast no matter how many items it holds. Use it for tags, selected filters and "have I seen this id already?" checks.

## Choosing a collection

| You need | Use | Pocket Budget example |
|---|---|---|
| Order, duplicates allowed, access by position | Array | This month's expenses, newest first |
| Look up a value by a key | Dictionary | Monthly limit for each category |
| Membership and uniqueness, order irrelevant | Set | Tags on one expense |

When in doubt, start with an array. It's the collection SwiftUI lists display, and it's the easiest to read in a debugger. Switch to a dictionary when you catch yourself searching an array for "the one with this name", and to a set when you catch yourself checking for duplicates before every append.

All three collections are values, not shared objects. `var copy = amounts` gives you an independent array: appending to `copy` leaves `amounts` untouched. That behaviour has a name, value semantics, and it gets its own lesson in the next section because it shapes how you design every model type.

## switch: exhaustive by design

`switch` in Swift is much more than a chain of equality checks. It matches ranges, binds values and adds conditions, and the compiler insists that every possible value is handled. Here is how Pocket Budget picks a status message from the percentage of a budget used:

```swift title=BudgetStatus.swift
func status(percentUsed: Int) -> String {
    switch percentUsed {
    case ..<0:
        return "Check your numbers"
    case 0..<50:
        return "Plenty left"
    case 50..<90:
        return "On track"
    case 90...100:
        return "Nearly at your limit"
    default:
        return "Over budget"
    }
}

print(status(percentUsed: 95))   // Nearly at your limit
```

Two things differ from C-family languages. First, there is no `break` and no accidental fall-through: once a case matches, the switch is done. Second, remove the `default` and the build fails with "switch must be exhaustive", because an `Int` has values your cases don't cover. That error looks annoying with integers. With enums, in the next section, it becomes the most useful error in the language: add a new case to your model and the compiler lists every `switch` you forgot to update.

:::figure How Pocket Budget's status ranges cover every Int
<svg viewBox="0 0 680 150" role="img" aria-labelledby="t1">
  <title id="t1">A number line split into five cases: below 0, 0 up to 50, 50 up to 90, 90 through 100, and default for everything above 100. Together they cover every integer.</title>
  <rect class="d-box-warn" x="10" y="40" width="110" height="50" rx="8"/>
  <text class="d-code" x="65" y="70" text-anchor="middle">..&lt;0</text>
  <rect class="d-box-success" x="130" y="40" width="130" height="50" rx="8"/>
  <text class="d-code" x="195" y="70" text-anchor="middle">0..&lt;50</text>
  <rect class="d-box-accent" x="270" y="40" width="130" height="50" rx="8"/>
  <text class="d-code" x="335" y="70" text-anchor="middle">50..&lt;90</text>
  <rect class="d-box-primary" x="410" y="40" width="130" height="50" rx="8"/>
  <text class="d-code" x="475" y="70" text-anchor="middle">90...100</text>
  <rect class="d-box-warn" x="550" y="40" width="120" height="50" rx="8"/>
  <text class="d-code" x="610" y="70" text-anchor="middle">default</text>
  <text class="d-label-muted" x="340" y="125" text-anchor="middle">The ranges never overlap; default catches every other Int</text>
</svg>
:::

Cases can also bind the matched value and test it with `where`:

```swift
let used: Decimal = 15
let limit: Decimal = 10

switch used {
case 0:
    print("Nothing spent yet")
case let amount where amount > limit:
    print("Over by \(amount - limit)")
default:
    print("Within budget")
}
```

Swift 5.9 also made `switch` and `if` usable as expressions, so `let label = switch percentUsed { … }` works when every case produces a single value. Use whichever form reads better; the exhaustiveness rule is the same.

:::tip Order your cases from specific to general
Cases are tried top to bottom and the first match wins. Put narrow cases such as `case 0:` before broad ones such as `case let amount where amount > limit:`.
:::

You can now hold a month of data and make decisions about it. The loops in this lesson work, but they're longhand. Next you'll package logic into functions and replace most of those loops with closures like `filter`, `map` and `reduce`.
