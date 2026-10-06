---
summary: ابنِ themes فاتحة وداكنة وعلامات تجارية وmodes للكثافة بإعادة ربط الـ semantic tokens تحت data attributes، حتى تظهر المكوّنات نفسها بشكل صحيح في كل تركيبة.
takeaways:
  - الـ theme أو الـ mode إعادةُ ربط للـ semantic tokens؛ أما المكوّنات والـ primitives فتبقى كما هي.
  - عامل نظام الألوان والعلامة والكثافة كمحاور مستقلة، يملك كلٌّ منها مجموعة tokens خاصة به، حتى لا تتضاعف أعمالك مع التركيبات.
  - الـ selectors مثل `[data-theme="dark"]` تعمل على أي عنصر، فيمكن لقسم من الصفحة أن يستخدم theme مختلفًا عن بقيتها.
  - حدّد `color-scheme` مع الـ theme الداكن حتى تتطابق الأجزاء التي يرسمها المتصفّح، مثل عناصر النماذج وأشرطة التمرير.
further:
  - title: prefers-color-scheme (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme
  - title: color-scheme (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme
  - title: light-dark() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark
quiz:
  - q: لدى Northwind نظاما ألوان، وعلامتان، ومستويا كثافة. كم ملف theme مكتوبًا يدويًا يجب أن تحتاج إن كانت المحاور مستقلة؟
    options:
      - text: ثمانية، واحد لكل تركيبة.
        why: هذه نتيجة معاملة التركيبات كـ themes؛ العدد يكبر بالضرب، وكل ملف يكرّر الملفات الأخرى.
      - text: ستة، كتلة لكل قيمة على كل محور، مع تخصيصات صغيرة فقط حيث يتفاعل محوران فعلًا.
        why: صحيح. كل محور يملك الـ tokens الخاصة به، فتكتب 2 + 2 + 2 من الكتل وتترك الـ cascade يجمعها.
      - text: اثنان، فاتح وداكن، مع معالجة العلامة والكثافة داخل المكوّنات.
        why: دفع العلامة والكثافة إلى المكوّنات يعني أن كل مكوّن يجب أن يعرف عنهما، وهذا بالضبط ما تتجنّبه الـ tokens.
      - text: واحد، لأن المتصفّح يحسب الألوان الداكنة تلقائيًا.
        why: المتصفّحات لا تشتقّ لوحة ألوان داكنة صالحة من لوحة فاتحة؛ أنت مَن يصمّمها ويربطها.
    answer: 1
  - q: تضع الواجهة الرئيسية في الموقع التسويقي `data-theme="dark"` على الـ `<section>` الخاص بها، لكن بطاقاتها تبقى بيضاء. الكتلة الداكنة مكتوبة هكذا `html[data-theme="dark"] { … }`. ما الخطأ؟
    options:
      - text: الـ data attributes لا تعمل على عناصر `<section>`.
        why: أي عنصر يمكنه حمل data attributes، والـ attribute selectors تطابقها في أي مكان.
      - text: الـ custom properties لا تُورَّث عبر `<section>`.
        why: الـ custom properties تُورَّث عبر كل العناصر.
      - text: الـ type selector المسمّى `html` يحصر الـ tokens الداكنة في الجذر، فلا تتطابق سمة القسم أبدًا.
        why: صحيح. كتابة `[data-theme="dark"]` وحدها تسمح لأي عنصر ببدء شجرة فرعية داكنة.
      - text: "تحتاج الواجهة الرئيسية إلى `color-scheme: dark` لتفعيل الـ tokens."
        why: خاصية `color-scheme` تغيّر واجهة المتصفّح المرسومة مثل أشرطة التمرير؛ ولا تبدّل الـ custom properties الخاصة بك.
    answer: 2
  - q: في الوضع الداكن تستخدم أزرار Northwind اللون `--nw-blue-400` بدل `--nw-blue-600`، وأزرار Tidewater تستخدم تدرّجًا فيروزيًا. أيّ بنية تتعامل مع الحالتين بنظافة؟
    options:
      - text: العلامة تحدّد تدرّجًا من الـ primitives باسم `--nw-brand-*`، والـ theme يختار أي درجة من التدرّج يستخدمها كل semantic token.
        why: صحيح. العلامة تقرّر *أيّ* الألوان، والـ theme يقرّر *مدى فتحها أو غمقها*، ولا يحتاج أيّ منهما أن يعرف عن الآخر.
      - text: أربع كتل بـ selectors مركّبة لكل زوج من علامة وtheme.
        why: ينجح مع علامتين، لكن كل علامة أو mode جديد يضاعف الكتل التي يجب صيانتها.
      - text: مكوّنات أزرار منفصلة لكل علامة.
        why: نسخ المكوّنات لكل علامة ينقض سبب وجود نظام مشترك أصلًا.
    answer: 0
---

ظلّ مستخدمو المناوبة الليلية في تطبيق الـ dispatch يطلبون الوضع الداكن سنتين. وكان كل تقدير يعود بـ «ستة أسابيع لكل منتج»، لأن الألوان كانت مكتوبة يدويًا في مئات المكوّنات. ومع الطبقة الدلالية من الدرس السابق، استغرق الوضع الداكن في Northwind تسعة أيام، معظمها مراجعة تصميم. ولم تتغيّر المكوّنات إطلاقًا.

## الـ theme إعادة ربط

الـ theme يغيّر الـ primitive الذي يشير إليه كل semantic token. ولا شيء غير ذلك.

```css
:root {
  --nw-color-surface: var(--nw-gray-0);
  --nw-color-text: var(--nw-gray-900);
  --nw-color-action-bg: var(--nw-blue-600);
  --nw-color-action-text: var(--nw-gray-0);
}

[data-theme="dark"] {
  color-scheme: dark;
  --nw-color-surface: var(--nw-gray-950);
  --nw-color-text: var(--nw-gray-100);
  --nw-color-action-bg: var(--nw-blue-400);
  --nw-color-action-text: var(--nw-gray-950);
}
```

هناك تفصيلتان مهمّتان. الأولى أن الـ selector هو `[data-theme="dark"]` لا `html[data-theme="dark"]`، فيستطيع أي عنصر بدء شجرة فرعية داكنة: الواجهة الرئيسية في الموقع التسويقي داكنة على صفحة فاتحة في باقيها. والثانية أن `color-scheme: dark` تخبر المتصفّح أن يرسم واجهته الخاصة، مثل أشرطة التمرير ومربّعات الاختيار وحقول التاريخ، بألوان داكنة أيضًا.

لاحظ أن أزرق الإجراء يغيّر درجته، من 600 إلى 400. الخلفيات الداكنة تحتاج ألوان تمييز أفتح لتحافظ على التباين، لذا فالوضع الداكن مهمّة تصميم، لا قلبٌ للألوان.

## تصميم لوحة الألوان الداكنة

ثلاث قواعد وفّرت على Northwind أسابيع من المراجعة. افحص التباين لكل زوج من النص والخلفية في الـ theme الداكن على حدة، لأن الزوج الذي ينجح على الأبيض قد يفشل على ما يقارب الأسود. وتجنّب الأسطح السوداء تمامًا؛ فالرمادي الداكن جدًا مثل `#111827` أريح للعين ويترك مجالًا لظلال أغمق. وعبّر عن الارتفاع (elevation) بأسطح أفتح لا بظلال أثقل، لأن الظلال بالكاد تظهر على الخلفيات الداكنة: البطاقة المرتفعة في الوضع الداكن أفتح بدرجة من الصفحة التي خلفها.

هذه القاعدة الأخيرة مثال جيد على حاجة الطبقة الدلالية إلى أسماء مثل `--nw-color-surface-raised`. في الوضع الفاتح يرتبط بالأبيض على صفحة رمادية فاتحة؛ وفي الوضع الداكن يرتبط برمادي أفتح قليلًا. الاسم نفسه، والدور نفسه، والقيم مختلفة.

:::mistake الوضع الداكن عبر filter: invert()‎
قلب ألوان الصفحة اختصار مغرٍ. لكنه يقلب الصور والشعارات، ويحوّل ألوان العلامة إلى ألوانها المكمّلة، وينتج تباينًا لم تختبره قط. صمّم لوحة الألوان الداكنة واربطها عبر الـ semantic tokens.
:::

## اتّباع تفضيل النظام

احترم إعداد نظام التشغيل افتراضيًا، واسمح للمستخدمين بتجاوزه:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --nw-color-surface: var(--nw-gray-950);
    /* …same remapping as [data-theme="dark"] */
  }
}
```

```js
// Inline in <head>, before the CSS paints, so there is no flash of the wrong theme.
const saved = localStorage.getItem('nw-theme');
if (saved === 'light' || saved === 'dark') {
  document.documentElement.dataset.theme = saved;
}
```

تكرار الكتلة الداكنة داخل الـ media query هو ثمن دعم الطريقتين معًا. خط إنتاج الـ tokens في Northwind يولّد النسختين من مصدر واحد، وستجهّزه بعد درسين. وللألوان البسيطة ذات الوضعين يمكنك أيضًا استخدام الدالة `light-dark()` في CSS مع `color-scheme: light dark`، لكنها لا تبدّل إلا الألوان (والصور أيضًا في المتصفّحات الأحدث) بين وضعين فقط، فلا تغني عن إعادة ربط الـ tokens للعلامات أو الكثافة.

## الـ modes محاور مستقلة

لدى Northwind ثلاثة محاور، يُحدَّد كلٌّ منها بسمة خاصة به:

:::figure ثلاثة محاور مستقلة، يملك كلٌّ منها مجموعة مختلفة من الـ tokens
<svg viewBox="0 0 660 250" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة أعمدة. نظام الألوان، فاتح أو داكن، يملك tokens الأسطح والنص. العلامة، Northwind أو Tidewater، تملك تدرّج ألوان العلامة. الكثافة، مريحة أو مضغوطة، تملك المسافات وارتفاع العناصر. والثلاثة تغذّي المكوّنات نفسها.</title>
  <rect class="d-box-primary" x="20" y="20" width="190" height="96" rx="10"/>
  <text class="d-label-strong" x="115" y="46" text-anchor="middle">data-theme</text>
  <text class="d-label" x="115" y="72" text-anchor="middle">light | dark</text>
  <text class="d-label-muted" x="115" y="98" text-anchor="middle">الأسطح، النص، الدرجات</text>
  <rect class="d-box-accent" x="235" y="20" width="190" height="96" rx="10"/>
  <text class="d-label-strong" x="330" y="46" text-anchor="middle">data-brand</text>
  <text class="d-label" x="330" y="72" text-anchor="middle">northwind | tidewater</text>
  <text class="d-label-muted" x="330" y="98" text-anchor="middle">تدرّج العلامة، الخطوط</text>
  <rect class="d-box-success" x="450" y="20" width="190" height="96" rx="10"/>
  <text class="d-label-strong" x="545" y="46" text-anchor="middle">data-density</text>
  <text class="d-label" x="545" y="72" text-anchor="middle">comfortable | compact</text>
  <text class="d-label-muted" x="545" y="98" text-anchor="middle">المسافات، ارتفاع العناصر</text>
  <path class="d-arrow" d="M115 116 L300 180" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M330 116 L330 176" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M545 116 L360 180" marker-end="url(#arrow)"/>
  <rect class="d-box" x="230" y="182" width="200" height="48" rx="10"/>
  <text class="d-label" x="330" y="211" text-anchor="middle">المكوّنات نفسها</text>
</svg>
:::

الحيلة التي تحفظ استقلالها هي الملكية: كل محور يعيد ربط الـ tokens الخاصة به، ولا يلمس tokens محور آخر أبدًا. الكثافة لا تلمس إلا المسافات:

```css
:root {
  --nw-space-control-y: var(--nw-space-2);
  --nw-space-control-x: var(--nw-space-4);
}
[data-density="compact"] {
  --nw-space-control-y: var(--nw-space-1);
  --nw-space-control-x: var(--nw-space-3);
}
```

أما العلامة ونظام الألوان فيتفاعلان فعلًا، لأن فيروزي Tidewater يحتاج درجة أفتح في الوضع الداكن تمامًا مثل أزرق Northwind. والحلّ مستوى واحد من الوساطة: العلامة تعرّف تدرّجًا من primitives العلامة، والـ theme يختار الدرجة.

```css
:root { /* Northwind is the default brand */
  --nw-brand-400: var(--nw-blue-400);
  --nw-brand-600: var(--nw-blue-600);
}
[data-brand="tidewater"] {
  --nw-brand-400: var(--nw-teal-400);
  --nw-brand-600: var(--nw-teal-600);
}
:root { --nw-color-action-bg: var(--nw-brand-600); }
[data-theme="dark"] { --nw-color-action-bg: var(--nw-brand-400); }
```

الآن يعمل `<html data-brand="tidewater" data-theme="dark" data-density="compact">` دون selector مركّب واحد. ملاحظة واحدة: هذه النسخة تفترض أن `data-brand` موجودة على `<html>`، وهذا صحيح في Northwind لأن الصفحة تنتمي إلى علامة واحدة. فالربط على `:root` يُحسب مرة واحدة عند الجذر، وإن كان يمكن للعلامة أن تتغيّر في منتصف الصفحة فستكرّر الروابط الدلالية تحت `[data-brand]` أيضًا، للسبب نفسه الذي يجعل الـ component tokens تعيش على الـ selectors الخاصة بالمكوّنات. العلامة تقرّر أيّ الألوان، والـ theme يقرّر مدى الفتح، والكثافة تقرّر مدى الإحكام. ثماني تركيبات، وست كتل صغيرة.

:::tip اختبر الزوايا
التركيبات التي لا تنظر إليها أبدًا هي التي تنكسر. الاختبارات البصرية في Northwind تعرض كل مكوّن أساسي في التركيبات الثماني كلها؛ ويشرح القسم 4 كيف. وحتى ذلك الحين، احتفظ بصفحة تجارب تعرض زرًا وحقل إدخال وبطاقة في كل زاوية.
:::

في التمرين تضيف theme داكنًا يعمل على أي عنصر، وmode كثافة مضغوطة. وبعدها تنقل هذه الـ tokens من CSS مكتوب يدويًا إلى صيغة تقرؤها كل الأدوات.
