---
summary: تقرأ البيانات التي قد تكون مفقودة بأمان باستخدام السلسلة الاختيارية (optional chaining) وعامل الـ nullish coalescing (`??`)، وتختار Map للبحث والعدّ وSet للقيم الفريدة.
takeaways:
  - 'قراءة خاصية من `undefined` أو `null` ترمي TypeError؛ أما `?.` فتتوقّف وتُرجع `undefined` بدلًا من ذلك.'
  - '`??` توفّر قيمة افتراضية فقط مع `null` و`undefined`، فتنجو القيم الحقيقية مثل `0` و`""`، على عكس `||`.'
  - 'استخدم `?.` فقط حيث تكون البيانات اختيارية فعلًا؛ فنثرها في كل مكان يُخفي أخطاء حقيقية.'
  - 'الـ Map تخزّن أزواجًا من المفاتيح والقيم بمفاتيح من أي نوع، وتحفظ ترتيب الإضافة، ولها `get` و`set` و`has` و`size`.'
  - 'الـ Set تخزّن كل قيمة مرة واحدة على الأكثر، لذلك تُزيل `[...new Set(list)]` التكرار.'
further:
  - title: Optional chaining (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  - title: Nullish coalescing operator (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
  - title: Map (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  - title: Set (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
quiz:
  - q: 'قد يكون للمصروف كائن `receipt` وقد لا يكون. أيّ تعبير يقرأ `url` الإيصال دون أن يرمي خطأ أبدًا؟'
    options:
      - text: '`expense.receipt.url`'
        why: 'حين تكون `receipt` تساوي `undefined`، فإن قراءة `.url` منها ترمي "Cannot read properties of undefined".'
      - text: '`expense?.receipt.url`'
        why: '`?.` هنا تحمي من غياب `expense`، لكن الجزء الاختياري هنا هو `receipt`، وقراءة `.url` منه ما زالت ترمي خطأ.'
      - text: '`expense.receipt?.url`'
        why: 'صحيح. إن كانت `receipt` تساوي `null` أو `undefined`، يتوقّف التعبير كله وتكون قيمته `undefined`.'
    answer: 2
  - q: 'نسبة البقشيش المحفوظة لدى مستخدم هي `0`. ماذا يعطي `const tip = saved.tip ?? 15;`؟'
    options:
      - text: '`0`'
        why: 'صحيح. `??` لا تلجأ إلى البديل إلا مع `null` و`undefined`، و0 ليست أيًّا منهما.'
      - text: '`15`'
        why: 'هذا ما كانت ستعطيه `||`، لأن 0 قيمة falsy. وتجنّب هذا بالضبط هو سبب وجود `??`.'
      - text: '`undefined`'
        why: 'للطرف الأيسر قيمة حقيقية، هي 0، فتُرجعها `??`.'
    answer: 0
  - q: تحتاج إلى عدّ المصاريف في كل فئة، ثم لاحقًا عرض الفئات بترتيب ظهورها الأول. أيّها الأنسب؟
    options:
      - text: مصفوفة أسماء فئات، مع استخدام `indexOf` للعثور على كل واحدة.
        why: البحث في مصفوفة مع كل مصروف يصبح بطيئًا، والأعداد تحتاج إلى مصفوفة ثانية يجب إبقاؤها متزامنة معها.
      - text: Set من أسماء الفئات.
        why: الـ Set تسجّل أن القيمة موجودة، لكنها لا تستطيع تخزين عدد بجانبها.
      - text: Map من الفئة إلى العدد.
        why: 'صحيح. `get`/`set` تحدّثان الأعداد مباشرة، والـ Map تتذكّر ترتيب الإضافة حين تمرّ عليها.'
      - text: نص فيه الفئات مفصولة بفواصل.
        why: النصوص غير قابلة للتعديل ويجب تقسيمها والبحث فيها كل مرة؛ إنها ليست مصمّمة للبحث.
    answer: 2
  - q: 'ماذا تُرجع `new Set(["food", "travel", "food", "fun"]).size`؟'
    options:
      - text: '`4`'
        why: 'الـ Set تتجاهل القيم الموجودة فيها أصلًا، لذلك لا تُضاف "food" الثانية.'
      - text: '`3`'
        why: 'صحيح. تحمل الـ Set القيم "food" و"travel" و"fun"، كلًّا منها مرة واحدة.'
      - text: '`2`'
        why: 'لا تُحذف إلا "food" المكرّرة؛ أما "travel" و"fun" فتظهر كل منهما مرة واحدة وتبقيان.'
    answer: 1
---

البيانات الحقيقية فيها ثغرات. بعض المصاريف لها ملاحظة وبعضها لا. وبعضها أُرفق به إيصال. والإعداد الذي لم يغيّره المستخدم قط لا يُحفظ أصلًا. على Pocket أن يتعامل مع كل هذا دون أن ينهار، ودون أن يخلط بين "لا شيء" وقيمة حقيقية مثل الصفر.

## الخطأ الذي ستراه أكثر من غيره

قراءة خاصية غير موجودة في كائن أمر لا بأس به؛ فتحصل على `undefined`. أما قراءة خاصية **من `undefined`** فليست كذلك:

```js run
const expense = { label: "Coffee", amount: 450 };
console.log(expense.receipt);          // undefined: fine

try {
  console.log(expense.receipt.url);    // reading .url of undefined
} catch (error) {
  console.log(error.message);
}
```

`TypeError: Cannot read properties of undefined (reading 'url')` ربما يكون الخطأ الأكثر شيوعًا في JavaScript كلها. (الـ `try`/`catch` هنا موجودة فقط كي يستمر المثال في العمل فتقرأ الرسالة؛ والقسم 5 يشرحها كما ينبغي.) والرسالة تخبرك بالضبط بما حدث: شيء ما قبل `.url` كان `undefined`.

وقبل أن تمدّ يدك إلى الحل، تذكّر الفرق بين القيمتين "الفارغتين". `undefined` تعني عادةً "لم يُضبط قط": خاصية مفقودة، أو معامل لم يمرّره أحد، أو متغيّر بلا قيمة. أما `null` فتُضبط عن قصد لتعني "فارغ عمدًا". قد يخزّن Pocket القيمة `receipt: null` لمصروف اختار المستخدم ألّا يرفق به إيصالًا.

## السلسلة الاختيارية: ?.

العامل `?.` يقرأ الخاصية فقط إن لم يكن ما على يساره `null` أو `undefined`. فإن كان كذلك، يتوقّف التعبير كله ويعطي `undefined` بدلًا من أن يرمي خطأ:

```js run
const withReceipt = { label: "Train", receipt: { url: "/r/88.png" } };
const withoutReceipt = { label: "Coffee" };

console.log(withReceipt.receipt?.url);
console.log(withoutReceipt.receipt?.url);
console.log(withoutReceipt.tags?.[0]);          // works with brackets
console.log(withoutReceipt.format?.());         // and with calls
```

ضع `?.` مباشرة بعد الجزء الذي قد يكون مفقودًا. ففي `expense.receipt?.url` أنت تقول: "`expense` يجب أن يكون موجودًا، أما `receipt` فقد لا يكون".

:::mistake نثر ?. في كل مكان
`a?.b?.c?.d` "تُصلح" كل انهيار، وهنا المشكلة. فإن كان `expense` نفسه يجب أن يكون موجودًا دائمًا ثم اختفى فجأة، فأنت تريد خطأً صاخبًا يشير إلى الخلل الحقيقي، لا `undefined` صامتة تظهر بعد ثلاث شاشات على شكل تسمية فارغة. استخدم `?.` فقط مع البيانات الاختيارية بطبيعة تصميمها.
:::

## القيم الافتراضية بـ ??

`?.` تعطيك `undefined`، وفي العادة تريد قيمة بديلة. تعرّفت على `||` للقيم الافتراضية في القسم 2، ومعها عيبها: إنها تلجأ إلى البديل مع كل قيمة falsy، بما في ذلك `0` و`""`. أما عامل **nullish coalescing** `??` (أي "البديل عند غياب القيمة") فلا يلجأ إلى البديل إلا مع `null` و`undefined`:

```js run
const settings = { dailyLimit: 0, nickname: "" };

console.log(settings.dailyLimit || 5000);   // 5000: the user's 0 is lost
console.log(settings.dailyLimit ?? 5000);   // 0: kept
console.log(settings.nickname ?? "friend"); // "": kept
console.log(settings.currency ?? "USD");    // missing: default used
```

استخدم `??` للقيم الافتراضية. ولا تستخدم `||` إلا حين تريد فعلًا استبدال النصوص الفارغة والأصفار أيضًا. ويجتمع العاملان مع `?.` بشكل طبيعي:

```js run
const expense = { label: "Coffee" };
const receiptUrl = expense.receipt?.url ?? "No receipt";
console.log(receiptUrl);
```

وهناك أيضًا صيغة إسناد، `settings.currency ??= "USD"`، تضبط الخاصية فقط إن كانت حاليًا `null` أو `undefined`.

## Map: البحث بأي مفتاح

في الدرس السابق استخدمت كائنًا عاديًا لحساب مجاميع الفئات. الكائنات تعمل جيدًا مع السجلّات ذات أسماء الخصائص المعروفة. أما المجموعة التي تكبر مع البيانات، ومفاتيحها قيم لا تعرفها مسبقًا، فلها في JavaScript بنية مخصّصة: **Map**:

```js run
const counts = new Map();
for (const category of ["food", "travel", "food", "fun", "food"]) {
  counts.set(category, (counts.get(category) ?? 0) + 1);
}

console.log(counts.get("food"), counts.has("rent"), counts.size);
for (const [category, count] of counts) {
  console.log(`${category}: ${count}`);
}
```

`set(key, value)` تخزّن، و`get(key)` تقرأ (أو تعطي `undefined`)، و`has(key)` تفحص، و`delete(key)` تحذف، و`size` تعدّ المدخلات. وحلقة `for...of` تعطيك أزواج `[key, value]` بترتيب إضافتها الأول.

لماذا لا تستخدم كائنًا دائمًا؟ الـ Map تقبل **أي قيمة مفتاحًا**، بما في ذلك الأرقام والكائنات، بينما يحوّل الكائن كل مفتاح إلى نص. ولها `size` حقيقية. وليست لها خصائص موروثة تتعثّر بها: فالكائن الذي مفاتيحه نصوص يكتبها المستخدم قد يتصادم مع أسماء مدمجة مثل `constructor`. والخيار الافتراضي الجيد: **الكائنات للسجلّات ذات الحقول الثابتة، والـ Maps لجداول البحث المبنية من البيانات.**

## Set: كل قيمة مرة واحدة

الـ **Set** مجموعة تظهر فيها كل قيمة مرة واحدة على الأكثر. وإضافة قيمة موجودة أصلًا لا تفعل شيئًا:

```js run
const categories = ["food", "travel", "food", "fun", "travel"];
const unique = new Set(categories);

console.log(unique.size, unique.has("fun"));
unique.add("food");               // already there: no change
console.log([...unique]);         // back to an array, in first-seen order
```

`[...new Set(list)]` هي الطريقة المعتمدة في سطر واحد لإزالة التكرار من مصفوفة. و`has` أسرع بكثير من `includes` على مصفوفة كبيرة، لأن الـ Set لا تبحث عنصرًا عنصرًا. وقد أضافت الإصدارات الحديثة من JavaScript عمليات على المجموعات مثل `union` و`intersection`، وهي متاحة في كل المتصفّحات الحالية.

:::tip الـ Sets تقارن الكائنات بالمرجع
تعامل الـ Set (ومفاتيح الـ Map) كائنين على أنهما الشيء نفسه فقط إن كانا الكائن نفسه، وفق قاعدة المرجع نفسها التي تتبعها `===`. فكائنان منفصلان `{ label: "Coffee" }` هما مدخلان مختلفان. أزِل تكرار الكائنات بالاعتماد على معرّف بدلًا من ذلك، مثلًا بـ Set من قيم `e.id`.
:::

بهذا تكتمل أدوات Pocket للتعامل مع البيانات: المصفوفات والكائنات والـ Maps والـ Sets، وعوامل التعامل مع القيم المفقودة. وفي القسم 4، يذهب كل ذلك إلى صفحة ويب حقيقية.
