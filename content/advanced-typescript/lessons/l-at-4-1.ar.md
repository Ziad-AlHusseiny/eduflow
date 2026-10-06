---
summary: امنح القيم المتشابهة في الشكل أنواعًا مختلفة بالوسوم والمُنشئات الذكية، وأوقف خلط العملات وقت الترجمة، واجعل كل switch على union شاملًا بشكل مُثبَت باستخدام never.
takeaways:
  - الوسم (brand) تقاطعٌ بين نوع أولي وخاصية فريدة لا وجود لها إلا في نظام الأنواع، فيتوقّف `OrderId` و`CustomerId` عن التبادل رغم أن كليهما رقم.
  - أنشئ القيم الموسومة فقط في مُنشئات ذكية تتحقّق أولًا؛ ذلك هو المكان الوحيد الذي يليق فيه تحويل `as`.
  - الحساب على الأرقام الموسومة يُعيد `number` عاديًا، لذا يجب أن تعيد دوال المال وسم نتائجها عن قصد.
  - "`Money<NoInfer<C>>` على الوسيط الثاني يمنع `add(usd, eur)` من استنتاج union يخلط العملات."
  - فرع `default` يمرّر القيمة إلى معامل من نوع `never`، أو يفحصها بـ `satisfies never`، يحوّل عضو الـ union المنسي إلى خطأ ترجمة.
further:
  - title: Unique symbol types
    url: https://www.typescriptlang.org/docs/handbook/symbols.html#unique-symbol
  - title: Exhaustiveness checking (Narrowing)
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
quiz:
  - q: "`type OrderId = number & { readonly [brand]: 'OrderId' }`. كيف تبدو خاصية الوسم وقت التشغيل؟"
    options:
      - text: كل قيمة `OrderId` تحمل خاصية symbol مخفية.
        why: الأنواع الأولية لا تحمل خصائص، والوسم مُعلَن فقط ولا يُسند أبدًا. لا وجود له إلا في نظام الأنواع.
      - text: تُغلَّف القيمة في كائن `Number` مرفق به الـ symbol.
        why: لا شيء يغلّف القيمة. تحويل مثل `n as OrderId` لا يولّد أي كود إطلاقًا.
      - text: لا وجود لها؛ القيمة رقم عادي، والوسم يعيش في النوع فقط.
        why: صحيح. لهذا تكون الوسوم مجانية وقت التشغيل، ولهذا أيضًا لا تكون البيانات القادمة من `JSON.parse` موسومة أبدًا حتى تُنشئها أنت.
    answer: 2
  - q: أين يجب أن تظهر `as OrderId` في قاعدة كود جيدة التصميم؟
    options:
      - text: حيثما احتاج رقم أن يُمرَّر إلى دالة تأخذ `OrderId`.
        why: هذا يحوّل الوسم إلى زينة؛ يمكن تحويل أي رقم في أي مكان فتضيع الضمانة.
      - text: فقط داخل المُنشئ الذكي الذي يتحقّق من الرقم أولًا.
        why: صحيح. نقطة دخول واحدة متحقَّق منها تعني أن كل `OrderId` في النظام قد فُحص.
      - text: لا مكان لها؛ يجب إنشاء الوسوم بـ `satisfies`.
        why: "`satisfies` تفحص مقابل نوع دون تغييره، فلا تستطيع إضافة وسم لا تملكه القيمة."
    answer: 1
  - q: "تُستدعى `add<C extends Currency>(a: Money<C>, b: Money<C>)` هكذا: `add(usd, eur)`. ماذا يحدث؟"
    options:
      - text: خطأ ترجمة، لأن العملتين مختلفتان.
        why: هذا ما تريده، لكن كلا الوسيطين موقع استنتاج، فيصبح `C` هو `'USD' | 'EUR'` ويمرّ الاستدعاء.
      - text: يمرّ في الترجمة، لأن `C` يُستنتج على أنه `'USD' | 'EUR'`؛ علّم المعامل الثاني بـ `Money<NoInfer<C>>` لرفضه.
        why: صحيح. مع `NoInfer`، يأتي `C` من الوسيط الأول وحده، ويفشل `Money<'EUR'>` أمام `Money<'USD'>`.
      - text: يرمي خطأ وقت التشغيل لأن الوسم لا يطابق.
        why: الوسوم لا وجود لها وقت التشغيل، فلا شيء يمكن أن يرمي خطأً بسببها.
    answer: 1
  - q: |
      أُضيفت حالة جديدة `'on-hold'`. أيّ دالة تفشل في الترجمة إلى أن تتعامل معها؟
      ```ts
      function label(s: OrderStatus): string {
        switch (s) {
          case 'processing': return 'Packing';
          // …one case for every other existing status…
          default: return assertNever(s);
        }
      }
      ```
    options:
      - text: هذه الدالة، لأن `s` في فرع `default` تكون `'on-hold'`، وهي غير قابلة للإسناد إلى `never`.
        why: صحيح. فرع `default` لا يرى إلا الأعضاء التي لم تعالجها أي حالة، و`assertNever` لا تقبل أيًّا منها.
      - text: لا شيء؛ `default` تعالج كل قيمة، فيرضى الـ compiler.
        why: فرع `default` العادي سيُخفي الحالة الجديدة. تمرير القيمة إلى معامل `never` هو ما يجعله فحصًا.
      - text: كل دالة تستخدم `OrderStatus`، بما فيها تلك التي تخزّنها فقط.
        why: لا يتأثّر إلا الكود الذي يدّعي الشمول. الدوال التي تخزّن الحالة أو تمرّرها تبقى تمرّ في الترجمة.
      - text: "فقط الدوال التي تستخدم جمل `if` بدل `switch`"
        why: الفحص يتعلّق بمعامل `never`، لا بنوع الجملة المستخدمة؛ ويعمل مع سلاسل `if` أيضًا.
    answer: 0
