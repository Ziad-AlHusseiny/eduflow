---
summary: Track a hike's route with expo-location, attach trail photos with expo-image-picker, and schedule a reminder with expo-notifications, cleaning up subscriptions and filtering noisy GPS data.
takeaways:
  - "`watchPositionAsync` streams positions until you call `remove()` on the subscription it returns, so remove it in the effect's cleanup."
  - Accuracy and update intervals trade precision for battery; choose the least precise settings the feature can live with.
  - GPS readings are noisy, so drop points with poor accuracy before computing distance.
  - expo-image-picker returns `canceled` plus an `assets` array; picked files start in a cache, so copy anything you keep.
  - Local notifications are scheduled on the device with a trigger, and `data` can carry the route to open when the user taps them.
further:
  - title: Location
    url: https://docs.expo.dev/versions/latest/sdk/location/
  - title: ImagePicker
    url: https://docs.expo.dev/versions/latest/sdk/imagepicker/
  - title: Notifications
    url: https://docs.expo.dev/versions/latest/sdk/notifications/
quiz:
  - q: Trailhead's tracking screen calls `watchPositionAsync` in an effect but never stores the result. What happens after the user leaves the screen?
    options:
      - text: The subscription stops automatically when the component unmounts.
        why: Native subscriptions don't know about your component. Only `remove()` stops them.
      - text: The app crashes the next time a position arrives.
        why: The callback still runs; React just ignores state updates for the unmounted screen. It's a silent leak, not a crash.
      - text: Nothing, because location only updates while the screen is visible.
        why: Foreground location keeps updating while the app is open, whatever screen is showing.
      - text: GPS keeps running and draining the battery, because nothing called `remove()` on the subscription.
        why: Correct. Store the subscription and call `subscription.remove()` in the effect's cleanup.
    answer: 3
  - q: A recorded track jumps 400 m sideways for one point while the hiker stood still under trees. What's the best response in code?
    options:
      - text: Request `Accuracy.BestForNavigation` so the GPS never makes mistakes.
        why: Higher accuracy settings reduce error but can't eliminate it, and they cost more battery.
      - text: Discard points whose reported `coords.accuracy` is worse than a threshold, such as 25 m, before adding them to the route.
        why: Correct. Each reading reports its own uncertainty radius; filtering out the bad ones keeps the route and the distance honest.
      - text: Round all coordinates to two decimal places.
        why: Two decimal places of latitude is about 1 km of precision, which destroys the route.
    answer: 1
  - q: "After `launchImageLibraryAsync`, the user backs out without choosing. What does your code see?"
    options:
      - text: The promise rejects with a "cancelled" error.
        why: Cancelling isn't an error. The promise resolves normally.
      - text: The promise never resolves.
        why: It resolves as soon as the picker closes, whatever the user did.
      - text: "A result with `canceled: true` and no assets, which you should handle by doing nothing."
        why: Correct. Check `if (result.canceled) return;` before reading `result.assets[0].uri`.
    answer: 2
---

Three device features make Trailhead more than a list: the route you walked, the photos you took, and a nudge at the end of the day to log the hike you forgot. They use three Expo modules with a lot in common: each needs a permission (asked the way the last lesson showed), each returns data you'll store with the tools from two lessons ago, and each has one detail that bites if you skip it.

## Tracking a route

`getCurrentPositionAsync` gives you one reading, which is enough to tag where a hike started. Tracking needs a stream: `watchPositionAsync` calls your function with each new position and returns a **subscription** that keeps the GPS running until you remove it.

```tsx title=src/hooks/useRoute.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type Point = { latitude: number; longitude: number; accuracy: number | null; timestamp: number };

export function useRoute(active: boolean) {
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (!active) return;
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
      ({ coords, timestamp }) => {
        setPoints((prev) => [...prev, { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, timestamp }]);
      },
    ).then((sub) => {
      if (cancelled) sub.remove();
      else subscription = sub;
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [active]);

  return points;
}
```

The `cancelled` flag handles a subtle race: the subscription arrives asynchronously, so if the screen unmounts before the promise resolves, the cleanup has nothing to remove yet. The flag makes the late subscription remove itself.

Appending to an array in state on every reading is fine for a few thousand points, which covers a long day hike. For multi-day tracks, write points to SQLite in batches and keep only the recent ones in memory, so a single state update never copies tens of thousands of objects.

The options are a battery budget. `Accuracy.High` asks for a precision of about ten meters; `Balanced` is about a hundred meters and much cheaper. `distanceInterval: 10` means "only call me after moving ten meters", and `timeInterval` caps the frequency on Android. A hiking track needs high accuracy but not a point every second.

:::mistake Trusting every GPS reading
Under trees, in canyons and next to cliffs, GPS readings wander. Each `coords.accuracy` is the radius of uncertainty in meters, and a single 80 m reading can add hundreds of meters of fake distance as the route zigzags. Drop readings above a threshold (25 m works well for walking) before computing distance or drawing the line. That's this lesson's exercise.
:::

Tracking with the screen locked needs background location and a task registered with `expo-task-manager`, plus the extra permission and review scrutiny from the last lesson. Ship foreground tracking first; many hikers keep the screen on to see the map anyway.

## Trail photos

For photos, `expo-image-picker` opens the system's own photo library or camera UI, which is familiar to users and handles editing for you:

```tsx
import * as ImagePicker from 'expo-image-picker';

async function addPhoto(fromCamera: boolean) {
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7, allowsEditing: true };

  if (fromCamera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
  }

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled) return;
  const uri = result.assets[0].uri;
  // copy into the app's document directory, then save the new path on the hike
}
```

`quality: 0.7` compresses the JPEG, which matters when a hike has twenty photos. Cancelling isn't an error: the promise resolves with `canceled: true`. And the returned `uri` points into a cache directory the system may clear, so copy the file into your app's document directory with `expo-file-system` and store that path in SQLite, as the storage lesson described. The iOS Simulator has no camera, so test camera capture on a real phone.

When you need your own camera interface, such as scanning QR codes on trail markers, use `expo-camera`, whose `CameraView` component renders a live preview inside your layout.

## A reminder notification

Hikers forget to log hikes. A daily reminder at 7 pm, only on days they've turned it on, is a local notification: scheduled on the device, no server involved.

```ts title=src/lib/reminders.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function enableDailyReminder() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Hike reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Out on a trail today?', body: 'Log it while you remember the details.', data: { url: '/new-hike' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 0, channelId: 'reminders' },
  });
  return true;
}
```

`setNotificationHandler` decides whether a notification shows while the app is open. On Android, notifications belong to **channels** that users can mute individually in Settings, so create a clearly named one. Cancelling before scheduling avoids stacking duplicate reminders each time the setting is toggled.

The `data.url` pays off with Expo Router: in the root layout, listen with `Notifications.addNotificationResponseReceivedListener`, read `response.notification.request.content.data.url`, and call `router.push(url)`. Tapping the reminder then opens the add-hike modal directly, through the same routes your deep links use.

**Push** notifications, sent from a server, need more: a development build, credentials for Apple's and Google's push services (EAS manages them), and a push token sent to your backend. The scheduling and handling code you just wrote stays the same.

Section 5 is about getting all of this into users' hands: debugging, testing and shipping.
