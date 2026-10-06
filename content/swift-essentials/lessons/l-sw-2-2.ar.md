---
summary: استبدل النصوص الهشّة بالـ enums، وأرفق بيانات بكل حالة عبر القيم المرتبطة، ودع جمل switch الشاملة تجد كل مكان يحتاج إلى معالجة حالة جديدة.
takeaways:
  - الـ enum يسرد كل القيم الصالحة لنوع ما، فيتحوّل خطأ إملائي مثل "Fod" إلى خطأ ترجمة بدل أن يكون خطأً صامتًا.
  - "القيم الخام (`enum Category: String`) تعطي كل حالة نصًا أو رقمًا مخزّنًا للحفظ وفكّ الترميز."
  - "القيم المرتبطة تُرفق بيانات مختلفة بحالات مختلفة، مثل آخر أربعة أرقام في `.card`."
  - "اكتب جمل switch على الـ enums بلا `default`، فإضافة حالة جديدة تجعل الـ compiler يسرد كل switch يجب أن تحدّثها."
further:
  - title: Enumerations
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/enumerations/
  - title: CaseIterable
    url: https://developer.apple.com/documentation/swift/caseiterable
quiz:
  - q: "لديك `enum Category: String { case food, transport }`. ماذا تعيد `Category(rawValue: \"Food\")`؟"
    options:
      - text: "`.food`، لأن مطابقة القيم الخام تتجاهل حالة الأحرف."
        why: مطابقة القيم الخام دقيقة حرفيًا. القيمة الخام للحالة food هي "food" بأحرف صغيرة.
      - text: يتعطّل التطبيق، لأن "Food" ليست قيمة خام صالحة.
        why: المُهيِّئ القابل للفشل موجود تحديدًا لتجنّب التعطّل عند المدخلات السيئة.
      - text: "`nil`"
        why: "صحيح. `init(rawValue:)` قابل للفشل ويعيد `Category?`؛ و\"Food\" لا تطابق \"food\"."
    answer: 2
  - q: "أضفت `case gifts` إلى `Category`. كل جملة `switch` على `Category` تستخدم حالات صريحة دون `default`. ماذا يحدث في الترجمة التالية؟"
    options:
      - text: "يُبلغ الـ compiler عن كل switch لا تعالج `.gifts`."
        why: صحيح. فحص الشمول يحوّل مهمة «اعثر على كل مكان يحتاج تحديثًا» إلى قائمة أخطاء.
      - text: "تنجح الترجمة، وتقع `.gifts` في آخر حالة وقت التشغيل."
        why: لا توجّه Swift أبدًا حالة غير معالَجة إلى أي مكان بصمت.
      - text: "تنجح الترجمة، ويتعطّل التطبيق حين يصادف `.gifts`."
        why: "بدون `default`، تُكتشف الفجوة وقت الترجمة، لا وقت التشغيل."
    answer: 0
  - q: أيّ تعريف يصف «مدفوع بالبطاقة، ونعرف آخر أربعة أرقام منها»؟
    options:
      - text: "`case card = \"4242\"`"
        why: القيمة الخام ثابتة للحالة؛ فكل دفعة بالبطاقة ستنتهي بـ 4242.
      - text: "`case card(lastFour: String)`"
        why: صحيح. القيمة المرتبطة تُخزَّن لكل instance، فتحمل كل دفعة أرقامها الخاصة.
      - text: "`case card; var lastFour: String`"
        why: الـ enums لا يمكن أن تحتوي خصائص مخزّنة للـ instance؛ والقيم المرتبطة هي طريقة الحالات لحمل البيانات.
      - text: "`case card(String) = \"card\"`"
        why: لا تسمح Swift بالقيم الخام في enum لحالاته قيم مرتبطة.
    answer: 1
---

في القسم السابق كان تصنيف المصروف `String`. وهذا يعمل إلى أن يكتب أحدهم `"Fod"`، أو `"food"` في مكان و`"Food"` في مكان آخر، فيُسقط المجموع الشهري نصف مشترياتك من البقالة بصمت. لم يكن في النوع ما يحدّد النصوص الصالحة. أما الـ **enum** (التعداد) فيقول ذلك بالضبط: هذه هي القائمة الكاملة للقيم الممكنة، ولا شيء غيرها مسموح.

