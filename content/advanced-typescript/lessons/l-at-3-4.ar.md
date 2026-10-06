---
summary: ابنِ أنواعًا نصية من أنواع أخرى بالـ template literals، وحوّلها بـ Uppercase وCapitalize، وحلّل أنماط المسارات بـ infer لتحديد أنواع معاملات المسار.
takeaways:
  - "الـ template literal type مثل `` `order.${OrderStatus}` `` يبني literal types نصية، والـ union داخله ينتج كل التركيبات."
  - "`Uppercase` و`Lowercase` و`Capitalize` و`Uncapitalize` أنواع مدمجة تحوّل الـ literal types النصية."
  - "`infer` داخل نمط template literal تلتقط أجزاءً من النص، ما يتيح لك تحليل أنماط مسارات مثل `/orders/:orderId` على مستوى الأنواع."
  - "العناصر النائبة `${number}` و`${string}` تقبل أنماطًا فضفاضة؛ توثّق صيغة لكنها لا تتحقّق منها بصرامة."
  - الـ unions داخل الـ template literals تتضاعف، ويرفض TypeScript الـ unions التي تتجاوز 100,000 عضو، فأبقِ المدخلات صغيرة.
further:
  - title: Template Literal Types
    url: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
  - title: Intrinsic String Manipulation Types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html#intrinsic-string-manipulation-types
quiz:
  - q: "كم عضوًا في `` `${'s' | 'm' | 'l'}-${'red' | 'blue'}` ``؟"
    options:
      - text: "5، واحد لكل قيمة حرفية"
        why: الـ unions داخل الـ template literal تتركّب ولا تُجمع. كل مقاس يقترن بكل لون.
      - text: "6، كل مقاس مقترن بكل لون"
        why: صحيح. النتيجة هي الجداء الديكارتي، `'s-red' | 's-blue' | 'm-red' | …`، فتتضاعف المقاسات.
      - text: "1، نص النمط نفسه"
        why: الـ template literal types التي فيها unions حرفية تُوسَّع إلى نصوص محدّدة، ولا تبقى نمطًا واحدًا.
    answer: 1
  - q: "ماذا يعطي `PathParams<'/orders/:orderId/lines/:lineId'>` بالتعريف التعاودي من الدرس؟"
    options:
      - text: "`'orderId' | 'lineId'`"
        why: صحيح. المطابقة الأولى تلتقط `orderId` وتعاود على `lines/:lineId`، التي تلتقط مطابقتها الأخيرة `lineId`.
      - text: "`':orderId' | ':lineId'`"
        why: النقطتان جزء من النمط، خارج العنصر النائب `infer`، فلا تُلتقطان.
      - text: "`'orderId'` فقط"
        why: هذا ما تحصل عليه دون الاستدعاء التعاودي على `Rest`؛ التعاود هو ما يصل إلى المعامل الثاني.
      - text: "`string`"
        why: "`infer` تلتقط الأجزاء النصية الحرفية بالضبط، فتكون النتيجة union من القيم الحرفية."
    answer: 0
  - q: "أيّ قيمة يقبلها `type Price = `${number}``؟"
    options:
      - text: "فقط النصوص مثل `'12.50'` التي تبدو كمبالغ مالية"
        why: "`${number}` لا تعرف شيئًا عن صيغ المبالغ؛ تقبل أي شيء تقرؤه JavaScript كرقم."
      - text: "`'1e5'` وكذلك `'12.50'`"
        why: صحيح. أي نص تقرؤه JavaScript كرقم يناسب، بما في ذلك الصيغة الأُسّية (بل حتى `'0x1F'`)، فهو فحص فضفاض.
      - text: "الأعداد الصحيحة فقط، لأن `number` غير مسموح في الـ template literals"
        why: "العناصر النائبة `number` مسموحة وتقبل الكسور العشرية أيضًا."
    answer: 1
  - q: "يبني زميل `` `${Locale}/${Currency}/${Category}/${Sku}` `` من أربعة unions فيها 40 و30 و15 و500 عضو. ماذا يحدث؟"
    options:
      - text: يعمل، لكن الإكمال التلقائي يصبح أبطأ.
        why: الجداء 9 ملايين عضو، أبعد بكثير من الحد؛ الأمر ليس مجرّد بطء.
      - text: يُبقيه TypeScript نمطًا غير موسَّع.
        why: الـ unions الحرفية تُوسَّع دائمًا؛ لا يوجد وضع كسول لها.
      - text: "يبلّغ TypeScript عن \"Expression produces a union type that is too complex to represent\"."
        why: صحيح. الجداء يتجاوز حد 100,000 عضو. استخدم `string` للجزء كثير القيم، أو تحقّق وقت التشغيل.
    answer: 2
