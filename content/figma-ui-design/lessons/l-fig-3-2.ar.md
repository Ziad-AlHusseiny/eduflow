---
summary: اجمع الـ components المترابطة في variant set بأسماء خصائص واضحة، ثم أضف خصائص من نوع boolean وtext وinstance swap ليبقى زر Steady وصف العادة فيه صغيرين وسهلي الاستخدام.
takeaways:
  - الـ Variants تجمع نسخ الـ component في component set واحد، وتصفها خصائص مثل Type وState.
  - استخدم الـ variants للاختلافات التي تعيد تنسيق عدّة طبقات دفعة واحدة، مثل الحالات والأنواع والأحجام.
  - استخدم خاصية boolean للإظهار والإخفاء، وخاصية text للتسميات القابلة للتعديل، وخاصية instance swap لاختيار component متداخل.
  - كل variant property تضاعف عدد الـ variants، بينما خصائص boolean وtext وinstance swap لا تفعل ذلك.
  - الـ Slots، وقت كتابة هذا الدرس، تعلّم مناطق في الـ component يمكن للـ instances أن تضع فيها محتوى حرًّا دون فصل.
further:
  - title: Create and use variants
    url: https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants
  - title: Explore component properties
    url: https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties
  - title: The difference between slots, instance swaps, and variants
    url: https://help.figma.com/hc/en-us/articles/38741465279895-The-difference-between-slots-instance-swaps-and-variants
quiz:
  - q: "لزر Steady ثلاث variant properties: ‏Type ‏(Primary, Secondary, Ghost) وState ‏(Default, Pressed, Disabled) وSize ‏(Medium, Small). يريد زميلك إضافة \"with icon\" و\"without icon\" كـ variant property أخرى. كم variant سينتج عن ذلك، وما البديل؟"
    options:
      - text: 36 variant. وخاصية boolean للأيقونة تُبقي العدد عند 18.
        why: صحيح. ‏3 × 3 × 2 = 18، وvariant property بقيمتين تضاعف العدد. أما الـ boolean فيُظهر طبقة الأيقونة أو يخفيها دون variants جديدة.
      - text: 20 variant. ولا يوجد بديل.
        why: الـ variant properties تتضاعف ولا تُجمع. والـ booleans موجودة تحديدًا للإظهار والإخفاء.
      - text: 18 variant. لأن Figma يدمج التخطيطات المكرّرة تلقائيًا.
        why: لا يدمج Figma الـ variants أبدًا. كل تركيبة variant منفصل عليك صيانته.
      - text: 36 variant. وخاصية instance swap تُبقي العدد عند 18.
        why: العدد صحيح، لكن الـ instance swap يختار أيّ أيقونة، لا هل تظهر. الظهور مهمّة الـ boolean.
    answer: 0
  - q: أيّ نوع من الخصائص يناسب اسم العادة في الـ component ‏Habit row؟
    options:
      - text: variant property بقيمة لكل عادة.
        why: أسماء العادات محتوى غير محدود يكتبه المستخدم. الـ variants لمجموعة صغيرة ثابتة من النسخ المصمّمة.
      - text: خاصية boolean.
        why: الـ booleans تُظهر الطبقة أو تخفيها فقط. لا يمكنها حمل محتوى نصي.
      - text: خاصية text، ليمكن تعديل الاسم من لوحة الخصائص أو على لوحة العمل.
        why: صحيح. خاصية text تكشف النص فيستطيع الناس تغييره دون البحث في الطبقات.
      - text: خاصية instance swap.
        why: الـ instance swap يختار component متداخلًا. الاسم نص عادي، لا component.
    answer: 2
  - q: متى يجب أن يكون الاختلاف variant بدل boolean؟
    options:
      - text: حين يُستخدم في أكثر من ثلاث شاشات.
        why: عدد مرّات الاستخدام لا يحدّد نوع الخاصية. طبيعة التغيير هي التي تحدّده.
      - text: حين يعيد الاختلاف تنسيق عدّة طبقات معًا، مثل حالة Pressed التي تغيّر التعبئة ولون التسمية والظل.
        why: صحيح. الـ booleans تبدّل ظهور طبقة واحدة فقط. أما التغييرات البصرية المنسّقة فتحتاج variant مصمّمًا.
      - text: حين يطلب المطوّر enum.
        why: رأي المطوّر قيّم، لكن السبب التصميمي هو عدد الطبقات التي تتغيّر وكيفية تغيّرها.
      - text: دائمًا، لأن الـ variants أحدث من الـ booleans.
        why: الـ variants ليست أحدث، واعتمادها افتراضيًا يسبّب انفجار الـ variants.
    answer: 1
  - q: يجب أن يحمل الـ component الخاص بلوحة New habit محتوى مختلفًا في مسارات مختلفة (نموذج، تأكيد، شبكة أيقونات). ما الأنسب وقت كتابة هذا الدرس؟
    options:
      - text: variant لكل محتوى ممكن.
        why: كل مسار جديد سيحتاج variant جديدًا، وستكبر المجموعة بلا نهاية.
      - text: فصل اللوحة في كل استخدام.
        why: اللوحات المفصولة يفوتها كل إصلاح مستقبلي لترويسة اللوحة ومقبضها والـ padding فيها.
      - text: boolean لكل عنصر قد يظهر.
        why: الـ booleans لا تستطيع إلا إخفاء طبقات موجودة أصلًا، فستحمل اللوحة كل عنصر ممكن.
      - text: slot لجسم اللوحة، فتحمل كل instance محتواها الخاص بينما يبقى إطار اللوحة مرتبطًا.
        why: صحيح. الـ slots موجودة لهذا بالضبط، أي منطقة محتوى مرنة داخل component مرتبط.
    answer: 3