---

خطأ الاسترداد من الدرس الأول كان سببه رقمين يبدوان متشابهين: الدولارات والسنتات. ولدى Cartwheel المشكلة نفسها في كل مكان. معرّف الطلب ومعرّف العميل كلاهما `number`. والمبلغ بالسنتات والكمية كلاهما `number`. والتنميط البنيوي، الذي تعرّفت عليه في [الـ Structural Typing وقابلية الإسناد](lesson:l-at-1-2)، يعتبر الأشياء المتشابهة في الشكل متطابقة، فيدعك بسرور تكتب `cancelOrder(customer.id)`.

الإصلاح أن تجعل الأشكال مختلفة، دون تغيير أي شيء وقت التشغيل.

## الوسوم

الـ **branded type (النوع الموسوم)** هو تقاطع (intersection) بين نوع أولي وخاصية لا وجود لها إلا في نظام الأنواع:

```ts
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

type OrderId = Brand<number, 'OrderId'>;
type CustomerId = Brand<number, 'CustomerId'>;
type Cents = Brand<number, 'Cents'>;
```

`declare const brand: unique symbol` تعلن symbol لا يوجد أبدًا وقت التشغيل؛ واستخدامه مفتاحًا للخاصية يعني أنه لا يمكن لأي كائن حقيقي أن يملكه عن طريق الخطأ، ولا يستطيع أي شيء خارج هذا الملف تزويره بالاسم. يبقى `OrderId` رقمًا لكل الأغراض (يمكنك مقارنته وطباعته وإرساله كـ JSON)، لكن TypeScript لم يعد يقبل رقمًا عاديًا أو `CustomerId` مكانه:

```ts
function cancelOrder(id: OrderId) {}

cancelOrder(customer.id);
// Error: Argument of type 'CustomerId' is not assignable to parameter of type 'OrderId'.
cancelOrder(1042);
// Error: Argument of type 'number' is not assignable to parameter of type 'OrderId'.
```

## المُنشئات الذكية

