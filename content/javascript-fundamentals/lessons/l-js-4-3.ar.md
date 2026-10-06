---
summary: تتعامل مع حدث submit في النموذج دون إعادة تحميل الصفحة، وتقرأ قيمه وتحوّلها، وتتحقّق منها بسمات HTML وبدالة تكتبها بنفسك، وتعرض رسائل خطأ واضحة ويسهل الوصول إليها.
takeaways:
  - 'استمع إلى `submit` على النموذج، لا إلى `click` على الزر، كي تمرّ كل طرق الإرسال (الزر، ومفتاح Enter، والتقنيات المساعدة) عبر كودك، واستدعِ `event.preventDefault()` لتمنع إعادة تحميل الصفحة.'
  - كل قيمة تُقرأ من نموذج هي نص؛ شذّب النصوص وحوّل الأرقام قبل استخدامها.
  - أبقِ التحقّق من المدخلات في دالة نقية تأخذ القيم وتُرجع الأخطاء، كي تكون القواعد سهلة القراءة والاختبار.
  - 'سمات HTML مثل `required` و`min` طبقة أولى مفيدة، لكن يجب أن يتحقّق كود JavaScript أيضًا، وأن يتحقّق الخادم كذلك.'
  - 'اعرض الأخطاء بجوار الحقل، وعلّمه بـ `aria-invalid`، وانقل التركيز إليه كي ينتبه مستخدمو لوحة المفاتيح وقارئات الشاشة.'
