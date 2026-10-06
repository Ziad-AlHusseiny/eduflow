---
summary: Configure Trailhead's identity and versions, create development, preview and production builds with EAS Build, send them to TestFlight and Google Play with EAS Submit, and prepare for app review.
takeaways:
  - A release build compiles the native app, bundles and minifies your JavaScript, and signs it with credentials the stores trust.
  - The iOS bundle identifier and Android package name are permanent once you publish; choose them deliberately.
  - "eas.json profiles describe builds: `development` for your dev client, `preview` for testers, `production` for the stores."
  - "`eas submit` uploads a production build to App Store Connect or Google Play; testers get it through TestFlight or a testing track before review."
  - Most first rejections come from crashes, vague permission text, missing privacy details or no demo account for a sign-in-only app.
further:
  - title: EAS Build
    url: https://docs.expo.dev/build/introduction/
  - title: Configure EAS Build with eas.json
    url: https://docs.expo.dev/build/eas-json/
  - title: EAS Submit
    url: https://docs.expo.dev/submit/introduction/
  - title: App Store Review Guidelines
    url: https://developer.apple.com/app-store/review/guidelines/
quiz:
  - q: After Trailhead is on the App Store, a teammate wants to change the iOS bundle identifier to match a new company name. What happens if you do?
    options:
      - text: The store treats it as a brand-new app, so existing users don't get the update and your reviews and ratings stay with the old listing.
        why: Correct. The bundle identifier (and Android package name) is the app's permanent identity in the stores.
      - text: The App Store renames the listing automatically after review.
        why: Display names can change; identifiers can't. A new identifier means a new app.
      - text: Nothing, as long as the version number goes up.
        why: Versions order releases of the same app. A different identifier isn't the same app.
    answer: 0
  - q: You want five hikers in your club to try Trailhead before it goes to the stores, installing it from a link. Which build fits?
    options:
      - text: A `development` build, since it has the dev menu for feedback.
        why: Development builds need your Metro server running to load JavaScript, so testers can't use them on their own.
      - text: A `production` build installed from the App Store.
        why: Production builds go through store review and public release; that's the step after testing.
      - text: Expo Go with your project's QR code.
        why: Expo Go can't include Trailhead's native configuration, like its URL scheme and permission strings, and testers would need your dev server.
      - text: A `preview` build with internal distribution, shared through the link EAS gives you.
        why: Correct. Internal distribution is designed for this; on iOS, testers' devices must first be registered for ad hoc builds.
    answer: 3
  - q: What does `autoIncrement` in the production profile take care of?
    options:
      - text: It raises the user-facing version, like 1.2.0 to 1.3.0, on every build.
        why: The user-facing version is yours to choose; `autoIncrement` handles the internal build number.
      - text: It bumps the iOS build number and Android version code for each build, which the stores require to be unique.
        why: Correct. Each upload needs a higher build number even when the visible version stays the same.
      - text: It increments the Expo SDK version on each build.
        why: SDK upgrades are deliberate changes to your dependencies, never automatic.
    answer: 1
---

So far Trailhead has run through Expo Go and development builds, with your laptop serving the JavaScript. Real users need something else: an app that installs from a store, starts without a dev server, and is signed so their phone trusts it. **EAS Build** makes those builds in the cloud, so you don't need a Mac for iOS, and **EAS Submit** uploads them to the stores.

## Identity and versions in app.json

Before the first build, settle a few fields:

```json title=app.json
{
  "expo": {
    "name": "Trailhead",
    "slug": "trailhead",
    "version": "1.0.0",
    "scheme": "trailhead",
    "icon": "./assets/images/icon.png",
    "ios": { "bundleIdentifier": "com.example.trailhead" },
    "android": { "package": "com.example.trailhead" }
  }
}
```

The **bundle identifier** (iOS) and **package name** (Android) are your app's permanent identity in the stores. Change them after publishing and the store sees a different app: no updates for existing users, no reviews carried over. Use a reverse domain you control.

There are two kinds of version. `version` is what users see ("1.0.0"); you raise it for each public release. Each upload also needs a unique, increasing internal number (the iOS build number and Android version code). Let EAS manage those for you, as shown below.

## Build profiles

