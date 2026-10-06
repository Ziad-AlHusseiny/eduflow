---
summary: ثبّت Git، واضبط اسمك وبريدك والفرع الافتراضي والمحرّر مرة واحدة، ثم حوّل مجلد موقعك الشخصي إلى repository وسجّل أول commit فيه.
takeaways:
  - شغّل `git config --global` مرة واحدة لكل جهاز لضبط `user.name` و `user.email` و `init.defaultBranch` و `core.editor`؛ ويخزّنها Git في `~/.gitconfig`.
  - بريد الـ commit هو ما يحدّد حساب GitHub الذي يُنسب إليه الـ commit، لذا استخدم بريدًا يعرفه حسابك، مثل عنوان noreply.
  - "`git init` ينشئ مجلدًا مخفيًا اسمه `.git`؛ هذا المجلد هو الـ repository، وحذفه يحذف السجلّ كله."
  - الـ commit خطوتان، `git add` لاختيار ما يدخل فيه و `git commit -m` لتسجيله مع رسالة.
further:
  - title: First-Time Git Setup (Pro Git)
    url: https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup
  - title: git config reference
    url: https://git-scm.com/docs/git-config
  - title: Setting your commit email address
    url: https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address
quiz:
  - q: ضبطت `user.email` على عنوان عمل قديم. تُرفع الـ commits بلا مشكلة، لكن GitHub يعرضها بصورة رمادية غير مرتبطة بأي حساب. لماذا؟
    options:
      - text: فشل الرفع بصمت و GitHub يعرض نسخة مخزّنة مؤقتًا.
        why: الـ commits موجودة على GitHub، إذن نجح الرفع. مشكلة الصورة تتعلّق بمن تقول الـ commits إنه كتبها.
      - text: لا يربط GitHub إلا الـ commits التي أُنشئت عبر موقعه.
        why: يربط GitHub الـ commits القادمة من أي أداة. فهو يطابق البريد داخل كل commit مع عناوين البريد المسجّلة في الحسابات.
      - text: عليك تشغيل `git init` من جديد لتحديث المؤلف.
        why: تشغيل `git init` على repository موجود لا يغيّر شيئًا في نسبة الـ commits. تُكتب بيانات المؤلف داخل كل commit لحظة إنشائه.
      - text: يطابق GitHub البريد المخزّن في كل commit مع حساب ما، وهذا العنوان غير مسجّل في حسابك.
        why: صحيح. أضف العنوان إلى حسابك على GitHub، أو اضبط `user.email` على عنوان يعرفه (مثل عنوان noreply الخاص بك) للـ commits القادمة.
    answer: 3
  - q: تشغّل `git commit` دون `-m` فيُفتح محرّر بملء الشاشة لا تعرفه. ما الذي حدث؟
    options:
      - text: تعطّل Git وفتح سجلّ الأخطاء الخاص به.
        why: لم يتعطّل شيء. يطلب Git رسالة، ودون `-m` يفتح المحرّر المضبوط لديك ليجمعها منك.
      - text: فتح Git المحرّر المحدّد في `core.editor` (غالبًا Vim افتراضيًا) لتكتب رسالة الـ commit.
        why: صحيح. اكتب الرسالة واحفظ وأغلق. واضبط `core.editor` على محرّر تعرفه، مثل `code --wait` أو `nano`، لتتجنّب المفاجآت.
      - text: أُنشئ الـ commit برسالة فارغة والمحرّر يعرض الـ diff.
        why: يرفض Git الرسالة الفارغة ويُلغي الـ commit. المحرّر هو المكان الذي تُكتب فيه الرسالة قبل تسجيل أي شيء.
    answer: 1
  - q: شغّلت `git init` في مجلد المستخدم الرئيسي بالخطأ، والآن يظهر كل مجلد على أنه "untracked". ما الإصلاح الصحيح؟
    options:
      - text: شغّل `git init` مرة أخرى داخل مجلد `portfolio`؛ فالـ repository الأحدث يحلّ محلّ القديم.
        why: سيبقى الـ repository الموجود في المجلد الرئيسي قائمًا ويغلّف كل شيء. الـ repositories المتداخلة تزيد الأمور ارتباكًا ولا تقلّله.
      - text: شغّل `git reset --hard` في مجلدك الرئيسي.
        why: هذا الأمر يعمل على الـ commits والـ working tree. قد يتلف تغييرات، ويترك مجلد `.git` في مكانه على أي حال.
      - text: احذف مجلد `.git` من مجلدك الرئيسي، ثم شغّل `git init` داخل `portfolio`.
        why: صحيح. مجلد `.git` هو الـ repository. حذف المجلد الشارد (لا سجلّ فيه تحتاجه) يلغي الخطأ تمامًا.
    answer: 2
  - q: أيّ أمر يجعل كل repository جديد على جهازك يبدأ على فرع اسمه `main`؟
    options:
      - text: "`git config --global init.defaultBranch main`"
        why: صحيح. يحدّد `init.defaultBranch` اسم الفرع الأول الذي ينشئه `git init`.
      - text: "`git branch --default main`"
        why: لا يوجد خيار `--default` في `git branch`. الأسماء الافتراضية تأتي من الإعدادات، لا من أمر خاص بالفروع.
      - text: "`git config core.branch main`"
        why: "`core.branch` ليس إعدادًا حقيقيًا، ودون `--global` لن يؤثّر إلا في الـ repository الحالي على أي حال."
      - text: "`git init --main`"
        why: "لدى `git init` الخيار `-b <name>` (أو `--initial-branch`) لـ repository واحد، لكن لا يوجد خيار `--main`، ولن يؤثّر في الـ repositories المستقبلية."
    answer: 0
