---
summary: اكتب دوالًا generic تربط معاملاتُ النوع فيها المدخلات بالمخرجات، وقيّدها بـ extends، وتعرّف على الـ generics التي هي في الحقيقة تحويلات غير مفحوصة.
takeaways:
  - يستحق معامل النوع مكانه حين يظهر مرتين على الأقل، رابطًا مدخلًا بمخرج أو مدخلًا بمدخل آخر.
  - "`T extends { totalCents: number }` تتيح للدالة استخدام `totalCents` مع إعادة النوع الكامل والأكثر تحديدًا الذي مرّره المستدعي."
  - "الـ generic الذي لا يظهر إلا في نوع الإرجاع، مثل `parse<T>(text): T`، هو تحويل غير مفحوص بصياغة أجمل."
  - المستدعي هو من يختار `T` لا الدالة، ولهذا لا يمكنك إعادة كائن حرفي حيث يُنتظر `T`.
further:
  - title: Generics
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html
  - title: More on Functions (generic functions and constraints)
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html#generic-functions
quiz:
  - q: |
      ما نوع `sorted`؟
      ```ts
      type DetailedOrder = { id: number; totalCents: number; customer: string };
      declare const orders: DetailedOrder[];
      function sortByTotal(xs: { totalCents: number }[]) { return [...xs].sort((a, b) => a.totalCents - b.totalCents); }
      const sorted = sortByTotal(orders);
      ```
    options:
      - text: "`DetailedOrder[]`، لأن المصفوفة تحتوي قيمًا من نوع `DetailedOrder`"
        why: القيم ما زالت طلبات كاملة وقت التشغيل، لكن نوع الإرجاع يُحسب من نوع المعامل، الذي لا يعرف إلا `totalCents`.
      - text: "`{ totalCents: number }[]`، فيكون `sorted[0].customer` خطأً"
        why: صحيح. دون معامل نوع، لا تملك الدالة طريقة لتقول "أُعيد لك النوع نفسه الذي أعطيتني إياه".
      - text: "`any[]`، لأن `sort` تُعيد `any`"
        why: "`sort` تُعيد نوع عناصر المصفوفة نفسها. وفقدان المعلومات سببه التعليق النوعي على المعامل."
    answer: 1
  - q: أيّ هذه التوقيعات يستخدم معامل النوع بطريقة تضيف أمانًا حقيقيًا في الأنواع؟
    options:
      - text: "`function log<T>(value: T): void`"
        why: "`T` يظهر مرة واحدة، فلا يربط شيئًا. `value: unknown` تقول الشيء نفسه بصدق أكبر."
      - text: "`function parse<T>(json: string): T`"
        why: "`T` لا يظهر إلا في نوع الإرجاع، فيختار المستدعي أي نوع ولا شيء يفحصه. إنه تحويل متنكّر."
      - text: "`function lastItem<T>(items: T[]): T | undefined`"
        why: صحيح. `T` يظهر في المدخل والمخرج رابطًا بينهما، فيحصل المستدعي بالضبط على نوع العنصر الذي مرّره.
      - text: "`function count<T>(items: T[]): number`"
        why: "`T` لا يظهر إلا مرة واحدة في موضع ذي أهمية؛ و`items: unknown[]` تعمل بالطريقة نفسها تمامًا."
    answer: 2
  - q: |
      لماذا يُعدّ هذا خطأً؟
      ```ts
      function emptyCart<T extends { items: string[] }>(): T {
        return { items: [] };
      }
      ```
    options:
      - text: لأن `[]` تُستنتج على أنها `never[]`.
        why: "`never[]` قابلة للإسناد إلى `string[]`. المشكلة في العلاقة بين القيمة الحرفية و`T`."
      - text: لأن الدوال الـ generic لا يمكنها إعادة كائنات حرفية.
        why: يمكنها ذلك، حين يكون نوع القيمة الحرفية هو ما يقوله نوع الإرجاع. هنا نوع الإرجاع هو `T` الخاص بالمستدعي، وأنت لا تعرفه.
      - text: "لأن المستدعي يختار `T`، الذي قد يكون `{ items: string[]; owner: string }`، وقيمتك الحرفية ليس فيها `owner`."
        why: صحيح. يقول الخطأ إن `T` قد يُجسَّد بنوع فرعي مختلف من القيد. أعِد نوع القيد بدلًا من ذلك.
    answer: 2
