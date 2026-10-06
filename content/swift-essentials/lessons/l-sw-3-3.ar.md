---
summary: اعرض المصاريف في List، وانتقل إلى شاشة تفاصيل باستخدام NavigationStack والروابط المبنية على القيم، واجمع المصاريف الجديدة في Form يتحقّق من المدخلات ويُعرض كـ sheet.
takeaways:
  - "`List` و`ForEach` يحتاجان إلى التمييز بين الصفوف، ولهذا تتوافق نماذجك مع `Identifiable`."
  - "`NavigationLink(value:)` مع `.navigationDestination(for:)` يفصلان بين ما نُقر عليه وبين الشاشة التي تعرضه."
  - "استخدم sheet لمهمة مستقلّة مثل إضافة مصروف، وأغلقها عبر قيمة `dismiss` من الـ environment."
  - "حقل `TextField` مع `format:` يحوّل الكتابة إلى قيمة محدّدة النوع حسب الإعدادات المحلية للمستخدم، بدل تحليل النصوص يدويًا."
  - "قيم `.tag` في `Picker` يجب أن تكون من نوع `selection` نفسه تمامًا، وإلا يتوقّف المنتقي عن العمل بصمت."
further:
  - title: NavigationStack
    url: https://developer.apple.com/documentation/swiftui/navigationstack
  - title: Lists
    url: https://developer.apple.com/documentation/swiftui/lists
  - title: Form
    url: https://developer.apple.com/documentation/swiftui/form
quiz:
  - q: "كتبت `NavigationLink(value: expense)` لكن النقر على الصف لا يفعل شيئًا. ما السبب الأرجح؟"
    options:
      - text: "لا يوجد `.navigationDestination(for: Expense.self)` داخل الـ `NavigationStack`."
        why: صحيح. رابط القيمة يقول فقط ما الذي اختير؛ أما الـ modifier الخاص بالوجهة فيقرّر ما يُعرض له.
      - text: "`Expense` لا يتوافق مع `Codable`."
        why: "قيم التنقّل يجب أن تكون `Hashable`، لا `Codable`. و`Codable` لا يهم إلا إن كنت تحفظ المسار."
      - text: "الصف يحتاج إلى `.onTapGesture`."
        why: "`NavigationLink` يتولّى النقر بنفسه؛ وإضافة gesture قد تحجبه فعلًا."
    answer: 0
  - q: "يستخدم منتقي التصنيفات `selection: $category` حيث `category` من النوع `Category`، وصفوفه معلّمة بـ `.tag(category.rawValue)`. ماذا يحدث؟"
    options:
      - text: يعمل، لأن SwiftUI يحوّل القيم الخام تلقائيًا.
        why: "يقارن SwiftUI الـ tags بالاختيار حسب النوع والقيمة؛ وقيمة `String` لا تساوي `Category` أبدًا."
      - text: يظهر المنتقي، لكن اختيار صف لا يغيّر الاختيار أبدًا.
        why: "صحيح. الـ tags من النوع `String` والاختيار من النوع `Category`، فلا شيء يتطابق. علّم الصفوف بقيمة الـ enum نفسها."
      - text: تفشل الترجمة بخطأ في النوع.
        why: "`.tag` تقبل أي قيمة `Hashable`، فيُترجَم الكود ويفشل بهدوء وقت التشغيل، وهذا ما يجعله خبيثًا."
    answer: 1
  - q: "لماذا تربط حقل المبلغ بقيمة `Decimal?` مع `format: .currency(code: \"USD\")` بدل `String`؟"
    options:
      - text: "النصوص لا يمكن استخدامها مع `TextField`."
        why: "`TextField(\"Title\", text: $title)` هو أشيع حقل نصي على الإطلاق."
      - text: لأنه يجعل لوحة المفاتيح رقمية تلقائيًا.
        why: "الـ format لا يغيّر لوحة المفاتيح؛ هذا دور `.keyboardType(.decimalPad)`."
      - text: "الحقل يحلّل مدخلات المستخدم حسب إعداداته المحلية ويسلّمك `Decimal` محدّد النوع، فلا يبقى نص تحلّله."
        why: صحيح. "12,50" في ألمانيا تصبح 12.5، ولا تكتب أنت أي محلّل.
    answer: 2
---

صار لدى Pocket Budget مخزن، وview للصف، وstate تقود الشاشة. الآن يجب أن يصبح تطبيقًا يستطيع الناس استخدامه: قائمة بمصاريف هذا الشهر، ونقرة تفتح التفاصيل، وزر + يفتح نموذجًا. هذه الأنماط الثلاثة (القائمة، والتنقّل بالدفع، والنموذج المنبثق) تشكّل هيكل معظم تطبيقات iPhone التي استخدمتها.

## قائمة من صفوف قابلة للتمييز

