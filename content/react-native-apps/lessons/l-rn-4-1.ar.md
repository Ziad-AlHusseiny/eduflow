---
summary: حمّل كتالوج الدروب في Trailhead من خادم باستخدام fetch، وصمّم حالات التحميل والخطأ والفراغ والنجاح صراحةً، وألغِ الطلبات القديمة، وتعامل مع الشبكات المتقلّبة التي تعيش عليها الهواتف.
takeaways:
  - مثّل الطلب بقيمة حالة واحدة (loading أو error أو success) بدلًا من عدّة قيم منطقية قد يناقض بعضها بعضًا.
  - "`fetch` لا يرفض (reject) إلا عند فشل الشبكة؛ تحقّق من `response.ok` بنفسك لاستجابات 404 و500."
  - ألغِ الطلبات الجارية في دالة التنظيف الخاصة بالـ effect، لأن المستخدمين يغادرون الشاشات قبل أن تنتهي الطلبات البطيئة.
  - كل قائمة تحمّل بيانات تحتاج إلى أربع حالات مصمّمة، منها حالة فراغ وحالة خطأ مع زرّ لإعادة المحاولة.
  - على الهاتف، `localhost` هو الهاتف نفسه؛ وجّه الـ development builds إلى عنوان حاسوبك على الشبكة أو إلى API منشور.
further:
  - title: Networking
    url: https://reactnative.dev/docs/network
  - title: Using fetch
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  - title: RefreshControl
    url: https://reactnative.dev/docs/refreshcontrol
quiz:
  - q: "يُرجع الـ API الخاص بـ Trailhead الاستجابة `404 Not Found` لدرب محذوف. ماذا يفعل `await fetch(url)`؟"
    options:
      - text: يرمي خطأ، فتتعامل معه كتلة `catch`.
        why: لا يرفض fetch إلا حين لا تصل أي استجابة على الإطلاق (عدم اتصال، فشل DNS، إلغاء). والـ 404 استجابة.
      - text: يُحَلّ (resolve) باستجابة قيمة `ok` فيها `false` و`status` تساوي 404، ويجب أن تتحقّق منها.
        why: صحيح. تحقّق بـ `if (!res.ok)` وارمِ خطأ أو تعامل معه بنفسك.
      - text: يُحَلّ بالقيمة `undefined`.
        why: يُحَلّ fetch دائمًا بكائن Response حين يجيب الخادم، أيًّا كان رمز الحالة.
    answer: 1
  - q: يفتح مستخدم شاشة تفاصيل درب ثم يعود فورًا. ينتهي الطلب بعد ثانيتين ويستدعي `setState`. ما الذي كان يجب أن يفعله الـ effect؟
    options:
      - text: لا شيء؛ يتجاهل React Native تحديثات الـ state من الشاشات المُزالة، فالأمر غير ضار.
        why: يُسقَط التحديث، لكن الطلب استهلك بيانات وبطارية، ويمكن لاستجابة سابقة بطيئة أن تكتب فوق استجابة أحدث حين يتغيّر المعرّف.
      - text: غلّف الاستدعاء بـ `setTimeout` ليعمل بعد التنقّل.
        why: تأخير الطلب لا يمنعه من الانتهاء بعد أن تختفي الشاشة.
      - text: أنشأ `AbortController` واستدعى `controller.abort()` في دالة التنظيف.
        why: صحيح. الإلغاء يوقف الطلب عند إزالة الشاشة أو حين يتغيّر المعرّف، فلا تصل الاستجابات القديمة أبدًا.
    answer: 2
  - q: أيّ شكل للـ state يناسب شاشة الكتالوج في Trailhead أكثر؟
    options:
      - text: "`{ status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; trails: Trail[] }`"
        why: صحيح. لا توجد إلا التركيبات الصالحة، وتجبرك TypeScript على التعامل مع كلٍّ منها.
      - text: "`isLoading` و`hasError` و`trails` في ثلاثة استدعاءات `useState` منفصلة."
        why: لا شيء يمنع أن تكون `isLoading` و`hasError` صحيحتين معًا، أو أن تظهر دروب قديمة بجوار خطأ.
      - text: "`trails: Trail[] | null`، حيث `null` تعني التحميل أو الخطأ."
        why: يبدو التحميل والخطأ متماثلين، فلا تستطيع الشاشة عرض الرسالة الصحيحة.
      - text: مصفوفة `trails` واحدة تبدأ فارغة.
        why: المصفوفة الفارغة لا تميّز بين «ما زال يُحمّل» و«لا دروب قريبة»، وهما شاشتان مختلفتان جدًا.
    answer: 0
