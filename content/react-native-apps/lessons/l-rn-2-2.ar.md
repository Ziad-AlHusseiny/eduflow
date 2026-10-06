---
summary: رتّب صفوف القوائم والشاشات في Trailhead باستخدام flexbox، مع معرفة القيم الافتراضية على الجوّال (الاتجاه العمودي، وعدم الانكماش، والتمدّد) التي تفسّر معظم التخطيطات المنضغطة أو الفائضة.
takeaways:
  - "كل View حاوية flex، والمحور الرئيسي يمتد من الأعلى إلى الأسفل افتراضيًا (`flexDirection: 'column'`)."
  - "`justifyContent` يحدّد مواضع الأبناء على المحور الرئيسي؛ و`alignItems` يحدّدها على المحور العرضي، وقيمته الافتراضية `stretch`."
  - "الأبناء لا ينكمشون افتراضيًا في React Native، لذا يدفع العنوان الطويل إخوته خارج الشاشة حتى تعطيه `flex: 1`."
  - "`flex: 1` تعني «خذ المساحة المتبقية»؛ والـ View الجذري في كل شاشة وكل أب لـ ScrollView يحتاجان إليها."
  - "استخدم `position: 'absolute'` للعناصر العائمة مثل الشارات، و`flexWrap: 'wrap'` مع `gap` لصفوف الوسوم."
further:
  - title: Layout with Flexbox
    url: https://reactnative.dev/docs/flexbox
  - title: Layout Props
    url: https://reactnative.dev/docs/layout-props
quiz:
  - q: "صفّ فيه صورة مصغّرة بعرض 56 نقطة، وعنوان، وسهم (chevron). أسماء الرحلات الطويلة تدفع السهم خارج الحافة اليمنى. ما الإصلاح؟"
    options:
      - text: "أضف `flexWrap: 'wrap'` إلى الصف."
        why: الالتفاف ينقل السهم إلى سطر ثانٍ، وهذا تخطيط معطوب من نوع آخر.
      - text: "أعطِ حاوية العنوان `flex: 1` لتأخذ المساحة المتبقية فقط، فيلتفّ نصّها أو يُقتطع."
        why: صحيح. الأبناء لا ينكمشون افتراضيًا، وضبط `flex` على 1 يجعل العمود الأوسط يمتصّ العرض المتبقي بدلًا من المطالبة بكامل عرض نصّه.
      - text: "اضبط `overflow: 'hidden'` على الصف."
        why: هذا يقصّ السهم بدلًا من أن يفسح له مكانًا.
      - text: "أعطِ السهم `flex: 1`."
        why: هذا يجعل السهم يكبر ليملأ المساحة، وهو عكس ما تريده تمامًا.
    answer: 1
  - q: "في View بالتنسيقات الافتراضية، ضبطت `justifyContent: 'center'`. أين يذهب الأبناء؟"
    options:
      - text: إلى المنتصف أفقيًا، في صف.
        why: هذا هو الافتراضي على الويب، حيث `flex-direction` تساوي `row`. أما React Native فالافتراضي فيه `column`.
      - text: "لا يتغيّر مكانهم، لأن `justifyContent` يحتاج أولًا إلى `display: 'flex'`."
        why: كل View حاوية flex أصلًا، فلا يوجد شيء تحتاج إلى تفعيله.
      - text: إلى المنتصف عموديًا، مكدّسين في عمود.
        why: صحيح. المحور الرئيسي عمودي افتراضيًا، لذا يوسّط `justifyContent` الأبناء على امتداده.
    answer: 2
  - q: شاشة التفاصيل في Trailhead عبارة عن ScrollView داخل View، وهي لا تتمرّر؛ المحتوى يُقطَع ببساطة. ما السبب المرجّح؟
    options:
      - text: "الـ View الخارجي ليس عليه `flex: 1`، فلا يجد الـ ScrollView ارتفاعًا محدودًا يتمرّر داخله."
        why: صحيح. يتمرّر الـ ScrollView داخل المساحة التي يمنحه إياها أبوه؛ ودون ارتفاع محدود يكبر بحجم محتواه فتقطعه الشاشة.
      - text: "يحتاج ScrollView إلى `scrollEnabled={true}` ليتمرّر."
        why: قيمتها `true` افتراضيًا أصلًا. تضبطها على `false` لتعطيل التمرير.
      - text: لا يتمرّر ScrollView على Android إلا أفقيًا.
        why: يتمرّر عموديًا على المنصّتين افتراضيًا؛ والـ prop المسمّى `horizontal` هو ما يغيّر الاتجاه.
    answer: 0