---

يُطلق نظام الدفع في Cartwheel أحداثًا مثل `order.shipped` و`payment.failed`، ويبني عميل الـ API فيه الروابط من أنماط مثل `/orders/:orderId/lines/:lineId`. كلاهما نصوص لها بنية. وتحديد نوعها بـ `string` يعني أن الخطأ الإملائي في اسم حدث أو معامل المسار الناقص لا يظهر إلا حين لا يُطلَق listener أبدًا أو يُعيد طلبٌ 404. الـ template literal types تتيح للـ compiler أن يرى البنية.

## بناء النصوص من الأنواع

الـ template literal type يستخدم صياغة علامات الاقتباس المائلة نفسها في نصوص JavaScript القالبية، لكن مع أنواع في العناصر النائبة:

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

type OrderEvent = `order.${OrderStatus}`;
// 'order.processing' | 'order.shipped' | 'order.delivered' | 'order.cancelled' | 'order.returned'

type CheckoutEvent = OrderEvent | `payment.${'captured' | 'failed'}`;
```

حين يحمل عنصر نائب union، يكون للنتيجة عضو واحد لكل عضو في الـ union. ومع عنصرين نائبين تحصل على كل التركيبات: `` `${'s' | 'm' | 'l'}-${'red' | 'blue'}` `` هي ستة نصوص. هذه قوة الميزة وخطرها في آنٍ، كما سترى في نهاية الدرس.

الآن يستطيع ناقل الأحداث تحديد أنواع أسماء أحداثه من أنواع المجال التي تملكها أصلًا:

```ts
declare function on(event: CheckoutEvent, handler: () => void): void;

on('order.shipped', () => {});
on('order.shiped', () => {});
// Error: Argument of type '"order.shiped"' is not assignable to parameter of type 'CheckoutEvent'.
```

أضف حالة إلى `OrderStatus` فيصبح `order.on-hold` اسم حدث صالحًا تلقائيًا.

## تحويل النصوص

يأتي TypeScript بأربعة أنواع نصية **مدمجة (intrinsic)** تحوّل الأنواع الحرفية: `Uppercase` و`Lowercase` و`Capitalize` و`Uncapitalize`. استخدمت `Capitalize` لأسماء الـ setters في [الـ Mapped Types وإعادة تسمية المفاتيح](lesson:l-at-3-2). واستخدام شائع آخر هو متغيّرات البيئة وأعلام الميزات:

```ts
type Feature = 'express-shipping' | 'gift-wrap';
type FlagEnvVar = `CHECKOUT_${Uppercase<Feature>}`;
// 'CHECKOUT_EXPRESS-SHIPPING' | 'CHECKOUT_GIFT-WRAP'
```

إنها مبنية داخل الـ compiler لا معرَّفة بلغة TypeScript، فلا يمكنك رؤية مصدرها، لكنها تتصرّف مثل أي نوع generic آخر.

## تحليل النصوص بـ infer

تعمل الـ template literal types أيضًا كـ **أنماط** في conditional type. ومع `infer`، تستخرج أجزاءً من literal type نصي:

```ts
type Method<R> = R extends `${infer M} ${string}` ? M : never;

type M1 = Method<'POST /orders/:id/cancel'>; // 'POST'
```

النمط `` `${infer M} ${string}` `` يعني "نصٌّ ما، ثم مسافة، ثم أي شيء". يطابقه TypeScript مع القيمة الحرفية ويربط `M` بالجزء الذي قبل أول مسافة.

إليك النوع الذي يجعل باني الروابط آمنًا. إنه يجمع كل `:param` في نمط المسار:

```ts
type PathParams<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? Param | PathParams<Rest>
    : P extends `${string}:${infer Param}`
      ? Param
      : never;

