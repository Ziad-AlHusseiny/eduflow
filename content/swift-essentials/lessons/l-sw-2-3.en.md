---
summary: Define protocols as contracts, adopt standard ones like Identifiable and Hashable, add default behaviour with protocol extensions, and extend types you don't own.
takeaways:
  - A protocol lists requirements; any struct, class or enum that implements them can be used wherever the protocol is expected.
  - For structs and enums, Swift synthesizes `Equatable` and `Hashable` automatically when every stored property already conforms.
  - A protocol extension gives every conforming type a default implementation for free.
  - Extensions add methods, computed properties and conformances to any type, including ones from Apple, but never new stored properties.
  - "`some Protocol` stands for one specific conforming type (for a parameter, the caller picks it); `any Protocol` is a box that can hold a different conforming type each time."
further:
  - title: Protocols
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/
  - title: Extensions
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/extensions/
  - title: Identifiable
    url: https://developer.apple.com/documentation/swift/identifiable
quiz:
  - q: "`struct Expense: Hashable` has properties of type `UUID`, `String` and `Decimal`. What do you have to write to make it hashable?"
    options:
      - text: "Nothing more; Swift synthesizes `==` and `hash(into:)` because every property is already hashable."
        why: Correct. Synthesis covers structs and enums whose stored properties all conform.
      - text: "A `hash(into:)` method that combines each property by hand."
        why: You can, but only when you want different behaviour from the synthesized version.
      - text: "An `extension Expense: Equatable` with a custom `==`."
        why: "`Hashable` inherits from `Equatable`, and both are synthesized together."
    answer: 0
  - q: 'Why can''t you add `var note: String = ""` to `Decimal` in an extension?'
    options:
      - text: Extensions can only add methods, not properties of any kind.
        why: "Extensions can add computed properties, like `var asCurrency: String { … }`."
      - text: "`Decimal` is a struct, and structs can't be extended."
        why: Any type can be extended, including Apple's structs.
      - text: Extensions can't add stored properties, because that would change the type's memory layout.
        why: Correct. Add a computed property, or wrap the value in your own type.
    answer: 2
  - q: "You need one array holding both `Expense` and `Subscription` values, which both conform to `BudgetItem`. Which type do you declare?"
    options:
      - text: "`[some BudgetItem]`"
        why: "`some` means one concrete type for the whole array; it can't mix expenses with subscriptions."
      - text: "`[any BudgetItem]`"
        why: Correct. Each element is an existential box that can hold any conforming type.
      - text: "`[BudgetItem.Type]`"
        why: That's an array of types (metatypes), not of values.
    answer: 1
  - q: A protocol extension defines `formattedCost()`. `Subscription` conforms but doesn't implement it. What happens when you call `music.formattedCost()`?
    options:
      - text: A compile error, because `Subscription` is missing a requirement.
        why: A method supplied by a protocol extension is satisfied for every conforming type automatically.
      - text: A runtime crash, because the method has no body in `Subscription`.
        why: The body lives in the extension, so there's always something to run.
      - text: The default implementation from the extension runs.
        why: "Correct. That's the purpose of a protocol extension: shared behaviour written once."
    answer: 2
---

Pocket Budget is about to grow a second kind of cost. Next to one-off expenses there are subscriptions, billed monthly or yearly. The summary screen shouldn't care which is which: it needs a title and a monthly cost from each. Inheritance would force both into a class hierarchy. Swift's answer is a **protocol**: a list of requirements any type can promise to meet, whether it's a struct, a class or an enum.

## Writing a protocol

```swift title=BudgetItem.swift
import Foundation

protocol BudgetItem {
    var title: String { get }
    var monthlyCost: Decimal { get }
}
```

`{ get }` means "readable". A conforming type can satisfy it with a stored property or a computed one. Here are two conforming types, building on the `Category` enum from the previous lesson:

```swift
struct Expense: Identifiable, Hashable, BudgetItem {
    let id = UUID()
    var title: String
    var amount: Decimal
    var category: Category
    var date: Date

    var monthlyCost: Decimal { amount }
}

struct Subscription: BudgetItem {
    var title: String
    var price: Decimal
    var billedYearly: Bool

    var monthlyCost: Decimal {
        billedYearly ? price / 12 : price
    }
}
```

Leave out `monthlyCost` and the compiler stops you with "type 'Subscription' does not conform to protocol 'BudgetItem'", and Xcode offers to add stubs for whatever is missing.

## Standard protocols you'll use every day

`Expense` also adopts two protocols from the standard library. **Identifiable** requires an `id` property, and SwiftUI's `List` and `ForEach` use it to tell rows apart, so you'll see it on nearly every model in this course. **Hashable** lets expenses go into a `Set` or be dictionary keys, and it includes **Equatable**, which gives you `==`.

