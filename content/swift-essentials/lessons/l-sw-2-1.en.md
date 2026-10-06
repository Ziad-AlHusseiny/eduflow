---
summary: Predict how structs and classes behave when you copy them, use mutating methods correctly, and break a closure retain cycle with weak self.
takeaways:
  - Assigning a struct makes an independent copy; assigning a class instance makes a second reference to the same object.
  - A `let` struct is frozen all the way down, while a `let` class reference can still have its `var` properties changed.
  - Struct methods that change properties must be marked `mutating`, and they can only be called on a `var`.
  - Default to structs for your data; reach for a class when you need shared identity, such as one object many screens observe.
  - A class that stores a closure which captures `self` strongly creates a retain cycle; capture `[weak self]` to break it.
further:
  - title: Choosing Between Structures and Classes
    url: https://developer.apple.com/documentation/swift/choosing-between-structures-and-classes
  - title: Structures and Classes
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/
  - title: Automatic Reference Counting
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/
quiz:
  - q: "`Budget` is a struct with a `mutating func record(_:)`. Why does `let food = Budget(limit: 300); food.record(42)` fail to compile?"
    options:
      - text: Structs can't have methods that change properties.
        why: They can, as long as the method is marked `mutating` and called on a `var`.
      - text: "`food` is a `let`, so the whole value is immutable and mutating methods are off-limits."
        why: Correct. Change it to `var food` and the call compiles.
      - text: The method needs to be marked `static`.
        why: "`static` methods belong to the type, not to one budget. That would change the design, not fix the error."
    answer: 1
  - q: "`Account` is a class. `let a = Account(balance: 500); let b = a; b.balance -= 50`. What is `a.balance`?"
    options:
      - text: "450"
        why: Correct. `a` and `b` refer to the same object, so a change through one is visible through the other.
      - text: "500"
        why: That's struct behaviour. Class assignment copies the reference, not the object.
      - text: It doesn't compile because `b` is a `let`.
        why: "`let` freezes the reference `b`, not the object's `var` properties."
    answer: 0
  - q: Which data in Pocket Budget is the best fit for a class rather than a struct?
    options:
      - text: A single expense with a title, amount and date.
        why: An expense is plain data with no identity beyond its values; a struct keeps copies independent and safe.
      - text: A pair of start and end dates for a report.
        why: Small immutable data is the textbook struct.
      - text: The one shared store that several screens read and update.
        why: Correct. Several screens need to see the same instance, which is exactly what reference semantics gives you.
      - text: A currency code such as "EUR".
        why: A code is a value; a struct or even a plain `String` fits better.
    answer: 2
  - q: "A class stores `onTrigger = { print(self.threshold) }` in its own property. What's the consequence?"
    options:
      - text: The closure gets a copy of `self`, so changes to the object are invisible.
        why: Classes are never copied by capture. The closure holds a strong reference to the same object.
      - text: Swift refuses to compile any closure that mentions `self`.
        why: Swift only makes you write `self.` explicitly in escaping closures; it doesn't forbid capturing it.
      - text: Nothing special; ARC frees both when the screen closes.
        why: ARC can't free objects that keep each other alive. That's the whole problem.
      - text: Object and closure keep each other alive, so the object is never freed.
        why: Correct. Capture `[weak self]` so the closure doesn't own the object.
    answer: 3
---

You open an expense, change its amount from 4.50 to 5.00 in an edit screen, then tap Cancel. Should the list still say 4.50? With a struct it does, automatically. With a class, the list already shows 5.00, because the edit screen and the list were looking at the same object. That one difference, **value** versus **reference** semantics, decides more about how an iOS app behaves than any other modelling choice.

## Structs copy

Here is the expense type, now with `var` properties so it can be edited:

```swift title=Expense.swift
import Foundation

struct Expense {
    var title: String
    var amount: Decimal
}

var original = Expense(title: "Coffee", amount: 4.5)
var draft = original
draft.amount = 5

print(original.amount)   // 4.5
print(draft.amount)      // 5
```

`var draft = original` makes a complete, independent copy. Editing the draft can't affect the original, so the edit screen can work on a draft and the Cancel button costs nothing: you throw the draft away. Swift gives every struct a free **memberwise initializer**, which is why `Expense(title:amount:)` works without you writing `init`.

Strings, arrays, dictionaries, `Decimal` and `Int` are all structs. That's why `var copy = amounts` in the collections lesson gave you an independent array. Swift makes those copies cheap by sharing storage until one side actually changes it.

## Classes share

```swift
final class Account {
    var balance: Decimal

    init(balance: Decimal) {
        self.balance = balance
    }
}

let checking = Account(balance: 500)
let sameAccount = checking
sameAccount.balance -= 50

print(checking.balance)          // 450
print(checking === sameAccount)  // true: same instance
```

