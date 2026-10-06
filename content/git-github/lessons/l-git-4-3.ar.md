---
summary: اكتب رسائل commit تشرح السبب، واتبع صيغة Conventional Commits حين يستخدمها الفريق، وعلّم الإصدارات بـ tags مشروحة (annotated)، وانشر GitHub Release بملاحظات مولَّدة.
takeaways:
  - سطر العنوان الجيد قصير وبصيغة الأمر ومحدّد ("Fix footer overlap on mobile")؛ والنص، بعد سطر فارغ، يشرح السبب.
  - "الـ Conventional Commits تسبق العنوان بنوع مثل `feat` أو `fix` أو `docs`، وهذا يسمح للأدوات باستنتاج أرقام الإصدارات وسجلّات التغيير."
  - "الـ tags المشروحة (`git tag -a v1.0.0 -m \"…\"`) تسجّل من وسم ماذا ومتى؛ وهي النوع المناسب للإصدارات."
  - "`git push` لا يرسل الـ tags؛ ارفعها بـ `git push origin v1.0.0` أو `git push --follow-tags`."
  - الـ GitHub Release هو tag مع ملاحظات وملفات اختيارية، ويستطيع GitHub توليد الملاحظات من الـ pull requests المدموجة.
further:
  - title: Git Basics, Tagging (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Tagging
  - title: Commit Guidelines (Pro Git)
    url: https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines
  - title: About releases
    url: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
  - title: Automatically generated release notes
    url: https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes
quiz:
  - q: أيّ سطر عنوان يتبع أعراف Git الشائعة على أفضل وجه؟
    options:
      - text: "`Fixed some bugs.`"
        why: فعل ماضٍ، ونقطة في النهاية، و "some bugs" لا تخبر القارئ في المستقبل بشيء عمّا تغيّر.
      - text: "`Changes to the footer, nav, colours and the contact form so it works on phones now`"
        why: أطول بكثير مما يناسب العنوان، ويسرد أربعة تغييرات، ما يوحي بأربعة commits.
      - text: "`WIP`"
        why: مقبول كـ commit محلي مؤقت ستضغطه لاحقًا، لكنه بلا معنى حين يدخل السجلّ المشترك.
      - text: "`Fix footer overlapping content on mobile`"
        why: صحيح. بصيغة الأمر، ومحدّد، وأقل من 50 حرفًا. ويُكمل الجملة "If applied, this commit will…".
    answer: 3
  - q: وفق الـ Conventional Commits والترقيم الدلالي (semantic versioning)، أيّ تغيير يجب أن ينقل الإصدار 1.4.2 إلى 2.0.0؟
    options:
      - text: "`fix: correct contrast on dark mode links`"
        why: الإصلاح يقابله إصدار patch، أي 1.4.3.
      - text: "`feat: add tag filter to projects page`"
        why: الـ feature الجديدة يقابلها إصدار minor، أي 1.5.0.
      - text: "`feat!: rename the data-theme attribute to data-color-scheme`"
        why: صحيح. علامة `!` (أو تذييل `BREAKING CHANGE:`) تعلّم تغييرًا كاسرًا للتوافق، ويقابله إصدار major.
      - text: "`docs: explain how to run the HTML check`"
        why: تغييرات الوثائق لا تؤثّر في السلوك المنشور، ولا تستدعي عادةً أي إصدار.
    answer: 2
  - q: شغّلت `git tag -a v1.0.0 -m "Portfolio launch"` ثم `git push`. والـ tag غير موجود على GitHub. لماذا؟
    options:
      - text: "`git push` لا يرفع الـ tags افتراضيًا؛ شغّل `git push origin v1.0.0` (أو `git push --follow-tags`)."
        why: صحيح. الـ tags تُرفع صراحةً، كي لا تنشر tags تجريبية بالخطأ.
      - text: الـ tags المشروحة لا يمكن رفعها؛ وحدها الـ tags الخفيفة (lightweight) يمكن رفعها.
        why: النوعان كلاهما يمكن رفعهما. والـ tags المشروحة هي النوع الموصى به للإصدارات.
      - text: لا يقبل GitHub إلا الـ tags المنشأة عبر صفحة Releases.
        why: يقبل GitHub أي tag مرفوع، ويمكن إنشاء release منه بعد ذلك.
      - text: يجب أن يبدأ اسم الـ tag بـ `release-`.
        why: أسماء الـ tags حرّة. و `v1.0.0` هو العُرف الشائع.
    answer: 0
  - q: ما الميزة الأساسية للـ tag المشروح على الـ tag الخفيف في الإصدار؟
    options:
      - text: الـ tags المشروحة يمكن أن تشير إلى أي commit؛ والخفيفة إلى الـ HEAD فقط.
        why: النوعان كلاهما يمكن أن يشيرا إلى أي commit. اكتب معرّف الـ commit بعد اسم الـ tag.
      - text: الـ tag المشروح كائن كامل فيه الواسم والتاريخ والرسالة، فيسجّل الإصدار من علّمه ولماذا.
        why: صحيح. الـ tag الخفيف مجرد اسم لـ commit، كفرع لا يتحرّك أبدًا.
      - text: الـ tags المشروحة تتقدّم مع الـ commits الجديدة، كالفروع.
        why: لا يتحرّك أيّ من نوعي الـ tags. وهذا هو جوهر الـ tag.
    answer: 1
---

بعد ستة أشهر من الآن ستشغّل `git log` على موقعك الشخصي باحثًا عن اللحظة التي تعطّل فيها الثيم الداكن، وستقرأ رسائل كتبتها أنت في الماضي. "updates" و "fix" و "asdf" لن تساعدك. فائدة السجلّ بقدر فائدة الكلمات المرفقة به. يدور هذا الدرس حول جعل هذه الكلمات ذات قيمة، ثم حول تسمية اللحظات المهمّة: الإصدارات.

## كيف تبدو رسالة الـ commit الجيدة

لرسالة الـ commit **سطر عنوان** (subject line)، ثم سطر فارغ، ثم **نص** (body) اختياري:

```text
Fix footer overlapping content on mobile

The footer used position: fixed, so on screens shorter than
the content it covered the last project card. Switch to a
normal flow footer and add bottom padding to the grid.

Closes #13
```

الأعراف، وسبب وجودها:

- **عنوان في حدود 50 حرفًا.** إنه ما يعرضه `git log --oneline` وقوائم الـ commits في GitHub وعناوين الـ pull requests؛ والعناوين الطويلة تُقتطع.
- **صيغة الأمر:** "Fix" و "Add" و "Remove"، لا "Fixed" ولا "Adds". واختبار مفيد: العنوان يُكمل الجملة "If applied, this commit will…". وهو أيضًا يطابق الرسائل التي يكتبها Git بنفسه، مثل "Merge branch 'footer'".
- **لا نقطة** في نهاية العنوان.
- **النص يشرح السبب**، ويُلفّ عند نحو 72 حرفًا. الـ diff يبيّن أصلًا *ما* الذي تغيّر؛ وأنت وحدك تعرف السبب، والبديل الذي رفضته، والخطأ الذي يصلحه.
- **التذييلات (trailers) في الأسفل**: `Closes #13`، أو `Co-authored-by: Name <email>` الذي يستخدمه GitHub لنسب العمل إلى شركاء البرمجة الثنائية.

استخدم `git commit` دون `-m` حين يحتاج التغيير إلى نص؛ فمحرّرك يسهّل كتابة الرسائل متعدّدة الأسطر. أما للتغييرات ذات السطر الواحد، فـ `-m` كافٍ.

## الـ Conventional Commits

كثير من الفرق تعتمد صيغة منظّمة تُسمّى **Conventional Commits**:

```text
feat(projects): add tag filter to projects page
fix(nav): close mobile menu when a link is clicked
docs: add setup steps to README
ci: run HTML check on pull requests
feat!: rename data-theme attribute to data-color-scheme
```

الشكل هو `type(optional scope): description`. تعرّف المواصفة `feat` (feature جديدة) و `fix` (إصلاح خطأ)؛ وتضيف الفرق عادةً `docs` و `style` (تنسيق فقط، لا CSS) و `refactor` و `perf` و `test` و `build` و `ci` و `chore`. وعلامة `!` قبل النقطتين، أو تذييل `BREAKING CHANGE:`، تعلّم تغييرًا يكسر التوافق مع المستخدمين الحاليين.

والمكسب هو الأتمتة. لأن النوع قابل للقراءة آليًا، تستطيع الأدوات توليد سجلّات التغيير (changelogs) واختيار **الإصدار الدلالي** (semantic version) التالي لك: `fix` يرفع رقم الـ patch (من 1.4.2 إلى 1.4.3)، و `feat` يرفع الـ minor (1.5.0)، والتغيير الكاسر يرفع الـ major (2.0.0).

عادةً ما تُبقي الـ Conventional Commits الوصف بأحرف صغيرة، وهذا يختلف عن الأسلوب ذي الحرف الأول الكبير أعلاه. وليس أيٌّ منهما خاطئًا. استخدم ما يستخدمه الـ repository أصلًا؛ فالاتساق يتفوّق على التفضيل الشخصي. وفي موقعك الشخصي، جرّب الـ Conventional Commits؛ فهي شائعة بما يكفي في الفرق لتؤتي هذه العادة ثمارها.

:::mistake رسالة commit واحدة لأربعة تغييرات
الرسالة التي تحتاج إلى «و» ثلاث مرات ("add contact form and fix nav and change colours") تخبرك أن الـ commit كان يجب أن يُقسَّم. قبل الـ commit، شغّل `git diff --staged` واسأل هل تغطّيه جملة واحدة. إن لم تغطّه، فألغِ التجهيز وسجّل على أجزاء بـ `git add -p`.
:::

## الـ Tags: تسمية لحظة

الفروع تتحرّك؛ أما الـ **tags** (الوسوم) فلا. الـ tag اسم دائم لـ commit واحد، يُستخدم لتعليم الإصدارات: الموقع الشخصي كما كان عند الإطلاق، وعند v1.1، وهكذا.

في Git نوعان. الـ tag **الخفيف** (lightweight) مجرد اسم يشير إلى commit. والـ tag **المشروح** (annotated) كائن كامل فيه اسم الواسم وتاريخ ورسالة. استخدم الـ tags المشروحة للإصدارات:

```bash
git tag -a v1.0.0 -m "Portfolio launch"
git tag                       # list tags
git show v1.0.0               # tag message, then the commit it points at
git tag -a v0.9.0 b2e04f3 -m "Preview for mentors"   # tag an older commit
```

تبقى الـ tags على جهازك حتى ترفعها، وهذا يفاجئ معظم الناس في المرة الأولى:

```bash
git push origin v1.0.0        # one tag
git push --follow-tags        # commits plus any annotated tags that point at them
```

تعامل مع الـ tag المرفوع على أنه دائم. إن وسمت الـ commit الخطأ ورفعته بالفعل، فانشر إصدارًا جديدًا (v1.0.1) بدل تحريك v1.0.0 من تحت أقدام من ربما استخدموه.

## الـ GitHub Releases

الـ **release** (الإصدار) على GitHub هو tag مع عنوان وملاحظات وملفات اختيارية للتنزيل. افتح صفحة Releases في الـ repository، واختر Draft a new release، وحدّد الـ tag (أو أنشئ واحدًا)، ثم انقر **Generate release notes**: يسرد GitHub الـ pull requests المدموجة منذ الإصدار السابق، مع كاتبيها. حرّر الملاحظات حتى تصبح شيئًا يرغب إنسان في قراءته، ثم انشر.

والـ CLI يفعل الشيء نفسه في سطر واحد:

```bash
gh release create v1.0.0 --title "Portfolio v1.0.0" --generate-notes
```

عناوين الـ pull requests الجيدة تصبح ملاحظات إصدار جيدة مجانًا، وهذا سبب إضافي لكون العادات السابقة تؤتي ثمارها.

:::tip أرقام الإصدارات لموقع ويب
الموقع الشخصي لا مستخدمين لواجهته البرمجية، لذا فالترقيم الدلالي الصارم اختياري. لكن وسم عمليات الإطلاق وإعادات التصميم الكبرى يمنحك نقاطًا مسمّاة تستطيع المقارنة بينها (`git diff v1.0.0 v2.0.0 -- styles.css`) والعودة إليها، وهذا يستحق العشر ثوانٍ.
:::

الرسائل النظيفة والـ tags والإصدارات تجعل السجلّ مقروءًا. والخطوة الأخيرة جعل `main` جديرًا بالثقة دون أن تضطر إلى مراقبته بنفسك: فحوص آلية على كل pull request، وقواعد تفرضها.
