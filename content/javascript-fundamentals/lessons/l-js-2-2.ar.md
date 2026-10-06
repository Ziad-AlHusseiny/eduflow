---
summary: تكرّر العمل باستخدام for…of وحلقة for العدّادة وwhile، وتتوقّف مبكرًا بـ break وcontinue، وتستخدم نمط المُراكِم (accumulator) لحساب مجموع قائمة مصاريف.
takeaways:
  - '`for...of` تمرّ على كل عنصر في القائمة بالترتيب، وهي حلقة التكرار الافتراضية لـ "افعل هذا لكل مصروف".'
  - 'حلقة `for` العدّادة تعطيك فهرسًا، وتحتاجه حين يهمّ الموضع؛ والفهارس الصالحة تمتد من 0 إلى `length - 1`.'
  - '`while` تكرّر ما دام الشرط صحيحًا، لذلك يجب أن يجعله شيء داخل الحلقة خاطئًا في النهاية.'
  - نمط المُراكِم (ابدأ من 0، وأضف داخل الحلقة، واستخدم الناتج بعدها) يحوّل قائمة إلى مجموع واحد.
further:
  - title: Loops and iteration (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration
  - title: for...of (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
quiz:
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      const amounts = [400, 900, 250];
      let total = 0;
      for (const a of amounts) {
        total = a;
      }
      console.log(total);
      ```
    options:
      - text: '`1550`'
        why: 'هذا يتطلّب `total += a`. أما `=` وحدها فتستبدل المجموع بكل مبلغ بدلًا من أن تضيفه إليه.'
      - text: '`250`'
        why: 'صحيح. كل دورة تكتب فوق `total`، فينتهي حاملًا المبلغ الأخير.'
      - text: '`400`'
        why: 'تستمر الحلقة بعد العنصر الأول، وكل دورة تعيد إسناد `total`.'
      - text: '`0`'
        why: 'يُعاد إسناد `total` داخل الحلقة، فلا يبقى حاملًا قيمته الابتدائية.'
    answer: 1
  - q: '`const days = ["Mon", "Tue", "Wed"];` أيّ حلقة لا ترمي أي خطأ لكنها تطبع `undefined` مرة واحدة في النهاية؟'
    options:
      - text: '`for (let i = 0; i < days.length; i++) console.log(days[i]);`'
        why: هذه هي الحلقة العدّادة الصحيحة. إنها تتوقّف بعد الفهرس 2، وهو آخر فهرس صالح.
      - text: '`for (const d of days) console.log(d);`'
        why: '`for...of` تمرّ على العناصر الموجودة فعلًا فقط، فلا يمكنها تجاوز النهاية.'
      - text: '`for (let i = 0; i <= days.length; i++) console.log(days[i]);`'
        why: 'صحيح. `<=` تسمح لـ `i` بأن تبلغ 3، و`days[3]` غير موجود، فيُطبع `undefined`. وخطأ "الفارق بواحد" هذا شائع جدًا.'
    answer: 2
  - q: متى تكون `while` أنسب من `for...of`؟
    options:
      - text: حين لا تعرف مسبقًا كم مرة ستحتاج إلى التكرار، بل تعرف فقط متى تتوقّف.
        why: صحيح. مثلًا، "استمر في طرح الإنفاق اليومي حتى ينفد الرصيد" لا توجد فيه قائمة تمرّ عليها.
      - text: حين تريد المرور على كل عنصر في قائمة.
        why: 'هذه بالضبط مهمة `for...of`، التي لا يمكنها تجاوز النهاية ولا نسيان التقدّم.'
      - text: حين يكون جسم الحلقة أكثر من سطر واحد.
        why: يمكن لأي حلقة أن يكون جسمها بأي طول. والاختيار يعتمد على ما يتحكّم في التكرار.
    answer: 0
  - q: 'داخل حلقة تمرّ على المصاريف، ماذا تفعل `continue`؟'
    options:
      - text: تُنهي الحلقة كلها فورًا.
        why: 'هذه `break`. أما `continue` فتتخطّى باقي الدورة الحالية فقط.'
      - text: تتخطّى باقي الدورة الحالية وتنتقل إلى العنصر التالي.
        why: 'صحيح. إنها مفيدة لتجاهل العناصر غير المعنية، مثل المبالغ المستردّة، دون أن تضع باقي الجسم داخل `if`.'
      - text: تعيد تشغيل الحلقة من العنصر الأول.
        why: 'الحلقات لا ترجع إلى الوراء من تلقاء نفسها. `continue` تتقدّم إلى العنصر التالي.'
    answer: 1
---

حتى الآن، كل مثال في Pocket جمع عددًا ثابتًا من المصاريف: `coffee + lunch + bus`. لكن الإنفاق الحقيقي قائمة تكبر كل يوم، ولا يمكنك كتابة `+` لعناصر لم تصلك بعد. تحتاج إلى طريقة تقول بها "افعل هذا لكل واحد منها"، وهذه هي **حلقة التكرار** (loop).

## قائمة نمرّ عليها

للقوائم درس كامل في القسم 3، لكنك تحتاج أساسياتها الآن. قائمة القيم بين أقواس مربّعة اسمها **مصفوفة** (array):

```js run
const amounts = [450, 1220, 270, 899];
console.log(amounts.length);  // how many items
console.log(amounts[0]);      // the first item: positions start at 0
```

## for...of: افعل هذا لكل عنصر

تنفّذ `for...of` كتلتها مرة لكل عنصر، مع اسم تختاره أنت يشير إلى العنصر الحالي:

```js run
const amounts = [450, 1220, 270, 899];

let total = 0;
for (const amount of amounts) {
  total += amount;
}
console.log(total);
```

تتبّعها خطوة بخطوة كما يفعل المحرّك. يبدأ `total` من 0. الدورة الأولى: `amount` تساوي 450، فيصبح `total` يساوي 450. الدورة الثانية: `amount` تساوي 1220، فيصبح `total` يساوي 1670. ثم 1940، ثم 2839. لم يتبقَّ أي عنصر، فتنتهي الحلقة ويطبع السطر التالي المجموع.

يُسمّى هذا الشكل **نمط المُراكِم** (accumulator pattern): صرّح بنتيجة قبل الحلقة، وحدّثها داخلها، واستخدمها بعدها. وهو وراء المجاميع والأعداد والقيم القصوى ومعظم الملخّصات التي ستكتبها. واستخدام `const amount` سليم مع أنها تتغيّر في كل دورة: فكل دورة تُنشئ `amount` جديدة، ولا يُعاد إسنادها أبدًا.

وتعمل `for...of` أيضًا مع النصوص، حرفًا حرفًا: `for (const ch of "Pocket")`.

## حلقة for العدّادة

أحيانًا تحتاج إلى **الموضع** إلى جانب العنصر، مثلًا لتطبع "1. Coffee". لحلقة `for` الكلاسيكية ثلاثة أجزاء بين قوسيها:

```js run
const labels = ["Coffee", "Lunch", "Bus"];

for (let i = 0; i < labels.length; i++) {
  console.log(`${i + 1}. ${labels[i]}`);
}
```

:::figure أجزاء حلقة for الثلاثة وترتيب تنفيذها
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">تنفّذ حلقة for جزء البداية مرة واحدة، ثم تكرّر: فحص الشرط، ثم تنفيذ الجسم، ثم تنفيذ التحديث، حتى يصبح الشرط خاطئًا فتخرج من الحلقة.</title>
  <rect class="d-box-primary" x="20" y="90" width="140" height="50" rx="10"/>
  <text class="d-code" x="90" y="120" text-anchor="middle">let i = 0</text>
  <rect class="d-box-accent" x="220" y="90" width="190" height="50" rx="10"/>
  <text class="d-code" x="315" y="120" text-anchor="middle">i &lt; labels.length?</text>
  <rect class="d-box" x="470" y="20" width="170" height="50" rx="10"/>
  <text class="d-label" x="555" y="50" text-anchor="middle">نفّذ الجسم</text>
  <rect class="d-box" x="470" y="160" width="170" height="50" rx="10"/>
  <text class="d-code" x="555" y="190" text-anchor="middle">i++</text>
  <rect class="d-box-success" x="220" y="175" width="120" height="40" rx="10"/>
  <text class="d-label" x="280" y="200" text-anchor="middle">خروج</text>
  <path class="d-arrow" d="M160 115 L216 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 95 L466 55" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="425" y="62" text-anchor="middle">true</text>
  <path class="d-arrow" d="M555 70 L555 156" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M470 180 L414 135" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M280 140 L280 171" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="312" y="162" text-anchor="middle">false</text>
  <text class="d-label-muted" x="90" y="160" text-anchor="middle">مرة واحدة</text>
</svg>
:::

جزء البداية، `let i = 0`، يُنفَّذ مرة واحدة. ثم قبل كل دورة يُفحص الشرط `i < labels.length`؛ فإن كان صحيحًا نُفّذ الجسم، ثم يضيف التحديث `i++` واحدًا إلى `i`. وحين يصبح الشرط خاطئًا تنتهي الحلقة. مع ثلاث تسميات، تأخذ `i` القيم 0 و1 و2، وهي الفهارس الصالحة بالضبط.

:::mistake الفارق بواحد (off by one)
`i <= labels.length` تُنفّذ دورة إضافية تكون فيها `i` تساوي 3، و`labels[3]` تساوي `undefined`. الفهارس الصالحة تمتد من 0 إلى `length - 1`، لذلك يكون الشرط `i < length`. وحين لا تحتاج إلى الفهرس، استخدم `for...of` فلا يمكن أن يقع هذا الخطأ.
:::

## while: كرّر حتى يتغيّر شيء ما

حلقة `while` ليس فيها إلا شرط. إنها للحالات التي تعرف فيها متى تتوقّف، لكن لا تعرف كم دورة سيستغرق ذلك. كم يومًا تستطيع أن تشتري قهوة بـ 4.50 دولار بميزانية قدرها 20 دولارًا؟

```js run
let balance = 2000;
const coffee = 450;
let days = 0;

while (balance >= coffee) {
  balance -= coffee;
  days++;
}
console.log(`${days} coffees, ${balance} cents left`);
```

كل دورة تُنقص `balance`، فيصبح الشرط خاطئًا في النهاية. ولو لم يكن في الجسم ما يقترب من المخرج، كأن تنسى `balance -= coffee`، لبقي الشرط صحيحًا إلى الأبد. وهذه **حلقة لا نهائية** (infinite loop): تتجمّد الصفحة، ويعرض عليك المتصفّح في النهاية إيقاف السكربت. وحين يتجمّد تبويب أثناء تدرّبك، ابحث عن حلقة لا يتغيّر شرطها أبدًا.

## break وcontinue

كلمتان مفتاحيتان تغيّران مسار الحلقة من داخلها:

- `break` تُنهي الحلقة فورًا.
- `continue` تتخطّى باقي هذه الدورة وتنتقل إلى التالية.

```js run
const amounts = [450, -300, 1220, 270, 899];
const budget = 2000;
let running = 0;

for (const amount of amounts) {
  if (amount < 0) {
    continue; // a refund: not spending, skip it
  }
  running += amount;
  if (running > budget) {
    console.log(`Budget passed at an expense of ${amount}`);
    break; // no need to look further
  }
}
console.log(running);
```

تتبّعها: يُضاف 450، ثم يُتخطّى -300، ثم يرفع 1220 المجموع إلى 1670، ثم يرفعه 270 إلى 1940، ثم يدفعه 899 إلى 2839، وهذا يتجاوز الميزانية، فتُطبع الرسالة وتتوقّف الحلقة.

## أن ترى ما تفعله الحلقة

الحلقات هي المكان الذي يفقد فيه المبتدئون أثر ما يفعله البرنامج أكثر من أي مكان آخر، لأن الأسطر نفسها تُنفَّذ مرات كثيرة بقيم مختلفة. والعلاج أن تجعل الحلقة تُريك. ضع `console.log` في أول الجسم يطبع كل متغيّر له علاقة:

```js run
const amounts = [450, 1220, 270];
let total = 0;
for (let i = 0; i < amounts.length; i++) {
  console.log({ i, amount: amounts[i], totalBefore: total });
  total += amounts[i];
}
console.log("final", total);
```

كل دورة تطبع سطرًا واحدًا، فتستطيع أن تقارن ما حدث فعلًا بما توقّعته، وتجد أول دورة يختلفان فيها. تلك الدورة هي مكان الخطأ. ووضع القيم داخل `{ }` يطبعها مع أسمائها، فلا تحتاج إلى تخمين أيّ رقم هو أيّ متغيّر. المطوّرون المحترفون يفعلون هذا بالضبط كل يوم؛ وفي القسم 5 ستتعلّم فعله أيضًا باستخدام مصحّح الأخطاء (debugger) في DevTools.

:::tip اختر الحلقة بحسب ما يتحكّم فيها
المرور على قائمة: `for...of`. تحتاج الموضع أيضًا: `for` العدّادة. التوقّف يعتمد على شرط متغيّر لا على قائمة: `while`. في القسم 3 ستتعرّف إلى دوال المصفوفات مثل `map` و`filter`، التي تحلّ محلّ كثير من الحلقات المكتوبة يدويًا، لكنها مبنية على هذه الأفكار نفسها بالضبط.
:::

الحلقات والشروط معًا تتيح لك كتابة منطق حقيقي من الآن. ولكي تعيد استخدام هذا المنطق بدلًا من نسخه، تحتاج إلى دوالّك الخاصة، وهذا موضوع الدرس التالي.
