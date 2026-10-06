---
summary: Make Trailhead respond to touch with Pressable and accept typing with a controlled TextInput, including pressed feedback, tap targets, mobile keyboards and parsing what users type.
takeaways:
  - "`Pressable` is the default for anything tappable; its `style` can be a function of `{ pressed }` for instant feedback."
  - Tap targets should be at least 44 by 44 points; `hitSlop` enlarges the touch area without changing the layout.
  - "A controlled `TextInput` uses `value` plus `onChangeText`, which receives the string directly."
  - "`keyboardType` changes the keyboard, not the value: a `TextInput` always gives you a string, so parse and validate it yourself."
further:
  - title: Pressable
    url: https://reactnative.dev/docs/pressable
  - title: TextInput
    url: https://reactnative.dev/docs/textinput
  - title: Handling Touches
    url: https://reactnative.dev/docs/handling-touches
quiz:
  - q: "You set `keyboardType=\"decimal-pad\"` on Trailhead's distance input. What type is the value in `onChangeText`?"
    options:
      - text: A number, because the keyboard only allows digits.
        why: The keyboard type only changes which keys are shown. The value is always text, and paste can still insert anything.
      - text: A string, which you must parse; on some locales it will contain a comma as the decimal separator.
        why: Correct. A German or French keyboard shows a comma key, so "8,4" is a perfectly reasonable thing for a user to type.
      - text: A number on iOS and a string on Android.
        why: Both platforms give you a string. Platform differences show up in which keys appear, not in the type.
    answer: 1
  - q: Users say Trailhead's small trash icon is hard to hit, but the design must stay 24 by 24 points. What's the best fix?
    options:
      - text: Add `hitSlop={10}` to the Pressable so the touch area grows by 10 points on each side.
        why: Correct. The icon keeps its visual size while the tappable area reaches 44 by 44.
      - text: Wrap the icon in a second, invisible Pressable.
        why: Two overlapping touch targets make it unclear which one receives the press, and add an extra view for nothing.
      - text: Switch to `onLongPress` so users have more time to aim.
        why: Long-press changes the gesture, not the target size. Users still miss, and now they also wait.
    answer: 0
  - q: |
      What's wrong with this input?
      ```tsx
      const [name, setName] = useState('');
      <TextInput value={name} onChange={setName} />
      ```
    options:
      - text: Nothing; `onChange` and `onChangeText` are aliases.
        why: They aren't. `onChange` receives a native event object, so `name` would become an object.
      - text: TextInput can't be controlled; it must manage its own value.
        why: Controlled inputs are the normal pattern in React Native, exactly as on the web.
      - text: "`onChange` passes an event, not the text, so `name` becomes an object; use `onChangeText={setName}`."
        why: Correct. `onChangeText` hands you the new string directly.
    answer: 2
---

A web button gets hover styles, focus rings and a pointer cursor for free. On a phone there's no hover and no cursor: there's a thumb, which is wide, imprecise and moving. Good touch handling on mobile comes down to three things: a large enough target, feedback the instant the finger lands, and inputs that open the right keyboard.

## Pressable: the default for anything tappable

`Pressable` wraps any content and reports touches. Its `style` prop can be a function that receives `{ pressed }`, so you can dim or tint the button while the finger is down:

```tsx title=src/components/PrimaryButton.tsx
import { Pressable, Text } from 'react-native';

type Props = { label: string; onPress: () => void; disabled?: boolean };

export function PrimaryButton({ label, onPress, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        backgroundColor: disabled ? '#9bb5a7' : '#2f6f4e',
        opacity: pressed ? 0.75 : 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
      })}
    >
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
```

`accessibilityRole="button"` makes VoiceOver and TalkBack announce it as a button; the text inside becomes its label. For icon-only buttons, add `accessibilityLabel="Delete hike"` because there's no text to read.

You'll also see `Button` and `TouchableOpacity` in older code. `Button` can't be styled beyond a color, and the `Touchable*` family is the older API. Reach for `Pressable` and build your own button component once.

## Tap targets and hitSlop

Apple's guideline is a minimum of 44 by 44 points; Material Design says 48 by 48 dp. A 24-point icon is fine visually, but too small to hit while walking down a trail. `hitSlop` grows the touch area without changing layout:

