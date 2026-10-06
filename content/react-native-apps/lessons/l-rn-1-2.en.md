---
summary: Create the Trailhead project with create-expo-app, run it on your phone and a simulator, add libraries safely, and know when Expo Go stops being enough.
takeaways:
  - "`npx create-expo-app@latest` creates a TypeScript project with Expo Router and file-based routes in `src/app`."
  - "`npx expo start` runs the Metro dev server; scan the QR code with Expo Go, or press `i` or `a` for a simulator or emulator."
  - Install libraries with `npx expo install`, which picks the version that matches your Expo SDK.
  - Expo Go is a learning sandbox with a fixed set of native modules; a development build is your own app with dev tools, and real projects move to one early.
further:
  - title: Create a project
    url: https://docs.expo.dev/get-started/create-a-project/
  - title: Start developing
    url: https://docs.expo.dev/get-started/start-developing/
  - title: Introduction to development builds
    url: https://docs.expo.dev/develop/development-builds/introduction/
quiz:
  - q: You need `expo-location` in Trailhead. Which command should you run?
    options:
      - text: "`npm install expo-location@latest`"
        why: The latest version may target a newer SDK than your project, which leads to native mismatches that only show up at runtime.
      - text: "`npx expo install expo-location`"
        why: Correct. It installs the version that is known to work with your project's Expo SDK.
      - text: "`npx expo add-module expo-location`"
        why: There's no `add-module` command. `npx expo install` is the one to remember.
    answer: 1
  - q: Trailhead adds a library with custom native code that isn't part of Expo Go. What's the right next step?
    options:
      - text: Keep using Expo Go and wait for it to load the module over the network.
        why: Expo Go can't download native code. Its native modules are fixed when the app is built and published to the stores.
      - text: Eject from Expo and maintain the ios and android folders by hand.
        why: There's no need. Expo projects can include any native library; you just build your own app binary.
      - text: Create a development build, either locally with `npx expo run:ios` or in the cloud with EAS Build.
        why: Correct. A development build is your own app with your native modules plus the dev tools you had in Expo Go.
    answer: 2
  - q: You edit the title text in `src/app/index.tsx` and save. What happens on the phone running the app?
    options:
      - text: Fast Refresh swaps in the new code and keeps component state where it can.
        why: Correct. JavaScript changes reload in place in about a second; only native changes need a new build.
      - text: Nothing until you rebuild the app binary.
        why: Rebuilding is only needed for native changes such as new native modules or app.json settings that change the binary.
      - text: The app restarts from the splash screen and loses all state.
        why: That's a full reload, which you can trigger with `r`, but saving a file uses Fast Refresh.
    answer: 0
---

The React Native docs recommend starting new apps with a framework, and the framework they point to is **Expo**. Expo gives you the project template, the dev server, a library of device APIs (camera, location, storage, notifications) that all work with the same SDK version, and a cloud service to build and ship. You can still write native code when you need to; you're not locked in.

## Create Trailhead

You need Node.js (an active LTS release) and a phone or a simulator. Then:

```bash
npx create-expo-app@latest trailhead
cd trailhead
npx expo start
```

The default template comes with TypeScript and **Expo Router** already configured. The parts you'll touch first:

```text
trailhead/
  src/app/_layout.tsx    root layout: wraps every screen (navigation lives here)
  src/app/index.tsx      the first screen, at route "/"
  src/app/explore.tsx    a second example screen, at "/explore"
  assets/                icons, splash image, fonts
  app.json               app name, icons, bundle ids, plugin settings
  package.json           dependencies, including "expo" (the SDK version)
```

Every file in `src/app` becomes a screen. You'll learn how routing works in section 3; for now, open `src/app/index.tsx`, change some text, and save.

## Run it on a device

`npx expo start` launches **Metro**, the JavaScript bundler, and prints a QR code. You have three ways in:

- **Your phone with Expo Go.** Install Expo Go from the App Store or Play Store, then scan the QR code (Camera app on iOS, Expo Go itself on Android). The phone and computer must reach each other on the network.
- **iOS Simulator** (macOS with Xcode): press `i` in the terminal.
- **Android Emulator** (Android Studio): press `a`.

While Metro runs, a few keys earn their place in muscle memory: `r` reloads the app, `m` opens the in-app dev menu, and `j` opens React Native DevTools. Saving a file triggers **Fast Refresh**, which swaps in the new code without losing component state.

:::tip Test on a real phone early
A simulator runs on your laptop's CPU, fakes the camera and GPS (or has none), and gives you no sense of how big a tap target feels under your thumb. Many teams keep a cheap mid-range Android phone on hand for exactly that reason: it shows the slow frames your laptop hides.
:::

## Adding libraries the Expo way

Each Expo SDK release targets one React Native version, and native libraries have to match it. So instead of `npm install`, you add libraries with:

```bash
npx expo install expo-location expo-image-picker
```

`npx expo install` looks up the version that's known to work with your SDK and installs that one. For pure JavaScript packages (a date library, say) it falls back to your package manager, so you can use it for everything.

When something feels off after an upgrade, run the health check:

```bash
npx expo-doctor
```

It reports mismatched versions, duplicate native modules and config problems.

:::mistake Installing the latest version of a native library
`npm install react-native-something@latest` can pull a version built for a newer React Native than your project uses. The JavaScript compiles fine, and the app crashes when it calls into native code. Use `npx expo install` and let it pick.
:::

## Expo Go vs a development build

**Expo Go** is an app from the store with a fixed set of native modules baked in: the Expo SDK and a handful of popular libraries. Your JavaScript is loaded into it. That's perfect for learning, and it's why you could run Trailhead seconds after creating it.

Its limits show up quickly in real projects:

- It can only include native code that was compiled into it. A library outside that set won't load.
- It supports one SDK version at a time (usually the latest), so an older project may not open in it.
- Some features need your own app identity, such as push notifications and custom URL schemes.

A **development build** is your own app, with your app name, icon, bundle identifier and native modules, plus the same dev tools (Fast Refresh, dev menu, DevTools). You create one locally:

```bash
npx expo run:ios
npx expo run:android
```

or in the cloud, without Xcode or Android Studio on your machine, using EAS Build (section 5). After that, `npx expo start` serves JavaScript to your development build exactly as it did to Expo Go.

A sensible default: learn and prototype in Expo Go, then switch to a development build the first time you need something Expo Go doesn't have. For Trailhead you'll stay in Expo Go until section 4.

## JavaScript changes vs native changes

This distinction runs through the whole course, so name it now. **JavaScript changes** (components, styles, logic) reach a running app through Fast Refresh in development and, later, through over-the-air updates in production. **Native changes** (adding a native module, changing permissions text, the app icon or the bundle identifier in `app.json`) need a new binary. When a change "doesn't show up", ask which kind it was.

Next you'll replace the template's example screen with Trailhead's first real UI, using React Native's core components.
