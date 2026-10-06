---
summary: اقرأ سجلّ الـ repository بـ git log و git show و git diff، وسمِّ أي commit نسبةً إلى الـ HEAD، وتخيّل السجلّ رسمًا بيانيًا من اللقطات المرتبطة بآبائها.
takeaways:
  - السجلّ رسم بياني موجَّه غير دوري، يشير فيه كل commit إلى أبيه، ويشير الـ merge commit إلى أبوين.
  - "`git log --oneline --graph --all` يرسم الرسم البياني في الطرفية، بما فيها الفروع التي لست عليها."
  - "`git show <commit>` يطبع رسالة commit واحد وتغييراته؛ و `git show <commit>:<path>` يطبع ملفًا كما كان حينها."
  - "`HEAD~1` هو الـ commit الذي يسبق الـ commit الذي أنت عليه، و `HEAD~3` ثلاث خطوات إلى الخلف عبر الآباء الأوائل."
  - "`git diff A B` يقارن أي لقطتين، و `-- <path>` يحصر المقارنة في ملف واحد."
further:
  - title: Viewing the Commit History (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History
  - title: git log reference
    url: https://git-scm.com/docs/git-log
  - title: gitrevisions (naming commits)
    url: https://git-scm.com/docs/gitrevisions
quiz:
  - q: الأمر `git log` على `main` لا يعرض commit أنشأته على فرعك `dark-mode`. لماذا؟
    options:
      - text: ضاع الـ commit لأنك انتقلت بين الفروع.
        why: الانتقال بين الفروع لا يحذف أي commit. الـ commit ما زال موجودًا، ويشير إليه `dark-mode`.
      - text: "`git log` لا يعرض إلا الـ commits التي يمكن الوصول إليها من الـ HEAD عبر تتبّع الآباء، وهذا الـ commit ليس منها."
        why: صحيح. `main` لا يقود إليه. الأمر `git log --all` أو `git log dark-mode` سيعرضه.
      - text: "`git log` يخفي الـ commits إلى أن يتم رفعها."
        why: لا يهتمّ Git بالرفع حين يعرض السجلّ المحلي. الـ commits غير المرفوعة تظهر كغيرها تمامًا.
      - text: تحتاج إلى `git log -p` لرؤية commits الفروع الأخرى.
        why: "`-p` يضيف الـ diff الخاص بكل commit إلى الناتج. ولا يغيّر الـ commits التي تُعرض."
    answer: 1
  - q: تريد رؤية `styles.css` كما كان تمامًا قبل commitين، دون تغيير أي ملف. أيّ أمر يفعل ذلك؟
    options:
      - text: "`git restore styles.css~2`"
        why: "`~2` تنطبق على الـ commits لا على أسماء الملفات، و `git restore` يكتب في الـ working tree، وهذا ما لا تريده."
      - text: "`git log -2 styles.css`"
        why: هذا يسرد آخر commitين لمسا الملف. يعرض الرسائل، لا محتوى الملف.
      - text: "`git diff HEAD~2`"
        why: هذا يعرض التغييرات بين ذلك الـ commit والـ working tree، لا المحتوى الكامل للملف.
      - text: "`git show HEAD~2:styles.css`"
        why: صحيح. الصيغة `<commit>:<path>` تسمّي ملفًا داخل لقطة، و `git show` يطبعه دون أن يلمس ملفاتك.
    answer: 3
  - q: كم أبًا للـ merge commit الذي يدمج `dark-mode` في `main`؟
    options:
      - text: اثنان، الـ commit الذي كان عليه `main` والـ commit الذي كان عليه `dark-mode`.
        why: صحيح. وجود أبوين هو ما يجعله merge، ولهذا تلتقي الخطوط في الرسم عند تلك النقطة.
      - text: واحد، الـ commit الذي كان عليه `main` قبل الدمج.
        why: الأب الواحد صفة الـ commit العادي. أما الـ merge فيسجّل السجلّين اللذين يجمعهما.
      - text: لا أب له، لأن الـ merge commit يبدأ سجلًّا جديدًا.
        why: الـ commit الأول في الـ repository وحده (الـ root commit) لا أب له.
    answer: 0
  - q: أيّ أمر يسرد فقط الـ commits التي أضافت تغييراتها النص `dark-mode` أو أزالته؟
    options:
      - text: "`git log --grep dark-mode`"
        why: "`--grep` يبحث في رسائل الـ commits، لا في تغييرات الكود داخلها."
      - text: "`git diff dark-mode`"
        why: هذا يقارن الـ working tree بفرع `dark-mode`. ولا يسرد أي commits.
      - text: "`git log -S dark-mode`"
        why: صحيح. خيار البحث (pickaxe) `-S` يجد الـ commits التي غيّرت عدد مرات ظهور النص، وهكذا تتعقّب متى أُضيف شيء أو أُزيل.
      - text: "`git show dark-mode`"
        why: هذا يعرض الـ commit الذي يشير إليه فرع `dark-mode`، إن وُجد فرع بهذا الاسم.
    answer: 2
---

صار في موقعك الشخصي بضعة commits الآن. بعد ستة أشهر سيصبح فيه المئات، والسؤال الذي ستطرحه فعلًا لن يكون «ما هو السجلّ؟» بل شيئًا أدقّ: متى تعطّل الـ footer، وكيف كان هذا الملف قبل إعادة التصميم، وأيّ commit أضاف ذلك اللون. قراءة السجلّ جيدًا هي ما يجعلك تجيب عن هذه الأسئلة في ثوانٍ.

## العرض اليومي

الأمر `git log` وحده يطبع كل commit، الأحدث أولًا، مع المعرّفات الكاملة والتواريخ. إنه شامل ومُتعب. هذه هي الصيغة التي تستحق الحفظ:

```bash
git log --oneline --graph --all
```

```text
*   e5d81c0 (HEAD -> main) Merge branch 'dark-mode'
|\
| * d4a7f20 (dark-mode) Add dark mode colors
* | c39be11 Add projects page
|/
* b2e04f3 Add navigation bar with base styles
* a1c9d72 Add home page
```

اقرأه من الأسفل إلى الأعلى لتتبع الترتيب الزمني. كل `*` هي commit، والخطوط تبيّن أيّ commit جاء من أيّ commit. وبين الأقواس أسماء دالّة (labels): `main` و `dark-mode` فرعان، و `HEAD -> main` تعني أنك على `main`. الخيار `--all` مهم: دونه يعرض Git فقط الـ commits التي يمكن الوصول إليها من مكانك، ولن يبقى خط `dark-mode` ظاهرًا إلا لأنه دُمج.

الناتج الطويل يُفتح في أداة تصفّح (pager). استخدم الأسهم أو المسافة للتمرير و `q` للخروج.

مرشّحات مفيدة يمكن جمعها كلها: `-n 5` (آخر خمسة)، و `--stat` (أيّ الملفات تغيّرت)، و `-p` (الـ diffs كاملة)، و `--author="Maya"`، و `--since="2 weeks ago"`، و `-- index.html` (فقط الـ commits التي لمست ذلك الملف).

## الـ commits تشكّل رسمًا بيانيًا

الناتج أعلاه تمثيل لـ **رسم بياني موجَّه غير دوري** (directed acyclic graph)، أو DAG. موجَّه لأن كل commit يشير إلى أبيه. وغير دوري لأنك لا تستطيع تتبّع الآباء والعودة إلى حيث بدأت؛ فلا يمكن لـ commit أن يكون جدًّا لنفسه. معظم الـ commits لها أب واحد. الـ root commit لا أب له. والـ **merge commit** له أبوان.

:::figure السجلّ نفسه كرسم بياني للـ commits
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">الـ commitان a1c9 و b2e0 متتاليان، ثم يتفرّع الخط: c39b على خط main و d4a7 على خط dark-mode. كلاهما يقود إلى الـ merge commit ذي المعرّف e5d8، وله أبوان. الاسم main والـ HEAD يشيران إلى e5d8؛ والاسم dark-mode يشير إلى d4a7. الأسهم تتّجه من كل commit إلى أبيه.</title>
  <circle class="d-box" cx="60" cy="110" r="26"/>
  <text class="d-code" x="60" y="115" text-anchor="middle">a1c9</text>
  <circle class="d-box" cx="190" cy="110" r="26"/>
  <text class="d-code" x="190" y="115" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="330" cy="60" r="26"/>
  <text class="d-code" x="330" y="65" text-anchor="middle">c39b</text>
  <circle class="d-box" cx="330" cy="170" r="26"/>
  <text class="d-code" x="330" y="175" text-anchor="middle">d4a7</text>
  <circle class="d-box-primary" cx="480" cy="110" r="26"/>
  <text class="d-code" x="480" y="115" text-anchor="middle">e5d8</text>
  <path class="d-arrow" d="M164 110 L90 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M305 70 L218 102" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M305 160 L218 120" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M455 100 L360 66" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M455 120 L360 164" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="560" y="70" width="110" height="34" rx="8"/>
  <text class="d-code" x="615" y="92" text-anchor="middle">main</text>
  <rect class="d-box-warn" x="560" y="20" width="110" height="34" rx="8"/>
  <text class="d-code" x="615" y="42" text-anchor="middle">HEAD</text>
  <path class="d-line" d="M615 54 L615 70"/>
  <path class="d-line" d="M560 92 L508 106"/>
  <rect class="d-box-accent" x="400" y="200" width="120" height="34" rx="8"/>
  <text class="d-code" x="460" y="222" text-anchor="middle">dark-mode</text>
  <path class="d-line" d="M400 205 L356 178"/>
</svg>
:::

احتفظ بهذه الصورة في ذهنك. في القسم الثاني سترى أن الـ branch ليس أكثر من واحد من هذه الأسماء الدالّة، وأن كل أمر متعلّق بالفروع إما يحرّك اسمًا أو يضيف دائرة.

## تسمية الـ commits

تستطيع تسمية أي commit بمعرّفه، ويقبل Git أقصر بادئة لا لبس فيها، وهي عادةً 7 أحرف. المعرّفات hashes مشتقّة من محتوى الـ commit وبياناته الوصفية وأبيه، لذا لا تتغيّر أبدًا، ولا يشترك commitان مختلفان في المعرّف نفسه عمليًا.

غالبًا ما يكون العدّ انطلاقًا من مكانك أسهل:

- `HEAD` هو الـ commit الذي أنت عليه.
- `HEAD~1` (أو `HEAD~`) هو أبوه، و `HEAD~3` هو ثلاثة أجيال إلى الخلف، مع تتبّع الأب الأول في كل مرة.
- `HEAD^2` هو الأب *الثاني* لـ merge commit؛ وفي `e5d81c0` أعلاه هو `d4a7f20`.
- اسم الفرع يصلح في أي مكان يصلح فيه الـ commit: `dark-mode~1` هو `b2e04f3`.

## النظر داخل الـ commits

```bash
git show c39be11              # message, author, date and the diff it introduced
git show HEAD~2:styles.css    # the whole file as it was in that snapshot
git diff a1c9d72 HEAD         # everything that changed between two snapshots
git diff HEAD~3 HEAD -- styles.css   # the same, for one file only
```

يقبل `git diff` أي commitين لأن كلًا منهما لقطة كاملة. ويُحسب الـ diff عند الطلب بمقارنتهما. وكذلك الحال مع الـ diff الذي يطبعه `git show`: إنه لقطة هذا الـ commit مقارنةً بلقطة أبيه.

## تحقيق حقيقي

هكذا تتكامل هذه الأوامر. يخبرك صديق أن الـ footer في صفحة مشاريعك اختفى، وأنت متأكّد أنه كان موجودًا الأسبوع الماضي. ابدأ بتضييق السجلّ إلى الملف المعنيّ:

```bash
git log --oneline --since="1 week ago" -- projects.html
```

```text
8f1e2aa Move project cards into a grid
c39be11 Add projects page
```

مشتبهان اثنان. انظر إلى الأحدث بالكامل:

```bash
git show 8f1e2aa -- projects.html
```

يُظهر الـ diff كتلة `<footer>` باللون الأحمر، أُزيلت مع ترميز القائمة القديمة. هذا هو الجاني، وجدته في أقل من دقيقة. ولتأخذ ترميز الـ footer القديم دون إرجاع أي شيء، اطبع الملف كما كان في الـ commit الأب وانسخ ما تحتاجه:

```bash
git show 8f1e2aa~1:projects.html
```

لم يغيّر هذا التحقيق ملفًا واحدًا ولا commitًا واحدًا. قراءة السجلّ آمنة دائمًا، فافعلها بحرية وكثيرًا. معظم «حالات الطوارئ في Git» التي رأيتها كانت في الحقيقة مشكلات قراءة: شخص ما ذُعر قبل أن ينظر إلى الرسم، والجواب كان موجودًا في `git log` منذ البداية.

:::tip اعثر على الـ commit الذي أضاف شيئًا ما
`git log -S "dark-mode" --oneline` يسرد الـ commits التي أضافت النص `dark-mode` أو أزالته من أي مكان في الكود. حين تحتاج إلى معرفة متى ولماذا ظهر سطر ما، فهذا البحث (pickaxe) أفضل من التمرير عبر `git log -p`.
:::

:::mistake الظنّ بأن git log يعرض كل شيء
يبدأ `git log` من الـ HEAD ويتتبّع الآباء إلى الخلف. الـ commits الموجودة على فروع أخرى لم تُدمج لا يمكن الوصول إليها من هناك، فلا تظهر، ويستنتج الناس أن عملهم ضاع. أضف `--all`، أو سمِّ الفرع: `git log --oneline dark-mode`.
:::

رأيت أسماء مثل `main` و `dark-mode` معلّقة على الـ commits. يبدأ القسم الثاني بشرح حقيقة هذه الأسماء، ولماذا يكاد إنشاء واحد منها لا يكلّف شيئًا.
