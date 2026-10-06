---
summary: تجمع Pocket في تطبيق متصفّح مكتمل له كائن state واحد، ومنطق نقي، ودالة render واحدة، وأحداث مفوَّضة، وتصفية، وبيانات محفوظة، وتفحصه وفق تعريف واضح لـ "مكتمل".
takeaways:
  - احتفظ بكل البيانات المتغيّرة في مكان واحد، وغيّرها عبر دالة واحدة تحفظ وتعيد العرض، فلا تختلف الصفحة والبيانات والتخزين أبدًا.
  - اشتقّ كل ما يمكنك اشتقاقه، مثل القائمة المرئية والمجاميع، من الـ state وقت العرض بدلًا من تخزينه منفصلًا.
  - الدوال النقية تحمل القواعد؛ ومعالجات الأحداث تبقى قصيرة ولا تفعل إلا ترجمة الأحداث إلى تغييرات في الـ state.
  - يكتمل التطبيق حين يتعامل مع الحالة الفارغة، والمدخلات السيئة، وإعادة التحميل، والاستخدام بلوحة المفاتيح وحدها، لا مع المسار السعيد فقط.
further:
  - title: Document.createElement() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
  - title: "HTMLElement: change event (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
quiz:
  - q: 'يعرض Pocket المصاريف مصفّاةً على "food" مع مجموع في الأسفل. من أين يجب أن تأتي القائمة المصفّاة؟'
    options:
      - text: 'من مصفوفة ثانية، `foodExpenses`، تُحدَّث كلما أُضيف مصروف أو حُذف.'
        why: المصفوفتان اللتان يجب إبقاؤهما متزامنتين ستختلفان في النهاية، مثلًا بعد حذف لا يحدّث إلا إحداهما.
      - text: 'من قراءة عناصر `<li>` الموجودة حاليًا على الصفحة.'
        why: الصفحة صورة للبيانات. وقراءة البيانات منها تربط منطقك بالوسوم وتنكسر بسهولة.
      - text: 'تُحسب داخل `render` من `state.expenses` و`state.filter` في كل مرة.'
        why: صحيح. البيانات المشتقّة التي يُعاد حسابها من مصدر الحقيقة الوحيد لا يمكن أن تصبح قديمة أبدًا.
    answer: 2
  - q: كل معالج حدث في Pocket ينتهي بالخطوات الثلاث نفسها. أيّ ترتيب صحيح؟
    options:
      - text: حدّث الـ state، ثم احفظه، ثم اعرض منه.
        why: صحيح. يتغيّر الـ state أولًا؛ ثم يقرأ الحفظ والعرض كلاهما من الـ state الجديد، فيعكسان البيانات نفسها.
      - text: اعرض، ثم حدّث الـ state، ثم احفظ.
        why: العرض قبل تغيّر الـ state يرسم البيانات القديمة، فتكون الشاشة دائمًا متأخّرة خطوة.
      - text: احفظ، ثم حدّث الـ state، ثم اعرض.
        why: الحفظ قبل التحديث يخزّن البيانات القديمة، فيضيع آخر تغيير عند إعادة التحميل.
    answer: 0
  - q: 'أيّ مما يلي جزء من تعريف معقول لـ "مكتمل" في Pocket، يتجاوز "إضافة مصروف تعمل"؟'
    options:
      - text: كل دالة مكتوبة على شكل method في صنف.
        why: الأصناف أداة لا غاية. والدوال العادية غالبًا هي الخيار الأفضل للمنطق النقي.
      - text: في التطبيق حركة (animation) واحدة على الأقل.
        why: اللمسات الجمالية لطيفة، لكنها لا تقول شيئًا عن صلاحية التطبيق للاستخدام الحقيقي.
      - text: 'الكود لا يستخدم أي تعليمة `if`.'
        why: الشروط ضرورية في البرامج الحقيقية. وتجنّبها ليس مقياسًا للجودة.
      - text: تعرض القائمة رسالة مفيدة حين لا توجد مصاريف، وتنجو البيانات من إعادة التحميل.
        why: صحيح. الحالات الفارغة واستمرار البيانات جزء مما يختبره المستخدمون، لذلك مكانهما ضمن "مكتمل".
    answer: 3
---

لديك كل القطع: دوال مساعدة للمال، والتحقّق من المدخلات، والعرض، والأحداث، والنموذج، والتخزين، والوحدات، والأصناف. يجمعها هذا الدرس في Pocket المكتمل، والأهم أنه يُريك الشكل الذي يُمسك تطبيقًا صغيرًا متماسكًا فيبقى سهل التغيير.

