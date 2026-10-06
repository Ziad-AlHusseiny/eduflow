---
summary: Replace fragile strings with enums, attach data to each case with associated values, and let exhaustive switches find every place a new case needs handling.
takeaways:
  - An enum lists every valid value of a type, so a typo like "Fod" becomes a compile error instead of a silent bug.
  - Raw values (`enum Category: String`) give each case a stored string or number for saving and decoding.
  - Associated values attach different data to different cases, such as the last four digits for `.card`.
  - Switch over enums without `default`, so adding a case makes the compiler list every switch you must update.
further:
  - title: Enumerations
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/enumerations/
  - title: CaseIterable
    url: https://developer.apple.com/documentation/swift/caseiterable
quiz:
  - q: "`enum Category: String { case food, transport }`. What does `Category(rawValue: \"Food\")` return?"
    options:
      - text: "`.food`, because raw-value matching ignores case."
        why: Raw-value matching is exact. The raw value of `food` is "food", lowercase.
      - text: A crash, because "Food" isn't a valid raw value.
        why: The failable initializer exists precisely to avoid crashing on bad input.
      - text: "`nil`"
        why: Correct. `init(rawValue:)` is failable and returns `Category?`; "Food" doesn't match "food".
    answer: 2
  - q: You add `case gifts` to `Category`. Every `switch` over `Category` uses explicit cases and no `default`. What happens on the next build?
    options:
      - text: The compiler reports each switch that doesn't handle `.gifts`.
        why: Correct. Exhaustiveness checking turns "find every place that needs updating" into a list of errors.
      - text: The build succeeds, and `.gifts` falls into the last case at runtime.
        why: Swift never routes an unhandled case anywhere silently.
      - text: The build succeeds, and the app crashes when it meets `.gifts`.
        why: Without a `default`, the gap is caught at compile time, not at runtime.
    answer: 0
  - q: Which declaration models "paid by card, and we know the last four digits"?
    options:
      - text: "`case card = \"4242\"`"
        why: A raw value is fixed for the case; every card payment would end in 4242.
      - text: "`case card(lastFour: String)`"
        why: Correct. An associated value is stored per instance, so each payment carries its own digits.
      - text: "`case card; var lastFour: String`"
        why: Enums can't have stored instance properties; associated values are how cases carry data.
      - text: "`case card(String) = \"card\"`"
        why: Swift doesn't allow raw values on an enum whose cases have associated values.
    answer: 1
---

In the last section, an expense's category was a `String`. That works until someone writes `"Fod"`, or `"food"` in one place and `"Food"` in another, and the monthly total silently misses half your groceries. Nothing in the type said which strings were valid. An **enum** says exactly that: here is the complete list of possible values, and nothing else is allowed.

## Enums with raw values

```swift title=Category.swift
enum Category: String, CaseIterable {
    case food
    case transport
    case housing
    case fun

    var title: String {
        rawValue.capitalized
    }

    var symbolName: String {
        switch self {
        case .food: "fork.knife"
        case .transport: "bus"
        case .housing: "house"
        case .fun: "ticket"
        }
    }
}
```

`Category` now has exactly four values. Write `.fod` and the build fails. The `: String` gives each case a **raw value**, its name as a string by default (`Category.food.rawValue` is `"food"`), which is what you'll save to disk and read from JSON later. Going the other way is failable, because not every string is a category: `Category(rawValue: "fun")` is `.fun`, and `Category(rawValue: "Fun")` is `nil`.

`CaseIterable` asks the compiler to generate `Category.allCases`, an array of every case in declaration order. Pocket Budget's category picker will loop over it, so adding a case adds a row to the picker for free.

Enums can have computed properties and methods, just like structs. `symbolName` maps each case to an SF Symbols icon name, and the `switch` inside it has no `default`.

## Exhaustive switches are a feature

Suppose you add `case gifts` next month. The build immediately fails at `symbolName` with "switch must be exhaustive", and at every other `switch` over `Category` in the project. The compiler has produced your to-do list. Compare that with the string version, where a new category quietly falls into whatever `default` branch existed and shows the wrong icon in production.

