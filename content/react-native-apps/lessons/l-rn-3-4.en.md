---
summary: Build Trailhead's add-hike form so it works with a phone keyboard, moving between fields, staying visible above the keyboard, saving on the first tap, and validating with clear per-field errors.
takeaways:
  - Keep the form draft as raw strings in one state object, and parse and validate only when you need the result.
  - "Chain fields with `returnKeyType=\"next\"` and refs, so the return key moves to the next input instead of closing the keyboard."
  - "Wrap the form in `KeyboardAvoidingView` with `behavior=\"padding\"` on iOS, and give the inner ScrollView `keyboardShouldPersistTaps=\"handled\"`."
  - Validate in a pure function that returns an errors object, and show each error next to its field after the first submit or blur.
further:
  - title: Keyboard handling
    url: https://docs.expo.dev/guides/keyboard-handling/
  - title: KeyboardAvoidingView
    url: https://reactnative.dev/docs/keyboardavoidingview
  - title: ScrollView keyboardShouldPersistTaps
    url: https://reactnative.dev/docs/scrollview#keyboardshouldpersisttaps
quiz:
  - q: Users report they have to tap Save twice on Trailhead's form while the keyboard is open. The first tap only closes the keyboard. What fixes it?
    options:
      - text: Call `Keyboard.dismiss()` at the start of the save handler.
        why: The save handler never ran on the first tap, so code inside it can't help.
      - text: Set `keyboardShouldPersistTaps="handled"` on the ScrollView that contains the form.
        why: Correct. By default, a tap outside the focused input while the keyboard is up only dismisses the keyboard; `handled` lets taps on buttons go through.
      - text: Move the Save button above the inputs.
        why: The tap is swallowed wherever the button is, as long as it's inside that ScrollView.
    answer: 1
  - q: On iOS, the notes field at the bottom of the form is hidden behind the keyboard when focused. Which setup is the usual fix?
    options:
      - text: "A `KeyboardAvoidingView` with `behavior=\"padding\"` and `flex: 1` around the form's ScrollView."
        why: Correct. The view adds bottom padding equal to the keyboard's height, so the ScrollView shrinks and can scroll the field into view.
      - text: "`position: 'absolute'` on the notes field with a high `zIndex`."
        why: The keyboard is a system window above your app; no zIndex puts your view over it.
      - text: Set `autoFocus` on the notes field.
        why: That opens the keyboard on mount, which makes the overlap happen sooner, not go away.
    answer: 0
  - q: "When should Trailhead show the error \"Distance must be a number\" under the distance field?"
    options:
      - text: On every keystroke from the first character.
        why: Typing "8," on the way to "8,4" is momentarily invalid. Errors while the user is still typing are noise.
      - text: Only in an alert after Save, listing every error at once.
        why: An alert hides the form, and the user has to remember the list after closing it.
      - text: After the user leaves the field or presses Save, next to the field, and updating live once it's showing.
        why: Correct. Wait until the user is done with a field, then keep the message in sync as they fix it.
    answer: 2
  - q: How do you make the return key on the name field move focus to the distance field?
    options:
      - text: "`tabIndex={2}` on the distance field."
        why: That's a web attribute. Phone keyboards have no tab order to set.
      - text: "`returnKeyType=\"next\"` on the name field and `autoFocus` on the distance field."
        why: "`autoFocus` acts once on mount, not when the name field's return key is pressed."
      - text: "Nothing; mobile keyboards move to the next field automatically."
        why: They don't. Without handling it, return closes the keyboard on a single-line input.
      - text: "`returnKeyType=\"next\"` plus `onSubmitEditing={() => distanceRef.current?.focus()}`, with a ref on the distance field."
        why: Correct. The key label says Next, and the handler moves focus.
    answer: 3
---

Forms are where mobile apps feel most different from the web. The keyboard covers half the screen, there's no Tab key, the first tap on a button sometimes only closes the keyboard, and typing on glass is slow enough that every unnecessary error message feels personal. Trailhead's "Log a hike" form has five fields: name, date, distance, duration and notes. Here's how to make it pleasant.

## A draft of raw strings

Keep everything the user typed in one object of **strings**, exactly as typed. Parse when you need numbers, as you did with `parseDistanceKm` in section 1:

```tsx title=src/app/new-hike.tsx
import { useRef, useState, type ComponentRef } from 'react';
import { TextInput } from 'react-native';

type Draft = { name: string; date: string; distance: string; duration: string; notes: string };

// Today's date in the phone's time zone. toISOString() would give the UTC date,
// which is already tomorrow (or still yesterday) for part of the day in most places.
function localToday() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const emptyDraft = (): Draft => ({ name: '', date: localToday(), distance: '', duration: '', notes: '' });

export default function NewHike() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof Draft, boolean>>>({});
  const distanceRef = useRef<ComponentRef<typeof TextInput>>(null);
  const durationRef = useRef<ComponentRef<typeof TextInput>>(null);

  const set = (field: keyof Draft) => (text: string) => setDraft((d) => ({ ...d, [field]: text }));
  // …errors, save and JSX below
}
```

