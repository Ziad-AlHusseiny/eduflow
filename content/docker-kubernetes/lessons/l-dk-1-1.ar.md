---
kind: intro
summary: اشرح ما هو الـ container فعلًا (عملية Linux عادية مع namespaces وcgroups ونظام ملفات قادم من image)، وكيف ترتبط الـ images بالـ containers.
takeaways:
  - الـ container عملية Linux عادية، تعزلها النواة بالـ namespaces وتحدّ مواردها بالـ cgroups.
  - تتشارك الـ containers نواة المضيف، ولهذا تبدأ خلال أجزاء من الثانية، ولهذا أيضًا يكون عزلها أضعف من عزل الآلة الافتراضية.
  - الـ image قالب للقراءة فقط مكوّن من layers لنظام الملفات مع بيانات وصفية؛ والـ container نسخة واحدة قيد التشغيل منها، فوقها layer رقيقة قابلة للكتابة.
  - كل ما يكتبه الـ container في نظام ملفاته الخاص يختفي عند حذف الـ container، إلا إذا وضعته في volume.
further:
  - title: What is a container?
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
  - title: What is an image?
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
  - title: Kubernetes Overview
    url: https://kubernetes.io/docs/concepts/overview/
quiz:
  - q: تشغّل الأمر `ps aux` على مضيف Linux بينما يشغّل container خادم Node.js. ماذا ترى؟
    options:
      - text: لا شيء، لأن الـ container يعمل داخل آلة افتراضية صغيرة خاصة به.
        why: لا يشغّل Docker على Linux آلة افتراضية لكل container. صحيح أن Docker Desktop على macOS وWindows يشغّل آلة Linux افتراضية واحدة مشتركة، لكن الـ containers داخلها تبقى عمليات عادية.
      - text: عملية `dockerd` فقط، وخادم Node.js مخفيّ بداخلها.
        why: الـ daemon يُطلق الـ containers لكنه لا يحتضنها. عملية الـ container لها سطرها المستقل في جدول عمليات المضيف.
      - text: عملية `node` تظهر في القائمة مثل أي عملية أخرى على المضيف.
        why: صحيح. الـ container عملية على المضيف. الـ namespaces تخفي بقية المضيف عنها، لا العكس.
      - text: نسخة من نظام التشغيل الكامل للـ container تُقلع في الخلفية.
        why: الـ containers لا تُقلع نظام تشغيل. إنها تعيد استخدام نواة المضيف ولا تشغّل إلا الأمر الذي طلبته.
    answer: 2
  - q: أي ميزة في النواة تمنع container خرج عن السيطرة من استهلاك كل ذاكرة المضيف؟
    options:
      - text: مجموعات التحكّم (cgroups)، التي تضع سقفًا لاستهلاك المعالج والذاكرة والإدخال والإخراج وتحسبه.
        why: صحيح. الـ cgroups تفرض حدود الموارد، وستجد لاحقًا في الدورة أن الـ limits في Kubernetes تُترجَم في النهاية إلى هذه الإعدادات نفسها.
      - text: الـ PID namespace، التي تعطي الـ container شجرة عمليات خاصة به.
        why: الـ namespaces تتحكّم فيما تراه العملية، لا في مقدار ما تستهلكه. عملية في PID namespace خاصة بها تستطيع مع ذلك التهام كل بايت من الذاكرة.
      - text: الـ layers المخصّصة للقراءة فقط في الـ image، لأنها لا تكبر أثناء التشغيل.
        why: الـ layers المخصّصة للقراءة فقط تحدّ ما على القرص، لا استهلاك الذاكرة. العملية تحجز الذاكرة بغضّ النظر عن طريقة تخزين ملفاتها.
      - text: الـ layer القابلة للكتابة في الـ container، لأن حجمها مضبوط على حدّ الذاكرة.
        why: الـ layer القابلة للكتابة مساحة على القرص لتغييرات الملفات، ولا علاقة لها بالذاكرة.
    answer: 0
  - q: تشغّل ثلاثة containers من الـ image ‏`notes-api:1.0.0`. يكتب أحدها ملفًا في `/tmp/cache.json`. ماذا يرى الاثنان الآخران؟
    options:
      - text: الملف الجديد، لأن الثلاثة تتشارك نظام ملفات الـ image.
        why: إنها تتشارك layers الـ image المخصّصة للقراءة فقط، لكن كل container يكتب في layer خاصة به قابلة للكتابة.
      - text: الملف الجديد بعد إعادة التشغيل، حين يزامن Docker الـ layers.
        why: لا يزامن Docker أبدًا الـ layers القابلة للكتابة بين الـ containers. هذا بالضبط دور الـ volumes.
      - text: خطأ، لأن أنظمة ملفات الـ images للقراءة فقط.
        why: يحصل كل container على layer قابلة للكتابة فوق الـ image، فتنجح الكتابة؛ لكنها خاصة ومؤقتة.
      - text: لا شيء جديد؛ الملف موجود فقط في الـ layer القابلة للكتابة لذلك الـ container وحده.
        why: صحيح. كل container نسخة لها layer رقيقة قابلة للكتابة خاصة بها. احذف الـ container فيختفي الملف معه.
    answer: 3
  - q: لماذا يُعدّ الـ container حدًّا أمنيًا أضعف من الآلة الافتراضية؟
    options:
      - text: لأن الـ containers لا تستطيع تقييد الوصول إلى الشبكة إطلاقًا.
        why: الـ network namespaces تعطي كل container حزمة شبكة خاصة به، ويمكنك تقييدها أكثر. الشبكة ليست هي الثغرة.
      - text: لأن كل الـ containers على المضيف تتشارك نواة واحدة، فثغرة في النواة قد تعبر بينها.
        why: صحيح. للآلة الافتراضية نواتها الخاصة خلف الـ hypervisor، أما الـ container فيتحدّث مباشرة مع نواة المضيف. هذا ثمن البدء خلال أجزاء من الثانية.
      - text: لأن الـ images لا يمكن توقيعها أو التحقّق منها.
        why: يمكن توقيع الـ images وتثبيتها بالـ digest؛ لكن هذا من أمن سلسلة توريد الـ images، وليس حدًّا للعزل.
      - text: لأن الـ containers تعمل دائمًا كمستخدم root على المضيف.
        why: كثير منها يفعل ذلك افتراضيًا، وهذا سيئ، لكنك تستطيع، بل يجب، أن تشغّلها كمستخدم غير root. الفرق البنيوي هو النواة المشتركة.
    answer: 1
