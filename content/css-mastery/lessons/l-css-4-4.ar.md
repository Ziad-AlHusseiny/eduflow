---
summary: "نظّم ملف أنماط ينمو باستخدام طبقات الـ cascade، ومستويات الـ tokens، وcomponents بـ class واحد، ومجموعة صغيرة من الـ utilities، ليستطيع الفريق تغيير الـ CSS دون خوف."
takeaways:
  - "ترتيب layers مثل `reset, tokens, base, layouts, components, utilities` يحسم التعارض بين أنواع الـ CSS، فتستطيع الـ selectors أن تبقى بـ class واحد."
  - "الـ tokens تعمل أفضل على مستويات: قيم لوحة الألوان الخام، وأدوار دلالية مثل `--color-brand`، وخصائص على مستوى الـ component مثل `--card-accent` يستطيع العنصر الأب تجاوزها."
  - "لا ينبغي للـ components أن تضبط الـ margins الخارجية الخاصة بها؛ التخطيط المحيط بها هو صاحب المسافات، وعادةً عبر `gap`."
  - "أبقِ الـ utilities قليلة وأحادية الغرض، في الـ layer الأخيرة، لتفوز دون `!important`."
further:
  - title: "Cascade layers (MDN guide)"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers
  - title: "@scope (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope
  - title: "Organizing your CSS (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Organizing
quiz:
  - q: "صفحة الراعي تحتاج إلى أن يكون لون التمييز في كل بطاقة جلسة أزرق مخضرًا (teal) بدل البنفسجي. في معمارية مبنية على الـ tokens، ما التغيير الصحيح؟"
    options:
      - text: "أضف `.sponsor-page .session-card { border-color: teal !important; }`."
        why: "هذا يتجاوز خاصية واحدة بالقوة الغاشمة؛ وتبقى الشارة وحالة المرور وكل ما يستخدم لون التمييز بنفسجية."
      - text: "انسخ CSS البطاقة إلى شكل `.session-card--sponsor` بقيم teal."
        why: "CSS الـ component المكرّرة تنحرف عن الأصل في أول مرة يعدّل فيها أحدهم الأصل."
      - text: "اضبط `--card-accent: teal` على غلاف صفحة الراعي."
        why: "صحيح. البطاقة تقرأ `--card-accent` في كل مكان تستخدم فيه لون التمييز، والـ custom properties موروثة، فيغيّر تصريح واحد ثيم كل جزء من كل بطاقة بداخله."
    answer: 2
  - q: "لماذا لا ينبغي أن تضبط `.session-card` قيمة `margin-bottom: 16px` على نفسها؟"
    options:
      - text: "لأن الـ margins لا تعمل على عناصر grid."
        why: "الـ margins تعمل على عناصر grid؛ المشكلة في من يقرّر المسافات."
      - text: "لأن المسافات تعتمد على مكان وضع البطاقة، فيجب أن يملكها التخطيط المحيط بها، عبر `gap` مثلًا."
        why: "صحيح. البطاقة نفسها تجلس في شبكة وفي شريط جانبي وفي شريط عرض متحرّك (carousel)؛ ولكل سياق مسافات مختلفة، والـ margin المدمجة تحاربها كلها."
      - text: "لأن الـ margins أبطأ في الرسم من gap."
        why: "لا فرق يُذكر في الأداء؛ المسألة مسألة ملكية وإعادة استخدام."
      - text: "لأنه يجب استخدام الخصائص المنطقية بدلًا منها."
        why: "`margin-block-end` ستعاني المشكلة نفسها؛ المشكلة في أن الـ component يضع مسافاته بنفسه، لا في اسم الخاصية."
    answer: 1
  - q: "أين يجب أن تعيش الـ utility `.u-hidden { display: none; }` لتتغلّب دائمًا على قواعد display في الـ components دون `!important`؟"
    options:
      - text: "في آخر layer مُعلنة، مثل `utilities`."
        why: "صحيح. الـ layers اللاحقة تفوز في التصريحات العادية، أيًّا كانت specificity الـ selector في الـ component."
      - text: "في layer `reset`، لتنطبق مبكرًا."
        why: "الـ layers المبكرة تخسر أمام اللاحقة؛ وأيّ component يضبط `display` سيتجاوزها."
      - text: "خارج الـ layers، في أعلى ملف الأنماط."
        why: "الأنماط خارج الـ layers تتغلّب فعلًا على كل layer، لكن ترك القواعد خارجها عمدًا يجعل الترتيب غير مرئي ويستدعي مزيدًا من الترقيعات خارج الـ layers."
    answer: 0
