---
summary: استخدم typeof والمساواة وin وinstanceof والعودة المبكرة لتضييق الأنواع الواسعة، وتعرّف على المواضع التي ينسى فيها TypeScript الـ narrowing كي تحافظ عليه.
takeaways:
  - يمنح تحليل تدفّق التحكّم المتغيّرَ نوعًا مختلفًا عند كل نقطة في الكود، بناءً على الفحوص وجمل العودة التي سبقتها.
  - فحوص الصدقية (truthiness) تُزيل أيضًا `0` و`''`، لذا قارن مع `null` أو `undefined` صراحةً حين تكون لهاتين القيمتين دلالة.
  - يسقط الـ narrowing لخاصية قابلة للتغيير داخل الـ callbacks؛ انسخ القيمة إلى `const` قبل الـ callback لتحافظ عليه.
  - منذ TypeScript 5.5، تُستنتج الدالة السهمية البسيطة مثل `(c) => c !== null` الممرَّرة إلى `filter` على أنها type predicate، فتضيق النتيجة.
further:
  - title: Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  - title: TypeScript 5.5 release notes (inferred type predicates)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html
quiz:
  - q: |
      قيمة `shippingFeeCents` هي `null` حين لا تكون الرسوم معروفة بعد، و`0` للشحن المجاني. ماذا تُعيد هذه الدالة لطلب شحنه مجاني؟
      ```ts
      function label(fee: number | null) {
        if (!fee) return 'Calculated at checkout';
        return fee === 0 ? 'Free' : `${fee / 100}`;
      }
      ```
    options:
      - text: "'Free'"
        why: فرع `'Free'` لا يمكن الوصول إليه مع `0`، لأن `!0` تساوي `true` فتُنفَّذ جملة العودة الأولى قبله.
      - text: "'Calculated at checkout'"
        why: صحيح. فحص الصدقية يعامل `0` كما يعامل `null`. اكتب `if (fee === null)` بدلًا منه.
      - text: "'0'"
        why: لا تصل الدالة أبدًا إلى النص القالبي مع `0`؛ فحص الصدقية يعود قبل ذلك.
      - text: لا يمرّ في الترجمة، لأن `fee === 0` لا تداخل فيه بعد الفحص.
        why: بعد أن يعود `!fee`، يبقى `fee` من نوع `number`، ومقارنة `number` بـ `0` مسموحة. الخطأ صامت.
    answer: 1
  - q: |
      لماذا يكون `order.coupon` خطأً داخل الـ callback؟
      ```ts
      if (order.coupon !== null) {
        names.map((n) => `${n}: ${order.coupon.toUpperCase()}`);
      }
      ```
    options:
      - text: لأن callbacks الدالة `map` لا تُفحص أنواعها تحت `strict`.
        why: الـ callbacks تُفحص بالكامل. والخطأ موجود تحديدًا لأنها تُفحص.
      - text: لأن TypeScript لا يمكنه معرفة متى يُنفَّذ الـ callback، و`order.coupon` خاصية قابلة للتغيير قد تصبح `null` حينها.
        why: صحيح. تضييق خاصية قابلة للتغيير لا ينتقل إلى دالة أُنشئت داخل الكتلة. انسخها إلى `const` أولًا.
      - text: لأن `!== null` لا تضيّق النوع؛ تحتاج إلى `typeof order.coupon === 'string'`.
        why: المقارنة مع `null` تضيّق النوع جيدًا خارج الـ callback. المشكلة في حدود الـ callback، لا في الفحص.
    answer: 1
  - q: في TypeScript 5.9، ما نوع `codes`؟
    options:
      - text: "`string[]` حين تُكتب `coupons.filter((c) => c !== null)` مع `coupons: (string | null)[]`"
        why: صحيح. يستنتج TypeScript 5.5 وما بعده أن `(c) => c !== null` هي الـ predicate `c is string`، فتضيّق `filter` المصفوفة.
      - text: "`string[]` حين تُكتب `coupons.filter(Boolean)`"
        why: "`Boolean` ليست type predicate، وفحص الصدقية لا يمكن أن يكون واحدًا أصلًا لأنه يُزيل `''` أيضًا. تبقى النتيجة `(string | null)[]`."
      - text: "`string[]` حين تُكتب `coupons.filter((c) => !!c)`"
        why: لا تُستنتج الصدقية على أنها predicate، لأن النتيجة الكاذبة لا تثبت أن القيمة `null`؛ فقد تكون `''`.
    answer: 0
  - q: "أيّ فحص يضيّق `input: Order | Order[]` إلى `Order[]`؟"
    options:
      - text: "`typeof input === 'array'`"
        why: "`typeof` لا تُعيد أبدًا `'array'`؛ مع المصفوفات تُعيد `'object'`، ويعلّم TypeScript هذه المقارنة."
      - text: "`input instanceof Object`"
        why: كلٌّ من `Order` والمصفوفة كائنات، فلا يستطيع هذا الفحص التمييز بينهما.
      - text: "`'length' in input`"
        why: هذا يضيّق النوع فقط إن لم يكن لـ `Order` خاصية `length`، وهذا هشّ؛ الفحص المخصَّص أوضح وأأمن.
      - text: "`Array.isArray(input)`"
        why: صحيح. `Array.isArray` معرَّفة كـ type predicate، فيرى الفرع الصادق `Order[]` ويرى الفرع الكاذب `Order`.
    answer: 3
