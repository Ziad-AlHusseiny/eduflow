---
summary: اقرأ أنواع الـ optional، وفكّها بأمان باستخدام if let وguard let و??، واشرح لماذا يُعدّ الفكّ القسري عطلًا ينتظر لحظته.
takeaways:
  - "الـ optional مثل `Decimal?` إما أن يحمل قيمة أو يحمل `nil`، ولن تسمح لك Swift باستخدامه كقيمة عادية حتى تفكّه."
  - "استخدم `guard let` لفكّ القيمة في أعلى الدالة والخروج مبكرًا، فيعمل باقي الدالة بقيمة حقيقية."
  - "استخدم `if let` حين تحتاج القيمة داخل فرع واحد فقط، و`??` حين توجد قيمة افتراضية منطقية."
  - "الفكّ القسري (`!`) يُسقط التطبيق في اللحظة التي تكون فيها القيمة `nil`؛ اعتبر كل `!` ادّعاءً يجب أن تستطيع إثباته."
further:
  - title: Optionals (The Basics)
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/#Optionals
  - title: Optional
    url: https://developer.apple.com/documentation/swift/optional
quiz:
  - q: "لديك `let note: String? = nil`. ما قيمة `note?.count ?? 0`؟"
    options:
      - text: "`nil`"
        why: "الـ optional chaining ينتج `nil` هنا فعلًا، لكن `?? 0` يستبدلها بعد ذلك بالقيمة الافتراضية."
      - text: "`0`"
        why: "صحيح. `note?.count` يتوقّف مبكرًا وينتج `nil`، ثم يقدّم `??` القيمة `0`."
      - text: يتعطّل البرنامج.
        why: "الفكّ القسري (`!`) وحده يُسقط التطبيق عند `nil`. أما `?.` و`??` فهما الصيغتان الآمنتان."
      - text: "لا يُترجَم، لأنك لا تستطيع استدعاء `count` على optional."
        why: "لا تستطيع استدعاءها مباشرة، لكن `?.` هي بالضبط الصيغة التي تجعل الاستدعاء مسموحًا."
    answer: 1
  - q: "داخل دالة، بعد `guard let amount = parseAmount(text) else { return }`، ما الصحيح بشأن `amount` في السطر التالي؟"
    options:
      - text: "ما زال من النوع `Decimal?`، فتحتاج إلى فكّه مرة أخرى."
        why: "`guard let` يربط قيمة غير optional؛ هذا هو الهدف منه أصلًا."
      - text: "لا يوجد إلا داخل كتلة `else`."
        why: "داخل `else` تكون القيمة غائبة، فلا يوجد ما يُربط أصلًا. أما الاسم الذي يربطه `guard let` فيبقى متاحًا بعد الـ guard حتى نهاية النطاق."
      - text: "صار قيمة `Decimal` غير optional تستطيع استخدامها حتى نهاية الدالة."
        why: صحيح. فرع `else` يجب أن يغادر النطاق، لذلك يعرف الـ compiler أن `amount` له قيمة بعد ذلك.
    answer: 2
  - q: 'متى يكون الفكّ القسري مثل `URL(string: "https://example.com")!` مقبولًا؟'
    options:
      - text: "حين تكون المدخلات قيمة ثابتة كتبتها واختبرتها بنفسك، فتكون `nil` خطأً من المبرمج."
        why: صحيح. العطل هنا يشير إلى خطأ إملائي في كودك أنت، لا إلى مدخلات سيئة من المستخدم.
      - text: كلما جاءت القيمة من المستخدم، لأنه عادةً يكتب نصًا صحيحًا.
        why: "مدخلات المستخدم هي بالضبط المكان الذي تظهر فيه `nil`. فكّها باستخدام `guard let` أو `if let`."
      - text: "أبدًا؛ فالعامل `!` أصبح مهجورًا في Swift 6."
        why: "العامل `!` ليس مهجورًا. إنه أداة مقصودة لها حدّ حادّ."
      - text: "كلما أردت كودًا أسرع قليلًا من `if let`."
        why: لا يوجد فرق يُذكر في السرعة. الاختيار يتعلّق بالأمان.
    answer: 0
  - q: "أيّ سطر يُترجَم حين يكون `limit` من النوع `Int?`؟"
    options:
      - text: "`let doubled = limit * 2`"
        why: "لا يمكنك إجراء عمليات حسابية على optional؛ تحتاج Swift أن تعرف ماذا تفعل حين يكون `nil`."
      - text: "`let doubled = (limit ?? 0) * 2`"
        why: "صحيح. العامل `??` يحوّل `Int?` إلى `Int`، فتصبح عملية الضرب واضحة التعريف."
      - text: "`let doubled: Int = limit`"
        why: "لا يمكن إسناد `Int?` إلى `Int` دون فكّه أولًا."
    answer: 1
