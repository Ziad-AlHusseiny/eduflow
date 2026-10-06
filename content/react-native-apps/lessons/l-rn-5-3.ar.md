---
summary: اضبط هوية Trailhead وإصداراته، وأنشئ builds للتطوير والمعاينة والإنتاج باستخدام EAS Build، وأرسلها إلى TestFlight وGoogle Play باستخدام EAS Submit، واستعدّ لمراجعة المتاجر.
takeaways:
  - يترجم build الإصدار التطبيق الأصلي، ويجمّع كود JavaScript ويصغّره، ويوقّعه ببيانات اعتماد تثق بها المتاجر.
  - معرّف الحزمة (bundle identifier) في iOS واسم الحزمة (package name) في Android دائمان بعد النشر؛ فاخترهما بتأنٍّ.
  - "تصف الـ profiles في eas.json أنواع الـ builds: `development` لعميل التطوير الخاص بك، و`preview` للمختبِرين، و`production` للمتاجر."
  - "يرفع `eas submit` الـ build الإنتاجي إلى App Store Connect أو Google Play؛ ويحصل عليه المختبِرون عبر TestFlight أو مسار اختبار (testing track) قبل المراجعة."
  - معظم حالات الرفض الأولى تأتي من الانهيارات، أو نصوص أذونات مبهمة، أو تفاصيل خصوصية ناقصة، أو غياب حساب تجريبي في تطبيق يتطلّب تسجيل الدخول.
further:
  - title: EAS Build
    url: https://docs.expo.dev/build/introduction/
  - title: Configure EAS Build with eas.json
    url: https://docs.expo.dev/build/eas-json/
  - title: EAS Submit
    url: https://docs.expo.dev/submit/introduction/
  - title: App Store Review Guidelines
    url: https://developer.apple.com/app-store/review/guidelines/
quiz:
  - q: بعد أن أصبح Trailhead على الـ App Store، يريد زميل تغيير معرّف الحزمة في iOS ليطابق اسم شركة جديد. ماذا يحدث إن فعلت؟
    options:
      - text: يعامله المتجر بوصفه تطبيقًا جديدًا تمامًا، فلا يحصل المستخدمون الحاليون على التحديث، وتبقى مراجعاتك وتقييماتك مع الصفحة القديمة.
        why: صحيح. معرّف الحزمة (واسم الحزمة في Android) هو الهوية الدائمة للتطبيق في المتاجر.
      - text: يعيد الـ App Store تسمية الصفحة تلقائيًا بعد المراجعة.
        why: أسماء العرض يمكن أن تتغيّر؛ أما المعرّفات فلا. والمعرّف الجديد يعني تطبيقًا جديدًا.
      - text: لا شيء، ما دام رقم الإصدار يرتفع.
        why: الإصدارات ترتّب إصدارات التطبيق نفسه. والمعرّف المختلف ليس التطبيق نفسه.
    answer: 0
  - q: تريد أن يجرّب خمسة متنزّهين من ناديك Trailhead قبل أن يصل إلى المتاجر، مثبّتين إياه من رابط. أيّ build يناسب؟
    options:
      - text: build من نوع `development`، لأن فيه قائمة التطوير لإبداء الملاحظات.
        why: الـ development builds تحتاج إلى خادم Metro الخاص بك لتحميل JavaScript، فلا يستطيع المختبِرون استخدامها وحدهم.
      - text: build من نوع `production` يُثبَّت من الـ App Store.
        why: الـ production builds تمرّ بمراجعة المتجر والإطلاق العام؛ وهذه هي الخطوة التي تلي الاختبار.
      - text: Expo Go مع رمز QR الخاص بمشروعك.
        why: لا يستطيع Expo Go أن يضمّ الإعدادات الأصلية لـ Trailhead، مثل مخطّط الـ URL ونصوص الأذونات، وسيحتاج المختبِرون إلى خادم التطوير الخاص بك.
      - text: build من نوع `preview` مع توزيع داخلي، يُشارَك عبر الرابط الذي يعطيك إياه EAS.
        why: صحيح. التوزيع الداخلي مصمّم لهذا؛ وعلى iOS يجب تسجيل أجهزة المختبِرين أولًا للـ builds من نوع ad hoc.
    answer: 3
  - q: ما الذي يتولّاه `autoIncrement` في الـ production profile؟
    options:
      - text: يرفع الإصدار الظاهر للمستخدم، مثل 1.2.0 إلى 1.3.0، مع كل build.
        why: الإصدار الظاهر للمستخدم تختاره أنت؛ أما `autoIncrement` فيتولّى رقم البناء الداخلي.
      - text: يرفع رقم البناء في iOS ورمز الإصدار (version code) في Android مع كل build، وتشترط المتاجر أن يكونا فريدين.
        why: صحيح. كل رفع يحتاج إلى رقم بناء أعلى حتى حين يبقى الإصدار الظاهر كما هو.
      - text: يرفع إصدار Expo SDK مع كل build.
        why: ترقيات الـ SDK تغييرات مقصودة على اعتمادياتك، ولا تكون تلقائية أبدًا.
    answer: 1
