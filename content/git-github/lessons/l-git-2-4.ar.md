---
summary: نفّذ rebase لفرع feature على main لتُبقي السجلّ خطيًا، وتعامل مع التعارضات في منتصف الـ rebase، ورتّب الـ commits تفاعليًا، واعرف متى تقول القاعدة الذهبية إن عليك الدمج بدلًا من ذلك.
takeaways:
  - "`git rebase main` يعيد تشغيل commits فرعك فوق طرف `main`، فينشئ commits جديدة بمعرّفات جديدة."
  - بعد الـ rebase، يصبح دمج الفرع في `main` عملية fast-forward، فيبقى السجلّ خطًا مستقيمًا.
  - "أثناء تعارض الـ rebase، أصلح الملف، ونفّذ `git add` له، ثم `git rebase --continue`؛ و `git rebase --abort` يلغي الـ rebase بكامله."
  - القاعدة الذهبية ألّا تنفّذ rebase أبدًا على commits ربما بنى عليها آخرون؛ نفّذه فقط على عملك الخاص غير المشارَك.
  - "إن اضطررت إلى تحديث فرع رفعته بالفعل، فاستخدم `git push --force-with-lease`، ولا تستخدم `--force` المجرّد أبدًا."
further:
  - title: Rebasing (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
  - title: git rebase reference
    url: https://git-scm.com/docs/git-rebase
  - title: About Git rebase (GitHub Docs)
    url: https://docs.github.com/en/get-started/using-git/about-git-rebase
quiz:
  - q: في فرعك `projects-grid` الـ commitان `d4` و `e5`. تشغّل عليه `git rebase main`. ماذا يحدث لـ `d4` و `e5`؟
    options:
      - text: يُنقلان، محتفظين بمعرّفاتهما، ليقعا بعد طرف `main`.
        why: لا يمكن نقل الـ commits، لأن معرّف الـ commit يتضمّن أباه. أب جديد يعني commit جديدًا.
      - text: يُدمجان في commit واحد على `main`.
        why: لا يضغط الـ rebase الـ commits افتراضيًا ولا يلمس `main`. إنه يعيد كتابة الفرع الذي أنت عليه.
      - text: ينشئ Git commits جديدة بالتغييرات نفسها فوق `main`؛ ويشير الفرع إليها، وتصبح الأصلية بلا مرجع.
        why: صحيح. الـ commits المُعاد تشغيلها (وتُكتب غالبًا `d4'` و `e5'`) لها معرّفات جديدة. وتبقى الأصلية في الـ reflog لفترة.
      - text: يُحذفان وعليك إعادة تسجيل العمل.
        why: يعيد الـ rebase تشغيل تغييراتك تلقائيًا. لا شيء يحتاج إلى إعادة يدوية ما لم يقع تعارض.
    answer: 2
  - q: في منتصف الـ rebase، يبلّغ Git عن تعارض في `projects.html`. حرّرت الملف حتى صار سليمًا. ماذا تشغّل بعد ذلك؟
    options:
      - text: "`git commit -m \"Fix conflict\"`"
        why: أثناء الـ rebase، ينشئ Git الـ commits بنفسه. إنشاء commit يدويًا يضيف commit زائدًا ويربك إعادة التشغيل.
      - text: "`git add projects.html`، ثم `git rebase --continue`"
        why: صحيح. التجهيز يعلّم التعارض بأنه حُلّ؛ و `--continue` ينهي ذلك الـ commit ويعيد تشغيل البقية.
      - text: "`git merge --continue`"
        why: أنت في rebase، لا في merge. لكل عملية أمر الإكمال الخاص بها.
      - text: "`git rebase main` مجددًا من البداية"
        why: هناك rebase قيد التنفيذ أصلًا، فيرفض Git بدء آخر. أكمل الحالي أو ألغِه.
    answer: 1
  - q: أيّ الحالات التالية تخرق القاعدة الذهبية للـ rebase؟
    options:
      - text: تنفيذ rebase لفرعك المحلي `footer` الذي لم يُرفع قط على `main`.
        why: لا أحد غيرك يملك هذه الـ commits، فإعادة كتابتها لا تؤثّر إلا فيك. هذا هو الاستخدام المثالي للـ rebase.
      - text: استخدام `git rebase -i HEAD~3` لضغط إصلاحات الأخطاء الإملائية قبل فتح pull request.
        why: ترتيب الـ commits الخاصة بك التي لم تشاركها هو بالضبط الغرض من الـ rebase التفاعلي.
      - text: تشغيل `git pull --rebase` لوضع الـ commits التي لم ترفعها بعد فوق الـ commits الجديدة لزملائك.
        why: هذا يعيد كتابة الـ commits المحلية التي لم تُرفع فقط، لذا فهو آمن وشائع.
      - text: تنفيذ rebase لفرع `main` المشترك ورفعه بالقوة (force-push) بينما لدى زملائك عمل مبني عليه.
        why: صحيح. commits زملائك تقع فوق المعرّفات القديمة التي استبدلتها للتو، فينتج عن الـ pull التالي لديهم commits مكرّرة وتعارضات محيّرة.
    answer: 3
  - q: نفّذت rebase لفرع الـ pull request الخاص بك، والآن يُرفض `git push` لأنه ليس fast-forward. ما الطريقة الآمنة لتحديثه؟
    options:
      - text: "`git push --force-with-lease`"
        why: صحيح. يكتب فوق الفرع البعيد فقط إن كان ما زال حيث رأيته آخر مرة، فلن تمحو بصمت commit رفعه شخص آخر منذ آخر fetch لك.
      - text: "`git push --force`"
        why: هذا يكتب فوق الـ remote مهما كان، بما في ذلك commits رفعها مراجِع منذ آخر fetch لك.
      - text: "`git pull` ثم الرفع."
        why: الـ pull يدمج الـ commits القديمة مرة أخرى بجانب نسخها المُعاد تأسيسها، فتبقى commits مكرّرة في الفرع.
    answer: 0
---

في الدرسين السابقين، كان جمع الفروع يعني الدمج، وكان السجلّ المتباعد يكسب merge commit. هذا صادق وآمن، لكن في repository مزدحم يبدأ `git log --graph` بالظهور كخريطة قطارات. الـ rebase (إعادة التأسيس) هو الطريقة الأخرى لجمع العمل: بدل أن يصل خطّين، ينقل خطك بحيث لا يبقى إلا خط واحد.

## ما الذي يفعله الـ rebase

انفصل فرعك `projects-grid` عن `main` عند `b2`. ومنذ ذلك الحين كسب `main` الـ commit ذا المعرّف `c3`، وفي فرعك `d4` و `e5`. من الفرع، شغّل:

```bash
git switch projects-grid
git rebase main
```

```text
Successfully rebased and updated refs/heads/projects-grid.
```

وجد Git الـ commits الموجودة على فرعك وليست على `main` (`d4` و `e5`)، ووضعها جانبًا، ونقل فرعك إلى طرف `main`، ثم أعاد تشغيل كل تغيير فوقه، commitًا تلو الآخر.

الـ commits المُعاد تشغيلها **commits جديدة**. التغييرات والرسائل نفسها، لكن الآباء مختلفون، فالمعرّفات مختلفة. هذه ليست تفصيلة؛ إنها القصة كلها لمعرفة متى يكون الـ rebase آمنًا. معرّف الـ commit يتضمّن أباه، لذا لا تستطيع نقل commit، بل تصنع نسخة منه في مكان آخر.

:::figure الـ rebase يعيد تشغيل commits فرعك على قاعدة جديدة
<svg viewBox="0 0 700 280" role="img" aria-labelledby="t1">
  <title id="t1">قبل: للـ commit ذي المعرّف b2 ابنان، c3 على main، و d4 ثم e5 على projects-grid. بعد الـ rebase: ما زال main ينتهي عند c3؛ وتلي c3 على خط مستقيم commits جديدة هي d4' و e5'، ويشير projects-grid إلى e5'. أما d4 و e5 القديمان فباهتان بلا مرجع.</title>
  <text class="d-label-strong" x="20" y="28">قبل</text>
  <circle class="d-box" cx="50" cy="100" r="22"/>
  <text class="d-code" x="50" y="105" text-anchor="middle">b2</text>
  <circle class="d-box" cx="150" cy="60" r="22"/>
  <text class="d-code" x="150" y="65" text-anchor="middle">c3</text>
  <circle class="d-box" cx="150" cy="140" r="22"/>
  <text class="d-code" x="150" y="145" text-anchor="middle">d4</text>
  <circle class="d-box" cx="240" cy="140" r="22"/>
  <text class="d-code" x="240" y="145" text-anchor="middle">e5</text>
  <path class="d-line" d="M130 68 L70 92"/>
  <path class="d-line" d="M130 132 L70 108"/>
  <path class="d-line" d="M218 140 L172 140"/>
  <text class="d-code" x="180" y="55">main</text>
  <text class="d-code" x="180" y="185">projects-grid</text>
  <text class="d-label-strong" x="350" y="28">بعد git rebase main</text>
  <circle class="d-box" cx="380" cy="100" r="22"/>
  <text class="d-code" x="380" y="105" text-anchor="middle">b2</text>
  <circle class="d-box" cx="470" cy="100" r="22"/>
  <text class="d-code" x="470" y="105" text-anchor="middle">c3</text>
  <circle class="d-box-primary" cx="560" cy="100" r="22"/>
  <text class="d-code" x="560" y="105" text-anchor="middle">d4'</text>
  <circle class="d-box-primary" cx="650" cy="100" r="22"/>
  <text class="d-code" x="650" y="105" text-anchor="middle">e5'</text>
  <path class="d-line" d="M448 100 L402 100"/>
  <path class="d-line" d="M538 100 L492 100"/>
  <path class="d-line" d="M628 100 L582 100"/>
  <text class="d-code" x="450" y="70">main</text>
  <text class="d-code" x="600" y="148">projects-grid</text>
  <circle class="d-box d-dashed" cx="470" cy="210" r="22"/>
  <text class="d-label-muted" x="470" y="215" text-anchor="middle">d4</text>
  <circle class="d-box d-dashed" cx="560" cy="210" r="22"/>
  <text class="d-label-muted" x="560" y="215" text-anchor="middle">e5</text>
  <path class="d-line d-dashed" d="M448 202 L395 120"/>
  <path class="d-line d-dashed" d="M538 210 L492 210"/>
  <text class="d-label-muted" x="380" y="262">commits قديمة: لا فرع يشير إليها الآن</text>
</svg>
:::

الآن صار `main` سلفًا لفرعك، فإدخال العمل يتمّ بـ fast-forward:

```bash
git switch main
git merge projects-grid    # Fast-forward
```

السجلّ خط مستقيم، كأنك بدأت العمل على الشبكة (grid) بعد تصحيح الخطأ الإملائي.

## التعارضات أثناء الـ rebase

لأن الـ rebase يعيد تشغيل الـ commits واحدًا تلو الآخر، فإن التعارض يوقفه عند commit بعينه. الروتين هو نفسه الذي تعلّمته في الدمج، مع كلمات مختلفة في النهاية:

```bash
# Git stops: CONFLICT (content): Merge conflict in projects.html
# edit projects.html, remove the markers, check it
git add projects.html
git rebase --continue      # finish this commit, replay the next
```

`git rebase --abort` يعيد الفرع تمامًا إلى حيث كان قبل أن تبدأ. و `git rebase --skip` يُسقط الـ commit المتعارض، ونادرًا ما يكون هذا ما تريده.

مفاجأة واحدة: أثناء الـ rebase يتبادل "ours" و "theirs" موقعيهما. أنت تعيد تشغيل الـ commits الخاصة بك فوق `main`، لذا فالـ HEAD (النصف العلوي من التعارض) هو طرف `main`، والـ commit الخاص بك هو النصف السفلي. اقرأ الأسماء الدالّة، لا حدسك.

## الترتيب بالـ rebase التفاعلي

قبل أن تشارك فرعًا، تستطيع إعادة كتابة الـ commits الخاصة به. يفتح `git rebase -i` قائمة مهام في محرّرك:

```bash
git rebase -i main
```

```text
pick 4b1e2c0 Add projects grid
pick 9a3d7f1 fix typo
pick c2e8b44 Grid gap on mobile
```

غيّر الكلمة التي أمام الـ commit واحفظ. `reword` يعدّل رسالته، و `squash` أو `fixup` يطويه في الـ commit الذي فوقه (مع الاحتفاظ برسالته أو التخلّص منها)، و `drop` يحذفه، وإعادة ترتيب الأسطر تعيد ترتيب الـ commits. تغيير `pick 9a3d7f1` إلى `fixup 9a3d7f1` يحوّل ثلاثة commits إلى اثنين نظيفين. هكذا يُبقي المحترفون commits من نوع "fix typo" خارج الـ pull request.

## القاعدة الذهبية

الـ rebase يستبدل الـ commits بنسخ منها. هذا غير ضارّ حين تكون الوحيد الذي يملكها. لكنه فوضى حين يكون شخص آخر قد بنى على الأصلية: سجلّه ما زال يحتوي `d4` و `e5`، وسجلّك يحتوي `d4'` و `e5'`، والـ pull التالي ينتج commits مكرّرة وتعارضات محيّرة.

إذن: **لا تنفّذ rebase على commits موجودة خارج الـ repository الخاص بك وقد يكون الناس بنوا عليها عملًا.** وعمليًا:

- نفّذ rebase بحرية على فروعك الخاصة قبل أن ترفعها أو قبل أن يلمسها أحد غيرك.
- لا تنفّذ rebase أبدًا على `main` أو على أي فرع يسحب منه آخرون.
- تنفيذ rebase على فرع الـ pull request الخاص بك بعد رفعه أمر شائع ومقبول إن لم يكن أحد غيرك ينشئ commits عليه. سيرفض Git الرفع العادي لأن السجلّ أُعيدت كتابته، فاستخدم:

```bash
git push --force-with-lease
```

`--force-with-lease` يكتب فوق الفرع البعيد فقط إن كان ما زال يشير إلى حيث رأيته آخر مرة. وإن رفع زميل شيئًا في الأثناء، يرفض بدل أن يمحو عمله.

:::mistake اللجوء إلى git push --force
`--force` المجرّد يكتب فوق الفرع البعيد دون أي شرط. إن رفع مراجِع إصلاحًا إلى فرعك قبل ساعة، فقد ضاع، ولا شيء على جهازك يحذّرك. اجعل `--force-with-lease` طريقتك الوحيدة للرفع بالقوة، ولا ترفع بالقوة إلى `main` أبدًا. وفي القسم الرابع ستجعل GitHub يرفض مثل هذه العمليات كليًا.
:::

## الـ merge أم الـ rebase؟

| | Merge | Rebase |
|---|---|---|
| السجلّ | سجلّ صادق، مع merge commits | خطّي، كأن العمل جرى بالتتابع |
| معرّفات الـ commits | لا تتغيّر | تُعاد كتابتها |
| آمن على الفروع المشتركة | نعم | لا |
| التعارضات | تُحلّ مرة واحدة | قد تتكرّر مع كل commit يُعاد تشغيله |

خيار افتراضي معقول: نفّذ rebase لفرع الـ feature الخاص بك على `main` لتبقى محدَّثًا ولترتّبه قبل المراجعة؛ وادمجه (غالبًا عبر pull request) لإيصاله. وكثير من الفرق تضبط أيضًا `git pull` ليعيد تأسيس الـ commits التي لم تُرفع بعد، وهذا ما ستضبطه في القسم التالي، حين يحصل موقعك الشخصي أخيرًا على remote.
