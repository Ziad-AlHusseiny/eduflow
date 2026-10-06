---
summary: عرّف الـ protocols كعقود، وتبنَّ الـ protocols القياسية مثل Identifiable وHashable، وأضف سلوكًا افتراضيًا عبر الـ protocol extensions، ووسّع أنواعًا لا تملكها.
takeaways:
  - الـ protocol يسرد متطلّبات؛ وأي struct أو class أو enum يحقّقها يمكن استخدامه في كل مكان يُتوقَّع فيه ذلك الـ protocol.
  - "في الـ structs والـ enums، تولّد Swift التوافق مع `Equatable` و`Hashable` تلقائيًا حين تكون كل الخصائص المخزّنة متوافقة معهما أصلًا."
  - الـ protocol extension يعطي كل نوع متوافق تنفيذًا افتراضيًا دون أي جهد.
  - الـ extensions تضيف methods وخصائص محسوبة وتوافقات إلى أي نوع، بما في ذلك أنواع Apple، لكنها لا تضيف أبدًا خصائص مخزّنة جديدة.
  - "`some Protocol` تمثّل نوعًا واحدًا محدّدًا متوافقًا (في المعامل يختاره المستدعي)؛ أما `any Protocol` فصندوق يمكن أن يحمل نوعًا متوافقًا مختلفًا في كل مرة."
further:
  - title: Protocols
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/
  - title: Extensions
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/extensions/
  - title: Identifiable
    url: https://developer.apple.com/documentation/swift/identifiable
quiz:
  - q: "للـ struct المعرّف `struct Expense: Hashable` خصائص من الأنواع `UUID` و`String` و`Decimal`. ماذا عليك أن تكتب ليصبح hashable؟"
    options:
      - text: "لا شيء إضافيًا؛ تولّد Swift العامل `==` والدالة `hash(into:)` لأن كل خاصية hashable أصلًا."
        why: صحيح. التوليد التلقائي يشمل الـ structs والـ enums التي تتوافق كل خصائصها المخزّنة.
      - text: "دالة `hash(into:)` تدمج كل خاصية يدويًا."
        why: يمكنك ذلك، لكن فقط حين تريد سلوكًا مختلفًا عن النسخة المولّدة تلقائيًا.
      - text: "‏`extension Expense: Equatable` مع `==` مخصّص."
        why: "`Hashable` يرث من `Equatable`، ويُولَّد الاثنان معًا."
    answer: 0
  - q: 'لماذا لا تستطيع إضافة `var note: String = ""` إلى `Decimal` داخل extension؟'
    options:
      - text: الـ extensions تضيف methods فقط، لا خصائص من أي نوع.
        why: "الـ extensions يمكنها إضافة خصائص محسوبة، مثل `var asCurrency: String { … }`."
      - text: "`Decimal` هو struct، والـ structs لا يمكن توسيعها."
        why: أي نوع يمكن توسيعه، بما في ذلك الـ structs الخاصة بـ Apple.
      - text: الـ extensions لا تستطيع إضافة خصائص مخزّنة، لأن ذلك سيغيّر شكل النوع في الذاكرة.
        why: صحيح. أضف خاصية محسوبة، أو غلّف القيمة في نوع خاص بك.
    answer: 2
  - q: "تحتاج مصفوفة واحدة تحمل قيمًا من `Expense` و`Subscription` معًا، وكلاهما يتوافق مع `BudgetItem`. أيّ نوع تعلنه؟"
    options:
      - text: "`[some BudgetItem]`"
        why: "`some` تعني نوعًا واحدًا محدّدًا للمصفوفة كلها؛ فلا يمكنها خلط المصاريف بالاشتراكات."
      - text: "`[any BudgetItem]`"
        why: صحيح. كل عنصر صندوق (existential) يمكن أن يحمل أي نوع متوافق.
      - text: "`[BudgetItem.Type]`"
        why: هذه مصفوفة من الأنواع نفسها (metatypes)، لا من القيم.
    answer: 1
  - q: "يعرّف protocol extension الدالة `formattedCost()`. يتوافق `Subscription` مع الـ protocol لكنه لا ينفّذها. ماذا يحدث حين تستدعي `music.formattedCost()`؟"
    options:
      - text: "خطأ ترجمة، لأن `Subscription` ينقصه أحد المتطلّبات."
        why: الدالة التي يوفّرها protocol extension تُعدّ متحقّقة تلقائيًا لكل نوع متوافق.
      - text: "عطل وقت التشغيل، لأن الدالة لا جسم لها في `Subscription`."
        why: الجسم موجود في الـ extension، فهناك دائمًا ما يُنفَّذ.
      - text: يُنفَّذ التنفيذ الافتراضي من الـ extension.
        why: "صحيح. هذا هو هدف الـ protocol extension: سلوك مشترك يُكتب مرة واحدة."
    answer: 2
