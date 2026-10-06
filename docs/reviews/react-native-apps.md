# Review: react-native-apps

## Verdict

This is a strong course. Across 21 lessons it builds one app, Trailhead, from an empty Expo project to an EAS release with OTA updates. Each lesson teaches one idea, uses the running project, names the common mistake, and hands off to the next lesson. Nearly every rule is backed by a runnable pure-function exercise (parsers, reducer, route matcher, retry, haversine) or a fair guided exercise. The technical content is current for 2026, and I checked it against docs.expo.dev, reactnative.dev and the RNTL v14 migration guide:

- **Architecture:** the New Architecture has been the only one since RN 0.82.
- **Project template:** the SDK 55+ default template uses `src/app` with `index` and `explore` screens.
- **Expo Router:** groups, `[id]`, `+not-found`, `Stack.Protected` (redirects to the first available screen and clears history), `presentation: 'modal'` (`new-hike.tsx` is served at `/new-hike`), and `router.navigate` unwinding.
- **Lists:** FlatList defaults (`windowSize` 21, `initialNumToRender` 10, key fallback order).
- **Storage:** AsyncStorage vs `expo-sqlite` (`SQLiteProvider` with `onInit`, `PRAGMA user_version`) vs `expo-secure-store`.
- **Device APIs:** permissions (`canAskAgain`, config-plugin keys) and current `expo-notifications` APIs (`shouldShowBanner`/`shouldShowList`, `SchedulableTriggerInputTypes.DAILY`).
- **Testing:** RNTL v14 `await render`, and `renderRouter` (which needs RNTL 14 or newer).
- **Build and release:** `npx uri-scheme open … --ios`, EAS Build/Submit (remote app versions, `autoIncrement`, the first Android submit going to the internal track), and EAS Update channels, runtime-version policies and `eas update:rollback`.

All RN code uses native APIs only. Nothing is web-only.

The fixes:

- **Accuracy (most important):**
  - The add-hike form defaulted the date to the UTC day.
  - A claim that all on-device data is deleted on uninstall ignored the fact that iOS Keychain/SecureStore values survive a reinstall.
- **Fabricated first-person evidence:** two first-person anecdotes about a fictional "Verse app" team.
- **Smaller imprecisions:** a few in code samples and exercise answer lists.
- **Arabic:** reads naturally. Terminology is consistent (component/props/state/render kept in English; دالة، مصفوفة، خادم in Arabic), and every code block matches the English byte for byte (checked with a script). I fixed a handful of agreement slips and one mistranslation.

IDs, answer positions, minutes and structure are unchanged.

## Issues found and fixed

| File | Category | Severity | What was wrong | What changed |
|---|---|---|---|---|
| lessons/l-rn-1-2.en.md + .ar.md | accuracy | medium | Tip cited a fictional "Verse app" team as first-person evidence and claimed simulators have no camera/GPS | Replaced with a general, accurate statement (simulators fake camera/GPS; keep a mid-range Android phone) |
| lessons/l-rn-5-1.en.md + .ar.md | accuracy | low | Same fictional "Verse app" anecdote about LogBox warnings | Rewrote as a general team habit |
| lessons/l-rn-1-3.ar.md | arabic | low | "هناك prop تستخدمهما" (singular noun with dual pronoun) | Rewrote as "وستستخدم اثنين من الـ props باستمرار" |
| lessons/l-rn-1-4.en.md | pedagogy | low | Quiz why: subject-verb agreement ("targets ... adds") | Fixed to "add" |
| exercises/l-rn-2-2.ar.json | arabic | low | "تملأ الشاشة العرض" is ambiguous (العرض reads as width) | Reworded to "مساحة العرض كلها" in prompt and explanation |
| lessons/l-rn-2-4.en.md + .ar.md | accuracy | low | Figure showed only ~50 mounted rows (181–229) while labelling the default windowSize as 21 screens (~230 rows of 72 pt) | Changed blank ranges to rows 1–90 and 320–600 so the picture matches the defaults it cites |
| lessons/l-rn-2-4.ar.md | consistency | low | "a dozen hikes" translated as "عشرات قليلة" (a few dozen) | Changed to "بنحو اثنتي عشرة رحلة" |
| exercises/l-rn-3-1.json | accuracy | low | Last blank accepted only `back`, but `router.dismiss()` also pops the units screen correctly in a stack | Added `dismiss` as an accepted answer |
| lessons/l-rn-3-3.ar.md | arabic | low | "في context منفصلين" (singular noun, dual adjective) | Rewrote as "في اثنين من الـ contexts منفصلَين" |
| lessons/l-rn-3-4.en.md + .ar.md | accuracy | medium | Draft defaulted the date with `new Date().toISOString().slice(0, 10)`, which is the UTC date and is off by a day for part of the day in most time zones (exactly the "logged the same day" case the lesson describes) | Replaced with a small `localToday()` helper and a lazy `emptyDraft()` initializer, with a comment explaining why |
| lessons/l-rn-3-4.en.md + .ar.md | accuracy | low | Said `KeyboardAwareScrollView` itself "adds a toolbar with previous and next buttons" | The toolbar is the library's separate `KeyboardToolbar` component; reworded |
| lessons/l-rn-3-5.en.md + .ar.md | consistency | low | Quiz said a blocked deep link lands on the "anchor screen", while the body (and this layout, which has no root index) says "first available screen" | Aligned the quiz with the body and the Expo docs wording |
| lessons/l-rn-4-1.en.md + .ar.md | accuracy | low | Pull-to-refresh sample had `try/finally` with no `catch`, so a failed refresh became an unhandled promise rejection, contradicting the next sentence ("keep the old data") | Added a `catch` that keeps the old list, with a comment |
| lessons/l-rn-4-1.ar.md | arabic | low | Number agreement: "ثلاث تفاصيل" (تفصيل is masculine) | "ثلاثة تفاصيل" |
| lessons/l-rn-4-2.en.md + .ar.md | accuracy | medium | Said all on-device data disappears on uninstall; Expo docs state iOS Keychain (SecureStore) values persist across uninstall/reinstall with the same bundle ID | Added the iOS exception and its practical consequence |
| lessons/l-rn-4-2.en.md + .ar.md | accuracy | low | SQLite snippet used `await` right after `useSQLiteContext()` as if at component top level, which isn't valid in a component | Marked the snippet as partial with comments showing where each line runs |
| lessons/l-rn-4-4.ar.md | arabic | low | Sentence about `expo-camera` made the module the subject of "يرسم" with `CameraView` as its object, which reads as a mistranslation | Rewrote: "ففيه الـ component المسمّى `CameraView` الذي يعرض معاينة حيّة" |
| exercises/l-rn-5-2.json | accuracy | low | Accepted `toBeCalledWith`, a deprecated alias removed in Jest 30 | Removed it from the accepted answers (kept `toHaveBeenCalledWith` and `toHaveBeenLastCalledWith`) |
| lessons/l-rn-5-3.ar.md | arabic | low | "حسم بضعة حقول" (past tense) where the English is an imperative ("settle a few fields") | "احسم بضعة حقول" |
| assessments.en.yaml + .ar.yaml | pedagogy | low | s-rn-5 Q1 read as if opening the Performance Monitor caused the sluggishness | Reworded so the monitor is the measuring tool, not the cause |
| assessments.ar.yaml | arabic | low | "مع context منفصلين" (same agreement slip as lesson 3-3) | "مع اثنين من الـ contexts منفصلَين" |

