---
summary: Turn Expense into a SwiftData model, set up a model container, read with @Query, insert and delete through the model context, and edit saved objects with @Bindable.
takeaways:
  - "`@Model` turns a class into persisted data; SwiftData builds the storage schema from its stored properties."
  - "`.modelContainer(for:)` on the app's scene creates the database once and puts a model context in the environment."
  - "`@Query` fetches, sorts and filters models for a view and keeps the result up to date as data changes."
  - Insert and delete through `modelContext`; changes to a model's properties save automatically, including edits bound with `@Bindable`.
  - Use an in-memory container (`inMemory: true` or `isStoredInMemoryOnly`) for previews and tests so they never touch real data.
further:
  - title: SwiftData
    url: https://developer.apple.com/documentation/swiftdata
  - title: Preserving your app's model data across launches
    url: https://developer.apple.com/documentation/swiftdata/preserving-your-apps-model-data-across-launches
  - title: Query
    url: https://developer.apple.com/documentation/swiftdata/query
quiz:
  - q: Why does `Expense` change from a struct to a `final class` when it becomes a SwiftData model?
    options:
      - text: Classes are faster to save than structs.
        why: Speed isn't the reason. It's about identity.
      - text: "`@Model` requires a class, because a saved record has one identity that every screen observes and edits."
        why: Correct. Edit an expense in one view and every view showing it sees the change, which is reference semantics.
      - text: Structs can't contain `Decimal` or `Date` properties.
        why: Structs hold those types all the time; the earlier lessons used them.
    answer: 1
  - q: "A list uses `@Query private var expenses: [Expense]`. How do you remove an expense the user swiped away?"
    options:
      - text: "`expenses.remove(at: index)`"
        why: The query result is read-only; it reflects the store, it doesn't control it.
      - text: Set the expense's properties to empty values.
        why: That saves an empty expense; it doesn't delete anything.
      - text: "`context.delete(expenses[index])`, using the model context from the environment."
        why: Correct. Changes go through the context, and the query updates itself to match.
    answer: 2
  - q: "An edit screen binds a `TextField` to `$expense.title` through `@Bindable var expense: Expense`. When is the change saved?"
    options:
      - text: Automatically; the context tracks the change and autosaves it.
        why: Correct. SwiftData's main context autosaves, so editing the model is enough in most screens.
      - text: Only after you call `context.insert(expense)` again.
        why: The expense is already in the context; inserting again isn't how updates work.
      - text: Never, because bindings create a copy of the model.
        why: A model is a class, and the binding writes straight to the shared instance.
    answer: 0
  - q: Your SwiftUI preview of the expenses list should show sample data without touching the real database. What do you use?
    options:
      - text: "The app's normal `.modelContainer(for: Expense.self)`."
        why: That points at the same on-disk store the app uses; previews would read and write real data.
      - text: "`.modelContainer(for: Expense.self, inMemory: true)`, then insert sample expenses."
        why: Correct. The data lives only in memory and disappears when the preview ends.
      - text: A plain array instead of `@Query`.
        why: That previews a different view from the one you ship, which defeats the purpose.
    answer: 1
---

Add five expenses, quit Pocket Budget, open it again, and the list is empty. Everything lived in memory. Users expect their data to survive restarts, updates and a phone that ran out of battery mid-save. **SwiftData** is Apple's persistence framework built for Swift: you describe your model in code, and it handles the database, the schema and keeping SwiftUI in sync.

## Making Expense a model

```swift title=Expense.swift
import Foundation
import SwiftData

@Model
final class Expense {
    var title: String
    var amount: Decimal
    var category: Category
    var date: Date
    var note: String = ""

    init(title: String, amount: Decimal, category: Category, date: Date = .now) {
        self.title = title
        self.amount = amount
        self.category = category
        self.date = date
    }
}
```

Two things changed from the struct you've used since the modelling section. First, `@Model` requires a **class**. A saved expense has one identity: the list, the detail screen and the edit form must all see the same record, which is the reference semantics you learned to reach for when data is shared. Second, you write an initializer yourself, because classes don't get a memberwise one.

`@Model` makes the class conform to `PersistentModel`, which brings `Identifiable` and `Hashable`, so `ForEach` and `NavigationLink(value:)` keep working unchanged. The `Category` enum needs to conform to `Codable` to be stored; add it to its declaration. You can delete the `id` property: SwiftData gives every model a persistent identifier.

## One container for the app

```swift title=PocketBudgetApp.swift
@main
struct PocketBudgetApp: App {
    var body: some Scene {
        WindowGroup {
            ExpensesScreen()
        }
        .modelContainer(for: Expense.self)
    }
}
```

The **model container** owns the database file and the schema. Creating it once on the scene also puts a **model context** into the environment. The context is your workspace: it tracks inserted, changed and deleted models and writes them to disk. The main context saves automatically, so most apps never call `save()` by hand.

Create the container in exactly one place. A `ModelContainer` built inside a view's `body` or initializer gets recreated whenever SwiftUI rebuilds that view, and each copy opens the store again. Put it on the scene, as here, and every view below shares the same one.

