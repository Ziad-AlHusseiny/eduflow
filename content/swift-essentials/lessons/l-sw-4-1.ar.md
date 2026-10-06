---
summary: اكتب دوال async، وابدأ العمل من SwiftUI عبر .task، وشغّل الاستدعاءات بالتوازي باستخدام async let ومجموعات المهام، واقرأ أخطاء سباق البيانات في Swift 6 المتعلّقة بالـ actors والـ Sendable.
takeaways:
  - "`await` تعلّم نقطة قد تتوقّف فيها الدالة مؤقتًا؛ ويكون الـ thread حرًّا لأداء عمل آخر، مثل إبقاء الواجهة مستجيبة، أثناء الانتظار."
  - "ابدأ العمل غير المتزامن من view عبر `.task`، الذي يلغيه SwiftUI تلقائيًا حين يختفي الـ view."
  - "`async let` ومجموعات المهام تشغّل العمل بالتوازي كمهام أبناء يجب أن تنتهي، أو تُلغى، قبل أن يعود الأب."
  - ترفض Swift 6 ترجمة الكود الذي قد تلمس فيه مهمّتان الـ state القابلة للتغيير نفسها في الوقت ذاته؛ والـ actors والأنواع من نوع `Sendable` هي طريقتك لإرضائها.
  - "أبقِ حالة الواجهة على الـ main actor عبر `@MainActor`؛ ومشاريع Xcode الجديدة تجعل العزل على الـ main actor هو الافتراضي لكود التطبيق."
further:
  - title: Concurrency (The Swift Programming Language)
    url: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/
  - title: Swift 6 Migration Guide
    url: https://www.swift.org/migration/documentation/migrationguide/
  - title: Updating an app to use strict concurrency
    url: https://developer.apple.com/documentation/swift/updating-an-app-to-use-strict-concurrency
quiz:
  - q: "يحمّل view أسعار الصرف داخل `.task { await store.loadEuroRate() }`. يغادر المستخدم الشاشة قبل انتهاء الطلب. ماذا يحدث؟"
    options:
      - text: تستمر المهمة في العمل وتحدّث المخزن لاحقًا.
        why: "هذا ما تفعله مهمة غير مهيكلة `Task { }` داخل زر. أما `.task` فمرتبطة بعمر الـ view."
      - text: "يلغي SwiftUI المهمة، والاستدعاءات التي تنتبه للإلغاء مثل `Task.sleep` أو طلبات URLSession ترمي خطأً."
        why: صحيح. الإلغاء تعاوني؛ والـ APIs غير المتزامنة المنضبطة تلاحظه وتتوقّف مبكرًا.
      - text: يتعطّل التطبيق لأن الـ view لم يعد موجودًا.
        why: "المهمة تحمل ما تحتاجه؛ ولا تعتمد على بقاء الـ struct الخاص بالـ view."
    answer: 1
  - q: "لديك `async let eur = fetch(\"EUR\")` و`async let gbp = fetch(\"GBP\")`، وكلٌّ منهما يستغرق نحو 300 ms، يليهما `try await (eur, gbp)`. كم يستغرق ذلك في المجمل؟"
    options:
      - text: نحو 300 ms، لأن الطلبين يعملان في الوقت نفسه.
        why: "صحيح. كل `async let` تبدأ مهمة ابنًا فورًا؛ وتجمع `await` النتيجتين."
      - text: "نحو 600 ms، لأن كل `await` تنتظر دورها."
        why: "هذا ما يحدث مع استدعاءين عاديين `try await` على التوالي. أما `async let` فتبدأ الاثنين قبل انتظار أيٍّ منهما."
      - text: "فورًا، لأن `async let` لا تنتظر."
        why: "العمل ما زال يستغرق وقتًا؛ `async let` تسمح فقط بتداخله."
    answer: 0
  - q: "لماذا تستطيع استدعاء `await cache.save(rate, for: \"EUR\")` على actor من مهام كثيرة في الوقت نفسه دون سباق بيانات؟"
    options:
      - text: الـ actors تنسخ نفسها لكل مستدعٍ.
        why: الـ actors أنواع مرجعية ولا تُنسخ أبدًا؛ هناك instance واحد بمجموعة state واحدة.
      - text: الـ actors تقفل التطبيق كله أثناء عملها.
        why: الـ state الخاصة بذلك الـ actor وحدها هي المحمية، ولا تنفّذ إلا مهمة واحدة في كل مرة كودًا عليه.
      - text: "الـ actor ينفّذ استدعاءً واحدًا في كل مرة على الـ state الخاصة به، فينتظر المستدعون دورهم عبر `await`."
        why: "صحيح. هذا التسلسل هو سبب حاجة كل استدعاء خارجي لـ actor إلى `await`."
    answer: 2
  - q: "أيّ نوع يكون `Sendable` دون أن تكتب أي شيء إضافي؟"
    options:
      - text: "‏`final class` فيه خاصية `var`."
        why: "الـ state المشتركة القابلة للتغيير هي بالضبط ما يستبعده `Sendable`؛ ولن يستنتجه الـ compiler."
      - text: "struct غير عام كل خصائصه المخزّنة `Sendable`، مثل `String` و`Decimal`."
        why: صحيح. أنواع القيم المبنية من قيم Sendable يمكن نسخها بأمان بين المهام، فتستنتج Swift ذلك.
      - text: "أي class معلّم بـ `@Observable`."
        why: "الـ classes المراقَبة قابلة للتغيير وليست Sendable إلا إذا كانت معزولة على actor مثل `@MainActor`."
    answer: 1
