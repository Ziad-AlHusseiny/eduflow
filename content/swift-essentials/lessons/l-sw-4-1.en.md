---
summary: Write async functions, start work from SwiftUI with .task, run calls in parallel with async let and task groups, and read Swift 6 data-race errors about actors and Sendable.
takeaways:
  - "`await` marks a point where a function may pause; the thread is free to do other work, such as keeping the UI responsive, while it waits."
  - "Start async work from a view with `.task`, which SwiftUI cancels automatically when the view disappears."
  - "`async let` and task groups run work in parallel as child tasks that must finish, or be cancelled, before their parent returns."
  - Swift 6 refuses to compile code where two tasks could touch the same mutable state at once; actors and `Sendable` types are how you satisfy it.
  - Keep UI state on the main actor with `@MainActor`; new Xcode projects make main-actor isolation the default for app code.
further:
  - title: Concurrency (The Swift Programming Language)
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/
  - title: Swift 6 Migration Guide
    url: https://www.swift.org/migration/documentation/migrationguide/
  - title: Updating an app to use strict concurrency
    url: https://developer.apple.com/documentation/swift/updating-an-app-to-use-strict-concurrency
quiz:
  - q: "A view loads exchange rates in `.task { await store.loadEuroRate() }`. The user leaves the screen before the request finishes. What happens?"
    options:
      - text: The task keeps running and updates the store later.
        why: That's what an unstructured `Task { }` inside a button would do. `.task` is tied to the view's lifetime.
      - text: SwiftUI cancels the task, and cancellation-aware calls like `Task.sleep` or URLSession requests throw.
        why: Correct. Cancellation is cooperative; well-behaved async APIs notice it and stop early.
      - text: The app crashes because the view no longer exists.
        why: The task holds what it needs; it doesn't depend on the view struct staying around.
    answer: 1
  - q: "`async let eur = fetch(\"EUR\")` and `async let gbp = fetch(\"GBP\")`, each taking about 300 ms, followed by `try await (eur, gbp)`. Roughly how long does it take?"
    options:
      - text: About 300 ms, because both requests run at the same time.
        why: Correct. Each `async let` starts a child task immediately; the `await` collects both results.
      - text: About 600 ms, because each `await` waits in turn.
        why: That's two plain `try await` calls in sequence. `async let` starts both before either is awaited.
      - text: Instantly, because `async let` doesn't wait.
        why: The work still takes time; `async let` only lets it overlap.
    answer: 0
  - q: "Why can you call `await cache.save(rate, for: \"EUR\")` on an actor from many tasks at once without a data race?"
    options:
      - text: Actors copy themselves for each caller.
        why: Actors are reference types and are never copied; there's one instance with one set of state.
      - text: Actors lock the whole app while they run.
        why: Only that actor's state is protected, and only one task at a time runs code on it.
      - text: The actor runs one call at a time on its state, so callers wait their turn with `await`.
        why: Correct. That serialization is why every outside call to an actor needs `await`.
    answer: 2
  - q: Which type is `Sendable` without you writing anything extra?
    options:
      - text: "A `final class` with a `var` property."
        why: Mutable shared state is exactly what `Sendable` rules out; the compiler won't infer it.
      - text: A non-public struct whose stored properties are all `Sendable`, such as `String` and `Decimal`.
        why: Correct. Value types made of Sendable values can be copied safely across tasks, so Swift infers it.
      - text: Any class marked `@Observable`.
        why: Observable classes are mutable and not Sendable unless they're isolated to an actor such as `@MainActor`.
    answer: 1
---

Pocket Budget is about to call a server for exchange rates. A request might take 200 milliseconds or eight seconds on a train. If the main thread, which draws the UI and handles touches, sat waiting for it, the app would freeze and iOS might eventually kill it. Swift's concurrency model lets you write code that waits without blocking, in a style that reads top to bottom, and Swift 6 adds a compiler that proves your concurrent code has no data races.

## async and await

```swift title=RateService.swift
import Foundation

struct RateService {
    func fetchRate(from base: String, to target: String) async throws -> Decimal {
        try await Task.sleep(for: .milliseconds(300))   // stands in for a network call
        return target == "EUR" ? 0.92 : 0.79
    }
}
```

`async` in the signature means "this function can pause". Every call to it is marked `await`, which marks a **suspension point**: the function may pause there, the thread goes off to do other work (like scrolling a list), and the function resumes when the result is ready. `async` combines with `throws`, so the call is `try await`. In the next lesson the `Task.sleep` becomes a real request.

## Starting async work from SwiftUI

Async functions can only be called from an async context. SwiftUI gives you one with the `.task` modifier:

```swift
@MainActor
@Observable
final class BudgetStore {
    var expenses: [Expense] = []
    var euroRate: Decimal?
    var isLoadingRate = false
    private let rates = RateService()

    func loadEuroRate() async {
        isLoadingRate = true
        defer { isLoadingRate = false }
        do {
            euroRate = try await rates.fetchRate(from: "USD", to: "EUR")
        } catch {
            euroRate = nil
        }
    }
}

struct RateBanner: View {
    let store: BudgetStore

    var body: some View {
        Group {
            if store.isLoadingRate {
                ProgressView()
            } else if let rate = store.euroRate {
                Text("1 USD = \(rate.formatted()) EUR")
            } else {
                Text("Rate unavailable")
            }
        }
        .task {
            await store.loadEuroRate()
        }
    }
}
```

