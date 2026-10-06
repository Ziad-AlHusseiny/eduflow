---
summary: اجمع مجموعة Steady المصغّرة في مكتبة موثّقة قابلة للنشر، فيها الأساسيات والـ components والأوصاف وقائمة فحص للجودة يجب أن يجتازها كل component.
takeaways:
  - تكون المجموعة (kit) مفيدة حين يستطيع شخص آخر أن يجد الـ component ويفهمه ويستخدمه دون أن يسألك، لذا تهمّ البنية والتوثيق بقدر ما تهمّ الـ components نفسها.
  - ابنِ المجموعة من الأنماط التي تتكرّر فعلًا في الشاشات، ولا تضف component إلا حين تحتاجه شاشة حقيقية.
  - يجب أن يجتاز كل component قائمة الفحص نفسها، التي تغطّي الـ Auto layout والـ variables والحالات والوضعين الفاتح والداكن والمحتوى المتطرّف والوصف.
  - نشر المكتبة يتيح للملفات الأخرى استخدام المجموعة، ويجب أن يشرح كل نشر ما الذي تغيّر ليستطيع المشتركون مراجعة التحديثات.
  - الأسماء واجهة استخدام؛ اختر اصطلاحًا واحدًا لتسمية الـ components والخصائص والقيم واستخدمه في كل مكان.
further:
  - title: Lesson 3, Build your design system (Figma)
    url: https://help.figma.com/hc/en-us/articles/14548865734679-Lesson-3-Build-your-design-system
  - title: Guide to libraries in Figma
    url: https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-libraries-in-Figma
  - title: Check designs in Figma
    url: https://help.figma.com/hc/en-us/articles/39592284074263-Check-designs-in-Figma
quiz:
  - q: "يقترح مصمّم بناء Carousel وData table وDate range picker لمجموعة Steady «لنكون مستعدّين». لا تستخدمها أي شاشة في Steady. ماذا يجب أن تقول صوفيا؟"
    options:
      - text: ابنِها الآن، لأن إضافة الـ components لاحقًا مكلفة.
        why: الـ components المبنية دون استخدام حقيقي تكون غالبًا خاطئة حين يأتي الاستخدام الحقيقي، وتحتاج صيانة في الأثناء.
      - text: ابنِها لكن أخفِها من المكتبة.
        why: مخفية أو لا، فهي تكلّف وقتًا لصنعها وإبقائها متزامنة مع الـ variables والـ modes.
      - text: انتظر حتى تحتاجها شاشة، ثم ابنِها من ذلك الاستخدام الحقيقي.
        why: صحيح. المجموعة تنمو من الأنماط المتكرّرة في الشاشات الحقيقية، وهذا يُبقيها صغيرة ويجعل لكل component مبرّرًا.
      - text: انسخها من مجموعة في Figma Community لتوفير الوقت.
        why: الـ components المستعارة تجلب tokens شخص آخر وأسماءه وافتراضاته، فنادرًا ما تناسب دون إعادة عمل.
    answer: 2
  - q: تنشر تحديثًا لمجموعة Steady يغيّر الـ padding في صف العادة. ماذا يحدث في ملف شاشات يستخدم المكتبة؟
    options:
      - text: تتغيّر الـ instances في ذلك الملف فورًا دون أي إشعار.
        why: تحديثات المكتبة تُعرض على الملفات المشتركة للمراجعة، ولا تُطبَّق بصمت.
      - text: يتلقّى الملف إشعارًا بوجود تحديثات، ويراجعها أحدهم ويقبلها.
        why: صحيح. يرى المشتركون أن هناك تحديثات متاحة ويختارون متى يقبلونها، ولهذا تهمّ ملاحظات النشر.
      - text: لا شيء، لأن الـ instances القادمة من المكتبات لا تتحدّث أبدًا.
        why: تتحدّث فعلًا بمجرّد أن يقبل الملف تحديث المكتبة. هذا هو الهدف من المكتبة أصلًا.
      - text: يُكرَّر ملف الشاشات للاحتفاظ بالنسخة القديمة.
        why: لا يكرّر Figma الملفات عند تحديثات المكتبة. سجلّ النسخ (version history) يغطّي التراجع.
    answer: 1
  - q: "أيّ بند ينتمي إلى قائمة فحص الـ components في Steady لأنه يلتقط أكبر عدد من الأخطاء قبل التسليم؟"
    options:
      - text: الـ component يبدو جيدًا بحجمه الافتراضي في الوضع الفاتح.
        why: هناك صُمّم أصلًا، فهو ينجح في الغالب. الأخطاء تكمن عند الأطراف.
      - text: للـ component ظلّ.
        why: الظلال اختيار جمالي، لا فحص جودة.
      - text: الـ component يستخدم أحدث ميزة متاحة في Figma.
        why: الميزات الأحدث ليست تلقائيًا أفضل لمن يستخدمون المجموعة.
      - text: الـ component اختُبر بمحتوى متطرّف، وفي الوضعين الفاتح والداكن، وبأضيق عرض وأعرضه.
        why: صحيح. التسميات الطويلة والوضع الداكن وتغيير الحجم هي حيث تنكسر الـ components، لذا تفرض القائمة هذه الاختبارات.
    answer: 3
