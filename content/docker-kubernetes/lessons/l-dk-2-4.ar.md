---
summary: افحص images ‏notes-api بحثًا عن الثغرات المعروفة باستخدام Docker Scout، وصنّف ما تجده حسب الأولوية، واستخدم secret mounts في BuildKit حتى لا تصل الـ tokens المطلوبة وقت البناء إلى أي layer في الـ image.
takeaways:
  - "الأمر `docker scout cves` يسرد ثغرات CVE المعروفة لكل حزمة؛ ومع `--only-severity critical,high --exit-code` يتحوّل إلى بوّابة في الـ CI."
  - أصلح نتائج الـ base image أولًا بتحديثها أو تغييرها؛ والأمر `docker scout recommendations` يقترح بدائل.
  - كل ما يُمرَّر بـ `ARG` أو `ENV`، أو يُكتب في ملف داخل خطوة `RUN`، يمكن استرجاعه من الـ image، حتى لو حذفته خطوة لاحقة.
  - "التعليمة `RUN --mount=type=secret` تتيح السرّ لخطوة بناء واحدة دون كتابته في أي layer."
  - أسرار وقت التشغيل مثل كلمات مرور قاعدة البيانات تُحقن عند بدء الـ container، ولا تُبنى داخل الـ image أبدًا.
further:
  - title: Docker Scout quickstart
    url: https://docs.docker.com/scout/quickstart/
  - title: Build secrets
    url: https://docs.docker.com/build/building/secrets/
  - title: docker scout cves
    url: https://docs.docker.com/reference/cli/docker/scout/cves/
quiz:
  - q: فحص `notes-api:1.4.0` يُبلغ عن 30 ثغرة CVE، منها 27 في حزم Debian القادمة من الـ base image. ما الخطوة الأولى الأكثر فاعلية؟
    options:
      - text: أخفِ نتائج الـ base image، لأنك لم تكتب ذلك الكود.
        why: أنت تشحن ذلك الكود، فأنت تتحمّل مخاطره. الإخفاء دون تحليل يخبّئ تعرّضًا حقيقيًا.
      - text: أعِد البناء على base image محدّثة أو أصغر، ثم أعِد الفحص.
        why: صحيح. معظم نتائج الـ base تختفي مع base مرقّعة أو أنحف مثل distroless. تغيير واحد يصلح عشرات النتائج.
      - text: رقّع كل حزمة Debian بـ `apt-get upgrade` في مرحلة التشغيل.
        why: هذا يجعل البناء غير متوقّع، ويتركك تصون نظام التشغيل يدويًا. أصلح الـ base image نفسها.
      - text: تجاهلها حتى يسأل عميل.
        why: ثغرات CVE المعروفة القابلة للإصلاح في الـ images المشحونة هي بالضبط ما يبحث عنه المهاجمون.
    answer: 1
  - q: |
      خطوة البناء هذه تحتاج إلى token لـ npm. ما الخطأ فيها؟
      ```dockerfile
      ARG NPM_TOKEN
      RUN echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > .npmrc \
       && npm ci && rm .npmrc
      ```
    options:
      - text: لا شيء؛ الملف `.npmrc` يُحذف في الخطوة نفسها، فلا يبقى الـ token.
        why: الملف ذهب، لكن وسائط البناء (build arguments) تُسجَّل في سجلّ بناء الـ image، فيبقى الـ token قابلًا للاسترجاع.
      - text: "قيم `ARG` لا يمكن استخدامها داخل `RUN`."
        why: يمكن ذلك؛ وهذا ما يجعل هذا النمط مغريًا.
      - text: يجب تمرير الـ token بـ `ENV` بدلًا من `ARG`.
        why: "التعليمة `ENV` أسوأ: فهي تُخزَّن في إعدادات الـ image وتُضبط في كل container يعمل."
      - text: الـ token يُسجَّل مع وسائط البناء ويمكن قراءته من سجلّ الـ image؛ استخدم secret mount بدلًا من ذلك.
        why: صحيح. توثيق Docker نفسه يحذّر من أن `ARG` و`ENV` ليستا للأسرار. أما الـ secret mount فلا يوجد إلا خلال تلك الخطوة الواحدة.
    answer: 3
  - q: ماذا يعطي هذا السطر لخطوة `npm ci`؟ `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci`
    options:
      - text: ملفًا مؤقتًا في `/root/.npmrc` يحتوي على السرّ، مرئيًا خلال هذه الخطوة فقط وغائبًا عن الـ layer.
        why: صحيح. يظهر الـ mount للأمر ويختفي بعده؛ ولا يُخزَّن شيء من محتواه في الـ image.
      - text: متغيّر بيئة اسمه `npmrc` مضبوطًا لكل الخطوات اللاحقة.
        why: هذه الصيغة تركّب ملفًا في `target`. والـ secret mounts لا تنتقل أبدًا إلى الخطوات اللاحقة.
      - text: نسخة من `.npmrc` مدمجة داخل الـ image تحت `/root`.
        why: هذا ما تفعله `COPY`. أما الـ secret mount فلا يُكتب أبدًا في layer.
      - text: لا شيء، إلا إذا كانت الـ image تعمل أيضًا بصلاحيات root.
        why: الـ mount يعمل لأي مستخدم ينفّذ الخطوة؛ والمسار الهدف هنا يطابق فحسب المجلد الرئيسي (home) للمستخدم root.
    answer: 0
  - q: من أين يجب أن تأتي كلمة مرور قاعدة بيانات الإنتاج لـ notes-api؟
    options:
      - text: من ملف `.env` يُنسخ إلى الـ image أثناء البناء.
        why: هذا يدمج كلمة المرور في كل نسخة من الـ image، في كل registry وcache تصل إليه.
      - text: من وسيط بناء، حتى تحصل image كل بيئة على كلمة مرورها الخاصة.
        why: وسائط البناء تُسجَّل في سجلّ الـ image، والـ images الخاصة بكل بيئة تكسر مبدأ «اختبر ما تشحنه».
      - text: تُحقن وقت التشغيل، مثلًا من Kubernetes Secret أو من Compose secret، ولا تُخزَّن في الـ image أبدًا.
        why: صحيح. الـ image نفسها تعمل في كل مكان؛ وكل بيئة تقدّم بيانات اعتمادها حين يبدأ الـ container.
      - text: مكتوبة مباشرة في `dist/config.js` ومحميّة بالتشغيل بمستخدم غير root.
        why: المستخدم غير الـ root ما زال يستطيع قراءة كوده، وكذلك أي شخص يسحب الـ image.
    answer: 2
