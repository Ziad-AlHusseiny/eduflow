---
summary: اختر طريقة التراجع المناسبة لأي خطأ (restore أو amend أو revert أو reset بأوضاعه الثلاثة)، واستخدم الـ reflog لاسترجاع commits ظننت أنها ضاعت.
takeaways:
  - اختر طريقة التراجع بحسب مكان الخطأ (الـ working tree أو الـ index أو commit محلي أو commit مشارَك)، لا بحسب الأمر الذي تتذكّره.
  - "`git revert <commit>` يضيف commit جديدًا يلغي commit قديمًا، وهي الطريقة الآمنة للتراجع عن أي شيء رُفع بالفعل."
  - "`git reset` يحرّك الفرع الحالي: `--soft` يُبقي التغييرات مجهّزة، و `--mixed` يُبقيها غير مجهّزة، و `--hard` يرميها."
  - "`git commit --amend` يستبدل آخر commit، لذا استخدمه قبل الرفع فقط."
  - "`git reflog` يسرد الأماكن التي مرّ بها الـ HEAD، فيمكن العثور على commits ضاعت بسبب reset أو rebase واستعادتها لأسابيع بعد ذلك."
further:
  - title: Undoing Things (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things
  - title: Reset Demystified (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified
  - title: git revert reference
    url: https://git-scm.com/docs/git-revert
  - title: git reflog reference
    url: https://git-scm.com/docs/git-reflog
quiz:
  - q: أنشأت commit باسم "Add contact form" قبل دقيقة، ولم ترفعه، ثم أدركت أنك نسيت تجهيز `contact.css`. ما الإصلاح الأنظف؟
    options:
      - text: "`git revert HEAD`، ثم أنشئ commit من جديد بالملفين."
        why: هذا يترك commitين زائدين (الأصلي وعكسه) في السجلّ بسبب خطأ لم يره أحد غيرك.
      - text: "`git reset --hard HEAD~1` وأعِد العمل."
        why: "`--hard` يرمي التغييرات المسجّلة من ملفاتك. ستعيد كتابة النموذج بيدك."
      - text: "`git add contact.css`، ثم `git commit --amend --no-edit`."
        why: صحيح. الـ amend يستبدل آخر commit غير مرفوع بآخر يتضمّن الملف؛ و `--no-edit` يُبقي الرسالة.
      - text: "`git restore --staged contact.css`"
        why: هذا يلغي تجهيز ملف. و `contact.css` ليس مجهّزًا بعد، وسيظل الـ commit يفتقده.
    answer: 2
  - q: بالأمس دمجت في `main` commit عطّل قائمة التنقّل على الجوال. وقد رُفع وسحبه زملاؤك. كيف تتراجع عنه؟
    options:
      - text: "`git revert <commit>` وارفع الـ commit الجديد."
        why: صحيح. الـ revert يسجّل commit جديدًا يطبّق التغيير المعاكس، فلا تُعاد كتابة سجلّ أحد، ويحصل الجميع على الإصلاح بـ pull عادي.
      - text: "`git reset --hard <commit>~1` ثم `git push --force`."
        why: هذا يعيد كتابة السجلّ المشترك. زملاؤك ما زال لديهم الـ commit السيئ، ورفعهم التالي سيعيده أو يُحدث فوضى.
      - text: "`git commit --amend` لتعديل الـ commit السيئ وإزالته."
        why: الـ amend لا يلمس إلا آخر commit لديك، وينشئ معرّفًا جديدًا، وسيحتاج أيضًا إلى رفع بالقوة إلى فرع مشترك.
      - text: "`git restore --source=HEAD~1 .` ثم الرفع دون commit."
        why: استرجاع الملفات يغيّر الـ working tree فقط. ولا يُرفع شيء حتى يُسجَّل في commit.
    answer: 0
  - q: تشغّل `git reset --soft HEAD~2` على commitين غير مرفوعين. أين تغييراتهما الآن؟
    options:
      - text: حُذفت من ملفاتك.
        why: هذا ما يفعله `--hard`. أما `--soft` فلا يلمس الـ index ولا الـ working tree أبدًا.
      - text: في الـ working tree لكن غير مجهّزة.
        why: هذا هو الوضع الافتراضي `--mixed`، الذي يعيد ضبط الـ index أيضًا.
      - text: ما زالت في الـ commitين، وقد صارا على فرع جديد.
        why: الـ reset لا ينشئ فروعًا. إنه يحرّك مؤشّر الفرع الحالي.
      - text: مجهّزة في الـ index، جاهزة لتُسجَّل من جديد في commit واحد.
        why: صحيح. تراجع الفرع commitين لكن الـ index والملفات احتفظت بكل شيء، وهي طريقة سريعة لضغط commits محلية.
    answer: 3
  - q: شغّلت `git reset --hard HEAD~3` بالخطأ فاختفت ثلاثة commits من `git log`. كيف تستعيدها؟
    options:
      - text: ضاعت؛ فـ `--hard` يحذف الـ commits نهائيًا.
        why: الـ reset يحرّك مؤشّرًا. والـ commits ما زالت موجودة، والـ reflog يتذكّر أين كان الـ HEAD.
      - text: شغّل `git reflog`، وجِد السطر السابق للـ reset، ثم `git reset --hard HEAD@{1}`.
        why: صحيح. `HEAD@{1}` يعني مكان الـ HEAD قبل حركة واحدة، أي قبل الـ reset مباشرة.
      - text: شغّل `git revert HEAD~3`.
        why: الـ revert ينشئ commit جديدًا يتراجع عن تغيير. ولا يعيد commits ضائعة إلى فرعك.
      - text: شغّل `git pull`، فهو يستعيد أي commits مفقودة.
        why: فقط إن كانت قد رُفعت. الـ pull يجلب ما هو موجود على الـ remote؛ أما الـ commits غير المرفوعة فموجودة في الـ repository المحلي وحده.
    answer: 1
---

كل شخص يكسر شيئًا في Git عاجلًا أو آجلًا. تنشئ commit على الفرع الخطأ، أو ترفع خطأً برمجيًا، أو تمحو عمل صباح كامل بـ reset. والخبر الجيد: نادرًا ما يرمي Git البيانات، ولمعظم الأخطاء طريقة تراجع نظيفة. الفخّ هو أن تلجأ إلى أي أمر تراجع تتذكّره نصف تذكّر. اختر بطرح سؤال واحد: **أين يعيش الخطأ؟**

## اختر الأداة بحسب المكان

| أين الخطأ | الأمر | هل يعيد كتابة السجلّ؟ |
|---|---|---|
| تعديلات غير مجهّزة في ملف | `git restore <file>` | لا (لكنه يرمي التعديلات) |
| مجهّز، لم يُسجَّل في commit | `git restore --staged <file>` | لا |
| آخر commit، لم يُرفع | `git commit --amend` | نعم، الـ commit المحلي فقط |
| commits محلية، لم تُرفع | `git reset` | نعم، محليًا فقط |
| commits رُفعت وتمّت مشاركتها | `git revert <commit>` | لا |

يتبع الجدول قاعدة واحدة: حين يصبح commit ما لدى آخرين، تضيف فوقه commits جديدة بدل أن تغيّره.

## الـ Amend: أصلح آخر commit

نسيت ملفًا أو كتبت رسالة سيئة، ولم ترفع بعد؟

```bash
git add contact.css
git commit --amend --no-edit              # same message, file included
git commit --amend -m "Add contact form"  # or a new message
```

الـ amend لا يعدّل الـ commit؛ بل يستبدله بآخر جديد بمعرّف جديد. هذا مقبول محليًا، ومشكلة إن كنت قد رفعت، للسبب نفسه الذي يجعل الـ rebase مشكلة.

## الـ Revert: التراجع علنًا

دمجت في `main` commit عطّل قائمة التنقّل على الجوال. وقد رُفع، وسحبه زملاؤك. لا تُعِد كتابة أي شيء. أضف commit يعكسه:

```bash
git revert HEAD          # if it's the latest commit
git revert 8f1e2aa       # or any commit by ID
```

ينشئ Git commit جديدًا، `Revert "Move nav into header"`، يطبّق التغييرات المعاكسة تمامًا. ويظل السجلّ يُظهر الخطأ وإصلاحه، وهذا صادق وآمن: يحصل الجميع على الـ revert بـ pull عادي. وللتراجع عن merge commit، أخبر Git أيّ الأبوين يُعتمد خطًا رئيسيًا (mainline)، وهو الأول عادةً: `git revert -m 1 <merge-commit>`.

أحيانًا يكون جزء فقط من الـ commit خاطئًا. إن كان نقل قائمة التنقّل سليمًا باستثناء `styles.css`، فلا داعي للتراجع عن الـ commit كله. أعِد ذلك الملف وحده إلى ما كان عليه قبل الـ commit، وافحصه، وسجّل النتيجة في commit إصلاح عادي:

```bash
git restore --source=8f1e2aa~1 styles.css
git diff
git commit -am "Restore mobile nav styles"
```

هذا ما زال «إضافة إلى السجلّ لا إعادة كتابة له»، لكن بنطاق أصغر.

## الـ Reset: حرّك الفرع، بثلاث طرق

`git reset <commit>` يحرّك الفرع الحالي إلى commit آخر. وما يفعله بالـ index والـ working tree يعتمد على الوضع (mode)، وهنا يتأذّى الناس.

:::figure أوضاع الـ reset الثلاثة والمناطق الثلاث
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">جدول من ثلاثة صفوف. reset --soft يحرّك الفرع فقط؛ ويحتفظ الـ index والـ working tree بالتغييرات، وتصبح مجهّزة. reset --mixed، وهو الافتراضي، يحرّك الفرع ويعيد ضبط الـ index؛ ويحتفظ الـ working tree بالتغييرات، وتصبح غير مجهّزة. reset --hard يحرّك الفرع ويعيد ضبط الـ index والـ working tree كليهما، فتُرمى التغييرات.</title>
  <text class="d-label-strong" x="190" y="30" text-anchor="middle">الفرع (HEAD)</text>
  <text class="d-label-strong" x="380" y="30" text-anchor="middle">Index</text>
  <text class="d-label-strong" x="570" y="30" text-anchor="middle">Working tree</text>
  <text class="d-code" x="20" y="82">--soft</text>
  <rect class="d-box-primary" x="120" y="55" width="140" height="44" rx="8"/>
  <text class="d-label" x="190" y="82" text-anchor="middle">يتحرّك</text>
  <rect class="d-box-success" x="310" y="55" width="140" height="44" rx="8"/>
  <text class="d-label" x="380" y="82" text-anchor="middle">يُحتفظ به</text>
  <rect class="d-box-success" x="500" y="55" width="140" height="44" rx="8"/>
  <text class="d-label" x="570" y="82" text-anchor="middle">يُحتفظ به</text>
  <text class="d-code" x="20" y="142">--mixed</text>
  <rect class="d-box-primary" x="120" y="115" width="140" height="44" rx="8"/>
  <text class="d-label" x="190" y="142" text-anchor="middle">يتحرّك</text>
  <rect class="d-box-primary" x="310" y="115" width="140" height="44" rx="8"/>
  <text class="d-label" x="380" y="142" text-anchor="middle">يُعاد ضبطه</text>
  <rect class="d-box-success" x="500" y="115" width="140" height="44" rx="8"/>
  <text class="d-label" x="570" y="142" text-anchor="middle">يُحتفظ به</text>
  <text class="d-code" x="20" y="202">--hard</text>
  <rect class="d-box-primary" x="120" y="175" width="140" height="44" rx="8"/>
  <text class="d-label" x="190" y="202" text-anchor="middle">يتحرّك</text>
  <rect class="d-box-primary" x="310" y="175" width="140" height="44" rx="8"/>
  <text class="d-label" x="380" y="202" text-anchor="middle">يُعاد ضبطه</text>
  <rect class="d-box-warn" x="500" y="175" width="140" height="44" rx="8"/>
  <text class="d-label-strong" x="570" y="202" text-anchor="middle">يُكتب فوقه</text>
  <text class="d-label-muted" x="350" y="248" text-anchor="middle">--mixed هو الافتراضي حين لا تحدّد وضعًا</text>
</svg>
:::

ثلاث حالات، وثلاثة أوضاع:

```bash
git reset --soft HEAD~2    # squash: the last two commits' changes become staged, ready for one commit
git reset HEAD~1           # un-commit (--mixed): changes return as unstaged edits to rework
git reset --hard HEAD~1    # discard: the commit and its changes are gone from the branch and files
```

استخدام كلاسيكي: أنشأت commit على `main` بينما كنت تقصد أن تكون على فرع. سجّل أي تعديلات غير مسجّلة أو خبّئها أولًا (فـ `--hard` سيمحوها)، ثم أنشئ الفرع حيث أنت، ثم أرجِع `main`:

```bash
git branch contact-form        # the branch keeps your commit
git reset --hard origin/main   # main goes back to match GitHub
git switch contact-form
```

:::mistake استخدام reset على commits مرفوعة
تنفيذ `git reset` على فرع رفعته بالفعل يجعل فرعك المحلي مختلفًا عن GitHub، والطريقة الوحيدة لنشره رفع بالقوة يعيد كتابة سجلّ الجميع. إن كان الـ commit مشارَكًا، فاستخدم `git revert`. واحتفظ بالـ `reset` للـ commits التي لم تغادر جهازك قط.
:::

:::tip ضع علامة قبل أي خطوة محفوفة بالمخاطر
قبل الـ reset، أو rebase كبير، أو أي أمر لست متأكّدًا منه، شغّل `git branch backup-nav`. لا يكلّف شيئًا، وإن لم تكن النتيجة كما أردت، يعيدك `git reset --hard backup-nav` مباشرة إلى حيث كنت. احذف العلامة بـ `git branch -D backup-nav` حين تطمئن.
:::

## الـ Reflog: الصندوق الأسود في Git

هذه هي شبكة الأمان التي تجعل كل ما سبق أقل إخافة. في كل مرة يتحرّك فيها الـ HEAD (commit، أو switch، أو reset، أو rebase، أو merge)، يكتب Git سطرًا في الـ **reflog**:

```bash
git reflog
```

```text
2b7f0c1 (HEAD -> main) HEAD@{0}: reset: moving to HEAD~3
9e4a1d5 HEAD@{1}: commit: Add contact form validation
4c8b2e7 HEAD@{2}: commit: Add contact form
a71d3f0 HEAD@{3}: checkout: moving from footer to main
```

بعد ذلك الـ `git reset --hard HEAD~3` العرَضي، لم تعد الـ commits الثلاثة على أي فرع، لكنها ما زالت موجودة، و `HEAD@{1}` يشير إلى أحدثها. استعدها:

```bash
git reset --hard HEAD@{1}          # put main back where it was
# or, more cautiously, keep them on a new branch to inspect first
git switch -c rescue 9e4a1d5
```

الـ reflog محلي (لا يُرفع ولا يُستنسخ)، وسطوره تنتهي صلاحيتها: افتراضيًا بعد 90 يومًا، أو 30 يومًا للـ commits التي لا يصل إليها أي فرع. وهذا وقت أكثر من كافٍ لملاحظة الخطأ.

ما لا يستطيع الـ reflog إنقاذه هو العمل الذي لم يُسجَّل قط. فـ `git restore` و `git reset --hard` يكتبان فوق التعديلات غير المسجّلة في ملفاتك، ولا يعرف أي سجلّ عنها شيئًا. لذا فعادة الأمان الحقيقية بسيطة: أنشئ commits مبكرًا وكثيرًا على فرعك. تستطيع دائمًا ضغط الـ commits قبل المراجعة؛ لكنك لا تستطيع استعادة تعديلات لم تسجّلها قط.

لكن بعض العمل الجاري ليس جاهزًا ليُسجَّل في commit. في الدرس التالي ستركنه جانبًا بـ `git stash`، وتمنع Git من تتبّع ملفات ما كان يجب أن يتتبّعها أصلًا.
