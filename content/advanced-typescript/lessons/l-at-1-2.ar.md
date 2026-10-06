---
summary: توقّع متى يقبل TypeScript نوعًا حيث يُنتظر نوع آخر، بما في ذلك فحوص الخصائص الزائدة ومعاملات الدوال، كي تكفّ أخطاء قابلية الإسناد عن مفاجأتك.
takeaways:
  - يقارن TypeScript الأشكال لا الأسماء؛ أي قيمة تملك الخصائص المطلوبة قابلة للإسناد، أيًّا كان اسم نوعها.
  - اقرأ الـ type على أنه مجموعة القيم التي يسمح بها؛ نوع الكائن الذي فيه خصائص مطلوبة أكثر يصف مجموعة أصغر.
  - فحوص الخصائص الزائدة لا تنطبق إلا على الكائنات الحرفية الطازجة، ولهذا يمرّ تمرير متغيّر فيه حقل إضافي.
  - تُفحص معاملات الدوال في الاتجاه المعاكس، لكن الـ methods المعرَّفة بصيغة الـ method تُفحص فحصًا ثنائي التغاير (bivariant)، لذا فضّل صيغة الخاصية للـ callbacks.
further:
  - title: Type Compatibility
    url: https://www.typescriptlang.org/docs/handbook/type-compatibility.html
  - title: strictFunctionTypes
    url: https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html
quiz:
  - q: |
      هل يمرّ هذا الكود في الترجمة؟
      ```ts
      type Money = { amountCents: number; currency: string };
      const product = { sku: 'TENT-2P', amountCents: 18900, currency: 'USD' };
      const price: Money = product;
      ```
    options:
      - text: نعم، لأن `product` يملك كل خاصية يتطلّبها `Money`، والخصائص الإضافية مسموحة في القيمة غير الطازجة.
        why: صحيح. `product` متغيّر وليس كائنًا حرفيًا طازجًا، لذا لا يُفحص الحقل الزائد `sku`؛ والشكل مطابق.
      - text: لا، لأن `product` لم يُعرَّف أبدًا على أنه `Money`.
        why: TypeScript بنيوي؛ لا يسأل أبدًا بماذا عُرّفت القيمة، بل يسأل فقط إن كان شكلها مناسبًا.
      - text: لا، لأن `sku` خاصية زائدة.
        why: فحوص الخصائص الزائدة لا تعمل إلا على الكائنات الحرفية المكتوبة مباشرة حيث يُنتظر النوع. عبر متغيّر، الحقول الإضافية مقبولة.
    answer: 0
  - q: إذا فكّرت في الأنواع على أنها مجموعات من القيم، فأيّ العبارات صحيحة؟
    options:
      - text: "`{ id: number; status: string }` مجموعة أكبر من `{ id: number }`."
        why: كل خاصية مطلوبة شرطٌ إضافي على القيمة أن تحقّقه، فإضافة خاصية تُصغّر المجموعة لا تكبّرها.
      - text: "`never` يحتوي كل القيم، ولهذا هو قابل للإسناد إلى كل شيء."
        why: "`never` هو المجموعة الفارغة. وهو قابل للإسناد إلى كل شيء لأن المجموعة الفارغة جزء من كل مجموعة."
      - text: "`'EUR'` مجموعة جزئية من `string`، فالقيمة `'EUR'` قابلة للإسناد إلى `string` والعكس غير صحيح."
        why: صحيح. قابلية الإسناد هي علاقة الاحتواء؛ المجموعة الأوسع لا تتدفّق إلى الأضيق دون فحص.
      - text: "`unknown` و`any` كلاهما المجموعة الفارغة."
        why: "`unknown` هو مجموعة كل القيم. و`any` ليس مجموعة أصلًا؛ إنه يُطفئ الفحص في الاتجاهين."
    answer: 2
  - q: |
      لماذا يمرّ هذا الكود في الترجمة تحت `strict`؟
      ```ts
      type CheckoutEvent = { type: 'paid' } | { type: 'shipped'; carrier: string };
      interface Listener { onEvent(e: CheckoutEvent): void }
      const l: Listener = { onEvent: (e: { type: 'shipped'; carrier: string }) => {} };
      ```
    options:
      - text: لأن الدوال السهمية لا تُفحص أبدًا مقابل الـ interfaces.
        why: الدوال السهمية تُفحص كأي دالة أخرى. التساهل مصدره طريقة تعريف `onEvent`.
      - text: لأن `onEvent` تستخدم صيغة الـ method، ومعاملات الـ methods تُفحص فحصًا ثنائي التغاير حتى مع `strictFunctionTypes`.
        why: "صحيح. كتابة `onEvent: (e: CheckoutEvent) => void` بدلًا منها تجعل فحص المعامل صارمًا وترفض هذا الـ listener."
      - text: لأن المعامل من نوع union يقبل أيًّا من أعضائه.
        why: على الـ listener أن يتعامل مع كل أعضاء الـ union. قبول عضو واحد فقط غير آمن، والفحص الصارم كان سيلتقطه.
    answer: 1
  - q: أيّ استدعاء يرفضه فحص الخصائص الزائدة؟
    options:
      - text: "`ship(order)` حيث `order` متغيّر فيه حقل إضافي `notes`"
        why: المتغيّرات ليست طازجة، فلا تُفحص خصائصها الإضافية.
      - text: "`ship({ ...order, notes: 'gift' })` حيث لا يحتوي `Order` حقلًا اسمه `notes`"
        why: صحيح. الكائن الحرفي الذي فيه spread يبقى كائنًا حرفيًا طازجًا، و`notes` مكتوب فيه مباشرة، فيُعلَّم. (أما الحقول الإضافية القادمة عبر `...order` نفسه فلا تُفحص.)
      - text: "`ship(order as Order)` حيث `order` فيه حقل إضافي `notes`"
        why: تأكيد النوع يطلب من الـ compiler أن يثق بك، فيتخطّى فحص الخصائص الزائدة كليًا.
    answer: 1
