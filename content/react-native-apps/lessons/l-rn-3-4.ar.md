---
summary: ابنِ نموذج إضافة رحلة في Trailhead بحيث يعمل مع لوحة مفاتيح الهاتف، فينتقل بين الحقول، ويبقى ظاهرًا فوق لوحة المفاتيح، ويحفظ من النقرة الأولى، ويتحقّق من المدخلات برسائل خطأ واضحة لكل حقل.
takeaways:
  - احفظ مسوّدة النموذج نصوصًا خامًا في كائن state واحد، ولا تحلّلها وتتحقّق منها إلا حين تحتاج إلى النتيجة.
  - "اربط الحقول ببعضها باستخدام `returnKeyType=\"next\"` والـ refs، فينقلك مفتاح الإدخال إلى الحقل التالي بدلًا من إغلاق لوحة المفاتيح."
  - "غلّف النموذج بـ `KeyboardAvoidingView` مع `behavior=\"padding\"` على iOS، وأعطِ الـ ScrollView الداخلي `keyboardShouldPersistTaps=\"handled\"`."
  - تحقّق من المدخلات في دالة نقية تُرجع كائن أخطاء، واعرض كل خطأ بجوار حقله بعد أول محاولة حفظ أو بعد مغادرة الحقل.
further:
  - title: Keyboard handling
    url: https://docs.expo.dev/guides/keyboard-handling/
  - title: KeyboardAvoidingView
    url: https://reactnative.dev/docs/keyboardavoidingview
  - title: ScrollView keyboardShouldPersistTaps
    url: https://reactnative.dev/docs/scrollview#keyboardshouldpersisttaps
quiz:
  - q: يقول المستخدمون إنهم مضطرون للنقر على Save مرتين في نموذج Trailhead حين تكون لوحة المفاتيح مفتوحة. النقرة الأولى تغلق لوحة المفاتيح فقط. ما الإصلاح؟
    options:
      - text: استدعِ `Keyboard.dismiss()` في بداية دالة الحفظ.
        why: دالة الحفظ لم تعمل أصلًا في النقرة الأولى، فالكود داخلها لا يستطيع المساعدة.
      - text: اضبط `keyboardShouldPersistTaps="handled"` على الـ ScrollView الذي يحوي النموذج.
        why: صحيح. افتراضيًا، النقرة خارج الحقل المركّز عليه أثناء ظهور لوحة المفاتيح تغلق لوحة المفاتيح فقط؛ أما `handled` فتسمح للنقرات على الأزرار بالمرور.
      - text: انقل زرّ Save فوق الحقول.
        why: النقرة تُبتلع أينما كان الزر، ما دام داخل ذلك الـ ScrollView.
    answer: 1
  - q: على iOS، يختفي حقل الملاحظات في أسفل النموذج خلف لوحة المفاتيح حين يُركَّز عليه. ما الإعداد المعتاد لإصلاح ذلك؟
    options:
      - text: "`KeyboardAvoidingView` مع `behavior=\"padding\"` و`flex: 1` حول الـ ScrollView الخاص بالنموذج."
        why: صحيح. يضيف الـ view حشوًا سفليًا يساوي ارتفاع لوحة المفاتيح، فينكمش الـ ScrollView ويستطيع تمرير الحقل إلى منطقة الرؤية.
      - text: "`position: 'absolute'` على حقل الملاحظات مع `zIndex` مرتفع."
        why: لوحة المفاتيح نافذة نظام فوق تطبيقك؛ ولا يوجد zIndex يضع الـ view الخاص بك فوقها.
      - text: اضبط `autoFocus` على حقل الملاحظات.
        why: هذا يفتح لوحة المفاتيح عند التركيب، فيحدث التداخل أبكر، ولا يختفي.
    answer: 0
  - q: "متى يجب أن يعرض Trailhead الخطأ \"Distance must be a number\" تحت حقل المسافة؟"
    options:
      - text: مع كل ضغطة مفتاح منذ الحرف الأول.
        why: كتابة "8," في الطريق إلى "8,4" غير صالحة للحظة. والأخطاء أثناء الكتابة مجرّد ضجيج.
      - text: في نافذة تنبيه فقط بعد Save، تسرد كل الأخطاء دفعة واحدة.
        why: نافذة التنبيه تُخفي النموذج، ويضطر المستخدم إلى تذكّر القائمة بعد إغلاقها.
      - text: بعد أن يغادر المستخدم الحقل أو يضغط Save، بجوار الحقل، مع تحديثه حيًّا بعد ظهوره.
        why: صحيح. انتظر حتى ينتهي المستخدم من الحقل، ثم أبقِ الرسالة متزامنة بينما يصلحها.
    answer: 2
  - q: كيف تجعل مفتاح الإدخال في حقل الاسم ينقل التركيز إلى حقل المسافة؟
    options:
      - text: "`tabIndex={2}` على حقل المسافة."
        why: هذه سمة ويب. لوحات مفاتيح الهواتف ليس فيها ترتيب Tab يمكن ضبطه.
      - text: "`returnKeyType=\"next\"` على حقل الاسم و`autoFocus` على حقل المسافة."
        why: "`autoFocus` يعمل مرة واحدة عند التركيب، لا حين يُضغط مفتاح الإدخال في حقل الاسم."
      - text: لا شيء؛ لوحات مفاتيح الجوّال تنتقل إلى الحقل التالي تلقائيًا.
        why: لا تفعل. دون معالجة ذلك، يغلق مفتاح الإدخال لوحة المفاتيح في الحقل ذي السطر الواحد.
      - text: "`returnKeyType=\"next\"` مع `onSubmitEditing={() => distanceRef.current?.focus()}`، وref على حقل المسافة."
        why: صحيح. تسمية المفتاح تقول Next، والمعالج ينقل التركيز.
    answer: 3
