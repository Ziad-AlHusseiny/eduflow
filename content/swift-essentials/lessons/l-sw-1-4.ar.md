---
summary: اكتب دوال بتسميات وسائط واضحة وقيم افتراضية، ثم استبدل حلقات التكرار المكتوبة يدويًا بـ closures تمرّرها إلى filter وmap وreduce وsorted.
takeaways:
  - "تسميات الوسائط تجعل مواضع الاستدعاء تُقرأ كجمل؛ استخدم `_` فقط حين لا تضيف التسمية شيئًا."
  - الـ closure دالة بلا اسم، وصيغة الـ trailing closure تتيح لك كتابته بعد أقواس الاستدعاء.
  - "`filter` يُبقي العناصر، و`map` يحوّلها، و`reduce` يجمعها في قيمة واحدة، و`sorted(by:)` يعيد مصفوفة جديدة مرتّبة."
  - الـ closure يلتقط المتغيّرات التي يستخدمها، فيستطيع أن يحمل سياقًا مثل حدّ معيّن إلى أي مكان يُستدعى فيه لاحقًا.
further:
  - title: Functions
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/functions/
  - title: Closures
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/closures/
quiz:
  - q: "لديك `func total(of expenses: [Expense], in category: String? = nil) -> Decimal`. أيّ استدعاء يُترجَم؟"
    options:
      - text: "`total(expenses, \"Food\")`"
        why: لكلا المعاملين تسمية وسيط، فيجب أن يستخدمها الاستدعاء.
      - text: "`total(expenses: expenses)`"
        why: "`expenses` هو اسم المعامل المستخدم داخل الدالة. أما من يستدعيها فيستخدم التسمية `of`."
      - text: "`total(of: expenses)`"
        why: صحيح. للمعامل الثاني قيمة افتراضية، فيمكنك حذفه.
    answer: 2
  - q: "ماذا ينتج `[3, 8, 12].map { $0 * 2 }.filter { $0 > 10 }`؟"
    options:
      - text: "`[16, 24]`"
        why: "صحيح. يضاعف `map` كل رقم فينتج `[6, 16, 24]`، ثم يُبقي `filter` ما هو أكبر من 10."
      - text: "`[24]`"
        why: "هذا ما يحدث لو طبّقت الفلترة قبل التحويل (`12` هي القيمة الوحيدة الأكبر من 10). السلسلة تُنفَّذ من اليسار إلى اليمين."
      - text: "`[6, 16, 24]`"
        why: "هذه النتيجة بعد `map` فقط؛ وما زال على `filter` أن يحذف 6."
      - text: "`40`"
        why: "القيمة الواحدة المجمّعة هي ما ينتجه `reduce`. أما `map` و`filter` فكلاهما يعيد مصفوفة."
    answer: 0
  - q: "كتبت `expenses.sorted { $0.amount > $1.amount }` في سطر مستقل ولم يتغيّر شيء. لماذا؟"
    options:
      - text: الـ closure يقارن في الاتجاه المعاكس.
        why: المقارنة سليمة (الأكبر أولًا). المشكلة في النتيجة.
      - text: "`sorted` يعيد مصفوفة جديدة، والكود يرمي هذه النتيجة."
        why: "صحيح. أسندها (`let biggestFirst = …`) أو استدعِ `sort` على `var` لترتيبها في مكانها. ويحذّرك Xcode من النتيجة غير المستخدمة."
      - text: "الـ closures لا تستطيع قراءة خصائص مثل `amount`."
        why: الـ closures تستطيع قراءة أي شيء في نطاقها، بما في ذلك خصائص معاملاتها.
    answer: 1
  - q: "`let check = makeLimitCheck(limit: 60)` تعيد الـ closure‏ `{ amount in amount > limit }`. ماذا يعيد `check(64)` بعد انتهاء `makeLimitCheck` بوقت طويل؟"
    options:
      - text: "لا يُترجَم، لأن `limit` لم يعد موجودًا."
        why: "الـ closure التقط `limit`، فيبقى حيًّا ما بقي الـ closure."
      - text: "`false`، لأن القيم الملتقَطة تعود إلى الصفر."
        why: القيم الملتقَطة تحتفظ بقيمها؛ لا شيء يعود إلى الصفر.
      - text: "`true`"
        why: "صحيح. الـ closure التقط `limit` بقيمة 60، و64 أكبر من 60."
    answer: 2
---

