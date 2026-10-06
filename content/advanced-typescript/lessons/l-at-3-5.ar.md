---
summary: اكتب أنواعًا تعاودية للأشجار وJSON والتحويلات العميقة، وافهم حدود العمق في الـ compiler، وقرّر متى يكلّف النوع الذكي أكثر من الخطأ الذي يمنعه.
takeaways:
  - يمكن للاسم المستعار للنوع (type alias) أن يشير إلى نفسه، وهكذا تصف الأشجار وJSON وغيرها من البيانات المتداخلة.
  - الدوال التعاودية على مستوى الأنواع مثل `DeepReadonly` و`DeepPartial` تحتاج إلى حالات صريحة للدوال والمصفوفات، وإلا حوّلت أشياء لم تقصد لمسها.
  - يوقف TypeScript التعاود بعد بضع عشرات من المستويات المتداخلة، أو نحو 1,000 للـ conditional types ذات التعاود الذيلي، برسالة "Type instantiation is excessively deep".
  - "`readonly` تمنع فقط إسناد الخصائص؛ أما methods مثل `Date#setFullYear` أو `Map#set` فما زالت تعدّل القيمة المعرَّفة للقراءة فقط بعمق."
  - قبل اعتماد نوع ذكي، اسأل ما الخطأ الذي يمنعه، وهل يستطيع زميل قراءة أخطائه، وكم يكلّف المحرّر.
