---
summary: اعكس طبقات الـ tokens في مجموعات Figma variables وmodes الخاصة بها، وانشرها عبر المكتبات، وشغّل عملية مزامنة واحدة حتى لا تختلف ملفات التصميم والكود أبدًا على قيمة.
takeaways:
  - اربط طبقات الـ tokens بمجموعات المتغيّرات (collections) في Figma، واربط الـ themes والعلامات والكثافة بالـ modes أو بالمجموعات الممتدّة.
  - اختر مصدر حقيقة واحدًا لقيم الـ tokens، واجعل الجانب الآخر مرآة تُحدَّث بعملية محدّدة، لا يدويًا أبدًا.
  - أعطِ المتغيّرات الدلالية صيغة كود (code syntax) وأخفِ الـ primitives من النشر، حتى يختار المصمّمون الأسماء نفسها التي يكتبها المهندسون.
  - تحديثات المكتبة إصدارات أيضًا؛ يقبلها المصمّمون في ملفاتهم كما يرفع المهندسون إصدار حزمة.
further:
  - title: Guide to variables in Figma
    url: https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma
  - title: Modes for variables (Figma)
    url: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
  - title: Extend a variable collection (Figma)
    url: https://help.figma.com/hc/en-us/articles/36346281624471-Extend-a-variable-collection
  - title: Guide to libraries in Figma
    url: https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-libraries-in-Figma
quiz:
  - q: يستطيع مصمّمو Northwind اختيار أي primitive مثل `blue/600` من المكتبة، وما زالت التصاميم تستخدم الـ primitives حيث مكان الـ semantic tokens. ما أفضل إصلاح؟
    options:
      - text: حذف مجموعة الـ primitives من Figma.
        why: المتغيّرات الدلالية أسماء مستعارة للـ primitives، فيجب أن تبقى الـ primitives موجودة في الملف.
      - text: الطلب من المصمّمين في اجتماع أن يتوقّفوا عن استخدام الـ primitives.
        why: التذكيرات تتلاشى؛ يجب أن تجعل المكتبة الاختيار الصحيح هو الأسهل.
      - text: إعادة تسمية الـ primitives ببادئة «لا تستخدم».
        why: تزحم كل اسم وتتركها مع ذلك في المنتقي.
      - text: إخفاء متغيّرات الـ primitives من النشر، حتى لا تظهر في الملفات المستهلكة إلا المتغيّرات الدلالية.
        why: صحيح. تبقى الـ primitives متاحة للإشارة إليها داخل المكتبة، بينما لا يرى المصمّمون إلا الأسماء التي يجب أن يستخدموها.
    answer: 3
  - q: غيّر مصمّم `color/action/bg` في Figma الأسبوع الماضي، وغيّر مهندس الـ token نفسه في JSON أمس، إلى قيمة مختلفة. أيّ فشل في العملية يكشفه هذا؟
    options:
      - text: مصدران للحقيقة يقبل كلاهما التعديل المباشر.
        why: صحيح. مع مصدر واحد ومرآة، كان أحد التعديلين سيصبح اقتراحًا مقدَّمًا إلى المصدر بدل تغيير منافس.
      - text: متغيّرات Figma لا تدعم الألوان القادمة من الكود.
        why: متغيّرات Figma تحمل الألوان جيدًا؛ المشكلة في مَن يُسمح له بتغييرها، وأين.
      - text: كان على المهندس أن ينتظر مراجعة التصميم التالية.
        why: التوقيت لا يحلّ المشكلة؛ فبدون مصدر واحد يمكن لأي تعديلين أن يتعارضا.
    answer: 0
  - q: كيف يجب أن تمثّل Northwind علامتيها في Figma على خطة Enterprise؟
    options:
      - text: نسخ المكتبة كاملة لـ Tidewater وصيانة النسختين يدويًا.
        why: المكتبات المنسوخة تتباعد، وهذه هي المشكلة التي وُجد النظام لحلّها.
      - text: وضع ألوان العلامة مباشرة على كل مكوّن كتخصيصات (overrides).
        why: التخصيصات على المكوّنات تتجاوز المتغيّرات، فيتوقّف عمل الـ themes والربط بالكود.
      - text: توسيع المجموعة الدلالية لـ Tidewater وتخصيص متغيّرات العلامة وحدها.
        why: صحيح. المجموعة الممتدّة ترث كل ما لا تخصّصه، فتصل التغييرات المشتركة إلى العلامتين معًا.
      - text: تخزين ألوان العلامة كأنماط نصّ (text styles).
        why: أنماط النص تصف الطباعة لا الألوان، ولا ترتبط بالـ modes ولا بالـ tokens.
    answer: 2