---

النماذج هي المكان الذي تختلف فيه تطبيقات الجوّال عن الويب أكثر من أي مكان آخر. لوحة المفاتيح تغطّي نصف الشاشة، ولا يوجد مفتاح Tab، والنقرة الأولى على زرّ أحيانًا لا تفعل إلا إغلاق لوحة المفاتيح، والكتابة على الزجاج بطيئة لدرجة أن كل رسالة خطأ غير ضرورية تبدو شخصية. لنموذج "Log a hike" في Trailhead خمسة حقول: الاسم، والتاريخ، والمسافة، والمدّة، والملاحظات. وهكذا تجعله مريحًا.

## مسوّدة من النصوص الخام

احفظ كل ما كتبه المستخدم في كائن واحد من **النصوص**، كما كُتب بالضبط. وحلّله حين تحتاج إلى أرقام، كما فعلت مع `parseDistanceKm` في القسم 1:

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

تعطي الدالة المساعدة `set('distance')` كل حقل `onChangeText` دون خمس دوال شبه متطابقة. وتخزين النصوص يعني أن "8," تبقى "8," أثناء الكتابة، بدلًا من أن تنهار إلى `8` أو `NaN`.

## التنقّل بين الحقول

لا يوجد مفتاح Tab، فيقوم مفتاح الإدخال بالمهمّة. سمِّه باستخدام `returnKeyType="next"`، وحين يُضغط، ركّز على الحقل التالي عبر ref:

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

يُبقي `submitBehavior="submit"` لوحة المفاتيح مفتوحة بينما ينتقل التركيز، فلا تومض مغلقةً ثم مفتوحةً من جديد. وفي الحقل الأخير استخدم `returnKeyType="done"` ودعه يرسل النموذج. وتنبيه صريح: لوحات المفاتيح الرقمية على iOS ليس فيها مفتاح إدخال أصلًا، فينقر المستخدمون على الحقل التالي أو على زرّ في شريط أدوات. هذا طبيعي، وسبب آخر لعدم الاعتماد على لوحة المفاتيح وحدها.

## إبقاء الحقول فوق لوحة المفاتيح

حين تنفتح لوحة المفاتيح، تستقرّ فوق تطبيقك. والحقل القريب من الأسفل (الملاحظات) يختفي خلفها. الإصلاح المعتاد يغلّف النموذج بـ `KeyboardAvoidingView` ويضع `ScrollView` بداخله:

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

على iOS، تضيف `padding` حشوًا سفليًا يساوي ارتفاع لوحة المفاتيح، فينكمش الـ ScrollView ويمكن تمرير الحقل المركّز عليه إلى منطقة الرؤية. أما على Android فعادةً ما تتغيّر أبعاد النافذة لاستيعاب لوحة المفاتيح أصلًا، لذا فإن `undefined` هي القيمة الموصى بها. ويغلق `keyboardDismissMode="on-drag"` لوحة المفاتيح حين يمرّر المستخدم، وهذا يبدو طبيعيًا.

