---
summary: خزّن المصاريف في المصفوفات والقواميس والمجموعات، وتنقّل بينها بحلقة for-in، واتّخذ القرارات بجملة switch شاملة يفحصها الـ compiler عنك.
takeaways:
  - "المصفوفة مرتّبة وفهارسها تبدأ من 0؛ والقراءة بعد نهايتها تُسقط التطبيق، لذلك فضّل `first` و`last` و`for-in` على الفهارس اليدوية."
  - "البحث في القاموس يعيد دائمًا optional، لأن المفتاح قد لا يكون موجودًا؛ والصيغة `dict[key, default: 0]` تعطيك قيمة بديلة."
  - "المجموعة (Set) تخزّن قيمًا فريدة، وفحص `contains` فيها سريع، ولا ترتيب لعناصرها."
  - "جملة `switch` في Swift يجب أن تغطّي كل قيمة ممكنة، ولا تنتقل ضمنيًا إلى الحالة التالية، ويمكنها مطابقة النطاقات وشروط `where`."
further:
  - title: Collection Types
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/collectiontypes/
  - title: Control Flow
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/controlflow/
quiz:
  - q: "لديك `let limits = [\"Food\": 300]`. ما نوع `limits[\"Fun\"]`؟"
    options:
      - text: "`Int`، وقيمته 0"
        why: "لا تخترع Swift قيمة لمفتاح غير موجود. أنت تطلب القيمة الافتراضية صراحةً باستخدام `default:`."
      - text: "`Int?`، وقيمته `nil`"
        why: صحيح. كل بحث في قاموس يعيد optional، لأن أي مفتاح قد يكون غائبًا.
      - text: يتعطّل التطبيق لأن المفتاح غير موجود.
        why: "هذا ما يحدث مع المصفوفات عند فهرس خاطئ. أما القواميس فتعيد `nil` للمفتاح الغائب."
    answer: 1
  - q: "كتبت `switch` على تصنيف من النوع `String`، ووضعت حالتين فقط لـ \"Food\" و\"Transport\". ماذا يقول الـ compiler؟"
    options:
      - text: لا شيء؛ النصوص غير المطابقة تمرّ بصمت.
        why: لا يوجد في Swift مرور صامت للقيم غير المطابقة. يجب أن تصل كل قيمة إلى حالة ما.
      - text: يحذّرك من أن الـ switch قد يكون بطيئًا.
        why: الأداء ليس المشكلة. الشمول خطأ صريح يوقف الترجمة، لا تحذير.
      - text: "\"Switch must be exhaustive\"، فتضيف حالة `default:`."
        why: "صحيح. للنوع `String` عدد لا نهائي من القيم، فلا يغطّي الباقي إلا `default`."
    answer: 2
  - q: "أيّ مجموعة تناسب «الوسوم التي أضافها المستخدم إلى مصروف، دون تكرار»؟"
    options:
      - text: "`Set<String>`"
        why: "صحيح. المجموعة تتجاهل الإدخال المكرّر وتجيب عن `contains` بسرعة؛ وترتيب الوسوم لا يهم."
      - text: "`[String]`"
        why: المصفوفة تسمح بالتكرار، فستضطر إلى الفحص قبل كل إضافة.
      - text: "`[String: Bool]`"
        why: تعمل، لكنها مجموعة متنكّرة. استخدم النوع الذي يقول ما تعنيه.
      - text: "`[Int: String]`"
        why: المفاتيح الرقمية لا تضيف شيئًا هنا؛ ستعيد بناء مصفوفة بخطوات إضافية.
    answer: 0
  - q: "لديك `let amounts: [Decimal] = []`. ماذا يفعل `amounts[0]` وقت التشغيل؟"
    options:
      - text: "يعيد `nil`."
        why: "هذا ما يفعله `amounts.first`. أما الوصول بالفهرس في المصفوفة فلا يعيد optional أبدًا."
      - text: "يتعطّل التطبيق مع الرسالة \"Index out of range\"."
        why: صحيح. الوصول بالفهرس يثق بك؛ والمصفوفة الفارغة ليس فيها فهرس 0.
      - text: يعيد 0.
        why: المصفوفات لا تملأ الفراغات بقيم افتراضية.
    answer: 1
---

المصروف الواحد قيمة. ومصاريف شهر كامل مجموعة (collection). يحتاج Pocket Budget إلى ثلاثة أشكال من المجموعات: قائمة مرتّبة بالمبالغ، وجدول بحث من التصنيف إلى الحدّ الشهري، وكيس من الوسوم الفريدة. تعطيك Swift هذه الثلاثة بالضبط، وكلها محدّدة النوع، فلا يمكن لمصفوفة مبالغ أن تحتوي `String` بالخطأ.

