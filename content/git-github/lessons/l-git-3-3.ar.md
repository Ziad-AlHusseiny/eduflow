---
summary: افتح pull request من فرع مرفوع، واكتب وصفًا يستطيع المراجعون التصرّف بناءً عليه، وراجِع الكود وحدّثه عبر التعليقات والـ commits الجديدة، وادمج بالطريقة المناسبة.
takeaways:
  - الـ pull request يقترح دمج فرع في آخر، وهو المكان الذي يجري فيه النقاش والمراجعة والفحوص الآلية.
  - رفع commits إضافية إلى الفرع نفسه يحدّث الـ pull request المفتوح؛ ولا تحتاج أبدًا إلى فتح واحد جديد.
  - الوصف الجيد يقول ما الذي تغيّر، ولماذا، وكيف تتحقّق منه، والعبارة `Closes #12` تربط الـ issue فيُغلقها الدمج.
  - الـ merge commit والـ squash and merge والـ rebase and merge تنتج سجلّات مختلفة على `main`؛ اختر عُرفًا واحدًا لكل repository.
  - بعد squash merge، ابدأ العمل الجديد على فرع جديد من `main` المحدَّث بدل مواصلة العمل على الفرع القديم.
further:
  - title: Pull requests (GitHub Docs)
    url: https://docs.github.com/en/pull-requests/reference/pull-requests
  - title: Reviewing proposed changes in a pull request
    url: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request
  - title: Pull request merges (GitHub Docs)
    url: https://docs.github.com/en/pull-requests/reference/pull-request-merges
  - title: Linking a pull request to an issue
    url: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue
quiz:
  - q: يطلب منك مراجِع إعادة تسمية class في CSS ضمن الـ pull request المفتوح. كيف تحدّث الـ pull request؟
    options:
      - text: أغلقه، ونفّذ التغيير على فرع جديد، وافتح pull request جديدًا.
        why: هذا يرمي نقاش المراجعة دون أي سبب. الـ pull requests مصمَّمة لتُحدَّث.
      - text: أنشئ commit بالتغيير على الفرع نفسه وارفعه؛ فيتحدّث الـ pull request تلقائيًا.
        why: صحيح. الـ pull request يتتبّع فرعه، فتظهر فيه الـ commits الجديدة ويرى المراجِع بالضبط ما تغيّر منذ مراجعته.
      - text: عدّل الملف في تبويب "Files changed" داخل الـ pull request.
        why: تستطيع إجراء تعديلات صغيرة على GitHub، لكنها تبقى commit على الفرع؛ ليست آلية منفصلة، والعمل المحلي أسهل في الاختبار عادةً.
      - text: اطلب من المراجِع أن ينفّذ التغيير بنفسه بعد الدمج.
        why: دمج عمل تعرف أنه غير مكتمل في `main` يُفشل الغرض من المراجعة.
    answer: 1
  - q: ينتهي وصف الـ pull request الخاص بك بـ `Closes #12`. ماذا يحدث حين يُدمج الـ pull request في الفرع الافتراضي؟
    options:
      - text: يُغلق الـ issue رقم 12 تلقائيًا ويُربط بالـ pull request.
        why: صحيح. الكلمات المفتاحية مثل `closes` و `fixes` و `resolves` متبوعة برقم issue تربطهما، والدمج يُغلق الـ issue.
      - text: يُغلق الـ pull request رقم 12.
        why: الرقم يشير إلى issue (الـ issues والـ pull requests تتشارك ترقيمًا واحدًا)، والكلمة المفتاحية تربط ولا تُغلق pull request آخر.
      - text: لا شيء؛ إنها مجرد ملاحظة للبشر.
        why: يحلّل GitHub هذه الكلمات المفتاحية في أوصاف الـ pull requests ويتصرّف بناءً عليها عند الدمج في الفرع الافتراضي.
    answer: 0
  - q: يدمج فريقك الـ pull requests بطريقة squash. بعد دمج الـ pull request الخاص بك، واصلت إنشاء commits على الفرع نفسه وفتحت pull request ثانيًا. فظهرت فيه الـ commits القديمة مجددًا مع تعارضات. لماذا؟
    options:
      - text: نسي GitHub أن الـ pull request الأول دُمج.
        why: GitHub يتذكّر. المشكلة في رسم الـ commits، لا في سجلّات GitHub.
      - text: الدمج بطريقة squash يحذف الفرع على GitHub، فيتلف.
        why: حذف الفرع بعد الدمج يزيل مؤشّرًا. لا شيء يتلف.
      - text: يحتاج فرعك إلى `git pull --force` لإصلاح السجلّ.
        why: لا يوجد إصلاح كهذا، والقوة لا تغيّر ما هو موجود في `main`.
      - text: أنشأ الـ squash commitًا واحدًا جديدًا على `main`، فتبقى الـ commits الأصلية في فرعك غير مدموجة في نظر Git.
        why: صحيح. الـ squash commit يحمل التغييرات نفسها لكن بمعرّف مختلف. ابدأ كل قطعة عمل جديدة على فرع جديد من `main` المحدَّث.
    answer: 3
  - q: أيّ pull request يُرجَّح أن يحظى بأكثر المراجعات فائدة؟
    options:
      - text: pull request واحد بإعادة التصميم كاملة، 2,400 سطر متغيّر، بعنوان "Updates".
        why: لا يستطيع المراجعون استيعاب هذا الكمّ، فيمرّون عليه سريعًا ويوافقون. الحجم والعنوان المبهم كلاهما يعملان ضد المراجعة.
      - text: pull request بلا وصف، لأن الكود يتحدّث عن نفسه.
        why: الكود يبيّن ما الذي تغيّر، لا لماذا، ولا كيف يُتحقَّق منه. ويضيّع المراجعون وقتهم في إعادة بناء نيّتك.
      - text: pull request من 150 سطرًا يضيف مرشّح المشاريع، مع لقطة شاشة وخطوات لاختباره.
        why: صحيح. صغير، وله غرض واحد، ومشروح، فيستطيع المراجِع أن يتحقّق فعلًا من أنه يعمل.
    answer: 2