---

إليك دالة مساعدة من صفحة سجل الطلبات في Cartwheel. أنواعها محدّدة، وتمرّ في الترجمة، وترمي المعلومات بهدوء:

```ts
type DetailedOrder = { id: number; totalCents: number; customer: string };

function sortByTotal(orders: { totalCents: number }[]): { totalCents: number }[] {
  return [...orders].sort((a, b) => a.totalCents - b.totalCents);
}

declare const orders: DetailedOrder[];
const sorted = sortByTotal(orders);
sorted[0].customer;
// Error: Property 'customer' does not exist on type '{ totalCents: number; }'.
```

الكائنات في `sorted` ما زالت طلبات كاملة وقت التشغيل. لكن توقيع الدالة لا يستطيع وصف مخرجها إلا من خلال التعليق النوعي على مدخلها، وهذا التعليق لا يذكر إلا `totalCents`. والإصلاح ليس تعليقًا أوسع، بل **علاقة**: "أيًّا كان نوع الكائن الذي تعطيني إياه، ستحصل على النوع نفسه".

## معامل النوع علاقة

هذه العلاقة هي ما يقوله الـ generic:

```ts
function sortByTotal<T extends { totalCents: number }>(orders: T[]): T[] {
  return [...orders].sort((a, b) => a.totalCents - b.totalCents);
}

const sorted = sortByTotal(orders); // DetailedOrder[]
sorted[0].customer;                 // string
```

اقرأ التوقيع بصوت عالٍ: "لنوعٍ ما `T` فيه `totalCents` رقمية، خذ مصفوفة من `T` وأعِد مصفوفة من `T`". المستدعي لا يكتب `<DetailedOrder>`؛ يستنتج TypeScript قيمة `T` من الوسيط (والدرس القادم يشرح كيف بالضبط).

جزءان يقومان بالعمل. `T` يظهر في المعامل وفي نوع الإرجاع، فيربط بينهما. و`extends { totalCents: number }` هو **constraint (قيد)**: يحدّ من الأنواع التي يمكن أن يكونها `T`، وهذا ما يجعل `a.totalCents` مشروعة داخل الدالة. دونه قد يكون `T` أي شيء، وسيرفض TypeScript الوصول إلى الخاصية.

## قاعدة الظهور مرتين

أنفع اختبار للـ generic، وهو ما أطبّقه في كل مراجعة كود: **يجب أن يظهر كل معامل نوع مرتين على الأقل**. مرة ليلتقط نوعًا، ومرة ليستخدمه في مكان آخر.

```ts
function lastItem<T>(items: T[]): T | undefined {      // input → output
  return items[items.length - 1];
}

function indexById<T extends { id: number }>(items: T[]): Map<number, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function merge<A, B>(a: A, b: B): A & B {              // two inputs → output
  return { ...a, ...b };
}
```

المعامل الذي يظهر مرة واحدة لا يربط شيئًا. `function log<T>(value: T): void` هي ببساطة `function log(value: unknown): void` مع صياغة زائدة، و`function count<T>(items: T[]): number` هي `items: unknown[]`. احذف معاملات النوع هذه؛ تصبح التوقيعات أسهل قراءة ولا تخسر شيئًا.

:::mistake الـ generics كتحويلات
`function parseJson<T>(text: string): T { return JSON.parse(text); }` تبدو آمنة من حيث النوع، وكل موضع استدعاء يُقرأ بلطف: `parseJson<Order>(body)`. لكن `T` لا يظهر إلا في نوع الإرجاع، فيستطيع المستدعي اختيار أي نوع ولا شيء يفحصه. إنها `JSON.parse(body) as Order` متنكّرة، وتُخفي التحويل حيث لن يراه المراجعون. أعِد `unknown` وتحقّق (انظر [تحليل البيانات غير الموثوقة عند الحدود](lesson:l-at-4-3))؛ وحين يتحتّم عليك التحويل فعلًا، اكتب `as` في موضع الاستدعاء حيث يكون مرئيًا.
:::

