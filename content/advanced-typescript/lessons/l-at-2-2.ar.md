---
summary: توقّع ما يستنتجه TypeScript لمعامل النوع، واحتفظ بالأنواع الحرفية عبر القيود ومعاملات النوع const، ورتّب وسائط الـ callbacks كي يسري الـ inference في الاتجاه الصحيح.
takeaways:
  - كل موضع يظهر فيه معامل النوع داخل نوع معامل هو موقع استنتاج؛ يجمع TypeScript مرشّحًا من كل وسيط ثم يختار نوعًا واحدًا.
  - تتّسع القيم الحرفية المستنتَجة ما لم يتضمّن قيد معامل النوع نوعًا أوليًا أو يُعرَّف المعامل بـ `const`.
  - معامل النوع `const` يستنتج الوسائط كأنها مكتوبة مع `as const`، فيحتفظ بالقيم الحرفية والـ tuples للقراءة فقط دون أن يطلب ذلك من المستدعي.
  - الـ callbacks ذات المعاملات غير المعلَّقة تُستنتج بعد الوسائط الأخرى، وداخل الكائن الحرفي الواحد يعمل TypeScript من اليسار إلى اليمين.
  - وسائط النوع الصريحة إمّا كلها أو لا شيء؛ حدّد واحدًا فيتوقّف TypeScript عن استنتاج البقية.
