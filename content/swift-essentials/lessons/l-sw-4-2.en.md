---
summary: Fetch JSON with URLSession's async API, check the HTTP status, decode it into Codable structs, and show loading, loaded and failed states in SwiftUI.
takeaways:
  - "`try await URLSession.shared.data(from: url)` returns the body and the response; it throws for network failures but not for HTTP errors like 404 or 500."
  - Always check the `HTTPURLResponse` status code before decoding, and turn a bad status into your own error.
  - Mirror the JSON with `Decodable` structs; `keyDecodingStrategy` and `dateDecodingStrategy` handle snake_case keys and ISO 8601 dates.
  - Model the screen's lifecycle as a `LoadState` enum so loading, data and errors can never be shown at the same time.
further:
  - title: Fetching website data into memory
    url: https://developer.apple.com/documentation/foundation/fetching-website-data-into-memory
  - title: Encoding and Decoding Custom Types
    url: https://developer.apple.com/documentation/foundation/encoding-and-decoding-custom-types
  - title: URLSession
    url: https://developer.apple.com/documentation/foundation/urlsession
quiz:
  - q: "The server answers a request with HTTP 500 and an HTML error page. What does `try await URLSession.shared.data(from: url)` do?"
    options:
      - text: It throws a `URLError` with the status code.
        why: URLSession only throws when the request couldn't complete. A 500 is a complete response.
      - text: It returns the HTML as `data` and a response whose `statusCode` is 500.
        why: Correct. That's why you check the status yourself before decoding.
      - text: It retries automatically until it gets a 200.
        why: URLSession doesn't retry on HTTP errors; retry policy is up to you.
    answer: 1
  - q: "The JSON has a key `updated_at`, and your struct has `let updatedAt: Date`. Decoding fails with `keyNotFound`. What's the smallest fix?"
    options:
      - text: Rename the property to `updated_at`.
        why: It works, but it drags the server's naming style into your Swift code.
      - text: "Make the property optional: `let updatedAt: Date?`."
        why: The error disappears, but the date is now always `nil` because the key still doesn't match.
      - text: "Set `decoder.keyDecodingStrategy = .convertFromSnakeCase`."
        why: Correct. The decoder maps `updated_at` to `updatedAt` for every key, so your Swift names stay idiomatic.
    answer: 2
  - q: Why does the rates screen use one `LoadState` enum instead of `isLoading`, `rates` and `errorMessage` properties?
    options:
      - text: Separate properties allow impossible combinations, such as loading and failed at once; the enum allows exactly one state.
        why: Correct. The view switches over the enum and handles each state exactly once.
      - text: SwiftUI can only observe one property per class.
        why: Observation tracks every property a body reads; that's not the reason.
      - text: Enums make network requests faster.
        why: The enum changes how state is modelled, not how fast the request runs.
    answer: 0
---

Pocket Budget records expenses in dollars, but you spend money on holiday in euros and Egyptian pounds. To convert, the app needs today's exchange rates from a server. This lesson replaces the pretend `Task.sleep` from the last lesson with a real request: build a URL, fetch the data, check the response, decode the JSON into Swift types and show it. Those steps are the same for nearly every API you will ever call.

The examples use a stand-in endpoint, `https://api.example.com/v1/latest?base=USD`. Swap in a real exchange-rate provider (most have a free tier) and adjust the struct to match its JSON. The response looks like this:

```json
{
  "base": "USD",
  "updated_at": "2026-10-02T06:00:00Z",
  "rates": { "EUR": 0.92, "GBP": 0.79, "EGP": 48.31 }
}
```

## Mirror the JSON with Codable

```swift title=RatesResponse.swift
import Foundation

struct RatesResponse: Decodable {
    let base: String
    let updatedAt: Date
    let rates: [String: Decimal]
}
```

`Decodable` asks the compiler to generate the code that reads this type from an external format. Property names must match the JSON keys and the types must fit: a JSON object becomes a dictionary, a number can decode into `Decimal`, and a missing key or wrong type throws a `DecodingError` that names the problem. Use `Codable` (`Decodable` plus `Encodable`) when you also send the type back. The struct is made of `Sendable` parts, so it's `Sendable` too and can travel safely from the network code to the main actor.

The JSON says `updated_at`; Swift style says `updatedAt`. Rather than renaming properties, configure the decoder, as the client below does.

## Fetch, check, decode

```swift title=RateClient.swift
enum RateError: Error {
    case badStatus(Int)
}

struct RateClient {
    let endpoint = URL(string: "https://api.example.com/v1/latest")!

    func latest(base: String) async throws -> RatesResponse {
        let url = endpoint.appending(queryItems: [URLQueryItem(name: "base", value: base)])

        let (data, response) = try await URLSession.shared.data(from: url)

        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard status == 200 else {
            throw RateError.badStatus(status)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(RatesResponse.self, from: data)
    }
}
```

Walk through it in order. `appending(queryItems:)` builds `...latest?base=USD` and percent-encodes values for you, which is safer than gluing strings together. The force unwrap on `URL(string:)` is the acceptable kind from the optionals lesson: a literal you wrote, where `nil` would mean a typo.

