---
summary: أعِد الإخفاقات المتوقَّعة كقيم محدَّدة الأنواع عبر union من نوع Result، كي يُضطر المستدعون إلى معالجة البطاقة المرفوضة أو الكوبون المنتهي، واحتفظ بالاستثناءات للأخطاء البرمجية وما هو غير متوقَّع حقًا.
takeaways:
  - توقيع الدالة لا يقول شيئًا عمّا ترميه، لذا يسهل على المستدعين نسيان الإخفاقات المتوقَّعة المخبّأة في الاستثناءات.
  - "`type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }` هو discriminated union، فعلى المستدعين فحص `ok` قبل أن يستطيعوا قراءة `value`."
  - نمذج الأخطاء أيضًا كـ discriminated union، كي يحمل كل إخفاق بياناته الخاصة وتستطيع الواجهة معالجة كل حالة بشمول.
  - ركّب النتائج بالعودة المبكرة (`if (!r.ok) return r;`)؛ فالإخفاق المضيَّق قابل للإسناد إلى union الأخطاء الأوسع لدى المستدعي.
  - استخدم `Result` للإخفاقات التي يتوقّعها العمل؛ واحتفظ بـ `throw` للأخطاء البرمجية والثوابت المكسورة وأعطال البنية التحتية التي لا يمكنك معالجتها محليًا.
