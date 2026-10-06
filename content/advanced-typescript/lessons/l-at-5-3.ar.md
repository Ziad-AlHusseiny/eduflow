---
summary: صِف كود JavaScript لم تكتبه بملفات التصريحات، وحدّد أنواع المتغيّرات العامة ومتغيّرات البيئة، ووسّع الـ interfaces والوحدات الموجودة بدمج التصريحات وتوسيع الوحدات.
takeaways:
  - ملف `.d.ts` لا يحتوي إلا أنواعًا؛ و`declare` تصف شيئًا موجودًا وقت التشغيل لكنه معرَّف في مكان آخر.
  - تحقّق من وجود أنواع مدمجة أو حزمة `@types/` قبل كتابة التصريحات، ولا تكتب إلا أجزاء المكتبة التي تستخدمها.
  - الـ interfaces التي لها الاسم نفسه في النطاق نفسه تندمج في واحد؛ أما الأسماء المستعارة للأنواع فلا تندمج أبدًا، ولهذا تكون أنواع المكتبات القابلة للتوسيع interfaces.
  - "`declare module 'pkg' { … }` في ملف فيه import أو export توسّع تلك الوحدة؛ وفي ملف ليس فيه أيٌّ منهما تعلن وحدة محيطة جديدة كليًا."
  - "`declare global { … }` داخل وحدة تضيف إلى النطاق العام، مثل خاصية على `Window` أو حقل في `ImportMetaEnv`."
further:
  - title: Declaration Files - Introduction
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
  - title: Declaration Merging
    url: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  - title: Env Variables and Modes (Vite)
    url: https://vite.dev/guide/env-and-mode.html
quiz:
  - q: تضيف `import { quote } from 'legacy-shipping-calc'`، وهي حزمة JavaScript بلا أنواع. ماذا يجب أن تجرّب أولًا؟
    options:
      - text: اكتب `.d.ts` كاملًا يصف كل ما تصدّره الحزمة.
        why: كتابة التصريحات هي الملاذ الأخير، وحتى حينها لا تحتاج إلا الأجزاء التي تستخدمها.
      - text: أضف `declare module 'legacy-shipping-calc';` كي يصبح كل شيء `any`.
        why: هذا يُسكت الخطأ بتحويل كل import إلى `any`، فيُخفي بالضبط الأخطاء التي وُجدت الأنواع لالتقاطها.
      - text: حوّل الـ import بـ `as any` في كل موضع استدعاء.
        why: الـ import نفسه يفشل في فحص الأنواع أولًا، ونثر `any` يزيد الأمور سوءًا لا تحسّنًا.
      - text: تحقّق إن كانت الحزمة تأتي بأنواعها الخاصة أو إن كانت هناك حزمة `@types/legacy-shipping-calc`.
        why: صحيح. معظم الحزم الشائعة محدَّدة الأنواع بطريقة أو بأخرى؛ لا تكتب التصريحات إلا حين لا يوجد أيٌّ منهما.
    answer: 3
  - q: |
      ما هو `keyof CheckoutConfig` بعد هذين التصريحين في النطاق نفسه؟
      ```ts
      interface CheckoutConfig { currency: string }
      interface CheckoutConfig { giftWrap: boolean }
      ```
    options:
      - text: "`'currency' | 'giftWrap'`"
        why: صحيح. الـ interfaces التي لها الاسم نفسه في النطاق نفسه تدمج أعضاءها.
      - text: "`'giftWrap'`، لأن التصريح الثاني يستبدل الأول"
        why: الـ interfaces لا يستبدل بعضها بعضًا أبدًا؛ إنها تندمج. أما الأسماء المستعارة المكرّرة للأنواع فهي خطأ.
      - text: خطأ، "Duplicate identifier 'CheckoutConfig'".
        why: هذا الخطأ هو ما ستحصل عليه مع اسمين مستعارين بـ `type`. الـ interfaces مصمَّمة لتندمج.
    answer: 0
  - q: "ملف `vite-env.d.ts` لا يحتوي إلا `interface ImportMetaEnv { readonly VITE_API_URL: string }` (مع توجيه المرجع الخاص بـ Vite). ماذا يفعل؟"
    options:
      - text: يستبدل `ImportMetaEnv` الخاص بـ Vite، مُزيلًا الحقلين المدمجين `MODE` و`DEV`.
        why: الـ interfaces تندمج، فتبقى حقول Vite وتُضاف حقولك.
      - text: يضيف `VITE_API_URL` إلى `ImportMetaEnv` العام الموجود، فيكون `import.meta.env.VITE_API_URL` من نوع `string`.
        why: صحيح. الملف ليس فيه imports أو exports، فهو script عام، ويندمج الـ interface فيه مع الـ interface العام الخاص بـ Vite.
      - text: يحدّد قيمة المتغيّر وقت البناء.
        why: التصريحات لا تنتج قيمًا أبدًا؛ القيمة ما زالت تأتي من ملف `.env` الخاص بك.
    answer: 1
  - q: "الملف `types/ui.d.ts` لا يحتوي إلا `declare module 'cartwheel-ui' { interface Theme { brand: string } }`. بعدها، صار كل import من `cartwheel-ui` يفتقد بقية ما تصدّره الحزمة. لماذا؟"
    options:
      - text: الـ interfaces لا يمكن إعلانها داخل `declare module`.
        why: يمكن ذلك؛ توسيع الوحدات في معظمه interfaces.
      - text: الملف يحتاج إلى توجيه `/// <reference>`.
        why: توجيه المرجع لا يغيّر ما إذا كانت الكتلة توسّع وحدة أم تعلن وحدة.
      - text: دون أي import أو export يكون الملف script، فتعلن الكتلة وحدة محيطة جديدة كليًا تحجب الحقيقية؛ أضف `export {}` أو import.
        why: صحيح. في ملف وحدة، `declare module 'cartwheel-ui'` توسّع؛ وفي ملف script، تعلن من الصفر.
    answer: 2
