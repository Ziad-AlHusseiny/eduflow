---
summary: اجعل لكل قطعة بيانات مصدر حقيقة واحدًا، باستخدام @State للقيم التي يملكها الـ view، و@Binding لمشاركة صلاحية الكتابة، وclasses من نوع @Observable مع @Bindable والـ environment لبيانات التطبيق.
takeaways:
  - "`@State` يخزّن القيمة خارج الـ struct الخاص بالـ view فتبقى بعد كل re-render؛ علّمها بـ `private`، لأن الـ view هو من يملكها."
  - "البادئة `$` تعطيك `Binding`: صلاحية قراءة وكتابة على مصدر حقيقة يملكه غيرك، وهذا ما تحتاجه عناصر التحكّم مثل `Toggle` و`TextField`."
  - "علّم الـ class الخاص بالنموذج المشترك بـ `@Observable`، فيعيد SwiftUI رسم الـ views التي قرأ الـ `body` الخاص بها خاصية تغيّرت فقط."
  - "امتلك كائن `@Observable` عبر `@State` في الأعلى، ثم مرّره إلى الأسفل مباشرةً أو عبر `.environment(_:)`."
  - "استخدم `@Bindable` حين تحتاج bindings إلى خصائص كائن `@Observable`، مثلًا لتعديلها في نموذج."
further:
  - title: Managing model data in your app
    url: https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app
  - title: State
    url: https://developer.apple.com/documentation/swiftui/state
  - title: Observation
    url: https://developer.apple.com/documentation/observation
quiz:
  - q: "يعلن view عن `var count = 0` وينفّذ زرٌّ `count += 1`. ماذا يحدث؟"
    options:
      - text: يُترجَم الكود، لكن الشاشة لا تتحدّث أبدًا.
        why: "لا يصل الأمر إلى هذا الحدّ. الـ `body` لا يستطيع تعديل خاصية مخزّنة عادية، فتفشل الترجمة."
      - text: "لا يُترجَم، لأن `self` غير قابل للتغيير داخل `body`؛ الخاصية تحتاج إلى `@State`."
        why: "صحيح. `@State` ينقل التخزين من الـ struct إلى SwiftUI، فيجعلها قابلة للكتابة ومراقَبة."
      - text: يعمل، لأن الـ views في SwiftUI هي classes.
        why: "الـ views هي structs، وهذا بالضبط سبب عدم قدرة الخصائص العادية على التغيّر من داخل `body`."
    answer: 1
  - q: "يملك الأب `@State private var showLargeOnly = false`. ويجب على الابن `FilterBar` أن يبدّل قيمتها. ماذا يعلن الابن، وماذا يمرّر الأب؟"
    options:
      - text: "الابن: `@Binding var showLargeOnly: Bool`. والأب يمرّر `$showLargeOnly`."
        why: صحيح. الـ binding يعطي الابن صلاحية القراءة والكتابة، بينما يبقى الأب مصدر الحقيقة الوحيد.
      - text: "الابن: `@State var showLargeOnly: Bool`. والأب يمرّر `showLargeOnly`."
        why: "`@State` سينشئ نسخة ثانية مستقلّة؛ ولن يرى الأب التغيير أبدًا."
      - text: "الابن: `var showLargeOnly: Bool`. والأب يمرّر `$showLargeOnly`."
        why: "الخاصية العادية لا تستطيع استقبال `Binding`، وحتى لو تطابق النوع لما استطاعت الكتابة رجوعًا."
    answer: 0
  - q: "أيّ الـ views يُعاد رسمها حين تتغيّر `store.monthlyLimit` في مخزن من نوع `@Observable`؟"
    options:
      - text: كل view في التطبيق.
        why: يتتبّع Observation الوصول لكل خاصية على حدة، فتُترك الـ views غير المعنية وشأنها.
      - text: كل view يحمل مرجعًا إلى المخزن.
        why: "حمل المرجع لا يكفي؛ لا يُتتبَّع الـ view إلا للخصائص التي قرأها الـ `body` الخاص به فعلًا."
      - text: "فقط الـ views التي قرأ الـ `body` الخاص بها `monthlyLimit`، أو خاصية محسوبة تستخدمها."
        why: "صحيح. هذا التتبّع الدقيق هو التحسين الأساسي مقارنةً بـ `ObservableObject` الأقدم."
    answer: 2
  - q: "تحصل شاشة الإعدادات على المخزن عبر `@Environment(BudgetStore.self) private var store` وتحتاج إلى `$store.monthlyLimit` لحقل `TextField`. ماذا تضيف؟"
    options:
      - text: "تغيّر الـ property wrapper إلى `@State`."
        why: "`@State` سينشئ مخزنًا جديدًا تملكه هذه الشاشة بدل استخدام المخزن المشترك."
      - text: "‏`@Bindable var store = store` في أعلى `body`."
        why: "صحيح. `@Bindable` ينشئ bindings إلى خصائص كائن `@Observable`، ويمكن إعلانه كمتغيّر محلي داخل `body`."
      - text: "تعلّم `monthlyLimit` بـ `@Published`."
        why: "`@Published` ينتمي إلى نظام `ObservableObject` الأقدم ولا ينشئ bindings بنفسه."
    answer: 1
