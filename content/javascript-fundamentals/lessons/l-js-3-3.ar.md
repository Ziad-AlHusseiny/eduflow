---
summary: تلخّص قائمة في قيمة واحدة باستخدام reduce، وتبني مجاميع لكل فئة، وترتّب الأرقام والنصوص والكائنات ترتيبًا صحيحًا بدالة مقارنة، دون الوقوع في فخّي الترتيب الافتراضي والتعديل في المكان.
takeaways:
  - '`reduce` تمرّ على القائمة حاملةً مُراكِمًا (accumulator)؛ والـ callback يُرجع المُراكِم التالي، والمُراكِم الأخير هو النتيجة.'
  - 'مرّر دائمًا قيمة ابتدائية إلى `reduce`، مثل `0` للمجاميع أو `{}` للتجميع؛ فدونها ترمي القائمة الفارغة خطأ.'
  - 'دون دالة مقارنة، تقارن `sort` العناصر على أنها نصوص، فتُرتَّب `[450, 1220, 99]` لتصبح `[1220, 450, 99]`.'
  - 'دالة المقارنة تُرجع رقمًا سالبًا لتضع `a` أولًا، وموجبًا لتضع `b` أولًا؛ و`(a, b) => a - b` ترتّب الأرقام تصاعديًا.'
  - '`sort` تعدّل المصفوفة في مكانها؛ استخدم `toSorted` (أو رتّب نسخة) حين يجب أن يبقى الأصل كما هو.'
further:
  - title: Array.prototype.reduce() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  - title: Array.prototype.sort() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  - title: Array.prototype.toSorted() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
quiz:
  - q: 'ماذا تُرجع `[450, 1220, 99].sort()`؟'
    options:
      - text: '`[99, 450, 1220]`'
        why: هذا يحتاج إلى دالة مقارنة رقمية. الترتيب الافتراضي يحوّل كل رقم إلى نص ويقارن النصوص.
      - text: '`[1220, 450, 99]`'
        why: 'صحيح. بصفتها نصوصًا، تأتي "1220" قبل "450" لأن "1" تأتي قبل "4"، وتأتي "450" قبل "99" لأن "4" تأتي قبل "9".'
      - text: '`[1220, 99, 450]`'
        why: 'النصوص تُقارن حرفًا حرفًا من اليسار، لذلك تُرتَّب "450" قبل "99".'
    answer: 1
  - q: أيّ دالة مقارنة ترتّب المصاريف من الأغلى إلى الأرخص؟
    options:
      - text: '`(a, b) => a.amount - b.amount`'
        why: 'هذه تُرجع رقمًا سالبًا حين تكون `a` أرخص، فتضع الأرخص أولًا. وهذا ترتيب تصاعدي.'
      - text: '`(a, b) => a.amount > b.amount`'
        why: هذه تُرجع قيمة منطقية لا رقمًا. ودوال المقارنة يجب أن تُرجع قيمة سالبة أو صفرًا أو موجبة؛ والقيم المنطقية تعطي نتائج غير موثوقة.
      - text: '`(a, b) => b.amount - a.amount`'
        why: 'صحيح. حين تكون `b` أغلى، يكون الناتج موجبًا، فتوضع `b` قبل `a`. فتأتي المبالغ الأكبر أولًا.'
    answer: 2
  - q: 'استُدعيت `[].reduce((sum, e) => sum + e.amount)` على قائمة فارغة. ماذا يحدث؟'
    options:
      - text: ترمي TypeError، لأنه لا توجد قيمة ابتدائية ولا عنصر أول تبدأ منه.
        why: 'صحيح. تمرير قيمة ابتدائية، `reduce(fn, 0)`، يجعلها تُرجع 0 للقائمة الفارغة بدلًا من ذلك.'
      - text: تُرجع 0.
        why: 'فقط إن مرّرت 0 قيمةً ابتدائية. دونها لا تجد `reduce` ما تبدأ به المُراكِم.'
      - text: 'تُرجع `undefined`.'
        why: '`reduce` لا تُرجع `undefined` بهدوء هنا؛ بل ترمي "Reduce of empty array with no initial value".'
    answer: 0
  - q: 'تعرض المصاريف مرتّبةً حسب المبلغ في لوحة، وبترتيب إضافتها في لوحة أخرى. واللوحتان تقرآن المصفوفة نفسها `expenses`. ما الذي يفسد مع `expenses.sort(byAmount)`؟'
    options:
      - text: لا شيء، لأن `sort` تُرجع نسخة مرتّبة.
        why: '`sort` تُرجع المصفوفة نفسها التي رتّبتها. إنها تعيد ترتيب الأصل في مكانه.'
      - text: تصبح لوحة "بترتيب الإضافة" مرتّبةً هي الأخرى، لأن `sort` عدّلت المصفوفة المشتركة.
        why: 'صحيح. استخدم `expenses.toSorted(byAmount)` أو `[...expenses].sort(byAmount)` لترتيب نسخة.'
      - text: ترمي خطأ، لأن المصفوفة مُصرَّح بها بـ `const`.
        why: '`const` لا تمنع تغيير محتويات المصفوفة، والترتيب لا يفعل إلا إعادة ترتيب المحتويات.'
    answer: 1