---

ليس كل ما يلمسه كود TypeScript لديك مكتوبًا بـ TypeScript. نظام الدفع في Cartwheel يحمّل مقتطف تحليلات بوسم `<script>`، ويستخدم حاسبة شحن داخلية قديمة مكتوبة بـ JavaScript، ويقرأ متغيّرات البيئة عبر Vite، ويعمل بـ lib متأخّرة سنة عن المتصفّحات التي يعمل عليها. في كلٍّ من هذه الحالات، تحتاج إلى إخبار الـ compiler عن كود لا يستطيع رؤيته. وهذا ما وُجدت له ملفات التصريحات و`declare`.

## declare: إنه موجود، ثق بي

`declare` تصف شيئًا موجودًا وقت التشغيل لكنه معرَّف في مكان آخر. لا تنتج أي JavaScript. والملف المنتهي بـ `.d.ts` لا يحتوي إلا مثل هذه التصريحات:

```ts title=types/analytics.d.ts
type AnalyticsEvent = 'checkout_started' | 'order_placed' | 'payment_failed';

declare const cartwheelAnalytics: {
  track(event: AnalyticsEvent, props?: Record<string, string | number>): void;
};
```

هذا الملف ليس فيه `import` ولا `export`، فهو **script عام**: كل ما فيه مرئي في كل ملف من المشروع. والآن صارت `cartwheelAnalytics.track('order_plaecd')` خطأ ترجمة، وهذا ما لم تنجح فيه وثائق المقتطف أبدًا.

التصريح وعدٌ غير مفحوص، تمامًا مثل تحويلات `as` في الأقسام السابقة. إن اختلف الـ API الحقيقي للمقتطف، سيثق TypeScript بنسختك بسرور. أبقِ التصريحات صغيرة، ولا تكتب إلا الأجزاء التي تستخدمها، وضع تعليقًا بإصدار المكتبة الذي تحقّقت منها مقابله.

## تحديد أنواع حزمة JavaScript

قبل كتابة أي تصريحات لحزمة، تحقّق من المكانين اللذين تأتي منهما الأنواع عادة. حزم كثيرة تأتي بأنواعها الخاصة (`"types"` في `package.json` الخاص بها، أو ملفات `.d.ts` بجوار JavaScript). ولغيرها، يصون المجتمع حزم `@types/` على DefinitelyTyped: `npm install -D @types/legacy-shipping-calc` إن وُجدت.

ولحزمة داخلية ليس لها أيٌّ منهما، أعلن الوحدة بنفسك:

```ts title=types/legacy-shipping-calc.d.ts
declare module 'legacy-shipping-calc' {
  export type Quote = { carrier: string; feeCents: number; days: number };
  export function quote(country: string, weightGrams: number): Quote[];
}
```

الصيغة المختصرة `declare module 'legacy-shipping-calc';` دون جسم تعمل أيضًا، وتجعل كل import من نوع `any`. اعتبرها مخرج طوارئ مؤقتًا أثناء الترحيل، لا حلًا.

