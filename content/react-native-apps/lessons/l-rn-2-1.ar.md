---
summary: نسّق Trailhead باستخدام StyleSheet ومصفوفات التنسيق والـ design tokens، مستخدمًا نقاطًا بلا وحدات وخصائص مفصّلة، في نظام بلا cascade ولا selectors ولا media queries.
takeaways:
  - التنسيقات كائنات JavaScript بمفاتيح camelCase وأرقام بلا وحدات، تُقاس بنقاط مستقلّة عن كثافة البكسلات.
  - اختصارات CSS متعدّدة القيم، مثل `margin '8px 16px'`، غير موجودة؛ استخدم `marginVertical` و`marginHorizontal`.
  - في مصفوفة التنسيق تفوز العناصر اللاحقة وتُتخطّى القيم الزائفة (falsy)، وهذا يجعل التنسيق الشرطي سطرًا واحدًا.
  - إعادة الاستخدام تتم عبر الـ components وكائن من الـ tokens، لا عبر الـ selectors أو ملف تنسيق عام.
  - اقبل prop باسم `style` وضعه في آخر المصفوفة، ليتمكّن من يستخدم الـ component من تعديله دون نسخه.
further:
  - title: Style
    url: https://reactnative.dev/docs/style
  - title: StyleSheet
    url: https://reactnative.dev/docs/stylesheet
  - title: useColorScheme
    url: https://reactnative.dev/docs/usecolorscheme
quiz:
  - q: "ما الذي يُرسَم مع `style={[styles.card, isFavorite && styles.favorite, { padding: 8 }]}` حين تكون `isFavorite` تساوي `false` وكلا التنسيقين يضبط `padding`؟"
    options:
      - text: يرمي التطبيق خطأ، لأن `false` ليست تنسيقًا صالحًا.
        why: القيم الزائفة في مصفوفة التنسيق تُتخطّى عمدًا؛ وهذا ما يجعل نمط `&&` آمنًا هنا.
      - text: الحشو الخاص بـ `styles.card`، لأن العنصر الأول له الأولوية.
        why: الأولوية في الاتجاه المعاكس. العناصر اللاحقة تتغلّب على السابقة، مثل `Object.assign`.
      - text: الحشو الخاص بـ `styles.favorite`، لأن التنسيقات المسمّاة تتغلّب على الكائنات المباشرة.
        why: لا توجد أولوية تحديد (specificity) في React Native. الترتيب هو القاعدة الوحيدة، و`favorite` تُخطّي على أي حال.
      - text: حشو قيمته 8، لأن العنصر الأخير في المصفوفة هو الذي يفوز.
        why: صحيح. تُتجاهَل `false`، ويأتي الكائن المباشر أخيرًا، فيتغلّب الـ `padding` الخاص به على حشو البطاقة.
    answer: 3
  - q: أيّ كائن تنسيق صالح في React Native؟
    options:
      - text: "`{ margin: '8px 16px', fontSize: '16px' }`"
        why: الاختصارات متعدّدة القيم ونصوص px من صياغة CSS. أما React Native فيريد رقمًا واحدًا لكل خاصية.
      - text: "`{ marginVertical: 8, marginHorizontal: 16, fontSize: 16 }`"
        why: صحيح. مفاتيح مفصّلة بأرقام بلا وحدات، تُقاس بالنقاط.
      - text: "`{ 'margin-vertical': 8, 'font-size': 16 }`"
        why: المفاتيح أسماء خصائص JavaScript بصيغة camelCase، لا أسماء CSS بصيغة kebab-case.
    answer: 1
  - q: يحتاج Trailhead أن تستخدم كل البطاقات نصف قطر الزوايا والمسافات نفسها. ما الطريقة المعتادة؟
    options:
      - text: ملف `theme.ts` يصدّر tokens (الألوان، المسافات، نصف القطر) تستوردها الـ components داخل الـ StyleSheets الخاصة بها.
        why: صحيح. الـ tokens تعطيك مصدرًا واحدًا للحقيقة دون حاجة إلى cascade، ومن السهل تبديلها للوضع الداكن.
      - text: ملف تنسيق عام يُحمَّل في الـ root layout ويستهدف كل `View`.
        why: لا توجد selectors في React Native، فلا شيء يستطيع استهداف «كل View».
      - text: نسخ الأرقام في كل component والحفاظ على تطابقها بالبحث والاستبدال.
        why: ينجح هذا حتى يغيّر المصمّم نصف القطر من 12 إلى 14 في أربعين ملفًا.
    answer: 0
