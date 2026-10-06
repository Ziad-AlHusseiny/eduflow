---
summary: اعرض نموذج إضافة رحلة في Trailhead بوصفه modal، وأبقِ المستخدمين غير المسجّلين على شاشة تسجيل الدخول باستخدام Stack.Protected، وافتح رحلات محدّدة من الـ deep links، مع فهم كيف تُطابَق الـ URLs مع ملفات المسارات.
takeaways:
  - "شاشة Stack مع `presentation: 'modal'` تنزلق إلى الأعلى كورقة على iOS؛ وأغلقها باستخدام `router.back()` بعد الحفظ."
  - "يُخفي `Stack.Protected` مع `guard` المسارات حين يكون الشرط false، فلا يستطيع المستخدمون غير المسجّلين الوصول إليها، حتى من deep link."
  - "الـ `scheme` في app.json يجعل `trailhead://hikes/42` يفتح المسار `/hikes/[id]`؛ والمخطّطات المخصّصة تحتاج إلى development build، لا إلى Expo Go."
  - عند مطابقة URL، لا تضيف المجموعات ولا `index` أي جزء، والأجزاء الثابتة تتغلّب على الديناميكية، و`[...rest]` يلتقط كل ما تبقّى.
further:
  - title: Modals
    url: https://docs.expo.dev/router/advanced/modals/
  - title: Protected routes
    url: https://docs.expo.dev/router/advanced/protected/
  - title: Linking into your app
    url: https://docs.expo.dev/linking/into-your-app/
quiz:
  - q: "في Trailhead الملفان `src/app/hikes/new.tsx` و`src/app/hikes/[id].tsx` معًا. أيّهما يُرسم للعنوان `/hikes/new`؟"
    options:
      - text: "`[id].tsx`، مع `id` بقيمة \"new\"، لأن المسارات الديناميكية تطابق أي شيء."
        why: المسارات الديناميكية تطابق فعلًا أي جزء، لكن الجزء الثابت الذي يطابق تمامًا هو المفضّل.
      - text: الملف الذي أُنشئ أولًا.
        why: المطابقة لا تعتمد على عمر الملف. إنها ترتّب المسارات بحسب درجة تحديدها.
      - text: لا هذا ولا ذاك؛ يُبلغ Expo Router عن تعارض عند بدء التشغيل.
        why: الإخوة الثابتون والديناميكيون إعداد طبيعي ومدعوم.
      - text: "`new.tsx`، لأن الجزء الثابت يتغلّب على الجزء الديناميكي."
        why: صحيح. يطابق `/hikes/new` المسار الثابت؛ أما `/hikes/42` فيذهب إلى `[id].tsx`.
    answer: 3
  - q: "ينقر مستخدمون غير مسجّلين على رابط في بريد قديم إلى `trailhead://hikes/42`. يقع مسار الرحلة داخل `<Stack.Protected guard={isSignedIn}>`. ماذا يحدث؟"
    options:
      - text: تنفتح شاشة الرحلة، ثم تعرض خطأ فورًا.
        why: المسارات المحميّة لا تُرسم أصلًا ما دام الـ guard قيمته false، فلا تُركَّب شاشة الرحلة أبدًا.
      - text: يصل المستخدم إلى أول شاشة متاحة (شاشة تسجيل الدخول في Trailhead) بدلًا من المسار المحمي.
        why: صحيح. ما دام الـ guard قيمته false يكون المسار غير متاح، ويُعاد توجيه التنقّل إليه.
      - text: ينهار التطبيق لأن المسار غير موجود.
        why: المسارات المحميّة مخفيّة، لا محذوفة؛ ويتعامل Expo Router مع المحاولة بلطف.
    answer: 1
  - q: أضفت `scheme` بقيمة trailhead إلى app.json وجرّبت `trailhead://hikes/42` في Expo Go. لا شيء ينفتح. لماذا؟
    options:
      - text: المخطّطات المخصّصة تُسجَّل في الإعدادات الأصلية للتطبيق، فتعمل في development build أو build إنتاجي من Trailhead، لا داخل Expo Go.
        why: صحيح. Expo Go تطبيق مختلف له مخطّطه الخاص؛ ابنِ Trailhead نفسه لتختبر روابطه.
      - text: يجب أن تبدأ المخطّطات بـ `https`.
        why: الـ universal links والـ App Links تستخدم https، لكن المخطّطات المخصّصة مثل `trailhead://` صالحة أيضًا.
      - text: الـ deep links لا تعمل إلا حين يكون التطبيق مفتوحًا أصلًا.
        why: يستطيع الـ deep link تشغيل التطبيق من الصفر وفتح المسار المطابق مباشرة.
    answer: 0
