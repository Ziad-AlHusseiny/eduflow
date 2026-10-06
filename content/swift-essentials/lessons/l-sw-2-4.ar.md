---
summary: صِف حالات الفشل كـ enums للأخطاء، وارمِها ومرّرها باستخدام try، وعالجها بـ do-catch، وقرّر متى تستحق الـ typed throws في Swift 6 أن تستخدمها.
takeaways:
  - "صِف الطرق التي قد تفشل بها عملية ما كـ enum يتوافق مع `Error`، مع قيم مرتبطة للتفاصيل."
  - "كل استدعاء لدالة ترمي أخطاء يُعلَّم بـ `try`، فيرى القارئ بالضبط أين قد يقفز التنفيذ إلى الخارج."
  - "الكتلة `do`-`catch` تعالج الأخطاء؛ ويمكن لجمل `catch` أن تطابق حالات محدّدة، وتستقبل `catch` الأخيرة الباقي باسم `error`."
  - "`try?` تحوّل الفشل إلى `nil` وتتخلّص من السبب، فاستخدمها فقط حين لا يهمّك السبب فعلًا."
  - "الـ typed throws (`throws(BudgetError)`) تناسب الكود الذي يعالج فيه المستدعون كل حالة؛ أما `throws` غير المحدّدة النوع فتبقى الخيار الافتراضي الأفضل للـ APIs العامة."
further:
  - title: Error Handling
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling/
  - title: LocalizedError
    url: https://developer.apple.com/documentation/foundation/localizederror
quiz:
  - q: "لديك `func record(...) throws`. ماذا يعطيك `let result = try? budget.record(title: \"Tea\", amount: 3)` حين يفشل؟"
    options:
      - text: "الخطأ نفسه، مخزّنًا في `result`."
        why: "`try?` تتخلّص من الخطأ كليًا؛ لا تعرف إلا أن شيئًا ما فشل."
      - text: "`nil`، ويضيع السبب."
        why: "صحيح. هذه هي المقايضة مع `try?`، ولهذا لا تناسب إلا حالات الفشل التي كنت ستتجاهلها أصلًا."
      - text: عطل مع وصف الخطأ.
        why: "هذا ما تفعله `try!`. أما `try?` فلا تُسقط التطبيق أبدًا."
    answer: 1
  - q: "دالة تستدعي `try budget.record(...)` لكن ليس فيها `do`-`catch`. متى تُترجَم؟"
    options:
      - text: "حين تكون الدالة نفسها معلّمة بـ `throws`، فينتقل الخطأ إلى من استدعاها."
        why: صحيح. تصعد الأخطاء في سلسلة الاستدعاءات حتى يلتقطها شيء ما.
      - text: "أبدًا؛ كل `try` يجب أن تكون داخل كتلة `do`."
        why: الدالة التي ترمي أخطاء تستطيع أن تمرّر الأخطاء إلى من استدعاها دون أن تلتقطها.
      - text: دائمًا؛ الأخطاء غير الملتقَطة تُسجَّل وتُتجاهل.
        why: تفحص Swift معالجة الأخطاء وقت الترجمة. والخطأ غير الملتقَط في دالة لا ترمي أخطاء هو خطأ ترجمة.
    answer: 0
  - q: "متى تكون الـ typed throws، مثل `throws(BudgetError)`، الخيار الأفضل؟"
    options:
      - text: لكل دالة، لأن الأخطاء محدّدة النوع أدقّ دائمًا.
        why: "توصية Apple عكس ذلك؛ تبقى `throws` غير المحدّدة النوع هي الافتراضية لأنها تسمح للـ API بإضافة أنواع فشل جديدة لاحقًا."
      - text: للـ APIs العامة في المكتبات التي تعتمد عليها فرق أخرى.
        why: هنا بالتحديد يؤلم نوع الخطأ الثابت أكثر؛ فإضافة نوع فشل لاحقًا تصبح تغييرًا كاسرًا.
      - text: للكود داخل الـ module الخاص بك حيث يعالج المستدعون كل حالة بشكل شامل.
        why: "صحيح. هنا تؤتي معرفة النوع الدقيق ثمارها، مع `switch` بلا حالة التقاط عامة."
    answer: 2
---

