---
summary: اطلب الوصول إلى الموقع والكاميرا في اللحظة التي يكون فيها الطلب منطقيًا، وتعامل مع كل حالات الإذن بما فيها الرفض الدائم، واكتب أوصاف الاستخدام التي يشترطها iOS وتشترطها مراجعة المتاجر.
takeaways:
  - استجابات الأذونات لها `status` قيمتها undetermined أو granted أو denied، إضافةً إلى `canAskAgain`، التي تخبرك هل ما زال يمكن أن تظهر نافذة النظام.
  - اطلب الإذن حين يبدأ المستخدم الميزة التي تحتاج إليه، بعد شرح قصير في واجهتك أنت، ولا تطلق سيلًا من النوافذ عند التشغيل أبدًا.
  - بمجرد أن تصبح `canAskAgain` قيمتها false، لا يستطيع تغيير الإجابة إلا تطبيق الإعدادات في النظام، فقدّم زرًّا يستدعي `Linking.openSettings()`.
  - يشترط iOS وصفًا للاستخدام لكل إذن؛ اضبطها عبر خيارات الـ config plugins في app.json وأعد البناء.
  - أعِد التحقّق من الأذونات حين تستعيد الشاشة التركيز، لأن المستخدمين يغيّرونها في الإعدادات بينما تطبيقك في الخلفية.
further:
  - title: Permissions
    url: https://docs.expo.dev/guides/permissions/
  - title: Location
    url: https://docs.expo.dev/versions/latest/sdk/location/
  - title: Linking
    url: https://reactnative.dev/docs/linking
quiz:
  - q: "يطلب Trailhead الموقع في أول تشغيل للتطبيق، قبل أن يرى المستخدم أي شيء. على iOS، ينقر كثير من المستخدمين على Don't Allow. لماذا يهمّ هذا إلى هذا الحد؟"
    options:
      - text: يُرفض التطبيق في الـ App Store لأنه يطلب الإذن عند التشغيل.
        why: الطلب عند التشغيل لا يعني الرفض تلقائيًا. الكلفة الحقيقية تقع على مستخدميك وميزاتك.
      - text: بعد الرفض، لا يعرض iOS نافذة النظام مرة أخرى؛ ولا يغيّرها إلا تطبيق الإعدادات، فتصبح ميزة التتبّع عمليًا مفقودة لهؤلاء المستخدمين.
        why: صحيح. تحصل على نافذة نظام واحدة لكل إذن على iOS، فاستخدمها حين يفهم المستخدم السبب.
      - text: الرفض عند التشغيل يرفض أيضًا أذونات الكاميرا والإشعارات.
        why: كل إذن يُجاب عنه على حدة. الضرر يقع على الموقع وحده، لكنه دائم.
    answer: 1
  - q: "استجابة الإذن هي `{ status: 'denied', granted: false, canAskAgain: false }`. ماذا يجب أن يفعل زرّ Start tracking؟"
    options:
      - text: يستدعي `requestForegroundPermissionsAsync()` مرة أخرى؛ فقد يكون المستخدم غيّر رأيه.
        why: مع `canAskAgain` بقيمة false، يُحَلّ الطلب فورًا بالرفض نفسه ولا تظهر أي نافذة.
      - text: يُخفي الزر نهائيًا.
        why: قد يريد المستخدم الميزة لاحقًا. وإخفاء الزر لا يترك له طريقًا للعودة.
      - text: يشرح أن الموقع مُطفأ لـ Trailhead ويقدّم زرًّا يفتح صفحة التطبيق في الإعدادات.
        why: صحيح. يأخذه `Linking.openSettings()` مباشرة إلى المفتاح الذي يحتاج إليه.
      - text: يبدأ التتبّع على أي حال ويعرض خطأ إن فشل.
        why: ستُرفض استدعاءات الموقع؛ وبدء ميزة تعرف أنها لا تعمل تجربة أسوأ من الشرح.
    answer: 2
  - q: غيّرت وصف استخدام الموقع في app.json، وأعدت التحميل بـ Fast Refresh، وما زال النص القديم يظهر في النافذة. لماذا؟
    options:
      - text: الوصف جزء من الإعدادات الأصلية للتطبيق، فلا يتغيّر إلا في build جديد.
        why: صحيح. نصوص الاستخدام تُترجَم إلى Info.plist؛ أعِد بناء الـ development build لتراها.
      - text: يخزّن iOS نص النافذة مؤقتًا لمدة 24 ساعة.
        why: لا يوجد تخزين مؤقت كهذا؛ النص يأتي من الملف التنفيذي المثبّت.
      - text: يجب ضبط الوصف في JavaScript باستخدام `Location.setDescription()`.
        why: لا توجد دالة كهذه. أوصاف الاستخدام إعدادات أصلية، لا استدعاءات وقت التشغيل.
    answer: 0
