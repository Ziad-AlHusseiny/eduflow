---
summary: خطّط العمل بالـ issues والـ labels ولوحة GitHub Project، ثم ساهم في repository لا تملكه بعمل fork له، وتتبّع الـ upstream، وفتح pull request من الـ fork الخاص بك.
takeaways:
  - الـ issue وحدة عمل مخطّط لها أو مشكلة مُبلَّغ عنها؛ والـ labels والمكلَّفون والـ pull request المرتبط تبيّن حالتها.
  - الـ GitHub Project عرض على شكل جدول أو لوحة أو خريطة طريق فوق الـ issues والـ pull requests، مع حقول مخصّصة مثل Status و Priority.
  - الـ fork نسختك الخاصة على GitHub من repository يملكه شخص آخر؛ ترفع إلى الـ fork الخاص بك وتفتح pull request إلى الأصل.
  - "بحسب العُرف، `origin` هو الـ fork الخاص بك و `upstream` هو الأصل؛ تنفّذ fetch من `upstream` وترفع إلى `origin`."
  - قبل المساهمة، اقرأ CONTRIBUTING.md، وابحث عن issue موجودة، وأبقِ التغيير صغيرًا وعلى فرعه الخاص.
further:
  - title: About issues
    url: https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues
  - title: About Projects
    url: https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
  - title: Fork a repository
    url: https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo
  - title: Syncing a fork
    url: https://docs.github.com/en/pull-requests/how-tos/work-with-forks/syncing-a-fork
quiz:
  - q: استنسخت الـ fork الخاص بك من `vite-themes`. أيّ الأوامر تجلب أحدث `main` من المشروع الأصلي إلى `main` في الـ fork الخاص بك؟
    options:
      - text: "`git pull origin main`"
        why: "`origin` هو الـ fork الخاص بك، وليست فيه الـ commits الجديدة بعد. ستسحب من النسخة المتأخّرة."
      - text: "`git push upstream main`"
        why: لا تستطيع الرفع إلى الـ repository الأصلي، والرفع يرسل الـ commits الخاصة بك بدل أن يجلب الـ commits الخاصة بهم.
      - text: "`git fetch upstream`، ثم `git switch main`، ثم `git merge --ff-only upstream/main`، ثم `git push origin main`."
        why: صحيح. اجلب من الأصل، وقدّم `main` الخاص بك إليه بـ fast-forward، ثم حدّث الـ fork على GitHub. وزر Sync fork ينجز النصف الخاص بـ GitHub.
      - text: "استنسخ الأصل مرة أخرى بـ `git clone` في مجلد جديد."
        why: هذا ينجح لكنه يرمي إعدادك وفروعك. أما إضافة remote باسم `upstream` فتُبقي كل شيء في نسخة واحدة.
    answer: 2
  - q: وجدت خطأً في مكتبة مفتوحة المصدر ولديك إصلاح في ذهنك يلمس ستة ملفات. ما الذي تفعله أولًا؟
    options:
      - text: افتح pull request فورًا ليرى المشرفون كودًا يعمل.
        why: التغيير الكبير غير المعلَن قد يتصادم مع خطط لا تعرفها، وقد يُغلق دون أن يُقرأ.
      - text: راسل المشرفين بالبريد على انفراد مرفقًا الـ patch.
        why: معظم المشاريع تنسّق في issues عامة ليراها الآخرون ويساعدوا. والبريد الخاص مخصّص لتقارير الأمان فقط، إن طلب المشروع ذلك.
      - text: أنشئ fork للمشروع وانشر نسختك المُصلَحة باسم جديد.
        why: هذا يقسم المجتمع ويترك الجميع مع الخطأ. أما المساهمة بالإصلاح في الأصل فتفيد الجميع.
      - text: اقرأ CONTRIBUTING.md وابحث في الـ issues؛ وإن لم تجد ما يغطّي المشكلة، افتح issue تصف الخطأ والإصلاح الذي تقترحه.
        why: صحيح. الاتفاق على الأسلوب أولًا يتجنّب العمل الضائع، وكثير من المشاريع تشترط وجود issue قبل الـ pull request.
    answer: 3
  - q: ما الفرق بين الـ label والـ GitHub Project؟
    options:
      - text: الـ labels تعمل على الـ pull requests فقط؛ والـ Projects تعمل على الـ issues فقط.
        why: الـ labels والـ Projects كلاهما يعملان مع الـ issues والـ pull requests.
      - text: الـ label يوسم issue أو pull request منفردًا؛ أما الـ Project فعرض يشمل كثيرًا منها، بحقوله ولوحاته وتخطيطاته الخاصة.
        why: صحيح. الـ labels مثل `bug` تصنّف العناصر؛ والـ Project يرتّب العناصر (حتى من عدة repositories) في جدول أو لوحة أو خريطة طريق.
      - text: إنهما الميزة نفسها باسمين مختلفين.
        why: الـ labels وسوم بسيطة على عناصر repository واحد. أما الـ Projects فتضيف حقولًا مخصّصة وطرق عرض وأتمتة عبر العناصر.
    answer: 1
  - q: فتحت pull request من فرع `main` في الـ fork الخاص بك. وأثناء انتظار المراجعة، بدأت إصلاحًا لا علاقة له بالأول وسجّلته في commit على `main` أيضًا. ماذا يحدث؟
    options:
      - text: يظهر الإصلاح غير المرتبط في الـ pull request المفتوح، لأن الـ pull request يتتبّع `main` الخاص بك.
        why: صحيح. الـ pull request يعرض كل commit على فرعه. أعطِ كل مساهمة فرعها الخاص لتبقى التغييرات منفصلة.
      - text: لا شيء؛ فقد جمّد الـ pull request الـ commits الخاصة به حين فتحته.
        why: الـ pull requests تتبع فروعها، ولهذا يحدّثها الرفع إلى الفرع.
      - text: يرفض GitHub الرفع لأن هناك pull request مفتوحًا.
        why: الـ pull requests المفتوحة لا تقفل فروعها. ينجح الرفع ويكبر الـ pull request.
      - text: يذهب الـ commit الجديد إلى الـ repository الأصلي مباشرة.
        why: ليست لديك صلاحية الكتابة على الأصل. لا شيء يصل إليه إلا عبر pull request مدموج.
    answer: 0
