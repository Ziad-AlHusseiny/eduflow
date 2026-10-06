---
summary: صِف notes-api وPostgres في ملف compose.yaml واحد، وشغّل البيئة وافحصها بـ `docker compose`، واربط الخدمات بأسمائها عبر الشبكة الافتراضية التي ينشئها Compose.
takeaways:
  - "ملف `compose.yaml` يصرّح بالخدمات والشبكات والـ volumes؛ والأمر `docker compose up` ينشئ كل ما هو ناقص ويترك الباقي كما هو."
  - ‏Compose v2 هو الإضافة `docker compose`؛ والمفتاح `version:` في المستوى الأعلى قديم ويجب حذفه.
  - كل خدمة تنضمّ إلى الشبكة الافتراضية للمشروع ويمكن الوصول إليها باسمها، لذا يتّصل الـ API بـ `db:5432` لا بـ `localhost`.
  - انشر على المضيف المنافذ التي تحتاج إليها فقط؛ وقاعدة البيانات التي لا يتحدّث معها إلا الـ API لا تحتاج إلى مدخل `ports:` إطلاقًا.
further:
  - title: How Compose works
    url: https://docs.docker.com/compose/intro/compose-application-model/
  - title: Networking in Compose
    url: https://docs.docker.com/compose/how-tos/networking/
  - title: Compose file reference
    url: https://docs.docker.com/reference/compose-file/
quiz:
  - q: داخل الـ container ‏`api`، أي مضيف في `DATABASE_URL` يصل إلى خدمة Postgres المسمّاة `db`؟
    options:
      - text: "الاسم `db`، اسم الخدمة، الذي يحلّه DNS شبكة Compose إلى container قاعدة البيانات."
        why: صحيح. الخدمات على شبكة Compose نفسها يجد بعضها بعضًا باسم الخدمة.
      - text: "‏`localhost`، لأن كلا الـ containers يعمل على الجهاز نفسه."
        why: لكل container ‏network namespace خاصة به. ‏`localhost` داخل `api` هو container الـ API نفسه، ولا شيء يستمع فيه على 5432.
      - text: "‏`host.docker.internal`، الذي يشير دائمًا إلى الـ containers الأخرى."
        why: هذا الاسم يشير إلى جهازك المضيف. لا يعمل إلا إذا كان منفذ قاعدة البيانات منشورًا هناك، ويربط التطبيق بحاسوبك.
      - text: عنوان IP الخاص بـ container قاعدة البيانات من `docker inspect`.
        why: يعمل إلى أن يُعاد إنشاء الـ container ويحصل على IP جديد. الأسماء ثابتة؛ وعناوين IP ليست كذلك.
    answer: 0
  - q: 'تضيف `version: "3.8"` في أعلى `compose.yaml`. ماذا يفعل Docker Compose الحالي بها؟'
    options:
      - text: يتحوّل إلى قواعد صيغة الملف 3.8.
        why: يطبّق Compose v2 مواصفة Compose الموحّدة، ولم يعد يختار السلوك حسب الإصدار.
      - text: يفشل، لأن مفاتيح الإصدار لم تعد مسموحة.
        why: لا يفشل. يحذّر من أن الخاصية قديمة ويتجاهلها.
      - text: يتجاهلها ويطبع تحذيرًا بأن `version` قديمة.
        why: صحيح. احذف السطر؛ فهو لا يفعل شيئًا.
      - text: ينزّل إصدار Compose المطابق.
        why: لا يجلب Compose نفسه أبدًا بناءً على الملف. الإضافة `docker compose` المثبّتة لديك هي التي تعمل.
    answer: 2
  - q: قاعدة Postgres في بيئة Compose لديك لا يستخدمها إلا `api`. أي إعداد `ports:` يجب أن يكون لـ `db`؟
    options:
      - text: '`"5432:5432"`، حتى يصل إليها الـ API.'
        why: يصل إليها الـ API عبر شبكة Compose دون أي منفذ منشور. والنشر يعرضها على كل واجهات المضيف.
      - text: '`"0.0.0.0:5432:5432"`، للتصريح بالاستماع في كل مكان.'
        why: هذا مطابق للافتراضي، ويضع قاعدة بياناتك على شبكة Wi-Fi المكتب مع كلمة مرور تطوير.
      - text: '`"5432"`، الذي ينشرها على منفذ عشوائي في المضيف.'
        why: ما زال يمكن الوصول إليها من شبكة المضيف، فقط على منفذ أقل وضوحًا.
      - text: لا شيء إطلاقًا؛ أضف `"127.0.0.1:5432:5432"` فقط إن احتجت إلى عميل رسومي محلي.
        why: صحيح. الحركة بين الـ containers لا تحتاج إلى منافذ منشورة، والنشر على الـ loopback فقط يُبقيها خارج الشبكة.
    answer: 3
  - q: تغيّر متغيّرات البيئة لخدمة `api` فقط في `compose.yaml` وتشغّل `docker compose up -d`. ماذا يحدث للـ container ‏`db` الذي يعمل؟
    options:
      - text: يُعاد إنشاؤه هو أيضًا، لأن الملف تغيّر.
        why: يقارن Compose إعدادات كل خدمة على حدة. ‏`db` لم يتغيّر، فلا يُمسّ.
      - text: يستمر في العمل دون أن يُمسّ؛ لا يعيد Compose إنشاء إلا الخدمات التي تغيّرت إعداداتها.
        why: صحيح. ‏`up` يوفّق كل خدمة مع الملف ويترك الخدمات غير المتغيّرة وشأنها.
      - text: يتوقّف ويحتاج إلى `docker compose start db` منفصل.
        why: "الأمر `up` لا يوقف الخدمات التي هي أصلًا في الحالة المرغوبة."
      - text: يُعلَّق مؤقتًا بينما يُعاد تشغيل `api`، ثم يُستأنف.
        why: لا يعلّق Compose الاعتماديات أثناء إعادة الإنشاء.
    answer: 1
