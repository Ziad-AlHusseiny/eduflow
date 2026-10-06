---
summary: تتوقّع أين يمكن استخدام متغيّر ما (نطاق الكتلة ونطاق الدالة والنطاق العام)، وتتجنّب مزالق var القديمة، وتستخدم الـ closures لتمنح الدوال حالة خاصة تتذكّرها، مثل عدّاد للمعرّفات.
takeaways:
  - 'النطاق (scope) هو المكان الذي يمكن فيه استخدام اسم ما: `let` و`const` تعيشان في أقرب كتلة `{ }`، والبحث عن الأسماء يتّجه إلى الخارج، لا إلى الداخل أبدًا.'
  - الاسم الداخلي الذي يحمل اسم متغيّر خارجي "يحجبه" (shadowing) داخل النطاق الداخلي، وهذا مسموح لكن من السهل أن يُساء فهمه.
  - '`var` تتجاهل الكتل ويمتد نطاقها إلى الدالة كلها، وهذا يسبّب أخطاء كلاسيكية؛ استخدم `let` و`const`.'
  - الـ closure دالة تحتفظ بإمكانية الوصول إلى متغيّرات النطاق الذي أُنشئت فيه، حتى بعد أن تكون الدالة الخارجية قد انتهت.
  - كل استدعاء للدالة الخارجية يُنشئ مجموعة جديدة من المتغيّرات، لذلك يملك كل closure تُرجعه حالته الخاصة.
