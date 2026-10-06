---
summary: تعرّف الأصناف (classes) بـ constructor وmethods وgetters وحقول خاصة، وتُنشئ instances مستقلة بـ new، وتتجنّب خطأ ضياع this الكلاسيكي حين تمرّر الـ methods على أنها callbacks.
takeaways:
  - 'الصنف (class) مخطّط؛ و`new ClassName(...)` تنفّذ الـ constructor وتُرجع instance جديدة لها بياناتها الخاصة.'
  - 'الـ methods مشتركة بين كل الـ instances، وداخلها تشير `this` إلى الـ instance التي استُدعيت عليها الـ method.'
  - 'الحقول الخاصة (`#expenses`) لا يمكن قراءتها إلا داخل جسم الصنف، وهذا يحمي بيانات الكائن كما تفعل الـ closures.'
  - 'الـ getter (`get total()`) يُقرأ كأنه خاصية لكنه يُحسب في كل مرة، فلا تصبح القيم المشتقّة قديمة أبدًا.'
  - 'تمرير `store.add` على أنها callback يُضيّع `this`؛ غلّفها بدالة سهمية: `(e) => store.add(e)`.'
further:
  - title: Classes (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  - title: Private elements (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
  - title: this (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
quiz:
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      class Counter {
        count = 0;
        increment() { this.count++; }
      }
      const a = new Counter();
      const b = new Counter();
      a.increment();
      a.increment();
      console.log(a.count, b.count);
      ```
    options:
      - text: '`2 2`'
        why: 'الحقول تُنشأ لكل instance على حدة، لذلك لـ `b` حقل `count` خاص بها لم يزده أحد.'
      - text: '`1 1`'
        why: 'استُدعيت `increment` مرتين على `a`، ولم تُستدعَ أبدًا على `b`.'
      - text: '`0 0`'
        why: '`this.count++` تغيّر الـ instance التي استُدعيت عليها، لذلك تزيد `a.count`.'
      - text: '`2 0`'
        why: 'صحيح. كل `new Counter()` تُنشئ كائنًا منفصلًا له `count` خاص به؛ الـ method مشتركة، أما البيانات فلا.'
    answer: 3
  - q: '`button.addEventListener("click", store.clear);` تجعل `clear` ترمي TypeError عن الحقل الخاص `#expenses` ("…from an object whose class did not declare it") حين يُنقر الزر. لماذا؟'
    options:
      - text: لا يمكن استخدام methods الأصناف مستمعين للأحداث.
        why: يمكن ذلك، ما دامت تُستدعى بـ `this` الصحيحة. المشكلة في طريقة تمرير الـ method.
      - text: 'مُرّرت الـ method وحدها، لذلك حين يستدعيها المتصفّح لا تكون `this` هي `store`.'
        why: 'صحيح. `this` تتحدّد بطريقة استدعاء الدالة، والمتصفّح يستدعي المستمع و`this` مضبوطة على العنصر، أي الزر هنا. اكتب `() => store.clear()` كي تُستدعى على `store`.'
      - text: '`store` أُنشئ بـ `const` ولا يمكن تغييره.'
        why: '`const` لا تمنع methods الكائن من تغيير حقوله. المشكلة هي ضياع `this`.'
    answer: 1
  - q: 'يحتفظ `ExpenseStore` بقائمته في `#expenses`. ماذا تفعل `store.#expenses` المكتوبة خارج الصنف؟'
    options:
      - text: إنها خطأ في الصياغة؛ الحقول الخاصة لا يمكن الوصول إليها إلا داخل جسم الصنف.
        why: صحيح. المحرّك يفرض الخصوصية، لذلك على الكود الخارجي استخدام الـ methods العامة.
      - text: 'تُرجع المصفوفة، لأن `#` مجرّد عرف في التسمية.'
        why: 'العرف الأقدم `_expenses` كان مجرّد تلميح. أما `#` فخصوصية حقيقية تفرضها اللغة.'
      - text: 'تُرجع `undefined`.'
        why: 'إنها لا تُنفَّذ أصلًا. استخدام `#expenses` خارج الصنف يُرفض لحظة تحليل الكود.'
    answer: 0
---

انظر إلى ما يفعله كود Pocket بمصاريفه: متغيّر يحمل المصفوفة، ونحو اثنتي عشرة دالة تأخذ كل منها تلك المصفوفة، وتفعل شيئًا، وتُرجع نتيجة. البيانات والعمليات عليها منفصلة، فلا شيء يمنع سطر كود شاردًا من دفع مصروف مشوّه مباشرة إلى المصفوفة. أما **الصنف** (class) فيحزم البيانات مع الدوال المسموح لها بالعمل عليها، ويستطيع أن يجعل البيانات نفسها بعيدة عن متناول الخارج.

## تعريف صنف

```js run
class ExpenseStore {
  #expenses = [];
  #nextNumber = 1;

  constructor(initial = []) {
    for (const expense of initial) {
      this.add(expense);
    }
  }

  add({ label, amount, category = "other" }) {
    const expense = { id: `exp-${this.#nextNumber++}`, label, amount, category };
    this.#expenses.push(expense);
    return expense;
  }

  remove(id) {
    this.#expenses = this.#expenses.filter((e) => e.id !== id);
  }

  get total() {
    return this.#expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  list() {
    return [...this.#expenses];
  }
}

const store = new ExpenseStore([{ label: "Coffee", amount: 450, category: "food" }]);
store.add({ label: "Train", amount: 1220, category: "travel" });
console.log(store.total, store.list().map((e) => e.id));
```

هناك الكثير هنا، فخذه قطعة قطعة.

`#expenses = []` تصرّح بـ **حقل خاص** (private field). كل instance (نسخة) تحصل على `#expenses` خاص بها، وعلامة `#` تجعله خاصًا: لا يستطيع قراءته أو الكتابة فيه إلا الكود الموجود داخل جسم الصنف. وفي الخارج، `store.#expenses` خطأ في الصياغة. ومن يريد تغيير القائمة عليه أن يمرّ عبر `add` و`remove`، اللتين تضمنان أن يحصل كل مصروف على معرّف وفئة.

الـ `constructor` (الباني) method خاصة تُنفَّذ حين تكتب `new ExpenseStore(...)`. ومهمتها تهيئة الكائن الجديد. وهي هنا تضيف أي مصاريف ابتدائية عبر `add`، فتخضع للقواعد نفسها.

`add` و`remove` و`list` هي **methods** (دوال الكائن). وداخل الـ method، تشير `this` إلى الكائن الذي استُدعيت عليه: في `store.add(...)`، تكون `this` هي `store`.

`get total()` هو **getter**. تقرؤه كأنه خاصية، `store.total`، دون أقواس، لكنه ينفّذ كودًا في كل مرة. فالمجموع المخزّن في حقل قد يصبح قديمًا حين يُحذف مصروف؛ أما الـ getter فيُحسب دائمًا من البيانات الحالية.

`list()` تُرجع نسخة، `[...this.#expenses]`، لا المصفوفة نفسها. فإرجاع المصفوفة الحقيقية سيسمح للمُستدعين بـ `push` فيها، ويُبطل كل الحماية.

## الـ Instances: مخطّط واحد وكائنات كثيرة

`new` تُنشئ كائنًا جديدًا، وتنفّذ الـ constructor و`this` تشير إليه، ثم تُرجعه. لكل instance حقولها الخاصة؛ أما الـ methods فتُعرَّف مرة واحدة على الصنف وتُتشارك.

:::figure صنف واحد وinstances كثيرة لكل منها بياناتها
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">يعرّف الصنف ExpenseStore الـ methods‏ add وremove وlist والـ getter‏ total. ولكل من الـ instances‏ home وwork مصفوفة expenses خاصة بها، وكلتاهما تستخدمان الـ methods المشتركة.</title>
  <rect class="d-box-primary" x="230" y="14" width="200" height="86" rx="12"/>
  <text class="d-label-strong" x="330" y="40" text-anchor="middle">class ExpenseStore</text>
  <text class="d-code" x="330" y="64" text-anchor="middle">add, remove, list</text>
  <text class="d-code" x="330" y="86" text-anchor="middle">get total</text>
  <rect class="d-box" x="40" y="150" width="230" height="64" rx="12"/>
  <text class="d-code" x="155" y="176" text-anchor="middle">home</text>
  <text class="d-label-muted" x="155" y="200" text-anchor="middle">#expenses: 12 عنصرًا</text>
  <rect class="d-box" x="390" y="150" width="230" height="64" rx="12"/>
  <text class="d-code" x="505" y="176" text-anchor="middle">work</text>
  <text class="d-label-muted" x="505" y="200" text-anchor="middle">#expenses: 3 عناصر</text>
  <path class="d-arrow" d="M290 100 L180 146" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M370 100 L480 146" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="330" y="140" text-anchor="middle">new ExpenseStore()</text>
</svg>
:::

```js run
class ExpenseStore {
  #expenses = [];
  add(expense) { this.#expenses.push(expense); }
  get count() { return this.#expenses.length; }
}

const home = new ExpenseStore();
const work = new ExpenseStore();
home.add({ label: "Groceries", amount: 6400 });
console.log(home.count, work.count);
```

إن ذكّرك هذا بـ `createBudget` من درس الـ closures، فهذا طبيعي. الـ closure والصنف ذو الحقول الخاصة يحلّان المشكلة نفسها: بيانات لا تستطيع لمسها إلا دوال معيّنة. الـ closures أخفّ مع دالة واحدة؛ والأصناف أوضح حين تتشارك عدّة عمليات البيانات نفسها.

## ضياع this

`this` لا تُثبَّت حين تكتب الـ method. بل تتحدّد في كل مرة **تُستدعى** فيها الدالة، بحسب ما يقع على يسار النقطة. `store.add(x)` تستدعي `add` و`this` مضبوطة على `store`. لكن إن مرّرت الـ method إلى مكان ما وحدها، فلن تكون هناك نقطة حين تُستدعى في النهاية:

```js run
class Greeter {
  name = "Pocket";
  hello() {
    return `Hello from ${this.name}`;
  }
}

const g = new Greeter();
console.log(g.hello());

const detached = g.hello;
try {
  console.log(detached());
} catch (error) {
  console.log("Error:", error.message);
}

const wrapped = () => g.hello();
console.log(wrapped());
```

الاستدعاء الأول ينجح لأن `g` على يسار النقطة. أما `detached()` فتُستدعى ولا شيء على يسار أي نقطة، فتكون `this` داخلها `undefined` (أجسام الأصناف تعمل دائمًا في الوضع الصارم)، وقراءة `this.name` ترمي خطأ.

:::mistake تمرير method على أنها callback
`form.addEventListener("submit", store.add)` و`items.forEach(store.add)` كلتاهما تقعان في هذا الخطأ. غلّف الاستدعاء بدالة سهمية، `(e) => store.add(e)`، كي تُستدعى الـ method على الكائن الصحيح. الدوال السهمية ليست لها `this` خاصة بها، ولهذا بالضبط هي آمنة هنا.
:::

يمكن للأصناف أيضًا أن تُبنى فوق أصناف أخرى باستخدام `extends`، فترث methods الصنف الآخر وتضيف methods جديدة. ستستخدم ذلك مرة واحدة، في الدرس التالي، لتصنع نوع خطأ خاصًا بك. وفيما عدا ذلك، فالخيار الافتراضي الجيد في كود التطبيقات هو تفضيل الأصناف الصغيرة والدوال العادية على سلاسل الوراثة العميقة، التي يصعب تغييرها عادةً.

:::tip هل تحتاج إلى صنف أصلًا؟
دوال Pocket المساعدة للمال أفضل على شكل دوال عادية: فهي لا تحمل أي بيانات. الجأ إلى الصنف حين تكون لديك حالة (state) وقواعد لتغييرها، مثل المخزن. وكثير من مشاريع JavaScript الممتازة تستخدم أصنافًا قليلة؛ لكن معرفة قراءتها أمر لا نقاش فيه، لأن واجهات المتصفّح البرمجية والمكتبات مليئة بها.
:::

صار مخزنك يرفض التغييرات السيئة من الخارج. والدرس التالي عمّا يحدث حين يسوء شيء ما رغم ذلك: الأخطاء، وكيف ترميها وتلتقطها عن قصد، وكيف تطارد الأخطاء البرمجية بأدوات DevTools في المتصفّح.