ماذا يجب أن يحدث حين يحاول المستخدم حفظ مصروف بلا عنوان، أو بمبلغ سالب، أو بمبلغ يتجاوز ميزانية الطعام لهذا الشهر دفعة واحدة؟ إعادة optional، كما فعلت في درس الـ optionals، تخبر المستدعي *أن* العملية فشلت لكنها لا تخبره *لماذا*، وPocket Budget يحتاج إلى السبب ليعرض الرسالة المناسبة. معالجة الأخطاء في Swift تجعل الفشل جزءًا من توقيع الدالة، مع أسباب مكتوبة كأنواع.

## الأخطاء enums

ابدأ بسرد الطرق التي قد يفشل بها تسجيل مصروف:

```swift title=BudgetError.swift
import Foundation

enum BudgetError: Error, Equatable {
    case emptyTitle
    case nonPositiveAmount
    case overLimit(by: Decimal)
}
```

أي نوع يتوافق مع `Error` يمكن رميه، والـ enum ذو القيم المرتبطة هو الخيار الطبيعي: كل حالة فشلٌ واحد، و`overLimit` تحمل مقدار التجاوز الذي سيقع فيه المستخدم. ليس لـ `Error` أي متطلّبات؛ هو فقط يعلّم النوع على أنه قابل للرمي. وسيساعد `Equatable` في الاختبارات في الدرس الأخير.

## throw وtry

الدالة التي قد تفشل تصرّح بذلك عبر `throws` وتتوقّف عبر `throw`:

```swift title=CategoryBudget.swift
struct CategoryBudget {
    var limit: Decimal
    private(set) var spent: Decimal = 0

    mutating func record(title: String, amount: Decimal) throws {
        guard !title.trimmingCharacters(in: .whitespaces).isEmpty else {
            throw BudgetError.emptyTitle
        }
        guard amount > 0 else {
            throw BudgetError.nonPositiveAmount
        }
        let newTotal = spent + amount
        guard newTotal <= limit else {
            throw BudgetError.overLimit(by: newTotal - limit)
        }
        spent = newTotal
    }
}
```

`guard` و`throw` ثنائي مثالي: كل guard تنصّ على قاعدة، وفرع `else` فيها يرمي الخطأ المناسب. و`private(set)` تسمح لأي أحد بقراءة `spent` لكنها لا تسمح بتغييرها إلا للميزانية نفسها، فتكون الطريقة الوحيدة لإنفاق المال عبر `record` التي تفرض القواعد.

كل استدعاء لدالة ترمي أخطاء يجب أن يُعلَّم بـ `try`. هذه الكلمة موجّهة للبشر: امسح الدالة بعينيك بحثًا عن `try` وسترى كل سطر قد يغادر فيه التنفيذ مبكرًا.

## معالجة الأخطاء بـ do-catch

```swift
var food = CategoryBudget(limit: 50)

do {
    try food.record(title: "Dinner", amount: 62)
    print("Saved")
} catch BudgetError.overLimit(let by) {
    print("That's \(by) over your food budget")
} catch {
    print("Couldn't save: \(error)")
}
```

حين ترمي `record` خطأً، يقفز التنفيذ مباشرة إلى أول `catch` يطابق نمطها، متخطّيًا `print("Saved")`. وتستخدم جمل catch مطابقة الأنماط نفسها التي في `switch`، فيمكنك ربط القيم المرتبطة. أما `catch` الأخيرة المجرّدة فتعالج كل ما تبقّى وتعطيك الخطأ كثابت اسمه `error`.

إن لم تكن الدالة قادرة على معالجة الخطأ بشكل معقول، فليس عليها ذلك. علّمها بـ `throws` أيضًا، واستدعِ بـ `try` دون `do`، وسيصعد الخطأ إلى من استدعاها.

:::tip التقط الخطأ حيث تستطيع التصرّف
عالج الخطأ في المستوى الذي يستطيع فعل شيء مفيد به. نموذج الميزانية لا يستطيع عرض تنبيه، والدالة المساعدة التي تحلّل CSV لا تستطيع أن تقرّر هل تعيد المحاولة. هذا يعني عادةً أن النماذج والدوال المساعدة ترمي الأخطاء، والشاشة التي بدأت العملية تلتقطها، وتعرض رسالة، وتسمح للمستخدم بالمحاولة مجدّدًا.
:::