`.task` starts when the view appears and is **cancelled** automatically when it disappears, so a user who leaves the screen doesn't leave a request running in the background. For a button tap, wrap the call in `Task { await store.loadEuroRate() }`, which starts new top-level work. `defer` resets the loading flag however the function exits.

## Structured concurrency: parallel children

Two independent requests shouldn't wait for each other. `async let` starts work immediately and lets you collect it later:

```swift
func loadBothRates(using service: RateService) async throws -> (eur: Decimal, gbp: Decimal) {
    async let eur = service.fetchRate(from: "USD", to: "EUR")
    async let gbp = service.fetchRate(from: "USD", to: "GBP")
    return try await (eur, gbp)
}
```

Both requests run at the same time, so this takes about 300 ms instead of 600. For a number of tasks you only know at runtime, use a task group:

```swift
func loadRates(for codes: [String], using service: RateService) async throws -> [String: Decimal] {
    try await withThrowingTaskGroup(of: (String, Decimal).self) { group in
        for code in codes {
            group.addTask {
                (code, try await service.fetchRate(from: "USD", to: code))
            }
        }
        var rates: [String: Decimal] = [:]
        for try await (code, rate) in group {
            rates[code] = rate
        }
        return rates
    }
}
```

This is **structured** concurrency: child tasks live inside their parent's scope. The function can't return while a child is still running, if one child throws the others are cancelled, and cancelling the parent cancels every child. Notice that each child *returns* its result and the parent assembles the dictionary. Children never write to shared state.

## Data races and the Swift 6 compiler

A **data race** happens when two threads access the same memory at the same time and at least one writes. The result is corrupted data or a crash that appears once in a thousand runs. Swift 6 language mode turns the checks for this into compile errors, organised around **isolation**: every piece of mutable state belongs to exactly one domain, and only code in that domain may touch it directly.

:::figure Isolation domains in Pocket Budget
<svg viewBox="0 0 700 240" role="img" aria-labelledby="t1">
  <title id="t1">Three isolation domains. The main actor holds the views and BudgetStore. The RateCache actor holds the cached rates. Child tasks fetch rates concurrently. Only Sendable values, such as a Decimal rate, cross between domains, and every crossing is an await.</title>
  <rect class="d-box-primary" x="15" y="30" width="220" height="150" rx="12"/>
  <text class="d-label-strong" x="125" y="58" text-anchor="middle">@MainActor</text>
  <text class="d-code" x="125" y="95" text-anchor="middle">Views</text>
  <text class="d-code" x="125" y="125" text-anchor="middle">BudgetStore</text>
  <rect class="d-box-accent" x="465" y="30" width="220" height="150" rx="12"/>
  <text class="d-label-strong" x="575" y="58" text-anchor="middle">actor RateCache</text>
  <text class="d-code" x="575" y="105" text-anchor="middle">rates: [String: Decimal]</text>
  <rect class="d-box-success" x="265" y="70" width="170" height="70" rx="12"/>
  <text class="d-label-strong" x="350" y="100" text-anchor="middle">child tasks</text>
  <text class="d-label-muted" x="350" y="122" text-anchor="middle">fetch in parallel</text>
  <path class="d-arrow" d="M265 90 L237 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M435 90 L463 90" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="215" text-anchor="middle">Only Sendable values cross the boundaries, and each crossing is an await</text>
</svg>
:::

Three tools cover almost every case in an app:

**The main actor.** `@MainActor` isolates a type to the main thread. UI state belongs there, which is why `BudgetStore` is marked `@MainActor` above: the views that read it run on the main actor, and now the compiler guarantees nothing else writes to it. New app projects in Xcode 26 and later set the **Default Actor Isolation** build setting to `MainActor`, so your app code is main-actor isolated unless you say otherwise. It's a sensible default: most app code is UI code.

**Actors.** An `actor` is a reference type that protects its own state by running one call at a time. Code outside the actor must `await` to reach it:

```swift
actor RateCache {
    private var rates: [String: Decimal] = [:]

    func rate(for code: String) -> Decimal? {
        rates[code]
    }

    func save(_ rate: Decimal, for code: String) {
        rates[code] = rate
    }
}

// From anywhere: await cache.save(0.92, for: "EUR")
```

**Sendable values.** A type is `Sendable` when it's safe to pass between domains. Value types made of Sendable parts (`String`, `Decimal`, your `Expense` struct) qualify automatically, as do actors and main-actor-isolated classes. A plain class with `var` properties doesn't, and the compiler stops you from sharing one between tasks.

:::mistake Sharing a mutable object between child tasks
Writing `group.addTask { tally.total += amount }`, where `tally` is an ordinary class, fails to build in Swift 6: the compiler reports that passing the closure "risks causing data races", or, under main-actor default isolation, that a main actor-isolated property can't be mutated from a nonisolated context. Don't silence it. Have each child return its value and combine the results in the parent, or move the state into an actor.
:::

:::note Making it approachable
Swift 6.2 introduced a set of options Xcode calls **Approachable Concurrency**. With them, a `nonisolated` async function runs on the actor of whoever called it unless you mark it `@concurrent`, which means most app code stays on the main actor and only work you choose moves off it. You'll see these settings in a new project's build settings; leave them on.
:::

That's the vocabulary: `async`, `await`, tasks, actors, `Sendable`. You don't need to master every rule at once; read each compiler error as a question about which domain owns the data. Next you replace the pretend `Task.sleep` with a real request and decode the JSON it returns.
