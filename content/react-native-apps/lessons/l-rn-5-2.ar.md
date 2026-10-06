---
summary: اضبط Jest مع الـ preset المسمّى jest-expo، واكتب unit tests لمنطق Trailhead النقي، واختبر الـ components بالطريقة التي يستخدمها بها المستخدمون عبر React Native Testing Library، واصنع mock للوحدات الأصلية عند الحدود.
takeaways:
  - يضبط الـ preset المسمّى jest-expo أداة Jest لـ React Native، ويصنع mock للجانب الأصلي من وحدات Expo، فتعمل الاختبارات في Node دون جهاز.
  - الدوال النقية مثل أدوات التحليل والـ reducers ودوال التحقّق تعطي أكبر قدر من الثقة مقابل كل دقيقة من كتابة الاختبارات؛ فاختبرها أولًا.
  - ترسم React Native Testing Library الـ components وتتيح لك العثور على العناصر بالدور (role) والتسمية (label) والنص، كما يفعل المستخدمون وقارئات الشاشة.
  - في الإصدارات الحالية من المكتبة، `render` وتفاعلات `userEvent` غير متزامنة؛ فانتظرها بـ await.
  - اصنع mock للوحدات الأصلية مثل expo-location عند الحدود باستخدام `jest.mock`، واكتب الـ assertions على ما يراه المستخدم.
further:
  - title: Unit testing with Jest
    url: https://docs.expo.dev/develop/unit-testing/
  - title: React Native Testing Library
    url: https://testing-library.com/docs/react-native-testing-library/intro/
  - title: Jest mock functions
    url: https://jestjs.io/docs/mock-functions
quiz:
  - q: أيّ اختبار في Trailhead يعطي أكبر قدر من الثقة بأقل جهد؟
    options:
      - text: لقطة (snapshot) لشاشة سجلّ الرحلات كلها.
        why: اللقطات تنكسر مع كل تغيير غير ضار في البنية، وتنجح بسرور حين يكون المنطق خاطئًا. ويتعلّم الناس تحديثها دون قراءتها.
      - text: اختبار end-to-end ينقر عبر التطبيق على محاكٍ للتحقّق من أن "8,4" تُحلَّل.
        why: اختبارات end-to-end قيّمة للمسارات الحرجة، لكنها بطيئة وغير مستقرّة للتحقّق من قاعدة تحليل واحدة.
      - text: جدول من المدخلات والمخرجات المتوقّعة لـ `parseDistanceKm` و`hikesReducer`.
        why: صحيح. الدوال النقية تعمل في أجزاء من الثانية، ولا تحتاج إلى mocks، وتغطّي القواعد التي يعتمد عليها المستخدمون.
    answer: 2
  - q: كيف يجب أن يعثر اختبار component على زرّ Save في Trailhead؟
    options:
      - text: "`screen.getByRole('button', { name: 'Save' })`"
        why: صحيح. يعثر على ما يراه المستخدمون وقارئات الشاشة، ويفشل إن نسيت دور الزر، وهذا خطأ حقيقي في إمكانية الوصول.
      - text: "`screen.getByTestId('save-btn-3')`"
        why: معرّفات الاختبار تعمل، لكنها تختبر تفصيلة تنفيذية وتفوّت مشكلات إمكانية الوصول. استخدمها كملاذ أخير.
      - text: بقراءة الابن الثالث للـ View الجذري في الشجرة المرسومة.
        why: هذا ينكسر كلما تغيّر التخطيط، حتى حين يظل التطبيق يعمل.
    answer: 0
  - q: يستدعي component الدالة `Location.getForegroundPermissionsAsync()`. في اختبار Jest تُرجع `undefined`، فيعرض الـ component مؤشّر تحميل إلى الأبد. ما الإصلاح الصحيح؟
    options:
      - text: شغّل الاختبار على محاكٍ لتكون الوحدة الحقيقية متاحة.
        why: يعمل Jest في Node؛ لا يوجد جهاز. الحدود تحتاج إلى mock، لا إلى محاكٍ.
      - text: احذف التحقّق من الإذن من الـ component حين تكون `process.env.NODE_ENV` تساوي `test`.
        why: التفرّعات الخاصة بالاختبار في كود الإنتاج تعني أنك لم تعد تختبر الكود الذي تطلقه.
      - text: غلّف الاستدعاء بـ `try`/`catch` لينجح الاختبار.
        why: لا شيء يرمي خطأ هنا؛ الـ mock لا يُرجع شيئًا فحسب. والـ `catch` لا يغيّر شيئًا ويُخفي الأخطاء الحقيقية.
      - text: اصنع mock للوحدة باستخدام `jest.mock('expo-location', …)` بحيث تُحَلّ الدالة باستجابة إذن تختارها أنت.
        why: صحيح. أنت تتحكّم في الحدود، وتستطيع اختبار كل حالة (الممنوح، والمرفوض، والمرفوض نهائيًا).
    answer: 3
