---
summary: ابنِ شاشة تفاصيل الرحلة في Trailhead باستخدام View وText وImage وScrollView، وتجنّب قواعد النص والصور التي تُسقط شاشات الجوّال أو تتركها فارغة.
takeaways:
  - "`View` صندوق للتخطيط ولا يمكن أن يحوي نصًّا خامًا؛ كل نصّ يجب أن يكون داخل `<Text>`."
  - تنسيقات النص تُورَث فقط من `<Text>` أب، ولا تُورَث أبدًا من `<View>`.
  - صور الشبكة تحتاج إلى عرض وارتفاع صريحين؛ أما الصور المحلية المحمّلة عبر `require()` فتعرف حجمها بنفسها.
  - "`ScrollView` يرسم كل أبنائه دفعة واحدة ويحتاج إلى ارتفاع محدود، فاستخدمه لشاشات المحتوى، لا لقوائم البيانات الطويلة."
  - "`{count && <Text>…</Text>}` ينهار حين تكون `count` صفرًا، لأن 0 يُرسم كنصّ خام؛ استخدم مقارنة صريحة بدلًا من ذلك."
further:
  - title: Core Components and APIs
    url: https://reactnative.dev/docs/components-and-apis
  - title: Text
    url: https://reactnative.dev/docs/text
  - title: Image
    url: https://reactnative.dev/docs/image
quiz:
  - q: |
      أيّ سطر يرمي الخطأ "Text strings must be rendered within a <Text> component"؟
      ```tsx
      <View>
        <Text>Ridge Loop</Text>
        {hike.photoCount && <Text>{hike.photoCount} photos</Text>}
      </View>
      ```
    options:
      - text: السطر 2، لأن `Text` يجب أن يُغلَّف داخل `Text` آخر.
        why: وجود `Text` مباشرة داخل `View` هو الحالة الطبيعية. النصوص الخام وحدها تحتاج إلى تغليف.
      - text: السطر 3، حين تكون `photoCount` صفرًا، لأن `0 && …` تُقيَّم إلى `0` فترسمها React كنصّ داخل View.
        why: صحيح. القيم `false` و`null` و`undefined` لا ترسم شيئًا، لكن الرقم 0 يُرسم بوصفه "0". استخدم `photoCount > 0 && …`.
      - text: لا هذا ولا ذاك؛ React Native يتجاهل النصوص الشاردة بصمت.
        why: لا يفعل. على الويب يصبح النص الشارد عقدة نصية، لكن الـ View الأصلي ليس فيه عقدة نصية يضعه فيها، فيرمي React Native خطأ.
    answer: 1
  - q: "وضعت `style={{ color: '#2f6f4e', fontSize: 18 }}` على `View`. ماذا يحدث للـ `Text` الذي بداخله؟"
    options:
      - text: يصبح أخضر بحجم 18 نقطة، كما في الوراثة في CSS.
        why: لا يوجد cascade من View إلى Text. الـ Text يرث فقط من Text أعلى منه.
      - text: ينهار التطبيق لأن View لا يقبل هذه المفاتيح.
        why: ستحصل على خطأ type في TypeScript، لكن وقت التشغيل يتجاهل الـ View هذه المفاتيح. المشكلة الحقيقية أن شيئًا لا يحدث.
      - text: لا يتغيّر شيء؛ يحتفظ الـ Text بلونه وحجمه الافتراضيين.
        why: صحيح. ضع تنسيقات النص على الـ Text نفسه، أو ابنِ component صغيرًا باسم `<AppText>` يطبّقها.
    answer: 2
  - q: "`<Image source={{ uri: hike.photoUrl }} />` لا يعرض شيئًا، ولا توجد أخطاء. ما الإصلاح الأرجح؟"
    options:
      - text: "أعطِه حجمًا، مثل `style={{ width: '100%', height: 220 }}`."
        why: صحيح. لا يستطيع React Native معرفة حجم صورة من الشبكة قبل تنزيلها، فدون حجم تكون الصورة 0 في 0.
      - text: غلّف الرابط بـ `require()`.
        why: "`require()` للصور المضمّنة في التطبيق، ويُحَلّ وقت البناء. لا يستطيع تحميل رابط."
      - text: استخدم `src` بدلًا من `source`.
        why: "`src` هي سمة HTML. أما Image في React Native فيستخدم `source`."
    answer: 0
  - q: شاشة التفاصيل في Trailhead فيها صورة وعنوان وإحصاءات ووصف طويل قد لا يتّسع. أيّ حاوية هي الأنسب؟
    options:
      - text: "`View` مع `overflow: 'scroll'`."
        why: الـ Views لا تتمرّر أبدًا مهما كانت قيمة overflow. التمرير component أصلي مستقل.
      - text: "`ScrollView`، لأنها شاشة ثابتة من محتوى متنوّع."
        why: صحيح. ScrollView بحجم الشاشة مع عدد قليل من الأبناء هو بالضبط ما صُمّم له.
      - text: "`FlatList` بعنصر واحد لكل فقرة."
        why: FlatList مخصّص لقوائم البيانات الطويلة المتجانسة. لشاشة محتوى واحدة يضيف تعقيدًا دون أي فائدة.
    answer: 1