---

يوشك Pocket Budget أن يضيف نوعًا ثانيًا من التكاليف. إلى جانب المصاريف التي تحدث مرة واحدة هناك الاشتراكات، التي تُدفع شهريًا أو سنويًا. لا يجب أن تهتم شاشة الملخّص بأيّهما أمامها: تحتاج من كلٍّ منهما عنوانًا وتكلفة شهرية. الوراثة ستُجبر الاثنين على الدخول في هرمية classes. أما جواب Swift فهو الـ **protocol** (البروتوكول): قائمة متطلّبات يستطيع أي نوع أن يتعهّد بتحقيقها، سواء كان struct أو class أو enum.

## كتابة protocol

```swift title=BudgetItem.swift
import Foundation

protocol BudgetItem {
    var title: String { get }
    var monthlyCost: Decimal { get }
}
```

`{ get }` تعني «قابلة للقراءة». يستطيع النوع المتوافق أن يحقّقها بخاصية مخزّنة أو محسوبة. إليك نوعين متوافقين، يعتمدان على الـ enum المسمّى `Category` من الدرس السابق:

```swift
struct Expense: Identifiable, Hashable, BudgetItem {
    let id = UUID()
    var title: String
    var amount: Decimal
    var category: Category
    var date: Date

    var monthlyCost: Decimal { amount }
}

struct Subscription: BudgetItem {
    var title: String
    var price: Decimal
    var billedYearly: Bool

    var monthlyCost: Decimal {
        billedYearly ? price / 12 : price
    }
}
```

احذف `monthlyCost` وسيوقفك الـ compiler بالرسالة "type 'Subscription' does not conform to protocol 'BudgetItem'"، ويعرض عليك Xcode إضافة هياكل فارغة لكل ما ينقص.

## protocols قياسية ستستخدمها كل يوم

يتبنّى `Expense` أيضًا اثنين من الـ protocols في المكتبة القياسية. **Identifiable** يتطلّب خاصية `id`، ويستخدمها `List` و`ForEach` في SwiftUI للتمييز بين الصفوف، لذلك ستراه على معظم النماذج في هذه الدورة. و**Hashable** يسمح بوضع المصاريف في `Set` أو استخدامها كمفاتيح في قاموس، وهو يتضمّن **Equatable** الذي يعطيك `==`.

لم تكتب `==` ولا دالة hash. في الـ structs والـ enums، **تولّد** Swift التوافق مع `Equatable` و`Hashable` تلقائيًا حين تكون كل خاصية مخزّنة متوافقة أصلًا، و`UUID` و`String` و`Decimal` و`Date` و`Category` كلها كذلك. ولأن `id` جزء من هذه المقارنة، يبقى مصروفان بالعنوان والمبلغ نفسيهما مصروفين مختلفين، وهذا ما يعنيه المستخدم.

:::mistake protocol له نوع متوافق واحد
كثيرًا ما يكتب المبتدئون `protocol ExpenseProtocol` بجانب `struct Expense` «من أجل المرونة». الـ protocol الذي له تنفيذ واحد يضيف طبقة للقراءة ولا يمنحك شيئًا. أضِف واحدًا حين يحتاج نوع ثانٍ فعلًا إلى شغل المكان نفسه، كما يفعل `Subscription` هنا، أو حين تحتاج الاختبارات إلى نسخة مزيّفة.
:::

## سلوك افتراضي عبر الـ protocol extensions

كل عنصر في الميزانية يحتاج سعرًا منسّقًا. بدل أن تكتبه مرتين، وسّع الـ protocol:

```swift
extension BudgetItem {
    func formattedCost(currencyCode: String = "USD") -> String {
        monthlyCost.formatted(.currency(code: currencyCode))
    }
}

let coffee = Expense(title: "Coffee", amount: 4.5, category: .food, date: .now)
let music = Subscription(title: "Music", price: 120, billedYearly: true)

coffee.formattedCost()                     // "$4.50"
music.formattedCost(currencyCode: "EUR")   // "€10.00"
```

كل نوع يتوافق مع `BudgetItem`، الآن أو في المستقبل، يحصل على `formattedCost` دون أي جهد. هذا هو جوهر ما يقصده الناس بـ Swift الموجّهة بالـ protocols: protocols صغيرة، وسلوك مشترك في الـ extensions، تتبنّاها أنواع القيم.

