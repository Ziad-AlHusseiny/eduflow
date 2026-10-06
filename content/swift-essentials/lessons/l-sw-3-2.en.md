---
summary: Give each piece of data one source of truth, using @State for view-owned values, @Binding to share write access, and @Observable classes with @Bindable and the environment for app data.
takeaways:
  - "`@State` stores a value outside the view struct so it survives re-renders; mark it `private`, because the view owns it."
  - "A `$` prefix gives you a `Binding`: read and write access to someone else's source of truth, which is what controls like `Toggle` and `TextField` need."
  - Mark a shared model class with `@Observable`, and SwiftUI re-renders exactly the views whose `body` read a property that changed.
  - Own an `@Observable` object with `@State` at the top, then pass it down directly or through `.environment(_:)`.
  - Use `@Bindable` when you need bindings to the properties of an `@Observable` object, for example to edit them in a form.
further:
  - title: Managing model data in your app
    url: https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app
  - title: State
    url: https://developer.apple.com/documentation/swiftui/state
  - title: Observation
    url: https://developer.apple.com/documentation/observation
quiz:
  - q: "A view declares `var count = 0` and a button runs `count += 1`. What happens?"
    options:
      - text: It compiles, but the screen never updates.
        why: It doesn't get that far. A view's `body` can't mutate a plain stored property, so the build fails.
      - text: "It fails to compile, because `self` is immutable inside `body`; the property needs `@State`."
        why: Correct. `@State` moves the storage out of the struct into SwiftUI, which makes it writable and observed.
      - text: It works, because SwiftUI views are classes.
        why: Views are structs, and that's exactly why plain properties can't change from inside `body`.
    answer: 1
  - q: A parent owns `@State private var showLargeOnly = false`. A child `FilterBar` must flip it. What does the child declare, and what does the parent pass?
    options:
      - text: "Child: `@Binding var showLargeOnly: Bool`. Parent passes `$showLargeOnly`."
        why: Correct. The binding gives the child read and write access while the parent stays the single source of truth.
      - text: "Child: `@State var showLargeOnly: Bool`. Parent passes `showLargeOnly`."
        why: "`@State` would create a second, independent copy; the parent would never see the change."
      - text: "Child: `var showLargeOnly: Bool`. Parent passes `$showLargeOnly`."
        why: A plain property can't receive a `Binding`, and even with a matching type it couldn't write back.
    answer: 0
  - q: "Which views re-render when `store.monthlyLimit` changes on an `@Observable` store?"
    options:
      - text: Every view in the app.
        why: Observation tracks access per property, so unrelated views are left alone.
      - text: Every view that holds a reference to the store.
        why: Holding a reference isn't enough; a view is only tracked for properties its `body` actually read.
      - text: Only views whose `body` read `monthlyLimit`, or a computed property that uses it.
        why: Correct. That fine-grained tracking is the main improvement over the older `ObservableObject`.
    answer: 2
  - q: "A settings screen gets the store with `@Environment(BudgetStore.self) private var store` and needs `$store.monthlyLimit` for a `TextField`. What do you add?"
    options:
      - text: Change the property wrapper to `@State`.
        why: "`@State` would create a new store owned by this screen instead of using the shared one."
      - text: "`@Bindable var store = store` at the top of `body`."
        why: Correct. `@Bindable` creates bindings to an `@Observable` object's properties, and it can be declared as a local in `body`.
      - text: Mark `monthlyLimit` with `@Published`.
        why: "`@Published` belongs to the older `ObservableObject` system and doesn't create bindings by itself."
    answer: 1
---

A SwiftUI view is a struct that SwiftUI creates, reads and throws away whenever it likes. So where does "the user switched on the Large Expenses Only filter" live? Not in a normal property: the struct holding it may be gone a moment later, and from inside `body` you can't even change it. SwiftUI's answer is a small set of property wrappers, each answering one question: **who owns this data?**

## @State: data the view owns

```swift title=ExpensesScreen.swift
import SwiftUI

struct ExpensesScreen: View {
    @State private var showLargeOnly = false

    var body: some View {
        Toggle("Large expenses only", isOn: $showLargeOnly)
    }
}
```

`@State` tells SwiftUI to keep the value in storage it manages, tied to this view's place in the hierarchy. The struct can be recreated a hundred times and the value survives. When the value changes, SwiftUI re-reads `body` and updates the screen.

The `$` in `$showLargeOnly` asks for a **binding**: a two-way connection to the state. `Toggle` doesn't own the on/off value; it receives a binding so it can read the current value and write the new one when tapped. Every input control (`TextField`, `Toggle`, `Picker`, `DatePicker`, `Slider`) works this way.

:::mistake Forgetting @State
Write `var isExpanded = false` and then `isExpanded.toggle()` inside a button, and the build fails with "cannot use mutating member on immutable value: 'self' is immutable". The fix isn't `mutating`; views can't do that. Add `@State private` so SwiftUI owns the storage.
:::

## @Binding: borrowing someone else's state

Extract the toggle into its own view, and the child needs to change state that the parent owns:

```swift
struct FilterBar: View {
    @Binding var showLargeOnly: Bool

    var body: some View {
        Toggle("Large expenses only", isOn: $showLargeOnly)
    }
}

// In ExpensesScreen's body:
FilterBar(showLargeOnly: $showLargeOnly)
```

