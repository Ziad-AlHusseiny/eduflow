---
summary: تتبّع مسار الرحلة باستخدام expo-location، وأرفق صور الدروب باستخدام expo-image-picker، وجدول تذكيرًا باستخدام expo-notifications، مع تنظيف الاشتراكات وتصفية بيانات GPS المشوّشة.
takeaways:
  - "يبثّ `watchPositionAsync` المواقع حتى تستدعي `remove()` على الاشتراك (subscription) الذي يُرجعه، لذا أزله في دالة التنظيف الخاصة بالـ effect."
  - الدقّة وفترات التحديث تقايض الضبط بالبطارية؛ اختر أقل الإعدادات دقّةً تتحمّلها الميزة.
  - قراءات GPS مشوّشة، فأسقط النقاط ضعيفة الدقّة قبل حساب المسافة.
  - يُرجع expo-image-picker القيمة `canceled` ومصفوفة `assets`؛ والملفات المختارة تبدأ في مجلّد مؤقت، فانسخ أي شيء تريد الاحتفاظ به.
  - الإشعارات المحلية تُجدوَل على الجهاز بمُطلِق (trigger)، ويمكن أن تحمل `data` المسار الذي يُفتح حين ينقر المستخدم عليها.
further:
  - title: Location
    url: https://docs.expo.dev/versions/latest/sdk/location/
  - title: ImagePicker
    url: https://docs.expo.dev/versions/latest/sdk/imagepicker/
  - title: Notifications
    url: https://docs.expo.dev/versions/latest/sdk/notifications/
quiz:
  - q: تستدعي شاشة التتبّع في Trailhead الدالة `watchPositionAsync` داخل effect لكنها لا تخزّن النتيجة أبدًا. ماذا يحدث بعد أن يغادر المستخدم الشاشة؟
    options:
      - text: يتوقّف الاشتراك تلقائيًا حين يُزال الـ component.
        why: الاشتراكات الأصلية لا تعرف شيئًا عن الـ component الخاص بك. وحده `remove()` يوقفها.
      - text: ينهار التطبيق في المرة التالية التي يصل فيها موقع.
        why: الـ callback ما زال يعمل؛ وكل ما في الأمر أن React تتجاهل تحديثات الـ state للشاشة المُزالة. إنه تسرّب صامت، لا انهيار.
      - text: لا شيء، لأن الموقع لا يتحدّث إلا ما دامت الشاشة ظاهرة.
        why: موقع المقدّمة يستمر في التحديث ما دام التطبيق مفتوحًا، أيًّا كانت الشاشة المعروضة.
      - text: يستمر الـ GPS في العمل واستنزاف البطارية، لأن أحدًا لم يستدعِ `remove()` على الاشتراك.
        why: صحيح. خزّن الاشتراك واستدعِ `subscription.remove()` في دالة التنظيف الخاصة بالـ effect.
    answer: 3
  - q: في مسار مسجّل، تقفز نقطة واحدة 400 متر جانبًا بينما كان المتنزّه واقفًا تحت الأشجار. ما أفضل ردّ في الكود؟
    options:
      - text: اطلب `Accuracy.BestForNavigation` حتى لا يخطئ الـ GPS أبدًا.
        why: إعدادات الدقّة الأعلى تقلّل الخطأ لكنها لا تلغيه، وتكلّف بطارية أكثر.
      - text: تجاهل النقاط التي تكون قيمة `coords.accuracy` المبلَّغ عنها فيها أسوأ من حدّ معيّن، مثل 25 مترًا، قبل إضافتها إلى المسار.
        why: صحيح. كل قراءة تُبلغ عن نصف قطر عدم اليقين الخاص بها؛ وتصفية القراءات السيئة تُبقي المسار والمسافة صادقين.
      - text: قرّب كل الإحداثيات إلى منزلتين عشريتين.
        why: منزلتان عشريتان من خط العرض تعنيان دقّة بنحو 1 km، وهذا يدمّر المسار.
    answer: 1
  - q: "بعد `launchImageLibraryAsync`، يتراجع المستخدم دون أن يختار شيئًا. ماذا يرى كودك؟"
    options:
      - text: يُرفض الـ promise بخطأ "cancelled".
        why: الإلغاء ليس خطأ. يُحَلّ الـ promise بشكل طبيعي.
      - text: لا يُحَلّ الـ promise أبدًا.
        why: يُحَلّ فور إغلاق أداة الاختيار، أيًّا كان ما فعله المستخدم.
      - text: "نتيجة فيها `canceled: true` ولا assets، وينبغي أن تتعامل معها بألّا تفعل شيئًا."
        why: صحيح. تحقّق بـ `if (result.canceled) return;` قبل قراءة `result.assets[0].uri`.
    answer: 2