---

حين تعمل وحدك، دمج الفرع مجرد أمر. أما في الفريق فهو حوار: يقرأ شخص آخر التغيير، ويطرح الأسئلة، ويكتشف الخطأ الذي لم تره، وبعد ذلك فقط يصل إلى `main`. والـ **pull request** (طلب الدمج) على GitHub هو المكان الذي يجري فيه هذا الحوار. وحتى في موقع شخصي تعمل عليه وحدك يستحق الاستخدام، لأنك بعد بضعة دروس ستربط به فحوصًا آلية، ولأن أصحاب العمل ينظرون إلى طريقة عملك، لا إلى ما بنيته فقط.

## من الفرع إلى الـ pull request

بنيت مرشّحًا (filter) لصفحة المشاريع على فرع ورفعته:

```bash
git switch -c projects-filter
# …commits…
git push -u origin projects-filter
```

يتضمّن ناتج الرفع رابطًا: `Create a pull request for 'projects-filter' on GitHub by visiting: https://github.com/maya-okafor/portfolio/pull/new/projects-filter`. افتحه، أو انقر شريط "Compare & pull request" في صفحة الـ repository. تحقّق من محدّدي الفرعين: **base** هو المكان الذي يجب أن يذهب إليه العمل (`main`)، و **compare** هو فرعك.

ومع GitHub CLI، يطلب `gh pr create` عنوانًا ونصًا في الطرفية، و `gh pr create --fill` يستخدم رسائل الـ commits الخاصة بك.

وإن لم يكن العمل جاهزًا لكنك تريد ملاحظات مبكرة، فافتحه كـ **draft pull request** (مسوّدة). لا يمكن دمجه حتى تعلّمه بأنه جاهز، وهو يخبر المراجعين أن ينظروا إلى الاتجاه العام لا إلى التفاصيل.

## اكتب وصفًا يستطيع الناس التصرّف بناءً عليه

العنوان يقول ما يفعله التغيير: "Add tag filter to projects page". والنص يجيب عن ثلاثة أسئلة:

```markdown
## What
Adds tag buttons above the project grid; clicking one hides cards without that tag.

## Why
The grid has 14 projects now and visitors asked for a way to find the React ones.

## How to check
1. Open projects.html
2. Click "React": only 5 cards remain
3. Click "All": all 14 return

Closes #12
```

أضف لقطة شاشة لأي شيء مرئي؛ ويمكنك لصق الصور مباشرة في المربّع. السطر الأخير يستخدم كلمة إغلاق مفتاحية: حين يُدمج هذا الـ pull request في الفرع الافتراضي، يُغلق الـ issue رقم 12 تلقائيًا ويرتبط الاثنان ببعضهما. وتعمل `Fixes` و `Resolves` أيضًا.