:::figure Container, context and queries
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">The ModelContainer owns the store on disk. Its main ModelContext sits in the SwiftUI environment. Views read through Query and write through the context with insert and delete; the context autosaves to the store and Query results update.</title>
  <rect class="d-box" x="20" y="70" width="150" height="80" rx="10"/>
  <text class="d-label-strong" x="95" y="105" text-anchor="middle">Store on disk</text>
  <text class="d-label-muted" x="95" y="128" text-anchor="middle">SQLite file</text>
  <rect class="d-box-primary" x="215" y="70" width="170" height="80" rx="10"/>
  <text class="d-code" x="300" y="105" text-anchor="middle">ModelContext</text>
  <text class="d-label-muted" x="300" y="128" text-anchor="middle">autosaves</text>
  <path class="d-arrow" d="M215 110 L172 110" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="460" y="20" width="220" height="70" rx="10"/>
  <text class="d-code" x="570" y="50" text-anchor="middle">@Query expenses</text>
  <text class="d-label-muted" x="570" y="72" text-anchor="middle">reads, stays up to date</text>
  <rect class="d-box-accent" x="460" y="130" width="220" height="70" rx="10"/>
  <text class="d-code" x="570" y="160" text-anchor="middle">context.insert / delete</text>
  <text class="d-label-muted" x="570" y="182" text-anchor="middle">writes</text>
  <path class="d-arrow" d="M385 95 L458 60" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M458 165 L387 130" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="300" y="200" text-anchor="middle">created once by .modelContainer(for:)</text>
</svg>
:::

## Reading with @Query, writing through the context

```swift title=ExpensesScreen.swift
struct ExpensesScreen: View {
    @Query(sort: \Expense.date, order: .reverse) private var expenses: [Expense]
    @Environment(\.modelContext) private var context

    var body: some View {
        NavigationStack {
            List {
                ForEach(expenses) { expense in
                    NavigationLink(value: expense) {
                        Text(expense.title)
                    }
                }
                .onDelete { offsets in
                    for index in offsets {
                        context.delete(expenses[index])
                    }
                }
            }
            .navigationTitle("Expenses")
            .navigationDestination(for: Expense.self) { expense in
                EditExpenseView(expense: expense)
            }
        }
    }
}
```

`@Query` fetches every `Expense`, newest first, and re-runs whenever the stored data changes, so a delete or insert anywhere in the app updates this list on its own. The query result is read-only: you change data through the context. In the add form from the SwiftUI section, the Save button now calls `context.insert(Expense(title: title, amount: amount, category: category, date: date))` instead of `store.add(...)`. The expenses no longer live in `BudgetStore`; it keeps app settings such as the monthly limit and the exchange rates.

:::mistake Editing the query result
`expenses.remove(atOffsets: offsets)` doesn't compile, because `@Query` exposes a read-only array. And removing items from a copy wouldn't delete anything from the database anyway. Always go through `context.delete`, and the query catches up.
:::

## Editing with @Bindable

A model is an observable class, so `@Bindable` gives you bindings straight into it:

```swift
struct EditExpenseView: View {
    @Bindable var expense: Expense

    var body: some View {
        Form {
            TextField("Title", text: $expense.title)
            TextField("Amount", value: $expense.amount, format: .currency(code: "USD"))
            DatePicker("Date", selection: $expense.date, displayedComponents: .date)
        }
        .navigationTitle(expense.title)
    }
}
```

There's no Save button. Typing changes the model, the context notices and autosaves, and the list behind updates too. If you want Cancel semantics instead, copy the values into `@State` drafts as the add form does, and write them back on Save.

## Filtering

Pass a predicate to `@Query` to fetch a subset. When the filter depends on a value the view receives, build the query in `init`:

```swift
struct RecentExpensesView: View {
    @Query private var recent: [Expense]

    init(since start: Date) {
        _recent = Query(filter: #Predicate<Expense> { $0.date >= start },
                        sort: \.date, order: .reverse)
    }

    var body: some View {
        List(recent) { Text($0.title) }
    }
}
```

`#Predicate` is checked at compile time and translated into a database query, so filtering happens in storage rather than in a Swift loop. Keep predicates to simple stored properties such as dates, numbers and strings. Filtering on enum properties inside a predicate has historically been unreliable, so filter categories in Swift after fetching, or store the category's raw value as a `String` if you need to query by it.

:::tip Previews and tests get their own store
`.modelContainer(for: Expense.self, inMemory: true)` in a `#Preview` gives you a throwaway database, so you can insert sample expenses without polluting real data. Tests do the same with `ModelContainer(for: Expense.self, configurations: ModelConfiguration(isStoredInMemoryOnly: true))`.
:::

Adding a new property later, like `note` above, works without extra code when it has a default value: SwiftData migrates the store automatically. A rename needs a hint, `@Attribute(originalName: "oldName")`, so the old column carries over; changing a property's type needs a versioned schema and a migration plan, which you can postpone until you have real users with real data.

Pocket Budget now survives restarts. The last lesson makes sure it keeps working as you change it, with Swift Testing, and gets it onto other people's phones through TestFlight.