---

المجموعة الموجودة في رأسك فقط ليست مجموعة. اختبار صوفيا بسيط: سلّم الملف لمصمّم لم يرَ Steady من قبل، واطلب منه بناء شاشة Settings، وراقب. إذا سأل «أيّ زر أستخدم؟» أو «هل هذا هو التركوازي الحقيقي؟»، فقد فشلت المجموعة، مهما كانت الـ components مصقولة.

هذا الدرس يحوّل القطع من الدروس 3.1 إلى 3.4 إلى شيء يجتاز ذلك الاختبار.

## ما الذي يدخل في مجموعة Steady

ابدأ من الشاشات، لا من قائمة components لدى تطبيقات أخرى. تصفّح شاشات Today وHabit detail وNew habit، وسجّل كل عنصر يظهر أكثر من مرة أو له حالات. هذا الجرد هو المجموعة:

| الـ Component | الـ Variant properties | خصائص أخرى |
|---|---|---|
| Button | Type، State، Size | Label (text)، Show icon (boolean)، Icon (instance swap) |
| Check button | State: To do، Done، Missed | لا يوجد |
| Habit icon | لا يوجد | Glyph (instance swap) |
| Habit row | State: To do، Done، Missed | Name (text)، Show streak (boolean)، Icon (instance swap) |
| Chip | Selected: true، false | Label (text) |
| Text field | State: Default، Focused، Error، Disabled | Label، Hint (text) |
| Tab bar | Active: Today، Stats، Settings | لا يوجد |

سبعة components تغطّي الشاشات الثلاث. قاوم إضافة المزيد حتى تحتاجه شاشة. فكل component تضيفه يجب إبقاؤه متزامنًا مع الـ variables والـ modes والتسمية إلى الأبد.

## هيكلة الملف

ضع المجموعة في ملف مستقل، `Steady Kit`، فيه بضع صفحات:

- **Cover**: اسم المجموعة، ومسؤول عنها، وحالتها ("In progress" أو "Stable")، وتاريخ آخر نشر.
- **Foundations**: عيّنات لكل لون دلالي في الوضعين الفاتح والداكن، وسلّم أحجام الخط، وسلّما المسافات ونصف قطر الزوايا. هذه توثيق بصري للـ variables، فيرى الناس النظام بنظرة واحدة.
- **Components**: ‏section لكل component، يضمّ الـ component set، وبضع instances كأمثلة في استخدام واقعي، وملاحظات استخدام قصيرة بنص عادي ("Use Ghost buttons for low-priority actions next to a Primary").
- **Playground**: مساحة تجارب يجرّب فيها الناس الـ instances دون لمس الـ components.

ويحصل كل component أيضًا على **وصف** في لوحة خصائصه: جملة أو جملتان عن متى يُستخدم، مع رابط إلى توثيق أكمل إن وُجد. يظهر الوصف حين يمرّر الناس المؤشّر فوق الـ component في لوحة Assets، وحين يفحصه المطوّرون في Dev Mode، فيرافق الـ component أينما ذهب.

## قائمة فحص الـ component

قبل أن يُعتبر أي component منتهيًا، يجتاز الفحوص نفسها. كتابتها هي ما يحوّل الذوق الشخصي إلى معيار للفريق:

```text
[ ] Built with auto layout; no hand-placed children
[ ] Every color, spacing and radius bound to a semantic variable
[ ] All states designed: default, pressed, focused, disabled (and error for inputs)
[ ] Checked in Light and Dark modes, contrast re-measured in both
[ ] Tested with extreme content: long label, empty value, larger text
[ ] Resized to its minimum and maximum sensible widths
[ ] Properties and values named by meaning, matching the code where possible
[ ] Description written; usage example placed on the Components page
```

