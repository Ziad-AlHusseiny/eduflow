---
summary: "نظّم ملف الأنماط في طبقات cascade بحيث تفوز مجموعات الأنماط كاملة (إعادة الضبط والـ components والـ utilities) بحسب ترتيب الـ layers لا بحسب الـ specificity."
takeaways:
  - "أعلن ترتيب الـ layers مرة واحدة في الأعلى بـ `@layer reset, base, components, utilities;`، والـ layers اللاحقة تفوز على السابقة بغضّ النظر عن الـ specificity."
  - "الـ specificity ما زالت مهمة، لكن فقط بين التصريحات الموجودة داخل الـ layer نفسها."
  - "الأنماط العادية التي لا تنتمي إلى أيّ layer تتغلّب على كل نمط داخل layer، لذا غلّف الـ CSS القديمة أو الخارجية في layer بدل أن تتركها طليقة."
  - "`!important` تعكس ترتيب الـ layers: التصريح المهمّ في layer مبكرة يتغلّب على التصريح المهمّ في layer لاحقة."
further:
  - title: "@layer (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer
  - title: "Cascade layers (MDN guide)"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers
  - title: "A complete guide to CSS cascade layers (CSS-Tricks)"
    url: https://css-tricks.com/css-cascade-layers/
quiz:
  - q: |
      ما الخلفية التي يأخذها `.badge.sold-out`؟
      ```css
      @layer components, utilities;
      @layer utilities { .sold-out { background: gold; } }
      @layer components { .schedule .card .badge { background: lavender; } }
      ```
    options:
      - text: "lavender، لأن الـ selector الخاص بها أعلى specificity."
        why: "الـ specificity لا تُقارَن إلا داخل الـ layer الواحدة. القاعدتان في layerين مختلفتين، لذا يحسم ترتيب الـ layers أولًا."
      - text: "lavender، لأن كتلة components تظهر لاحقًا في الملف."
        why: "ترتيب الـ layers يأتي من أول تعليمة `@layer`، لا من موضع ظهور كل كتلة."
      - text: "gold، لأن `utilities` أُعلنت بعد `components`."
        why: "صحيح. الـ layers المُعلنة لاحقًا تفوز في التصريحات العادية، قبل أن تُستشار الـ specificity."
    answer: 2
  - q: "أضفت `@layer reset, components;` وغلّفت الكود، لكن قاعدة قديمة `h2 { color: black; }` تقع خارج أيّ layer ما زالت تتجاوز عناوين الـ components لديك. لماذا؟"
    options:
      - text: "الأنماط العادية خارج الـ layers أولويتها أعلى من كل الـ layers."
        why: "صحيح. الأنماط غير المنتمية إلى layer تتصرّف كأنها layer أخيرة ضمنية. غلّف الـ CSS القديمة في layer مبكرة خاصة بها لتخفض رتبتها."
      - text: "selectors الأنواع تتغلّب دائمًا على القواعد داخل الـ layers."
        why: "نوع الـ selector لا علاقة له بالأمر؛ أيّ selector خارج الـ layers، حتى `*`، يتغلّب على القواعد داخلها في التصريحات العادية."
      - text: "يتجاهل المتصفّح `@layer` حين يخلط الملف بين قواعد داخل الـ layers وخارجها."
        why: "الخلط مدعوم بالكامل. يضع المتصفّح كل القواعد غير المنتمية إلى layer في layer ضمنية فوق الـ layers المسمّاة."
      - text: "قاعدة `h2` تُحمَّل أولًا، فتُثبَّت."
        why: "ترتيب الظهور آخر ما يكسر التعادل، وهنا تفصل الـ layers بين القاعدتين أصلًا."
    answer: 0
  - q: "كيف تضع ملف أنماط من طرف ثالث في الـ layer الأقل أولوية؟"
    options:
      - text: "`@layer vendor { @import url(picker.css); }`"
        why: "لا يمكن أن تظهر `@import` داخل كتلة layer؛ يجب أن تأتي تعليمات الاستيراد في أعلى ملف الأنماط."
      - text: "`@import url(picker.css) layer(vendor);` بعد إعلان `@layer vendor, base, components;`"
        why: "صحيح. الدالة `layer()` على `@import` تضع الملف كله في الـ layer المسمّاة، وتعليمة الترتيب تجعل تلك الـ layer أولى الطبقات."
      - text: "`<link rel=\"stylesheet\" href=\"picker.css\" layer=\"vendor\">`"
        why: "لا توجد سمة `layer` على `<link>`؛ وضع ملف في layer يكون عبر `@import … layer()`."
    answer: 1
  - q: "في layer اسمها `components` يقول تصريح `color: red !important`، وفي layer لاحقة اسمها `utilities` يقول تصريح آخر `color: blue !important`. أيّهما يفوز؟"
    options:
      - text: "blue، لأن utilities هي الـ layer اللاحقة."
        why: "هذه قاعدة التصريحات العادية. أما في التصريحات المهمّة فينقلب ترتيب الـ layers."
      - text: "red، لأن التصريحات المهمّة تعكس ترتيب الـ layers."
        why: "صحيح. هذا الانعكاس يتيح لـ layer منخفضة (مثل إعادة الضبط) أن تحمي قيمة بـ `!important` لا تستطيع الـ layers اللاحقة تجاوزها."
      - text: "صاحب الـ selector الأعلى specificity."
        why: "ترتيب الـ layers يُحسم قبل الـ specificity دائمًا؛ والـ specificity لا تقارن إلا تصريحات من الـ layer نفسها."
    answer: 1
