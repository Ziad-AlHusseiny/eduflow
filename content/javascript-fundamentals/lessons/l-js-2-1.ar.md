---
summary: تجعل برنامجك يختار بين مسارات مختلفة باستخدام if وelse if وelse، وتجمع الشروط بـ && و|| و!، وتختار القيم بالعامل الثلاثي، وتتوقّع أيّ القيم تُعدّ truthy وأيّها falsy.
takeaways:
  - 'سلسلة `if` تفحص الشروط من الأعلى إلى الأسفل ولا تنفّذ إلا أول كتلة شرطها صحيح، لذلك ضع الحالة الأضيق أولًا.'
  - '`&&` تحتاج أن يكون الطرفان صحيحين، و`||` تحتاج طرفًا صحيحًا واحدًا على الأقل، و`!` تقلب القيمة المنطقية.'
  - 'استخدم العامل الثلاثي `condition ? a : b` للاختيار بين قيمتين، و`if` للاختيار بين فعلين.'
  - 'ثماني قيم فقط هي falsy (`false` و`0` و`-0` و`0n` و`""` و`null` و`undefined` و`NaN`)؛ وكل ما عداها truthy، بما في ذلك `"0"` و`[]`.'
further:
  - title: if...else (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else
  - title: Truthy (MDN glossary)
    url: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
  - title: Conditional (ternary) operator (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator
quiz:
  - q: |
      إذا كانت `spent = 2100` و`budget = 2000`، فماذا يطبع هذا الكود؟
      ```js
      if (spent > budget * 0.8) {
        console.log("close");
      } else if (spent > budget) {
        console.log("over");
      } else {
        console.log("ok");
      }
      ```
    options:
      - text: '`over`'
        why: 'تتوقّف السلسلة عند أول شرط صحيح. 2100 أكبر من 1600، فتُنفَّذ الكتلة الأولى ولا يُفحص الـ `else if` أبدًا.'
      - text: '`close`'
        why: 'صحيح، وهذا خطأ برمجي (bug). الشرط الأوسع جاء أولًا فابتلع حالة تجاوز الميزانية. افحص `spent > budget` أولًا.'
      - text: '`close` ثم `over`'
        why: 'سلسلة `if`/`else if` تنفّذ كتلة واحدة على الأكثر. وحدها تعليمات `if` المنفصلة يمكن أن تُنفَّذ كلها.'
      - text: '`ok`'
        why: '`else` لا تُنفَّذ إلا حين تكون كل الشروط التي فوقها خاطئة، والشرط الأول هنا صحيح.'
    answer: 1
  - q: أيّ هذه القيم truthy؟
    options:
      - text: '`""` (نص فارغ)'
        why: النص الفارغ إحدى القيم الثماني الـ falsy.
      - text: '`0`'
        why: 'الصفر falsy، ولهذا بالضبط يسيء `if (amount)` التصرّف مع مبلغ حقيقي قيمته 0.'
      - text: '`"0"` (نص يحتوي على صفر)'
        why: 'صحيح. أي نص غير فارغ truthy، حتى `"0"` و`"false"`.'
      - text: '`NaN`'
        why: '`NaN` قيمة falsy، مثل `false` و`0` و`-0` و`0n` و`""` و`null` و`undefined`.'
    answer: 2
  - q: 'يستطيع المستخدم أن يحدّد سقفًا يوميًا للإنفاق، و`0` اختيار صالح يعني "لا إنفاق اليوم". ماذا يفعل `const limit = userLimit || 5000;` حين تكون `userLimit` تساوي `0`؟'
    options:
      - text: يُبقي على 0، لأن 0 رقم.
        why: '`||` لا تفحص الأنواع؛ إنها تفحص إن كانت القيمة truthy، و0 قيمة falsy.'
      - text: يرمي خطأ، لأن `||` لا تعمل إلا مع القيم المنطقية.
        why: '`||` تعمل مع أي قيم وتُرجع إحداها، وليس بالضرورة قيمة منطقية.'
      - text: يجعل `limit` يساوي 5000، متجاهلًا اختيار المستخدم بصمت.
        why: 'صحيح. `||` تلجأ إلى البديل كلما كان الطرف الأيسر falsy، و0 قيمة falsy. أما العامل `??`، الذي ستتعلّمه في القسم 3، فلا يلجأ إلى البديل إلا مع null وundefined.'
    answer: 2
  - q: أيّ سطر يستخدم العامل الثلاثي بأفضل شكل؟
    options:
      - text: '`const label = isOver ? "Over budget" : "On track";`'
        why: صحيح. العامل الثلاثي يختار إحدى قيمتين ويُخزَّن الناتج. وهذا بالضبط ما وُجد من أجله.
      - text: '`isOver ? sendAlert() : logQuietly();`'
        why: 'هذا يعمل، لكنه يستخدم عاملًا مخصّصًا لاختيار القيم كي يختار بين أفعال. و`if`/`else` تعبّر عن هذه النية بوضوح أكبر.'
      - text: '`const label = a ? b ? "x" : "y" : c ? "z" : "w";`'
        why: 'العوامل الثلاثية المتداخلة مسموحة لكنها صعبة القراءة. استخدم سلسلة `if`/`else if` متى زادت النتائج على اثنتين.'
    answer: 0
---

يستطيع Pocket أن يجمع ما أنفقته. والآن عليه أن يخبرك كيف حالك: بخير، أو تقترب من ميزانيتك، أو تجاوزتها. وهذا يعني تنفيذ كود مختلف بحسب البيانات، وهذا ما وُجدت الشروط من أجله.

## if وelse if وelse

تعليمة `if` تنفّذ كتلة من الكود فقط حين يكون شرطها صحيحًا:

```js run
const budgetCents = 2000;
const spentCents = 1750;

if (spentCents > budgetCents) {
  console.log("Over budget");
} else if (spentCents >= budgetCents * 0.8) {
  console.log("Close to your budget");
} else {
  console.log("On track");
}
```

يحسب المحرّك الشرط الأول، `1750 > 2000`، فيحصل على `false`، وينتقل إلى ما بعده. الشرط الثاني، `1750 >= 1600`، صحيح (`true`)، فتُنفَّذ كتلته، **ويُتخطّى باقي السلسلة**. أما كتلة `else` فلا تُنفَّذ إلا حين تكون كل الشروط التي فوقها خاطئة. ولا تُنفَّذ أبدًا أكثر من كتلة واحدة في السلسلة.

:::figure سلسلة if تتوقّف عند أول شرط صحيح
<svg viewBox="0 0 640 260" role="img" aria-labelledby="t1">
  <title id="t1">مسار فحص الميزانية: أولًا افحص هل الإنفاق أكبر من الميزانية؛ إن كان كذلك فاطبع Over budget. وإن لم يكن، فافحص هل الإنفاق 80 بالمئة من الميزانية على الأقل؛ إن كان كذلك فاطبع Close. وإن لم يكن، فاطبع On track.</title>
  <rect class="d-box-accent" x="20" y="30" width="200" height="50" rx="10"/>
  <text class="d-code" x="120" y="60" text-anchor="middle">spent &gt; budget?</text>
  <rect class="d-box-accent" x="20" y="120" width="200" height="50" rx="10"/>
  <text class="d-code" x="120" y="150" text-anchor="middle">spent ≥ 80%?</text>
  <rect class="d-box-success" x="20" y="205" width="200" height="44" rx="10"/>
  <text class="d-label" x="120" y="232" text-anchor="middle">"On track"</text>
  <rect class="d-box-warn" x="400" y="30" width="200" height="50" rx="10"/>
  <text class="d-label" x="500" y="60" text-anchor="middle">"Over budget"</text>
  <rect class="d-box-warn" x="400" y="120" width="200" height="50" rx="10"/>
  <text class="d-label" x="500" y="150" text-anchor="middle">"Close"</text>
  <path class="d-arrow" d="M220 55 L396 55" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="308" y="46" text-anchor="middle">true: توقّف</text>
  <path class="d-arrow" d="M220 145 L396 145" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="308" y="136" text-anchor="middle">true: توقّف</text>
  <path class="d-arrow" d="M120 80 L120 116" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="160" y="103">false</text>
  <path class="d-arrow" d="M120 170 L120 201" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="160" y="192">false</text>
</svg>
:::

لأن أول شرط صحيح هو الذي يفوز، فإن **الترتيب مهم**. ضع الحالة الأضيق أولًا. لو فحصت "80% على الأقل" قبل "تجاوز الميزانية"، فإن الشهر الذي تجاوز الميزانية سيكون أيضًا 80% على الأقل، ولن ترى رسالة "Over budget" أبدًا. وفي الاختبار أدناه سؤال فيه هذا الخطأ بالضبط.

الأقواس المعقوفة تحدّد **كتلة** (block)، أي مجموعة من التعليمات تُنفَّذ معًا. إن كان جسم الشرط سطرًا واحدًا فالأقواس اختيارية من الناحية التقنية، لكن اكتبها دائمًا: إضافة سطر ثانٍ لاحقًا دون أقواس خطأ كلاسيكي يجعل السطر الأول وحده هو المشروط.

## الجمع بين الشروط

ثلاثة **عوامل منطقية** تتيح لك بناء شروط أكبر:

- `a && b` (و) صحيحة فقط حين يكون الطرفان صحيحين.
- `a || b` (أو) صحيحة حين يكون أحد الطرفين على الأقل صحيحًا.
- `!a` (ليس) تقلب الصحيح إلى خاطئ والعكس.

```js run
const amountCents = 12500;
const category = "travel";
const isWeekend = false;

if (amountCents > 10000 && category !== "rent") {
  console.log("Big purchase: ask yourself twice");
}
if (category === "food" || category === "travel") {
  console.log("Flexible spending");
}
if (!isWeekend) {
  console.log("Weekday");
}
```

تُحسب `&&` قبل `||`، تمامًا كما يُحسب `*` قبل `+`. وحين تخلط بينهما، أضف أقواسًا كي لا يضطر أحد، بما في ذلك أنت في المستقبل، إلى تذكّر هذه القاعدة.

## قيمة واحدة وخيارات ثابتة كثيرة: switch

حين تقارن قيمة واحدة بقائمة من الخيارات المحدّدة، مثل الفئة، تصبح سلسلة `else if (category === …)` مكرّرة ومملّة. وتعليمة `switch` مصمّمة لهذه الحالة بالذات:

```js run
const category = "travel";
let monthlyLimit;

switch (category) {
  case "food":
    monthlyLimit = 40000;
    break;
  case "travel":
  case "fun":
    monthlyLimit = 15000;
    break;
  default:
    monthlyLimit = 10000;
}
console.log(monthlyLimit);
```

تقارن `switch` باستخدام `===`، وتقفز إلى أول `case` مطابقة، وتنفّذ من هناك **حتى تصل إلى `break`**. انسَ `break` فيستمر التنفيذ "منزلقًا" (fall through) إلى الحالة التالية، وهذا خطأ متكرّر. وأحيانًا يكون مقصودًا، كما في اشتراك `"travel"` و`"fun"` في سقف واحد أعلاه. أما `default` فتُنفَّذ حين لا يطابق شيء، مثل `else` الأخيرة. ومع شرطين أو ثلاثة، أو مع أي شيء ليس فحص مساواة بسيطًا، ابقَ مع `if`.

## العامل الثلاثي: اختيار قيمة

كثيرًا ما لا تريد أن *تفعل* أشياء مختلفة، بل أن *تختار* بين قيمتين. و**العامل الشرطي**، الذي يُسمّى عادةً العامل الثلاثي (ternary)، يفعل ذلك في تعبير واحد:

```js run
const spent = 2100;
const budget = 2000;
const status = spent > budget ? "Over budget" : "On track";
console.log(status);
```

اقرأه هكذا: "إن كان `spent > budget` فالقيمة `"Over budget"`، وإلا فالقيمة `"On track"`". ولأن العامل الثلاثي يُنتج قيمة، يمكنك تخزينها في `const` أو إسقاطها داخل template literal. استخدمه حين تكون هناك نتيجتان. ومع ثلاث نتائج أو أكثر، تُقرأ سلسلة `if` أفضل من العوامل الثلاثية المتداخلة.

## القيم الـ truthy والـ falsy

لا يُشترط أن يكون الشرط قيمة منطقية. تقبل JavaScript أي قيمة وتحوّلها: القيم التي تُعامَل على أنها صحيحة تُسمّى **truthy**، والتي تُعامَل على أنها خاطئة تُسمّى **falsy**. وقائمة الـ falsy قصيرة بما يكفي لتحفظها:

`false`، `0`، `-0`، `0n`، `""` (نص فارغ)، `null`، `undefined`، `NaN`.

وكل ما عداها truthy، بما في ذلك قيم تفاجئ الناس: `"0"` و`"false"` و`" "` (مسافة)، والقوائم والكائنات الفارغة.

```js run
const note = "";
if (note) {
  console.log("Has a note");
} else {
  console.log("No note");
}
console.log(Boolean("0"), Boolean(0), Boolean(" "));
```

هذه الخاصية تجعل فحوصًا مثل `if (note)` قصيرة ومقروءة مع النصوص، حيث "فارغ" و"غير موجود" يعنيان كلاهما "لا شيء لعرضه". لكنها خطرة مع الأرقام، حيث يكون الصفر غالبًا قيمة حقيقية وصالحة.

:::mistake فحص مبلغ باستخدام if (amount)
```js
const amountCents = 0; // a free coffee voucher, recorded on purpose
if (amountCents) {
  console.log("Recorded");
} else {
  console.log("Please enter an amount"); // runs, wrongly
}
```
الصفر falsy، فيبدو الصفر المشروع وكأنه "لم يُدخَل شيء". قل ما تعنيه بالضبط: `if (typeof amountCents === "number" && amountCents >= 0)`.
:::

تعمل `&&` و`||` أيضًا مع القيم غير المنطقية: فهما تُرجعان أحد طرفيهما. التعبير `name || "Anonymous"` يعطي `name` إن كانت truthy، و`"Anonymous"` فيما عدا ذلك، وهذه طريقة شائعة لتوفير قيم افتراضية. لكن فيها مشكلة الصفر نفسها، ولهذا أضافت JavaScript عاملًا أفضل للقيم الافتراضية، هو `??`، وستتعرّف عليه في القسم 3.

:::tip علامة = واحدة داخل if
`if (category = "food")` تُسنِد بدلًا من أن تقارن، فيكون الشرط دائمًا النص `"food"`، وهو truthy. المقارنات تستخدم `===`. أدوات الفحص مثل ESLint تنبّه إلى هذا؛ فإن وضع محرّرك خطًا تحته فاقرأ التحذير.
:::

الشروط تتيح لـ Pocket أن يتفاعل مع قيمة واحدة. وفي الدرس التالي ستجعله يتعامل مع قيم كثيرة، واحدة تلو الأخرى، باستخدام حلقات التكرار.