You didn't write `==` or a hash function. For structs and enums, Swift **synthesizes** `Equatable` and `Hashable` when every stored property already conforms, and `UUID`, `String`, `Decimal`, `Date` and `Category` all do. Because `id` is part of that comparison, two expenses with identical titles and amounts are still different expenses, which is what the user means.

:::mistake A protocol with one conforming type
Beginners often write `protocol ExpenseProtocol` next to `struct Expense` "for flexibility". A protocol with a single implementation adds a layer to read and buys nothing. Introduce one when a second type actually needs to fit the same slot, as `Subscription` does here, or when tests need a fake.
:::

## Default behaviour with protocol extensions

Every budget item needs a formatted price. Instead of writing it twice, extend the protocol:

```swift
extension BudgetItem {
    func formattedCost(currencyCode: String = "USD") -> String {
        monthlyCost.formatted(.currency(code: currencyCode))
    }
}

let coffee = Expense(title: "Coffee", amount: 4.5, category: .food, date: .now)
let music = Subscription(title: "Music", price: 120, billedYearly: true)

coffee.formattedCost()                     // "$4.50"
music.formattedCost(currencyCode: "EUR")   // "€10.00"
```

Every type that conforms to `BudgetItem`, now or in the future, gets `formattedCost` for free. This is the core of what people mean by protocol-oriented Swift: small protocols, with shared behaviour in extensions, adopted by value types.

:::figure Two types, one protocol, shared behaviour
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Expense and Subscription both conform to the BudgetItem protocol, which requires title and monthlyCost. A protocol extension adds formattedCost to every conforming type.</title>
  <rect class="d-box-primary" x="230" y="20" width="220" height="70" rx="10"/>
  <text class="d-code" x="340" y="48" text-anchor="middle">protocol BudgetItem</text>
  <text class="d-label-muted" x="340" y="72" text-anchor="middle">title, monthlyCost</text>
  <rect class="d-box-accent" x="490" y="30" width="180" height="50" rx="10"/>
  <text class="d-code" x="580" y="60" text-anchor="middle">formattedCost()</text>
  <path class="d-line d-dashed" d="M450 55 L490 55"/>
  <text class="d-label-muted" x="580" y="102" text-anchor="middle">from the extension</text>
  <rect class="d-box-success" x="80" y="150" width="200" height="56" rx="10"/>
  <text class="d-code" x="180" y="183" text-anchor="middle">struct Expense</text>
  <rect class="d-box-success" x="400" y="150" width="220" height="56" rx="10"/>
  <text class="d-code" x="510" y="183" text-anchor="middle">struct Subscription</text>
  <path class="d-arrow" d="M180 150 L300 92" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M510 150 L380 92" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="340" y="135" text-anchor="middle">conforms</text>
</svg>
:::

## some and any

Two keywords describe "a value of some type that conforms":

```swift
let items: [any BudgetItem] = [coffee, music]
let monthly = items.reduce(0) { $0 + $1.monthlyCost }    // 14.5

func cheapest(_ list: [some BudgetItem]) -> String? {
    list.min { $0.monthlyCost < $1.monthlyCost }?.title
}
```

`any BudgetItem` is a box that can hold a different conforming type in each slot, which is what a mixed list needs. `some BudgetItem` means "one specific conforming type, decided by the caller": `cheapest` works with `[Expense]` or `[Subscription]`, but not with a mix. Prefer `some` when it fits, because the compiler knows the exact type and can optimize. SwiftUI's `var body: some View` uses the same keyword in return position, where the roles flip: the view's implementation picks the one concrete type, and callers only know it's a `View`.

## Extending types you don't own

Extensions aren't limited to protocols. You can add computed properties, methods and conformances to any type, including Apple's:

```swift
extension Decimal {
    var asCurrency: String { formatted(.currency(code: "USD")) }
}

extension Expense: CustomStringConvertible {
    var description: String { "\(title) (\(category.rawValue)): \(formattedCost())" }
}

print(coffee)   // Coffee (food): $4.50
```

Many Swift teams also use extensions to organise a file: the type's stored properties at the top, then one extension per conformance. One limit applies everywhere: an extension can't add **stored** properties, only computed ones. Also, when an extension method on a struct changes a property, it still needs `mutating`, exactly like a method in the original declaration.

## Where you'll meet protocols next

Protocols are how Apple's frameworks talk to your code. In SwiftUI, every screen you build is a struct that conforms to the `View` protocol, whose single requirement is a `body` property. `List` asks for `Identifiable` elements so it can track rows. Networking code asks for `Codable` so JSON can become your types. Swift 6 concurrency asks for `Sendable` before a value may cross between threads. Each time, the pattern is the one from this lesson: the framework states a contract, your type promises to meet it, and the compiler checks the promise.

You now have the full modelling toolkit: structs, classes, enums and protocols. The last piece before SwiftUI is what happens when an operation fails, such as an expense that would blow the budget, and how Swift's error handling makes failure part of a function's type.