---

صار الموقع الشخصي على GitHub، وتصل التغييرات إلى `main` عبر الـ pull requests. يبقى سؤالان. كيف تتابع ما عليك فعله بعد ذلك، دون ورقة لاصقة على شاشتك؟ وكيف تساهم في مشروع لا تملكه، لا تستطيع فيه حتى رفع فرع؟ يجيب GitHub عن الأول بالـ issues والـ Projects، وعن الثاني بالـ forks.

## الـ Issues: عمل يمكنك الإشارة إليه

الـ **issue** قطعة عمل متتبَّعة: خطأ، أو فكرة feature، أو سؤال. يحصل كل منها على رقم مشترك مع الـ pull requests (`#12`)، وسلسلة نقاش، وبيانات وصفية:

- **Labels** (الوسوم) تصنّفها: `bug` و `enhancement` و `documentation` و `good first issue`.
- **Assignees** (المكلَّفون) يبيّنون من يعمل عليها.
- **Milestones** (المحطّات) تجمع الـ issues نحو هدف، مثل "Launch v1".

في موقعك الشخصي، اكتب قائمة المهام على شكل issues: "Projects page: filter by tag (#12)" و "Footer overlaps content on mobile (#13)". ثم يسمّي كل pull request الـ issue الخاصة به بـ `Closes #12`، فيُغلقها الدمج، وبعد ستة أشهر يستطيع أي شخص أن يتتبّع الأثر من سطر كود إلى الـ commit، فالـ pull request، فالنقاش، فالسبب الأصلي.