The parent remains the **single source of truth**; the child gets a binding to it. If the child declared `@State` instead, it would hold a separate copy that starts with the parent's value and then drifts apart. That's the bug behind most "my toggle does nothing" questions.

:::figure One source of truth, shared through bindings
<svg viewBox="0 0 680 240" role="img" aria-labelledby="t1">
  <title id="t1">ExpensesScreen owns showLargeOnly with State. It passes a binding to FilterBar, whose Toggle writes through the binding back to the state. The store, an Observable class owned by the app, is read by both ExpensesScreen and SettingsScreen.</title>
  <rect class="d-box-primary" x="30" y="30" width="260" height="70" rx="10"/>
  <text class="d-code" x="160" y="58" text-anchor="middle">ExpensesScreen</text>
  <text class="d-label-muted" x="160" y="82" text-anchor="middle">@State showLargeOnly</text>
  <rect class="d-box" x="30" y="150" width="260" height="70" rx="10"/>
  <text class="d-code" x="160" y="178" text-anchor="middle">FilterBar</text>
  <text class="d-label-muted" x="160" y="202" text-anchor="middle">@Binding showLargeOnly</text>
  <path class="d-arrow" d="M130 100 L130 148" marker-end="url(#arrow)"/>
  <text class="d-label" x="100" y="130" text-anchor="end">$binding</text>
  <path class="d-arrow d-dashed" d="M190 150 L190 102" marker-end="url(#arrow)"/>
  <text class="d-label" x="200" y="130">writes back</text>
  <rect class="d-box-success" x="400" y="90" width="250" height="70" rx="10"/>
  <text class="d-code" x="525" y="118" text-anchor="middle">@Observable BudgetStore</text>
  <text class="d-label-muted" x="525" y="142" text-anchor="middle">owned once with @State</text>
  <path class="d-arrow" d="M400 110 L292 70" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="525" y="200" text-anchor="middle">views that read a property</text>
  <text class="d-label-muted" x="525" y="220" text-anchor="middle">update when it changes</text>
</svg>
:::

## @Observable: shared app data

A filter switch belongs to one screen. The list of expenses belongs to the whole app: the list shows it, the summary totals it, the add form appends to it. That's shared identity, which the structs lesson said calls for a class. Mark it with the `@Observable` macro from the Observation framework:

```swift title=BudgetStore.swift
import Observation
import Foundation

@Observable
final class BudgetStore {
    var expenses: [Expense] = []
    var monthlyLimit: Decimal = 1500

    var totalSpent: Decimal {
        expenses.reduce(0) { $0 + $1.amount }
    }

    var remaining: Decimal {
        monthlyLimit - totalSpent
    }

    func add(_ expense: Expense) {
        expenses.append(expense)
    }
}
```

No property wrappers on the properties, no publishers. The macro rewrites each stored property so SwiftUI can record which ones a `body` reads. A view that shows `store.remaining` reads `monthlyLimit` and `expenses` through it, so it updates when either changes; a view that only shows the limit ignores new expenses.

Notice that `totalSpent` and `remaining` are computed, not stored. It's tempting to keep a `var total` and update it in `add`, but then every future method that touches `expenses` (delete, edit, import) must remember to update it too, and one day one won't. Store the minimum facts and derive everything else. Observation tracks computed properties through the stored ones they read, so the screen stays correct for free.

Create the store once, near the top of the app, and own it with `@State`:

```swift title=PocketBudgetApp.swift
@main
struct PocketBudgetApp: App {
    @State private var store = BudgetStore()

    var body: some Scene {
        WindowGroup {
            ExpensesScreen(store: store)   // ExpensesScreen now has `let store: BudgetStore`
                .environment(store)
        }
    }
}
```

Child views can take the store as a plain `let store: BudgetStore` property and call `store.add(…)`; no wrapper is needed to read or call methods. For screens deep in the hierarchy, `.environment(store)` makes it available without threading it through every initializer, and a view picks it up with `@Environment(BudgetStore.self) private var store`.

## @Bindable: bindings into an observable object

A `TextField` that edits the monthly limit needs a binding to `store.monthlyLimit`. `@Bindable` provides it:

```swift
struct SettingsScreen: View {
    @Environment(BudgetStore.self) private var store

    var body: some View {
        @Bindable var store = store
        Form {
            TextField("Monthly limit", value: $store.monthlyLimit, format: .currency(code: "USD"))
                .keyboardType(.decimalPad)
        }
    }
}
```

When the store arrives as a property, write `@Bindable var store: BudgetStore` instead; the local form shown here is for objects that come from the environment.

:::note Older code: ObservableObject
Before iOS 17, the same job used `ObservableObject`, `@Published`, `@StateObject` and `@ObservedObject`. You'll meet them in older tutorials and codebases. New code should use `@Observable`: less ceremony, and views update only for the properties they read.
:::

To decide which wrapper to use, ask who owns the data. Does this view own a simple value? `@State`. Does it need to change a value someone else owns? `@Binding`. Is it shared app data? An `@Observable` class, owned once with `@State` and passed down. The next lesson puts the store to work in a real list with navigation and an add-expense form.
