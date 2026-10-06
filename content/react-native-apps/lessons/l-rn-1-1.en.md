---
kind: intro
summary: Explain how a React Native app turns your components into real iOS and Android views, and what the New Architecture changed about that path.
takeaways:
  - React Native renders real platform views such as UIView on iOS and android.view.View on Android; there is no browser and no DOM.
  - Your JavaScript runs in the Hermes engine on its own thread, while the platform's UI thread draws pixels and receives touches.
  - The New Architecture (JSI, the Fabric renderer and TurboModules) is the only architecture since React Native 0.82.
  - React knowledge transfers directly; what changes is the set of primitives, styling, navigation and how you ship.
further:
  - title: Core Components and Native Components
    url: https://reactnative.dev/docs/intro-react-native-components
  - title: About the New Architecture
    url: https://reactnative.dev/architecture/landing-page
quiz:
  - q: A teammate says "React Native is a WebView with a nicer API." What's the most accurate correction?
    options:
      - text: It renders HTML, but compiles it to native code ahead of time.
        why: There's no HTML at any stage. You write React components like `<View>` and `<Text>`, never `<div>`.
      - text: Your components become real platform views; JavaScript describes the UI and native code draws it.
        why: Correct. React Native's renderer creates and updates native views, which is why scrolling and text input feel like any other app.
      - text: It uses a WebView on Android and native views on iOS.
        why: Both platforms get native views. Android is not a second-class target with a browser fallback.
    answer: 1
  - q: Trailhead runs a heavy loop in JavaScript for two seconds. What does the user most likely notice?
    options:
      - text: Nothing, because JavaScript runs on the UI thread and has priority.
        why: JavaScript does not run on the UI thread. That separation is the reason it can fall behind without the OS noticing.
      - text: The app crashes immediately with an out-of-memory error.
        why: A long loop blocks, it doesn't allocate unbounded memory. You'd see a freeze, not a crash.
      - text: Taps and JS-driven updates stall until the loop finishes, even though the OS keeps the app alive.
        why: Correct. The JS thread is busy, so it can't respond to events or schedule renders. Native-driven work like a ScrollView's own scrolling may still move.
    answer: 2
  - q: What does JSI, part of the New Architecture, give you?
    options:
      - text: Direct calls between JavaScript and C++ without serializing every message to JSON.
        why: Correct. The old bridge batched JSON messages asynchronously; JSI lets JS hold references to native objects and call them directly.
      - text: A way to write UI in Swift and Kotlin instead of JSX.
        why: You still write UI in React. JSI is plumbing underneath, and you rarely touch it yourself.
      - text: A JavaScript engine that replaces Hermes.
        why: Hermes is still the engine. JSI is the interface engines expose to native code, not an engine.
    answer: 0
---

Open the Notes app on your phone and drag your finger down a long list. The bounce at the top, the way text selection handles appear, the scroll that keeps coasting after you let go: all of that is the operating system's own code. React Native's promise is that your app gets the same behaviour, because it uses the same views.

This course builds **Trailhead**, a hiking log. By the end you'll have a list of past hikes, trail detail screens, a form to log a new hike, GPS tracking, photos, reminders, offline storage, and a build that runs on a real phone. Each lesson adds one piece.

## Native views, described by React

On the web, React turns your components into DOM nodes and the browser paints them. React Native swaps the bottom layer. You write components with `<View>`, `<Text>` and `<Image>`; React works out what changed; React Native's renderer then creates or updates **native views**: a `UIView` on iOS, an `android.view.View` on Android.

```tsx title=src/app/index.tsx
import { Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Trailhead</Text>
    </View>
  );
}
```

No HTML, no CSS file, no DOM. The `style` object looks like CSS, and that is on purpose, but it's a JavaScript object that React Native's layout engine (Yoga) reads to place native views.

:::figure From your component to pixels
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">Your React components run in Hermes on the JS thread; React computes changes; the Fabric renderer uses JSI to create native views, which the UI thread draws on iOS and Android.</title>
  <rect class="d-box-primary" x="20" y="30" width="190" height="80" rx="12"/>
  <text class="d-label-strong" x="115" y="62" text-anchor="middle">Your components</text>
  <text class="d-label-muted" x="115" y="88" text-anchor="middle">JS thread · Hermes</text>
  <path class="d-arrow" d="M210 70 L270 70" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="275" y="30" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="360" y="62" text-anchor="middle">Fabric renderer</text>
  <text class="d-label-muted" x="360" y="88" text-anchor="middle">C++ via JSI</text>
  <path class="d-arrow" d="M445 70 L505 70" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="510" y="30" width="150" height="80" rx="12"/>
  <text class="d-label-strong" x="585" y="62" text-anchor="middle">Native views</text>
  <text class="d-label-muted" x="585" y="88" text-anchor="middle">UI thread</text>
  <rect class="d-box" x="450" y="160" width="100" height="50" rx="10"/>
  <text class="d-label" x="500" y="190" text-anchor="middle">iOS</text>
  <rect class="d-box" x="570" y="160" width="100" height="50" rx="10"/>
  <text class="d-label" x="620" y="190" text-anchor="middle">Android</text>
  <path class="d-line" d="M585 110 L500 160"/>
  <path class="d-line" d="M585 110 L620 160"/>
  <text class="d-label-muted" x="115" y="150" text-anchor="middle">touch events flow back</text>
  <path class="d-arrow d-dashed" d="M510 100 L210 135" marker-end="url(#arrow)"/>
</svg>
:::

## Two threads you'll care about

Your JavaScript runs in **Hermes**, a JavaScript engine built for React Native, on its own thread. The platform's **UI thread** draws views and receives touches. Keeping them apart is why a native scroll can stay smooth while your code works, and also why a long synchronous loop in JavaScript makes buttons feel dead: the touch arrives, but nobody is free to handle it.

You'll return to this in the performance lesson. For now, remember the rule of thumb: keep the JS thread free during gestures and animations.

## The New Architecture, briefly

For years, JavaScript and native code talked through a "bridge" that serialized messages to JSON and sent them in batches. The **New Architecture** replaced it:

- **JSI** lets JavaScript call C++ directly and hold references to native objects.
- **Fabric** is the new renderer, written in C++ and shared by both platforms.
- **TurboModules** are native modules (camera, storage, sensors) loaded lazily, when first used.

It became the default in React Native 0.76 and the only option from 0.82. You won't configure any of it; Expo projects use it out of the box. It matters when you pick libraries: anything you install must support it, and maintained libraries do.

:::why Why this matters
When you read a 2021 blog post that talks about "the bridge" or "bridge traffic", it describes an architecture your app no longer has. Check the date before you copy a performance tip.
:::

## What transfers from React, and what doesn't

Components, props, state, hooks, context, keys: all the same. React 19 features work too. What changes is everything around React: the primitives (`View` instead of `div`), styling (no cascade, column-first flexbox), navigation (stacks and tabs instead of URLs in a bar), device APIs (permissions that users can refuse) and shipping (store review instead of a deploy).

Next you'll create the Trailhead project with Expo and get it running on your own phone.