تقرير الخطأ الجيد فيه خطوات لإعادة إنتاجه، وما كنت تتوقّعه، وما حدث، والمتصفّح أو الإصدار. ويمكن للـ repositories أن تضيف قوالب issues في `.github/ISSUE_TEMPLATE/` ليملأ المبلِّغون هذه الأقسام تلقائيًا.

## الـ Projects: اللوحة فوق الـ issues

الـ **GitHub Project** عرض تخطيطي فوق الـ issues والـ pull requests، وقد تكون من عدة repositories. يبدأ جدولًا يشبه جداول البيانات؛ تضيف إليه حقولًا مخصّصة مثل Status و Priority و Size و Iteration، وتنتقل بين تخطيطات **table** (جدول) و **board** (لوحة بأعمدة بحسب Status، أي لوحة kanban المألوفة) و **roadmap** (العناصر على خط زمني). ويمكن لسير العمل المدمج (built-in workflows) أن ينقل العناصر تلقائيًا، مثلًا إلى Done حين تُغلق issue أو يُدمج pull request.

لموقع شخصي تعمل عليه وحدك، تكفي لوحة فيها Todo و In progress و Done. أما في الفريق، فالـ Project هو المكان الذي تجري فيه نقاشات التخطيط، والـ issues تحمل التفاصيل.

## الـ Forks: المساهمة دون صلاحية كتابة

لنقل إنك وجدت خطأً إملائيًا في وثائق مكتبة ثيمات مفتوحة المصدر، `open-themes/vite-themes`. تستطيع استنساخها، لكنك لا تستطيع الرفع إليها: لست متعاونًا (collaborator) فيها، و `git push` يفشل بخطأ صلاحيات. هذا ما تحلّه الـ forks.

الـ **fork** نسختك الخاصة من الـ repository على GitHub، تحت حسابك: `maya-okafor/vite-themes`. تستطيع أن ترفع إليها أي شيء. وحين يجهز تغييرك، تفتح pull request من فرع في الـ fork الخاص بك إلى الـ repository الأصلي، الذي يُسمّى بحسب العُرف **upstream**.

:::figure سير عمل الـ fork: اجلب من upstream، وارفع إلى origin، ثم pull request عائد
<svg viewBox="0 0 700 290" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة repositories على شكل مثلث. أعلى اليسار: upstream، أي open-themes/vite-themes على GitHub. أعلى اليمين: origin، أي الـ fork الخاص بك maya-okafor/vite-themes على GitHub. في الأسفل: نسختك المحلية. زر Fork ينسخ upstream إلى origin. نسختك المحلية تجلب من upstream وترفع الفروع إلى origin. والـ pull request يذهب من origin إلى upstream.</title>
  <rect class="d-box-primary" x="20" y="20" width="250" height="70" rx="12"/>
  <text class="d-label-strong" x="145" y="48" text-anchor="middle">upstream</text>
  <text class="d-code" x="145" y="72" text-anchor="middle">open-themes/vite-themes</text>
  <rect class="d-box-accent" x="430" y="20" width="250" height="70" rx="12"/>
  <text class="d-label-strong" x="555" y="48" text-anchor="middle">origin (الـ fork الخاص بك)</text>
  <text class="d-code" x="555" y="72" text-anchor="middle">maya-okafor/vite-themes</text>
  <rect class="d-box" x="225" y="200" width="250" height="70" rx="12"/>
  <text class="d-label-strong" x="350" y="228" text-anchor="middle">نسختك المحلية</text>
  <text class="d-code" x="350" y="252" text-anchor="middle">~/code/vite-themes</text>
  <path class="d-arrow" d="M270 40 L426 40" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="348" y="32" text-anchor="middle">Fork</text>
  <path class="d-arrow d-dashed" d="M430 75 L274 75" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="352" y="100" text-anchor="middle">pull request</text>
  <path class="d-arrow" d="M120 92 L250 196" marker-end="url(#arrow)"/>
  <text class="d-code" x="30" y="160">git fetch upstream</text>
  <path class="d-arrow" d="M450 196 L560 94" marker-end="url(#arrow)"/>
  <text class="d-code" x="520" y="160">git push origin</text>
