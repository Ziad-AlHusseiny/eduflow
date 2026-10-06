---
summary: انقل التغييرات بوعي بين الـ working tree والـ staging area والـ repository، وافحص كل خطوة بـ status و diff، وقسّم العمل الفوضوي إلى commits مركّزة.
takeaways:
  - الـ working tree هو ملفاتك، والـ index (منطقة التجهيز) هو الـ commit التالي قيد التجميع، والـ repository هو الـ commits المسجّلة بالفعل.
  - "`git diff` يقارن الـ working tree بالـ index؛ و `git diff --staged` يقارن الـ index بآخر commit."
  - "`git add -p` يجهّز جزءًا من الملف، فتتحوّل جلسة تعديل فوضوية واحدة إلى عدة commits مركّزة."
  - "`git restore --staged <file>` يلغي التجهيز ويحتفظ بتعديلاتك؛ أما `git restore <file>` فيرمي تعديلاتك غير المجهّزة."
  - "`git commit -a` يجهّز الملفات المتتبَّعة المعدّلة فقط؛ والملفات الجديدة كليًا ما زالت تحتاج `git add`."
further:
  - title: Recording Changes to the Repository (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
  - title: git restore reference
    url: https://git-scm.com/docs/git-restore
  - title: git add reference
    url: https://git-scm.com/docs/git-add
quiz:
  - q: جهّزت `index.html`، ثم عدّلته مرة أخرى. يعرض `git diff` التعديل الثاني فقط. لماذا؟
    options:
      - text: أضاع Git التعديل الأول حين حفظت الملف مرة أخرى.
        why: لم يضِع شيء. التعديل الأول محفوظ بأمان في الـ index، والأمر `git diff --staged` سيعرضه.
      - text: "`git diff` لا يعرض إلا آخر حفظ لكل ملف."
        why: لا يتتبّع Git عمليات الحفظ. إنه يقارن حالتين كاملتين، وأيّ حالتين بالضبط يعتمد على الأمر.
      - text: "`git diff` يقارن الـ working tree بالـ index، والتعديل الأول موجود في الـ index أصلًا."
        why: صحيح. بعد تجهيز التعديل الأول، لا يبقى من فرق بين الملف على القرص والـ index إلا التعديل الثاني.
      - text: يلزم تنفيذ `add` ثانية قبل أن يعرض `git diff` أي شيء.
        why: "`git diff` يعرض التغييرات غير المجهّزة، وهذا بالضبط حال التعديل الثاني. ولو جهّزته لما عرض `git diff` شيئًا."
    answer: 2
  - q: شغّلت `git add styles.css` لكنك تريده في الـ commit القادم لا في هذا. أيّ أمر يحتفظ بتعديلاتك ويلغي تجهيز الملف فقط؟
    options:
      - text: "`git restore --staged styles.css`"
        why: صحيح. ينسخ آخر نسخة مسجّلة إلى الـ index، فيُلغى تجهيز الملف وتبقى تعديلاتك في الـ working tree.
      - text: "`git restore styles.css`"
        why: دون `--staged` يستهدف هذا الأمر الـ working tree ويستبدل ملفك بنسخة الـ index. ستضيع تعديلاتك.
      - text: "`git rm styles.css`"
        why: هذا يجهّز حذف الملف ويزيله من القرص. وهو عكس ما تريده تمامًا.
      - text: "`git commit --skip styles.css`"
        why: لا يوجد خيار `--skip` في `git commit`. إلغاء التجهيز يحدث في الـ index قبل الـ commit.
    answer: 0
  - q: أنشأت `projects.html` وعدّلت `index.html`، ثم شغّلت `git commit -am "Add projects page"`. ماذا احتوى الـ commit؟
    options:
      - text: الملفين كليهما، لأن `-a` تعني كل الملفات في المجلد.
        why: "`-a` تعني كل الملفات المتتبَّعة المعدّلة. والملف الذي لم يتتبّعه Git قط لا يُضمَّن."
      - text: لا شيء، لأن `-a` لا يمكن جمعها مع `-m`.
        why: "`-am` تركيبة شائعة وصحيحة: جهّز تغييرات الملفات المتتبَّعة، ثم أنشئ الـ commit بهذه الرسالة."
      - text: "`projects.html` فقط، لأنه الملف الأحدث."
        why: عمر الملف لا يهمّ Git. ما يهمّ هو هل الملف متتبَّع أم لا.
      - text: تغييرات `index.html` فقط؛ و `projects.html` ما زال untracked.
        why: صحيح. `-a` يتخطّى الملفات غير المتتبَّعة، ولهذا تصف رسالة الـ commit الآن صفحة ليست موجودة فيه.
    answer: 3
  - q: في ناتج `git status -s`، ماذا يخبرك السطر `MM index.html`؟
    options:
      - text: عُدّل الملف مرتين منذ آخر commit.
        why: لا يعدّ Git التعديلات. العمودان يصفان مقارنتين مختلفتين.
      - text: بعض تغييرات الملف مجهّزة وبعضها الآخر غير مجهّز.
        why: صحيح. العمود الأيسر يقارن الـ index بآخر commit، والعمود الأيمن يقارن الـ working tree بالـ index؛ وكلاهما يقول «معدّل».
      - text: في الملف تعارض دمج.
        why: تظهر التعارضات في الحالة المختصرة بالرمز `UU` (unmerged)، لا `MM`.
    answer: 1
---

قضيت أمسية كاملة على موقعك الشخصي. أضفت شريط تنقّل إلى `index.html`، وأنشأت `styles.css`، وصحّحت خطأً إملائيًا في اسمك أثناء ذلك. هذه ثلاثة تغييرات لا علاقة لبعضها ببعض. لو سجّلتها معًا في commit واحد باسم "updates"، فلن تستطيع لاحقًا التراجع عن شريط التنقّل دون التراجع عن تصحيح الخطأ الإملائي أيضًا. يعطيك Git مكانًا ترتّب فيه التغييرات قبل أن تصبح جزءًا من السجلّ.

## ثلاثة أماكن قد يكون فيها عملك

كل تغيير في مشروع Git يعيش في واحد من ثلاثة أماكن:

- الـ **working tree** (مجلد العمل) هو الملفات على القرص، تلك التي يفتحها محرّرك. تغيّرها بحرية، و Git يراقب فقط.
- الـ **index**، ويُسمّى أيضًا **staging area** (منطقة التجهيز)، هو الـ commit التالي قيد التجميع. الأمر `git add` ينسخ المحتوى الحالي للملف إليه.
- الـ **repository** (المستودع) هو الـ commits المسجّلة بالفعل داخل `.git`. والأمر `git commit` يحوّل الـ index إلى commit جديد.

:::figure الأوامر تنقل المحتوى بين المناطق الثلاث
<svg viewBox="0 0 700 270" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة صناديق من اليسار إلى اليمين: الـ working tree، والـ index (منطقة التجهيز)، والـ repository. الأمر git add ينقل من الـ working tree إلى الـ index، و git commit من الـ index إلى الـ repository. وفي الأسفل، git restore --staged ينسخ من الـ repository عائدًا إلى الـ index، و git restore ينسخ من الـ index عائدًا إلى الـ working tree.</title>
  <rect class="d-box" x="20" y="70" width="180" height="80" rx="12"/>
  <text class="d-label-strong" x="110" y="105" text-anchor="middle">Working tree</text>
  <text class="d-label-muted" x="110" y="128" text-anchor="middle">الملفات على القرص</text>
  <rect class="d-box-accent" x="260" y="70" width="180" height="80" rx="12"/>
  <text class="d-label-strong" x="350" y="105" text-anchor="middle">Index</text>
  <text class="d-label-muted" x="350" y="128" text-anchor="middle">الـ commit التالي</text>
  <rect class="d-box-primary" x="500" y="70" width="180" height="80" rx="12"/>
  <text class="d-label-strong" x="590" y="105" text-anchor="middle">Repository</text>
  <text class="d-label-muted" x="590" y="128" text-anchor="middle">commits مسجّلة</text>
  <path class="d-arrow" d="M200 90 L256 90" marker-end="url(#arrow)"/>
  <text class="d-code" x="228" y="55" text-anchor="middle">git add</text>
  <path class="d-arrow" d="M440 90 L496 90" marker-end="url(#arrow)"/>
  <text class="d-code" x="468" y="55" text-anchor="middle">git commit</text>
  <path class="d-arrow d-dashed" d="M500 140 C470 210 420 210 400 154" marker-end="url(#arrow)"/>
  <text class="d-code" x="470" y="230" text-anchor="middle">git restore --staged</text>
  <path class="d-arrow d-dashed" d="M260 140 C230 210 180 210 160 154" marker-end="url(#arrow)"/>
  <text class="d-code" x="200" y="230" text-anchor="middle">git restore</text>
  <text class="d-label-muted" x="350" y="262" text-anchor="middle">المتقطّع: نسخ عكسي. git restore يكتب فوق ملفك.</text>
</svg>
:::

بعد الـ commit لا يُفرَّغ الـ index. بل يظل يحمل اللقطة الكاملة التي سجّلتها للتو، فيطابق آخر commit إلى أن تجهّز شيئًا جديدًا. لهذا فإن «التغييرات المجهّزة» تعني الفرق بين الـ index وآخر commit.

## رؤية الفرق: status و diff بنوعيه

هذا عمل الأمسية كما يعرضه `git status`:

```text
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	styles.css

no changes added to commit (use "git add" and/or "git commit -a")
```

يخبرك `git status` أيّ الملفات تختلف. ولرؤية الأسطر نفسها استخدم `git diff`، وتذكّر أن هناك مقارنتين:

```bash
git diff            # working tree vs index: what you haven't staged yet
git diff --staged   # index vs last commit: what the next commit will contain
```

الخيار `--cached` مرادف أقدم لـ `--staged`؛ وستراهما كليهما في الشروحات. اجعل تشغيل `git diff --staged` عادة قبل كل commit مباشرة. إنها اللحظة الأخيرة لتلاحظ `console.log` نسيته أو ملفًا لا ينتمي إلى هذا الـ commit.

## تقسيم ملف واحد على اثنين من الـ commits

تصحيح الخطأ الإملائي وشريط التنقّل كلاهما في `index.html`. الأمر `git add index.html` سيجهّزهما معًا. جهّز تصحيح الخطأ وحده بدلًا من ذلك:

```bash
git add -p index.html
```

يعرض Git كل كتلة متغيّرة، وتُسمّى hunk، ويسأل `Stage this hunk [y,n,q,a,d,s,e,?]?` (تعرض الإصدارات الأحدث حروفًا إضافية، والحرف `?` يشرحها كلها). أجب بـ `y` على كتلة الخطأ الإملائي و `n` على كتلة شريط التنقّل (والحرف `s` يقسم الكتلة إن كانت كبيرة جدًا). ثم:

```bash
git diff --staged          # only the typo fix
git commit -m "Fix spelling of name in header"
git add index.html styles.css
git commit -m "Add navigation bar with base styles"
```

اثنان من الـ commits، لكل منهما غرض واحد. ولاحقًا، إن احتجت إلى إزالة شريط التنقّل، تستطيع التراجع عن ذلك الـ commit وحده.

## ما الحجم المناسب للـ commit؟

الـ commit الجيد يفعل شيئًا واحدًا تستطيع وصفه بجملة قصيرة دون كلمة «و». الرسالة "Fix spelling of name in header" تنجح في هذا الاختبار. أما "Add nav, fix typo, tweak colours" فتفشل، ويظهر الفشل لاحقًا: حين يتبيّن أن الألوان خاطئة، فإن التراجع عن ذلك الـ commit يزيل شريط التنقّل أيضًا ويعيد الخطأ الإملائي.

لا يوجد حدّ لعدد الأسطر. الـ commit الذي يعيد تسمية class في CSS عبر اثني عشر ملفًا يظل فكرة واحدة، وتقسيمه سيترك الموقع معطّلًا بين الخطوتين. اسعَ إلى commits يبقى المشروع بعدها وقبلها يعمل، وكل واحد منها خطوة تستطيع شرحها للمراجِع في نَفَس واحد. ستقدّر هذا في القسم الرابع، حين يصبح التراجع عن commit واحد أمرًا من سطر واحد بدل ساعات من العمل الجراحي الدقيق.

:::note لماذا توجد منطقة تجهيز في Git أصلًا
بعض أنظمة التحكم في الإصدارات تسجّل كل ملف متغيّر دفعة واحدة. يوجد الـ index في Git لكي يختلف ما *فعلته* (أمسية من التعديلات المختلطة) عمّا *تسجّله* (خطوات نظيفة لكل منها غرض واحد). لست مضطرًا لاستخدامه ببراعة في كل مرة، لكنه موجود حين يصبح عملك فوضويًا.
:::

## الحالة المختصرة، والتراجع

يضغط `git status -s` المعلومات نفسها في عمودين: الأيسر يقارن الـ index بآخر commit، والأيمن يقارن الـ working tree بالـ index.

```text
M  README.md
 M index.html
MM styles.css
?? projects.html
```

`README.md` مجهّز؛ و `index.html` فيه تغييرات غير مجهّزة؛ و `styles.css` فيه من الاثنين؛ و `projects.html` غير متتبَّع (untracked).

لإخراج ملف من الـ index دون أن تخسر تعديلاتك، استخدم `git restore --staged styles.css`. ولرمي التعديلات غير المجهّزة والعودة إلى نسخة الـ index، استخدم `git restore styles.css`. الأمر الثاني هو الوحيد في هذا الدرس الذي يُتلف عملًا: التغييرات التي لم تُجهَّز ولم تُسجَّل قط لا يمكن استرجاعها.

:::mistake الثقة بـ git commit -a مع الملفات الجديدة
`git commit -am "Add projects page"` يجهّز كل ملف *متتبَّع ومعدّل* ثم ينشئ الـ commit. أما `projects.html` الجديد كليًا فهو untracked، فيُستبعد بصمت وتكذب الرسالة. استخدم `-a` فقط حين لا يعرض `git status` ملفات غير متتبَّعة تهمّك، أو شغّل `git add` للملفات الجديدة أولًا.
:::

صرت قادرًا على تسجيل السجلّ الذي تقصده بالضبط. في الدرس التالي ستقرأ هذا السجلّ، وترى لماذا يسمّيه Git رسمًا بيانيًا (graph) لا قائمة.