---

في الساعة 2:40 فجرًا ذات ليلة، بدأت إحدى خدمات Skylane تفشل في فحوص الصحة على كل الـ nodes دفعة واحدة، مع أن الكود لم يتغيّر. تبيّن أن مكتبة أساسية على خادم البناء رُقّيت بصمت، فلم يعد البرنامج الذي شحنّاه مطابقًا للبرنامج الذي اختبرناه. وُجدت الـ containers (الحاويات) لتضع حدًّا لمثل هذه الليالي: تشحن البرنامج *ومعه* كل ما يحتاج إليه في حزمة واحدة، فيكون ما اختبرته هو نفسه ما يعمل.

أنا Amara Diallo. أتولّى المناوبة (on-call) على الـ clusters في Skylane، وكل ما في هذه الدورة إمّا شيء كسرته بنفسي أو شيء رأيته ينكسر أمامي. سنعمل على خدمة واحدة من البداية إلى النهاية.

## المشروع: notes-api

notes-api واجهة HTTP API صغيرة لإدارة الملاحظات، مكتوب بـ TypeScript ويعمل على Node.js 24. يخزّن بياناته في Postgres ويعرض أربعة مسارات: `GET /notes` و`POST /notes` و`GET /healthz` (هل العملية حيّة؟) و`GET /readyz` (هل تصل إلى قاعدة البيانات؟). يستمع على المنفذ (port) 3000، ويقرأ إعداداته من متغيّرات البيئة مثل `DATABASE_URL`.

بنهاية الدورة ستكون قد بنيت الـ image الخاصة به، وشغّلته مع Postgres على جهازك، ونشرته على Kubernetes مع فحوص الصحة والتوسّع التلقائي وخطة للتراجع.

## الـ container عملية

لا يوجد داخل نواة Linux كائن اسمه «container». حين تشغّل container، يبدأ الـ runtime عملية عادية ويغلّفها بثلاثة أشياء:

- **الـ Namespaces** تغيّر ما تستطيع العملية *رؤيته*: شجرة عمليات خاصة بها (تطبيقك هو PID 1)، وواجهات شبكة خاصة، واسم مضيف خاص، ورؤية خاصة لأنظمة الملفات المركّبة.
- **مجموعات التحكّم (cgroups)** تحدّ ما تستطيع *استهلاكه*: وقت المعالج، والذاكرة، والإدخال والإخراج.
- **الـ image (صورة الحاوية)** تقدّم نظام الملفات الجذري: ملف Node.js التنفيذي، وكودك المترجَم، و`node_modules`، وبعض مكتبات النظام.

