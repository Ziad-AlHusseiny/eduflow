---
summary: أعِدّ مصادقة Git مع GitHub عبر HTTPS باستخدام مدير بيانات اعتماد أو عبر SSH بمفتاح ed25519، واختبر الاتصال، وبدّل عنوان الـ remote بين الصيغتين.
takeaways:
  - لا يقبل GitHub كلمة مرور حسابك في عمليات Git؛ استخدم مدير بيانات اعتماد، أو personal access token، أو مفتاح SSH.
  - يسجّل Git Credential Manager (أو `gh auth login`) دخولك عبر المتصفّح مرة واحدة ويخزّن بيانات الاعتماد بأمان.
  - "زوج مفاتيح SSH له نصف خاص لا يغادر جهازك أبدًا، ونصف عام بامتداد `.pub` تضيفه إلى GitHub."
  - "`ssh -T git@github.com` يختبر مصادقة SSH ويرحّب بك باسم المستخدم حين تنجح."
  - "عنوان الـ remote يحدّد البروتوكول: `https://github.com/…` يستخدم HTTPS، و `git@github.com:…` يستخدم SSH؛ وتبدّل بينهما بـ `git remote set-url`."
further:
  - title: About authentication to GitHub
    url: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github
  - title: Caching your GitHub credentials in Git
    url: https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git
  - title: Generating a new SSH key and adding it to the ssh-agent
    url: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
  - title: Testing your SSH connection
    url: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection
quiz:
  - q: يطلب `git push` عبر HTTPS كلمة مرور. تكتب كلمة مرور GitHub فتحصل على `Support for password authentication was removed`. ماذا تفعل؟
    options:
      - text: أعِد تعيين كلمة مرور GitHub؛ لا بد أن القديمة انتهت صلاحيتها.
        why: كلمة المرور سليمة للموقع. الأمر ببساطة أن GitHub لا يقبل كلمات مرور الحسابات في عمليات Git إطلاقًا.
      - text: بدّل الـ remote إلى `http://` بدل `https://`.
        why: لا يقدّم GitHub خدمة Git عبر HTTP العادي، وإرسال بيانات الاعتماد دون تشفير سيكون أسوأ لا أفضل.
      - text: أوقف المصادقة الثنائية لتعمل كلمة المرور.
        why: المصادقة الثنائية ليست السبب، وإيقافها يجعل الاستيلاء على حسابك أسهل. ولن يقبل Git كلمة المرور على أي حال.
      - text: أعِدّ مدير بيانات اعتماد (أو `gh auth login`) يسجّل دخولك عبر المتصفّح، أو استخدم personal access token.
        why: صحيح. يشترط GitHub بيانات اعتماد قائمة على token عبر HTTPS؛ ومدير بيانات الاعتماد يحصل عليها ويخزّنها لك.
    answer: 3
  - q: بعد تشغيل `ssh-keygen -t ed25519`، أيّ ملف تلصقه في نموذج "New SSH key" على GitHub؟
    options:
      - text: "`~/.ssh/id_ed25519`، ملف المفتاح نفسه."
        why: هذا هو المفتاح الخاص. من يملكه يستطيع التصرّف باسمك. ولا يغادر جهازك أبدًا.
      - text: "`~/.ssh/known_hosts`"
        why: هذا الملف يسجّل الخوادم التي اتصلت بها. وليس مفتاحًا خاصًا بك.
      - text: "`~/.ssh/id_ed25519.pub`، المفتاح العام."
        why: صحيح. النصف العام آمن للمشاركة؛ ويستخدمه GitHub للتحقّق من أنك تملك المفتاح الخاص المطابق.
      - text: الملفين كليهما، ليتحقّق GitHub من تطابقهما.
        why: لا يحتاج GitHub إلا المفتاح العام. ورفع المفتاح الخاص إلى أي مكان يعني أن عليك توليد زوج جديد.
    answer: 2
  - q: الـ SSH يعمل (`ssh -T git@github.com` يرحّب بك)، لكن `git push` ما زال يطلب اسم مستخدم وكلمة مرور. لماذا؟
    options:
      - text: عنوان الـ remote ما زال HTTPS؛ بدّله بـ `git remote set-url origin git@github.com:maya-okafor/portfolio.git`.
        why: صحيح. يستخدم Git البروتوكول الذي يسمّيه عنوان الـ remote أيًّا كان. والعنوان `https://` لا يلمس مفتاح SSH الخاص بك أبدًا.
      - text: يجب إضافة مفتاح SSH إلى إعدادات الـ repository لا إلى حسابك.
        why: المفاتيح المضافة إلى حسابك تعمل مع كل repository يمكنك الوصول إليه. أما مفاتيح النشر (deploy keys) الخاصة بالـ repository فهي للخوادم، لا لك.
      - text: عليك تشغيل `ssh-keygen` مرة أخرى داخل الـ repository.
        why: المفاتيح تخصّ المستخدم، لا الـ repository. وتوليد مفتاح آخر لن يغيّر البروتوكول الذي يستخدمه Git.
    answer: 0
  - q: أنت على شبكة تحجب المنفذ 22. أيّ خيار يُبقي Git يعمل بأقل عناء؟
    options:
      - text: ولّد مفتاح RSA بدل ed25519.
        why: نوع المفتاح لا يؤثّر في المنفذ الذي يستخدمه الاتصال.
      - text: استخدم HTTPS مع مدير بيانات اعتماد، فهو يعمل عبر المنفذ 443 مثل حركة الويب العادية.
        why: صحيح. يذهب HTTPS إلى حيث يذهب الويب. (ويوفّر GitHub أيضًا SSH عبر المنفذ 443 على `ssh.github.com` إن كنت تفضّل SSH.)
      - text: ارفع عبر موقع GitHub بتحميل الملفات واحدًا تلو الآخر.
        why: هذا ينفع لتعديل سريع، لكنه يتجاوز سجلّك المحلي وليس طريقة للاستمرار في استخدام Git.
      - text: أوقف جدار الحماية على حاسوبك.
        why: الحجب على الشبكة لا على حاسوبك، وإيقاف جدار الحماية الخاص بك لا يضيف إلا المخاطر.
    answer: 1
