---
summary: صمّم عميل fetch تُستمدّ أنواعه من خريطة مسارات واحدة، بحيث يستنتج كل استدعاء أنواع مدخله واستجابته من اسم المسار، ولا يكتب المستدعون أبدًا وسيط نوع أو تحويلًا.
takeaways:
  - ضع مدخل كل endpoint ومخرجه في نوع واحد هو خريطة المسارات، واشتقّ توقيعات العميل منه.
  - اجعل اسم المسار موقع الاستنتاج الوحيد؛ وكل ما عداه يُبحث عنه انطلاقًا منه بالوصول بالفهرس.
  - أبقِ التحويلات التي لا مفرّ منها داخل التنفيذ، في مكان واحد، كي يحصل المستدعون على API مفحوص بالكامل.
  - العميل محدَّد الأنواع ما زال يثق باستجابة الخادم؛ تحقّق منها عند الحدود قبل أن تعتمد على نوع المخرج المعلَن.
further:
  - title: Indexed Access Types
    url: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
  - title: Generic constraints
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
  - title: Using the Fetch API (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
quiz:
  - q: |
      بالنظر إلى `call<R extends keyof Routes>(route: R, input: Routes[R]['input']): Promise<Routes[R]['output']>`، كيف يُحدَّد `R` في `call('GET /orders/:id', { id: 1042 })`؟
    options:
      - text: من الكائن `input`، بمطابقة شكله مع كل مسار.
        why: "نوع `input` هو `Routes[R]['input']`، الذي يعتمد على `R`؛ يُفحص بعد أن يُعرف `R`، ولا يُستخدم لإيجاده."
      - text: من نص المسار، الذي يبقى القيمة الحرفية `'GET /orders/:id'` لأن القيد union من قيم نصية حرفية.
        why: صحيح. تبقى القيمة الحرفية حرفية بفضل القيد `keyof Routes`، وتُبحث الأنواع الأخرى انطلاقًا منها.
      - text: من نوع الإرجاع المعلَن في موضع الاستدعاء.
        why: يمكن لـ TypeScript استخدام نوع إرجاع سياقي في بعض الحالات، لكن هنا وسيط المسار هو من يقرّر كل شيء.
    answer: 1
  - q: يحتاج تنفيذ `call` إلى قراءة معاملات المسار من `input`، ونوعه `Routes[R]['input']`. ما النهج الأكثر معقولية؟
    options:
      - text: "اجعل التوقيع العام يأخذ `input: any` كي يستطيع التنفيذ قراءة أي شيء."
        why: هذا يرمي الفحص الذي يعتمد عليه المستدعون، وهو الغاية من العميل أصلًا.
      - text: اكتب overload لكل مسار كي يكون كل تنفيذ محدّدًا.
        why: هذا يكرّر خريطة المسارات ويجب تحديثه يدويًا مع كل endpoint جديد.
      - text: أبقِ التوقيع العام generic وعامل `input` كـ `Record<string, unknown>` في الداخل، مع تحويل واحد مشروح بتعليق.
        why: صحيح. التحويل محلّي، يُراجَع مرة واحدة، وغير مرئي للمستدعين، الذين يحتفظون بالفحص الكامل.
    answer: 2
  - q: يعلن عميلك أن `'GET /orders/:id'` يُعيد `Order`. يطلق الخادم تغييرًا يعيد تسمية `status` إلى `state`. ماذا يفعل TypeScript؟
    options:
      - text: لا شيء وقت الترجمة؛ يقرأ الكود `order.status` فيحصل على `undefined` وقت التشغيل، ويفشل في مكان ما لاحقًا.
        why: صحيح. خريطة المسارات وعدٌ بشأن الخادم لا يستطيع TypeScript فحصه. تحقّق من الاستجابات عند الحدود لتلتقط هذا مبكرًا.
      - text: يبلّغ عن خطأ على سطر `call` في المرة القادمة التي تبني فيها المشروع.
        why: لا يرى TypeScript استجابة الخادم أبدًا. إنه يفحص كودك فقط مقابل الأنواع التي أعلنتها.
      - text: يرمي خطأ نوع وقت التشغيل داخل `call`.
        why: تُمحى الأنواع؛ لا شيء يفحص الاستجابة وقت التشغيل ما لم تكتب ذلك الفحص بنفسك.
    answer: 0
  - q: لماذا يُفضَّل تحديد المسار كنص واحد مثل `'POST /orders/:id/cancel'` بدل تمرير الطريقة والمسار كوسيطين منفصلين؟
    options:
      - text: لأن الوسيطين لا يمكن أن يكونا كلاهما literal types.
        why: يمكن ذلك؛ لكل وسيط نوعه الحرفي الخاص. المشكلة في الحفاظ على اتساقهما.
      - text: لأن المفتاح الواحد يعطي موقع استنتاج واحدًا يحدّد الـ endpoint، فلا يمكن أبدًا أن تتعارض الطريقة مع المسار.
        why: صحيح. مع وسيطين منفصلين ستحتاج إلى آليات إضافية لمنع اقتران `POST` بمسار لا يقبل إلا GET.
      - text: لأن `fetch` تتطلّب الطريقة داخل الرابط.
        why: "`fetch` تأخذ الطريقة في كائن الخيارات. المفتاح الواحد خيار في تحديد الأنواع، لا متطلّب وقت التشغيل."
    answer: 1
---

كل عميل API يبدأ بالطريقة نفسها: `fetch(url).then((r) => r.json())`، التي تُعيد `Promise<any>`، فتمتلئ قاعدة الكود ببطء بـ `as Order` و`as Order[]` في مواضع الاستدعاء. كل تحويل ادّعاءٌ صغير غير مُراجَع بشأن الخادم. هذا الدرس يجمع القسم كله لبناء عميل لا يكتب فيه المستدعون أي تحويل أو وسيط نوع، ويفشل فيه المسار الخاطئ أو الحقل الناقص أو المعرّف المكتوب بنوع خاطئ في الترجمة.

## مصدر حقيقة واحد: خريطة المسارات

ابدأ بكتابة كل endpoint مرة واحدة، كـ type:

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
type Order = { id: number; status: OrderStatus; totalCents: number };
type CancelledOrder = { id: number; status: 'cancelled'; cancelReason: string };
type Page<T> = { items: T[]; nextCursor: string | null };

type Routes = {
  'GET /orders/:id': { input: { id: number }; output: Order };
  'GET /orders': { input: { status?: OrderStatus; cursor?: string }; output: Page<Order> };
  'POST /orders/:id/cancel': { input: { id: number; reason: string }; output: CancelledOrder };
};
```

كل مفتاح يسمّي endpoint، الطريقة والمسار معًا. وكل قيمة تقول ما يأخذه الـ endpoint وما يُعيده. لن يذكر أي شيء آخر في العميل `Order` أو `Page` مباشرة؛ كل ذلك سيُشتقّ من هذا الجدول. وإضافة endpoint تعني إضافة سطر واحد هنا.

## اسم المسار هو موقع الاستنتاج الوحيد

الآن التوقيع. تريد أن يكتب المستدعي المسار والمدخل، ويحصل على نوع الاستجابة الصحيح:

```ts
async function call<R extends keyof Routes>(
  route: R,
  input: Routes[R]['input'],
): Promise<Routes[R]['output']> {
  // implementation below
}

const order = await call('GET /orders/:id', { id: 1042 });        // Order
const page = await call('GET /orders', { status: 'shipped' });    // Page<Order>
await call('POST /orders/:id/cancel', { id: 1042 });
// Error: Argument of type '{ id: number; }' is not assignable to parameter
// of type '{ id: number; reason: string; }'.
//   Property 'reason' is missing in type '{ id: number; }' but required in type …
```

كل فكرة من هذا القسم تعمل هنا. `R` يظهر ثلاث مرات، رابطًا المسار بالمدخل والمخرج. قيده، `keyof Routes`، هو union من قيم نصية حرفية، فيُستنتج الوسيط على أنه القيمة الحرفية `'GET /orders/:id'` لا `string`. ولـ `R` موقع استنتاج واحد فقط، هو `route`؛ أما `input` فـ*يستخدم* `R` فقط، عبر الوصول بالفهرس `Routes[R]['input']`. يستنتج TypeScript المسار، ثم يفحص المدخل مقابل ما يحتاجه ذلك المسار. لا حاجة إلى `NoInfer`، لأنه لا يوجد ما يمكن أن يساهم بمرشّح آخر.

:::figure يُستنتج مفتاح المسار مرة واحدة؛ ويُبحث عن المدخل والمخرج انطلاقًا منه
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">يمرّر موضع الاستدعاء نص مسار وكائن مدخل. يُستنتج نص المسار على أنه المفتاح الحرفي R. يفهرس R الخريطة Routes، فتنتج نوع المدخل الذي يُفحص به وسيط المدخل، ونوع المخرج المستخدَم للـ promise المُعاد.</title>
  <rect class="d-box" x="10" y="20" width="250" height="44" rx="10"/>
  <text class="d-code" x="135" y="47" text-anchor="middle">'GET /orders/:id'</text>
  <rect class="d-box" x="10" y="186" width="250" height="44" rx="10"/>
  <text class="d-code" x="135" y="213" text-anchor="middle">{ id: 1042 }</text>
  <path class="d-arrow" d="M260 42 L318 42" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="322" y="20" width="120" height="44" rx="10"/>
  <text class="d-code" x="382" y="47" text-anchor="middle">R</text>
  <path class="d-arrow" d="M382 64 L382 98" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="292" y="102" width="180" height="56" rx="12"/>
  <text class="d-code" x="382" y="135" text-anchor="middle">Routes[R]</text>
  <path class="d-arrow" d="M292 150 L264 196" marker-end="url(#arrow)"/>
  <text class="d-code" x="190" y="170" text-anchor="middle">['input'] يفحص</text>
  <path class="d-arrow" d="M472 130 L520 130" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="524" y="102" width="166" height="56" rx="12"/>
  <text class="d-code" x="607" y="128" text-anchor="middle">['output']</text>
  <text class="d-label-muted" x="607" y="148" text-anchor="middle">Promise&lt;Order&gt;</text>
</svg>
:::

## غير آمن من الداخل، آمن من الخارج

داخل `call`، نوع `input` هو `Routes[R]['input']` لـ `R` ما مجهول. لا يستطيع TypeScript معرفة الحقول التي فيه، فبناء الرابط يحتاج إلى تحويل. وهذا مقبول، ما دام يحدث في مكان واحد بالضبط:

```ts
type Transport = (method: string, path: string, body: unknown) => Promise<unknown>;

function createClient(transport: Transport) {
  return async function call<R extends keyof Routes>(
    route: R,
    input: Routes[R]['input'],
  ): Promise<Routes[R]['output']> {
    const [method, template] = route.split(' ');
    // The route map guarantees every :param has a matching input field.
    const values = input as Record<string, unknown>;
    const rest: Record<string, unknown> = { ...values };
    const path = template.replace(/:(\w+)/g, (_, name: string) => {
      delete rest[name];
      return encodeURIComponent(String(values[name]));
    });
    const result = await transport(method, path, method === 'GET' ? undefined : rest);
    return result as Routes[R]['output'];
  };
}
```

هناك تحويلان، كلاهما مشروح بتعليق، وكلاهما في الدالة الوحيدة التي يمرّ بها كل طلب. يحصل المستدعون على API مفحوص بالكامل، والمراجع الذي يريد تدقيق الأجزاء غير الآمنة يقرأ عشرة أسطر. قارن ذلك بقاعدة كود يقول فيها كل موضع من مئتي موضع استدعاء `as Order`.

حقن الـ `transport` قرار تصميمي يستحق التقليد. التطبيق الحقيقي يمرّر دالة تستدعي `fetch`؛ والاختبارات تمرّر نسخة مزيّفة تسجّل الطلبات وتُعيد بيانات جاهزة. والأنواع لا تهتم بأيّهما.

:::mistake تصديق نوع المخرج
`Promise<Routes[R]['output']>` وعدٌ *تقطعه أنت* بشأن الخادم، والـ `as` الأخيرة هي حيث تقطعه. إذا أعادت الواجهة الخلفية تسمية `status` إلى `state`، فسيظل كل شيء يمرّ في الترجمة، ويظهر الفشل كـ `undefined` على بعد ثلاثة components. الأنواع تنظّم افتراضاتك؛ لا تتحقّق منها. في [تحليل البيانات غير الموثوقة عند الحدود](lesson:l-at-4-3) ستضيف محلّلًا لكل مسار، فيُكتسب نوع المخرج وقت التشغيل بدل أن يُدّعى.
:::

## توسيع الخريطة

للعملاء الحقيقيين endpoints لا تأخذ شيئًا، مثل `'GET /me'`. مع هذا التصميم تعطيها `input: {}` ويكتب المستدعون `call('GET /me', {})`. ذلك الكائن الفارغ عيبٌ صغير، وهو مقايضة عادلة حاليًا: البديل توقيع يجعل `input` اختياريًا لبعض المسارات فقط، وهذا يحتاج إلى conditional type. ستملك تلك الأداة بعد [الـ Conditional Types والتوزيع و infer](lesson:l-at-3-3)، ولن يمسّ التغيير إلا التوقيع، لا موضع استدعاء واحدًا.

والأمر نفسه مع سلاسل الاستعلام مقابل أجسام الطلبات، أو الترويسات، أو أنواع الأخطاء لكل مسار. كلٌّ منها خاصية إضافية في قيم خريطة المسارات وعملية بحث إضافية في التوقيع. ويبقى شكل الحل كما هو: صِفه مرة واحدة في الجدول، واشتقّه في كل مكان آخر.

## ما الذي يجعل هذا التصميم جيدًا

انظر إلى ما لا يضطر المستدعي إلى فعله أبدًا: كتابة `<Order>`، أو التحويل، أو استيراد أنواع الاستجابات، أو تذكّر أيّ endpoints تحتاج أيّ حقول. أفضل الـ APIs الـ generic تبدو كأنها بلا أنواع إطلاقًا، لأن كل نوع فيها مستنتج من شيء كان على المستدعي كتابته على أي حال (هنا، اسم المسار).

:::tip علامات على أن الـ API الـ generic يحتاج إلى إعادة تصميم
مستدعون يكتبون وسائط نوع صريحة، ومستدعون يحوّلون النتائج، ومعاملات نوع لا تظهر إلا مرة واحدة: كلها أعراض. وتعني عادةً أن موقع الاستنتاج مفقود أو في المكان الخطأ. جِد الوسيط الواحد الذي يحدّد ما يريده المستدعي، واشتقّ كل ما عداه منه.
:::

في التمرين ستبني هذا العميل مقابل transport مزيّف. وبه ينتهي قسم الـ generics. القسم 3 يفكّك عوامل الأنواع (type operators) التي كنت تستعيرها (`keyof` والوصول بالفهرس) ويضيف الـ mapped والـ conditional والـ template literal types، كي تشتقّ المزيد من مصدر حقيقة واحد.