:::mistake زرّ Save الذي يحتاج إلى نقرتين
افتراضيًا، يعامل الـ ScrollView النقرة خارج الحقل المركّز عليه على أنها «أغلق لوحة المفاتيح» ولا شيء غير ذلك. ينقر المستخدم على Save، فتنغلق لوحة المفاتيح، ولا يُحفظ شيء؛ فينقر مرة أخرى. يسمح `keyboardShouldPersistTaps="handled"` للنقرات على الأزرار والعناصر القابلة للمس بالمرور، مع إبقاء إغلاق لوحة المفاتيح عند النقر على مساحة فارغة. ضعه على كل ScrollView أو FlatList يحوي حقول إدخال.
:::

وللنماذج الطويلة ذات الحقول الكثيرة، توصي وثائق Expo بمكتبة `react-native-keyboard-controller`، التي يمرّر الـ `KeyboardAwareScrollView` الخاص بها الحقل المركّز عليه إلى منطقة الرؤية تلقائيًا؛ ويضيف `KeyboardToolbar` من المكتبة نفسها فوق لوحة المفاتيح أزرارًا للسابق والتالي والإنهاء. تحتاج إلى development build، وهو ما سيحصل عليه Trailhead في القسم 4.

## كلمة عن التواريخ

تحتفظ مسوّدة Trailhead بالتاريخ نصًّا بصيغة `YYYY-MM-DD`، قيمته الافتراضية تاريخ اليوم، لأن معظم الرحلات تُسجَّل في اليوم نفسه. لكن كتابة التواريخ على لوحة مفاتيح الهاتف مزعجة، لذا تعرض تطبيقات الإنتاج منتقي التاريخ الخاص بالمنصّة: عجلة أو تقويم على iOS، ونافذة حوار على Android. تغلّف حزمة المجتمع `@react-native-community/datetimepicker` الاثنين معًا، وهي مثال جيد على component يختلف سلوكه بين المنصّتين بما يكفي لتريد معه الملفات الخاصة بكل منصّة من القسم 2.

## تحقّق لا يُزعج

احفظ القواعد في دالة نقية: المسوّدة تدخل، والأخطاء تخرج. والكائن الفارغ يعني أن المدخلات صالحة.

```ts title=src/lib/validateHike.ts
export function validateHike(d: Draft) {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!d.name.trim()) errors.name = 'Give the hike a name.';
  if (parseDistanceKm(d.distance) === null) errors.distance = 'Enter a distance in km, like 8.4.';
  return errors;
}
```

ثم قرّر **متى** تعرض كل رسالة. عرض الأخطاء من أول ضغطة مفتاح يعاقب الناس لأنهم لم ينتهوا من الكتابة. وانتظار نافذة تنبيه بعد Save يُخفي النموذج خلف قائمة يجب أن يحفظوها. النمط الذي ينجح: اعرض خطأ الحقل بعد أن يغادره المستخدم (`touched`) أو يضغط Save (`submitted`)، بجوار الحقل، وأبقِه حيًّا من تلك اللحظة فيختفي لحظة إصلاحه.

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

لمستان لإمكانية الوصول تكلّف كلٌّ منهما سطرًا واحدًا: أعطِ كل حقل `accessibilityLabel` يطابق تسميته المرئية، وأبقِ نص الخطأ تحت حقله مباشرة ليصل إليه قارئ الشاشة بعده.

تحوّل `toHike` المسوّدة الصالحة إلى `Hike` حقيقي (تحلّل الأرقام وتولّد معرّفًا). وبعد الحفظ، يعيد `router.back()` المستخدم إلى السجلّ، حيث تكون الرحلة الجديدة في الأعلى أصلًا لأن الـ reducer وضعها هناك.

يفتح النموذج حاليًا شاشةً عادية مُضافة إلى الـ stack. في الدرس التالي ستعرضه بوصفه modal، وتحمي الشاشات خلف تسجيل الدخول، وتسمح للروابط بفتح Trailhead على رحلة محدّدة.