further:
  - title: Closures (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  - title: Scope (MDN glossary)
    url: https://developer.mozilla.org/en-US/docs/Glossary/Scope
  - title: var (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var
quiz:
  - q: |
      ماذا يحدث حين يُنفَّذ هذا الكود؟
      ```js
      function check(amount) {
        if (amount > 100) {
          const label = "big";
        }
        return label;
      }
      console.log(check(500));
      ```
    options:
      - text: يطبع `big`.
        why: 'صُرّح بـ `label` باستخدام `const` داخل كتلة `if`، لذلك لا وجود له خارج هذين القوسين.'
      - text: يطبع `undefined`.
        why: '`undefined` هي ما تعطيه `var` حين تُتخطّى كتلة `if`، كما في `check(50)`؛ بل إن `var` مع 500 كانت ستطبع `big`. أما مع `const` فالاسم لا وجود له خارج كتلته، لذلك استخدامه هناك خطأ.'
      - text: 'يرمي `ReferenceError: label is not defined`.'
        why: 'صحيح. نطاق الكتلة يعني أن `label` يختفي عند القوس المعقوف الذي يُغلق `if`، و`return label` لا تستطيع رؤيته.'
    answer: 2
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      function makeCounter() {
        let count = 0;
        return () => {
          count++;
          return count;
        };
      }
      const a = makeCounter();
      const b = makeCounter();
      a(); a();
      console.log(a(), b());
      ```
    options:
      - text: '`3 1`'
        why: 'صحيح. كل استدعاء لـ `makeCounter` يُنشئ `count` خاصًا به. استُدعيت `a` ثلاث مرات، و`b` مرة واحدة.'
      - text: '`3 4`'
        why: 'هذا يتطلّب `count` واحدًا مشتركًا. لكن كل استدعاء لـ `makeCounter` يُنشئ واحدًا منفصلًا.'
      - text: '`1 1`'
        why: '`count` لا يُعاد تصفيره مع كل استدعاء للدالة الداخلية؛ فالـ closure يُبقي المتغيّر نفسه حيًا بين الاستدعاءات.'
      - text: '`0 0`'
        why: 'كل استدعاء للدالة المُعادة ينفّذ `count++` قبل الإرجاع، لذلك يُرجع الاستدعاء الأول 1 أصلًا.'
    answer: 0
  - q: 'لماذا يُعدّ مولّد المعرّفات المبني على closure أكثر أمانًا من `let nextId = 1` عام؟'
    options:
      - text: الـ closures تعمل أسرع من المتغيّرات العامة.
        why: السرعة ليست المقصود والفرق لا يُذكر. الفائدة في التحكّم بمن يستطيع تغيير القيمة.
      - text: لا يستطيع أي كود خارج المولّد قراءة العدّاد أو تغييره، فلا يمكن تصفير المعرّفات أو تكرارها عن طريق الخطأ.
        why: صحيح. العدّاد يعيش داخل الـ closure فقط، والطريقة الوحيدة للتأثير فيه هي استدعاء الدالة التي أرجعتها.
      - text: المتغيّرات العامة تُحذف بعد كل استدعاء دالة.
        why: المتغيّرات العامة تعيش ما دامت الصفحة موجودة. وهذه بالضبط المشكلة، لأن أي كود يستطيع تغييرها في أي وقت.
    answer: 1
---

كل مصروف في Pocket يحتاج إلى معرّف (id) فريد كي تستطيع لاحقًا تعديله هو بالذات أو حذفه. والطريقة البديهية عدّاد في أعلى الملف:

```js
let nextId = 1;
function createId() {
  return `exp-${nextId++}`;
}
```

هذا يعمل، إلى أن يأتي جزء آخر من البرنامج، ربما ميزة "إعادة التعيين" كُتبت بعد أشهر، فيضبط `nextId = 1` من جديد، فتحصل على مصروفين باسم `exp-1`. العدّاد مرئي في كل مكان، لذلك يستطيع أي شيء أن يُفسده. ولكي تحميه، تحتاج إلى فهم **النطاق** (scope): قواعد المكان الذي يمكن أن يُرى فيه اسم ما.

## الكتل والدوال والنطاق العام

كل زوج من الأقواس المعقوفة يُنشئ **كتلة** (block)، وأسماء `let` و`const` تعيش في الكتلة التي صُرّح بها فيها. والدوال تُنشئ نطاقًا أيضًا. أما الأسماء المُصرَّح بها خارج كل الكتل والدوال فهي في **النطاق العام** (global scope)، ومرئية في كل مكان.

```js run
const appName = "Pocket";           // global

function describe(amount) {
  const size = amount > 10000 ? "big" : "small";   // function scope
  if (size === "big") {
    const warning = "Think twice";  // block scope
    console.log(appName, size, warning);
  }
  // console.log(warning) here would throw a ReferenceError
}

describe(12000);
```

حين يصادف المحرّك اسمًا، يبحث عنه في النطاق الحالي أولًا. فإن لم يجده هناك، بحث في النطاق المحيط، ثم في الذي يحيط به، وصولًا إلى النطاق العام. وإن لم يجده بعد ذلك، تحصل على `ReferenceError: … is not defined`. والبحث يتّجه **إلى الخارج** فقط: الكود داخل الدالة يستطيع قراءة `appName` العام، لكن الكود خارج الدالة لا يستطيع أبدًا رؤية `size`.

ولهذا جُعل سطر `warning` تعليقًا. فالكتلة التي صرّحت بـ `warning` انتهت، فاختفى الاسم.

:::figure النطاقات تتداخل، والبحث يتّجه إلى الخارج
<svg viewBox="0 0 640 250" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة صناديق متداخلة: النطاق العام يحمل appName، ونطاق الدالة describe يحمل amount وsize، وكتلة if تحمل warning. سهم من الكتلة الأعمق يشير إلى الخارج ليوضّح أن البحث يتّجه من النطاقات الداخلية إلى الخارجية.</title>
  <rect class="d-box" x="20" y="16" width="600" height="220" rx="14"/>
  <text class="d-label-strong" x="40" y="44">النطاق العام</text>
  <text class="d-code" x="470" y="44">appName</text>
  <rect class="d-box-accent" x="50" y="62" width="540" height="156" rx="12"/>
  <text class="d-label-strong" x="70" y="90">function describe</text>
  <text class="d-code" x="410" y="90">amount, size</text>
  <rect class="d-box-primary" x="80" y="110" width="300" height="88" rx="10"/>
  <text class="d-label-strong" x="100" y="138">كتلة if</text>
  <text class="d-code" x="100" y="172">warning</text>
  <path class="d-arrow" d="M380 160 L460 160 L460 102" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M470 102 L520 56" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="520" y="170" text-anchor="middle">ابحث إلى الخارج</text>
</svg>
:::

إذا صرّح نطاق داخلي باسم موجود أصلًا في الخارج، فإن الاسم الداخلي **يحجب** (shadows) الخارجي: داخل الكتلة، يعني الاسم المتغيّر الداخلي. هذا مسموح، لكن وجود شيئين مختلفين باسم واحد يجعل الكود صعب القراءة، فاختر أسماء مختلفة.

## مشكلة var

قبل عام 2015، لم يكن في JavaScript إلا `var`، و`var` تتجاهل الكتل: إنها مرئية في الدالة التي هي فيها بالكامل. وهذا يُنتج خطأً شهيرًا. هنا تجدول الحلقة ثلاث دوال لتُنفَّذ بعد لحظة باستخدام `setTimeout`:

```js run
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 0);
}
```

حلقة `var` تطبع `3` ثلاث مرات، لأن هناك `i` واحدًا فقط للحلقة كلها، وحين تُنفَّذ الدوال يكون قد بلغ 3. أما حلقة `let` فتطبع 0 و1 و2، لأن `let` تُنشئ `j` جديدًا في كل دورة، وكل دالة تحتفظ بنسختها الخاصة. وتذكّر هذه الدوال للمتغيّرات هو بالضبط ما يُسمّى closure.

:::mistake نسخ var من الشروحات القديمة
كثير من كود JavaScript على الإنترنت أقدم من `let` و`const`. حين تنسخ مقتطفًا يستخدم `var`، غيّره إلى `const` (أو `let` إن كان يُعاد إسناده)، وتأكّد أن لا شيء خارج الكتلة كان يعتمد على هذا التسرّب.
:::

## الـ Closures: دوال تتذكّر

الدالة التي تُنشأ داخل دالة أخرى تستطيع استخدام متغيّرات الدالة الخارجية. والمفاجأة أنها تحتفظ بهذا الوصول **بعد أن تنتهي الدالة الخارجية**:

```js run
function createIdGenerator(prefix) {
  let count = 0;
  return () => {
    count++;
    return `${prefix}-${count}`;
  };
}

