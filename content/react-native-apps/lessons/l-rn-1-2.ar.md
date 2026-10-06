---
summary: أنشئ مشروع Trailhead باستخدام create-expo-app، وشغّله على هاتفك وعلى محاكٍ، وأضف المكتبات بأمان، واعرف متى يتوقّف Expo Go عن أن يكون كافيًا.
takeaways:
  - "`npx create-expo-app@latest` ينشئ مشروع TypeScript مع Expo Router ومسارات مبنية على الملفات داخل `src/app`."
  - "`npx expo start` يشغّل خادم التطوير Metro؛ امسح رمز QR بتطبيق Expo Go، أو اضغط `i` أو `a` لتشغيل محاكي iOS أو Android."
  - ثبّت المكتبات باستخدام `npx expo install`، فهو يختار الإصدار المتوافق مع إصدار Expo SDK في مشروعك.
  - Expo Go بيئة تعلّم تجريبية فيها مجموعة ثابتة من الوحدات الأصلية؛ أما الـ development build فهو تطبيقك أنت مع أدوات التطوير، والمشاريع الحقيقية تنتقل إليه مبكرًا.
further:
  - title: Create a project
    url: https://docs.expo.dev/get-started/create-a-project/
  - title: Start developing
    url: https://docs.expo.dev/get-started/start-developing/
  - title: Introduction to development builds
    url: https://docs.expo.dev/develop/development-builds/introduction/
quiz:
  - q: تحتاج إلى `expo-location` في Trailhead. أي أمر يجب أن تشغّل؟
    options:
      - text: "`npm install expo-location@latest`"
        why: قد يستهدف أحدث إصدار SDK أحدث من مشروعك، فيحدث عدم توافق في الكود الأصلي لا يظهر إلا وقت التشغيل.
      - text: "`npx expo install expo-location`"
        why: صحيح. يثبّت الإصدار المعروف أنه يعمل مع إصدار Expo SDK في مشروعك.
      - text: "`npx expo add-module expo-location`"
        why: لا يوجد أمر باسم `add-module`. الأمر الذي يجب أن تتذكّره هو `npx expo install`.
    answer: 1
  - q: أضاف Trailhead مكتبة فيها كود أصلي مخصّص ليس ضمن Expo Go. ما الخطوة التالية الصحيحة؟
    options:
      - text: الاستمرار في استخدام Expo Go وانتظار أن يحمّل الوحدة عبر الشبكة.
        why: لا يستطيع Expo Go تنزيل كود أصلي. وحداته الأصلية ثابتة منذ لحظة بنائه ونشره في المتاجر.
      - text: الخروج من Expo (eject) وصيانة مجلّدَي ios وandroid يدويًا.
        why: لا حاجة لذلك. مشاريع Expo يمكن أن تضمّ أي مكتبة أصلية؛ كل ما عليك أن تبني ملف تطبيقك الخاص.
      - text: إنشاء development build، إما محليًا باستخدام `npx expo run:ios` أو في السحابة باستخدام EAS Build.
        why: صحيح. الـ development build هو تطبيقك أنت بوحداتك الأصلية، إضافةً إلى أدوات التطوير التي كانت لديك في Expo Go.
    answer: 2
  - q: عدّلت نص العنوان في `src/app/index.tsx` وحفظت الملف. ماذا يحدث على الهاتف الذي يشغّل التطبيق؟
    options:
      - text: يُدخل Fast Refresh الكود الجديد ويحافظ على الـ state الخاصة بالـ components حيثما أمكن.
        why: صحيح. تغييرات JavaScript يُعاد تحميلها في مكانها في نحو ثانية؛ والتغييرات الأصلية وحدها تحتاج إلى build جديد.
      - text: لا شيء حتى تعيد بناء ملف التطبيق.
        why: إعادة البناء مطلوبة فقط للتغييرات الأصلية، مثل إضافة وحدات أصلية جديدة أو إعدادات في app.json تغيّر الملف التنفيذي.
      - text: يعيد التطبيق التشغيل من شاشة البداية ويفقد كل الـ state.
        why: هذه إعادة تحميل كاملة، ويمكنك تشغيلها بالضغط على `r`، لكن حفظ الملف يستخدم Fast Refresh.
    answer: 0