## Verified and left as is

- **New Architecture:** default since 0.76, the only option since 0.82 (lesson 1-1, glossary).
- **Project template:** `create-expo-app` default template structure (`src/app/_layout.tsx`, `index.tsx`, `explore.tsx`).
- **Expo Router:**
  - Modal routes: the file name is the URL (`src/app/new-hike.tsx` serves `/new-hike`). On Android a modal slides over the current screen and is dismissed with back.
  - `Stack.Protected` sends blocked navigation to the anchor or first available screen and removes history entries when the guard flips.
- **Lists:** FlatList `keyExtractor` fallback (`item.key`, then `item.id`, then index), the nested-VirtualizedList warning, `getItemLayout`, FlashList v2 recycling.
- **Keyboard:** the Expo keyboard guide (`padding` on iOS; `react-native-keyboard-controller` isn't in Expo Go). `submitBehavior="submit"` keeps the keyboard open.
- **Storage:** expo-sqlite API (`SQLiteProvider` with `onInit`, `getFirstAsync`/`getAllAsync`/`runAsync` with variadic params, `expo-sqlite/kv-store`). SecureStore's roughly 2 KB historical limit and that it doesn't run on web.
- **Location:** permission plugin keys `locationWhenInUsePermission`, `photosPermission`, `cameraPermission`. `Accuracy.High` is about 10 m and `Balanced` about 100 m; `timeInterval` applies on Android only.
- **Testing:**
  - RNTL v14 makes `render`, `fireEvent`, `rerender` and `act` async (the course says "current versions" and awaits them).
  - `npx expo install jest-expo jest @types/jest --dev` matches the Expo docs.
- **EAS:**
  - `eas build:configure` and its default profiles.
  - `eas device:create` and `--auto-submit`.
  - The first Android `eas submit` goes to the internal track.
  - `eas update --channel`, `eas update:configure` and `eas update:rollback`.
  - The default update behaviour: download in the background, apply on the next launch.
- **Exercise numbers:** the grid layout, haversine values, route-matcher ranking and retry back-off all pass `check-exercises.mjs` (11 runnable exercises: every solution passes, every starter fails).

## Could not fully verify

- Whether Expo Router's `[...rest]` catch-all requires at least one segment, as lesson 3-5's table and exercise state. The docs say rest params arrive as an array but don't state the zero-segment case. The exercise defines this behaviour explicitly, so it's self-consistent, and I left it.
- Small cross-lesson inconsistency, left as is: lesson 3-2's exercise parses `id` to a number, while lesson 3-3's `Hike.id` is a string. Each lesson is correct on its own terms.

## Validation

- `node scripts/content/validate.mjs react-native-apps`: 0 errors, 0 warnings.
- `node scripts/content/check-exercises.mjs react-native-apps`: 11 runnable exercises checked, 0 problems.