---

حتى الآن عمل Trailhead عبر Expo Go والـ development builds، مع حاسوبك المحمول يقدّم كود JavaScript. أما المستخدمون الحقيقيون فيحتاجون إلى شيء آخر: تطبيق يُثبَّت من متجر، ويبدأ دون خادم تطوير، وموقَّع بحيث يثق به هاتفهم. يصنع **EAS Build** هذه الـ builds في السحابة، فلا تحتاج إلى Mac من أجل iOS، ويرفعها **EAS Submit** إلى المتاجر.

## الهوية والإصدارات في app.json

قبل أول build، احسم بضعة حقول:

```json title=app.json
{
  "expo": {
    "name": "Trailhead",
    "slug": "trailhead",
    "version": "1.0.0",
    "scheme": "trailhead",
    "icon": "./assets/images/icon.png",
    "ios": { "bundleIdentifier": "com.example.trailhead" },
    "android": { "package": "com.example.trailhead" }
  }
}
```

**معرّف الحزمة** (bundle identifier في iOS) و**اسم الحزمة** (package name في Android) هما الهوية الدائمة لتطبيقك في المتاجر. غيّرهما بعد النشر فيرى المتجر تطبيقًا مختلفًا: لا تحديثات للمستخدمين الحاليين، ولا انتقال للمراجعات. استخدم نطاقًا معكوسًا تملكه.

هناك نوعان من الإصدارات. `version` هو ما يراه المستخدمون ("1.0.0")؛ وترفعه مع كل إصدار عام. وكل رفع يحتاج أيضًا إلى رقم داخلي فريد ومتزايد (رقم البناء في iOS، ورمز الإصدار في Android). دع EAS يدير هذه الأرقام نيابةً عنك، كما سترى أدناه.

## الـ build profiles

ثبّت الـ CLI، وسجّل الدخول إلى حساب Expo، وولّد ملف الإعدادات:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

هذا ينشئ `eas.json` بثلاثة profiles:

```json title=eas.json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  },
  "submit": { "production": {} }
}
```

- **development** يبني عميل التطوير الخاص بك (الـ development build من القسم 1)، مع قائمة التطوير، ويحمّل JavaScript من Metro.
- **preview** يبني تطبيقًا مستقلًا للمختبِرين، يُثبَّت من رابط أو رمز QR (توزيع داخلي). وعلى iOS يجب أولًا تسجيل أجهزة المختبِرين باستخدام `eas device:create`، لأن هذه builds من نوع ad hoc.
- **production** يبني للمتاجر. ومع `appVersionSource: "remote"` و`autoIncrement`، يخزّن EAS رقم البناء ويرفعه مع كل production build.

ثم ابنِ:

```bash
eas build --platform android --profile preview
eas build --platform all --profile production
```

يعمل البناء على خوادم EAS؛ ويطبع الـ CLI رابطًا إلى السجلّات، وفي النهاية رابطًا إلى الـ build نفسه.