:::figure الـ Containers تتشارك نواة واحدة، وكل آلة افتراضية تأتي بنواتها
<svg viewBox="0 0 680 300" role="img" aria-labelledby="t1">
  <title id="t1">إلى اليسار: ثلاث آلات افتراضية، لكل منها نواة ضيف خاصة فوق الـ hypervisor. إلى اليمين: ثلاثة containers، كل منها عملية معزولة، تتشارك نواة المضيف مباشرة.</title>
  <text class="d-label-strong" x="170" y="24" text-anchor="middle">آلات افتراضية</text>
  <text class="d-label-strong" x="510" y="24" text-anchor="middle">Containers</text>
  <rect class="d-box-accent" x="20" y="40" width="92" height="56" rx="8"/>
  <text class="d-label" x="66" y="73" text-anchor="middle">تطبيق</text>
  <rect class="d-box-accent" x="124" y="40" width="92" height="56" rx="8"/>
  <text class="d-label" x="170" y="73" text-anchor="middle">تطبيق</text>
  <rect class="d-box-accent" x="228" y="40" width="92" height="56" rx="8"/>
  <text class="d-label" x="274" y="73" text-anchor="middle">تطبيق</text>
  <rect class="d-box-warn" x="20" y="104" width="92" height="44" rx="8"/>
  <text class="d-label" x="66" y="131" text-anchor="middle">نظام ضيف</text>
  <rect class="d-box-warn" x="124" y="104" width="92" height="44" rx="8"/>
  <text class="d-label" x="170" y="131" text-anchor="middle">نظام ضيف</text>
  <rect class="d-box-warn" x="228" y="104" width="92" height="44" rx="8"/>
  <text class="d-label" x="274" y="131" text-anchor="middle">نظام ضيف</text>
  <rect class="d-box" x="20" y="158" width="300" height="44" rx="8"/>
  <text class="d-label" x="170" y="185" text-anchor="middle">hypervisor</text>
  <rect class="d-box" x="20" y="212" width="300" height="44" rx="8"/>
  <text class="d-label" x="170" y="239" text-anchor="middle">نواة المضيف + العتاد</text>
  <rect class="d-box-primary" x="360" y="40" width="92" height="108" rx="8"/>
  <text class="d-label" x="406" y="88" text-anchor="middle">عملية</text>
  <text class="d-label-muted" x="406" y="108" text-anchor="middle">+ image</text>
  <rect class="d-box-primary" x="464" y="40" width="92" height="108" rx="8"/>
  <text class="d-label" x="510" y="88" text-anchor="middle">عملية</text>
  <text class="d-label-muted" x="510" y="108" text-anchor="middle">+ image</text>
  <rect class="d-box-primary" x="568" y="40" width="92" height="108" rx="8"/>
  <text class="d-label" x="614" y="88" text-anchor="middle">عملية</text>
  <text class="d-label-muted" x="614" y="108" text-anchor="middle">+ image</text>
  <rect class="d-box-success" x="360" y="158" width="300" height="44" rx="8"/>
  <text class="d-label" x="510" y="185" text-anchor="middle">namespaces + cgroups</text>
  <rect class="d-box" x="360" y="212" width="300" height="44" rx="8"/>
  <text class="d-label" x="510" y="239" text-anchor="middle">نواة المضيف + العتاد</text>
  <text class="d-label-muted" x="170" y="286" text-anchor="middle">ثوانٍ للإقلاع، عزل قوي</text>
  <text class="d-label-muted" x="510" y="286" text-anchor="middle">أجزاء من الثانية للبدء، نواة مشتركة</text>
</svg>
:::

ولأنه لا يوجد نظام تشغيل ضيف يحتاج إلى الإقلاع، يبدأ الـ container بسرعة البرنامج الذي بداخله. والثمن أن كل الـ containers على المضيف تتشارك نواة واحدة. الآلة الافتراضية جدار أقوى؛ أما الـ container فباب محكم القفل. لهذا تُصرّ الدروس اللاحقة على المستخدمين غير الـ root وعلى الـ images الصغيرة: فأنت تقلّص ما يستطيع المهاجم فعله إن تجاوز ذلك الباب.

على macOS وWindows، يشغّل Docker Desktop آلة Linux افتراضية خفيفة واحدة ويضع الـ containers داخلها. النموذج هو نفسه، كل ما في الأمر أن هناك طبقة إضافية واحدة في الأسفل.

## الـ image مقابل الـ container

الـ **image** لقطة لنظام ملفات مقسّمة إلى layers (طبقات)، للقراءة فقط، مع بيانات وصفية: أي أمر يُشغَّل، وأي منفذ يتوقّعه التطبيق، وبأي مستخدم يعمل. أما الـ **container** فنسخة قيد التشغيل من الـ image، فوقها layer رقيقة قابلة للكتابة.

ينطبق تشبيه الـ class والـ object هنا جيدًا: image واحدة، وcontainers كثيرة. حين نوسّع notes-api إلى ست نسخ في Kubernetes، فهذه image واحدة وستة containers. والـ layer القابلة للكتابة في كل container خاصة به وقابلة للتخلّص منها، لذا فالقاعدة من اليوم الأول: **الـ containers قطيع يُستبدل، والبيانات تعيش في مكان آخر**. سيحفظ Postgres ملفاته في volume (وحدة تخزين دائمة)، وليس أبدًا في الـ layer القابلة للكتابة داخل container.

:::mistake معاملة الـ container كأنه خادم
كثيرًا ما تدخل الفِرق حديثة العهد بالـ containers إلى container قيد التشغيل بـ `docker exec`، فتعدّل ملف إعدادات ثم تمضي. يأتي الـ deploy التالي فيستبدل الـ container ويختفي الإصلاح، وغالبًا ما يحدث ذلك في خضمّ حادث (incident). غيّر الـ image أو الإعدادات التي تمرّرها إلى الـ container، ولا تعدّل الـ container وهو يعمل أبدًا.
:::

في الدرس التالي ستكتب أول Dockerfile لـ notes-api، وتحوّل الكود المصدري إلى image تستطيع تشغيلها.
