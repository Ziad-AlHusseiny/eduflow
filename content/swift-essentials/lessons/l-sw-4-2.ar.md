---
summary: اجلب JSON عبر الـ API غير المتزامن في URLSession، وافحص حالة HTTP، وفكّ ترميزه إلى structs من نوع Codable، واعرض حالات التحميل والنجاح والفشل في SwiftUI.
takeaways:
  - "`try await URLSession.shared.data(from: url)` يعيد جسم الاستجابة والاستجابة نفسها؛ ويرمي خطأً عند فشل الشبكة، لكن ليس عند أخطاء HTTP مثل 404 أو 500."
  - "افحص دائمًا رمز الحالة في `HTTPURLResponse` قبل فكّ الترميز، وحوّل الحالة السيئة إلى خطأ خاص بك."
  - "اعكس شكل الـ JSON في structs من نوع `Decodable`؛ و`keyDecodingStrategy` و`dateDecodingStrategy` يتعاملان مع المفاتيح بصيغة snake_case والتواريخ بصيغة ISO 8601."
  - "صِف دورة حياة الشاشة كـ enum اسمه `LoadState`، فلا يمكن أبدًا عرض التحميل والبيانات والأخطاء في الوقت نفسه."
further:
  - title: Fetching website data into memory
    url: https://developer.apple.com/documentation/foundation/fetching-website-data-into-memory
  - title: Encoding and Decoding Custom Types
    url: https://developer.apple.com/documentation/foundation/encoding-and-decoding-custom-types
  - title: URLSession
    url: https://developer.apple.com/documentation/foundation/urlsession
quiz:
  - q: "يجيب الخادم على طلب بالحالة HTTP 500 وصفحة خطأ بصيغة HTML. ماذا يفعل `try await URLSession.shared.data(from: url)`؟"
    options:
      - text: "يرمي `URLError` يحمل رمز الحالة."
        why: لا يرمي URLSession خطأً إلا حين يتعذّر إكمال الطلب. والحالة 500 استجابة مكتملة.
      - text: "يعيد الـ HTML على أنه `data` واستجابة قيمة `statusCode` فيها 500."
        why: صحيح. لهذا تفحص الحالة بنفسك قبل فكّ الترميز.
      - text: يعيد المحاولة تلقائيًا حتى يحصل على 200.
        why: لا يعيد URLSession المحاولة عند أخطاء HTTP؛ سياسة إعادة المحاولة متروكة لك.
    answer: 1
  - q: "في الـ JSON مفتاح اسمه `updated_at`، وفي الـ struct الخاص بك `let updatedAt: Date`. يفشل فكّ الترميز مع `keyNotFound`. ما أصغر إصلاح؟"
    options:
      - text: "أعد تسمية الخاصية إلى `updated_at`."
        why: يعمل، لكنه يجرّ أسلوب التسمية الخاص بالخادم إلى كود Swift الخاص بك.
      - text: "اجعل الخاصية optional: `let updatedAt: Date?`."
        why: "يختفي الخطأ، لكن التاريخ يصبح `nil` دائمًا لأن المفتاح ما زال لا يتطابق."
      - text: "اضبط `decoder.keyDecodingStrategy = .convertFromSnakeCase`."
        why: "صحيح. يربط الـ decoder المفتاح `updated_at` بـ `updatedAt` لكل المفاتيح، فتبقى أسماؤك في Swift على أسلوبها المعتاد."
    answer: 2
  - q: "لماذا تستخدم شاشة الأسعار enum واحدًا اسمه `LoadState` بدل الخصائص `isLoading` و`rates` و`errorMessage`؟"
    options:
      - text: الخصائص المنفصلة تسمح بتركيبات مستحيلة، مثل التحميل والفشل معًا؛ أما الـ enum فيسمح بحالة واحدة بالضبط.
        why: صحيح. يكتب الـ view جملة switch على الـ enum ويعالج كل حالة مرة واحدة بالضبط.
      - text: لا يستطيع SwiftUI مراقبة أكثر من خاصية واحدة في كل class.
        why: يتتبّع Observation كل خاصية يقرؤها الـ body؛ ليس هذا هو السبب.
      - text: الـ enums تجعل طلبات الشبكة أسرع.
        why: الـ enum يغيّر طريقة وصف الـ state، لا سرعة تنفيذ الطلب.
    answer: 0
---

يسجّل Pocket Budget المصاريف بالدولار، لكنك تنفق في إجازتك باليورو والجنيه المصري. وللتحويل، يحتاج التطبيق إلى أسعار الصرف لهذا اليوم من خادم. يستبدل هذا الدرس `Task.sleep` التمثيلية من الدرس السابق بطلب حقيقي: ابنِ URL، واجلب البيانات، وافحص الاستجابة، وفكّ ترميز الـ JSON إلى أنواع Swift، ثم اعرضها. هذه الخطوات هي نفسها مع معظم الـ APIs التي ستستدعيها في حياتك.

