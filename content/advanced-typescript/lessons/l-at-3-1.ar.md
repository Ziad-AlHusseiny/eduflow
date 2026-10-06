---
summary: اشتقّ الأنواع من قيم وقت التشغيل ومن أنواع أخرى باستخدام typeof وkeyof والوصول بالفهرس، كي يسري التغيير في مكان واحد عبر قاعدة الكود بدل أن تتباعد النُّسخ.
takeaways:
  - في موضع النوع، تعطي `typeof value` النوع الذي استنتجه TypeScript لتلك القيمة، فتكون جسرًا من كود وقت التشغيل إلى نظام الأنواع.
  - "`keyof T` هو الـ union من أسماء خصائص `T`، و`T[K]` هو نوع الخاصية (أو الخصائص) التي يسمّيها `K`."
  - "`(typeof CONFIG)[keyof typeof CONFIG]` يعطي الـ union من أنواع قيم الكائن، و`T[number]` يعطي نوع عنصر المصفوفة."
  - "تُعيد `Object.keys` النوع `string[]` عن قصد: التنميط البنيوي يعني أن الكائن قد يحمل مفاتيح أكثر مما يسرده نوعه."
further:
  - title: Keyof Type Operator
    url: https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
  - title: Typeof Type Operator
    url: https://www.typescriptlang.org/docs/handbook/2/typeof-types.html
  - title: Indexed Access Types
    url: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
quiz:
  - q: |
      ما هو `Zone`؟
      ```ts
      const SHIPPING_ZONES = {
        domestic: { feeCents: 499 },
        gulf: { feeCents: 1299 },
      } as const;
      type Zone = keyof typeof SHIPPING_ZONES;
      ```
    options:
      - text: "`'domestic' | 'gulf'`"
        why: صحيح. `typeof` تحوّل القيمة إلى نوعها، و`keyof` تأخذ الـ union من أسماء خصائصها.
      - text: "`string`"
        why: "`keyof` على نوع كائن بخصائص معروفة يعطي تلك الأسماء بالضبط، لا `string`. لا تحصل على `string` إلا من index signature."
      - text: "`{ feeCents: 499 } | { feeCents: 1299 }`"
        why: هذا هو الـ union من القيم، وتحصل عليه بـ `(typeof SHIPPING_ZONES)[Zone]`.
      - text: خطأ، لأن `keyof` تحتاج نوعًا لا قيمة.
        why: "`typeof` في موضع النوع تحوّل القيمة أولًا، فتتلقّى `keyof` نوعًا فعلًا."
    answer: 0
  - q: "`type CheckoutResponse = { lines: { sku: string; qty: number }[] }`. أيّ نوع يساوي `{ sku: string; qty: number }`؟"
    options:
      - text: "`CheckoutResponse.lines[0]`"
        why: الوصول بالنقطة غير موجود في مواضع الأنواع؛ يقرأ TypeScript `CheckoutResponse.lines` كبحث في namespace فيفشل.
      - text: "`CheckoutResponse['lines']`"
        why: "هذا نوع المصفوفة كاملة، `{ sku: string; qty: number }[]`، لا عنصر واحد."
      - text: "`keyof CheckoutResponse['lines']`"
        why: هذا يعطي مفاتيح المصفوفة (`number` و`'length'` و`'map'` …)، لا عناصرها.
      - text: "`CheckoutResponse['lines'][number]`"
        why: صحيح. فهرسة نوع مصفوفة بـ `number` تعطي نوع عنصرها.
    answer: 3
  - q: "ما هو `keyof (ShippedOrder | CancelledOrder)` حين يملك كلاهما `id` و`status`، ولا يملك `trackingNumber` إلا `ShippedOrder`، ولا يملك `cancelReason` إلا `CancelledOrder`؟"
    options:
      - text: "`'id' | 'status' | 'trackingNumber' | 'cancelReason'`"
        why: هذا سيتيح لك قراءة `trackingNumber` من قيمة قد تكون طلبًا ملغى، وهذا غير آمن.
      - text: "`'id' | 'status'`"
        why: صحيح. مفتاح الـ union يجب أن يكون مفتاحًا في كل عضو، فلا يبقى إلا الخصائص المشتركة.
      - text: "`never`، لأن النوعين مختلفان"
        why: العضوان يشتركان في `id` و`status`، فتنجو تلك المفاتيح.
    answer: 1
  - q: لماذا تُعيد `Object.keys(order)` النوع `string[]` بدل `(keyof Order)[]`؟
    options:
      - text: لأن فريق TypeScript لم يتفرّغ لتحديد نوعها بعد.
        why: إنه خيار مقصود ينبع من طريقة عمل نظام الأنواع، لا سهو.
      - text: لأن `keyof` غير متاحة في ملفات الـ lib.
        why: ملفات الـ lib تستخدم `keyof` في كل مكان؛ هذا ليس قيدًا تقنيًا.
      - text: لأن القيمة من نوع `Order` قد تحمل خصائص إضافية وقت التشغيل لا يسردها النوع.
        why: صحيح. التنميط البنيوي يسمح لـ `DetailedOrder` بالمرور كـ `Order`، فتظهر مفاتيحه الإضافية وقت التشغيل.
    answer: 2