---

قبل أن يسجّل Git أي شيء، يحتاج إلى معلومتين عنك وبعض التفضيلات. تضبطها مرة واحدة لكل حاسوب، وتؤثّر بهدوء في كل commit تنشئه لسنوات. عشر دقائق الآن توفّر عليك مئات الـ commits المنسوبة إلى «مجهول» أو إلى عنوان بريد لم تعد تملكه.

## ثبّت Git

تحقّق أولًا هل Git مثبّت لديك:

```bash
git --version
```

إن رأيت شيئًا مثل `git version 2.51.0` فأنت جاهز؛ أي إصدار 2.4x أو أحدث يناسب هذا الكورس. وإن لم يكن مثبّتًا:

- **macOS:** تشغيل `git --version` يعرض عليك تثبيت Xcode Command Line Tools، وهي تتضمّن Git. وإن كنت تستخدم Homebrew، فالأمر `brew install git` يمنحك إصدارًا أحدث.
- **Windows:** ثبّت Git for Windows من git-scm.com. أبقِ الخيارات الافتراضية؛ فهي تتضمّن Git Bash (طرفية يعمل فيها كل أمر في هذا الكورس) و Git Credential Manager الذي ستستخدمه في القسم الثالث.
- **Linux:** استخدم مدير الحزم لديك، مثلًا `sudo apt install git` على Ubuntu أو `sudo dnf install git` على Fedora.

## عرّف Git بنفسك

يخزّن كل commit اسم المؤلف وبريده. اضبطهما على المستوى العام (global)، أي لحساب المستخدم الخاص بك على هذا الجهاز:

```bash
git config --global user.name "Maya Okafor"
git config --global user.email "maya.okafor@example.com"
```

البريد أهمّ مما يبدو. يحدّد GitHub الصورة والملف الشخصي اللذين يظهران بجانب الـ commit بمطابقة البريد المخزّن داخله مع العناوين المسجّلة في حسابات GitHub. وإن كنت تفضّل ألّا تنشر عنوانك الحقيقي، فإن GitHub يعطي كل حساب عنوان noreply بالشكل `12345678+username@users.noreply.github.com` (تجده في Settings ثم Emails)، ويمكنك استخدامه بدلًا من عنوانك.

:::tip أبقِ بريدك خاصًا
في إعدادات البريد على GitHub، فعّل "Keep my email addresses private" واستخدم عنوان noreply في `user.email`. تبقى الـ commits مرتبطة بملفك الشخصي، ويبقى بريدك الحقيقي بعيدًا عن كل repository عام تلمسه.
:::

