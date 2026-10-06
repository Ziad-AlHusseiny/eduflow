---
summary: اختر بين AsyncStorage وexpo-sqlite وexpo-secure-store لكل نوع من البيانات في Trailhead، واستخدم كلًّا منها بشكل صحيح، من التفضيلات إلى قاعدة بيانات الرحلات مع الـ migrations إلى token تسجيل الدخول.
takeaways:
  - AsyncStorage مخزن مفتاح-قيمة للنصوص، غير مشفّر وغير متزامن، مناسب للتفضيلات الصغيرة وغير مناسب للأسرار.
  - يخزّن expo-sqlite البيانات المنظّمة التي تستعلم عنها وترتّبها وتصفّيها؛ شغّل الـ migrations الخاصة بالمخطّط (schema) داخل `onInit` مستخدمًا `PRAGMA user_version`.
  - مرّر قيم SQL دائمًا بوصفها معاملات (`?`)، ولا تبنِ نص SQL بنفسك أبدًا.
  - يشفّر expo-secure-store القيم الصغيرة باستخدام Keychain أو Keystore الخاص بالمنصّة؛ ومكان الـ tokens والمفاتيح هناك.
  - خزّن الملفات مثل الصور في نظام الملفات، واحتفظ بمساراتها فقط في قاعدة البيانات.
further:
  - title: Store data
    url: https://docs.expo.dev/develop/user-interface/store-data/
  - title: SQLite
    url: https://docs.expo.dev/versions/latest/sdk/sqlite/
  - title: SecureStore
    url: https://docs.expo.dev/versions/latest/sdk/securestore/
quiz:
  - q: أين يجب أن يحتفظ Trailhead بالـ refresh token الذي يتلقّاه بعد تسجيل الدخول؟
    options:
      - text: في AsyncStorage، تحت مفتاح مثل `auth.refreshToken`.
        why: AsyncStorage غير مشفّر. وعلى جهاز مخترق أو له نسخة احتياطية، يمكن قراءة الـ token نصًّا عاديًا.
      - text: في متغيّر بيئة يبدأ بـ `EXPO_PUBLIC_`.
        why: هذه تُدمج في حزمة التطبيق وقت البناء؛ فلا تستطيع حمل قيم خاصة بكل مستخدم، ويستطيع أي أحد قراءتها.
      - text: في expo-secure-store، الذي يشفّره باستخدام Keychain على iOS وKeystore على Android.
        why: صحيح. الأسرار الصغيرة مثل الـ tokens هي بالضبط ما صُمّم له.
      - text: في جدول `tokens` داخل قاعدة بيانات SQLite.
        why: ملف قاعدة البيانات غير مشفّر افتراضيًا، فسيقبع الـ token نصًّا عاديًا بجوار الرحلات.
    answer: 2
  - q: "أيّ سطر آمن لحفظ اسم رحلة كتبه المستخدم؟"
    options:
      - text: "``db.runAsync(`INSERT INTO hikes (name) VALUES ('${name}')`)``"
        why: اسم يحتوي على علامة اقتباس، مثل O'Brien Ridge، يكسر العبارة، ويمكن لمدخلات مصمّمة بخبث أن تغيّر الـ SQL نفسه.
      - text: "`db.runAsync('INSERT INTO hikes (name) VALUES (?)', name)`"
        why: صحيح. تُربط القيمة بوصفها معاملًا، فتُعامَل دائمًا كبيانات، لا كـ SQL أبدًا.
      - text: "`db.execAsync('INSERT INTO hikes (name) VALUES (' + JSON.stringify(name) + ')')`"
        why: اقتباس JSON ليس اقتباس SQL، و`execAsync` لا يربط المعاملات. إنه بناء للنصوص بخطوات إضافية.
    answer: 1
  - q: يضيف الإصدار الثاني من Trailhead عمود `elevationM` إلى جدول الرحلات. المستخدمون الحاليون لديهم جدول الإصدار الأول أصلًا. ما الطريقة الموثوقة؟
    options:
      - text: في migration داخل `onInit`، اقرأ `PRAGMA user_version`؛ وإن كانت 1، فشغّل `ALTER TABLE hikes ADD COLUMN elevationM INTEGER` واضبط الإصدار على 2.
        why: صحيح. الـ migrations المرقّمة بالإصدارات ترقّي قاعدة بيانات كل مستخدم مرة واحدة بالضبط، بالترتيب، أيًّا كان الإصدار الذي يبدأ منه.
      - text: احذف قاعدة البيانات عند بدء التشغيل وأعد إنشاءها بالمخطّط الجديد.
        why: هذا يمسح سجلّ رحلات كل مستخدم عند التحديث. البيانات على الجهاز ملك المستخدم؛ ولا يمكنك إعادة تحميلها من أي مكان.
      - text: غيّر عبارة `CREATE TABLE`؛ وسيحدّث SQLite الجداول الموجودة لتطابقها.
        why: "`CREATE TABLE IF NOT EXISTS` يتخطّى الجداول الموجودة كليًا، فلا يحصل المستخدمون القدامى على العمود الجديد أبدًا."
    answer: 0
