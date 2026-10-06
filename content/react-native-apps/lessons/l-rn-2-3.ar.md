---
summary: اجعل شاشات Trailhead تناسب أي هاتف باستخدام useWindowDimensions وهوامش الـ safe area، واكتب كودًا خاصًا بكل منصّة باستخدام Platform.select أو ملفات منفصلة لكل منصّة، فقط حيث تختلف المنصّتان فعلًا.
takeaways:
  - "`useWindowDimensions()` يعيد الـ render عند التدوير وتغيير الحجم؛ أما `Dimensions.get()` فلقطة واحدة تصبح قديمة."
  - الشاشات التي لا تحوي ترويسة تنقّل أو شريط tabs يجب أن تضيف حشوها بنفسها باستخدام هوامش الـ safe area من react-native-safe-area-context.
  - يرسم Android التطبيقات من الحافة إلى الحافة خلف أشرطة النظام، لذا تهمّ الهوامش على Android بقدر ما تهمّ على iOS.
  - "استخدم `Platform.select` للفروق الصغيرة، وملفّي `.ios.tsx` / `.android.tsx` حين يختلف component بأكمله."
further:
  - title: Safe areas
    url: https://docs.expo.dev/develop/user-interface/safe-areas/
  - title: useWindowDimensions
    url: https://reactnative.dev/docs/usewindowdimensions
  - title: Platform-Specific Code
    url: https://reactnative.dev/docs/platform-specific-code
quiz:
  - q: تحسب شبكة الصور في Trailhead عدد أعمدتها مرة واحدة باستخدام `Dimensions.get('window').width` في أعلى الملف. ما الذي ينكسر؟
    options:
      - text: لا شيء؛ عرض الشاشة لا يتغيّر أبدًا أثناء عمل التطبيق.
        why: يتغيّر عند التدوير، وفي وضع تقسيم الشاشة على iPad، وعلى الهواتف القابلة للطي، والقيمة المخزّنة لا تتحدّث.
      - text: تحتفظ الشبكة بعدد أعمدتها القديم بعد أن يدير المستخدم الهاتف أو يفتح هاتفًا قابلًا للطي.
        why: صحيح. اقرأ الحجم باستخدام `useWindowDimensions()` داخل الـ component ليُعاد الـ render بالعرض الجديد.
      - text: ينهار على Android لأن `Dimensions` خاص بـ iOS.
        why: "`Dimensions` يعمل على المنصّتين. المشكلة أن القيمة تُقرأ مرة واحدة ولا تُحدَّث أبدًا."
    answer: 1
  - q: خريطة Trailhead بملء الشاشة ليس لها ترويسة، وأزرارها العلوية تقع تحت الـ Dynamic Island في iPhone. ما الإصلاح الصحيح؟
    options:
      - text: "أضف `paddingTop: 50` إلى الشاشة."
        why: المقدار الصحيح يختلف بحسب الجهاز والاتجاه والمنصّة. والرقم السحري خاطئ على معظم الهواتف.
      - text: غلّف الشاشة بـ `SafeAreaView` المستورد من `react-native`.
        why: هذا الـ component مُهمَل (deprecated)، ويعمل على iOS فقط، ولا يتعامل مع تخطيط Android من الحافة إلى الحافة.
      - text: أخفِ شريط الحالة فلا يتداخل شيء.
        why: الـ Dynamic Island والزوايا المستديرة من العتاد؛ وإخفاء شريط الحالة لا يحرّكها.
      - text: اقرأ `useSafeAreaInsets()` وطبّق `insets.top` على حاوية الأزرار.
        why: صحيح. الهوامش هي الحجم الدقيق للمنطقة غير الآمنة على هذا الجهاز، في هذه اللحظة، وعلى المنصّتين.
    answer: 3
  - q: يحتاج منتقي التاريخ في Trailhead إلى components مختلفة كليًا على iOS وAndroid، بينما بقية النموذج مشتركة. ما البنية الأنظف؟
    options:
      - text: ملفان، `DatePicker.ios.tsx` و`DatePicker.android.tsx`، يُستوردان باسم `./DatePicker`.
        why: صحيح. يختار المُجمِّع الملف المناسب لكل منصّة، ويبقى كل ملف بسيطًا وسهل القراءة.
      - text: component واحد مع `if (Platform.OS === 'ios')` حول كل سطر مختلف.
        why: هذا يصلح لسطر أو اثنين، لكن component كاملًا مليئًا بالتفرّعات صعب القراءة وسهل الكسر.
      - text: تطبيقان منفصلان، واحد لكل منصّة.
        why: هذا يرمي منطق النموذج المشترك، وهو السبب الرئيسي لاستخدام React Native.
    answer: 0
