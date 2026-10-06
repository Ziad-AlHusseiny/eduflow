---
summary: اربط موقعك الشخصي بـ repository على GitHub، وارفع الفروع مع ضبط تتبّع الـ upstream، وابقَ متزامنًا باستخدام fetch و pull وأنت تفهم ما هو origin/main فعلًا.
takeaways:
  - الـ remote عنوان URL مسمّى لنسخة أخرى من الـ repository؛ و `origin` هو الاسم المتعارف عليه للنسخة التي استنسخت منها أو ترفع إليها.
  - "`origin/main` هو سجلّك المحلي لمكان `main` على الـ remote عند آخر fetch؛ ولا يتحرّك إلا حين تنفّذ fetch أو pull أو push."
  - "`git push -u origin <branch>` يرفع الفرع ويضبطه كـ upstream، فيعرف `git push` أو `git pull` المجرّدان لاحقًا إلى أين يذهبان."
  - "`git fetch` ينزّل دون أن يلمس فروعك؛ و `git pull` ينفّذ fetch ثم merge أو rebase."
  - "الرفع المرفوض يعني أن في الـ remote commits ليست لديك؛ اسحبها، ثم ارفع مجددًا، ولا تلجأ إلى القوة أبدًا."
further:
  - title: Working with Remotes (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes
  - title: Remote Branches (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches
  - title: Pushing commits to a remote repository
    url: https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository
  - title: git pull reference
    url: https://git-scm.com/docs/git-pull
quiz:
  - q: شغّلت `git fetch` فنزّل commitين جديدين على `main`. ما الذي تغيّر في الـ working tree لديك؟
    options:
      - text: صارت ملفاتك تتضمّن تغييرات الـ commitين الجديدين.
        why: هذا ما يفعله `git pull` في خطوته الثانية. أما `git fetch` وحده فلا يلمس ملفاتك ولا فروعك أبدًا.
      - text: تقدّم `main` المحلي لديك بـ commitين.
        why: الـ fetch يحدّث فروع التتبّع البعيدة مثل `origin/main`، ولا يحدّث `main` الخاص بك أبدًا.
      - text: دُمج الـ commitان وأُنشئ merge commit.
        why: لا يحدث أي دمج عند الـ fetch. أنت من يختار متى وكيف يدمج.
      - text: لا شيء؛ تحرّك `origin/main` فقط، وملفاتك و `main` لم تتغيّر.
        why: صحيح. الـ fetch آمن دائمًا. قارن بـ `git log main..origin/main` قبل أن تقرّر هل تدمج أم تنفّذ rebase.
    answer: 3
  - q: "يفشل `git push` بالرسالة: `Updates were rejected because the remote contains work that you do not have locally.` ما الإصلاح الصحيح؟"
    options:
      - text: شغّل `git pull` لتجلب commits الـ remote، وحُلّ أي تعارض، ثم `git push` مجددًا.
        why: صحيح. في الـ remote commits تنقصك؛ ادمجها أولًا، فيصبح رفعك fast-forward.
      - text: شغّل `git push --force` لتفوز نسختك.
        why: هذا سيحذف الـ commits التي رفعها شخص آخر. الرفع بالقوة ليس أبدًا الحلّ حين يكون الفرع المشترك متقدّمًا عليك.
      - text: احذف الـ repository المحلي واستنسخه من جديد.
        why: ستخسر الـ commits التي لم ترفعها. أما الـ pull فيدمج الطرفين دون خسارة أي شيء.
      - text: شغّل `git push -u origin main` لإعادة ضبط التتبّع.
        why: التتبّع ليس المشكلة. الفرع البعيد تقدّم، ورفعك لا يستطيع تقديمه بـ fast-forward.
    answer: 0
  - q: ماذا يضيف `-u` إلى `git push -u origin footer`؟
    options:
      - text: يرفع الملفات غير المتتبَّعة مع الـ commits.
        why: الرفع لا يرسل إلا commits. والملفات غير المتتبَّعة ليست جزءًا من أي commit.
      - text: يجعل الرفع أسرع بتخطّي التحقّق.
        why: "`-u` اختصار لـ `--set-upstream`. ولا علاقة له بالسرعة أو الفحوص."
      - text: يسجّل `origin/footer` كـ upstream لفرع `footer` المحلي، فلا يحتاج `git push` و `git pull` لاحقًا إلى أي وسائط.
        why: صحيح. تحتاجه مرة واحدة لكل فرع؛ وبعدها يعرض `git status` أيضًا عدد الـ commits المتقدّمة والمتأخّرة مقارنةً بـ `origin/footer`.
      - text: يحدّث كل فرع على الـ remote، لا `footer` وحده.
        why: لا يُرفع إلا الفرع الذي تسمّيه. ويوجد الخيار `--all` لرفع كل الفروع.
    answer: 2
  - q: في `main` المحلي لديك commit واحد لم ترفعه، وفي `origin/main` commitان لم تسحبهما. مع ضبط `pull.rebase` على `true`، ماذا يفعل `git pull`؟
    options:
      - text: ينشئ merge commit يجمع الـ commit الخاص بك مع الـ commitين البعيدين.
        why: هذا هو السلوك مع `pull.rebase false`. أما مع `true` فينفّذ Git rebase بدل الدمج.
      - text: ينفّذ fetch، ثم يعيد تشغيل الـ commit غير المرفوع فوق الـ commitين البعيدين.
        why: صحيح. يبقى السجلّ خطيًا، ولا تُعاد كتابة إلا الـ commit الخاص بك الذي لم يُرفع، وهذا يحترم القاعدة الذهبية.
      - text: يرفض، لأن الفرعين تباعدا.
        why: هذا ما يفعله `pull.ff only`. أما `pull.rebase true` فيعالج التباعد بالـ rebase.
    answer: 1
---

حتى الآن يعيش موقعك الشخصي في مكان واحد، حاسوبك المحمول. إن تعطّل القرص ضاع كل شيء، ولا يستطيع أحد غيرك أن يراه أو يراجعه. الـ **remote** (المستودع البعيد) نسخة أخرى من الـ repository في مكان آخر، على GitHub في الغالب. ومهمّة Git أن يُبقي النسختين متزامنتين، وهو يفعل ذلك بأربعة أوامر أساسية: `clone` و `fetch` و `pull` و `push`.

## ضع الموقع الشخصي على GitHub

على github.com، أنشئ repository جديدًا باسم `portfolio`. اترك "Add a README" وخيارات التهيئة الأخرى دون تحديد: فالـ repository المحلي لديك له سجلّ بالفعل، و commit إضافي على GitHub سيعطيك سجلّين لا علاقة بينهما عليك التوفيق بينهما. بعد ذلك يعرض GitHub الأوامر اللازمة لربط repository موجود. وخلاصتها:

```bash
git remote add origin https://github.com/maya-okafor/portfolio.git
git remote -v
git push -u origin main
```

`git remote add` يعطي عنوان URL اسمًا قصيرًا. و **origin** مجرد عُرف، الاسم الذي يستخدمه Git تلقائيًا حين تستنسخ، لكن الجميع يستخدمه، فاستخدمه أنت أيضًا. الرفع يحمّل الـ commits الخاصة بك وينشئ `main` على GitHub. في المرة الأولى سيطلب منك Git المصادقة؛ والدرس التالي يشرح إعدادها كما يجب بمفاتيح SSH أو بمدير بيانات اعتماد.

وإن كنت تستخدم GitHub CLI، فالأمر `gh repo create portfolio --public --source=. --remote=origin --push` يفعل كل ذلك دفعة واحدة.

أما إن بدأت من الجهة الأخرى، بـ repository موجود أصلًا على GitHub، فإنك تستنسخه (clone) بدلًا من ذلك:

```bash
git clone https://github.com/maya-okafor/portfolio.git
```

الـ clone ينشئ المجلد، وينزّل كل commit، ويضيف remote اسمه `origin`، وينقلك إلى `main` مع إعداد التتبّع جاهزًا.

## فروع التتبّع البعيدة: ذاكرة Git عن الـ remote

بعد الرفع، يعرض `git branch -a` شيئًا جديدًا:

```text
* main
  remotes/origin/main
```

`origin/main` **فرع تتبّع بعيد** (remote-tracking branch): ملاحظة يحتفظ بها الـ repository الخاص بك عن مكان `main` على `origin` في آخر مرة تواصلت معه. لا تنشئ عليه commits أبدًا. ولا يتحرّك إلا حين تنفّذ fetch أو pull أو push. لهذا يستطيع `git status` أن يقول "Your branch is up to date with 'origin/main'" بينما رفع زميلك شيئًا قبل خمس دقائق: لم يسأل Git موقع GitHub منذ ذلك الحين.

:::figure فرعك، وملاحظتك عن الـ remote، والـ remote نفسه
<svg viewBox="0 0 700 270" role="img" aria-labelledby="t1">
  <title id="t1">يسارًا، حاسوبك: main يشير إلى c3؛ و origin/main، آخر نسخة معروفة لديك، يشير إلى b2. يمينًا، GitHub: main يشير إلى d4، وهو commit رفعه زميل. git fetch ينزّل d4 ويحرّك origin/main؛ ثم يدمجه git pull أيضًا في main لديك؛ و git push يرسل الـ commits الخاصة بك ويحرّك main على GitHub.</title>
  <rect class="d-box" x="20" y="20" width="330" height="230" rx="14"/>
  <text class="d-label-strong" x="40" y="48">حاسوبك</text>
  <circle class="d-box" cx="70" cy="130" r="22"/>
  <text class="d-code" x="70" y="135" text-anchor="middle">b2</text>
  <circle class="d-box-primary" cx="170" cy="130" r="22"/>
  <text class="d-code" x="170" y="135" text-anchor="middle">c3</text>
  <path class="d-line" d="M148 130 L92 130"/>
  <rect class="d-box-accent" x="135" y="70" width="70" height="30" rx="8"/>
  <text class="d-code" x="170" y="90" text-anchor="middle">main</text>
  <rect class="d-box-warn" x="25" y="175" width="100" height="30" rx="8"/>
  <text class="d-code" x="75" y="195" text-anchor="middle">origin/main</text>
  <path class="d-line" d="M70 152 L70 175"/>
  <text class="d-label-muted" x="40" y="236">origin/main: آخر موضع معروف هو b2</text>
  <rect class="d-box" x="440" y="20" width="240" height="230" rx="14"/>
  <text class="d-label-strong" x="460" y="48">GitHub (origin)</text>
  <circle class="d-box" cx="490" cy="130" r="22"/>
  <text class="d-code" x="490" y="135" text-anchor="middle">b2</text>
  <circle class="d-box-success" cx="600" cy="130" r="22"/>
  <text class="d-code" x="600" y="135" text-anchor="middle">d4</text>
  <path class="d-line" d="M578 130 L512 130"/>
  <rect class="d-box-accent" x="565" y="70" width="70" height="30" rx="8"/>
  <text class="d-code" x="600" y="90" text-anchor="middle">main</text>
  <text class="d-label-muted" x="460" y="200">d4: رفعه زميل</text>
  <path class="d-arrow" d="M440 110 L354 110" marker-end="url(#arrow)"/>
  <text class="d-code" x="397" y="100" text-anchor="middle">fetch</text>
  <path class="d-arrow" d="M354 160 L440 160" marker-end="url(#arrow)"/>
  <text class="d-code" x="397" y="182" text-anchor="middle">push</text>
</svg>
:::

## الـ upstream و git push -u

الخيار `-u` في `git push -u origin main` (وصيغته الطويلة `--set-upstream`) يسجّل أن `main` المحلي لديك **يتتبّع** `origin/main`. ومن ثم:

- يعرف `git push` أو `git pull` المجرّدان على `main` إلى أين يذهبان؛
- يعرض `git status` عبارات مثل "ahead 2" أو "behind 1" مقارنةً بـ `origin/main`؛
- يسرد `git branch -vv` كل فرع مع الـ upstream الخاص به وعدد الـ commits المتقدّمة والمتأخّرة.

كل فرع جديد يحتاجه مرة واحدة، عند رفعه الأول: `git push -u origin footer`.

## الـ fetch أولًا، ثم الـ pull

`git fetch` يسأل الـ remote عمّا هو جديد، وينزّل الـ commits، ويحرّك فروع التتبّع البعيدة لديك. لا يلمس أبدًا فروعك أو ملفاتك، لذا فهو آمن دائمًا:

```bash
git fetch
git status                       # "Your branch is behind 'origin/main' by 1 commit"
git log --oneline main..origin/main   # what's new over there
```

`git pull` هو `git fetch` يتبعه دمج الـ upstream في فرعك الحالي. إن لم تكن لديك commits محلية خاصة بك، فهذا fast-forward. أما إن كان في الطرفين commits جديدة، فعلى Git أن ينفّذ merge أو rebase، والإصدارات الحديثة من Git ترفض التخمين:

```text
fatal: Need to specify how to reconcile divergent branches.
```

اتّخذ القرار مرة واحدة:

```bash
git config --global pull.rebase true    # replay my unpushed commits on top (my default)
# or: git config --global pull.rebase false   (create a merge commit)
# or: git config --global pull.ff only        (refuse unless it's a fast-forward)
```

أنصح بـ `pull.rebase true`. فهو لا يعيد كتابة إلا الـ commits الخاصة بك التي لم تُرفع بعد، وهذا ما تسمح به القاعدة الذهبية، ويُبقي السجلّ خاليًا من commits من نوع "Merge branch 'main' of github.com:…" التي لا تقول شيئًا.

## إيقاع يومي

اجمع هذه الأوامر معًا وستبدو كل جلسة عمل على الموقع الشخصي متشابهة في كل مرة. ابدأ بالانتقال إلى `main` وتنفيذ pull، لتبدأ مما هو موجود فعلًا على GitHub لا مما كان موجودًا الأسبوع الماضي. أنشئ فرعًا للتغيير. أنشئ الـ commits أثناء العمل، وارفع الفرع مبكرًا، حتى لو لم يكتمل: الفرع المرفوع نسخة احتياطية، وهو مرئي لكل من يساعدك. وقبل أن تفتحه للمراجعة، نفّذ fetch مجددًا ثم rebase على `origin/main` المحدَّث إن كان قد تحرّك. هذه العادة وحدها تمنع معظم عمليات الرفع المرفوضة والتعارضات المفاجئة التي يلوم الناس Git عليها.

```bash
git switch main && git pull
git switch -c projects-filter
# …work and commit…
git push -u origin projects-filter
```

## حين يُرفض الرفع

إن رفع أحدهم شيئًا إلى `main` منذ آخر fetch لك، يُرفض رفعك:

```text
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/maya-okafor/portfolio.git'
```

في الـ remote commits ليست لديك. اسحبها، وحُلّ أي تعارض بالروتين الذي تعلّمته في القسم الثاني، وشغّل فحوصك، ثم ارفع مجددًا.

:::mistake تجاوز الرفض بالقوة
الرفض موجود لأن الرفع كان سيرمي commits شخص آخر. و `git push --force` يفعل ذلك بالضبط، وهو أكثر الطرق شيوعًا لخسارة عمل زميل. على الفرع المشترك، الحلّ دائمًا `git pull` ثم `git push`.
:::

:::tip أبقِ قائمة فروعك صادقة
حين تُحذف الفروع على GitHub بعد دمجها، تبقى ملاحظاتك من نوع `origin/footer`. الأمر `git fetch --prune` يزيلها، و `git config --global fetch.prune true` يجعل كل fetch يفعل ذلك.
:::

طلب منك رفعك الأول بيانات الاعتماد. في الدرس التالي ستُعدّ المصادقة كما يجب، فيتوقّف Git عن السؤال ويعرف GitHub أنك أنت فعلًا.
