---
summary: Build SwiftUI views as small structs, lay them out with stacks, style them with modifiers in the right order, and check them instantly with previews.
takeaways:
  - A SwiftUI view is a lightweight struct whose `body` describes what the screen should look like for the current data.
  - VStack, HStack and ZStack arrange children vertically, horizontally and in layers; `Spacer` pushes content apart.
  - Each modifier wraps the view in a new one, so order matters; `padding` before `background` paints behind the padding.
  - Extract a subview as soon as a `body` gets hard to read; small views cost nothing at runtime.
further:
  - title: Configuring views
    url: https://developer.apple.com/documentation/swiftui/configuring-views
  - title: SwiftUI Tutorials
    url: https://developer.apple.com/tutorials/swiftui
quiz:
  - q: "What does `Text(\"Food\").background(.blue).padding()` look like?"
    options:
      - text: Blue fills the text and the padding around it.
        why: That would be `.padding().background(.blue)`. Here the background is applied before the padding exists.
      - text: Blue fills only the text's own frame, with clear space around it.
        why: Correct. `background` wraps the text, then `padding` adds empty space outside that coloured view.
      - text: SwiftUI reorders modifiers, so it looks the same either way.
        why: SwiftUI applies modifiers in exactly the order you write them; each one wraps the previous result.
    answer: 1
  - q: Why is `body` declared as `some View` instead of a specific type?
    options:
      - text: Because a view can change type at runtime.
        why: The type is fixed at compile time. `some` hides a name, it doesn't make the type dynamic.
      - text: "Because the real type is a long nested generic that you'd never want to write by hand."
        why: Correct. The compiler knows the exact type; `some View` saves you from spelling it.
      - text: Because `View` is a class and `some` makes it a struct.
        why: "`View` is a protocol, and your views are structs either way."
    answer: 1
  - q: "A row's `body` has grown to 70 lines. What does an experienced SwiftUI developer do?"
    options:
      - text: Leave it; splitting views costs performance.
        why: Views are cheap value types. Splitting them has no meaningful runtime cost and often helps SwiftUI update less.
      - text: Move parts into computed properties that return `AnyView`.
        why: "`AnyView` erases type information that SwiftUI uses to diff efficiently. Use a subview struct instead."
      - text: Extract meaningful pieces into their own small `View` structs.
        why: Correct. Named subviews read like an outline of the screen and can be previewed on their own.
    answer: 2
---

If you've used UIKit, or manipulated the DOM by hand, you're used to telling the screen what to change: set this label's text, hide that button, insert a row. SwiftUI flips that around. You describe what the screen should look like for the current data, and SwiftUI works out what changed and updates the pixels. Your job shrinks to writing that description well.

## A view is a struct with a body

Here is the row Pocket Budget shows for each expense, using the `Expense` and `Category` types from the previous section:

```swift title=ExpenseRow.swift
import SwiftUI

struct ExpenseRow: View {
    let expense: Expense

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: expense.category.symbolName)
                .font(.title3)
                .frame(width: 32)
                .foregroundStyle(.tint)

            VStack(alignment: .leading, spacing: 2) {
                Text(expense.title)
                    .font(.headline)
                Text(expense.date, format: .dateTime.day().month())
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(expense.amount, format: .currency(code: "USD"))
                .font(.body.monospacedDigit())
        }
        .padding(.vertical, 4)
    }
}
```

`ExpenseRow` conforms to the `View` protocol, whose one requirement is `body`. It's a struct, so it's cheap to create, and SwiftUI creates and discards them constantly. Don't think of a view struct as the thing on screen; think of it as a recipe that SwiftUI reads whenever the data changes.

`some View` is the opaque type from the protocols lesson. The real type of that `body` is a deeply nested generic built from every stack and modifier, and `some View` lets the compiler track it without you writing it out.

## Stacks and spacers

Three containers handle most layouts. `HStack` places children left to right (right to left in Arabic and Hebrew, automatically), `VStack` top to bottom, and `ZStack` layers them front to back. `alignment` and `spacing` control how children line up. `Spacer()` expands to fill free space, which is how the amount ends up pinned to the trailing edge.

