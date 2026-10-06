---
summary: ابنِ الـ views في SwiftUI على شكل structs صغيرة، ورتّبها بالـ stacks، ونسّقها بالـ modifiers بالترتيب الصحيح، وتحقّق منها فورًا عبر الـ previews.
takeaways:
  - "الـ view في SwiftUI هو struct خفيف يصف الـ `body` الخاص به كيف يجب أن تبدو الشاشة للبيانات الحالية."
  - "VStack وHStack وZStack ترتّب العناصر الأبناء عموديًا وأفقيًا وفي طبقات؛ و`Spacer` يدفع المحتوى بعيدًا عن بعضه."
  - "كل modifier يغلّف الـ view في view جديد، لذلك الترتيب مهم؛ و`padding` قبل `background` يعني أن الخلفية تُرسم خلف الحشوة أيضًا."
  - "استخرج subview بمجرّد أن يصعب قراءة الـ `body`؛ الـ views الصغيرة لا تكلّف شيئًا وقت التشغيل."
further:
  - title: Configuring views
    url: https://developer.apple.com/documentation/swiftui/configuring-views
  - title: SwiftUI Tutorials
    url: https://developer.apple.com/tutorials/swiftui
quiz:
  - q: "كيف يبدو `Text(\"Food\").background(.blue).padding()`؟"
    options:
      - text: يملأ الأزرق النص والحشوة المحيطة به.
        why: "هذا ما يفعله `.padding().background(.blue)`. هنا تُطبَّق الخلفية قبل أن توجد الحشوة."
      - text: يملأ الأزرق إطار النص نفسه فقط، مع مساحة شفّافة حوله.
        why: "صحيح. يغلّف `background` النص، ثم يضيف `padding` مساحة فارغة خارج ذلك الـ view الملوّن."
      - text: يعيد SwiftUI ترتيب الـ modifiers، فيبدو الشكل نفسه في الحالتين.
        why: يطبّق SwiftUI الـ modifiers بالترتيب الذي تكتبه بالضبط؛ وكل واحد منها يغلّف النتيجة السابقة.
    answer: 1
  - q: "لماذا يُعلَن `body` على أنه `some View` بدل نوع محدّد؟"
    options:
      - text: لأن نوع الـ view قد يتغيّر وقت التشغيل.
        why: "النوع ثابت وقت الترجمة. `some` تُخفي اسمًا، ولا تجعل النوع ديناميكيًا."
      - text: لأن النوع الحقيقي generic طويل ومتداخل لن ترغب أبدًا في كتابته يدويًا.
        why: "صحيح. الـ compiler يعرف النوع الدقيق؛ و`some View` توفّر عليك كتابته."
      - text: "لأن `View` هو class و`some` تحوّله إلى struct."
        why: "`View` هو protocol، والـ views الخاصة بك structs في كل الأحوال."
    answer: 1
  - q: "كبر الـ `body` لأحد الصفوف حتى صار 70 سطرًا. ماذا يفعل مطوّر SwiftUI متمرّس؟"
    options:
      - text: يتركه؛ تقسيم الـ views يكلّف أداءً.
        why: الـ views أنواع قيم رخيصة. تقسيمها لا كلفة تُذكر له وقت التشغيل، وكثيرًا ما يساعد SwiftUI على تحديث أجزاء أقل.
      - text: "ينقل أجزاءً إلى خصائص محسوبة تعيد `AnyView`."
        why: "`AnyView` يمحو معلومات النوع التي يستخدمها SwiftUI للمقارنة بكفاءة. استخدم struct فرعيًا بدلًا من ذلك."
      - text: "يستخرج الأجزاء ذات المعنى إلى structs صغيرة مستقلّة من نوع `View`."
        why: صحيح. الـ subviews المسمّاة تُقرأ كمخطّط للشاشة، ويمكن معاينة كلٍّ منها وحده.
    answer: 2
---

إن كنت قد استخدمت UIKit، أو تعاملت مع الـ DOM يدويًا، فأنت معتاد على أن تخبر الشاشة بما يجب أن تغيّره: اضبط نص هذا العنوان، وأخفِ ذلك الزر، وأدرج صفًا. أما SwiftUI فيقلب ذلك. أنت تصف كيف يجب أن تبدو الشاشة للبيانات الحالية، وSwiftUI يكتشف ما تغيّر ويحدّث البكسلات. تنحصر مهمّتك في كتابة هذا الوصف جيدًا.