---

يبدو الزر الأساسي في Steady بسيطًا حتى تكتب قائمة بما يحتاجه: أنواع primary وsecondary وghost؛ وحالات default وpressed وdisabled؛ وحجمان medium وsmall؛ وأيقونة اختيارية؛ وأي تسمية. ابنِ كلًّا من ذلك كـ component منفصل وستحصل على عشرات النسخ شبه المتطابقة، ومصمّم يختار بين `Button Primary Small Disabled With Icon` وجيرانه.

الـ Variants والـ Component properties تحوّل هذه الكومة إلى component واحد ببضعة مفاتيح واضحة.

## الـ Variants: مجموعة واحدة، نسخ كثيرة

الـ **component set** يحمل components مترابطة تُسمّى **variants**. كل variant تصفه **variant properties**، تُكتب كأزواج `Property=Value`. لزر Steady:

- `Type`: ‏Primary وSecondary وGhost
- `State`: ‏Default وPressed وDisabled
- `Size`: ‏Medium وSmall

تنشئ الـ variants إمّا بتحديد عدّة components موجودة والنقر على **Combine as variants**، أو بتحديد component وإضافة variant من الشريط الجانبي الأيمن، ثم إعادة تسمية الخصائص والقيم. يعتبر Figma الـ variant الموجود في الزاوية العلوية اليسرى من المجموعة هو الافتراضي.

في الـ instance، لا يعود الناس يبحثون في الـ assets. يضعون Button واحدًا ويختارون القيم من قوائم منسدلة: Type ‏Secondary، وState ‏Disabled. الأسماء التي تختارها هنا هي الأسماء التي سيراها المطوّرون في Dev Mode، فاجعلها تطابق الكود حيث تستطيع. إذا كان الكود يقول `variant="secondary"`، ففكّر في تسمية خاصيتك `Variant` بدل `Type`، واتّفق على ذلك مع فريق الهندسة مبكرًا.

:::figure الـ component set لزر Steady: كل تركيبات Type وState لحجم واحد
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">شبكة ثلاثة في ثلاثة من variants الزر. الأعمدة هي الحالات Default وPressed وDisabled؛ والصفوف هي الأنواع Primary وSecondary وGhost. ويحيط إطار متقطّع بالمجموعة كلها.</title>
  <rect class="d-box d-dashed" x="110" y="30" width="560" height="220" rx="12"/>
  <text class="d-label-muted" x="210" y="22" text-anchor="middle">Default</text>
  <text class="d-label-muted" x="390" y="22" text-anchor="middle">Pressed</text>
  <text class="d-label-muted" x="570" y="22" text-anchor="middle">Disabled</text>
  <text class="d-label-muted" x="100" y="80" text-anchor="end">Primary</text>
  <text class="d-label-muted" x="100" y="150" text-anchor="end">Secondary</text>
  <text class="d-label-muted" x="100" y="220" text-anchor="end">Ghost</text>
  <rect class="d-box-primary" x="140" y="56" width="140" height="40" rx="10"/>
  <text class="d-label-strong" x="210" y="81" text-anchor="middle">Save habit</text>
  <rect class="d-box-primary" x="320" y="56" width="140" height="40" rx="10"/>
  <text class="d-label-strong" x="390" y="81" text-anchor="middle">Save habit</text>
  <rect class="d-box" x="500" y="56" width="140" height="40" rx="10"/>
  <text class="d-label-muted" x="570" y="81" text-anchor="middle">Save habit</text>
  <rect class="d-box-accent" x="140" y="126" width="140" height="40" rx="10"/>
  <text class="d-label" x="210" y="151" text-anchor="middle">Save habit</text>
  <rect class="d-box-accent" x="320" y="126" width="140" height="40" rx="10"/>
  <text class="d-label" x="390" y="151" text-anchor="middle">Save habit</text>
  <rect class="d-box" x="500" y="126" width="140" height="40" rx="10"/>
  <text class="d-label-muted" x="570" y="151" text-anchor="middle">Save habit</text>
  <text class="d-label" x="210" y="221" text-anchor="middle">Save habit</text>
  <rect class="d-box" x="320" y="196" width="140" height="40" rx="10"/>
  <text class="d-label" x="390" y="221" text-anchor="middle">Save habit</text>
  <text class="d-label-muted" x="570" y="221" text-anchor="middle">Save habit</text>