---

دفع كل درس في هذه الدورة المنطقَ خارج الـ components إلى دوال نقية صغيرة: `parseDistanceKm`، و`hikesReducer`، و`validateHikeForm`، و`permissionAction`، و`trackDistanceKm`. ولم يكن ذلك من أجل الترتيب فقط. على الجوّال، التحقّق من تغيير يدويًا يعني إعادة البناء، والتشغيل، والتنقّل ثلاث شاشات إلى الداخل، والكتابة على لوحة مفاتيح محاكٍ. واختبار يتحقّق من الشيء نفسه في 20 جزءًا من الألف من الثانية، في كل مرة تحفظ فيها، أفضل مقايضة ستعقدها.

## إعداد Jest

يضبط الـ preset الخاص بـ Expo، `jest-expo`، أداة Jest لـ React Native: يحوّل كود TypeScript وJSX، و**يصنع mock للجانب الأصلي من وحدات Expo**، فتعمل الاختبارات في Node دون جهاز. ثبّته مع React Native Testing Library:

```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install @testing-library/react-native --dev
```

ثم وجّه Jest إلى الـ preset في `package.json`:

```json title=package.json
{
  "scripts": {
    "test": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

يذكر دليل Expo أيضًا مُدخلًا لـ `transformIgnorePatterns` للحزم التي تُشحن بكود غير محوَّل؛ انسخه من هناك حين يفشل استيراد برسالة "SyntaxError: Cannot use import statement outside a module". وضع الاختبارات في مجلّدات `__tests__` بجوار الكود الذي تغطّيه.

## ابدأ بالمنطق النقي

لأداة التحليل من القسم 1 قواعد صغيرة كثيرة. وجدول من الحالات يوثّقها أفضل من النثر:

```ts title=src/lib/__tests__/parseDistance.test.ts
import { parseDistanceKm } from '../parseDistance';

test.each([
  ['8.4', 8.4],
  ['8,4', 8.4],
  [' 12 km', 12],
  ['abc', null],
  ['0', null],
  ['1.2.3', null],
])('parseDistanceKm(%j) is %p', (input, expected) => {
  expect(parseDistanceKm(input)).toBe(expected);
});
```

لاحظ أن حالات الاختبار هي بالضبط المدخلات الغريبة التي قلقت بشأنها حين كتبت الدالة: الفاصلة العشرية، والوحدة اللاحقة، والصفر. كل بلاغ عن خطأ يصبح صفًّا إضافيًا في جدول كهذا، يُكتب قبل الإصلاح، فلا يستطيع الخطأ نفسه العودة بصمت أبدًا.

والـ reducers تُعامَل بالطريقة نفسها: ابنِ state، وأرسل action، وتحقّق من النتيجة، وتحقّق أن المدخل لم يُعدَّل. هذه الاختبارات سريعة ومستقرّة ولا تحتاج إلى mocks، ولهذا يجب أن تشكّل معظم مجموعة اختباراتك.

## اختبار الـ components كما يستخدمها المستخدم

ترسم React Native Testing Library الـ components في الذاكرة، وتتيح لك الاستعلام عنها كما يدركها الناس: بالـ **role** والـ **label** والنص. هذا اختبار للـ component المسمّى `QuickLog` من القسم 1:

```tsx title=src/components/__tests__/QuickLog.test.tsx
import { render, screen, userEvent } from '@testing-library/react-native';
import { QuickLog } from '../QuickLog';

