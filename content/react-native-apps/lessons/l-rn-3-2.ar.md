---
summary: أضف إلى Trailhead أشرطة tabs سفلية باستخدام مجموعة مسارات، وشاشة لتفاصيل الرحلة عبر مسار ديناميكي [id]، واقرأ الـ params الخاصة بها بأمان، متذكّرًا أن الـ params تصل دائمًا نصوصًا.
takeaways:
  - المجلّد بين قوسين، مثل `(tabs)`، يجمّع المسارات تحت layout دون أن يضيف جزءًا إلى الـ URL.
  - ضع أداة تنقّل الـ tabs في `(tabs)/_layout.tsx`، وأضف شاشات التفاصيل من الـ Stack الجذري لتغطّي شريط الـ tabs.
  - "الملف المسمّى `[id].tsx` يطابق أي جزء مفرد من الـ URL؛ اقرأه باستخدام `useLocalSearchParams()`."
  - الـ params في المسارات نصوص (أو مصفوفات من النصوص)، فحوّلها وتحقّق منها قبل الاستخدام.
  - مرّر المعرّفات في الـ params، لا الكائنات كاملة أبدًا، وابحث عن البيانات في الشاشة الوجهة.
further:
  - title: Navigation layouts
    url: https://docs.expo.dev/router/basics/navigation-layouts/
  - title: Tabs
    url: https://docs.expo.dev/router/advanced/tabs/
  - title: URL parameters
    url: https://docs.expo.dev/router/reference/url-parameters/
quiz:
  - q: "ما الـ URL الذي يخدمه `src/app/(tabs)/stats.tsx`؟"
    options:
      - text: "`/(tabs)/stats`"
        why: الأقواس تحدّد مجموعة، والمجموعات لا تظهر في الـ URL أبدًا.
      - text: "`/tabs/stats`"
        why: يُحذف اسم المجموعة كله، لا الأقواس وحدها.
      - text: "`/stats`"
        why: صحيح. المجموعة `(tabs)` تحدّد فقط أي layout يغلّف الشاشة.
    answer: 2
  - q: |
      شاشة التفاصيل تفعل هذا، والرحلة ذات المعرّف 7 لا تُطابَق أبدًا. لماذا؟
      ```tsx
      const { id } = useLocalSearchParams<{ id: string }>();
      const hike = hikes.find((h) => h.id === id); // h.id is a number
      ```
    options:
      - text: "`useLocalSearchParams` يعمل فقط داخل شاشات الـ tabs."
        why: يعمل في أي مسار. المشكلة في المقارنة، لا في مكان تشغيل الـ hook.
      - text: "`id` هو النص \"7\"، و`7 === \"7\"` قيمتها false؛ حوّله باستخدام `Number(id)` وتحقّق من النتيجة."
        why: صحيح. الـ params في الـ URL نصوص دائمًا. الـ generic يحدّد نوعها فقط، ولا يحوّل أي شيء.
      - text: يجب أن يكون اسم ملف المسار `[hikeId].tsx` ليصل الـ param.
        why: اسم الملف يحدّد اسم الـ param فقط. و`[id].tsx` يعطيك `id`.
    answer: 1
  - q: يمرّر زميلك كائن رحلة كاملًا بوصفه param في المسار حتى لا تحتاج شاشة التفاصيل إلى البحث عنه. ما المشكلة الرئيسية؟
    options:
      - text: الـ params تُحوَّل إلى نصّ داخل الـ URL، فيصبح الكائن نصًّا، ولا تستطيع الـ deep links إعادة إنشائه، وتعرض الشاشة بيانات قديمة بعد التعديل.
        why: صحيح. مرّر المعرّف واقرأ الرحلة الحالية من الـ state أو التخزين في الشاشة الوجهة.
      - text: الـ params في المسارات محدودة بحرف واحد.
        why: لا يوجد حدّ كهذا. المشكلة أن الـ URLs تحمل نصوصًا، لا كائنات.
      - text: الكائنات في الـ params تجعل التطبيق ينهار على Android فقط.
        why: يسيء التصرّف بالطريقة نفسها على المنصّتين. لكنه لا ينهار.
      - text: يشفّر Expo Router الـ params، فسيكون الأمر بطيئًا.
        why: الـ params ليست مشفّرة؛ إنها جزء من URL. السرعة ليست المشكلة.
    answer: 0
---

صار في Trailhead الآن أكثر من مكان يمكن أن تكون فيه: سجلّ الرحلات، وصفحة الإحصاءات، والإعدادات، إضافةً إلى شاشة تفاصيل لكل رحلة. الثلاثة الأولى نظائر يتنقّل المستخدمون بينها طوال الوقت؛ أما شاشة التفاصيل فشيء تتعمّق فيه ثم تعود منه. هذا هو الشكل الكلاسيكي لتطبيقات الجوّال: **tabs** للنظائر، و**stack** للتعمّق.

## مجموعة مسارات للـ tabs

هذه بنية الملفات التي يستخدمها Trailhead:

```text
src/app/
  _layout.tsx          root Stack
  (tabs)/
    _layout.tsx        Tabs navigator
    index.tsx          /          (Log)
    stats.tsx          /stats
    settings.tsx       /settings
  hikes/
    [id].tsx           /hikes/42  (pushed over the tabs)
```

المجلّد بين قوسين **مجموعة مسارات** (route group). تتيح لشاشات الـ tabs الثلاث أن تتشارك layout دون أن تضيف شيئًا إلى عناوينها: `(tabs)/stats.tsx` هو `/stats`، لا `/tabs/stats`.