---

حتى الآن، عاشت بيانات Trailhead على الهاتف. أما الميزة التالية، كتالوج الدروب القريبة منك، فتأتي من خادم. على حاسوب محمول متصل بشبكة Wi-Fi المكتب، الطلب مجرّد إجراء شكلي. أما على هاتف عند بداية درب وفيه خطّ إشارة واحد، فهو أبطأ ما يفعله تطبيقك وأقلّه موثوقية: تستغرق الطلبات ثواني، أو تفشل في منتصفها، أو لا تعود أبدًا. والتصميم لهذا الواقع هو معظم العمل.

## أربع حالات، وقيمة واحدة

كل شاشة تحمّل بيانات لها أربع حالات على الأقل يمكن أن يراها المستخدم: **التحميل** (loading)، و**الخطأ** (error)، و**الفراغ** (empty: اكتمل التحميل ولا يوجد شيء)، و**النجاح** (success). مثّلها بقيمة واحدة، فلا يمكن أن تحدث تركيبات مستحيلة:

```ts title=src/lib/types.ts
export type Trail = { id: string; name: string; lengthKm: number; difficulty: 'easy' | 'moderate' | 'hard' };

export type Load<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };
```

الفراغ ليس حالة منفصلة؛ إنه نجاح بصفر عناصر، والشاشة تقرّر كيف تعرضه.

:::figure الطلب ينتقل بين حالات صريحة
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">تبدأ الشاشة في حالة loading. الاستجابة الناجحة تنقلها إلى success، التي تعرض القائمة أو حالة الفراغ. والفشل ينقلها إلى error، وزرّ إعادة المحاولة يعيدها إلى loading. والسحب للتحديث ينقلها من success إلى loading من جديد.</title>
  <rect class="d-box-accent" x="250" y="20" width="160" height="54" rx="12"/>
  <text class="d-label-strong" x="330" y="53" text-anchor="middle">loading</text>
  <rect class="d-box-success" x="440" y="150" width="190" height="60" rx="12"/>
  <text class="d-label-strong" x="535" y="176" text-anchor="middle">success</text>
  <text class="d-label-muted" x="535" y="198" text-anchor="middle">القائمة أو حالة الفراغ</text>
  <rect class="d-box-warn" x="30" y="150" width="190" height="60" rx="12"/>
  <text class="d-label-strong" x="125" y="176" text-anchor="middle">error</text>
  <text class="d-label-muted" x="125" y="198" text-anchor="middle">رسالة + إعادة المحاولة</text>
  <path class="d-arrow" d="M380 74 L500 150" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="480" y="104" text-anchor="middle">استجابة ok</text>
  <path class="d-arrow" d="M280 74 L160 150" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="180" y="104" text-anchor="middle">فشل</text>
  <path class="d-arrow d-dashed" d="M220 168 C300 140 280 110 300 76" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="300" y="150" text-anchor="middle">إعادة</text>
  <path class="d-arrow d-dashed" d="M440 168 C380 140 380 110 362 76" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="400" y="150" text-anchor="middle">تحديث</text>
</svg>
:::

## الجلب مع التنظيف

```tsx title=src/app/(tabs)/explore.tsx
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import type { Load, Trail } from '../../lib/types';

const API = process.env.EXPO_PUBLIC_API_URL;

async function getTrails(signal: AbortSignal): Promise<Trail[]> {
  const res = await fetch(`${API}/trails?near=current`, { signal });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();
}

export default function Explore() {
  const [state, setState] = useState<Load<Trail[]>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    getTrails(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: 'Could not load trails. Check your connection and try again.' });
      });
    return () => controller.abort();
  }, [attempt]);

  if (state.status === 'loading') return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (state.status === 'error') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 }}>
        <Text style={{ textAlign: 'center' }}>{state.message}</Text>
        <Pressable onPress={retry} accessibilityRole="button"><Text>Try again</Text></Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={state.data}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => <Text style={{ padding: 16 }}>{item.name} · {item.lengthKm} km</Text>}
      ListEmptyComponent={<Text style={{ padding: 24 }}>No trails within 50 km. Try a wider search.</Text>}
    />
  );
}
```

ثلاثة تفاصيل تحمل الثقل. يُفحص `res.ok` يدويًا، لأن `fetch` يعامل الـ 500 على أنه توصيل ناجح لأخبار سيئة. ويلغي الـ `AbortController` الطلب في دالة التنظيف، فمغادرة الشاشة (أو إعادة المحاولة) لا تسمح أبدًا لاستجابة قديمة بالكتابة فوق استجابة حديثة. ورسالة الخطأ تخبر المستخدم بما يفعل، بدلًا من طباعة `TypeError: Network request failed`.

