---
summary: اصنع prototype لمسار تسجيل العادة في Steady بالـ triggers والـ actions والحركات، واجعل زر التعليم interactive component، وافتح لوحة New habit كـ overlay، واستخدم Smart animate بشكل صحيح.
takeaways:
  - كل تفاعل في الـ prototype هو trigger (مثل On tap) مع action (مثل Navigate to أو Open overlay) مع حركة (animation).
  - الـ Interactive components تضع التفاعلات بين الـ variants داخل الـ component نفسه، فتتبدّل كل instance من زر التعليم وحدها.
  - الـ Overlays تعرض محتوى مثل اللوحة السفلية فوق الشاشة الحالية، مع إعدادات للموضع والإغلاق عند النقر خارجها والخلفية.
  - الـ Smart animate يطابق الطبقات بالاسم والموضع في شجرة الطبقات، ثم يحرّك الموضع والحجم والدوران والشفافية والتعبئة بينها.
  - اصنع prototype للّحظات التي تحتاج إلى اختبارها أو شرحها، لا لكل شاشة، وأبقِ كل مسار قصيرًا بما يكفي لإنهائه في دقيقة.
further:
  - title: Guide to prototyping in Figma
    url: https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma
  - title: Prototype triggers
    url: https://help.figma.com/hc/en-us/articles/360040035834-Prototype-triggers
  - title: Smart animate layers between frames
    url: https://help.figma.com/hc/en-us/articles/360039818874-Smart-animate-layers-between-frames
  - title: Create overlays in your prototypes
    url: https://help.figma.com/hc/en-us/articles/360039818254-Create-overlays-in-your-prototypes
quiz:
  - q: تريد أن يتبدّل زر التعليم في كل صف عادة بين To do وDone في الـ prototype، في كل شاشة. ما الإعداد الأكفأ؟
    options:
      - text: ارسم وصلة من كل زر تعليم في كل شاشة إلى نسخة من تلك الشاشة يكون فيها الزر معلَّمًا.
        why: هذا يحتاج شاشة جديدة لكل تركيبة من الصفوف المعلَّمة، وينفجر العدد بسرعة.
      - text: أضف تفاعل On tap مع Change to ‏Done بين الـ variants داخل الـ component set الخاص بـ Check button.
        why: صحيح. التفاعلات داخل الـ component تجعل كل instance تفاعلية، دون شاشات إضافية.
      - text: استخدم After delay لتصبح الأزرار معلَّمة تلقائيًا.
        why: المختبِرون يحتاجون إلى النقر. التغيير الموقوت لا يختبر هل يجد الناس الزر.
      - text: صدّر الشاشات وأضف التفاعلات في محرّر فيديو.
        why: الفيديو لا يستجيب للنقرات، فتخسر ما يجعل الـ prototype مفيدًا.
    answer: 1
  - q: "يجب أن تنزلق لوحة New habit من الأسفل فوق شاشة Today وأن تُغلق حين ينقر أحدهم على المنطقة المعتمة. أيّ إعداد يناسب؟"
    options:
      - text: Navigate to إلى نسخة من Today مرسومة عليها اللوحة، باستخدام Instant.
        why: تبدو مشابهة، لكن لا يمكن إغلاق اللوحة بالنقر خارجها، وستضطرّ إلى صيانة شاشة Today ثانية.
      - text: Scroll to إلى موضع اللوحة في frame طويل لشاشة Today.
        why: التمرير سيحرّك الشاشة كلها، لا أن يزلق لوحة فوقها.
      - text: Open overlay مع frame اللوحة، في موضع أسفل المنتصف، مع خلفية خلفها وتفعيل الإغلاق عند النقر خارجها.
        why: صحيح. هذا بالضبط ما وُجدت الـ overlays من أجله، والإعدادات محفوظة على الـ overlay فتعيد استخدامها كل وصلة.
      - text: Change to إلى variant من frame شاشة Today.
        why: Change to يعمل على variants الـ components، وشاشة Today ‏frame لا component set.
    answer: 2
  - q: في الـ frame الأول شارة الـ streak مخفية بأيقونة العين. وفي الثاني ظاهرة. الـ Smart animate يجعلها تظهر فجأة بدل أن تظهر تدريجيًا. ما الإصلاح؟
    options:
      - text: زيادة المدّة إلى 2,000 ms.
        why: المدّة الأطول لا تفيد حين لا يوجد تغيير قابل للتحريك. الظهور يتبدّل فورًا.
      - text: تغيير الحركة إلى Dissolve.
        why: ‏Dissolve يُخفت الـ frame كله، لا الشارة وحدها.
      - text: إعادة تسمية الشارة في الـ frame الثاني.
        why: الأسماء المختلفة ستمنع الـ Smart animate من مطابقتها أصلًا. يجب أن تكون الأسماء متطابقة.
      - text: إبقاء الشارة ظاهرة في الـ frame-ين وضبط شفافيتها على 0% في الأول.
        why: صحيح. الـ Smart animate يحرّك قيم الشفافية، لكن الطبقة المخفية ليس لها شفافية يبدأ منها.
    answer: 3
