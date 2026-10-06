---
summary: تمثّل السجلّات الحقيقية على شكل كائنات، وتقرأ خصائصها وتحدّثها، وتفهم أن الكائنات تُتداوَل عبر المرجع، وتنسخها وتحدّثها وتفكّكها باستخدام الـ spread والـ destructuring.
takeaways:
  - الكائن يجمع قيمًا مسمّاة (خصائص)؛ اقرأها بصيغة النقطة، أو بالأقواس المربّعة حين يكون اسم الخاصية في متغيّر.
  - الكائنات والمصفوفات تُتداوَل عبر المرجع (reference)، لذلك يمكن أن يشير اسمان إلى الكائن نفسه، ويظهر التغيير عبر أحدهما من خلال الآخر.
  - 'النشر (`{ ...expense, amount: 500 }` و`[...list, item]`) يصنع نسخة جديدة سطحية، وهكذا تحدّث البيانات دون تعديلها في مكانها.'
  - 'التفكيك (`const { label, amount } = expense`) يسحب الخصائص إلى متغيّرات، ويعمل في معاملات الدوال مع القيم الافتراضية.'
further:
  - title: Working with objects (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
  - title: Destructuring (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring
  - title: Spread syntax (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
quiz:
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      const a = { label: "Coffee", amount: 450 };
      const b = a;
      b.amount = 500;
      console.log(a.amount);
      ```
    options:
      - text: '`500`، لأن `a` و`b` يشيران إلى الكائن نفسه.'
        why: 'صحيح. هناك كائن واحد فقط. وتغييره عبر `b` يظهر من خلال `a`.'
      - text: '`450`، لأن `b` نسخة من `a`.'
        why: إسناد كائن إلى اسم آخر ينسخ المرجع، لا الكائن. فكلا الاسمين يشيران إلى الكائن نفسه.
      - text: خطأ TypeError، لأن `a` مُصرَّح به بـ `const`.
        why: '`const` تمنع إعادة توجيه `a`. أما تغيير خاصية في الكائن الذي يشير إليه فمسموح.'
    answer: 0
  - q: '`const updated = { ...expense, amount: 500 };` ما الصحيح بعد ذلك؟'
    options:
      - text: 'أصبحت `expense.amount` تساوي 500.'
        why: النشر يبني كائنًا جديدًا تمامًا، ولا يمسّ الأصل.
      - text: '`updated` هو الكائن نفسه `expense`.'
        why: '`{ ... }` تُنشئ دائمًا كائنًا جديدًا، لذلك `updated === expense` تساوي false.'
      - text: 'لدى `updated` كل خصائص `expense`، مع استبدال `amount` بـ 500.'
        why: 'صحيح. تُنسخ الخصائص بالترتيب، و`amount` اللاحقة تكتب فوق المنسوخة.'
    answer: 2
  - q: 'إذا كان `const expense = { label: "Bus", amount: 270 };`، فماذا يعطيك `const { label, category = "other" } = expense;`؟'
    options:
      - text: '`label` تساوي "Bus" و`category` تساوي "other".'
        why: 'صحيح. تُنسخ `label` من الكائن، و`category` غير موجودة فيه، فتُستخدم القيمة الافتراضية.'
      - text: '`label` تساوي "Bus" و`category` تساوي undefined.'
        why: 'هذا صحيح لو لم توجد القيمة الافتراضية. لكن `= "other"` تُطبَّق حين تكون الخاصية مفقودة.'
      - text: يرمي خطأ، لأن `category` ليست خاصية في `expense`.
        why: تفكيك خاصية مفقودة لا يرمي خطأ أبدًا؛ إنه يعطي `undefined`، أو القيمة الافتراضية إن وفّرت واحدة.
    answer: 0
  - q: 'لديك `const key = "category";`. كيف تقرأ `expense.category` باستخدام `key`؟'
    options:
      - text: '`expense.key`'
        why: صيغة النقطة تستخدم الاسم الحرفي بعد النقطة، لذلك تبحث هذه عن خاصية اسمها "key".
      - text: '`expense[key]`'
        why: 'صحيح. الأقواس المربّعة تحسب التعبير بداخلها، لذلك تقرأ `expense[key]` الخاصية التي اسمها هو قيمة `key`.'
      - text: '`expense["key"]`'
        why: 'علامات التنصيص تجعلها النص الحرفي "key"، تمامًا مثل `expense.key`.'
    answer: 1
---

حتى الآن كان المصروف في Pocket مجرّد رقم. لكن المصروف الحقيقي له عدّة حقائق مترابطة: ما هو، وكم كلّف، وما فئته، ومتى كان. وحفظها في مصفوفات منفصلة (`labels[2]` و`amounts[2]` و`categories[2]`) ينجح إلى أن تُرتَّب إحدى المصفوفات دون الأخرى. تحتاج إلى قيمة واحدة تحملها كلها: **الكائن** (object).

## الكائنات: قيم مسمّاة مجتمعة

يُكتب الكائن بأقواس معقوفة ويحتوي على **خصائص** (properties)، كل منها اسم وقيمة:

```js run
const expense = {
  id: "exp-1",
  label: "Coffee",
  amount: 450,
  category: "food",
};

console.log(expense.label);       // dot notation
console.log(expense["amount"]);   // bracket notation
console.log(expense.note);        // missing property: undefined
```

صيغة النقطة هي الطريقة اليومية لقراءة خاصية. والأقواس المربّعة تؤدّي المهمة نفسها، لكنها تحسب ما بداخلها، وهذا ما تحتاجه حين يكون اسم الخاصية في متغيّر: `const field = "category"; expense[field]`. وقراءة خاصية غير موجودة تعطي `undefined`، لا خطأ.

يمكنك إضافة الخصائص وتغييرها وحذفها بعد إنشاء الكائن:

```js run
const expense = { label: "Coffee", amount: 450 };
expense.category = "food";   // add
expense.amount = 500;        // change
delete expense.category;     // remove
console.log(expense);
console.log(Object.keys(expense), Object.values(expense));
```

حين يكون لديك متغيّر يحمل أصلًا الاسم الذي تريده للخاصية، يمكنك كتابته مرة واحدة. `{ label, amount }` اختصار لـ `{ label: label, amount: amount }`، وستراه باستمرار في الكود الحقيقي:

```js run
const label = "Bus";
const amount = 270;
const expense = { label, amount, category: "travel" };
console.log(expense);
```

`Object.keys` و`Object.values` تعطيانك مصفوفتين بالأسماء والقيم، و`Object.entries` تعطيك أزواجًا، لذلك تمرّ `for (const [key, value] of Object.entries(expense))` على كل خاصية.

صارت بيانات Pocket الآن **مصفوفة من الكائنات**، وهي أكثر أشكال البيانات شيوعًا في JavaScript، وكل ما تعلّمته في الدرس السابق ما زال ينطبق:

```js run
const expenses = [
  { id: "exp-1", label: "Coffee", amount: 450, category: "food" },
  { id: "exp-2", label: "Train", amount: 1220, category: "travel" },
  { id: "exp-3", label: "Lunch", amount: 1350, category: "food" },
];
const food = expenses.filter((e) => e.category === "food");
console.log(food.map((e) => e.label));
```

## المراجع: اسمان وكائن واحد

هذا أهم ما يجب أن تفهمه عن الكائنات والمصفوفات. المتغيّر لا يحمل الكائن نفسه؛ بل يحمل **مرجعًا** (reference) إليه، مثل العنوان. ونسخ المتغيّر ينسخ العنوان:

```js run
const original = { label: "Coffee", amount: 450 };
const alias = original;
alias.amount = 999;
console.log(original.amount);       // 999
console.log(alias === original);    // true: the same object
console.log({ a: 1 } === { a: 1 }); // false: two different objects
```

:::figure الإسناد ينسخ المرجع؛ والنشر يُنشئ كائنًا جديدًا
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">الاسمان original وalias يشيران كلاهما إلى الكائن نفسه، لذلك يظهر التغيير عبر alias من خلال original. أما الاسم copy فيشير إلى كائن جديد منفصل أُنشئ بالنشر.</title>
  <rect class="d-box-primary" x="20" y="30" width="130" height="44" rx="10"/>
  <text class="d-code" x="85" y="57" text-anchor="middle">original</text>
  <rect class="d-box-primary" x="20" y="100" width="130" height="44" rx="10"/>
  <text class="d-code" x="85" y="127" text-anchor="middle">alias</text>
  <rect class="d-box" x="260" y="50" width="260" height="70" rx="12"/>
  <text class="d-code" x="390" y="90" text-anchor="middle">{ label: "Coffee", amount: 999 }</text>
  <path class="d-arrow" d="M150 52 L256 75" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M150 122 L256 98" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="20" y="170" width="130" height="44" rx="10"/>
  <text class="d-code" x="85" y="197" text-anchor="middle">copy</text>
  <rect class="d-box-success" x="260" y="160" width="260" height="60" rx="12"/>
  <text class="d-code" x="390" y="195" text-anchor="middle">{ label: "Coffee", amount: 450 }</text>
  <path class="d-arrow" d="M150 192 L256 192" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="600" y="90" text-anchor="middle">كائن واحد</text>
  <text class="d-label-muted" x="600" y="195" text-anchor="middle">كائن جديد</text>
</svg>
:::

`===` مع الكائنات تقارن المراجع، لا المحتويات. فالكائنان اللذان يبدوان متطابقين يظلّان كائنين مختلفين.

ولهذا أهمية لأن الدوال تستلم المراجع أيضًا. فإن غيّرت دالة كائنًا أُعطي لها، تغيّر كائن المُستدعي:

```js run
function applyDiscount(expense) {
  expense.amount = Math.round(expense.amount * 0.9);
  return expense;
}

const lunch = { label: "Lunch", amount: 1350 };
const discounted = applyDiscount(lunch);
console.log(discounted.amount, lunch.amount); // both 1215
```

تبدو الدالة كأنها تُرجع نسخة مخفّضة، لكنها أعادت كتابة الأصل أيضًا بصمت. وفي مكان آخر، صار مجموع كان يشمل `lunch` خاطئًا، ولا شيء على الشاشة يقول لماذا. هكذا تحدث أخطاء من نوع "كل ما فعلته أنني عرضت المصاريف، فلماذا تغيّرت مبالغها؟". والحل أن تبني كائنًا جديدًا بدلًا من تغيير الكائن الذي أُعطي لك، والنشر يجعل ذلك سهلًا.

## النشر: انسخ وحدّث دون تعديل في المكان

**صيغة النشر** (spread)، أي النقاط الثلاث، تنسخ كل خصائص كائن (أو عناصر مصفوفة) إلى كائن جديد:

```js run
const expense = { id: "exp-1", label: "Coffee", amount: 450 };
const updated = { ...expense, amount: 500 };
console.log(expense.amount, updated.amount);

const list = [expense];
const longer = [...list, { id: "exp-2", label: "Bus", amount: 270 }];
console.log(list.length, longer.length);
```

في `{ ...expense, amount: 500 }` تُنسخ الخصائص بالترتيب، و`amount` اللاحقة تكتب فوق المنسوخة. فتحصل على كائن جديد، ويبقى الأصل دون مساس. ومع `map`، هذه هي الطريقة المعتمدة لتغيير عنصر واحد في قائمة دون تعديل أي شيء في مكانه:

```js run
const expenses = [
  { id: "exp-1", label: "Coffee", amount: 450 },
  { id: "exp-2", label: "Bus", amount: 270 },
];
const fixed = expenses.map((e) => (e.id === "exp-2" ? { ...e, amount: 300 } : e));
console.log(fixed[1].amount, expenses[1].amount);
```

:::mistake توقّع أن ينسخ النشر نسخًا عميقًا
النشر نسخة **سطحية** (shallow): إنه ينسخ خصائص المستوى الأعلى فقط. فإن كانت إحدى الخصائص كائنًا بحدّ ذاتها، مثل `tags: ["work"]`، تشاركت النسخة والأصل تلك المصفوفة الداخلية، وإضافة عنصر إلى إحداهما تغيّر الاثنتين. وحين تحتاج إلى نسخة مستقلة تمامًا من بيانات متداخلة، استخدم `structuredClone(value)`.
:::

## التفكيك: فكّ الحزمة إلى متغيّرات

**التفكيك** (destructuring) يسحب الخصائص من كائن إلى متغيّرات تحمل الأسماء نفسها:

```js run
const expense = { label: "Train", amount: 1220, category: "travel" };
const { label, amount, note = "no note" } = expense;
console.log(label, amount, note);

const [first, second] = ["food", "travel", "fun"];
console.log(first, second);
```

`= "no note"` قيمة افتراضية، تُستخدم حين تكون الخاصية مفقودة أو `undefined`. ومع المصفوفات، يعتمد التفكيك على الموضع بدلًا من الاسم.

والتفكيك أكثر ما يكون نفعًا في معاملات الدوال، حيث يوثّق بالضبط الخصائص التي تحتاجها الدالة:

```js run
function describe({ label, amount, category = "other" }) {
  return `${label}: $${(amount / 100).toFixed(2)} (${category})`;
}
console.log(describe({ label: "Train", amount: 1220 }));
```

قارنها بالنسخة الخالية من التفكيك، التي تكرّر `expense.` في كل سطر وتُخفي الخصائص المهمة حتى تقرأ الجسم كله. أما مع التفكيك، فالسطر الأول من الدالة هو عقدها: أعطني شيئًا فيه تسمية ومبلغ، وفئة اختيارية. ويستطيع المُستدعون تمرير كائن مصروف كامل فيه عشر خصائص أخرى؛ والدالة ببساطة تتجاهل الباقي.

وتعمل `...` أيضًا بالعكس، بصفتها **rest** (البقية): `const { id, ...details } = expense` تضع `id` في متغيّر خاص به، وكل الخصائص الأخرى في كائن جديد اسمه `details`. وهذه طريقة أنيقة للتخلّص من خاصية دون تعديل الأصل: كل ما لم تسمّه ينتهي في الكائن الجديد.

صارت لدى Pocket بيانات واقعية. وفي الدرس التالي تلخّصها: مجاميع لكل فئة، وقوائم مرتّبة حسب المبلغ.
