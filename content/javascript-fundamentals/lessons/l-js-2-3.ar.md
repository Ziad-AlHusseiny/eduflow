---
summary: تكتب دوالّك الخاصة بأسلوب التصريح وبأسلوب الدوال السهمية، وتمرّر الوسائط إليها وتستخرج النتائج منها بـ return، وتمنح المعاملات قيمًا افتراضية، وتمرّر الدوال إلى دوال أخرى.
takeaways:
  - الدالة تحزم خطوات تحت اسم واحد؛ والمعاملات (parameters) هي المدخلات التي تعلنها الدالة، أما الوسائط (arguments) فهي القيم التي تمرّرها حين تستدعيها.
  - '`return` تُنهي الدالة وتُعيد قيمة؛ والدالة التي لا تحتوي على `return` تُعيد `undefined`.'
  - 'الدوال السهمية (`(x) => x * 2`) صياغة أقصر؛ ومع الأقواس المعقوفة تحتاج إلى `return` صريحة.'
  - 'المعاملات الافتراضية (`symbol = "$"`) تُطبَّق حين يكون الوسيط مفقودًا أو `undefined`.'
  - الدوال قيم، لذلك يمكنك تخزينها في متغيّرات وتمريرها إلى دوال أخرى.
further:
  - title: Functions (MDN guide)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
  - title: Arrow function expressions (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  - title: Default parameters (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
quiz:
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      const double = (n) => {
        n * 2;
      };
      console.log(double(4));
      ```
    options:
      - text: '`undefined`'
        why: 'صحيح. الجسم المحاط بأقواس معقوفة دون `return` يُعيد `undefined`. اكتب `(n) => n * 2` أو أضف `return n * 2;`.'
      - text: '`8`'
        why: 'الجسم يحسب 8 ثم يرميه. مع الأقواس المعقوفة، تحتاج الدالة السهمية إلى `return` صريحة.'
      - text: '`n * 2`'
        why: تحسب JavaScript التعبيرات؛ ولا تُعيد أبدًا نصّها المكتوب.
    answer: 0
  - q: 'الدالة `function formatMoney(cents, symbol = "$") { … }` استُدعيت هكذا: `formatMoney(450, undefined)`. ما قيمة `symbol` داخلها؟'
    options:
      - text: '`undefined`، لأنك مرّرتها صراحةً.'
        why: 'القيم الافتراضية تُطبَّق على الوسائط المفقودة وعلى الوسائط التي قيمتها `undefined`، سواء مُرّرت أم لا.'
      - text: '`"$"`'
        why: 'صحيح. تمرير `undefined` يُعامَل تمامًا مثل حذف الوسيط، فتُطبَّق القيمة الافتراضية.'
      - text: '`null`'
        why: 'لا شيء هنا يُنتج `null`. ثم إن تمرير `null` لا يُفعّل القيمة الافتراضية؛ وحدها `undefined` تفعل ذلك.'
    answer: 1
  - q: 'أيّ سطر يستدعي `isBig` قبل تعريفها دون أن يحدث خطأ؟'
    options:
      - text: '`console.log(isBig(100)); const isBig = (c) => c > 50;`'
        why: 'أسماء `const` لا يمكن استخدامها قبل أن يُنفَّذ سطرها، لذلك يرمي هذا خطأ ReferenceError.'
      - text: '`console.log(isBig(100)); let isBig = function (c) { return c > 50; };`'
        why: 'قيمة الدالة مخزّنة في `let`، وهي غير متاحة قبل سطر التصريح بها.'
      - text: '`console.log(isBig(100)); function isBig(c) { return c > 50; }`'
        why: صحيح. تصريحات الدوال "تُرفع" (hoisted)، أي أن الدالة كاملة تكون متاحة من أعلى نطاقها.
    answer: 2
  - q: 'لديك `const amounts = [450, 1220];` و`function toDollars(c) { return c / 100; }`. ماذا يحتاج منك `amounts.map(toDollars)`؟'
    options:
      - text: لا شيء إضافي. `map` تستدعي `toDollars` لكل عنصر وتجمع النتائج.
        why: 'صحيح. أنت تمرّر الدالة نفسها، دون أقواس، و`map` تقرّر متى تستدعيها.'
      - text: '`amounts.map(toDollars())` مع الأقواس، كي تُنفَّذ الدالة.'
        why: 'هذا يستدعي `toDollars` مرة واحدة فورًا دون أي وسيط، ويمرّر ناتجها، `NaN`، إلى `map`، التي ترمي خطأ حينها.'
      - text: حلقة تكرار حولها، لأن `map` لا تعمل إلا مع قيمة واحدة.
        why: '`map` تمرّ على المصفوفة كلها بنفسها. وهذا هو الهدف من تمرير دالة إليها.'
    answer: 0
---

في الدرسين السابقين أكملت أجسام دوال كُتبت لك. والآن تكتب دوالّك بنفسك. **الدالة** (function) قطعة من البرنامج لها اسم ويمكن إعادة استخدامها: تكتب الخطوات مرة واحدة وتنفّذها متى احتجت، بمدخلات مختلفة. يُنسّق Pocket المبالغ المالية في أماكن كثيرة؛ ودون الدوال ستنسخ `(cents / 100).toFixed(2)` في كل منها، ثم تُصلح كل نسخة حين يتغيّر التنسيق.

## التصريح بدالة واستدعاؤها

```js run
function formatMoney(cents) {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

console.log(formatMoney(1220));
console.log(formatMoney(450));
```

الأسطر الخمسة الأولى **تصريح دالة** (function declaration). إنها لا تنفّذ شيئًا؛ بل تُنشئ دالة اسمها `formatMoney` وتحفظ خطواتها. و`cents` **معامل** (parameter)، أي اسم لمُدخل ليست له قيمة بعد.

أما `formatMoney(1220)` فهو **استدعاء** (call). والقيمة بين القوسين، `1220`، **وسيط** (argument). حين يصل المحرّك إلى الاستدعاء، يوقف السطر الحالي مؤقتًا، ويقفز إلى داخل الدالة و`cents` تشير إلى 1220، فينفّذ الجسم، ثم يعود حين يصل إلى `return`. بعدها يُستبدل تعبير الاستدعاء بالقيمة المُعادة، `"$12.20"`، فتطبعها `console.log`.

:::figure الاستدعاء يُرسل الوسائط إلى الداخل ويستعيد القيمة المُعادة
<svg viewBox="0 0 660 220" role="img" aria-labelledby="t1">
  <title id="t1">الاستدعاء formatMoney(1220) يمرّر 1220 إلى المعامل cents. يُنفَّذ جسم الدالة ويُعيد النص $12.20، الذي يحلّ محلّ الاستدعاء في السطر الأصلي.</title>
  <rect class="d-box" x="20" y="30" width="250" height="50" rx="10"/>
  <text class="d-code" x="145" y="60" text-anchor="middle">formatMoney(1220)</text>
  <rect class="d-box-primary" x="380" y="20" width="260" height="170" rx="12"/>
  <text class="d-label-strong" x="510" y="46" text-anchor="middle">function formatMoney</text>
  <text class="d-code" x="510" y="82" text-anchor="middle">cents = 1220</text>
  <text class="d-code" x="510" y="114" text-anchor="middle">dollars = "12.20"</text>
  <text class="d-code" x="510" y="150" text-anchor="middle">return "$12.20"</text>
  <path class="d-arrow" d="M270 50 L376 70" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="322" y="46" text-anchor="middle">الوسيط</text>
  <path class="d-arrow" d="M376 150 L200 150 L160 84" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="270" y="172" text-anchor="middle">القيمة المُعادة</text>
</svg>
:::

يمكن أن يكون للدالة عدّة معاملات تفصل بينها فواصل، وتُطابَق الوسائط معها حسب الموضع: الوسيط الأول يذهب إلى المعامل الأول، وهكذا.

لـ `return` وظيفتان: تحدّد النتيجة، وتُنهي الدالة في مكانها. أي سطر بعد `return` في الكتلة نفسها لا يُنفَّذ أبدًا. وإذا انتهت الدالة دون أن تصل إلى `return`، فإن قيمة الاستدعاء تكون `undefined`.

:::mistake الطباعة بدلًا من الإرجاع
```js
function toCents(dollars) {
  console.log(Math.round(dollars * 100)); // shows the answer...
}
const total = toCents(4.1) + toCents(12.2); // ...but returns undefined: NaN
```
`console.log` تعرض القيمة فقط؛ ولا تُعيد شيئًا إلى من استدعى الدالة. الدالة التي تحسب شيئًا يجب أن تُرجعه بـ `return`، والمُستدعي هو الذي يقرّر إن كان سيطبعه.
:::

## المعاملات الافتراضية

إذا استدعيت دالة بوسائط أقل من معاملاتها، تكون المعاملات الناقصة `undefined`. و**المعامل الافتراضي** (default parameter) يمنحها قيمة معقولة بدلًا من ذلك:

```js run
function formatMoney(cents, symbol = "$") {
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

console.log(formatMoney(1220));
console.log(formatMoney(1220, "€"));
```

تُستخدم القيمة الافتراضية حين يكون الوسيط مفقودًا أو `undefined`، وحينها فقط. أما تمرير `0` أو `""` أو `null` فيُعدّ وسيطًا حقيقيًا.

## الدوال السهمية

هناك طريقة ثانية أقصر لكتابة الدوال، هي **الدالة السهمية** (arrow function). إنها قيمة، لذلك تخزّنها في `const`:

```js run
const toCents = (dollars) => Math.round(dollars * 100);
const isBig = (cents) => cents >= 10000;

console.log(toCents(12.2), isBig(toCents(120)));
```

حين يكون الجسم تعبيرًا واحدًا، كما هنا، تحذف الأقواس المعقوفة و`return`: فقيمة التعبير تُعاد تلقائيًا. وحين تحتاج إلى عدّة تعليمات، استخدم الأقواس المعقوفة، وعندها تصبح `return` مطلوبة من جديد:

```js run
const budgetLeft = (budget, spent) => {
  const left = budget - spent;
  return left > 0 ? left : 0;
};
console.log(budgetLeft(2000, 2200));
```

أيّ الأسلوبين تستخدم؟ كلاهما منتشر في الكود الحقيقي. والاختيار الافتراضي الشائع، الذي تتبعه هذه الدورة: **التصريح للدوال المسمّاة في المستوى الأعلى، والدوال السهمية للدوال القصيرة التي تُمرَّر إلى دوال أخرى**. وهناك فرق عملي واحد: تصريحات الدوال **تُرفع** (hoisting)، أي يمكنك استدعاؤها في سطر يسبق مكان كتابتها. أما الدالة السهمية المخزّنة في `const` فلا توجد إلا بعد أن يُنفَّذ سطرها.

## الدوال قيم

الدالة في JavaScript قيمة مثل الرقم أو النص. يمكنك تخزينها، ويمكنك تمريرها إلى دالة أخرى بصفتها وسيطًا. وهذه الفكرة وراء جزء كبير من JavaScript الحديثة:

```js run
function applyToAll(amounts, transform) {
  const results = [];
  for (const amount of amounts) {
    results.push(transform(amount));
  }
  return results;
}

const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;
console.log(applyToAll([450, 1220], formatMoney));
console.log(applyToAll([450, 1220], (c) => c * 2));
```

`applyToAll` لا تعرف ما تفعله `transform` ولا يهمّها ذلك؛ إنها تستدعيها مرة لكل عنصر وتجمع النتائج باستخدام `push`، التي تضيف عنصرًا إلى نهاية المصفوفة. والدالة التي تُمرَّر بهذه الطريقة تُسمّى **callback** (دالة استدعاء راجع). لاحظ أنك تمرّر `formatMoney` دون أقواس: فأنت تسلّم الدالة نفسها، لا تستدعيها. وللمصفوفات أداة مدمجة تفعل هذا بالضبط، اسمها `map`، وسيضعها القسم 3 موضع العمل.

## دوال صغيرة ونقية

لاحظ ما تشترك فيه كل الدوال المساعدة في هذا الدرس: إنها لا تستخدم إلا معاملاتها، وتُرجع نتيجة، ولا تغيّر شيئًا خارجها. الدالة من هذا النوع تُسمّى **نقية** (pure). أعطها الوسائط نفسها تُعِد الإجابة نفسها في كل مرة، فتستطيع اختبارها بسطر واحد، وإعادة استخدامها في أي مكان، والثقة بها دون أن تقرأ جسمها مجددًا.

ليست كل دالة قادرة على أن تكون نقية. لا بدّ لشيء ما في النهاية أن يطبع على الشاشة أو يحفظ البيانات. والعادة التي تُبقي البرامج تحت السيطرة هي أن تُجري الحسابات في دوال صغيرة نقية، وأن تُبقي الطباعة والحفظ في أماكن قليلة ذات أسماء واضحة. ويتبع Pocket هذا الفصل حتى التطبيق النهائي.

:::tip سمِّ الدوال بحسب ما تُرجعه
`formatMoney` و`toCents` و`isBig` و`budgetLeft`: فعلٌ للدوال التي تفعل أو تحسب شيئًا، و`is`/`has` للدوال التي تُرجع قيمة منطقية. الأسماء الجيدة تجعلك تقرأ `if (isBig(amount))` كأنها جملة.
:::

الدوال تُنشئ داخلها عالمًا صغيرًا من الأسماء خاصًا بها. وعلاقة هذا العالم بالكود المحيط به تُسمّى النطاق (scope)، وهي موضوع الدرس التالي.
