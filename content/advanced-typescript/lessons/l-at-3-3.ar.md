---
summary: اكتب conditional types تختار بين الأنواع، وتوقّع كيف تتوزّع على الـ unions، واستخرج أنواعًا من أنواع أخرى بـ infer، معيدًا بناء Exclude وExtract وReturnType.
takeaways:
  - "`T extends U ? X : Y` تختار `X` حين يكون `T` قابلًا للإسناد إلى `U`، و`Y` في غير ذلك؛ ومع `T` من نوع generic، ينتظر الاختيار حتى يُعرف `T`."
  - الشرط على معامل نوع مجرّد يتوزّع على الـ unions، فيُنفَّذ مرة لكل عضو ثم تُجمع النتائج.
  - غلّف الطرفين بأقواس مربّعة، `[T] extends [U]`، لتختبر الـ union ككل بدل التوزيع.
  - "`infer` تعلن متغيّر نوع داخل جملة `extends` وتلتقط ما يطابقه، وهكذا يعمل `ReturnType` و`Awaited`."
  - تحويل كل مفتاح إلى نفسه أو إلى `never` ثم الفهرسة بـ `[keyof T]` يصفّي المفاتيح حسب نوع قيمتها.
further:
  - title: Conditional Types
    url: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
  - title: Utility Types (Exclude, Extract, ReturnType)
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
quiz:
  - q: "`type ToArray<T> = T extends unknown ? T[] : never`. ما هو `ToArray<string | number>`؟"
    options:
      - text: "`(string | number)[]`"
        why: هذه هي النتيجة غير التوزيعية، وتحصل عليها بـ `[T] extends [unknown]`.
      - text: "`never`"
        why: كلا العضوين قابل للإسناد إلى `unknown`، فلا يأخذ أيٌّ منهما فرع `never`.
      - text: "`unknown[]`"
        why: الفرع الصادق يستخدم `T`، وهو كل عضو بدوره، لا القيد `unknown`.
      - text: "`string[] | number[]`"
        why: صحيح. `T` معامل نوع مجرّد، فيُنفَّذ الشرط مرة لـ `string` ومرة لـ `number`، وتُجمع النتائج.
    answer: 3
  - q: أيّ نوع يعطيك الشكل المشحون من الـ union المسمّى `Order`؟
    options:
      - text: "`Extract<Order, { status: 'shipped' }>`"
        why: "صحيح. `Extract` تُبقي أعضاء الـ union القابلة للإسناد إلى `{ status: 'shipped' }`، وهذا بالضبط الشكل المشحون."
      - text: "`Exclude<Order, { status: 'shipped' }>`"
        why: "`Exclude` تفعل العكس: تُزيل الشكل المشحون وتُبقي الباقي."
      - text: "`Order['shipped']`"
        why: الوصول بالفهرس يبحث عن خاصية اسمها `shipped`، و`Order` ليس فيه مثلها.
      - text: "`Order extends { status: 'shipped' } ? Order : never`"
        why: "`Order` هنا نوع محدّد، لا معامل نوع، فلا يتوزّع شيء. والـ union كله غير قابل للإسناد إلى الشكل المشحون، فتحصل على `never`."
    answer: 0
  - q: |
      ما هو `R`؟
      ```ts
      type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
      type R = MyReturnType<(id: number) => Promise<Order>>;
      ```
    options:
      - text: "`Order`"
        why: "`infer R` تلتقط نوع الإرجاع كما هو مكتوب. فكّ الـ promise يحتاج خطوة ثانية، مثل `Awaited`."
      - text: "`Promise<Order>`"
        why: صحيح. نوع الدالة يطابق النمط، وتلتقط `R` نوع إرجاعها بالضبط.
      - text: "`never`"
        why: لا تحصل على `never` إلا حين لا يكون `F` نوع دالة. وهنا هو يطابق.
    answer: 1
  - q: "`type IsString<T> = T extends string ? true : false`. ما هو `IsString<never>`؟"
    options:
      - text: "`true`، لأن `never` قابل للإسناد إلى كل شيء"
        why: هذا صحيح في فحص غير توزيعي مثل `[never] extends [string]`. أما الشرط التوزيعي فلا يصل إلى هذا الحد أصلًا.
      - text: "`false`، لأن `never` ليس نصًا"
        why: لا يُقيَّم الشرط إطلاقًا؛ لا توجد أعضاء union لينفَّذ عليها.
      - text: "`never`، لأن التوزيع على union فارغ ينتج union فارغًا"
        why: صحيح. `never` هو الـ union الفارغ، فيمرّ الشرط التوزيعي على صفر من الأعضاء ويُعيد `never`.
    answer: 2
---

