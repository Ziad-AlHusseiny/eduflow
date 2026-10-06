---
summary: حرّر الموارد بموثوقية باستخدام تصريحات using وSymbol.dispose، واكتب decorators قياسية محدَّدة الأنواع للسلوك العابر للأجزاء مثل التسجيل وإعادة المحاولة.
takeaways:
  - تصريح `using` يستدعي `[Symbol.dispose]()` على القيمة حين تنتهي الكتلة المحيطة، سواء عادت بشكل طبيعي أو رمت خطأً.
  - تصريحات `using` المتعددة في كتلة واحدة تُحرَّر بترتيب معكوس، مثل كتل `try`/`finally` المتداخلة.
  - "`await using` و`Symbol.asyncDispose` يفعلان الشيء نفسه للتنظيف الذي يُعيد promise."
  - الـ decorators القياسية (منذ TypeScript 5.0) دوال بالشكل `(value, context)` يمكنها إعادة بديل؛ وهي ليست نفسها `experimentalDecorators` الأقدم.
  - حدّد نوع method decorator بـ `ClassMethodDecoratorContext` ومعاملات generic هي `This` و`Args` و`Return` كي يعمل على أي method دون `any`.
further:
  - title: using declarations (TypeScript 5.2 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html
  - title: Decorators (TypeScript 5.0 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html
  - title: using (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using
quiz:
  - q: |
      ماذا يطبع هذا؟
      ```ts
      function checkout() {
        using a = reserve('TENT-2P');   // logs "reserve TENT-2P", disposes with "release TENT-2P"
        using b = reserve('MUG-SET');   // logs "reserve MUG-SET", disposes with "release MUG-SET"
        throw new Error('card declined');
      }
      try { checkout(); } catch {}
      ```
    options:
      - text: reserve TENT-2P, reserve MUG-SET, release MUG-SET, release TENT-2P
        why: صحيح. الرمي يُخرج من الكتلة، فيُحرَّر المورِدان كلاهما، ويجري التحرير بعكس ترتيب التصريح.
      - text: reserve TENT-2P, reserve MUG-SET, release TENT-2P, release MUG-SET
        why: التحرير يتبع "الداخل أخيرًا يخرج أولًا"، مثل كتل `finally` المتداخلة، فيُحرَّر `b` قبل `a`.
      - text: reserve TENT-2P, reserve MUG-SET (لا شيء يُحرَّر لأن الدالة رمت خطأً)
        why: التحرير عند كل مسار خروج، بما فيه الرمي، هو الغاية كلها من `using`.
      - text: لا شيء؛ لا يمكن الجمع بين `using` و`throw` في الكتلة نفسها.
        why: لا يوجد قيد كهذا؛ الرمي أحد مسارات الخروج التي صُمّمت `using` لأجلها.
    answer: 0
  - q: أيّ قيمة يمكن ربطها بـ `using`؟
    options:
      - text: أي كائن فيه method باسم `close()`.
        why: "`using` لا تبحث عن `close()`؛ بل تستدعي الـ method المخزّنة تحت `Symbol.dispose`."
      - text: كائن فيه method باسم `[Symbol.dispose]()`، أو `null`/`undefined`.
        why: صحيح. يجب أن تكون القيمة قابلة للتحرير؛ و`null` و`undefined` مسموحتان وتُتخطّيان ببساطة.
      - text: نُسخ `DisposableStack` فقط.
        why: "`DisposableStack` أداة مساعدة لجمع القيم القابلة للتحرير، لا شرط."
    answer: 1
  - q: كيف يتلقّى method decorator القياسي الـ method التي يزخرفها؟
    options:
      - text: بالشكل `(target, propertyKey, descriptor)`، ويعدّل الـ descriptor.
        why: هذا توقيع `experimentalDecorators` القديم. الـ decorators القياسية تتلقّى `(value, context)`.
      - text: كاسم نصي، ويبحث عن الـ method على `this`.
        why: الـ method نفسها تُمرَّر كوسيط أول؛ والاسم متاح في `context.name`.
      - text: بالشكل `(value, context)`، حيث `value` هي الـ method ويمكن للـ decorator أن يُعيد دالة بديلة.
        why: صحيح. إعادة دالة جديدة تستبدل الـ method، وهكذا تعمل decorators التسجيل وإعادة المحاولة.
    answer: 2
  - q: تستخدم قاعدة الكود عندك parameter decorators على طريقة NestJS مثل `constructor(@Inject(TOKEN) svc)`. ماذا يعني ذلك لـ tsconfig الخاص بك؟
    options:
      - text: لا شيء؛ الـ decorators القياسية تدعم المعاملات.
        why: الـ decorators القياسية لا تدعم parameter decorators، فتُرفض هذه الصياغة دون الخيار القديم.
      - text: "الـ parameter decorators تحتاج `\"experimentalDecorators\": true`، الذي يحوّل المشروع كله إلى دلالات الـ decorators القديمة."
        why: صحيح. لا يمكن خلط النظامين في ترجمة واحدة؛ والأطر المبنية على النموذج القديم تحتاج هذا الخيار.
      - text: "يجب ضبط `\"target\": \"esnext\"` كي تتعامل بيئة التشغيل معها."
        why: الـ target لا يغيّر نظام الـ decorators الذي يستخدمه TypeScript؛ الخيار هو من يغيّره.
      - text: يجب تفعيل `emitDecoratorMetadata` وحده.
        why: هذا الخيار لا يعمل إلا مع `experimentalDecorators`؛ ووحده لا يفعل شيئًا للـ parameter decorators.
    answer: 1
---

يحجز نظام الدفع في Cartwheel المخزون قبل الخصم من البطاقة، ثم يحرّر الحجز إن فشل أي شيء. النسخة الأولى من ذلك الكود بدت هكذا:

```ts
function placeOrder(skus: string[]) {
  const reservations = skus.map((sku) => reserve(sku));
  chargeCard(); // throws on a declined card
  reservations.forEach((r) => r.release());
}
```

البطاقة المرفوضة تتخطّى السطر الأخير، فيبقى المخزون مقفلًا حتى تلاحظه مهمة ليلية. الإصلاح التقليدي هو `try`/`finally`، متداخلة مرة لكل مورد. هذا الدرس يغطّي جواب اللغة المدمج، ثم ميزة حديثة ثانية تُبقي الكود العابر للأجزاء مثل إعادة المحاولة خارج منطق العمل: الـ decorators القياسية.

## using: تنظيف مربوط بالنطاق

تصريح `using` مثل `const`، مع إضافة واحدة: حين تنتهي الكتلة التي يعيش فيها، بـ `return` أو بالوصول إلى نهايتها أو بـ `throw`، تستدعي JavaScript الـ method المسمّاة `[Symbol.dispose]()` على القيمة.

```ts
function reserve(sku: string): Disposable {
  log(`reserve ${sku}`);
  return { [Symbol.dispose]: () => log(`release ${sku}`) };
}

function placeOrder() {
  using tent = reserve('TENT-2P');
  using mug = reserve('MUG-SET');
  chargeCard(); // even if this throws…
}               // …both are released here: MUG-SET first, then TENT-2P
```

تصريحات `using` المتعددة تُحرَّر بترتيب معكوس، تمامًا مثل كتل `finally` المتداخلة، فيُحرَّر المورد دائمًا قبل الموارد التي أُنشئ بعدها. وإن رمى التحرير نفسه خطأً بينما خطأ آخر قيد الانتشار، يُحفظ الاثنان في `SuppressedError` بدل أن يحلّ أحدهما محلّ الآخر بصمت.

للتنظيف غير المتزامن، مثل إغلاق معاملة قاعدة بيانات، استخدم `await using` مع كائن فيه `[Symbol.asyncDispose]()` تُعيد promise. وحين يكون عدد الموارد ديناميكيًا، اجمعها في `DisposableStack` (أو `AsyncDisposableStack`)، وهي نفسها قابلة للتحرير:

```ts
function placeOrder(skus: string[]) {
  using stack = new DisposableStack();
  for (const sku of skus) stack.use(reserve(sku));
  chargeCard();
} // every reservation released, in reverse order
```

وصلت `using` في TypeScript 5.2. وهي تعمل أصليًا في Node 24 وفي Chrome وEdge منذ الإصدار 134 وFirefox منذ 141، لكن Safari لا يدعمها بعد (حتى أواخر 2026)، فهي ليست Baseline. وللكود الذي يصل إلى المتصفّحات، دع TypeScript أو الـ bundler يحوّل الصياغة إلى صيغة أقدم، وتأكّد من وجود `Symbol.dispose` في بيئة التشغيل (يوفّره polyfill حيث يغيب). والأنواع موجودة في الـ lib المسمّاة `esnext.disposable` (المضمّنة في `"lib": ["esnext"]`). بيئة تجربة التمارين تستخدم الـ lib الخاصة بـ ES2022، فيعلن كود البداية هاتين القطعتين بنفسه، وهي معاينة لدمج التصريحات الذي ستتعلّمه في الدرس القادم.

### جعل الـ APIs الخاصة بك قابلة للتحرير

تؤتي `using` أكبر ثمارها حين تُعيد الـ APIs الخاصة بك قيمًا قابلة للتحرير. الـ emitter من [باعثات أحداث وبنّاؤون آمنون من حيث النوع](lesson:l-at-4-4) أعاد دالة `off`؛ وإعادة كائن فيه `[Symbol.dispose]` أيضًا تتيح للمستدعين حصر الاشتراك في كتلة:

```ts
function subscribe<K extends keyof CheckoutEvents>(event: K, handler: (p: CheckoutEvents[K]) => void): Disposable {
  const off = bus.on(event, handler);
  return { [Symbol.dispose]: off };
}

async function waitForShipment(orderId: number) {
  using _ = subscribe('order.shipped', (e) => { if (e.orderId === orderId) notify(e); });
  await pollUntilShipped(orderId);
} // listener removed here, however the function ends
```

المرشّحون الجيدون كل ما له "تراجع" مقابل: الأقفال والحجوزات، واشتراكات الأحداث، والمؤقّتات، والملفات المؤقتة، ومعاملات قواعد البيانات (مع `await using`). إن وجدت نفسك تكتب `try`/`finally` فقط لاستدعاء method تنظيف، فذلك المورد يريد `[Symbol.dispose]`.

:::mistake نسيان أن using تعمل لكل كتلة
`using` تحرّر عند نهاية *الكتلة*، لا الدالة. أعلن حجزًا داخل `if` أو جسم حلقة تكرار فيُحرَّر حين تنتهي تلك الكتلة، ربما قبل أن تخصم من البطاقة. ضع `using` في الكتلة التي يطابق عمرها عمر المورد.
:::

## الـ decorators القياسية

الـ decorator (المُزخرِف) دالة تُطبَّق بـ `@` على صنف أو عضو في صنف. نفّذ TypeScript 5.0 الـ decorators القياسية (TC39)، ويترجمها TypeScript إلى استدعاءات دوال عادية، فتعمل في أي بيئة تشغيل. يتلقّى method decorator الـ method الأصلية وكائن `context`، ويمكنه إعادة بديل:

```ts
function logged<This, Args extends unknown[], Return>(
  method: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log(`→ ${name}`, args);
    return method.call(this, ...args);
  };
}

class PaymentGateway {
  @logged
  charge(amountCents: number, currency: string) { /* … */ }
}
```

الـ generics تجعل الـ decorator يعمل على أي method دون `any`: تُستنتج `This` و`Args` و`Return` من الـ method التي يزخرفها، ويحتفظ البديل بالتوقيع نفسه. والـ decorators التي تأخذ خيارات هي **مصانع decorators (decorator factories)**، أي دوال تُعيد الـ decorator:

```ts
function retry(times: number) {
  return function <This, Args extends unknown[], Return>(
    method: (this: This, ...args: Args) => Return,
    _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    return function (this: This, ...args: Args): Return {
      for (let attempt = 1; ; attempt++) {
        try {
          return method.call(this, ...args);
        } catch (e) {
          if (attempt >= times) throw e;
        }
      }
    };
  };
}

class PaymentGateway {
  @retry(3)
  charge(amountCents: number, currency: string) { /* … */ }
}
```

الـ decorators المكدّسة تُطبَّق من الأسفل إلى الأعلى. مع `@logged` فوق `@retry(3)`، يُطبَّق غلاف إعادة المحاولة على `charge` أولًا ثم يغلّف `logged` النتيجة، فتحصل على سطر تسجيل واحد لكل استدعاء لا لكل محاولة. بدّلهما فتسجّل كل محاولة. لا أحد منهما خاطئ، لكن الترتيب سلوك، فاختره عن قصد.

ويقدّم `context` أيضًا `context.name` و`context.static` و`context.private` و`context.addInitializer(fn)`، التي تنفّذ كودًا حين تُنشأ نسخة (وهي الطريقة المعتادة لكتابة decorator مثل `@bound` يربط method بنسختها).

:::why الـ decorators القياسية مقابل القديمة
كثير من الأطر القائمة (Angular وNestJS وTypeORM) بُنيت على `experimentalDecorators` الأقدم في TypeScript، التي تستخدم توقيعًا مختلفًا `(target, key, descriptor)` وتدعم parameter decorators و`emitDecoratorMetadata`. لا يمكن خلط النظامين في ترجمة واحدة. إن تطلّب إطارٌ الخيار القديم فاتبعه؛ أما للكود الجديد دون إطار كهذا فاستخدم الـ decorators القياسية، واستخدمها باعتدال. الدالة العادية ذات الرتبة الأعلى، `const charge = withRetry(3, rawCharge)`، كثيرًا ما تكون أوضح ولا تحتاج إلى صنف.
:::

في التمرين ستحرّر حجوزات المخزون بـ `using` وتضيف `@retry` محدَّد النوع إلى بوابة الدفع في Cartwheel. الدرس القادم: وصف كود لم تكتبه، بملفات التصريحات.
