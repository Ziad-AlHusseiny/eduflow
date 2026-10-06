---
summary: أعطِ Postgres وnotes-api فحوص healthcheck حقيقية، واجعل الـ API ينتظر قاعدة بيانات سليمة وmigration منتهية باستخدام شروط `depends_on`، وأبقِ منطق إعادة المحاولة في التطبيق مع ذلك.
takeaways:
  - الصيغة المختصرة لـ `depends_on` لا تنتظر إلا بدء container الاعتمادية، لا جاهزيته للخدمة.
  - 'الـ `healthcheck` يخبر Docker كيف يختبر الـ container؛ والشرط `condition: service_healthy` يجعل الخدمة المعتمِدة تنتظر نجاح ذلك الاختبار.'
  - "الشرط `condition: service_completed_successfully` يشغّل المهام التي تُنفَّذ مرة واحدة، مثل الـ migrations، قبل بدء التطبيق."
  - في صيغة exec يكون كل معامل عنصرًا مستقلًا في القائمة؛ واستخدم `CMD-SHELL` حين يكون الاختبار نصّ أمر shell واحدًا.
  - ترتيب الإقلاع لا يغطّي إلا التشغيل الأول، لذا يجب أن يعيد التطبيق محاولة الاتصال بقاعدة البيانات؛ وKubernetes ليس فيه `depends_on` أصلًا.
further:
  - title: Control startup order in Compose
    url: https://docs.docker.com/compose/how-tos/startup-order/
  - title: Compose services reference (healthcheck)
    url: https://docs.docker.com/reference/compose-file/services/#healthcheck
  - title: docker compose up
    url: https://docs.docker.com/reference/cli/docker/compose/up/
quiz:
  - q: "الخدمة `api` فيها `depends_on: [db]` بالصيغة المختصرة. عند الإقلاع البارد يكتب الـ API في سجلّه `ECONNREFUSED` مرة واحدة، ثم يعمل. لماذا؟"
    options:
      - text: الصيغة المختصرة تُتجاهل ما لم تتشارك الخدمات شبكة واحدة.
        why: كل الخدمات في المشروع تتشارك الشبكة الافتراضية، والصيغة المختصرة لا تُتجاهل. إنها تفعل بالضبط ما تعد به، وهو أقل مما يتوقّعه الناس.
      - text: يشغّل Compose الخدمات المعتمِدة بترتيب عشوائي.
        why: الترتيب حتمي؛ ‏`db` تبدأ أولًا فعلًا. لكن البدء ليس هو الجاهزية.
      - text: الصيغة المختصرة تنتظر بدء container الـ `db`، لا قبول Postgres للاتصالات.
        why: 'صحيح. يحتاج Postgres إلى بضع ثوانٍ للتهيئة. أضف healthcheck والشرط `condition: service_healthy`.'
      - text: كلمة مرور قاعدة البيانات خاطئة في المحاولة الأولى.
        why: كلمة المرور الخاطئة تعطي خطأ مصادقة، لا اتصالًا مرفوضًا، ولن تُصلح نفسها.
    answer: 2
  - q: أي healthcheck يختبر جاهزية Postgres بشكل صحيح في خدمة `db`؟
    options:
      - text: '`test: ["CMD-SHELL", "pg_isready -U notes -d notes"]`'
        why: صحيح. ‏`CMD-SHELL` يشغّل النصّ عبر shell الـ container، و`pg_isready` يخرج بالرمز 0 حالما يقبل الخادم الاتصالات.
      - text: '`test: ["CMD", "pg_isready -U notes -d notes"]`'
        why: صيغة exec تعامل النصّ كاملًا كاسم للبرنامج، فيبحث Docker عن ملف تنفيذي اسمه حرفيًا `pg_isready -U notes -d notes` ويفشل الفحص دائمًا.
      - text: '`test: ["CMD", "curl", "-f", "http://localhost:5432"]`'
        why: لا يتحدّث Postgres بـ HTTP، وimage ‏Postgres لا تشحن `curl`.
      - text: '`test: ["CMD", "ping", "-c", "1", "db"]`'
        why: الـ ping يثبت أن الشبكة تعمل، لا أن Postgres يقبل الاستعلامات.
    answer: 0
  - q: خدمة `migrate` تطبّق تغييرات المخطّط ثم تخرج. كيف يجب أن تعتمد `api` عليها؟
    options:
      - text: "`condition: service_healthy`"
        why: المهمة التي تخرج لا تصبح سليمة أبدًا، فستنتظر `api` حالة لا تأتي أبدًا.
      - text: "`condition: service_completed_successfully`"
        why: صحيح. ينتظر Compose أن تخرج `migrate` بالرمز 0، ويرفض تشغيل `api` إن فشلت.
      - text: "`condition: service_started`"
        why: هذا لا ينتظر إلا بداية الـ migration، فقد يبدأ الـ API على مخطّط نصف مُرحَّل.
      - text: "`restart: always` على `migrate`"
        why: هذا يعيد تشغيل المهمة إلى الأبد بعد انتهائها؛ ولا يرتّب أي شيء.
    answer: 1
  - q: بيئتك تستخدم healthchecks و`service_healthy`. لماذا يجب أن يعيد notes-api محاولة الاتصالات الفاشلة بقاعدة البيانات مع ذلك؟
    options:
      - text: لأن الـ healthchecks لا تعمل إلا خلال `docker compose build`.
        why: إنها تعمل باستمرار ما دام الـ container يعمل، بالفاصل الزمني المضبوط.
      - text: لأن إعادة المحاولة شرط لنجاح `pg_isready`.
        why: "الأمر `pg_isready` يعمل داخل container الـ `db` ولا علاقة له بمنطق الاتصال في الـ API."
      - text: لأن Compose يعطّل `depends_on` بعد الدقيقة الأولى.
        why: لا شيء يُعطَّل. إنها ببساطة ميزة خاصة بوقت الإقلاع.
      - text: لأن الترتيب لا يسري إلا عند الإقلاع؛ قد يُعاد تشغيل قاعدة البيانات لاحقًا، وKubernetes لا يرتّب الإقلاع أصلًا.
        why: صحيح. التطبيق المرن يعيد المحاولة مع backoff؛ وترتيب الإقلاع راحة إضافية، لا ضمانة.
    answer: 3