---

مناطق الشحن في Cartwheel موجودة في كائن إعداد. النسخة الأولى من الكود وصفتها مرتين: مرة كبيانات، ومرة كأنواع.

```ts
const SHIPPING_ZONES = {
  domestic: { countries: ['US', 'CA'], feeCents: 499 },
  gulf: { countries: ['AE', 'SA'], feeCents: 1299 },
  europe: { countries: ['GB', 'DE'], feeCents: 999 },
};

type Zone = 'domestic' | 'gulf' | 'europe'; // written by hand
```

بعد ستة أشهر أضاف أحدهم منطقة `levant` إلى الكائن ونسي النوع. لم يفشل شيء في الترجمة؛ كل ما في الأمر أن المنطقة الجديدة لم يكن ممكنًا اختيارها في أي مكان. كل نسخة مكتوبة يدويًا من حقيقةٍ ما هي نسخة قابلة للتباعد. هذا الدرس يغطّي عوامل الأنواع (type operators) الثلاثة التي تتيح لك كتابة الحقيقة مرة واحدة و**اشتقاق** الباقي.

## typeof: من القيم إلى الأنواع

في موضع النوع، تأخذ `typeof` *قيمة* وتعطيك النوع الذي استنتجه TypeScript لها. إنها ليست العامل `typeof` في JavaScript (الذي يُعيد نصوصًا مثل `'object'` وقت التشغيل)؛ إنها لا توجد إلا وقت الترجمة.

```ts
const SHIPPING_ZONES = {
  domestic: { countries: ['US', 'CA'], feeCents: 499 },
  gulf: { countries: ['AE', 'SA'], feeCents: 1299 },
  europe: { countries: ['GB', 'DE'], feeCents: 999 },
} as const;

type ShippingZones = typeof SHIPPING_ZONES;
// { readonly domestic: { readonly countries: readonly ['US', 'CA']; readonly feeCents: 499 }; … }
```

`as const` مهمة هنا، كما كانت في [الـ Literal Types و as const و satisfies](lesson:l-at-1-5). دونها سيكون `countries` من نوع `string[]` و`feeCents` من نوع `number`، وستفقد التفاصيل الجديرة بالاشتقاق.

تعمل `typeof` مع الدوال أيضًا: `typeof formatPrice` هو التوقيع الكامل للدالة، ويمكنك تمريره إلى utility types (أنواع مساعدة) مثل `ReturnType<typeof formatPrice>`. ستبني `ReturnType` بنفسك بعد درسين.

متى يجب أن تكون القيمة هي المصدر والنوع مشتقًا، لا العكس؟ استخدم `typeof` حين تكون البيانات *هي* التعريف: جداول البحث، وإعدادات المناطق، وقوائم الخيارات التي تُعرض أيضًا في الواجهة. واكتب النوع أولًا حين يكون الشكل عقدًا مع طرف آخر، مثل حمولة API، وافحص القيم مقابله.

:::figure typeof تعبر من القيم إلى الأنواع؛ وkeyof والفهرسة تعملان على الأنواع
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">عالمان. في عالم القيم يقع الكائن SHIPPING_ZONES. تنقله typeof إلى عالم الأنواع كنوع. ومن هناك، تنتج keyof الـ union من أسماء المناطق، والوصول بالفهرس بتلك الأسماء ينتج الـ union من إعدادات المناطق، والفهرسة الأعمق تعطي الرسوم.</title>
  <rect class="d-box" x="10" y="20" width="200" height="190" rx="14"/>
  <text class="d-label-strong" x="110" y="48" text-anchor="middle">القيم (وقت التشغيل)</text>
  <rect class="d-box-accent" x="30" y="90" width="160" height="50" rx="10"/>
  <text class="d-code" x="110" y="120" text-anchor="middle">SHIPPING_ZONES</text>
  <path class="d-arrow" d="M190 115 L268 115" marker-end="url(#arrow)"/>
  <text class="d-code" x="229" y="105" text-anchor="middle">typeof</text>
  <rect class="d-box" x="272" y="20" width="418" height="190" rx="14"/>
  <text class="d-label-strong" x="481" y="48" text-anchor="middle">الأنواع (وقت الترجمة)</text>
  <rect class="d-box-primary" x="292" y="90" width="120" height="50" rx="10"/>
  <text class="d-code" x="352" y="120" text-anchor="middle">Zones</text>
  <path class="d-arrow" d="M412 104 L462 80" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="466" y="58" width="210" height="40" rx="10"/>
  <text class="d-code" x="571" y="83" text-anchor="middle">keyof → 'domestic' | …</text>
  <path class="d-arrow" d="M412 126 L462 150" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="466" y="132" width="210" height="40" rx="10"/>
  <text class="d-code" x="571" y="157" text-anchor="middle">[K]['feeCents'] → 499 | …</text>
</svg>
:::

## keyof: أسماء الخصائص

