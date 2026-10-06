---
summary: تتعرّف على أنواع القيم الأساسية في JavaScript، وتفحصها باستخدام typeof، وتخزّن القيم في متغيّرات باستخدام const وlet، وتختار المناسب منهما في كل مرة.
takeaways:
  - 'لكل قيمة نوع؛ والأنواع الأساسية هي number وstring وboolean وundefined وnull، و`typeof` تخبرك بنوع القيمة التي بين يديك.'
  - المتغيّر اسم يشير إلى قيمة؛ النوع للقيمة، لا للمتغيّر.
  - 'صرّح بالمتغيّر باستخدام `const` افتراضيًا، ولا تنتقل إلى `let` إلا حين يجب أن يشير الاسم إلى قيمة أخرى لاحقًا.'
  - 'إعادة إسناد قيمة لـ `const` ترمي خطأ TypeError، واستخدام اسم قبل التصريح به يرمي خطأ ReferenceError.'
further:
  - title: JavaScript data types and data structures (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures
  - title: let (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
  - title: const (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
quiz:
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      let total = 10;
      total = total + 5;
      console.log(typeof total, total);
      ```
    options:
      - text: '`number 10`'
        why: 'السطر الثاني يحسب `10 + 5` ويجعل `total` يشير إلى الناتج، فتختفي القيمة القديمة 10.'
      - text: '`string 15`'
        why: القيمتان رقمان ولا توجد أي علامات تنصيص، لذلك الناتج رقم وليس نصًا.
      - text: '`number 15`'
        why: 'صحيح. يُحسب الطرف الأيمن أولًا (10 + 5)، ثم يُوجَّه `total` إلى 15، وهي رقم.'
    answer: 2
  - q: 'تخزّن اسم التطبيق، `"Pocket"`، وهو لا يتغيّر أبدًا، وعدد المصاريف المُدخلة حتى الآن، وهو يزداد. أيّ التصريحات أنسب؟'
    options:
      - text: '`let` للاثنين، كي لا تصادف أي خطأ.'
        why: 'هذا يعمل، لكنه يُضيّع إشارة مفيدة. `const` تخبر القارئ، والمحرّك، أن هذا الاسم لن يتحرّك أبدًا.'
      - text: '`const` لاسم التطبيق و`let` للعدد.'
        why: 'صحيح. الاسم ثابت، إذن `const`؛ والعدد يُعاد إسناده كلما زاد، إذن `let`.'
      - text: '`const` للاثنين، وغيّر العدد بكتابة `count + 1`.'
        why: 'كتابة `count + 1` وحدها تحسب رقمًا جديدًا لكنها لا تخزّنه في أي مكان. وتخزينه يحتاج إلى إعادة إسناد، وهو ما تمنعه `const`.'
      - text: '`var` للاثنين، لأنها تعمل في كل المتصفّحات.'
        why: '`let` و`const` تعملان في كل المتصفّحات منذ سنوات. أما `var` فلها قواعد نطاق مربكة، ويتجنّبها الكود الحديث.'
    answer: 1
  - q: 'ماذا تُرجع `typeof null`؟'
    options:
      - text: '`"null"`'
        why: هذا منطقي، لكنه ليس ما تفعله JavaScript. الإجابة الحقيقية خطأ تاريخي أُبقي عليه حفاظًا على التوافق.
      - text: '`"undefined"`'
        why: '`undefined` و`null` قيمتان مختلفتان، ولكل منهما نتيجة مختلفة مع `typeof`.'
      - text: '`"object"`'
        why: 'صحيح. إنه خطأ من الإصدار الأول لـ JavaScript، ولا يمكن إصلاحه دون أن تتعطّل مواقع قديمة. لتفحص null، اكتب `value === null`.'
    answer: 2
  - q: 'أيّ سطر يرمي الخطأ `TypeError: Assignment to constant variable.`؟'
    options:
      - text: '`const rate = 5; rate = 6;`'
        why: 'صحيح. `const` تُنشئ اسمًا لا يمكن توجيهه إلى قيمة أخرى أبدًا، لذلك تفشل التعليمة الثانية.'
      - text: '`let rate = 5; rate = 6;`'
        why: '`let` موجودة تحديدًا كي تستطيع إعادة الإسناد. هذا الكود يعمل بلا مشاكل وتنتهي قيمة `rate` إلى 6.'
      - text: '`const rate = 5; const next = rate + 1;`'
        why: 'هذا يقرأ `rate` دون أن يغيّره، ويخزّن الناتج في اسم جديد. لا توجد أي إعادة إسناد.'
    answer: 0
---

يحتاج Pocket إلى أن يتذكّر أشياء: اسم التطبيق، وكم أنفقت اليوم، وهل تجاوزت ميزانيتك. يتذكّر البرنامج بأن يحتفظ بـ **قيم** ويمنحها **أسماء**. وقبل أن تفعل أي شيء مثير، عليك أن تعرف أنواع القيم الموجودة وكيف تسمّيها.

## القيم وأنواعها

القيمة قطعة واحدة من البيانات. ولكل قيمة **نوع بيانات** (type)، وهو الذي يحدّد ما يمكنك فعله بها. هذه الأنواع الخمسة تغطّي معظم ما ستتعامل معه في أسابيعك الأولى:

| النوع | أمثلة | يُستخدم لـ |
|---|---|---|
| number | `42`، `4.5`، `-3` | المبالغ والأعداد والقياسات |
| string | `"Coffee"`، `'food'` | أي نص |
| boolean | `true`، `false` | إجابات نعم/لا |
| undefined | `undefined` | "لم تُعطَ أي قيمة بعد" |
| null | `null` | "فارغ عن قصد" |

العامل `typeof` يخبرك بنوع أي قيمة. شغّل هذا الكود وقارن كل سطر بالجدول:

```js run
console.log(typeof 42);
console.log(typeof "Coffee");
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);
```

أربع إجابات تطابق الجدول. أما الأخيرة فتقول `"object"`، وهذا خطأ يعود إلى عام 1995 ولا يمكن إصلاحه أبدًا لأن ملايين المواقع تعتمد عليه. حين تحتاج إلى معرفة إن كان شيء ما `null`، قارنه بها مباشرة: `value === null`.

هناك نوعان أساسيان آخران: bigint (للأعداد الصحيحة الضخمة) وsymbol (للعلامات الفريدة)، ونادرًا ما ستحتاجهما كمبتدئ. وكل ما عدا ذلك، مثل القوائم والسجلّات، هو **كائن** (object)، والقسم 3 مخصّص لها بالكامل.

## تسمية القيم باستخدام const وlet

**المتغيّر** (variable) اسم يشير إلى قيمة. تُنشئه بـ **تصريح** (declaration):

```js run
const appName = "Pocket";
let spentToday = 0;

spentToday = spentToday + 4.5;
spentToday = spentToday + 12;

console.log(appName, "spent today:", spentToday);
```

اقرأ السطر 4 كما يقرؤه المحرّك: أولًا يحسب الطرف الأيمن، `spentToday + 4.5`، أي `0 + 4.5`، فالناتج `4.5`. ثم يوجّه الاسم `spentToday` إلى هذه القيمة الجديدة. علامة `=` تعني "اجعل هذا الاسم يشير إلى"، وليس "يساوي". ولهذا تجد `x = x + 1` منطقية في الكود مع أنها هراء في الرياضيات.

:::figure إعادة إسناد let تنقل الاسم إلى قيمة جديدة
<svg viewBox="0 0 640 210" role="img" aria-labelledby="t1">
  <title id="t1">الاسم appName يشير إلى النص Pocket ولا يمكنه التحرّك أبدًا. أما الاسم spentToday فيشير أولًا إلى 0، ثم إلى 4.5، ثم إلى 16.5، وكل إعادة إسناد تنقل السهم إلى قيمة جديدة.</title>
  <rect class="d-box-primary" x="20" y="30" width="150" height="44" rx="10"/>
  <text class="d-code" x="95" y="57" text-anchor="middle">const appName</text>
  <path class="d-arrow" d="M170 52 L250 52" marker-end="url(#arrow)"/>
  <rect class="d-box" x="254" y="30" width="120" height="44" rx="10"/>
  <text class="d-code" x="314" y="57" text-anchor="middle">"Pocket"</text>
  <rect class="d-box-primary" x="20" y="130" width="150" height="44" rx="10"/>
  <text class="d-code" x="95" y="157" text-anchor="middle">let spentToday</text>
  <rect class="d-box" x="254" y="130" width="80" height="44" rx="10"/>
  <text class="d-code" x="294" y="157" text-anchor="middle">0</text>
  <rect class="d-box" x="364" y="130" width="80" height="44" rx="10"/>
  <text class="d-code" x="404" y="157" text-anchor="middle">4.5</text>
  <rect class="d-box-success" x="474" y="130" width="90" height="44" rx="10"/>
  <text class="d-code" x="519" y="157" text-anchor="middle">16.5</text>
  <path class="d-dashed" d="M170 140 L254 140"/>
  <path class="d-dashed" d="M170 148 Q290 110 364 140"/>
  <path class="d-arrow" d="M170 162 Q340 205 474 162" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="520" y="110" text-anchor="middle">القيمة الحالية</text>
</svg>
:::

`const` تُنشئ اسمًا لا يمكن توجيهه إلى أي مكان آخر أبدًا، و`let` تُنشئ اسمًا يمكن توجيهه. اتّبع هذه القاعدة: **صرّح بـ `const` افتراضيًا، ولا تغيّرها إلى `let` إلا حين تكتشف أنك تحتاج إلى إعادة الإسناد.** معظم الأسماء في البرامج الحقيقية لا تتغيّر أبدًا، و`const` تخبر القارئ التالي أن بإمكانه التوقّف عن القلق بشأنها.

سترى أيضًا كلمة مفتاحية ثالثة، `var`، في الشروحات القديمة وإجابات Stack Overflow. إنها الطريقة الأصلية للتصريح بالمتغيّرات، ولها قواعد نطاق تسبّب أخطاء (سترى السبب في درس النطاق). الكود الحديث لا يستخدمها.

:::mistake إعادة إسناد const
```js
const total = 0;
total = total + 4.5; // TypeError: Assignment to constant variable.
```
يتوقّف البرنامج عند هذا السطر. إن كان لا بدّ أن تتغيّر القيمة فعلًا، فصرّح بها باستخدام `let`. وإن كنت تقصد الاحتفاظ بالقيمة القديمة وصنع قيمة جديدة، فامنح الجديدة اسمًا خاصًا بها: `const newTotal = total + 4.5;`.
:::

## النوع للقيمة، لا للمتغيّر

في JavaScript لا يملك المتغيّر نوعًا خاصًا به. إنه يشير إلى قيمة، والقيمة هي التي لها نوع. لذلك يمكن لمتغيّر `let` أن يشير إلى رقم الآن وإلى نص لاحقًا:

```js run
let note = 12;
console.log(typeof note);
note = "twelve dollars";
console.log(typeof note);
```

تُسمّى هذه المرونة **الكتابة الديناميكية للأنواع** (dynamic typing). إنها مريحة، وهي أيضًا بداية كثير من أخطاء المبتدئين: يتحوّل رقم إلى نص بصمت، فيصبح مجموعك `"1212"`. يُريك الدرسان التاليان متى يحدث ذلك بالضبط.

## الأسماء: القواعد والعادات

القواعد: يمكن أن يحتوي الاسم على حروف وأرقام و`_` و`$`، ولا يجوز أن يبدأ برقم، ولا أن يكون كلمة محجوزة مثل `const` أو `if`. والأسماء حسّاسة لحالة الأحرف، فـ `total` و`Total` متغيّران مختلفان.

أما العادات التي يتّبعها كل مشروع JavaScript: اكتب الأسماء بأسلوب **camelCase** (`spentToday`، `monthlyBudget`)، واجعلها تقول ما تعنيه القيمة، لا ما نوعها. `spentToday` أفضل من `num1`، و`isOverBudget` أفضل من `flag`. وأسماء القيم المنطقية (booleans) تبدأ عادةً بـ `is` أو `has` أو `can`.

خطآن ستقابلهما أثناء التدرّب:

- `ReferenceError: spent is not defined` يعني أنك استخدمت اسمًا لم يُصرَّح به قط، وغالبًا بسبب خطأ إملائي.
- `ReferenceError: Cannot access 'spent' before initialization` يعني أنك استخدمت متغيّر `let` أو `const` في سطر يسبق التصريح به. صرّح أولًا، ثم استخدم.

في الدرس التالي تبدأ إجراء العمليات الحسابية على أرقامك، وستكتشف لماذا لا تساوي `0.1 + 0.2` القيمة `0.3` تمامًا.
