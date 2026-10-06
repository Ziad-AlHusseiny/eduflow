---
summary: أضف الـ modes ‏Light وDark إلى الـ variables الدلالية في Steady، وبدّل شاشات كاملة بينهما، وأعِد فحص التباين لكي يكون الوضع الداكن مصمّمًا لا مقلوبًا.
takeaways:
  - الـ mode عمود واحد من القيم في collection من الـ variables؛ وتبديل الـ mode في frame يستبدل كل قيمة مرتبطة دفعة واحدة.
  - ضع الـ modes على الـ collection الدلالية وأبقِ الـ primitives بـ mode واحد، فلا يغيّر الوضع الداكن إلا ما يشير إليه كل معنى.
  - تستخدم الطبقات الـ mode ‏Auto افتراضيًا، فترث من أقرب أب ضُبط له mode، وإلا تعود إلى الـ mode الافتراضي للـ collection.
  - الوضع الداكن ليس قلبًا للألوان؛ الألوان المميّزة تصبح عادةً أفتح، والنص فوقها قد ينقلب إلى داكن، والأسطح تصبح أفتح كلما ارتفعت.
  - كل لون نص وعنصر تحكم يحتاج فحص تباين جديدًا في كل mode، لأن زوجًا ينجح في الفاتح قد يفشل في الداكن.
further:
  - title: Modes for variables
    url: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
  - title: Variable modes in prototypes
    url: https://help.figma.com/hc/en-us/articles/15253268379799-Variable-modes-in-prototypes
  - title: Dark Mode (Apple Human Interface Guidelines)
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
quiz:
  - q: تضبط frame شاشة Today على Dark. صف عادة واحد داخله مضبوط صراحةً على Light. ماذا ترى؟
    options:
      - text: الشاشة كلها داكنة، وذلك الصف وحده يُعرض بقيم Light.
        why: صحيح. الطبقات ترث من أقرب أب ضُبط له mode. والـ mode الصريح على الصف يتغلّب على mode الـ frame لذلك الصف وأبنائه.
      - text: الشاشة كلها بما فيها الصف داكنة، لأن mode الـ frame يفوز دائمًا.
        why: الـ mode الصريح الأقرب هو الذي يفوز، لا الأبعد.
      - text: يعرض Figma خطأً لأن الـ modes متعارضة.
        why: خلط الـ modes مسموح ومفيد، مثل بطاقة فاتحة داخل منطقة ترويجية داكنة.
      - text: يصبح الصف فاتحًا، ومعه بقية الشاشة.
        why: الـ mode في الابن لا يغيّر الـ mode في أبيه أبدًا.
    answer: 0
  - q: "في الوضع الداكن، يشير `color/action/primary` إلى teal/400 ‏(#2DD4BF)، وتسمية الزر تستخدم `color/on-action` الذي ما زال أبيض. تباين التسمية 1.86:1. ما الإصلاح الصحيح؟"
    options:
      - text: إعادة توجيه action/primary إلى teal/700 في الوضع الداكن.
        why: ‏teal/700 على السطح الداكن يعطي 3.24:1 فقط، فستفقد أزرار التعليم التباين بدلًا من ذلك.
      - text: إضافة ظل للنص في الوضع الداكن.
        why: الظلال لا تُحسب في التباين وتطمس النص.
      - text: توجيه قيمة on-action في Dark إلى لون قريب من الأسود مثل gray/950، فيعطي 9.53:1 على teal/400.
        why: صحيح. لهذا السبب on-action ‏token دلالي مستقل. يمكن لقيمته أن تنقلب من الأبيض إلى الداكن حسب الـ mode.
      - text: جعل التسمية بخط عريض لتُعدّ نصًا كبيرًا.
        why: حتى النص الكبير يحتاج 3:1، و1.86:1 تفشل في ذلك أيضًا.
    answer: 2
  - q: لماذا تبقى الـ primitives ‏(teal/700، gray/500...) في collection بـ mode واحد؟
    options:
      - text: لأن Figma لا يسمح بالـ modes في collections فيها أكثر من 20 variable.
        why: لا يوجد حدّ كهذا. الاختيار معماري.
      - text: لأن الـ primitives حقائق خام عن لوحة الألوان، والمعاني تتغيّر حسب الـ mode بأن تكون aliases لـ primitives مختلفة.
        why: صحيح. لو تغيّر teal/700 حسب الـ mode لما بقي teal/700، ولأصبح كل alias غير متوقّع.
      - text: لأن الـ primitives لا يمكن أن تكون هدفًا لـ alias إذا كانت لها modes.
        why: الـ variables التي لها modes يمكن مع ذلك أن تكون هدفًا لـ alias. السبب الوضوح، لا قاعدة تقنية.
      - text: لأن Dev Mode لا يقرأ إلا الـ collections ذات الـ mode الواحد.
        why: يعرض Dev Mode الـ variables من أي collection، بما في ذلك الـ modes الخاصة بها.
    answer: 1