---

أسوأ حادث في سجلّي لم يكن انهيارًا. خطوة بناء احتاجت إلى token لـ registry خاص بـ npm، فمرّره أحدهم بوصفه وسيط بناء (build argument). ذهبت الـ image إلى registry متاح للقراءة على نطاق واسع، وبعد أشهر وجد تدقيق روتيني الـ token قابعًا في البيانات الوصفية للـ image، صالحًا طوال تلك المدة. هذا الدرس عمّا بداخل الـ images: الأجزاء التي لم تكتبها، والأجزاء التي لم تقصد تضمينها.

## افحص قبل أن تشحن

كل حزمة في الـ image، من `libssl` في Debian إلى `express` في npm، لها تاريخ علني من الثغرات (CVEs). الماسح يقرأ جرد الحزم في الـ image ويطابقه مع قواعد البيانات تلك. ‏Docker Scout مدمج في واجهة Docker CLI:

```bash
docker scout quickview notes-api:1.4.0
docker scout cves --only-severity critical,high notes-api:1.4.0
docker scout recommendations notes-api:1.4.0
```

الأمر `quickview` يعطي ملخّصًا في شاشة واحدة: عدد الثغرات في الـ image لديك، وفي الـ base image التي بُنيت عليها، وفي إصدار أحدث من تلك الـ base إن وُجد. والأمر `cves` يسرد كل نتيجة مع الحزمة، والإصدار المثبّت، والإصدار الذي يصلحها. والأمر `recommendations` يقترح tags لـ base images فيها ثغرات معروفة أقل. ‏Trivy وGrype ماسحان مفتوحا المصدر شائعان يؤدّيان العمل نفسه؛ اختر واحدًا واستخدمه في كل مكان.

## صنّف بترتيب معقول

القائمة الطويلة من النتائج ليست قائمة مهام. اعمل عليها هكذا:

1. **نتائج الـ base image أولًا.** إذا جاءت معظم النتائج من حزم نظام التشغيل، فحدّث إلى base مرقّعة حديثًا أو انتقل إلى base أصغر. الانتقال إلى distroless في الدرس 2.2 يزيل معظمها بخطوة واحدة.
2. **اعتماديات التطبيق القابلة للإصلاح بعد ذلك.** إذا وُجد إصدار مُصلَح، فارفع رقم إصداره في `package.json`، وشغّل `npm ci`، وأعِد البناء.
3. **النتائج غير القابلة للإصلاح تحتاج إلى قرار، لا إلى صمت.** اكتب لماذا لا يمكن الوصول إلى مسار الكود ذاك، أو ما الذي يخفّف الخطر، وحدّد موعدًا للنظر فيها مجددًا.