## المراجعة

يفتح المراجِع تبويب **Files changed**، الذي يعرض الـ diff بين فرعك وقاعدته. يستطيع التعليق على أي سطر، أو تحديد عدة أسطر لتعليق أشمل، أو كتابة **suggestion** (اقتراح): بديل مقترح تستطيع تطبيقه بنقرة واحدة كـ commit. وحين ينتهي، يرسل مراجعته بإحدى الحالات **Comment** أو **Approve** أو **Request changes**.

للردّ لا تفتح أي شيء جديد. نفّذ التغييرات محليًا، وأنشئ commit، وارفعه إلى الفرع نفسه:

```bash
git commit -am "Rename filter class to project-filter"
git push
```

يتحدّث الـ pull request، ويرى المراجِع فقط ما تغيّر منذ مراجعته الأخيرة. ردّ على كل تعليق، وأغلق النقاشات المحسومة (resolve)، واطلب نظرة أخرى.

:::tip المراجعة الجيدة
حين تراجع، ابدأ بتشغيل التغيير لا بقراءته. علّق على الكود، لا على الشخص أبدًا؛ واطرح أسئلة ("ماذا يحدث إن لم توجد أي مشاريع؟") بدل إصدار الأحكام. علّم التفضيلات الصغيرة بأنها اختيارية، وغالبًا ما تُسبق بـ "nit:"، ليعرف الكاتب ما الذي يمنع الموافقة. ووافق حين يصبح الكود جيدًا، لا حين يصبح كما كنت ستكتبه أنت.
:::

أبقِ الـ pull requests صغيرة. حين يبقى التغيير دون 400 سطر تقريبًا يستطيع المراجِع أن يفكّر فعلًا في كل سطر؛ أما الـ pull request ذو الألفي سطر فيُمرّ عليه سريعًا ويُوافَق عليه. وإن كانت الـ feature كبيرة، فقسّمها إلى سلسلة من الـ pull requests يترك كل منها الموقع يعمل.

## الدمج: ثلاثة أزرار، ثلاثة سجلّات

بعد الموافقة، يعرض زر الدمج حتى ثلاث طرق، وتستطيع إعدادات الـ repository تقييدها:

- **Create a merge commit**: كل الـ commits الخاصة بك مع merge commit، مثل `git merge --no-ff`.
- **Squash and merge**: الـ commits الخاصة بك مجمّعة في commit واحد جديد على `main`، يحمل عنوان الـ pull request.
- **Rebase and merge**: الـ commits الخاصة بك يُعاد تشغيلها على `main` واحدًا تلو الآخر، دون merge commit.

الـ Squash and merge خيار افتراضي شائع للـ pull requests الصغيرة: يحصل `main` على commit نظيف واحد لكل تغيير، وتختفي الـ commits من نوع "fix typo". أما الـ merge commits فتناسب الأعمال الأكبر التي تروي فيها الـ commits المنفردة قصة مفيدة. اختر واحدة لكل repository والتزم بها.

بعد الدمج، انقر **Delete branch** على GitHub، ثم رتّب الأمور محليًا:

```bash
git switch main
git pull
git branch -D projects-filter
```

لماذا `-D` وليس `-d`؟ بعد دمج بطريقة squash أو rebase، لا تكون الـ commits الأصلية في فرعك أسلافًا لـ `main` (فقد أنشأ GitHub commits جديدة)، لذا يظن `-d` أن العمل لم يُدمج. وبمجرد أن يعرض GitHub الـ pull request على أنه مدموج، يصبح `-D` آمنًا.

:::mistake إعادة استخدام فرع مدموج
بعد squash merge، فإن مواصلة العمل على الفرع نفسه للـ feature التالية تعني أن فرعك ما زال يحمل الـ commits القديمة السابقة للـ squash. فيعرضها الـ pull request التالي مجددًا ويتعارض مع نظيرها المضغوط على `main`. تعامل مع الفرع المدموج على أنه منتهٍ: احذفه، وحدّث `main`، وأنشئ فرعًا جديدًا بـ `git switch -c`.
:::

الانتقال إلى pull request شخص آخر لاختباره أمر واحد مع الـ CLI: `gh pr checkout 14`. في الدرس التالي ستستخدم بقية أدوات التعاون في GitHub: الـ issues والـ projects لتخطيط العمل، والـ forks للمساهمة في repositories لا تملكها.