type P1 = PathParams<'/orders/:orderId/lines/:lineId'>; // 'orderId' | 'lineId'
type P2 = PathParams<'/orders'>;                        // never
```

اقرأه كحالتين. إن كان هناك معامل يليه مزيد من المسار، التقط المعامل وعاوِد على الباقي. وإن كان هناك معامل في النهاية، التقطه. وإلا فلا معاملات. حين يطابق TypeScript نمطًا، يأخذ كل عنصر نائب `infer` أقصر نص يسمح لبقية النمط بالمطابقة، فيتوقّف `Param` عند أول `/`.

التعاود (`PathParams<Rest>`) هو موضوع الدرس القادم. أما الآن فانظر إلى ما يعطيك إياه:

```ts
function buildPath<P extends string>(pattern: P, params: Record<PathParams<P>, string | number>): string {
  // Every :param in the pattern has a key in params, by construction.
  const values = params as Record<string, string | number>;
  return pattern.replace(/:(\w+)/g, (_, name: string) => encodeURIComponent(String(values[name])));
}

buildPath('/orders/:orderId/lines/:lineId', { orderId: 1042, lineId: 3 }); // '/orders/1042/lines/3'
buildPath('/orders/:orderId/lines/:lineId', { orderId: 1042 });
// Error: … Property 'lineId' is missing in type '{ orderId: number; }' …
```

يُستنتج `P` على أنه النمط الحرفي، ويحوّله `PathParams<P>` إلى المفاتيح المطلوبة، ويحوّل `Record` تلك المفاتيح إلى شكل `params`. والمسار الذي لا معاملات فيه يأخذ `{}`.

## الـ template literals كمفاتيح

أسماء الأحداث نصف القصة فقط؛ كل حدث يحمل أيضًا حمولة. يستطيع mapped type مع جملة `as` بناء جدول الاسم إلى الحمولة كاملًا من union الحالات دفعة واحدة:

```ts
type OrderEventPayloads = {
  [S in OrderStatus as `order.${S}`]: { orderId: number; status: S };
};

type ShippedPayload = OrderEventPayloads['order.shipped'];
// { orderId: number; status: 'shipped' }
```

تمرّ الحلقة على الحالات، وتحوّل جملة `as` كل واحدة منها إلى اسم حدث، ويظل نوع الحمولة قادرًا على الإشارة إلى `S` الأصلي. هذا الجدول هو بالضبط ما يحتاجه event emitter محدَّد الأنواع، وستبني واحدًا فوقه في [باعثات أحداث وبنّاؤون آمنون من حيث النوع](lesson:l-at-4-4). لاحظ أنه لا شيء جديد هنا: mapped type وtemplate literal ووصول بالفهرس، مجتمعة. معظم كود مستوى الأنواع الحقيقي قطع صغيرة كهذه، مركّبة بعناية.

:::note عناصر نائبة فضفاضة
العنصران النائبان `${string}` و`${number}` يطابقان على نطاق واسع. `` `${number}` `` تقبل `'12.50'`، لكنها تقبل أيضًا `'1e5'` و`'-0'`، لأنها تعني "أي شيء تقرؤه JavaScript كرقم". أنواع مثل `` `${Category}-${string}` `` لرموز المنتجات (SKUs) توثيق مفيد وتلتقط الأخطاء الواضحة، لكنها ليست تحقّقًا؛ افحص المدخلات الحقيقية وقت التشغيل.
:::

:::mistake مضاعفة الـ unions حتى يستسلم الـ compiler
كل عنصر نائب يضاعف حجم الـ union. أربعة عناصر نائبة فيها 40 و30 و15 و500 عضو ستكون تسعة ملايين نص، ويتوقّف TypeScript عند 100,000 برسالة *Expression produces a union type that is too complex to represent*. وقبل ذلك الحد بكثير تصبح المحرّرات بطيئة. استخدم الـ template literals مع unions صغيرة ومغلقة (الحالات، والطرق، وبضع لغات)، واستخدم `string` لأي شيء كثير القيم، مثل رموز المنتجات أو المعرّفات.
:::

في التمرين ستحدّد أنواع أسماء الأحداث وباني الروابط في Cartwheel. والدرس القادم ينظر في التعاود داخل الأنواع: ما فائدته، وإلى أي عمق يمكن أن يصل، ومتى يكون النوع الأبسط هو الخيار الهندسي الأفضل.
