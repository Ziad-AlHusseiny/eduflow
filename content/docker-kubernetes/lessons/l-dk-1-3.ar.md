---
summary: رتّب تعليمات الـ Dockerfile بحيث يبقى تثبيت الاعتماديات في الـ cache، واقرأ حالة الـ build cache من `docker history` ومن مخرجات البناء، وأبقِ الـ cache دافئًا بالـ cache mounts وتصدير الـ cache في الـ CI.
takeaways:
  - مفتاح الـ cache لكل تعليمة يعتمد على التعليمة نفسها، وفي حالة `COPY` على checksum الملفات المنسوخة؛ وإخفاق واحد يعيد بناء كل الخطوات التالية.
  - انسخ `package.json` و`package-lock.json` أولًا، وشغّل `npm ci`، ثم انسخ الكود المصدري، حتى لا تعيد تعديلات الكود تثبيت الاعتماديات.
  - ضع التعليمات التي نادرًا ما تتغيّر في الأعلى، والتعليمات التي تتغيّر مع كل commit في الأسفل.
  - شغّل `apt-get update` و`apt-get install` داخل `RUN` واحدة حتى لا يكون فهرس الحزم قديمًا أبدًا.
  - الـ cache mount ‏(`RUN --mount=type=cache`) يحتفظ بذاكرة تنزيلات npm بين عمليات البناء، حتى حين يجب إعادة بناء الـ layer نفسها.
further:
  - title: Docker build cache
    url: https://docs.docker.com/build/cache/
  - title: Optimize cache usage in builds
    url: https://docs.docker.com/build/cache/optimize/
  - title: Cache storage backends
    url: https://docs.docker.com/build/cache/backends/
