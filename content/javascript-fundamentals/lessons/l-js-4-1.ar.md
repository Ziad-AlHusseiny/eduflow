---
summary: تفهم الـ DOM على أنه شجرة الصفحة الحيّة في المتصفّح، وتحدّد العناصر بمحدّدات CSS، وتغيّر نصوصها وأصنافها وسماتها، وتعرض قائمة انطلاقًا من البيانات.
takeaways:
  - يحوّل المتصفّح كود HTML إلى الـ DOM، وهو شجرة من الكائنات؛ وتغيير هذه الكائنات بـ JavaScript يغيّر الصفحة فورًا.
  - '`querySelector` تُرجع أول عنصر يطابق محدّد CSS، أو `null`؛ و`querySelectorAll` تُرجع كل العناصر المطابقة.'
  - 'اضبط النص باستخدام `textContent` لا `innerHTML` كلما جاء المحتوى من البيانات أو من المستخدمين، كي لا يُنفَّذ أبدًا على أنه HTML.'
  - 'غيّر المظهر عبر `classList`، واترك لـ CSS أن تقرّر شكل هذه الأصناف.'
  - 'دالة `render` تُفرغ الحاوية وتعيد بناءها من بياناتك تُبقي الصفحة والبيانات متزامنتين.'
further:
  - title: Introduction to the DOM (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
  - title: Document.querySelector() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
  - title: Element.classList (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
quiz:
  - q: 'السطر `document.querySelector("#totl").textContent = "$0.00";` يرمي `TypeError: Cannot set properties of null`. ما السبب الأرجح؟'
    options:
      - text: المحدّد لم يطابق شيئًا، فأرجعت `querySelector` القيمة `null`.
        why: 'صحيح. خطأ إملائي في الـ id (`totl`)، أو تشغيل السكربت قبل وجود العنصر، كلاهما يُنتج `null`.'
      - text: لا يمكن ضبط `textContent` على الفقرات.
        why: 'يمكن ضبط `textContent` على أي عنصر. والخطأ يقول إن ما قبل `.textContent` كان `null`.'
      - text: يجب إعادة تحميل الصفحة بعد تغيير الـ DOM.
        why: تغييرات الـ DOM تظهر فورًا. لا حاجة إلى إعادة التحميل ولا رغبة فيها.
    answer: 0
  - q: 'يكتب مستخدم `<img src=x onerror=alert(1)>` تسميةً لمصروف. أيّ سطر يعرضها بأمان؟'
    options:
      - text: '`li.innerHTML = label;`'
        why: '`innerHTML` تحلّل النص على أنه HTML، فيُنشأ وسم الصورة ويُنفَّذ كود `onerror`. وهذه ثغرة XSS.'
      - text: '`li.textContent = label;`'
        why: 'صحيح. `textContent` تُدرج نصًا عاديًا، فيرى المستخدم الحروف التي كتبها ولا يُنفَّذ شيء.'
      - text: '`` li.innerHTML = `<span>${label}</span>`; ``'
        why: وضع التسمية داخل template literal ما زال يرسلها إلى محلّل HTML. والوسم الذي بداخلها يُنشأ مع ذلك.
    answer: 1
  - q: 'دالة `render` لديك تضيف `<li>` لكل مصروف. بعد إضافة مصروف رابع واستدعاء `render` مجددًا، تعرض القائمة سبعة عناصر. ما الناقص؟'
    options:
      - text: 'إفراغ القائمة قبل إعادة بنائها، مثلًا باستخدام `list.replaceChildren()`.'
        why: صحيح. دون الإفراغ، يضيف كل عرض نسخة كاملة جديدة بعد العناصر القديمة.
      - text: 'استدعاء `querySelectorAll` بدلًا من `querySelector`.'
        why: 'الحاوية عنصر واحد، لذلك `querySelector` صحيحة. المشكلة أن الأبناء القدامى لا يُزالون أبدًا.'
      - text: '`const` بدلًا من `let` لمصفوفة المصاريف.'
        why: طريقة التصريح بالمصفوفة لا تؤثّر في الـ DOM. والتكرار يأتي من عدم إزالة العناصر السابقة أبدًا.
    answer: 0
---

كل ما فعله Pocket حتى الآن حدث في الـ console. لكن المستخدم الحقيقي لا يفتح الـ console أبدًا؛ إنه يرى صفحة. وباقي هذا القسم ينقل Pocket إلى تلك الصفحة، وأول خطوة أن تتعلّم كيف ترى JavaScript صفحة الويب أصلًا.

## الـ DOM: الصفحة على شكل كائنات

حين يحمّل المتصفّح HTML، لا يحتفظ به نصًا. بل يبني شجرة من الكائنات، كائنًا لكل عنصر، ويرسم الصفحة من تلك الشجرة. هذه الشجرة هي **الـ DOM** (نموذج كائنات المستند، Document Object Model)، والكائن العام `document` هو جذرها.

```html title=index.html
<body>
  <h1>Pocket</h1>
  <p id="total">Total: $0.00</p>
  <ul id="expense-list"></ul>
  <script src="app.js" defer></script>
</body>
```

:::figure يحوّل المتصفّح HTML إلى شجرة من كائنات العناصر
<svg viewBox="0 0 640 230" role="img" aria-labelledby="t1">
  <title id="t1">شجرة الـ DOM لصفحة Pocket: يحتوي document على body، ويحتوي body على h1، وعلى p معرّفه total، وعلى ul معرّفه expense-list. تقرأ JavaScript هذه الكائنات وتغيّرها، فيعيد المتصفّح رسم الصفحة.</title>
  <rect class="d-box-accent" x="250" y="14" width="140" height="40" rx="10"/>
  <text class="d-code" x="320" y="39" text-anchor="middle">document</text>
  <rect class="d-box" x="260" y="80" width="120" height="40" rx="10"/>
  <text class="d-code" x="320" y="105" text-anchor="middle">body</text>
  <rect class="d-box" x="40" y="160" width="140" height="44" rx="10"/>
  <text class="d-code" x="110" y="187" text-anchor="middle">h1</text>
  <rect class="d-box-primary" x="250" y="160" width="140" height="44" rx="10"/>
  <text class="d-code" x="320" y="187" text-anchor="middle">p#total</text>
  <rect class="d-box-primary" x="460" y="160" width="160" height="44" rx="10"/>
  <text class="d-code" x="540" y="187" text-anchor="middle">ul#expense-list</text>
  <path class="d-line" d="M320 54 L320 80"/>
  <path class="d-line" d="M300 120 L110 160"/>
  <path class="d-line" d="M320 120 L320 160"/>
  <path class="d-line" d="M340 120 L540 160"/>
  <text class="d-label-muted" x="540" y="130" text-anchor="middle">JavaScript تغيّر هذه</text>
</svg>
:::

الـ DOM حيّ. غيّر كائنًا في الشجرة فيعيد المتصفّح رسم ذلك الجزء من الصفحة على الفور. وهذا كل ما يعنيه "تحديث الصفحة".

السمة `defer` تخبر المتصفّح أن يشغّل `app.js` بعد أن يبني الشجرة كلها. ودونها، يُنفَّذ السكربت الموجود في `<head>` قبل أن يوجد الـ body، فلا يجد أي بحث شيئًا. أما السكربتات المحمّلة بـ `type="module"`، التي ستتعرّف عليها في القسم 5، فتُؤجَّل تلقائيًا.

## تحديد العناصر

`document.querySelector(selector)` تأخذ محدّد CSS، أي الصياغة نفسها التي تكتبها في ملف الأنماط، وتُرجع أول عنصر مطابق. و`querySelectorAll` تُرجع كل العناصر المطابقة.

```js title=app.js
const totalEl = document.querySelector("#total");          // by id
const list = document.querySelector("#expense-list");
const firstItem = document.querySelector("#expense-list li");
const allItems = document.querySelectorAll("li.big");      // every match
```

`querySelectorAll` تُرجع NodeList. لها `forEach` وتعمل مع `for...of`؛ وانشرها، `[...allItems]`، حين تريد دوال المصفوفات مثل `map` و`filter`.

حين لا يطابق شيء، تُرجع `querySelector` القيمة `null`، فيرمي السطر التالي الذي يستخدم النتيجة `TypeError: Cannot set properties of null`. وهذا الخطأ يعني في الغالب خطأً إملائيًا في المحدّد أو سكربتًا نُفّذ مبكرًا جدًا.

## تغيير ما هو موجود

حين تحصل على عنصر، تصبح خصائصه أدوات التحكّم:

```js title=app.js
totalEl.textContent = "Total: $30.20";      // replace the text
totalEl.classList.add("over-budget");       // add a CSS class
totalEl.classList.toggle("highlight");      // add if absent, remove if present
totalEl.hidden = false;                     // show or hide
list.dataset.month = "2026-10";             // sets data-month="2026-10"
```

`textContent` تضبط نصًا عاديًا. وفضّل الأصناف (classes) على ضبط `style` مباشرة: فملف CSS يقرّر شكل `.over-budget`، وJavaScript تقرّر فقط *هل* يحمل العنصر هذا الصنف. وعندها يستطيع المصمّمون تغيير الشكل دون أن يمسّوا منطقك.

:::mistake innerHTML مع بيانات المستخدم
`li.innerHTML = expense.label` تسلّم التسمية إلى محلّل HTML. فإن كتب مستخدم `<img src=x onerror="…">` تسميةً، يُنفَّذ ذلك الكود في الصفحة. هذا يُسمّى البرمجة النصية عبر المواقع (XSS)، وهو من أكثر الأخطاء الأمنية شيوعًا على الويب. استخدم `textContent` لكل ما جاء من البيانات أو من مستخدم. واحتفظ بـ `innerHTML` للوسوم الثابتة التي كتبتها بنفسك.
:::

## إنشاء العناصر وعرض قائمة

لتضيف أشياء جديدة إلى الصفحة، أنشئ العناصر، واملأها، ثم ألحقها بالصفحة:

```js title=app.js
const li = document.createElement("li");
li.textContent = "Coffee: $4.50";
li.dataset.id = "exp-1";
list.append(li);
```

`createElement` تصنع عنصرًا ليس على الصفحة بعد. و`append` تُلحقه ابنًا أخيرًا لـ `list`، وعندها فقط يظهر. أما `element.remove()` فتُزيل عنصرًا من الصفحة.

لدى Pocket مصفوفة مصاريف ويحتاج إلى `<li>` لكل مصروف. وأنظف طريقة لإبقاء الصفحة والبيانات متّفقتين هي **دالة render** (دالة العرض): تُفرغ الحاوية، ثم تعيد بناءها من البيانات، في كل مرة تتغيّر فيها البيانات.

```js title=app.js
function renderExpenses(expenses) {
  list.replaceChildren(); // remove the old items
  for (const expense of expenses) {
    const li = document.createElement("li");
    li.textContent = `${expense.label}: ${formatMoney(expense.amount)}`;
    li.dataset.id = expense.id;
    if (expense.amount >= 10000) {
      li.classList.add("big");
    }
    list.append(li);
  }
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalEl.textContent = `Total: ${formatMoney(total)}`;
}
```

إعادة بناء كل شيء تبدو هدرًا، وهي كذلك مع آلاف العناصر. لكن مع عشرات العناصر في تطبيق شخصي، فهي سريعة، والأهم أنها بسيطة: هناك دالة واحدة فقط تقرّر شكل القائمة، ولا يمكن للصفحة أن تخرج عن تزامنها مع البيانات. وهذه الفكرة، أن الشاشة دالةٌ في البيانات، هي جوهر أطر العمل مثل React، التي تفعل الشيء نفسه بذكاء أكبر.

والقاعدة التي تجعل هذا ينجح هي الانضباط في الاتجاه. البيانات تسير في اتجاه واحد: غيّر المصفوفة، ثم استدعِ `renderExpenses`. لا تُصلح عنصر `<li>` واحدًا يدويًا "هذه المرة فقط"، ولا تقرأ المصاريف من الصفحة لتحسب شيئًا؛ فالصفحة صورة للبيانات، لا البيانات نفسها. وفي اللحظة التي يصبح فيها مكانان قادرين على تغيير ما على الشاشة، سيختلفان حتمًا في يوم ما.

:::tip استكشف أي صفحة في DevTools
افتح DevTools في أي موقع، واختر عنصرًا في لوحة Elements، ثم اكتب `$0` في الـ Console. `$0` هو العنصر الذي اخترته، فتستطيع تجربة `$0.textContent` أو `$0.classList` على صفحات حقيقية.
:::

صارت الصفحة تعرض بيانات Pocket، لكنها لا تستطيع التفاعل مع المستخدم بعد. الدرس التالي: الأحداث.
