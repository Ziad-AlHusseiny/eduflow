---
summary: حوّل الملفات داخل src/app إلى شاشات Trailhead باستخدام Expo Router، وغلّفها بـ stack أصلي عبر ملف layout، وتنقّل بينها باستخدام Link وكائن router.
takeaways:
  - كل ملف داخل `src/app` هو مسار (route)، ومساره هو الـ URL؛ أبقِ الـ components والـ hooks والأدوات المساعدة خارج ذلك المجلّد.
  - يغلّف ملف `_layout.tsx` المسارات المجاورة له بأداة تنقّل (navigator)، مثل `Stack` أصلي.
  - "استخدم `<Link href>` للتنقّل الذي ينقر عليه المستخدم، واستخدم `router.push` و`router.replace` و`router.back` من الكود."
  - "`push` يضيف شاشة إلى الـ stack، و`back` يُزيلها، و`replace` يستبدل الشاشة الحالية فلا يستطيع المستخدم العودة إليها."
further:
  - title: Expo Router introduction
    url: https://docs.expo.dev/router/introduction/
  - title: Core concepts of file-based routing
    url: https://docs.expo.dev/router/basics/core-concepts/
  - title: Navigating between pages
    url: https://docs.expo.dev/router/basics/navigation/
quiz:
  - q: أضفت `src/app/HikeRow.tsx` ليحوي component صفّ قائمة قابلًا لإعادة الاستخدام. ماذا يحدث؟
    options:
      - text: لا شيء خاص؛ يعامل Expo Router الملفات التي في اسمها `Screen` فقط على أنها مسارات.
        why: لا توجد قاعدة تسمية كهذه. كل ملف في مجلّد التطبيق مسار.
      - text: يسجّله Expo Router مسارًا على `/HikeRow`، فيصبح component مخصّص لإعادة الاستخدام شاشةً يمكن التنقّل إليها.
        why: صحيح. ضع الـ components المشتركة في `src/components` (أو في أي مكان خارج `src/app`).
      - text: يفشل البناء، لأن ملفات المسارات يجب أن تكون بأحرف صغيرة.
        why: حالة الأحرف لا تجعل الملف خارج المسارات. سيُسجَّل مع ذلك على `/HikeRow`.
    answer: 1
  - q: بعد أن ينهي المستخدم الشاشات التعريفية (onboarding)، ينتقل Trailhead إلى سجلّ الرحلات. يجب ألا يعيده زرّ الرجوع إلى الشاشات التعريفية. أيّ استدعاء يناسب؟
    options:
      - text: "`router.push('/')`"
        why: "`push` يترك الشاشات التعريفية تحتها، فيعود الرجوع إليها."
      - text: "`router.back()`"
        why: هذا يذهب إلى ما كان قبل الشاشات التعريفية، وهو ليس سجلّ الرحلات.
      - text: "`router.replace('/')`"
        why: صحيح. يستبدل `replace` الشاشة الحالية بالجديدة، فلا يبقى شيء يُرجَع إليه.
    answer: 2
  - q: أين يوضع عنوان الترويسة لشاشة `/settings`؟
    options:
      - text: "في الـ layout، `<Stack.Screen name=\"settings\" options={{ title: 'Settings' }} />`، أو يُضبط من الشاشة نفسها بالـ component ذاته."
        why: صحيح. يمكن أن تعيش الخيارات في الـ layout (جيد للعناوين الثابتة) أو أن تُرسم داخل الشاشة (جيد حين تعتمد على البيانات).
      - text: في `app.json` تحت `expo.routes.settings.title`.
        why: لا يوجد مفتاح كهذا. خيارات التنقّل تعيش في الـ layouts والشاشات.
      - text: في عنصر `<title>` أعلى الـ JSX الخاص بالشاشة.
        why: هذا HTML. الترويسات الأصلية تُضبط عبر خيارات أداة التنقّل.
    answer: 0
---

على الويب، يُظهر شريط العنوان مكانك، ويمشي زرّ الرجوع عبر السجلّ. أما على الهاتف فلا يرى المستخدمون أيًّا منهما: يرون شاشات تنزلق من اليمين، وسهم رجوع أو إيماءة سحب، وtabs في الأسفل. وتحت السطح، ما زال Expo Router يعطي كل شاشة URL، وهذا ما يجعل الـ deep links والتنقّل المضبوط بالأنواع ونسخة الويب ممكنة. تحصل على النموذجين معًا.