further:
  - title: Discriminated unions (Narrowing)
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  - title: Control flow and error handling (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
quiz:
  - q: "يمكن أن تفشل `placeOrder(cart): Promise<Order>` ببطاقة مرفوضة. ماذا يقول توقيعها للمستدعي عن ذلك؟"
    options:
      - text: لا شيء؛ لا يملك TypeScript طريقة للإعلان عمّا ترميه الدالة، فيكون الإخفاق غير مرئي.
        why: صحيح. لا توجد جملة `throws` في TypeScript، ولهذا تنتمي الإخفاقات المتوقَّعة إلى نوع الإرجاع.
      - text: أنها تُرفض بـ `Error`، لأن كل promise يمكن أن يُرفض.
        why: أي promise يمكن أن يُرفض بأي قيمة. التوقيع لا يقول أيّ الإخفاقات متوقَّعة ولا ما البيانات التي تحملها.
      - text: أن على المستدعي تغليفها بـ try/catch، وهذا ما يفرضه `strict`.
        why: لا يوجد خيار في الـ compiler يفرض try/catch؛ ونسيانها يمرّ في الترجمة بلا مشكلة.
      - text: أنها قد ترمي `CardDeclinedError`، مستنتَجًا من التنفيذ.
        why: الأنواع المرمية لا تُستنتج ولا تُتتبّع أبدًا، حتى مع تفعيل كل الخيارات الصارمة.
    answer: 0
  - q: |
      لماذا يفشل السطر الأخير في الترجمة؟
      ```ts
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
      declare const r: Result<Order, CheckoutError>;
      console.log(r.value.id);
      ```
    options:
      - text: لأن `value` اختيارية في `Result`.
        why: "`value` إلزامية في عضو النجاح. المشكلة أنها غير موجودة إطلاقًا في عضو الإخفاق."
      - text: لأنه يجب انتظار `Result` بـ await أولًا.
        why: "`r` ليست promise في هذا المقطع؛ لا شيء يحتاج إلى انتظار."
      - text: "لأن `value` لا توجد إلا في العضو `ok: true`، ولم يُضيَّق `r` بعد."
        why: صحيح. فحص `if (r.ok)` يضيّق `r` إلى عضو النجاح، حيث تكون `value` متاحة.
    answer: 2
  - q: أيّ إخفاق يناسب `Result` بدل الاستثناء؟
    options:
      - text: وصول `null` إلى دالة تقول أنواعها إنها لا يمكن أن تكون `null`.
        why: هذا ثابت مكسور، أي خطأ برمجي. ارمِ استثناءً، وأصلح الكود الذي سمح بحدوثه.
      - text: نفاد مجمّع الاتصالات بقاعدة البيانات.
        why: عطل في البنية التحتية لا يستطيع نظام الدفع معالجته محليًا؛ دعه ينتشر إلى حدّ الأخطاء أو طبقة إعادة المحاولة.
      - text: انتهاء صلاحية رمز الكوبون الذي كتبه العميل.
        why: صحيح. إنه متوقَّع، ويستطيع المستدعي فعل شيء مفيد (عرض رسالة)، ويحمل بيانات (الرمز وتاريخ انتهائه).
    answer: 2
  - q: |
      تُعيد `validateCart` النوع `Result<Cart, CartError>` وتُعيد `checkout` النوع `Result<Order, CartError | PaymentError>`. هل يمرّ هذا في الترجمة؟
      ```ts
      const cart = validateCart(input);
      if (!cart.ok) return cart;
      ```
    options:
      - text: لا، لأن `Result<Cart, CartError>` ليس `Result<Order, …>`.
        why: "بعد الفحص، يكون `cart` عضو الإخفاق فقط، `{ ok: false; error: CartError }`، وليس فيه `Cart`."
      - text: لا، يجب إعادة بناء الإخفاق بـ `err(cart.error)`.
        why: إعادة البناء تعمل، لكنها غير ضرورية؛ الإخفاق المضيَّق مناسب أصلًا.
      - text: فقط مع تحويل `as`.
        why: لا حاجة إلى تحويل؛ قابلية الإسناد تتكفّل بذلك.
      - text: "نعم، لأن `{ ok: false; error: CartError }` المضيَّق قابل للإسناد إلى عضو الإخفاق الأوسع."
        why: صحيح. `CartError` جزء من `CartError | PaymentError`، فيمكن إعادة الإخفاق كما هو.
    answer: 3
---

إليك توقيع الدالة التي في قلب نظام الدفع في Cartwheel:

```ts
async function placeOrder(cart: Cart, payment: PaymentMethod): Promise<Order> { /* … */ }
```

يمكن أن تفشل بخمس طرق على الأقل يتوقّعها العمل كل يوم: البطاقة مرفوضة، أو منتج نفد من المخزون، أو الكوبون منتهي الصلاحية، أو العنوان لا يمكن التوصيل إليه، أو مزوّد الدفع يطلب 3-D Secure. التوقيع لا يذكر أيًّا منها. إنها استثناءات تُرمى من مكان ما في الداخل، وليس في TypeScript جملة `throws`. المستدعي الذي ينسى `try`/`catch` يمرّ في الترجمة بلا مشكلة، والعميل يرى شاشة فارغة.

## جعل الإخفاق جزءًا من النوع

الإصلاح أن تُعيد الإخفاقات المتوقَّعة بدل رميها، باستخدام discriminated union تعرف كتابته أصلًا:

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

const ok = <T>(value: T): { ok: true; value: T } => ({ ok: true, value });
const err = <E>(error: E): { ok: false; error: E } => ({ ok: false, error });
```

`ok` هو المميِّز. لا يستطيع المستدعي قراءة `value` دون أن يثبت أولًا أن الاستدعاء نجح، لأن `value` لا توجد إلا في عضو واحد:

```ts
const result = await placeOrder(cart, payment);
showConfirmation(result.value);
// Error: Property 'value' does not exist on type 'Result<Order, CheckoutError>'.
//   Property 'value' does not exist on type '{ ok: false; error: CheckoutError; }'.

if (result.ok) showConfirmation(result.value); // fine
```

## أخطاء لها بنية

يمكن أن يكون `E` نصًا، لكن النص في الأخطاء هو نظير `status: string` في الحالات. نمذج الإخفاقات كـ discriminated union، كلٌّ منها بالبيانات اللازمة لمعالجته:

```ts
type CheckoutError =
  | { type: 'card-declined'; declineCode: string }
  | { type: 'out-of-stock'; sku: string; available: number }
  | { type: 'coupon-expired'; code: string; expiredOn: string };

function errorMessage(e: CheckoutError): string {
  switch (e.type) {
    case 'card-declined': return `Your card was declined (${e.declineCode}).`;
    case 'out-of-stock': return `Only ${e.available} of ${e.sku} left.`;
    case 'coupon-expired': return `${e.code} expired on ${e.expiredOn}.`;
  }
}
```

نوع الإرجاع `: string` يجعل هذا شاملًا، كما رأيت في القسم 1. وحين يضيف فريق المدفوعات `'requires-3ds'` إلى الـ union، تُعلَّم كل دالة رسائل وكل فرع في الواجهة يتفرّع على `type`.

## تركيب الخطوات

الدفع تسلسل: تحقّق من السلة، ثم طبّق الكوبون، ثم اخصم من البطاقة. كل خطوة يمكن أن تفشل بأخطائها الخاصة. والعودة المبكرة تركّبها دون تداخل:

```ts
type CartError = { type: 'out-of-stock'; sku: string; available: number };
type CouponError = { type: 'coupon-expired'; code: string; expiredOn: string };

async function checkout(input: CheckoutInput): Promise<Result<Order, CartError | CouponError | PaymentError>> {
  const cart = validateCart(input.lines);
  if (!cart.ok) return cart;

  const priced = applyCoupon(cart.value, input.coupon);
  if (!priced.ok) return priced;

  const charge = await chargeCard(priced.value.total, input.payment);
  if (!charge.ok) return charge;

  return ok(createOrder(priced.value, charge.value));
}
```

بعد `if (!cart.ok)`، يضيق `cart` إلى `{ ok: false; error: CartError }`، وهو قابل للإسناد إلى نوع الإخفاق الأوسع للدالة، فيمكن إعادته كما هو. ومسار النجاح يُقرأ من الأعلى إلى الأسفل، ونوع الإرجاع يوثّق كل إخفاق على المستدعي معالجته. وإن أضاف أحدهم لاحقًا خطوة رابعة بنوع خطأ جديد ونسي توسيع نوع الإرجاع، فإن `return` لإخفاق تلك الخطوة يكون خطأ ترجمة، فلا يمكن لقائمة الإخفاقات أن تتقادم بصمت.

:::figure كل خطوة إمّا تستمر على مسار النجاح أو تخرج بخطئها
<svg viewBox="0 0 700 210" role="img" aria-labelledby="t1">
  <title id="t1">مخطّط على هيئة سكّة. ثلاث خطوات، validateCart وapplyCoupon وchargeCard، تقع على مسار نجاح يؤدّي إلى ok مع Order. ومن كل خطوة يهبط فرع إلى مسار إخفاق ينتهي بـ Result فيه ok يساوي false والـ union من CartError وCouponError وPaymentError.</title>
  <rect class="d-box-accent" x="10" y="40" width="140" height="48" rx="10"/>
  <text class="d-code" x="80" y="69" text-anchor="middle">validateCart</text>
  <rect class="d-box-accent" x="200" y="40" width="140" height="48" rx="10"/>
  <text class="d-code" x="270" y="69" text-anchor="middle">applyCoupon</text>
  <rect class="d-box-accent" x="390" y="40" width="140" height="48" rx="10"/>
  <text class="d-code" x="460" y="69" text-anchor="middle">chargeCard</text>
  <rect class="d-box-success" x="580" y="40" width="110" height="48" rx="10"/>
  <text class="d-code" x="635" y="69" text-anchor="middle">ok(order)</text>
  <path class="d-arrow" d="M150 64 L196 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 64 L386 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M530 64 L576 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M80 88 L80 146" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 88 L270 146" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 88 L460 146" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="10" y="150" width="680" height="48" rx="10"/>
  <text class="d-code" x="350" y="179" text-anchor="middle">{ ok: false, error: CartError | CouponError | PaymentError }</text>
</svg>
:::

سترى مكتبات تقدّم methods مثل `map` و`andThen` لسلسلة النتائج بدلًا من ذلك. لا بأس بها، لكن في TypeScript يكون أسلوب العودة المبكرة عادةً أسهل قراءة ولا يحتاج إلى مكتبة: الـ narrowing يقوم بالعمل.

## تغليف الكود الذي يرمي استثناءات

معظم الإخفاقات في نظام الدفع تبدأ حياتها كاستثناءات في كود شخص آخر: الـ SDK الخاص بالدفع يرمي `CardError`، و`fetch` تُرفض حين تنقطع الشبكة. حوّلها مرة واحدة، عند الحافة، إلى الـ `Result` الذي يتحدّثه كودك:

```ts
type PaymentError = { type: 'card-declined'; declineCode: string };

async function chargeCard(amount: Money, payment: PaymentMethod): Promise<Result<Receipt, PaymentError>> {
  try {
    return ok(await paymentSdk.charge(amount, payment));
  } catch (e: unknown) {
    if (e instanceof CardError) return err({ type: 'card-declined', declineCode: e.code });
    throw e; // not a failure we understand: let it propagate
  }
}
```

ثلاثة أمور تستحق التقليد. متغيّر `catch` من نوع `unknown`، كما هو دائمًا تحت `strict`، فتضيّقه بـ `instanceof` قبل قراءة `code`. ولا يتحوّل إلى قيمة إلا الإخفاق الوحيد الذي يتوقّعه العمل؛ وكل ما عداه يُعاد رميه دون مساس، مع الـ stack trace كاملًا. ونوع إرجاع الدالة صار الآن قائمة صادقة بما يمكن أن يسوء، يراها كل مستدعٍ في التلميح.

النتائج غير المتزامنة تتداخل بالطريقة البديهية، `Promise<Result<T, E>>`. الـ promise المرفوض ما زال يعني "حدث شيء غير متوقَّع"، و`{ ok: false }` المحلول يعني "العمل قال لا". وإبقاء هاتين القناتين منفصلتين هو الغاية كلها.

## أين ما زال للاستثناءات مكانها

`Result` للإخفاقات التي يتوقّعها العمل ويستطيع المستدعي التصرّف بناءً عليها. إنه ليس بديلًا عن كل `throw`:

- **الأخطاء البرمجية والثوابت المكسورة** (`null` حيث تقول الأنواع إنه لا يمكن وجوده، أو عضو union غير مُعالَج يصل إلى `assertNever`) يجب أن ترمي استثناءً. لا يوجد ما هو معقول ليفعله المستدعي، وأنت تريد الـ stack trace.
- **أعطال البنية التحتية** التي لا تستطيع معالجتها محليًا (قاعدة البيانات متوقّفة) يمكن أن تنتشر إلى حدّ أخطاء واحد أو طبقة إعادة محاولة.
- **كود الأطراف الثالثة الذي يرمي استثناءات** يُغلَّف مرة واحدة عند الحدود، فتتحوّل الاستثناءات التي تتوقّعها إلى `err(…)` ويُعاد رمي الباقي.

:::mistake التقاط كل شيء في Result
`try { … } catch (e) { return err({ type: 'unknown', message: String(e) }) }` حول دالة كاملة يحوّل الأخطاء البرمجية إلى إخفاقات "متوقَّعة" تعرضها الواجهة بأدب ولا يحقّق فيها أحد. حوّل فقط الإخفاقات المحدّدة التي تفهمها، مثل خطأ الرفض من الـ SDK الخاص بالدفع، ودع الباقي يُرمى.
:::

في التمرين ستبني خطوة الكوبون في Cartwheel بـ `Result`، وتركّبها في دالة دفع، وتكتب رسائل الأخطاء الشاملة. والدرس القادم يتناول البيانات التي تبدأ منها تلك الخطوات: المدخلات غير الموثوقة.