quiz:
  - q: |
      في هذا الـ Dockerfile تعدّل الملف `src/routes.ts` فقط ثم تعيد البناء. أي الخطوات تُنفَّذ من جديد؟
      ```dockerfile
      FROM node:24-slim
      WORKDIR /app
      COPY package.json package-lock.json ./
      RUN npm ci
      COPY . .
      RUN npm run build
      ```
    options:
      - text: كل الخطوات، لأن الـ build context تغيّر.
        why: تغيّر الـ context لا يُبطل كل شيء. كل خطوة تُفحص وحدها حتى أول إخفاق.
      - text: فقط `RUN npm run build`، لأنها الخطوة التي تترجم TypeScript.
        why: "التعليمة `COPY . .` تنسخ `src/routes.ts`، فيتغيّر الـ checksum الخاص بها وتكون هي أول إخفاق؛ ثم تُعاد خطوة البناء لأنها تأتي بعد إخفاق."
      - text: "الخطوة `RUN npm ci` وكل ما بعدها."
        why: "الأمر `npm ci` يأتي بعد `COPY` لملفَّي الحزم فقط، وهما لم يتغيّرا، فيبقى في الـ cache."
      - text: "الخطوتان `COPY . .` و`RUN npm run build`؛ ويبقى تثبيت الاعتماديات في الـ cache."
        why: صحيح. أول مُدخل تغيّر هو عند `COPY . .`، فتُعاد هي وكل خطوة بعدها. والتثبيت المكلف فوقها يُعاد استخدامه.
    answer: 3
  - q: لماذا يسبّب وضع `RUN apt-get update` في سطر مستقل، يليه `RUN apt-get install -y curl`، مشاكل بعد أشهر؟
    options:
      - text: لأن Docker يرفض تخزين أوامر `apt-get` في الـ cache.
        why: يخزّن Docker خطوات `RUN` في الـ cache حسب نصّها، سواء كانت apt أم لا. وهذه بالضبط هي المشكلة هنا.
      - text: لأن الـ layer الخاصة بـ `update` تبقى في الـ cache بفهرس حزم قديم، فأي تغيير لاحق في سطر التثبيت يجلب إصدارات قديمة أو مفقودة.
        why: صحيح. مفتاح الـ cache هو نصّ الأمر، وهو لا يتغيّر أبدًا، فيكون الفهرس من يوم إنشاء الـ cache. اجمعهما في `RUN` واحدة.
      - text: لأن تعليمتَي `RUN` تضاعفان حجم الـ image.
        why: الـ layers الإضافية تضيف قليلًا من البيانات الوصفية، ولا تضاعف الحجم. المشكلة الحقيقية فهرس قديم في الـ cache.
      - text: "لأن `apt-get update` يحتاج إلى root بينما تُسقط الـ `RUN` الثانية الصلاحيات."
        why: كلتاهما تعملان بالمستخدم نفسه ما لم تأتِ تعليمة `USER` بينهما.
    answer: 1
  - q: الـ runner في الـ CI يبدأ بـ cache فارغ لـ Docker في كل مهمة، فكل بناء يبدأ باردًا. ما الذي يساعد أكثر؟
    options:
      - text: إضافة المزيد من تعليمات `RUN` حتى توجد layers أكثر للتخزين.
        why: الـ layers الإضافية لا تفيد حين لا يوجد cache تقرأ منه أصلًا.
      - text: التحويل من `npm ci` إلى `npm install` لأنه أسرع.
        why: "قد يعيد `npm install` كتابة الـ lockfile، ولا يحلّ مشكلة الـ cache الفارغ. أبقِ `npm ci` من أجل قابلية التكرار."
      - text: تصدير الـ build cache واستيراده، مثلًا باستخدام `--cache-to` و`--cache-from` موجّهَين إلى registry.
        why: صحيح. واجهات تخزين الـ cache تسمح للـ runners الجديدة بإعادة استخدام الـ layers التي بنتها مهام سابقة.
      - text: استخدام `docker build --no-cache` حتى تكون النتيجة متوقّعة.
        why: هذا يتخلّص من الـ cache كليًا، وهو عكس ما تريده من أجل السرعة.
    answer: 2
  - q: ما الذي يعطيك إياه `RUN --mount=type=cache,target=/root/.npm npm ci` ولا يعطيك إياه الـ layer cache؟
    options:
      - text: تبقى ذاكرة تنزيلات npm بين عمليات البناء، فحتى حين يجب إعادة هذه الخطوة، تأتي الحزم من القرص المحلي بدلًا من الشبكة.
        why: صحيح. الـ layer cache إمّا كل شيء أو لا شيء؛ أما الـ cache mount فيصمد أمام إخفاق الـ layer ولا يُخزَّن في الـ image.
      - text: يُركَّب مجلد `node_modules` من جهازك داخل الـ image.
        why: الـ cache mounts تعيش داخل أداة البناء، لا على جهازك، وتخزّن مستودع تنزيلات npm، لا `node_modules`.
      - text: تُستبعد الحزم المثبّتة من الـ image النهائية لتوفير المساحة.
        why: "المجلد `node_modules` ما زال يُكتب داخل الـ layer. وحده المجلد المُركَّب `/root/.npm` يبقى خارج الـ image."
      - text: لا تُعاد الخطوة أبدًا، حتى لو تغيّر الـ lockfile.
        why: تُعاد الخطوة كلما تغيّرت مُدخلاتها. الـ mount يجعل الإعادة أسرع فقط.
    answer: 0
---

سألني فريق في Skylane مرة لماذا ارتفع زمن البناء في الـ CI لديهم تدريجيًا من أربعين ثانية إلى ثماني دقائق. كان الـ Dockerfile عندهم يشبه الذي كتبته في الدرس السابق: `COPY . .` ثم `npm ci`. وبما أن كل commit يغيّر ملفًا ما، كان كل بناء يعيد تثبيت 900 حزمة من الإنترنت. وإعادة ترتيب واحدة أعادته إلى أربعين ثانية.

## الـ Layers ومفاتيح الـ cache

كل `FROM` و`COPY` و`ADD` و`RUN` تنتج layer (طبقة). حين تعيد البناء، يمرّ BuildKit على الـ Dockerfile من الأعلى إلى الأسفل ويسأل عن كل خطوة: «هل نفّذت هذا بالضبط من قبل، وبهذه المُدخلات بالضبط؟»

- في `RUN`، المفتاح هو نصّ الأمر مع الـ layer التي يعمل فوقها.
- في `COPY` و`ADD`، يتضمّن المفتاح checksum للملفات المنسوخة.

