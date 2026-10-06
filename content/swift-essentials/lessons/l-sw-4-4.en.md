---
summary: "Protect Pocket Budget's logic with Swift Testing using @Test, #expect, #require and parameterized tests, then archive the app and ship a build to testers with TestFlight."
takeaways:
  - "Swift Testing tests are plain functions marked `@Test`; `#expect` checks a condition and reports the actual values when it fails."
  - "`#require` stops a test early when a precondition fails, and also unwraps optionals so the rest of the test works with real values."
  - "`#expect(throws:)` checks that code throws a specific error, and `@Test(arguments:)` runs one test for many inputs."
  - Test pure logic first, such as budgets, parsing and formatting, because it's fast, stable and holds the rules users care about most.
  - TestFlight distributes builds to up to 100 internal testers without review, and up to 10,000 external testers after Beta App Review.
further:
  - title: Swift Testing
    url: https://developer.apple.com/documentation/testing
  - title: TestFlight
    url: https://developer.apple.com/testflight/
  - title: Distributing your app for beta testing and releases
    url: https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases
quiz:
  - q: "A test needs a parsed amount before it can check anything else, and `parseAmount` returns `Decimal?`. Which line fits best?"
    options:
      - text: "`let amount = parseAmount(\"12.50\")!`"
        why: A force unwrap crashes the whole test process on `nil` instead of failing one test with a clear message.
      - text: "`let amount = try #require(parseAmount(\"12.50\"))`"
        why: Correct. It unwraps the value, and if it's `nil` the test stops there and is reported as failed.
      - text: "`#expect(parseAmount(\"12.50\") != nil)`, then use the optional."
        why: The test would carry on after a failure and every later line would have to deal with the optional.
    answer: 1
  - q: "`#expect(food.spent == 57)` fails. What does Swift Testing report?"
    options:
      - text: "Only \"Expectation failed\", with no further detail."
        why: The macro captures the sub-expressions, so you also see the actual value.
      - text: Nothing; the test keeps running and passes at the end.
        why: A failed `#expect` is recorded as an issue, so the test fails even though it keeps running.
      - text: "The expression with its actual value, such as `(food.spent → 12) == 57`."
        why: Correct. Seeing the real value usually tells you the bug without a debugger.
    answer: 2
  - q: Who can install a TestFlight build without it going through Beta App Review?
    options:
      - text: Internal testers, who are members of your App Store Connect team.
        why: Correct. Internal testing exists for fast iteration within the team.
      - text: Anyone who opens your public link.
        why: Public links are for external testers, whose builds need Beta App Review first.
      - text: External testers you invite by email.
        why: External testers, however they're invited, need a build approved by Beta App Review.
    answer: 0
---

You've built Pocket Budget over fourteen lessons. Now picture changing `CategoryBudget` next month to support rollover between months. How do you know the over-limit rule still works? You could tap through the app every time, or you could have the computer check it in a fraction of a second, on every change, forever. Then, once it works, you need real people using it on real phones before you trust it with an App Store launch.

## Swift Testing in five minutes

Swift Testing is Apple's testing framework, built into Xcode 16 and later. When you create a project, pick Swift Testing as its testing system and Xcode adds a test target; for an existing project, choose File › New › Target › Unit Testing Bundle and pick Swift Testing. Test the budget logic from the error-handling lesson:

```swift title=PocketBudgetTests/CategoryBudgetTests.swift
import Testing
@testable import PocketBudget

struct CategoryBudgetTests {
    @Test func recordingAnExpenseIncreasesSpent() throws {
        var food = CategoryBudget(limit: 300)
        try food.record(title: "Groceries", amount: 64.2)
        #expect(food.spent == 64.2)
        #expect(food.limit - food.spent == 235.8)
    }

    @Test("Going over the limit throws and leaves the budget unchanged")
    func overLimitThrows() throws {
        var food = CategoryBudget(limit: 50)
        try food.record(title: "Lunch", amount: 12)

        #expect(throws: BudgetError.overLimit(by: 7)) {
            try food.record(title: "Dinner", amount: 45)
        }
        #expect(food.spent == 12)
    }
}
```

`@testable import` gives the tests access to your app's internal types. A test is any function marked `@Test`; the optional string is a readable name for the test navigator. Grouping tests in a struct makes it a **suite**, and each test gets a fresh instance, so tests can't leak state into each other.

`#expect` takes an ordinary Swift expression. When it fails, the report includes the actual values, for example `Expectation failed: (food.spent → 12) == 57`, which usually tells you what went wrong before you open the debugger. `#expect(throws:)` passes only if the closure throws that exact error. That's why `BudgetError` conforms to `Equatable` back in the error-handling lesson. Run everything with Cmd-U, or click the diamond next to a single test.

