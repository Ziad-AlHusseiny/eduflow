---
summary: اقرأ تعارض الدمج بهدوء، وحرّر علامات التعارض حتى تصل إلى النتيجة التي تريدها، وعلّم الملفات بأنها حُلّت وأكمل الدمج، أو ألغِه وابدأ من جديد.
takeaways:
  - التعارض يعني أن الفرعين غيّرا الأسطر نفسها منذ الـ merge base، فيطلب منك Git أن تختار؛ لا شيء ضاع ولا شيء تعطّل.
  - ما بين `<<<<<<<` و `=======` هو فرعك الحالي (HEAD)؛ وما بين `=======` و `>>>>>>>` هو الفرع الذي يُدمج.
  - تحلّ التعارض بتحرير الملف إلى شكله النهائي، وإزالة كل العلامات، ثم `git add` للملف و `git commit`.
  - "`git merge --abort` يعيد كل شيء تمامًا كما كان قبل بدء الدمج."
  - "ضبط `merge.conflictStyle` على `zdiff3` يعرض الأسطر الأصلية أيضًا، وهذا يجعل الحكم على معظم التعارضات سهلًا."
further:
  - title: Basic Merge Conflicts (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging#_basic_merge_conflicts
  - title: Resolving a merge conflict using the command line
    url: https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/resolving-a-merge-conflict-using-the-command-line
  - title: git merge, How conflicts are presented
    url: https://git-scm.com/docs/git-merge#_how_conflicts_are_presented
quiz:
  - q: |
      أنت على `main` وشغّلت `git merge tagline`. وترى في `index.html`:
      ```text
      <<<<<<< HEAD
      <p>Front-end developer in Lagos.</p>
      =======
      <p>Front-end developer who loves accessible UI.</p>
      >>>>>>> tagline
      ```
      أيّ السطرين جاء من `main`؟
    options:
      - text: الثاني، لأن الفرع الذي يُدمج يظهر أولًا دائمًا.
        why: العكس هو الصحيح. النصف العلوي هو دائمًا الفرع الذي أنت عليه، ويحمل الاسم HEAD.
      - text: "`Front-end developer in Lagos.`، لأن النصف العلوي هو الـ HEAD، أي فرعك الحالي."
        why: صحيح. أنت على `main`، إذن الـ HEAD هو `main`. والنصف السفلي، الذي يحمل الاسم `tagline`، هو ما يُدمج.
      - text: لا هذا ولا ذاك؛ السطران اقتراحان من Git لنسخة مدمجة.
        why: لا يخترع Git نصوصًا. كل نصف هو بالضبط ما يحتويه أحد الفرعين.
    answer: 1
  - q: حرّرت `index.html` حتى صار كما تريد، وأزلت كل العلامات. لكن `git status` ما زال يدرجه تحت "Unmerged paths". ما الخطوة التالية؟
    options:
      - text: شغّل `git merge tagline` مجددًا كي يلاحظ Git الإصلاح.
        why: هناك دمج قيد التنفيذ أصلًا. بدء دمج آخر يفشل؛ فـ Git ينتظر منك أن تعلّم الملفات بأنها حُلّت.
      - text: شغّل `git commit -a --no-verify`.
        why: "`--no-verify` يتخطّى الـ hooks ولا علاقة له بالتعارضات. جهّز الملف وأنشئ الـ commit بشكل عادي."
      - text: شغّل `git add index.html` لتعلّمه بأنه حُلّ، ثم `git commit`.
        why: صحيح. التجهيز يخبر Git بأن التعارض حُسم. وحين لا يبقى أي مسار غير مدموج، ينشئ `git commit` الـ merge commit.
      - text: احذف `index.html` وشغّل `git restore index.html`.
        why: هذا يرمي الحلّ الذي كتبته للتو. ولا داعي لحذف أي شيء.
    answer: 2
  - q: في منتصف تعارض فوضوي تدرك أنك دمجت الفرع الخطأ. كيف تعود تمامًا إلى حيث كنت قبل الدمج؟
    options:
      - text: "`git merge --abort`"
        why: صحيح. ما دام الدمج قيد التنفيذ، يعيد هذا الأمر الفرع والـ index وملفاتك إلى حالتها قبل `git merge`.
      - text: "`git restore .`"
        why: هذا يرمي تغييرات الـ working tree لكنه يترك Git في منتصف الدمج، وحالة الدمج ما زالت نشطة.
      - text: "`git branch -D main`"
        why: حذف الفرع الذي أنت عليه غير مسموح، ولن يلغي أي شيء على أي حال.
      - text: أغلق الطرفية؛ فعمليات الدمج غير المكتملة تُلغى تلقائيًا.
        why: حالة الدمج مخزّنة في `.git`، لا في جلسة الطرفية. وستجدها حين تعيد فتحها.
    answer: 0
  - q: دُمج فرعك ورُفع، ثم يجد زميلك `=======` مطبوعة على الصفحة الرئيسية في الموقع المنشور. أيّ عادة كانت ستكتشف هذا قبل الـ commit؟
    options:
      - text: تشغيل `git log --graph` بعد كل دمج.
        why: الرسم يعرض بنية الـ commits، لا محتوى الملفات، فلن تظهر العلامات المتبقّية.
      - text: الحلّ دائمًا بـ `git merge --abort`.
        why: الإلغاء يلغي الدمج بدل أن يحلّه، فلا يصل العمل أبدًا.
      - text: استخدام `git commit -m` بدل المحرّر.
        why: مصدر الرسالة لا علاقة له بالعلامات الموجودة داخل ملفاتك.
      - text: تشغيل `git diff --check` (وفتح الصفحة) قبل `git add`.
        why: صحيح. `git diff --check` ينبّه إلى علامات التعارض المتبقّية، والنظر الفعلي إلى النتيجة يكشف الباقي.
    answer: 3
---

عاجلًا أو آجلًا سيغيّر فرعان السطر نفسه. تغيّر سطر التعريف (tagline) على `main` إلى "Front-end developer in Lagos."، بينما فرعك `tagline` الذي بدأته في وقت سابق أعاد كتابة السطر نفسه إلى "Front-end developer who loves accessible UI.". لا يستطيع Git أن يعرف أيهما الصحيح، فيتوقّف ويسأل. هذا كل ما في تعارض الدمج (merge conflict): سؤال. ساعدت مئات الأشخاص في تعارضهم الأول، والذعر يأتي دائمًا من العلامات غير المألوفة، لا من المشكلة نفسها.

## ما يخبرك به Git

```bash
git switch main
git merge tagline
```

```text
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

أنت الآن *في منتصف دمج*. الملفات التي اندمجت بلا مشكلة مجهّزة أصلًا. شغّل `git status` لترى البقية:

```text
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

اقرأ هذا الناتج؛ ففيه الإجراء كاملًا. أصلح التعارضات، وعلّم كل ملف بأنه حُلّ بـ `git add`، ثم `git commit`. أو ألغِ الدمج.

## قراءة العلامات

افتح `index.html`. كتب Git النسختين كلتيهما في الملف، محاطتين بعلامات:

```html title=index.html
    <h1>Maya Okafor</h1>
<<<<<<< HEAD
    <p>Front-end developer in Lagos.</p>
=======
    <p>Front-end developer who loves accessible UI.</p>
>>>>>>> tagline
```

- النصف العلوي، من العلامة الافتتاحية التي تحمل الاسم `HEAD` حتى `=======`، هو **طرفك**: الفرع الذي أنت عليه، وهو هنا `main`.
- النصف السفلي، من `=======` حتى العلامة الختامية التي تحمل الاسم `tagline`، هو **طرفهم**: الفرع الذي تدمجه.

كل ما هو خارج العلامات اندمج دون مشكلة. وقد يحتوي الملف عدة كتل من هذا النوع، فابحث في الملف عن العلامة الافتتاحية (سبعة رموز `<` متتالية) حتى لا يبقى منها شيء.

:::figure يقارن Git الطرفين بالـ merge base
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">في الـ merge base النص 'Front-end developer in progress.' غيّره main إلى 'in Lagos.' وغيّره فرع tagline إلى 'who loves accessible UI.' غيّر الطرفان السطر نفسه، فلا يستطيع Git الاختيار وتكتب أنت النتيجة بيدك.</title>
  <rect class="d-box" x="230" y="15" width="240" height="56" rx="10"/>
  <text class="d-label-strong" x="350" y="38" text-anchor="middle">Merge base</text>
  <text class="d-label-muted" x="350" y="60" text-anchor="middle">"…developer in progress."</text>
  <rect class="d-box-accent" x="20" y="105" width="270" height="56" rx="10"/>
  <text class="d-label-strong" x="155" y="128" text-anchor="middle">HEAD (main)</text>
  <text class="d-label-muted" x="155" y="150" text-anchor="middle">"…developer in Lagos."</text>
  <rect class="d-box-accent" x="410" y="105" width="270" height="56" rx="10"/>
  <text class="d-label-strong" x="545" y="128" text-anchor="middle">tagline</text>
  <text class="d-label-muted" x="545" y="150" text-anchor="middle">"…loves accessible UI."</text>
  <path class="d-arrow" d="M300 71 L190 103" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 71 L510 103" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="190" y="190" width="320" height="50" rx="10"/>
  <text class="d-label-strong" x="350" y="220" text-anchor="middle">سطر واحد تغيّر مرتين: القرار لك</text>
  <path class="d-arrow" d="M155 161 L260 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M545 161 L440 188" marker-end="url(#arrow)"/>
</svg>
:::

## الحلّ خطوة بخطوة

**1. قرّر ما يجب أن تكون عليه النتيجة.** ليس «أيّ الطرفين يفوز» كردّ فعل تلقائي، بل ما الذي يجب أن تقوله الصفحة فعلًا؟ غالبًا تكون النتيجة مزيجًا. وهنا المعلومتان كلتاهما جيدتان:

```html title=index.html
    <h1>Maya Okafor</h1>
    <p>Front-end developer in Lagos who loves accessible UI.</p>
```

**2. أزل كل العلامات.** يجب أن تختفي أسطر العلامات الثلاثة. لا يقرأ Git الملف ليتحقّق؛ هذه مهمّتك أنت.

**3. افحص النتيجة.** افتح الصفحة في المتصفّح، وشغّل اختباراتك (`npm test` حين تصبح للموقع اختبارات)، وشغّل:

```bash
git diff --check
```

ينبّهك إلى أي علامات تعارض متبقّية. خمس ثوانٍ في محلّها.

**4. علّمه بأنه حُلّ وأكمل.**

```bash
git add index.html
git status        # "All conflicts fixed but you are still merging."
git commit        # editor opens with "Merge branch 'tagline'"; save and close
```

الأمر `git merge --continue` يفعل ما يفعله `git commit` الأخير هذا. والـ merge commit الآن له أبوان، كأي merge commit آخر.

وإن كنت تعرف أن أحد الطرفين يجب أن يفوز في ملف كامل، فتجاوز التحرير: `git restore --ours index.html` يحتفظ بنسخة فرعك، و `git restore --theirs index.html` يحتفظ بالنسخة القادمة. ثم نفّذ `git add` كالمعتاد.

:::mistake تسجيل العلامات في commit
أكثر أخطاء التعارض شيوعًا ليس الاختيار الخاطئ؛ بل سطر `=======` شارد أو سطر علامة ختامية يُسجَّل في الملف، ويصل أحيانًا إلى بيئة الإنتاج. لن يوقفك Git، لأنه بالنسبة إليه مجرد نص. اجعل `git diff --check` والنظر الفعلي إلى الصفحة جزءًا من كل حلّ.
:::

## الانسحاب

إن كان التعارض أكبر مما توقّعت، أو دمجت الفرع الخطأ، تستطيع دائمًا التراجع:

```bash
git merge --abort
```

يعود فرعك والـ index وملفاتك تمامًا إلى ما كانت عليه قبل `git merge`. لا يضيع شيء. وكثيرًا ما يكون من الحكمة أن تلغي، ثم تحدّث الفرع أو ترتّبه، وتحاول من جديد بذهن صافٍ.

العلامات نفسها وروتين «أصلِح ثم add ثم أكمل» نفسه يظهران كلما جمع Git نسختين من سطر واحد: أثناء الـ rebase، وحين تطبّق stash، وحين يدمج `git pull` عمل شخص آخر في عملك. تعلّم الروتين مرة واحدة هنا، وسيبدو كل تعارض لاحق في هذا الكورس مألوفًا. ما يتغيّر فقط هو الأمر الذي تستخدمه للإكمال أو الإلغاء.

## جعل التعارضات أسهل في القراءة

افتراضيًا ترى الطرفين فقط. اطلب من Git أن يعرض الأسطر الأصلية أيضًا:

```bash
git config --global merge.conflictStyle zdiff3
```

الآن لكل تعارض قسم ثالث بين `|||||||` و `=======` يعرض الـ merge base. رؤية ما كان عليه السطر *قبل* أيّ من التغييرين تجعل الجواب الصحيح واضحًا في الغالب: ترى ما قصده كل طرف، لا ما انتهى إليه فقط.

المحرّرات تساعد أيضًا. يميّز VS Code كل كتلة بأزرار مثل Accept Current Change و Accept Incoming Change و Accept Both Changes، إضافة إلى محرّر دمج ثلاثي. استخدمها، لكن اقرأ النتيجة؛ فـ Accept Both كثيرًا ما ينتج وسمَي `<p>` حيث أردت واحدًا.

:::tip تعارضات أقل وأصغر
تكبر التعارضات مع الوقت ومع حجم الفرع. أبقِ الفروع قصيرة العمر، وادمجها سريعًا، وأدخِل `main` إلى الفرع طويل العمر كل يوم أو يومين بدل مرة واحدة في النهاية. وشخصان يعدّلان ملفًا مشتركًا واحدًا طوال الأسبوع حالة تستدعي حديثًا قبل الدمج، لا أثناءه.
:::

الدمج طريقة واحدة لجمع السجلّات. في الدرس التالي ستتعرّف على الطريقة الأخرى، الـ rebase، والقاعدة الوحيدة التي تُبقيه آمنًا.
