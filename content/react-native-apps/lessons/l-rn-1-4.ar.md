---
summary: اجعل Trailhead يستجيب للّمس باستخدام Pressable، ويقبل الكتابة عبر TextInput مضبوط (controlled)، بما في ذلك الاستجابة البصرية عند الضغط، وأحجام أهداف اللمس، ولوحات مفاتيح الجوّال، وتحليل ما يكتبه المستخدمون.
takeaways:
  - "`Pressable` هو الخيار الافتراضي لأي شيء قابل للنقر؛ ويمكن أن تكون الـ `style` الخاصة به دالة تستقبل `{ pressed }` لتعطي استجابة بصرية فورية."
  - يجب ألا يقلّ هدف اللمس عن 44 في 44 نقطة؛ و`hitSlop` يوسّع منطقة اللمس دون تغيير التخطيط.
  - "الـ `TextInput` المضبوط يستخدم `value` مع `onChangeText`، التي تستقبل النص مباشرة."
  - "`keyboardType` يغيّر لوحة المفاتيح لا القيمة: `TextInput` يعطيك نصًّا دائمًا، فحلّله وتحقّق منه بنفسك."
further:
  - title: Pressable
    url: https://reactnative.dev/docs/pressable
  - title: TextInput
    url: https://reactnative.dev/docs/textinput
  - title: Handling Touches
    url: https://reactnative.dev/docs/handling-touches
quiz:
  - q: "وضعت `keyboardType=\"decimal-pad\"` على حقل المسافة في Trailhead. ما نوع القيمة التي تصل إلى `onChangeText`؟"
    options:
      - text: رقم، لأن لوحة المفاتيح لا تسمح إلا بالأرقام.
        why: نوع لوحة المفاتيح يغيّر فقط المفاتيح المعروضة. القيمة نصّ دائمًا، واللصق ما زال قادرًا على إدخال أي شيء.
      - text: نصّ (string) يجب أن تحلّله؛ وفي بعض الإعدادات الإقليمية سيحوي فاصلة بدلًا من النقطة العشرية.
        why: صحيح. لوحة المفاتيح الألمانية أو الفرنسية تعرض مفتاح فاصلة، لذا فإن "8,4" شيء معقول تمامًا أن يكتبه المستخدم.
      - text: رقم على iOS ونصّ على Android.
        why: المنصّتان تعطيانك نصًّا. الفروق بين المنصّات تظهر في المفاتيح المعروضة، لا في النوع.
    answer: 1
  - q: يقول المستخدمون إن أيقونة سلّة المهملات الصغيرة في Trailhead صعبة الإصابة، لكن التصميم يجب أن يبقى 24 في 24 نقطة. ما أفضل إصلاح؟
    options:
      - text: أضف `hitSlop={10}` إلى الـ Pressable لتكبر منطقة اللمس 10 نقاط من كل جانب.
        why: صحيح. تحتفظ الأيقونة بحجمها المرئي بينما تصل المنطقة القابلة للنقر إلى 44 في 44.
      - text: غلّف الأيقونة بـ Pressable ثانٍ غير مرئي.
        why: هدفا لمس متداخلان يجعلان من غير الواضح أيهما يستقبل الضغطة، ويضيفان view إضافيًا بلا فائدة.
      - text: انتقل إلى `onLongPress` ليكون أمام المستخدمين وقت أطول للتصويب.
        why: الضغط المطوّل يغيّر الإيماءة لا حجم الهدف. سيظل المستخدمون يخطئون الهدف، وسينتظرون أيضًا.
    answer: 0
  - q: |
      ما المشكلة في حقل الإدخال هذا؟
      ```tsx
      const [name, setName] = useState('');
      <TextInput value={name} onChange={setName} />
      ```
    options:
      - text: لا مشكلة؛ `onChange` و`onChangeText` اسمان لشيء واحد.
        why: ليسا كذلك. `onChange` يستقبل كائن حدث أصليًا، فتصبح `name` كائنًا.
      - text: لا يمكن أن يكون TextInput مضبوطًا؛ بل يجب أن يدير قيمته بنفسه.
        why: الحقول المضبوطة هي النمط المعتاد في React Native، تمامًا كما على الويب.
      - text: "`onChange` يمرّر حدثًا لا النص، فتصبح `name` كائنًا؛ استخدم `onChangeText={setName}`."
        why: صحيح. `onChangeText` يعطيك النص الجديد مباشرة.
    answer: 2
---

زرّ الويب يحصل على تنسيقات المرور بالمؤشّر (hover) وحلقات التركيز ومؤشّر اليد مجانًا. أما على الهاتف فلا hover ولا مؤشّر: هناك إبهام، عريض وغير دقيق ومتحرّك. والتعامل الجيد مع اللمس على الجوّال يتلخّص في ثلاثة أشياء: هدف كبير بما يكفي، واستجابة بصرية لحظة ملامسة الإصبع، وحقول إدخال تفتح لوحة المفاتيح المناسبة.

## Pressable: الخيار الافتراضي لكل ما يُنقَر

يغلّف `Pressable` أي محتوى ويُبلغ عن اللمسات. ويمكن أن يكون الـ prop المسمّى `style` دالة تستقبل `{ pressed }`، فتستطيع تعتيم الزر أو تلوينه ما دام الإصبع عليه:

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

تجعل `accessibilityRole="button"` قارئَي الشاشة VoiceOver وTalkBack يعلنانه زرًّا؛ ويصبح النص الذي بداخله هو تسميته. أما الأزرار التي ليس فيها إلا أيقونة، فأضف لها `accessibilityLabel="Delete hike"` لأنه لا يوجد نص يُقرأ.