أول خطوة لا يطابق مفتاحها هي **إخفاق الـ cache** (cache miss)، ومن بعدها تُعاد *كل* خطوة لاحقة، لأن كل واحدة منها تعمل فوق layer صارت مختلفة الآن. لذا فإصابات الـ cache (cache hits) لا تقع إلا في جزء متّصل من بداية الملف. الترتيب هو كل شيء.

:::figure ملف واحد متغيّر يُبطل الـ layer الخاصة به وكل layer فوقها
<svg viewBox="0 0 680 290" role="img" aria-labelledby="t1">
  <title id="t1">كومتان من الـ layers. حين تأتي COPY . . قبل npm ci، يُخفق تعديل الكود عند COPY ويُعاد npm ci. وحين تُنسخ ملفات الحزم أولًا، يبقى npm ci في الـ cache ولا يُعاد إلا COPY الأخيرة والبناء.</title>
  <text class="d-label-strong" x="165" y="22" text-anchor="middle">COPY . . أولًا</text>
  <text class="d-label-strong" x="505" y="22" text-anchor="middle">ملفات الحزم أولًا</text>
  <rect class="d-box-success" x="40" y="236" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="259" text-anchor="middle">FROM node:24-slim</text>
  <rect class="d-box-success" x="40" y="194" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="217" text-anchor="middle">WORKDIR /app</text>
  <rect class="d-box-warn" x="40" y="152" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="175" text-anchor="middle">COPY . .   (src changed)</text>
  <rect class="d-box-warn" x="40" y="110" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="133" text-anchor="middle">RUN npm ci   (~70 s)</text>
  <rect class="d-box-warn" x="40" y="68" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="91" text-anchor="middle">RUN npm run build</text>
  <rect class="d-box-success" x="380" y="236" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="259" text-anchor="middle">FROM node:24-slim</text>
  <rect class="d-box-success" x="380" y="194" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="217" text-anchor="middle">COPY package*.json</text>
  <rect class="d-box-success" x="380" y="152" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="175" text-anchor="middle">RUN npm ci   (cached)</text>
  <rect class="d-box-warn" x="380" y="110" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="133" text-anchor="middle">COPY . .   (src changed)</text>
  <rect class="d-box-warn" x="380" y="68" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="91" text-anchor="middle">RUN npm run build</text>
  <rect class="d-box-success" x="200" y="34" width="14" height="14" rx="3"/>
  <text class="d-label-muted" x="220" y="46">من الـ cache</text>
  <rect class="d-box-warn" x="320" y="34" width="14" height="14" rx="3"/>
  <text class="d-label-muted" x="340" y="46">أُعيد بناؤها</text>
</svg>
:::

## أعِد الترتيب لصالح الـ cache

الاعتماديات تتغيّر أسبوعيًا؛ والكود يتغيّر مع كل commit. لذا انسخ ملفات تعريف الاعتماديات وحدها، ثم ثبّتها، وبعد ذلك فقط انسخ الباقي:

```dockerfile title=Dockerfile
# syntax=docker/dockerfile:1
FROM node:24-slim
WORKDIR /app

# Changes rarely: only when dependencies change
COPY package.json package-lock.json ./
RUN npm ci

# Changes on every commit
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

عدّل `src/server.ts` وأعِد البناء. المخرجات تُظهر الخطوات التي أُعيد استخدامها:

```text
 => CACHED [2/6] WORKDIR /app
 => CACHED [3/6] COPY package.json package-lock.json ./
 => CACHED [4/6] RUN npm ci
 => [5/6] COPY . .
 => [6/6] RUN npm run build
