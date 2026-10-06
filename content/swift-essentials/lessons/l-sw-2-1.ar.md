---
summary: توقّع سلوك الـ structs والـ classes عند نسخها، واستخدم الـ mutating methods بشكل صحيح، واكسر دورة الاحتفاظ التي يسبّبها closure باستخدام weak self.
takeaways:
  - إسناد struct ينتج نسخة مستقلّة؛ أما إسناد instance من class فينتج مرجعًا ثانيًا إلى الكائن نفسه.
  - "الـ struct المعرّف بـ `let` مجمّد بالكامل، بينما المرجع إلى class المعرّف بـ `let` ما زال يسمح بتغيير خصائص الكائن المعرّفة بـ `var`."
  - "الـ methods في الـ struct التي تغيّر الخصائص يجب أن تُعلَّم بـ `mutating`، ولا تُستدعى إلا على `var`."
  - اجعل الـ struct خيارك الافتراضي للبيانات؛ واستخدم class حين تحتاج إلى هوية مشتركة، مثل كائن واحد تراقبه شاشات كثيرة.
  - "الـ class الذي يخزّن closure يلتقط `self` التقاطًا قويًا ينشئ دورة احتفاظ (retain cycle)؛ التقط `[weak self]` لكسرها."
further:
  - title: Choosing Between Structures and Classes
    url: https://developer.apple.com/documentation/swift/choosing-between-structures-and-classes
  - title: Structures and Classes
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/
  - title: Automatic Reference Counting
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/
quiz:
  - q: "`Budget` هو struct فيه `mutating func record(_:)`. لماذا لا يُترجَم `let food = Budget(limit: 300); food.record(42)`؟"
    options:
      - text: الـ structs لا يمكن أن تحتوي methods تغيّر الخصائص.
        why: "يمكنها ذلك، بشرط أن تُعلَّم الـ method بـ `mutating` وتُستدعى على `var`."
      - text: "`food` معرّف بـ `let`، فالقيمة كلها غير قابلة للتغيير والـ mutating methods ممنوعة عليها."
        why: "صحيح. غيّره إلى `var food` وسيُترجَم الاستدعاء."
      - text: "يجب أن تُعلَّم الـ method بـ `static`."
        why: "الـ methods من نوع `static` تنتمي إلى النوع نفسه، لا إلى ميزانية بعينها. هذا يغيّر التصميم ولا يصلح الخطأ."
    answer: 1
  - q: "`Account` هو class. لديك `let a = Account(balance: 500); let b = a; b.balance -= 50`. ما قيمة `a.balance`؟"
    options:
      - text: "450"
        why: "صحيح. `a` و`b` يشيران إلى الكائن نفسه، فالتغيير عبر أحدهما يظهر عبر الآخر."
      - text: "500"
        why: هذا سلوك الـ struct. إسناد الـ class ينسخ المرجع، لا الكائن.
      - text: "لا يُترجَم لأن `b` معرّف بـ `let`."
        why: "`let` يجمّد المرجع `b`، لا خصائص الكائن المعرّفة بـ `var`."
    answer: 0
  - q: أيّ البيانات في Pocket Budget هي الأنسب لأن تكون class بدل struct؟
    options:
      - text: مصروف واحد له عنوان ومبلغ وتاريخ.
        why: المصروف بيانات بسيطة لا هوية لها سوى قيمها؛ والـ struct يُبقي النسخ مستقلّة وآمنة.
      - text: زوج من تاريخَي بداية ونهاية لتقرير.
        why: البيانات الصغيرة غير القابلة للتغيير هي المثال النموذجي للـ struct.
      - text: المخزن المشترك الوحيد الذي تقرأ منه عدة شاشات وتحدّثه.
        why: صحيح. عدة شاشات تحتاج إلى رؤية الـ instance نفسه، وهذا بالضبط ما يمنحه لك سلوك المرجع.
      - text: رمز عملة مثل "EUR".
        why: "الرمز قيمة؛ يناسبه struct أو حتى `String` عادي أكثر."
    answer: 2
  - q: "يخزّن class القيمة `onTrigger = { print(self.threshold) }` في إحدى خصائصه. ما النتيجة؟"
    options:
      - text: "يحصل الـ closure على نسخة من `self`، فلا تظهر له التغييرات على الكائن."
        why: الـ classes لا تُنسخ أبدًا بالالتقاط. الـ closure يحمل مرجعًا قويًا إلى الكائن نفسه.
      - text: "ترفض Swift ترجمة أي closure يذكر `self`."
        why: "Swift تُلزمك فقط بكتابة `self.` صراحةً في الـ escaping closures؛ ولا تمنع التقاطه."
      - text: لا شيء خاص؛ يحرّر ARC الاثنين عند إغلاق الشاشة.
        why: لا يستطيع ARC تحرير كائنات يُبقي كلٌّ منها الآخر حيًّا. هذه هي المشكلة كلها.
      - text: الكائن والـ closure يُبقي كلٌّ منهما الآخر حيًّا، فلا يُحرَّر الكائن أبدًا.
        why: "صحيح. التقط `[weak self]` حتى لا يمتلك الـ closure الكائن."
    answer: 3