---

ثلاثة مواقف لا تناسب نمط «أضف شاشة» الذي استخدمته حتى الآن. تسجيل رحلة مهمّة قصيرة يبدؤها المستخدم وينهيها، فيجب أن تبدو منفصلة عن التصفّح. وبعض الشاشات يجب ألا توجد إلا للمستخدمين المسجّلين. ويجب أن ينفتح Trailhead على الرحلة الصحيحة حين ينقر أحدهم على رابط في تذكير أو رسالة. يتعامل Expo Router مع الثلاثة في ملف الـ layout.

## نموذج إضافة رحلة بوصفه modal

الـ modal شاشة تُعرض فوق السياق الحالي، وتنزلق عادةً من الأسفل. على iOS تظهر بطاقةً تبقى الشاشة السابقة مرئية خلفها، ويستطيع المستخدمون سحبها إلى الأسفل للإلغاء. اجعل النموذج modal بضبط طريقة عرضه في الـ Stack الجذري:

```tsx title=src/app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="hikes/[id]" options={{ title: 'Hike' }} />
  <Stack.Screen name="new-hike" options={{ presentation: 'modal', title: 'Log a hike' }} />
</Stack>
```

يبقى فتحه بـ `router.push('/new-hike')` (أو `Link`)؛ وإغلاقه بعد الحفظ بـ `router.back()`، الذي يُزيل الـ modal كأي شاشة. لا يملك Android ورقة على شكل بطاقة افتراضيًا، فيظهر الـ modal صفحةً بملء الشاشة بحركة مختلفة؛ لذا أعطِ النموذج زرّ Cancel ظاهرًا في `headerLeft` ليكون للمنصّتين مخرج واضح.

حين يحوي النموذج مدخلات غير محفوظة، فإن سحبه بعيدًا يُضيّع ما كتبه المستخدم. في النماذج الطويلة، اطلب التأكيد قبل التجاهل باستخدام `Alert` عند Cancel؛ أما في نموذج قصير مثل نموذج Trailhead، فمسوّدة تُعاد كتابتها بسرعة مقايضة مقبولة.

## المسارات المحميّة

يزامن Trailhead الرحلات مع حساب، لذا تتطلّب معظم الشاشات تسجيل الدخول. يغلّف `Stack.Protected` المسارات بشرط:

```tsx title=src/app/_layout.tsx
import { Stack } from 'expo-router';
import { useSession } from '../state/session';

export default function RootLayout() {
  const { isSignedIn, isLoading } = useSession();
  if (isLoading) return null; // the splash screen is still showing

  return (
    <Stack>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="hikes/[id]" options={{ title: 'Hike' }} />
        <Stack.Screen name="new-hike" options={{ presentation: 'modal', title: 'Log a hike' }} />
      </Stack.Protected>
    </Stack>
  );
}
```

حين يكون `guard` قيمته false، تصبح تلك المسارات غير متاحة: التنقّل إليها، بما في ذلك من deep link، يرسل المستخدم إلى أول شاشة متاحة بدلًا منها، وتُحذف أي مدخلات لها في السجلّ. تسجيل الدخول يقلب قيمة `isSignedIn`، فيُعاد الـ render للـ layout، وتظهر الشاشات المحميّة دون أن تستدعي `router` على الإطلاق. وتسجيل الخروج يفعل العكس، فيمسح أيضًا الـ back stack، فلا تستطيع إيماءة الرجوع كشف شاشة خاصة بالمستخدم المسجّل.