---

على الويب، يمكنك أن ترمي نصًّا داخل `div`، وتضبط الخط على `body`، وتضع `<img>` دون أن تفكّر في حجمها. جرّب الشيء نفسه في React Native وستحصل على شاشة خطأ حمراء، أو نص بخط خاطئ، أو صورة لا تظهر أبدًا. أربعة components تحمل معظم الشاشات، ولكلٍّ منها قاعدة واحدة تُوقع مطوّري الويب.

## View: صندوق، لا أكثر

`View` هو حجر البناء في التخطيط: مستطيل يمكن أن يكون له خلفية وحدود وحشو (padding) وأبناء. ويقابله view حاوية أصلي. ليس فيه عقدة نصية، لذا **لا يمكن أن يحوي نصوصًا**:

```tsx
// Throws: Text strings must be rendered within a <Text> component.
<View>Ridge Loop</View>

// Works
<View>
  <Text>Ridge Loop</Text>
</View>
```

فكّر في `View` على أنه الـ `div` الذي تستخدمه للتخطيط، مطروحًا منه كل ما يفعله الـ `div` مع النص. وهو أيضًا أكثر ما ستنسّقه: البطاقات والصفوف والفواصل والشارات والمسافات الفارغة كلها Views لها خلفية أو حواف مستديرة أو بعض الحشو. الـ Views رخيصة لكنها ليست مجانية؛ فكل واحد منها يصبح native view حقيقيًا، وصفّ في قائمة فيه اثنتا عشرة طبقة تغليف متداخلة يكلّف أكثر من صفّ فيه أربع. قلّل الطبقات حين لا تضيف الطبقة شيئًا.

## Text: المكان الوحيد للنصوص

كل نص مرئي يوضع داخل `<Text>`. عناصر `<Text>` المتداخلة تصبح فقرة واحدة، وهذا أيضًا **المكان الوحيد** الذي توجد فيه وراثة التنسيق: الـ `Text` الابن يرث الخط واللون والحجم من `Text` الأب.

```tsx
<Text style={{ fontSize: 16, color: '#333' }}>
  Ridge Loop is <Text style={{ fontWeight: '700' }}>8.4 km</Text> with 420 m of climbing.
</Text>
```

الـ `View` لا يمرّر تنسيقات النص إلى أسفل أبدًا. وإن أردت خطًّا موحّدًا في التطبيق كله، فاصنع component (مثل `AppText` يضبط القيم الافتراضية التي تريدها) بدلًا من البحث عن ملف تنسيق عام غير موجود.

والنص أيضًا يتكيّف مع إعدادات إمكانية الوصول (accessibility) لدى المستخدم. من ضبط حجم خط أكبر في إعدادات iOS أو Android يحصل على نص أكبر في تطبيقك تلقائيًا، وهذا جيد، لكنه يعني أن أي صندوق بارتفاع ثابت حول النص سيقصّه في النهاية. اترك مجالًا للنمو، وفضّل الحشو على الارتفاعات الثابتة في أي شيء يحوي كلمات.

وستستخدم اثنين من الـ props باستمرار: `numberOfLines={2}` يقتطع النص ويضيف علامة حذف (مثالي لبطاقات القوائم)، و`selectable` يسمح للمستخدمين بنسخ النص.

:::mistake الـ `&&` الذي يرسم صفرًا
`{hike.photoCount && <Text>{hike.photoCount} photos</Text>}` يعمل على الويب، حيث يظهر الـ `0` الشارد كحرف غير مؤذٍ. أما في React Native فـ `0 && …` تُقيَّم إلى `0`، فتحاول React رسم هذا الرقم مباشرة داخل `View`، فيرمي التطبيق خطأ. اكتب قيمة منطقية حقيقية: `{hike.photoCount > 0 && …}`.
:::