`Text` can format values for you: `Text(expense.amount, format: .currency(code: "USD"))` and `Text(expense.date, format: .dateTime.day().month())` follow the user's locale, so a user in Cairo or Berlin sees separators and date order they expect. `.monospacedDigit()` keeps columns of amounts aligned.

## Modifiers wrap views

`.font(.headline)` doesn't change the text in place. It returns a new view that wraps the text and applies a font. Chain three modifiers and you've built three layers. That's why order matters:

```swift
Text("Food")
    .padding()
    .background(.blue)      // blue covers the text AND the padding

Text("Food")
    .background(.blue)      // blue covers only the text
    .padding()              // clear space outside the blue
```

:::figure Each modifier wraps the view before it
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">Left: padding first, then background, so the blue layer encloses both the text and its padding. Right: background first, then padding, so the blue layer hugs the text and the padding is outside it.</title>
  <text class="d-label-strong" x="170" y="24" text-anchor="middle">.padding().background(.blue)</text>
  <rect class="d-box-accent" x="70" y="45" width="200" height="120" rx="8"/>
  <rect class="d-box" x="120" y="85" width="100" height="40" rx="4"/>
  <text class="d-code" x="170" y="110" text-anchor="middle">Food</text>
  <text class="d-label-muted" x="170" y="190" text-anchor="middle">blue includes the padding</text>
  <text class="d-label-strong" x="510" y="24" text-anchor="middle">.background(.blue).padding()</text>
  <rect class="d-box d-dashed" x="410" y="45" width="200" height="120" rx="8"/>
  <rect class="d-box-accent" x="460" y="85" width="100" height="40" rx="4"/>
  <text class="d-code" x="510" y="110" text-anchor="middle">Food</text>
  <text class="d-label-muted" x="510" y="190" text-anchor="middle">padding is outside the blue</text>
</svg>
:::

Read a modifier chain from top to bottom as "take this, then wrap it in that". Some modifiers, such as `.font` and `.foregroundStyle`, flow down to every child, which is why setting `.font(.title3)` on a `VStack` styles all the text inside it.

:::mistake Fighting modifier order
When a background, border or tap area is the wrong size, the cause is almost always order. A frequent example is `.onTapGesture` before `.padding()`: the padding wraps the tappable view from outside, so taps on it do nothing. Move the gesture after the padding (adding `.contentShape(Rectangle())` if the area is empty space) rather than stacking another frame to compensate.
:::

## Logic in a body

Because `body` is a description, plain Swift decides what's in it. An `if` includes a view only when a condition holds, and a `switch` picks between views:

```swift
HStack {
    Text(expense.title)
    if expense.amount > 100 {
        Image(systemName: "exclamationmark.circle")
            .foregroundStyle(.orange)
            .accessibilityLabel("Large expense")
    }
}
```

There's no "show" or "hide" call anywhere. When the amount changes, SwiftUI reads `body` again and the icon appears or disappears on its own. Keep a body free of side effects, such as network calls or printing, because SwiftUI may read it many times and at moments you don't control.

## Previews

Add a preview to the bottom of the file:

```swift
#Preview {
    ExpenseRow(expense: Expense(title: "Groceries", amount: 64.2, category: .food, date: .now))
        .padding()
}
```

Xcode renders it in the canvas next to your code and updates as you type. Previews are the fastest feedback loop in iOS development. Add one for each interesting state, such as a long title, a large amount or right-to-left layout, and you catch layout bugs before you ever launch the simulator.

## Small views, composed

When a `body` passes about a screenful, extract pieces into their own structs:

```swift
struct CategoryBadge: View {
    let category: Category

    var body: some View {
        Text(category.title)
            .font(.caption.bold())
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(.blue.opacity(0.15), in: Capsule())
            .foregroundStyle(.blue)
    }
}
```

Now `CategoryBadge(category: expense.category)` can appear in the row, the detail screen and a filter bar, styled identically. Extraction is free at runtime and gives SwiftUI smaller units to compare when data changes.

:::tip Semantic styles first
Prefer `.headline`, `.secondary` and `.tint` over fixed point sizes and hex colours. They adapt to Dynamic Type, dark mode and accessibility settings without extra work.
:::

Everything in this lesson shows fixed data. Real screens change: the user types, toggles and adds expenses. The next lesson introduces state, the data that drives those changes, and how SwiftUI knows when to redraw.