ثم اجعل الفحص بوّابة حتى لا تتسلّل الانتكاسات (regressions):

```bash
docker scout cves --only-severity critical,high --exit-code notes-api:1.4.0
```

مع `--exit-code` يفشل الأمر حين يجد ثغرات بتلك الدرجات من الخطورة، فتفشل مهمّة الـ CI قبل الدفع. وما دمت في الـ CI، فاطلب من أداة البناء بيانات سلسلة التوريد أيضًا: ‏`docker buildx build --sbom=true --provenance=mode=max …` يرفق بالـ image قائمة مكوّنات البرمجيات (SBOM) وبيانات مصدر البناء (provenance)، فيصبح التدقيق التالي بحثًا سريعًا بدلًا من تحقيق.

:::why لماذا تفحص دوريًا، لا عند البناء فقط
تُنشر كل يوم ثغرات CVE جديدة في حزم لم تتغيّر. الـ image التي اجتازت الفحص نظيفة عند الإطلاق قد تظهر فيها نتيجة حرجة الشهر القادم. أعِد فحص ما هو منشور، أسبوعيًا على الأقل، وأعِد البناء على base جديدة حين يلزم.
:::

## كيف تتسرّب الأسرار إلى الـ images

الـ images تتذكّر أكثر مما تظن. ثلاثة تسريبات شائعة:

- **`ENV API_KEY=…`** تُخزَّن في إعدادات الـ image وتُضبط في كل container. والأمر `docker image inspect` يُظهرها.
- **`ARG NPM_TOKEN`** المستخدمة في خطوة `RUN` تُسجَّل في سجلّ بناء الـ image. والأمر `docker history --no-trunc` قد يكشفها.
- **ملف كُتب ثم حُذف لاحقًا** (`COPY .npmrc` ثم `RUN rm .npmrc`) ما زال موجودًا في الـ layer السابقة. أي شخص لديه الـ image يستطيع استخراج تلك الـ layer.

تحذّر build checks في Docker من الأوّلين (`SecretsUsedInArgOrEnv`) حين يوحي اسم المتغيّر بأنه سرّ. خذ التحذير بجدية.

## الـ secret mounts في BuildKit

الأداة الصحيحة هي **الـ secret mount**: يُتاح السرّ لخطوة `RUN` واحدة على هيئة ملف (أو متغيّر بيئة) ولا يُكتب أبدًا في layer. بناء notes-api يحتاج إلى token لحزمة خاصة، لذا:

```dockerfile title=Dockerfile
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    --mount=type=cache,target=/root/.npm \
    npm ci
```

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t notes-api:1.4.0 .
```

خلال خطوة `RUN` تلك، يجد npm إعداداته في `/root/.npmrc`. وقبلها وبعدها لا يوجد الملف، ولا يُخزَّن عنه شيء في الـ image أو في الـ build cache. ودون `target`، تُركَّب الأسرار في `/run/secrets/<id>`. وإذا كانت أداة ما تقرأ الـ token من متغيّر بيئة، فركّبه متغيّرَ بيئة بـ `RUN --mount=type=secret,id=npm_token,env=NPM_TOKEN npm ci` ومرّر `--secret id=npm_token,env=NPM_TOKEN` في سطر الأوامر، فتُقرأ القيمة من المتغيّر `NPM_TOKEN` في الـ shell لديك.

:::mistake «إنها مرحلة البناء فقط، ولن تُشحن»
الـ multi-stage builds تُبقي مرحلة البناء خارج الـ image النهائية فعلًا. لكن مراحل البناء تُدفع هي الأخرى: في صورة cache مُصدَّر مع `mode=max`، وimages اختبار من `--target build`، وtags للتشخيص. الـ token في أي layer من أي مرحلة هو token في الـ registry لديك. استخدم الـ secret mounts في كل مرحلة.
:::

## أسرار وقت التشغيل ليست من شأن الـ image

كلمة مرور قاعدة البيانات التي يستخدمها notes-api في الإنتاج لا مكان لها في الـ image إطلاقًا. إنها تصل حين يبدأ الـ container: من متغيّر بيئة في Compose، أو من Kubernetes Secret، أو من مدير الأسرار في منصّتك السحابية. ستربط الأوّلين في الأقسام القادمة. تبقى الـ image متطابقة عبر البيئات؛ ولا يتغيّر إلا الإعداد المحقون.

انتهى القسم الثاني: الـ image لديك نحيفة، وبلا صلاحيات، وقابلة للتتبّع، ونظيفة. في القسم التالي ستعطيها قاعدة بيانات تتحدّث معها، باستخدام Docker Compose.