---

هذا خطأ تخطيط يواجهه كل مطوّر ويب في أسبوعه الأول مع React Native: صفّ فيه أيقونة وعنوان وسهم يبدو مثاليًا مع "Ridge Loop"، وينكسر مع "Old Mill Creek Trail to Eagle Point Lookout". يختفي السهم خلف الحافة اليمنى. لا عيب في معرفتك بالـ flexbox؛ كل ما في الأمر أن flexbox في React Native يبدأ من قيم افتراضية مختلفة.

## الـ flexbox نفسه، بقيم افتراضية مختلفة

يرتّب React Native كل View باستخدام flexbox (عبر Yoga، محرّك تخطيط يطبّق المواصفة). لا يوجد `display: block` ولا `inline`؛ فكل View حاوية flex. أربع قيم افتراضية تختلف عن الويب:

| الخاصية | الافتراضي على الويب | الافتراضي في React Native |
|---|---|---|
| `flexDirection` | `row` | `column` |
| `flexShrink` | `1` | `0` |
| `alignContent` | `normal` | `flex-start` |
| `flex` | اختصار لعدّة خصائص | رقم واحد |

أول اثنتين تفسّران معظم المفاجآت. الأبناء يتكدّسون عموديًا ما لم تقل `flexDirection: 'row'`، و**لا ينكمشون** حين تنفد المساحة، ولهذا دفع ذلك العنوان الطويل السهمَ بعيدًا.

:::figure المحور الرئيسي والمحور العرضي في عمود وفي صف
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">في العمود، يمتد المحور الرئيسي من الأعلى إلى الأسفل، فيعمل justifyContent عموديًا ويعمل alignItems أفقيًا. وفي الصف، يمتد المحور الرئيسي من اليسار إلى اليمين وتتبادل الخاصيتان دوريهما.</title>
  <text class="d-label-strong" x="160" y="24" text-anchor="middle">flexDirection: 'column' (الافتراضي)</text>
  <rect class="d-box" x="70" y="40" width="180" height="200" rx="12"/>
  <rect class="d-box-primary" x="90" y="58" width="140" height="36" rx="8"/>
  <rect class="d-box-primary" x="90" y="104" width="140" height="36" rx="8"/>
  <rect class="d-box-primary" x="90" y="150" width="140" height="36" rx="8"/>
  <path class="d-arrow" d="M40 50 L40 225" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="30" y="140" text-anchor="middle" transform="rotate(-90 30 140)">الرئيسي: justifyContent</text>
  <path class="d-arrow d-dashed" d="M80 225 L240 225" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="160" y="214" text-anchor="middle">العرضي: alignItems</text>
  <text class="d-label-strong" x="500" y="24" text-anchor="middle">flexDirection: 'row'</text>
  <rect class="d-box" x="370" y="40" width="270" height="140" rx="12"/>
  <rect class="d-box-accent" x="386" y="60" width="56" height="56" rx="8"/>
  <rect class="d-box-accent" x="454" y="60" width="130" height="56" rx="8"/>
  <text class="d-label" x="519" y="93" text-anchor="middle">flex: 1</text>
  <rect class="d-box-accent" x="596" y="60" width="30" height="56" rx="8"/>
  <path class="d-arrow" d="M380 205 L630 205" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="505" y="228" text-anchor="middle">الرئيسي: justifyContent</text>
  <path class="d-arrow d-dashed" d="M655 50 L655 170" marker-end="url(#arrow)"/>
</svg>
:::

القواعد التي تعرفها ما زالت سارية: `justifyContent` يعمل على المحور الرئيسي، و`alignItems` على المحور العرضي. في العمود (الافتراضي)، يوسّط `justifyContent: 'center'` عموديًا، ويوسّط `alignItems: 'center'` أفقيًا. انتقل إلى صف فتتبادل الخاصيتان دوريهما.

القيمة الافتراضية لـ `alignItems` هي `stretch`، فالابن في عمود يملأ العرض كاملًا ما لم تعطه عرضًا أو تغيّر `alignItems`. ولهذا يمتد `Text` له لون خلفية في عمود عادي من الحافة إلى الحافة.

## flex: 1، الخاصية التي ستكتبها أكثر من غيرها

في React Native، يأخذ `flex` رقمًا واحدًا. و`flex: 1` تعني «اكبر لتملأ المساحة المتبقية على المحور الرئيسي، ويُسمح لك بالانكماش». مكانان لا يكادان يستغنيان عنها أبدًا:

1. **الـ View الجذري في كل شاشة**، ليملأ الشاشة بدلًا من أن يلتصق بمحتواه.
2. **كل أب لـ ScrollView أو FlatList**، لأن حاوية التمرير تتمرّر داخل الارتفاع الذي يُعطى لها. فإن لم يحدّد أي سلف هذا الارتفاع، تكبر بحجم محتواها كله، ويُقطع الجزء السفلي دون أن تتمرّر أبدًا.

حين تظهر الشاشة كشريط رفيع في الأعلى، أو حين لا تتمرّر قائمة، اصعد في الشجرة وابحث عن الـ `flex: 1` المفقود.

## بناء صفّ الرحلة

هذا هو الصف الذي انكسر، بعد إصلاحه:

```tsx title=src/components/HikeRow.tsx
import { Image, StyleSheet, Text, View } from 'react-native';

export function HikeRow({ hike }: { hike: { name: string; distanceKm: number; date: string; thumbUrl: string } }) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: hike.thumbUrl }} style={styles.thumb} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{hike.name}</Text>
        <Text style={styles.meta}>{hike.distanceKm} km · {hike.date}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  body: { flex: 1 },
  title: { fontSize: 17, fontWeight: '600' },
  meta: { fontSize: 14, color: '#5c6b62', marginTop: 2 },
  chevron: { fontSize: 24, color: '#9aa79f' },
});
```

اقرأه محورًا محورًا. المحور الرئيسي للصف أفقي؛ و`alignItems: 'center'` يوسّط الأبناء الثلاثة عموديًا بالنسبة إلى أطولهم (الصورة المصغّرة). للصورة المصغّرة والسهم أحجام ثابتة. أما الجسم فعليه `flex: 1`، فيأخذ أي عرض يتبقّى، و`numberOfLines={1}` يقتطع الاسم الطويل بعلامة حذف بدلًا من دفع السهم خارج الشاشة.

:::mistake إصلاح الفيضان بعرض ثابت
ضبط `width: 220` على العنوان يناسب هاتف الاختبار لديك، وينكسر على هاتف Android صغير، وفي الوضع الأفقي، ولدى المستخدمين الذين يكبّرون النص. دع الـ flex يوزّع المساحة: أحجام ثابتة لما هو ثابت فعلًا (الأيقونات، الصور المصغّرة)، و`flex: 1` للجزء الذي يجب أن يمتصّ الفرق.
:::

أداتان أخريان تُكملان التخطيط اليومي. يسمح `alignSelf` لابن واحد بالخروج عن `alignItems` الخاصة بأبيه: زرّ "Log a hike" في عمود متمدّد يمكنه استخدام `alignSelf: 'flex-end'` ليستقرّ على اليمين بعرضه الطبيعي. أما `aspectRatio` فيحدّد حجم الصندوق انطلاقًا من بُعد واحد، وهذا مثالي للصور: أعطِ صورة الدرب `width: '100%'` و`aspectRatio: 4 / 3`، فيتبع ارتفاعها عرض الشاشة على كل هاتف دون أن تحسب أي شيء.

وحين يسيء تخطيطٌ التصرّف، تبقى أسرع حيلة لتصحيحه هي الأقدم: أعطِ الـ Views المشتبه بها لون خلفية فاقعًا مؤقتًا. سترى فورًا أي صندوق أصغر من اللازم، وأيها تمدّد، وأيها لم يحصل قط على `flex: 1`.

## التموضع المطلق والالتفاف

كل View يكون `position: 'relative'` افتراضيًا، لذا يضع `position: 'absolute'` الابن بالنسبة إلى أبيه. هكذا تضع شارة "New" على زاوية صورة مصغّرة:

```tsx
<View>
  <Image source={{ uri: hike.thumbUrl }} style={styles.thumb} />
  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#e8590c', borderRadius: 8, paddingHorizontal: 6 }}>
    <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>NEW</Text>
  </View>
</View>
```

ولصفّ من الوسوم ("steep"، "lake"، "dog-friendly") يجب أن ينتقل إلى سطر ثانٍ حين تنفد المساحة، اجمع بين `flexDirection: 'row'` و`flexWrap: 'wrap'` و`gap: 8`. التموضع المطلق يُخرج الابن من تدفّق الـ flex كليًا، لذا استخدمه للعناصر العائمة فقط، ولا تستخدمه أبدًا لتزييف تخطيط يستطيع الـ flex التعبير عنه.

في الدرس التالي ستجعل هذه التخطيطات تصمد أمام أحجام الهواتف المختلفة، والنتوءات (notches)، والزوايا المستديرة، والفروق بين المنصّتين.