تستخدم الأمثلة endpoint بديلًا، `https://api.example.com/v1/latest?base=USD`. ضع مكانه مزوّدًا حقيقيًا لأسعار الصرف (لمعظمهم باقة مجانية) وعدّل الـ struct ليطابق الـ JSON الخاص به. تبدو الاستجابة هكذا:

```json
{
  "base": "USD",
  "updated_at": "2026-10-02T06:00:00Z",
  "rates": { "EUR": 0.92, "GBP": 0.79, "EGP": 48.31 }
}
```

## اعكس شكل الـ JSON باستخدام Codable

```swift title=RatesResponse.swift
import Foundation

struct RatesResponse: Decodable {
    let base: String
    let updatedAt: Date
    let rates: [String: Decimal]
}
```

يطلب `Decodable` من الـ compiler أن يولّد الكود الذي يقرأ هذا النوع من صيغة خارجية. يجب أن تطابق أسماء الخصائص مفاتيح الـ JSON وأن تناسب الأنواع: كائن JSON يصبح قاموسًا، والرقم يمكن فكّ ترميزه إلى `Decimal`، والمفتاح الغائب أو النوع الخاطئ يرمي `DecodingError` يسمّي المشكلة. استخدم `Codable` (أي `Decodable` مع `Encodable`) حين ترسل النوع أيضًا. والـ struct مبني من أجزاء `Sendable`، فهو `Sendable` أيضًا ويستطيع الانتقال بأمان من كود الشبكة إلى الـ main actor.

الـ JSON يقول `updated_at`، وأسلوب Swift يقول `updatedAt`. بدل إعادة تسمية الخصائص، اضبط الـ decoder، كما يفعل العميل أدناه.

## اجلب، افحص، فكّ الترميز

```swift title=RateClient.swift
enum RateError: Error {
    case badStatus(Int)
}

struct RateClient {
    let endpoint = URL(string: "https://api.example.com/v1/latest")!

    func latest(base: String) async throws -> RatesResponse {
        let url = endpoint.appending(queryItems: [URLQueryItem(name: "base", value: base)])

        let (data, response) = try await URLSession.shared.data(from: url)

        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard status == 200 else {
            throw RateError.badStatus(status)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(RatesResponse.self, from: data)
    }
}
```

امشِ عليه بالترتيب. تبني `appending(queryItems:)` العنوان `...latest?base=USD` وتطبّق الـ percent-encoding على القيم تلقائيًا، وهذا أكثر أمانًا من لصق النصوص ببعضها. والفكّ القسري على `URL(string:)` من النوع المقبول الذي رأيته في درس الـ optionals: قيمة كتبتها بنفسك، تعني `nil` فيها خطأً إملائيًا.

`URLSession.shared.data(from:)` هو الـ API غير المتزامن: يعلّق التنفيذ حتى تصل الاستجابة كاملة، ويعيد بايتات الجسم مع `URLResponse`. يرمي خطأً عند فشل النقل، مثل انعدام الاتصال أو انتهاء المهلة أو الإلغاء، لكنه **لا** يرمي عند أخطاء HTTP. ولهذا وُجدت جملة `guard`.

يربط `.convertFromSnakeCase` المفتاح `updated_at` بـ `updatedAt` لكل المفاتيح، ويقرأ `.iso8601` صيغة الطابع الزمني التي تستخدمها معظم الـ APIs. ثم إما أن تعيد `decode` كائن `RatesResponse` مكتمل البناء أو ترمي خطأً.

:::figure من الـ URL إلى البكسلات
<svg viewBox="0 0 700 170" role="img" aria-labelledby="t1">
  <title id="t1">خمس خطوات من اليسار إلى اليمين: ابنِ الـ URL، واجلب باستخدام data(from:)، وافحص رمز الحالة، وفكّ ترميز الـ JSON إلى RatesResponse، ثم اضبط الـ state على الـ main actor فيتحدّث الـ view.</title>
  <rect class="d-box" x="5" y="50" width="120" height="64" rx="10"/>
  <text class="d-label-strong" x="65" y="78" text-anchor="middle">ابنِ الـ URL</text>
  <text class="d-label-muted" x="65" y="99" text-anchor="middle">query items</text>
  <path class="d-arrow" d="M125 82 L143 82" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="145" y="50" width="125" height="64" rx="10"/>
  <text class="d-label-strong" x="207" y="78" text-anchor="middle">اجلب</text>
  <text class="d-code" x="207" y="99" text-anchor="middle">data(from:)</text>
  <path class="d-arrow" d="M270 82 L288 82" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="290" y="50" width="120" height="64" rx="10"/>
  <text class="d-label-strong" x="350" y="78" text-anchor="middle">افحص</text>
  <text class="d-label-muted" x="350" y="99" text-anchor="middle">الحالة 200</text>
  <path class="d-arrow" d="M410 82 L428 82" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="430" y="50" width="120" height="64" rx="10"/>
  <text class="d-label-strong" x="490" y="78" text-anchor="middle">فكّ الترميز</text>
  <text class="d-label-muted" x="490" y="99" text-anchor="middle">JSONDecoder</text>
  <path class="d-arrow" d="M550 82 L568 82" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="570" y="50" width="125" height="64" rx="10"/>
  <text class="d-label-strong" x="632" y="78" text-anchor="middle">اعرض</text>
  <text class="d-label-muted" x="632" y="99" text-anchor="middle">main actor</text>
  <text class="d-label-muted" x="350" y="150" text-anchor="middle">أي خطوة قد ترمي خطأً؛ وcatch واحدة في النموذج تحوّله إلى حالة الفشل</text>
