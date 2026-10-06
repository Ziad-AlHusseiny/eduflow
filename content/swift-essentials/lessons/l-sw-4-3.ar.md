---
summary: حوّل Expense إلى نموذج في SwiftData، وجهّز الـ model container، واقرأ بـ @Query، وأضف واحذف عبر الـ model context، وعدّل الكائنات المحفوظة بـ @Bindable.
takeaways:
  - "`@Model` يحوّل الـ class إلى بيانات محفوظة بشكل دائم؛ ويبني SwiftData مخطّط التخزين من خصائصه المخزّنة."
  - "`.modelContainer(for:)` على الـ scene الخاص بالتطبيق ينشئ قاعدة البيانات مرة واحدة ويضع model context في الـ environment."
  - "`@Query` يجلب النماذج ويرتّبها ويصفّيها للـ view، ويُبقي النتيجة محدّثة كلما تغيّرت البيانات."
  - "أضف واحذف عبر `modelContext`؛ أما التغييرات على خصائص النموذج فتُحفظ تلقائيًا، بما في ذلك التعديلات المربوطة عبر `@Bindable`."
  - "استخدم container في الذاكرة (`inMemory: true` أو `isStoredInMemoryOnly`) للـ previews والاختبارات حتى لا تمسّ البيانات الحقيقية أبدًا."
further:
  - title: SwiftData
    url: https://developer.apple.com/documentation/swiftdata
  - title: Preserving your app's model data across launches
    url: https://developer.apple.com/documentation/swiftdata/preserving-your-apps-model-data-across-launches
  - title: Query
    url: https://developer.apple.com/documentation/swiftdata/query
quiz:
  - q: "لماذا يتحوّل `Expense` من struct إلى `final class` حين يصبح نموذجًا في SwiftData؟"
    options:
      - text: الـ classes أسرع في الحفظ من الـ structs.
        why: السرعة ليست السبب. المسألة مسألة هوية.
      - text: "`@Model` يتطلّب class، لأن السجلّ المحفوظ له هوية واحدة تراقبها كل شاشة وتعدّلها."
        why: صحيح. عدّل مصروفًا في view واحد وسيرى التغيير كل view يعرضه، وهذا هو سلوك المرجع.
      - text: "الـ structs لا يمكن أن تحتوي خصائص من النوعين `Decimal` أو `Date`."
        why: الـ structs تحمل هذين النوعين طوال الوقت؛ والدروس السابقة استخدمتهما.
    answer: 1
  - q: "تستخدم قائمة `@Query private var expenses: [Expense]`. كيف تحذف مصروفًا سحبه المستخدم جانبًا؟"
    options:
      - text: "`expenses.remove(at: index)`"
        why: نتيجة الـ query للقراءة فقط؛ إنها تعكس المخزن ولا تتحكّم فيه.
      - text: اضبط خصائص المصروف على قيم فارغة.
        why: هذا يحفظ مصروفًا فارغًا؛ ولا يحذف شيئًا.
      - text: "`context.delete(expenses[index])`، باستخدام الـ model context من الـ environment."
        why: صحيح. التغييرات تمرّ عبر الـ context، والـ query يحدّث نفسه ليطابقها.
    answer: 2
  - q: "تربط شاشة تعديل حقل `TextField` بـ `$expense.title` عبر `@Bindable var expense: Expense`. متى يُحفظ التغيير؟"
    options:
      - text: تلقائيًا؛ يتتبّع الـ context التغيير ويحفظه تلقائيًا.
        why: صحيح. الـ context الرئيسي في SwiftData يحفظ تلقائيًا، فتعديل النموذج يكفي في معظم الشاشات.
      - text: "فقط بعد أن تستدعي `context.insert(expense)` مرة أخرى."
        why: المصروف موجود في الـ context أصلًا؛ والإضافة مجدّدًا ليست طريقة عمل التحديثات.
      - text: أبدًا، لأن الـ bindings تنشئ نسخة من النموذج.
        why: النموذج class، والـ binding يكتب مباشرة في الـ instance المشترك.
    answer: 0
  - q: يجب أن تعرض الـ preview الخاصة بقائمة المصاريف بيانات تجريبية دون أن تمسّ قاعدة البيانات الحقيقية. ماذا تستخدم؟
    options:
      - text: "الـ `.modelContainer(for: Expense.self)` العادي الخاص بالتطبيق."
        why: هذا يشير إلى المخزن نفسه على القرص الذي يستخدمه التطبيق؛ فتقرأ الـ previews بيانات حقيقية وتكتب فيها.
      - text: "‏`.modelContainer(for: Expense.self, inMemory: true)`، ثم تضيف مصاريف تجريبية."
        why: صحيح. البيانات تعيش في الذاكرة فقط وتختفي حين تنتهي الـ preview.
      - text: "مصفوفة عادية بدل `@Query`."
        why: هذا يعاين view مختلفًا عن الذي ستطلقه، فيُفسد الغرض كله.
    answer: 1
---