:::figure نوعان، protocol واحد، وسلوك مشترك
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">يتوافق Expense وSubscription كلاهما مع الـ protocol المسمّى BudgetItem، الذي يتطلّب title وmonthlyCost. ويضيف protocol extension الدالة formattedCost إلى كل نوع متوافق.</title>
  <rect class="d-box-primary" x="230" y="20" width="220" height="70" rx="10"/>
  <text class="d-code" x="340" y="48" text-anchor="middle">protocol BudgetItem</text>
  <text class="d-label-muted" x="340" y="72" text-anchor="middle">title, monthlyCost</text>
  <rect class="d-box-accent" x="490" y="30" width="180" height="50" rx="10"/>
  <text class="d-code" x="580" y="60" text-anchor="middle">formattedCost()</text>
  <path class="d-line d-dashed" d="M450 55 L490 55"/>
  <text class="d-label-muted" x="580" y="102" text-anchor="middle">من الـ extension</text>
  <rect class="d-box-success" x="80" y="150" width="200" height="56" rx="10"/>
  <text class="d-code" x="180" y="183" text-anchor="middle">struct Expense</text>
  <rect class="d-box-success" x="400" y="150" width="220" height="56" rx="10"/>
  <text class="d-code" x="510" y="183" text-anchor="middle">struct Subscription</text>
  <path class="d-arrow" d="M180 150 L300 92" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M510 150 L380 92" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="340" y="135" text-anchor="middle">يتوافق مع</text>
</svg>
:::

## some وany

كلمتان مفتاحيتان تصفان «قيمة من نوع ما متوافق»:

```swift
let items: [any BudgetItem] = [coffee, music]
let monthly = items.reduce(0) { $0 + $1.monthlyCost }    // 14.5

func cheapest(_ list: [some BudgetItem]) -> String? {
    list.min { $0.monthlyCost < $1.monthlyCost }?.title
}
```

`any BudgetItem` صندوق يمكن أن يحمل نوعًا متوافقًا مختلفًا في كل خانة، وهذا ما تحتاجه القائمة المختلطة. أما `some BudgetItem` فتعني «نوعًا واحدًا محدّدًا متوافقًا، يقرّره المستدعي»: تعمل `cheapest` مع `[Expense]` أو مع `[Subscription]`، لكن ليس مع خليط منهما. فضّل `some` حين تناسب، لأن الـ compiler يعرف النوع بالضبط ويستطيع تحسين الأداء. وتستخدم SwiftUI الكلمة نفسها في `var body: some View` لكن في موضع القيمة المُعادة، حيث تنقلب الأدوار: تنفيذ الـ view هو الذي يختار النوع المحدّد الوحيد، ولا يعرف المستدعي عنه إلا أنه `View`.

## توسيع أنواع لا تملكها

الـ extensions (الامتدادات) لا تقتصر على الـ protocols. يمكنك إضافة خصائص محسوبة وmethods وتوافقات إلى أي نوع، بما في ذلك أنواع Apple:

```swift
extension Decimal {
    var asCurrency: String { formatted(.currency(code: "USD")) }
}

extension Expense: CustomStringConvertible {
    var description: String { "\(title) (\(category.rawValue)): \(formattedCost())" }
}

print(coffee)   // Coffee (food): $4.50
```

كثير من فرق Swift تستخدم الـ extensions أيضًا لتنظيم الملف: الخصائص المخزّنة للنوع في الأعلى، ثم extension واحد لكل توافق. وهناك قيد واحد ينطبق في كل مكان: الـ extension لا يستطيع إضافة خصائص **مخزّنة**، بل محسوبة فقط. كذلك حين تغيّر method في extension على struct إحدى الخصائص، فما زالت تحتاج إلى `mutating`، تمامًا كأي method في التعريف الأصلي.

## أين ستقابل الـ protocols بعد ذلك

الـ protocols هي طريقة أطر عمل Apple في التحدّث مع كودك. في SwiftUI، كل شاشة تبنيها هي struct يتوافق مع الـ protocol المسمّى `View`، ومتطلّبه الوحيد خاصية `body`. ويطلب `List` عناصر `Identifiable` حتى يتتبّع الصفوف. ويطلب كود الشبكات `Codable` حتى يتحوّل JSON إلى أنواعك. وتطلب الـ concurrency في Swift 6 الـ protocol المسمّى `Sendable` قبل أن تعبر القيمة بين الـ threads. وفي كل مرة يتكرّر النمط نفسه من هذا الدرس: يحدّد إطار العمل عقدًا، ويتعهّد نوعك بتحقيقه، ويتحقّق الـ compiler من الوعد.

صارت لديك الآن عدّة التصميم الكاملة: الـ structs والـ classes والـ enums والـ protocols. القطعة الأخيرة قبل SwiftUI هي ما يحدث حين تفشل عملية ما، مثل مصروف سيتجاوز الميزانية، وكيف تجعل معالجة الأخطاء في Swift الفشلَ جزءًا من نوع الدالة.