</svg>
:::

هذا هو الروتين كاملًا:

```bash
# 1. Click Fork on github.com/open-themes/vite-themes, then clone YOUR fork
git clone git@github.com:maya-okafor/vite-themes.git
cd vite-themes

# 2. Remember where the original lives
git remote add upstream https://github.com/open-themes/vite-themes.git
git remote -v    # origin = your fork, upstream = the original

# 3. Work on a branch, never on main
git switch -c fix-readme-typo
git commit -am "Fix typo in installation steps"
git push -u origin fix-readme-typo
```

بعدها يعرض GitHub خيار "Compare & pull request" على الـ fork الخاص بك. تحقّق من أن الـ repository الأساسي هو `open-themes/vite-themes` وأن الفرع الأساسي هو `main` الخاص بهم. واختصار الخطوتين 1 و 2 في الـ CLI هو `gh repo fork open-themes/vite-themes --clone`، وهو يُعدّ لك أيضًا الـ remote المسمّى `upstream`.

اترك "Allow edits by maintainers" محدَّدًا حين تفتح الـ pull request. هذا يسمح للمشرفين برفع إصلاحات صغيرة إلى فرعك بدل أن يطلبوا منك كل تعديل بسيط.

## إبقاء الـ fork محدَّثًا

الأصل يواصل التقدّم. أدخِل تغييراته إلى الـ fork الخاص بك قبل أن تبدأ كل فرع جديد:

```bash
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main
```

لأنك لا تنشئ commits أبدًا على `main` في الـ fork، فهذا دائمًا fast-forward. زر **Sync fork** في صفحة الـ fork على GitHub، أو `gh repo sync maya-okafor/vite-themes`، يحدّث النسخة الموجودة على GitHub؛ ولا يزال عليك أن تسحبها محليًا. (أما `gh repo sync` دون وسيط فيحدّث نسختك المحلية بدلًا من ذلك.)

:::mistake العمل على main في الـ fork
إن أنشأت commits على `main` في الـ fork الخاص بك، يصبح الـ pull request مربوطًا بـ `main`، وكل commit لاحق ينضمّ إليه، وتتوقّف المزامنة مع الـ upstream عن كونها fast-forward. أبقِ `main` مرآة نظيفة للـ upstream، وأعطِ كل مساهمة فرعها الخاص.
:::

## أن تكون مساهمًا مرحَّبًا به

قبل كتابة الكود، اقرأ ملف **README** الخاص بالمشروع وملف **CONTRIBUTING.md** (الإعداد، والاختبارات، والأسلوب، وهل تُشترط issue أولًا) ومدوّنة السلوك. ابحث في الـ issues والـ pull requests الموجودة؛ فربما يكون خطؤك معروفًا أو مُصلَحًا. ولأي شيء أكبر من خطأ إملائي، افتح issue أو علّق على واحدة، واتّفق مع المشرفين على الأسلوب قبل كتابة الكود. والـ issues التي تحمل الوسم `good first issue` مختارة عمدًا كنقاط بداية.

ثم أبقِ الـ pull request صغيرًا، واتبع أعراف المشروع حتى حيث كنت ستختار خلافها، وتأكّد من نجاح اختباراته، وأجب عن تعليقات المراجعة بصبر. المشرفون متطوّعون في الغالب. والـ pull request المركّز والموصوف جيدًا الذي يسهل قول «نعم» له هو أفضل تعريف بنفسك تستطيع تقديمه.

بهذا تكتمل أدوات التعاون. في القسم الأخير ستكتسب العادات التي تجعل كل هذا آمنًا: التراجع عن الأخطاء، وإبقاء الـ repository نظيفًا، وكتابة سجلّ يستطيع الناس قراءته، وترك الأتمتة تحرس `main`.