أضف خمسة مصاريف، وأغلق Pocket Budget، ثم افتحه مجدّدًا، وستجد القائمة فارغة. كل شيء كان يعيش في الذاكرة. يتوقّع المستخدمون أن تصمد بياناتهم أمام إعادة التشغيل والتحديثات وهاتف نفدت بطاريته أثناء الحفظ. **SwiftData** هو إطار الحفظ الدائم (persistence) من Apple المصمّم لـ Swift: تصف نموذجك في الكود، ويتولّى هو قاعدة البيانات والمخطّط وإبقاء SwiftUI متزامنًا.

## تحويل Expense إلى نموذج

```swift title=Expense.swift
import Foundation
import SwiftData

@Model
final class Expense {
    var title: String
    var amount: Decimal
    var category: Category
    var date: Date
    var note: String = ""

    init(title: String, amount: Decimal, category: Category, date: Date = .now) {
        self.title = title
        self.amount = amount
        self.category = category
        self.date = date
    }
}
```

تغيّر أمران عن الـ struct الذي تستخدمه منذ قسم التصميم. أولًا، `@Model` يتطلّب **class**. فالمصروف المحفوظ له هوية واحدة: يجب أن ترى القائمة وشاشة التفاصيل ونموذج التعديل كلها السجلّ نفسه، وهذا هو سلوك المرجع الذي تعلّمت أن تلجأ إليه حين تكون البيانات مشتركة. ثانيًا، تكتب المُهيِّئ بنفسك، لأن الـ classes لا تحصل على memberwise initializer.

يجعل `@Model` الـ class يتوافق مع `PersistentModel`، الذي يجلب معه `Identifiable` و`Hashable`، فيستمر `ForEach` و`NavigationLink(value:)` في العمل دون تغيير. ويحتاج الـ enum المسمّى `Category` إلى التوافق مع `Codable` حتى يُخزَّن؛ أضفه إلى تعريفه. ويمكنك حذف خاصية `id`: يعطي SwiftData كل نموذج معرّفًا دائمًا.

## container واحد للتطبيق

```swift title=PocketBudgetApp.swift
@main
struct PocketBudgetApp: App {
    var body: some Scene {
        WindowGroup {
            ExpensesScreen()
        }
        .modelContainer(for: Expense.self)
    }
}
```

الـ **model container** (حاوية النماذج) يملك ملف قاعدة البيانات والمخطّط. وإنشاؤه مرة واحدة على الـ scene يضع أيضًا **model context** (سياق النماذج) في الـ environment. الـ context هو مساحة عملك: يتتبّع النماذج المضافة والمعدّلة والمحذوفة ويكتبها على القرص. والـ context الرئيسي يحفظ تلقائيًا، فمعظم التطبيقات لا تستدعي `save()` يدويًا أبدًا.

أنشئ الـ container في مكان واحد بالضبط. الـ `ModelContainer` المبني داخل `body` أو مُهيِّئ أحد الـ views يُعاد إنشاؤه كلما أعاد SwiftUI بناء ذلك الـ view، وكل نسخة تفتح المخزن من جديد. ضعه على الـ scene كما هنا، وسيتشاركه كل view تحته.

:::figure الـ container والـ context والـ queries
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">الـ ModelContainer يملك المخزن على القرص. والـ ModelContext الرئيسي التابع له موجود في الـ environment الخاص بـ SwiftUI. تقرأ الـ views عبر Query وتكتب عبر الـ context باستخدام insert وdelete؛ ويحفظ الـ context تلقائيًا في المخزن فتتحدّث نتائج Query.</title>
  <rect class="d-box" x="20" y="70" width="150" height="80" rx="10"/>
  <text class="d-label-strong" x="95" y="105" text-anchor="middle">المخزن على القرص</text>
  <text class="d-label-muted" x="95" y="128" text-anchor="middle">ملف SQLite</text>
  <rect class="d-box-primary" x="215" y="70" width="170" height="80" rx="10"/>
  <text class="d-code" x="300" y="105" text-anchor="middle">ModelContext</text>
  <text class="d-label-muted" x="300" y="128" text-anchor="middle">يحفظ تلقائيًا</text>
  <path class="d-arrow" d="M215 110 L172 110" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="460" y="20" width="220" height="70" rx="10"/>
  <text class="d-code" x="570" y="50" text-anchor="middle">@Query expenses</text>
  <text class="d-label-muted" x="570" y="72" text-anchor="middle">يقرأ ويبقى محدّثًا</text>
  <rect class="d-box-accent" x="460" y="130" width="220" height="70" rx="10"/>
  <text class="d-code" x="570" y="160" text-anchor="middle">context.insert / delete</text>
  <text class="d-label-muted" x="570" y="182" text-anchor="middle">يكتب</text>
  <path class="d-arrow" d="M385 95 L458 60" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M458 165 L387 130" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="300" y="200" text-anchor="middle">يُنشأ مرة واحدة عبر .modelContainer(for:)</text>
</svg>
:::

## القراءة بـ @Query، والكتابة عبر الـ context