---

أسرع طريقة لصنع الوضع الداكن أن تكرّر كل شاشة وتعيد تلوينها يدويًا. وهي أيضًا أسرع طريقة للحصول على مجموعتين من الشاشات تختلفان خلال شهر: يضيف أحدهم صف عادة إلى شاشة Today الفاتحة وينسى الداكنة. في Steady سيكون الوضع الداكن مفتاحًا واحدًا على الـ frame، لأن الألوان تشير إلى معانٍ أصلًا.

## الـ Modes أعمدة من القيم

افتح الـ variables المحلية (تصل إليها من الشريط الجانبي الأيمن دون تحديد أي شيء، وقت كتابة هذا الدرس) وانظر إلى الـ collection المسمّاة `Semantic`. فيها عمود واحد من القيم، اسمه `Mode 1` افتراضيًا. أعِد تسميته إلى `Light`، ثم أضف mode وسمّه `Dark`. صار لكل variable قيمتان: واحدة لكل عمود. ينسخ Figma القيم الموجودة إلى العمود الجديد، وهذه نقطة بداية لا إجابة.

املأ عمود Dark بجعل كل variable ‏alias لـ primitives مختلفة. هذا جدول الربط في Steady، مع قياس التباين مقابل السطح الذي يقع عليه كل لون:

