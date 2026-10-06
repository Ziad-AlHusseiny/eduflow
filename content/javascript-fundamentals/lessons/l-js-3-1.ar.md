---
summary: تُنشئ المصفوفات وتغيّرها، وتعرف أيّ دوالها تعدّلها في مكانها، وتستبدل الحلقات المكتوبة يدويًا بـ map وfilter وfind وsome وevery لتحويل القوائم والبحث فيها.
takeaways:
  - '`const` تمنع الاسم من الإشارة إلى مصفوفة أخرى، لكن محتويات المصفوفة نفسها يمكن أن تتغيّر عبر `push` أو `pop` أو الإسناد بالفهرس.'
  - 'بعض الدوال تعدّل المصفوفة نفسها (`push` و`pop` و`splice` و`sort`)؛ وبعضها يُرجع قيمة جديدة ويتركها دون مساس (`slice` و`map` و`filter`).'
  - '`map` تُرجع مصفوفة جديدة بالطول نفسه وقد حُوّل كل عنصر فيها؛ و`filter` تُرجع مصفوفة جديدة فيها العناصر التي تجتاز الاختبار فقط.'
  - '`find` تُرجع أول عنصر مطابق أو `undefined`؛ و`some` و`every` تجيبان عن أسئلة نعم/لا حول القائمة كلها.'
