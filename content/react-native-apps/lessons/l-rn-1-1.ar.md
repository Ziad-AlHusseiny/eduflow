---
kind: intro
summary: اشرح كيف يحوّل تطبيق React Native الـ components التي تكتبها إلى views حقيقية على iOS وAndroid، وما الذي غيّرته الـ New Architecture في هذا المسار.
takeaways:
  - يرسم React Native عناصر واجهة أصلية حقيقية مثل UIView على iOS وandroid.view.View على Android؛ فلا متصفّح ولا DOM.
  - يعمل كود JavaScript في محرّك Hermes على thread خاص به، بينما يرسم الـ UI thread الخاص بالمنصّة البكسلات ويستقبل اللمسات.
  - الـ New Architecture (أي JSI ومُصيِّر Fabric والـ TurboModules) هي المعمارية الوحيدة منذ React Native 0.82.
  - معرفتك بـ React تنتقل كما هي؛ والذي يتغيّر هو مجموعة العناصر الأساسية والتنسيق والتنقّل وطريقة الإطلاق.
further:
  - title: Core Components and Native Components
    url: https://reactnative.dev/docs/intro-react-native-components
  - title: About the New Architecture
    url: https://reactnative.dev/architecture/landing-page
quiz:
  - q: يقول زميلك إن «React Native مجرد WebView بواجهة برمجية أجمل». ما التصحيح الأدق؟
    options:
      - text: إنه يرسم HTML، لكنه يحوّله إلى كود أصلي مسبقًا قبل التشغيل.
        why: لا يوجد HTML في أي مرحلة. أنت تكتب components من React مثل `<View>` و`<Text>`، ولا تكتب `<div>` أبدًا.
      - text: الـ components التي تكتبها تصبح views حقيقية من المنصّة؛ JavaScript تصف الواجهة والكود الأصلي يرسمها.
        why: صحيح. مُصيِّر React Native ينشئ الـ native views ويحدّثها، ولهذا يبدو التمرير وإدخال النص كما في أي تطبيق آخر.
      - text: يستخدم WebView على Android وviews أصلية على iOS.
        why: المنصّتان تحصلان على views أصلية. Android ليس هدفًا من الدرجة الثانية يعتمد على متصفّح كحلّ احتياطي.
    answer: 1
  - q: يشغّل Trailhead حلقة تكرار ثقيلة في JavaScript لمدة ثانيتين. ما الذي سيلاحظه المستخدم على الأرجح؟
    options:
      - text: لا شيء، لأن JavaScript تعمل على الـ UI thread ولها الأولوية.
        why: JavaScript لا تعمل على الـ UI thread. وهذا الفصل بالذات هو ما يجعلها قادرة على التأخّر دون أن يلاحظ نظام التشغيل.
      - text: ينهار التطبيق فورًا بخطأ نفاد الذاكرة.
        why: الحلقة الطويلة تحجب التنفيذ، ولا تحجز ذاكرة بلا حدود. سترى تجمّدًا، لا انهيارًا.
      - text: تتوقّف الاستجابة للمسات والتحديثات التي تقودها JavaScript حتى تنتهي الحلقة، مع أن نظام التشغيل يُبقي التطبيق حيًّا.
        why: صحيح. الـ JS thread مشغول، فلا يستطيع الاستجابة للأحداث أو جدولة عمليات render. أما العمل الذي يقوده الكود الأصلي، مثل التمرير الذاتي لـ ScrollView، فقد يستمر.
    answer: 2
  - q: ما الذي يمنحك إياه JSI، وهو جزء من الـ New Architecture؟
    options:
      - text: استدعاءات مباشرة بين JavaScript وC++ دون تحويل كل رسالة إلى JSON.
        why: صحيح. كان الـ bridge القديم يجمع رسائل JSON ويرسلها بشكل غير متزامن؛ أما JSI فيتيح لـ JavaScript الاحتفاظ بمراجع لكائنات أصلية واستدعاءها مباشرة.
      - text: طريقة لكتابة الواجهة بـ Swift وKotlin بدلًا من JSX.
        why: ما زلت تكتب الواجهة بـ React. JSI طبقة توصيل تحت السطح، ونادرًا ما تتعامل معها بنفسك.
      - text: محرّك JavaScript يحلّ محلّ Hermes.
        why: ما زال Hermes هو المحرّك. JSI هي الواجهة التي تكشفها المحرّكات للكود الأصلي، وليست محرّكًا.
    answer: 0
---

افتح تطبيق Notes على هاتفك واسحب إصبعك نزولًا على قائمة طويلة. الارتداد عند أعلى القائمة، وطريقة ظهور مقابض تحديد النص، والتمرير الذي يواصل الانزلاق بعد أن ترفع إصبعك: كل ذلك من كود نظام التشغيل نفسه. ووعد React Native أن يحصل تطبيقك على السلوك نفسه، لأنه يستخدم الـ views نفسها.

نبني في هذه الدورة **Trailhead**، وهو سجلّ لرحلات المشي. في النهاية سيكون لديك قائمة بالرحلات السابقة، وشاشات لتفاصيل كل درب، ونموذج لتسجيل رحلة جديدة، وتتبّع بالـ GPS، وصور، وتذكيرات، وتخزين دون اتصال، وbuild يعمل على هاتف حقيقي. وكل درس يضيف قطعة واحدة.

## عناصر أصلية تصفها React