`URLSession.shared.data(from:)` is the async API: it suspends until the whole response has arrived and returns the body bytes plus a `URLResponse`. It throws for transport failures, such as no connection, a timeout or cancellation, but it does **not** throw for HTTP errors. That's what the `guard` is for.

`.convertFromSnakeCase` maps `updated_at` to `updatedAt` for every key, and `.iso8601` reads the timestamp format most APIs use. Then `decode` either returns a fully formed `RatesResponse` or throws.

:::figure From URL to pixels
<svg viewBox="0 0 700 170" role="img" aria-labelledby="t1">
  <title id="t1">Five steps left to right: build the URL, fetch with data(from:), check the status code, decode JSON into RatesResponse, then set state on the main actor so the view updates.</title>
  <rect class="d-box" x="5" y="50" width="120" height="64" rx="10"/>
  <text class="d-label-strong" x="65" y="78" text-anchor="middle">Build URL</text>
  <text class="d-label-muted" x="65" y="99" text-anchor="middle">query items</text>
  <path class="d-arrow" d="M125 82 L143 82" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="145" y="50" width="125" height="64" rx="10"/>
  <text class="d-label-strong" x="207" y="78" text-anchor="middle">Fetch</text>
  <text class="d-code" x="207" y="99" text-anchor="middle">data(from:)</text>
  <path class="d-arrow" d="M270 82 L288 82" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="290" y="50" width="120" height="64" rx="10"/>
  <text class="d-label-strong" x="350" y="78" text-anchor="middle">Check</text>
  <text class="d-label-muted" x="350" y="99" text-anchor="middle">status 200</text>
  <path class="d-arrow" d="M410 82 L428 82" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="430" y="50" width="120" height="64" rx="10"/>
  <text class="d-label-strong" x="490" y="78" text-anchor="middle">Decode</text>
  <text class="d-label-muted" x="490" y="99" text-anchor="middle">JSONDecoder</text>
  <path class="d-arrow" d="M550 82 L568 82" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="570" y="50" width="125" height="64" rx="10"/>
  <text class="d-label-strong" x="632" y="78" text-anchor="middle">Show</text>
  <text class="d-label-muted" x="632" y="99" text-anchor="middle">main actor</text>
  <text class="d-label-muted" x="350" y="150" text-anchor="middle">Any step can throw; one catch in the model turns it into the failed state</text>
</svg>
:::

:::mistake Decoding without checking the status
Skip the status check and a 500 response sends an HTML error page into `JSONDecoder`, which throws a confusing "data couldn't be read because it isn't in the correct format". You spend an hour debugging the decoder when the server told you exactly what went wrong. Check the status first, and include it in your error.
:::

Not every failure deserves the same message, either. A thrown `URLError` carries a `code`, so you can tell "offline" (`.notConnectedToInternet`) apart from "timed out" (`.timedOut`) and say "You're offline. Rates will refresh when you reconnect" instead of a generic apology. Users forgive an app that explains itself.

## Loading states the view can trust

The enum idea from the enums lesson now pays off. A model on the main actor owns the state, and the view switches over it:

```swift title=RatesModel.swift
@MainActor
@Observable
final class RatesModel {
    enum LoadState {
        case idle
        case loading
        case loaded(RatesResponse)
        case failed(String)
    }

    var state: LoadState = .idle
    private let client = RateClient()

    func load() async {
        state = .loading
        do {
            let response = try await client.latest(base: "USD")
            state = .loaded(response)
        } catch {
            state = .failed(error.localizedDescription)
        }
    }
}
```

```swift title=RatesView.swift
struct RatesView: View {
    @State private var model = RatesModel()

    var body: some View {
        List {
            switch model.state {
            case .idle, .loading:
                ProgressView()
            case .loaded(let response):
                ForEach(response.rates.keys.sorted(), id: \.self) { code in
                    LabeledContent(code, value: response.rates[code] ?? 0,
                                   format: .number.precision(.fractionLength(2...4)))
                }
            case .failed(let message):
                ContentUnavailableView("Couldn't load rates",
                                       systemImage: "wifi.exclamationmark",
                                       description: Text(message))
            }
        }
        .navigationTitle("Exchange Rates")
        .task { await model.load() }
        .refreshable { await model.load() }
    }
}
```

`.task` loads once when the screen appears, and `.refreshable` adds pull-to-refresh with the same function. Because `RatesModel` is `@MainActor`, assigning `state` is always safe for the UI, and Swift 6 checks that for you. Every error path ends in `.failed`, so the user never stares at a spinner that will never stop. Dictionary keys have no order, so the view sorts them for a stable list.

:::tip Where the decoding runs
With main-actor default isolation, `RateClient` runs on the main actor too. The request itself doesn't block it; `await` suspends while the bytes arrive. Decoding a few hundred bytes on the main thread is fine. For multi-megabyte responses, move decoding into an `async` function marked `@concurrent` so it runs in the background, and declare the model `nonisolated struct RatesResponse`; otherwise its `Decodable` conformance is main-actor isolated too and the compiler won't let background code use it.
:::

iOS also requires HTTPS by default through App Transport Security, so a plain `http://` URL fails unless you add an exception. Use HTTPS and you'll never need one.

Pocket Budget can now talk to the outside world. It still forgets its own expenses when you quit, so next you'll save them on the device with SwiftData.
