---
summary: "احمِ منطق Pocket Budget بـ Swift Testing باستخدام @Test و#expect و#require والاختبارات ذات المعاملات، ثم أرشِف التطبيق وأرسل نسخة إلى المختبِرين عبر TestFlight."
takeaways:
  - "اختبارات Swift Testing دوال عادية معلّمة بـ `@Test`؛ و`#expect` يفحص شرطًا ويُبلغ عن القيم الفعلية حين يفشل."
  - "`#require` يوقف الاختبار مبكرًا حين يفشل شرط مسبق، ويفكّ الـ optionals أيضًا فيعمل باقي الاختبار بقيم حقيقية."
  - "`#expect(throws:)` يتحقّق من أن الكود يرمي خطأً محدّدًا، و`@Test(arguments:)` يشغّل اختبارًا واحدًا على مدخلات كثيرة."
  - اختبر المنطق الخالص أولًا، مثل الميزانيات والتحليل والتنسيق، لأنه سريع ومستقر ويحمل القواعد التي تهمّ المستخدمين أكثر.
  - يوزّع TestFlight النسخ على ما يصل إلى 100 مختبِر داخلي دون مراجعة، وعلى ما يصل إلى 10,000 مختبِر خارجي بعد Beta App Review.
further:
  - title: Swift Testing
    url: https://developer.apple.com/documentation/testing
  - title: TestFlight
    url: https://developer.apple.com/testflight/
  - title: Distributing your app for beta testing and releases
    url: https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases
quiz:
  - q: "يحتاج اختبار إلى مبلغ محلَّل قبل أن يستطيع فحص أي شيء آخر، و`parseAmount` تعيد `Decimal?`. أيّ سطر هو الأنسب؟"
    options:
      - text: "`let amount = parseAmount(\"12.50\")!`"
        why: "الفكّ القسري يُسقط عملية الاختبارات كلها عند `nil` بدل أن يُفشل اختبارًا واحدًا برسالة واضحة."
      - text: "`let amount = try #require(parseAmount(\"12.50\"))`"
        why: "صحيح. يفكّ القيمة، وإن كانت `nil` يتوقّف الاختبار عندها ويُسجَّل فاشلًا."
      - text: "`#expect(parseAmount(\"12.50\") != nil)`، ثم تستخدم الـ optional."
        why: سيستمر الاختبار بعد الفشل، وسيضطر كل سطر لاحق إلى التعامل مع الـ optional.
    answer: 1
  - q: "فشل `#expect(food.spent == 57)`. بماذا يُبلغ Swift Testing؟"
    options:
      - text: "فقط \"Expectation failed\"، دون أي تفاصيل أخرى."
        why: يلتقط الماكرو التعبيرات الفرعية، فترى القيمة الفعلية أيضًا.
      - text: لا شيء؛ يستمر الاختبار وينجح في النهاية.
        why: "الـ `#expect` الفاشل يُسجَّل كمشكلة، فيفشل الاختبار رغم أنه يستمر في العمل."
      - text: "التعبير مع قيمته الفعلية، مثل `(food.spent → 12) == 57`."
        why: صحيح. رؤية القيمة الحقيقية تكشف لك الخطأ في الغالب دون debugger.
    answer: 2
  - q: من يستطيع تثبيت نسخة TestFlight دون أن تمرّ بـ Beta App Review؟
    options:
      - text: المختبِرون الداخليون، وهم أعضاء فريقك في App Store Connect.
        why: صحيح. الاختبار الداخلي موجود للتكرار السريع داخل الفريق.
      - text: أي شخص يفتح الرابط العام الخاص بك.
        why: الروابط العامة مخصّصة للمختبِرين الخارجيين، الذين تحتاج نسخهم إلى Beta App Review أولًا.
      - text: المختبِرون الخارجيون الذين تدعوهم بالبريد الإلكتروني.
        why: المختبِرون الخارجيون، أيًّا كانت طريقة دعوتهم، يحتاجون إلى نسخة اعتمدتها Beta App Review.
    answer: 0
---

بنيت Pocket Budget على مدى أربعة عشر درسًا. تخيّل الآن أنك ستغيّر `CategoryBudget` الشهر القادم لدعم ترحيل الرصيد بين الأشهر. كيف تعرف أن قاعدة تجاوز الحدّ ما زالت تعمل؟ يمكنك أن تنقر في التطبيق في كل مرة، أو أن تجعل الحاسوب يتحقّق منها في جزء من الثانية، مع كل تغيير، إلى الأبد. ثم، بعد أن يعمل، تحتاج إلى أشخاص حقيقيين يستخدمونه على هواتف حقيقية قبل أن تثق به في إطلاق على App Store.

## Swift Testing في خمس دقائق