## الـ view هو struct له body

هذا هو الصف الذي يعرضه Pocket Budget لكل مصروف، باستخدام النوعين `Expense` و`Category` من القسم السابق:

```swift title=ExpenseRow.swift
import SwiftUI

struct ExpenseRow: View {
    let expense: Expense

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: expense.category.symbolName)
                .font(.title3)
                .frame(width: 32)
                .foregroundStyle(.tint)

            VStack(alignment: .leading, spacing: 2) {
                Text(expense.title)
                    .font(.headline)
                Text(expense.date, format: .dateTime.day().month())
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(expense.amount, format: .currency(code: "USD"))
                .font(.body.monospacedDigit())
        }
        .padding(.vertical, 4)
    }
}
```

يتوافق `ExpenseRow` مع الـ protocol المسمّى `View`، ومتطلّبه الوحيد هو `body`. إنه struct، فإنشاؤه رخيص، وSwiftUI ينشئ هذه الـ structs ويتخلّص منها باستمرار. لا تفكّر في الـ view (العرض) على أنه الشيء الظاهر على الشاشة؛ فكّر فيه على أنه وصفة يقرؤها SwiftUI كلما تغيّرت البيانات.

`some View` هو النوع المُعتِم (opaque type) من درس الـ protocols. النوع الحقيقي لهذا الـ `body` هو generic متداخل بعمق، مبني من كل stack وكل modifier، و`some View` تتيح للـ compiler أن يتتبّعه دون أن تكتبه أنت.

## الـ stacks والـ spacers

ثلاث حاويات تتكفّل بمعظم التخطيطات. `HStack` يضع العناصر الأبناء من اليسار إلى اليمين (ومن اليمين إلى اليسار في العربية والعبرية، تلقائيًا)، و`VStack` من الأعلى إلى الأسفل، و`ZStack` يرتّبها في طبقات من الأمام إلى الخلف. وتتحكّم `alignment` و`spacing` في اصطفاف الأبناء. أما `Spacer()` فيتمدّد ليملأ المساحة الفارغة، وهكذا ينتهي المبلغ مثبّتًا عند الحافة الختامية.

يستطيع `Text` أن ينسّق القيم لك: `Text(expense.amount, format: .currency(code: "USD"))` و`Text(expense.date, format: .dateTime.day().month())` يتبعان الإعدادات المحلية للمستخدم، فيرى المستخدم في القاهرة أو برلين الفواصل وترتيب التاريخ اللذين يتوقّعهما. و`.monospacedDigit()` يُبقي أعمدة المبالغ مصطفّة.

## الـ modifiers تغلّف الـ views

`.font(.headline)` لا يغيّر النص في مكانه. بل يعيد view جديدًا يغلّف النص ويطبّق عليه خطًّا. اربط ثلاثة modifiers (معدِّلات) وتكون قد بنيت ثلاث طبقات. لهذا الترتيب مهم:

```swift
Text("Food")
    .padding()
    .background(.blue)      // blue covers the text AND the padding

Text("Food")
    .background(.blue)      // blue covers only the text
    .padding()              // clear space outside the blue
```

:::figure كل modifier يغلّف الـ view الذي قبله
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">على اليسار: الحشوة أولًا ثم الخلفية، فتحيط الطبقة الزرقاء بالنص وحشوته معًا. على اليمين: الخلفية أولًا ثم الحشوة، فتلتصق الطبقة الزرقاء بالنص وتكون الحشوة خارجها.</title>
  <text class="d-label-strong" x="170" y="24" text-anchor="middle">.padding().background(.blue)</text>
  <rect class="d-box-accent" x="70" y="45" width="200" height="120" rx="8"/>
  <rect class="d-box" x="120" y="85" width="100" height="40" rx="4"/>
  <text class="d-code" x="170" y="110" text-anchor="middle">Food</text>
  <text class="d-label-muted" x="170" y="190" text-anchor="middle">الأزرق يشمل الحشوة</text>
  <text class="d-label-strong" x="510" y="24" text-anchor="middle">.background(.blue).padding()</text>
  <rect class="d-box d-dashed" x="410" y="45" width="200" height="120" rx="8"/>
  <rect class="d-box-accent" x="460" y="85" width="100" height="40" rx="4"/>
  <text class="d-code" x="510" y="110" text-anchor="middle">Food</text>
  <text class="d-label-muted" x="510" y="190" text-anchor="middle">الحشوة خارج الأزرق</text>
