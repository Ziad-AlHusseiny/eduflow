---
summary: تقسّم برنامجًا متناميًا إلى وحدات (modules) باستخدام export وimport، وتحمّلها في المتصفّح بـ type="module" من خادم تطوير، وتنظّم Pocket في ملفات لكل منها مهمة واضحة.
takeaways:
  - الوحدة (module) ملف له نطاقه الخاص؛ ولا شيء فيه مرئي للملفات الأخرى ما لم يُصدَّر.
  - 'فضّل التصدير المسمّى (`export function formatMoney`)، فهو يحتفظ بالاسم نفسه في كل مكان ويسهل البحث عنه.'
  - 'في المتصفّح، حمّل ملف الدخول بـ `<script type="module">`، واستخدم مسارات نسبية مع الامتداد `.js`، وقدّم الملفات عبر http.'
  - 'في Node.js، تكون الملفات وحدات ES حين يحتوي أقرب `package.json` على `"type": "module"` أو حين ينتهي اسم الملف بـ `.mjs`.'
  - 'نظّم حسب المهمة: المنطق النقي في وحدات لا تمسّ الصفحة أبدًا، وملف دخول رفيع يربط المنطق والتخزين والـ DOM معًا.'
further:
  - title: JavaScript modules (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
  - title: export (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
  - title: "Modules: ECMAScript modules (Node.js)"
    url: https://nodejs.org/api/esm.html
quiz:
  - q: 'يقول console المتصفّح: `Uncaught SyntaxError: Cannot use import statement outside a module`. ما الحل؟'
    options:
      - text: 'غيّر اسم الملف من `.js` إلى `.mjs`.'
        why: المتصفّح لا يقرّر بحسب امتداد الملف. بل بحسب الطريقة التي يحمّل بها وسم السكربت الملف.
      - text: 'انقل أسطر `import` إلى أسفل الملف.'
        why: الاستيراد مسموح فقط داخل الوحدات، أينما ظهر. ونقله لا يجعل الملف وحدة.
      - text: 'غلّف تعليمات الاستيراد بدالة.'
        why: 'تعليمات `import` الثابتة يجب أن تكون في المستوى الأعلى من الوحدة؛ وداخل دالة تكون خطأً في الصياغة.'
      - text: 'حمّل ملف الدخول بـ `<script type="module" src="./main.js">`.'
        why: 'صحيح. دون `type="module"`، يشغّل المتصفّح الملف على أنه سكربت كلاسيكي، حيث `import` غير مسموحة.'
    answer: 3
  - q: 'يصرّح `money.js` بـ `function toCents(d) { … }` دون `export`. ماذا يحدث حين ينفّذ `main.js` السطر `import { toCents } from "./money.js";`؟'
    options:
      - text: يعمل، لأن كل الدوال في المستوى الأعلى مشتركة بين الوحدات.
        why: لكل وحدة نطاقها الخاص. ولا يمكن استيراد إلا الأسماء المُصدَّرة.
      - text: 'يفشل التحميل بخطأ SyntaxError يقول إن `money.js` لا يوفّر تصديرًا اسمه `toCents`.'
        why: صحيح. تُفحص تعليمات الاستيراد قبل تنفيذ أي كود، لذلك يُبلَّغ عن الخطأ فورًا.
      - text: 'يُستورد `toCents` على أنه `undefined` ويظهر الخطأ حين تستدعيه.'
        why: الاستيرادات المسمّاة تُربط قبل تنفيذ الكود؛ والتصدير المفقود يمنع شبكة الوحدات من التحميل أصلًا.
    answer: 1
  - q: 'تفتح `index.html` بالنقر المزدوج عليه، فيفشل سكربت الوحدة في التحميل بخطأ CORS. لماذا؟'
    options:
      - text: 'سكربتات الوحدات ممنوعة في صفحات `file://`، لذلك يجب تقديم الملفات عبر http، مثلًا عبر خادم تطوير.'
        why: صحيح. تطبّق المتصفّحات قواعد تحميل أكثر صرامة على الوحدات. وأي خادم محلي، مثل الذي يشغّله Vite، يحلّ المشكلة.
      - text: لا تعمل الوحدات إلا بعد نشر الموقع على الإنترنت.
        why: خادم محلي على حاسوبك يكفي. لا حاجة إلى النشر.
      - text: المتصفّح أقدم من أن يدعم الوحدات.
        why: 'كل المتصفّحات الحالية تدعم الوحدات منذ سنوات. المشكلة في المصدر `file://`، لا في المتصفّح.'
    answer: 0
---

صار لدى Pocket دوال مساعدة للمال، وتحقّق من المدخلات، وتخزين، وعرض، ومعالجات أحداث، وكود شبكة. وفي ملف واحد يعني هذا مئات الأسطر، تستطيع فيها كل دالة رؤية كل متغيّر، وتغيير جزء واحد يعني التمرير متجاوزًا كل الأجزاء الأخرى. البرامج الحقيقية تُقسَّم إلى ملفات، لكل منها مهمة واحدة، وطريقة JavaScript في ذلك هي **الوحدات** (modules).

## الوحدة ملف له نطاقه الخاص

في الوحدة، تكون المتغيّرات والدوال في المستوى الأعلى خاصة بذلك الملف. ولتشارك شيئًا، تُصدّره بـ `export`. ولتستخدم شيئًا من وحدة أخرى، تستورده بـ `import`:

```js title=src/money.js
export function toCents(dollars) {
  return Math.round(dollars * 100);
}

export function formatMoney(cents, symbol = "$") {
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

const SECRET_ROUNDING_NOTE = "not exported, so only this file can see it";
```

```js title=src/main.js
import { toCents, formatMoney } from "./money.js";

console.log(formatMoney(toCents(12.2)));
```

الأقواس المعقوفة تسرد **التصديرات المسمّاة** (named exports) التي تريدها. والمسار يبدأ بـ `./`، ومعناه "نسبةً إلى هذا الملف"، وفي المتصفّح يتضمّن الامتداد `.js`. أما `SECRET_ROUNDING_NOTE` فلا يمكن استيرادها أصلًا؛ وهذا هو المقصود. كل وحدة تقرّر ما تقدّمه، وكل ما عدا ذلك مخفي، مثل الـ closures في القسم 2 تمامًا، لكن على مستوى الملف.

صيغ أخرى ستراها:

```js title=src/main.js
import { formatMoney as fmt } from "./money.js";   // rename on import
import * as money from "./money.js";                // everything, as money.toCents etc.
```

وهناك أيضًا **التصدير الافتراضي** (default export)، واحد لكل ملف، يُستورد دون أقواس معقوفة وبأي اسم تحبّه: `export default function renderApp() {}` ثم `import renderApp from "./ui.js"`. كثير من الفرق تفضّل التصديرات المسمّاة، وكذلك هذه الدورة: فالتصدير المسمّى يحمل الاسم نفسه في كل ملف يستخدمه، لذلك يعمل البحث وإعادة التسمية التلقائية في محرّرك بشكل موثوق.

## تحميل الوحدات في المتصفّح

يُحمَّل ملف الدخول بـ `type="module"`، وهو يستورد كل ما عداه:

```html title=index.html
<script type="module" src="./src/main.js"></script>
```

تتصرّف سكربتات الوحدات بشكل مختلف قليلًا عن السكربتات الكلاسيكية التي استخدمتها حتى الآن. فهي مؤجَّلة تلقائيًا، فيكون الـ DOM جاهزًا حين تُنفَّذ. وتعمل في الوضع الصارم (strict mode)، الذي يحوّل بعض الأخطاء الصامتة إلى أخطاء ظاهرة. وكل وحدة تُنفَّذ **مرة واحدة**، مهما كان عدد الملفات التي تستوردها، لذلك يكون المتغيّر على مستوى الوحدة مشتركًا بين كل من يستوردها.

:::mistake فتح الصفحة من نظام الملفات
النقر المزدوج على `index.html` يفتحه من عنوان `file://`، والمتصفّحات ترفض تحميل سكربتات الوحدات من هناك: فتحصل على خطأ CORS في الـ console. قدّم المجلد عبر http بدلًا من ذلك. والطريقة المعتادة خادم تطوير: أنشئ مشروعًا بـ `npm create vite@latest` وشغّل `npm run dev`، أو شغّل `npx serve` داخل المجلد.
:::

عمليًا، تستخدم معظم المشاريع أداة بناء مثل Vite. إنها تقدّم وحداتك أثناء التطوير، وتتيح لك استيراد الحزم من npm بأسمائها (`import { something } from "some-package"`)، وعند البناء تحزم كل شيء في ملفات قليلة محسّنة. وصياغة `import` و`export` التي تكتبها هي نفسها تمامًا.

## الوحدات في Node.js

يدعم Node.js الصياغة نفسها. يُعامَل الملف على أنه وحدة ES حين يحتوي أقرب `package.json` على `"type": "module"`، أو حين ينتهي اسم الملف بـ `.mjs`. (والإصدارات الحديثة من Node.js تكتشف أيضًا صياغة `import` في ملف `.js` عادي، لكن ضبط `"type"` صراحةً أوضح.) وستصادف أيضًا نظام Node.js الأقدم، CommonJS، الذي يستخدم `require()` و`module.exports`؛ وما زال شائعًا في المشاريع القائمة، لكن الكود الجديد يستخدم `import` و`export`.

## تنظيم Pocket

التقسيم الجيد يتبع المهام، ويُبقي الأجزاء التي تتعامل مع العالم الخارجي منفصلة عن المنطق النقي:

:::figure وحدات Pocket ومن يستورد ماذا
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">يستورد main.js من ui.js وstorage.js وexpenses.js. ويستورد ui.js من money.js. أما expenses.js وmoney.js فمنطق نقي لا يمسّ الصفحة ولا التخزين أبدًا.</title>
  <rect class="d-box-primary" x="270" y="16" width="140" height="48" rx="10"/>
  <text class="d-code" x="340" y="46" text-anchor="middle">main.js</text>
  <rect class="d-box-accent" x="40" y="110" width="150" height="48" rx="10"/>
  <text class="d-code" x="115" y="140" text-anchor="middle">ui.js</text>
  <rect class="d-box-accent" x="265" y="110" width="150" height="48" rx="10"/>
  <text class="d-code" x="340" y="140" text-anchor="middle">storage.js</text>
  <rect class="d-box-success" x="490" y="110" width="150" height="48" rx="10"/>
  <text class="d-code" x="565" y="140" text-anchor="middle">expenses.js</text>
  <rect class="d-box-success" x="40" y="196" width="150" height="48" rx="10"/>
  <text class="d-code" x="115" y="226" text-anchor="middle">money.js</text>
  <path class="d-arrow" d="M300 64 L150 106" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 64 L340 106" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 64 L530 106" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M115 158 L115 192" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="420" y="214" text-anchor="middle">الأخضر: منطق نقي، بلا DOM ولا تخزين</text>
</svg>
:::

- `money.js`: `toCents` و`formatMoney`. نقية.
- `expenses.js`: `addExpense` و`removeExpense` و`totalCents` و`totalsByCategory` و`validateExpense`. نقية: بيانات تدخل، وبيانات تخرج.
- `storage.js`: `loadExpenses` و`saveExpenses`. الملف الوحيد الذي يعرف بوجود `localStorage`.
- `ui.js`: `renderExpenses` وغيرها من كود الـ DOM.
- `main.js`: نقطة الدخول. تحمّل البيانات، وتربط مستمعي الأحداث، وتستدعي البقية.

والقاعدة وراء هذا التقسيم: الاعتماديات تتّجه من الخارج إلى الداخل. `main.js` يعرف كل شيء؛ و`expenses.js` لا يعرف شيئًا سوى البيانات. وهذا يعني أنك تستطيع اختبار المنطق الأساسي، أو إعادة استخدامه في Node.js، دون متصفّح، وتستطيع لاحقًا استبدال `localStorage` بخادم بتغيير ملف واحد.

:::tip انتبه للاستيراد الدائري
إن استورد `a.js` من `b.js` واستورد `b.js` من `a.js`، فقد يُنفَّذ أحدهما قبل أن ينتهي الآخر من تعريف تصديراته، فتحصل على `undefined` محيّرة أو على أخطاء "cannot access before initialization". وحين يحدث ذلك، انقل الكود المشترك إلى وحدة ثالثة يستورد منها الاثنان.
:::

بيئة التجربة في هذه الدورة تشغّل ملفًا واحدًا في كل مرة، لذلك يدور التمرين أدناه حول قراءة كود الوحدات. وفي الدرس التالي ستتعرّف إلى طريقة أخرى لتنظيم الكود، هي الأصناف (classes)، التي تجمع البيانات مع الدوال التي تعمل عليها.
