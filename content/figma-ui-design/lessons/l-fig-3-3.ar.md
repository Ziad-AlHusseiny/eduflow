---
summary: قرّر متى تنتمي قيمة ما إلى style ومتى إلى variable، وأنشئ في Steady ‏variables ألوان أولية (primitives) ودلالية (semantic) مرتبطة بالـ aliases، واربط الـ components بالمعاني بدل رموز hex الخام.
takeaways:
  - الـ style يجمع عدّة خصائص في وحدة مركّبة قابلة لإعادة الاستخدام، مثل text style يضمّ نوع الخط وحجمه ووزنه وارتفاع السطر.
  - الـ variable يحمل قيمة خامًا واحدة (لونًا أو رقمًا أو نصًا أو boolean)، ويمكن أن يكون alias لـ variable آخر، ويمكن أن تتغيّر قيمته حسب الـ mode.
  - استخدم مستويين من الـ variables، الـ primitives للوحة الألوان الخام والـ tokens الدلالية للمعاني، واربط الـ components بالمستوى الدلالي وحده.
  - الـ text styles والـ effect styles وcolor styles متعدّدة التعبئة أو المتدرّجة ما زالت بلا مقابل من variable واحد، لذا تستخدم معظم الفرق النظامين معًا.
  - تحديد نطاق الـ variables ‏(scoping) وإخفاء الـ primitives من النشر يُبقيان منتقي الـ variables قصيرًا ويمنعان الناس من اللجوء إلى القيم الخام.
further:
  - title: Overview of variables, collections, and modes
    url: https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes
  - title: Guide to styles in Figma
    url: https://help.figma.com/hc/en-us/articles/360039238753-Guide-to-styles-in-Figma
  - title: Create and manage variables and collections
    url: https://help.figma.com/hc/en-us/articles/15145852043927-Create-and-manage-variables-and-collections