---

تطبيق مشي ينسى سجلّك حين تفقد الإشارة، أو يطلب منك تسجيل الدخول كل صباح، مصيره الحذف. لدى Trailhead ثلاثة أنواع من البيانات يجب حفظها على الجهاز، ولكلٍّ منها أداة مختلفة:

| البيانات | مثال | الأداة |
|---|---|---|
| تفضيلات صغيرة | الوحدات (km أو mi)، آخر tab مستخدم | AsyncStorage |
| سجلّات منظّمة تستعلم عنها | سجلّ الرحلات، مرتّبًا ومصفّى | expo-sqlite |
| أسرار | الـ refresh token لتسجيل الدخول | expo-secure-store |

اختيار الأداة الخاطئة نادرًا ما يفشل بصوت عالٍ. بل يفشل في صورة شاشات بطيئة، أو بيانات ضائعة بعد تحديث، أو مراجعة أمنية لا تجتازها.

:::figure ثلاثة مخازن، وثلاث وظائف
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">يخزّن Trailhead التفضيلات في AsyncStorage نصوصًا غير مشفّرة، والرحلات في قاعدة بيانات SQLite يستطيع الاستعلام عنها، والـ refresh token في SecureStore مشفّرًا عبر Keychain أو Keystore. والصور ملفات على القرص تُخزَّن مساراتها في SQLite.</title>
  <rect class="d-box-primary" x="250" y="16" width="180" height="48" rx="12"/>
  <text class="d-label-strong" x="340" y="46" text-anchor="middle">Trailhead</text>
  <rect class="d-box" x="20" y="120" width="190" height="90" rx="12"/>
  <text class="d-label-strong" x="115" y="148" text-anchor="middle">AsyncStorage</text>
  <text class="d-label-muted" x="115" y="172" text-anchor="middle">نصوص، غير مشفّرة</text>
  <text class="d-code" x="115" y="196" text-anchor="middle">units = "km"</text>
  <rect class="d-box-accent" x="245" y="120" width="190" height="90" rx="12"/>
  <text class="d-label-strong" x="340" y="148" text-anchor="middle">expo-sqlite</text>
  <text class="d-label-muted" x="340" y="172" text-anchor="middle">جداول، استعلامات</text>
  <text class="d-code" x="340" y="196" text-anchor="middle">hikes, photo paths</text>
  <rect class="d-box-success" x="470" y="120" width="190" height="90" rx="12"/>
  <text class="d-label-strong" x="565" y="148" text-anchor="middle">SecureStore</text>
  <text class="d-label-muted" x="565" y="172" text-anchor="middle">Keychain / Keystore</text>
  <text class="d-code" x="565" y="196" text-anchor="middle">refresh token</text>
  <path class="d-arrow" d="M290 64 L130 118" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 64 L340 118" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 64 L550 118" marker-end="url(#arrow)"/>
</svg>
:::

## AsyncStorage للتفضيلات

AsyncStorage مخزن مفتاح-قيمة دائم لـ **النصوص**. كل استدعاء فيه غير متزامن، ولا شيء مشفّر:

```ts title=src/lib/prefs.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Prefs = { units: 'km' | 'mi'; remindersOn: boolean };
const KEY = 'trailhead.prefs.v1';
const defaults: Prefs = { units: 'km', remindersOn: false };

export async function loadPrefs(): Promise<Prefs> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function savePrefs(prefs: Prefs) {
  return AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}
```

خزّن قيمة JSON واحدة تحت مفتاح مرقّم بإصدار بدلًا من مفاتيح صغيرة كثيرة، وادمجها مع القيم الافتراضية عند القراءة (حتى يحصل تفضيل جديد أُضيف في الإصدار الثاني على قيمة معقولة لدى المستخدمين القدامى)، واصمد أمام البيانات التالفة باستخدام `try`. ثبّته بالأمر `npx expo install @react-native-async-storage/async-storage`. وإن كان تطبيقك يستخدم expo-sqlite أصلًا، فإن `expo-sqlite/kv-store` يقدّم الواجهة البرمجية نفسها مدعومة بـ SQLite، فتستغني عن الاعتمادية الإضافية.

اقرأ التفضيلات مرة واحدة عند بدء التشغيل، واحفظها في context مثل الرحلات، واكتبها مجددًا حين تتغيّر. استدعاء `getItem` داخل الـ components في كل render يحوّل شاشة سريعة إلى شاشة تومض بالقيم الافتراضية أولًا.

ويصبح AsyncStorage بطيئًا ومربكًا حين تبدأ بتخزين قوائم من السجلّات فيه: كل قراءة تحلّل الكتلة كلها، ولا طريقة لطلب «الرحلات التي تتجاوز 10 km في 2026» دون تحميل كل شيء.