| الـ variable الدلالي | Light | Dark |
|---|---|---|
| `color/surface/default` | white | gray/950 ‏(#111827) |
| `color/surface/raised` | white | gray/800 ‏(#1F2937) |
| `color/text/primary` | gray/900، ‏17.40:1 | gray/50، ‏16.98:1 |
| `color/text/secondary` | gray/500، ‏4.83:1 | gray/400، ‏6.99:1 |
| `color/action/primary` | teal/700، ‏5.47:1 | teal/400، ‏9.53:1 |
| `color/on-action` | white | gray/950 |

أبقِ الـ collection المسمّاة `Primitives` بـ mode واحد. الـ primitive حقيقة (`teal/700` هو #0F766E)؛ أما الـ variable الدلالي فقرار يعتمد على السياق. والـ modes تخصّ القرارات.

:::figure الـ variable الدلالي نفسه يُحلّ إلى primitives مختلفة حسب الـ mode
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">الـ variable الدلالي action primary في المنتصف. في الـ mode ‏Light يشير إلى teal 700؛ وفي Dark يشير إلى teal 400. زر التعليم المرتبط به يظهر بتركوازي داكن على شاشة فاتحة وبتركوازي فاتح على شاشة داكنة.</title>
  <rect class="d-box" x="20" y="40" width="150" height="44" rx="8"/>
  <text class="d-code" x="95" y="67" text-anchor="middle">teal/700</text>
  <rect class="d-box" x="20" y="140" width="150" height="44" rx="8"/>
  <text class="d-code" x="95" y="167" text-anchor="middle">teal/400</text>
  <rect class="d-box-primary" x="250" y="88" width="180" height="48" rx="10"/>
  <text class="d-code" x="340" y="117" text-anchor="middle">action/primary</text>
  <path class="d-arrow" d="M248 104 L172 66" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M248 122 L172 160" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="205" y="72" text-anchor="middle">Light</text>
  <text class="d-label-muted" x="205" y="164" text-anchor="middle">Dark</text>
  <rect class="d-box" x="500" y="30" width="160" height="70" rx="12"/>
  <circle class="d-dot" cx="530" cy="65" r="12"/>
  <text class="d-label" x="552" y="70">صف فاتح</text>
  <rect class="d-box-accent" x="500" y="126" width="160" height="70" rx="12"/>
  <circle class="d-dot" cx="530" cy="161" r="12"/>
  <text class="d-label" x="552" y="166">صف داكن</text>
  <path class="d-arrow" d="M432 104 L498 70" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M432 120 L498 156" marker-end="url(#arrow)"/>
</svg>
:::

## تبديل شاشة

كرّر frame شاشة Today وحدّد النسخة. في الشريط الجانبي الأيمن، استخدم عنصر التحكم في mode الـ variables (في قسم Appearance وقت كتابة هذا الدرس)، واختر الـ collection المسمّاة `Semantic` ثم `Dark`. تتبدّل كل تعبئة وحدّ ولون نص مرتبط في الشاشة دفعة واحدة.

ينجح ذلك بفضل الوراثة. كل طبقة تبدأ على **Auto**، أي «استخدم الـ mode الخاص بأبي». يصعد Figma في شجرة الطبقات حتى يجد أبًا ضُبط له mode، وإن لم يجد، يستخدم الـ mode الافتراضي للـ collection (العمود الأول). ويمكنك أيضًا ضبط mode على صفحة كاملة دون تحديد أي شيء.

الآن لم تعد النسخة شيئًا تصونه؛ إنها الـ components نفسها معروضة عبر mode مختلف. أضف صف عادة إلى الشاشة الفاتحة وانسخه إلى الداكنة، وسيكون داكنًا من فوره.

:::note توفّر الميزة حسب الخطة
وقت كتابة هذا الدرس، لا تتضمّن خطة Starter المجانية الـ modes في الـ variables؛ وتسمح خطة Professional بما يصل إلى 10 modes لكل collection، وخطة Organization بما يصل إلى 20. إن كنت على Starter، فابنِ عمود Dark كـ collection ثانية لترى القيم جنبًا إلى جنب، وتابع طريقة التفكير.
:::

## صمّم الوضع الداكن ولا تقلبه

الوضع الداكن تصميم قائم بذاته. وبضع قواعد تكفي لمعظم العمل:

- **الألوان المميّزة تصبح أفتح.** ‏teal/700 يعطي 5.47:1 على الأبيض لكن 3.24:1 فقط على gray/950. يجب أن يكون اللون المميّز في الوضع الداكن درجة أفتح.
- **النص فوق الألوان المميّزة قد ينقلب.** الأبيض على teal/400 يعطي 1.86:1، وهذا فشل واضح. لهذا السبب يوجد `color/on-action` كـ token مستقل: في Dark يشير إلى gray/950، فيعطي 9.53:1.
- **الارتفاع يعني لونًا أفتح، لا أغمق.** الظلال بالكاد تظهر على الخلفيات الداكنة، لذا تستخدم الأسطح المرتفعة مثل لوحة New habit رماديًا أفتح قليلًا (`surface/raised`).
- **تجنّب التطرّف الحادّ.** النص القريب من الأبيض على خلفية قريبة من الأسود أريح في الجلسات الطويلة من الأبيض الصافي على الأسود الصافي، الذي قد يبهر العين.

:::mistake الثقة بفحوص التباين في الوضع الفاتح
كل زوج قسته في الدرس 1.3 قِيس على الأبيض. في الوضع الداكن تغيّرت الخلفيات، فتغيّرت الأرقام. بدّل كل شاشة إلى Dark وأعِد تشغيل أداة فحص التباين في Figma على النصوص والأيقونات وحدود عناصر التحكم. الأزواج التي تنجح في mode كثيرًا ما تفشل في الآخر.
:::

## الـ Modes أبعد من الألوان

الـ modes ليست للثيمات فقط. collection باسم `Density` فيها الـ modes ‏`Comfortable` و`Compact` يمكن أن تحمل number variables للـ padding في الصف (12 مقابل 8) وللـ gap بين الصفوف. وcollection باسم `Content` فيها string variables يمكن أن تحمل التسميات نفسها بالإنجليزية والعربية، وهذه طريقة سريعة لترى هل ما زال "Save habit" يتّسع حين يصبح أطول. بل يمكنك تبديل الـ modes داخل prototype، مثلًا لعرض مفتاح الثيم الداكن في الإعدادات.

صارت لديك الآن مجموعة بثيمات ومبنية على tokens. الدرس الأخير من هذا القسم ينظّمها في شيء يستطيع مصمّم آخر، أو مطوّر، أن يتسلّمه ويستخدمه دون أن يسألك.
