---
summary: أضف workflow في GitHub Actions يفحص كل pull request، ثم احمِ main بـ ruleset بحيث لا تصل التغييرات إليه إلا عبر pull request نجحت فحوصه.
takeaways:
  - "الـ workflow ملف YAML في `.github/workflows/`؛ يحدّد `on` الأحداث، وتعمل الـ `jobs` على runners، وكل خطوة في `steps` إما تستخدم action عبر `uses` أو تنفّذ أمرًا عبر `run`."
  - كل job يبلّغ عن status check على الـ pull request، يظهر كعلامة صح خضراء أو علامة خطأ حمراء مع السجلّات الكاملة.
  - "الـ branch ruleset على `main` يستطيع منع الرفع بالقوة والحذف، واشتراط pull request، واشتراط نجاح status checks مسمّاة."
  - الـ status check المطلوب يُطابَق باسم الـ job، ولا يقترح GitHub إلا الفحوص التي أبلغت عن نتيجتها من قبل، لذا شغّل الـ workflow قبل أن تشترطه.
  - الحلقة المكتملة هي فرع، ثم رفع، ثم pull request، ثم فحص آلي، ثم مراجعة، ثم دمج، ولا أحد يستطيع تخطّي خطوة.
further:
  - title: Building and testing Node.js
    url: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
  - title: Workflow syntax for GitHub Actions
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
  - title: About rulesets
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
  - title: Available rules for rulesets
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
quiz:
  - q: "يبدأ الـ workflow الخاص بك بـ `on: pull_request`. متى يعمل؟"
    options:
      - text: فقط حين ينقر أحدهم Run workflow في تبويب Actions.
        why: هذا هو الحدث `workflow_dispatch`. أما `pull_request` فيُطلق تلقائيًا بنشاط الـ pull requests.
      - text: حين يُفتح pull request، ومجددًا في كل مرة تُرفع فيها commits جديدة إلى فرعه.
        why: صحيح. افتراضيًا يعمل `pull_request` عند الفتح (opened) والمزامنة (synchronize، أي commits جديدة) وإعادة الفتح (reopened)، فيُفحص كل تحديث.
      - text: فقط بعد دمج الـ pull request.
        why: الغرض من فحص الـ pull request هو المعرفة قبل الدمج. والتشغيل بعد الدمج يكون حدث `push` إلى `main`.
      - text: في كل مرة يرفع فيها أي شخص إلى أي فرع.
        why: هذا هو الحدث `push` دون مرشّح للفروع. أما `pull_request` فلا يُطلق إلا بنشاط الـ pull requests.
    answer: 1
  - q: "يفشل الـ CI job عند `npm ci` بخطأ مفاده أن `package.json` غير موجود. الخطوة الأولى هي `run: npm ci`. ما المشكلة؟"
    options:
      - text: الـ runner لا يحتوي npm مثبّتًا.
        why: الـ runners العاملة بـ Ubuntu في GitHub تتضمّن Node.js و npm. والخطأ يتعلّق بملف مفقود، لا بأداة مفقودة.
      - text: "`npm ci` لا يعمل إلا على runners بنظام Windows."
        why: "`npm ci` يعمل على كل أنظمة التشغيل التي توفّرها الـ runners."
      - text: ملف الـ workflow في المجلد الخطأ.
        why: لو كان الملف في المجلد الخطأ لما عمل الـ workflow أصلًا. لكنه عمل، وفشل عند إحدى الخطوات.
      - text: لم ينسخ الـ job الـ repository قط؛ يجب أن تأتي `actions/checkout` قبل أي خطوة تحتاج إلى ملفاتك.
        why: صحيح. يبدأ الـ runner آلةً فارغة. و `actions/checkout` يضع ملفات الـ repository في مكانها.
    answer: 3
  - q: أضفت ruleset على `main` يشترط pull request. ماذا يحدث حين تشغّل `git push origin main` ولديك commit محلي؟
    options:
      - text: يُرفض الرفع بخطأ مخالفة قاعدة في الـ repository؛ ويجب أن يصل الـ commit عبر pull request.
        why: صحيح. يرفض GitHub تحديث `main`، ويبقى الـ commit المحلي دون أن يُمسّ، فتستطيع رفعه إلى فرع وفتح pull request.
      - text: ينجح الرفع ويفتح GitHub pull request تلقائيًا.
        why: لا يحوّل GitHub عمليات الرفع إلى pull requests. القواعد إما تسمح بالتحديث أو ترفضه.
      - text: ينجح الرفع لأن القواعد لا تنطبق إلا على الآخرين.
        why: القواعد تنطبق على الجميع، بمن فيهم المالك، ما لم تضف نفسك إلى قائمة الاستثناء (bypass list).
      - text: يُحذف الـ commit المحلي ليبقى متزامنًا مع `main`.
        why: القواعد البعيدة لا تستطيع لمس الـ repository المحلي. لا شيء محلي يتغيّر حين يُرفض الرفع.
    answer: 0
  - q: أعدت تسمية الـ job في الـ workflow من `check` إلى `html`. والآن يعرض كل pull request الفحص المطلوب `check` بالحالة "Expected — Waiting for status to be reported"، ولا شيء يمكن دمجه. لماذا؟
    options:
      - text: الـ rulesets لا تستطيع اشتراط فحوص إلا من jobs اسمها `check` أو `test`.
        why: أي اسم job يصلح. المشكلة أن الـ ruleset والـ workflow صارا مختلفين في الاسم.
      - text: في الـ workflow خطأ في صياغة YAML.
        why: الـ job المسمّى `html` يعمل جيدًا؛ لكنه يبلّغ باسم لا ينتظره الـ ruleset.
      - text: ما زال الـ ruleset يشترط فحصًا اسمه `check`، ولم يعد أي job يبلّغ به؛ حدّث الفحص المطلوب إلى `html`.
        why: صحيح. الفحوص المطلوبة تُطابق بالاسم. إن أعدت تسمية أحدهما، فحدّث الآخر في الوقت نفسه.
    answer: 2
