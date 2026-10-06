---
summary: حوّل كل خصائص النوع دفعة واحدة بالـ mapped types، وأضف معدِّلات readonly والاختيارية أو أزلها، وأعِد تسمية المفاتيح أو احذفها بجمل as، معيدًا بناء Partial وPick وOmit في الطريق.
takeaways:
  - "الـ mapped type بالشكل `{ [K in Keys]: … }` يمرّ على union من المفاتيح ويبني خاصية واحدة لكل مفتاح."
  - المرور على `keyof T` تماثليّ الشكل (homomorphic)، فتُنسخ معدِّلات الاختيارية وreadonly من `T` ما لم تُضفها أو تُزلها أنت.
  - "`+?` و`-?` و`+readonly` و`-readonly` تضيف المعدِّلات أو تنزعها؛ و`Required<T>` ليس إلا `{ [K in keyof T]-?: T[K] }`."
  - جملة `as` تعيد تسمية كل مفتاح، وتحويل مفتاح إلى `never` يحذفه، وهكذا يعمل `Omit`.
  - الـ mapped types المدمجة سطحية؛ الكائنات المتداخلة تحتفظ بمعدِّلاتها الأصلية.
further:
  - title: Mapped Types
    url: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
  - title: Utility Types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
quiz:
  - q: |
      ما هو `Draft`؟
      ```ts
      type Address = { readonly line1: string; city: string; postcode?: string };
      type Draft = { -readonly [K in keyof Address]-?: Address[K] };
      ```
    options:
      - text: "`{ line1: string; city: string; postcode: string }`"
        why: صحيح. `-readonly` تنزع readonly عن `line1`، و`-?` تجعل `postcode` إلزامية، ويُزال أيضًا الـ `undefined` الذي جاء مع `?`.
      - text: "`{ readonly line1: string; city: string; postcode?: string }`"
        why: هذا ما ستحصل عليه دون معدِّلات `-`؛ فالمرور التماثلي ينسخها افتراضيًا.
      - text: "`{ line1: string; city: string; postcode: string | undefined }`"
        why: "`-?` تُزيل أيضًا الـ `undefined` الذي أضافه معدِّل الاختيارية، فيكون `postcode` من نوع `string` عادي."
      - text: خطأ، لأن `-?` غير مسموحة إلا في `Required`.
        why: "`Required` مجرّد mapped type عادي في الـ lib؛ والمعدِّل `-?` يعمل في أي mapped type."
    answer: 0
  - q: أيّ تعريف يعيد بناء `Omit<T, K>`؟
    options:
      - text: "`{ [P in keyof T]: P extends K ? never : T[P] }`"
        why: هذا يُبقي كل المفاتيح ويجعل نوع المحذوفة منها `never`، فتبقى خصائص إلزامية لا يمكن لشيء أن يحقّقها.
      - text: "`{ [P in K]: T[P] }`"
        why: هذا لا يُبقي إلا المفاتيح المدرَجة، وهذا هو `Pick`، بل إنه لا يمرّ في الترجمة دون `K extends keyof T`.
      - text: "`{ [P in keyof T as Exclude<P, K>]: T[P] }`"
        why: صحيح. جملة `as` تحوّل المفاتيح المحذوفة إلى `never`، والمفتاح المحوَّل إلى `never` يُحذف من النتيجة.
    answer: 2
  - q: "`type Setters<T> = { [K in keyof T as `set${Capitalize<K>}`]: (v: T[K]) => void }` لا يمرّ في الترجمة. لماذا؟"
    options:
      - text: الـ template literal types غير مسموحة في جمل `as`.
        why: إنها مسموحة؛ إعادة تسمية المفاتيح بالـ template literals هي الاستخدام الرئيسي لجمل `as`.
      - text: "`keyof T` قد يتضمّن مفاتيح `number` و`symbol`، و`Capitalize` لا تقبل إلا النصوص، فاكتب `Capitalize<K & string>`."
        why: صحيح. التقاطع مع `string` لا يُبقي إلا المفاتيح النصية، التي تستطيع `Capitalize` التعامل معها.
      - text: "`T[K]` غير مسموحة بعد إعادة تسمية المفتاح."
        why: داخل الـ mapped type، يبقى `K` هو المفتاح الأصلي، فتعمل `T[K]` كالمعتاد.
    answer: 1
  - q: "طُبّق `Readonly<Order>` على `type Order = { id: number; lines: { sku: string }[] }`. أيّ إسناد ما زال مسموحًا؟"
    options:
      - text: "`order.id = 1043`"
        why: "`id` خاصية في المستوى الأعلى، و`Readonly` تجعل كل خاصية في المستوى الأعلى للقراءة فقط."
      - text: "`order.lines = []`"
        why: "`lines` نفسها خاصية في المستوى الأعلى، فإعادة الإسناد إليها مرفوضة."
      - text: "`order.lines[0].sku = 'TENT-3P'`"
        why: صحيح. `Readonly` سطحية؛ المصفوفة وكائناتها تحتفظ بأنواعها الأصلية القابلة للتعديل.
    answer: 2