further:
  - title: Recursive conditional types (TypeScript 4.1 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html
  - title: Tail-recursion elimination on conditional types (TypeScript 4.5 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html
  - title: Awaited utility type
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype
quiz:
  - q: |
      بهذا التعريف، ما نوع `o.lines`؟
      ```ts
      type DeepReadonly<T> = T extends (...args: any[]) => any
        ? T
        : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
      declare const o: DeepReadonly<{ lines: { sku: string }[] }>;
      ```
    options:
      - text: "`{ sku: string }[]`، لأن الـ mapped types تتخطّى المصفوفات"
        why: الـ mapped type التماثلي المطبَّق على مصفوفة ينتج مصفوفة، وهنا يضيف `readonly` أيضًا.
      - text: "`readonly { readonly sku: string }[]`"
        why: صحيح. المرور على نوع مصفوفة يعطي مصفوفة للقراءة فقط، ويُجعل كل عنصر للقراءة فقط بعمق بالاستدعاء التعاودي.
      - text: "`{ readonly 0: …; readonly length: number; … }`، كائن بمفاتيح رقمية"
        why: يعامل TypeScript الـ mapped types التماثلية على المصفوفات والـ tuples معاملة خاصة، فتبقى النتيجة نوع مصفوفة.
    answer: 1
  - q: لماذا يحتاج نوع `DeepReadonly` عادةً إلى فرع منفصل للدوال؟
    options:
      - text: لأن المرور على نوع دالة يحوّله إلى كائن بلا توقيع استدعاء، فلا يعود قابلًا للاستدعاء.
        why: صحيح. الـ mapped type يحتفظ بالخصائص لا بتوقيعات الاستدعاء، فتتوقّف `onSubmit` عن كونها قابلة للاستدعاء.
      - text: لأن الدوال لا يمكن أن تكون للقراءة فقط في JavaScript.
        why: المشكلة في تحويل النوع، لا في التجميد وقت التشغيل؛ الـ mapped type سينزع توقيع الاستدعاء.
      - text: لأن `keyof` على نوع دالة خطأ.
        why: "`keyof` على نوع دالة مقبولة (وهي في الغالب `never`). المشكلة فيما ينتجه الـ mapped type."
    answer: 0
  - q: "`MyAwaited<T> = T extends Promise<infer V> ? MyAwaited<V> : T`. ما هو `MyAwaited<Promise<Promise<Order>>>`؟"
    options:
      - text: "`Promise<Order>`"
        why: هذا فكّ لمستوى واحد. الاستدعاء التعاودي يستمر ما دام النوع promise.
      - text: "`Order`"
        why: صحيح. يفكّ التعاود promise واحدًا في كل خطوة ويتوقّف حين لا يعود النوع promise.
      - text: "`never`، لأن الـ promises المتداخلة لا توجد وقت التشغيل"
        why: النوع يتعلّق بما يقوله التعريف؛ وقت التشغيل لا يحتوي الـ promise المحلول promise آخر أبدًا، ولهذا يكون فكّ كل المستويات صحيحًا.
      - text: خطأ، لأن الـ conditional type لا يمكن أن يشير إلى نفسه
        why: الـ conditional types التعاودية مسموحة منذ TypeScript 4.1.
    answer: 1
  - q: يضيف زميل نوع `Paths<T>` يولّد كل مسار بالنقاط لحالة الدفع ذات الأربعين حقلًا، فيصبح المحرّر بطيئًا. ما الإصلاح الأكثر واقعية؟
    options:
      - text: ارفع حد التعاود في الـ compiler من tsconfig.
        why: لا يوجد خيار في tsconfig لحد عمق التجسيد، والبطء يتعلّق بكمية العمل لا بالحد.
      - text: أضف مزيدًا من اختبارات الأنواع كي يُتحقَّق من النوع.
        why: الاختبارات تفحص الصحة لا الكلفة. سيبقى النوع بالبطء نفسه مع الاختبارات.
      - text: غلّف النوع بـ `NoInfer` كي لا يُحسب في مواضع الاستدعاء.
        why: "`NoInfer` تؤثّر فقط في مرشّحي الاستنتاج؛ ما زال يجب توسيع النوع لفحص الوسائط."
      - text: استبدله بنوع أضيق، مثل دوال وصول محدَّدة الأنواع للمسارات القليلة التي يستخدمها الكود فعلًا.
        why: صحيح. النوع الأصغر والصريح يعطي الحماية نفسها حيث تهمّ، ولا يكلّف الـ compiler شيئًا يُذكر.
    answer: 3
---

فئات المنتجات في Cartwheel تشكّل شجرة: Kitchen تحتوي Cookware، التي تحتوي Pans. يُعيد الـ API هذه الشجرة كـ JSON متداخل، وتعدّل شاشة إعدادات الدفع كائن إعداد متداخلًا بعمق. كلاهما يحتاج إلى أنواع تشير إلى نفسها. يتعامل TypeScript مع ذلك جيدًا، إلى حدٍّ ما. هذا الدرس يغطّي كيف تكتب الأنواع التعاودية، وأين تقع الحدود، والقرار التقديري الذي كان هذا القسم كله يمهّد له: متى تتوقّف.

## أنواع تشير إلى نفسها

يمكن للاسم المستعار للنوع أن يذكر نفسه داخل نوع كائن أو مصفوفة:

```ts
type Category = { id: number; name: string; children: Category[] };

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
```

`Category` يصف شجرة بأي عمق. و`Json` يصف أي قيمة يمكن أن تُعيدها `JSON.parse`، ما يجعله نوع إرجاع أفضل بكثير لمحلّل من `any`: إنه صادق، ويجبرك على التضييق قبل الاستخدام.

*الدوال التعاودية على مستوى الأنواع* تتبع الفكرة نفسها. `Awaited<T>`، المدمج في الـ lib منذ TypeScript 4.5، يفكّ الـ promises حتى لا يبقى منها شيء. إليك نسخة مبسّطة:

```ts
type MyAwaited<T> = T extends Promise<infer V> ? MyAwaited<V> : T;

type Loaded = MyAwaited<Promise<Promise<Order>>>; // Order
```

كل خطوة تقشر `Promise` واحدًا وتستدعي نفسها على ما كان بداخله. وحين لا يعود النوع promise، يُعيده الفرع الكاذب وينتهي التعاود.

## التحويلات العميقة

الـ mapped types من [الـ Mapped Types وإعادة تسمية المفاتيح](lesson:l-at-3-2) سطحية. والتعاود يجعلها عميقة:

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type FrozenCheckout = DeepReadonly<Checkout>;
```

لكل حالة سببها. الأنواع الأولية تمرّ دون تغيير. والكائنات تُحوَّل، وتُعالَج كل خاصية تعاوديًا. والدوال لها فرعها الخاص لأن الـ mapped type يحتفظ بالخصائص لا بتوقيعات الاستدعاء: دون هذا الفرع، سيتحوّل handler مثل `onSubmit` إلى كائن لا يمكنك استدعاؤه. أما المصفوفات فلا تحتاج حالة خاصة هنا، لأن الـ mapped type التماثلي المطبَّق على مصفوفة ينتج مصفوفة للقراءة فقط.

`DeepPartial` هو الآخر الذي ستصادفه، عادةً لبيانات الاختبار الجاهزة (fixtures) ولتجاوزات الإعداد:

```ts
type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

declare function checkoutFixture(overrides?: DeepPartial<Checkout>): Checkout;
checkoutFixture({ shipping: { address: { country: 'JO' } } });
```

هنا تُحفظ المصفوفات كاملة عن قصد: مصفوفة جزئية من بنود جزئية نادرًا ما تكون ما يقصده الاختبار.

:::mistake الثقة بأن readonly تجمّد الكائنات
`DeepReadonly` تمنع `checkout.placedAt = …`، لكن `checkout.placedAt.setFullYear(2020)` ما زالت تمرّ في الترجمة، لأن `setFullYear` هي method والـ methods تُحفظ كما هي. والأمر نفسه مع `Map#set` و`Set#add` وأي شيء آخر يعدّل عبر method. `readonly` وعدٌ بشأن إسناد الخصائص، لا بشأن الثبات. للقيم التي يجب ألا تتغيّر، استخدم `ReadonlyMap` و`ReadonlySet` والبيانات العادية، واعتبر `Object.freeze` هي الضمانة وقت التشغيل.
:::

## المسارات، وكلفة الذكاء

هذا هو النوع الذي يلجأ إليه الناس حين يريدون أن تُفحص `get(checkout, 'shipping.address.city')`:

```ts
type Paths<T> = {
  [K in keyof T & string]: T[K] extends object ? K | `${K}.${Paths<T[K]>}` : K;
}[keyof T & string];

type CheckoutPath = Paths<{ shipping: { address: { city: string; country: string } }; totalCents: number }>;
// 'shipping' | 'shipping.address' | 'shipping.address.city' | 'shipping.address.country' | 'totalCents'
```

إنه يعمل، وعلى نوع صغير يكون ممتعًا. لكنه أيضًا mapped type وشرط وtemplate literal وتعاود في أربعة أسطر، وكلفته تنمو مع كل حقل وكل مستوى. على كائن حالة حقيقي من 40 حقلًا فيه مصفوفات وتواريخ، قد ينتج نوع كهذا آلاف الأعضاء ويجعل كل ضغطة مفتاح في المحرّر أبطأ.

ولدى TypeScript أيضًا حدود صارمة. كل تجسيد متداخل يُحسب، وبعد بضع عشرات من مستويات التعاود العادي تحصل على *Type instantiation is excessively deep and possibly infinite*. ومنذ TypeScript 4.5، يُحسَّن الـ conditional type الذي يكون استدعاؤه التعاودي في **موضع ذيلي (tail position)** (أي النتيجة الكاملة لفرع، كما في `MyAwaited`)، ويمكن أن يُنفَّذ نحو 1,000 تكرار. ولا يوجد خيار في الـ compiler لرفع أيٍّ من الحدّين.

:::why متى تتوقّف
في عملية الترحيل التي قُدتها لكود من 400,000 سطر، حذفنا من الأنواع الذكية أكثر مما كتبنا. الاختبار الذي استخدمناه، والذي أوصي به، فيه ثلاثة أسئلة. **ما الخطأ الذي يمنعه هذا النوع؟** سمِّه، ويُفضَّل أن يكون خطأً رأيته في الإنتاج. **هل يستطيع زميل قراءة الخطأ الذي ينتجه؟** إن كانت الرسالة 30 سطرًا من الأنواع الموسَّعة، فسيلجأ الناس إلى التحويلات للخروج منها، وتضيع الحماية. **كم يكلّف؟** تحقّق من الوقت الذي يستغرقه المحرّر لعرض تلميح، وكيف يتغيّر زمن البناء. مفتاح `string` بسيط مع فحص وقت التشغيل، أو خمس دوال وصول محدَّدة الأنواع، كثيرًا ما يعطي 90% من الأمان مقابل 5% من التعقيد.
:::

الأنواع التعاودية هي الأداة الصحيحة للبيانات التعاودية فعلًا: الأشجار، وJSON، والإعدادات المتداخلة. ولكل ما عدا ذلك، اكتب النوع الممل أولًا، ولا تلجأ إلى الذكي إلا حين يبرّره خطأ حقيقي.

في التمرين ستكتب `MyAwaited` و`DeepReadonly` و`DeepPartial`، وتستخدم الأخير لبيانات اختبار جاهزة. وبه يُختم قسم مستوى الأنواع. القسم 4 ينتقل إلى الأنماط: ما تبنيه الفرق المتمرّسة فعلًا بكل هذا.