```swift title=ExpensesScreen.swift
struct ExpensesScreen: View {
    @Query(sort: \Expense.date, order: .reverse) private var expenses: [Expense]
    @Environment(\.modelContext) private var context

    var body: some View {
        NavigationStack {
            List {
                ForEach(expenses) { expense in
                    NavigationLink(value: expense) {
                        Text(expense.title)
                    }
                }
                .onDelete { offsets in
                    for index in offsets {
                        context.delete(expenses[index])
                    }
                }
            }
            .navigationTitle("Expenses")
            .navigationDestination(for: Expense.self) { expense in
                EditExpenseView(expense: expense)
            }
        }
    }
}
```

يجلب `@Query` كل `Expense`، الأحدث أولًا، ويعيد التنفيذ كلما تغيّرت البيانات المخزّنة، فأي حذف أو إضافة في أي مكان في التطبيق يحدّث هذه القائمة من تلقاء نفسها. نتيجة الـ query للقراءة فقط: أنت تغيّر البيانات عبر الـ context. وفي نموذج الإضافة من قسم SwiftUI، صار زر Save يستدعي `context.insert(Expense(title: title, amount: amount, category: category, date: date))` بدل `store.add(...)`. لم تعد المصاريف تعيش في `BudgetStore`؛ فهو يحتفظ الآن بإعدادات التطبيق مثل الحدّ الشهري وأسعار الصرف.

:::mistake تعديل نتيجة الـ query
`expenses.remove(atOffsets: offsets)` لا يُترجَم، لأن `@Query` يكشف مصفوفة للقراءة فقط. وحذف عناصر من نسخة لن يحذف شيئًا من قاعدة البيانات على أي حال. مُرّ دائمًا عبر `context.delete`، وسيلحق الـ query بالتغيير.
:::

## التعديل بـ @Bindable

النموذج class مراقَب، فيعطيك `@Bindable` bindings مباشرة إلى داخله:

```swift
struct EditExpenseView: View {
    @Bindable var expense: Expense

    var body: some View {
        Form {
            TextField("Title", text: $expense.title)
            TextField("Amount", value: $expense.amount, format: .currency(code: "USD"))
            DatePicker("Date", selection: $expense.date, displayedComponents: .date)
        }
        .navigationTitle(expense.title)
    }
}
```

لا يوجد زر Save. الكتابة تغيّر النموذج، فيلاحظ الـ context ذلك ويحفظ تلقائيًا، وتتحدّث القائمة الموجودة خلف الشاشة أيضًا. وإن أردت سلوك Cancel بدلًا من ذلك، فانسخ القيم إلى مسوّدات `@State` كما يفعل نموذج الإضافة، واكتبها رجوعًا عند Save.

## التصفية

مرّر predicate (شرط تصفية) إلى `@Query` لجلب مجموعة جزئية. وحين يعتمد الفلتر على قيمة يستقبلها الـ view، ابنِ الـ query داخل `init`:

```swift
struct RecentExpensesView: View {
    @Query private var recent: [Expense]

    init(since start: Date) {
        _recent = Query(filter: #Predicate<Expense> { $0.date >= start },
                        sort: \.date, order: .reverse)
    }

    var body: some View {
        List(recent) { Text($0.title) }
    }
}
```

يُفحص `#Predicate` وقت الترجمة ويُترجم إلى query لقاعدة البيانات، فتحدث التصفية في التخزين لا في حلقة Swift. اقتصر في الـ predicates على الخصائص المخزّنة البسيطة مثل التواريخ والأرقام والنصوص. فالتصفية على خصائص من نوع enum داخل predicate لم تكن موثوقة تاريخيًا، لذلك صفِّ التصنيفات في Swift بعد الجلب، أو خزّن القيمة الخام للتصنيف كـ `String` إن احتجت إلى الاستعلام بها.

:::tip الـ previews والاختبارات تحصل على مخزنها الخاص
`.modelContainer(for: Expense.self, inMemory: true)` داخل `#Preview` يعطيك قاعدة بيانات مؤقتة، فتستطيع إضافة مصاريف تجريبية دون تلويث البيانات الحقيقية. والاختبارات تفعل الشيء نفسه عبر `ModelContainer(for: Expense.self, configurations: ModelConfiguration(isStoredInMemoryOnly: true))`.
:::

إضافة خاصية جديدة لاحقًا، مثل `note` أعلاه، تعمل دون كود إضافي حين يكون لها قيمة افتراضية: ينقل SwiftData المخزن تلقائيًا إلى الشكل الجديد. أما إعادة التسمية فتحتاج إلى تلميح، `@Attribute(originalName: "oldName")`، حتى ينتقل العمود القديم إلى الاسم الجديد؛ وتغيير نوع خاصية يحتاج إلى مخطّط بإصدارات (versioned schema) وخطة ترحيل (migration plan)، ويمكنك تأجيل ذلك حتى يكون لديك مستخدمون حقيقيون ببيانات حقيقية.

صار Pocket Budget الآن يصمد أمام إعادة التشغيل. والدرس الأخير يضمن أنه يستمر في العمل وأنت تغيّره، باستخدام Swift Testing، ويوصله إلى هواتف الآخرين عبر TestFlight.