---

إليك دالة من عميل الدفع في Cartwheel، واستدعاءً يفاجئ القادمين من Java أو C#:

```ts
type Money = { amountCents: number; currency: string };

function formatMoney(m: Money): string {
  return `${(m.amountCents / 100).toFixed(2)} ${m.currency}`;
}

const tent = { sku: 'TENT-2P', name: 'Two-person tent', amountCents: 18900, currency: 'USD' };
formatMoney(tent); // compiles: "189.00 USD"
```

لم يُعرَّف `tent` أبدًا على أنه `Money`؛ إنه منتج. ومع ذلك يقبله TypeScript، لأنه لا يسأل عن اسم الشيء، بل يسأل إن كان له الشكل الصحيح. هذا هو **الـ structural typing (التنميط البنيوي)**، وحين تراه بوضوح تختفي معظم لحظات "لماذا يمرّ هذا الكود؟".

## الأنواع مجموعات من القيم

هذا أنفع نموذج ذهني في الدورة كلها: الـ type مجموعة من القيم. `string` هو مجموعة كل النصوص. `'USD'` مجموعة فيها قيمة واحدة. و`'USD' | 'EUR'` فيها قيمتان.

**قابلية الإسناد (assignability) هي علاقة الاحتواء.** يمكن وضع قيمة من النوع A حيث يُنتظر B حين تكون كل A هي أيضًا B. كل `'USD'` نصٌّ، لذا `'USD'` قابل للإسناد إلى `string`. وليس كل نص هو `'USD'`، لذا يحتاج العكس إلى فحص.

أنواع الكائنات تعمل بالطريقة نفسها، مع لمسة تُربك الناس. `{ id: number }` هو مجموعة كل القيم التي لها `id` رقمي. و`{ id: number; status: string }` يضيف شرطًا ثانيًا، فتقلّ القيم المؤهَّلة. **خصائص أكثر تعني مجموعة أصغر.** لهذا يمكن تمرير `Order` كامل حيث يُنتظر `{ id: number }`: إنه في المجموعة الأصغر، فهو إذن في الأكبر أيضًا.