---

يحتاج notes-api إلى Postgres. تستطيع تشغيل الاثنين بأمرَي `docker run`، وشبكة مصنوعة يدويًا، وصفحة من الخيارات، ثم تشرح ذلك كله من جديد لأول شخص ينضمّ إلى الفريق. ‏Compose يستبدل ذلك بملف واحد في المستودع يصف البيئة كاملة، وأمر واحد يحوّلها إلى واقع.

## أول compose.yaml

أنشئ `compose.yaml` بجوار الـ Dockerfile:

```yaml title=compose.yaml
name: notes

services:
  api:
    build: .
    image: notes-api:dev
    ports:
      - "8080:3000"
    environment:
      PORT: "3000"
      DATABASE_URL: postgres://notes:notes@db:5432/notes

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: notes
      POSTGRES_PASSWORD: notes
      POSTGRES_DB: notes
```

خدمتان. ‏`api` تُبنى من الـ Dockerfile في هذا المجلد وتحمل الـ tag ‏`notes-api:dev`؛ و`db` تستخدم الـ image الرسمية لـ Postgres 17، التي تنشئ نقطة دخولها المستخدم وقاعدة البيانات من هذه المتغيّرات الثلاثة عند أول تشغيل. و`name: notes` يضبط اسم المشروع، الذي يُضاف كبادئة إلى كل ما ينشئه Compose.

حين تحتوي الخدمة على `build:` و`image:` معًا، يبني Compose من الـ Dockerfile ويعطي النتيجة الاسم الموجود في `image:`. هذا يمنح الـ image المحلية اسمًا متوقّعًا تستطيع تشغيله يدويًا أيضًا، بدلًا من الاسم الافتراضي الذي كان Compose سيولّده من اسمَي المشروع والخدمة.

لا يوجد سطر `version:`. ‏Compose v2 يطبّق مواصفة Compose ‏(Compose Specification)، وإذا نسخت ملفًا قديمًا يبدأ بـ `version: "3.8"`، فسيتجاهله Compose ويحذّر من أن الخاصية قديمة. احذفه.

الأمر هو `docker compose`، بمسافة. هذا Compose v2، إضافة لواجهة Docker CLI. أما `docker-compose` القديم المكتوب بـ Python والموصول بشرطة فقد تقاعد منذ سنوات، والدروس التي تستخدمه قديمة من نواحٍ أخرى أيضًا.