---

أفضل ميزة في Trailhead هي التتبّع الحيّ: ابدأ رحلة، فيسجّل التطبيق مسارك. يحتاج ذلك إلى موقع الهاتف، والهاتف لن يعطيه دون أن يسأل المستخدم. وهذا الطلب أكثر لحظة هشاشة في التطبيق. اسأل بطريقة سيئة فتخسر الميزة لدى ذلك المستخدم، وأحيانًا إلى الأبد.

## الحالات التي يمكن أن يكون فيها الإذن

كل وحدة في Expo تحتاج إلى إذن (الموقع، الكاميرا، مكتبة الوسائط، الإشعارات) تُرجع شكل الاستجابة نفسه:

```ts
{
  status: 'undetermined' | 'granted' | 'denied',
  granted: boolean,
  canAskAgain: boolean,
  expires: 'never' | number,
}
```

- **undetermined**: لم تسأل قط. والطلب سيعرض نافذة النظام.
- **granted**: تابع. وفي إصدارات iOS وAndroid الحديثة، قد يمنح المستخدمون الوصول مرة واحدة فقط (لهذه الجلسة)، أو الموقع التقريبي فقط، فكن مستعدًا لأن تسأل مرة أخرى في يوم آخر، وأن تتلقّى مواقع أقل دقّة.
- **denied مع `canAskAgain: true`**: Android بعد رفض واحد. يمكنك أن تسأل مرة أخرى، ويُفضَّل بعد شرح أفضل.
- **denied مع `canAskAgain: false`**: لن يعرض النظام النافذة مرة أخرى. على iOS هذه هي الحالة مباشرة بعد أول رفض؛ وعلى Android بعد أن يرفض المستخدم مرتين. ولا يستطيع تغييرها الآن إلا تطبيق الإعدادات.

:::figure إلى أين تقود كل حالة إذن
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">من حالة undetermined، يشرح التطبيق ثم يطلب. يمنح المستخدم الإذن أو يرفضه. المنح يقود إلى الميزة. والرفض مع canAskAgain بقيمة true يسمح بالطلب مجددًا؛ أما الرفض مع canAskAgain بقيمة false فلا يُغيَّر إلا بفتح الإعدادات.</title>
  <rect class="d-box" x="20" y="95" width="150" height="56" rx="12"/>
  <text class="d-label-strong" x="95" y="128" text-anchor="middle">undetermined</text>
  <path class="d-arrow" d="M170 123 L235 123" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="240" y="95" width="150" height="56" rx="12"/>
  <text class="d-label-strong" x="315" y="120" text-anchor="middle">اشرح، ثم</text>
  <text class="d-code" x="315" y="140" text-anchor="middle">request…()</text>
  <path class="d-arrow" d="M390 110 L470 55" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 140 L470 195" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="475" y="25" width="185" height="56" rx="12"/>
  <text class="d-label-strong" x="567" y="58" text-anchor="middle">granted: الميزة تعمل</text>
  <rect class="d-box-warn" x="475" y="165" width="185" height="70" rx="12"/>
  <text class="d-label-strong" x="567" y="192" text-anchor="middle">denied</text>
  <text class="d-label-muted" x="567" y="216" text-anchor="middle">canAskAgain?</text>
  <path class="d-arrow d-dashed" d="M475 185 C420 175 400 160 380 152" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="420" y="200" text-anchor="middle">نعم</text>
  <text class="d-label" x="567" y="135" text-anchor="middle">لا: افتح الإعدادات</text>
  <path class="d-line" d="M567 165 L567 145"/>
</svg>
:::

## اسأل في السياق، بعد أن تشرح

أسوأ نمط هو الذي تطلقه تطبيقات كثيرة: سلسلة من نوافذ النظام عند أول تشغيل، قبل أن يعرف المستخدم ما يفعله التطبيق. الناس يرفضون ما لا يفهمونه، وعلى iOS يكون ذلك الـ "Don't Allow" الأول دائمًا ما لم ينقّبوا في الإعدادات.