حلقات `for` من الدرس السابق تعمل، لكنها تجعلك تقرأ خمسة أسطر لتعرف معلومة واحدة، مثل «مجموع ما أُنفق على الطعام». الدوال تعطي قطعة من المنطق اسمًا. والـ closures تتيح لك أن تسلّم قطعة صغيرة من المنطق إلى طرف آخر، مثل «أبقِ ما يزيد على 50»، ودوال المجموعات في Swift مبنية حولها. معًا تحوّلان معظم حلقات التكرار في Pocket Budget إلى سطر واحد مقروء.

للأمثلة، إليك نوع مصروف بسيطًا. ستتعلّم ما يعنيه `struct` فعلًا في القسم التالي؛ أما الآن فاقرأه على أنه «قيمة لها عنوان ومبلغ وتصنيف».

```swift title=Expense.swift
import Foundation

struct Expense {
    let title: String
    let amount: Decimal
    let category: String
}

let expenses = [
    Expense(title: "Groceries", amount: 64.2, category: "Food"),
    Expense(title: "Bus pass", amount: 45, category: "Transport"),
    Expense(title: "Coffee", amount: 4.5, category: "Food"),
    Expense(title: "Concert", amount: 80, category: "Fun"),
]
```

## دوال تُقرأ كالجمل

```swift
func total(of expenses: [Expense], in category: String? = nil) -> Decimal {
    var sum: Decimal = 0
    for expense in expenses where category == nil || expense.category == category {
        sum += expense.amount
    }
    return sum
}

total(of: expenses)                  // 193.7
total(of: expenses, in: "Food")      // 68.7
```

لكل معامل اسمان. **تسمية الوسيط** (argument label) مثل `of` و`in` هي ما يكتبه من يستدعي الدالة؛ و**اسم المعامل** (parameter name) مثل `expenses` و`category` هو ما يستخدمه جسم الدالة. هذا الفصل هو سبب قراءة مواضع الاستدعاء في Swift كأنها جمل إنجليزية: "total of expenses in Food". والجزء `= nil` يعطي `category` قيمة افتراضية، فيستطيع المستدعي حذفه. اكتب `_` كتسمية حين لا تضيف شيئًا، كما في `print(_:)`.

يعلن `-> Decimal` نوع القيمة المُعادة. والدالة التي لا تعيد شيئًا تحذف السهم.

## الـ closures: دوال بلا أسماء

الـ closure (دالة مجهولة الاسم) كتلة كود يمكنك تخزينها في ثابت أو تمريرها كوسيط. إليك closure يقرّر ما إذا كان المصروف كبيرًا:

```swift
let isLarge: (Expense) -> Bool = { expense in
    expense.amount > 50
}
isLarge(expenses[0])     // true
```

يُقرأ النوع `(Expense) -> Bool` «يأخذ `Expense` ويعيد `Bool`». المعاملات تأتي قبل `in`، والجسم بعدها. والجسم المكوّن من تعبير واحد يعيد قيمته دون كتابة `return`.

الآن مرّر منطقًا كهذا إلى `filter`. هذه الأسطر الثلاثة هي الاستدعاء نفسه، مختصرًا شيئًا فشيئًا:

```swift
let large1 = expenses.filter({ (expense: Expense) -> Bool in
    return expense.amount > 50
})
let large2 = expenses.filter { expense in expense.amount > 50 }
let large3 = expenses.filter { $0.amount > 50 }
```

حين يكون الـ closure آخر وسيط، يمكنك كتابته بعد الأقواس (**صيغة الـ trailing closure**) وحذف الأقواس الفارغة كليًا. وSwift تعرف الأنواع مسبقًا من توقيع `filter`، فيمكنك حذفها أيضًا. `$0` هو المعامل الأول، و`$1` الثاني.

:::tip متى تتوقّف عن الاختصار
استخدم `$0` في الـ closures المكوّنة من سطر واحد حين يكون المعنى واضحًا. وحين يمتدّ الـ closure على عدة أسطر أو يأخذ معاملين تحتاج إلى التمييز بينهما، فسمِّ المعاملات. أنت نفسك في المستقبل القارئ الأول لهذا الكود.
:::

## filter وmap وreduce وsorted

هذه الأربع تغطّي معظم ما تفعله مع المجموعات:

```swift
let food = expenses.filter { $0.category == "Food" }        // keep matching expenses
let titles = food.map { $0.title }                           // ["Groceries", "Coffee"]
let foodTotal = food.reduce(0) { $0 + $1.amount }            // 68.7
let biggestFirst = expenses.sorted { $0.amount > $1.amount } // Concert, Groceries, ...
```

يبدأ `reduce` من قيمة ابتدائية (0) ويطوي كل عنصر في نتيجة متراكمة: `$0` هو المجموع حتى الآن و`$1` هو المصروف التالي. ويسأل `sorted(by:)` الـ closure الخاص بك: «هل يأتي `$0` قبل `$1`؟».