في خطتي Organization وEnterprise، وقت كتابة هذا الدرس، تستطيع ميزة **Check designs** في Figma فحص تحديد ما بحثًا عن قيم مكتوبة يدويًا يجب أن تكون variables، واقتراح بدائل من المكتبة. وفي الخطط الأخرى، حدّد component واقرأ التعبئات وقيم الـ gap والـ padding في الشريط الجانبي الأيمن: رمز hex خام أو رقم غير مرتبط يلفت النظر فورًا.

:::mistake أسماء تنحرف
`Primary button`، و`btn/secondary`، وخاصية اسمها `state` بقيمتين `on` و`Disabled`: كلٌّ منها مقبول وحده، لكنها مجتمعةً مثيرة للجنون. اختر اصطلاحًا، مثل Title Case للـ components والخصائص والقيم، وأصلح التناقضات قبل النشر، لأن إعادة التسمية لاحقًا تكسر كل مرجع اعتاده الناس.
:::

## نشر المكتبة

النشر يجعل الـ components والـ styles والـ variables في المجموعة متاحة للملفات الأخرى في فريقك أو مؤسستك. وقت كتابة هذا الدرس، تنشر من خيارات المكتبة في لوحة Assets، والمكتبات تتطلّب خطة مدفوعة أو خطة Education. كل نشر يطلب وصفًا للتغييرات. اكتبه للشخص الذي سيتلقّاه: "Habit row padding is now 12/16 to match the 8-point scale; no action needed" أفضل من "updates".

:::figure المكتبة تنشر التغييرات؛ والملفات المشتركة تراجعها وتقبلها
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">ملف Steady Kit ينشر إلى مكتبة الفريق. ملفان مشتركان، Steady Screens وSteady Marketing، يتلقّيان إشعارًا بالتحديث ويقبلانه كلٌّ حسب جدوله.</title>
  <rect class="d-box-primary" x="20" y="80" width="160" height="60" rx="12"/>
  <text class="d-label-strong" x="100" y="106" text-anchor="middle">Steady Kit</text>
  <text class="d-label-muted" x="100" y="126" text-anchor="middle">main components</text>
  <path class="d-arrow" d="M182 110 L258 110" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="220" y="100" text-anchor="middle">نشر</text>
  <rect class="d-box" x="260" y="80" width="150" height="60" rx="12"/>
  <text class="d-label" x="335" y="115" text-anchor="middle">مكتبة الفريق</text>
  <path class="d-arrow" d="M412 100 L488 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M412 120 L488 170" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="490" y="22" width="170" height="56" rx="12"/>
  <text class="d-label" x="575" y="46" text-anchor="middle">Steady Screens</text>
  <text class="d-label-muted" x="575" y="66" text-anchor="middle">يراجع ويقبل</text>
  <rect class="d-box-accent" x="490" y="142" width="170" height="56" rx="12"/>
  <text class="d-label" x="575" y="166" text-anchor="middle">Steady Marketing</text>
  <text class="d-label-muted" x="575" y="186" text-anchor="middle">يقبل لاحقًا</text>
</svg>
:::

الملفات التي تستخدم المكتبة ترى أن هناك تحديثات متاحة وتقبلها حين تكون جاهزة، فلا يصل أي تغيير في المجموعة بصمت في منتصف عمل أحدهم. ولهذا أيضًا تستحقّ التغييرات الكاسرة (breaking changes)، مثل إعادة تسمية خاصية، تحذيرًا واضحًا في ملاحظات النشر.

:::tip أدِر نسخ المجموعة كما تُدار نسخ البرمجيات
احتفظ بسجلّ تغييرات (changelog) قصير في صفحة Cover: التاريخ، وما الذي تغيّر، وهل يحتاج أحد إلى فعل شيء. حين يسأل مطوّر «منذ متى صار للـ chip حدّ أدنى للعرض؟»، تستغرق الإجابة عشر ثوانٍ.
:::

اكتمل القسم 3: لدى Steady مجموعة صغيرة موثّقة بثيمات. القسم 4 يجعلها تتحرّك بالـ prototype، ويتأكّد من أن الجميع يستطيع استخدامها، ويضعها في أيدي المطوّرين.