Install the CLI, sign in to your Expo account and generate the config:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

That creates `eas.json` with three profiles:

```json title=eas.json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  },
  "submit": { "production": {} }
}
```

- **development** builds your own dev client (the development build from section 1), with the dev menu, loading JavaScript from Metro.
- **preview** builds a standalone app for testers, installed from a link or QR code (internal distribution). On iOS, testers' devices must be registered first with `eas device:create`, because these are ad hoc builds.
- **production** builds for the stores. With `appVersionSource: "remote"` and `autoIncrement`, EAS stores and raises the build number on every production build.

Then build:

```bash
eas build --platform android --profile preview
eas build --platform all --profile production
```

The build runs on EAS servers; the CLI prints a link to the logs and, at the end, to the build itself.

:::figure From source to the stores
<svg viewBox="0 0 690 220" role="img" aria-labelledby="t1">
  <title id="t1">Source code goes through eas build to a signed binary. Preview builds go to testers by link. Production builds go through eas submit to TestFlight or a Google Play testing track, then app review, then release.</title>
  <rect class="d-box" x="10" y="80" width="100" height="56" rx="10"/>
  <text class="d-label-strong" x="60" y="113" text-anchor="middle">code</text>
  <path class="d-arrow" d="M110 108 L150 108" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="155" y="80" width="120" height="56" rx="10"/>
  <text class="d-code" x="215" y="113" text-anchor="middle">eas build</text>
  <path class="d-arrow" d="M275 95 L330 45" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="335" y="18" width="150" height="50" rx="10"/>
  <text class="d-label" x="410" y="48" text-anchor="middle">preview → testers</text>
  <path class="d-arrow" d="M275 120 L330 160" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="335" y="140" width="120" height="50" rx="10"/>
  <text class="d-code" x="395" y="170" text-anchor="middle">eas submit</text>
  <path class="d-arrow" d="M455 165 L490 165" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="495" y="140" width="85" height="50" rx="10"/>
  <text class="d-label" x="537" y="162" text-anchor="middle">TestFlight</text>
  <text class="d-label" x="537" y="180" text-anchor="middle">/ track</text>
  <path class="d-arrow" d="M580 165 L605 165" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="610" y="140" width="75" height="50" rx="10"/>
  <text class="d-label" x="647" y="162" text-anchor="middle">review</text>
  <text class="d-label" x="647" y="180" text-anchor="middle">→ live</text>
</svg>
:::

## Credentials

Every installable build is **signed**. iOS needs a distribution certificate and provisioning profile; Android needs an upload keystore. EAS can generate these, store them, and reuse them for every build; the CLI asks the first time. For iOS you need a paid Apple Developer Program membership; for Google Play, a one-time developer registration fee. Treat the Android keystore with care: EAS keeps it for you, but if you manage your own and lose it, updating the app gets painful.

## Submitting to the stores

First create the app's record in App Store Connect and in Google Play Console. Then upload the latest production build:

```bash
eas submit --platform ios
eas submit --platform android
```

On iOS the build goes to App Store Connect, where it becomes available in **TestFlight** for testers after processing. On Android it lands on a testing track (internal by default); EAS needs a Google service account key to upload for you. You can combine both steps with `eas build --auto-submit`.

:::tip Test the production build, not just the dev build
Release builds behave differently: no dev menu, minified code, real permission strings, and no Metro to paper over a missing asset. Install the TestFlight or internal-track build on a real phone and walk through the main flows before you press release.
:::

## Getting through review

Both stores review apps, Apple more strictly. You'll fill in a store listing (name, description, screenshots for required device sizes), a privacy policy URL, and privacy details: Apple's App Privacy section and Google Play's Data safety form, which must match what Trailhead actually collects, such as location and photos.

:::mistake Submitting without a reviewer's way in
Trailhead requires an account. If the reviewer can't sign in, the app is rejected, however polished it is. Provide a demo account in the review notes. The other common first-time rejections: crashes on launch, permission descriptions that don't say why, and features that don't work, such as broken links or placeholder screens.
:::

Reviews usually take from a few hours to a couple of days. Once approved, you choose when to release. Then the cycle repeats for every native change: new version, build, submit, review. For JavaScript-only fixes there's a faster path, which is the final lesson.