---

لطلب Cartwheel الحقل `shippingFeeCents: number | null`. القيمة `null` تعني أن الرسوم غير معروفة بعد (العنوان غير مكتمل). و`0` تعني شحنًا مجانيًا. هذه هي التسمية المعروضة عند الدفع، كما كُتبت أول مرة:

```ts
function shippingLabel(feeCents: number | null): string {
  if (!feeCents) return 'Calculated at checkout';
  if (feeCents === 0) return 'Free';
  return `$${(feeCents / 100).toFixed(2)}`;
}
```

كل عميل شحنه مجاني رأى "Calculated at checkout". لم يشتكِ TypeScript، لأن `feeCents` بعد السطر الأول من نوع `number`، ومقارنة رقم بـ `0` أمر مشروع تمامًا. الأنواع كانت صحيحة؛ الـ narrowing (تضييق النوع) هو الخاطئ. هذا الدرس عن كيفية تضييق TypeScript للأنواع، كي تجعله يعمل لصالحك بدل أن تثق به ثقة عمياء.

## تحليل تدفّق التحكّم

يتتبّع TypeScript نوع كل متغيّر عبر كل فرع وكل جملة عودة. يمكن أن يكون للاسم نفسه نوع مختلف في كل سطر:

```ts
function shippingLabel(feeCents: number | null): string {
  // feeCents: number | null
  if (feeCents === null) return 'Calculated at checkout';
  // feeCents: number
  if (feeCents === 0) return 'Free';
  // feeCents: number
  return `$${(feeCents / 100).toFixed(2)}`;
}
```

هذا هو **تحليل تدفّق التحكّم (control-flow analysis)**. كل فحص يقسم التدفّق إلى فروع، وفي كل فرع يكون نوع المتغيّر هو مجموعة القيم التي يمكن أن تبقى هناك. وحين يعود فرعٌ، لا يرى الكود بعده إلا ما تبقّى.