```tsx
<Pressable
  onPress={() => onDelete(hike.id)}
  hitSlop={10}
  accessibilityRole="button"
  accessibilityLabel={`Delete ${hike.name}`}
>
  <TrashIcon size={24} />
</Pressable>
```

`Pressable` also gives you `onLongPress` (fired after about half a second by default) and `onPressIn` / `onPressOut` for the exact moments the finger lands and lifts. Trailhead uses a long press on a hike card to open a quick-actions sheet, a pattern iOS and Android users already know from their home screens. Use it for shortcuts only: nobody discovers a long press on their own, so every action behind one must also be reachable some other way.

On Android you can add `android_ripple={{ color: '#00000022' }}` for the platform's ripple effect; iOS ignores that prop, so the `pressed` style still matters there.

## TextInput: controlled, and always a string

`TextInput` works like a controlled `<input>`, with one naming difference. Use `onChangeText`, which hands you the new string. `onChange` gives you a native event object instead.

```tsx title=src/components/QuickLog.tsx
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { parseDistanceKm } from '../lib/parseDistance';

export function QuickLog({ onSave }: { onSave: (km: number) => void }) {
  const [text, setText] = useState('');
  const km = parseDistanceKm(text);

  return (
    <View style={{ gap: 8 }}>
      <Text>Distance (km)</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        accessibilityLabel="Distance (km)"
        keyboardType="decimal-pad"
        placeholder="8.4"
        returnKeyType="done"
        style={{ borderWidth: 1, borderColor: '#c9d3cc', borderRadius: 10, padding: 12, fontSize: 18 }}
      />
      <PrimaryButton label="Save" disabled={km === null} onPress={() => km !== null && onSave(km)} />
    </View>
  );
}
```

Notice what lives in state: the raw `text`, not a number. If you stored `Number(text)` instead, typing "8." would immediately become `8` and the dot would vanish under the user's thumb, and clearing the field would give you `0`. Keep exactly what the user typed, and derive the parsed value during render. The button reads the derived value and stays disabled until it's valid, which is clearer feedback than an error message that appears mid-typing.

The props that shape the mobile keyboard are worth knowing by name:

| Prop | What it does |
|---|---|
| `keyboardType` | `decimal-pad`, `number-pad`, `email-address`, `phone-pad`, `url` |
| `autoCapitalize` | `none` for emails and usernames; default capitalizes sentences |
| `autoComplete` / `textContentType` | let the OS offer saved emails, passwords and one-time codes |
| `returnKeyType` | the label on the return key: `next`, `done`, `search` |
| `secureTextEntry` | hides the characters for passwords |

Getting these right is most of what makes a form feel native. An email field that capitalizes the first letter, or a code field that doesn't offer the one-time code from the SMS that just arrived, tells users the app wasn't built with care.

:::mistake Trusting the keyboard to validate
`keyboardType="decimal-pad"` is a hint, not a filter. Users paste text, external keyboards type anything, and on a German phone the decimal key is a comma, so "8,4" arrives as a string `Number()` can't read (`Number('8,4')` is `NaN`). Parse every input in a small pure function and treat `null` as "not valid yet".
:::

## Parsing what people type

Here is the idea behind `parseDistanceKm`: normalize first (trim, lower-case, drop a trailing "km", turn a comma into a dot), then accept only a plain positive number within a sensible range.

```js run
function parseDistanceKm(text) {
  const cleaned = String(text).trim().toLowerCase().replace(/\s*km$/, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const km = Number(cleaned);
  return km > 0 && km <= 200 ? km : null;
}

for (const input of ['8.4', '8,4', ' 12 km', 'abc', '0', '1.2.3']) {
  console.log(JSON.stringify(input), '->', parseDistanceKm(input));
}
```

Because it's a plain function with no React Native imports, you can test it in milliseconds, which you'll do in section 5. Keeping logic like this out of components is a habit that pays for itself on mobile, where running the app to check a case takes much longer than on the web.

That completes the core toolkit. Section 2 is about making it look right: styling without the cascade, flexbox with different defaults, and screens of every size.