---

الـ view في SwiftUI هو struct ينشئه SwiftUI ويقرؤه ويتخلّص منه متى شاء. فأين تعيش معلومة «فعّل المستخدم فلتر المصاريف الكبيرة فقط»؟ ليس في خاصية عادية: فالـ struct الذي يحملها قد يختفي بعد لحظة، ومن داخل `body` لا تستطيع حتى تغييرها. جواب SwiftUI مجموعة صغيرة من الـ property wrappers (أغلفة الخصائص)، كلٌّ منها يجيب عن سؤال واحد: **من يملك هذه البيانات؟**

## @State: بيانات يملكها الـ view

```swift title=ExpensesScreen.swift
import SwiftUI

struct ExpensesScreen: View {
    @State private var showLargeOnly = false

    var body: some View {
        Toggle("Large expenses only", isOn: $showLargeOnly)
    }
}
```

يخبر `@State` إطار SwiftUI أن يحتفظ بالقيمة في تخزين يديره هو، مرتبط بموقع هذا الـ view في الهرمية. يمكن إعادة إنشاء الـ struct مئة مرة وتبقى القيمة. وحين تتغيّر القيمة، يعيد SwiftUI قراءة `body` ويحدّث الشاشة.

العلامة `$` في `$showLargeOnly` تطلب **binding** (ربطًا): اتصالًا في الاتجاهين مع الـ state. الـ `Toggle` لا يملك قيمة التشغيل والإيقاف؛ بل يستقبل binding ليقرأ القيمة الحالية ويكتب القيمة الجديدة عند النقر. وكل عنصر إدخال (`TextField` و`Toggle` و`Picker` و`DatePicker` و`Slider`) يعمل بهذه الطريقة.

:::mistake نسيان @State
اكتب `var isExpanded = false` ثم `isExpanded.toggle()` داخل زر، وستفشل الترجمة مع "cannot use mutating member on immutable value: 'self' is immutable". الحل ليس `mutating`؛ فالـ views لا تستطيع ذلك. أضف `@State private` ليملك SwiftUI التخزين.
:::

## @Binding: استعارة state يملكها غيرك

استخرج الـ toggle إلى view مستقل، وسيحتاج الابن إلى تغيير state يملكها الأب:

```swift
struct FilterBar: View {
    @Binding var showLargeOnly: Bool

    var body: some View {
        Toggle("Large expenses only", isOn: $showLargeOnly)
    }
}

// In ExpensesScreen's body:
FilterBar(showLargeOnly: $showLargeOnly)
```

يبقى الأب **مصدر الحقيقة الوحيد** (single source of truth)؛ ويحصل الابن على binding إليه. لو أعلن الابن `@State` بدلًا من ذلك، لحمل نسخة منفصلة تبدأ بقيمة الأب ثم تبتعد عنها. هذا هو الخطأ الكامن وراء معظم أسئلة «الـ toggle عندي لا يفعل شيئًا».

:::figure مصدر حقيقة واحد، يُشارَك عبر الـ bindings
<svg viewBox="0 0 680 240" role="img" aria-labelledby="t1">
  <title id="t1">يملك ExpensesScreen القيمة showLargeOnly عبر State. ويمرّر binding إلى FilterBar، الذي يكتب الـ Toggle فيه عبر الـ binding رجوعًا إلى الـ state. أما المخزن، وهو class من نوع Observable يملكه التطبيق، فيقرأ منه ExpensesScreen وSettingsScreen كلاهما.</title>
  <rect class="d-box-primary" x="30" y="30" width="260" height="70" rx="10"/>
  <text class="d-code" x="160" y="58" text-anchor="middle">ExpensesScreen</text>
  <text class="d-label-muted" x="160" y="82" text-anchor="middle">@State showLargeOnly</text>
  <rect class="d-box" x="30" y="150" width="260" height="70" rx="10"/>
  <text class="d-code" x="160" y="178" text-anchor="middle">FilterBar</text>
  <text class="d-label-muted" x="160" y="202" text-anchor="middle">@Binding showLargeOnly</text>
  <path class="d-arrow" d="M130 100 L130 148" marker-end="url(#arrow)"/>
  <text class="d-label" x="100" y="130" text-anchor="end">$binding</text>
  <path class="d-arrow d-dashed" d="M190 150 L190 102" marker-end="url(#arrow)"/>
  <text class="d-label" x="200" y="130">يكتب رجوعًا</text>
  <rect class="d-box-success" x="400" y="90" width="250" height="70" rx="10"/>
  <text class="d-code" x="525" y="118" text-anchor="middle">@Observable BudgetStore</text>
  <text class="d-label-muted" x="525" y="142" text-anchor="middle">يُملَك مرة واحدة عبر @State</text>
  <path class="d-arrow" d="M400 110 L292 70" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="525" y="200" text-anchor="middle">الـ views التي تقرأ خاصية</text>
  <text class="d-label-muted" x="525" y="220" text-anchor="middle">تتحدّث حين تتغيّر</text>