quiz:
  - q: "حالة Done في صف العادة تستخدم لون التعليم `teal/700` مباشرة من مجموعة الـ primitives. في الـ sprint التالي تضيف الوضع الداكن. ما الذي سيتعطّل؟"
    options:
      - text: لا شيء، لأن الـ primitives تتبدّل تلقائيًا في الوضع الداكن.
        why: الـ primitives قيم خام ثابتة. التبديل مهمّة الـ variables الدلالية التي لها قيمة لكل mode.
      - text: يرفض Figma نشر components مرتبطة بـ primitives.
        why: يسمح Figma بذلك. المشكلة أنك تخسر طبقة المعنى التي تبدّل الـ modes قيمها.
      - text: يحتفظ الصف بالتركوازي الداكن في الوضع الداكن، لأنه لا شيء يقول إن هذا اللون يعني «إجراء» ويجب أن يتغيّر.
        why: صحيح. الربط بـ `color/action/primary` بدلًا من ذلك يتيح للوضع الداكن توجيه هذا المعنى إلى تركوازي أفتح.
      - text: يفقد صف العادة الـ variants الخاصة به.
        why: ربط الـ variables لا يؤثّر في الـ variants ولا في خصائص الـ component الأخرى.
    answer: 2
  - q: أيّ من هذه ينتمي إلى style لا إلى variable واحد؟
    options:
      - text: تنسيق نص Headline، أي 17 px بوزن semibold وارتفاع سطر 24 px.
        why: صحيح. إنها مركّب من عدّة خصائص. الـ text style يجمعها، ويمكن مع ذلك ربط كل جزء منها بـ variable.
      - text: الـ padding بمقدار 16 px في البطاقة.
        why: الـ padding رقم واحد، وهذا بالضبط ما وُجد الـ number variable من أجله.
      - text: لون الإجراء الأساسي.
        why: لون واحد يجب أن يتغيّر حسب الـ mode هو color variable نموذجي.
      - text: هل تلميح التهيئة الأولى (onboarding) ظاهر.
        why: قيمة true أو false تناسب boolean variable.
    answer: 0
  - q: "ما الفائدة الأساسية من جعل `color/text/secondary` ‏alias لـ `gray/500` بدل كتابة #6B7280 فيه؟"
    options:
      - text: الـ aliases تجعل الملف أصغر.
        why: حجم الملف لا يكاد يتغيّر. الفائدة الحقيقية في الصيانة والمعنى.
      - text: المطوّرون لا يستطيعون قراءة قيم hex الخام في Dev Mode.
        why: يعرض Dev Mode قيم hex بلا مشكلة. الفائدة هي سلسلة المعنى.
      - text: الـ variables المرتبطة بـ alias لا يمكن تعديلها بالخطأ.
        why: يمكن دائمًا إعادة توجيه الـ aliases. إنها ليست قفلًا.
      - text: تغيير الرمادي في لوحة الألوان مرة واحدة يحدّث كل معنى يشير إليه، ويمكن لكل mode أن يشير إلى مكان مختلف.
        why: صحيح. الـ aliases تفصل ما هو اللون عمّا يُستخدم له، فيبقى تغيير لوحة الألوان والـ modes تعديلًا واحدًا لكلٍّ منهما.
    answer: 3
  - q: يكتب مصمّم 15 في حقل الـ gap مع أن منتقي variables المسافات `space` متاح. أيّ تغيير في الإعداد يثنيه عن ذلك على أفضل وجه؟
    options:
      - text: حذف حقل الـ gap من إعدادات الملف.
        why: لا يمكنك إزالة الخصائص الأساسية. الهدف أن تجعل القيمة الصحيحة هي الأسهل.
      - text: تحديد نطاق variables المسافات للـ gap والـ padding لتظهر أولًا هناك، ومراجعة القيم الخارجة عن النظام بفحص تصميمي قبل التسليم.
        why: صحيح. تحديد النطاق يُبقي المنتقي ملائمًا، والمراجعة تلتقط القيم المكتوبة يدويًا التي تسلّلت.
      - text: إعادة تسمية كل variable مسافات بقيمته بالبكسل.
        why: أسماء مثل `16` تخفي المعنى ولا تمنع أحدًا من كتابة 15.
      - text: تحويل كل المسافات إلى text styles.
        why: الـ text styles تحمل إعدادات الخط، لا مسافات التخطيط.
    answer: 1
---

ابحث في ملف Steady عن رمز اللون #0F766E وستجده على أزرار التعليم، والزر الأساسي، وحلقة التركيز، ورابط، وحلقة تقدّم، مكتوبًا يدويًا في كل مرة. حين يطلب فريق العلامة التجارية تركوازيًا أميل إلى الأزرق قليلًا، تواجه البحث نفسه الذي واجهته في الدرس 3.1، لكن هذه المرة للون. والأسوأ أنه حين يأتي الوضع الداكن، ستحتاج بعض هذه الأماكن تركوازيًا أفتح وبعضها لا، ورمز hex لا يستطيع أن يخبرك أيّها.

الـ styles والـ variables كلاهما يضع القيم في مكان واحد. لكنهما يحلّان مشكلتين مختلفتين قليلًا.

## الـ Styles: وحدات مركّبة قابلة لإعادة الاستخدام

الـ **style** حزمة مسمّاة من الخصائص البصرية. وقت كتابة هذا الدرس، في Figma ‏color styles وtext styles وeffect styles وlayout guide styles. خطّطت للـ text styles بالفعل في الدرس 1.3: `Headline` هو عائلة خط وحجم ووزن وارتفاع سطر وتباعد حروف، كلها تُطبَّق بنقرة واحدة.

تبرز فائدة الـ styles حين تكون القيمة **مركّبة**. الـ text style عدّة خصائص دفعة واحدة. والـ effect style يمكن أن يحمل ظلّين متراكبين. والـ color style يمكن أن يحمل تدرّجًا لونيًا أو عدّة تعبئات متراكبة. غيّر الـ style فتتحدّث كل طبقة تستخدمه.

## الـ Variables: قيم مفردة بقدرات إضافية