const nextExpenseId = createIdGenerator("exp");
const nextCategoryId = createIdGenerator("cat");

console.log(nextExpenseId());
console.log(nextExpenseId());
console.log(nextCategoryId());
console.log(nextExpenseId());
```

تتبّع المحرّك. استدعاء `createIdGenerator("exp")` يُنشئ `prefix` و`count` جديدين، ويبني الدالة السهمية، ويُرجعها. في العادة تختفي متغيّرات الدالة حين تنتهي، لكن الدالة السهمية ما زالت تشير إلى `count` و`prefix`، فيبقيان حيّين، ملتصقين بها. وهذا الاقتران بين دالة والمتغيّرات التي وُلدت بجوارها هو ما يُسمّى **closure**.

كل استدعاء لـ `createIdGenerator` يُنشئ مجموعة جديدة منفصلة من المتغيّرات. ولهذا يبدأ `nextCategoryId()` من 1، وتستمر معرّفات المصاريف من حيث توقّفت.

والآن انظر إلى الأمان الذي كسبته. لا يوجد `count` عام. لا يستطيع أي كود آخر قراءته، ولا تصفيره، ولا ضبطه على قيمة مكرّرة. والطريقة الوحيدة للتأثير فيه هي استدعاء الدالة التي أُعطيت لك، وهي لا تستطيع إلا أن تدفعه إلى الأمام. هذه هي الطريقة المعتمدة لمنح دالة **حالة خاصة** (private state) في JavaScript.

:::why لماذا للـ closures كل هذه الأهمية
نادرًا ما ستكتب كلمة "closure" في الكود، لكنك ستستخدم واحدًا كل يوم. كل callback يقرأ متغيّرًا من الكود المحيط، وكل معالج نقرات في القسم 4 يحدّث قائمة، وكل دالة تتذكّر إعدادًا ما، هو closure. حين "يتذكّر" شيء ما قيمة، فهذه هي الآلية.
:::

يستطيع الـ closure أن يحمي أكثر من مجرّد عدّاد. هذه ميزانية لا يمكن أن تنقص إلا عبر الدالة التي تسلّمها:

```js run
function createBudget(limitCents) {
  let remaining = limitCents;
  return (spentCents) => {
    remaining -= spentCents;
    return remaining;
  };
}

const spend = createBudget(2000);
console.log(spend(450));
console.log(spend(1220));
```

اكتمل القسم 2: تستطيع الآن اتخاذ القرارات، وتكرار العمل، وحزمه في دوال لها حالتها الخاصة. وينتقل القسم 3 إلى البيانات، بدءًا بالقائمة التي كنت تمرّ عليها: المصفوفة.