A class instance lives in one place; variables hold references to it. `let sameAccount = checking` copies the reference, so both names point at the same account. `===` asks "is this the very same instance?", a question that makes no sense for structs. Classes need an explicit `init` for stored properties without defaults. Mark them `final` unless you plan to subclass, which is rare in modern Swift.

:::figure Copying a struct versus copying a class reference
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">On the left, original and draft are two separate Expense boxes with amounts 4.5 and 5. On the right, checking and sameAccount are two names whose arrows point to one shared Account box with balance 450.</title>
  <text class="d-label-strong" x="170" y="28" text-anchor="middle">struct: two values</text>
  <rect class="d-box-success" x="30" y="60" width="130" height="80" rx="10"/>
  <text class="d-code" x="95" y="90" text-anchor="middle">original</text>
  <text class="d-label" x="95" y="118" text-anchor="middle">amount 4.5</text>
  <rect class="d-box-success" x="190" y="60" width="130" height="80" rx="10"/>
  <text class="d-code" x="255" y="90" text-anchor="middle">draft</text>
  <text class="d-label" x="255" y="118" text-anchor="middle">amount 5</text>
  <text class="d-label-muted" x="175" y="175" text-anchor="middle">independent copies</text>
  <path class="d-line d-dashed" d="M350 20 L350 230"/>
  <text class="d-label-strong" x="530" y="28" text-anchor="middle">class: one object</text>
  <rect class="d-box" x="390" y="60" width="120" height="40" rx="8"/>
  <text class="d-code" x="450" y="85" text-anchor="middle">checking</text>
  <rect class="d-box" x="560" y="60" width="130" height="40" rx="8"/>
  <text class="d-code" x="625" y="85" text-anchor="middle">sameAccount</text>
  <path class="d-arrow" d="M450 100 L515 160" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M625 100 L560 160" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="460" y="165" width="160" height="60" rx="10"/>
  <text class="d-code" x="540" y="190" text-anchor="middle">Account</text>
  <text class="d-label" x="540" y="212" text-anchor="middle">balance 450</text>
</svg>
:::

## let means different things

`let` freezes whatever the name holds. For a struct, the name holds the whole value, so nothing inside can change. For a class, the name holds a reference, so the reference is fixed but the object's `var` properties are still changeable, which is exactly why `sameAccount.balance -= 50` compiled even though `sameAccount` is a `let`.

Struct methods that change properties must say so with `mutating`:

```swift
struct Budget {
    var limit: Decimal
    var spent: Decimal = 0

    var remaining: Decimal { limit - spent }   // computed property

    mutating func record(_ amount: Decimal) {
        spent += amount
    }
}

var food = Budget(limit: 300)
food.record(42)
print(food.remaining)   // 258
```

:::mistake Calling a mutating method on a let
`let food = Budget(limit: 300)` followed by `food.record(42)` fails with "cannot use mutating member on immutable value: 'food' is a 'let' constant". The compiler is right: you said this budget never changes. Make it `var`, or rethink whether it should change.
:::

## Which one to choose

Apple's guidance, and mine, is to **start with a struct**. Values are easier to reason about because nothing can change them behind your back, and they're safe to pass between threads, which matters a great deal in Swift 6. Use a class when you need **identity**: one shared thing that several parts of the app see and update. In Pocket Budget, each `Expense` is a struct, and the store that owns the list and that several screens observe will be a class. The Observation framework's `@Observable` and SwiftData's `@Model`, which you'll use later, both require classes for exactly this reason.

A quick test when you're unsure: imagine handing a copy to another screen. If that screen should get its own version to edit freely, you want a struct. If it should see every change the rest of the app makes, and changes it makes should show up everywhere, you want a class. Most data in most apps passes the first test.

## ARC and retain cycles

Classes are freed by **automatic reference counting** (ARC): each strong reference adds one to a count, and when the count reaches zero the object is freed and its `deinit` runs. Trouble starts when an object stores a closure that captures the object itself:

```swift title=BudgetAlert.swift
final class BudgetAlert {
    let threshold: Decimal
    var onTrigger: (() -> Void)?

    init(threshold: Decimal) {
        self.threshold = threshold
    }

    func arm() {
        onTrigger = { [weak self] in
            guard let self else { return }
            print("Spent more than \(self.threshold)")
        }
    }

    deinit { print("BudgetAlert freed") }
}
```

Without `[weak self]`, the alert owns the closure and the closure owns the alert. Neither count ever reaches zero, `deinit` never runs, and you've leaked memory. The capture list `[weak self]` makes the closure's reference weak and optional, so `guard let self` unwraps it while it's still alive. A struct on its own can't form these cycles, which is one more reason structs are the default.

Value or reference is half of modelling. The other half is describing data that comes in different shapes, like an expense paid by card versus cash. That's what enums with associated values are for, and they're next.