Swift Testing هو إطار الاختبار من Apple، المدمج في Xcode 16 وما بعده. حين تنشئ مشروعًا، اختر Swift Testing كنظام الاختبار وسيضيف Xcode هدف اختبار (test target)؛ ولمشروع موجود، اختر File › New › Target › Unit Testing Bundle ثم اختر Swift Testing. اختبر منطق الميزانية من درس معالجة الأخطاء:

```swift title=PocketBudgetTests/CategoryBudgetTests.swift
import Testing
@testable import PocketBudget

struct CategoryBudgetTests {
    @Test func recordingAnExpenseIncreasesSpent() throws {
        var food = CategoryBudget(limit: 300)
        try food.record(title: "Groceries", amount: 64.2)
        #expect(food.spent == 64.2)
        #expect(food.limit - food.spent == 235.8)
    }

    @Test("Going over the limit throws and leaves the budget unchanged")
    func overLimitThrows() throws {
        var food = CategoryBudget(limit: 50)
        try food.record(title: "Lunch", amount: 12)

        #expect(throws: BudgetError.overLimit(by: 7)) {
            try food.record(title: "Dinner", amount: 45)
        }
        #expect(food.spent == 12)
    }
}
```

تعطي `@testable import` الاختبارات صلاحية الوصول إلى الأنواع الداخلية في تطبيقك. الاختبار هو أي دالة معلّمة بـ `@Test`؛ والنص الاختياري اسم مقروء يظهر في متصفّح الاختبارات. وتجميع الاختبارات في struct يجعله **suite** (مجموعة اختبارات)، ويحصل كل اختبار على instance جديد، فلا تستطيع الاختبارات تسريب state إلى بعضها.

يأخذ `#expect` تعبير Swift عاديًا. وحين يفشل، يتضمّن التقرير القيم الفعلية، مثل `Expectation failed: (food.spent → 12) == 57`، وهذا يخبرك في الغالب بما حدث قبل أن تفتح الـ debugger. أما `#expect(throws:)` فلا ينجح إلا إن رمى الـ closure ذلك الخطأ بالضبط. ولهذا يتوافق `BudgetError` مع `Equatable` منذ درس معالجة الأخطاء. شغّل كل شيء بـ Cmd-U، أو انقر على المعيّن بجانب اختبار واحد.

## ‏#require والاختبارات ذات المعاملات

```swift
@Test func parsesValidAmount() throws {
    let amount = try #require(parseAmount("12.50"))
    #expect(amount == 12.5)
}

@Test(arguments: ["", "abc", "0", "-3"])
func rejectsInvalidAmounts(text: String) {
    #expect(parseAmount(text) == nil)
}
```

`#require` هو `#expect` مع زر إيقاف: إن فشل الشرط، ينتهي الاختبار عند ذلك السطر. وإن أعطيته optional، يفكّه، فيستخدم باقي الاختبار قيمة `Decimal` حقيقية. استخدمه للشروط المسبقة؛ واستخدم `#expect` للادّعاءات الفعلية، فيُبلغ التشغيل الواحد عن كل ادّعاء مكسور، لا عن الأول فقط.

يشغّل `@Test(arguments:)` الاختبار نفسه مرة لكل مُدخَل ويُبلغ عن كل حالة على حدة. أربعة مدخلات سيئة، ودالة واحدة، والفشل يخبرك بالضبط أيّ مُدخَل كسر الكود.

:::mistake الفكّ القسري في الاختبارات
`let amount = parseAmount("12.50")!` يُسقط عملية الاختبار حين تكون القيمة `nil`، فتخسر باقي التشغيل ومعه رسالة مفيدة. أما `try #require(…)` فيحوّل الموقف نفسه إلى فشل واحد مُبلَّغ عنه بوضوح.
:::

## ماذا تختبر أولًا

ابدأ حيث تؤذي الأخطاء المستخدمين وحيث تكون الاختبارات رخيصة: المنطق الخالص بلا واجهة. في Pocket Budget هذا يعني حسابات الميزانية، وتحليل المبالغ، وتحويل العملات، وانتقالات `LoadState`. تعمل هذه الاختبارات في أجزاء من الثانية ولا تتذبذب نتائجها أبدًا. وللكود الذي يحتاج SwiftData، أنشئ الـ container في الذاكرة من الدرس السابق داخل الاختبار، وعلّم الاختبار بـ `@MainActor` حين يلمس الـ context الرئيسي. اترك فحوصات الواجهة على مستوى البكسل لوقت لاحق؛ فالـ previews تكتشف معظم مشاكل التخطيط أسرع.