:::figure يصعد الخطأ حتى يلتقطه شيء ما
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">ترمي record الخطأ overLimit. والدالة saveExpense معلّمة بـ throws فتمرّر الخطأ إلى الأعلى. ومعالج زر Save فيه do-catch يلتقطه ويعرض رسالة.</title>
  <rect class="d-box-warn" x="20" y="150" width="190" height="60" rx="10"/>
  <text class="d-code" x="115" y="177" text-anchor="middle">record(...)</text>
  <text class="d-label-muted" x="115" y="198" text-anchor="middle">throw .overLimit</text>
  <rect class="d-box" x="245" y="85" width="190" height="60" rx="10"/>
  <text class="d-code" x="340" y="112" text-anchor="middle">saveExpense()</text>
  <text class="d-label-muted" x="340" y="133" text-anchor="middle">throws: يمرّره للأعلى</text>
  <rect class="d-box-success" x="470" y="20" width="190" height="60" rx="10"/>
  <text class="d-code" x="565" y="47" text-anchor="middle">Save button</text>
  <text class="d-label-muted" x="565" y="68" text-anchor="middle">do-catch: يعرض تنبيهًا</text>
  <path class="d-arrow" d="M210 165 L245 135" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M435 100 L470 70" marker-end="url(#arrow)"/>
</svg>
:::

## try? وtry!

هناك اختصاران. `try?` تحوّل النتيجة إلى optional: النجاح يعطي قيمة، والفشل يعطي `nil`. أما `try!` فتؤكّد أن الاستدعاء لا يمكن أن يفشل، وتُسقط التطبيق إن فشل، بالمخاطرة نفسها التي في الفكّ القسري.

:::mistake استخدام try? لإسكات الـ compiler
`try? food.record(title: title, amount: amount)` تُترجَم، فينقر المستخدم Save ولا يحدث شيء: لا مصروف ولا رسالة. لقد أهدرت المعلومة الوحيدة التي كانت الواجهة تحتاجها. استخدم `try?` فقط حين كنت ستتجاهل السبب فعلًا، مثل حذف ملف cache قد لا يكون موجودًا.
:::

## رسائل يفهمها المستخدم

`print(error)` تعرض `overLimit(by: 12)`، وهذا مقبول في السجلّ لكنه بلا فائدة في تنبيه. اجعل النوع يتوافق مع `LocalizedError` لتقدّم نصًا يفهمه البشر:

```swift
extension BudgetError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .emptyTitle: "Give the expense a name."
        case .nonPositiveAmount: "Enter an amount greater than zero."
        case .overLimit(let by): "This puts you \(by.formatted(.currency(code: "USD"))) over budget."
        }
    }
}
```

الآن تعيد `error.localizedDescription` تلك الجملة، جاهزة لتنبيه في SwiftUI.

## الـ typed throws في Swift 6

`throws` العادية تعني «قد ترمي أي `Error`». وتضيف Swift 6 الـ **typed throws** (الرمي محدّد النوع)، حيث يسمّي التوقيع النوع الدقيق:

```swift
mutating func record(title: String, amount: Decimal) throws(BudgetError) {
    // same body; inside, `throw .emptyTitle` can drop the type name
}
```

الفائدة تظهر في موضع الاستدعاء. حين ترمي كل `try` داخل كتلة `do` الخطأ `BudgetError`، يكون `error` داخل `catch` من النوع `BudgetError` لا `any Error`، فيمكنك كتابة switch شاملة عليه دون حالة التقاط عامة. اكتب `do throws(BudgetError)` لتصرّح بذلك صراحةً:

```swift
do throws(BudgetError) {
    try food.record(title: "Snack", amount: 100)
} catch {
    switch error {
    case .emptyTitle: print("Give it a name")
    case .nonPositiveAmount: print("Amount must be positive")
    case .overLimit(let by): print("That's \(by) over budget")
    }
}
```

الثمن هو الجمود: متى وعدت الدالة بـ `BudgetError`، لا تستطيع أن تبدأ برمي خطأ فكّ ترميز أو خطأ شبكة دون تغيير توقيعها وكل من يستدعيها. وتوصية مشروع Swift نفسه هي إبقاء `throws` غير المحدّدة النوع خيارًا افتراضيًا، واستخدام الـ typed throws داخل الـ module حيث يعالج المستدعون كل حالة، كما يفعل التحقّق في Pocket Budget. وفي الشبكات لاحقًا في الدورة ستبقى مع `throws` العادية، لأن تلك الاستدعاءات قد تفشل بطرق أكثر مما تتحكّم فيه.

بهذا يكتمل قسم التصميم. صار بإمكانك الآن وصف بيانات Pocket Budget وحالات فشلها بدقة. بعد ذلك تضع هذه البيانات على الشاشة باستخدام SwiftUI.