## الـ enums ذات القيم الخام

```swift title=Category.swift
enum Category: String, CaseIterable {
    case food
    case transport
    case housing
    case fun

    var title: String {
        rawValue.capitalized
    }

    var symbolName: String {
        switch self {
        case .food: "fork.knife"
        case .transport: "bus"
        case .housing: "house"
        case .fun: "ticket"
        }
    }
}
```

صار لـ `Category` أربع قيم بالضبط. اكتب `.fod` وستفشل الترجمة. والجزء `: String` يعطي كل حالة **قيمة خام** (raw value)، وهي افتراضيًا اسم الحالة كنص (`Category.food.rawValue` تساوي `"food"`)، وهي ما ستحفظه على القرص وتقرؤه من JSON لاحقًا. أما الاتجاه المعاكس فقابل للفشل، لأن ليس كل نص تصنيفًا: `Category(rawValue: "fun")` تعطي `.fun`، و`Category(rawValue: "Fun")` تعطي `nil`.

يطلب `CaseIterable` من الـ compiler أن يولّد `Category.allCases`، وهي مصفوفة بكل الحالات بترتيب تعريفها. سيمرّ منتقي التصنيفات في Pocket Budget عليها، فإضافة حالة تضيف صفًا إلى المنتقي دون أي جهد.

يمكن أن تحتوي الـ enums خصائص محسوبة وmethods، تمامًا مثل الـ structs. تربط `symbolName` كل حالة باسم أيقونة من SF Symbols، والـ `switch` بداخلها بلا `default`.

## جمل switch الشاملة ميزة

لنفترض أنك أضفت `case gifts` الشهر القادم. ستفشل الترجمة فورًا عند `symbolName` مع "switch must be exhaustive"، وعند كل `switch` أخرى على `Category` في المشروع. لقد أعدّ الـ compiler قائمة مهامك. قارن ذلك بنسخة النصوص، حيث يقع التصنيف الجديد بهدوء في أي فرع `default` كان موجودًا، ويعرض الأيقونة الخطأ في الإنتاج.

:::mistake إضافة default إلى switch على enum
`default: "questionmark"` يُخفي خطأ اليوم ويجعل خطأ الغد غير مرئي. حين تضيف `.gifts`، لا شيء يخبرك أن هذه الـ switch لم تتعلّم عنها شيئًا. في الـ enum الذي تملكه، اسرد كل حالة صراحةً ودع الـ compiler يتولّى تذكيرك بكل حالة تنساها.
:::

## القيم المرتبطة: حالات تحمل بيانات

القيم الخام ثابتة لكل حالة. لكن بعض البيانات تختلف من instance إلى آخر. يسجّل Pocket Budget طريقة دفع المصروف، وكل طريقة تحتاج تفاصيل مختلفة:

```swift title=PaymentMethod.swift
enum PaymentMethod {
    case cash
    case card(lastFour: String)
    case transfer(bank: String, reference: String?)
}

let lunch: PaymentMethod = .cash
let groceries: PaymentMethod = .card(lastFour: "4242")
let rent: PaymentMethod = .transfer(bank: "Monzo", reference: "RENT-10")
```

لكل حالة شكلها الخاص. الدفع النقدي لا يحمل شيئًا، والدفع بالبطاقة يحمل أربعة أرقام، والتحويل يحمل اسم البنك ومرجعًا اختياريًا. لو استخدمت struct لاحتجت إلى ثلاث خصائص optional وتعليق يشرح أيّها يُملأ ومتى. أما الـ enum فيجعل التركيبات غير الصالحة، مثل دفع نقدي معه اسم بنك، مستحيلة البناء أصلًا.