:::figure قابلية الإسناد هي علاقة الاحتواء: الأنواع الأضيق تقع داخل الأوسع
<svg viewBox="0 0 680 280" role="img" aria-labelledby="t1">
  <title id="t1">مخطّطان لمجموعات متداخلة. على اليسار: unknown يحتوي string، الذي يحتوي الـ union من USD وEUR، الذي يحتوي USD. على اليمين: كائن فيه id يحتوي كائنًا فيه id وstatus، الذي يحتوي Order كاملًا. كل قيمة في مجموعة داخلية تنتمي أيضًا إلى المجموعات المحيطة بها.</title>
  <rect class="d-box" x="10" y="20" width="320" height="240" rx="14"/>
  <text class="d-label-muted" x="26" y="46">unknown</text>
  <rect class="d-box-accent" x="40" y="60" width="260" height="180" rx="12"/>
  <text class="d-label" x="56" y="86">string</text>
  <rect class="d-box-primary" x="70" y="100" width="200" height="120" rx="10"/>
  <text class="d-code" x="86" y="126">'USD' | 'EUR'</text>
  <rect class="d-box-success" x="100" y="146" width="140" height="56" rx="8"/>
  <text class="d-code" x="170" y="179" text-anchor="middle">'USD'</text>
  <rect class="d-box" x="350" y="20" width="320" height="240" rx="14"/>
  <text class="d-code" x="366" y="46">{ id }</text>
  <rect class="d-box-accent" x="380" y="60" width="260" height="180" rx="12"/>
  <text class="d-code" x="396" y="86">{ id, status }</text>
  <rect class="d-box-success" x="410" y="100" width="200" height="120" rx="10"/>
  <text class="d-code" x="510" y="150" text-anchor="middle">Order</text>
  <text class="d-label-muted" x="510" y="176" text-anchor="middle">id, status, total…</text>
</svg>
:::

يقف نوعان خاصّان عند الأطراف. `unknown` هو مجموعة كل القيم: كل شيء قابل للإسناد إليه، وعليك أن تفحص قبل استخدامه. و`never` هو المجموعة الفارغة: قابل للإسناد إلى كل شيء (فالمجموعة الفارغة جزء من كل مجموعة)، ولا شيء قابل للإسناد إليه. ستعتمد على الاثنين لاحقًا في الدورة. أما `any` فليس مجموعة أصلًا؛ إنه يُطفئ الفحص في الاتجاهين، ولهذا يستطيع `any` واحد شارد أن يسمّم بهدوء كل ما يلمسه.

## فحوص الخصائص الزائدة: الاستثناء الوحيد

إن كانت الخصائص الإضافية مقبولة، فلماذا يفشل هذا؟

```ts
type Order = { id: number; status: string };
function save(order: Order) {}

save({ id: 1001, stauts: 'processing' });
// Error: Object literal may only specify known properties, but 'stauts'
// does not exist in type 'Order'. Did you mean to write 'status'?
```

هذا **فحص الخصائص الزائدة (excess property check)**، وهو قاعدة تقديرية مقصودة فوق التنميط البنيوي. حين تكتب كائنًا حرفيًا مباشرة حيث يُنتظر نوع، يكون الكائن "طازجًا": لا شيء آخر يمكن أن يراه، فالخاصية الإضافية لا يمكن أن تكون إلا خطأً إملائيًا. لذلك يعلّمها TypeScript.

ولا ينطبق الفحص إلا على الكائنات الحرفية الطازجة:

```ts
const draft = { id: 1001, status: 'processing', stauts: 'oops' };
save(draft); // compiles: draft is not fresh
```

