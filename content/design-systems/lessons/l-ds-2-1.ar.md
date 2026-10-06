---
summary: نظّم الـ design tokens في ثلاث طبقات primitive وsemantic وcomponent على شكل CSS custom properties، حتى يُحدّث تغييرٌ واحد في النيّة كلَّ مكوّن يتشاركها.
takeaways:
  - الـ primitive tokens تسمّي القيم الخام (`--nw-blue-600`)، والـ semantic tokens تسمّي النيّة (`--nw-color-action-bg`)، والـ component tokens تسمّي مفاتيح التحكّم الخاصة بمكوّن واحد.
  - المكوّنات تشير إلى الـ semantic tokens ولا تشير إلى الـ primitives أبدًا، فيقتصر تغيير الـ theme على الطبقة الدلالية.
  - عرّف الـ component tokens على الـ selector الخاص بالمكوّن لا على `:root`، حتى تُحسب قيمتها وفق أي تخصيص في ذلك الجزء من الصفحة.
  - أضف الـ component tokens باقتصاد؛ فكل واحد منها API عام ستلتزم بدعمه.
further:
  - title: Using CSS custom properties (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
  - title: var() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var
  - title: Design tokens (Material Design 3)
    url: https://m3.material.io/foundations/design-tokens
quiz:
  - q: يريد فريق التسويق أن يتحوّل كل إجراء أساسي في الموقع إلى الأخضر خلال حملة. في نظام من ثلاث طبقات، أيّ طبقة تغيّر؟
    options:
      - text: طبقة الـ primitives، بتغيير `--nw-blue-600` إلى أخضر.
        why: هذا يحوّل كل استخدام لذلك الأزرق إلى أخضر، بما فيها الروابط وشارات المعلومات التي ليست إجراءات، ويجعل الاسم كاذبًا.
      - text: الطبقة الدلالية، بجعل `--nw-color-action-bg` يشير إلى primitive أخضر.
        why: صحيح. كل مكوّن يعبّر عن «إجراء أساسي» يتبع التغيير، ولا شيء غيره.
      - text: طبقة الـ component، بتخصيص الخلفية لكل مكوّن على حدة.
        why: هذا ينجح، لكنك ستضطر إلى إيجاد كل مكوّن فيه لون إجراء، وهي بالضبط المشكلة التي وُجدت الطبقات لحلّها.
      - text: لا شيء منها؛ أضف class جديدًا باسم `.green` لكل زر.
        why: الـ classes المؤقّتة تتجاوز النظام كليًا، وتترك التنظيف لما بعد الحملة.
    answer: 1
  - q: |
      لماذا يبقى الزر داخل `.promo` أزرق؟
      ```css
      :root {
        --nw-color-action-bg: var(--nw-blue-600);
        --nw-button-bg: var(--nw-color-action-bg);
      }
      .promo { --nw-color-action-bg: var(--nw-green-600); }
      .nw-button { background: var(--nw-button-bg); }
      ```
    options:
      - text: الـ custom properties لا تُورَّث إلى الأزرار.
        why: الـ custom properties تُورَّث افتراضيًا، والأزرار ضمنها؛ والتوريث هو بالضبط ما يوصل الأزرق.
      - text: الـ specificity الخاصة بـ `.promo` أقل من `:root`.
        why: القاعدتان تستهدفان عنصرين مختلفين، فلا تُقارن الـ specificity أصلًا؛ وكل تعريف يُطبَّق حيث كُتب.
      - text: المتصفّح يخزّن أول قيمة لكل custom property مؤقتًا.
        why: لا يوجد تخزين مؤقت؛ القيم تُحسب لكل عنصر أثناء الـ cascade العادي.
      - text: حُسبت قيمة `--nw-button-bg` على `:root`، فورثت الأزرار الأزرق المحسوب مسبقًا.
        why: صحيح. الـ `var()` داخل custom property يُستبدل حيث عُرّف؛ انقل `--nw-button-bg` إلى `.nw-button` وستُحسب قيمته وفق تخصيص `.promo`.
    answer: 3
  - q: يقترح زميل component token لكل خاصية CSS في كل مكوّن. ما التكلفة الرئيسية؟
    options:
      - text: تتباطأ المتصفّحات بوضوح مع أكثر من 100 custom property.
        why: المتصفّحات تتعامل مع آلاف الـ custom properties بلا مشكلة؛ الأداء ليس القضية بهذا الحجم.
      - text: يصبح كل token جزءًا من API عام تعتمد عليه الفرق، فيصعب تغيير النظام.
        why: صحيح. كل مفتاح تحكّم مكشوف وعدٌ؛ وإعادة تسميته أو حذفه لاحقًا تغيير كاسر (breaking change).
      - text: الـ component tokens لا يمكنها الإشارة إلى الـ semantic tokens.
        why: يمكنها، ويجب أن تفعل؛ فهكذا ترتبط الطبقات ببعضها.
    answer: 1
---

كان أول ملف tokens في Northwind قائمة ألوان: `--blue-600`، `--gray-200`، `--red-500`. وكل مكوّن استخدمها مباشرة. بدا ذلك مرتّبًا حتى جاء الاستحواذ على Tidewater، وسأل أحدهم سؤالًا بسيطًا: «أيّ درجات الأزرق هي أزرق علامة Northwind، وأيّها مجرّد روابط؟». لم يستطع أحد الإجابة دون قراءة 300 ملف. القائمة المسطّحة من الألوان تسجّل القيم، لكنها لا تسجّل القرارات.

## الطبقة 1: الـ primitives

الـ primitives (القيم الأولية) هي لوحة الألوان والقيم: كل قيمة خام يسمح بها النظام، مسمّاة بحسب ما *هي*.

```css
:root {
  --nw-blue-600: #1f5ae0;
  --nw-blue-700: #1848b8;
  --nw-gray-900: #1f2933;
  --nw-gray-200: #d9dee3;
  --nw-white: #ffffff;
  --nw-space-2: 0.5rem;
  --nw-space-4: 1rem;
}
```

الـ primitives تجيب عن سؤال «ما القيم الموجودة؟». وهي لا تحمل أي معنى عن قصد. فـ `--nw-blue-600` لا يعرف إن كان زرًا أو رابطًا أو خطًّا في رسم بياني.

## الطبقة 2: الـ semantic tokens

الـ semantic tokens (الـ tokens الدلالية) تسمّي *نيّة* وتشير إلى primitive:

```css
:root {
  --nw-color-action-bg: var(--nw-blue-600);
  --nw-color-action-bg-hover: var(--nw-blue-700);
  --nw-color-action-text: var(--nw-white);
  --nw-color-text: var(--nw-gray-900);
  --nw-color-border: var(--nw-gray-200);
}
```

هذه الطبقة هي الأكثر استخدامًا، وهي التي تغيّرها الـ themes. حين يصل الوضع الداكن أو علامة Tidewater، تعيد ربط هذه الأسماء بـ primitives مختلفة، ولا تلمس أي مكوّن.

## الطبقة 3: الـ component tokens

الـ component tokens تسمّي الأجزاء القابلة للتعديل في مكوّن واحد، وتشير إلى الـ semantic tokens:

```css
.nw-button {
  --nw-button-bg: var(--nw-color-action-bg);
  --nw-button-text: var(--nw-color-action-text);
  --nw-button-padding-x: var(--nw-space-4);

  background: var(--nw-button-bg);
  color: var(--nw-button-text);
  padding: var(--nw-space-2) var(--nw-button-padding-x);
}
```

الآن صار لكل نوع من ثلاثة أنواع من التغيير مكان واحد واضح:

:::figure كل طبقة تشير فقط إلى الطبقة التي تحتها
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">الـ component token المسمّى button-bg يشير إلى الـ semantic token المسمّى color-action-bg، الذي يشير إلى الـ primitive المسمّى blue-600 بالقيمة 1f5ae0. كل طبقة تتغيّر لسبب مختلف.</title>
  <rect class="d-box-accent" x="20" y="30" width="190" height="56" rx="10"/>
  <text class="d-code" x="115" y="63" text-anchor="middle">--nw-button-bg</text>
  <rect class="d-box-primary" x="235" y="30" width="190" height="56" rx="10"/>
  <text class="d-code" x="330" y="63" text-anchor="middle">--nw-color-action-bg</text>
  <rect class="d-box" x="450" y="30" width="190" height="56" rx="10"/>
  <text class="d-code" x="545" y="63" text-anchor="middle">--nw-blue-600</text>
  <path class="d-arrow" d="M210 58 L231 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M425 58 L446 58" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="115" y="120" text-anchor="middle">Component</text>
  <text class="d-label-strong" x="330" y="120" text-anchor="middle">Semantic</text>
  <text class="d-label-strong" x="545" y="120" text-anchor="middle">Primitive</text>
  <text class="d-label-muted" x="115" y="150" text-anchor="middle">تغيير مكوّن واحد</text>
  <text class="d-label-muted" x="330" y="150" text-anchor="middle">تغيير theme أو علامة</text>
  <text class="d-label-muted" x="545" y="150" text-anchor="middle">تغيير لوحة الألوان</text>
  <text class="d-code" x="545" y="190" text-anchor="middle">#1f5ae0</text>
  <path class="d-line" d="M545 86 L545 172"/>
</svg>
:::

- **لوحة ألوان جديدة** (أزرق أفضل قليلًا في إمكانية الوصول): غيّر الـ primitive.
- **theme جديد أو علامة جديدة** (الوضع الداكن، Tidewater): أعد ربط الـ semantic tokens.
- **مكوّن واحد يحتاج أن يختلف** (زر الواجهة الرئيسية في الموقع التسويقي بحشوة أكبر): خصّص الـ token الخاص بذلك المكوّن.

والقاعدة التي تجعل كل هذا يعمل: **المكوّنات تشير إلى الـ semantic tokens، ولا تشير إلى الـ primitives أبدًا.** في اللحظة التي يستخدم فيها مكوّن `--nw-blue-600` مباشرة، يتوقّف عن اتّباع الـ themes، وتكون قد أعدت بناء القائمة المسطّحة بأسماء أطول.

:::mistake تعريف الـ component tokens على ‎:root
إن كتبت `--nw-button-bg: var(--nw-color-action-bg)` داخل `:root`، فإن المتصفّح يستبدل الـ `var()` هناك مباشرة، عند الجذر. فيرث كل زر الأزرق المحسوب مسبقًا، ولا يكون لتخصيص `--nw-color-action-bg` على قسم `.promo` أي أثر على أزراره. عرّف الـ component tokens على الـ selector الخاص بالمكوّن نفسه، حتى تُحسب قيمتها على كل زر وفق القيم الدلالية التي يحدّدها أسلافه.
:::

## كيف يحسب المتصفّح قيمة الـ token

الـ custom properties تُورَّث كما تُورَّث `color`. حين يحسب المتصفّح أنماط زر ما، يبحث عن `--nw-button-bg` على الزر نفسه، فيجد `var(--nw-color-action-bg)`، ثم يبحث عن هذه أيضًا على الزر، حيث تكون القيمة موروثة من أقرب سلف حدّدها. ولهذا يمكنك تغيير theme جزء من الصفحة بتحديد semantic token على حاوية:

```css
.campaign-banner {
  --nw-color-action-bg: var(--nw-green-600);
}
```

كل زر داخل اللافتة يصبح أخضر، وكل زر خارجها يبقى أزرق. بلا classes جديدة، وبلا تغيير في المكوّنات. وهذا السلوك في تحديد النطاق هو الأساس الذي تقوم عليه الـ themes في الدروس القادمة.

:::tip كن بخيلًا مع الـ component tokens
لا تكشف Northwind عن component tokens إلا للقيم التي احتاجت الفرق فعلًا إلى تغييرها، وعادةً من اثنين إلى خمسة لكل مكوّن. كل token تنشره وعدٌ عليك الوفاء به في الإصدارات القادمة. يمكنك دائمًا إضافة token لاحقًا؛ أما حذفه فتغيير كاسر.
:::

## ليست الألوان وحدها

كل فئة من الـ tokens تُعامل بالطريقة نفسها. الـ primitives الخاصة بالمسافات سُلَّم (`--nw-space-1` إلى `--nw-space-12`)؛ والمسافات الدلالية تسمّي دورًا، مثل `--nw-space-inset-md` للحشوة داخل البطاقة، أو `--nw-space-stack-sm` للفراغ بين حقول نموذج متراصّة. والـ primitives الخاصة بالطباعة هي عائلات الخطوط وأحجامها وأوزانها؛ والطباعة الدلالية تسمّي أنماطًا مثل `--nw-font-body` أو `--nw-font-heading-lg`. وتتبع أنصاف الأقطار والظلال ومُدد الحركة النمط نفسه.

وللتصوّر: لدى Northwind اليوم نحو 180 primitive، و120 semantic token، و90 component token. الطبقة الدلالية هي حيث يحدث معظم التفكير التصميمي، وهي الطبقة التي يجب أن يلجأ إليها المصمّمون والمهندسون أولًا. وإن ظلّ فريق يطلب primitive بعينه، فهذا يعني عادةً أن semantic token ناقص، والإصلاح الصحيح أن تضيف الدور، لا أن تسلّم القيمة الخام.

## طريقة سريعة لفحص طبقاتك

افتح الـ CSS الخاص بأي مكوّن وابحث عن البادئة الخاصة بالـ primitives لديك، مثل `--nw-blue` أو `--nw-gray`. في النظام السليم تظهر هذه الأسماء في مكان واحد فقط: تعريفات الـ semantic tokens. تشغّل Northwind هذا الفحص كقاعدة lint في الـ CI، وستتعرّف عليها في القسم 4. في التمرين تضيف الطبقتين الدلالية والخاصة بالمكوّن إلى زر يقفز حاليًا مباشرة إلى primitive. وبعدها تسمّي هذه الـ tokens بطريقة تبقى منطقية بعد ثلاث سنوات.