The `set('distance')` helper gives each input an `onChangeText` without five near-identical functions. Storing strings means "8," stays "8," while the user types, instead of collapsing to `8` or `NaN`.

## Moving between fields

There's no Tab key, so the return key does the job. Label it with `returnKeyType="next"`, and when it's pressed, focus the next input through a ref:

```tsx
<TextInput
  value={draft.name}
  onChangeText={set('name')}
  placeholder="Ridge Loop"
  autoCapitalize="words"
  returnKeyType="next"
  submitBehavior="submit"
  onSubmitEditing={() => distanceRef.current?.focus()}
  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
/>
<TextInput
  ref={distanceRef}
  value={draft.distance}
  onChangeText={set('distance')}
  keyboardType="decimal-pad"
  returnKeyType="next"
  onSubmitEditing={() => durationRef.current?.focus()}
  onBlur={() => setTouched((t) => ({ ...t, distance: true }))}
/>
```

`submitBehavior="submit"` keeps the keyboard open while focus moves, so it doesn't flicker closed and open again. On the last field, use `returnKeyType="done"` and let it submit the form. One honest caveat: numeric keypads on iOS have no return key at all, so users tap the next field or a toolbar button instead. That's normal, and another reason not to rely on the keyboard alone.

## Keeping fields above the keyboard

When the keyboard opens, it sits on top of your app. A field near the bottom (the notes) disappears behind it. The standard fix wraps the form in `KeyboardAvoidingView` and puts a `ScrollView` inside:

```tsx
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
  <ScrollView
    contentContainerStyle={{ padding: 16, gap: 16 }}
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="on-drag"
  >
    {/* fields and the Save button */}
  </ScrollView>
</KeyboardAvoidingView>
```

On iOS, `padding` adds bottom padding equal to the keyboard height, so the ScrollView shrinks and the focused field can scroll into view. On Android the window usually resizes for the keyboard already, so `undefined` is the recommended value. `keyboardDismissMode="on-drag"` closes the keyboard when the user scrolls, which feels natural.

:::mistake The Save button that needs two taps
By default, a ScrollView treats a tap outside the focused input as "dismiss the keyboard" and nothing else. The user taps Save, the keyboard closes, and nothing saves; they tap again. `keyboardShouldPersistTaps="handled"` lets taps on buttons and other touchables go through while still dismissing the keyboard for taps on empty space. Put it on every ScrollView or FlatList that contains inputs.
:::

For long forms with many fields, Expo's docs recommend `react-native-keyboard-controller`, whose `KeyboardAwareScrollView` scrolls the focused field into view automatically; the same library's `KeyboardToolbar` adds previous, next and done buttons above the keyboard. It needs a development build, which Trailhead gets in section 4.

## A word about dates

Trailhead's draft keeps the date as a `YYYY-MM-DD` string, defaulted to today, because most hikes are logged the same day. Typing dates on a phone keyboard is miserable, though, so production apps show the platform's own date picker: a wheel or calendar on iOS, a dialog on Android. The community package `@react-native-community/datetimepicker` wraps both, and it's a good example of a component whose behaviour differs enough by platform that you'll want the per-platform files from section 2.

## Validation that doesn't nag

Keep the rules in a pure function: draft in, errors out. An empty object means valid.

```ts title=src/lib/validateHike.ts
export function validateHike(d: Draft) {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!d.name.trim()) errors.name = 'Give the hike a name.';
  if (parseDistanceKm(d.distance) === null) errors.distance = 'Enter a distance in km, like 8.4.';
  return errors;
}
```

Then decide **when** to show each message. Showing errors on the first keystroke punishes people for not having finished typing. Waiting for an alert after Save hides the form behind a list they must memorize. The pattern that works: show a field's error once the user has left it (`touched`) or pressed Save (`submitted`), next to the field, and keep it live from then on so it disappears the moment they fix it.

```tsx
const errors = validateHike(draft);
const show = (field: keyof Draft) => (submitted || touched[field]) && errors[field];

function save() {
  setSubmitted(true);
  if (Object.keys(errors).length > 0) return;
  dispatch({ type: 'added', hike: toHike(draft) });
  router.back();
}

// under the distance input:
{show('distance') ? <Text style={{ color: '#b42318' }}>{errors.distance}</Text> : null}
```

Two accessibility touches cost a line each: give every input an `accessibilityLabel` that matches its visible label, and keep error text right below its field so screen readers reach it next.

`toHike` converts the valid draft into a real `Hike` (parsing numbers, generating an id). After saving, `router.back()` returns to the log, where the new hike is already at the top because the reducer put it there.

The form currently opens as a normal pushed screen. Next you'll present it as a modal, protect screens behind sign-in, and let links open Trailhead on a specific hike.
