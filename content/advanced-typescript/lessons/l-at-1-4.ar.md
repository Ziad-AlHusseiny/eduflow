---
summary: استبدل الأنواع المكدَّسة بالحقول الاختيارية بالـ discriminated unions، كي تحمل كل حالة طلب البيانات التي تملكها بالضبط، وتتوقّف الحالات المستحيلة عن المرور في الترجمة.
takeaways:
  - النوع المكوَّن من حقول اختيارية يسمح بكل تركيباتها، ومعظمها حالات لا يمكن أن تقع في عملك أبدًا.
  - الـ discriminated union يعطي كل حالة نوع كائن خاصًا بها، وتربط بينها خاصية حرفية مشتركة مثل `status`.
  - فحص المميِّز بـ `===` أو `switch` يضيّق الكائن كله، فتصبح الحقول الخاصة بكل حالة متاحة دون `!`.
  - "الدوال التي تنقل بين الحالات يجب أن تقبل وتُعيد أشكالًا محدّدة، مثل `ship(order: ProcessingOrder): ShippedOrder`."
  - نوع الإرجاع الصريح على جملة `switch` فوق المميِّز يحوّل الحالة المنسيّة إلى خطأ ترجمة.
further:
  - title: Discriminated unions (Narrowing)
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  - title: Unions and intersection types (Everyday Types)
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
quiz:
  - q: نوع `Order` فيه `status` بخمس قيم وأربعة حقول اختيارية. كم شكلًا تقريبًا يسمح به النوع، وكم منها حالات صالحة إذا كانت كل حالة تستخدم مجموعة ثابتة من الحقول؟
    options:
      - text: 5 مسموحة و5 صالحة، لأن `status` يتحكّم في الحقول الموجودة.
        why: لا شيء في نوع الحقول الاختيارية يربط الحقول بـ `status`. يراها الـ compiler مستقلة.
      - text: 80 مسموحة (5 × 2⁴) و5 صالحة.
        why: صحيح. كل حقل اختياري يمكن أن يحضر أو يغيب باستقلال، فمعظم التركيبات حالات مستحيلة ومع ذلك تمرّ في الترجمة.
      - text: 20 مسموحة (5 × 4) و5 صالحة.
        why: الحقول الاختيارية تتضاعف ولا تُجمع. أربعة خيارات مستقلة بنعم/لا تعطي 16 تركيبة لكل حالة.
    answer: 1
  - q: |
      بالنظر إلى الـ union أدناه، ما نوع `order` داخل فرع `case 'returned':`؟
      ```ts
      type Order =
        | { status: 'processing'; id: number }
        | { status: 'delivered'; id: number; deliveredAt: string }
        | { status: 'returned'; id: number; deliveredAt: string; refundCents: number };
      ```
    options:
      - text: "`Order`، لأن `switch` لا تضيّق الكائنات"
        why: الـ switch على مميِّز حرفي يضيّق الكائن كله، وهذا هو جوهر النمط.
      - text: "`{ status: 'delivered' … } | { status: 'returned' … }`، لأن كليهما فيه `deliveredAt`"
        why: "الـ narrowing يتبع قيمة المميِّز، لا الحقول المشتركة. عضو واحد فقط فيه `status: 'returned'`."
      - text: "`{ status: 'returned'; id: number; deliveredAt: string; refundCents: number }`"
        why: صحيح. عضو واحد فقط يمكن أن يساوي `status` فيه `'returned'`، فيكون `refundCents` متاحًا كـ `number` عادي.
    answer: 2
  - q: أيّ توقيع يستخدم الـ union على أفضل وجه لمنع شحن الطلب مرتين؟
    options:
      - text: "`ship(order: Order, tracking: string): Order`"
        why: هذا يقبل أيضًا طلبًا مُسلَّمًا أو ملغى، ويفقد المستدعي معرفة أن النتيجة مشحونة.
      - text: "`ship(order: Order, tracking: string): ShippedOrder`"
        why: نوع الإرجاع أفضل، لكن ما زال يمكن تمرير أي طلب، بما فيه طلب شُحن من قبل.
      - text: "`ship(order: ShippedOrder, tracking: string): ShippedOrder`"
        why: هذا لا يقبل إلا الطلبات المشحونة أصلًا، وهو عكس ما يجب أن تسمح به الدالة.
      - text: "`ship(order: ProcessingOrder, tracking: string): ShippedOrder`"
        why: صحيح. لا يدخل إلا طلب قيد المعالجة، ويحصل المستدعي على قيمة يعرف الـ compiler أنها مشحونة.
    answer: 3
  - q: تضيف الحالة `'on-hold'` إلى الـ union المسمّى `Order`. أيّ دالة مضمونٌ أن تحصل على خطأ ترجمة إلى أن تتعامل مع الحالة الجديدة؟
    options:
      - text: دالة نوع إرجاعها `string` وفيها `switch` يعود في كل حالة وليس فيه `default`.
        why: صحيح. مع وجود عضو جديد غير مُعالَج، تصبح نهاية الدالة قابلة للوصول، فيبلّغ TypeScript أنها تفتقد جملة عودة ختامية.
      - text: دالة تستخدم `if (order.status === 'shipped') … else …`.
        why: فرع `else` يمتصّ الحالة الجديدة بصمت، وهذا بالضبط الخطأ الذي تريد تجنّبه.
      - text: دالة فيها فرع `default:` يُعيد `'Unknown'`.
        why: فرع `default` يعالج الحالة الجديدة وقت التشغيل، فلا يجد الـ compiler سببًا للشكوى.
    answer: 0