---

في صفحة الدفع في Cartwheel نموذج للعنوان. نوع العنوان بسيط:

```ts
type Address = { line1: string; city: string; country: string; postcode?: string };
```

لكن النموذج يحتاج إلى أكثر من العنوان. يحتاج لكل حقل إلى قيمته الحالية، وخطأ التحقّق، وما إذا كان المستخدم قد لمسه. ويحتاج الـ endpoint الخاص بـ PATCH إلى نسخة كل حقولها اختيارية. وتحتاج شاشة المراجعة إلى نسخة مجمّدة. يمكنك كتابة ثلاثة أنواع أخرى يدويًا، كلٌّ منها يكرّر أسماء الحقول الأربعة، وتحديثها كلها كلما تغيّر `Address`. أو يمكنك كتابة كلٍّ منها مرة واحدة، كتحويل. هذا هو الـ **mapped type (النوع المحوَّل)**: حلقة تكرار على المفاتيح، على مستوى الأنواع.

## الحلقة

```ts
type FieldState<T> = {
  [K in keyof T]: { value: T[K]; error: string | null; touched: boolean };
};

type AddressForm = FieldState<Address>;
// {
//   line1: { value: string; error: string | null; touched: boolean };
//   city: { value: string; … };
//   country: { value: string; … };
//   postcode?: { value: string | undefined; … };
// }
```

اقرأ `[K in keyof T]` هكذا: "لكل مفتاح `K` من `T`". يُقيَّم الطرف الأيمن مرة لكل مفتاح، مع ربط `K` بذلك المفتاح، فيكون `T[K]` نوع تلك الخاصية. أضف `phone` إلى `Address` فيكتسب `AddressForm` مدخلًا لـ `phone`، دون أي تعديل.

:::figure الـ mapped type يُنفّذ جسمه مرة لكل مفتاح
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">مفاتيح Address، وهي line1 وcity وcountry وpostcode، يمرّ كلٌّ منها عبر جسم الـ mapped type، الذي يغلّف نوع الخاصية في كائن فيه value وerror وtouched، فينتج خاصية واحدة لكل مفتاح في FieldState الخاص بـ Address.</title>
  <rect class="d-box" x="10" y="20" width="170" height="190" rx="12"/>
  <text class="d-label-strong" x="95" y="46" text-anchor="middle">keyof Address</text>
  <text class="d-code" x="95" y="84" text-anchor="middle">'line1'</text>
  <text class="d-code" x="95" y="114" text-anchor="middle">'city'</text>
  <text class="d-code" x="95" y="144" text-anchor="middle">'country'</text>
  <text class="d-code" x="95" y="174" text-anchor="middle">'postcode'</text>
  <path class="d-arrow" d="M180 115 L238 115" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="242" y="70" width="210" height="90" rx="12"/>
  <text class="d-code" x="347" y="100" text-anchor="middle">[K in keyof T]:</text>
  <text class="d-code" x="347" y="126" text-anchor="middle">{ value: T[K];</text>
  <text class="d-code" x="347" y="148" text-anchor="middle">error; touched }</text>
  <path class="d-arrow" d="M452 115 L506 115" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="510" y="20" width="180" height="190" rx="12"/>
  <text class="d-label-strong" x="600" y="46" text-anchor="middle">FieldState</text>
  <text class="d-code" x="600" y="84" text-anchor="middle">line1: {…}</text>
  <text class="d-code" x="600" y="114" text-anchor="middle">city: {…}</text>
  <text class="d-code" x="600" y="144" text-anchor="middle">country: {…}</text>
  <text class="d-code" x="600" y="174" text-anchor="middle">postcode?: {…}</text>
</svg>
:::

لاحظ أن `postcode` بقيت اختيارية. حين يمرّ الـ mapped type على `keyof T` مباشرة، يعامله TypeScript على أنه **تماثليّ الشكل (homomorphic)**: ينسخ معدِّلَي `?` و`readonly` لكل خاصية من `T`. وهذا ما تريده عادة، وهو سبب احتفاظ الـ utility types المدمجة بالاختيارية.

لست مضطرًا إلى المرور على `keyof`. أي union من المفاتيح يعمل، وهذا كل ما في `Record`:

```ts
type MyRecord<K extends PropertyKey, V> = { [P in K]: V };

type CountsByStatus = MyRecord<'processing' | 'shipped' | 'delivered', number>;
```

## إضافة المعدِّلات وإزالتها