---

طلب منك أول `git push` اسم مستخدم وكلمة مرور. يحتاج GitHub إلى دليل على أن من يرفع إلى `maya-okafor/portfolio` هي Maya فعلًا. ولن يقبل كلمة مرور حسابك لهذا الغرض؛ فقد توقّف عن ذلك منذ 2021، حين نقل عمليات Git إلى بيانات اعتماد أقوى. لديك خياران جيدان، وتُعدّ أيًّا منهما مرة واحدة فقط لكل حاسوب.

## البروتوكولان

عنوان الـ remote يحدّد كيف يتحدّث Git مع GitHub:

```text
https://github.com/maya-okafor/portfolio.git    HTTPS
git@github.com:maya-okafor/portfolio.git        SSH
```

**HTTPS** يصادق بـ token. ويحصل مدير بيانات الاعتماد على واحد بإرسالك عبر تسجيل الدخول العادي إلى GitHub في المتصفّح (بما في ذلك المصادقة الثنائية)، ثم يخزّنه في المخزن الآمن لنظامك. أما **SSH** فيصادق بزوج مفاتيح تولّده أنت؛ يخزّن GitHub النصف العام ويتحقّق من أنك تملك النصف الخاص.

أيهما تختار؟ HTTPS مع مدير بيانات اعتماد هو الأسهل إعدادًا ويعمل على أي شبكة تسمح بتصفّح الويب. أما SSH فيأخذ خمس دقائق إضافية، ولا تنتهي صلاحية مفتاحه (يحذف GitHub المفتاح فقط إن بقي عامًا كاملًا دون استخدام)، وهو ما يستخدمه كثير من المطوّرين يوميًا. وكلاهما آمن بالقدر نفسه حين يُعدّ كما يجب. إن كنت مترددًا فابدأ بـ HTTPS؛ وتستطيع التبديل في أي وقت.

## الخيار الأول: HTTPS مع مدير بيانات اعتماد

يأتي **Git Credential Manager** (GCM) مع Git for Windows. وعلى macOS ثبّته بـ Homebrew (`brew install --cask git-credential-manager`)؛ وعلى Linux اتبع دليل التثبيت في صفحته على GitHub. في المرة التالية التي يحتاج فيها Git إلى بيانات اعتماد، تُفتح نافذة متصفّح، فتسجّل دخولك إلى GitHub وتوافق، ويخزّن GCM الـ token. ولن يُطلب منك ذلك مرة أخرى.