---

تفتح مصروفًا، وتغيّر مبلغه من 4.50 إلى 5.00 في شاشة التعديل، ثم تنقر Cancel. هل يجب أن تبقى القائمة تعرض 4.50؟ مع الـ struct (البنية) يحدث ذلك تلقائيًا. أما مع الـ class (الصنف)، فالقائمة تعرض 5.00 بالفعل، لأن شاشة التعديل والقائمة كانتا تنظران إلى الكائن نفسه. هذا الفرق الواحد، سلوك **القيمة** مقابل سلوك **المرجع**، يحدّد سلوك تطبيق iOS أكثر من أي قرار تصميمي آخر.

## الـ structs تُنسَخ

هذا هو نوع المصروف، وخصائصه الآن معرّفة بـ `var` حتى يمكن تعديله:

```swift title=Expense.swift
import Foundation

struct Expense {
    var title: String
    var amount: Decimal
}

var original = Expense(title: "Coffee", amount: 4.5)
var draft = original
draft.amount = 5

print(original.amount)   // 4.5
print(draft.amount)      // 5
```

`var draft = original` تنتج نسخة كاملة مستقلّة. تعديل المسوّدة لا يمكن أن يؤثّر في الأصل، فتستطيع شاشة التعديل أن تعمل على مسوّدة، ولا يكلّف زر Cancel شيئًا: ترمي المسوّدة وحسب. تعطي Swift كل struct مُهيِّئًا مجانيًا اسمه **memberwise initializer**، ولهذا يعمل `Expense(title:amount:)` دون أن تكتب `init`.

النصوص والمصفوفات والقواميس و`Decimal` و`Int` كلها structs. لهذا أعطتك `var copy = amounts` في درس المجموعات مصفوفة مستقلّة. وتجعل Swift هذه النسخ رخيصة بمشاركة التخزين إلى أن يغيّره أحد الطرفين فعلًا.

## الـ classes تُشارَك

```swift
final class Account {
    var balance: Decimal

    init(balance: Decimal) {
        self.balance = balance
    }
}

let checking = Account(balance: 500)
let sameAccount = checking
sameAccount.balance -= 50

print(checking.balance)          // 450
print(checking === sameAccount)  // true: same instance
```

الـ instance (النسخة) من class يعيش في مكان واحد؛ والمتغيّرات تحمل مراجع إليه. `let sameAccount = checking` تنسخ المرجع، فيشير الاسمان إلى الحساب نفسه. والعامل `===` يسأل «هل هذا هو الـ instance نفسه تمامًا؟»، وهو سؤال لا معنى له مع الـ structs. تحتاج الـ classes إلى `init` صريح للخصائص المخزّنة التي لا قيم افتراضية لها. علّمها بـ `final` إلا إذا كنت تخطّط للوراثة منها، وهذا نادر في Swift الحديثة.

:::figure نسخ struct مقابل نسخ مرجع إلى class
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">على اليسار، original وdraft صندوقا Expense منفصلان بمبلغين 4.5 و5. على اليمين، checking وsameAccount اسمان يشير سهماهما إلى صندوق Account واحد مشترك رصيده 450.</title>
  <text class="d-label-strong" x="170" y="28" text-anchor="middle">struct: قيمتان</text>
  <rect class="d-box-success" x="30" y="60" width="130" height="80" rx="10"/>
  <text class="d-code" x="95" y="90" text-anchor="middle">original</text>
  <text class="d-label" x="95" y="118" text-anchor="middle">المبلغ 4.5</text>
  <rect class="d-box-success" x="190" y="60" width="130" height="80" rx="10"/>
  <text class="d-code" x="255" y="90" text-anchor="middle">draft</text>
  <text class="d-label" x="255" y="118" text-anchor="middle">المبلغ 5</text>
  <text class="d-label-muted" x="175" y="175" text-anchor="middle">نسختان مستقلّتان</text>
  <path class="d-line d-dashed" d="M350 20 L350 230"/>
  <text class="d-label-strong" x="530" y="28" text-anchor="middle">class: كائن واحد</text>
  <rect class="d-box" x="390" y="60" width="120" height="40" rx="8"/>
  <text class="d-code" x="450" y="85" text-anchor="middle">checking</text>
  <rect class="d-box" x="560" y="60" width="130" height="40" rx="8"/>
  <text class="d-code" x="625" y="85" text-anchor="middle">sameAccount</text>
  <path class="d-arrow" d="M450 100 L515 160" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M625 100 L560 160" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="460" y="165" width="160" height="60" rx="10"/>
  <text class="d-code" x="540" y="190" text-anchor="middle">Account</text>
  <text class="d-label" x="540" y="212" text-anchor="middle">الرصيد 450</text>