---

نما في ملف أنماط Waypoint أربعة أنواع من CSS: إعادة ضبط (reset)، وأنماط أساسية للعناصر، وcomponents مثل بطاقة الجلسة، وأدوات utilities ذات المهمّة الواحدة مثل `.bg-accent` يرشّها فريق المحتوى في الـ HTML. يُفترض أن تفوز الـ utilities؛ فهذا هو الغرض منها أصلًا. لكن selector component مثل `.schedule .session-card .badge` درجته (0,3,0)، والـ utility درجتها (0,1,0)، فتخسر الـ utility ويكتب أحدهم `!important` من جديد.

لم تُصمَّم الـ specificity قطّ للتعبير عن أن «هذه *المجموعة* من الأنماط أعلى رتبة من تلك». أما **طبقات الـ cascade** (cascade layers) فصُمِّمت لهذا بالضبط.

## أعلن الترتيب ثم املأ الـ layers

الـ layer (طبقة) وعاء مسمّى من القواعد. تعلن الترتيب مرة واحدة، في أعلى ملف الـ CSS:

```css title=styles.css
@layer reset, base, components, utilities;
```

ثم تضع القواعد في الـ layers، بأيّ ترتيب ومن أيّ ملف:

```css
@layer components {
  .schedule .session-card .badge {
    background: #ede9fe;
    color: #5b21b6;
  }
}

@layer utilities {
  .bg-accent { background: #fde68a; }
}
```

الآن تفوز `.bg-accent` على خلفية الـ component رغم أن الـ specificity الخاصة بها أقل. حين يصل الـ cascade إلى الخطوة 3 (الـ layers) يرى أن التصريحين من layerين مختلفتين، فيختار المُعلنة لاحقًا، ولا يصل إلى الـ specificity أبدًا. أما داخل الـ layer الواحدة فتعمل الـ specificity وترتيب الظهور كما تعرفهما.

:::figure الـ layers اللاحقة تفوز في التصريحات العادية، والأنماط خارج الـ layers تجلس في القمة
<svg viewBox="0 0 640 300" role="img" aria-labelledby="t1">
  <title id="t1">طبقات مرصوصة من الأقل أولوية إلى الأعلى: reset ثم base ثم components ثم utilities، وفي القمة الأنماط خارج الـ layers. سهم على اليمين يشير إلى الأعلى بعنوان أولوية أعلى.</title>
  <rect class="d-box" x="60" y="236" width="400" height="44" rx="10"/>
  <text class="d-code" x="80" y="264">@layer reset</text>
  <rect class="d-box" x="60" y="184" width="400" height="44" rx="10"/>
  <text class="d-code" x="80" y="212">@layer base</text>
  <rect class="d-box-primary" x="60" y="132" width="400" height="44" rx="10"/>
  <text class="d-code" x="80" y="160">@layer components</text>
  <rect class="d-box-accent" x="60" y="80" width="400" height="44" rx="10"/>
  <text class="d-code" x="80" y="108">@layer utilities</text>
  <rect class="d-box-warn" x="60" y="20" width="400" height="44" rx="10"/>
  <text class="d-label-strong" x="80" y="48">أنماط خارج الـ layers</text>
  <path class="d-arrow" d="M500 276 L500 30" marker-end="url(#arrow)"/>
  <text class="d-label" x="516" y="150">أولوية</text>
  <text class="d-label" x="516" y="172">أعلى</text>
</svg>
:::

أول تعليمة `@layer` هي التي تثبّت الترتيب. إن كتبت `@layer utilities { … }` قبل أن تعلن `components` أصلًا، تصبح utilities هي الـ layer *الأولى* (الأدنى). لهذا مكان تعليمة الترتيب في أعلى ملف الأنماط الرئيسي تمامًا.

## الأنماط خارج الـ layers تفوز