---

كل ما سبق اعتمد على تذكّرك أنت. أن تتذكّر تشغيل فحص الـ HTML، وأن تفتح pull request بدل الرفع إلى `main`، وألّا ترفع بالقوة أبدًا. والناس ينسون، خصوصًا في الحادية عشرة ليلًا قبل التقدّم إلى وظيفة. ينقل هذا الدرس هذه العادات من رأسك إلى GitHub: آلة تشغّل الفحوص على كل pull request، وقواعد تجعل تغيير `main` بأي طريقة أخرى مستحيلًا.

## أعطِ الموقع الشخصي شيئًا يُفحص

التكامل المستمر (continuous integration) يحتاج إلى أمر يفشل حين يكون هناك خطأ. ولموقع HTML، فإن أداة التحقّق (validator) بداية جيدة. في موقعك الشخصي، على فرع جديد:

```bash
git switch -c add-ci
npm init -y
npm install --save-dev html-validate
npm pkg set scripts.test="html-validate index.html projects.html"
echo '{ "extends": ["html-validate:recommended"] }' > .htmlvalidate.json
npm test
```

`node_modules/` موجود أصلًا في `.gitignore` منذ درسين؛ سجّل في commit كلًا من `package.json` و `package-lock.json` و `.htmlvalidate.json`. وإن أبلغ `npm test` عن مشكلات، فهذا هو المقصود: أصلحها، أو دوّنها لأول تشغيل للـ CI. وفي موقع شخصي جديد كثيرًا ما يجد هذا:

```text
index.html
  1:1  error  DOCTYPE should be uppercase  doctype-style
```

## أول workflow لك

تشغّل **GitHub Actions** الـ workflows المعرَّفة في ملفات YAML تحت `.github/workflows/`. أنشئ واحدًا:

```yaml title=.github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
```

اقرأه من الأعلى إلى الأسفل:

- `on` يسرد **الأحداث** (events) التي تبدأ الـ workflow: أي pull request إلى `main` (عند فتحه، أو تحديثه بـ commits جديدة)، وعمليات الرفع إلى `main` بعد الدمج.
- `jobs` يحتوي job واحدًا، `check`. هذا المعرّف يصبح اسم الـ status check الذي يعرضه GitHub على الـ pull request.
- `runs-on` يختار **runner**، وهو آلة افتراضية جديدة يوفّرها GitHub. وتبدأ فارغة في كل مرة.
- `steps` تُنفَّذ بالترتيب. `uses` يشغّل **action** منشورًا: `actions/checkout` ينسخ الـ repository إلى الـ runner، و `actions/setup-node` يثبّت Node.js 24 ويخزّن تنزيلات npm مؤقتًا. و `run` ينفّذ أمر shell: `npm ci` يثبّت بالضبط ما يسرده `package-lock.json`، و `npm test` يشغّل أداة التحقّق.

أي خطوة تنتهي بخطأ تُفشل الـ job. سجّل الـ workflow في commit، وارفع الفرع، وافتح pull request.

## مشاهدته وهو يعمل

خلال ثوانٍ يعرض الـ pull request فحصًا، "CI / check (pull_request)"، بنقطة صفراء أثناء التشغيل. ثم علامة صح خضراء، أو علامة خطأ حمراء. انقر **Details** لترى السجلّ الكامل لكل خطوة؛ والخطوة الفاشلة تكون موسّعة، وتعرض ناتج أداة التحقّق نفسه الذي ستحصل عليه محليًا.

لإصلاح فحص أحمر، افعل ما تفعله مع ملاحظات المراجعة: أنشئ commit على الفرع نفسه وارفعه. يعمل الـ workflow مجددًا على الـ commit الجديد. اعتد على قراءة هذه السجلّات. الـ CI لا يحكم عليك؛ إنه زميل يعيد تشغيل الفحوص في كل مرة دون أن يملّ.