---

في أول مرة تنسّق فيها شاشة في React Native، ستمدّ يدك إلى أشياء غير موجودة: اسم class، و`:hover`، وmedia query، و`font-family` على `body` ليرثه كل شيء. لا يملك React Native أيًّا منها. ما يملكه بدلًا من ذلك أصغر وأكثر قابلية للتوقّع: كائنات عادية، تُطبَّق مباشرة على الـ component الذي يحتاج إليها، بترتيب تتحكّم فيه أنت.

## كائنات التنسيق وStyleSheet.create

التنسيق (style) كائن JavaScript بمفاتيح camelCase. يمكنك تمريره مباشرة، لكن معظم الكود يجمع التنسيقات باستخدام `StyleSheet.create`، الذي يمنحك الإكمال التلقائي وفحص الأنواع ومكانًا واحدًا تقرأ فيه تنسيقات الـ component:

```tsx title=src/components/HikeCard.tsx
import { StyleSheet, Text, View } from 'react-native';

export function HikeCard({ name, distanceKm }: { name: string; distanceKm: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.meta}>{distanceKm} km</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8e4',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#1d2a22' },
  meta: { fontSize: 14, color: '#5c6b62', marginTop: 4 },
});
```

تعريف `styles` أسفل الـ component عُرف متّبع، وهو عُرف جيد: الـ JSX يأتي أولًا حين تفتح الملف.

هل `StyleSheet.create` أسرع من الكائنات المباشرة (inline)؟ ليس بأي قدر ستقيسه اليوم. الكلفة الحقيقية للكائنات المباشرة هي سهولة القراءة، وإنشاء كائنات جديدة في كل render، وهذا لا يهمّ إلا حين تمرّر التنسيقات إلى أبناء مغلّفين بـ memo. القاعدة المعقولة: التنسيقات الثابتة في `StyleSheet.create`، والقيم القليلة التي تعتمد على الـ props أو الـ state تُكتب مباشرة أو في مصفوفة التنسيق بجوارها.

## أرقام بلا وحدات

`borderRadius: 12` تعني 12 **نقطة مستقلّة عن الكثافة** (density-independent points)، لا 12 بكسلًا فعليًا. الزاوية ذات الـ 12 نقطة تبدو بالحجم نفسه على هاتف Android رخيص وعلى iPhone بكثافة بكسلات أعلى بثلاث مرات؛ فالمنصّة تتولّى الضرب نيابةً عنك. النسب المئوية تعمل كنصوص (`width: '50%'`)، وهذا كل شيء: لا `px` ولا `rem` ولا `em` ولا `vh`.

والاختصارات التي تأخذ عدّة قيم غير موجودة أيضًا. بدلًا من `margin: '8px 16px'` تكتب `marginVertical: 8, marginHorizontal: 16`. والنمط نفسه يشمل الحشو (`paddingTop`، `paddingHorizontal`)، والحدود (`borderTopWidth`، `borderBottomColor`)، والزوايا (`borderTopLeftRadius`). أما الاختصارات ذات القيمة الواحدة مثل `margin: 8` و`borderRadius: 12` فتعمل كما تتوقّع.

يدعم React Native الحديث أيضًا عدّة خصائص يفتقدها مطوّرو الويب: `gap` و`rowGap` و`columnGap` للمسافات بين الأبناء، و`boxShadow` بنصّ يشبه CSS، و`filter`. أما الدروس القديمة فتستخدم props منفصلة هي `shadowColor`/`shadowOffset` لـ iOS و`elevation` لـ Android، وما زلت ستراها في قواعد الكود الموجودة.