:::figure كل فحص يقسم التدفّق؛ والنوع بعده هو ما يمكن أن يبقى
<svg viewBox="0 0 680 300" role="img" aria-labelledby="t1">
  <title id="t1">تدفّق التحكّم في shippingLabel. يبدأ المعامل بنوع number أو null. الفحص feeCents يساوي null يتفرّع إلى جملة عودة نوعها null. المسار المتبقّي نوعه number، ثم الفحص feeCents يساوي 0 يتفرّع إلى جملة عودة للشحن المجاني، والمسار الأخير رسوم موجبة من نوع number.</title>
  <rect class="d-box-accent" x="230" y="14" width="220" height="44" rx="10"/>
  <text class="d-code" x="340" y="42" text-anchor="middle">number | null</text>
  <path class="d-arrow" d="M340 58 L340 92" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="230" y="96" width="220" height="40" rx="10"/>
  <text class="d-code" x="340" y="121" text-anchor="middle">feeCents === null ?</text>
  <path class="d-arrow" d="M230 116 L110 116 L110 150" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="160" y="108" text-anchor="middle">نعم</text>
  <rect class="d-box" x="20" y="154" width="180" height="44" rx="10"/>
  <text class="d-code" x="110" y="181" text-anchor="middle">null → "Calculated…"</text>
  <path class="d-arrow" d="M340 136 L340 170" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="356" y="158">لا</text>
  <rect class="d-box-warn" x="230" y="174" width="220" height="40" rx="10"/>
  <text class="d-code" x="340" y="199" text-anchor="middle">number: === 0 ?</text>
  <path class="d-arrow" d="M450 194 L570 194 L570 228" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="510" y="186" text-anchor="middle">نعم</text>
  <rect class="d-box" x="480" y="232" width="180" height="44" rx="10"/>
  <text class="d-code" x="570" y="259" text-anchor="middle">0 → "Free"</text>
  <path class="d-arrow" d="M340 214 L340 248" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="230" y="252" width="220" height="40" rx="10"/>
  <text class="d-code" x="340" y="277" text-anchor="middle">number → "$4.99"</text>
</svg>
:::

## صندوق أدوات الـ narrowing

تضيّق الأنواع بفحوص JavaScript عادية؛ ويفهم TypeScript كل واحد منها:

| الفحص | ما يضيّقه | مثال |
|---|---|---|
| `typeof x === 'string'` | الأنواع الأولية | `typeof amount === 'number'` |
| `x === null`، `x !== undefined` | القيم الحرفية | `coupon !== null` |
| `'prop' in x` | unions الكائنات حسب الخاصية | `'trackingNumber' in shipment` |
| `x instanceof C` | نُسخ الأصناف | `err instanceof TypeError` |
| `Array.isArray(x)` | المصفوفات | `Array.isArray(input)` |

فحص الصدقية (truthiness)، أي `if (x)`، يضيّق النوع أيضًا، وهو الفحص الذي يجب أن تحذر منه. فهو يُزيل `null` و`undefined`، لكنه يُزيل أيضًا `0` و`''` و`NaN` و`false`. مع كائن أو مصفوفة، فحص الصدقية مقبول. أما مع رقم أو نص يعني فيه الصفر أو الفراغ شيئًا، فقارن مع `null` صراحةً.

### `in` و`instanceof` عمليًا

فحصان يستحقان نظرة أقرب لأن عميل الدفع يستخدمهما باستمرار. يجيب مزوّد الدفع بأحد شكلين، وواحد منهما فقط فيه `receiptId`:

```ts
type PaymentReply = { receiptId: string; capturedCents: number } | { declineCode: string };

function summarize(reply: PaymentReply): string {
  if ('receiptId' in reply) return `Paid, receipt ${reply.receiptId}`;
  return `Declined (${reply.declineCode})`;
}
```

`'receiptId' in reply` تُبقي فقط أعضاء الـ union التي تعرّف `receiptId`. هذا يعمل، لكنه يضيّق النوع بناءً على *غياب* حقل في الأعضاء الأخرى، فإضافة `receiptId?` إلى شكل الرفض لاحقًا ستكسره بصمت. حين تتحكّم في الأنواع، يكون المميِّز الحرفي (الدرس القادم) أمتن.

و`instanceof` هي أداة الأخطاء. تحت `strict`، يكون المتغيّر في جملة `catch` من نوع `unknown`، لأن JavaScript تسمح لك برمي (`throw`) أي شيء. فتضيّق النوع قبل أن تلمسه:

```ts
function describeFailure(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown error';
}
```

:::mistake الصدقية مع الأرقام والنصوص
`if (!order.discount)` و`if (!feeCents)` و`if (!couponCode)` كلها تعامل `0` أو `''` ذات المعنى على أنها "مفقودة". ولن يحذّرك TypeScript، لأن القراءتين كلتيهما صحيحتان من حيث النوع. حين يمكن أن تكون القيمة صفرًا أو فارغة بشكل مشروع، اكتب `=== null` أو `=== undefined`.
:::

## أين يضيع الـ narrowing

الـ narrowing حقيقةٌ عن نقطة واحدة في التدفّق. والـ callback يُنفَّذ في وقت آخر، لذا يحذر TypeScript مما يحمله إلى داخله:

```ts
type Order = { id: number; couponCode: string | null };

function couponBanner(order: Order, names: string[]): string[] {
  if (order.couponCode === null) return [];
  return names.map((n) => `${n}, ${order.couponCode.toUpperCase()} is applied`);
  // Error: 'order.couponCode' is possibly 'null'.
}
```

خارج الدالة السهمية، `order.couponCode` من نوع `string`. وداخلها يختفي الـ narrowing، لأن `couponCode` خاصية قابلة للتغيير وقد يعيدها شيءٌ إلى `null` قبل أن تستدعي `map` الـ callback. والإصلاح هو التقاط القيمة المضيَّقة في `const`، وهو لا يمكن أن يتغيّر أبدًا:

```ts
function couponBanner(order: Order, names: string[]): string[] {
  const code = order.couponCode;
  if (code === null) return [];
  return names.map((n) => `${n}, ${code.toUpperCase()} is applied`);
}
```

منذ TypeScript 5.4، تحتفظ المعاملات ومتغيّرات `let` أيضًا بتضييقها داخل الـ callbacks، ما دام لا يُعاد الإسناد إليها بعد إنشاء الـ callback. أما الخصائص فلا تحتفظ به أبدًا. النسخ إلى `const` يعمل في كل الإصدارات ويجعل النية واضحة.

:::note TypeScript متفائل تجاه استدعاءات الدوال
الحالة المعاكسة مسموحة: بعد `if (order.couponCode !== null) { applyDiscount(order); … }`، ما زال TypeScript يعامل `order.couponCode` على أنه `string`، مع أن `applyDiscount` ربما غيّرته. إعادة الفحص بعد كل استدعاء كانت ستجعل الـ narrowing بلا فائدة، لذا يثق بك TypeScript هنا. تجنّب الدوال التي تعدّل وسائطها ولن يلسعك هذا أبدًا.
:::

## تضييق المصفوفات بـ filter

كانت `filter` مصدر إحباط كلاسيكيًا: `coupons.filter((c) => c !== null)` كان نوعها يبقى `(string | null)[]`. منذ TypeScript 5.5، **يستنتج TypeScript الـ type predicate** من الدوال السهمية البسيطة مثل هذه، فتكون النتيجة `string[]`:

```ts
const coupons: (string | null)[] = ['WELCOME10', null, 'LOYAL5'];
const codes = coupons.filter((c) => c !== null); // string[]
```

لا يحدث الاستنتاج إلا حين يثبت الفحصُ النوعَ في الاتجاهين. `(c) => !!c` لا تُستنتج على أنها predicate: فالنتيجة الكاذبة قد تعني `''` لا `null`، فلا يستطيع TypeScript أن يستنتج أن القيمة المرفوضة هي `null`. والأمر نفسه مع `filter(Boolean)`. اكتب المقارنة الصريحة وستحصل على الـ narrowing وعلى التعامل الصحيح مع النصوص الفارغة معًا.

التمرين أدناه يجمع الأخطاء الثلاثة من هذا الدرس في ملف واحد. وفي الدرس التالي ستصمّم أنواعًا تجعل الـ narrowing شبه تلقائي: الـ discriminated unions.