يأتي `EXPO_PUBLIC_API_URL` من ملف `.env`. المتغيّرات التي تبدأ بـ `EXPO_PUBLIC_` تُدرج مباشرة في حزمة JavaScript، وهذا يعني أيضًا أنها **قابلة للقراءة من أي أحد** يفكّ حزمة تطبيقك. ضع فيها العناوين، ولا تضع المفاتيح السرّية أبدًا.

:::mistake استدعاء localhost من الهاتف
يعمل `fetch('http://localhost:3000/trails')` في متصفّح الويب على حاسوبك، ويفشل على الهاتف، لأن `localhost` هناك هو الهاتف نفسه. استخدم عنوان حاسوبك على الشبكة (`http://192.168.1.20:3000`) أثناء التطوير؛ أما محاكي Android فيصل إلى الجهاز المضيف عبر `10.0.2.2`. والمنصّتان تقيّدان كذلك `http://` العادي في builds الإصدار، لذا يجب أن تكون الـ APIs في بيئة الإنتاج على `https://`.
:::

## السحب للتحديث والشبكات البطيئة

يتوقّع المستخدمون أن يسحبوا القائمة إلى الأسفل لإعادة تحميلها. يدعم FlatList ذلك بخاصّيتين:

```tsx
<FlatList
  // …
  refreshing={refreshing}
  onRefresh={async () => {
    setRefreshing(true);
    try { setState({ status: 'success', data: await getTrails(new AbortController().signal) }); }
    catch { /* keep the old list and show a short "Couldn't refresh" message */ }
    finally { setRefreshing(false); }
  }}
/>
```

يُبقي التحديث القائمة القديمة ظاهرة أثناء التحميل، وهذا ألطف من مؤشّر التحميل بملء الشاشة في التحميل الأول. وإن فشل التحديث، فاحتفظ بالبيانات القديمة واعرض رسالة قصيرة، بدلًا من استبدال قائمة سليمة تمامًا بشاشة خطأ.

والشبكات المتقلّبة حجّة أيضًا لصالح **إعادة المحاولة التلقائية** مع تأخير يتزايد بين المحاولات (ثانية، ثم ثانيتان، ثم أربع)، فيتعافى التطبيق وحده من انقطاع قصير في الإشارة. لا تُعِد المحاولة إلا لما يمكن أن ينجح لاحقًا: انتهاء المهلة أو 503 قد ينجحان، أما 404 أو 401 فلن ينجحا، لذا فالفشل السريع ألطف. ستكتب هذه الدالة المساعدة في التمرين.

## غياب الاتصال حالة طبيعية، لا خطأ

في تطبيق للمشي الجبلي، غياب الإشارة هو الوضع المتوقّع لساعات متواصلة. تعامل معه على هذا الأساس. اعرض آخر قائمة حمّلتها، مع شريط هادئ يذكر وقت آخر تحديث، بدلًا من شاشة خطأ. ودع المستخدمين يواصلون تسجيل الرحلات، واحفظها على الجهاز، وأرسلها حين يعود الاتصال. تخبرك حزمة المجتمع `@react-native-community/netinfo` هل الجهاز متصل، وتُعلمك حين يتغيّر ذلك، وتلك هي اللحظة لإعادة محاولة الأعمال المؤجّلة.

لا شيء من ذلك يحتاج إلى أن يكون ذكيًا من اليوم الأول. المهم هو القرار: لكل شاشة، ماذا يرى المستخدم دون شبكة؟ اكتب الإجابة قبل أن تكتب الـ fetch، وصمّم حالات الفراغ والخطأ وغياب الاتصال بالعناية نفسها التي تصمّم بها المسار السعيد.

## متى تستخدم مكتبة للبيانات

الكود أعلاه جيد لشاشة واحدة. أما في تطبيق حقيقي فستكرّره في كل مكان، وسيبقى ينقصك التخزين المؤقت (عُد إلى شاشة فترى البيانات فورًا)، ومنع تكرار الطلبات، وإعادة الجلب في الخلفية، وإعادة المحاولة. تتولّى **TanStack Query** كل ذلك عبر `useQuery`، وتتضمّن وثائقها الإعداد الصغير الخاص بـ React Native الذي يعيد الجلب حين يعود التطبيق إلى الواجهة. تعلّم النسخة اليدوية أولًا لتعرف ما تفعله المكتبة، ثم استخدم المكتبة في بيئة الإنتاج.

التالي: بيانات يجب أن تصمد دون أي شبكة على الإطلاق، مخزّنة على الجهاز.