```swift title=ExpensesScreen.swift
import SwiftUI

struct ExpensesScreen: View {
    let store: BudgetStore
    @State private var isAdding = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(store.expenses) { expense in
                    NavigationLink(value: expense) {
                        ExpenseRow(expense: expense)
                    }
                }
                .onDelete { offsets in
                    store.delete(at: offsets)
                }
            }
            .overlay {
                if store.expenses.isEmpty {
                    ContentUnavailableView("No expenses yet", systemImage: "tray",
                                           description: Text("Tap + to add your first one."))
                }
            }
            .navigationTitle("Expenses")
            .navigationDestination(for: Expense.self) { expense in
                ExpenseDetail(expense: expense)
            }
            .toolbar {
                Button("Add expense", systemImage: "plus") {
                    isAdding = true
                }
            }
            .sheet(isPresented: $isAdding) {
                AddExpenseView(store: store)
            }
        }
    }
}
```

هذه هي الشاشة الرئيسية كاملة؛ خذها قطعة قطعة. ينتج `ForEach(store.expenses)` صفًا لكل مصروف. ويحتاج إلى هوية ثابتة لكل عنصر حتى يحرّك SwiftUI الصف الصحيح عند إدراج مصروف أو حذفه بدل إعادة رسم كل شيء، وهذه الهوية هي الـ `id` الذي يتطلّبه `Identifiable`. ويضيف `.onDelete` الحذف بالسحب ويسلّمك مواضع العناصر المراد حذفها؛ و`delete(at:)` في المخزن سطر واحد: `expenses.remove(atOffsets: offsets)`. هذه الـ method معرّفة في SwiftUI، لذلك يحتاج الملف `BudgetStore.swift` إلى `import SwiftUI` إلى جانب `Observation`.

`ContentUnavailableView` هو الحالة الفارغة القياسية في النظام. القائمة الفارغة بلا تفسير تبدو معطّلة؛ أما رسالة قصيرة وتلميح إلى الخطوة التالية فيجعلانها تبدو مكتملة.

## التنقّل بالقيم

يدير `NavigationStack` مكدّسًا من الشاشات: القائمة في الأسفل، والتفاصيل تُدفع فوقها، مع زر الرجوع وإيماءة السحب من النظام دون أي جهد.

ينقسم التنقّل إلى نصفين. `NavigationLink(value: expense)` يقول *ما* الذي نُقر عليه. و`.navigationDestination(for: Expense.self)` يقول *أيّ شاشة* تعرض `Expense`. يجب أن تكون القيمة `Hashable`، و`Expense` كذلك أصلًا. إبقاء النصفين منفصلين يعني أن الوجهة تُعلَن مرة واحدة مهما كثرت الأماكن التي تربط إلى مصروف، ويجعل التنقّل البرمجي ممكنًا:

```swift
@State private var path: [Expense] = []

// In body:
NavigationStack(path: $path) {
    // …the same List and modifiers as above
}

// Anywhere in this view, for example after saving:
path.append(newExpense)    // pushes ExpenseDetail
path.removeAll()           // pops back to the list
```

المسار state عادية، فيصبح التنقّل بيانات تستطيع فحصها واختبارها وتغييرها من الكود. هكذا تفتح مصروفًا محدّدًا من إشعار، أو تقفز عائدًا إلى الجذر بعد مسار من عدة خطوات. وللشاشات التي فيها أنواع وجهات مختلطة، يؤدّي `NavigationPath` الدور نفسه بقيم ممحوّة النوع.