إن لم يكن الرقم العادي `OrderId`، فمن أين تأتي قيم `OrderId`؟ من دالة واحدة بالضبط لكل وسم، هي **المُنشئ الذكي (smart constructor)** الذي يتحقّق ثم يحوّل:

```ts
function toOrderId(n: number): OrderId {
  if (!Number.isInteger(n) || n < 1000) throw new Error(`Invalid order id: ${n}`);
  return n as OrderId;
}

function toCents(n: number): Cents {
  if (!Number.isSafeInteger(n)) throw new Error(`Cents must be a whole number, got ${n}`);
  return n as Cents;
}
```

هذا هو المكان المشروع الوحيد لـ `as` في الكود الموسوم. ولأن التحويل لا يحدث إلا بعد التحقّق، فإن كل `OrderId` في أي مكان من النظام معروف أنه معرّف صالح. الوسم إيصال: يثبت أن القيمة مرّت بالفحص.

:::figure المُنشئات الذكية هي البوابة الوحيدة إلى النوع الموسوم
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">رقم عادي قادم من رابط أو JSON يمرّ عبر المُنشئ الذكي toOrderId، الذي يتحقّق منه فإمّا أن يرمي خطأً أو يُعيد OrderId. الدوال مثل cancelOrder لا تقبل إلا OrderId، فلا يستطيع الرقم العادي الوصول إليها مباشرة؛ ذلك المسار مسدود.</title>
  <rect class="d-box" x="10" y="70" width="150" height="56" rx="12"/>
  <text class="d-code" x="85" y="96" text-anchor="middle">number</text>
  <text class="d-label-muted" x="85" y="116" text-anchor="middle">من URL أو JSON</text>
  <path class="d-arrow" d="M160 98 L248 98" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="252" y="62" width="180" height="72" rx="12"/>
  <text class="d-code" x="342" y="92" text-anchor="middle">toOrderId(n)</text>
  <text class="d-label-muted" x="342" y="116" text-anchor="middle">تحقّق، ثم حوّل</text>
  <path class="d-arrow" d="M432 98 L510 98" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="514" y="70" width="176" height="56" rx="12"/>
  <text class="d-code" x="602" y="96" text-anchor="middle">cancelOrder(id)</text>
  <text class="d-label-muted" x="602" y="116" text-anchor="middle">تأخذ OrderId</text>
  <path class="d-line d-dashed" d="M85 126 L85 170 L602 170 L602 126"/>
  <text class="d-label-muted" x="342" y="162" text-anchor="middle">المسار المباشر: خطأ ترجمة</text>
</svg>
:::

## مال يرفض الاختلاط

وسم السنتات نصف المهمة. والنصف الآخر هو العملة. اجعل العملة معامل نوع، فيصبح `Money<'USD'>` و`Money<'EUR'>` نوعين مختلفين:

```ts
type Currency = 'EGP' | 'AED' | 'SAR' | 'JOD' | 'GBP' | 'EUR' | 'USD' | 'CAD';
type Money<C extends Currency = Currency> = { cents: Cents; currency: C };

function add<C extends Currency>(a: Money<C>, b: Money<NoInfer<C>>): Money<C> {
  return { cents: toCents(a.cents + b.cents), currency: a.currency };
}

add(usdPrice, usdShipping); // Money<'USD'>
add(usdPrice, eurShipping);
// Error: Argument of type 'Money<"EUR">' is not assignable to parameter of type 'Money<"USD">'.
```

تفصيلان مهمّان. دون `NoInfer`، سيكون كلا الوسيطين موقع استنتاج وسيصبح `C` بهدوء `'USD' | 'EUR'`، وهو بالضبط الفخ من [التحكّم في الـ Inference](lesson:l-at-2-3). و`a.cents + b.cents` هي `number` عادية: الحساب ينزع الوسوم، لأن TypeScript لا يعرف إن كانت النتيجة ما زالت تعني "سنتات". أعِد الوسم عن قصد، عبر المُنشئ، كي تُفحص قاعدة "السنتات أعداد صحيحة" من جديد.