يطلب Trailhead الموقع حين ينقر المستخدم على **Start tracking**، وهي أول لحظة يرتبط فيها الطلب بوضوح بشيء يريده. وقبل نافذة النظام، يعرض شرحه القصير الخاص: "Trailhead records your route while you hike. Your location stays on this phone unless you sync." ثم يُطلق زرّ **Continue** الطلب الحقيقي. شاشتك أنت يمكن إغلاقها دون عواقب؛ أما نافذة النظام فلا.

والقاعدة نفسها تنطبق على كل إذن في التطبيق. اطلب الكاميرا حين ينقر المستخدم على **Add photo**، والإشعارات حين يفعّل التذكيرات، لا قبل ذلك. عندها يصل كل طلب وسببه ظاهر على الشاشة أصلًا، وترتفع نسب القبول بشكل ملحوظ.

```tsx title=src/hooks/useLocationPermission.ts
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

export function useLocationPermission() {
  const [permission, setPermission] = useState<Location.LocationPermissionResponse | null>(null);

  // Re-check whenever the screen regains focus: the user may have
  // changed the setting in the Settings app while Trailhead was in the background.
  useFocusEffect(
    useCallback(() => {
      Location.getForegroundPermissionsAsync().then(setPermission);
    }, []),
  );

  const request = useCallback(async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    setPermission(result);
    return result.granted;
  }, []);

  return { permission, request, openSettings: () => Linking.openSettings() };
}
```

ثم تقرأ شاشة التتبّع `permission` وتختار ما ترسمه: مؤشّر تحميل ما دامت `null`، والشرح مع زرّ Continue ما دام الطلب ممكنًا، ورسالة "Location is off for Trailhead" مع زرّ **Open Settings** بمجرد أن تصبح `canAskAgain` قيمتها false، والخريطة الحيّة بمجرد منح الإذن. وتحويل الاستجابة إلى واحد من هذه الأفعال الأربعة دالة نقية صغيرة، وهي تمرين هذا الدرس.

:::mistake الطلب من جديد بعد رفض دائم
استدعاء `requestForegroundPermissionsAsync()` حين تكون `canAskAgain` قيمتها false لا يعرض شيئًا، ويُحَلّ فورًا بالرفض نفسه. بالنسبة إلى المستخدم، الزر ببساطة لا يفعل شيئًا. تحقّق من `canAskAgain` أولًا وانتقل إلى مسار الإعدادات.
:::

## أوصاف الاستخدام والـ config plugins

يعرض iOS جملة من تطبيقك في كل نافذة إذن، ويرفض الـ App Store التطبيقات التي تكون أوصافها مفقودة أو مبهمة ("This app needs your location"). قل ما الذي تفعله الميزة بالبيانات. تضبط هذه النصوص عبر الـ **config plugin** الخاص بكل وحدة في `app.json`:

```json title=app.json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        { "locationWhenInUsePermission": "Trailhead records your route on the map while you track a hike." }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Trailhead lets you attach photos from your library to a hike.",
          "cameraPermission": "Trailhead lets you take trail photos to attach to a hike."
        }
      ]
    ]
  }
}
```

تكتب الـ config plugins الإعدادات الأصلية (ملف `Info.plist` في iOS، والـ manifest في Android) حين يُبنى التطبيق. وهذا يجعلها **تغييرات أصلية**: لن يطبّقها Fast Refresh، فأعِد بناء الـ development build بعد تعديلها. ويعرض Expo Go نصوصه العامة الخاصة، وهذا سبب إضافي لانتقال Trailhead الآن إلى development build.

## المقدّمة أولًا، والخلفية فقط عند الضرورة

تتبّع رحلة والشاشة مطفأة يحتاج إلى موقع في **الخلفية** (background)، وهو إذن منفصل وأكثر حساسية، له متطلّبات إضافية من المنصّتين ومراجعة أدقّ في المتجرين. ابدأ بالوصول في المقدّمة ("while using the app")، الذي يغطّي التتبّع ما دام Trailhead مفتوحًا. وأضف الوصول في الخلفية فقط حين يطلبه المستخدمون، مع شرح واضح للسبب، وتوقّع أن تطرح عليك المراجعة السؤال نفسه.

في الدرس التالي ستستخدم هذه الأذونات فعلًا: موقع المتنزّه، وصور الدروب، وإشعار تذكير.