:::figure من الكود المصدري إلى المتاجر
<svg viewBox="0 0 690 220" role="img" aria-labelledby="t1">
  <title id="t1">يمرّ الكود المصدري عبر eas build ليصبح ملفًا تنفيذيًا موقّعًا. تذهب builds المعاينة إلى المختبِرين عبر رابط. وتمرّ builds الإنتاج عبر eas submit إلى TestFlight أو مسار اختبار في Google Play، ثم مراجعة المتجر، ثم الإطلاق.</title>
  <rect class="d-box" x="10" y="80" width="100" height="56" rx="10"/>
  <text class="d-label-strong" x="60" y="113" text-anchor="middle">الكود</text>
  <path class="d-arrow" d="M110 108 L150 108" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="155" y="80" width="120" height="56" rx="10"/>
  <text class="d-code" x="215" y="113" text-anchor="middle">eas build</text>
  <path class="d-arrow" d="M275 95 L330 45" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="335" y="18" width="150" height="50" rx="10"/>
  <text class="d-label" x="410" y="48" text-anchor="middle">preview للمختبِرين</text>
  <path class="d-arrow" d="M275 120 L330 160" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="335" y="140" width="120" height="50" rx="10"/>
  <text class="d-code" x="395" y="170" text-anchor="middle">eas submit</text>
  <path class="d-arrow" d="M455 165 L490 165" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="495" y="140" width="85" height="50" rx="10"/>
  <text class="d-label" x="537" y="162" text-anchor="middle">TestFlight</text>
  <text class="d-label" x="537" y="180" text-anchor="middle">/ track</text>
  <path class="d-arrow" d="M580 165 L605 165" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="610" y="140" width="75" height="50" rx="10"/>
  <text class="d-label" x="647" y="162" text-anchor="middle">المراجعة</text>
  <text class="d-label" x="647" y="180" text-anchor="middle">ثم الإطلاق</text>
</svg>
:::

## بيانات الاعتماد

كل build قابل للتثبيت يكون **موقَّعًا**. يحتاج iOS إلى شهادة توزيع (distribution certificate) وملف تجهيز (provisioning profile)؛ ويحتاج Android إلى upload keystore. يستطيع EAS توليدها وتخزينها وإعادة استخدامها مع كل build؛ ويسألك الـ CLI في المرة الأولى. ولـ iOS تحتاج إلى عضوية مدفوعة في Apple Developer Program؛ ولـ Google Play إلى رسم تسجيل مطوّر يُدفع مرة واحدة. وتعامل مع الـ keystore الخاص بـ Android بحرص: EAS يحتفظ به لك، لكن إن أدرته بنفسك وأضعته، يصبح تحديث التطبيق مؤلمًا.

## الإرسال إلى المتاجر

أنشئ أولًا سجلّ التطبيق في App Store Connect وفي Google Play Console. ثم ارفع آخر production build:

```bash
eas submit --platform ios
eas submit --platform android
```

على iOS يذهب الـ build إلى App Store Connect، حيث يصبح متاحًا في **TestFlight** للمختبِرين بعد المعالجة. وعلى Android يصل إلى مسار اختبار (الداخلي افتراضيًا)؛ ويحتاج EAS إلى مفتاح حساب خدمة (service account) من Google ليرفعه نيابةً عنك. ويمكنك الجمع بين الخطوتين باستخدام `eas build --auto-submit`.

:::tip اختبر الـ build الإنتاجي، لا build التطوير فقط
builds الإصدار تتصرّف بشكل مختلف: لا قائمة تطوير، وكود مصغّر، ونصوص أذونات حقيقية، ولا Metro يغطّي على ملف مفقود. ثبّت build من TestFlight أو من المسار الداخلي على هاتف حقيقي، وامشِ عبر المسارات الرئيسية قبل أن تضغط زرّ الإطلاق.
:::

## اجتياز المراجعة

يراجع المتجران التطبيقات، وApple أكثر صرامة. ستملأ صفحة المتجر (الاسم، والوصف، ولقطات الشاشة لأحجام الأجهزة المطلوبة)، ورابط سياسة الخصوصية، وتفاصيل الخصوصية: قسم App Privacy لدى Apple ونموذج Data safety لدى Google Play، ويجب أن يطابقا ما يجمعه Trailhead فعلًا، مثل الموقع والصور.

:::mistake الإرسال دون طريقة يدخل بها المراجِع
يتطلّب Trailhead حسابًا. وإن لم يستطع المراجِع تسجيل الدخول، يُرفض التطبيق، مهما كان مصقولًا. قدّم حسابًا تجريبيًا في ملاحظات المراجعة. أما حالات الرفض الشائعة الأخرى في المرة الأولى: انهيارات عند التشغيل، وأوصاف أذونات لا تذكر السبب، وميزات لا تعمل، مثل روابط معطوبة أو شاشات مؤقتة فارغة.
:::

تستغرق المراجعات عادةً من بضع ساعات إلى يومين. وبعد الموافقة، تختار أنت متى تطلق. ثم تتكرّر الدورة مع كل تغيير أصلي: إصدار جديد، ثم build، ثم إرسال، ثم مراجعة. أما الإصلاحات التي تقتصر على JavaScript فلها طريق أسرع، وهو موضوع الدرس الأخير.