</svg>
:::

## الـ Component properties: مفاتيح بلا مضاعفة

الـ variant properties تتضاعف. ثلاثة أنواع × ثلاث حالات × حجمان = 18 variant. أضف variant property باسم `Icon` بقيمتين فيصبح العدد 36، وكل واحد منها يجب بناؤه وإبقاؤه متزامنًا. هذا يُسمّى انفجار الـ variants ‏(variant explosion)، وهو أشيع طريقة تصبح بها أنظمة التصميم غير قابلة للصيانة.

الـ Component properties تتولّى الاختلافات التي لا تحتاج نسخة مصمّمة بشكل منفصل:

- **Boolean**: يُظهر طبقة أو يخفيها. `Show icon` ‏true أو false. طبقة واحدة، بلا variants جديدة.
- **Text**: يكشف محتوى طبقة نص. `Label` = "Save habit". يعدّله الناس من لوحة الخصائص دون البحث عن الطبقة.
- **Instance swap**: يختار أيّ component يملأ instance متداخلة. `Icon` = Plus أو Check أو Bell. ويمكنك ضبط **preferred values**، أي قائمة قصيرة من الأيقونات المعقولة، حتى لا يضع أحد سلّة مهملات على زر الحفظ.
- **Slot**: وقت كتابة هذا الدرس، نوع خاصية أحدث يعلّم منطقة يمكن للـ instances أن تحمل فيها محتواها الخاص، مثل جسم اللوحة السفلية، بينما يبقى كل ما حولها مرتبطًا.

تضيف هذه الخصائص على الـ main component: حدّد الطبقة، ثم استخدم خيار الخاصية بجانب ظهورها (boolean)، أو محتواها النصي (text)، أو الـ instance المتداخلة فيها (instance swap) في الشريط الجانبي الأيمن، أو أنشئ خاصية من قسم الخصائص واربطها بطبقة.

:::tip السؤال الحاسم
اسأل: *هل يعيد هذا الاختلاف تنسيق عدّة طبقات معًا؟* الزر المضغوط يغيّر التعبئة ولون التسمية وربما الظل دفعة واحدة، لذا فالـ State ‏variant. إظهار أيقونة يغيّر ظهور طبقة واحدة، فهو boolean. وأيّ أيقونة هو instance swap. وما تقوله التسمية هو text.
:::

## ترتيب البناء مهم

أضف خصائص text وboolean وinstance swap إلى الـ component الأول **قبل** أن تضيف المزيد من الـ variants. الـ variants الجديدة المنشأة منه ترث روابط تلك الخصائص. إذا بنيت 18 variant أولًا، فستربط طبقة التسمية 18 مرة.

صف العادة يُعامَل بالطريقة نفسها:

```text
Habit row (component set)
  State      variant        To do | Done | Missed
  Name       text           "Read 20 pages"
  Show streak boolean       true
  Icon       instance swap  Habit icon/Book  (preferred: Book, Water, Run, Sleep)
```

ثلاثة variants بدل العشرات، لأن Done وMissed يعيدان تنسيق عدّة طبقات (تعبئة زر التعليم، ولون الاسم، وخط يتوسّطه) بينما كل ما عدا ذلك خاصية.

حين يضمّ component ‏components أخرى، يضطرّ الناس عادةً إلى التعمّق في الطبقات للوصول إلى خصائص الداخلية منها. وقت كتابة هذا الدرس، يستطيع صانع الـ component ‏**كشف الـ instances المتداخلة** (expose nested instances)، فتظهر خصائص Check button نفسها بجانب خصائص Habit row في اللوحة.

:::mistake تسمية القيم حسب المظهر
`State=Teal` و`State=Grey` منطقيتان اليوم ومضلّلتان غدًا حين يتغيّر لون العلامة التجارية. سمِّ القيم حسب المعنى، `Done` و`To do`، فتصمد الأسماء أمام إعادة التصميم وتطابق ما يسمّيها به الكود.
:::

صار في مجموعتك عدد قليل من الـ components المرنة. لكن ألوانها وأرقامها ما زالت تُكتب يدويًا. في الدرس التالي تنقل هذه القيم إلى الـ styles والـ variables.
