---
summary: تحوّل البيانات إلى نص JSON وبالعكس باستخدام JSON.stringify وJSON.parse، وتعرف ما لا يستطيع JSON حمله، وتحفظ مصاريف Pocket وتحمّلها من localStorage بأمان.
takeaways:
  - 'JSON صيغة نصية للبيانات؛ `JSON.stringify` تحوّل القيم إلى نص JSON، و`JSON.parse` تعيد نص JSON إلى قيم.'
  - 'يحمل JSON النصوص والأرقام والقيم المنطقية وnull والمصفوفات والكائنات البسيطة؛ أما الدوال و`undefined` فتُسقط، والتواريخ تصبح نصوصًا.'
  - '`localStorage` لا تخزّن إلا النصوص، لكل موقع على حدة، في متصفّح المستخدم؛ احفظ باستخدام `setItem(key, JSON.stringify(data))`.'
  - 'يجب أن ينجو التحميل من غياب المفتاح (`getItem` تُرجع `null`) ومن النص التالف (`JSON.parse` ترمي خطأ)، لذلك ضعه داخل `try`/`catch` مع قيمة بديلة.'
further:
  - title: Working with JSON (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
  - title: JSON.stringify() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
  - title: Window.localStorage (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
quiz:
  - q: 'استُدعيت `localStorage.setItem("expenses", expenses)` مع مصفوفة من الكائنات. ما الذي يُخزَّن؟'
    options:
      - text: 'النص `"[object Object],[object Object]"`.'
        why: 'صحيح. كل كائن يتحوّل إلى "[object Object]" فتضيع البيانات. خزّن `JSON.stringify(expenses)` بدلًا من ذلك.'
      - text: المصفوفة، جاهزة للاستخدام حين تقرؤها مجددًا.
        why: '`localStorage` لا تخزّن إلا النصوص. وكل ما عدا ذلك يُحوَّل أولًا بـ `String()`.'
      - text: لا شيء؛ `setItem` ترمي خطأ مع القيم غير النصية.
        why: لا ترمي أي خطأ. إنها تحوّل القيمة إلى نص بصمت، ولهذا يسهل أن يفوتك هذا الخطأ.
    answer: 0
  - q: 'ماذا يُنتج `JSON.stringify({ label: "Tea", note: undefined, amount: 300 })`؟'
    options:
      - text: '`{"label":"Tea","amount":300}`'
        why: 'صحيح. الخصائص التي قيمتها `undefined` (والدوال) تُحذف، لأن JSON لا يملك طريقة لكتابتها.'
      - text: '`{"label":"Tea","note":undefined,"amount":300}`'
        why: '`undefined` ليست JSON صالحًا، لذلك لا تكتبها `stringify` أبدًا داخل كائن.'
      - text: '`{"label":"Tea","note":null,"amount":300}`'
        why: '`stringify` تُسقط خصائص `undefined` بدلًا من تحويلها إلى null. وحدها `null` نفسها تُكتب null.'
    answer: 0
  - q: 'يحمّل Pocket البيانات بـ `JSON.parse(localStorage.getItem("pocket.expenses"))` في الزيارة الأولى، ولم يُحفظ شيء بعد. ماذا يحدث؟'
    options:
      - text: يرمي خطأ، لأن `getItem` ترمي خطأ مع المفاتيح غير المعروفة.
        why: '`getItem` تُرجع `null` للمفتاح المفقود؛ ولا ترمي خطأ.'
      - text: 'يُرجع `null`، لأن `JSON.parse(null)` تعامل null على أنها نص JSON "null".'
        why: 'صحيح. ثم ينهار الكود لاحقًا حين يستدعي `.map` على `null`. استخدم قيمة بديلة بـ `?? []` أو بفحص صريح.'
      - text: يُرجع مصفوفة فارغة.
        why: لا شيء هنا يُنشئ مصفوفة. عليك أن توفّر القيمة البديلة، المصفوفة الفارغة، بنفسك.
    answer: 1
---

أضف ثلاثة مصاريف إلى Pocket، ثم أعِد تحميل الصفحة، وستجدها اختفت. كل ما بنيته يعيش في متغيّرات JavaScript، والمتغيّرات لا تعيش إلا ما دامت الصفحة. ولكي تتذكّر البيانات بين الزيارات، تحتاج إلى تخزينها في مكان ما، وأبسط مكان تستطيع صفحة ويب أن تخزّن فيه البيانات هو متصفّح المستخدم نفسه. لكن أولًا، يجب أن تتحوّل البيانات إلى نص.

## JSON: البيانات على شكل نص

**JSON** (اختصار JavaScript Object Notation) صيغة نصية للبيانات. يكاد شكلها يطابق صيغة كتابة الكائنات والمصفوفات في JavaScript، وهذا ليس مصادفة، وهي اليوم الصيغة الأكثر شيوعًا لإرسال البيانات بين البرامج على الويب.

```js run
const expenses = [
  { id: "exp-1", label: "Coffee", amount: 450, tags: ["work"] },
  { id: "exp-2", label: "Train", amount: 1220, tags: [] },
];

const text = JSON.stringify(expenses);
console.log(typeof text);
console.log(text);

const back = JSON.parse(text);
console.log(back[1].label, back === expenses);
```

`JSON.stringify` تحوّل قيمة إلى نص JSON. و`JSON.parse` تقرأ نص JSON وتبني منه قيمًا جديدة. والنتيجة نسخة جديدة بالمحتويات نفسها، ولهذا تكون `back === expenses` تساوي `false`.

قواعد JSON أكثر صرامة من قواعد JavaScript: أسماء الخصائص يجب أن تكون بين علامات تنصيص مزدوجة، والنصوص لا تستخدم إلا العلامات المزدوجة، والفواصل الزائدة في النهاية غير مسموحة. نادرًا ما تكتب JSON يدويًا، لكن حين تفعل، تسبّب هذه القواعد الثلاث معظم أخطاء التحليل. وللحصول على نسخة مقروءة، تُزيح `JSON.stringify(value, null, 2)` المخرجات بمسافتين.

### ما لا يستطيع JSON حمله

يعرف JSON النصوص والأرقام والقيم المنطقية و`null` والمصفوفات والكائنات البسيطة. وكل ما عدا ذلك يتغيّر أو يضيع في الطريق:

```js run
const tricky = {
  when: new Date("2026-10-05T09:30:00Z"),
  note: undefined,
  format() { return "hi"; },
  tags: new Set(["work"]),
  ratio: NaN,
};
console.log(JSON.stringify(tricky));
```

التواريخ تصبح نصوصًا بصيغة ISO ولا تعود تواريخ، وخصائص `undefined` والدوال تُسقط، والـ Sets والـ Maps تصبح كائنات فارغة، و`NaN` تصبح `null`. ويتجنّب Pocket كل هذا بالتصميم: المبالغ أعداد صحيحة، والتواريخ تُخزَّن نصوصًا مثل `"2026-10-05"`، والفئات نصوص بسيطة. واختيار بيانات تناسب JSON منذ البداية يوفّر كثيرًا من كود التحويل لاحقًا.

:::mistake التحليل دون شبكة أمان
ترمي `JSON.parse` خطأ `SyntaxError` حين لا يكون النص JSON صالحًا، مثل قيمة كُتب نصفها، أو شيء خزّنه سكربت آخر تحت المفتاح نفسه. وإن حدث ذلك أثناء بدء تطبيقك، يفشل التطبيق كله في التحميل. وكل تحليل لنص لم تُنشئه أنت للتوّ مكانه داخل `try`/`catch`.
:::

## localStorage: مخزن صغير في المتصفّح

يحصل كل موقع على مخزن صغير للمفاتيح والقيم في متصفّح كل مستخدم، اسمه `localStorage`. إنه ينجو من إعادة التحميل ومن إعادة تشغيل المتصفّح، ولا يحمل **إلا النصوص**:

```js title=storage.js
localStorage.setItem("pocket.theme", "dark");
console.log(localStorage.getItem("pocket.theme")); // "dark"
console.log(localStorage.getItem("nothing-here")); // null
localStorage.removeItem("pocket.theme");
```

لتخزين مصفوفة مصاريف، حوّلها إلى JSON عند الإدخال وحلّلها عند الإخراج:

:::figure الحفظ والتحميل يمرّان عبر نص JSON
<svg viewBox="0 0 680 200" role="img" aria-labelledby="t1">
  <title id="t1">الحفظ: تتحوّل مصفوفة المصاريف إلى نص JSON باستخدام JSON.stringify وتُخزَّن باستخدام setItem. التحميل: تُرجع getItem النص، وتعيده JSON.parse إلى مصفوفة جديدة.</title>
  <rect class="d-box-primary" x="10" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="85" y="96" text-anchor="middle">expenses</text>
  <text class="d-label-muted" x="85" y="116" text-anchor="middle">مصفوفة كائنات</text>
  <rect class="d-box" x="265" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="340" y="96" text-anchor="middle">نص JSON</text>
  <text class="d-code" x="340" y="116" text-anchor="middle">'[{"id":…}]'</text>
  <rect class="d-box-accent" x="520" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="595" y="104" text-anchor="middle">localStorage</text>
  <path class="d-arrow" d="M160 82 L261 82" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M415 82 L516 82" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M516 114 L419 114" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M261 114 L164 114" marker-end="url(#arrow)"/>
  <text class="d-code" x="212" y="60" text-anchor="middle">stringify</text>
  <text class="d-code" x="467" y="60" text-anchor="middle">setItem</text>
  <text class="d-code" x="467" y="150" text-anchor="middle">getItem</text>
  <text class="d-code" x="212" y="150" text-anchor="middle">parse</text>
</svg>
:::

```js title=storage.js
const STORAGE_KEY = "pocket.expenses.v1";

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadExpenses() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    const data = text === null ? [] : JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
```

`loadExpenses` دفاعية عن قصد، لأنها تُنفَّذ مع كل تحميل للصفحة ويجب ألّا تُسقط التطبيق أبدًا. الزائر لأول مرة لم يحفظ شيئًا، فتُرجع `getItem` القيمة `null` ونبدأ بقائمة فارغة. والنص التالف يجعل `JSON.parse` ترمي خطأ، فتلجأ `catch` إلى قائمة فارغة. وبعض أوضاع الخصوصية في المتصفّحات تمنع التخزين كليًا، وهذا يرمي خطأ أيضًا يذهب إلى `catch` نفسها. وأخيرًا، تحمي `Array.isArray` من JSON صالح لكن بشكل خاطئ. والجزء `.v1` في المفتاح يتيح لإصدار مستقبلي من Pocket أن يغيّر صيغة البيانات وينقل البيانات القديمة بدلًا من أن يسيء قراءتها.

ثم اربط كل ذلك: حمّل مرة واحدة عند البدء، واحفظ في كل مرة تتغيّر فيها البيانات، في المكان نفسه الذي تستدعي فيه `renderExpenses` أصلًا:

```js title=app.js
let expenses = loadExpenses();
renderExpenses();

function setExpenses(next) {
  expenses = next;
  saveExpenses(expenses);
  renderExpenses();
}
```

تمرير كل تغيير عبر دالة واحدة `setExpenses` يعني أنك لا تستطيع أن تنسى الحفظ في معالج حدث وتتذكّره في آخر.

لترى ما هو مخزّن، افتح DevTools، واذهب إلى لوحة Application في Chrome أو Edge (أو Storage في Firefox)، ووسّع Local Storage. يمكنك هناك قراءة المدخلات وتعديلها وحذفها، وهذه أسرع طريقة لاختبار ما يفعله تطبيقك مع البيانات المفقودة أو التالفة. وهناك أيضًا `sessionStorage`، بالدوال نفسها، وتُمسح حين يُغلق التبويب.

:::why اعرف الحدود
مساحة `localStorage` نحو 5 ميغابايت لكل موقع، وهي متزامنة (فالحفظ الضخم يحجب الصفحة لحظة)، ويستطيع أي سكربت يعمل في موقعك قراءتها. إنها مناسبة للتفضيلات ولبيانات تطبيق شخصي. وغير مناسبة لكلمات المرور أو الـ tokens أو أي شيء حسّاس، ولا للبيانات التي يجب أن تتبع المستخدم إلى جهاز آخر، فتلك تحتاج إلى خادم.
:::

صار بإمكانك الاحتفاظ بالبيانات بين الزيارات. والمصدر الكبير الآخر للبيانات هو خادم على الإنترنت، والتحدّث إليه يعني انتظار الإجابة. والانتظار هو موضوع الدرس التالي.