---

توصي وثائق React Native ببدء التطبيقات الجديدة باستخدام إطار عمل (framework)، والإطار الذي تشير إليه هو **Expo**. يمنحك Expo قالب المشروع، وخادم التطوير، ومكتبة من واجهات الجهاز (الكاميرا، الموقع، التخزين، الإشعارات) تعمل كلها مع إصدار SDK واحد، وخدمة سحابية للبناء والإطلاق. ويبقى بإمكانك كتابة كود أصلي حين تحتاج إليه؛ فأنت لست مقيّدًا.

## أنشئ Trailhead

تحتاج إلى Node.js (إصدار LTS نشط) وهاتف أو محاكٍ. ثم:

```bash
npx create-expo-app@latest trailhead
cd trailhead
npx expo start
```

يأتي القالب الافتراضي مع TypeScript و**Expo Router** (نظام التوجيه في Expo) مضبوطَين مسبقًا. هذه هي الأجزاء التي ستلمسها أولًا:

```text
trailhead/
  src/app/_layout.tsx    root layout: wraps every screen (navigation lives here)
  src/app/index.tsx      the first screen, at route "/"
  src/app/explore.tsx    a second example screen, at "/explore"
  assets/                icons, splash image, fonts
  app.json               app name, icons, bundle ids, plugin settings
  package.json           dependencies, including "expo" (the SDK version)
```

كل ملف داخل `src/app` يصبح شاشة. ستتعلّم كيف يعمل التوجيه في القسم 3؛ أما الآن فافتح `src/app/index.tsx`، وغيّر بعض النص، واحفظ.

## شغّله على جهاز

يشغّل `npx expo start` أداة **Metro**، وهي مُجمِّع (bundler) كود JavaScript، ويطبع رمز QR. أمامك ثلاث طرق للدخول:

- **هاتفك مع Expo Go.** ثبّت Expo Go من الـ App Store أو Play Store، ثم امسح رمز QR (بتطبيق الكاميرا على iOS، وبتطبيق Expo Go نفسه على Android). يجب أن يصل الهاتف والحاسوب أحدهما إلى الآخر عبر الشبكة.
- **محاكي iOS** (على macOS مع Xcode): اضغط `i` في الطرفية.
- **محاكي Android** (عبر Android Studio): اضغط `a`.

أثناء عمل Metro، تستحق بضعة مفاتيح أن تحفظها أصابعك: `r` يعيد تحميل التطبيق، و`m` يفتح قائمة التطوير داخل التطبيق، و`j` يفتح React Native DevTools. وحفظ أي ملف يشغّل **Fast Refresh**، الذي يُدخل الكود الجديد دون أن تفقد الـ components الـ state الخاصة بها.

:::tip جرّب على هاتف حقيقي مبكرًا
المحاكي يعمل على معالج حاسوبك المحمول، ويحاكي الكاميرا والـ GPS محاكاةً (أو لا يوفّرهما أصلًا)، ولا يعطيك إحساسًا بحجم هدف اللمس تحت إبهامك. لهذا السبب بالضبط تُبقي فرق كثيرة هاتف Android رخيصًا متوسط الفئة في متناول اليد: فهو يكشف الإطارات البطيئة التي يخفيها حاسوبك.
:::

## إضافة المكتبات على طريقة Expo

كل إصدار من Expo SDK يستهدف إصدارًا واحدًا من React Native، والمكتبات الأصلية يجب أن تتوافق معه. لذا، بدلًا من `npm install`، تضيف المكتبات هكذا:

```bash
npx expo install expo-location expo-image-picker
```

يبحث `npx expo install` عن الإصدار المعروف أنه يعمل مع الـ SDK لديك ويثبّته. أما حزم JavaScript الخالصة (مكتبة للتواريخ مثلًا) فيمرّرها إلى مدير الحزم لديك، لذا يمكنك استخدامه لكل شيء.

وحين تشعر أن شيئًا ليس على ما يرام بعد ترقية، شغّل فحص السلامة:

```bash
npx expo-doctor
```

يُبلغك عن الإصدارات غير المتوافقة، والوحدات الأصلية المكرّرة، ومشكلات الإعداد.

:::mistake تثبيت أحدث إصدار من مكتبة أصلية
قد يجلب `npm install react-native-something@latest` إصدارًا مبنيًّا لإصدار React Native أحدث من الذي يستخدمه مشروعك. سيُترجَم كود JavaScript دون مشكلة، ثم ينهار التطبيق حين يستدعي الكود الأصلي. استخدم `npx expo install` ودعه يختار.
:::

## Expo Go مقابل الـ development build

**Expo Go** تطبيق من المتجر فيه مجموعة ثابتة من الوحدات الأصلية المدمجة: الـ Expo SDK وعدد قليل من المكتبات الشائعة. ويُحمَّل كود JavaScript الخاص بك داخله. هذا مثالي للتعلّم، وهو السبب في أنك استطعت تشغيل Trailhead بعد ثوانٍ من إنشائه.

لكن حدوده تظهر بسرعة في المشاريع الحقيقية:

- لا يستطيع أن يضمّ إلا الكود الأصلي الذي تُرجم داخله. أي مكتبة خارج تلك المجموعة لن تعمل.
- يدعم إصدار SDK واحدًا في كل مرة (الأحدث عادةً)، فقد لا يفتح فيه مشروع قديم.
- بعض الميزات تحتاج إلى هوية تطبيقك الخاصة، مثل الإشعارات الفورية (push notifications) ومخطّطات الروابط المخصّصة (custom URL schemes).

الـ **development build** (نسخة التطوير) هو تطبيقك أنت، باسم تطبيقك وأيقونته ومعرّف الحزمة (bundle identifier) ووحداته الأصلية، إضافةً إلى أدوات التطوير نفسها (Fast Refresh، قائمة التطوير، DevTools). تنشئه محليًا:

```bash
npx expo run:ios
npx expo run:android
```

أو في السحابة، دون Xcode أو Android Studio على جهازك، باستخدام EAS Build (القسم 5). بعد ذلك، يقدّم `npx expo start` كود JavaScript إلى الـ development build تمامًا كما كان يقدّمه إلى Expo Go.

القاعدة المعقولة: تعلّم وابنِ النماذج الأولية في Expo Go، ثم انتقل إلى development build في أول مرة تحتاج فيها إلى شيء لا يملكه Expo Go. في Trailhead ستبقى في Expo Go حتى القسم 4.

## تغييرات JavaScript مقابل التغييرات الأصلية

هذا التمييز يمتد على طول الدورة، فلنسمّه الآن. **تغييرات JavaScript** (الـ components، التنسيقات، المنطق) تصل إلى التطبيق العامل عبر Fast Refresh أثناء التطوير، ولاحقًا عبر التحديثات عبر الهواء (over-the-air) في بيئة الإنتاج. أما **التغييرات الأصلية** (إضافة وحدة أصلية، أو تغيير نص الأذونات، أو أيقونة التطبيق، أو معرّف الحزمة في `app.json`) فتحتاج إلى ملف تطبيق جديد. وحين «لا يظهر» تغيير ما، اسأل نفسك: من أي نوع كان؟

في الدرس التالي ستستبدل الشاشة التجريبية في القالب بأول واجهة حقيقية لـ Trailhead، مستخدمًا الـ components الأساسية في React Native.