يُرجع layout الـ tabs أداة التنقّل `Tabs`، مع `Tabs.Screen` واحد لكل tab، بالترتيب الذي يجب أن تظهر به:

```tsx title=src/app/(tabs)/_layout.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2f6f4e' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Log',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

ثم يضع الـ root layout مجموعة الـ tabs كلها داخل الـ Stack، مع إخفاء ترويسة المجموعة نفسها (فلكل tab ترويسته)، ويليها مسار التفاصيل:

```tsx title=src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="hikes/[id]" options={{ title: 'Hike' }} />
    </Stack>
  );
}
```

ولأن `hikes/[id]` ينتمي إلى الـ Stack الجذري لا إلى الـ tabs، فإن فتح رحلة يُدخل شاشة كاملة منزلقة فوق شريط الـ tabs، وتعيدك إيماءة الرجوع إلى الـ tab الذي جئت منه. هذا ما تفعله معظم تطبيقات iOS وAndroid، ويعطي شاشة التفاصيل ارتفاع الهاتف كله.

عادتان تُبقيان الـ tabs مريحة. اجعلها بين ثلاث وخمس وجهات رئيسية يزورها المستخدمون كثيرًا؛ فالـ tab السادس يعني عادةً أن بعضها مكانه داخل الإعدادات. وتذكّر أن الـ tabs تبقى مركّبة بعد زيارتها: انتقل من Log إلى Stats ثم عُد، وسيحتفظ السجلّ بموضع تمريره. هذا هو السلوك الذي يتوقّعه المستخدمون، فلا تُعِد ضبطه. وإن احتاج tab واحد إلى شاشات تعمّق خاصة به تُبقي شريط الـ tabs ظاهرًا، فأعطِ ذلك الـ tab مجلّدًا بملف `_layout.tsx` خاص به يُرجع `Stack`؛ فتداخل أدوات التنقّل ليس إلا تداخلًا للمجلّدات.

:::note الـ tabs الأصلية
يرسم الـ component المسمّى `Tabs` شريطه باستخدام JavaScript، فيمكنك تنسيقه بحرّية. ويوفّر Expo Router أيضًا tabs أصلية (native tabs) تستخدم شريط الـ tabs الخاص بالنظام، بما في ذلك أحدث أنماطه البصرية، مع مجال أضيق للتنسيق المخصّص. تغيّر مسار الاستيراد بين إصدارات الـ SDK، فاتّبع وثائق Expo Router الخاصة بالـ SDK لديك إن اخترتها.
:::

## المسارات الديناميكية والـ params

الملف المسمّى بأقواس مربّعة، `[id].tsx`، يطابق أي جزء مفرد من الـ URL ويكشفه بوصفه param اسمه `id`. اقرأه باستخدام `useLocalSearchParams`:

```tsx title=src/app/hikes/[id].tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useHike } from '../../state/hikes';

export default function HikeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hike = useHike(id);

  if (!hike) {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        <Text>That hike doesn't exist anymore.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: hike.name }} />
      <Text style={{ fontSize: 16 }}>{hike.distanceKm} km</Text>
    </View>
  );
}
```

وللوصول إليها، اربط إلى الـ URL. إما أن تبني النص بنفسك، أو تدع Expo Router يملأ النمط:

```tsx
<Link href={`/hikes/${hike.id}`}>{hike.name}</Link>

<Link href={{ pathname: '/hikes/[id]', params: { id: hike.id } }}>{hike.name}</Link>
```

أي شيء في `params` ليس جزءًا من المسار يصبح query string: فـ `params: { id: hike.id, units: 'mi' }` ينتج `/hikes/42?units=mi`، وتقرأ شاشة التفاصيل `units` بالـ hook نفسه.

:::mistake الثقة بنوع الـ param
يبدو `useLocalSearchParams<{ id: string }>()` مضبوط النوع، لكن الـ generic وعد تقطعه لـ TypeScript، لا عملية تحويل. الـ params تأتي من URL، فهي **نصوص**، والمفتاح المكرّر في الـ query (`?tag=lake&tag=steep`) يصل **مصفوفةً** من النصوص. ويمكن أيضًا أن يحتوي deep link من بريد قديم على أي شيء: `/hikes/abc`، `/hikes/-1`. حوّل وتحقّق وتعامل مع حالة «غير موجود» في كل شاشة لها params.
:::

## المعرّفات في الـ params، والبيانات من الـ state

مرّر أصغر شيء يعرّف البيانات، وهو معرّف في العادة، وابحث عن البيانات في الشاشة الوجهة. يبدو تمرير كائن رحلة كامل مريحًا، لكن الـ params تُحوَّل إلى نصّ داخل الـ URL: يصبح الكائن نصًّا، ولا يستطيع deep link إعادة إنشائه أبدًا، وإن عدّل المستخدم الرحلة، تعرض شاشة التفاصيل النسخة القديمة التي سُلّمت لها. الدرس التالي يبني الـ state المشتركة التي يقرأ منها `useHike(id)`.

يُرجع `useLocalSearchParams` الـ params الخاصة بالشاشة التي يُستدعى فيها، وهذا ما تريده في الغالبية العظمى من الحالات. أما شقيقه `useGlobalSearchParams` فيتحدّث كلما تغيّر أي مسار، حتى المسارات في الخلفية، وهذا يسبّب عمليات render إضافية؛ احتفظ به لأشياء مثل التحليلات (analytics) التي تهتم فعلًا بكل عملية تنقّل.

التالي: الـ state التي تقف وراء عمليات البحث هذه، أي مصدر واحد للحقيقة عن الرحلات، تتشاركه كل الـ tabs والشاشات.
