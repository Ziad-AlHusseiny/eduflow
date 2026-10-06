---
summary: حوّل صف العادة وزر التعليم المتكرّرين في Steady إلى main components، وضع منهما instances، وطبّق overrides على ما يُسمح بتغييره في كل استخدام، وأبقِ التغييرات تتدفّق من مصدر واحد.
takeaways:
  - الـ main component هو المصدر؛ والـ instances نسخ مرتبطة به تتحدّث حين يتغيّر.
  - يمكن للـ instances أن تطبّق overrides على المحتوى والمظهر، مثل النص والتعبئة والظهور والـ instances المتداخلة، لكن لا على بنية طبقاتها.
  - الخاصية التي طُبّق عليها override تتوقّف عن تلقّي التحديثات لتلك الخاصية وحدها، لذا طبّق أقل قدر ممكن من الـ overrides.
  - ابنِ الـ components الصغيرة أولًا وضعها داخل بعضها، فيصل إصلاح زر التعليم إلى كل صف يحتويه.
  - فصل الـ instance ‏(detach) يقطعها عن الإصلاحات المستقبلية؛ اعتبره حلًّا أخيرًا، وغالبًا علامة على أن الـ component يحتاج خيارًا جديدًا.
further:
  - title: Guide to components in Figma
    url: https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma
  - title: Create components to reuse in designs
    url: https://help.figma.com/hc/en-us/articles/360038663154-Create-components-to-reuse-in-designs
quiz:
  - q: تغيّر نصف قطر الزوايا في الـ main component ‏Habit row من 12 إلى 16. أيّ الصفوف تتحدّث؟
    options:
      - text: الصفوف التي أُنشئت بعد التغيير فقط.
        why: الـ instances روابط حيّة. الموجودة منها تتحدّث أيضًا، لا الجديدة فقط.
      - text: كل instance لم يُطبَّق على نصف قطر زواياها override.
        why: صحيح. الـ instances تتبع الـ main component باستثناء الخصائص التي طبّقت عليها override في تلك الـ instance.
      - text: لا شيء، حتى تضغط زر نشر في الملف نفسه.
        why: داخل الملف الواحد تصل التغييرات إلى الـ instances فورًا. النشر لمشاركتها مع ملفات أخرى عبر مكتبة.
      - text: كل الصفوف، بما فيها المفصولة.
        why: الصفوف المفصولة frames عادية بلا رابط، فلا تتلقّى تحديثات أبدًا.
    answer: 1
  - q: "يحتاج مصمّم أن يعرض صف عادة واحد سطر نص إضافيًا للـ \"note\"، ففصل الـ instance وأضاف النص. ما الخطوة الأفضل على المدى البعيد؟"
    options:
      - text: فصل كل الصفوف لتتطابق كلها.
        why: هذا يرمي نظام الـ components كله. كل إصلاح مستقبلي سيحتاج إلى تكرار يدوي.
      - text: إبقاء النسخة المفصولة وإضافة تعليق يشرحها.
        why: التعليق لا يعيد ربطها. ستظل النسخة تنحرف مع تطوّر الـ component.
      - text: إضافة طبقة ملاحظة اختيارية إلى الـ main component والتحكّم في ظهورها في كل instance.
        why: صحيح. حين يحتاج استخدام واحد شيئًا جديدًا، يحتاج الـ component عادةً خيارًا جديدًا، لا نسخة لمرة واحدة.
      - text: تكرار الـ main component وتعديل النسخة المكرّرة.
        why: وجود اثنين من الـ main components شبه متطابقين يقسم كل إصلاح مستقبلي إلى اثنين.
    answer: 2
  - q: لماذا تبني زر التعليم كـ component مستقل وتضعه داخل الـ component ‏Habit row؟
    options:
      - text: لأن Figma لا يسمح للـ component إلا باحتواء components أخرى.
        why: الـ components يمكن أن تحتوي أي طبقات. التداخل خيار لإعادة الاستخدام، لا قاعدة.
      - text: لأن الـ components المتداخلة أرخص في التصدير.
        why: كلفة التصدير ليست السبب. الفائدة مصدر واحد لزر التعليم.
      - text: لأن التداخل يخفي زر التعليم عن المطوّرين.
        why: التداخل يجعل البنية أوضح في Dev Mode، لا أخفى.
      - text: لأن زر التعليم يظهر أيضًا في Habit detail، فيُبقي main component واحد المكانين متّسقين.
        why: صحيح. أصلح حلقة التركيز (focus ring) فيه مرة واحدة، فتتحدّث في كل صف وكل شاشة تستخدمه.
    answer: 3