test('saves a valid distance', async () => {
  const onSave = jest.fn();
  const user = userEvent.setup();
  await render(<QuickLog onSave={onSave} />);

  await user.type(screen.getByLabelText('Distance (km)'), '8,4');
  await user.press(screen.getByRole('button', { name: 'Save' }));

  expect(onSave).toHaveBeenCalledWith(8.4);
});

test('keeps Save disabled until the distance is valid', async () => {
  const user = userEvent.setup();
  await render(<QuickLog onSave={jest.fn()} />);

  await user.type(screen.getByLabelText('Distance (km)'), 'far');

  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});
```

لكي يعثر `getByLabelText` على الحقل، يحتاج الـ `TextInput` إلى `accessibilityLabel="Distance (km)"`. وهذا بيت القصيد: الاختبار الذي يستعلم بالـ role والـ label يفشل حين تكون الشاشة غير قابلة للوصول، فتصبح اختباراتك فحصًا لإمكانية الوصول أيضًا. يحاكي `userEvent` التفاعلات الحقيقية (التركيز، وكتابة كل حرف، والضغط والإفلات)، وفي الإصدارات الحالية من المكتبة يكون كلٌّ من `render` والتفاعلات **غير متزامن**، فانتظرها بـ await. والـ matchers مثل `toBeOnTheScreen()` و`toHaveTextContent()` و`toBeDisabled()` تأتي مع المكتبة.

:::mistake اختبار تفاصيل التنفيذ
كتابة assertion بأن component استدعى `setState` مرتين، أو أخذ snapshot لشجرته كلها، يربط الاختبارات بطريقة كتابة الكود لا بما يفعله. أعِد هيكلة الـ component فتفشل الاختبارات مع أن التطبيق يعمل؛ واكسر المنطق فيسجّل الـ snapshot المخرجات المعطوبة بسرور. اكتب الـ assertions على ما يستطيع المستخدم ملاحظته: النص على الشاشة، وحالة الزر، وcallback استُدعي بالقيمة الصحيحة.
:::

## صنع mock للجهاز عند الحدود

يضع `jest-expo` بدائل للوحدات الأصلية، لكن هذه البدائل لا تُرجع شيئًا مفيدًا. وحين يعتمد component على إجابة وحدة ما، اصنع لها mock بالإجابة التي تريد اختبارها:

```tsx
import * as Location from 'expo-location';

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

test('offers Settings after a permanent denial', async () => {
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
    status: 'denied', granted: false, canAskAgain: false, expires: 'never',
  } as Location.LocationPermissionResponse);

  await render(<TrackScreen />);

  expect(await screen.findByRole('button', { name: 'Open Settings' })).toBeOnTheScreen();
});
```

استعلامات `findBy…` تنتظر ظهور العنصر، وهذا يناسب الشاشات التي تحمّل بشكل غير متزامن. اصنع الـ mocks عند حافة تطبيقك (الوحدات الأصلية، و`fetch`)، لا للـ components الخاصة بك، ليكون الكود قيد الاختبار هو الكود الذي تطلقه. والشاشات التي تستخدم hooks من Expo Router يمكن رسمها باستخدام `renderRouter` من `expo-router/testing-library`، الذي يجهّز router في الذاكرة بالمسارات التي تعطيه إياها.

## أين تقع اختبارات end-to-end

لا تستطيع اختبارات الوحدات واختبارات الـ components التقاط build أصلي معطوب، أو نافذة إذن لا تظهر أبدًا، أو لوحة مفاتيح تغطّي زرّ Save. بضعة اختبارات **end-to-end** على builds حقيقية تغطّي ذلك: أدوات مثل Maestro (التي يستطيع EAS تشغيلها في السحابة) أو Detox تقود التطبيق الفعلي على محاكٍ. احتفظ بها للمسارات التي سيؤلم كسرها أكثر من غيرها، مثل تسجيل الدخول وتسجيل رحلة، ودع الاختبارات السريعة تغطّي كل ما عدا ذلك.

التالي: تحويل التطبيق المختبَر إلى builds تستطيع الهواتف الحقيقية تثبيتها.