---

هكذا كان شكل نوع `Order` في Cartwheel قبل أن يفكّر فيه أحد:

```ts
type Order = {
  id: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  trackingNumber?: string; // set once shipped
  deliveredAt?: string;    // set once delivered
  cancelReason?: string;   // set if cancelled
  refundCents?: number;    // set if returned
};
```

يبدو معقولًا، لكنه فخ. كل واحد من الحقول الاختيارية الأربعة يمكن أن يحضر أو يغيب، فيسمح هذا النوع بـ 5 × 2⁴ = 80 شكلًا. وعمل Cartwheel فيه خمسة فقط. طلب مشحون بلا رقم تتبّع يمرّ في الترجمة. طلب ملغى فيه تاريخ تسليم يمرّ. وفي كل مرة تقرأ `order.trackingNumber` تحصل على `string | undefined` فتمدّ يدك إلى `!`، أي أنك تقول للـ compiler "ثق بي" ثمانين مرة في الأسبوع.

## نوع واحد لكل حالة

الـ **discriminated union (الاتحاد المميَّز)** يعطي كل حالة نوع كائن خاصًا بها ويجمعها بـ `|`. لكل عضو خاصية مشتركة بقيمة حرفية مختلفة، هي **المميِّز (discriminant)**:

```ts
type ProcessingOrder = { id: number; status: 'processing' };
type ShippedOrder = { id: number; status: 'shipped'; trackingNumber: string };
type DeliveredOrder = { id: number; status: 'delivered'; trackingNumber: string; deliveredAt: string };
type CancelledOrder = { id: number; status: 'cancelled'; cancelReason: string };
type ReturnedOrder = {
  id: number;
  status: 'returned';
  trackingNumber: string;
  deliveredAt: string;
  refundCents: number;
};

type Order = ProcessingOrder | ShippedOrder | DeliveredOrder | CancelledOrder | ReturnedOrder;
```

الآن يسمح النوع بخمسة أشكال بالضبط. لاحظ أنه لم يعد شيء اختياريًا: الطلب المشحون *له* رقم تتبّع. الحالات المستحيلة لا تُفحص وقت التشغيل؛ بل لا يمكن التعبير عنها أصلًا:

```ts
const o: Order = { id: 1042, status: 'shipped' };
// Error: Type '{ id: number; status: "shipped"; }' is not assignable to type 'Order'.
//   Property 'trackingNumber' is missing in type '{ id: number; status: "shipped"; }'
//   but required in type 'ShippedOrder'.
```