---

يوشك Pocket Budget أن يستدعي خادمًا للحصول على أسعار الصرف. قد يستغرق الطلب 200 ميلي ثانية، أو ثماني ثوانٍ في القطار. لو جلس الـ main thread، الذي يرسم الواجهة ويتعامل مع اللمسات، ينتظره، لتجمّد التطبيق وربما أنهاه iOS في النهاية. نموذج الـ concurrency (التزامن) في Swift يتيح لك كتابة كود ينتظر دون أن يحجب، بأسلوب يُقرأ من الأعلى إلى الأسفل، وتضيف Swift 6 فحوصات في الـ compiler تثبت أن الكود الذي يعمل بالتوازي خالٍ من سباقات البيانات.

## async وawait

```swift title=RateService.swift
import Foundation

struct RateService {
    func fetchRate(from base: String, to target: String) async throws -> Decimal {
        try await Task.sleep(for: .milliseconds(300))   // stands in for a network call
        return target == "EUR" ? 0.92 : 0.79
    }
}
```

`async` في التوقيع تعني «هذه الدالة قد تتوقّف مؤقتًا». وكل استدعاء لها يُعلَّم بـ `await`، التي تعلّم **نقطة تعليق** (suspension point): قد تتوقّف الدالة هناك، ويذهب الـ thread لأداء عمل آخر (مثل تمرير قائمة)، ثم تستأنف الدالة حين تكون النتيجة جاهزة. وتجتمع `async` مع `throws`، فيكون الاستدعاء `try await`. في الدرس التالي يصبح `Task.sleep` طلبًا حقيقيًا.

## بدء العمل غير المتزامن من SwiftUI

الدوال غير المتزامنة لا تُستدعى إلا من سياق غير متزامن. ويعطيك SwiftUI واحدًا عبر الـ modifier المسمّى `.task`:

```swift
@MainActor
@Observable
final class BudgetStore {
    var expenses: [Expense] = []
    var euroRate: Decimal?
    var isLoadingRate = false
    private let rates = RateService()

    func loadEuroRate() async {
        isLoadingRate = true
        defer { isLoadingRate = false }
        do {
            euroRate = try await rates.fetchRate(from: "USD", to: "EUR")
        } catch {
            euroRate = nil
        }
    }
}

struct RateBanner: View {
    let store: BudgetStore

    var body: some View {
        Group {
            if store.isLoadingRate {
                ProgressView()
            } else if let rate = store.euroRate {
                Text("1 USD = \(rate.formatted()) EUR")
            } else {
                Text("Rate unavailable")
            }
        }
        .task {
            await store.loadEuroRate()
        }
    }
}
```