further:
  - title: Type Inference
    url: https://www.typescriptlang.org/docs/handbook/type-inference.html
  - title: const type parameters (TypeScript 5.0 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html
quiz:
  - q: |
      ما نوع `b`؟
      ```ts
      function box<T>(value: T): { value: T } { return { value }; }
      const b = box('processing');
      ```
    options:
      - text: "`{ value: 'processing' }`"
        why: هذا ما ستحصل عليه مع `T extends string` أو مع معامل نوع `const`. أما `T` غير المقيَّد والمتداخل في نوع الإرجاع فيتّسع.
      - text: "`{ value: string }`"
        why: صحيح. يتّسع المرشّح الحرفي لأن `T` ليس له قيد أولي ولا يُعاد في المستوى الأعلى.
      - text: "`{ value: unknown }`"
        why: "`unknown` هو ما يلجأ إليه TypeScript حين لا يجد أي مرشّح إطلاقًا. وهنا وجد واحدًا: الوسيط النصي."
    answer: 1
  - q: أيّ تعريف يجعل `defineFlow(['processing', 'shipped'])` تُعيد النوع `readonly ['processing', 'shipped']` دون أن يكتب المستدعي `as const`؟
    options:
      - text: "`function defineFlow<T>(steps: T[]): T[]`"
        why: هذا يستنتج `T` على أنه `string` ويُعيد `string[]`؛ فيضيع الترتيب والقيم الحرفية معًا.
      - text: "`function defineFlow<T extends string>(steps: T[]): T[]`"
        why: القيد يحتفظ بالقيم الحرفية، لكنك تحصل على نوع المصفوفة `('processing' | 'shipped')[]`، لا على tuple للقراءة فقط.
      - text: "`function defineFlow<const T extends readonly string[]>(steps: T): T`"
        why: صحيح. المعدِّل `const` يستنتج الوسيط كأنه مكتوب مع `as const`، فتحصل على tuple للقراءة فقط من القيم الحرفية.
      - text: "`function defineFlow(steps: readonly string[]): readonly string[]`"
        why: دون معامل نوع لا يوجد ما يلتقط النوع الدقيق للوسيط.
    answer: 2
  - q: |
      لماذا نوع `d` هنا هو `unknown`؟
      ```ts
      createStep({
        render: (d) => d.totalCents.toFixed(),
        load: (orderId) => ({ orderId, totalCents: 4500 }),
      });
      ```
    options:
      - text: لأن `render` تأتي قبل `load`، ويستنتج TypeScript الدوال الحسّاسة للسياق في الكائن الحرفي من اليسار إلى اليمين.
        why: صحيح. حين تُفحص `render`، لا يكون لـ `T` أي مرشّح بعد. ضع `load` أولًا، أو علّق `orderId` بنوعه كي لا تكون `load` حسّاسة للسياق.
      - text: لأن `T` لا يمكن استنتاجه من نوع إرجاع.
        why: يمكن ذلك؛ نوع إرجاع `load` هو موقع الاستنتاج لـ `T`. المشكلة في توقيت زيارة ذلك الموقع.
      - text: لأن الدوال السهمية في الكائنات الحرفية تعطّل الـ inference.
        why: الـ inference يعمل جيدًا في الكائنات الحرفية؛ تبديل الخاصيتين يجعل هذا يمرّ في الترجمة.
    answer: 0
  - q: "تُستدعى `function convert<From, To>(value: From, to: (v: From) => To): To` هكذا: `convert<string>('12', Number)`. ماذا يحدث؟"
    options:
      - text: "يُستنتج `To` على أنه `number` من `Number`."
        why: لا يقوم TypeScript بالاستنتاج الجزئي. ما إن تمرّر أي وسيط نوع صريح حتى يتوقّع كل الوسائط المطلوبة.
      - text: خطأ، "Expected 2 type arguments, but got 1".
        why: صحيح. وسائط النوع الصريحة إمّا كلها أو لا شيء، ما لم تكن للمعاملات المتبقّية قيم افتراضية.
      - text: "يصبح `To` هو `unknown`، ويمرّ الاستدعاء في الترجمة."
        why: وسائط النوع الناقصة لا تلجأ إلى قيمة بديلة بصمت إلا إذا كانت لها قيم افتراضية. ودون ذلك يُرفض الاستدعاء.
    answer: 1
---

في الدرس السابق كتبت `sortByTotal(orders)` فاستنتج TypeScript أن `T` هو `DetailedOrder`. في معظم الأحيان يفعل الـ inference (استنتاج النوع) ما تريده، ولهذا تبدو المرات التي لا يفعل فيها عشوائية. لكنها ليست كذلك. يتبع TypeScript مجموعة صغيرة من القواعد، وحين تعرفها تستطيع تصميم توقيعات تستنتج بالضبط النوع الذي تقصده، دون أي `<…>` في موضع الاستدعاء.

## مواقع الاستنتاج والمرشّحون

كل موضع يظهر فيه معامل النوع داخل نوع معامل هو **موقع استنتاج (inference site)**. عند الاستدعاء، يطابق TypeScript كل وسيط مع نوع معامله، ويجمع **مرشّحًا (candidate)** لمعامل النوع من كل موقع. ثم يختار نوعًا واحدًا من بين المرشّحين.

```ts
function same<T>(a: T, b: T): T[] {
  return [a, b];
}

same('processing', 'shipped'); // T = string, so string[]
same(1, 'a');
// Error: Argument of type 'string' is not assignable to parameter of type 'number'.
```

مع قيمتين نصيتين حرفيتين، يُدمج المرشّحان `'processing'` و`'shipped'` ثم يتّسعان إلى `string`، لأن `T` لا يُعاد إلا داخل مصفوفة (يشرح القسم التالي متى تنجو القيم الحرفية). أما مع `1` و`'a'`، فلا يخترع TypeScript النوع `number | string`؛ بل يختار المرشّح الأول، `number`، فيفشل الوسيط الثاني أمامه. وهذا مقصود. فالاتساع الصامت إلى union سيُخفي الأخطاء التي وُجدت الـ generics لالتقاطها. إن أردت قيمًا مختلطة فعلًا، فقلها صراحة: `same<number | string>(1, 'a')`.

:::figure من الوسائط إلى النوع المختار إلى نوع الإرجاع
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">مسار الاستنتاج. كل وسيط من الوسيطين في موضع الاستدعاء ينتج مرشّحًا لـ T عبر موقع استنتاجه. يُدمج المرشّحون ويُوسَّعون وفق القواعد في T واحد مختار، يُعوَّض بعدها في نوع الإرجاع.</title>
  <rect class="d-box" x="10" y="30" width="170" height="44" rx="10"/>
  <text class="d-code" x="95" y="57" text-anchor="middle">a: 'processing'</text>
  <rect class="d-box" x="10" y="130" width="170" height="44" rx="10"/>
  <text class="d-code" x="95" y="157" text-anchor="middle">b: 'shipped'</text>
  <path class="d-arrow" d="M180 52 L250 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M180 152 L250 116" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="254" y="66" width="180" height="72" rx="12"/>
  <text class="d-label-strong" x="344" y="94" text-anchor="middle">المرشّحون</text>
  <text class="d-label-muted" x="344" y="118" text-anchor="middle">دمج، ثم اتساع؟</text>
  <path class="d-arrow" d="M434 102 L478 102" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="482" y="66" width="208" height="72" rx="12"/>
  <text class="d-label-strong" x="586" y="94" text-anchor="middle">T المختار</text>
  <text class="d-code" x="586" y="118" text-anchor="middle">string</text>
  <path class="d-arrow" d="M586 138 L586 172" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="482" y="176" width="208" height="44" rx="10"/>
  <text class="d-code" x="586" y="203" text-anchor="middle">return: T[]</text>
</svg>
:::

## متى تتّسع القيم الحرفية

القاعدة الثانية تفسّر معظم لحظات "لماذا حصلت على `string`؟". المرشّح الحرفي مثل `'processing'` يُحتفظ به أو يُوسَّع حسب التوقيع:

```ts
function identity<T>(value: T): T { return value; }
function box<T>(value: T): { value: T } { return { value }; }
function boxStatus<T extends string>(value: T): { value: T } { return { value }; }

const a = identity('processing');  // 'processing'
const b = box('processing');       // { value: string }
const c = boxStatus('processing'); // { value: 'processing' }
```

تنجو القيمة الحرفية حين يُعاد `T` مباشرة في المستوى الأعلى (`identity`)، أو حين يتضمّن قيد `T` نوعًا أوليًا مثل `string` (`boxStatus`). وإلا فإنها تتّسع، بناءً على افتراض أن القيمة المخبّأة داخل كائن سيُعاد الإسناد إليها غالبًا لاحقًا.

الكائنات تتبع المنطق نفسه، وهنا للقيد فائدة ثانية: يعطي الوسيطَ **نوعًا سياقيًا (contextual type)**.

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

function draft<T>(order: T): T { return order; }
function draftOrder<T extends { status: OrderStatus }>(order: T): T { return order; }

draft({ status: 'processing' });      // { status: string }
draftOrder({ status: 'processing' }); // { status: 'processing' }
```

لأن القيد يقول إن `status` من نوع `OrderStatus`، يفحص TypeScript القيمة الحرفية مقابل ذلك الـ union أثناء الاستنتاج، فيثبت النوع الحرفي. القيد الجيد يوثّق الدالة ويحسّن ما تستنتجه في آنٍ واحد.

## معاملات النوع const

أحيانًا تريد وسيط المستدعي كما كُتب بالضبط: ترتيب الـ tuple، والقيم الحرفية، والكائنات المتداخلة. قبل TypeScript 5.0 كان ذلك يعني أن تطلب من كل مستدعٍ أن يكتب `as const`. أما الآن فيمكن للدالة أن تطلب ذلك بنفسها:

```ts
function defineFlow<const T extends readonly OrderStatus[]>(steps: T): T {
  return steps;
}

const happyPath = defineFlow(['processing', 'shipped', 'delivered']);
// readonly ['processing', 'shipped', 'delivered']
```

المعدِّل `const` يطلب من TypeScript أن يستنتج الوسيط كأنه مكتوب مع `as const`: القيم الحرفية تبقى حرفية، والمصفوفات تصبح tuples للقراءة فقط، وخصائص الكائنات تصبح للقراءة فقط. اقرنه بقيد مصفوفة `readonly`، لأن `as const` تنتج مصفوفات للقراءة فقط. ولا يؤثّر إلا في القيم الحرفية المكتوبة مباشرة في الاستدعاء؛ أما المتغيّر الذي تمرّره فيحتفظ بأي نوع كان له أصلًا.

:::tip متى تلجأ إلى const
استخدم معاملات النوع `const` للـ APIs ذات طابع التعريف: جداول المسارات، وأعلام الميزات، وآلات الحالات، ومخطّطات النماذج، وكل ما يكتب فيه المستدعي قيمة حرفية مرة واحدة وتشتقّ أنت منها الأنواع. ستستخدم واحدًا في [تصميم عميل API بأنواع دقيقة](lesson:l-at-2-4). أما في دوال البيانات العادية مثل `sortByTotal` فلا يضيف شيئًا.
:::

## الـ callbacks تُستنتج أخيرًا

الوسائط التي هي دوال بمعاملات غير معلَّقة، مثل `(d) => d.totalCents`، **حسّاسة للسياق (context-sensitive)**: أنواع معاملاتها تأتي من التوقيع، الذي قد يعتمد بدوره على `T`. يستنتج TypeScript من كل ما عداها أولًا، ثم يحدّد أنواع هذه الـ callbacks. وداخل الكائن الحرفي الواحد، يمرّ على الخصائص الحسّاسة للسياق من اليسار إلى اليمين:

```ts
function createStep<T>(config: { load: (orderId: number) => T; render: (data: T) => string }) {}

createStep({
  load: (orderId) => ({ orderId, totalCents: 4500 }),
  render: (d) => d.totalCents.toFixed(), // d: { orderId: number; totalCents: number }
});

createStep({
  render: (d) => d.totalCents.toFixed(), // Error: 'd' is of type 'unknown'.
  load: (orderId) => ({ orderId, totalCents: 4500 }),
});
```

حين تأتي `render` أولًا، لا يكون لـ `T` أي مرشّح بعد. يمكنك الإصلاح في موضع الاستدعاء بتبديل الخاصيتين أو بتعليق `orderId: number`، فلا تعود `load` حسّاسة للسياق. والأفضل أن تُصلحه في الـ API نفسه: ضع المنتِج قبل المستهلِك في قوائم المعاملات وفي الأمثلة الموثّقة، كي تكون الطريقة الطبيعية لاستدعائها هي الطريقة التي تستنتج.

:::mistake توقّع الاستنتاج الجزئي
`convert<string>('12', Number)` على دالة لها معاملا نوع خطأٌ، "Expected 2 type arguments, but got 1". لا يستنتج TypeScript البقية ما إن تحدّد أيًّا منها. فإمّا أن تتركه يستنتج كل شيء، أو تعطي المعاملات اللاحقة قيمًا افتراضية (فتأخذ عندها النوع الافتراضي لا نوعًا مستنتَجًا)، أو تقسم الدالة إلى اثنتين (`convert('12').to(Number)`)، وهو الشكل الذي تستخدمه مكتبات كثيرة محدَّدة الأنواع لهذا السبب بالذات. الدرس القادم يغطّي القيم الافتراضية وأدوات التحكّم الأخرى في الـ inference.
:::

في التمرين ستجعل ثلاث دوال مساعدة في Cartwheel تحتفظ بالقيم الحرفية التي يمرّرها مستدعوها. وبعده ستتعلّم كيف تمنع الـ inference من الحدوث حيث لا ينبغي.