### أين تؤتي الوسوم ثمارها

لا تسِم كل شيء. كل وسم يضيف استدعاء مُنشئ أينما دخلت القيم إلى النظام، وعلى بيانات الاختبار الجاهزة أن تمرّ به أيضًا. سِم حيث تتشارك قيمتان النوع الأولي نفسه، ويسهل الخلط بينهما، ويكون الخلط مكلفًا: معرّفات الكيانات المختلفة، والمبالغ بوحدات مختلفة، والنصوص التي يجب أن تجتاز تحقّقًا قبل الاستخدام، مثل `Email` أو `Sku`. أما `quantity` التي لا تُضرب إلا في سعر فلا تحتاج وسمًا. في قاعدة كود كبيرة، نحو اثني عشر وسمًا مختارًا جيدًا يلتقط معظم أخطاء "النوع الصحيح، المعنى الخاطئ"؛ ومئة منها لا تولّد في الغالب إلا التحويلات.

:::mistake توقّع أن تنجو الوسوم عبر الشبكة
الوسوم لا توجد إلا وقت الترجمة. القيمة القادمة من `JSON.parse` أو من معامل رابط أو من `localStorage` رقم عادي، مهما قالت أنواعك عن الـ endpoint. إن حدّدت نوع استجابة API بـ `{ id: OrderId }` وتخطّيت التحليل، فقد حوّلت بيانات غير متحقَّق منها إلى وسم، وهذا أسوأ من عدم وجود وسم إطلاقًا. سِم القيم أثناء تحليلها عند الحدود، وهو موضوع [تحليل البيانات غير الموثوقة عند الحدود](lesson:l-at-4-3).
:::

## الشمول باستخدام never

الوسوم تجعل القيم متمايزة. والنمط اليومي الآخر يجعل *المعالجة* كاملة. رأيت في [الـ Discriminated Unions لحالات المجال](lesson:l-at-1-4) أن جملة عودة ناقصة قد تكشف حالة منسيّة. فحص `never` يجعل ذلك صريحًا، ويعمل حتى حين لا تُعيد الدالة شيئًا:

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function notifyCustomer(order: Order): void {
  switch (order.status) {
    case 'processing': return sendEmail('We are packing your order');
    case 'shipped': return sendEmail(`Track it: ${order.trackingNumber}`);
    case 'delivered': return sendEmail('Enjoy!');
    case 'cancelled': return sendEmail(`Cancelled: ${order.cancelReason}`);
    case 'returned': return sendEmail('Refund on its way');
    default: return assertNever(order);
  }
}
```

في فرع `default`، يكون كل عضو مُعالَج قد ضُيّق وأُزيل، فيكون `order` من نوع `never`، ويمرّ تمريره إلى معامل `never` في الترجمة. أضف حالة `'on-hold'` فيصبح `order` في ذلك الفرع هو شكل on-hold، وهو غير قابل للإسناد إلى `never`: خطأ ترجمة يشير إلى جملة الـ switch التي يجب تحديثها بالضبط. ووقت التشغيل، إن تسلّلت بيانات سيئة متجاوزةً الأنواع، ترمي الدالة خطأً برسالة واضحة بدل أن لا تفعل شيئًا.

إن كنت تفضّل ألّا تعرّف دالة مساعدة، فإن ``default: throw new Error(`Unhandled: ${order satisfies never}`)`` تُجري الفحص نفسه مباشرة. ولجداول البحث، يعطيك `Record<OrderStatus, string>` مع `satisfies` الشمول مجانًا: المفتاح الناقص خطأ ترجمة.

في التمرين ستسِم معرّفات Cartwheel وسنتاته، وتجعل `add` ترفض العملات المختلطة، وتضيف فحص شمول. والدرس القادم يتناول الشيء الآخر الذي يجب أن يتعامل معه كل نظام دفع: الإخفاقات المتوقَّعة.
