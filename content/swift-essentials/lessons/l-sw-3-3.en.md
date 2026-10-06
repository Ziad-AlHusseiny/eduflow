---
summary: Show expenses in a List, push a detail screen with NavigationStack and value-based links, and collect new expenses in a validated Form presented as a sheet.
takeaways:
  - "`List` and `ForEach` need to tell rows apart, which is why your models conform to `Identifiable`."
  - "`NavigationLink(value:)` plus `.navigationDestination(for:)` separates what was tapped from which screen shows it."
  - Use a sheet for a self-contained task such as adding an expense, and dismiss it with the `dismiss` environment value.
  - A `TextField` with a `format:` turns typing into a typed value using the user's locale, instead of hand-parsing strings.
  - "A `Picker`'s `.tag` values must have exactly the same type as its `selection`, or the picker silently stops working."
further:
  - title: NavigationStack
    url: https://developer.apple.com/documentation/swiftui/navigationstack
  - title: Lists
    url: https://developer.apple.com/documentation/swiftui/lists
  - title: Form
    url: https://developer.apple.com/documentation/swiftui/form
quiz:
  - q: "You write `NavigationLink(value: expense)` but tapping a row does nothing. What's the most likely cause?"
    options:
      - text: "There's no `.navigationDestination(for: Expense.self)` inside the `NavigationStack`."
        why: Correct. A value link only says what was selected; the destination modifier decides what to show for it.
      - text: "`Expense` doesn't conform to `Codable`."
        why: Navigation values must be `Hashable`, not `Codable`. Codable only matters if you save the path.
      - text: The row needs an `.onTapGesture`.
        why: "`NavigationLink` handles the tap itself; adding a gesture can actually block it."
    answer: 0
  - q: "The category picker uses `selection: $category` where `category` is a `Category`, and its rows are tagged with `.tag(category.rawValue)`. What happens?"
    options:
      - text: It works, because SwiftUI converts raw values automatically.
        why: SwiftUI compares tags to the selection by type and value; a `String` never equals a `Category`.
      - text: The picker shows, but choosing a row never changes the selection.
        why: Correct. The tags are `String`s and the selection is a `Category`, so nothing matches. Tag with the enum value itself.
      - text: The build fails with a type error.
        why: "`.tag` accepts any `Hashable` value, so this compiles and fails quietly at runtime, which makes it nasty."
    answer: 1
  - q: "Why bind the amount field to a `Decimal?` with `format: .currency(code: \"USD\")` instead of a `String`?"
    options:
      - text: Strings can't be used with `TextField`.
        why: "`TextField(\"Title\", text: $title)` is the most common text field there is."
      - text: It makes the keyboard numeric automatically.
        why: The format doesn't change the keyboard; that's what `.keyboardType(.decimalPad)` is for.
      - text: The field parses the user's input with their locale and hands you a typed `Decimal`, so there's no string to parse.
        why: Correct. "12,50" in Germany becomes 12.5, and you never write a parser yourself.
    answer: 2
---

Pocket Budget has a store, a row view and state that drives the screen. Now it needs to become an app people can use: a list of this month's expenses, a tap that opens the details, and a plus button that opens a form. Those three patterns (list, push navigation and modal form) make up the skeleton of most iPhone apps you've used.

## A list of identifiable rows

```swift title=ExpensesScreen.swift
import SwiftUI

struct ExpensesScreen: View {
    let store: BudgetStore
    @State private var isAdding = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(store.expenses) { expense in
                    NavigationLink(value: expense) {
                        ExpenseRow(expense: expense)
                    }
                }
                .onDelete { offsets in
                    store.delete(at: offsets)
                }
            }
            .overlay {
                if store.expenses.isEmpty {
                    ContentUnavailableView("No expenses yet", systemImage: "tray",
                                           description: Text("Tap + to add your first one."))
                }
            }
            .navigationTitle("Expenses")
            .navigationDestination(for: Expense.self) { expense in
                ExpenseDetail(expense: expense)
            }
            .toolbar {
                Button("Add expense", systemImage: "plus") {
                    isAdding = true
                }
            }
            .sheet(isPresented: $isAdding) {
                AddExpenseView(store: store)
            }
        }
    }
}
```

That's the whole main screen; take it one piece at a time. `ForEach(store.expenses)` produces a row per expense. It needs a stable identity for each element so that, when an expense is inserted or deleted, SwiftUI animates the right row instead of redrawing everything, and that identity is the `id` that `Identifiable` requires. `.onDelete` adds swipe-to-delete and hands you the positions to remove; the store's `delete(at:)` is one line, `expenses.remove(atOffsets: offsets)`. That method is defined in SwiftUI, so `BudgetStore.swift` needs `import SwiftUI` alongside `Observation`.

`ContentUnavailableView` is the system's standard empty state. An empty list with no explanation looks broken; a short message and a hint at the next action looks finished.

## Navigation with values

`NavigationStack` manages a stack of screens: the list at the bottom, details pushed on top, and the system back button and swipe gesture for free.

Navigation is split into two halves. `NavigationLink(value: expense)` says *what* was tapped. `.navigationDestination(for: Expense.self)` says *which screen* shows an `Expense`. The value must be `Hashable`, which `Expense` already is. Keeping the two halves apart means the destination is declared once, however many places link to an expense, and it makes programmatic navigation possible:

```swift
@State private var path: [Expense] = []

// In body:
NavigationStack(path: $path) {
    // …the same List and modifiers as above
}

// Anywhere in this view, for example after saving:
path.append(newExpense)    // pushes ExpenseDetail
path.removeAll()           // pops back to the list
```

The path is plain state, so navigation becomes data you can inspect, test and change from code. That's how you'd open a specific expense from a notification, or jump back to the root after a multi-step flow. For screens with mixed destination types, `NavigationPath` plays the same role with type-erased values.

:::figure Push navigation and a modal sheet
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">Inside a NavigationStack, the Expenses list pushes the Expense detail screen when a row is tapped, and back pops it. Separately, the plus button presents the Add Expense form as a sheet, which is dismissed by Save or Cancel.</title>
  <rect class="d-box d-dashed" x="10" y="20" width="430" height="190" rx="14"/>
  <text class="d-label-muted" x="225" y="44" text-anchor="middle">NavigationStack</text>
  <rect class="d-box-primary" x="30" y="70" width="170" height="110" rx="10"/>
  <text class="d-label-strong" x="115" y="118" text-anchor="middle">Expenses</text>
  <text class="d-label-muted" x="115" y="142" text-anchor="middle">List</text>
  <rect class="d-box-accent" x="250" y="70" width="170" height="110" rx="10"/>
  <text class="d-label-strong" x="335" y="118" text-anchor="middle">Detail</text>
  <text class="d-label-muted" x="335" y="142" text-anchor="middle">pushed</text>
  <path class="d-arrow" d="M200 105 L248 105" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M250 150 L202 150" marker-end="url(#arrow)"/>
  <text class="d-label" x="225" y="96" text-anchor="middle">tap</text>
  <text class="d-label" x="225" y="172" text-anchor="middle">back</text>
  <rect class="d-box-success" x="500" y="70" width="180" height="110" rx="10"/>
  <text class="d-label-strong" x="590" y="118" text-anchor="middle">Add Expense</text>
  <text class="d-label-muted" x="590" y="142" text-anchor="middle">sheet</text>
  <path class="d-arrow" d="M200 85 C 300 0, 450 0, 520 68" marker-end="url(#arrow)"/>
  <text class="d-label" x="470" y="30" text-anchor="middle">+ button</text>
</svg>
:::

The detail screen can be a `Form` used for display, with `LabeledContent` rows that format values for you:

```swift
struct ExpenseDetail: View {
    let expense: Expense

    var body: some View {
        Form {
            LabeledContent("Amount", value: expense.amount, format: .currency(code: "USD"))
            LabeledContent("Category", value: expense.category.title)
            LabeledContent("Date", value: expense.date, format: .dateTime.day().month().year())
        }
        .navigationTitle(expense.title)
    }
}
```

## A form in a sheet

Pushing is for drilling into content. A **sheet** is for a self-contained task the user finishes or abandons, like adding an expense. `.sheet(isPresented: $isAdding)` shows the form whenever `isAdding` becomes true. Here's the form:

```swift title=AddExpenseView.swift
struct AddExpenseView: View {
    let store: BudgetStore
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var amount: Decimal?
    @State private var category: Category = .food
    @State private var date = Date.now

    private var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty && (amount ?? 0) > 0
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Title", text: $title)
                    TextField("Amount", value: $amount, format: .currency(code: "USD"))
                        .keyboardType(.decimalPad)
                }
                Section {
                    Picker("Category", selection: $category) {
                        ForEach(Category.allCases, id: \.self) { category in
                            Label(category.title, systemImage: category.symbolName)
                                .tag(category)
                        }
                    }
                    DatePicker("Date", selection: $date, in: ...Date.now, displayedComponents: .date)
                }
            }
            .navigationTitle("New Expense")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        guard let amount else { return }
                        store.add(Expense(title: title, amount: amount, category: category, date: date))
                        dismiss()
                    }
                    .disabled(!canSave)
                }
            }
        }
    }
}
```

The sheet wraps its form in its own `NavigationStack`. A sheet is a separate presentation that doesn't inherit the list's stack, and without one there's no bar to hold the title or the Cancel and Save buttons. Placing them with `.cancellationAction` and `.confirmationAction` puts them where iOS users expect.

Each field binds to its own `@State`, so the form is a draft: nothing touches the store until Save. Cancel throws the draft away. That's value semantics paying off again.

The amount field is the important one. `TextField(value:format:)` parses what the user types using their locale, so "12,50" in Germany becomes 12.5, and `amount` only ever holds a successfully parsed number, or `nil` while there isn't one. This replaces the lenient `Decimal(string:)` parsing from the optionals lesson. `guard let amount` in the Save action unwraps it, and `canSave` disables the button until both title and amount make sense, so invalid input can't be saved at all. The `in: ...Date.now` range stops future dates. `dismiss` comes from the environment and closes whatever presented this view.

:::mistake Picker tags of the wrong type
If `selection` is a `Category` but you write `.tag(category.rawValue)`, the code compiles, the picker shows, and choosing a row changes nothing, because a `String` tag never equals a `Category` selection. Tags must have exactly the selection's type. With an optional selection such as `Category?`, tag with `Optional(category)`.
:::

:::tip Validate by disabling, explain with text
A disabled Save button prevents bad data, but on its own it can leave people guessing. For anything less obvious than "fill in the title", add a short footer to the section saying what's missing.
:::

Pocket Budget is now a working app with a real flow from list to detail to form. It forgets everything when you quit, though, and it knows nothing beyond the phone. The final section fixes both, starting with how Swift runs work that takes time.