---

بدأت الواجهة الأمامية لـ Waypoint بمطوّر واحد وملف `styles.css` واحد. وبعد سنتين صار هناك خمسة مطوّرين، وأربعون component، وموقع مصغّر لأحد الرعاة يغيّر مظهر الجدول، وملف أنماط لا يجرؤ أحد على حذف شيء منه. كل إصلاح خطأ تجاوزٌ جديد، وكل تجاوز أثقل قليلًا من سابقه، وعدد `!important` لا يفعل إلا أن يزيد.

هذه ليست مشكلة انضباط. إنها مشكلة معمارية، وكل ما في هذه الدورة حتى الآن يعطيك القطع اللازمة لإصلاحها.

## كومة الـ layers هي المعمارية

ابدأ ملف الأنماط الرئيسي بتعليمة واحدة تسمّي كل نوع من الـ CSS لديك، بترتيب الأولوية:

```css title=main.css
@layer reset, tokens, base, layouts, components, utilities;

@import url("reset.css") layer(reset);
@import url("tokens.css") layer(tokens);
@import url("base.css") layer(base);
@import url("layouts/schedule.css") layer(layouts);
@import url("components/session-card.css") layer(components);
@import url("components/speaker.css") layer(components);
@import url("utilities.css") layer(utilities);
```

لكل layer مهمة واحدة:

| الـ layer | تحتوي على | مثال |
|---|---|---|
| reset | توحيد افتراضيات المتصفّح | `*, *::before { box-sizing: border-box; }` |
| tokens | custom properties فقط | `--color-brand`، `--space-m` |
| base | أنماط العناصر المجرّدة، بـ specificity منخفضة | `:where(a) { color: var(--link); }` |
| layouts | بنية الصفحة ومناطقها | `.schedule { display: grid; gap: … }` |
| components | كتلة واحدة لكل component | `.session-card { … }` |
| utilities | تجاوزات أحادية الغرض | `.u-hidden`، `.u-visually-hidden` |

لأن الـ layers تحسم التعارض *بين* الأنواع، تستطيع الـ selectors داخل كل layer أن تبقى مسطّحة: class واحد للـ component، و`:where()` للأنماط الأساسية. لا أحد يحتاج إلى ID أو سلسلة من ثلاثة classes ليفوز، فلا أحد يكتبها.

:::figure تتدفّق الـ tokens من القيم الخام إلى الأدوار إلى الـ components، والـ layers تقرّر أيّ نوع من القواعد يفوز
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة مستويات من الـ tokens تصل بينها أسهم: قيم لوحة الألوان مثل violet 600 تغذّي tokens دلالية مثل color brand، وهذه تغذّي tokens الـ component مثل card accent. غلاف الراعي يتجاوز card accent. وبجانبها كومة الـ layers من reset إلى utilities.</title>
  <rect class="d-box" x="20" y="20" width="200" height="50" rx="10"/>
  <text class="d-code" x="36" y="50">--violet-600</text>
  <path class="d-arrow" d="M120 70 L120 96" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="20" y="100" width="200" height="50" rx="10"/>
  <text class="d-code" x="36" y="130">--color-brand</text>
  <path class="d-arrow" d="M120 150 L120 176" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="20" y="180" width="200" height="40" rx="10"/>
  <text class="d-code" x="36" y="205">--card-accent</text>
  <rect class="d-box-warn" x="250" y="180" width="170" height="40" rx="10"/>
  <text class="d-code" x="262" y="205">.theme-sponsor</text>
  <path class="d-arrow" d="M250 200 L224 200" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="470" y="24">ترتيب الـ layers</text>
  <text class="d-code" x="470" y="54">1 reset</text>
  <text class="d-code" x="470" y="80">2 tokens</text>
  <text class="d-code" x="470" y="106">3 base</text>
  <text class="d-code" x="470" y="132">4 layouts</text>
  <text class="d-code" x="470" y="158">5 components</text>
  <text class="d-code" x="470" y="184">6 utilities</text>
  <text class="d-label-muted" x="470" y="212">اللاحقة تفوز</text>
</svg>
:::

## الـ tokens على ثلاثة مستويات

قائمة مسطّحة من 200 custom property صعبة الصيانة بقدر 200 كود hex. وزّعها على مستويات:

1. **لوحة الألوان**: قيم خام، مسمّاة بحسب ماهيتها. `--violet-600: oklch(52% 0.22 290);`
2. **الدلالي**: أدوار، مسمّاة بحسب الغرض منها. `--color-brand: var(--violet-600); --surface: light-dark(…);`
3. **الـ component**: مقابض الـ component العامة، وقيمها الافتراضية tokens دلالية. `--card-accent: var(--color-brand);`