:::figure من الأرشيف إلى المختبِرين
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">أرشِف في Xcode، وارفع إلى App Store Connect، وانتظر المعالجة. بعدها يحصل المختبِرون الداخليون على النسخة فورًا، بينما يحصل عليها المختبِرون الخارجيون بعد Beta App Review. ويثبّت المختبِرون النسخة عبر تطبيق TestFlight.</title>
  <rect class="d-box" x="10" y="80" width="120" height="60" rx="10"/>
  <text class="d-label-strong" x="70" y="108" text-anchor="middle">أرشفة</text>
  <text class="d-label-muted" x="70" y="128" text-anchor="middle">Xcode</text>
  <path class="d-arrow" d="M130 110 L158 110" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="160" y="80" width="130" height="60" rx="10"/>
  <text class="d-label-strong" x="225" y="108" text-anchor="middle">رفع</text>
  <text class="d-label-muted" x="225" y="128" text-anchor="middle">Organizer</text>
  <path class="d-arrow" d="M290 110 L318 110" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="320" y="80" width="140" height="60" rx="10"/>
  <text class="d-label-strong" x="390" y="108" text-anchor="middle">معالجة</text>
  <text class="d-label-muted" x="390" y="128" text-anchor="middle">App Store Connect</text>
  <path class="d-arrow" d="M460 95 L518 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 125 L518 170" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="520" y="15" width="170" height="64" rx="10"/>
  <text class="d-label-strong" x="605" y="42" text-anchor="middle">مختبِرون داخليون</text>
  <text class="d-label-muted" x="605" y="63" text-anchor="middle">حتى 100، بلا مراجعة</text>
  <rect class="d-box-warn" x="520" y="140" width="170" height="64" rx="10"/>
  <text class="d-label-strong" x="605" y="167" text-anchor="middle">مختبِرون خارجيون</text>
  <text class="d-label-muted" x="605" y="188" text-anchor="middle">حتى 10,000، بعد مراجعة</text>
</svg>
:::

## إطلاق نسخة تجريبية عبر TestFlight

TestFlight هو طريقتك لإيصال نسخة إلى أجهزة iPhone الخاصة بأشخاص آخرين قبل الإطلاق. تحتاج إلى عضوية مدفوعة في Apple Developer Program وسجلّ للتطبيق في App Store Connect بمعرّف الحزمة (bundle identifier) نفسه الذي في مشروعك. ثم:

1. في إعدادات General للهدف، اضبط **Version** (ما يراه المستخدمون، مثل 1.0) ورقم **Build** (‏1، 2، 3…).
2. اختر جهاز iOS عامًا (generic) كوجهة للتشغيل، ثم Product › Archive.
3. في نافذة Organizer التي تُفتح، اختر الأرشيف، وانقر Distribute App واختر خيار App Store Connect. يوقّع Xcode النسخة ويرفعها.
4. انتظر حتى يعالجها App Store Connect، وهذا يستغرق دقائق عادةً، وأجب عن سؤال الامتثال لقيود التصدير المتعلّق بالتشفير.
5. أضف النسخة إلى مجموعة مختبِرين. **المختبِرون الداخليون**، وهم حتى 100 شخص في فريقك على App Store Connect، يستطيعون تثبيتها فورًا. أما **المختبِرون الخارجيون**، وهم حتى 10,000 شخص تدعوهم بالبريد الإلكتروني أو برابط عام، فيحصلون عليها بعد أن تجتاز النسخة Beta App Review.

يثبّت المختبِرون تطبيق TestFlight المجاني، ويقبلون الدعوة، ويثبّتون نسختك التجريبية. ويستطيعون إرسال ملاحظات مع لقطات شاشة مباشرة من التطبيق، وستجد تقاريرهم، مع سجلّات الأعطال، في App Store Connect. وتبقى كل نسخة قابلة للاختبار 90 يومًا.

:::tip ارفع رقم الـ Build مع كل رفع
يرفض App Store Connect أي رفع رأى رقم الـ Build الخاص به من قبل لذلك الإصدار. زِد **Build** قبل كل أرشفة، أو دع Xcode يديره أثناء التوزيع. واحتفظ بـ **Version** للإصدارات ذات المعنى.
:::

هذه هي الدورة الكاملة التي يمرّ بها مطوّر iOS المحترف كل أسبوع: صمّم البيانات بالأنواع، وابنِ الشاشات بـ SwiftUI، واجلب البيانات واحفظها بأمان تحت فحوصات الـ concurrency في Swift 6، وأثبت المنطق بالاختبارات، وضع النسخ بين أيدي المختبِرين. ومن هنا، من الخطوات التالية الجيدة إضافة رسوم بيانية للإنفاق حسب التصنيف باستخدام Swift Charts، والمزامنة مع iCloud عبر SwiftData، وتجهيز صفحة تطبيقك على App Store. لديك الأساسات اللازمة لكل ذلك.