---

ينقر المستخدم على Add Expense، ويكتب "12.50" في حقل المبلغ، ثم ينقر Save. يستقبل كودك `String`. وتحويلها إلى رقم قد يفشل: ربما الحقل فارغ، أو ربما كتب المستخدم "twelve". كثير من اللغات تعطيك في هذه الحالة `NaN` أو صفرًا أو استثناءً. أما Swift فتعطيك **optional** (قيمة اختيارية)، وتُلزمك بالتعامل مع حالة الغياب قبل أن يُترجَم الكود.

## ما هو الـ optional

```swift
import Foundation

let typed = "12.50"
let amount = Decimal(string: typed)   // amount is Decimal?, not Decimal
```

علامة الاستفهام في `Decimal?` تعني «قيمة `Decimal`، أو لا شيء». و«لا شيء» تُكتب `nil`. في الداخل، الـ optional هو enum له حالتان، `.some(value)` و`.none`، ولهذا يمكنك أن تتخيّله صندوقًا إما ممتلئًا أو فارغًا.

:::figure الـ optional صندوق إما ممتلئ أو فارغ
<svg viewBox="0 0 640 220" role="img" aria-labelledby="t1">
  <title id="t1">تعيد Decimal(string:) قيمة Decimal اختيارية. مع "12.50" يحمل الصندوق 12.5؛ ومع نص فارغ يكون الصندوق فارغًا، أي nil. الفكّ يفتح الصندوق.</title>
  <rect class="d-box" x="20" y="80" width="170" height="56" rx="10"/>
  <text class="d-code" x="105" y="113" text-anchor="middle">Decimal(string:)</text>
  <path class="d-arrow" d="M190 100 L300 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M190 116 L300 170" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="305" y="20" width="150" height="60" rx="10"/>
  <text class="d-code" x="380" y="47" text-anchor="middle">.some(12.5)</text>
  <text class="d-label-muted" x="380" y="68" text-anchor="middle">"12.50"</text>
  <rect class="d-box-warn" x="305" y="140" width="150" height="60" rx="10"/>
  <text class="d-code" x="380" y="167" text-anchor="middle">nil</text>
  <text class="d-label-muted" x="380" y="188" text-anchor="middle">"" أو "twelve"</text>
  <path class="d-arrow" d="M455 50 L540 50" marker-end="url(#arrow)"/>
  <text class="d-label" x="590" y="55" text-anchor="middle">افتحه</text>
  <path class="d-arrow" d="M455 170 L540 170" marker-end="url(#arrow)"/>
  <text class="d-label" x="590" y="175" text-anchor="middle">عالِجه</text>
</svg>
:::

الـ optional ليس هو القيمة التي في داخله. جرّب `amount + 5` وسيوقفك الـ compiler بالرسالة "value of optional type 'Decimal?' must be unwrapped to a value of type 'Decimal'". هذا الخطأ هو الميزة نفسها. كل مكان قد تغيب فيه القيمة مُعلَّم في النوع، ولن تسمح لك Swift بأن تنساه.

## if let: استخدم القيمة في فرع واحد

يفحص `if let` الصندوق، وحين يكون ممتلئًا يعطيك القيمة باسم جديد غير optional:

```swift
if let amount = Decimal(string: typed) {
    print("Adding \(amount)")          // amount is a Decimal here
} else {
    print("That isn't a number")
}
```

حين يطابق الاسم الجديد اسم optional موجود، تسمح لك Swift 5.7 وما بعدها بحذف الطرف الأيمن: `if let amount { … }`. الاسم الجديد `amount` لا يوجد إلا داخل الأقواس، وهذا مثالي حين تهمّك القيمة في فرع صغير واحد.

## guard let: اخرج مبكرًا وأبقِ المسار السعيد مستويًا

في أغلب الأحيان، القيمة الغائبة تعني «توقّف هنا». و`guard let` يقول ذلك بالضبط. هذه هي الدالة التي يستخدمها Pocket Budget للتحقّق من حقل المبلغ:

```swift title=AmountParser.swift
import Foundation

func parseAmount(_ text: String) -> Decimal? {
    let trimmed = text.trimmingCharacters(in: .whitespaces)
    guard let amount = Decimal(string: trimmed), amount > 0 else {
        return nil
    }
    return amount
}

print(parseAmount("12.50") as Any)   // Optional(12.5)
print(parseAmount("") as Any)        // nil
print(parseAmount("-3") as Any)      // nil
```

يجب أن تغادر كتلة `else` النطاق الحالي باستخدام `return` أو `throw` أو `break` أو `continue`، والـ compiler يفرض ذلك. وفي المقابل، يبقى `amount` متاحًا كقيمة `Decimal` عادية حتى نهاية الدالة. الفاصلة تضيف شرطًا ثانيًا، فيرفض guard واحد الحالتين معًا: «ليس رقمًا» و«صفر أو سالب». الكود المكتوب بهذه الطريقة يُقرأ من الأعلى إلى الأسفل: الفحوصات أولًا، ثم العمل الحقيقي، بلا هرم من جمل `if` المتداخلة.

:::tip اجعل guard خيارك الافتراضي
استخدم `guard let` في أعلى الدوال، و`if let` للفروع القصيرة المحلية. إن وجدت نفسك داخل ثلاث جمل `if let` متداخلة، فأعد كتابتها على شكل guards.
:::

## ?? والـ optional chaining

أحيانًا يكون للقيمة الغائبة بديل واضح. عامل الدمج مع nil‏ `??` يقدّمه لك:

```swift
let note: String? = nil
let label = note ?? "No note"        // "No note"
let noteLength = note?.count ?? 0    // 0
```

`note?.count` هو **optional chaining** (السلسلة الاختيارية): إذا كان `note` يساوي `nil`، يصبح التعبير كله `nil` بدل أن يتعطّل التطبيق، ثم يحوّل `??` ذلك إلى `0`. يمكن أن تكون السلاسل طويلة (`expense?.category?.name`)، وتتوقّف عند أول `nil`.

والـ optionals قرار تصميمي أيضًا، لا مجرّد شيء تعطيك إيّاه الدوال. في Pocket Budget، لكل مصروف عنوان ومبلغ دائمًا، فهما `String` و`Decimal` عاديان. أما الملاحظة فاختيارية فعلًا، لذلك نوعها `String?`. قاوم إغراء جعل الأشياء optional «من باب الاحتياط»: كل `?` تضيفها هي سؤال على كل من يقرأ تلك القيمة أن يجيب عنه. اجعل الخاصية optional فقط حين يكون «لا قيمة» حالة حقيقية لها معنى.

## الفكّ القسري

هناك طريقة أخرى لفتح الصندوق: `!`.

```swift
let amount = Decimal(string: typed)!
```

إذا كانت `typed` تساوي "12.50"، يعمل هذا. وإذا كان الحقل فارغًا، يموت تطبيقك بالرسالة "Fatal error: Unexpectedly found nil while unwrapping an Optional value". لا رسالة خطأ للمستخدم، ولا فرصة للتعافي.

:::mistake الفكّ القسري لمدخلات المستخدم
`Decimal(string: field)!` ينجح في كل اختبار تكتبه بأرقام معقولة، ثم يتعطّل عند أول مستخدم ينقر Save وحقل المبلغ فارغ. كل ما يأتي من شخص أو ملف أو من الشبكة يمكن أن يكون `nil`. استخدم `guard let` واعرض رسالة بدلًا من ذلك.
:::

للعامل `!` استخدامات مشروعة، مثل `URL(string: "https://example.com")!` المبني من قيمة كتبتها بنفسك. هنا، `nil` تعني خطأً إملائيًا في كودك، والتعطّل أثناء التطوير هو أسرع طريقة لاكتشافه. كن مستعدًا للدفاع عن كل `!` أثناء مراجعة الكود.

:::note محلّل متساهل
تقرأ `Decimal(string:)` أكبر عدد ممكن من الأرقام في البداية: `Decimal(string: "12,50")` يعطي `12` لا `nil`. في درس [القوائم والتنقّل والنماذج](lesson:l-sw-3-3) تستبدل التحليل اليدوي بحقل `TextField` يفهم الإعدادات المحلية للمستخدم.
:::

مع الـ optionals صار بإمكانك التعامل مع قيمة واحدة غائبة بأمان. بعد ذلك ستخزّن قيمًا كثيرة دفعة واحدة في المصفوفات والقواميس والمجموعات، وتتنقّل بينها بحلقات التكرار و`switch`.