في [تصميم عميل API بأنواع دقيقة](lesson:l-at-2-4)، أجبرت المسارات التي لا مدخل لها المستدعين على كتابة `call('GET /me', {})`. الإصلاح يحتاج إلى نوع *يتّخذ قرارًا*: "إن لم يكن في مدخل هذا المسار حقول إلزامية، فاجعل الوسيط اختياريًا؛ وإلا فاطلبه". الـ mapped types تمرّ على المفاتيح. والـ conditional types (الأنواع الشرطية) تقرّر.

## العامل الثلاثي على مستوى الأنواع

```ts
type IsArray<T> = T extends readonly unknown[] ? true : false;

type A = IsArray<string[]>; // true
type B = IsArray<Order>;    // false
```

`T extends U ? X : Y` تُقرأ مثل العامل الثلاثي: إن كان `T` قابلًا للإسناد إلى `U` فالنتيجة `X`، وإلا `Y`. و`extends` هنا هي فحص قابلية الإسناد نفسه الموجود في كل مكان آخر في TypeScript: "هل `T` مجموعة جزئية من `U`؟". وحين يكون `T` معاملًا generic غير معروف بعد، **يؤجّل** TypeScript الشرط ويُبقيه كما هو حتى يصل نوع محدّد.

إليك إصلاح عميل الـ API. `{} extends Input` صادقة تمامًا حين تكون كل خصائص `Input` اختيارية (فالكائن الفارغ سيحقّقها):

```ts
type CallArgs<R extends keyof Routes> = {} extends Routes[R]['input']
  ? [input?: Routes[R]['input']]
  : [input: Routes[R]['input']];

declare function call<R extends keyof Routes>(route: R, ...args: CallArgs<R>): Promise<Routes[R]['output']>;

call('GET /me');                    // ok: input is {}
call('GET /orders');                // ok: every filter is optional
call('GET /orders/:id');            // Error: Expected 2 arguments, but got 1.
call('GET /orders/:id', { id: 1 }); // ok
```

ينتج الشرط نوع *tuple*، وينشره معامل البقية (rest parameter) `...args` في قائمة المعاملات. وعناصر الـ tuple الموسومة (`input?:`) تُبقي اسم المعامل في التلميحات. ولم يتغيّر موضع استدعاء واحد.

## التوزيع على الـ unions

للـ conditional types سلوك واحد يفاجئ الجميع. حين يكون النوع المفحوص **معامل نوع مجرّدًا (naked type parameter)** وتمرّر إليه union، يُنفَّذ الشرط مرة لكل عضو وتُجمع النتائج:

```ts
type ToArray<T> = T extends unknown ? T[] : never;

type X = ToArray<string | number>; // string[] | number[], not (string | number)[]
```

يُسمّى هذا **التوزيع (distribution)**، وهو المحرّك وراء عدد من الـ utility types. إليك `Exclude` و`Extract`، كما تعرّفهما الـ lib بالضبط:

```ts
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

type Active = MyExclude<OrderStatus, 'cancelled' | 'returned'>; // 'processing' | 'shipped' | 'delivered'
type Shipped = MyExtract<Order, { status: 'shipped' }>;         // the ShippedOrder variant
```

كل عضو يمرّ عبر الشرط وحده. والأعضاء المحوَّلة إلى `never` تختفي، لأن `never` هو الـ union الفارغ. و`MyExtract<Order, { status: 'shipped' }>` هي أنظف طريقة لتسمية شكل واحد من discriminated union.