## شغّل البيئة

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api
curl localhost:8080/readyz
```

الأمر `up` يبني الـ image إن لزم، وينشئ شبكة، ويشغّل كلا الـ containers، ثم يعود. و`--build` يفرض إعادة البناء حتى تُلتقط تغييرات الكود. والآن يجيب `/readyz` بـ `ready`، لأن الـ API يستطيع الوصول إلى قاعدة البيانات.

الأمر `docker compose ps` يعرض الـ containers التي أنشأها Compose، مسمّاة باسم المشروع والخدمة ورقم: `notes-api-1` و`notes-db-1`. الرقم موجود لأن الخدمة الواحدة قد تشغّل عدّة containers متطابقة. وكل الأوامر تأخذ أسماء الخدمات لا أسماء الـ containers، فنادرًا ما تكتب الاسم الكامل.

أوامر أخرى ستستخدمها يوميًا:

```bash
docker compose exec db psql -U notes -d notes   # SQL shell in the db container
docker compose restart api                       # restart one service
docker compose down                              # stop and remove containers and network
```

الأمر `up` **تصريحي** (declarative): يقارن الملف بما يعمل، ولا يغيّر إلا الفرق. عدّل متغيّرات بيئة الـ API وشغّل `up -d` مجددًا، فيعيد Compose إنشاء `api` بينما يستمر `db` في العمل. ‏Kubernetes يعمل بالفكرة نفسها على نطاق أكبر بكثير؛ وستقابله في القسم الرابع.

## كيف تجد الخدمات بعضها

ينشئ Compose شبكة للمشروع، `notes_default`، ويربط كل خدمة بها. على تلك الشبكة، يحلّ DNS الخاص بـ Docker كل **اسم خدمة** إلى الـ container الخاص بها. لهذا يقول `DATABASE_URL` ‏`@db:5432`.

:::figure الـ API وحده منشور؛ وقاعدة البيانات يُوصل إليها بالاسم داخل شبكة المشروع
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">جهازك يصل إلى الـ container ‏api عبر المنفذ المنشور 8080 المربوط بـ 3000. داخل الشبكة notes_default، يتّصل api بـ db على المنفذ 5432 باسم الخدمة. قاعدة البيانات ليس لها منفذ منشور.</title>
  <rect class="d-box" x="20" y="80" width="140" height="70" rx="10"/>
  <text class="d-label-strong" x="90" y="110" text-anchor="middle">جهازك</text>
  <text class="d-code" x="90" y="134" text-anchor="middle">localhost:8080</text>
  <rect class="d-box-primary" x="210" y="20" width="470" height="190" rx="14"/>
  <text class="d-label-muted" x="445" y="44" text-anchor="middle">الشبكة: notes_default</text>
  <rect class="d-box-accent" x="250" y="80" width="160" height="70" rx="10"/>
  <text class="d-label-strong" x="330" y="110" text-anchor="middle">api</text>
  <text class="d-code" x="330" y="134" text-anchor="middle">:3000</text>
  <rect class="d-box-success" x="490" y="80" width="160" height="70" rx="10"/>
  <text class="d-label-strong" x="570" y="110" text-anchor="middle">db</text>
  <text class="d-code" x="570" y="134" text-anchor="middle">:5432</text>
  <path class="d-arrow" d="M160 115 L248 115" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="204" y="104" text-anchor="middle">-p 8080:3000</text>
  <path class="d-arrow" d="M410 115 L488 115" marker-end="url(#arrow)"/>
  <text class="d-code" x="449" y="104" text-anchor="middle">db:5432</text>
  <text class="d-label-muted" x="570" y="180" text-anchor="middle">لا منفذ منشور</text>
</svg>
:::

لاحظ أن `db` ليس فيه مدخل `ports:`. يصل إليه الـ API عبر شبكة المشروع؛ ولا يستطيع ذلك أي شيء على حاسوبك أو على شبكة مكتبك. إن أردت توجيه عميل SQL مكتبي إليه، فانشره على الـ loopback فقط: `"127.0.0.1:5432:5432"`.

:::mistake استخدام localhost بين الـ containers
العنوان `postgres://…@localhost:5432` هو أكثر خطأ أصادفه في ملفات Compose. داخل الـ container ‏`api`، تعني `localhost` الـ container الخاص بالـ API نفسه، ولا شيء يستمع على 5432 هناك. والخطأ هو `ECONNREFUSED 127.0.0.1:5432`. استخدم اسم الخدمة.
:::

## فصل الشبكات حين يهمّ ذلك

في البيئات الأكبر، تستطيع التصريح بالشبكات وربط كل خدمة بما يخصّها فقط. قاعدة البيانات على شبكة `backend` لا يمكن أن تصل إليها واجهة ويب أمامية لا تنضمّ إلا إلى `frontend`:

```yaml
services:
  web:
    networks: [frontend]
  api:
    networks: [frontend, backend]
  db:
    networks: [backend]

networks:
  frontend:
  backend:
```

لـ notes-api تكفي الشبكة الافتراضية. الجأ إلى هذا حين تحتوي البيئة على مكوّنات يجب ألا يتحدّث بعضها إلى بعض أبدًا.

## أين يناسب Compose

‏Compose ممتاز لثلاث مهام: التطوير المحلي، واختبارات التكامل في الـ CI (شغّل البيئة، ونفّذ الاختبارات، ثم فكّكها)، والخدمات الصغيرة التي تعيش على مضيف واحد. ما لا يفعله هو توزيع الـ containers على أجهزة متعدّدة، أو نقلها حين يموت جهاز، أو نشر إصدار جديد تدريجيًا مع مراقبة فحوص الصحة. هذه مهام المنسّق (orchestrator)، وهي ما يفعله Kubernetes في القسم الرابع. والعادات التي تبنيها هنا تنتقل معك مباشرة: صرّح بالحالة المرغوبة في ملف، ودع أداة تحقّقها، واربط الخدمات بأسمائها.

تبقى مشكلة واحدة. شغّل `docker compose down`، ثم `up` مجددًا، فتجد أن كل الملاحظات اختفت: خزّن Postgres بياناته في الـ layer القابلة للكتابة داخل الـ container، والتي حذفها `down`. الدرس التالي يعطي قاعدة البيانات مكانًا دائمًا تعيش فيه.