على الويب، تحوّل React الـ components إلى عُقد DOM، ثم يرسمها المتصفّح. أما React Native فيستبدل الطبقة السفلى. أنت تكتب components باستخدام `<View>` و`<Text>` و`<Image>`؛ وتحسب React ما الذي تغيّر؛ ثم يُنشئ مُصيِّر React Native الـ **native views** (عناصر الواجهة الأصلية للمنصّة) أو يحدّثها: `UIView` على iOS، و`android.view.View` على Android.

```tsx title=src/app/index.tsx
import { Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Trailhead</Text>
    </View>
  );
}
```

لا HTML، ولا ملف CSS، ولا DOM. كائن `style` يشبه CSS، وهذا مقصود، لكنه كائن JavaScript يقرؤه محرّك التخطيط في React Native (واسمه Yoga) ليحدّد أماكن الـ native views.

:::figure من الـ component إلى البكسلات
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">الـ components تعمل في Hermes على الـ JS thread؛ تحسب React التغييرات؛ ويستخدم مُصيِّر Fabric واجهة JSI لإنشاء native views يرسمها الـ UI thread على iOS وAndroid.</title>
  <rect class="d-box-primary" x="20" y="30" width="190" height="80" rx="12"/>
  <text class="d-label-strong" x="115" y="62" text-anchor="middle">الـ components</text>
  <text class="d-label-muted" x="115" y="88" text-anchor="middle">JS thread · Hermes</text>
  <path class="d-arrow" d="M210 70 L270 70" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="275" y="30" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="360" y="62" text-anchor="middle">مُصيِّر Fabric</text>
  <text class="d-label-muted" x="360" y="88" text-anchor="middle">C++ عبر JSI</text>
  <path class="d-arrow" d="M445 70 L505 70" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="510" y="30" width="150" height="80" rx="12"/>
  <text class="d-label-strong" x="585" y="62" text-anchor="middle">Native views</text>
  <text class="d-label-muted" x="585" y="88" text-anchor="middle">UI thread</text>
  <rect class="d-box" x="450" y="160" width="100" height="50" rx="10"/>
  <text class="d-label" x="500" y="190" text-anchor="middle">iOS</text>
  <rect class="d-box" x="570" y="160" width="100" height="50" rx="10"/>
  <text class="d-label" x="620" y="190" text-anchor="middle">Android</text>
  <path class="d-line" d="M585 110 L500 160"/>
  <path class="d-line" d="M585 110 L620 160"/>
  <text class="d-label-muted" x="115" y="150" text-anchor="middle">أحداث اللمس تعود</text>
  <path class="d-arrow d-dashed" d="M510 100 L210 135" marker-end="url(#arrow)"/>
</svg>
:::

## خيطان (threads) يهمّانك

يعمل كود JavaScript في **Hermes**، وهو محرّك JavaScript صُمّم لـ React Native، على thread خاص به. أما **الـ UI thread** الخاص بالمنصّة فيرسم الـ views ويستقبل اللمسات. وفصلهما هو ما يجعل التمرير الأصلي سلسًا بينما يعمل كودك، وهو أيضًا ما يجعل الأزرار تبدو ميتة عندما تشغّل حلقة تكرار متزامنة طويلة في JavaScript: اللمسة تصل، لكن لا أحد متفرّغ لمعالجتها.

ستعود إلى هذا في درس الأداء. أما الآن فتذكّر القاعدة العملية: أبقِ الـ JS thread متفرّغًا أثناء الإيماءات والحركات.

## الـ New Architecture باختصار

لسنوات، كانت JavaScript والكود الأصلي يتواصلان عبر «جسر» (bridge) يحوّل الرسائل إلى JSON ويرسلها على دفعات. ثم حلّت محلّه **الـ New Architecture** (المعمارية الجديدة):

- **JSI** تتيح لـ JavaScript استدعاء C++ مباشرة والاحتفاظ بمراجع لكائنات أصلية.
- **Fabric** هو المُصيِّر (renderer) الجديد، مكتوب بـ C++ ومشترك بين المنصّتين.
- **الـ TurboModules** وحدات أصلية (الكاميرا، التخزين، المستشعرات) تُحمَّل عند الحاجة، أي عند أول استخدام.

أصبحت المعمارية الافتراضية في React Native 0.76، والخيار الوحيد بدءًا من 0.82. لن تضبط أيًّا منها بنفسك؛ فمشاريع Expo تستخدمها مباشرة. لكنها تهمّ عند اختيار المكتبات: أي مكتبة تثبّتها يجب أن تدعمها، والمكتبات التي تخضع للصيانة تدعمها.

:::why لماذا يهمّك هذا
حين تقرأ مقالًا من 2021 يتحدّث عن «الـ bridge» أو «حركة المرور عبر الـ bridge»، فهو يصف معمارية لم تعد في تطبيقك. تحقّق من التاريخ قبل أن تنسخ نصيحة عن الأداء.
:::

## ما الذي ينتقل من React وما الذي لا ينتقل

الـ components والـ props والـ state والـ hooks والـ context والـ keys: كلها كما هي. وميزات React 19 تعمل أيضًا. ما يتغيّر هو كل ما يحيط بـ React: العناصر الأساسية (`View` بدلًا من `div`)، والتنسيق (لا cascade، وflexbox يبدأ بالاتجاه العمودي)، والتنقّل (stacks وtabs بدلًا من عناوين URL في شريط)، وواجهات الجهاز (أذونات قد يرفضها المستخدم)، والإطلاق (مراجعة المتجر بدلًا من deploy).

في الدرس التالي ستنشئ مشروع Trailhead باستخدام Expo وتشغّله على هاتفك.