## المستدعي هو من يختار T

هذا الخطأ يربك الجميع تقريبًا في المرة الأولى:

```ts
type Shippable = { weightGrams: number };

function withDefaultWeight<T extends Shippable>(): T {
  return { weightGrams: 500 };
  // Error: Type '{ weightGrams: number; }' is not assignable to type 'T'.
  //   '{ weightGrams: number; }' is assignable to the constraint of type 'T', but 'T'
  //   could be instantiated with a different subtype of constraint 'Shippable'.
}
```

القيد يقول إن `T` *على الأقل* `Shippable`. قد يطلب المستدعي `withDefaultWeight<{ weightGrams: number; sku: string }>()`، وقيمتك الحرفية ليس فيها `sku`. داخل الدالة الـ generic، `T` نوعٌ لا تختاره أنت؛ لا يمكنك إنتاج `T` إلا من قيم هي `T` أصلًا، مثل الوسائط. وإن كانت دالتك تبني القيمة بنفسها، فنوع إرجاعها هو القيد (`Shippable`)، ولا حاجة إلى generic.

## قيود تستخدم معاملات أخرى

يمكن أن يشير القيد إلى معامل نوع آخر. المثال الكلاسيكي يختار خاصية باسمها:

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const customers = pluck(orders, 'customer'); // string[]
pluck(orders, 'email');
// Error: Argument of type '"email"' is not assignable to parameter of type 'keyof DetailedOrder'.
```

`keyof T` هو الـ union من أسماء خصائص `T`، و`T[K]` هو نوع الخاصية `K`. ستفكّك الاثنين في القسم 3؛ أما الآن فلاحظ النمط. `K` يظهر في المعامل وفي نوع الإرجاع، وقيده يربطه بـ `T`. كل معامل يظهر مرتين على الأقل، وكلٌّ منهما يستحق مكانه.

## generic أم union بسيط؟

ليست كل دالة تقبل عدة أنواع بحاجة إلى معامل نوع. اسأل سؤالًا واحدًا: **هل يعتمد نوع المخرج على نوع المدخل الذي مرّره المستدعي؟**

```ts
// Output is always a number, whatever came in: a union is enough.
function toCents(amount: number | string): number {
  return Math.round(Number(amount) * 100);
}

// Output depends on the input: a generic says so.
function firstOrThrow<T>(items: T[]): T {
  if (items.length === 0) throw new Error('Expected at least one item');
  return items[0];
}
```

`toCents` تُعيد `number` مهما كان المدخل، فجعلها `toCents<T extends number | string>(amount: T): number` سيضيف معاملًا يظهر مرة واحدة ولا يربط شيئًا. و`firstOrThrow` عكسها: قائمة طلبات يجب أن تُعيد طلبًا، وقائمة منتجات تُعيد منتجًا. أما توقيع الـ union (`items: unknown[]): unknown`) فسيُجبر كل مستدعٍ على التحويل.

حين لا تكون متأكّدًا، ابدأ دون الـ generic. إذا بدأ المستدعون يكتبون `as` على النتيجة، فتلك إشارة إلى أن المخرج يعتمد على المدخل، وأن معامل نوع سيُزيل تلك التحويلات.

:::tip الأنواع الـ generic تتبع القاعدة نفسها
الأنواع تأخذ معاملات أيضًا: `type Page<T> = { items: T[]; nextCursor: string | null }`. يُعيد عميل Cartwheel `Page<DetailedOrder>` و`Page<Product>` من كود الترقيم نفسه. والقاعدة ما زالت قائمة: معامل النوع غير المستخدَم في جسم النوع علامة على أن النوع يفعل أقل مما يدّعي.
:::

في التمرين ستحوّل أربع دوال مساعدة تُضيّع المعلومات إلى دوال generic تحتفظ بأنواع المستدعي. والدرس القادم ينظر في كيف يقرّر TypeScript ما هو `T` حين لا يقوله المستدعي.