`keyof T` هو الـ union من أسماء خصائص `T`:

```ts
type Zone = keyof typeof SHIPPING_ZONES; // 'domestic' | 'gulf' | 'europe'
```

أضف `levant` إلى الكائن فيتحدّث `Zone` من تلقاء نفسه. وهذا هو المقصود كله.

تفصيلان يستحقان المعرفة. أولًا، مع نوع فيه index signature مثل `Record<string, number>`، تعطي `keyof` النوع `string` (و`string | number` مع `{ [k: string]: … }`، لأن JavaScript تحوّل المفاتيح الرقمية إلى نصوص). ثانيًا، `keyof` على union تعطي فقط المفاتيح التي يملكها **كل** عضو. `keyof (ShippedOrder | CancelledOrder)` هو `'id' | 'status'`، لأن قراءة `trackingNumber` من شيء قد يكون طلبًا ملغى ليست آمنة.

## الوصول بالفهرس: نوع الخاصية

`T[K]` تبحث عن نوع الخاصية `K` في `T`، بصياغة الأقواس المربّعة نفسها المستخدمة للوصول إلى الخصائص وقت التشغيل:

```ts
type GulfZone = ShippingZones['gulf'];             // { readonly countries: …; readonly feeCents: 1299 }
type GulfFee = ShippingZones['gulf']['feeCents'];  // 1299
type ZoneConfig = ShippingZones[Zone];             // union of all three configs
type FeeCents = ShippingZones[Zone]['feeCents'];   // 499 | 1299 | 999
type ShippingCountry = ShippingZones[Zone]['countries'][number]; // 'US' | 'CA' | 'AE' | …
```

الفهرسة بـ union تعطي union من النتائج، فيكون `ShippingZones[Zone]` هو "نوع قيمة أي منطقة". والتعبير `(typeof X)[keyof typeof X]` هو طريقتك للحصول على الـ union من قيم الكائن، ويتكرّر بما يكفي لأن تسمّيه قواعد كود كثيرة `ValueOf<T>`.

المصفوفات والـ tuples تُفهرس بـ `number`: `T[number]` هو نوع العنصر. هذا هو `(typeof COUNTRIES)[number]` الذي استخدمته في القسم 1، وهو أيضًا السطر الأخير أعلاه، الذي يحفر عبر مستويين من الكائنات ومصفوفة واحدة ليجمع كل دولة في كل منطقة.

الحيلة نفسها تعمل على أنواع API لم تكتبها أنت. إن أعطاك عميل مولَّد نوعًا كبيرًا اسمه `CheckoutResponse`، يمكنك تسمية نوع البند بـ `CheckoutResponse['lines'][number]` بدل نسخ حقوله.

:::mistake استخدام الوصول بالنقطة في الأنواع
`CheckoutResponse.lines` في موضع النوع لا تعني "نوع الخاصية `lines`". يقرأ TypeScript النقطة كبحث في namespace ويبلّغ عن *Cannot access 'CheckoutResponse.lines' because 'CheckoutResponse' is a type, but not a namespace*، مقترحًا الإصلاح مشكورًا. الأنواع تستخدم الأقواس المربّعة دائمًا: `CheckoutResponse['lines']`.
:::

## لماذا تُعيد Object.keys النوع string[]

عاجلًا أو آجلًا ستكتب هذا وتنزعج:

```ts
for (const zone of Object.keys(SHIPPING_ZONES)) {
  SHIPPING_ZONES[zone]; // Error: 'string' can't be used to index type …
}
```

تُعيد `Object.keys` النوع `string[]`، لا `Zone[]`، وهذا مقصود. تذكّر التنميط البنيوي: القيمة التي نوعها `{ a: number }` قد تكون كائنًا فيه عشر خصائص أخرى وقت التشغيل. لو وعدت `Object.keys` بـ `(keyof T)[]`، لكانت تكذب بشأن تلك العشر.

مع كائن `const` عرّفته بنفسك، لا سبيل لتسلّل مفاتيح إضافية إليه، يكون التحويل المحلّي معقولًا وصادقًا: `Object.keys(SHIPPING_ZONES) as Zone[]`. أما مع الكائنات القادمة من مكان آخر، فأبقِ `string` وافحص كل مفتاح.

:::tip اشتقّ في اتجاه واحد
اختر مصدر حقيقة واحدًا واشتقّ منه في اتجاه واحد. إمّا أن يكون كائن وقت التشغيل هو المصدر والأنواع تأتي من `typeof`، أو أن يكون الـ type هو المصدر وقيم وقت التشغيل تُفحص بـ `satisfies`. الخلط بين الاثنين (بعض الحقول مكتوبة يدويًا وبعضها مشتق) هو الطريق الذي يعود منه التباعد.
:::

في التمرين ستشتقّ خمسة أنواع من إعدادات الشحن في Cartwheel ومن استجابة الـ API. والدرس القادم يذهب خطوة أبعد: بدل *قراءة* الخصائص من نوع، ستـ*حوّل* كل خصائص النوع دفعة واحدة.