## المصفوفات: مرتّبة، مفهرسة، محدّدة النوع

```swift
import Foundation

var amounts: [Decimal] = [12.5, 4.25, 60]
amounts.append(18)

print(amounts.count)     // 4
print(amounts[0])        // 12.5
print(amounts.first as Any)   // Optional(12.5)
```

تُقرأ `[Decimal]` «مصفوفة من `Decimal`». الفهارس تبدأ من 0. لاحظ الفرق بين `amounts[0]` و`amounts.first`: الوصول بالفهرس يثق بك ويُسقط التطبيق مع "Index out of range" إذا كانت المصفوفة فارغة، بينما `first` يعيد optional ويتيح لك التعامل مع الحالة الفارغة بالأدوات التي تعلّمتها في الدرس السابق.

في أغلب الأحيان لا تحتاج إلى الفهارس أصلًا. حلقة `for-in` تزور كل عنصر:

```swift
var total: Decimal = 0
for amount in amounts {
    total += amount
}
print(total)             // 94.75

for (index, amount) in amounts.enumerated() {
    print("\(index + 1). \(amount)")
}
```

تعطيك `enumerated()` أزواجًا من الموضع والقيمة، وهذه هي الطريقة الآمنة لترقيم الصفوف. والنطاقات تعمل مع `for-in` أيضًا، بنوعين:

```swift
for day in 1...30 { }               // closed range: 1 through 30
for i in 0..<amounts.count { }      // half-open: stops before count
```

النطاق المغلق يشمل حدّه الأعلى؛ أما النطاق نصف المفتوح فيتوقّف قبله بواحد، وهذا بالضبط ما تحتاجه فهارس المصفوفات.

## القواميس: بحث قد لا يجد شيئًا

القاموس (dictionary) يربط مفاتيح بقيم. يحتفظ Pocket Budget بحدّ شهري لكل تصنيف:

```swift
let limits: [String: Decimal] = ["Food": 300, "Transport": 120]
var spent: [String: Decimal] = ["Food": 280]

let foodLimit = limits["Food"]          // Decimal?, Optional(300)
let funLimit = limits["Fun"] ?? 0       // Decimal, 0

spent["Fun", default: 0] += 15          // creates "Fun": 15
```

كل بحث يعيد optional، لأن المفتاح قد لا يكون موجودًا. إنها فكرة الأمان نفسها مرة أخرى، لكنها هذه المرة مبنية داخل المجموعة. والصيغة `default:` هي الطريقة المعتادة لحساب المجاميع التراكمية: تقرأ القيمة الموجودة أو تبدأ من القيمة الافتراضية التي حدّدتها، ثم تكتب النتيجة مرة أخرى.

:::mistake توقّع أن يحتفظ القاموس بترتيبه
`for (category, limit) in limits` تزور الأزواج بترتيب قد يتغيّر من تشغيل إلى آخر. إن احتاجت الواجهة ترتيبًا ثابتًا، فرتّب أولًا: `for category in limits.keys.sorted()`.
:::

## المجموعات: قيم فريدة

```swift
var tags: Set<String> = ["work", "travel"]
tags.insert("work")          // already there, nothing changes
print(tags.count)            // 2
print(tags.contains("travel"))  // true
```

المجموعة (Set) لا ترتيب فيها ولا تكرار، ويبقى `contains` سريعًا مهما كثرت عناصرها. استخدمها للوسوم، والفلاتر المختارة، وفحوصات «هل رأيت هذا المعرّف من قبل؟».

## اختيار المجموعة المناسبة

| تحتاج إلى | استخدم | مثال من Pocket Budget |
|---|---|---|
| ترتيب، والتكرار مسموح، والوصول بالموضع | مصفوفة (Array) | مصاريف هذا الشهر، الأحدث أولًا |
| البحث عن قيمة بمفتاح | قاموس (Dictionary) | الحدّ الشهري لكل تصنيف |
| العضوية والتفرّد، والترتيب لا يهم | مجموعة (Set) | الوسوم على مصروف واحد |

إن تردّدت، فابدأ بمصفوفة. إنها المجموعة التي تعرضها قوائم SwiftUI، وأسهلها قراءةً في الـ debugger. انتقل إلى القاموس حين تجد نفسك تبحث في مصفوفة عن «العنصر الذي يحمل هذا الاسم»، وإلى المجموعة حين تجد نفسك تفحص التكرار قبل كل إضافة.

