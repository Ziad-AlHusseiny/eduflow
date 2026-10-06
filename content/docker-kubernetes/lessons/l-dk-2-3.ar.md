---
summary: سمِّ images ‏notes-api وأعطها أرقام إصدارات وارفعها إلى registry بحيث يمكن تتبّع كل deploy، وثبّت الـ images بالـ digest، وابنِ لمعماريّتَي amd64 وarm64 حتى يستطيع الـ cluster تشغيل ما بناه جهازك.
takeaways:
  - مرجع الـ image هو `registry/namespace/repository:tag@digest`؛ الـ tag لافتة قابلة للنقل، والـ digest بصمة المحتوى.
  - "الـ tag ‏`latest` مجرد اسم الـ tag الافتراضي، لا أحدث بناء؛ انشر إصدارات صريحة مثل `1.4.0` أو SHA من Git."
  - لا تدفع أبدًا محتوى مختلفًا تحت tag منشور فعلًا؛ وفعّل ثبات الـ tags (tag immutability) حيث يدعمه الـ registry لديك.
  - التثبيت بالـ digest ‏(`@sha256:…`) يضمن أن كل node يشغّل البايتات نفسها، لتطبيقك وللـ base images.
  - ابنِ images متعدّدة المنصّات بـ `docker buildx build --platform linux/amd64,linux/arm64` حين يستخدم المطوّرون والخوادم معالجات مختلفة.
further:
  - title: docker image tag
    url: https://docs.docker.com/reference/cli/docker/image/tag/
  - title: Multi-platform builds
    url: https://docs.docker.com/build/building/multi-platform/
  - title: Images in Kubernetes
    url: https://kubernetes.io/docs/concepts/containers/images/