---

سؤالان على كل تطبيق ميزانية أن يجيب عنهما: "كم أنفقت على الطعام؟" و"ما أكبر مصاريفي؟". الأول يحوّل القائمة إلى رقم واحد لكل فئة. والثاني يضع القائمة في ترتيب مفيد. لدى JavaScript دالة لكل منهما، ولكل منهما فخّ واحد شهير.

## reduce: قيم كثيرة تصبح قيمة واحدة

أنت تعرف نمط المُراكِم: ابدأ بقيمة، وحدّثها مع كل عنصر، واستخدمها في النهاية. و`reduce` هي هذا النمط على شكل دالة:

```js run
const expenses = [
  { label: "Coffee", amount: 450, category: "food" },
  { label: "Train", amount: 1220, category: "travel" },
  { label: "Lunch", amount: 1350, category: "food" },
];

const total = expenses.reduce((sum, e) => sum + e.amount, 0);
console.log(total);
```

تأخذ `reduce` وسيطين: callback و**قيمة ابتدائية** (هنا `0`). وتستدعي الـ callback مرة لكل عنصر، مع **المُراكِم** (accumulator) الحالي (`sum`) والعنصر (`e`). وكل ما يُرجعه الـ callback يصبح المُراكِم في الاستدعاء التالي. وبعد العنصر الأخير، يكون المُراكِم النهائي هو النتيجة.

:::figure reduce تمرّر المُراكِم من استدعاء إلى الذي يليه
<svg viewBox="0 0 680 190" role="img" aria-labelledby="t1">
  <title id="t1">تبدأ reduce بالقيمة الابتدائية 0. الاستدعاء الأول يُرجع 0 زائد 450، أي 450؛ والثاني يُرجع 450 زائد 1220، أي 1670؛ والثالث يُرجع 1670 زائد 1350، أي 3020، وهي النتيجة النهائية.</title>
  <rect class="d-box-accent" x="10" y="70" width="80" height="50" rx="10"/>
  <text class="d-code" x="50" y="100" text-anchor="middle">0</text>
  <text class="d-label-muted" x="50" y="146" text-anchor="middle">ابتدائية</text>
  <rect class="d-box" x="130" y="60" width="140" height="70" rx="10"/>
  <text class="d-code" x="200" y="90" text-anchor="middle">0 + 450</text>
  <text class="d-label-muted" x="200" y="116" text-anchor="middle">Coffee</text>
  <rect class="d-box" x="310" y="60" width="150" height="70" rx="10"/>
  <text class="d-code" x="385" y="90" text-anchor="middle">450 + 1220</text>
  <text class="d-label-muted" x="385" y="116" text-anchor="middle">Train</text>
  <rect class="d-box" x="500" y="60" width="150" height="70" rx="10"/>
  <text class="d-code" x="575" y="90" text-anchor="middle">1670 + 1350</text>
  <text class="d-label-muted" x="575" y="116" text-anchor="middle">Lunch</text>
  <path class="d-arrow" d="M90 95 L126 95" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 95 L306 95" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 95 L496 95" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="530" y="150" width="90" height="34" rx="8"/>
  <text class="d-code" x="575" y="172" text-anchor="middle">3020</text>
  <path class="d-arrow" d="M575 130 L575 146" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="200" y="40" text-anchor="middle">تُرجع 450</text>
  <text class="d-label-muted" x="385" y="40" text-anchor="middle">تُرجع 1670</text>
</svg>
:::

مرّر القيمة الابتدائية دائمًا. فدونها تستخدم `reduce` العنصر الأول مُراكِمًا ابتدائيًا، وهو هنا كائن مصروف كامل لا رقم، ومع القائمة الفارغة ترمي `TypeError: Reduce of empty array with no initial value`.

### التجميع: reduce إلى كائن

يمكن أن يكون المُراكِم أي شيء، بما في ذلك كائن. وهكذا تبني مجاميع لكل فئة:

```js run
const expenses = [
  { label: "Coffee", amount: 450, category: "food" },
  { label: "Train", amount: 1220, category: "travel" },
  { label: "Lunch", amount: 1350, category: "food" },
];

const byCategory = expenses.reduce((totals, e) => {
  totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  return totals;
}, {});

console.log(byCategory);
```

مع كل مصروف، اقرأ المجموع الجاري لفئته (أو 0 إن كانت هذه أول مرة تظهر فيها الفئة؛ وللعامل `??` شرح خاص في الدرس التالي)، وأضف المبلغ، وخزّنه من جديد بالأقواس المربّعة، لأن اسم الخاصية في متغيّر. ثم أرجع الكائن نفسه كي يستلمه الاستدعاء التالي.