الـ **variable** يحمل قيمة خامًا واحدة. الأنواع الأساسية هي **color** و**number** و**string** و**boolean** (وأضاف Figma أنواعًا أخرى لأعمال الحركة منذ ذلك الحين). يمكنك ربط الـ variables بالتعبئات والحدود، ونصف قطر الزوايا، والـ gap، والـ padding، والعرض والارتفاع، والشفافية، وظهور الطبقة، ومحتوى النص، وكثير من خصائص الخط.

ثلاثة أشياء تجعل الـ variables مختلفة عن الـ styles:

- **الـ Aliasing**: يمكن للـ variable أن يشير إلى variable آخر من النوع نفسه، بدل أن يحمل قيمة خامًا.
- **الـ Modes**: يمكن للـ variable أن يحمل قيمة مختلفة لكل mode، مثل الفاتح والداكن (الدرس التالي).
- **الـ Tokens**: الـ variables تقابل بشكل وثيق الـ design tokens التي يستخدمها المطوّرون في الكود، ووقت كتابة هذا الدرس يمكنك تسجيل اسم كل variable في الكود للويب وiOS وAndroid ليعرضه Dev Mode.

توجد الـ variables في **collections**، والشرطات المائلة في الأسماء تصنع مجموعات: `color/text/primary` يقع في المجموعة `color/text`.

## مستويان: الـ primitives والدلالية

النمط الذي تستخدمه معظم أنظمة التصميم، والذي يستخدمه Steady، فيه مستويان.

**الـ Primitives** هي لوحة الألوان الخام، مسمّاة بما هي عليه: `teal/700` = #0F766E، و`gray/500` = #6B7280، و`white` = #FFFFFF. ليس لها رأي في مكان استخدامها.

**الـ variables الدلالية (semantic)** مسمّاة بما تُستخدم له، وكلٌّ منها alias لـ primitive: ‏`color/action/primary` ← `teal/700`، و`color/text/secondary` ← `gray/500`، و`color/surface/default` ← `white`. الـ components ترتبط **فقط** بالـ variables الدلالية.