وإن كنت قد ثبّت GitHub CLI، فبإمكانه القيام بالمهمّة نفسها:

```bash
gh auth login
```

اختر GitHub.com ثم HTTPS، وأجب بنعم عن "Authenticate Git with your GitHub credentials?". يسجّل دخولك عبر المتصفّح ويضبط Git ليستخدمه كمساعد بيانات اعتماد (credential helper).

البديل اليدوي هو **personal access token** (رمز وصول شخصي): أنشئ واحدًا من Settings ثم Developer settings، والصقه حيث يطلب Git كلمة المرور. هذا ينجح، لكن عليك أن تدير انتهاء صلاحيته وتخزينه بنفسك، لذا فضّل مدير بيانات الاعتماد على جهازك الشخصي، واحتفظ بالـ tokens للأتمتة.

## الخيار الثاني: مفاتيح SSH

ولّد زوج مفاتيح. Ed25519 هو الخيار الافتراضي الحديث:

```bash
ssh-keygen -t ed25519 -C "maya.okafor@example.com"
```

اضغط Enter لقبول المكان الافتراضي، ثم اضبط عبارة مرور (passphrase). عبارة المرور تحمي المفتاح الخاص إن سُرق حاسوبك يومًا. والتعليق بعد `-C` اسم يساعدك على التعرّف على المفتاح لاحقًا.

لديك الآن ملفان:

- `~/.ssh/id_ed25519`، وهو **المفتاح الخاص**. لا يغادر هذا الجهاز أبدًا.
- `~/.ssh/id_ed25519.pub`، وهو **المفتاح العام**. آمن للمشاركة؛ وهو ما يحصل عليه GitHub.

حمّل المفتاح في الـ SSH agent لتكتب عبارة المرور مرة واحدة في كل جلسة، لا مع كل رفع:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

على macOS، الأمر `ssh-add --apple-use-keychain ~/.ssh/id_ed25519` يخزّن عبارة المرور في Keychain؛ ويعرض دليل GitHub أسطر `~/.ssh/config` المقابلة. ثم انسخ المفتاح العام (`pbcopy < ~/.ssh/id_ed25519.pub` على macOS، أو افتح الملف وانسخ سطره الوحيد)، وعلى GitHub اذهب إلى Settings ثم SSH and GPG keys ثم New SSH key، والصقه.

اختبر الاتصال:

```bash
ssh -T git@github.com
```

في المرة الأولى، يطلب منك SSH تأكيد البصمة (fingerprint) الخاصة بخادم GitHub؛ قارنها بالبصمات التي ينشرها GitHub في وثائقه قبل أن تكتب `yes`. والنجاح يبدو هكذا:

```text
Hi maya-okafor! You've successfully authenticated, but GitHub does not provide shell access.
```

سطر "does not provide shell access" طبيعي؛ فأنت لا تسجّل الدخول إلى خادم، بل تثبت هويتك فقط.

:::mistake مشاركة المفتاح الخطأ
الملف الذي لا ينتهي بـ `.pub` هو مفتاحك الخاص. لصقه في GitHub أو في محادثة أو في issue يشبه نشر مفتاح بيتك على الإنترنت: احذف ذلك المفتاح من كل مكان، وولّد زوجًا جديدًا، وأضف المفتاح العام الجديد. إن كان الملف الذي توشك على مشاركته لا ينتهي بـ `.pub`، فتوقّف.
:::

## توجيه الـ remote إلى البروتوكول الصحيح

المصادقة تتبع العنوان. إن أعددت SSH لكنك استنسخت عبر HTTPS، يواصل Git استخدام HTTPS. تحقّق وبدّل:

```bash
git remote -v
git remote set-url origin git@github.com:maya-okafor/portfolio.git
git push
```

والاتجاه المعاكس هو الأمر نفسه مع عنوان `https://`.

:::tip مفتاح لكل جهاز
ولّد مفتاحًا منفصلًا على كل حاسوب تستخدمه، وأعطِ كلًا منها عنوانًا واضحًا على GitHub ("Maya MacBook 2026"). إن ضاع حاسوب، تحذف ذلك المفتاح وحده من GitHub ولا يتعطّل شيء آخر.
:::

بعد حلّ مسألة الرفع، تستطيع أن تبدأ العمل كما تعمل الفرق على GitHub: عبر الـ pull requests.