quiz:
  - q: اثنان من الـ Pods في الـ Deployment نفسه، وكلاهما يستخدم `notes-api:latest`، يتصرّفان بشكل مختلف. ما التفسير الأرجح؟
    options:
      - text: يختار Kubernetes عشوائيًا بين إصدارات الـ image المخزّنة.
        why: لا شيء عشوائي هنا. كل node سحب ما كان الـ tag يشير إليه لحظة السحب.
      - text: "الـ tag ‏`latest` يُحلّ دائمًا إلى أحدث image مع كل بدء للـ container."
        why: يُحلّ إلى ما يشير إليه الـ tag حين يسحب الـ node. والـ node الذي لديه نسخة مخزّنة قد لا يسحب مرة أخرى أبدًا.
      - text: أُعيد دفع الـ tag بمحتوى جديد، وسحبه كلٌّ من الـ nodes الاثنين في وقت مختلف.
        why: صحيح. الـ tags قابلة للتغيير، فالاسم نفسه دلّ على بايتات مختلفة على nodes مختلفة. استخدم tags ذات إصدارات أو digests.
      - text: أحد الـ Pods يشغّل image تالفة.
        why: الـ registries تتحقّق من الـ layers بالـ digest، فالتلف يُفشل السحب بدلًا من أن يعمل بصمت.
    answer: 2
  - q: ماذا يحدّد digest مثل `sha256:3f1c…`؟
    options:
      - text: تاريخ بناء الـ image ووقته.
        why: وقت البناء بيانات وصفية داخل إعدادات الـ image، وليس هو الـ digest.
      - text: محتوى الـ image بالضبط؛ وأي تغيير في الـ image ينتج digest مختلفًا.
        why: صحيح. إنه hash للـ manifest، الذي يسرد بدوره hashes الـ layers. الـ digest نفسه يعني البايتات نفسها، في كل مكان.
      - text: الـ commit في Git الذي بُنيت منه الـ image.
        why: الـ SHA من Git يصلح *tag* جيدًا، لكن الـ digest يُحسب من الـ image نفسها.
      - text: حساب الـ registry الذي دفع الـ image.
        why: الـ digest مستقل عمّن دفع الـ image وعن مكان تخزينها.
    answer: 1
  - q: يبني مطوّرٌ image ‏notes-api على حاسوب Apple Silicon ويدفعها. على الـ cluster ذي معمارية amd64 يكتب الـ Pod في سجلّه `exec format error`. ما الحل؟
    options:
      - text: أضف `EXPOSE` لمعمارية الـ cluster.
        why: "التعليمة `EXPOSE` توثّق المنافذ؛ ولا تستطيع تغيير معمارية المعالج للملفات التنفيذية."
      - text: غيّر الـ base image إلى Alpine.
        why: images ‏Alpine تأتي أيضًا لكل معمارية على حدة. والـ image المبنية على الحاسوب ما زالت arm64.
      - text: اضبط `imagePullPolicy` على `Always` في الـ Deployment.
        why: السحب من جديد يجلب الـ image نفسها التي لا تدعم إلا arm64.
      - text: ابنِ بـ `docker buildx build --platform linux/amd64,linux/arm64` (ويفضَّل في الـ CI) حتى يحتوي فهرس الـ image على المعماريّتين.
        why: صحيح. الحاسوب بنى arm64 فقط. البناء متعدّد المنصّات يدفع tag واحدًا يشير فهرسه إلى manifest لكل معمارية.
    answer: 3
  - q: أي مخطّط للـ tags يعطي أفضل قابلية للتتبّع لإصدارات notes-api؟
    options:
      - text: إصدار دلالي مع tag من SHA الخاص بـ Git، مثل `1.4.0` و`sha-9f2c1ab`، يُدفعان للبناء نفسه.
        why: صحيح. الإصدار هو ما يتحدّث عنه الناس؛ والـ SHA يخبرك بالضبط أي commit تقرأ حين ينكسر شيء.
      - text: الـ tag ‏`latest` فقط، يُعاد دفعه مع كل merge إلى `main`.
        why: تفقد أي وسيلة لمعرفة أي بناء يعمل، أو للتراجع إلى بناء محدّد باسمه.
      - text: تاريخ البناء، مثل `2026-10-05`.
        why: بناءان في يوم واحد يتصادمان، والتاريخ لا يشير إلى الكود الذي أنتجه.
      - text: اسم المطوّر، مثل `amara-test`.
        why: يصلح لتجربة عابرة، ولا فائدة منه لمعرفة ما يعمل في الإنتاج.
    answer: 0
---

في الحادية عشرة ليلًا من ليلة إطلاق، أعطى اثنان من الـ Pods التابعة للخدمة نفسها إجابتين مختلفتين عن الطلب نفسه. كلاهما كان يشغّل `api:latest`. أحدهم أعاد دفع `latest` بعد الظهر، فسحب أحد الـ nodes الـ image الجديدة بينما بقي الآخر يستخدم نسخته المخزّنة. قضينا ساعة نثبت أن الكود سليم قبل أن ينظر أحد إلى الـ image. الأسماء جزء من عملية النشر، فاجعلها دقيقة.

## تشريح مرجع الـ image

```text
ghcr.io/skylane/notes-api:1.4.0@sha256:3f1c9e…
└──┬──┘ └──┬──┘ └───┬───┘ └─┬─┘ └─────┬─────┘
registry  namespace  repo    tag      digest
```

- الـ **registry** (مستودع الـ images) هو الخادم الذي يخزّن الـ images: ‏Docker Hub (الافتراضي حين لا تذكره)، وGitHub Container Registry ‏(`ghcr.io`)، وAmazon ECR، وGoogle Artifact Registry، وغيرها.
- الـ **tag** تسمية سهلة القراءة على البشر. وهو مؤشّر، والمؤشّرات يمكن أن تتحرّك.
- الـ **digest** (البصمة) هو hash من نوع SHA-256 للـ manifest الخاص بالـ image (أو لفهرس الـ image في حالة image متعدّدة المنصّات)، والـ manifest بدوره يسرد hash كل layer. غيّر بايتًا واحدًا في أي مكان فيتغيّر الـ digest. لا يمكن نقله.