:::figure كل حالة نوعٌ مستقل؛ والانتقالات دوال بينها
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">آلة حالات الطلب. processing ينتقل إلى shipped عبر ship، وshipped إلى delivered عبر deliver، وdelivered إلى returned عبر refund. ويمكن أن ينتقل processing أيضًا إلى cancelled عبر cancel. كل صندوق حالة يسرد الحقول التي يضيفها.</title>
  <rect class="d-box-primary" x="10" y="40" width="150" height="64" rx="12"/>
  <text class="d-code" x="85" y="68" text-anchor="middle">processing</text>
  <text class="d-label-muted" x="85" y="90" text-anchor="middle">id</text>
  <rect class="d-box-accent" x="190" y="40" width="150" height="64" rx="12"/>
  <text class="d-code" x="265" y="68" text-anchor="middle">shipped</text>
  <text class="d-label-muted" x="265" y="90" text-anchor="middle">+ trackingNumber</text>
  <rect class="d-box-success" x="370" y="40" width="150" height="64" rx="12"/>
  <text class="d-code" x="445" y="68" text-anchor="middle">delivered</text>
  <text class="d-label-muted" x="445" y="90" text-anchor="middle">+ deliveredAt</text>
  <rect class="d-box" x="550" y="40" width="140" height="64" rx="12"/>
  <text class="d-code" x="620" y="68" text-anchor="middle">returned</text>
  <text class="d-label-muted" x="620" y="90" text-anchor="middle">+ refundCents</text>
  <rect class="d-box-warn" x="10" y="150" width="150" height="64" rx="12"/>
  <text class="d-code" x="85" y="178" text-anchor="middle">cancelled</text>
  <text class="d-label-muted" x="85" y="200" text-anchor="middle">+ cancelReason</text>
  <path class="d-arrow" d="M160 72 L186 72" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 72 L366 72" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M520 72 L546 72" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M85 104 L85 146" marker-end="url(#arrow)"/>
  <text class="d-code" x="173" y="30" text-anchor="middle">ship</text>
  <text class="d-code" x="353" y="30" text-anchor="middle">deliver</text>
  <text class="d-code" x="533" y="30" text-anchor="middle">refund</text>
  <text class="d-code" x="100" y="130">cancel</text>
</svg>
:::

## الـ narrowing على المميِّز

فحص المميِّز يضيّق الكائن كله. داخل كل `case`، يعرف TypeScript بالضبط أيّ عضو بين يديك:

```ts
function describe(order: Order): string {
  switch (order.status) {
    case 'processing':
      return `#${order.id} is being packed`;
    case 'shipped':
      return `#${order.id} is on its way (${order.trackingNumber})`;
    case 'delivered':
      return `#${order.id} arrived on ${order.deliveredAt}`;
    case 'cancelled':
      return `#${order.id} was cancelled: ${order.cancelReason}`;
    case 'returned':
      return `#${order.id} was refunded $${(order.refundCents / 100).toFixed(2)}`;
  }
}
```

لا `!` ولا `?.` ولا `?? ''`. ولاحظ نوع الإرجاع الصريح `: string`. إذا أضاف أحدهم الحالة `'on-hold'` إلى الـ union الشهر القادم، تصبح نهاية هذه الدالة قابلة للوصول، فيبلّغ TypeScript عن *Function lacks ending return statement and return type does not include 'undefined'*. الـ compiler يجد كل مكان يحتاج إلى تحديث. وستجعل هذا الفحص صريحًا وأعلى صوتًا باستخدام `never` في [الـ Branded Types والفحوص الشاملة](lesson:l-at-4-1).

## الانتقالات دوالٌ بين الحالات

يؤتي الـ union أكبر ثماره في الدوال التي تغيّر الحالة. حدّد أنواع مدخلاتها ومخرجاتها كأشكال محدّدة:

```ts
function ship(order: ProcessingOrder, trackingNumber: string): ShippedOrder {
  return { id: order.id, status: 'shipped', trackingNumber };
}