## #require and parameterized tests

```swift
@Test func parsesValidAmount() throws {
    let amount = try #require(parseAmount("12.50"))
    #expect(amount == 12.5)
}

@Test(arguments: ["", "abc", "0", "-3"])
func rejectsInvalidAmounts(text: String) {
    #expect(parseAmount(text) == nil)
}
```

`#require` is `#expect` with a stop button: if the condition fails, the test ends right there. Given an optional, it unwraps it, so the rest of the test uses a real `Decimal`. Use it for preconditions; use `#expect` for the actual claims, so one run reports every broken claim, not just the first.

`@Test(arguments:)` runs the same test once per input and reports each case separately. Four bad inputs, one function, and the failure tells you exactly which input broke.

:::mistake Force unwrapping in tests
`let amount = parseAmount("12.50")!` crashes the test process when the value is `nil`, and you lose the rest of the run along with a useful message. `try #require(…)` turns the same situation into one clearly reported failure.
:::

## What to test first

Start where bugs would hurt users and where tests are cheap: pure logic with no UI. In Pocket Budget that's budget arithmetic, amount parsing, currency conversion and `LoadState` transitions. Those tests run in milliseconds and never flake. For code that needs SwiftData, create the in-memory container from the previous lesson inside the test, and mark the test `@MainActor` when it touches the main context. Leave pixel-level UI checks for later; previews catch most layout problems faster.

:::figure From archive to testers
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">Archive in Xcode, upload to App Store Connect, wait for processing. Then internal testers get the build immediately, while external testers get it after Beta App Review. Testers install with the TestFlight app.</title>
  <rect class="d-box" x="10" y="80" width="120" height="60" rx="10"/>
  <text class="d-label-strong" x="70" y="108" text-anchor="middle">Archive</text>
  <text class="d-label-muted" x="70" y="128" text-anchor="middle">Xcode</text>
  <path class="d-arrow" d="M130 110 L158 110" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="160" y="80" width="130" height="60" rx="10"/>
  <text class="d-label-strong" x="225" y="108" text-anchor="middle">Upload</text>
  <text class="d-label-muted" x="225" y="128" text-anchor="middle">Organizer</text>
  <path class="d-arrow" d="M290 110 L318 110" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="320" y="80" width="140" height="60" rx="10"/>
  <text class="d-label-strong" x="390" y="108" text-anchor="middle">Processing</text>
  <text class="d-label-muted" x="390" y="128" text-anchor="middle">App Store Connect</text>
  <path class="d-arrow" d="M460 95 L518 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 125 L518 170" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="520" y="15" width="170" height="64" rx="10"/>
  <text class="d-label-strong" x="605" y="42" text-anchor="middle">Internal testers</text>
  <text class="d-label-muted" x="605" y="63" text-anchor="middle">up to 100, no review</text>
  <rect class="d-box-warn" x="520" y="140" width="170" height="64" rx="10"/>
  <text class="d-label-strong" x="605" y="167" text-anchor="middle">External testers</text>
  <text class="d-label-muted" x="605" y="188" text-anchor="middle">up to 10,000, reviewed</text>
</svg>
:::

## Shipping a beta with TestFlight

TestFlight is how you get a build onto other people's iPhones before release. You need a paid Apple Developer Program membership and an app record in App Store Connect with the same bundle identifier as your project. Then:

1. In the target's General settings, set the **Version** (what users see, such as 1.0) and the **Build** number (1, 2, 3…).
2. Choose a generic iOS device as the run destination, then Product › Archive.
3. In the Organizer window that opens, select the archive, click Distribute App and choose the App Store Connect option. Xcode signs and uploads the build.
4. Wait for App Store Connect to process it, usually minutes, and answer the export compliance question about encryption.
5. Add the build to a tester group. **Internal testers**, up to 100 people on your App Store Connect team, can install it right away. **External testers**, up to 10,000 people invited by email or a public link, get it after the build passes Beta App Review.

Testers install the free TestFlight app, accept the invite and install your beta. They can send feedback with screenshots straight from the app, and you'll find their reports, plus crash logs, in App Store Connect. Each build stays testable for 90 days.

:::tip Bump the build number every upload
App Store Connect rejects an upload whose build number it has already seen for that version. Increase **Build** before every archive, or let Xcode manage it during distribution. Keep **Version** for meaningful releases.
:::

That's the whole loop a professional iOS developer runs every week: model the data with types, build the screens in SwiftUI, fetch and store data safely under Swift 6's concurrency checks, prove the logic with tests and put builds in testers' hands. From here, good next steps are adding charts of spending by category with Swift Charts, syncing with iCloud through SwiftData, and preparing your App Store listing. You have the foundations for all of them.