---

النموذج الثابت يُظهر شكل Steady. أما الـ prototype (النموذج التفاعلي) فيُظهر إحساسه: هل يعطي النقر على زر التعليم استجابة مُرضية، وهل تأتي لوحة New habit من حيث يتوقّع الناس، وهل يستطيع أحدهم إيجاد طريق العودة؟ اختبار هذه الأسئلة بـ prototype يكلّف بضع ساعات. واختبارها بعد التطوير يكلّف sprint كاملًا.

## التفاعلات: trigger وaction وحركة

بدّل الشريط الجانبي الأيمن إلى تبويب **Prototype**. حدّد طبقة، واسحب مقبض الوصلة الذي يظهر إلى frame وجهة، فتكون قد أنشأت **تفاعلًا (interaction)**. لكل تفاعل ثلاثة أجزاء.

الـ **trigger** هو ما يفعله الشخص. وقت كتابة هذا الدرس، تشمل الـ triggers ‏On click/On tap وOn drag وWhile hovering وWhile pressing وKey/Gamepad وMouse enter وMouse leave وMouse down وMouse up وAfter delay. في تطبيق الهاتف تستخدم غالبًا On tap، إضافة إلى On drag لإيماءات السحب.

الـ **action** هو ما يحدث. أشيعها **Navigate to** إلى frame آخر، و**Back**، و**Change to** إلى variant آخر من component، و**Open overlay**، و**Swap overlay**، و**Close overlay**، و**Scroll to**. والـ prototypes المتقدّمة يمكنها أيضًا ضبط variables واستخدام الشروط، وهذا يعتمد على الخطة.

الـ **animation** هي طريقة الحركة: Instant، أو Dissolve، أو Smart animate، أو الحركات الاتّجاهية مثل Move in وPush وSlide in، ولكلٍّ منها easing ومدّة. في Steady، الأقصر والأهدأ هو الأفضل: Smart animate أو Push، مع Ease out، لمدّة بين 250 و300 ms أو نحو ذلك.

هذا مسار تسجيل العادة الذي ستبنيه:

:::figure مسار الـ prototype لتسجيل العادة في Steady
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">شاشة Today هي نقطة البداية. النقر على زر التعليم يغيّر الصف إلى Done داخل الـ component. والنقر على زر الإضافة يفتح لوحة New habit كـ overlay، وSave يغلقها. والنقر على صف ينتقل إلى Habit detail، وBack يعيد إلى Today.</title>
  <rect class="d-box-primary" x="250" y="90" width="180" height="70" rx="14"/>
  <text class="d-label-strong" x="340" y="122" text-anchor="middle">Today</text>
  <text class="d-label-muted" x="340" y="144" text-anchor="middle">نقطة بداية المسار</text>
  <rect class="d-box-success" x="20" y="20" width="180" height="56" rx="12"/>
  <text class="d-label" x="110" y="45" text-anchor="middle">الصف: Done</text>
  <text class="d-label-muted" x="110" y="64" text-anchor="middle">Change to (في الـ component)</text>
  <path class="d-arrow" d="M250 105 L202 66" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="480" y="20" width="180" height="56" rx="12"/>
  <text class="d-label" x="570" y="45" text-anchor="middle">لوحة New habit</text>
  <text class="d-label-muted" x="570" y="64" text-anchor="middle">Open overlay</text>
  <path class="d-arrow" d="M430 105 L478 66" marker-end="url(#arrow)"/>
  <rect class="d-box" x="250" y="200" width="180" height="50" rx="12"/>
  <text class="d-label" x="340" y="230" text-anchor="middle">Habit detail</text>
  <path class="d-arrow" d="M320 160 L320 198" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M360 198 L360 162" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="300" y="184" text-anchor="end">نقر الصف: Push</text>
  <text class="d-label-muted" x="380" y="184">Back</text>
  <path class="d-arrow d-dashed" d="M520 78 L430 128" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="560" y="110">Save: ‏Close overlay</text>
