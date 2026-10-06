---
summary: ادمج فرعًا مكتملًا في main، وتوقّع هل سينفّذ Git عملية fast-forward أم سينشئ merge commit، واختر بينهما عن قصد بـ --no-ff و --ff-only.
takeaways:
  - أنت تدمج دائمًا فرعًا آخر في الفرع الذي أنت عليه؛ ولا يتحرّك إلا الفرع الحالي.
  - إن لم يتحرّك الفرع الحالي منذ بدأ الفرع الآخر، يقدّم Git المؤشّر إلى الأمام (fast-forward) ولا ينشئ commit جديدًا.
  - إن كان في الفرعين commits جديدة، ينفّذ Git دمجًا ثلاثيًا (three-way merge) انطلاقًا من سلفهما المشترك، ويسجّل merge commit له أبوان.
  - "`--no-ff` يفرض إنشاء merge commit ليُبقي الـ feature مجمّعة؛ و `--ff-only` يرفض أي شيء غير الـ fast-forward."
further:
  - title: Basic Branching and Merging (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
  - title: git merge reference
    url: https://git-scm.com/docs/git-merge
  - title: git merge-base reference
    url: https://git-scm.com/docs/git-merge-base
quiz:
  - q: أنت على `main`. منذ أنشأت `footer` منه، لم يكسب `main` أي commit، بينما كسب `footer` ثلاثة. ماذا يفعل `git merge footer`؟
    options:
      - text: يقدّم `main` إلى آخر commit في `footer` دون إنشاء commit جديد.
        why: صحيح. `main` سلف لـ `footer`، لذا يستطيع Git تقديم المؤشّر (fast-forward). ويبقى السجلّ خطًا مستقيمًا.
      - text: ينشئ merge commit له أبوان.
        why: هذا يحدث فقط حين يتحرّك الفرعان كلاهما، أو حين تطلبه صراحة بـ `--no-ff`.
      - text: ينسخ الـ commits الثلاثة إلى `main` بمعرّفات جديدة.
        why: هذا وصف لعملية rebase أو cherry-pick. أما الـ merge فيعيد استخدام الـ commits الموجودة.
      - text: يُرجع `footer` إلى حيث يقف `main`.
        why: الـ merge لا يحرّك أبدًا الفرع الذي تسمّيه، بل الفرع الذي أنت عليه فقط.
    answer: 0
  - q: كنت تقصد إدخال `dark-mode` إلى `main`، لكنك كنت على `dark-mode` وشغّلت `git merge main`. ما الذي حدث؟
    options:
      - text: لا شيء؛ يكتشف Git أنك قصدت الاتجاه الآخر فيعكسهما.
        why: يفعل Git بالضبط ما طلبته. اتجاه الدمج يحدّده الفرع الذي أنت عليه.
      - text: فشل الأمر لأنه لا يمكن دمج `main` في فرع feature.
        why: يمكن ذلك، والفرق تفعله لتحديث فرع طويل العمر. إنه مسموح، لكنه ليس ما أردته هنا.
      - text: صار `main` يحتوي عمل الوضع الداكن.
        why: "`main` لم يتحرّك. وحده الفرع الذي أنت عليه، `dark-mode`، يمكن أن يتغيّر أثناء الدمج."
      - text: كسب `dark-mode` الـ commits الجديدة من `main`؛ و `main` لم يتغيّر.
        why: صحيح. انتقل إلى `main` بـ `git switch main` وشغّل `git merge dark-mode` لتدمج في الاتجاه الذي قصدته.
    answer: 3
  - q: أيّ commit يستخدمه Git نقطة انطلاق حين ينفّذ دمجًا ثلاثيًا لـ `dark-mode` في `main`؟
    options:
      - text: أول commit في الـ repository.
        why: الـ root commit غالبًا أقدم بكثير مما يلزم. يريد Git أحدث نقطة مشتركة، ليقارن فقط ما غيّره كل طرف.
      - text: أحدث commit يتشاركه الفرعان، أي الـ merge base الخاص بهما.
        why: صحيح. يقارن Git طرف كل فرع بالـ merge base، ويأخذ التغييرات التي جرت على أي من الطرفين، وينبّه إلى المواضع التي غيّر فيها الطرفان الأسطر نفسها.
      - text: طرف الفرع صاحب الطابع الزمني الأقدم.
        why: الطوابع الزمنية لا تقرّر شيئًا في الدمج. الرسم البياني هو الذي يقرّر.
    answer: 1
  - q: يريد فريقك أن تظهر كل feature في سجلّ `main` على شكل merge commit واحد، حتى حين يكون الـ fast-forward ممكنًا. أيّ خيار يحقّق ذلك؟
    options:
      - text: "`git merge --ff-only feature`"
        why: هذه هي السياسة المعاكسة. إنها تسمح بالـ fast-forward فقط وترفض إنشاء merge commits.
      - text: "`git merge --squash feature`"
        why: هذا يجهّز التغييرات المجمّعة دون إنشاء commit أو تسجيل أب ثانٍ، فيضيع الرابط بالفرع.
      - text: "`git merge --no-ff feature`"
        why: صحيح. يسجّل دائمًا merge commit، فتبقى commits الـ feature مجمّعة على خطها الخاص في الرسم.
      - text: "`git merge --all feature`"
        why: لا يوجد خيار `--all` في `git merge`.
    answer: 2
---

لديك فرع `footer` مكتمل، وفرع `main` لا يحتويه بعد. الدمج (merge) هو الطريقة التي ينضمّ بها العمل على خط من السجلّ إلى خط آخر. لدى Git طريقتان لفعل ذلك، والطريقة التي تحدث ليست عشوائية: تستطيع توقّعها بالنظر إلى الرسم البياني قبل أن تكتب أي شيء.

## قاعدة الاتجاه

أولًا، القاعدة التي تجنّبك أكبر قدر من الارتباك: **أنت تدمج فرعًا آخر في الفرع الذي أنت عليه.** الأمر `git merge footer` يعني «أدخِل عمل `footer` إلى فرعي الحالي». لا يتحرّك إلا الفرع الحالي. أما الفرع الذي سمّيته فيبقى تمامًا حيث كان.

إذن الروتين دائمًا: انتقل إلى الفرع الذي يجب أن يستقبل العمل، ثم ادمج.

```bash
git switch main
git merge footer
```

## الحالة الأولى: fast-forward

منذ أنشأت `footer`، لم ينشئ أحد أي commit على `main`. كل commit على `main` موجود أصلًا في سجلّ `footer`. لا يحتاج Git إلى جمع أي شيء؛ إنه ينزلق بـ `main` إلى الأمام حتى آخر commit في `footer`:

```text
Updating c39be11..f1a3b07
Fast-forward
 index.html |  8 ++++++++
 styles.css | 12 ++++++++++++
 2 files changed, 20 insertions(+)
```

هذا هو الـ **fast-forward** (التقديم السريع): لا commit جديد، بل مؤشّر يتحرّك على commits موجودة. ويبقى السجلّ خطًا مستقيمًا، كأنك عملت على `main` طوال الوقت.

## الحالة الثانية: دمج حقيقي

والآن الحالة الأكثر إثارة. بينما كنت تبني `dark-mode`، صحّحت أيضًا خطأً إملائيًا مباشرة على `main`. في كل فرع commits يفتقدها الآخر؛ لقد **تباعدا** (diverged). لا يوجد خط مستقيم يمكن الانزلاق عليه.

ينفّذ Git **دمجًا ثلاثيًا** (three-way merge). يجد الـ **merge base**، وهو أحدث commit يتشاركه الفرعان، ويقارن طرف كل فرع به. التغيير الذي جرى على طرف واحد فقط يُؤخذ. والتغييرات التي جرت على الطرفين في مواضع مختلفة تُؤخذ كلها. أما إن غيّر الطرفان الأسطر نفسها، فيتوقّف Git ويسألك؛ هذا هو التعارض (conflict)، وله الدرس التالي كاملًا.

```bash
git switch main
git merge dark-mode
```

يفتح Git محرّرك بالرسالة `Merge branch 'dark-mode'`. احفظ وأغلق، وسترى:

```text
Merge made by the 'ort' strategy.
 styles.css | 24 ++++++++++++++++++++++++
 1 file changed, 24 insertions(+)
```

`ort` هو اسم خوارزمية الدمج الافتراضية في Git؛ ولا تحتاج إلى اختيارها. والنتيجة **merge commit**: commit له أبوان، طرف `main` السابق وطرف `dark-mode`. ولقطته تحتوي خطَّي العمل كليهما.

:::figure الـ fast-forward مقابل الـ merge commit
<svg viewBox="0 0 700 300" role="img" aria-labelledby="t1">
  <title id="t1">في الأعلى: main يشير إلى b2e0 و footer متقدّم بـ commitين على الخط نفسه، فينزلق main عند الدمج إلى f1a3 دون commit جديد. في الأسفل: لكل من main و dark-mode commit جديد بعد b2e0، فينشئ الدمج الـ merge commit ذا المعرّف m7c1 وله أبوان، ويتحرّك main إليه.</title>
  <text class="d-label-strong" x="20" y="28">Fast-forward: لم يتحرّك main</text>
  <circle class="d-box" cx="60" cy="80" r="22"/>
  <text class="d-code" x="60" y="85" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="160" cy="80" r="22"/>
  <text class="d-code" x="160" y="85" text-anchor="middle">e9d2</text>
  <circle class="d-box" cx="260" cy="80" r="22"/>
  <text class="d-code" x="260" y="85" text-anchor="middle">f1a3</text>
  <path class="d-line" d="M138 80 L82 80"/>
  <path class="d-line" d="M238 80 L182 80"/>
  <text class="d-code" x="300" y="70">footer</text>
  <text class="d-code" x="300" y="92">main (بعد)</text>
  <text class="d-label-muted" x="40" y="128">كان main (قبل) هنا، على b2e0</text>
  <path class="d-arrow d-dashed" d="M80 110 C140 125 220 125 250 106" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="20" y="175">Merge commit: تحرّك الفرعان كلاهما</text>
  <circle class="d-box" cx="60" cy="235" r="22"/>
  <text class="d-code" x="60" y="240" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="170" cy="200" r="22"/>
  <text class="d-code" x="170" y="205" text-anchor="middle">c39b</text>
  <circle class="d-box" cx="170" cy="272" r="22"/>
  <text class="d-code" x="170" y="277" text-anchor="middle">d4a7</text>
  <circle class="d-box-primary" cx="290" cy="235" r="22"/>
  <text class="d-code" x="290" y="240" text-anchor="middle">m7c1</text>
  <path class="d-line" d="M148 207 L80 228"/>
  <path class="d-line" d="M148 265 L80 242"/>
  <path class="d-line" d="M268 228 L192 207"/>
  <path class="d-line" d="M268 242 L192 265"/>
  <text class="d-code" x="325" y="240">main</text>
  <text class="d-code" x="200" y="296">dark-mode</text>
  <text class="d-label-muted" x="420" y="225">للـ commit m7c1 أبوان:</text>
  <text class="d-label-muted" x="420" y="248">c39b (main) و d4a7</text>
</svg>
:::

## الاختيار عن قصد

النتيجتان تحتويان الملفات النهائية نفسها. الاختلاف في طريقة قراءة السجلّ، وللفرق آراء في ذلك.

- **الـ fast-forward** يُبقي السجلّ خطيًا وهادئًا. جيد للتغييرات الصغيرة، لكنك لاحقًا لا تستطيع أن ترى أيّ الـ commits كانت تنتمي إلى أيّ feature.
- **الـ merge commits** تُبقي كل feature مجمّعة بشكل ظاهر، وتسجّل متى وصلت. ويصبح الرسم أكثر ازدحامًا.

خياران يسمحان لك بالاختيار بدل ترك الرسم يقرّر:

```bash
git merge --no-ff footer     # always create a merge commit, even if fast-forward is possible
git merge --ff-only footer   # fast-forward or refuse; never create a merge commit
```

خياري الافتراضي لموقع شخصي يعمل عليه شخص واحد: دع Git ينفّذ fast-forward للفروع الصغيرة، ولا ترهق نفسك بالتفكير في الأمر. أما في الفريق، فاتبع عُرف الفريق، وهو عادةً يُضبط على GitHub ولا يُكتب يدويًا. والأهمّ من السياسة بكثير أن يحمل كل فرع قطعة عمل واحدة متماسكة، فأيًّا كان الشكل الذي يتّخذه السجلّ، تكون كل خطوة فيه مفهومة.

`--ff-only` عادة أمان جيدة حين لا تتوقّع إلا اللحاق بالتحديثات، مثلًا عند تحديث `main` المحلي. إن رفض Git، فهذا خبر بحدّ ذاته: شيء ما تباعد دون علمك. وعلى GitHub ستقابل الاختيار نفسه في صورة طرق الدمج (merge methods) في الـ pull request في القسم الثالث.

تستطيع فحص الـ merge base بنفسك قبل الدمج، وهذا يخبرك كم ابتعد الفرعان:

```bash
git merge-base main dark-mode
git log --oneline main..dark-mode    # commits on dark-mode that main lacks
git log --oneline dark-mode..main    # and the reverse
```

إن كان ناتج أمر الـ log الثاني فارغًا، فـ `main` لم يتحرّك وسيكون الدمج fast-forward.

:::mistake الدمج في الاتجاه الخطأ
أنت على `dark-mode`، وتشغّل `git merge main`، ثم تتساءل لماذا لم يحصل `main` على الثيم الداكن. الدمج ذهب إلى الفرع الذي كنت عليه. شغّل `git branch` (أو انظر إلى الـ prompt في الطرفية) قبل كل دمج، وانتقل إلى الفرع المستقبِل، وادمج من هناك. دمج `main` في فرع feature تقنية حقيقية للحاق بالتحديثات، لذا لن يوقفك Git.
:::

## بعد الدمج

بعد دمج `footer`، يكون اسم الفرع قد أدّى مهمّته. احذفه:

```bash
git branch -d footer
```

ينجح `-d` لأن الـ commits قابلة للوصول من `main`. الـ commits نفسها تبقى في السجلّ إلى الأبد؛ والذي يذهب هو الورقة اللاصقة فقط. نظّف الفروع المدموجة أولًا بأول، فيبقى ناتج `git branch` قائمة قصيرة بالعمل الجاري فعلًا.

حتى الآن مرّ كل دمج بسلاسة لأن الفرعين لمسا أسطرًا مختلفة. في الدرس التالي ستجعلهما يتصادمان عن قصد، وتحلّ التعارض خطوة بخطوة.