## ثلاثة تفضيلات تستحق الضبط الآن

```bash
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global --list
```

- `init.defaultBranch main` يسمّي الفرع الأول في كل repository جديد `main`، وهو ما يطابق ما ينشئه GitHub. ودونه، ما زالت إصدارات Git 2.x تسمّي الفرع الأول `master` وتطبع تلميحًا طويلًا عن ذلك.
- `core.editor` هو البرنامج الذي يفتحه Git حين يحتاج منك كتابة نص، مثل رسالة الـ commit. كثير من التثبيتات تستخدم Vim افتراضيًا، وهذا يفاجئ من لا يعرفه. `code --wait` يستخدم VS Code (والخيار `--wait` يُبقي Git منتظرًا حتى تغلق التبويب)؛ و `nano` خيار بسيط داخل الطرفية.
- `--list` يطبع ما ضبطته لتتحقّق من الأخطاء الإملائية.

تُحفظ هذه الإعدادات في ملف نصي عادي هو `~/.gitconfig`. والإعداد الذي يُضبط دون `--global` من داخل repository ما ينطبق على ذلك الـ repository وحده ويتقدّم على الإعداد العام. هذا مفيد إن أردت بريد العمل في repositories العمل وبريدك الشخصي في كل مكان آخر.

## أنشئ الـ repository

أنشئ مجلدًا لموقعك الشخصي وحوّله إلى repository (مستودع):

```bash
mkdir portfolio
cd portfolio
git init
```

```text
Initialized empty Git repository in /Users/maya/portfolio/.git/
```

مجلد `.git` المخفي هذا هو الـ repository: كل commit وكل فرع وكل إعداد لهذا المشروع يعيش داخله. أما الملفات التي تعدّلها فتوجد بجانبه. لا تعدّل أي شيء داخل `.git` بيدك، واعلم أن حذفه يحذف السجلّ ويترك ملفاتك الحالية كما هي.

:::mistake تشغيل git init في المجلد الخطأ
إن شغّلت `git init` في مجلدك الرئيسي، يغلّف Git كل ملف تملكه، ويعرض `git status` مجلدات Desktop و Downloads و Documents على أنها untracked. تحقّق من مكانك بـ `pwd` قبل `git init`. وإن حدث ذلك بالفعل، احذف المجلد الشارد بـ `rm -rf ~/.git` (هذا المجلد وحده، وفقط إن لم تنشئ فيه أي commit)، ثم شغّل `git init` داخل `portfolio`.
:::

## أنشئ أول commit

أنشئ `index.html` بصفحة بسيطة:

```html title=index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Maya Okafor</title>
  </head>
  <body>
    <h1>Maya Okafor</h1>
    <p>Front-end developer in progress.</p>
  </body>
</html>
```

الآن اسأل Git عمّا يراه:

```bash
git status
```

```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	index.html

nothing added to commit but untracked files present (use "git add" to track)
```

**Untracked** تعني أن Git يرى الملف لكنه لم يسجّله قط. إنشاء الـ commit خطوتان: اختر ما يدخل فيه، ثم سجّله.

```bash
git add index.html
git commit -m "Add home page"
```

```text
[main (root-commit) 3f9c2a1] Add home page
 1 file changed, 11 insertions(+)
 create mode 100644 index.html
```

اقرأ هذا الناتج: أنت على `main`، وهذا هو **الـ root commit** (الأول، ولا أب له)، ومعرّفه المختصر `3f9c2a1`. سيختلف معرّفك، لأن المعرّف hash مشتقّ من المحتوى واسمك والوقت والأب. شغّل `git log` لترى الـ commit بمعرّفه الكامل ومؤلفه وتاريخه.

لماذا خطوتان بدل واحدة؟ لأن المسافة بين `add` و `commit` هي حيث تقرّر ما الذي ينتمي بعضه إلى بعض. لهذه المسافة اسم، الـ staging area (منطقة التجهيز)، وهي موضوع الدرس التالي.