سترى أيضًا `Button` و`TouchableOpacity` في الكود القديم. لا يمكن تنسيق `Button` بأكثر من لون، وعائلة `Touchable*` هي الواجهة الأقدم. استخدم `Pressable`، وابنِ component الزر الخاص بك مرة واحدة.

## أهداف اللمس وhitSlop

إرشادات Apple تحدّد حدًّا أدنى 44 في 44 نقطة؛ وتقول Material Design إن الحد 48 في 48 dp. أيقونة بحجم 24 نقطة مقبولة بصريًا، لكنها أصغر من أن تُصاب وأنت تمشي على درب. يوسّع `hitSlop` منطقة اللمس دون تغيير التخطيط:

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

يعطيك `Pressable` أيضًا `onLongPress` (يُطلَق افتراضيًا بعد نحو نصف ثانية)، و`onPressIn` / `onPressOut` للّحظتين اللتين يلامس فيهما الإصبع الشاشة ثم يرتفع عنها. يستخدم Trailhead الضغط المطوّل على بطاقة الرحلة لفتح لوحة إجراءات سريعة، وهو نمط يعرفه مستخدمو iOS وAndroid من شاشاتهم الرئيسية. استخدمه للاختصارات فقط: لا أحد يكتشف الضغط المطوّل وحده، فكل إجراء خلفه يجب أن يكون متاحًا بطريقة أخرى أيضًا.

على Android يمكنك إضافة `android_ripple={{ color: '#00000022' }}` لتأثير التموّج الخاص بالمنصّة؛ أما iOS فيتجاهل هذا الـ prop، فيبقى تنسيق `pressed` مهمًّا هناك.

## TextInput: مضبوط، ونصّ دائمًا

يعمل `TextInput` مثل `<input>` مضبوط، مع اختلاف واحد في التسمية. استخدم `onChangeText`، التي تعطيك النص الجديد. أما `onChange` فتعطيك كائن حدث أصليًا بدلًا من ذلك.

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

لاحظ ما يُخزَّن في الـ state: النص الخام `text`، لا رقم. لو خزّنت `Number(text)` بدلًا منه، لتحوّلت كتابة "8." فورًا إلى `8` واختفت النقطة تحت إبهام المستخدم، ولأعطاك مسح الحقل `0`. احتفظ بما كتبه المستخدم بالضبط، واشتقّ القيمة المحلَّلة أثناء الـ render. الزر يقرأ القيمة المشتقّة ويبقى معطّلًا حتى تصبح صالحة، وهذه استجابة أوضح من رسالة خطأ تظهر في منتصف الكتابة.

الـ props التي تشكّل لوحة مفاتيح الجوّال تستحق أن تعرفها بأسمائها:

| الـ prop | ماذا يفعل |
|---|---|
| `keyboardType` | `decimal-pad`، `number-pad`، `email-address`، `phone-pad`، `url` |
| `autoCapitalize` | `none` للبريد الإلكتروني وأسماء المستخدمين؛ والافتراضي يكبّر أول حرف في الجملة |
| `autoComplete` / `textContentType` | تسمح لنظام التشغيل باقتراح عناوين البريد وكلمات المرور ورموز التحقّق المحفوظة |
| `returnKeyType` | التسمية على مفتاح الإدخال: `next`، `done`، `search` |
| `secureTextEntry` | يُخفي الأحرف في كلمات المرور |

ضبط هذه الخصائص بشكل صحيح هو معظم ما يجعل النموذج يبدو أصليًا. حقل بريد إلكتروني يكبّر الحرف الأول، أو حقل رمز لا يقترح رمز التحقّق من الرسالة النصية التي وصلت للتوّ، يخبر المستخدمين أن التطبيق لم يُبنَ بعناية.

:::mistake الثقة بلوحة المفاتيح للتحقّق من الإدخال
`keyboardType="decimal-pad"` تلميح، لا مُرشِّح. المستخدمون يلصقون نصوصًا، ولوحات المفاتيح الخارجية تكتب أي شيء، وعلى هاتف ألماني يكون المفتاح العشري فاصلة، فتصل "8,4" نصًّا لا تستطيع `Number()` قراءته (`Number('8,4')` تساوي `NaN`). حلّل كل إدخال في دالة نقية صغيرة، وتعامل مع `null` على أنها «ليست صالحة بعد».
:::

## تحليل ما يكتبه الناس

هذه هي الفكرة وراء `parseDistanceKm`: وحّد الصيغة أولًا (احذف المسافات، حوّل إلى أحرف صغيرة، أزل "km" اللاحقة، حوّل الفاصلة إلى نقطة)، ثم اقبل فقط رقمًا موجبًا عاديًا ضمن نطاق معقول.

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

ولأنها دالة عادية لا تستورد شيئًا من React Native، يمكنك اختبارها في أجزاء من الثانية، وهذا ما ستفعله في القسم 5. إبقاء منطق كهذا خارج الـ components عادة تعوّض كلفتها على الجوّال، حيث يستغرق تشغيل التطبيق للتحقّق من حالة ما وقتًا أطول بكثير مما على الويب.

بهذا تكتمل الأدوات الأساسية. أما القسم 2 فعن جعل كل ذلك يبدو صحيحًا: التنسيق دون cascade، وflexbox بقيم افتراضية مختلفة، وشاشات بكل الأحجام.