تبدأ `.task` حين يظهر الـ view وتُ**لغى** تلقائيًا حين يختفي، فالمستخدم الذي يغادر الشاشة لا يترك طلبًا يعمل في الخلفية. أما للنقر على زر، فغلّف الاستدعاء في `Task { await store.loadEuroRate() }`، الذي يبدأ عملًا جديدًا على المستوى الأعلى. وتعيد `defer` ضبط علامة التحميل أيًّا كانت طريقة خروج الدالة.

## الـ concurrency المهيكلة: أبناء متوازون

طلبان مستقلّان لا يجب أن ينتظر أحدهما الآخر. `async let` تبدأ العمل فورًا وتتيح لك جمعه لاحقًا:

```swift
func loadBothRates(using service: RateService) async throws -> (eur: Decimal, gbp: Decimal) {
    async let eur = service.fetchRate(from: "USD", to: "EUR")
    async let gbp = service.fetchRate(from: "USD", to: "GBP")
    return try await (eur, gbp)
}
```

يعمل الطلبان في الوقت نفسه، فيستغرق هذا نحو 300 ms بدل 600. ولعدد من المهام لا تعرفه إلا وقت التشغيل، استخدم مجموعة مهام (task group):

```swift
func loadRates(for codes: [String], using service: RateService) async throws -> [String: Decimal] {
    try await withThrowingTaskGroup(of: (String, Decimal).self) { group in
        for code in codes {
            group.addTask {
                (code, try await service.fetchRate(from: "USD", to: code))
            }
        }
        var rates: [String: Decimal] = [:]
        for try await (code, rate) in group {
            rates[code] = rate
        }
        return rates
    }
}
```

هذه هي الـ concurrency **المهيكلة** (structured concurrency): المهام الأبناء تعيش داخل نطاق أبيها. لا تستطيع الدالة أن تعود ما دام ابن ما زال يعمل، وإن رمى أحد الأبناء خطأً أُلغي الباقون، وإلغاء الأب يلغي كل الأبناء. لاحظ أن كل ابن *يعيد* نتيجته والأب يجمّع القاموس. الأبناء لا يكتبون أبدًا في state مشتركة.

## سباقات البيانات والـ compiler في Swift 6

يحدث **سباق البيانات** (data race) حين يصل threadان إلى الذاكرة نفسها في الوقت نفسه ويكتب أحدهما على الأقل. والنتيجة بيانات تالفة أو عطل يظهر مرة في كل ألف تشغيل. يحوّل وضع اللغة Swift 6 فحوصات ذلك إلى أخطاء ترجمة، منظّمة حول مفهوم **العزل** (isolation): كل قطعة من الـ state القابلة للتغيير تنتمي إلى نطاق واحد بالضبط، ولا يلمسها مباشرةً إلا الكود الموجود في ذلك النطاق.

:::figure نطاقات العزل في Pocket Budget
<svg viewBox="0 0 700 240" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة نطاقات عزل. الـ main actor يحمل الـ views والمخزن BudgetStore. والـ actor المسمّى RateCache يحمل الأسعار المخزّنة مؤقتًا. والمهام الأبناء تجلب الأسعار بالتوازي. لا تعبر بين النطاقات إلا قيم Sendable، مثل سعر من النوع Decimal، وكل عبور هو await.</title>
  <rect class="d-box-primary" x="15" y="30" width="220" height="150" rx="12"/>
  <text class="d-label-strong" x="125" y="58" text-anchor="middle">@MainActor</text>
  <text class="d-code" x="125" y="95" text-anchor="middle">Views</text>
  <text class="d-code" x="125" y="125" text-anchor="middle">BudgetStore</text>
  <rect class="d-box-accent" x="465" y="30" width="220" height="150" rx="12"/>
  <text class="d-label-strong" x="575" y="58" text-anchor="middle">actor RateCache</text>
  <text class="d-code" x="575" y="105" text-anchor="middle">rates: [String: Decimal]</text>
  <rect class="d-box-success" x="265" y="70" width="170" height="70" rx="12"/>
  <text class="d-label-strong" x="350" y="100" text-anchor="middle">مهام أبناء</text>
  <text class="d-label-muted" x="350" y="122" text-anchor="middle">تجلب بالتوازي</text>
  <path class="d-arrow" d="M265 90 L237 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M435 90 L463 90" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="215" text-anchor="middle">لا يعبر الحدود إلا قيم Sendable، وكل عبور هو await</text>
