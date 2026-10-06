---
summary: Ask for location and camera access at the moment it makes sense, handle every permission state including permanent denial, and write the usage descriptions iOS and app review require.
takeaways:
  - Permission responses have a `status` of undetermined, granted or denied, plus `canAskAgain`, which tells you whether a system prompt can still appear.
  - Ask when the user starts the feature that needs it, after a short explanation in your own UI, never as a wall of prompts at launch.
  - Once `canAskAgain` is false, only the system Settings app can change the answer, so offer a button that calls `Linking.openSettings()`.
  - iOS requires a usage description for each permission; set them through config plugin options in app.json and rebuild.
  - Re-check permissions when a screen regains focus, because users change them in Settings while your app is in the background.
further:
  - title: Permissions
    url: https://docs.expo.dev/guides/permissions/
  - title: Location
    url: https://docs.expo.dev/versions/latest/sdk/location/
  - title: Linking
    url: https://reactnative.dev/docs/linking
quiz:
  - q: "Trailhead asks for location the first time the app launches, before the user has seen anything. On iOS, many users tap Don't Allow. Why does this matter so much?"
    options:
      - text: The app is rejected from the App Store for asking at launch.
        why: Asking at launch isn't automatically a rejection. The real cost is to your users and features.
      - text: After a denial, iOS won't show the system prompt again; only the Settings app can change it, so the tracking feature is effectively gone for those users.
        why: Correct. You get one system prompt per permission on iOS, so spend it when the user understands why.
      - text: Denying at launch also denies camera and notification permissions.
        why: Each permission is answered separately. The damage is to location only, but it's lasting.
    answer: 1
  - q: "A permission response is `{ status: 'denied', granted: false, canAskAgain: false }`. What should the Start tracking button do?"
    options:
      - text: Call `requestForegroundPermissionsAsync()` again; the user may have changed their mind.
        why: With `canAskAgain` false, the request resolves immediately with the same denial and no prompt appears.
      - text: Hide the button permanently.
        why: The user may want the feature later. Hiding it gives them no path back.
      - text: Explain that location is off for Trailhead and offer a button that opens the app's page in Settings.
        why: Correct. `Linking.openSettings()` takes them straight to the switch they need.
      - text: Start tracking anyway and show an error if it fails.
        why: The location calls will reject; starting a feature you know can't work is a worse experience than explaining.
    answer: 2
  - q: You change the location usage description in app.json, reload with Fast Refresh, and the old text still appears in the prompt. Why?
    options:
      - text: The description is part of the native app configuration, so it only changes in a new build.
        why: Correct. Usage strings are compiled into Info.plist; rebuild the development build to see them.
      - text: iOS caches prompt text for 24 hours.
        why: There's no such cache; the text comes from the installed binary.
      - text: The description must be set in JavaScript with `Location.setDescription()`.
        why: There's no such function. Usage descriptions are native configuration, not runtime calls.
    answer: 0
---

Trailhead's best feature is live tracking: start a hike, and the app records your route. It needs the phone's location, and the phone won't give it without asking the user. That request is the most fragile moment in the app. Ask badly and you lose the feature for that user, sometimes for good.

## The states a permission can be in

Every Expo module that needs a permission (location, camera, media library, notifications) returns the same response shape:

```ts
{
  status: 'undetermined' | 'granted' | 'denied',
  granted: boolean,
  canAskAgain: boolean,
  expires: 'never' | number,
}
```

- **undetermined**: you've never asked. A request will show the system prompt.
- **granted**: go ahead. On recent iOS and Android versions, users may grant access only once (for this session) or only approximate location, so be ready to ask again another day and to receive less precise positions.
- **denied with `canAskAgain: true`**: Android after a single denial. You can ask once more, ideally after explaining better.
- **denied with `canAskAgain: false`**: the system won't show the prompt again. On iOS that's the state right after the first denial; on Android, after the user denies twice. Only the Settings app can change it now.