---

كل إقلاع بارد لبيئة notes-api كانت له الدقيقة الأولى المتقلّبة نفسها: يبدأ الـ API، ويحاول الاتصال بـ Postgres، فيحصل على `ECONNREFUSED`، وينهار. السطر `depends_on: [db]` في الملف بدا وكأنه كان يجب أن يمنع ذلك. لم يمنعه، لأن «بدأ» و«جاهز» شيئان مختلفان، وCompose لم يكن يعرف إلا الأول.

## ما الذي ينتظره depends_on فعلًا

الصيغة المختصرة تقول: شغّل `db` قبل `api`.

```yaml
services:
  api:
    depends_on:
      - db
```

يفعل Compose ذلك بالضبط: يشغّل container الـ `db` ثم container الـ `api`، بفارق ثانية تقريبًا. لكن Postgres يحتاج إلى عدّة ثوانٍ بعد بدء عمليته ليتهيّأ، وأكثر في التشغيل الأول حين ينشئ قاعدة البيانات ويشغّل سكربتات التهيئة. يتّصل الـ API خلال تلك النافذة فيُرفض.

لكي ينتظر Compose *الجاهزية*، يحتاج إلى طريقة لاختبارها. وهذا هو الـ healthcheck (فحص الصحة).

## الـ Healthchecks

الـ healthcheck أمر يشغّله Docker داخل الـ container وفق جدول زمني. رمز الخروج 0 يعني سليم؛ وأي رمز آخر يُعدّ فشلًا.

```yaml title=compose.yaml
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: notes
      POSTGRES_PASSWORD: notes
      POSTGRES_DB: notes
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U notes -d notes"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 30s
      start_interval: 1s
```

يأتي `pg_isready` مع image ‏Postgres ويخرج بالرمز 0 حالما يقبل الخادم الاتصالات. حقول التوقيت:

- `interval`: كم مرة يُشغَّل الفحص بعد أن يعمل الـ container بشكل طبيعي.
- `timeout`: المدة التي قد يستغرقها فحص واحد قبل أن يُعدّ فاشلًا.
- `retries`: عدد الإخفاقات المتتالية قبل أن يُعلَّم الـ container بأنه `unhealthy`.
- `start_period`: مهلة سماح بعد البدء لا تُحتسب خلالها الإخفاقات ضمن `retries`.
- `start_interval`: كم مرة يُفحص *خلال* مهلة البدء، حتى يُكتشف البدء السريع بسرعة بدلًا من انتظار `interval` كامل.

يعرض `docker compose ps` الآن `(healthy)` أو `(unhealthy)` بجوار الحالة. وحين يفشل فحص وتريد معرفة السبب، تُحفظ آخر بضع نتائج، مع مخرجاتها، على الـ container:

```bash
docker inspect notes-db-1 --format '{{json .State.Health}}'
```

هناك شيء لا تفعله الـ healthchecks في Docker أو Compose العاديين: إنها لا تعيد تشغيل الـ container غير السليم. الحالة معلومة فقط، تستخدمها شروط `depends_on` وتستخدمها أنت. ‏Kubernetes مختلف، كما سترى مع الـ liveness probes في القسم الخامس، حيث يؤدّي الفحص الفاشل فعلًا إلى إعادة التشغيل. معرفة أي أداة تتصرّف عند فشل الفحص وأيها تكتفي بالإبلاغ عنه أمر مهمّ في الثالثة فجرًا.

:::mistake الفرق بين CMD وCMD-SHELL
الصيغة `["CMD", "pg_isready -U notes -d notes"]` تبدو صحيحة وتفشل دائمًا. مع `CMD` يكون كل عنصر في القائمة معاملًا واحدًا، فيحاول Docker تشغيل برنامج اسمه النصّ بأكمله. إمّا أن تقسّمه، `["CMD", "pg_isready", "-U", "notes", "-d", "notes"]`، أو تستخدم `CMD-SHELL` مع نصّ واحد. والعلامة التي تفضح الخطأ: container يبقى `unhealthy` إلى الأبد بينما تعمل قاعدة البيانات على أكمل وجه.
:::