ضع `?` أو `readonly` أمام الخاصية لإضافتها، وابدأ بـ `-` لإزالتها. بهذا تصبح معظم الـ utility types في الـ lib سطرًا واحدًا لكلٍّ منها:

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
```

`MyPartial<Address>` هو نوع جسم طلب PATCH. و`MyReadonly<Address>` هو النسخة المجمّدة لشاشة المراجعة. و`-?` تفعل شيئًا إضافيًا قد لا تتوقّعه: تُزيل أيضًا الـ `undefined` الذي تحمله الخاصية الاختيارية ضمنيًا، فيكون `MyRequired<Address>['postcode']` هو `string`، لا `string | undefined`.

`MyPick` يستحق نظرة ثانية. إنه يمرّ على `K` لا على `keyof T`، لكن لأن `K` مقيَّد بـ `keyof T`، يظل TypeScript يعامله كتماثليّ الشكل ويحتفظ بمعدِّلات الخصائص المختارة.

:::mistake توقّع تحويلات عميقة
`Readonly<Order>` تجعل `order.lines = []` خطأً لكنها تسمح بسرور بـ `order.lines[0].sku = 'x'`. كل mapped type مدمج **سطحي**: يحوّل الخصائص في المستوى الأعلى ويترك الكائنات المتداخلة كما كانت تمامًا. إن احتجت إلى نسخة عميقة، فهذا يتطلّب التعاود (recursion)، وهو موضوع [الأنواع التعاودية ومتى تتوقّف](lesson:l-at-3-5)، مع الأسباب التي قد تجعلك لا تريد واحدة.
:::

## إعادة تسمية المفاتيح بـ as

منذ TypeScript 4.1، يستطيع الـ mapped type إعادة تسمية كل مفتاح بجملة `as`. يمكن أن يكون الاسم الجديد أي تعبير نوعي يتضمّن `K`، وعادةً ما يكون template literal:

```ts
type Setters<T> = {
  [K in keyof T as `set${Capitalize<K & string>}`]: (value: T[K]) => void;
};

type AddressSetters = Setters<Address>;
// { setLine1: (value: string) => void; setCity: …; setCountry: …; setPostcode?: … }
```

`K & string` ضرورية لأن `keyof T` قد يتضمّن مفاتيح `number` و`symbol`، و`Capitalize` لا تعمل إلا على النصوص. سترى الـ template literal types كما ينبغي في [الـ Template Literal Types](lesson:l-at-3-4).

ولجملة `as` قوة ثانية: **المفتاح المحوَّل إلى `never` يُحذف**. وهكذا بالضبط يُعرَّف `Omit`:

```ts
type MyOmit<T, K extends PropertyKey> = { [P in keyof T as Exclude<P, K>]: T[P] };

type NewAddress = MyOmit<Address, 'postcode'>; // { line1; city; country }
```

`Exclude<P, K>` تعطي `never` حين يكون `P` أحد المفاتيح المحذوفة، و`P` في غير ذلك. في الدرس القادم سترى كيف تعمل `Exclude`، وكيف تصفّي المفاتيح حسب *نوع* قيمتها لا حسب اسمها.

## وضعها موضع التطبيق

أنواع مثل `FieldState` تؤتي ثمارها في الدوال التي تستخدمها. إليك دالة تحديث النموذج، مكتوبة مرة واحدة لأي نموذج، لا للعناوين فقط:

```ts
function setField<T, K extends keyof T>(form: FieldState<T>, key: K, value: T[K]): FieldState<T> {
  return { ...form, [key]: { ...form[key], value, touched: true } };
}

setField(addressForm, 'city', 'Dubai'); // ok
setField(addressForm, 'city', 42);      // Error: Argument of type 'number' is not assignable to parameter of type 'string'.
setField(addressForm, 'cty', 'Dubai');  // Error: Argument of type '"cty"' is not assignable to parameter of type 'keyof Address'.
```

هذا نمط `pluck` من القسم 2 مدموجًا مع mapped type. يُستنتج `K` من المفتاح الذي تمرّره، وتفحص `T[K]` القيمة مقابل نوع ذلك الحقل، ويضمن الـ mapped type أن للنموذج مدخلًا لكل حقل. وحين يُضاف حقل `deliveryNotes` إلى `Address`، يقبله نوع النموذج والـ setters وهذه الدالة فورًا، ويُعلَّم كل مكان يبني نموذجًا كاملًا إلى أن يتعامل مع الحقل الجديد.

:::tip سمِّ التحويلات التي تعيد استخدامها
الـ mapped types المكتوبة مباشرة داخل توقيعات الدوال صعبة القراءة. أعطِ كل تحويل اسمًا يقول ما الغاية منه (`FieldState` و`Patch` و`Setters`)، وأبقِه بجوار الأنواع التي يخدمها، ودع تلميحات التمرير تعرض التوسيع. يجب أن يفهم القارئ التوقيع من الاسم وحده.
:::

في التمرين ستعيد بناء أربعة utility types وتبني أنواع نموذج العنوان منها. والدرس القادم يضيف القطعة الناقصة، الشروط، كي تستطيع تحويلاتك اتخاذ القرارات.