المجموعات الثلاث كلها قيم، لا كائنات مشتركة. `var copy = amounts` تعطيك مصفوفة مستقلّة: الإضافة إلى `copy` لا تمسّ `amounts`. لهذا السلوك اسم، سلوك القيمة (value semantics)، وله درس خاص في القسم التالي لأنه يحدّد طريقة تصميمك لكل نوع في نموذج بياناتك.

## switch: شاملة بالتصميم

جملة `switch` في Swift أكثر بكثير من سلسلة فحوصات مساواة. فهي تطابق النطاقات، وتربط القيم، وتضيف الشروط، والـ compiler يصرّ على معالجة كل قيمة ممكنة. هكذا يختار Pocket Budget رسالة الحالة بناءً على النسبة المستهلكة من الميزانية:

```swift title=BudgetStatus.swift
func status(percentUsed: Int) -> String {
    switch percentUsed {
    case ..<0:
        return "Check your numbers"
    case 0..<50:
        return "Plenty left"
    case 50..<90:
        return "On track"
    case 90...100:
        return "Nearly at your limit"
    default:
        return "Over budget"
    }
}

print(status(percentUsed: 95))   // Nearly at your limit
```

هناك فرقان عن لغات عائلة C. أولًا، لا يوجد `break` ولا انتقال عرضي إلى الحالة التالية: متى طابقت حالة، انتهت الـ switch. ثانيًا، احذف `default` وستفشل الترجمة مع "switch must be exhaustive"، لأن النوع `Int` له قيم لا تغطّيها حالاتك. يبدو هذا الخطأ مزعجًا مع الأعداد الصحيحة. لكن مع الـ enums، في القسم التالي، يصبح أنفع خطأ في اللغة: أضف حالة جديدة إلى نموذجك، وسيعرض لك الـ compiler كل `switch` نسيت تحديثها.

:::figure كيف تغطّي نطاقات الحالة في Pocket Budget كل قيمة Int
<svg viewBox="0 0 680 150" role="img" aria-labelledby="t1">
  <title id="t1">خط أعداد مقسوم إلى خمس حالات: أقل من 0، ومن 0 حتى ما قبل 50، ومن 50 حتى ما قبل 90، ومن 90 حتى 100، وdefault لكل ما فوق 100. معًا تغطّي كل عدد صحيح.</title>
  <rect class="d-box-warn" x="10" y="40" width="110" height="50" rx="8"/>
  <text class="d-code" x="65" y="70" text-anchor="middle">..&lt;0</text>
  <rect class="d-box-success" x="130" y="40" width="130" height="50" rx="8"/>
  <text class="d-code" x="195" y="70" text-anchor="middle">0..&lt;50</text>
  <rect class="d-box-accent" x="270" y="40" width="130" height="50" rx="8"/>
  <text class="d-code" x="335" y="70" text-anchor="middle">50..&lt;90</text>
  <rect class="d-box-primary" x="410" y="40" width="130" height="50" rx="8"/>
  <text class="d-code" x="475" y="70" text-anchor="middle">90...100</text>
  <rect class="d-box-warn" x="550" y="40" width="120" height="50" rx="8"/>
  <text class="d-code" x="610" y="70" text-anchor="middle">default</text>
  <text class="d-label-muted" x="340" y="125" text-anchor="middle">النطاقات لا تتداخل، والحالة default تلتقط كل Int آخر</text>
</svg>
:::

يمكن للحالات أيضًا أن تربط القيمة المطابَقة وتختبرها بـ `where`:

```swift
let used: Decimal = 15
let limit: Decimal = 10

switch used {
case 0:
    print("Nothing spent yet")
case let amount where amount > limit:
    print("Over by \(amount - limit)")
default:
    print("Within budget")
}
```

وفي Swift 5.9 صار ممكنًا استخدام `switch` و`if` كتعبيرات، فتعمل الصيغة `let label = switch percentUsed { … }` حين تنتج كل حالة قيمة واحدة. استخدم الصيغة الأوضح قراءةً؛ قاعدة الشمول واحدة في الحالتين.

:::tip رتّب حالاتك من الأضيق إلى الأعم
تُجرَّب الحالات من الأعلى إلى الأسفل وأول تطابق يفوز. ضع الحالات الضيّقة مثل `case 0:` قبل الواسعة مثل `case let amount where amount > limit:`.
:::

صار بإمكانك الآن أن تحمل بيانات شهر كامل وتتّخذ قرارات بشأنها. حلقات التكرار في هذا الدرس تعمل، لكنها مكتوبة بالطريقة الطويلة. بعد ذلك ستجمع المنطق في دوال، وتستبدل معظم هذه الحلقات بـ closures مثل `filter` و`map` و`reduce`.