---

تتراوح الهواتف التي يحملها مستخدموك بين أجهزة Android صغيرة بعرض نحو 360 نقطة وأجهزة iPhone كبيرة يتجاوز عرضها 430، إضافةً إلى الأجهزة اللوحية، والهواتف القابلة للطي التي يتغيّر عرضها في منتصف الجلسة، والوضع الأفقي. وفوق ذلك، الشاشة ليست مستطيلًا نظيفًا: هناك نتوء (notch) أو Dynamic Island، وزوايا مستديرة، ومؤشّر الشاشة الرئيسية، وعلى Android أشرطة الحالة والتنقّل التي يرسم تطبيقك الآن خلفها. ثلاث أدوات تجعل Trailhead يناسب كل ذلك.

## قراءة حجم الشاشة بالطريقة الصحيحة

يُرجع `useWindowDimensions()` القيم `width` و`height` و`scale` و`fontScale` للنافذة، ويعيد الـ render للـ component كلما تغيّرت:

```tsx
import { useWindowDimensions } from 'react-native';

export function PhotoGrid({ photos }: { photos: string[] }) {
  const { width } = useWindowDimensions();
  const columns = width >= 700 ? 4 : 2;
  // …render photos in `columns` columns
}
```

ستجد كودًا قديمًا يستدعي `Dimensions.get('window')` على مستوى الوحدة (module). هذا يقرأ الحجم مرة واحدة، حين يُحمَّل الملف، ولا يقرؤه بعدها أبدًا: أدِر الهاتف، أو افتح التطبيق في وضع تقسيم الشاشة على iPad، أو افتح هاتفًا قابلًا للطي، وسيبقى التخطيط يستخدم العرض القديم. استخدم الـ hook داخل الـ components.

وفضّل الـ flex على القياسات حين تستطيع. معظم التخطيطات لا تحتاج إلى العرض أصلًا؛ استخدم `useWindowDimensions` حين تتغيّر **البنية** مع الحجم (عمودان يصبحان أربعة)، لا لحساب قيم بالبكسل يتولّاها الـ flexbox أصلًا.

:::tip احترم fontScale
تكون `fontScale` أكبر من 1 حين يكبّر المستخدم حجم نص النظام؛ وقيمة 1.3 أو أكثر شائعة بين المتنزّهين الأكبر سنًّا، وهم جمهور Trailhead. اختبر شاشاتك بأكبر حجم نص لإمكانية الوصول مرة واحدة على الأقل. الصفوف ذات الارتفاعات الثابتة أول ما ينكسر.
:::

## الـ safe areas على المنصّتين

الـ **safe area** (المنطقة الآمنة) هي جزء الشاشة الذي لا تغطّيه فتحات العتاد ولا واجهة النظام. ترويسات التنقّل وأشرطة الـ tabs في Expo Router تحترمها أصلًا. أما الشاشات التي لا تحويها، مثل خريطة بملء الشاشة أو صفحة تعريفية، فيجب أن تتعامل معها بنفسها.