## الانتظار على شروط

الصيغة الطويلة لـ `depends_on` تتيح لك تحديد ما تنتظره:

```yaml title=compose.yaml
services:
  migrate:
    image: notes-api:dev
    command: ["node", "dist/migrate.js"]
    environment:
      DATABASE_URL: postgres://notes:notes@db:5432/notes
    depends_on:
      db:
        condition: service_healthy

  api:
    build: .
    image: notes-api:dev
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://notes:notes@db:5432/notes
    depends_on:
      db:
        condition: service_healthy
        restart: true
      migrate:
        condition: service_completed_successfully
```

هناك ثلاثة شروط: `service_started` (سلوك الصيغة المختصرة)، و`service_healthy`، و`service_completed_successfully` الذي ينتظر container يُنفَّذ مرة واحدة حتى يخرج بالرمز 0. هنا تعمل الـ migration حالما يصبح Postgres سليمًا، ولا يبدأ الـ API إلا بعد نجاح الـ migration. إذا فشلت الـ migration فلن يبدأ `api` أبدًا، وسترى السبب في `docker compose logs migrate`. أما `restart: true` فيعني أن Compose إذا أعاد تشغيل `db` (مثلًا بعد تغيير إعداداته)، فسيعيد تشغيل `api` أيضًا.

:::figure ترتيب الإقلاع مع الشروط
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">خط زمني: يبدأ db ويصبح سليمًا بعد نجاح فحوصه؛ ثم تعمل migrate وتخرج بالرمز 0؛ ثم يبدأ api.</title>
  <text class="d-label-strong" x="20" y="54">db</text>
  <text class="d-label-strong" x="20" y="114">migrate</text>
  <text class="d-label-strong" x="20" y="174">api</text>
  <rect class="d-box-warn" x="110" y="34" width="170" height="32" rx="6"/>
  <text class="d-label" x="195" y="55" text-anchor="middle">يبدأ</text>
  <rect class="d-box-success" x="280" y="34" width="400" height="32" rx="6"/>
  <text class="d-label" x="480" y="55" text-anchor="middle">سليم</text>
  <rect class="d-box-accent" x="290" y="94" width="150" height="32" rx="6"/>
  <text class="d-label" x="365" y="115" text-anchor="middle">يعمل</text>
  <text class="d-code" x="450" y="115">exit 0</text>
  <rect class="d-box-primary" x="510" y="154" width="170" height="32" rx="6"/>
  <text class="d-label" x="595" y="175" text-anchor="middle">يخدم</text>
  <path class="d-arrow" d="M282 68 L292 92" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 128 L508 160" marker-end="url(#arrow)"/>
  <path class="d-line d-dashed" d="M110 200 L680 200"/>
  <text class="d-label-muted" x="680" y="216" text-anchor="end">الزمن</text>
</svg>
:::

الـ API يستحق healthcheck هو الآخر. قد تكون image التشغيل من نوع distroless بلا `curl`، لكنها تحتوي دائمًا على Node، وNode 24 فيه `fetch` مدمجة. على `node:24-slim` يكون `node` ضمن الـ `PATH`؛ أما على distroless فاستدعِه بمساره الكامل `/nodejs/bin/node`:

```yaml
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 3s
      retries: 3
```

في الـ CI، الأمر `docker compose up -d --wait` لا يعود إلا حين تصبح كل خدمة لها healthcheck سليمة، ويفشل إن صارت إحداها غير سليمة. هذه هي الطريقة الصحيحة لتشغيل البيئة قبل اختبارات التكامل، بدلًا من `sleep 15`.

## إعادة المحاولة مكانها التطبيق مع ذلك

كل هذا يغطّي التشغيل الأول. لا شيء يمنع Postgres من إعادة التشغيل في الثالثة عصرًا من يوم ثلاثاء، وحين تنتقل إلى Kubernetes في القسم الرابع، لن تجد `depends_on` أصلًا: تبدأ الـ Pods بأي ترتيب تُجدوَل به. لذا يتّصل notes-api مع إعادة محاولة وbackoff، ويُبلغ «غير جاهز» على `/readyz` حتى تجيب قاعدة البيانات. الـ healthchecks والشروط تجعل الإقلاع المعتاد سريعًا؛ وإعادة المحاولة تجعل التطبيق يصمد حين تسوء الأمور.

:::why الجاهزية فكرة متكرّرة
السؤال «هل بدأ؟» مقابل «هل يستطيع أداء عمله؟» هو نفسه الذي ستجيب عنه مجددًا مع الـ readiness probes في Kubernetes في القسم الخامس. الـ Pod الذي يعمل لكنه لا يصل إلى قاعدة بياناته يجب ألا يستقبل أي حركة. فهم الفكرة جيدًا هنا يجعل نسختها في Kubernetes تبدو بديهية.
:::

البيئة الآن تقلع بالترتيب الصحيح في كل مرة. درس Compose الأخير يرتّب الإعدادات ويعطيك حلقة سريعة للتعديل وإعادة التحميل.