## الملفات هي المسارات

يبني Expo Router نظام التنقّل من الملفات الموجودة في `src/app`. مسار الملف هو المسار (route):

```text
src/app/
  _layout.tsx          wraps everything below in a navigator
  index.tsx            /
  about.tsx            /about
  settings/
    _layout.tsx        wraps the settings screens
    index.tsx          /settings
    units.tsx          /settings/units
  +not-found.tsx       any URL that doesn't match
```

كل ملف مسار يصدّر component بشكل افتراضي (default export). وهذا كل ما تعنيه الشاشة:

```tsx title=src/app/about.tsx
import { Text, View } from 'react-native';

export default function About() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Trailhead keeps a private log of your hikes.</Text>
    </View>
  );
}
```

ولأن **كل** ملف في المجلّد يصبح مسارًا، أبقِ كل ما عداه في مكان آخر: `src/components`، و`src/lib`، و`src/state`. component صفّ حُفظ خطأً في `src/app` يصبح شاشة يستطيع أي أحد الوصول إليها عبر deep link.

## الـ layouts تغلّف ما يجاورها

يرسم ملف `_layout.tsx` أداة تنقّل حول المسارات الموجودة في مجلّده. يستخدم الـ root layout في Trailhead **Stack**، وهو أداة التنقّل الأصلية التي تضيف الشاشات وتُزيلها بحركات المنصّة، مع السحب للرجوع على iOS وإيماءة الرجوع على مستوى النظام في Android:

```tsx title=src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTintColor: '#2f6f4e' }}>
      <Stack.Screen name="index" options={{ title: 'Trailhead' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}
```

تنطبق `screenOptions` على كل شاشة في الـ stack؛ وكل `Stack.Screen` يخصّص شاشة واحدة، تُطابَق باسم مسارها `name`. لست مضطرًا إلى إدراج كل مسار: المسارات غير المدرجة تعمل مع ذلك بالخيارات الافتراضية.

بضعة خيارات للترويسة تغطّي معظم الاحتياجات: `title`، و`headerShown: false` للشاشات التي ترسم شريطها العلوي بنفسها (مثل الخريطة بملء الشاشة من الدرس السابق)، و`headerBackTitle` للتسمية بجوار سهم الرجوع في iOS، و`headerRight` لزرّ مثل "Edit". وعلى iOS يعطيك `headerLargeTitle: true` العنوان الكبير القابل للطي الذي تراه في تطبيقات Apple نفسها، وهو يناسب قائمة رئيسية مثل سجلّ الرحلات.

وحين يعتمد العنوان على البيانات (اسم الرحلة مثلًا)، ارسم `<Stack.Screen options={{ title: hike.name }} />` داخل الشاشة نفسها. لا يرسم شيئًا مرئيًا؛ بل يضبط ترويسة الشاشة التي هو فيها.

:::figure الملفات تصبح مسارات، والـ Stack في الـ layout يحمل الشاشات التي زرتها
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">الملفات index.tsx وsettings/index.tsx وsettings/units.tsx تقابل العناوين / و/settings و/settings/units؛ والتنقّل يضيف كلًّا منها إلى stack، والرجوع يُزيل الشاشة العليا.</title>
  <rect class="d-box" x="20" y="30" width="220" height="190" rx="12"/>
  <text class="d-label-strong" x="40" y="58">src/app/</text>
  <text class="d-code" x="50" y="92">index.tsx</text>
  <text class="d-code" x="50" y="132">settings/index.tsx</text>
  <text class="d-code" x="50" y="172">settings/units.tsx</text>
  <path class="d-arrow" d="M240 88 L300 88" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M240 128 L300 128" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M240 168 L300 168" marker-end="url(#arrow)"/>
  <text class="d-code" x="310" y="92">/</text>
  <text class="d-code" x="310" y="132">/settings</text>
  <text class="d-code" x="310" y="172">/settings/units</text>
  <rect class="d-box-primary" x="480" y="150" width="170" height="40" rx="8"/>
  <text class="d-label" x="565" y="175" text-anchor="middle">/</text>
  <rect class="d-box-primary" x="480" y="104" width="170" height="40" rx="8"/>
  <text class="d-label" x="565" y="129" text-anchor="middle">/settings</text>
  <rect class="d-box-accent" x="480" y="58" width="170" height="40" rx="8"/>
  <text class="d-label-strong" x="565" y="83" text-anchor="middle">/settings/units</text>
  <text class="d-label-muted" x="565" y="40" text-anchor="middle">Stack (الأعلى هو الظاهر)</text>
  <text class="d-label-muted" x="565" y="215" text-anchor="middle">push يضيف · back يُزيل</text>