</svg>
:::

ثلاث أدوات تغطّي معظم الحالات في أي تطبيق:

**الـ main actor.** يعزل `@MainActor` النوع على الـ main thread. حالة الواجهة تنتمي إلى هناك، ولهذا عُلّم `BudgetStore` بـ `@MainActor` في الكود أعلاه: الـ views التي تقرؤه تعمل على الـ main actor، والآن يضمن الـ compiler ألّا يكتب فيه أي شيء آخر. مشاريع التطبيقات الجديدة في Xcode 26 وما بعده تضبط إعداد البناء **Default Actor Isolation** على `MainActor`، فيكون كود تطبيقك معزولًا على الـ main actor ما لم تقل غير ذلك. إنه افتراض معقول: معظم كود التطبيقات هو كود واجهة.

**الـ actors.** الـ `actor` نوع مرجعي يحمي الـ state الخاصة به بتنفيذ استدعاء واحد في كل مرة. والكود خارج الـ actor يجب أن يستخدم `await` للوصول إليه:

```swift
actor RateCache {
    private var rates: [String: Decimal] = [:]

    func rate(for code: String) -> Decimal? {
        rates[code]
    }

    func save(_ rate: Decimal, for code: String) {
        rates[code] = rate
    }
}

// From anywhere: await cache.save(0.92, for: "EUR")
```

**القيم من نوع Sendable.** يكون النوع `Sendable` (قابلًا للإرسال) حين يكون تمريره بين النطاقات آمنًا. أنواع القيم المبنية من أجزاء Sendable (`String` و`Decimal` والـ struct المسمّى `Expense`) تستوفي ذلك تلقائيًا، وكذلك الـ actors والـ classes المعزولة على الـ main actor. أما الـ class العادي الذي فيه خصائص `var` فلا يستوفيه، ويمنعك الـ compiler من مشاركته بين المهام.

:::mistake مشاركة كائن قابل للتغيير بين المهام الأبناء
كتابة `group.addTask { tally.total += amount }`، حيث `tally` كائن من class عادي، تفشل في الترجمة في Swift 6: يُبلغ الـ compiler أن تمرير الـ closure "risks causing data races"، أو، مع العزل الافتراضي على الـ main actor، أن خاصية معزولة على الـ main actor لا يمكن تعديلها من سياق غير معزول. لا تُسكت الخطأ. اجعل كل ابن يعيد قيمته واجمع النتائج في الأب، أو انقل الـ state إلى actor.
:::

:::note جعلها في المتناول
قدّمت Swift 6.2 مجموعة خيارات يسمّيها Xcode **Approachable Concurrency**. معها، تعمل الدالة غير المتزامنة المعلّمة بـ `nonisolated` على الـ actor الخاص بمن استدعاها ما لم تعلّمها بـ `@concurrent`، ما يعني أن معظم كود التطبيق يبقى على الـ main actor ولا ينتقل عنه إلا العمل الذي تختاره أنت. سترى هذه الإعدادات في إعدادات البناء لأي مشروع جديد؛ اتركها مفعّلة.
:::

هذه هي المفردات: `async` و`await` والمهام والـ actors و`Sendable`. لا تحتاج إلى إتقان كل قاعدة دفعة واحدة؛ اقرأ كل خطأ من الـ compiler كسؤال عن النطاق الذي يملك البيانات. بعد ذلك تستبدل `Task.sleep` التمثيلية بطلب حقيقي وتفكّ ترميز الـ JSON الذي يعيده.
