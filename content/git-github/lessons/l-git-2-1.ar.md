---
summary: أنشئ الفروع وانتقل بينها وأعد تسميتها واحذفها وأنت تعرف أن كلًا منها مؤشّر متحرّك إلى commit، واخرج بسلام من حالة الـ detached HEAD.
takeaways:
  - الـ branch ملف صغير يحمل معرّف commit واحد؛ إنشاؤه لا ينسخ شيئًا ويستغرق أجزاء من الثانية.
  - الـ HEAD يسمّي الفرع الذي أنت عليه، وكل commit جديد يحرّك ذلك الفرع إلى الأمام ويتحرّك الـ HEAD معه.
  - "`git switch -c <name>` ينشئ فرعًا عند الـ commit الحالي وينقلك إليه في خطوة واحدة."
  - الـ detached HEAD يشير مباشرة إلى commit؛ احفظ أي عمل أنجزته هناك بـ `git switch -c <name>` قبل أن تغادر.
  - "`git restore --source=<branch> <file>` ينسخ ملفًا واحدًا من فرع آخر دون الانتقال إليه."
further:
  - title: Branches in a Nutshell (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
  - title: git switch reference
    url: https://git-scm.com/docs/git-switch
  - title: git branch reference
    url: https://git-scm.com/docs/git-branch
quiz:
  - q: أنت على `main` عند الـ commit ذي المعرّف `b2e0`، وتشغّل `git switch -c footer`، ثم تنشئ الـ commit ذا المعرّف `f1a3`. إلى أين يشير `main` و `footer` الآن؟
    options:
      - text: كلاهما يشير إلى `f1a3`، لأنهما أُنشئا من الـ commit نفسه.
        why: الفروع لا تبقى مرتبطة ببعضها. وحده الفرع الذي يرتبط به الـ HEAD يتحرّك حين تنشئ commit.
      - text: "`main` يشير إلى `f1a3` و `footer` يشير إلى `b2e0`."
        why: هذا معكوس. أنت انتقلت إلى `footer`، لذا فهو الذي يتحرّك.
      - text: لم يتحرّك أيّ منهما؛ فالفروع لا تتحرّك إلا عند الرفع (push).
        why: إنشاء الـ commit يحرّك الفرع الحالي فورًا. أما الرفع فيتعلّق بنسخ الـ commits إلى remote.
      - text: "`main` ما زال يشير إلى `b2e0`؛ و `footer` تحرّك إلى `f1a3`."
        why: صحيح. كان الـ HEAD مرتبطًا بـ `footer`، فقدّم الـ commit الجديد `footer` إلى الأمام وترك `main` في مكانه.
    answer: 3
  - q: ماذا يحتوي الملف `.git/HEAD` وأنت على فرع `footer`؟
    options:
      - text: "`ref: refs/heads/footer`"
        why: صحيح. الـ HEAD يحمل عادةً اسم فرع، لا معرّف commit. وهذه الإحالة غير المباشرة هي ما يسمح للـ commits بتحريك الفرع.
      - text: المعرّف المكوّن من 40 حرفًا لآخر commit على `footer`.
        why: هذا ما يحمله ملف الفرع `.git/refs/heads/footer`. الـ HEAD يشير إلى الفرع، والفرع يشير إلى الـ commit.
      - text: قائمة بكل الفروع في الـ repository.
        why: الأمر `git branch` يبني هذه القائمة بقراءة ملفات الفروع. أما الـ HEAD فيخزّن مكانك فقط.
    answer: 0
  - q: انتقلت إلى commit قديم لتتفقّده، وأجريت إصلاحًا سريعًا وسجّلته في commit. يقول Git إنك في حالة "detached HEAD". كيف تحتفظ بذلك الـ commit؟
    options:
      - text: شغّل `git switch main`؛ وسيأتي الـ commit معك.
        why: الانتقال بعيدًا يترك الـ commit خلفك دون فرع يشير إليه. يصبح ضياعه سهلًا، ويُزال في النهاية بعملية تنظيف المهملات (garbage collection).
      - text: لا شيء؛ كل commit يُحفظ على `main` تلقائيًا.
        why: في حالة الـ detached HEAD، لا تنتمي الـ commits الجديدة إلى أي فرع على الإطلاق، وهذا هو الخطر بعينه.
      - text: شغّل `git switch -c old-fix` لتضع فرعًا عليه.
        why: صحيح. الفرع الذي يشير إلى الـ commit يجعله قابلًا للوصول، فيصبح آمنًا. ويمكنك دمجه لاحقًا.
      - text: شغّل `git commit --attach`.
        why: لا يوجد خيار `--attach`. ربط العمل بالسجلّ يعني إنشاء فرع عنده.
    answer: 2
  - q: في فرعك `dark-mode` ملف `styles.css` جاهز تريده على `footer` أيضًا، دون دمج بقية عمل `dark-mode`. أنت على `footer`. أيّ أمر يفعل ذلك؟
    options:
      - text: "`git switch dark-mode styles.css`"
        why: "`git switch` يبدّل الفروع. ولا يقبل مسارات ملفات."
      - text: "`git restore --source=dark-mode styles.css`"
        why: صحيح. يكتب `styles.css` من لقطة `dark-mode` إلى الـ working tree؛ ثم تراجعه وتجهّزه وتسجّله في commit على `footer`.
      - text: "`git branch dark-mode styles.css`"
        why: هذه الصيغة تحاول إنشاء فرع اسمه `dark-mode` يبدأ من commit اسمه `styles.css`، فتفشل.
      - text: "`git merge dark-mode -- styles.css`"
        why: الدمج يجمع دائمًا commits كاملة. ولا توجد طريقة لدمج ملف واحد.
    answer: 1
---

في أنظمة التحكم في الإصدارات القديمة، كان الـ branch (الفرع) نسخة كاملة من المشروع، بطيئة الإنشاء ومؤلمة الدمج، فكان الناس يتجنّبونها. أما في Git فالفرع يكاد لا يكلّف شيئًا. وهذا يغيّر طريقة عملك: كل فكرة أو إصلاح أو تجربة على موقعك الشخصي يمكن أن تحصل على فرعها الخاص، ورمي الفرع رخيص كإنشائه تمامًا.

## الفرع ورقة لاصقة

انظر داخل الـ repository:

```bash
cat .git/refs/heads/main
```

```text
c39be1142d6f0a8e7b1c5d93e2f4a0b6c8d7e912
```

هذا هو فرع `main` بكامله: ملف يحتوي معرّف commit واحدًا. الـ **branch** مؤشّر مسمّى ومتحرّك إلى commit. السجلّ الذي خلفه لا يُخزَّن في الفرع؛ بل يُعثر عليه بتتبّع روابط الآباء انطلاقًا من ذلك الـ commit، كما فعلت في الدرس السابق.

فكيف يعرف Git على أيّ فرع أنت؟ بملف صغير آخر:

```bash
cat .git/HEAD
```

```text
ref: refs/heads/main
```

الـ **HEAD** مؤشّر إلى مؤشّر. إنه يسمّي فرعًا في العادة، وذلك الفرع يسمّي commit. حين تنشئ commit، ينشئ Git الـ commit الجديد ويجعل الـ commit الحالي أباه، ثم يحرّك الفرع الذي يسمّيه الـ HEAD إلى الـ commit الجديد. الـ HEAD نفسه لا يتغيّر؛ فهو ما زال «على `main`»، و `main` هو الذي تقدّم.

لا تحتاج إلى قراءة هذه الملفات يوميًا (وفي الـ repositories الأقدم أو الأكثر نشاطًا قد تُحزم معرّفات الفروع في `.git/packed-refs` بدلًا من ذلك)، لكن رؤيتها مرة واحدة تزيل الغموض. كل ما في هذا القسم يدور حول تحريك هذه الأوراق اللاصقة على الرسم البياني.

## إنشاء الفروع والتنقّل بينها

التغيير التالي في موقعك الشخصي هو footer للموقع. أعطه فرعًا:

```bash
git switch -c footer
```

```text
Switched to a new branch 'footer'
```

الخيار `-c` ينشئ الفرع عند الـ commit الحالي وينقلك إليه. والصيغة ذات الخطوتين هي `git branch footer` ثم `git switch footer`. الآن سجّل بعض العمل:

```bash
git add index.html styles.css
git commit -m "Add site footer with contact links"
```

:::figure إنشاء الـ commit يحرّك الفرع المرتبط بالـ HEAD
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">قبل: الـ commits a1c9 و b2e0 و c39b متتالية؛ main و footer يشيران كلاهما إلى c39b؛ والـ HEAD يشير إلى footer. بعد الـ commit: commit جديد f1a3 يلي c39b؛ تحرّك footer والـ HEAD إلى f1a3؛ وبقي main على c39b.</title>
  <text class="d-label-strong" x="20" y="30">قبل</text>
  <circle class="d-box" cx="60" cy="90" r="24"/>
  <text class="d-code" x="60" y="95" text-anchor="middle">a1c9</text>
  <circle class="d-box" cx="150" cy="90" r="24"/>
  <text class="d-code" x="150" y="95" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="240" cy="90" r="24"/>
  <text class="d-code" x="240" y="95" text-anchor="middle">c39b</text>
  <path class="d-line" d="M126 90 L84 90"/>
  <path class="d-line" d="M216 90 L174 90"/>
  <rect class="d-box-accent" x="200" y="130" width="80" height="30" rx="8"/>
  <text class="d-code" x="240" y="150" text-anchor="middle">main</text>
  <rect class="d-box-accent" x="200" y="170" width="80" height="30" rx="8"/>
  <text class="d-code" x="240" y="190" text-anchor="middle">footer</text>
  <rect class="d-box-warn" x="200" y="210" width="80" height="30" rx="8"/>
  <text class="d-code" x="240" y="230" text-anchor="middle">HEAD</text>
  <path class="d-line" d="M240 114 L240 130"/>
  <text class="d-label-strong" x="370" y="30">بعد git commit</text>
  <circle class="d-box" cx="400" cy="90" r="24"/>
  <text class="d-code" x="400" y="95" text-anchor="middle">a1c9</text>
  <circle class="d-box" cx="490" cy="90" r="24"/>
  <text class="d-code" x="490" y="95" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="580" cy="90" r="24"/>
  <text class="d-code" x="580" y="95" text-anchor="middle">c39b</text>
  <circle class="d-box-primary" cx="660" cy="90" r="24"/>
  <text class="d-code" x="660" y="95" text-anchor="middle">f1a3</text>
  <path class="d-line" d="M466 90 L424 90"/>
  <path class="d-line" d="M556 90 L514 90"/>
  <path class="d-line" d="M636 90 L604 90"/>
  <rect class="d-box-accent" x="540" y="130" width="80" height="30" rx="8"/>
  <text class="d-code" x="580" y="150" text-anchor="middle">main</text>
  <path class="d-line" d="M580 114 L580 130"/>
  <rect class="d-box-accent" x="620" y="170" width="80" height="30" rx="8"/>
  <text class="d-code" x="660" y="190" text-anchor="middle">footer</text>
  <rect class="d-box-warn" x="620" y="210" width="80" height="30" rx="8"/>
  <text class="d-code" x="660" y="230" text-anchor="middle">HEAD</text>
  <path class="d-line" d="M660 114 L660 170"/>
</svg>
:::

لم يُمسّ `main`. انتقل إليه فيختفي الـ footer من ملفاتك؛ وانتقل إلى `footer` مجددًا فيعود:

```bash
git switch main      # working tree now matches main's snapshot
git switch footer    # and now footer's
git switch -         # back to whichever branch you were on before
```

الانتقال يعيد كتابة الملفات في الـ working tree لتطابق اللقطة الهدف. التغييرات غير المسجّلة تنتقل معك إن لم تتعارض مع الهدف. أما إن كانت ستُكتب فوقها، فيرفض Git الانتقال ويطلب منك أن تسجّلها في commit أو تخبّئها (stash) أولًا. هذا الرفض يحميك؛ فلا تبحث عن طريقة للالتفاف عليه. سجّل العمل في commit، أو انتظر درس الـ stash في القسم الرابع.

:::tip أنشئ فرعًا حتى وأنت تعمل وحدك
من المغري أن تسجّل الـ commits مباشرة على `main` في مشروع فردي. لكن تخصيص فرع لكل تغيير يُبقي `main` جاهزًا للنشر دائمًا: إن جاء الـ footer سيئًا، تحذف الفرع ولا يعرف `main` عنه شيئًا. وهي أيضًا العادة نفسها التي تحتاجها الـ pull requests في القسم الثالث، فتدرّب عليها الآن والمخاطر منخفضة.
:::

## الترتيب والتنظيف

```bash
git branch                 # list local branches; * marks the current one
git branch -v              # with the commit each points to
git branch -m footer site-footer   # rename
git branch -d site-footer  # delete, only if its work is merged
git branch -D experiment   # force-delete, merged or not
```

يرفض `-d` حذف فرع لم تُدمج الـ commits الخاصة به في فرعك الحالي (أو في الـ upstream الخاص بالفرع، حين يصبح له upstream)، وهذه شبكة أمان مفيدة. أما `-D` فيتخطّى هذا الفحص. استخدمه فقط حين تكون متأكّدًا أن العمل غير مرغوب فيه.

سمِّ الفروع بحسب ما تفعله: `footer` و `fix-mobile-nav` و `projects-grid`. كثير من الفرق تضيف بادئة مثل `feat/` أو `fix/`؛ والشرطة المائلة مسموحة في أسماء الفروع.

## استعارة ملف واحد من فرع آخر

أحيانًا تريد ملفًا واحدًا من فرع آخر دون بقية عمله. يستطيع `git restore` القراءة من أي commit:

```bash
git restore --source=dark-mode styles.css
```

هذا يكتب فوق `styles.css` في الـ working tree بالنسخة الموجودة على `dark-mode`. افحصه بـ `git diff`، ثم جهّزه وسجّله في commit على فرعك الحالي. ستظل ترى شروحات قديمة تستخدم `git checkout` للانتقال والاسترجاع معًا؛ وقد فصل Git 2.23 هاتين المهمّتين إلى `git switch` و `git restore`، وهما أصعب في الخلط بينهما.

## الـ Detached HEAD

تستطيع أن تجعل الـ HEAD يشير مباشرة إلى commit بدل فرع، لتنظر إلى نسخة قديمة من الموقع:

```bash
git switch --detach a1c9d72
```

يحذّرك Git بأنك في حالة **detached HEAD** (HEAD منفصل). التفقّد آمن تمامًا. الخطر في إنشاء commits هناك: الـ commits الجديدة لا تنتمي إلى أي فرع، فحين تنتقل بعيدًا لا يشير إليها شيء، وتختفي بهدوء من `git log`.

:::mistake إنشاء commit في حالة detached HEAD ثم الانتقال بعيدًا
تنتقل إلى commit قديم، وتصلح شيئًا، وتسجّله، ثم تشغّل `git switch main`، فيبدو أن الإصلاح اختفى. قبل أن تنتقل بعيدًا، شغّل `git switch -c old-fix` لتضع فرعًا على الـ commit الجديد. وإن كنت قد انتقلت بالفعل، فقد طبع Git معرّف الـ commit الضائع في تحذير؛ والأمر `git switch -c old-fix <that-id>` ينقذه. والـ reflog في القسم الرابع يجده حتى لو فاتك التحذير.
:::

فرع `footer` جاهز، و `main` لم يتحرّك. في الدرس التالي ستجمع الاثنين بعملية merge (دمج).