---

بنهاية القسم 2 صار صف العادة موجودًا في شاشة Today، ومرّتين في Habit detail ("Similar habits")، ومرة في نتيجة بحث. ثم يتغيّر المطلوب: الصفوف تحتاج نصف قطر زوايا 16 px بدل 12. تجد ثلاث نسخ من الأربع. أما الرابعة فتُطلق بنصف القطر القديم، وينشر مستخدم دقيق الملاحظة لقطة شاشة.

الـ components موجودة لكي يعيش القرار التصميمي في مكان واحد.

## الـ Main components والـ Instances

حدّد frame صف العادة واضغط `Cmd+Option+K` (`Ctrl+Alt+K` على Windows)، أو استخدم زر إنشاء الـ component في شريط الأدوات. يصبح الـ frame ‏**main component**، ويظهر بأيقونة component في لوحة الطبقات. إنه مصدر الحقيقة. انقله إلى صفحة `Kit` التي أنشأتها في الدرس 1.1، فلا تحتوي الشاشات إلا استخداماته.

كل نسخة تضعها من الآن فصاعدًا هي **instance**: نسخة مرتبطة. اسحب واحدة من لوحة Assets، أو انسخ الـ main component والصقه. غيّر الـ main component فتتحدّث كل الـ instances، فورًا في هذا الملف، وفي الملفات الأخرى بعد أن تنشره كمكتبة (الدرس 3.5).

:::figure main component واحد يغذّي كل الـ instances؛ والـ overrides تُطبَّق فوقه
<svg viewBox="0 0 680 280" role="img" aria-labelledby="t1">
  <title id="t1">الـ main component ‏Habit row في صفحة Kit يرسل التحديثات إلى ثلاث instances في شاشات مختلفة. كل instance تعرض الـ override الخاص بها: اسم عادة مختلف، وstreak مخفي، وأيقونة مستبدلة.</title>
  <rect class="d-box-primary" x="240" y="20" width="200" height="60" rx="12"/>
  <text class="d-label-strong" x="340" y="46" text-anchor="middle">Habit row</text>
  <text class="d-label-muted" x="340" y="68" text-anchor="middle">main component ‏(Kit)</text>
  <path class="d-arrow" d="M300 80 L120 170" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 80 L340 170" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 80 L560 170" marker-end="url(#arrow)"/>
  <rect class="d-box" x="30" y="172" width="180" height="56" rx="10"/>
  <text class="d-label" x="120" y="196" text-anchor="middle">Instance: Today</text>
  <text class="d-label-muted" x="120" y="216" text-anchor="middle">النص: Drink water</text>
  <rect class="d-box" x="250" y="172" width="180" height="56" rx="10"/>
  <text class="d-label" x="340" y="196" text-anchor="middle">Instance: Detail</text>
  <text class="d-label-muted" x="340" y="216" text-anchor="middle">الـ streak مخفي</text>
  <rect class="d-box" x="470" y="172" width="180" height="56" rx="10"/>
  <text class="d-label" x="560" y="196" text-anchor="middle">Instance: Search</text>
  <text class="d-label-muted" x="560" y="216" text-anchor="middle">أيقونة مستبدلة</text>
  <text class="d-label-muted" x="340" y="262" text-anchor="middle">نصف قطر الزوايا والـ padding والبنية ما زالت تأتي من الـ main component</text>
</svg>
:::

## الـ Overrides: ما يُسمح للـ instance بتغييره

الـ instances ليست مجمّدة. يمكنك تطبيق **override** على المحتوى والمظهر في أي instance: تغيير النص ("Read 20 pages" إلى "Drink water")، أو تغيير تعبئة، أو إخفاء طبقة، أو استبدال instance متداخلة بـ component آخر. هذه تعديلات يومية ولا تكسر الرابط.