:::mistake نسيان إرجاع المُراكِم
مع الأقواس المعقوفة في الـ callback، يجب أن يكون السطر الأخير `return totals;`. انسَه فيستلم الاستدعاء التالي `undefined` مُراكِمًا، ويرمي الـ callback الخطأ `TypeError: Cannot read properties of undefined` بمجرّد أن يقرأ `totals[e.category]`. حين تسيء `reduce` التصرّف، افحص الـ return أولًا.
:::

وحين تريد تجميع المصاريف نفسها بدلًا من مجموع لكل مجموعة، فهناك اختصار مدمج منذ عام 2024: `Object.groupBy(expenses, (e) => e.category)` تُرجع كائنًا خصائصه هي الفئات، وقيمه مصفوفات المصاريف المطابقة. إنها مدعومة في كل المتصفّحات الحالية وفي Node.js، وتُقرأ أفضل من مقابلها المكتوب بـ `reduce`. أما المجاميع فما زالت تحتاج إلى `reduce` (أو حلقة تمرّ على المجموعات).

`reduce` قوية، وهذا سبب لاستخدامها باعتدال. إن كانت `map` أو `filter` أو حلقة `for...of` قصيرة تقول الشيء نفسه بوضوح أكبر، ففضّلها. المجاميع والتجميع هي المواضع التي تُقرأ فيها `reduce` أفضل ما يكون.

## sort: وضع الأشياء في ترتيبها

يبدو الترتيب سهلًا، لكنه يحتوي على أشهر فخّ في JavaScript:

```js run
const amounts = [450, 1220, 99];
amounts.sort();
console.log(amounts);
```

دون تعليمات، تحوّل `sort` كل عنصر إلى نص وترتّبها كنصوص، مثل الكلمات في القاموس. وبصفتها نصوصًا، تأتي "1220" قبل "450" لأن الحرف "1" يأتي قبل "4". هذا جيد للكلمات وخاطئ للأرقام.

والحل **دالة مقارنة** (comparator): دالة تستلم عنصرين، `a` و`b`، وتُرجع رقمًا يقول أيّهما يأتي أولًا.

| ما تُرجعه دالة المقارنة | النتيجة |
|---|---|
| رقم سالب | `a` تأتي قبل `b` |
| رقم موجب | `b` تأتي قبل `a` |
| `0` | يبقى ترتيبهما الحالي |

ومع الأرقام، الطرح يُنتج هذا بالضبط:

```js run
const amounts = [450, 1220, 99];
console.log([...amounts].sort((a, b) => a - b));  // ascending
console.log([...amounts].sort((a, b) => b - a));  // descending
```

حين تكون `a` تساوي 450 و`b` تساوي 99، يكون `a - b` موجبًا، فتنتقل 99 إلى الأمام. واقلبها إلى `b - a` ليأتي الأكبر أولًا.

النصوص تحتاج إلى مقارنة خاصة بها، لأن `<` تقارن رموز الحروف وتضع كل حرف كبير قبل كل حرف صغير. أما `localeCompare` فتقارن كما يفعل قاموس لغة حقيقية:

```js run
const labels = ["lunch", "Train", "coffee", "Éclair"];
console.log(labels.toSorted((a, b) => a.localeCompare(b)));
```

والكائنات تُرتَّب حسب إحدى خصائصها، بالأنماط نفسها: `(a, b) => b.amount - a.amount` ليأتي الأغلى أولًا، و`(a, b) => a.label.localeCompare(b.label)` للترتيب الأبجدي.

### sort تغيّر الأصل

تعيد `sort` ترتيب المصفوفة **في مكانها** وتُرجع المصفوفة نفسها. فإن كان كود آخر يقرأ القائمة، ربما ليعرض المصاريف بترتيب إضافتها، فقد صارت مرتّبة عنده أيضًا. ولهذا ترتّب الأمثلة أعلاه نسخة، `[...amounts]`. أما الدالة الأحدث `toSorted` (جزء من JavaScript منذ عام 2023، ومدعومة في كل المتصفّحات الحالية) فتُرجع نسخة مرتّبة مباشرة، فلا تحتاج إلى تذكّر خطوة النسخ:

```js run
const expenses = [
  { label: "Coffee", amount: 450 },
  { label: "Train", amount: 1220 },
  { label: "Lunch", amount: 1350 },
];
const biggestFirst = expenses.toSorted((a, b) => b.amount - a.amount);
console.log(biggestFirst.map((e) => e.label), expenses.map((e) => e.label));
```

:::tip اجعل الخيار الافتراضي عدم التعديل في المكان
في كود هذه الدورة، وفي معظم المشاريع الحديثة، الخيار الافتراضي هو إنتاج مصفوفات جديدة: `map` و`filter` و`toSorted` والنشر. ولا تلجأ إلى الدوال التي تعدّل في المكان إلا حين تملك المصفوفة ولا يقرؤها أحد غيرك. هذا يُزيل فئة كاملة من أخطاء "من غيّر بياناتي؟".
:::

في الدرس التالي تتعامل مع بيانات غير موجودة أصلًا: خصائص مفقودة، وقيم فارغة، ومجموعتان، Map وSet، صُمّمتا للبحث السريع ولضمان عدم التكرار.