```

القاعدة العامة: **رتّب التعليمات من الأقل تغيّرًا إلى الأكثر تغيّرًا.** حزم النظام، ثم اعتماديات اللغة، ثم كودك، ثم كل ما يُشتقّ من كودك.

الأمر `docker history notes-api:dev` يعرض الـ layers مع حجم كل منها والتعليمة التي أنشأتها. استخدمه حين تكون الـ image أكبر مما تتوقّع؛ فالمتّهم عادةً layer واحدة متضخّمة.

والقاعدة نفسها تنطبق على معاملات البناء. سطر مثل `ARG GIT_SHA` في أعلى الملف، يُستخدم لاحقًا في `RUN` أو `LABEL`، يعطي كل خطوة `RUN` تحته مُدخلًا جديدًا مع كل commit، لأن معاملات البناء تكون مرئية لكل `RUN` لاحقة على هيئة متغيّرات بيئة. لذا أخّر تعريف مثل هذه القيم قدر الإمكان، وضعه مباشرة قبل الخطوة الوحيدة التي تستخدمها.

مفتاح `COPY` مبنيّ على *محتوى* الملفات لا على تواريخ تعديلها، لذا فإن `git clone` جديدًا على خادم بناء يصيب الـ cache نفسه الذي على جهازك ما دامت البايتات متطابقة. ولهذا أيضًا يهمّ أن يكون `package-lock.json` محدّثًا ومحفوظًا في المستودع: فهو المُدخل الذي يقرّر هل يُعاد استخدام التثبيت المكلف أم لا.

## حزم النظام: RUN واحدة مع التنظيف

إن احتجت إلى حزم نظام التشغيل، فثبّتها في `RUN` واحدة:

```dockerfile
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
```

الخيار `--no-install-recommends` يتخطّى الإضافات الاختيارية، وحذف قوائم الحزم في الخطوة *نفسها* يُبقيها خارج الـ layer. حذفها في `RUN` لاحقة لا يقلّص شيئًا: الـ layer السابقة ما زالت تحتويها.

:::mistake فصل apt-get update عن apt-get install
حين يكون `RUN apt-get update` في سطر مستقل، تُخزَّن تلك الـ layer في الـ cache حسب نصّها، وهو لا يتغيّر أبدًا. بعد أشهر تضيف حزمة إلى سطر التثبيت؛ فيُعاد التثبيت اعتمادًا على فهرس مخزّن عمره أشهر، فيفشل برسالة "Unable to locate package" أو يثبّت إصدارًا قديمًا. اجمعهما دائمًا في سلسلة واحدة.
:::

## الـ Cache mounts: إخفاقات أسرع

أحيانًا *يجب* أن يُعاد التثبيت لأنك أضفت اعتمادية. الـ cache mount يحتفظ بذاكرة تنزيلات npm داخل أداة البناء بين عمليات البناء، دون أن يضعها في الـ image:

```dockerfile
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
```

ما زال `npm ci` يحذف `node_modules` ويعيد إنشاءه، لكن الملفات المضغوطة تأتي من القرص المحلي بدلًا من الـ registry. في notes-api يحوّل هذا إعادة تثبيت تستغرق 70 ثانية إلى نحو 15 ثانية.

## الـ Cache في الـ CI

جهازك يحتفظ بالـ cache بين عمليات البناء. أما معظم الـ runners في الـ CI فتبدأ فارغة، فيبدأ كل بناء باردًا مهما أحسنت ترتيب الملف. صدّر الـ cache إلى مكان دائم واستورده في التشغيل التالي:

```bash
docker buildx build \
  --cache-from type=registry,ref=ghcr.io/skylane/notes-api:buildcache \
  --cache-to type=registry,ref=ghcr.io/skylane/notes-api:buildcache,mode=max \
  -t ghcr.io/skylane/notes-api:dev .
```

الخيار `mode=max` يخزّن الـ layers الوسيطة أيضًا، وهذا مهمّ حين تصبح لديك عدّة build stages. ومستخدمو GitHub Actions يستطيعون استخدام `type=gha` بدلًا من registry.

:::tip قِس ولا تخمّن
شغّل البناء مرتين مع `--progress=plain` وقارن. إذا وجدت خطوة توقّعت أن تكون `CACHED` ولم تكن كذلك، فانظر إلى التعليمة التي فوقها مباشرة: فهي التي تغيّرت مُدخلاتها.
:::

البناء سريع الآن. في الدرس التالي ستألف جانب التشغيل: المنافذ، ومتغيّرات البيئة، والسجلات، وما الذي يحدث فعلًا حين يتوقّف الـ container.