:::figure Where each permission state leads
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">From undetermined, the app explains and then requests. The user grants or denies. Granted proceeds to the feature. Denied with canAskAgain true can be requested again; denied with canAskAgain false can only be changed by opening Settings.</title>
  <rect class="d-box" x="20" y="95" width="150" height="56" rx="12"/>
  <text class="d-label-strong" x="95" y="128" text-anchor="middle">undetermined</text>
  <path class="d-arrow" d="M170 123 L235 123" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="240" y="95" width="150" height="56" rx="12"/>
  <text class="d-label-strong" x="315" y="120" text-anchor="middle">explain, then</text>
  <text class="d-code" x="315" y="140" text-anchor="middle">request…()</text>
  <path class="d-arrow" d="M390 110 L470 55" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 140 L470 195" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="475" y="25" width="185" height="56" rx="12"/>
  <text class="d-label-strong" x="567" y="58" text-anchor="middle">granted → feature</text>
  <rect class="d-box-warn" x="475" y="165" width="185" height="70" rx="12"/>
  <text class="d-label-strong" x="567" y="192" text-anchor="middle">denied</text>
  <text class="d-label-muted" x="567" y="216" text-anchor="middle">canAskAgain?</text>
  <path class="d-arrow d-dashed" d="M475 185 C420 175 400 160 380 152" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="420" y="200" text-anchor="middle">yes</text>
  <text class="d-label" x="567" y="135" text-anchor="middle">no → open Settings</text>
  <path class="d-line" d="M567 165 L567 145"/>
</svg>
:::

## Ask in context, once you've explained

The worst pattern is the one many apps ship: a cascade of system prompts at first launch, before the user knows what the app does. People deny what they don't understand, and on iOS that first "Don't Allow" is permanent unless they dig into Settings.

Trailhead asks for location when the user taps **Start tracking**, the first moment the request is obviously connected to something they want. Before the system prompt, it shows its own short explanation: "Trailhead records your route while you hike. Your location stays on this phone unless you sync." Then a **Continue** button triggers the real request. Your own screen can be dismissed without consequence; the system prompt can't.

The same rule applies to every permission in the app. Ask for the camera when the user taps **Add photo**, and for notifications when they turn on reminders, not before. Each request then arrives with its reason already visible on screen, and acceptance rates go up noticeably.

```tsx title=src/hooks/useLocationPermission.ts
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

export function useLocationPermission() {
  const [permission, setPermission] = useState<Location.LocationPermissionResponse | null>(null);

  // Re-check whenever the screen regains focus: the user may have
  // changed the setting in the Settings app while Trailhead was in the background.
  useFocusEffect(
    useCallback(() => {
      Location.getForegroundPermissionsAsync().then(setPermission);
    }, []),
  );

  const request = useCallback(async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    setPermission(result);
    return result.granted;
  }, []);

  return { permission, request, openSettings: () => Linking.openSettings() };
}
```

The tracking screen then reads `permission` and chooses what to render: a spinner while it's `null`, the explanation and Continue button while asking is still possible, a "Location is off for Trailhead" message with an **Open Settings** button once `canAskAgain` is false, and the live map once it's granted. Turning the response into one of those four actions is a small pure function, and it's this lesson's exercise.

:::mistake Requesting again after a permanent denial
Calling `requestForegroundPermissionsAsync()` when `canAskAgain` is false shows nothing and resolves straight away with the same denial. To the user, the button simply does nothing. Check `canAskAgain` first and switch to the Settings path.
:::

## Usage descriptions and config plugins

iOS shows a sentence from your app in every permission prompt, and the App Store rejects apps whose descriptions are missing or vague ("This app needs your location"). Say what the feature does with the data. You set these strings through each module's **config plugin** in `app.json`:

```json title=app.json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        { "locationWhenInUsePermission": "Trailhead records your route on the map while you track a hike." }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Trailhead lets you attach photos from your library to a hike.",
          "cameraPermission": "Trailhead lets you take trail photos to attach to a hike."
        }
      ]
    ]
  }
}
```

Config plugins write native configuration (the iOS `Info.plist`, the Android manifest) when the app is built. That makes them **native changes**: Fast Refresh won't apply them, so rebuild your development build after editing them. Expo Go shows its own generic strings, which is one more reason Trailhead moves to a development build now.

## Foreground first, background only if you must

Tracking a hike with the screen off needs **background** location, a separate, more sensitive permission with extra platform requirements and closer review on both stores. Start with foreground ("while using the app") access, which covers tracking while Trailhead is open. Add background access only when users ask for it, with a clear explanation of why, and expect the review to ask you the same question.

Next you'll use these permissions for real: the hiker's position, trail photos, and a reminder notification.