## expo-sqlite لسجلّ الرحلات

سجلّ الرحلات بيانات منظّمة ترتّبها وتصفّيها وتجمعها، وهذا ما وُجدت قاعدة البيانات من أجله. يعطيك expo-sqlite ملف قاعدة بيانات SQLite حقيقيًا على الجهاز. يفتحه `SQLiteProvider` ويشغّل الإعداد الخاص بك قبل أن يُرسم أي ابن:

```tsx title=src/app/_layout.tsx
import { Stack } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';

async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE hikes (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        distanceKm REAL NOT NULL,
        favorite INTEGER NOT NULL DEFAULT 0
      );
    `);
    version = 1;
  }
  if (version === 1) {
    await db.execAsync('ALTER TABLE hikes ADD COLUMN photoUri TEXT');
    version = 2;
  }
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="trailhead.db" onInit={migrate}>
      <Stack />
    </SQLiteProvider>
  );
}
```

`PRAGMA user_version` رقم يخزّنه SQLite في الملف نيابةً عنك. كل كتلة `if` ترقّي خطوة واحدة، فالمستخدم على الإصدار 0 يشغّل الاثنتين، والمستخدم على الإصدار 1 يشغّل الثانية فقط. لا تعدّل أبدًا خطوة قديمة بعد إطلاقها؛ بل أضف خطوة جديدة.

بعد ذلك تستطيع أي شاشة استخدام قاعدة البيانات:

```tsx
import { useSQLiteContext } from 'expo-sqlite';

const db = useSQLiteContext(); // in a component or custom hook

// …later, inside an async function such as an effect or a save handler:
const hikes = await db.getAllAsync<Hike>('SELECT * FROM hikes ORDER BY date DESC');
await db.runAsync(
  'INSERT INTO hikes (id, name, date, distanceKm) VALUES (?, ?, ?, ?)',
  hike.id, hike.name, hike.date, hike.distanceKm,
);
```

عمليًا ستستدعي هذه من الـ provider الخاص بالـ reducer: حمّل الرحلات مرة واحدة إلى الـ state، واكتب إلى SQLite كلما غيّرها action.

:::mistake بناء SQL باستخدام template strings
`` `INSERT INTO hikes (name) VALUES ('${name}')` `` ينكسر مع أول رحلة اسمها "O'Brien Ridge"، ويسمح لمدخلات مصمّمة بخبث بإعادة كتابة استعلامك. أما العلامات `?` فتربط القيم بأمان، أيًّا كان محتواها. اجعلها قاعدة: لا بيانات من المستخدم تدخل نص الـ SQL نفسه أبدًا.
:::

## SecureStore للأسرار

يتيح الـ refresh token لـ Trailhead تسجيل الدخول بصمت. ومن يقرؤه يستطيع التصرّف بوصفه المستخدم، لذا يوضع في expo-secure-store، الذي يشفّر القيم باستخدام Keychain في iOS وKeystore في Android:

```ts title=src/lib/session.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'trailhead.refreshToken';

export const saveToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const readToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
```

هذا ما كانت حالة `isLoading` في `useSession` من القسم السابق تنتظره: عند بدء التشغيل، يقرّر `readToken()` هل يصل المستخدم إلى الـ tabs أم إلى شاشة تسجيل الدخول. صُمّم SecureStore للقيم **الصغيرة**؛ وقد رفضت بعض إصدارات المنصّات قيمًا تتجاوز نحو 2 KB. احفظ فيه الـ tokens والمفاتيح، ولا تحفظ فيه كائنات كاملة أو ملفات أبدًا. وهو لا يعمل على الويب، فتحتاج نسخة الويب إلى نهج مختلف.

## مكان الملفات على القرص

صورة الدرب عدّة ميغابايتات. لا تضعها في SQLite ولا في AsyncStorage. احتفظ بالملف على القرص (يدير expo-file-system مجلّد المستندات الخاص بتطبيقك)، وخزّن الـ URI الخاص به فقط في عمود `photoUri`. تبقى قاعدة بياناتك صغيرة وسريعة، ويحمّل component الصورة الملف مباشرة.

كل هذه البيانات تصمد أمام تحديثات التطبيق، بما فيها التحديثات عبر الهواء، وتُحذف حين يُزيل المستخدم التطبيق، مع استثناء غريب: على iOS قد تبقى قيم الـ Keychain المحفوظة عبر SecureStore بعد إعادة التثبيت، فلا تعتبر غياب قاعدة البيانات دليلًا على عدم وجود token. وإن كان فقدانها مؤلمًا، فزامنها مع خادمك، وهذا بالضبط سبب وجود الحسابات في Trailhead.

التالي: أدقّ جزء في التعامل مع الجهاز، أي طلب الإذن لاستخدام موقعه وكاميرته.