further:
  - title: Array (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
  - title: Array.prototype.map() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
  - title: Array.prototype.filter() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
quiz:
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      const amounts = [450, 1220];
      amounts.push(270);
      console.log(amounts.length);
      ```
    options:
      - text: يرمي TypeError، لأن `amounts` مُصرَّح بها بـ `const`.
        why: '`const` تمنع فقط توجيه الاسم إلى قيمة أخرى. أما `push` فتغيّر المصفوفة التي يشير إليها الاسم أصلًا، وهذا مسموح.'
      - text: '`3`'
        why: 'صحيح. `push` تضيف 270 إلى نهاية المصفوفة نفسها، فيصبح فيها ثلاثة عناصر.'
      - text: '`2`'
        why: '`push` تعدّل المصفوفة في مكانها؛ ولا تُرجع نسخة وتترك الأصلية كما هي.'
    answer: 1
  - q: '`const amounts = [450, -300, 1220];` ماذا تُرجع `amounts.find((a) => a > 5000)`؟'
    options:
      - text: '`[]`'
        why: 'المصفوفة الفارغة هي ما تُرجعه `filter` حين لا يطابق شيء. أما `find` فتُرجع عنصرًا واحدًا أو لا شيء.'
      - text: '`-1`'
        why: '`-1` هي ما تُرجعه `findIndex` و`indexOf` للتعبير عن "غير موجود". أما `find` فتُرجع العنصر نفسه.'
      - text: '`undefined`'
        why: 'صحيح. `find` تُرجع أول عنصر يجتاز الاختبار، و`undefined` حين لا يجتازه أي عنصر.'
      - text: '`false`'
        why: 'الإجابة المنطقية تأتي من `some` أو `every`. أما `find` فتعطيك العنصر المطابق.'
    answer: 2
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      const out = [450, 1220].map((c) => {
        c / 100;
      });
      console.log(out);
      ```
    options:
      - text: '`[undefined, undefined]`'
        why: 'صحيح. للـ callback أقواس معقوفة لكن دون `return`، فيُرجع `undefined` لكل عنصر، وتجمع `map` هذه القيم.'
      - text: '`[4.5, 12.2]`'
        why: 'هذا يتطلّب `(c) => c / 100` أو `return` صريحة داخل الأقواس.'
      - text: '`[450, 1220]`'
        why: '`map` تبني نتيجتها دائمًا مما يُرجعه الـ callback، لا من العناصر الأصلية أبدًا.'
    answer: 0
  - q: تحتاج إلى معرفة إن كان لكل مصروف في القائمة فئة. أيّ دالة تناسب؟
    options:
      - text: '`filter`'
        why: '`filter` ستعطيك مصفوفة جديدة، وستظل مضطرًا إلى مقارنة الأطوال. أما `every` فتجيب عن السؤال مباشرة.'
      - text: '`some`'
        why: '`some` تكون صحيحة إن اجتاز عنصر واحد على الأقل. وأنت تحتاج أن تجتاز العناصر كلها.'
      - text: '`every`'
        why: 'صحيح. `every` تُرجع true فقط إن اجتاز الاختبار جميع العناصر، وتتوقّف عند أول فشل.'
      - text: '`map`'
        why: '`map` تحوّل العناصر؛ ولا تجيب عن سؤال نعم/لا حول القائمة.'
    answer: 2
---

مصاريف Pocket قائمة، ومعظم ميزاته أسئلة حول هذه القائمة. أيّها مبالغ مستردّة؟ كيف تبدو منسّقة بالدولار؟ هل يوجد ما يتجاوز 100 دولار؟ يمكنك الإجابة عن كل هذا بحلقات القسم 2، لكن المصفوفات تأتي مع دوال (methods) تجيب عن كل سؤال منها بسطر واحد مقروء.

## إنشاء المصفوفات وتغييرها

المصفوفة قائمة مرتّبة من القيم. وقد رأيت أساسياتها: أقواس مربّعة، ومواضع تبدأ من 0، و`length`.

```js run
const amounts = [450, 1220, 270];

amounts.push(899);           // add to the end
console.log(amounts);
const last = amounts.pop();  // remove from the end, and get it back
console.log(last, amounts);
amounts[0] = 500;            // replace an item by index
console.log(amounts, amounts.includes(1220), amounts.indexOf(270));
```

لحظة: `amounts` مُصرَّح بها بـ `const`، ومع ذلك تغيّرت ثلاث مرات. ليس في هذا تناقض. `const` تعني أن **الاسم** يشير دائمًا إلى المصفوفة نفسها، ولا تقول شيئًا عمّا بداخلها. `push` و`pop` والإسناد بالفهرس كلها تغيّر محتويات تلك المصفوفة الواحدة، لذلك هي مسموحة. وحدها `amounts = [...]`، أي توجيه الاسم إلى مصفوفة مختلفة، هي التي ترمي خطأ.

:::figure const تثبّت السهم، لا المحتويات
<svg viewBox="0 0 640 200" role="img" aria-labelledby="t1">
  <title id="t1">الاسم amounts المُصرَّح به بـ const يشير إلى مصفوفة واحدة. push تغيّر العناصر داخل تلك المصفوفة، وهذا مسموح. أما توجيه amounts إلى مصفوفة أخرى فهو ما تمنعه const.</title>
  <rect class="d-box-primary" x="20" y="70" width="160" height="50" rx="10"/>
  <text class="d-code" x="100" y="100" text-anchor="middle">const amounts</text>
  <path class="d-arrow" d="M180 95 L256 95" marker-end="url(#arrow)"/>
  <rect class="d-box" x="260" y="60" width="360" height="70" rx="12"/>
  <text class="d-code" x="440" y="100" text-anchor="middle">[450, 1220, 270, 899]</text>
  <text class="d-label-muted" x="440" y="160" text-anchor="middle">push / pop / [0] = … تغيّر الصندوق: مسموح</text>
  <text class="d-label-muted" x="220" y="40" text-anchor="middle">إعادة توجيه السهم: TypeError</text>
</svg>
:::

هذه الفكرة، أن الاسم يشير إلى قائمة وأن عدّة عمليات تغيّر القائمة نفسها، هي سبب ضرورة معرفة أيّ الدوال **تعدّل في المكان** (mutate):

| تغيّر المصفوفة نفسها | تُرجع شيئًا جديدًا وتترك المصفوفة كما هي |
|---|---|
| `push`، `pop`، `shift`، `unshift` | `slice`، `concat` |
| `splice` | `map`، `filter` |
| `sort`، `reverse` | `toSorted`، `toReversed` |

التعديل في المكان ليس خطأً، لكنه يفاجئ الناس حين يتشارك جزءان من البرنامج مصفوفة واحدة. والدوال في باقي هذا الدرس لا تعدّل في المكان أبدًا، وهذا جزء كبير من سبب شعبيتها.

والثنائي الذي يُربك الجميع هو `slice` و`splice`، يفصل بينهما حرف واحد وسلوكهما متعاكس:

```js run
const amounts = [450, 1220, 270, 899];

const firstTwo = amounts.slice(0, 2);   // copy of indexes 0 and 1
console.log(firstTwo, amounts);         // original untouched

const removed = amounts.splice(1, 1);   // remove 1 item at index 1
console.log(removed, amounts);          // original changed
```

`slice(start, end)` تعمل تمامًا مثل دالة النصوص التي تحمل الاسم نفسه: تنسخ جزءًا وتترك الأصل دون مساس. أما `splice(start, count)` فتقصّ عناصر من المصفوفة نفسها وتُرجع ما أزالته. وإن احتجت يومًا إلى إزالة عنصر دون تغيير الأصل، فاستخدم `filter` بدلًا منها، وستتعرّف عليها حالًا.

## map: حوّل كل عنصر

تستدعي `map` دالة لكل عنصر، وتجمع القيم المُعادة في **مصفوفة جديدة بالطول نفسه**:

```js run
const amounts = [450, 1220, 270];
const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

const labels = amounts.map(formatMoney);
console.log(labels);
console.log(amounts);  // unchanged
```

إنها النسخة المدمجة من دالة `applyToAll` التي كتبتها في درس الدوال. استخدم `map` كلما كان السؤال "حوّل كل X إلى Y": السنتات إلى نصوص بالدولار، أو الدولارات إلى سنتات، أو قيم النموذج الخام إلى قيم نظيفة. يستلم الـ callback كل عنصر بدوره، ويجب أن يُرجع نسخته الجديدة. وكل ما يُرجعه يوضع في الموضع نفسه من النتيجة، لذلك يكون في المخرجات دائمًا عدد العناصر نفسه الذي في المدخلات.

## filter: احتفظ ببعض العناصر فقط

تستدعي `filter` دالة اختبار لكل عنصر، وتُرجع مصفوفة جديدة فيها فقط العناصر التي أرجع لها الاختبار قيمة truthy:

```js run
const amounts = [450, -300, 1220, -50, 270];
const spending = amounts.filter((a) => a > 0);
const refunds = amounts.filter((a) => a < 0);
console.log(spending, refunds);
```

قد تكون النتيجة أقصر من الأصل، بل قد تكون فارغة، لكن `filter` لا تغيّر العناصر نفسها أبدًا.

## find وsome وevery: البحث

أربع دوال تجيب عن أسئلة البحث، وكل منها تتوقّف بمجرّد أن تعرف الإجابة:

```js run
const amounts = [450, 12000, 1220, 15000];

console.log(amounts.find((a) => a >= 10000));       // first match: 12000
console.log(amounts.findIndex((a) => a >= 10000));  // its position: 1
console.log(amounts.some((a) => a < 0));            // any refunds? false
console.log(amounts.every((a) => a > 0));           // all positive? true
```

`find` تُرجع العنصر نفسه، أو `undefined` إن لم يطابق شيء. و`findIndex` تُرجع موضعه، أو `-1`. أما `some` و`every` فتُرجعان قيمًا منطقية: "واحد على الأقل" و"جميعها".

## السلسلة: قراءة خطّ معالجة

لأن `filter` و`map` كلتيهما تُرجعان مصفوفات، يمكنك استدعاء إحداهما على ناتج الأخرى:

```js run
const amounts = [450, -300, 12000, 1220];
const bigOnes = amounts
  .filter((a) => a >= 1000)
  .map((a) => `$${(a / 100).toFixed(2)}`);
console.log(bigOnes);
```

اقرأها من الأعلى إلى الأسفل كوصفة طبخ: ابدأ بكل المبالغ، واحتفظ بما قيمته 10 دولارات أو أكثر، ثم نسّقها. كل خطوة تستلم مخرجات الخطوة التي قبلها. ووضع كل خطوة في سطر خاص بها يبدأ بالنقطة يُبقي السلاسل الطويلة مقروءة.

:::mistake أقواس معقوفة دون return في الـ callback
`amounts.map((a) => { a / 100 })` تُرجع `[undefined, undefined, …]`، و`filter` مع الخطأ نفسه تُرجع `[]`، لأن `undefined` قيمة falsy. مع الأقواس المعقوفة، يحتاج الـ callback إلى `return`. ومع تعبير واحد، احذف الأقواس: `amounts.map((a) => a / 100)`.
:::

:::tip forEach للتأثيرات الجانبية
للمصفوفات أيضًا `forEach`، التي تستدعي دالة لكل عنصر ولا تُرجع شيئًا. استخدمها، أو `for...of`، حين تريد أن *تفعل* شيئًا مع كل عنصر، مثل الطباعة. واستخدم `map` و`filter` حين تريد استعادة مصفوفة جديدة.
:::

حتى الآن تحمل المصفوفات أرقامًا بسيطة. لكن المصاريف الحقيقية لها تسمية ومبلغ وفئة معًا، وهذا يستدعي الكائنات، موضوع الدرس التالي.
