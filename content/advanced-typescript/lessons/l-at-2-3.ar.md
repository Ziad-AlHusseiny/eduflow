---
summary: احجب مواقع الاستنتاج غير المرغوبة بـ NoInfer، وأعطِ معاملات النوع قيمًا افتراضية معقولة، واختر بين الـ overloads والـ unions والدوال المنفصلة حين يعتمد نوع الإرجاع على المدخل.
takeaways:
  - كل ظهور لمعامل النوع موقعُ استنتاج، فقد يؤدّي خطأ إملائي في وسيط واحد إلى توسيع النوع بدل رفضه.
  - "`NoInfer<T>` (منذ TypeScript 5.4) تجعل الموضع للفحص فقط: يُتحقَّق منه مقابل `T` لكنه لا يساهم بأي مرشّح."
  - القيم الافتراضية لمعاملات النوع تُطبَّق حين لا يوجد ما يُستنتج منه، وتجعل وسائط النوع الصريحة الجزئية ممكنة.
  - الـ overloads تتيح لنوع الإرجاع أن يعتمد على نوع الوسيط، لكن الوسيط من نوع union لا يطابق أيًّا منها؛ ودالتان بأسماء جيدة كثيرًا ما تكونان أوضح.
further:
  - title: NoInfer (TypeScript 5.4 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html
  - title: Function overloads
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads
  - title: NoInfer utility type
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html#noinfertype
quiz:
  - q: |
      لماذا يمرّ هذا الاستدعاء في الترجمة رغم أن `'WELCOM10'` خطأ إملائي؟
      ```ts
      function applyCoupon<C extends string>(available: C[], code: C) {}
      applyCoupon(['WELCOME10', 'LOYAL5'], 'WELCOM10');
      ```
    options:
      - text: لأن القيم النصية الحرفية تتّسع دائمًا إلى `string` في الاستدعاءات الـ generic.
        why: القيد `extends string` يحتفظ بالقيم الحرفية. المشكلة في مصدر تلك القيم.
      - text: لأن `code` هو أيضًا موقع استنتاج، فيصبح `C` هو `'WELCOME10' | 'LOYAL5' | 'WELCOM10'`.
        why: "صحيح. يُجمع الخطأ الإملائي كمرشّح بدل أن يُفحص. والحل `code: NoInfer<C>`."
      - text: لأن المصفوفات تُستنتج بعد الوسائط العادية.
        why: المصفوفات ليست حسّاسة للسياق؛ كلا الوسيطين يساهم بمرشّحين في الجولة نفسها.
    answer: 1
  - q: "`function request<TRes = unknown, TBody = undefined>(path: string, body?: TBody): Promise<TRes>`. ماذا تفعل `request<Order>('/orders/1')`؟"
    options:
      - text: خطأ، لأنه لم يُعطَ إلا واحد من وسيطَي النوع.
        why: تلك القاعدة تنطبق على معاملات النوع التي ليس لها قيم افتراضية. هنا لـ `TBody` قيمة افتراضية، فيمكن حذفه.
      - text: "`TRes` هو `Order` و`TBody` يُستنتج من `body` الغائب."
        why: ما إن تمرّر وسائط نوع صريحة حتى يتوقّف الاستنتاج كليًا؛ والمحذوفة تأخذ قيمها الافتراضية.
      - text: "`TRes` هو `Order` و`TBody` يرجع إلى قيمته الافتراضية `undefined`."
        why: صحيح. القيم الافتراضية هي ما يجعل وسائط النوع الصريحة الجزئية مشروعة.
    answer: 2
  - q: |
      مع هذه الـ overloads، ماذا يحدث في السطر الأخير؟
      ```ts
      function getOrder(id: number): Promise<Order>;
      function getOrder(ids: number[]): Promise<Order[]>;
      function getOrder(idOrIds: number | number[]): Promise<Order | Order[]> { /* … */ }
      declare const input: number | number[];
      getOrder(input);
      ```
    options:
      - text: يُعيد `Promise<Order | Order[]>` من توقيع التنفيذ.
        why: توقيع التنفيذ غير مرئي للمستدعين. لا يمكن مطابقة إلا توقيعات الـ overloads التي فوقه.
      - text: خطأ، "No overload matches this call"، لأنه لا يوجد overload واحد يقبل الـ union.
        why: صحيح. تُجرَّب الـ overloads واحدًا تلو الآخر، ولا يقبل أيٌّ منها `number | number[]`. ستحتاج إلى overload ثالث للـ union.
      - text: يختار الـ overload الأول، لأن الـ overloads تُجرَّب بالترتيب.
        why: الترتيب يحدّد أيّ overload يفوز حين يتطابق أكثر من واحد. هنا لا يتطابق أيٌّ منها، لأن `number[]` تفشل في الأول.
    answer: 1
  - q: تصمّم دالة بحث تُعيد طلبًا واحدًا لمعرّف، وقائمة لعميل. أيّ API هو الأسهل للمستدعين وللمسؤولين عن صيانة الكود؟
    options:
      - text: دالتان، `getOrder(id)` و`getOrdersForCustomer(customerId)`، لكلٍّ منهما توقيع بسيط.
        why: صحيح. كل دالة تقول ما تفعله، ولا تحتاج إلى overloads أو conditional types، والـ inference فيها بديهي.
      - text: دالة واحدة `get(idOrCustomer)` بتوقيعَي overload.
        why: هذا يعمل لكنه يحشر نيّتين في اسم واحد، والمستدعون الذين لديهم مدخلات من نوع union سيصطدمون بـ "No overload matches".
      - text: دالة generic واحدة `get<T>(key)` بنوع إرجاع شرطي مبني على `T`.
        why: أنواع الإرجاع الشرطية تحتاج عادةً إلى تحويلات داخل التنفيذ، وموضع الاستدعاء أقل وضوحًا من دالة مسمّاة.
    answer: 0
---

إليك دالة مساعدة من نظام الدفع في Cartwheel. تبدو آمنة، وفيها ثغرة:

```ts
function applyCoupon<C extends string>(available: C[], code: C) {
  // …
}

applyCoupon(['WELCOME10', 'LOYAL5'], 'WELCOM10'); // compiles
```

النية واضحة: يجب أن يكون `code` واحدًا من الكوبونات المتاحة. لكن `C` يظهر في المعاملين كليهما، وكما رأيت في الدرس السابق، كل ظهور موقعُ استنتاج. يجمع TypeScript القيم `'WELCOME10'` و`'LOYAL5'` و`'WELCOM10'` كمرشّحين، ويجعل `C` هو الـ union من الثلاثة، فيجتاز كل شيء فحص الأنواع. لم يُفحص الخطأ الإملائي مقابل القائمة؛ بل أُضيف إليها.

## NoInfer: افحص هنا، لكن لا تستنتج من هنا

أضاف TypeScript 5.4 النوع المدمج `NoInfer<T>`. يُحَلّ إلى `T` العادي، لكنه يجعل ذلك الموضع محظورًا على الـ inference:

```ts
function applyCoupon<C extends string>(available: C[], code: NoInfer<C>) {
  // …
}

applyCoupon(['WELCOME10', 'LOYAL5'], 'WELCOM10');
// Error: Argument of type '"WELCOM10"' is not assignable to parameter of type '"WELCOME10" | "LOYAL5"'.
```

الآن يُستنتج `C` من `available` وحدها، ويُفحص `code` مقابل النتيجة. يظهر هذا النمط كلما كان أحد الوسائط يعرّف مجموعة وعلى وسيط آخر أن يختار منها: حالة ابتدائية يجب أن تكون إحدى الحالات المعرَّفة، أو قيمة افتراضية يجب أن تطابق الخيارات، أو مفتاح ترتيب يجب أن يكون أحد الأعمدة المدرَجة.

```ts
function createMachine<S extends string>(config: { states: S[]; initial: NoInfer<S> }) {
  return config;
}

createMachine({ states: ['cart', 'shipping', 'payment'], initial: 'cart' });    // ok
createMachine({ states: ['cart', 'shipping', 'payment'], initial: 'checkout' }); // error
```

قبل 5.4، كان الحل البديل معامل نوع ثانيًا مقيَّدًا بالأول، `<C extends string, D extends C>(available: C[], code: D)`. هذا يعمل، وستراه في المكتبات القديمة، لكنه يضيف معاملًا لا وجود له إلا للتهرّب من الاستنتاج. استخدم `NoInfer` في الكود الجديد. فهي توثّق النية أيضًا: القارئ الذي يرى `initial: NoInfer<S>` يعرف من النظرة الأولى أيّ وسيط هو مصدر الحقيقة وأيّها يُفحص فقط، وهذا ما لم توضّحه حيلة المعاملين أبدًا.

:::mistake تغليف الموضع الخطأ
توضع `NoInfer` على الموضع الذي يجب أن *يُفحص*، لا على الموضع الذي يعرّف النوع. اكتب `available: NoInfer<C>[]` بدلًا من ذلك وسيُستنتج `C` من الرمز المفرد وحده، فتُفحص القائمة مقابل الخطأ الإملائي. اسأل "أيّ وسيط هو مصدر الحقيقة؟" واترك ذلك الوسيط دون تغليف.
:::

## قيم افتراضية لمعاملات النوع

يمكن أن تكون لمعامل النوع قيمة افتراضية، تُستخدم حين لا يوجد ما يُستنتج منه:

```ts
type ApiResponse<T = unknown> = { data: T; requestId: string };

async function request<TRes = unknown, TBody = undefined>(path: string, body?: TBody): Promise<TRes> {
  const res = await fetch(path, { method: body === undefined ? 'GET' : 'POST', body: JSON.stringify(body) });
  return res.json();
}
```

أمران يجعلان القيم الافتراضية مفيدة. أولًا، `ApiResponse` وحدها تعني الآن `ApiResponse<unknown>`، وهي قيمة افتراضية آمنة: على المستدعين تضييق `data` قبل استخدامها. ثانيًا، القيم الافتراضية تجعل **وسائط النوع الصريحة الجزئية** مشروعة. دونها كانت `request<Order>('/orders/1042')` ستفشل مع "Expected 2 type arguments"؛ ومعها يرجع `TBody` إلى `undefined`.

اختر قيمًا افتراضية آمنة لا مريحة. `unknown` قيمة افتراضية جيدة للبيانات القادمة من الخارج؛ أما `any` فلا، لأنها تُطفئ الفحص بصمت لكل من ينسى وسيط النوع. (ولاحظ أن `request<Order>` ما زالت تحويلًا متنكّرًا: جسم الاستجابة لا يُفحص. ستُصلح ذلك كما ينبغي في الدرس القادم وفي [تحليل البيانات غير الموثوقة عند الحدود](lesson:l-at-4-3).)

## حين يعتمد نوع الإرجاع على الوسيط

أحيانًا يحدّد *نوعُ* الوسيط نوعَ النتيجة. الـ overloads (التحميل الزائد) تصف ذلك مباشرة:

```ts
function formatPrice(cents: number): string;
function formatPrice(cents: number[]): string[];
function formatPrice(cents: number | number[]): string | string[] {
  return Array.isArray(cents) ? cents.map(toDollars) : toDollars(cents);
}

function toDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const one = formatPrice(4500);          // string
const many = formatPrice([4500, 1299]); // string[]
```

السطران الأولان هما **توقيعا الـ overload** اللذان يراهما المستدعون. والثالث هو **توقيع التنفيذ**، الذي يجب أن يتوافق معها جميعًا وهو غير مرئي من الخارج. يجرّب TypeScript الـ overloads من الأعلى إلى الأسفل ويستخدم أول واحد يطابق، فضع الأكثر تحديدًا أولًا.

للـ overloads حافة حادة واحدة: المستدعي الذي بين يديه `number | number[]` لا يطابق *أيًّا* من الـ overloads، فيحصل على "No overload matches this call". ستحتاج إلى overload ثالث يقبل الـ union. وهذه الحافة تلميح بشأن التصميم. إذا كان لدى المستدعين الـ union غالبًا، فالدالة تريد على الأرجح توقيعًا واحدًا؛ وإن كان نادرًا، فدالتان منفصلتان باسمين واضحين (`formatPrice` و`formatPrices`) تتفوّقان عادةً على دالة واحدة محمّلة بالـ overloads.

:::tip قاعدة افتراضية لتصميم الـ API
فضّل بالترتيب: دوال منفصلة بأسماء جيدة؛ ثم توقيعًا واحدًا بـ union حيث لا يعتمد نوع الإرجاع على المدخل؛ ثم الـ overloads حين تحدّد أنواع API موجود في JavaScript أو حين تكون الراحة مهمة فعلًا. أنواع الإرجاع الشرطية على الدوال الـ generic تأتي أخيرًا؛ فهي تحتاج عادةً إلى تحويلات داخل التنفيذ، وسترى ذلك في القسم 3.
:::

في التمرين ستُصلح ثلاثًا من مشكلات الـ inference هذه في نظام الدفع في Cartwheel. والدرس القادم يجمع كل ما في هذا القسم في عميل API واحد محدَّد الأنواع.