أبقِ المستوى الأول صغيرًا ومملًّا: نحو اثني عشر لونًا (hue) لكلٍّ منها بضع درجات تكفي معظم المنتجات. القرارات المثيرة تحدث في المستوى الثاني، حيث يتّفق المصمّم والمطوّر على ما تعنيه «brand» أو «surface» أو «danger» في كل ثيم.

الـ components لا تقرأ إلا المستويين الثاني والثالث. عندها تغيّر إعادة تصميم الهوية المستوى الأول، ويغيّر الوضع الداكن المستوى الثاني، وتغيّر صفحة الراعي المستوى الثالث على غلاف:

```css
@layer tokens {
  :root {
    --color-brand: oklch(52% 0.22 290);
    --card-accent: var(--color-brand);
  }
  .theme-sponsor {
    --card-accent: oklch(55% 0.11 210);
  }
}
```

كل بطاقة داخل `.theme-sponsor` تصبح زرقاء مخضرّة: الحدّ والشارة وحالة المرور، كل شيء، لأنها كلها تقرأ `--card-accent`.

## قواعد الـ components

حفنة من الأعراف تُبقي أربعين component قابلة للتوقّع:

- **class جذري واحد**، وأجزاؤه متداخلة بداخله: `.session-card { h3 { … } .badge { … } }`. ويبقى الـ nesting بعمق مستوى أو مستويين.
- **الحالة عبر السمات**: `[aria-pressed="true"]` و`[data-state="live"]` و`:has(:checked)`. السمة هي أيضًا الحالة التي تقرؤها التقنيات المساعدة، فلا يمكن أن تختلف CSS عنها.
- **لا margins خارجية على الجذر.** الـ component لا يعرف أين يعيش.

:::mistake components تضع مسافاتها بنفسها
`.session-card { margin-bottom: 16px; }` تبدو بريئة إلى أن توضع البطاقة في شبكة لها `gap: 24px` (صار المجموع 40px)، وفي شريط جانبي يحتاج إلى 8px، وفي carousel لا يحتاج إلى شيء. عندها يتجاوز كل سياق الـ margin. دع التخطيطات تملك المسافات عبر `gap`، ودع الـ components تملك دواخلها فقط.
:::

## الـ utilities: قليلة وأخيرة

الـ utilities classes أحادية الغرض يستطيع الـ HTML تطبيقها مباشرةً: `.u-hidden` و`.u-visually-hidden` و`.u-flow` (الإيقاع الرأسي). ضعها في آخر layer وستفوز على أيّ component دون `!important`. أبقِ المجموعة صغيرة ومملّة. إن وجدت نفسك تكتب `.u-mt-17`، فأنت تبني لغة تنسيق ثانية داخل الأولى؛ إطار utilities قائم على الـ design tokens خيار مشروع، لكن اجعله قرارًا مقصودًا، لا انجرافًا.

## تحديد النطاق بـ @scope

حين يجب ألّا يُسرّب component أنماطه إلى محتوى متداخل، مثل ملخّص يعرضه الـ CMS داخل بطاقة، تحصر `@scope` القواعد في شجرة فرعية وتستطيع التوقّف عند حدّ داخلي:

```css
@scope (.session-card) to (.cms-content) {
  p { margin-block: 0.5rem; }
}
```

قاعدة الفقرة تنطبق داخل البطاقات لا داخل `.cms-content`. أصبحت `@scope` ضمن Baseline في مارس 2026، فهي أداة حديثة؛ والـ layers والـ components ذات الـ class الواحد تحلّ معظم مشكلات النطاق أصلًا، و`@scope` تتولّى حالات «الكعكة المثقوبة» (donut) المتبقية.

:::tip افرضها بـ linter
الأعراف تنجرف دون أتمتة. يستطيع Stylelint رفض selectors الـ ID، و`!important` خارج ملف الـ utilities، والـ nesting الأعمق من مستويين. أضف هذه القواعد الثلاث، وستقصر نقاشات المراجعة كثيرًا.
:::

## دورك الآن

التمرين شريحة صغيرة من ملف الأنماط القديم: selectors بـ ID، و`!important`، وcomponent له margin خاصة به. أعد هيكلته في layers مع token للون تمييز البطاقة، وثيم للراعي، ومسافات يملكها التخطيط، وutility تفوز بنظافة. والدرس الأخير ينظر في كلفة كل هذه الـ CSS على المتصفّح، وفي كيفية إبقاء الحركات والتخطيطات سريعة.
