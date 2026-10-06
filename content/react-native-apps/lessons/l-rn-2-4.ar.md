---
summary: اعرض سجلّ الرحلات المتنامي في Trailhead باستخدام FlatList وSectionList، وافهم الـ virtualization، وطبّق التحسينات القليلة التي تُبقي القوائم الطويلة سلسة على الهواتف متوسطة الفئة.
takeaways:
  - "`ScrollView` مع `.map()` يركّب (mount) كل الصفوف دفعة واحدة؛ أما `FlatList` فيركّب فقط نافذة من الصفوف حول الجزء المرئي."
  - "أعطِ `FlatList` دالة `keyExtractor` تُرجع معرّفًا ثابتًا من بياناتك، لا فهرس المصفوفة أبدًا."
  - الصفوف في القائمة الافتراضية (virtualized) تُزال حين تبتعد بالتمرير، لذا احفظ state الصف في بياناتك، لا داخل component الصف.
  - طبّق memo على component الصف، وأبقِ `renderItem` ثابتة، وأضف `getItemLayout` حين يكون لكل الصفوف الارتفاع نفسه.
  - "يأخذ `SectionList` الخاصية `sections` بشكل `{ title, data }` ويعرض قوائم مجمّعة بترويسات لاصقة."
further:
  - title: FlatList
    url: https://reactnative.dev/docs/flatlist
  - title: SectionList
    url: https://reactnative.dev/docs/sectionlist
  - title: Optimizing FlatList Configuration
    url: https://reactnative.dev/docs/optimizing-flatlist-configuration
quiz:
  - q: في سجلّ Trailhead ستمئة رحلة تُعرض باستخدام `ScrollView` و`.map()`. تستغرق الشاشة ثلاث ثوانٍ لتظهر على هاتف Android قديم. لماذا؟
    options:
      - text: يُنزّل ScrollView كل الصور المصغّرة قبل أن يعرض أي شيء.
        why: الصور تُحمَّل بشكل غير متزامن في الحالتين. الكلفة في إنشاء 600 صف من الـ native views مقدّمًا.
      - text: ScrollView مُهمَل ويعمل في وضع توافق.
        why: ScrollView ليس مُهمَلًا؛ إنه الخيار الصحيح لشاشة محتوى. لكنه الخيار الخاطئ لقائمة بيانات طويلة.
      - text: يرسم ScrollView كل الصفوف الـ 600، بكل الـ native views الخاصة بها، قبل أول إطار.
        why: صحيح. كان FlatList سيرسم ما يملأ الشاشة الأولى أو نحو ذلك، ثم يملأ المزيد كلما مرّرت.
    answer: 2
  - q: لكل صفّ رحلة `useState` محلية للحالة «موسَّع». يوسّع المستخدمون صفًّا، ثم يمرّرون بعيدًا إلى الأسفل، ثم يعودون، فيجدونه مطويًّا من جديد. لماذا؟
    options:
      - text: أزال FlatList الصف حين خرج من نافذة الرسم، وذهبت الـ state المحلية معه.
        why: صحيح. الـ virtualization يزيل الصفوف البعيدة. احفظ `expandedId` في الأب أو في بياناتك ومرّرها إلى الأسفل.
      - text: تُرجع keyExtractor مفاتيح مكرّرة، فأعادت React استخدام الصف الخطأ.
        why: المفاتيح المكرّرة تجعل صفوفًا خاطئة تتحدّث، لا تعيد ضبط الـ state عند التمرير. وستحذّرك React أيضًا.
      - text: يعيد FlatList ترتيب البيانات كلما مرّرت.
        why: لا يغيّر FlatList ترتيب بياناتك أبدًا. هو يقرّر فقط أي الصفوف يركّب.
    answer: 0
  - q: ارتفاع كل صفّ في Trailhead 72 نقطة بالضبط. أيّ prop يتيح لـ FlatList تخطّي قياس الصفوف والقفز مباشرة إلى الصف 400؟
    options:
      - text: "`initialNumToRender`"
        why: يتحكّم في عدد الصفوف التي تُرسم في الدفعة الأولى؛ ولا يخبر FlatList بأي شيء عن أحجامها.
      - text: "`getItemLayout`"
        why: صحيح. حين تكون `length` و`offset` معروفتين مسبقًا، لا يقيس FlatList الصفوف، وتعمل `scrollToIndex` حتى مع الصفوف التي لم تُرسم بعد.
      - text: "`removeClippedSubviews`"
        why: يفصل الـ views الواقعة خارج الشاشة عن شجرة العناصر الأصلية. قد يوفّر ذاكرة، لكنه لا يقول شيئًا عن أحجام الصفوف.
      - text: "`windowSize`"
        why: يتحكّم في عدد الشاشات من الصفوف التي تبقى مركّبة حول منطقة العرض، لا في طريقة قياسها.
    answer: 1
---