`useSession` هو context مثل الذي بنيته قبل درسين. تغطّي `isLoading` اللحظة عند بدء التشغيل التي يكون فيها Trailhead ما زال يقرأ الـ token المحفوظ من التخزين الآمن (القسم 4)؛ ورسم لا شيء بينما شاشة البداية ظاهرة يتجنّب وميض صفحة تسجيل الدخول للمستخدمين المسجّلين أصلًا.

:::mistake الحماية داخل كل شاشة
التحقّق بـ `if (!user) return <Redirect href="/sign-in" />` في أعلى كل شاشة ينجح حتى يضيف أحدهم شاشة وينسى التحقّق. أما الـ guard في الـ layout فيحمي كل مسار مدرج داخله، بما في ذلك المسارات التي ستُضاف العام القادم. احتفظ بإعادة التوجيه داخل الشاشة للحالات الخاصة.
:::

## الـ deep links

الـ **deep link** (الرابط العميق) يفتح التطبيق على شاشة محدّدة. أعطِ Trailhead مخطّط URL (scheme) في `app.json`:

```json title=app.json
{
  "expo": {
    "name": "Trailhead",
    "scheme": "trailhead"
  }
}
```

الآن يفتح `trailhead://hikes/42` التطبيق ويرسم `/hikes/42` بالـ Stack نفسه الذي بنيته، بما في ذلك زرّ رجوع إلى السجلّ. تحصل على هذا مجانًا من التوجيه المبني على الملفات: كل مسار له URL أصلًا. المخطّطات جزء من الإعدادات الأصلية للتطبيق، لذا اختبرها في development build؛ فلـ Expo Go مخطّطه الخاص. ومن الطرفية:

```bash
npx uri-scheme open trailhead://hikes/42 --ios
npx uri-scheme open trailhead://hikes/42 --android
```

للمخطّطات المخصّصة نقطة ضعف: أي تطبيق يستطيع ادّعاء `trailhead://`. وللروابط التي تشاركها على الويب، استخدم الـ **universal links** (على iOS) والـ **App Links** (على Android)، التي تستخدم نطاق `https://` الخاص بك وتتطلّب استضافة ملف تحقّق صغير عليه. يشرح دليل الروابط في Expo الاثنين خطوة بخطوة.

:::tip الـ deep links مدخلات غير موثوقة
يمكن أن يأتي الـ deep link من أي مكان، بأي معرّف. والدالة `parseHikeParams` من وقت سابق في هذا القسم هي بالضبط ما تحتاج إليه هذه الشاشات: تحقّق، ثم اعرض «الرحلة غير موجودة» لأي شيء غير موجود.
:::

## كيف يختار الـ URL مساره

حين يصل رابط، يقارن Expo Router مساره بكل ملف مسار. ومعرفة القواعد تُزيل التخمين:

| القاعدة | مثال |
|---|---|
| المجموعات مثل `(tabs)` لا تضيف جزءًا | `(tabs)/stats.tsx` يطابق `/stats` |
| `index` لا يضيف جزءًا | `settings/index.tsx` يطابق `/settings` |
| `[name]` يطابق جزءًا واحدًا بالضبط | `hikes/[id].tsx` يطابق `/hikes/42` |
| `[...name]` يطابق جزءًا متبقّيًا أو أكثر، بوصفها مصفوفة | `trails/[...path].tsx` يطابق `/trails/alps/mont-blanc` |
| الثابت يتغلّب على الديناميكي، والديناميكي على الشامل | `/hikes/new` يختار `hikes/new.tsx` بدلًا من `hikes/[id].tsx` |
| الـ query string تصبح params إضافية | `/hikes/42?units=mi` يضيف `units` |

هذا الترتيب هو سبب قدرتك على إضافة `hikes/new.tsx` بجوار `hikes/[id].tsx` بأمان. وفي التمرين ستكتب أداة المطابقة هذه بنفسك، وهي أسرع طريقة لكي لا تفاجئك مرة أخرى أبدًا.

بهذا يكتمل التنقّل. أما القسم 4 فيصل Trailhead بالعالم الخارجي: خادم، وتخزين الجهاز، ومستشعراته.