</svg>
:::

:::mistake فكّ الترميز دون فحص الحالة
تخطَّ فحص الحالة، وستُرسل استجابة 500 صفحة خطأ بصيغة HTML إلى `JSONDecoder`، الذي يرمي رسالة محيّرة: "data couldn't be read because it isn't in the correct format". تقضي ساعة في تتبّع خطأ في الـ decoder بينما أخبرك الخادم بالضبط بما حدث. افحص الحالة أولًا، وضمّنها في الخطأ الخاص بك.
:::

وليست كل حالات الفشل تستحق الرسالة نفسها. فالـ `URLError` الذي يُرمى يحمل `code`، فتستطيع التمييز بين «غير متصل» (`.notConnectedToInternet`) و«انتهت المهلة» (`.timedOut`)، وتقول "You're offline. Rates will refresh when you reconnect" بدل اعتذار عام. المستخدمون يسامحون التطبيق الذي يشرح نفسه.

## حالات تحميل يثق بها الـ view

فكرة الـ enum من درس الـ enums تؤتي ثمارها الآن. نموذج على الـ main actor يملك الـ state، والـ view يكتب switch عليها:

```swift title=RatesModel.swift
@MainActor
@Observable
final class RatesModel {
    enum LoadState {
        case idle
        case loading
        case loaded(RatesResponse)
        case failed(String)
    }

    var state: LoadState = .idle
    private let client = RateClient()

    func load() async {
        state = .loading
        do {
            let response = try await client.latest(base: "USD")
            state = .loaded(response)
        } catch {
            state = .failed(error.localizedDescription)
        }
    }
}
```

```swift title=RatesView.swift
struct RatesView: View {
    @State private var model = RatesModel()

    var body: some View {
        List {
            switch model.state {
            case .idle, .loading:
                ProgressView()
            case .loaded(let response):
                ForEach(response.rates.keys.sorted(), id: \.self) { code in
                    LabeledContent(code, value: response.rates[code] ?? 0,
                                   format: .number.precision(.fractionLength(2...4)))
                }
            case .failed(let message):
                ContentUnavailableView("Couldn't load rates",
                                       systemImage: "wifi.exclamationmark",
                                       description: Text(message))
            }
        }
        .navigationTitle("Exchange Rates")
        .task { await model.load() }
        .refreshable { await model.load() }
    }
}
```

تحمّل `.task` البيانات مرة واحدة حين تظهر الشاشة، ويضيف `.refreshable` السحب للتحديث بالدالة نفسها. ولأن `RatesModel` معلّم بـ `@MainActor`، يكون إسناد `state` آمنًا دائمًا للواجهة، وتتحقّق Swift 6 من ذلك عنك. وكل مسار خطأ ينتهي في `.failed`، فلا يحدّق المستخدم أبدًا في مؤشّر تحميل لن يتوقّف. ومفاتيح القاموس لا ترتيب لها، فيرتّبها الـ view ليحصل على قائمة ثابتة.

:::tip أين يُنفَّذ فكّ الترميز
مع العزل الافتراضي على الـ main actor، يعمل `RateClient` على الـ main actor أيضًا. الطلب نفسه لا يحجبه؛ فـ `await` تعلّق التنفيذ أثناء وصول البايتات. وفكّ ترميز بضع مئات من البايتات على الـ main thread لا بأس به. أما للاستجابات التي تبلغ عدة ميغابايتات، فانقل فكّ الترميز إلى دالة `async` معلّمة بـ `@concurrent` لتعمل في الخلفية، وأعلن النموذج بالصيغة `nonisolated struct RatesResponse`؛ وإلا فسيكون توافقه مع `Decodable` معزولًا على الـ main actor أيضًا، ولن يسمح الـ compiler للكود العامل في الخلفية باستخدامه.
:::

يشترط iOS أيضًا HTTPS افتراضيًا عبر App Transport Security، فيفشل الـ URL الذي يبدأ بـ `http://` العادي ما لم تُضِف استثناءً. استخدم HTTPS ولن تحتاج إلى استثناء أبدًا.

صار Pocket Budget قادرًا على التحدّث مع العالم الخارجي. لكنه ما زال ينسى مصاريفه حين تغلقه، لذلك ستحفظها بعد ذلك على الجهاز باستخدام SwiftData.