الـ image ‏`notes-api:latest` ليست مميّزة. ‏`latest` مجرد الـ tag الذي يستخدمه Docker حين لا تحدّد واحدًا. لا يعني «الأحدث»، ولا شيء يحدّثه ما لم يدفعه أحد.

## مخطّط tags يصمد

لكل بناء قد يُنشر، ادفع اثنين من الـ tags للـ image نفسها:

- **إصدار** يتحدّث عنه الناس: `1.4.0`.
- الـ **commit** الذي جاء منه: `sha-9f2c1ab`.

حين يُبلغ أحدهم عن خلل في «1.4.0»، يأخذك الـ tag الخاص بالـ SHA مباشرة إلى الكود. والقاعدة التي تمنع حادث ليلة الإطلاق: **لا تدفع أبدًا محتوى مختلفًا تحت tag منشور فعلًا.** إن أصلحت شيئًا، فهذا `1.4.1`. كثير من الـ registries تستطيع فرض ذلك؛ فلـ Amazon ECR مثلًا إعداد لثبات الـ tags يرفض أي دفع إلى tag موجود.

ابنِ مرة واحدة، ثم رقِّ (promote) الـ image نفسها من بيئة إلى أخرى مرات عديدة. الـ image التي تجتاز staging يجب أن تكون بالضبط الـ image التي تصل إلى الإنتاج، ويعرّفها الـ digest نفسه. لا تُعد البناء من الـ commit نفسه للإنتاج «احتياطًا»: إعادة البناء قد تسحب base image أحدث أو اعتمادية غير مباشرة مختلفة، وعندها يشغّل الإنتاج شيئًا لم يختبره أحد. الترقية تغيير في الـ digest الذي يشير إليه الـ manifest الخاص بكل بيئة، لا بناء جديد.

حافظ على ترتيب الـ registry أيضًا. قواعد الاحتفاظ التي تحذف الـ images بلا tags وtags الـ SHA القديمة بعد بضعة أشهر تخفّض تكاليف التخزين، لكن استثنِ منها كل ما زال manifest يشير إليه، وإلا فسيفشل التراجع التالي بسبب image مفقودة.

## رفع الـ image إلى registry

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u amara-skylane --password-stdin

GIT_SHA=$(git rev-parse --short HEAD)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/skylane/notes-api:1.4.0 \
  -t ghcr.io/skylane/notes-api:sha-$GIT_SHA \
  --push .