---

طوال ثمانية أشهر بعد إطلاق الـ tokens، كان لدى Northwind حقيقتان. ملف JSON في المستودع يقول إن أزرق الإجراء هو `#1f5ae0`، ومكتبة Figma تقول `#2160e8`، لأن مصمّمًا عدّله قليلًا من أجل تصميم لحملة ثم نشره. كان المهندسون يبنون من لوحة الفحص، فأطلق الموقع التسويقي أزرق وأطلق التطبيق أزرق آخر. الـ tokens لا تحلّ مشكلة الاتّساق إلا إذا قرأت ملفات التصميم والكود من القرارات نفسها.

## ربط الطبقات بـ Figma variables

متغيّرات Figma (Figma variables) تحمل قيمًا قابلة لإعادة الاستخدام مثل الألوان والأرقام، مجمّعة في **collections**. ويمكن أن يكون للـ collection عدّة **modes**، يعطي كلٌّ منها كل متغيّر في المجموعة قيمة مختلفة. ويمكن أيضًا لمتغيّر أن يكون اسمًا مستعارًا لمتغيّر آخر. وهذا يكفي لعكس معمارية الـ tokens تقريبًا واحدًا لواحد:

| مفهوم الـ token | في Figma |
|---|---|
| طبقة الـ primitives | collection باسم "Primitives" بـ mode واحد |
| الطبقة الدلالية | collection باسم "Semantic" بـ modes هي Light وDark |
| الكثافة | collection باسم "Density" بـ modes هي Comfortable وCompact |
| العلامة | collection ممتدّة لكل علامة (Enterprise)، أو collection باسم Brand فيها mode لكل علامة |
| الاسم المستعار `{color.blue.600}` | متغيّر يشير إلى `blue/600` |

أسماء المتغيّرات تستخدم الشرطات المائلة لتشكيل المجموعات، فيظهر `color/action/bg` كمسار مجموعة في المنتقي، ويقابل الـ token المسمّى `color.action.bg`. وتختار الإطارات (frames) في Figma الـ modes كما تفعل الـ attribute selectors في CSS: يمكن للإطار أن يحدّد mode صراحة، وكل ما بداخله مضبوط على Auto يرث ذلك الـ mode، فيعمل إطار واجهة رئيسية داكن على صفحة فاتحة تمامًا مثل `data-theme="dark"` على قسم.

وللعلامات، تسمح لك **المجموعات الممتدّة (extended collections)** في Figma، المتاحة على خطة Enterprise، بإنشاء collection لـ Tidewater ترث من المجموعة الدلالية لـ Northwind وتخصّص متغيّرات العلامة وحدها. والتحديثات على المتغيّرات التي لم تخصّصها Tidewater تمرّ تلقائيًا. وعلى الخطط الأخرى، تحقّق لك collection منفصلة باسم Brand بـ mode لكل علامة معظم الطريق.

## اجعل المتغيّر الصحيح هو الأسهل

إعدادان أهمّ من أي نظام تسمية. الأول: **أخفِ الـ primitives من النشر**. تستطيع المجموعة الدلالية أن تشير إليها، لكن المصمّمين في ملفات المنتجات لا يرون إلا المتغيّرات الدلالية، وهذه بالضبط القاعدة التي تتبعها المكوّنات في الكود. والثاني: أعطِ كل متغيّر منشور **صيغة كود (code syntax)**: فيعرض Dev Mode حينها `var(--nw-color-action-bg)` بدل قيمة hex، فيكون ما اختاره المصمّم هو حرفيًا ما يكتبه المهندس. وتحديد النطاق (scoping) يساعد أيضًا: اقصر متغيّرات الألوان على الخصائص المقصودة لها، حتى لا يظهر لون نص في منتقي التعبئة.