أبقِ التصريحات المكتوبة يدويًا معًا في مجلد واحد، مثل `types/`، وتأكّد أن `include` في tsconfig يشمله؛ فملف `.d.ts` لا يراه الـ compiler أبدًا لا يفعل شيئًا، ورسالة الخطأ الناتجة "Could not find a declaration file for module" مربكة في المرة الأولى. ولاحظ أيضًا أن هذا الملف عام، مثل ملف التحليلات: كتلة `declare module 'name'` باسم نصي هي طريقتك لوصف حزمة من ملف script.

## دمج التصريحات

بعض التصريحات التي لها الاسم نفسه تتّحد بدل أن تتصادم. أكثر ما ستستخدمه: **الـ interfaces تندمج**.

```ts
interface CheckoutConfig { currency: string }
interface CheckoutConfig { giftWrap: boolean }

const config: CheckoutConfig = { currency: 'EGP', giftWrap: true }; // both required
```

الأسماء المستعارة للأنواع لا تندمج أبدًا؛ تصريحان `type CheckoutConfig` يعطيان خطأ "Duplicate identifier". هذا هو الفرق العملي الرئيسي بين `type` و`interface`، ولهذا تكشف المكتبات التي تتوقّع أن تُوسَّع عن interfaces.

والدمج هو طريقتك لسدّ الفجوات في المكتبة القياسية. بيئة التجربة في هذه الدورة تستخدم الـ lib الخاصة بـ ES2022، فـ `Array.prototype.findLast` (من ES2023) غائبة عن أنواعها رغم أن كل متصفّح حالي يملكها. والدمج في الـ interface العام `Array<T>` يضيفها:

```ts
interface Array<T> {
  findLast(predicate: (value: T, index: number, array: T[]) => unknown): T | undefined;
}
```

في مشروع حقيقي، الإصلاح الأفضل هو الإعداد الصحيح لـ `lib` أو `target`. أما الدمج فللحالات التي لا تستطيع فيها الإعدادات التعبير عمّا تملكه بيئة التشغيل فعلًا، مثل polyfill تضمّنه بنفسك.

وهو أيضًا الطريقة التي يحدّد بها Vite أنواع متغيّرات البيئة لديك. أنواع العميل فيه تعلن interface عامًا باسم `ImportMetaEnv`، ويندمج مشروعك فيه:

```ts title=src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PAYMENTS_KEY: string;
}
```

## توسيع الوحدات

للإضافة إلى نوع يعيش *داخل* وحدة، افتح الوحدة بـ `declare module` من ملف هو نفسه وحدة:

```ts title=src/theme.d.ts
import 'cartwheel-ui';

declare module 'cartwheel-ui' {
  interface Theme {
    brand: { primary: string; onPrimary: string };
  }
}
```

صار للـ interface المسمّى `Theme` داخل `cartwheel-ui` حقل `brand` في كل مكان يُستخدم فيه. وللإضافة إلى النطاق العام من ملف وحدة، استخدم `declare global { interface Window { dataLayer: unknown[] } }`.

:::mistake الإعلان حين كنت تقصد التوسيع
كتلة `declare module 'cartwheel-ui' { … }` نفسها تعني شيئين مختلفين حسب ملفها. في ملف فيه `import` أو `export` واحد على الأقل، **توسّع** الوحدة الموجودة. وفي ملف ليس فيه أيٌّ منهما، **تعلن** وحدة محيطة جديدة كليًا تحجب الحزمة الحقيقية، فتختفي كل الصادرات الأخرى من `cartwheel-ui`. إن بدا أن توسيعًا قد محا مكتبة، فأضف `export {}` أو سطر الـ import، وتحقّق مرة أخرى.
:::

:::tip نشر أنواعك الخاصة
إن كنت تنشر حزمة، فدع TypeScript يولّد تصريحاتها بـ `"declaration": true`. ومع `isolatedDeclarations` (منذ TypeScript 5.5)، يتطلّب الـ compiler أنواعًا صريحة على كل ما تصدّره، كي تستطيع الأدوات الأسرع توليد ملفات `.d.ts` ملفًا بعد ملف دون تشغيل فاحص الأنواع. وهي عادة جيدة للـ API العام لأي مكتبة على أي حال.
:::

في التمرين ستعلن متغيّر التحليلات العام، وتضيف `findLast` إلى الـ lib في بيئة التجربة، وتوسّع interface إعداد بالدمج. الدرس الأخير: نقل قاعدة كود JavaScript كاملة.