اربطها في سلسلة، فيُقرأ خطّ المعالجة بالترتيب الذي يُنفَّذ به:

```swift
let foodSpend = expenses
    .filter { $0.category == "Food" }
    .map(\.amount)
    .reduce(0, +)
```

`\.amount` هو **key path** (مسار مفتاح)، اختصار لـ `{ $0.amount }`، و`+` هو نفسه دالة تأخذ قيمتين وتعيد مجموعهما، فيمكنك تمريره مباشرة إلى `reduce`.

:::figure filter وmap وreduce كخطّ معالجة
<svg viewBox="0 0 700 170" role="img" aria-labelledby="t1">
  <title id="t1">أربعة مصاريف تدخل إلى filter الذي يُبقي مصروفي الطعام؛ ثم يحوّلهما map إلى مبلغين؛ ثم يجمعهما reduce في مجموع واحد هو 68.7.</title>
  <rect class="d-box" x="10" y="50" width="130" height="70" rx="10"/>
  <text class="d-label-strong" x="75" y="80" text-anchor="middle">4 مصاريف</text>
  <text class="d-label-muted" x="75" y="102" text-anchor="middle">[Expense]</text>
  <path class="d-arrow" d="M140 85 L185 85" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="190" y="50" width="140" height="70" rx="10"/>
  <text class="d-code" x="260" y="80" text-anchor="middle">filter</text>
  <text class="d-label-muted" x="260" y="102" text-anchor="middle">عنصرا طعام</text>
  <path class="d-arrow" d="M330 85 L375 85" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="380" y="50" width="140" height="70" rx="10"/>
  <text class="d-code" x="450" y="80" text-anchor="middle">map(\.amount)</text>
  <text class="d-label-muted" x="450" y="102" text-anchor="middle">[64.2, 4.5]</text>
  <path class="d-arrow" d="M520 85 L565 85" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="570" y="50" width="120" height="70" rx="10"/>
  <text class="d-code" x="630" y="80" text-anchor="middle">reduce</text>
  <text class="d-label-muted" x="630" y="102" text-anchor="middle">68.7</text>
  <text class="d-label-muted" x="350" y="155" text-anchor="middle">كل خطوة تعيد قيمة جديدة؛ والمصفوفة الأصلية لا تتغيّر أبدًا</text>
</svg>
:::

:::mistake استدعاء sorted وتجاهل النتيجة
`expenses.sorted { … }` في سطر مستقل لا يفعل شيئًا مفيدًا: يعيد مصفوفة جديدة ثم يرميها، ويحذّرك Xcode بالرسالة "result of call to 'sorted(by:)' is unused". أسند النتيجة، أو استدعِ `sort(by:)` على مصفوفة `var` لترتيبها في مكانها.
:::

## الـ closures تلتقط ما حولها

يستطيع الـ closure أن يستخدم متغيّرات من النطاق الذي أُنشئ فيه، ويُبقيها حيّة:

```swift
func makeLimitCheck(limit: Decimal) -> (Decimal) -> Bool {
    return { amount in amount > limit }
}

let overFoodLimit = makeLimitCheck(limit: 60)
overFoodLimit(64.2)     // true
```

انتهت `makeLimitCheck`، ومع ذلك ما زال الـ closure يعرف أن `limit` يساوي 60. وحين تخزّن دالة معامل closure لتستدعيه لاحقًا، بدل أن تستدعيه قبل أن تعود، تُلزمك Swift بتعليم هذا المعامل بـ `@escaping`. هذه الكلمة ملصق تحذيري للقرّاء: هذا الـ closure يعيش أطول من الاستدعاء، فكل ما يلتقطه يبقى حيًّا أيضًا.

هذا **الالتقاط** (capturing) هو ما يسمح لأزرار SwiftUI بتشغيل كود يشير إلى بيانات الـ view بعد بنائه بوقت طويل. وله حدّ حادّ واحد، هو دورة المراجع (reference cycle) حين يلتقط class وclosure كلٌّ منهما الآخر، وستقابله مع الـ classes في الدرس التالي.

صار بإمكانك الآن أن تسمّي المنطق، وتمرّره، وتستبدل حلقات التكرار بخطوط معالجة. بهذا تكتمل أساسيات اللغة. القسم التالي عن تصميم البيانات: أن تقرّر هل تكون بيانات Pocket Budget من نوع struct أو class أو enum، ولماذا يغيّر هذا الاختيار سلوك تطبيقك.