يبدأ سجلّ Trailhead بنحو اثنتي عشرة رحلة. المتنزّه المتحمّس يسجّل ثلاث رحلات أسبوعيًا؛ وبعد أربع سنوات يتجاوز السجلّ 600 صف، لكلٍّ منها صورة مصغّرة وعنوان وبعض الإحصاءات. اعرض ذلك باستخدام `ScrollView` و`.map()`، وسيبني التطبيق الـ native views لكل صف قبل أن يعرض أول إطار. على هاتف رائد قد لا تلاحظ. أما على هواتف Android متوسطة الفئة التي يستخدمها معظم العالم، فستحصل على شاشة فارغة وتقطّع.

## FlatList: ارسم ما هو مرئي

يأخذ `FlatList` بياناتك ودالة ترسم عنصرًا واحدًا، ولا يركّب إلا الصفوف القريبة من منطقة العرض:

```tsx title=src/app/index.tsx
import { FlatList, Text, View } from 'react-native';
import { HikeRow } from '../components/HikeRow';
import { useHikes } from '../state/hikes';

export default function HikeLog() {
  const hikes = useHikes();

  return (
    <FlatList
      data={hikes}
      keyExtractor={(hike) => hike.id}
      renderItem={({ item }) => <HikeRow hike={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#e2e8e4', marginLeft: 80 }} />}
      ListEmptyComponent={<Text style={{ padding: 24, textAlign: 'center' }}>No hikes yet. Log your first one!</Text>}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
```

مثل ScrollView، يحتاج FlatList إلى ارتفاع محدود، لذا يجب أن يعطيه أبوه `flex: 1` (والشاشة في Expo Router تفعل ذلك أصلًا). تستقبل `renderItem` الكائن `{ item, index }`. ويتيح لك `ListHeaderComponent` و`ListFooterComponent` أن تتمرّر بطاقة ملخّص أو مؤشّر «تحميل المزيد» مع القائمة، بدلًا من تغليف الـ FlatList داخل ScrollView، وهذا يُبطل الـ virtualization كليًا ويُطلق تحذيرًا.

## كيف يعمل الـ virtualization

يحتفظ FlatList بـ **نافذة رسم** (render window): الصفوف الظاهرة على الشاشة، زائد مخزون احتياطي فوقها وتحتها. وأثناء التمرير، تُركَّب الصفوف التي تدخل النافذة وتُزال التي تخرج منها، ويحلّ محلّها فراغ بالارتفاع الصحيح.

:::figure يُبقي FlatList نافذة واحدة فقط من الصفوف مركّبة
<svg viewBox="0 0 640 300" role="img" aria-labelledby="t1">
  <title id="t1">من بين 600 رحلة، لا يُركَّب إلا الصفوف الظاهرة على الشاشة ومخزون احتياطي فوقها وتحتها؛ أما الصفوف خارج النافذة فيحلّ محلّها فراغ بالارتفاع نفسه.</title>
  <rect class="d-box" x="40" y="20" width="220" height="260" rx="10"/>
  <text class="d-label-muted" x="150" y="44" text-anchor="middle">الصفوف 1–90: فراغ</text>
  <rect class="d-box-accent" x="56" y="64" width="188" height="40" rx="6"/>
  <text class="d-label" x="150" y="89" text-anchor="middle">احتياطي (مركَّب)</text>
  <rect class="d-box-primary" x="56" y="112" width="188" height="76" rx="6"/>
  <text class="d-label-strong" x="150" y="155" text-anchor="middle">الصفوف المرئية</text>
  <rect class="d-box-accent" x="56" y="196" width="188" height="40" rx="6"/>
  <text class="d-label" x="150" y="221" text-anchor="middle">احتياطي (مركَّب)</text>
  <text class="d-label-muted" x="150" y="264" text-anchor="middle">الصفوف 320–600: فراغ</text>
  <rect class="d-box-success" x="320" y="100" width="150" height="100" rx="18"/>
  <text class="d-label-strong" x="395" y="146" text-anchor="middle">شاشة الهاتف</text>
  <text class="d-label-muted" x="395" y="170" text-anchor="middle">منطقة العرض</text>
  <path class="d-arrow" d="M320 150 L252 150" marker-end="url(#arrow)"/>
  <text class="d-label" x="500" y="60" text-anchor="start">windowSize</text>
  <text class="d-label-muted" x="500" y="80" text-anchor="start">الافتراضي 21 شاشة</text>
  <text class="d-label" x="500" y="240" text-anchor="start">initialNumToRender</text>
  <text class="d-label-muted" x="500" y="260" text-anchor="start">الافتراضي 10 صفوف</text>
</svg>
:::

ينتج عن ذلك أمران. أولًا، **يجب أن تكون المفاتيح (keys) ثابتة**: يستخدمها FlatList وReact لمعرفة أي صفّ هو أي صفّ بينما تأتي الصفوف وتذهب، فاستخدم معرّفًا من بياناتك. فهارس المصفوفة تنكسر لحظة إدراج رحلة جديدة في الأعلى. ثانيًا، **الصفوف تنسى الـ state المحلية** حين تُزال. علامة «موسَّع» المحفوظة في `useState` داخل الصف تعود إلى قيمتها الأولى بعد تمرير طويل. ارفع هذه الـ state إلى الأب (`expandedId`) أو إلى بياناتك.