docker buildx imagetools inspect ghcr.io/skylane/notes-api:1.4.0
```

الخيار `--password-stdin` يُبقي الـ token خارج سجلّ الأوامر في الـ shell. وفي الـ CI، استخدم الـ token قصير العمر الذي توفّره المنصّة بدلًا من token شخصي. والأمر الأخير يطبع الـ digest الخاص بالـ image والمنصّات التي تحتويها.

## الـ images متعدّدة المنصّات

قد يكون حاسوبك arm64 ‏(Apple Silicon) بينما الـ nodes في الـ cluster من نوع amd64، أو العكس. الـ image المبنية لمعمارية معالج معيّنة تفشل على الأخرى برسالة مقتضبة: `exec format error`. البناء متعدّد المنصّات يحلّ ذلك: ‏`--platform linux/amd64,linux/arm64` يبني النسختين ويدفع **image index** (فهرس الـ image)، وهو قائمة صغيرة تربط كل منصّة بالـ manifest الخاص بها. حين يسحب node الـ image ‏`notes-api:1.4.0`، يختار الـ runtime الـ manifest المناسب لمعماريّته.

:::figure tag واحد يشير إلى فهرس، وكل node يسحب الـ manifest الخاص بمعالجه
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">الـ tag ‏1.4.0 يشير إلى digest لفهرس image. الفهرس يسرد manifest لـ amd64 وmanifest لـ arm64، وكل منهما يسرد الـ layers الخاصة به.</title>
  <rect class="d-box-warn" x="20" y="100" width="130" height="50" rx="10"/>
  <text class="d-code" x="85" y="130" text-anchor="middle">tag 1.4.0</text>
  <path class="d-arrow" d="M150 125 L208 125" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="210" y="90" width="170" height="70" rx="10"/>
  <text class="d-label-strong" x="295" y="118" text-anchor="middle">image index</text>
  <text class="d-code" x="295" y="142" text-anchor="middle">sha256:3f1c…</text>
  <path class="d-arrow" d="M380 110 L458 62" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 140 L458 188" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="460" y="30" width="220" height="64" rx="10"/>
  <text class="d-label" x="570" y="56" text-anchor="middle">manifest لـ linux/amd64</text>
  <text class="d-label-muted" x="570" y="80" text-anchor="middle">layers لـ nodes ‏x86</text>
  <rect class="d-box-accent" x="460" y="156" width="220" height="64" rx="10"/>
  <text class="d-label" x="570" y="182" text-anchor="middle">manifest لـ linux/arm64</text>
  <text class="d-label-muted" x="570" y="206" text-anchor="middle">layers لـ nodes ‏ARM</text>
  <text class="d-label-muted" x="85" y="175" text-anchor="middle">قابل للنقل</text>
  <text class="d-label-muted" x="295" y="185" text-anchor="middle">ثابت</text>
</svg>
:::

البناء لمعمارية غير معمارية جهازك يعمل تحت المحاكاة، وقد يكون بطيئًا مع خطوات `npm ci` الثقيلة. الـ runners في الـ CI التي تملك أجهزة arm64 وamd64 أصلية أسرع حين يكبر البناء. ولكي تحتفظ بالـ images متعدّدة المنصّات محليًا، يحتاج Docker إلى مخزن الـ images الخاص بـ containerd ‏(containerd image store)، وهو الإعداد الافتراضي في تثبيتات Docker Desktop الجديدة؛ أما في الإعدادات الأقدم فتأكّد من أنه مفعّل.

## التثبيت بالـ digest

الـ digest يضمن أن كل node يشغّل بايتات متطابقة، مهما حدث للـ tag لاحقًا. تستطيع النشر بالاثنين معًا، والـ digest هو الذي يفوز:

```yaml
image: ghcr.io/skylane/notes-api:1.4.0@sha256:3f1c9e…
```

يبقى الـ tag في المرجع من أجل البشر؛ والـ runtime يسحب بالـ digest. افعل الشيء نفسه مع الـ base images في الـ Dockerfile، حتى لا تلتقط إعادة البناء في الشهر القادم نسخة مختلفة من `node:24-slim` بصمت:

```dockerfile
FROM node:24-slim@sha256:<digest-from-imagetools-inspect> AS build
```

التثبيت يقايض الترقيعات التلقائية بإمكانية التنبّؤ، لذا اقرنه بأداة آلية مثل Dependabot أو Renovate تفتح pull request حين يُنشر digest جديد للـ base. فتحصل على التحديثات مراجَعة ومختبَرة، بدلًا من المفاجآت.

:::mistake التثبيت ثم النسيان
الـ base المثبّتة بالـ digest لا تحصل على إصلاحات أمنية من تلقاء نفسها. رأيت images مثبّتة تعمل سنة كاملة على base فيها CVE حرجة معروفة، لأن أحدًا لم يكن مسؤولًا عن التحديث. ثبّت *وأتمِت* الترقية، أو لا تثبّت.
:::

الـ image لديك الآن مسمّاة، وذات رقم إصدار، ومرفوعة إلى الـ registry. وقبل أن ينشرها أحد، يجب أن تعرف ما بداخلها، وهذا موضوع الدرس التالي.
