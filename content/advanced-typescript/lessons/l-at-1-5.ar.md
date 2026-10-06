---
summary: امنع القيم الحرفية من الاتساع إلى string، واشتقّ أنواع union من مصفوفات وقت التشغيل باستخدام as const، وتحقّق من كائنات الإعداد بـ satisfies دون أن تفقد أنواعها الدقيقة.
takeaways:
  - "متغيّرات `let` وخصائص الكائنات توسّع القيم الحرفية إلى `string` أو `number`؛ أما متغيّرات `const` فتحتفظ بالقيمة الحرفية."
  - "`as const` تجعل القيمة للقراءة فقط بعمق وتحتفظ بكل قيمة حرفية، ما يتيح لك اشتقاق نوع union من مصفوفة وقت التشغيل."
  - "التعليق النوعي (annotation) يستبدل النوع المستنتَج بالنوع المكتوب؛ أما `satisfies` فتتحقّق مقابل نوع وتحتفظ بالنوع المستنتَج."
  - "تأكيدات `as` تتخطّى فحوصًا مثل الخصائص الناقصة، لذا استخدم `satisfies` حين تريد تحقّقًا لا ثقة عمياء."
further:
  - title: The satisfies operator (TypeScript 4.9 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html
  - title: Literal types
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types
  - title: const assertions (TypeScript 3.4 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
quiz:
  - q: |
      لماذا تفشل `save(draft)` حين يكون `Order['status']` هو `'processing' | 'shipped'`؟
      ```ts
      const draft = { id: 1001, status: 'processing' };
      save(draft);
      ```
    options:
      - text: لأن `const` تجعل الكائن كله للقراءة فقط، و`save` تتوقّع كائنًا قابلًا للتعديل.
        why: "`const` تمنع فقط إعادة الإسناد إلى `draft`. أما خصائصه فتبقى قابلة للتعديل، ولهذا بالضبط تتّسع."
      - text: لأن `draft.status` يُستنتج على أنه `string`؛ خصائص الكائنات تتّسع لأنه قد يُعاد الإسناد إليها لاحقًا.
        why: صحيح. اكتب القيمة الحرفية حيث يكون النوع معروفًا (`save({ … })`)، أو علّق `draft` بالنوع `Order`، أو استخدم `as const`.
      - text: لأن `draft` ليس فيه `customerId`.
        why: الـ `Order` في السؤال لا يحتاج إلا `id` و`status`. الفشل سببه `status` المتّسع.
    answer: 1
  - q: |
      ما هو `Country` هنا؟
      ```ts
      const COUNTRIES = ['EG', 'AE', 'GB'] as const;
      type Country = (typeof COUNTRIES)[number];
      ```
    options:
      - text: "`string`"
        why: هذه ستكون النتيجة دون `as const`، حيث تُستنتج المصفوفة على أنها `string[]`.
      - text: "`readonly ['EG', 'AE', 'GB']`"
        why: هذا هو `typeof COUNTRIES`. وفهرسته بـ `[number]` تعطي نوع عناصره.
      - text: "`'EG' | 'AE' | 'GB'`"
        why: صحيح. `as const` تحتفظ بالقيم الحرفية، و`[number]` تطلب نوع أي عنصر في الـ tuple.
    answer: 2
  - q: |
      عُرّف `coupons` مع `satisfies Record<string, Coupon>`. أيّ سطر يُعدّ خطأً؟
      ```ts
      type Coupon = { kind: 'percent'; percentOff: number } | { kind: 'free-shipping' };
      const coupons = {
        WELCOME10: { kind: 'percent', percentOff: 10 },
        FREESHIP: { kind: 'free-shipping' },
      } satisfies Record<string, Coupon>;
      ```
    options:
      - text: "`coupons.WELCOME10.percentOff`"
        why: "`satisfies` تحتفظ بالنوع المستنتَج، فيعرف TypeScript أن `WELCOME10` هو شكل النسبة المئوية وأن `percentOff` موجودة."
      - text: "`coupons.FREESHIP.kind === 'free-shipping'`"
        why: النوع المستنتَج لـ `kind` هو القيمة الحرفية `'free-shipping'`، فهذه المقارنة صالحة (وصادقة دائمًا).
      - text: "`coupons.SPRING15`"
        why: صحيح. النوع المستنتَج لا يحتوي إلا المفتاحين اللذين كتبتهما، فقراءة مفتاح مجهول خطأ، بخلاف التعليق النوعي `Record<string, Coupon>`.
    answer: 2
  - q: "يكتب زميل `const config = { retries: 3 } as CheckoutConfig;`، و`CheckoutConfig` يتطلّب أيضًا `timeoutMs`. ماذا يحدث؟"
    options:
      - text: يمرّ في الترجمة، لأن التأكيد لا يحتاج إلا أن يتداخل النوعان؛ ولا يُبلَّغ أبدًا عن `timeoutMs` الناقصة.
        why: صحيح. `as` تطلب من الـ compiler أن يثق بك. استخدم `satisfies CheckoutConfig` أو تعليقًا نوعيًا لتحصل على خطأ الخاصية الناقصة.
      - text: يفشل مع "Property 'timeoutMs' is missing".
        why: هذا الخطأ يأتي من التعليقات النوعية ومن `satisfies`. أما التأكيد فلا يرفض إلا الأنواع التي لا تتداخل إطلاقًا.
      - text: "يضيف `timeoutMs: undefined` إلى الكائن وقت التشغيل."
        why: تأكيدات الأنواع تُمحى كليًا؛ لا تضيف قيمًا ولا تغيّرها أبدًا.
    answer: 0
---

إليك بلاغ خطأ قدّمه كل فريق TypeScript مرة على الأقل: "أمرّر النص الصحيح بالضبط ويقول لي `Type 'string' is not assignable to type 'OrderStatus'`."

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
type Order = { id: number; status: OrderStatus };
function save(order: Order) {}

const draft = { id: 1001, status: 'processing' };
save(draft);
// Error: Argument of type '{ id: number; status: string; }' is not assignable
// to parameter of type 'Order'.
```

النص *هو* `'processing'` فعلًا. لكن TypeScript لم يستنتج له `'processing'`، بل استنتج `string`. هذا هو **الاتساع (widening)**، وفهمه يشرح ثلاث أدوات ستستخدمها كل أسبوع: الـ literal types (الأنواع الحرفية)، و`as const`، و`satisfies`.

## لماذا تتّسع القيم الحرفية

يستنتج TypeScript النوع الذي يُرجَّح أن تحمله القيمة *طوال حياتها*، لا القيمة التي تبدأ بها فقط. الـ `const` لا يمكن أن يتغيّر أبدًا، فيحتفظ بالقيمة الحرفية. أما `let` أو خاصية الكائن فيمكن إعادة الإسناد إليهما، فيوسّعهما TypeScript:

```ts
const a = 'processing';           // 'processing'
let b = 'processing';             // string
const c = { status: 'processing' }; // { status: string }
```

الأخيرة هي المفاجأة. `const c` تمنعك من إعادة الإسناد إلى `c`، لكن `c.status = 'anything'` ما زالت JavaScript مشروعة، فتتّسع الخاصية إلى `string`.

هناك ثلاثة إصلاحات جيدة، مرتّبة حسب الأفضلية. اكتب القيمة الحرفية حيث يكون النوع معروفًا أصلًا (`save({ id: 1001, status: 'processing' })`)، فتُفحص مقابل `Order` مباشرة. أو علّق المتغيّر بنوعه (`const draft: Order = …`) حين تبنيه مسبقًا. أو استخدم `as const`، وهي موضوعنا التالي.

## as const: جمّد القيم الحرفية

`as const` تطلب من TypeScript أن يستنتج أضيق نوع ممكن: كل قيمة حرفية تبقى حرفية، وكل مصفوفة تصبح tuple للقراءة فقط، وكل خاصية تصبح `readonly`:

```ts
const COUNTRIES = ['EG', 'AE', 'SA', 'JO', 'GB', 'DE', 'US', 'CA'] as const;
// readonly ['EG', 'AE', 'SA', 'JO', 'GB', 'DE', 'US', 'CA']

type Country = (typeof COUNTRIES)[number];
// 'EG' | 'AE' | 'SA' | 'JO' | 'GB' | 'DE' | 'US' | 'CA'
```

ذلك السطر الثاني من أنفع الأنماط في TypeScript اليومية. `typeof COUNTRIES` تحوّل القيمة إلى نوعها، و`[number]` تسأل "ما النوع الذي أحصل عليه حين أفهرس هذا بأي رقم؟" (ستتعرّف على هذين العاملين (operators) كما ينبغي في [keyof و typeof وأنواع الوصول بالفهرس](lesson:l-at-3-1)). والنتيجة union **مشتقّ من مصفوفة وقت التشغيل**. تحصل على مصدر حقيقة واحد: المصفوفة موجودة وقت التشغيل للقوائم المنسدلة والتحقّق، والنوع يتبعها تلقائيًا.

```ts
function isCountry(value: string): value is Country {
  return (COUNTRIES as readonly string[]).includes(value);
}
```

التحويل الموسِّع داخل `isCountry` ضروري لأن `includes` على tuple من القيم الحرفية لا تقبل إلا تلك القيم، وهذا يُفسد الغاية من فحص نص اعتباطي.

:::tip فضّل الـ unions الحرفية على الـ enums
`enum OrderStatus { Processing = 'processing', … }` يعطيك union مشابهًا، لكن الـ enums تولّد كودًا وقت التشغيل، ولا تتوافق مع القيم النصية العادية القادمة من JSON دون تحويل، ولا يدعمها تجريد الأنواع (type stripping): يرفضها دعم TypeScript المدمج في Node، وكذلك الخيار `erasableSyntaxOnly`. مصفوفة أو كائن `as const` مع union مشتقّ يؤدّيان المهمة نفسها بـ JavaScript عادية.
:::

## التعليق النوعي مقابل satisfies

كوبونات Cartwheel موجودة في كائن إعداد. الطريقة البديهية لتحديد نوعه هي التعليق النوعي:

```ts
type Coupon = { kind: 'percent'; percentOff: number } | { kind: 'free-shipping' };

const coupons: Record<string, Coupon> = {
  WELCOME10: { kind: 'percent', percentOff: 10 },
  FREESHIP: { kind: 'free-shipping' },
};

coupons.WELCOME10.percentOff; // Error: Property 'percentOff' does not exist on type 'Coupon'.
coupons.SPRNG15;              // compiles, undefined at runtime
```

التعليق النوعي *يستبدل* ما كان TypeScript يعرفه. كتبت `WELCOME10` ككوبون نسبة مئوية، لكن نوعه صار مجرّد `Coupon`، والكائن يقبل أي مفتاح على الإطلاق، بما فيها الأخطاء الإملائية.

أما `satisfies` فتتحقّق من القيمة مقابل نوع **دون أن تستبدل النوع المستنتَج**:

```ts
const coupons = {
  WELCOME10: { kind: 'percent', percentOff: 10 },
  FREESHIP: { kind: 'free-shipping' },
} satisfies Record<string, Coupon>;

coupons.WELCOME10.percentOff; // number
coupons.SPRNG15;              // Error: Property 'SPRNG15' does not exist on type …
```

ما زلت تحصل على التحقّق: `percentof` المكتوبة خطأً أو `kind: 'bogo'` تُعلَّم مباشرة في الكائن الحرفي. وتحتفظ بالمفاتيح والأشكال الدقيقة. كما أن `satisfies` تحدّد نوع القيم الحرفية من السياق، فيبقى `kind` بقيمة `'percent'` بدل أن يتّسع إلى `string`، دون الحاجة إلى `as const`.

استخدم التركيبة `as const satisfies T` حين تريد الأمرين: قيمًا حرفية للقراءة فقط بعمق، وفحصًا مقابل شكل. تُقرأ من اليسار إلى اليمين هكذا: "جمّد هذا، ثم تأكّد أنه مناسب".

:::mistake استخدام as لإخفاء خطأ
`const config = { retries: 3 } as CheckoutConfig` يمرّ في الترجمة حتى حين يتطلّب `CheckoutConfig` الخاصية `timeoutMs`، لأن التأكيد لا يفحص إلا تداخل النوعين. إنه أنت تنقض حكم الـ compiler. احتفظ بـ `as` للحالة النادرة التي تعرف فيها أكثر من TypeScript (واترك تعليقًا يشرح السبب). وحين تريد فحصًا، استخدم تعليقًا نوعيًا أو `satisfies`.
:::

## الاختيار بينها

قاعدة افتراضية بسيطة: **علّق** معاملات الدوال وأنواع الإرجاع والمتغيّرات التي يجب أن يكون نوعها هو النوع العام (`let current: Order`). استخدم **`satisfies`** لكائنات الإعداد وجداول البحث وكل ما تهمّ فيه المفاتيح والقيم المحدّدة لاحقًا. واستخدم **`as const`** للقوائم الثابتة التي تريدها union. الثلاثة كلها وقت الترجمة فقط؛ لا يغيّر أيٌّ منها بايتًا واحدًا من JavaScript الناتجة.

في التمرين ستشتقّ `Country` من قائمة دول Cartwheel، وتحدّد نوع جدول العملات بحيث يرفض الدول المجهولة ويتذكّر العملات بدقة. بهذا تكتمل أدوات التصميم في هذا القسم؛ وبعده تنتقل إلى الـ generics، بدءًا بالعلاقات التي تعبّر عنها.