</svg>
:::

اقرأ سلسلة الـ modifiers من الأعلى إلى الأسفل على أنها «خذ هذا، ثم غلّفه بذاك». بعض الـ modifiers، مثل `.font` و`.foregroundStyle`، تنتقل إلى كل الأبناء، ولهذا يؤدّي ضبط `.font(.title3)` على `VStack` إلى تنسيق كل النصوص بداخله.

:::mistake معاندة ترتيب الـ modifiers
حين تكون الخلفية أو الإطار أو منطقة النقر بحجم خاطئ، فالسبب في أغلب الأحيان هو الترتيب. مثال شائع: `.onTapGesture` قبل `.padding()`، فالحشوة تحيط بالـ view القابل للنقر من الخارج، والنقر عليها لا يفعل شيئًا. انقل الـ gesture إلى ما بعد الحشوة (وأضِف `.contentShape(Rectangle())` إن كانت المنطقة فارغة)، بدل أن تكدّس إطارًا آخر للتعويض.
:::

## المنطق داخل body

لأن `body` وصف، فكود Swift العادي هو ما يقرّر محتواه. جملة `if` تضمّن view فقط حين يتحقّق شرط، و`switch` تختار بين views:

```swift
HStack {
    Text(expense.title)
    if expense.amount > 100 {
        Image(systemName: "exclamationmark.circle")
            .foregroundStyle(.orange)
            .accessibilityLabel("Large expense")
    }
}
```

لا يوجد استدعاء «أظهِر» أو «أخفِ» في أي مكان. حين يتغيّر المبلغ، يقرأ SwiftUI الـ `body` من جديد فتظهر الأيقونة أو تختفي من تلقاء نفسها. أبقِ الـ body خاليًا من الآثار الجانبية، مثل استدعاءات الشبكة أو الطباعة، لأن SwiftUI قد يقرؤه مرات كثيرة وفي لحظات لا تتحكّم فيها.

## الـ previews

أضف preview (معاينة) في أسفل الملف:

```swift
#Preview {
    ExpenseRow(expense: Expense(title: "Groceries", amount: 64.2, category: .food, date: .now))
        .padding()
}
```

يرسمها Xcode في الـ canvas بجانب كودك ويحدّثها وأنت تكتب. الـ previews هي أسرع حلقة تغذية راجعة في تطوير iOS. أضف واحدة لكل حالة مثيرة للاهتمام، مثل عنوان طويل أو مبلغ كبير أو تخطيط من اليمين إلى اليسار، وستكتشف أخطاء التخطيط قبل أن تشغّل الـ simulator أصلًا.

## views صغيرة تُركَّب معًا

حين يتجاوز الـ `body` نحو شاشة كاملة، استخرج أجزاءه إلى structs مستقلّة:

```swift
struct CategoryBadge: View {
    let category: Category

    var body: some View {
        Text(category.title)
            .font(.caption.bold())
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(.blue.opacity(0.15), in: Capsule())
            .foregroundStyle(.blue)
    }
}
```

الآن يمكن أن يظهر `CategoryBadge(category: expense.category)` في الصف وفي شاشة التفاصيل وفي شريط الفلاتر، بالتنسيق نفسه تمامًا. الاستخراج مجاني وقت التشغيل، ويعطي SwiftUI وحدات أصغر يقارنها حين تتغيّر البيانات.

:::tip الأنماط الدلالية أولًا
فضّل `.headline` و`.secondary` و`.tint` على أحجام النقاط الثابتة والألوان المكتوبة بنظام hex. فهي تتكيّف مع Dynamic Type والوضع الداكن وإعدادات إمكانية الوصول دون عمل إضافي.
:::

كل ما في هذا الدرس يعرض بيانات ثابتة. أما الشاشات الحقيقية فتتغيّر: المستخدم يكتب ويبدّل المفاتيح ويضيف المصاريف. يقدّم الدرس التالي الـ state، أي البيانات التي تقود هذه التغييرات، وكيف يعرف SwiftUI متى يعيد الرسم.