</svg>
:::

## @Observable: بيانات التطبيق المشتركة

مفتاح الفلتر ينتمي إلى شاشة واحدة. أما قائمة المصاريف فتنتمي إلى التطبيق كله: القائمة تعرضها، والملخّص يجمعها، ونموذج الإضافة يضيف إليها. هذه هوية مشتركة، وقد قال درس الـ structs إنها تستدعي class. علّمه بالماكرو `@Observable` من إطار Observation:

```swift title=BudgetStore.swift
import Observation
import Foundation

@Observable
final class BudgetStore {
    var expenses: [Expense] = []
    var monthlyLimit: Decimal = 1500

    var totalSpent: Decimal {
        expenses.reduce(0) { $0 + $1.amount }
    }

    var remaining: Decimal {
        monthlyLimit - totalSpent
    }

    func add(_ expense: Expense) {
        expenses.append(expense)
    }
}
```

لا property wrappers على الخصائص، ولا publishers. يعيد الماكرو كتابة كل خاصية مخزّنة حتى يستطيع SwiftUI تسجيل أيّها يقرأ الـ `body`. الـ view الذي يعرض `store.remaining` يقرأ `monthlyLimit` و`expenses` من خلالها، فيتحدّث حين تتغيّر أيٌّ منهما؛ أما الـ view الذي يعرض الحدّ فقط فيتجاهل المصاريف الجديدة.

لاحظ أن `totalSpent` و`remaining` محسوبتان لا مخزّنتان. من المغري أن تحتفظ بـ `var total` وتحدّثها في `add`، لكن عندئذٍ يجب على كل method مستقبلية تمسّ `expenses` (الحذف، التعديل، الاستيراد) أن تتذكّر تحديثها أيضًا، وذات يوم ستنسى إحداها. خزّن الحدّ الأدنى من الحقائق واشتقّ كل ما عداها. يتتبّع Observation الخصائص المحسوبة عبر الخصائص المخزّنة التي تقرؤها، فتبقى الشاشة صحيحة دون أي جهد.

أنشئ المخزن مرة واحدة، قرب قمّة التطبيق، وامتلكه عبر `@State`:

```swift title=PocketBudgetApp.swift
@main
struct PocketBudgetApp: App {
    @State private var store = BudgetStore()

    var body: some Scene {
        WindowGroup {
            ExpensesScreen(store: store)   // ExpensesScreen now has `let store: BudgetStore`
                .environment(store)
        }
    }
}
```

تستطيع الـ views الأبناء أن تأخذ المخزن كخاصية عادية `let store: BudgetStore` وتستدعي `store.add(…)`؛ لا حاجة إلى أي wrapper للقراءة أو لاستدعاء الـ methods. وللشاشات العميقة في الهرمية، يجعله `.environment(store)` متاحًا دون تمريره عبر كل مُهيِّئ، ويلتقطه الـ view عبر `@Environment(BudgetStore.self) private var store`.

## @Bindable: bindings إلى داخل كائن مراقَب

حقل `TextField` الذي يعدّل الحدّ الشهري يحتاج إلى binding إلى `store.monthlyLimit`. و`@Bindable` يوفّره:

```swift
struct SettingsScreen: View {
    @Environment(BudgetStore.self) private var store

    var body: some View {
        @Bindable var store = store
        Form {
            TextField("Monthly limit", value: $store.monthlyLimit, format: .currency(code: "USD"))
                .keyboardType(.decimalPad)
        }
    }
}
```

حين يصل المخزن كخاصية، اكتب `@Bindable var store: BudgetStore` بدلًا من ذلك؛ أما الصيغة المحلية المعروضة هنا فهي للكائنات القادمة من الـ environment.

:::note الكود الأقدم: ObservableObject
قبل iOS 17، كانت المهمة نفسها تستخدم `ObservableObject` و`@Published` و`@StateObject` و`@ObservedObject`. ستقابلها في الشروحات وقواعد الكود الأقدم. أما الكود الجديد فيجب أن يستخدم `@Observable`: كود تمهيدي أقل، والـ views تتحدّث فقط للخصائص التي تقرؤها.
:::

لتقرّر أيّ wrapper تستخدم، اسأل من يملك البيانات. هل يملك هذا الـ view قيمة بسيطة؟ `@State`. هل يحتاج إلى تغيير قيمة يملكها غيره؟ `@Binding`. هل هي بيانات تطبيق مشتركة؟ class من نوع `@Observable`، يُملَك مرة واحدة عبر `@State` ويُمرَّر إلى الأسفل. الدرس التالي يشغّل المخزن في قائمة حقيقية مع تنقّل ونموذج لإضافة مصروف.