</svg>
:::

## الـ Interactive components: زر التعليم

يمكنك رسم وصلة من كل زر تعليم إلى نسخة من الشاشة يكون فيها ذلك الصف معلَّمًا. مع خمس عادات، هذه 32 تركيبة من الشاشات. بدلًا من ذلك، افتح الـ component set الخاص بـ **Check button** وأضف التفاعل *بين الـ variants الخاصة به*: على الـ variant ‏To do، ‏On tap، ثم **Change to** ‏Done، مع Smart animate لمدّة 200 ms. وأضف العكس على Done.

الآن كل instance من زر التعليم، في كل شاشة، تتبدّل وحدها حين تُنقر في الـ prototype. هذا **interactive component**، ولهذا تؤتي الـ variants المتقنة من الدرس 3.2 ثمارها مرّتين.

## الـ Overlays: لوحة New habit

زر الإضافة يفتح لوحة New habit، التي تنزلق إلى الأعلى فوق Today بدل أن تحلّ محلّها. صِل زر الإضافة بـ frame اللوحة باستخدام **Open overlay**. في إعدادات الـ overlay، اختر موضعًا أسفل المنتصف، وفعّل الإغلاق عند النقر خارجها، وأضف خلفية خلف الـ overlay (لون داكن بشفافية نحو 40% يعتّم الشاشة). واستخدم حركة Move in من الأسفل.

إعدادات الـ overlay تخصّ frame الـ overlay، لا الوصلة، فتعيد استخدامها كل الأزرار التي تفتح اللوحة. وداخل اللوحة، صِل Save habit وCancel بـ **Close overlay**.

## الـ Smart animate: مطابقة الطبقات

ينظر الـ Smart animate إلى frame-ين، ويجد الطبقات المتطابقة، ويحرّك الاختلافات. تتطابق الطبقة حين يكون لها **الاسم نفسه** وتقع في **الموضع نفسه من شجرة الطبقات** في الـ frame-ين. ويمكنه تحريك الموضع والحجم والدوران والشفافية والتعبئة.

لاحتفال الـ streak في Habit detail، كرّر الـ frame (التكرار يُبقي الأسماء متطابقة)، ثم في الـ frame الثاني كبّر رقم الـ streak وأظهر تدريجيًا شارة "New best!". صِل بينهما بـ Smart animate، مع Ease out، لمدّة 300 ms.

:::mistake الطبقات المخفية والطبقات المعاد تسميتها
لا يستطيع الـ Smart animate إظهار طبقة مخفية بأيقونة العين تدريجيًا؛ فلا توجد شفافية يبدأ منها. أبقِ الشارة ظاهرة واضبط شفافيتها على 0% في الـ frame الأول. وإذا أعدت تسمية الشارة إلى `Badge copy` في أحد الـ frame-ين أو نقلتها إلى group آخر، فسيرى الـ Smart animate طبقتين لا علاقة بينهما، وستظهر الشارة فجأة. الطبقات المسمّاة من الدرس 1.4 هي ما يجعل هذا يعمل.
:::

## العرض والتمرير

اجعل Today نقطة بداية للمسار (flow starting point) واضغط زر التشغيل لتعرض الـ prototype. في قائمة طويلة، اضبط frame المحتوى على التمرير العمودي وأبقِ شريط التبويبات ثابتًا في مكانه، وكلاهما من تبويب Prototype وقت كتابة هذا الدرس. اختبر على هاتف حقيقي بتطبيق Figma للجوّال؛ فحركة مدّتها 300 ms تبدو بطيئة على الشاشة الكبيرة كثيرًا ما تبدو مناسبة في اليد.

:::tip اصنع prototype للسؤال لا للتطبيق
قبل أن تنشئ أي وصلة، اكتب ما تريد أن تتعلّمه: «هل يجد الناس زر الإضافة؟» أو «هل تسجيل العادة مُرضٍ؟». اصنع prototype للشاشات التي تجيب عن السؤال ولا شيء غيرها. الـ prototype المركّز من خمس شاشات يحصد ملاحظات أفضل من متاهة من أربعين شاشة.
:::

في الدرس التالي تتأكّد من أن الشاشات التي حرّكتها للتوّ تعمل للجميع، بمن فيهم من لا يرون التركوازي، ومن لا يستطيعون النقر على أهداف صغيرة، ومن يستخدمون قارئ الشاشة (screen reader).