:::mistake كتابة نصوص CSS
`fontSize: '16px'` أو `margin: '8 16'` إما ترمي خطأ بشاشة حمراء أو تُتجاهَل بصمت، بحسب الخاصية. إن بدا أن تنسيقًا لا يفعل شيئًا، فابحث أولًا عن وحدة أو نصّ متعدّد القيم. وTypeScript تلتقط معظم هذه الأخطاء لحظة كتابتها، وهذا سبب إضافي لإبقائها مفعّلة.
:::

## مصفوفات التنسيق: الترتيب هو القاعدة الوحيدة

يقبل الـ prop المسمّى `style` مصفوفة. يدمجها React Native من اليسار إلى اليمين، فتفوز المفاتيح اللاحقة، وتُتخطّى القيم الزائفة (`false` و`null` و`undefined`). وهذا يحوّل التنسيق الشرطي إلى سطر واحد:

```tsx
<View style={[styles.card, isFavorite && styles.favorite, isSelected && styles.selected]} />
```

لا توجد specificity تفكّر فيها، ولا `!important`، ولا تنسيق يصل من أب على بُعد ثلاثة ملفات. إن بدت بطاقة خاطئة، فالسبب في تلك المصفوفة.

استخدم القاعدة نفسها لتجعل الـ components الخاصة بك قابلة للتعديل. اقبل prop باسم `style` وضعه في الآخر:

```tsx
import type { StyleProp, ViewStyle } from 'react-native';

type Props = { name: string; distanceKm: number; style?: StyleProp<ViewStyle> };

export function HikeCard({ name, distanceKm, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {/* …title and meta as before */}
    </View>
  );
}

// A caller nudges one instance without forking the component:
<HikeCard name="Ridge Loop" distanceKm={8.4} style={{ marginBottom: 24 }} />
```

`StyleProp<ViewStyle>` هو الـ type الذي يقبل كائنًا أو مصفوفة أو قيمة زائفة، تمامًا مثل الـ components المدمجة.

## الـ tokens بدلًا من الـ cascade

دون وراثة، يأتي الاتساق من مكانين: الـ components (بطاقة `HikeCard` واحدة، وزر `PrimaryButton` واحد، و`AppText` واحد)، وملف صغير من الـ **tokens** (قيم التصميم المشتركة) تستورده كلها.

```ts title=src/theme.ts
export const colors = {
  bg: '#f6f8f6',
  surface: '#ffffff',
  text: '#1d2a22',
  textMuted: '#5c6b62',
  primary: '#2f6f4e',
  border: '#e2e8e4',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 20 };
```

الآن تقرأ البطاقة `borderRadius: radius.md` و`paddingHorizontal: space.lg`، وأي تغيير من المصمّم يقع في ملف واحد.

:::tip الوضع الداكن بالـ tokens نفسها
تُرجع `useColorScheme()` من `react-native` القيمة `'dark'` حين يكون الهاتف في الوضع الداكن. احتفظ بكائنَي tokens، واختر أحدهما في أعلى الشجرة، ومرّره إلى الأسفل عبر الـ context؛ ولا يكتب أي component لونًا ثابتًا بنفسه. ستبني هذا الـ context في القسم 3.
:::

## لماذا غياب الـ cascade ميزة

في تطبيق ويب كبير، تأتي أصعب أخطاء التنسيق من قواعد لم تكتبها تصل إلى عناصر لم تتوقّعها. يُلغي React Native هذه الفئة كلها. شكل الـ component هو تنسيقه الخاص زائد ما يمرّره له من يستخدمه، ولا شيء غير ذلك. هذا يعني كتابة أكثر في البداية، وتصحيح أخطاء أقل بكثير لاحقًا. والفرق التي تريد سهولة تشبه الـ classes تضيف مكتبة مثل NativeWind (classes من Tailwind تُترجَم إلى كائنات تنسيق)، لكنها في الأسفل تبقى الكائنات نفسها.

في الدرس التالي سترتّب هذه الصناديق المنسّقة باستخدام flexbox، حيث تختلف القيم الافتراضية في React Native عن الويب بطرق تفسّر معظم لحظات «لماذا هذا العنصر منضغط؟».