## Image: أخبره بحجمه

للصور المضمّنة في التطبيق، يحلّ `require()` الملف وقت البناء، فيعرف React Native أبعاد الصورة:

```tsx
<Image source={require('../../assets/images/trail-placeholder.png')} />
```

أما صور الشبكة، فلا يستطيع React Native معرفة حجمها حتى ينتهي التنزيل، لذا يجب أن تعطيه حجمًا. دون ذلك تُرسم الصورة بحجم 0 في 0، بصمت.

```tsx
<Image
  source={{ uri: hike.photoUrl }}
  style={{ width: '100%', height: 220, borderRadius: 12 }}
  resizeMode="cover"
  accessibilityLabel={`Photo from ${hike.name}`}
/>
```

تعمل `resizeMode` مثل `object-fit` في CSS: `cover` تملأ وتقصّ، و`contain` تحتوي الصورة كاملة. وفي تطبيقات الإنتاج تستخدم فرق كثيرة `expo-image` بدلًا منه: له الشكل الأساسي نفسه، ويضيف التخزين المؤقت على القرص والصور المؤقتة (placeholders)، ويستخدم `contentFit` بدلًا من `resizeMode`.

## ScrollView: محتوى قد لا يتّسع

الـ native views لا تتمرّر عند تجاوز المحتوى لحدودها. التمرير component مستقل اسمه `ScrollView`، وله خاصّيتان غريبتان.

أولًا، يحتاج إلى **ارتفاع محدود**: فهو يتمرّر داخل المساحة التي يمنحه إياها الأب، لذا تحتاج سلسلة الآباء إلى `flex: 1` (سترى السبب في درس الـ flexbox). ثانيًا، الحشو والمحاذاة للمحتوى المتمرّر توضع في `contentContainerStyle`، لا في `style`. فـ `style` يحدّد حجم نافذة التمرير، و`contentContainerStyle` ينسّق المحتوى الذي ينزلق داخلها.

هذه شاشة التفاصيل في Trailhead، مع بيانات تجريبية حاليًا:

```tsx title=src/app/hike.tsx
import { Image, ScrollView, Text, View } from 'react-native';

const hike = {
  name: 'Ridge Loop',
  photoUrl: 'https://images.example.com/ridge-loop.jpg',
  distanceKm: 8.4,
  elevationM: 420,
  notes: 'Steep first kilometre, then a long ridge with views of the lake. Bring water: the spring at the saddle was dry.',
  photoCount: 0,
};

export default function HikeScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Image
        source={{ uri: hike.photoUrl }}
        style={{ width: '100%', height: 220, borderRadius: 12 }}
        accessibilityLabel={`Photo from ${hike.name}`}
      />
      <Text style={{ fontSize: 28, fontWeight: '700' }}>{hike.name}</Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Text>{hike.distanceKm} km</Text>
        <Text>{hike.elevationM} m up</Text>
      </View>
      {hike.photoCount > 0 && <Text>{hike.photoCount} photos</Text>}
      <Text style={{ fontSize: 16, lineHeight: 24 }}>{hike.notes}</Text>
    </ScrollView>
  );
}
```

لاحظ ما ليس موجودًا: لا `div`، ولا أسماء classes، ولا استيراد لملف تنسيق، ولا نصوص شاردة. والأرقام مثل `hike.distanceKm` موجودة داخل `Text`، فتُرسم دون مشكلة.

:::note وماذا عن قائمة من 300 رحلة؟
يرسم `ScrollView` كل ابن فورًا، حتى البعيد عن الشاشة. لشاشة محتوى هذا جيد. أما لقائمة بيانات تكبر، فمعناه بدء تشغيل بطيء واستهلاك عالٍ للذاكرة. ستستخدم `FlatList` لذلك في القسم 2.
:::

## بقية المجموعة الأساسية

ستتعرّف على البقية حين يحتاج إليها Trailhead: `Pressable` و`TextInput` في الدرس التالي، و`FlatList` و`SectionList` للقوائم، و`ActivityIndicator` للتحميل، و`Switch` لمفاتيح التبديل، و`Modal` للطبقات العائمة، و`KeyboardAvoidingView` للنماذج. كلٌّ منها يقابله component أصلي، فتبدو وتتصرّف كما تتصرّف عناصر المنصّة افتراضيًا.

في الدرس التالي ستجعل Trailhead تفاعليًا: أزرار تستجيب للمس، وحقول إدخال تتعامل مع الكتابة.