:::figure التنقّل بالدفع وsheet منبثقة
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">داخل NavigationStack، تدفع قائمة المصاريف شاشة تفاصيل المصروف عند النقر على صف، والرجوع يُخرجها. وبشكل منفصل، يعرض زر + نموذج إضافة مصروف كـ sheet، تُغلق بـ Save أو Cancel.</title>
  <rect class="d-box d-dashed" x="10" y="20" width="430" height="190" rx="14"/>
  <text class="d-label-muted" x="225" y="44" text-anchor="middle">NavigationStack</text>
  <rect class="d-box-primary" x="30" y="70" width="170" height="110" rx="10"/>
  <text class="d-label-strong" x="115" y="118" text-anchor="middle">المصاريف</text>
  <text class="d-label-muted" x="115" y="142" text-anchor="middle">List</text>
  <rect class="d-box-accent" x="250" y="70" width="170" height="110" rx="10"/>
  <text class="d-label-strong" x="335" y="118" text-anchor="middle">التفاصيل</text>
  <text class="d-label-muted" x="335" y="142" text-anchor="middle">عبر push</text>
  <path class="d-arrow" d="M200 105 L248 105" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M250 150 L202 150" marker-end="url(#arrow)"/>
  <text class="d-label" x="225" y="96" text-anchor="middle">نقرة</text>
  <text class="d-label" x="225" y="172" text-anchor="middle">رجوع</text>
  <rect class="d-box-success" x="500" y="70" width="180" height="110" rx="10"/>
  <text class="d-label-strong" x="590" y="118" text-anchor="middle">إضافة مصروف</text>
  <text class="d-label-muted" x="590" y="142" text-anchor="middle">sheet</text>
  <path class="d-arrow" d="M200 85 C 300 0, 450 0, 520 68" marker-end="url(#arrow)"/>
  <text class="d-label" x="470" y="30" text-anchor="middle">زر +</text>
</svg>
:::

يمكن أن تكون شاشة التفاصيل `Form` يُستخدم للعرض، بصفوف `LabeledContent` تنسّق القيم لك:

```swift
struct ExpenseDetail: View {
    let expense: Expense

    var body: some View {
        Form {
            LabeledContent("Amount", value: expense.amount, format: .currency(code: "USD"))
            LabeledContent("Category", value: expense.category.title)
            LabeledContent("Date", value: expense.date, format: .dateTime.day().month().year())
        }
        .navigationTitle(expense.title)
    }
}
```

## نموذج داخل sheet

الدفع مخصّص للتعمّق في المحتوى. أما الـ **sheet** (الورقة المنبثقة) فلمهمّة مستقلّة يُنهيها المستخدم أو يتخلّى عنها، مثل إضافة مصروف. يعرض `.sheet(isPresented: $isAdding)` النموذج كلما أصبحت `isAdding` صحيحة. إليك النموذج:

```swift title=AddExpenseView.swift
struct AddExpenseView: View {
    let store: BudgetStore
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var amount: Decimal?
    @State private var category: Category = .food
    @State private var date = Date.now

    private var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty && (amount ?? 0) > 0
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Title", text: $title)
                    TextField("Amount", value: $amount, format: .currency(code: "USD"))
                        .keyboardType(.decimalPad)
                }
                Section {
                    Picker("Category", selection: $category) {
                        ForEach(Category.allCases, id: \.self) { category in
                            Label(category.title, systemImage: category.symbolName)
                                .tag(category)
                        }
                    }
                    DatePicker("Date", selection: $date, in: ...Date.now, displayedComponents: .date)
                }
            }
            .navigationTitle("New Expense")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        guard let amount else { return }
                        store.add(Expense(title: title, amount: amount, category: category, date: date))
                        dismiss()
                    }
                    .disabled(!canSave)
                }
            }
        }
    }
}
```

تغلّف الـ sheet نموذجها بـ `NavigationStack` خاص بها. فالـ sheet عرض منفصل لا يرث مكدّس القائمة، وبدونه لا يوجد شريط يحمل العنوان أو زرَّي Cancel وSave. ووضعهما عبر `.cancellationAction` و`.confirmationAction` يضعهما حيث يتوقّعهما مستخدمو iOS.

كل حقل مربوط بـ `@State` خاصة به، فيكون النموذج مسوّدة: لا شيء يمسّ المخزن حتى النقر على Save. وCancel يرمي المسوّدة. هذا سلوك القيمة يؤتي ثماره مرة أخرى.

حقل المبلغ هو الأهم. يحلّل `TextField(value:format:)` ما يكتبه المستخدم حسب إعداداته المحلية، فتصبح "12,50" في ألمانيا 12.5، ولا تحمل `amount` إلا رقمًا حُلّل بنجاح، أو `nil` ما دام لا يوجد رقم. هذا يستبدل التحليل المتساهل بـ `Decimal(string:)` من درس الـ optionals. ويفكّها `guard let amount` في إجراء Save، ويعطّل `canSave` الزر حتى يكون العنوان والمبلغ منطقيين، فلا يمكن حفظ مدخلات غير صالحة أصلًا. والنطاق `in: ...Date.now` يمنع التواريخ المستقبلية. أما `dismiss` فيأتي من الـ environment ويغلق كل ما عرض هذا الـ view.

:::mistake tags من نوع خاطئ في Picker
إن كان `selection` من النوع `Category` وكتبت `.tag(category.rawValue)`، يُترجَم الكود، ويظهر المنتقي، واختيار صف لا يغيّر شيئًا، لأن tag من النوع `String` لا يساوي أبدًا اختيارًا من النوع `Category`. يجب أن تكون الـ tags من نوع الاختيار نفسه تمامًا. ومع اختيار optional مثل `Category?`، علّم الصفوف بـ `Optional(category)`.
:::

:::tip تحقّق بالتعطيل، واشرح بالنص
زر Save المعطّل يمنع البيانات السيئة، لكنه وحده قد يترك الناس يخمّنون. لأي شيء أقل وضوحًا من «املأ العنوان»، أضف تذييلًا قصيرًا للقسم يقول ما الذي ينقص.
:::

صار Pocket Budget الآن تطبيقًا يعمل بمسار حقيقي من القائمة إلى التفاصيل إلى النموذج. لكنه ينسى كل شيء حين تغلقه، ولا يعرف شيئًا خارج الهاتف. القسم الأخير يصلح الأمرين، بدءًا بكيفية تنفيذ Swift للعمل الذي يستغرق وقتًا.