## الشكل: state واحد، وطريقة واحدة لتغييره

لكل تطبيق تفاعلي بيانات تتغيّر. في Pocket هي قائمة المصاريف وفلتر الفئة الذي اختاره المستخدم. ضعها كلها في كائن واحد، هو **الـ state** (الحالة):

```js title=src/main.js
const state = {
  expenses: loadExpenses(),
  filter: "all",
};
```

ثم اجعل دالة واحدة هي الطريقة الوحيدة لتغييره. إنها تطبّق التغيير، وتحفظ، وتعيد العرض:

```js title=src/main.js
function update(changes) {
  Object.assign(state, changes);
  saveExpenses(state.expenses);
  render();
}
```

`Object.assign(state, changes)` تنسخ خصائص `changes` إلى `state`، لذلك لا تغيّر `update({ filter: "food" })` إلا الفلتر. وصار كل معالج حدث ينتهي بالطريقة نفسها: احسب القيم الجديدة، ثم استدعِ `update`. ولن تحتاج أبدًا إلى تذكّر الحفظ أو إعادة الرسم، لأن نسيانهما صار مستحيلًا.

:::figure الحلقة التي يمرّ بها كل حدث
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">حدث من المستخدم يذهب إلى معالج حدث، يحسب القيم الجديدة بدوال نقية ويستدعي update. تغيّر update الـ state، وتحفظه في التخزين، وتستدعي render، التي ترسم الصفحة التي يراها المستخدم، جاهزةً للحدث التالي.</title>
  <rect class="d-box-accent" x="20" y="20" width="140" height="56" rx="10"/>
  <text class="d-label" x="90" y="53" text-anchor="middle">حدث المستخدم</text>
  <rect class="d-box" x="200" y="20" width="160" height="56" rx="10"/>
  <text class="d-label" x="280" y="44" text-anchor="middle">معالج الحدث</text>
  <text class="d-label-muted" x="280" y="64" text-anchor="middle">يستخدم دوال نقية</text>
  <rect class="d-box-primary" x="400" y="20" width="140" height="56" rx="10"/>
  <text class="d-code" x="470" y="53" text-anchor="middle">update()</text>
  <rect class="d-box-success" x="400" y="140" width="140" height="56" rx="10"/>
  <text class="d-code" x="470" y="173" text-anchor="middle">render()</text>
  <rect class="d-box" x="580" y="20" width="90" height="56" rx="10"/>
  <text class="d-label" x="625" y="53" text-anchor="middle">حفظ</text>
  <rect class="d-box" x="200" y="140" width="160" height="56" rx="10"/>
  <text class="d-label" x="280" y="173" text-anchor="middle">الصفحة</text>
  <path class="d-arrow" d="M160 48 L196 48" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M360 48 L396 48" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M540 48 L576 48" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M470 76 L470 136" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 168 L364 168" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 168 Q90 168 90 80" marker-end="url(#arrow)"/>
</svg>
:::

## دالة render تشتقّ كل شيء

تقرأ `render` الـ state وترسم الواجهة كلها. وكل ما يمكن حسابه من الـ state يُحسب هنا، لا يُخزَّن: القائمة المرئية تعتمد على الفلتر، والمجموع يعتمد على القائمة المرئية.

```js title=src/ui.js
function render() {
  const visible =
    state.filter === "all"
      ? state.expenses
      : state.expenses.filter((e) => e.category === state.filter);

  list.replaceChildren();
  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No expenses yet. Add your first one above.";
    list.append(empty);
  }
  for (const expense of visible) {
    list.append(renderItem(expense));
  }
  totalEl.textContent = `Total: ${formatMoney(totalCents(visible))}`;
}

function renderItem(expense) {
  const li = document.createElement("li");
  li.dataset.id = expense.id;
  const text = document.createElement("span");
  text.textContent = `${expense.label}: ${formatMoney(expense.amount)} (${expense.category})`;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "delete";
  button.textContent = "Delete";
  button.setAttribute("aria-label", `Delete ${expense.label}`);
  li.append(text, button);
  return li;
}
```

لأن `render` تبدأ دائمًا من الـ state، لا يمكن للفلتر والقائمة والمجموع أن تتناقض أبدًا. وتبديل الفلتر إلى "food" لا يُخفي بعض عناصر `<li>` ويعيد حساب رقم؛ بل يرسم ببساطة صورة مختلفة للـ state نفسه.

تفصيلتان تستحقّان النسخ. **الحالة الفارغة** تحوّل القائمة الخالية إلى إرشاد. والـ `aria-label` على زر الحذف تخبر مستخدمي قارئات الشاشة *أيّ* مصروف يحذفه الزر، فعشرة أزرار كلها باسم "Delete" لا فائدة منها لمن لا يرى الصف.

## معالجات الأحداث تترجم الأحداث إلى تحديثات

حين يكون الـ state و`update` و`render` في مكانها، تصبح كل ميزة بضعة أسطر:

```js title=src/main.js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = readExpenseForm(form);          // { values } or { errors }
  if (result.errors) {
    showErrors(form, result.errors);
    return;
  }
  update({ expenses: addExpense(state.expenses, { id: nextId(), ...result.values }) });
  form.reset();
  form.elements.label.focus();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest(".delete");
  if (!button) return;
  const id = button.closest("li").dataset.id;
  update({ expenses: state.expenses.filter((e) => e.id !== id) });
});

filterSelect.addEventListener("change", () => {
  update({ filter: filterSelect.value });
});

render();
```

`readExpenseForm` و`showErrors` هما كود النموذج من القسم 4، وقد نُقل إلى دالتين صغيرتين لهما اسمان: الأولى تقرأ وتشذّب وتحوّل وتتحقّق، وتُرجع إمّا قيمًا نظيفة أو كائن أخطاء؛ والثانية تكتب الرسائل وتضبط `aria-invalid`. ومنح كل منهما اسمًا يحوّل معالج الإرسال إلى ملخّص تستطيع قراءته في خمس ثوانٍ.

لاحظ ما *لا* تحتويه معالجات الأحداث: لا بناء للـ DOM، ولا حفظ، ولا مجاميع. إنها تقرأ الحدث، وتستدعي دوال نقية مثل `addExpense` من القسم 3، وتسلّم النتيجة إلى `update`. القواعد تعيش في `expenses.js`، حيث تستطيع اختبارها دون متصفّح؛ أما معالجات الأحداث فهي الغراء الذي يربط الأجزاء.

:::mistake معرّفات تتكرّر بعد إعادة التحميل
العدّاد الذي يبدأ من 1 في كل مرة تُحمَّل فيها الصفحة سيعطي `exp-1` من جديد بينما ما زال `exp-1` قديم في التخزين، وعندها يحذف حذفُ أحدهما الاثنين معًا. ابدأ العدّاد بعد أعلى معرّف محفوظ، أو استخدم `crypto.randomUUID()`، التي توفّرها كل المتصفّحات الحالية في الصفحات الآمنة (https أو localhost)، وتُرجع معرّفًا فريدًا مثل `"3b241101-e2bb-4255-8caf-4136c566a962"`.
:::

## تعريف "مكتمل"

"إضافة مصروف تعمل" هي نقطة بداية الاختبار، لا نهايته. قبل أن تقول إن Pocket اكتمل، مرّ على هذه القائمة يدويًا:

- **الفراغ**: دون أي بيانات، تشرح الصفحة ما يجب فعله.
- **المدخلات السيئة**: التسمية الفارغة، والمبلغ `abc` أو `0` أو `-5`، كل منها يعرض رسالة واضحة ولا يضيف شيئًا.
- **إعادة التحميل**: كل ما أضفته ما زال موجودًا، والفلتر يبدأ على "All".
- **لوحة المفاتيح وحدها**: تستطيع الانتقال بـ Tab إلى كل حقل وزر، والإرسال بـ Enter، والحذف بـ Enter أو Space.
- **البيانات الغريبة**: تسمية مثل `<b>hi</b>` تظهر نصًا، والتسمية الطويلة جدًا لا تكسر التخطيط.
- **الـ Console**: لا أخطاء ولا تحذيرات أثناء قيامك بكل ما سبق.

كل بند هنا يأتي من درس في هذه الدورة، وكل منها يلتقط فئة حقيقية من الأخطاء كان المستخدمون سيكتشفونها نيابةً عنك.

:::tip احفظ نسخة عند كل خطوة ناجحة
ابنِ الميزات واحدة تلو الأخرى، واحفظ نسخة تعمل بعد كل منها: الإضافة، ثم الحذف، ثم التصفية، ثم التخزين. وإن انكسر شيء، فليس عليك إلا التراجع عن خطوة واحدة. وتُريك [دورة Git وGitHub](course:git-github) كيف تفعل ذلك كما ينبغي باستخدام الـ commits.
:::

التمرين أدناه يسلّمك Pocket شبه مكتمل، وما زال عليك ربط التصفية والحذف. وبعد ذلك، درس قصير أخير حول وجهتك التالية.