أيّ قاعدة عادية ليست داخل layer تذهب إلى layer ضمنية تتغلّب على كل الـ layers المسمّاة. يبدو هذا معكوسًا في البداية، لكنه ما يجعل تبنّي الـ layers ممكنًا: تستطيع تغليف الكود الجديد في layers اليوم، وتحتفظ الـ CSS الحالية غير المنتمية إلى layer بسلوكها كما هو.

والوجه الآخر لهذا فخّ كلاسيكي.

:::mistake ترك الـ CSS القديمة خارج الـ layers
تضع الـ components الجديدة في layers، فتظل قاعدة قديمة مثل `h2 { color: black; }` من النموذج الأولي تتغلّب عليها، لأن ما هو خارج الـ layers يتغلّب على ما بداخلها. غلّف الـ CSS القديمة أو الخارجية في layer مبكرة خاصة بها، مثل `@layer legacy, reset, base, components, utilities;`، لتخسر أمام كل ما تكتبه عن قصد.
:::

ويمكن وضع ملفات الأطراف الثالثة في layer مباشرةً عند استيرادها:

```css
@layer vendor, reset, base, components, utilities;
@import url("calendar-widget.css") layer(vendor);
```

لاحظ أن قواعد `@import` يجب أن تأتي قبل أيّ قواعد أخرى باستثناء `@charset` وتعليمات `@layer`، ولهذا بالضبط تستطيع تعليمة الترتيب أن تجلس فوقها.

## التصريحات المهمّة تقلب الترتيب

في تصريحات `!important` تنعكس أولوية الـ layers: القاعدة المهمّة في `reset` تتغلّب على القاعدة المهمّة في `utilities`، والقواعد المهمّة داخل الـ layers تتغلّب على المهمّة خارجها. وهذا يحاكي طريقة عمل المصادر (قاعدة المستخدم المهمّة تتغلّب على قاعدتك)، ويعطي الـ layers المنخفضة طريقة لحماية ما هو جوهري. تستطيع إعادة الضبط أن تثبّت `[hidden] { display: none !important; }` فلا يستطيع أيّ component أن يُظهر محتوى مخفيًا بالخطأ.

## الـ layers المتداخلة والتراجع

يمكن أن تتداخل الـ layers: `@layer components.cards { … }` تنشئ layer اسمها `cards` داخل `components`، وتُحسم أولويتها داخل الـ layer الأم. تستخدم الفرق هذا لإعطاء كل مجلد components طبقة فرعية خاصة به دون أن يتأثّر الترتيب العام.

وهناك كلمة مفتاحية أخرى تعمل مع الـ layers: `revert-layer`. ضبط `color: revert-layer` يعيد الخاصية إلى ما كانت ستنتجه الـ layers السابقة، كأن تصريح هذه الـ layer غير موجود. وهي مفيدة في utility مثل `.reset-color { color: revert-layer; }`.

## تبنّي الـ layers في قاعدة كود قائمة

لا تحتاج إلى إعادة كتابة. في قاعدة كود Waypoint استغرق الانتقال ظهيرة واحدة وثلاث خطوات:

1. أضف تعليمة الترتيب في أعلى ملف الأنماط الرئيسي تمامًا، وضع layer اسمها `legacy` أولًا.
2. غلّف كل ملف موجود بـ `@layer legacy { … }`، أو استورده بـ `layer(legacy)`. لن يتغيّر شيء بصريًا، لأن القواعد القديمة ما زالت تتنافس فيما بينها تمامًا كما كانت.
3. كلما لمست component، انقل قواعده من `legacy` إلى `components`. كل نقلة كهذه لا يمكن إلا أن تجعل كودك الجديد *أقوى* مقارنةً بالقديم، لا أضعف أبدًا.

العائد يصل سريعًا: تتوقّف الـ components الجديدة عن الحاجة إلى selectors ثقيلة لتهزم القديمة، وتستطيع حذف تصريحات `!important` واحدًا تلو الآخر كلما زال سببه.

:::note الدعم
طبقات الـ cascade متاحة على نطاق واسع حسب Baseline (أي مدعومة في كل المتصفّحات الرئيسية منذ مدة كافية): كل المتصفّحات الحالية تدعمها منذ مطلع 2022. يمكنك إطلاقها بلا بديل احتياطي.
:::

## دورك الآن

في التمرين، لشارة Waypoint selector component ثقيل وutility يجب أن تتجاوزه. ضع القواعد في layers لتفوز الـ utility دون تعديل أيّ selector ودون إضافة `!important`. الـ layers تحسم «أيّ مجموعة تفوز»؛ والدرس التالي يتناول «أيّ قيمة»، باستخدام الـ custom properties كمقابض تكشفها الـ components لديك.