:::mistake استخدام الفهرس مفتاحًا للصفوف
دون `keyExtractor`، يستخدم FlatList القيمة `item.key`، ثم `item.id`، وأخيرًا فهرس المصفوفة. لنفترض أن الـ API الخاص بالمزامنة في Trailhead أرسل `uuid` بدلًا من `id`: سيصبح مفتاح كل صف موضعه بصمت، وتمرير `(item, index) => String(index)` بنفسك يفعل الشيء ذاته. أدرج رحلة جديدة في الأعلى، وسيحمل كل صف تحتها مفتاحًا مختلفًا: تُعاد تركيب الصفوف، وتومض الصور، وتقفز الـ state الخاصة بكل صف إلى الرحلة الخطأ. أرجع دائمًا المعرّف الحقيقي، أيًّا كان اسمه.
:::

## الحفاظ على السلاسة

معظم التقطّع في القوائم يأتي من إعادة الـ render لصفوف لم تتغيّر، أو من عمل ثقيل داخلها. بالترتيب بحسب العائد:

1. **طبّق memo على الصف.** صدّر `HikeRow` مغلّفًا بـ `memo`، فلا يُعاد الـ render للصف إلا حين يتغيّر الـ prop المسمّى `hike`. (إن كان مشروعك يفعّل React Compiler، فهو يتولّى الـ memoization نيابةً عنك.)
2. **أبقِ `renderItem` ثابتة.** الدالة السهمية المباشرة لا بأس بها مع صفّ مغلّف بـ memo، لكن لا تنشئ كائنات جديدة للـ props في كل render، مثل `style={{…}}` أو `hike={{ ...item }}`، فهي تُبطل `memo`.
3. **لا عمل ثقيل داخل الصفوف.** نسّق التواريخ واحسب الإحصاءات مرة واحدة، حين تتغيّر البيانات، لا في الـ render الخاص بكل صف.
4. **صور بالحجم المناسب.** صورة بعرض 4000 بكسل مصغّرة داخل صورة مصغّرة بعرض 56 نقطة تكلّف ذاكرة لكل صفّ مرئي. اطلب صورًا مصغّرة من الـ API، أو استخدم `expo-image` مع التخزين المؤقت.
5. **ارتفاعات ثابتة؟ استخدم `getItemLayout`.** إن كان كل صف 72 نقطة زائد فاصل بنقطة واحدة، يستطيع FlatList تخطّي القياس:

```tsx
const ROW = 73;

<FlatList
  // …
  getItemLayout={(_, index) => ({ length: ROW, offset: ROW * index, index })}
/>
```

وللسجلّات المحفوظة على خادم، لا تجلب الرحلات الـ 600 كلها دفعة واحدة. يُطلَق `onEndReached` حين يقترب المستخدم من الأسفل بالتمرير (ومدى الاقتراب يحدّده `onEndReachedThreshold`، ويُقاس بارتفاعات الشاشة)، وهذه هي اللحظة لطلب الصفحة التالية وإلحاقها بـ `data`. اعرض مؤشّر تحميل في `ListFooterComponent` أثناء التحميل، واحمِ الكود من إطلاق الطلب مرتين.

ضبط `windowSize` و`initialNumToRender` يأتي في النهاية، وبعد أن تقيس فقط. وللقوائم الضخمة جدًا أو المعقّدة، تنتقل فرق كثيرة إلى FlashList من Shopify، الذي يعيد تدوير views الصفوف بدلًا من تركيب صفوف جديدة، ويحافظ على واجهة برمجية شبيهة بـ FlatList.

## SectionList: بيانات مجمّعة

يجمّع Trailhead الرحلات بحسب الشهر، مع ترويسة لاصقة لكل شهر. يفعل `SectionList` ذلك انطلاقًا من بيانات بهذا الشكل:

```ts
const sections = [
  { title: 'October 2026', data: [ridgeLoop, lakeTrail] },
  { title: 'September 2026', data: [oldMill] },
];
```

```tsx
<SectionList
  sections={sections}
  keyExtractor={(hike) => hike.id}
  renderItem={({ item }) => <HikeRow hike={item} />}
  renderSectionHeader={({ section }) => <Text style={styles.header}>{section.title}</Text>}
  stickySectionHeadersEnabled
/>
```

الجزء المثير للاهتمام ليس الـ component؛ بل تحويل مصفوفة مسطّحة من الرحلات إلى شكل `sections` هذا، مرتّبة بشكل صحيح. وهذا هو تمرينك.

يبدأ القسم 3 بعد ذلك: مع وجود شاشات حقيقية للتنقّل بينها، يحتاج Trailhead إلى نظام تنقّل (navigation).