ما لا يمكنك تغييره في الـ instance هو **بنيتها**. لا يمكنك إضافة طبقة، ولا حذف واحدة، ولا إعادة ترتيب الأبناء؛ يمكنك فقط إخفاء ما هو موجود. (الاستثناء الوحيد هو الـ *slot*، أي منطقة يعلّمها صانع الـ component كمساحة مفتوحة لمحتوى حرّ، وستتعرّف إليها في الدرس التالي.) هذا الحدّ مقصود. البنية مهمّة الـ component، ولو استطاعت كل instance أن تعيد ترتيب نفسها، لما بقي هناك component.

للـ overrides قاعدة مهمّة واحدة: **الخاصية التي طُبّق عليها override تتوقّف عن اتّباع الـ main component**. إذا غيّرت لون الـ streak في صف واحد إلى الأحمر من أجل نموذج "streak at risk"، ثم تغيّر لاحقًا لون الـ streak في الـ main component، فسيحتفظ ذلك الصف بلونه الأحمر. يحتفظ Figma بالـ override لأنه يفترض أنك قصدته. ولإعادة خاصية إلى الاتّساق، استخدم reset overrides من خيارات الـ instance في الشريط الجانبي الأيمن.

:::mistake الـ overrides كطريقة تصميم
تغيير الـ padding والألوان وأحجام الخط instance تلو الأخرى ينتج ملفًا كل صف فيه مختلف قليلًا، وكلٌّ منها توقّف عن تلقّي التحديثات في كل ما لمسته. إذا وجدت نفسك تطبّق الـ override نفسه ثلاث مرات، فالـ component يحتاج خيارًا جديدًا (الدرس التالي)، لا مزيدًا من الـ overrides.
:::

## ابنِ الصغير ثم ضعه داخل الكبير

انظر إلى صف العادة واعثر على القطع التي تظهر في أماكن أخرى. زر التعليم يظهر أيضًا في Habit detail. وأيقونة العادة، وهي مربّع بزوايا مستديرة فيه رمز، تظهر في منتقي الأيقونات في لوحة New habit. اصنع هذه الـ components أولًا، ثم استخدم instances منها داخل الـ component ‏Habit row:

```text
Kit page
├─ Check button          main component
├─ Habit icon            main component
└─ Habit row             main component
   ├─ Habit icon         instance
   ├─ Text stack         frame
   │  ├─ Habit name      text
   │  └─ Streak          text
   └─ Check button       instance
```

الآن أي إصلاح لزر التعليم، مثل حلقة تركيز أوضح، يصل إلى كل صف عادة في كل شاشة وإلى الزر المستقل في Habit detail. ويبقى كل مستوى صغيرًا بما يكفي لفهمه.

سمِّ الـ components كما سمّيت الطبقات: حسب الدور. يجمّع Figma الـ components في لوحة Assets حسب الأسماء المفصولة بشرطة مائلة، فيظهر `Controls/Check button` و`Controls/Chip` معًا تحت Controls. أبقِ البنية ضحلة؛ مستويان يكفيان عادةً لمجموعة بهذا الحجم.

## الفصل (Detach): مخرج الطوارئ

يمكنك فصل instance ‏(`Cmd+Option+B` / `Ctrl+Alt+B`)، فتتحوّل إلى frame عادي بلا رابط. أحيانًا يكون هذا صحيحًا: رسم تسويقي يستعير مظهر صف، أو استكشاف لمرة واحدة في صفحة `Scratch`. أما في شاشة منتج، فالـ instance المفصولة خطأ مؤجّل. سيفوتها كل إصلاح، ولن يتذكّر أحد وجودها حتى ينشر مستخدم لقطة شاشة.

:::tip اعثر على المصدر بسرعة
انقر بالزر الأيمن على instance واختر الانتقال إلى الـ main component الخاص بها، فيقفز Figma إلى المصدر حتى لو كان في صفحة أخرى. استخدم ذلك كلما لم تكن متأكّدًا هل تعدّل المصدر أم نسخة.
:::

صار صفّك component واحدًا بـ instances مرتبطة. لكن Steady يحتاج الصف بعدّة حالات: غير معلَّم، ومعلَّم، وفائت بالأمس. صنع component منفصل لكل حالة سيعيد مشكلة النسخ من جديد. الـ Variants والـ Component properties تحلّ ذلك في الدرس التالي.