---

ثلاث ميزات من الجهاز تجعل Trailhead أكثر من مجرّد قائمة: المسار الذي مشيته، والصور التي التقطتها، وتنبيه لطيف في نهاية اليوم لتسجيل الرحلة التي نسيتها. تستخدم هذه الميزات ثلاث وحدات من Expo بينها الكثير من القواسم المشتركة: كلٌّ منها يحتاج إلى إذن (يُطلب بالطريقة التي عرضها الدرس السابق)، وكلٌّ منها يُرجع بيانات ستخزّنها بالأدوات التي تعلّمتها قبل درسين، ولكلٍّ منها تفصيلة واحدة تؤذيك إن تجاهلتها.

## تتبّع المسار

يعطيك `getCurrentPositionAsync` قراءة واحدة، وهذا يكفي لوسم نقطة بداية الرحلة. أما التتبّع فيحتاج إلى بثّ متواصل: يستدعي `watchPositionAsync` دالتك مع كل موقع جديد، ويُرجع **اشتراكًا** (subscription) يُبقي الـ GPS يعمل حتى تزيله.

```tsx title=src/hooks/useRoute.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type Point = { latitude: number; longitude: number; accuracy: number | null; timestamp: number };

export function useRoute(active: boolean) {
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (!active) return;
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
      ({ coords, timestamp }) => {
        setPoints((prev) => [...prev, { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, timestamp }]);
      },
    ).then((sub) => {
      if (cancelled) sub.remove();
      else subscription = sub;
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [active]);

  return points;
}
```

تعالج العلامة `cancelled` حالة سباق دقيقة: الاشتراك يصل بشكل غير متزامن، فإن أُزيلت الشاشة قبل أن يُحَلّ الـ promise، لا تجد دالة التنظيف شيئًا تزيله بعد. والعلامة تجعل الاشتراك المتأخّر يزيل نفسه.

إلحاق العناصر بمصفوفة في الـ state مع كل قراءة لا بأس به لبضعة آلاف من النقاط، وهذا يغطّي رحلة نهارية طويلة. أما للمسارات متعدّدة الأيام، فاكتب النقاط إلى SQLite على دفعات واحتفظ في الذاكرة بالحديثة منها فقط، حتى لا ينسخ تحديث state واحد عشرات الآلاف من الكائنات.

الخيارات ميزانية للبطارية. يطلب `Accuracy.High` دقّة بنحو عشرة أمتار؛ و`Balanced` بنحو مئة متر وأرخص بكثير. و`distanceInterval: 10` تعني «لا تستدعِني إلا بعد التحرّك عشرة أمتار»، و`timeInterval` يحدّد سقف التكرار على Android. مسار المشي يحتاج إلى دقّة عالية، لكنه لا يحتاج إلى نقطة كل ثانية.

:::mistake الثقة بكل قراءة GPS
تحت الأشجار، وفي الأودية، وبجوار المنحدرات الصخرية، تتيه قراءات الـ GPS. كل `coords.accuracy` هي نصف قطر عدم اليقين بالأمتار، وقراءة واحدة بدقّة 80 مترًا يمكن أن تضيف مئات الأمتار من المسافة الزائفة بينما يتعرّج المسار. أسقط القراءات التي تتجاوز حدًّا معيّنًا (25 مترًا يناسب المشي) قبل حساب المسافة أو رسم الخط. وهذا تمرين هذا الدرس.
:::