function cancel(order: ProcessingOrder, reason: string): CancelledOrder {
  return { id: order.id, status: 'cancelled', cancelReason: reason };
}
```

الآن صار "لا يمكنك شحن طلب مرتين" و"لا يمكنك إلغاء طلب مشحون" حقيقتين وقت الترجمة. المستدعي الذي بين يديه `Order` عليه أن يضيّق النوع أولًا:

```ts
function shipIfReady(order: Order, tracking: string): Order {
  if (order.status !== 'processing') return order;
  return ship(order, tracking); // order is ProcessingOrder here
}
```

أنواع الإرجاع مهمة بقدر المعاملات. لأن `ship` تُعيد `ShippedOrder` لا `Order`، يستطيع المستدعي تسليم النتيجة مباشرة إلى دالة تحتاج رقم تتبّع، مثل `printLabel(shipped)`، دون فحص `status` مرة أخرى. كل انتقال يحمل المعرفة إلى الأمام. أعِد الـ `Order` الواسع وستكون قد رميت تلك المعرفة، وأجبرت كل مستدعٍ على التضييق من جديد.

:::mistake مميِّز ليس حرفيًا
لا يعمل النمط إلا حين يكون مميِّز كل عضو literal type (نوعًا حرفيًا). إذا وصل `status` بنوع `string` (من استجابة API بلا أنواع مثلًا)، فلن يضيّق فحصه شيئًا، وتعود إلى `!` في كل مكان. حلّل الاستجابة إلى الـ union عند حافة تطبيقك، وهذا موضوع [تحليل البيانات غير الموثوقة عند الحدود](lesson:l-at-4-3)، وأبقِ `string` خارج القلب.
:::

:::tip سمِّ الأشكال
يمكنك كتابة الـ union مباشرة دون أسماء، لكن تسمية كل عضو (`ShippedOrder` و`CancelledOrder`) تمنحك المفردات اللازمة لدوال الانتقال وتجعل رسائل الخطأ مقروءة. رسالة عن `ShippedOrder` أسهل بكثير في التصرّف بناءً عليها من رسالة عن نوع كائن مجهول من 200 حرف.
:::

## مشاركة الحقول المشتركة

للطلبات الحقيقية أكثر من `id`: عميل، وطابع زمني لوقت الطلب، وبنود. تكرار هذه في خمسة أشكال يدعو إلى التباعد بينها، فاسحبها إلى نوع أساسي وقاطعه مع حقول كل حالة:

```ts
type OrderBase = { id: number; customerId: number; placedAt: string };

type Shipped = OrderBase & { status: 'shipped'; trackingNumber: string };
type Cancelled = OrderBase & { status: 'cancelled'; cancelReason: string };
```

يبقى كل شكل عضوًا مستقلًا بـ `status` حرفي خاص به، فيعمل الـ narrowing تمامًا كما من قبل. ويعطيك النوع الأساسي أيضًا نوع معامل طبيعيًا للدوال التي لا تهتم بالحالة، مثل `function customerLink(order: OrderBase)`، التي تقبل كل الأشكال.

يمكنك أيضًا تفكيك المميِّز. منذ TypeScript 4.4، تضيّق `const { status } = order; if (status === 'shipped') { … }` النوعَ `order` أيضًا، ما دام `order` ثابتًا `const` أو معاملًا لم يُعَد الإسناد إليه. هذا يُبقي جمل `switch` الطويلة مقروءة دون التخلّي عن الـ narrowing.

## متى لا تستخدمه

الـ discriminated union هو الخيار الصحيح حين تحمل الحالات *بيانات مختلفة*. أما حين تختلف الأشكال في التسمية فقط (مثلًا `channel` بقيم `'web' | 'mobile_app' | 'marketplace'` والحقول نفسها)، فيكفي union حرفي بسيط على خاصية واحدة. الجأ إلى النمط الكامل حين تضبط نفسك تكتب حقولًا اختيارية مع تعليقات مثل "تُضبط فقط حين…".

في التمرين، ستحوّل `Order` المليء بالحقول الاختيارية في Cartwheel إلى union، وتجعل `ship` لا تقبل إلا الطلبات القابلة للشحن. الدرس القادم: الـ literal types و`as const` و`satisfies`، الأدوات التي تمنع تلك القيم الحرفية من الاتساع مجددًا إلى `string`.