المكتبة المخصّصة لذلك هي `react-native-safe-area-context`. يتضمّنها Expo Router أصلًا ويوفّر الـ `SafeAreaProvider` في الجذر، فيمكنك استخدام الـ hook مباشرة:

```tsx title=src/app/track.tsx
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrackScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      {/* the map fills the whole screen, edge to edge */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Text style={styles.timer}>01:24:10</Text>
      </View>
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Text>Stop and save</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  timer: { fontSize: 20, fontWeight: '700' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, alignItems: 'center' },
});
```

يمكن للخريطة أن تُرسم تحت شريط الحالة، وهذا يبدو جميلًا، بينما تستقرّ عناصر التحكّم تحت المنطقة غير الآمنة بالضبط. للكائن `insets` القيم `top` و`bottom` و`left` و`right`، فيعمل الوضع الأفقي أيضًا. وتصدّر المكتبة كذلك component باسم `SafeAreaView` يطبّق الحشو نيابةً عنك، وهو مفيد للشاشات البسيطة.

:::mistake استخدام SafeAreaView من react-native
ما زال `import { SafeAreaView } from 'react-native'` يُترجَم، لكنه مُهمَل، ولم يعمل يومًا إلا على iOS، ويتجاهل تخطيط Android من الحافة إلى الحافة. في إصدارات Android الحديثة ترسم التطبيقات خلف شريطَي الحالة والتنقّل، فينتهي المحتوى الذي لا يستخدم الهوامش تحت الساعة أو تحت شريط الإيماءات. استورده من `react-native-safe-area-context` بدلًا من ذلك.
:::

## حين تختلف المنصّتان

يشارك React Native الكود بين iOS وAndroid، لكن المنصّتين ليستا متطابقتين، والتظاهر بأنهما كذلك ينتج تطبيقًا يبدو غريبًا على كلتيهما. يعطيك `Platform` نظام التشغيل الحالي:

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
  },
  card: Platform.select({
    ios: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' },
    android: { elevation: 3 },
    default: {},
  }),
});
```

يُرجع `Platform.select` القيمة الخاصة بالمنصّة الحالية، ويعود إلى `default` إن لم يجدها. إنه الأداة المناسبة للفروق الصغيرة: وزن خط، أو ظلّ، أو hit slop.

وحين يختلف **component بأكمله**، قسّمه إلى ملفات. أنشئ `DatePicker.ios.tsx` و`DatePicker.android.tsx`، ثم استورد `./DatePicker` دون امتداد؛ فيختار Metro الملف المناسب لكل منصّة. والأمر نفسه يعمل مع `.native.tsx` و`.web.tsx` إن عمل Trailhead يومًا على الويب.

أين تختلف المنصّتان فعلًا؟ في أعراف التنقّل (iOS يرجع بالسحب من الحافة اليسرى؛ وAndroid لديه إيماءة رجوع على مستوى النظام)، وفي أدوات الاختيار وحقول التاريخ، وفي الخطوط الافتراضية، والاهتزاز اللمسي (haptics)، ومسارات طلب الأذونات. وحيث لا تختلفان، كقائمة الرحلات والنماذج ومنطق العمل، شارك كل شيء.

## شبكة تناسب الأجهزة اللوحية

لنجمع القطع معًا: يجب أن تعرض شبكة الصور أكبر عدد من الأعمدة يتّسع، مع حدّ أدنى لعرض البطاقة، ومسافات متّسقة، وحشو للشاشة. هذا حساب صغير يُنفَّذ في كل مرة يتغيّر فيها العرض، وهو بالضبط نوع الدوال النقية الذي يستحق أن تكتبه بشكل صحيح مرة واحدة. ستكتبه في التمرين أدناه.

التالي: القوائم. سيحمل Trailhead عمّا قليل مئات الرحلات، ورسمها كلها دفعة واحدة أسرع طريقة لجعل الهاتف يبدو بطيئًا.