التتبّع والشاشة مقفلة يحتاج إلى موقع في الخلفية ومهمّة (task) مسجّلة عبر `expo-task-manager`، إضافةً إلى الإذن الإضافي والتدقيق في المراجعة اللذين تحدّث عنهما الدرس السابق. أطلق التتبّع في المقدّمة أولًا؛ فكثير من المتنزّهين يُبقون الشاشة مضاءة لرؤية الخريطة على أي حال.

## صور الدروب

للصور، يفتح `expo-image-picker` واجهة مكتبة الصور أو الكاميرا الخاصة بالنظام نفسه، وهي مألوفة للمستخدمين وتتولّى التحرير نيابةً عنك:

```tsx
import * as ImagePicker from 'expo-image-picker';

async function addPhoto(fromCamera: boolean) {
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7, allowsEditing: true };

  if (fromCamera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
  }

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled) return;
  const uri = result.assets[0].uri;
  // copy into the app's document directory, then save the new path on the hike
}
```

تضغط `quality: 0.7` صورة JPEG، وهذا مهم حين يكون للرحلة عشرون صورة. والإلغاء ليس خطأ: يُحَلّ الـ promise مع `canceled: true`. والـ `uri` المُرجَع يشير إلى مجلّد مؤقت قد يمسحه النظام، لذا انسخ الملف إلى مجلّد المستندات الخاص بتطبيقك باستخدام `expo-file-system` وخزّن ذلك المسار في SQLite، كما وصف درس التخزين. ومحاكي iOS ليس فيه كاميرا، فاختبر التقاط الصور على هاتف حقيقي.

وحين تحتاج إلى واجهة كاميرا خاصة بك، مثل مسح رموز QR على علامات الدروب، استخدم `expo-camera`، ففيه الـ component المسمّى `CameraView` الذي يعرض معاينة حيّة داخل تخطيطك.

## إشعار تذكير

المتنزّهون ينسون تسجيل رحلاتهم. وتذكير يومي في السابعة مساءً، فقط في الأيام التي فعّلوه فيها، هو إشعار محلي: يُجدوَل على الجهاز، دون أي خادم.

```ts title=src/lib/reminders.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function enableDailyReminder() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Hike reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Out on a trail today?', body: 'Log it while you remember the details.', data: { url: '/new-hike' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 0, channelId: 'reminders' },
  });
  return true;
}
```

يقرّر `setNotificationHandler` هل يظهر الإشعار بينما التطبيق مفتوح. وعلى Android، تنتمي الإشعارات إلى **قنوات** (channels) يستطيع المستخدمون كتم كلٍّ منها على حدة في الإعدادات، لذا أنشئ قناة باسم واضح. والإلغاء قبل الجدولة يتجنّب تكديس تذكيرات مكرّرة في كل مرة يُبدَّل فيها الإعداد.

وتؤتي `data.url` ثمارها مع Expo Router: في الـ root layout، استمع عبر `Notifications.addNotificationResponseReceivedListener`، واقرأ `response.notification.request.content.data.url`، واستدعِ `router.push(url)`. عندها يفتح النقر على التذكير نافذة إضافة الرحلة (الـ modal) مباشرة، عبر المسارات نفسها التي تستخدمها الـ deep links.

أما الإشعارات الفورية (**push**)، التي تُرسَل من خادم، فتحتاج إلى أكثر من ذلك: development build، وبيانات اعتماد لخدمات الإشعارات لدى Apple وGoogle (يديرها EAS)، وpush token يُرسَل إلى الـ backend الخاص بك. أما كود الجدولة والمعالجة الذي كتبته للتوّ فيبقى كما هو.

القسم 5 عن إيصال كل هذا إلى أيدي المستخدمين: تصحيح الأخطاء، والاختبار، والإطلاق.
