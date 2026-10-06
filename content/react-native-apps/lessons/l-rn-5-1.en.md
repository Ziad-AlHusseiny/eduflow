---
summary: Find and fix Trailhead's bugs and slow screens with LogBox, React Native DevTools, the Performance Monitor and the Profiler, measuring in production mode before changing code.
takeaways:
  - Press `j` in the Metro terminal (or use the dev menu) to open React Native DevTools, with a console, breakpoints, a Components inspector and a Profiler.
  - Development mode is much slower than a release build, so judge performance with `npx expo start --no-dev --minify` or a real build.
  - The Performance Monitor shows JS and UI frame rates separately; which one drops tells you where the problem is.
  - Most JavaScript slowness in React Native is re-rendering too much, too often; the Profiler shows which components and why.
  - Run animations on the UI thread (Reanimated, or Animated with the native driver) so a busy JS thread can't make them stutter.
further:
  - title: React Native DevTools
    url: https://reactnative.dev/docs/react-native-devtools
  - title: Debugging Basics
    url: https://reactnative.dev/docs/debugging
  - title: Performance Overview
    url: https://reactnative.dev/docs/performance
quiz:
  - q: Trailhead's hike list scrolls badly in development on your phone. What should you do before optimizing anything?
    options:
      - text: Wrap every component in `memo`.
        why: Memoizing blindly adds complexity and may not touch the real problem. Measure first.
      - text: Switch the list from FlatList to ScrollView.
        why: That renders every row up front, which makes long lists slower, not faster.
      - text: Upgrade to the newest phone available and test there.
        why: Your users don't have the newest phone. Test on a mid-range device, in production mode.
      - text: Run the JavaScript in production mode (`npx expo start --no-dev --minify` or a release build) and check whether it's still slow.
        why: Correct. Development mode adds checks and warnings that slow everything down; many "performance bugs" disappear in production mode.
    answer: 3
  - q: The Performance Monitor shows the UI thread at 60 FPS and the JS thread dropping to 15 FPS while you scroll. Where is the problem?
    options:
      - text: In JavaScript, for example components re-rendering on every scroll event or heavy work in render.
        why: Correct. The native side keeps up; your JavaScript can't. The Profiler will show which components are busy.
      - text: In the native views, for example too many nested Views or oversized images.
        why: That would show up as a UI thread drop. Here the UI thread is fine.
      - text: In the network, because requests block the JS thread.
        why: Network requests are asynchronous; waiting on them doesn't consume JS thread frames.
    answer: 0
  - q: A fade-in animation on the hike detail screen stutters while the screen loads its data. What's the most robust fix?
    options:
      - text: Delay loading the data until the animation finishes.
        why: That slows the screen down to hide the stutter, and any other JS work can still cause it.
      - text: "Run the animation on the UI thread, with Reanimated or `Animated` using `useNativeDriver: true`."
        why: Correct. Animations driven on the UI thread don't depend on the busy JS thread, so they stay smooth.
      - text: Lower the animation's duration so the stutter is shorter.
        why: A shorter stutter is still a stutter; the cause is the JS thread being busy.
    answer: 1
---

Something is wrong with Trailhead: the log scrolls in jerks, a button sometimes does nothing, and once a week a user's app closes on its own. Debugging on mobile follows the same habits as on the web: reproduce, observe, form a hypothesis, measure. The tools are different, and one of them, the release build, matters more than people expect.

## The tools you have

**LogBox** is the in-app overlay. A red full-screen error is an uncaught JavaScript exception, with a stack trace that points into your source. Warnings show as a small banner at the bottom. Fix warnings as they appear; a good team habit is to treat a new warning like a failing test, because the ones you ignore are the ones that turn into crashes.

**`console.log`** output appears in the terminal running Metro and in the DevTools console. Fine for quick checks; remove them from hot paths like `renderItem`, where logging every row slows the list itself.

**React Native DevTools** is the built-in debugger, based on Chrome DevTools. Press `j` in the Metro terminal, or choose Open DevTools from the dev menu (`m` in the terminal, or shake the device). It has:

- a **Console** connected to your running app,
- **Sources** with breakpoints, stepping and watch expressions (`Cmd+P` / `Ctrl+P` to find a file),
- the **Components** inspector, to see the component tree, props, state and hooks,
- the **Profiler**, to record renders and see what rendered and why.

A breakpoint beats ten `console.log` calls when you don't know where the bug is. Set one in the handler of the button that "sometimes does nothing", tap it, and inspect the state you actually have.

**Native crashes**, where the app closes without a red screen, come from native code (a library, a misconfigured permission, running out of memory). The JavaScript tools can't see them. Read the device logs: Xcode's console for iOS, Logcat in Android Studio, or the terminal output of `npx expo run:android`. In production, an error-reporting service such as Sentry collects both JavaScript and native crashes from real users, with stack traces.

## Measure in production mode

Development mode runs extra checks: prop validation, warnings, the dev menu, Fast Refresh. It can make JavaScript several times slower. Judging performance there is like timing a runner wearing a backpack. Before you change any code for speed, run without dev mode:

```bash
npx expo start --no-dev --minify
```

or install a release build (you'll make one with EAS later in this section). Test on a mid-range Android phone; if it's smooth there, it's smooth almost everywhere.

## JS thread or UI thread?

Open the dev menu and turn on the **Performance Monitor**. It shows two frame rates, and they map to the two threads from the very first lesson:

| Symptom | Likely cause | Where to look |
|---|---|---|
| JS FPS drops, UI FPS fine | too much JavaScript: re-renders, heavy work in render, big JSON parsing | Profiler, your components |
| UI FPS drops | too much native work: deep view trees, huge images, many shadows | view hierarchy, image sizes |
| Taps feel delayed | JS thread busy when the touch arrives | Profiler during the interaction |

Most problems in React Native apps are on the JS side, and most of those are **re-rendering too much**. Record a Profiler session while you reproduce the slowness, then look for components that render far more often than they should. The Profiler can record why each component rendered (changed props, state, context or parent), which turns a guess into a fix.

## Fixes, in order of payoff

Revisit the list lesson's checklist first: memoized rows, stable props, `keyExtractor`, right-sized images. Beyond lists:

- **Move work out of render.** Sorting 600 hikes or formatting dates in every render adds up. Compute once with `useMemo`, or when the data changes.
- **Don't re-render the world on a timer.** A ticking clock or a live GPS position stored in the state of a big screen re-renders everything under it. Put fast-changing state in the smallest component that shows it.
- **Animate on the UI thread.** The `Animated` API with `useNativeDriver: true`, or the Reanimated library, runs animations natively, so a busy JS thread can't make them stutter. Gestures paired with animations (swipe to delete, bottom sheets) belong there too.
- **Let the compiler memoize.** Expo supports the React Compiler, which inserts memoization automatically. It removes a whole class of hand-written `memo` and `useCallback`, but it doesn't fix heavy work in render.

:::mistake Optimizing what you haven't measured
Sprinkling `useCallback` and `memo` across the codebase "for performance" makes code harder to read and often changes nothing, because the real cost was somewhere else: a 4000-pixel image, a timer re-rendering the screen, or simply development mode. Measure in production mode, find the hot spot, fix that, measure again.
:::

## A debugging routine that works

When a bug report arrives, write down the exact steps, device and OS version. Reproduce it on a similar device. Decide which side it's on (JavaScript error, native crash, or performance). Use the matching tool. And when you've fixed it, ask whether a test could have caught it, which is the next lesson.
