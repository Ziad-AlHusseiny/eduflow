---
summary: Ship JavaScript fixes to Trailhead users with EAS Update, keep updates compatible with installed builds using channels and runtime versions, roll back safely, and settle into a sustainable release routine.
takeaways:
  - EAS Update replaces your app's JavaScript bundle and assets on installed builds, without a new binary or store review.
  - Only JavaScript and asset changes can ship over the air; new native modules, permission strings, icons and SDK upgrades need a new build.
  - A build's channel decides which updates it receives, and its runtime version decides which updates are compatible with its native code.
  - By default an update downloads in the background and applies on the next launch.
  - "When an update misbehaves, `eas update:rollback` returns users to a previous update or to the code embedded in their build."
further:
  - title: EAS Update introduction
    url: https://docs.expo.dev/eas-update/introduction/
  - title: How EAS Update works
    url: https://docs.expo.dev/eas-update/how-it-works/
  - title: Runtime versions and updates
    url: https://docs.expo.dev/eas-update/runtime-versions/
  - title: Rollbacks
    url: https://docs.expo.dev/eas-update/rollbacks/
quiz:
  - q: Which Trailhead change can reach users with `eas update` alone?
    options:
      - text: Adding `expo-camera` to scan QR codes on trail markers.
        why: A new native module must be compiled into the binary, so it needs a new build and a store release.
      - text: Fixing the comma bug in `parseDistanceKm` and rewording an error message.
        why: Correct. Both are JavaScript changes, which is exactly what an update replaces.
      - text: Changing the location permission description in app.json.
        why: Usage descriptions are compiled into the native configuration; they change only with a new build.
      - text: Upgrading to the next Expo SDK.
        why: An SDK upgrade changes native code and the runtime version, so it always needs new builds.
    answer: 1
  - q: You publish an update to the production channel. A user opens Trailhead an hour later. With default settings, when do they see the fix?
    options:
      - text: Immediately; the app blocks on the splash screen until the update downloads.
        why: By default the app launches with the code it already has, so a slow network never delays startup.
      - text: Only after they reinstall the app from the store.
        why: Updates install without the store. That's the whole point of EAS Update.
      - text: On the next launch after this one; the update downloads in the background during this session.
        why: Correct. The app checks on launch, downloads in the background, and applies the update the next time it starts.
    answer: 2
  - q: Users on Trailhead 1.0 (built before you added `expo-camera`) and 1.1 (built after) both use the production channel. You publish a JavaScript update that imports `expo-camera`. What keeps 1.0 users from crashing?
    options:
      - text: Runtime versions; 1.1 has a different runtime version, so updates built for it don't apply to 1.0 builds.
        why: Correct. With the `appVersion` or `fingerprint` policy, native changes produce a new runtime version, and updates only reach compatible builds.
      - text: Nothing; you must publish separate updates by hand and hope the right users get them.
        why: Runtime versions exist precisely so you don't have to rely on hope.
      - text: EAS Update installs the missing native module along with the JavaScript.
        why: Updates can't add native code. That's why compatibility checks matter.
    answer: 0
---

A user reports that Trailhead rejects "8,4" as a distance on her German phone. You fix the parser in five minutes. Without anything else, getting that fix to her means a new build, a submission and a review, then waiting for her to update. **EAS Update** shortens that to one command: it publishes new JavaScript and assets, and installed copies of Trailhead download them the next time they start.

## How an update reaches a phone

A release build contains two things: the native app (compiled Swift, Kotlin and C++, including every native module) and an **embedded JavaScript bundle**. An update replaces only the second part. When the app launches, `expo-updates` checks the server for a newer bundle for its channel and runtime version. By default it starts immediately with the code it already has, downloads the new update in the background, and uses it on the **next** launch. Startup never waits on the network, which matters for an app opened at a trailhead with one bar of signal.

Set it up once, then make new builds so they include the update configuration:

```bash
eas update:configure
```

This adds the update URL and a `runtimeVersion` to your app config. Then give each build profile a channel in `eas.json`:

```json title=eas.json
{
  "build": {
    "preview": { "distribution": "internal", "channel": "preview" },
    "production": { "autoIncrement": true, "channel": "production" }
  }
}
```

Publishing an update is one command:

```bash
eas update --channel production --message "Accept comma decimals in distance"
```

Production builds pick it up on their next launch. Publish to `preview` first, check it on your testers' builds, then publish the same code to `production`.

## What can and can't go over the air

| Ships with `eas update` | Needs a new build and store release |
|---|---|
| Components, screens, styles, logic | Adding or upgrading a native module |
| Images and fonts bundled with the JavaScript | Permission descriptions and other native config |
| Bug fixes and copy changes | App icon, splash screen, bundle identifier |
| New screens built from existing native modules | Expo SDK upgrades |

This is the JavaScript-versus-native distinction from the second lesson of the course, now with consequences. If a change touches native code or native configuration, an update can't deliver it.

## Runtime versions keep updates compatible

Imagine Trailhead 1.1 adds `expo-camera`. Its JavaScript imports a native module that 1.0 builds don't contain. If 1.0 users received that update, the app would crash when it touched the camera. The **runtime version** prevents that: every build and every update carries one, and an update only applies to builds with the same runtime version.

```json title=app.json
{
  "expo": {
    "version": "1.1.0",
    "runtimeVersion": { "policy": "appVersion" }
  }
}
```

With the `appVersion` policy, the runtime version is your app's `version`, so you raise `version` whenever native code changes, and 1.0 and 1.1 builds stop sharing updates. The `fingerprint` policy computes a hash of the native parts of your project instead, so the runtime version changes automatically when native code does. Either works; pick one and understand it.

:::mistake Shipping native changes as an update
The classic outage: a developer adds a native library, tests in a fresh development build where it works, and publishes an update without a new runtime version. Older builds receive JavaScript that calls a module they don't have. Before every `eas update`, ask one question: did anything native change since the build this channel serves? If yes, it's a new build and a store release.
:::

## When an update goes wrong

Updates reach many users quickly, which cuts both ways. If one misbehaves, roll back:

```bash
eas update:rollback
```

It walks you through returning the channel's branch to a previous update or to the code embedded in the build. Users get the rollback on their next launch, the same way they got the update. That's why every update deserves the same care as a release: run your tests, publish to `preview`, open it on a real phone, then publish to `production`. Both stores allow updating JavaScript this way for bug fixes and improvements; using it to change what the app fundamentally does, without review, is against their rules.

## A release routine that holds up

Here's a rhythm that works for a small team:

- **JavaScript fixes**: test, `eas update` to preview, check, then to production. Same day.
- **Native changes or new features**: raise `version`, production build, TestFlight and internal track, review, release. Planned, every few weeks.
- **Every release**: watch crash reports for the first day, and keep `eas update:rollback` ready.

## Where you are now

You started with a single `Text` in an Expo project. Trailhead now has lists that stay fast, tabs and stacks with typed params, a form that handles the keyboard, data in SQLite and a token in secure storage, GPS tracking, photos, reminders, tests, store builds and a way to fix bugs the same afternoon. More importantly, you know where React Native differs from the web and why: native views, two threads, no cascade, permissions that can be refused, and two kinds of change, JavaScript and native.

Good next steps: add Reanimated and react-native-gesture-handler for richer interactions, TanStack Query for server data, and Maestro for a couple of end-to-end tests. Then ship something small to real users and learn from what they do with it.