:::mistake مصدران للحقيقة
إن قبلت مكتبة Figma وملف JSON كلاهما التعديل المباشر، فسيتباعدان؛ المسألة مسألة وقت فقط. اختر مصدر حقيقة واحدًا للقيم، واجعل الآخر مرآة لا تتغيّر إلا عبر عملية المزامنة. اختارت Northwind ملف JSON في المستودع، لأن الإصدارات والمراجعة وفحوص التباين والإطلاقات كانت تعيش هناك أصلًا. والفرق التي يقودها التصميم تختار أحيانًا Figma مصدرًا؛ وكلا الخيارين ينجح ما دام الجانب الآخر لا يُعدَّل يدويًا أبدًا.
:::

## حلقة المزامنة

:::figure مصدر حقيقة واحد، وFigma مرآة متزامنة
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">حلقة: مصمّم يقترح تغييرًا في branch على Figma، ويصدّر JSON إلى pull request، فيفحص الـ CI ويبني، ثم يُنشر الإصدار، ثم يُستورد ملف JSON الخاص بالإصدار إلى مكتبة Figma.</title>
  <rect class="d-box-accent" x="20" y="30" width="150" height="56" rx="10"/>
  <text class="d-label" x="95" y="55" text-anchor="middle">branch في Figma</text>
  <text class="d-label-muted" x="95" y="74" text-anchor="middle">اقتراح</text>
  <rect class="d-box-primary" x="265" y="30" width="150" height="56" rx="10"/>
  <text class="d-label" x="340" y="55" text-anchor="middle">Pull request</text>
  <text class="d-label-muted" x="340" y="74" text-anchor="middle">JSON الـ tokens</text>
  <rect class="d-box" x="510" y="30" width="150" height="56" rx="10"/>
  <text class="d-label" x="585" y="55" text-anchor="middle">فحوص الـ CI</text>
  <text class="d-label-muted" x="585" y="74" text-anchor="middle">بناء المخرجات</text>
  <rect class="d-box-success" x="510" y="150" width="150" height="56" rx="10"/>
  <text class="d-label" x="585" y="183" text-anchor="middle">الإصدار</text>
  <rect class="d-box-accent" x="20" y="150" width="150" height="56" rx="10"/>
  <text class="d-label" x="95" y="175" text-anchor="middle">مكتبة Figma</text>
  <text class="d-label-muted" x="95" y="194" text-anchor="middle">استيراد ونشر</text>
  <path class="d-arrow" d="M170 58 L261 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M415 58 L506 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M585 86 L585 146" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M510 178 L174 178" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="340" y="168" text-anchor="middle">JSON الإصدار</text>
</svg>
:::

ما زال المصمّمون يصمّمون في Figma؛ لكنهم فقط لا ينشرون قيم الـ tokens مباشرة. يبدأ التغيير في **branch** من ملف المكتبة (الـ branching متاح على خطتي Organization وEnterprise في Figma)، حيث يستطيع المصمّم تجربته في تصاميم حقيقية. وحين يجهز، تُصدَّر الـ modes المتغيّرة كـ JSON: إذ يستطيع Figma تصدير modes المجموعة واستيرادها بصيغة DTCG. ويصبح التصدير pull request على مستودع الـ tokens، حيث يشغّل الـ CI الفحوص من القسم 2، ويراجعه مصمّم ومهندس من النواة. وبعد الإصدار، يُستورد ملف JSON الخاص بالإصدار إلى ملف المكتبة الرئيسي ويُنشر تحديث المكتبة.

بعض الفرق تؤتمت الخطوة الأخيرة بـ plugin أو بـ REST API الخاص بـ Figma. أما Northwind فتفعلها يدويًا مرة في كل إصدار؛ تستغرق عشر دقائق، ونظرة بشرية إلى لوحة المتغيّرات التقطت مرتين استيرادًا خاطئًا.

:::tip تحديثات المكتبة إصدارات
حين تنشر مكتبة، يتلقّى العاملون في الملفات التي تستخدمها إشعارًا ويختارون متى يقبلون التحديثات. عامل ذلك كرفع إصدار حزمة: انشر مع إصدار الكود، والصق الـ changelog نفسه في وصف النشر حتى يرى المصمّمون ما الذي تغيّر ولماذا.
:::

الحلقة نفسها تعمل مع المكوّنات، إذ يربط Code Connect مكوّنات Figma بالكود الخاص بها في Dev Mode. في التمرين ترتّب خطوات تغيير token. وبعدها تعطي هذه الإصدارات أرقامًا تخبر الفرق بما سيفعله التحديث بها.
