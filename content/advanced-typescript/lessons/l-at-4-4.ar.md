---
summary: ابنِ event emitter تُفحص أسماء أحداثه وحمولاتها من خريطة أحداث واحدة، وbuilder يكبر نوع نتيجته مع كل استدعاء method.
takeaways:
  - "نوع خريطة الأحداث (`{ 'order.shipped': { orderId: number } }`) هو مصدر الحقيقة الواحد لأسماء الأحداث وأنواع حمولاتها معًا."
  - "`on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void)` تربط معامل الـ handler باسم الحدث الذي يمرّره المستدعي."
  - معامل البقية الشرطي يتيح إطلاق الأحداث التي لا حمولة لها دون وسيط وهمي.
  - يستطيع الـ builder حمل الحالة في معامل نوع، مُعيدًا نوعًا جديدًا أوسع من كل استدعاء، فيعكس نوع النتيجة النهائي كل خطوة.
  - أبقِ التخزين غير محدَّد الأنواع داخل الصنف والأنواع الدقيقة على methods العامة، كي يعيش التحويل الوحيد في مكان واحد.
further:
  - title: Generic Classes
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-classes
  - title: Classes (this-based types and parameter properties)
    url: https://www.typescriptlang.org/docs/handbook/2/classes.html
  - title: Rest parameters with tuple types (TypeScript 3.0 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html
quiz:
  - q: |
      مع `bus = new Emitter<CheckoutEvents>()`، ما نوع `p`؟
      ```ts
      type CheckoutEvents = {
        'order.shipped': { orderId: number; carrier: string };
        'payment.failed': { orderId: number; reason: string };
      };
      bus.on('payment.failed', (p) => console.log(p.reason));
      ```
    options:
      - text: "`CheckoutEvents[keyof CheckoutEvents]`، الـ union من الحمولتين"
        why: هذا ما سيحدث لو كان نوع اسم الحدث `keyof Events` دون معامل نوع. أما `K` فيلتقط الاسم المحدّد.
      - text: "`unknown`، لأن الـ handlers مخزّنة في Map بلا أنواع"
        why: طريقة تخزين الـ handlers تفصيل في التنفيذ؛ التوقيع العام هو ما يحدّد ما يراه المستدعون.
      - text: "`any`، لأن الـ callbacks تُحدَّد أنواعها من السياق"
        why: تحديد النوع من السياق يعطي `p` نوع المعامل من التوقيع، وهو دقيق هنا.
      - text: "`{ orderId: number; reason: string }`"
        why: صحيح. يُستنتج `K` على أنه `'payment.failed'`، ومعامل الـ handler هو `CheckoutEvents[K]`.
    answer: 3
  - q: "لماذا نحدّد نوع `emit` بـ `...args: EventArgs<Events[K]>` بدل `payload: Events[K]`؟"
    options:
      - text: كي يمكن إطلاق الأحداث التي حمولتها `undefined` هكذا `emit('checkout.opened')` دون وسيط ثانٍ.
        why: صحيح. ينتج الشرط tuple فارغًا للأحداث التي لا حمولة لها، وtuple من عنصر واحد في غير ذلك.
      - text: لأن معاملات البقية أسرع وقت التشغيل.
        why: الاختيار يتعلّق بتوقيع النوع؛ والفرق وقت التشغيل لا يُذكر.
      - text: لأن `Events[K]` لا يمكن استخدامها نوعًا لمعامل.
        why: يمكن ذلك؛ `on` تستخدمها لمعامل الـ handler. صيغة البقية تحلّ فقط حالة الحمولة الغائبة.
    answer: 0
  - q: |
      ما نوع `rows`؟
      ```ts
      const rows = new OrderQuery().select('id').select('totalCents').run(allOrders);
      ```
    options:
      - text: "`Order[]`، لأن `run` تُعيد دائمًا طلبات كاملة"
        why: في هذا الـ builder تُعيد `run` النوع `Pick<Order, Selected>[]`، و`Selected` كبر مع كل استدعاء.
      - text: "`Pick<Order, 'id' | 'totalCents'>[]`"
        why: صحيح. كل `select` تُعيد `OrderQuery<Selected | K>`، فيراكم معامل النوع الحقلين كليهما.
      - text: "`Pick<Order, 'totalCents'>[]`، لأن الاستدعاء الثاني يستبدل الأول"
        why: الاستدعاء الثاني يوسّع `Selected` بـ union؛ لا يستبدله.
    answer: 1
  - q: لماذا يُعيد كل استدعاء لـ `select` كائن `OrderQuery` جديدًا بدل تعديل `this` وإعادته؟
    options:
      - text: لأن الأصناف لا يمكنها إعادة `this` من الـ methods.
        why: يمكنها ذلك؛ والـ APIs المتسلسلة تفعله كثيرًا. المشكلة فيما يستطيع نوع `this` التعبير عنه.
      - text: لأن الـ method لا تستطيع تغيير نوع الكائن الذي تُستدعى عليه، فيحتاج النوع الأوسع إلى قيمة جديدة.
        why: صحيح. `this` يحتفظ بنوعه طوال حياته؛ وإعادة نسخة جديدة بمعامل نوع جديد هي الطريقة التي يكبر بها النوع.
      - text: لأن التعديل غير مسموح في أصناف TypeScript.
        why: يسمح TypeScript بالتعديل بحرية؛ هذا قيد في تحديد الأنواع، لا قاعدة في اللغة.
    answer: 1
---

يُطلق نظام الدفع في Cartwheel أحداثًا: `order.shipped` و`payment.failed` و`checkout.opened`. وتستمع إليها أدوات التحليلات وخدمة البريد وصفحة الطلب. النسخة الأولى استخدمت emitter عاديًا بأسماء من نوع `string` وحمولات من نوع `any`، فأنتجت الخطأين الكلاسيكيين: listener لـ `'order.shiped'` لم يُطلَق أبدًا، وhandler يقرأ `payload.trackingNo` من حدث يرسل `trackingNumber`. كلاهما كان غير مرئي حتى لاحظ أحدهم رسائل بريد مفقودة.

كل ما في هذا القسم والذي قبله يجتمع لإصلاح ذلك.

## خريطة واحدة، كل الأنواع

صِف كل حدث مرة واحدة، في خريطة من الاسم إلى نوع الحمولة:

```ts
type CheckoutEvents = {
  'checkout.opened': undefined;
  'order.shipped': { orderId: number; carrier: string; trackingNumber: string };
  'payment.failed': { orderId: number; reason: string };
};
```

يمكنك أيضًا توليد جزء من هذه الخريطة بالـ mapped type ذي الـ template literal من [الـ Template Literal Types](lesson:l-at-3-4). وفي الحالتين، الخريطة هي مصدر الحقيقة الواحد: الأسماء مفاتيحها، والحمولات قيمها.

## الـ emitter محدَّد الأنواع

```ts
type EventArgs<P> = [P] extends [undefined] ? [] : [payload: P];
type Handler = (payload: never) => void;

class Emitter<Events extends Record<string, unknown>> {
  #handlers = new Map<keyof Events, Set<Handler>>();

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): () => void {
    let set = this.#handlers.get(event);
    if (!set) {
      set = new Set();
      this.#handlers.set(event, set);
    }
    set.add(handler);
    return () => set.delete(handler);
  }

  emit<K extends keyof Events>(event: K, ...args: EventArgs<Events[K]>): void {
    for (const handler of this.#handlers.get(event) ?? []) {
      // Handlers for K were registered with a matching payload type in on().
      (handler as (payload: unknown) => void)(args[0]);
    }
  }
}
```

النمط هو نمط عميل الـ API، مطبَّقًا على الأحداث. يُستنتج `K` من اسم الحدث وله مهمة واحدة: البحث عن الحمولة في `Events[K]`. في `on`، يسري ذلك النوع إلى معامل الـ handler، فيُحدَّد نوع الـ callback من السياق. وفي `emit`، يفحص الحمولة التي تمرّرها.

```ts
const bus = new Emitter<CheckoutEvents>();

const off = bus.on('order.shipped', (e) => sendEmail(`Tracking: ${e.trackingNumber}`));
bus.emit('order.shipped', { orderId: 1042, carrier: 'DHL', trackingNumber: '1Z-999' });
bus.emit('checkout.opened');                         // no payload needed
bus.on('order.shiped', () => {});
// Error: Argument of type '"order.shiped"' is not assignable to parameter of type 'keyof CheckoutEvents'.
bus.emit('payment.failed', { orderId: 1042 });
// Error: … Property 'reason' is missing …
off(); // unsubscribe
```

`EventArgs` هي حيلة معامل البقية الشرطي من [الـ Conditional Types والتوزيع و infer](lesson:l-at-3-3): الأحداث التي لا حمولة لها لا تأخذ أي وسيط إضافي، والباقية تأخذ واحدًا بالضبط. والأقواس في `[P] extends [undefined]` توقف التوزيع، فيبقى نوع حمولة مثل `string | undefined` مطلوبًا بدل أن يُقسم.

لاحظ أين تعيش الأنواع الفضفاضة. داخل الصنف، تُخزَّن الـ handlers كـ `Set<Handler>` وتُستدعى عبر تحويل واحد مشروح بتعليق، لأن `Map` لا تستطيع التعبير عن "نوع القيمة يعتمد على المفتاح". وفي الخارج، كل method دقيقة. هذا الفصل، أي تخزين بلا أنواع خلف واجهة محدَّدة الأنواع، هو طريقة بناء معظم المكتبات جيدة الأنواع. والحقل الخاص `#handlers` حقل خاص حقيقي في JavaScript، فلا يستطيع شيء من الخارج الوصول إليه وكسر الثابت.

حين يكون القلب محدَّد الأنواع، ترث الـ methods الجديدة الدقة شبه مجانًا. method باسم `once` تحلّ promise بالحمولة التالية تأخذ أربعة أسطر، ونتيجتها محدَّدة النوع لكل حدث دون تعليقات إضافية:

```ts
once<K extends keyof Events>(event: K): Promise<Events[K]> {
  return new Promise((resolve) => {
    const off = this.on(event, (payload) => { off(); resolve(payload); });
  });
}

const shipped = await bus.once('order.shipped'); // { orderId; carrier; trackingNumber }
```

هذا هو عائد وضع الأنواع في خريطة واحدة وتمرير `K` عبرها: كل method تضيفها تُفحص مقابل مصدر الحقيقة نفسه، ولا تكرّر أيٌّ منها نوع حمولة.

:::mistake تحديد نوع معامل الحدث بـ keyof Events مباشرة
`on(event: keyof Events, handler: (payload: Events[keyof Events]) => void)` تبدو شبه متطابقة وتمرّ في الترجمة. لكن دون معامل نوع، تكون حمولة الـ handler هي الـ union من *كل* الحمولات، فيكون `e.trackingNumber` خطأً في `order.shipped`، ولن تكون `e.reason` "مسموحة" إلا بعد تضييق قيمة لا مميِّز لها. معامل النوع هو ما يربط الاسم المحدّد بحمولته المحدّدة.
:::

## بنّاؤون يكبر نوعهم

الـ builder (الباني) يسلسل استدعاءات methods لتجميع شيء خطوة بخطوة. والحيلة على مستوى الأنواع هي حمل ما بُني حتى الآن في معامل نوع، وإعادة نوع جديد أوسع من كل استدعاء. إليك builder استعلامات صغيرًا لسجل الطلبات في Cartwheel:

```ts
type Order = { id: number; status: OrderStatus; totalCents: number; customer: string };

class OrderQuery<Selected extends keyof Order = never> {
  readonly #fields: readonly (keyof Order)[];

  constructor(fields: readonly (keyof Order)[] = []) {
    this.#fields = fields;
  }

  select<K extends keyof Order>(...fields: K[]): OrderQuery<Selected | K> {
    return new OrderQuery<Selected | K>([...this.#fields, ...fields]);
  }

  run(rows: Order[]): Pick<Order, Selected>[] {
    // #fields holds exactly the keys in Selected.
    return rows.map((row) => Object.fromEntries(this.#fields.map((f) => [f, row[f]])) as Pick<Order, Selected>);
  }
}

const rows = new OrderQuery().select('id').select('totalCents').run(allOrders);
rows[0].totalCents; // number
rows[0].customer;   // Error: Property 'customer' does not exist on type 'Pick<Order, "id" | "totalCents">'.
```

يبدأ `Selected` بـ `never` (لا شيء مختار) وكل `select` تُعيد `OrderQuery<Selected | K>`. لا تستطيع الـ method تغيير نوع الكائن الذي تُستدعى عليه، فتُعيد كل خطوة نسخة جديدة. وهذا أيضًا تصميم جيد وقت التشغيل: البنّاؤون الذين لا يعدّلون أبدًا يمكن مشاركتهم وإعادة استخدامهم بأمان. وهي التقنية نفسها التي يستخدمها بنّاؤو الاستعلامات مثل Kysely وDrizzle على نطاق أكبر بكثير.

:::tip أبقِ أنواع الـ builder سطحية
كل خطوة في الـ builder تضيف إلى نوع يجب على المحرّر عرضه وعلى الـ compiler فحصه. الـ builder الذي فيه عشرة معاملات نوع وconditional types على كل method ينتج رسائل خطأ لا يستطيع أحد قراءتها. تتبّع الحقيقة أو الحقيقتين اللتين يحتاجهما المستدعون فعلًا، مثل الحقول المختارة، وأبقِ كل ما عدا ذلك بسيطًا.
:::

في التمرين ستبني ناقل الأحداث محدَّد الأنواع في Cartwheel وbuilder اختيار صغيرًا. وبه يكتمل قسم الأنماط؛ والقسم 5 ينتقل إلى إيصال كل هذا إلى الإنتاج، بدءًا بخيارات الـ compiler التي تجعل هذه الأنواع جديرة بالثقة.