:::figure الشرط التوزيعي يقسم الـ union، ويُنفَّذ لكل عضو، ثم يجمع من جديد
<svg viewBox="0 0 700 240" role="img" aria-labelledby="t1">
  <title id="t1">الـ union من processing وshipped وcancelled يدخل Exclude مع cancelled. يُقسم إلى ثلاثة أعضاء. يُختبر كل عضو مقابل cancelled: يبقى processing وshipped، ويصبح cancelled هو never. ثم تُجمع النتائج في processing أو shipped.</title>
  <rect class="d-box-accent" x="10" y="96" width="150" height="48" rx="10"/>
  <text class="d-code" x="85" y="125" text-anchor="middle">A | B | C</text>
  <path class="d-arrow" d="M160 110 L224 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M160 120 L224 120" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M160 130 L224 190" marker-end="url(#arrow)"/>
  <rect class="d-box" x="228" y="28" width="230" height="44" rx="10"/>
  <text class="d-code" x="343" y="55" text-anchor="middle">'processing' ext C? → يبقى</text>
  <rect class="d-box" x="228" y="98" width="230" height="44" rx="10"/>
  <text class="d-code" x="343" y="125" text-anchor="middle">'shipped' ext C? → يبقى</text>
  <rect class="d-box-warn" x="228" y="168" width="230" height="44" rx="10"/>
  <text class="d-code" x="343" y="195" text-anchor="middle">'cancelled' ext C? → never</text>
  <path class="d-arrow" d="M458 50 L522 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M458 120 L522 120" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M458 190 L522 130" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="526" y="96" width="164" height="48" rx="10"/>
  <text class="d-code" x="608" y="125" text-anchor="middle">'processing' | 'shipped'</text>
</svg>
:::

لإيقاف التوزيع، غلّف الطرفين في tuple من عنصر واحد. `[T]` ليس معامل نوع مجرّدًا، فيُفحص الـ union ككل:

```ts
type ToArrayWhole<T> = [T] extends [unknown] ? T[] : never;
type Y = ToArrayWhole<string | number>; // (string | number)[]
```

:::mistake نسيان أن never هو union فارغ
الشرط التوزيعي الذي يُعطى `never` يُعيد `never`، دون تقييم أيٍّ من الفرعين، لأنه لا توجد أعضاء لينفَّذ عليها. لذا فإن `IsString<never>` هو `never`، لا `true` ولا `false`. إن كتبت اختبارات أنواع لـ conditional type، فضمّن `never` وunion بين المدخلات، واستخدم `[T] extends [never]` حين تحتاج إلى اكتشاف `never` نفسه.
:::

## infer: التقط جزءًا من نوع

داخل جملة `extends`، تعلن `infer X` متغيّر نوع يلتقط ما يقع في ذلك الموضع، إن طابق النمط. وهكذا تعرّف الـ lib النوع `ReturnType` في جوهره (نسخة الـ lib تقيّد `F` أيضًا بنوع دالة وترجع إلى `any`):

```ts
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

type Loaded = MyReturnType<typeof loadOrder>; // Promise<Order>
```

الحيلة نفسها تستخرج أنواعًا من أي شيء له بنية:

```ts
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never;
```

ويمكن أن تحمل `infer` قيدًا أيضًا، كما في `infer S extends string`، فلا تطابق إلا حين يكون النوع الملتقَط نصًا، وتعطيك `S` مضيَّقًا مسبقًا. ستحتاج إلى ذلك في الدرس القادم، حين تلتقط أجزاءً من الـ literal types النصية.

## تصفية المفاتيح حسب نوع القيمة

اجمع mapped type وشرطًا ووصولًا بالفهرس، وتستطيع اختيار المفاتيح حسب ماهية قيمها:

```ts
type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

type Line = { sku: string; quantity: number; unitPriceCents: number };
type NumericField = KeysOfType<Line, number>; // 'quantity' | 'unitPriceCents'
```

يحوّل الـ mapped type كل خاصية إلى اسم مفتاحها أو إلى `never`، ثم تجمع `[keyof T]` القيم في union، تختفي فيه قيم `never`. يُقرأ بالمقلوب في المرة الأولى؛ اكتبه مرة، وسمِّه جيدًا، وأعِد استخدامه. والآن دالة ترتيب نوعها `sortBy(lines, key: KeysOfType<Line, number>)` ترفض الترتيب حسب `sku`.

## أنواع الإرجاع الشرطية: تعامل معها بحذر

من المغري إعطاء دالة نوع إرجاع شرطيًا، مثل `function format<T extends number | number[]>(x: T): T extends number ? string : string[]`. يحصل المستدعون على أنواع دقيقة، لكن التنفيذ لا يحصل عليها: داخل الدالة، يبقى `T` مجهولًا، ويبقى الشرط مؤجّلًا، ولا يستطيع TypeScript أن يتحقّق من أن `return x.toFixed(2)` تطابقه. فينتهي بك الأمر إلى كتابة `as any` أو `as T extends number ? string : string[]` على كل جملة عودة، أي أن أدقّ كود في الدالة هو الكود الذي لا يفحصه أحد.

لهذا فضّل القسم السابق الـ overloads أو الدوال المنفصلة لهذه المهمة. تتألّق الـ conditional types في الأنواع *المشتقّة* (`CallArgs` و`Extract` و`KeysOfType`) حيث لا يلزم تنفيذ شيء مقابلها، وتكون في أضعف حالاتها كنوع إرجاع معلَن لمنطق مكتوب يدويًا.

:::tip اختبر الـ conditional types كما تختبر الدوال
الـ conditional types برامج صغيرة لها حالات حدّية. اختبرها كما تفعل التمارين: حالة عادية، وunion، و`never`، و`any`، وخاصية اختيارية. خمسة أسطر `Expect<Equal<…>>` تلتقط معظم المفاجآت قبل أن يلتقطها زملاؤك.
:::

في التمرين ستعيد بناء `Exclude` و`Extract` و`ReturnType` وتستخدمها على أنواع الطلبات في Cartwheel. والدرس القادم يطبّق الشروط و`infer` على النصوص.