</svg>
:::

## التنقّل بين الشاشات

لكل ما ينقر عليه المستخدم، استخدم `Link`. يرسم نصًّا افتراضيًا؛ ومع `asChild` يسلّم التنقّل إلى الـ component القابل للضغط الخاص بك:

```tsx title=src/app/index.tsx
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function HikeLog() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Link href="/about">About Trailhead</Link>
      <Link href="/settings" asChild>
        <Pressable accessibilityRole="button">
          <Text>Settings</Text>
        </Pressable>
      </Link>
    </View>
  );
}
```

ومن الكود، بعد حفظ أو تسجيل دخول، استخدم الكائن `router`:

```tsx
import { router } from 'expo-router';

router.push('/settings/units'); // add a screen on top
router.back();                  // pop the top screen
router.replace('/');            // swap the current screen; no way back to it
```

`push` هو الانتقال الأمامي المعتاد. و`replace` للمسارات التي لا معنى للعودة فيها: بعد الشاشات التعريفية، وبعد تسجيل الدخول، وبعد تأكيد «تم الحفظ!». أما `back` فهو ما يفعله سهم الرجوع في الترويسة وإيماءة السحب أصلًا؛ استدعه بنفسك بعد حفظ نموذج ليعود المستخدم إلى حيث جاء. وهناك أيضًا `router.navigate`، الذي يذهب إلى مسار، وإن كان ذلك المسار موجودًا في الـ stack أصلًا، يعود إليه بدلًا من إضافة نسخة مكرّرة.

:::mistake الإضافة في حلقة مفرغة
زرّ "Done" يستدعي `router.push('/')` بعد تعديل رحلة يكدّس نسخة ثانية من السجلّ فوق الأولى. افعل ذلك بضع مرات، وستمشي إيماءة الرجوع عبر خمس قوائم متطابقة. بعد إنهاء مهمّة، ارجع **back** (أو استخدم `replace`)، ولا تتقدّم بـ push إلى حيث جئت.
:::

## الـ stack ليس سجلّ المتصفّح

من المغري أن تعامل الـ stack كسجلّ المتصفّح، لكن هناك فرقًا واحدًا مهمًّا: **كل شاشة في الـ stack تبقى مركّبة**. حين تضيف شاشة تفاصيل الرحلة، يحتفظ السجلّ تحتها بالـ state وموضع التمرير، وتستمر الـ effects الخاصة به في العمل. ولهذا يكون الرجوع فوريًا، ولهذا أيضًا لا يُعاد تشغيل `useEffect` في الشاشة حين تعود إليها. وحين تحتاج إلى تحديث البيانات في كل مرة تعود فيها الشاشة إلى الواجهة، يوفّر Expo Router الـ hook `useFocusEffect`، الذي يعمل حين تحصل الشاشة على التركيز (focus) وينظّف حين تفقده.

## شاشة «غير موجود» ولماذا ما زالت الـ URLs مهمّة

يُرسم `+not-found.tsx` لأي URL لا يطابق مسارًا، وهذا يحدث على الجوّال غالبًا عبر deep links من رسائل بريد قديمة أو من شاشة غُيّر اسمها. أعطه رسالة ودودة و`Link` يعود إلى الرئيسية.

والتفكير بالـ URLs يؤتي ثماره لاحقًا في هذا القسم: يستطيع إشعار أن يفتح `/hikes/42` مباشرة، ويستطيع رابط في رسالة أن يفتح التطبيق على الشاشة الصحيحة، وتعمل المسارات نفسها على الويب إن بنيت Trailhead له يومًا.

في الدرس التالي ستضيف tabs في أسفل التطبيق، وشاشة تفاصيل لكل رحلة، وتمرّر معرّف الرحلة عبر الـ URL.