:::figure الـ components تشير إلى المعاني، والمعاني تشير إلى لوحة الألوان
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة أعمدة. الـ primitives ‏teal 700 وgray 500 وwhite تغذّي الـ variables الدلالية action primary وtext secondary وsurface default، المرتبطة بدورها بتعبئة زر التعليم ونص الـ streak وخلفية الصف.</title>
  <text class="d-label-strong" x="110" y="26" text-anchor="middle">Primitives</text>
  <text class="d-label-strong" x="340" y="26" text-anchor="middle">الدلالية</text>
  <text class="d-label-strong" x="570" y="26" text-anchor="middle">في الـ component</text>
  <rect class="d-box" x="30" y="44" width="160" height="40" rx="8"/>
  <text class="d-code" x="110" y="69" text-anchor="middle">teal/700</text>
  <rect class="d-box" x="30" y="114" width="160" height="40" rx="8"/>
  <text class="d-code" x="110" y="139" text-anchor="middle">gray/500</text>
  <rect class="d-box" x="30" y="184" width="160" height="40" rx="8"/>
  <text class="d-code" x="110" y="209" text-anchor="middle">white</text>
  <rect class="d-box-primary" x="240" y="44" width="200" height="40" rx="8"/>
  <text class="d-code" x="340" y="69" text-anchor="middle">action/primary</text>
  <rect class="d-box-primary" x="240" y="114" width="200" height="40" rx="8"/>
  <text class="d-code" x="340" y="139" text-anchor="middle">text/secondary</text>
  <rect class="d-box-primary" x="240" y="184" width="200" height="40" rx="8"/>
  <text class="d-code" x="340" y="209" text-anchor="middle">surface/default</text>
  <rect class="d-box-accent" x="490" y="44" width="160" height="40" rx="8"/>
  <text class="d-label" x="570" y="69" text-anchor="middle">تعبئة زر التعليم</text>
  <rect class="d-box-accent" x="490" y="114" width="160" height="40" rx="8"/>
  <text class="d-label" x="570" y="139" text-anchor="middle">نص الـ streak</text>
  <rect class="d-box-accent" x="490" y="184" width="160" height="40" rx="8"/>
  <text class="d-label" x="570" y="209" text-anchor="middle">خلفية الصف</text>
  <path class="d-arrow" d="M238 64 L192 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M238 134 L192 134" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M238 204 L192 204" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M488 64 L442 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M488 134 L442 134" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M488 204 L442 204" marker-end="url(#arrow)"/>
</svg>
:::

لماذا نتعب أنفسنا بالعمود الأوسط؟ لأن المعنى والقيمة يتغيّران لأسباب مختلفة. يغيّر فريق العلامة التجارية `teal/700`، فيتبعه كل لون إجراء. ويغيّر الوضع الداكن ما يشير إليه `color/action/primary`، فتتبعه ألوان الإجراءات وحدها، لا كل تركوازي في الملف. ولا يحتاج أيّ من التغييرين لمس component واحد.

أرقام Steady تُعامَل بالطريقة نفسها: مجموعة `space` (من `space/1` = 4 إلى `space/12` = 48، من الدرس 2.3) ومجموعة `radius` ‏(`radius/sm` = 8، و`radius/md` = 12). اربط الـ padding في صف العادة بـ `space/3` و`space/4`، ونصف قطر زواياه بـ `radius/md`.

:::mistake أسماء دلالية تصف المظهر
`color/teal-button` هو primitive يرتدي زيًّا دلاليًا. يوم يتحوّل الزر إلى الأزرق يصبح الاسم مضلّلًا، وفي الوضع الداكن قد لا يكون تركوازيًا أصلًا. سمِّ الـ variables الدلالية حسب الدور، مثل `action/primary` أو `text/secondary` أو `border/default`، ودع القيمة تكون ما يحتاجه ذلك الدور.
:::

## إبقاء المنتقي نظيفًا

إعدادان يُبقيان الناس على النظام. **تحديد النطاق (scoping)** يحصر الأماكن التي يُعرض فيها الـ variable: حدّد نطاق variables ‏`space` بالـ gap والـ padding، فتتوقّف عن الظهور في منتقي نصف قطر الزوايا. و**الإخفاء من النشر** يُبقي الـ primitives خارج المكتبة التي تراها الملفات الأخرى، فلا يجد المصمّمون الذين يستخدمون المجموعة إلا الـ tokens الدلالية. كلا الإعدادين موجود في لوحة تعديل كل variable وقت كتابة هذا الدرس.

## استخدم الاثنين

الـ variables لم تحلّ محلّ الـ styles. التقسيم المعتاد هو: الـ variables للقيم المفردة (الألوان والمسافات ونصف قطر الزوايا والـ booleans) لأنها تقبل الـ aliases وتبدّل الـ modes؛ والـ text styles للخطوط، مع ربط أحجامها بـ number variables إذا احتجت أن تتغيّر حسب الـ mode؛ والـ effect styles للظلال؛ والـ color styles للتدرّجات أو التعبئات المتراكبة فقط. اربط تعبئة color style بـ variable، فتحصل على سهولة المركّب مع الـ modes الخاصة بالـ variable.

:::tip ابدأ بعدد قليل من الـ tokens الدلالية
يحتاج Steady نحو اثني عشر لونًا دلاليًا: النص الأساسي والثانوي، والسطح الافتراضي والمرتفع، والحدّ الافتراضي، والإجراء الأساسي وحالته المضغوطة، وon-action (النص فوق التركوازي)، والنجاح، والخطر، والتركيز. أضف token حين يحتاج component حقيقي معنى غير موجود بعد، لا قبل ذلك.
:::

مع إشارة كل component إلى معانٍ، يصبح الوضع الداكن مسألة ما يشير إليه كل معنى، وهذا بالضبط ما تجيب عنه الـ modes في الدرس التالي.