further:
  - title: Client-side form validation (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
  - title: FormData (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/FormData
  - title: "HTMLFormElement: submit event (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
quiz:
  - q: 'تُلحق منطق "إضافة مصروف" بحدث `click` على زر الحفظ. ما الذي يتعطّل؟'
    options:
      - text: معالج النقر لا يغطّي إلا طريقًا واحدًا للإرسال، ويظل النموذج يُرسَل بالطريقة الأصلية بعده فيُعاد تحميل الصفحة.
        why: 'صحيح. يمكن إرسال النماذج أيضًا عبر `form.requestSubmit()`، أو ببعض التقنيات المساعدة، أو بالضغط على Enter في نموذج ليس فيه زر إرسال، ومعالج النقر لا يلغي الإرسال الأصلي. أما الاستماع إلى `submit` على النموذج فيلتقط كل الطرق، و`preventDefault()` هناك تمنع إعادة التحميل.'
      - text: لا شيء؛ `click` و`submit` قابلان للتبادل.
        why: 'إنهما حدثان مختلفان. `submit` يقع على النموذج أيًّا كانت طريقة إرساله؛ أما النقر على الزر فليس إلا إحدى الطرق التي قد يبدأ بها الإرسال.'
      - text: لا يعود بالإمكان التركيز على الزر بلوحة المفاتيح.
        why: إضافة مستمع لا تغيّر سلوك التركيز. المشكلة في مسار الإرسال الذي لا تتعامل معه.
    answer: 0
  - q: 'حقل أرقام يحتوي على `12.50`. ما قيمة `input.value`؟'
    options:
      - text: الرقم `12.5`.
        why: 'حتى مع `type="number"`، تكون `value` نصًا دائمًا. استخدم `Number(input.value)` أو `input.valueAsNumber`.'
      - text: النص `"12.50"`.
        why: 'صحيح. قيم النماذج نصوص، لذلك حوّلها قبل أي عملية حسابية، وإلا فستلصق `+` النصوص.'
      - text: '`NaN`، إلى أن يُرسل النموذج.'
        why: 'القيمة متاحة في أي وقت، وهي النص الموجود في الحقل، لا `NaN`.'
    answer: 1
  - q: 'في نموذجك سمتا `required` و`min="0.01"` على حقل المبلغ. لماذا تتحقّق مجددًا في JavaScript؟'
    options:
      - text: المتصفّحات تتجاهل سمات التحقّق في HTML على حقول الأرقام.
        why: المتصفّحات تحترمها. والفحوص الإضافية تتعلّق بقواعد لا تستطيع HTML التعبير عنها، وبعدم الثقة بأي طبقة منفردة.
      - text: التحقّق في HTML مهجور لصالح JavaScript.
        why: التحقّق المدمج حديث ومفيد. إنه طبقة أولى، لا بديل عن فحوصك الخاصة.
      - text: بعض القواعد (مثل "لا أكثر من منزلتين عشريتين" أو "التسمية ليست مسافات فقط") تحتاج إلى كود، ويمكن حذف السمات من DevTools.
        why: صحيح. عامل التحقّق في HTML على أنه وسيلة لراحة المستخدمين، واجعل الخادم المرجع النهائي لكل ما هو مهم.
    answer: 2
---

يحتاج Pocket إلى طريقة لإضافة المصاريف غير زر "عيّنة": نموذج (form) فيه تسمية ومبلغ وفئة. تبدو النماذج بسيطة، لكنها المكان الذي يعيش فيه كثير من الأخطاء الحقيقية، لأنها تقف على الحدّ الفاصل بين البشر، الذين يكتبون أي شيء، وكودك، الذي يتوقّع بيانات نظيفة.

## النموذج وحدث submit

ابدأ بـ HTML سليم. لكل حقل `<label>`، والزر زر إرسال داخل `<form>`:

```html title=index.html
<form id="expense-form" novalidate>
  <label for="label">What</label>
  <input id="label" name="label" required>

  <label for="amount">Amount ($)</label>
  <input id="amount" name="amount" type="number" step="0.01" min="0.01" required>

  <label for="category">Category</label>
  <select id="category" name="category">
    <option value="food">Food</option>
    <option value="travel">Travel</option>
    <option value="fun">Fun</option>
  </select>

  <p id="form-error" class="error" role="alert"></p>
  <button type="submit">Add expense</button>
</form>
```

يمكن إرسال النموذج بالنقر على الزر، أو بالضغط على Enter داخل حقل، أو عبر التقنيات المساعدة. وكل ذلك يُطلق حدثًا واحدًا على النموذج: `submit`. استمع إليه، لا إلى `click` على الزر:

```js title=app.js
const form = document.querySelector("#expense-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  // read, validate, add, render
});
```

ردّ الفعل الافتراضي للمتصفّح على الإرسال هو أن يبعث البيانات إلى خادم ويحمّل صفحة جديدة. ومع تطبيق يعمل داخل الصفحة، تمسح إعادة التحميل هذه كل شيء. و`event.preventDefault()` تلغي السلوك الافتراضي وتُبقيك في الصفحة.

:::mistake نسيان preventDefault
دون `event.preventDefault()`، يُعاد تحميل الصفحة لحظة إرسال النموذج. يومض مصروفك الجديد لجزء من الثانية، وتبدأ الصفحة من جديد، ويُمسح الـ console، فلا تستطيع حتى رؤية أي خطأ. إن كان النموذج "لا يفعل شيئًا" وظهر فجأة في الرابط `?label=…`، فهذا هو السبب.
:::

## قراءة القيم

يمكنك قراءة `value` لكل حقل، أو جمعها كلها مرة واحدة باستخدام `FormData`، التي تعتمد على سمة `name` لكل حقل:

```js title=app.js
const data = new FormData(form);
const rawLabel = data.get("label");     // "  Coffee with Sam "
const rawAmount = data.get("amount");   // "4.50": a string!
const category = data.get("category");  // "food"
```

كل قيمة **نص**، حتى لو جاءت من حقل أرقام. هذه مشكلة "المدخلات المكتوبة" من القسم 1، لكنها الآن حقيقية. نظّف القيم فورًا: شذّب التسمية بـ `trim()`، وحوّل المبلغ مرة واحدة، إلى سنتات:

```js title=app.js
const label = rawLabel.trim();
const amount = Math.round(Number(rawAmount) * 100);
```

## التحقّق في دالة نقية

ضع القواعد في دالة واحدة تأخذ القيم وتُرجع ما فيها من خطأ. إنها لا تمسّ الصفحة، لذلك يسهل قراءتها ويسهل اختبارها:

```js run
function validateExpense({ label, amount }) {
  const errors = {};
  if (label.trim() === "") {
    errors.label = "Enter what you spent money on.";
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  }
  return errors;
}

console.log(validateExpense({ label: "  ", amount: Number("") }));
console.log(validateExpense({ label: "Coffee", amount: 4.5 }));
```

الكائن الفارغ يعني "صالح"، وتفحص ذلك بـ `Object.keys(errors).length === 0`. لاحظ أن `Number("")` تساوي `0`، وهو فخّ المدخلات الفارغة من القسم 1، لذلك تفشل حالة "لم يُكتب شيء" في قاعدة `amount <= 0` كما ينبغي، و`Number.isFinite` ترفض `NaN` و`Infinity` في فحص واحد.

:::figure ماذا يحدث عند الإرسال
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">عند الإرسال: امنع إعادة التحميل الافتراضية، واقرأ القيم وحوّلها، ثم تحقّق منها. إن وُجدت أخطاء، فاعرضها وانقل التركيز إلى أول حقل غير صالح. وإن كانت صالحة، فأضف المصروف، وأعد العرض، وأفرغ النموذج.</title>
  <rect class="d-box-accent" x="10" y="80" width="120" height="50" rx="10"/>
  <text class="d-code" x="70" y="110" text-anchor="middle">submit</text>
  <rect class="d-box" x="160" y="80" width="150" height="50" rx="10"/>
  <text class="d-label" x="235" y="103" text-anchor="middle">preventDefault،</text>
  <text class="d-label" x="235" y="121" text-anchor="middle">اقرأ وحوّل</text>
  <rect class="d-box-primary" x="340" y="80" width="110" height="50" rx="10"/>
  <text class="d-label" x="395" y="110" text-anchor="middle">تحقّق</text>
  <rect class="d-box-warn" x="490" y="14" width="180" height="56" rx="10"/>
  <text class="d-label" x="580" y="38" text-anchor="middle">اعرض الأخطاء،</text>
  <text class="d-label" x="580" y="58" text-anchor="middle">ركّز على الحقل</text>
  <rect class="d-box-success" x="490" y="140" width="180" height="56" rx="10"/>
  <text class="d-label" x="580" y="164" text-anchor="middle">أضف، اعرض،</text>
  <text class="d-label" x="580" y="184" text-anchor="middle">أفرغ النموذج</text>
  <path class="d-arrow" d="M130 105 L156 105" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M310 105 L336 105" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M450 95 L486 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M450 115 L486 160" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="455" y="62" text-anchor="middle">أخطاء</text>
  <text class="d-label-muted" x="455" y="160" text-anchor="middle">صالح</text>
</svg>
:::

## جمع كل شيء معًا

```js title=app.js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const values = {
    label: data.get("label").trim(),
    amount: Math.round(Number(data.get("amount")) * 100),
    category: data.get("category"),
  };

  const errors = validateExpense(values);
  const errorEl = document.querySelector("#form-error");
  if (Object.keys(errors).length > 0) {
    errorEl.textContent = Object.values(errors).join(" ");
    const firstBad = form.elements[Object.keys(errors)[0]];
    firstBad.setAttribute("aria-invalid", "true");
    firstBad.focus();
    return;
  }

  errorEl.textContent = "";
  expenses = [...expenses, { id: nextId(), ...values }];
  renderExpenses();
  form.reset();
  form.elements.label.focus();
});
```

عند الفشل، تذهب الرسالة إلى عنصر يحمل `role="alert"`، تعلن عنه قارئات الشاشة بمجرّد أن يتغيّر نصّه؛ ويُعلَّم أول حقل غير صالح بـ `aria-invalid` وينتقل إليه التركيز، فيستطيع المستخدم إصلاحه فورًا. وعند النجاح، تتغيّر البيانات، ويُعاد عرض القائمة، وتُفرغ `form.reset()` الحقول، ويعود التركيز إلى الحقل الأول، جاهزًا للمصروف التالي. والتطبيق الحقيقي سيُزيل أيضًا `aria-invalid` بمجرّد إصلاح الحقل. أما `form.elements.label` فتبحث عن حقل باسمه `name`.

## مسح الأخطاء أثناء كتابة المستخدم

عرض الخطأ نصف المهمة؛ والنصف الآخر إزالته في اللحظة المناسبة. فإن بقيت الرسالة على الشاشة والمستخدم يكتب الإصلاح بالفعل، شعر أن النموذج يوبّخه. استمع إلى أحداث `input` على النموذج (فهي تنتشر للأعلى، لذلك يغطّي مستمع واحد كل الحقول) وامسح حالة الخطأ في الحقل الذي تغيّر:

```js title=app.js
form.addEventListener("input", (event) => {
  event.target.removeAttribute("aria-invalid");
  document.querySelector("#form-error").textContent = "";
});
```

وقاوِم الرغبة المعاكسة، أي التحقّق مع كل ضغطة مفتاح وعرض "Enter an amount" بينما الشخص في منتصف كتابته. والخيار الافتراضي الجيد: تحقّق عند الإرسال، وامسح عند الإدخال.

## التحقّق في HTML: الطبقة الأولى

السمات `required` و`type="number"` و`min` و`step` تتيح للمتصفّح فحص القواعد الأساسية وعرض رسائله الخاصة. والسمة `novalidate` على النموذج أعلاه توقف تلك الرسائل كي تُعرض رسائلك أنت بشكل متّسق، بينما تظل السمات توثّق النية وتعطي الهواتف لوحة المفاتيح المناسبة. ويمكنك أيضًا أن تسأل المتصفّح مباشرة عبر `form.checkValidity()`.

:::why لا تثق بالمتصفّح وحده
يستطيع أي شخص أن يفتح DevTools ويحذف `required`، أو أن يرسل البيانات دون استخدام نموذجك أصلًا. التحقّق في الواجهة الأمامية موجود ليساعد المستخدمين الصادقين على إصلاح أخطائهم بسرعة. أما كل ما يجب أن يكون صحيحًا، مثل أن يكون المبلغ موجبًا قبل أن يصل إلى بنك، فيجب فحصه مجددًا على الخادم.
:::

صار نموذجك يضيف مصاريف حقيقية. لكن أعِد تحميل الصفحة وستختفي، لأنها لم تعش قط إلا في متغيّر. الدرس التالي يُصلح ذلك باستخدام JSON و`localStorage`.