:::mistake Adding default to an enum switch
`default: "questionmark"` makes today's error go away and tomorrow's bug invisible. When you add `.gifts`, nothing tells you that this switch never learned about it. Over an enum you own, list every case explicitly and let the compiler keep you honest.
:::

## Associated values: cases that carry data

Raw values are fixed per case. Some data varies per instance. Pocket Budget records how an expense was paid, and each method needs different details:

```swift title=PaymentMethod.swift
enum PaymentMethod {
    case cash
    case card(lastFour: String)
    case transfer(bank: String, reference: String?)
}

let lunch: PaymentMethod = .cash
let groceries: PaymentMethod = .card(lastFour: "4242")
let rent: PaymentMethod = .transfer(bank: "Monzo", reference: "RENT-10")
```

Each case has its own shape. A cash payment carries nothing, a card payment carries four digits, and a transfer carries a bank and an optional reference. A struct would need three optional properties and a comment explaining which ones are filled in when. The enum makes invalid combinations, such as a cash payment with a bank name, impossible to construct.

:::figure One enum, three differently shaped cases
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">The PaymentMethod enum branches into three cases: cash with no data, card carrying lastFour, and transfer carrying bank and an optional reference.</title>
  <rect class="d-box-primary" x="250" y="15" width="180" height="50" rx="10"/>
  <text class="d-code" x="340" y="46" text-anchor="middle">PaymentMethod</text>
  <path class="d-arrow" d="M300 65 L120 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 65 L340 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 65 L560 115" marker-end="url(#arrow)"/>
  <rect class="d-box" x="40" y="120" width="160" height="70" rx="10"/>
  <text class="d-code" x="120" y="150" text-anchor="middle">.cash</text>
  <text class="d-label-muted" x="120" y="172" text-anchor="middle">no data</text>
  <rect class="d-box-accent" x="260" y="120" width="160" height="70" rx="10"/>
  <text class="d-code" x="340" y="150" text-anchor="middle">.card</text>
  <text class="d-label-muted" x="340" y="172" text-anchor="middle">lastFour</text>
  <rect class="d-box-success" x="480" y="120" width="180" height="70" rx="10"/>
  <text class="d-code" x="570" y="150" text-anchor="middle">.transfer</text>
  <text class="d-label-muted" x="570" y="172" text-anchor="middle">bank, reference?</text>
</svg>
:::

## Getting the data back out

You read associated values with pattern matching in a `switch`:

```swift
func label(for method: PaymentMethod) -> String {
    switch method {
    case .cash:
        return "Cash"
    case .card(let lastFour):
        return "Card ending \(lastFour)"
    case .transfer(let bank, let reference?):
        return "\(bank) transfer, ref \(reference)"
    case .transfer(let bank, nil):
        return "\(bank) transfer"
    }
}

label(for: groceries)   // "Card ending 4242"
```

`let lastFour` binds the associated value to a new constant for that case. The two `.transfer` cases show how far patterns go: `let reference?` matches only when the optional reference has a value and unwraps it, and `nil` matches when it doesn't. The compiler still checks that, between them, every possibility is covered.

When you care about a single case, `if case` is shorter than a full switch:

```swift
if case .card(let lastFour) = groceries {
    print("Remind me to check card \(lastFour)")
}
```

:::note You've used an enum since lesson 2
`Optional` is an enum with two cases, `.some(Wrapped)` and `.none`, and `nil` is shorthand for `.none`. Every `if let` you've written is pattern matching on an enum with an associated value.
:::

## Enums instead of boolean soup

Enums are the right tool whenever a value is "exactly one of these". A classic example is loading data. The first draft usually looks like three separate properties: `isLoading`, `rates`, and `errorMessage`. Nothing stops all three from being set at once, so every screen has to guess which one wins. One enum removes the guessing:

```swift
enum LoadState {
    case idle
    case loading
    case loaded([String: Decimal])
    case failed(String)
}
```

Now the rates exist only in the `.loaded` case and the message only in `.failed`, and a `switch` in the view handles each state once. You'll build exactly this when Pocket Budget starts fetching exchange rates. Reach for an enum whenever you catch yourself comparing strings or juggling booleans that should never be true together.

Your types can now describe Pocket Budget's data precisely. Next you'll give them shared abilities with protocols, such as "can be compared" or "has a stable id", and add behaviour to existing types with extensions.