:::figure enum واحد وثلاث حالات بأشكال مختلفة
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">يتفرّع الـ enum المسمّى PaymentMethod إلى ثلاث حالات: cash بلا بيانات، وcard تحمل lastFour، وtransfer تحمل bank ومرجعًا اختياريًا reference.</title>
  <rect class="d-box-primary" x="250" y="15" width="180" height="50" rx="10"/>
  <text class="d-code" x="340" y="46" text-anchor="middle">PaymentMethod</text>
  <path class="d-arrow" d="M300 65 L120 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 65 L340 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 65 L560 115" marker-end="url(#arrow)"/>
  <rect class="d-box" x="40" y="120" width="160" height="70" rx="10"/>
  <text class="d-code" x="120" y="150" text-anchor="middle">.cash</text>
  <text class="d-label-muted" x="120" y="172" text-anchor="middle">بلا بيانات</text>
  <rect class="d-box-accent" x="260" y="120" width="160" height="70" rx="10"/>
  <text class="d-code" x="340" y="150" text-anchor="middle">.card</text>
  <text class="d-label-muted" x="340" y="172" text-anchor="middle">lastFour</text>
  <rect class="d-box-success" x="480" y="120" width="180" height="70" rx="10"/>
  <text class="d-code" x="570" y="150" text-anchor="middle">.transfer</text>
  <text class="d-label-muted" x="570" y="172" text-anchor="middle">bank, reference?</text>
</svg>
:::

## استخراج البيانات من جديد

تقرأ القيم المرتبطة عبر مطابقة الأنماط (pattern matching) داخل `switch`:

```swift
func label(for method: PaymentMethod) -> String {
    switch method {
    case .cash:
        return "Cash"
    case .card(let lastFour):
        return "Card ending \(lastFour)"
    case .transfer(let bank, let reference?):
        return "\(bank) transfer, ref \(reference)"
    case .transfer(let bank, nil):
        return "\(bank) transfer"
    }
}

label(for: groceries)   // "Card ending 4242"
```

تربط `let lastFour` القيمة المرتبطة بثابت جديد داخل تلك الحالة. وحالتا `.transfer` تُظهران إلى أي مدى تصل الأنماط: `let reference?` لا تطابق إلا حين يكون للمرجع الاختياري قيمة، وتفكّه، و`nil` تطابق حين لا تكون له قيمة. وما زال الـ compiler يتحقّق من أن الحالتين معًا تغطّيان كل الاحتمالات.

حين تهمّك حالة واحدة فقط، تكون `if case` أقصر من switch كاملة:

```swift
if case .card(let lastFour) = groceries {
    print("Remind me to check card \(lastFour)")
}
```

:::note أنت تستخدم enum منذ الدرس الثاني
`Optional` هو enum له حالتان، `.some(Wrapped)` و`.none`، و`nil` اختصار لـ `.none`. كل `if let` كتبتها هي مطابقة أنماط على enum له قيمة مرتبطة.
:::

## enums بدل فوضى القيم المنطقية

الـ enums هي الأداة الصحيحة كلما كانت القيمة «واحدة بالضبط من هذه». المثال الكلاسيكي هو تحميل البيانات. المسوّدة الأولى تبدو عادةً كثلاث خصائص منفصلة: `isLoading` و`rates` و`errorMessage`. لا شيء يمنع أن تُضبط الثلاث معًا، فتضطر كل شاشة إلى تخمين أيّها يفوز. enum واحد يُلغي التخمين:

```swift
enum LoadState {
    case idle
    case loading
    case loaded([String: Decimal])
    case failed(String)
}
```

صارت الأسعار موجودة فقط في الحالة `.loaded`، والرسالة فقط في `.failed`، وتعالج `switch` واحدة في الـ view كل حالة مرة واحدة. ستبني هذا بالضبط حين يبدأ Pocket Budget بجلب أسعار الصرف. استخدم enum كلما وجدت نفسك تقارن نصوصًا أو تتلاعب بقيم منطقية لا يجب أن تكون صحيحة معًا أبدًا.

صارت أنواعك الآن قادرة على وصف بيانات Pocket Budget بدقة. بعد ذلك ستمنحها قدرات مشتركة عبر الـ protocols، مثل «قابل للمقارنة» أو «له معرّف ثابت»، وتضيف سلوكًا إلى أنواع موجودة عبر الـ extensions.