:::mistake الاعتماد على فحوص الخصائص الزائدة لحمايتك
فحوص الخصائص الزائدة كاشفٌ للأخطاء الإملائية، لا ضمانة. ما إن تمرّ القيمة عبر متغيّر أو قيمة مُعادة من دالة أو تأكيد `as` حتى تعبر الخصائص الإضافية بلا عائق. إذا كان يجب ألا تتلقّى دالةٌ حقولًا معيّنة (رقم بطاقة يذهب إلى أداة تسجيل مثلًا)، فلا تعتمد على هذا الفحص؛ اختر الحقول التي تحتاجها صراحةً.
:::

## الدوال: المعاملات تقلب الاتجاه

في الدوال، تتبع أنواع القيم المُعادة القاعدة المعتادة، لكن المعاملات تسير في الاتجاه الآخر. الـ handler الذي يقبل *أي* `CheckoutEvent` يمكن أن يحلّ محلّ handler لا يحتاج إلا `PaymentFailed`. والعكس غير آمن: handler لا يفهم إلا `PaymentFailed` سينهار أمام حدث `shipped`. تحت `strict` (وتحديدًا `strictFunctionTypes`)، يرفضه TypeScript:

```ts
type PaymentFailed = { type: 'payment-failed'; reason: string };
type OrderShipped = { type: 'order-shipped'; carrier: string };
type CheckoutEvent = PaymentFailed | OrderShipped;

type Listener = { onEvent: (e: CheckoutEvent) => void };

const failuresOnly = { onEvent: (e: PaymentFailed) => console.log(e.reason.toUpperCase()) };
const l: Listener = failuresOnly;
// Error: Type '{ onEvent: (e: PaymentFailed) => void; }' is not assignable to type 'Listener'.
//   Types of property 'onEvent' are incompatible.
```

المعاملات الأقل مقبولة أيضًا: `(e) => {}` و`() => {}` كلتاهما تناسبان `(e: CheckoutEvent, at: Date) => void`، لأن الدالة مسموح لها بتجاهل الوسائط. ولهذا تعمل `orders.forEach((o) => …)` رغم أن `forEach` تمرّر ثلاثة وسائط.

### ثغرة صيغة الـ method

اكتب الآن النوع نفسه بصيغة الـ method:

```ts
interface Listener {
  onEvent(e: CheckoutEvent): void; // method syntax
}
const l: Listener = failuresOnly; // compiles!
```

معاملات الـ methods المعرَّفة بهذه الطريقة تُفحص **فحصًا ثنائي التغاير (bivariant)**، حتى تحت `strict`. يُبقي TypeScript هذا عن قصد كي تبقى الأنماط اليومية تعمل، مثل معاملة `Array<Dog>` على أنها `Array<Animal>`. والثمن أن الـ listener غير الآمن أعلاه يُقبَل.

:::tip استخدم صيغة الخاصية للـ callbacks
حين يصف الـ type دالة callback أو handler، اكتبه خاصيةً من نوع دالة: `onEvent: (e: CheckoutEvent) => void`. تحصل على فحص كامل للمعاملات مجانًا. واحتفظ بصيغة الـ method للأصناف والكائنات التي تكون فيها الـ method فعلًا method.
:::

## حين تريد أن تكون للأسماء قيمة

أحيانًا يكون التنميط البنيوي كريمًا أكثر من اللازم. `OrderId` و`CustomerId` كلاهما `number`، فلا شيء يمنعك من تبديلهما. الحل أن تجعل الشكلين مختلفين، وهذا ما تفعله الـ branded types في [الـ Branded Types والفحوص الشاملة](lesson:l-at-4-1). أما الآن فتكفيك القاعدة العامة: إن كان لشيئين الشكل نفسه، يعتبرهما TypeScript الشيء نفسه.

التمرين أدناه يسدّ ثغرة الـ listener في ناقل الأحداث في Cartwheel. وبعده سترى كيف يضيّق TypeScript نوعًا واسعًا داخل الدالة، النصف الآخر من العمل مع المجموعات.