</svg>
:::

## let تعني أشياء مختلفة

`let` تجمّد ما يحمله الاسم. في الـ struct يحمل الاسم القيمة كلها، فلا يمكن تغيير أي شيء بداخلها. وفي الـ class يحمل الاسم مرجعًا، فيكون المرجع ثابتًا لكن خصائص الكائن المعرّفة بـ `var` تبقى قابلة للتغيير، وهذا بالضبط سبب ترجمة `sameAccount.balance -= 50` رغم أن `sameAccount` معرّف بـ `let`.

الـ methods (الدوال التابعة) في الـ struct التي تغيّر الخصائص يجب أن تصرّح بذلك عبر `mutating`:

```swift
struct Budget {
    var limit: Decimal
    var spent: Decimal = 0

    var remaining: Decimal { limit - spent }   // computed property

    mutating func record(_ amount: Decimal) {
        spent += amount
    }
}

var food = Budget(limit: 300)
food.record(42)
print(food.remaining)   // 258
```

:::mistake استدعاء mutating method على let
`let food = Budget(limit: 300)` يليه `food.record(42)` يفشل مع الرسالة "cannot use mutating member on immutable value: 'food' is a 'let' constant". والـ compiler محقّ: أنت قلت إن هذه الميزانية لا تتغيّر أبدًا. اجعلها `var`، أو أعد التفكير في ما إذا كان يجب أن تتغيّر.
:::

## أيّهما تختار

توصية Apple، وتوصيتي أنا، هي أن **تبدأ بـ struct**. القيم أسهل في التفكير لأن لا شيء يستطيع تغييرها من وراء ظهرك، وهي آمنة للتمرير بين الـ threads، وهذا مهم جدًا في Swift 6. استخدم class حين تحتاج إلى **هوية**: شيء واحد مشترك تراه أجزاء متعدّدة من التطبيق وتحدّثه. في Pocket Budget، كل `Expense` هو struct، أما المخزن الذي يملك القائمة وتراقبه عدة شاشات فسيكون class. والماكرو `@Observable` من إطار Observation و`@Model` من SwiftData، اللذان ستستخدمهما لاحقًا، يتطلّبان classes لهذا السبب تحديدًا.

اختبار سريع حين لا تكون متأكّدًا: تخيّل أنك تسلّم نسخة إلى شاشة أخرى. إن كان يجب أن تحصل تلك الشاشة على نسختها الخاصة لتعدّلها بحرية، فأنت تريد struct. وإن كان يجب أن ترى كل تغيير يجريه باقي التطبيق، وأن تظهر تغييراتها في كل مكان، فأنت تريد class. معظم البيانات في معظم التطبيقات تنجح في الاختبار الأول.

## ARC ودورات الاحتفاظ

تُحرَّر الـ classes عبر **العدّ التلقائي للمراجع** (ARC): كل مرجع قوي يضيف واحدًا إلى عدّاد، وحين يصل العدّاد إلى الصفر يُحرَّر الكائن ويُنفَّذ `deinit` الخاص به. تبدأ المشكلة حين يخزّن كائنٌ closure يلتقط الكائن نفسه:

```swift title=BudgetAlert.swift
final class BudgetAlert {
    let threshold: Decimal
    var onTrigger: (() -> Void)?

    init(threshold: Decimal) {
        self.threshold = threshold
    }

    func arm() {
        onTrigger = { [weak self] in
            guard let self else { return }
            print("Spent more than \(self.threshold)")
        }
    }

    deinit { print("BudgetAlert freed") }
}
```

بدون `[weak self]`، يمتلك التنبيهُ الـ closure ويمتلك الـ closure التنبيه. لا يصل أيّ من العدّادين إلى الصفر أبدًا، ولا يُنفَّذ `deinit`، وتكون قد سرّبت ذاكرة. قائمة الالتقاط `[weak self]` تجعل مرجع الـ closure ضعيفًا واختياريًا، فيفكّه `guard let self` ما دام الكائن حيًّا. الـ struct وحده لا يستطيع تكوين هذه الدورات، وهذا سبب آخر لكون الـ structs الخيار الافتراضي.

القيمة أو المرجع نصف عملية التصميم. والنصف الآخر هو وصف بيانات تأتي بأشكال مختلفة، مثل مصروف مدفوع بالبطاقة مقابل آخر مدفوع نقدًا. لهذا وُجدت الـ enums ذات القيم المرتبطة، وهي موضوع الدرس التالي.