:::figure الطريق المحمي إلى main
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">مسار من اليسار إلى اليمين: فرع feature، ثم رفع، ثم pull request، ثم بوّابتان متجاورتان، نجاح فحص الـ CI وموافقة المراجعة، ثم الدمج في main. وسهم محجوب يبيّن أن الـ ruleset يرفض الرفع المباشر إلى main.</title>
  <rect class="d-box" x="10" y="80" width="110" height="50" rx="10"/>
  <text class="d-label" x="65" y="110" text-anchor="middle">فرع</text>
  <rect class="d-box" x="150" y="80" width="120" height="50" rx="10"/>
  <text class="d-label" x="210" y="110" text-anchor="middle">pull request</text>
  <rect class="d-box-success" x="300" y="40" width="140" height="44" rx="10"/>
  <text class="d-label" x="370" y="67" text-anchor="middle">CI: check</text>
  <rect class="d-box-success" x="300" y="126" width="140" height="44" rx="10"/>
  <text class="d-label" x="370" y="153" text-anchor="middle">مراجعة</text>
  <rect class="d-box-primary" x="480" y="80" width="90" height="50" rx="10"/>
  <text class="d-label-strong" x="525" y="110" text-anchor="middle">دمج</text>
  <rect class="d-box-accent" x="600" y="80" width="90" height="50" rx="10"/>
  <text class="d-code" x="645" y="110" text-anchor="middle">main</text>
  <path class="d-arrow" d="M120 105 L146 105" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 98 L296 70" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 112 L296 140" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 62 L476 96" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 148 L476 114" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M570 105 L596 105" marker-end="url(#arrow)"/>
  <path class="d-line d-dashed" d="M65 130 C65 205 600 205 640 136"/>
  <rect class="d-box-warn" x="250" y="186" width="200" height="30" rx="8"/>
  <text class="d-label" x="350" y="206" text-anchor="middle">رفع مباشر: مرفوض</text>
</svg>
:::

## احمِ main بـ ruleset

الفحص الناجح لا يفيد إلا إذا انتظره الدمج. وهذا ما يفرضه الـ **ruleset** (مجموعة القواعد). على GitHub، افتح **Settings** في الـ repository، ثم **Rules**، ثم **Rulesets**، واختر **New ruleset**، ثم **New branch ruleset**:

1. سمِّه "Protect main" واضبط **Enforcement status** على Active.
2. تحت **Target branches**، أضف الفرع الافتراضي.
3. أبقِ **Restrict deletions** و **Block force pushes** محدَّدين.
4. حدّد **Require a pull request before merging**. في repository تعمل عليه وحدك اضبط عدد الموافقات المطلوبة على 0 (لا تستطيع الموافقة على الـ pull request الخاص بك)؛ وفي الفريق، 1 أو أكثر.
5. حدّد **Require status checks to pass**، وأضف الفحص `check`، واحفظ.

الآن حاول تخطّي العملية:

```bash
git switch main
git commit --allow-empty -m "Sneak a commit onto main"
git push origin main
```

```text
remote: error: GH013: Repository rule violations found for refs/heads/main.
```

يُرفض الرفع، ويبقى الـ commit المحلي دون أن يُمسّ. كل تغيير على `main` يمرّ الآن عبر pull request، ويبقى زر الدمج معطّلًا حتى يصبح الفحص أخضر. شغّل `git reset --hard origin/main` لتتخلّص من الـ commit الفارغ.

الـ rulesets مجانية في الـ repositories العامة؛ أما في الخاصة فتحتاج إلى خطة مدفوعة مثل GitHub Pro أو Team. وقد ترى أيضًا **branch protection rules** الأقدم في الإعدادات. إنها تؤدّي مهمّة مشابهة؛ لكن الـ rulesets أحدث، ويمكن تركيبها في طبقات، ويستطيع أي شخص لديه صلاحية القراءة أن يرى القواعد المطبّقة.

:::mistake اشتراط فحص لا يبلّغ أبدًا
الفحوص المطلوبة تُطابق بالاسم. إن اشترطت `check` قبل أن يعمل الـ workflow ولو مرة، فلن يستطيع GitHub عرضه في القائمة؛ وإن أعدت تسمية الـ job لاحقًا، تنتظر الـ pull requests إلى الأبد عند "Expected — Waiting for status to be reported". شغّل الـ workflow مرة واحدة قبل أن تشترطه، وغيّر اسم الـ job والـ ruleset معًا.
:::

## ما الذي تستطيع فعله الآن

انظر من أين بدأ الموقع الشخصي: مجلد فيه `index.html`. صار الآن repository بسجلّ مقروء، وفروع تُدمج أو يُعاد تأسيسها بنظافة، و remote على GitHub تصل إليه بمصادقة سليمة، و issues تشرح سبب وجود كل عمل، وإصدارات موسومة بـ tags، وفرع `main` لا يقبل إلا pull requests مراجَعة ومفحوصة آليًا. وتستطيع التراجع عن معظم الأخطاء، وتعرف أيّ طريقة تراجع تناسب كلًا منها.

وأهمّ من الأوامر، صار لديك النموذج: الـ commits لقطات مرتبطة بآبائها، والـ branches والـ tags أسماء دالّة، والـ HEAD هو حيث تقف، والـ remotes نسخ أخرى من الرسم البياني نفسه. وحين يفاجئك Git مستقبلًا، شغّل `git log --oneline --graph --all`، وارسم ما تراه، وغالبًا سيكون الأمر التالي واضحًا.
