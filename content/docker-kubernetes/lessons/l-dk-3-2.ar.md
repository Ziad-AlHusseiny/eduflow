---
summary: احفظ بيانات Postgres عبر إعادات التشغيل باستخدام named volume، وجهّز قاعدة البيانات ببيانات أولية عبر سكربت تهيئة مربوط بـ bind mount، واعرف أي أوامر Compose تحفظ بياناتك وأيها يدمّرها.
takeaways:
  - الـ named volumes يديرها Docker وتعيش أطول من الـ containers؛ استخدمها لملفات قاعدة البيانات.
  - الـ bind mounts تربط مسارًا على المضيف بداخل الـ container؛ استخدمها للملفات التي تعدّلها على المضيف، مثل سكربتات البيانات الأولية، وركّبها للقراءة فقط متى استطعت.
  - "الأمر `docker compose down` يحتفظ بالـ named volumes؛ أما `docker compose down -v` فيحذفها مع كل بياناتها."
  - السكربتات في `/docker-entrypoint-initdb.d` لا تعمل إلا حين يكون مجلد بيانات Postgres فارغًا، أي عند أول تشغيل على الإطلاق.
  - صيغة تخزين قاعدة البيانات على القرص مرتبطة بإصدارها الرئيسي؛ والترقية بين إصدارات Postgres الرئيسية تحتاج إلى dump واستعادة أو `pg_upgrade`، لا إلى tag جديد.
further:
  - title: Volumes
    url: https://docs.docker.com/engine/storage/volumes/
  - title: Bind mounts
    url: https://docs.docker.com/engine/storage/bind-mounts/
  - title: Compose volumes reference
    url: https://docs.docker.com/reference/compose-file/volumes/
quiz:
  - q: تشغّل `docker compose down` ثم `docker compose up -d`. خدمة `db` تركّب الـ named volume ‏`pgdata`. ماذا يحدث لملاحظاتك؟
    options:
      - text: تختفي، لأن `down` يحذف الـ containers.
        why: الـ containers تُحذف، لكن الـ named volume لا يُحذف. يجد Postgres بياناته مجددًا في التشغيل التالي.
      - text: تختفي ما لم تشغّل `docker compose stop` أولًا.
        why: "الفرق بين `stop` و`down` يخصّ الـ containers، لا الـ named volumes. كلاهما يترك `pgdata` كما هو."
      - text: تُستعاد من اللقطة الأولية في الـ image.
        why: الـ images لا تلتقط البيانات. الـ volume هو ما يحفظها.
      - text: ما زالت موجودة؛ ‏`down` لا يحذف الـ named volumes ما لم تضف `-v`.
        why: صحيح. وحده `docker compose down -v` (أو `docker volume rm`) يحذف الـ volume.
    answer: 3
  - q: تعدّل `db/init/001-schema.sql` لإضافة عمود، وتشغّل `docker compose up -d`، فلا يظهر العمود. لماذا؟
    options:
      - text: الـ bind mounts لا تُقرأ إلا عند بناء الـ image.
        why: الـ bind mounts حيّة؛ يرى الـ container تعديلك فورًا. المشكلة في توقيت قراءة Postgres للمجلد.
      - text: سكربتات التهيئة لا تعمل إلا حين يكون مجلد البيانات فارغًا، والـ volume لديك فيه بيانات أصلًا.
        why: صحيح. نقطة الدخول تتخطّى `/docker-entrypoint-initdb.d` إذا كانت قاعدة البيانات مهيّأة. استخدم migration، أو امسح volume التطوير عن قصد.
      - text: يجب أن يكون اسم الملف `init.sql` بالضبط.
        why: أي ملف `.sql` أو `.sql.gz` أو `.sh` في ذلك المجلد يُنفَّذ، بترتيب الأسماء.
      - text: الخيار `:ro` يمنع Postgres من قراءة الملف.
        why: "الخيار `:ro` يمنع الـ container من *الكتابة*. القراءة مسموحة."
    answer: 1
  - q: أي mount يجب أن يحفظ بيانات Postgres في بيئة تطوير تريدها أن تصمد بعد إعادة التشغيل؟
    options:
      - text: named volume مثل `pgdata:/var/lib/postgresql/data`.
        why: صحيح. يديره Docker، ويعيش أطول من الـ containers، ويجنّبك مفاجآت صلاحيات الملفات والأداء على المضيف.
      - text: ‏mount من نوع `tmpfs` في `/var/lib/postgresql/data`.
        why: الـ tmpfs يعيش في الذاكرة ويختفي حين يتوقّف الـ container. يصلح للاختبارات المؤقتة، لا هنا.
      - text: الـ layer القابلة للكتابة في الـ container، وهي الافتراضية.
        why: تلك الـ layer تُحذف مع الـ container، فيضيّع `docker compose down` كل شيء.
      - text: ‏bind mount إلى مجلد `src/` لديك.
        why: خلط ملفات قاعدة البيانات بشجرة الكود المصدري يستدعي commits بالخطأ وأخطاء صلاحيات.
    answer: 0
  - q: تغيّر image الـ `db` من `postgres:17` إلى `postgres:18` وتُبقي الـ volume ‏`pgdata` نفسه. ما الذي يجب أن تتوقّعه؟
    options:
      - text: يرقّي Postgres الملفات في مكانها عند البدء.
        why: لا يحوّل Postgres مجلدات البيانات بين الإصدارات الرئيسية من تلقاء نفسه.
      - text: لا شيء يتغيّر، لأن الـ volumes مستقلة عن الإصدار.
        why: الـ volume يخزّن صيغة Postgres على القرص، وهي خاصة بالإصدار الرئيسي.
      - text: يرفض الإصدار الجديد مجلد البيانات القديم (وimage الإصدار 18 تتوقّع أيضًا مسار mount مختلفًا)؛ تحتاج إلى dump واستعادة أو `pg_upgrade`.
        why: صحيح. الترقيات الرئيسية عملية ترحيل. في التطوير خذ dump، وامسح الـ volume، واستعِد؛ وفي الإنتاج خطّط لها مسبقًا.
      - text: يُعاد تسمية الـ volume تلقائيًا إلى `pgdata-18`.
        why: لا يعيد Compose تسمية الـ volumes أبدًا. يركّب بالضبط ما يسمّيه الملف.
    answer: 2
---

في الأسبوع الذي أضفنا فيه Compose إلى أحد مشاريع Skylane، شغّل مطوّر `docker compose down -v` «لينظّف» قبل عرض تقديمي. فنظّف ثلاثة أيام من بيانات الاختبار المُدخلة بعناية. الـ containers مصمَّمة ليُتخلَّص منها، لذا يجب أن يعيش كل ما تريد الاحتفاظ به خارجها، ويجب أن تعرف بالضبط أي أمر يمحوه.

## الـ Named volumes لملفات قاعدة البيانات

أضف volume إلى خدمة `db` وصرّح به في المستوى الأعلى:

```yaml title=compose.yaml
services:
  # api: …as before
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: notes
      POSTGRES_PASSWORD: notes
      POSTGRES_DB: notes
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

الـ **named volume** (وحدة تخزين مسمّاة) تخزين ينشئه Docker ويديره. يضيف Compose اسم المشروع كبادئة له، فيصبح اسم هذا `notes_pgdata`. إنه ليس جزءًا من أي container، لذا فإن حذف `db` وإعادة إنشائه يتركان البيانات في مكانها:

```bash
docker compose down        # containers and network removed, pgdata kept
docker compose up -d       # notes are still there
docker volume ls           # notes_pgdata
docker volume inspect notes_pgdata
```

الـ named volumes هي الخيار الافتراضي الصحيح لملفات قاعدة البيانات. يضبط Docker الملكية بشكل صحيح للـ container، ولا تواجه غرائب نظام ملفات المضيف، وعلى Docker Desktop هي أسرع بكثير من الـ bind mounts لأنها تعيش داخل آلة Linux الافتراضية.

:::mistake الأمر down -v كعادة تنظيف
الأمر `docker compose down -v` يحذف البيئة *وكل* named volume تصرّح به. يتعلّمه الناس على أنه «إعادة الضبط الكاملة» ويكتبونه بحكم العادة. استخدم `down` العادي افتراضيًا، واحتفظ بـ `-v` للحظات التي تريد فيها حقًا قاعدة بيانات فارغة. وإذا كانت بيانات التطوير ثمينة، فخذ نسخة احتياطية أولًا:

```bash
docker compose exec db pg_dump -U notes notes > backup.sql
```
:::

الاستعادة هي الأنبوب نفسه في الاتجاه المعاكس: `docker compose exec -T db psql -U notes notes < backup.sql`. الخيار `-T` يعطّل الطرفية الوهمية (pseudo-TTY) حتى يمكن تمرير الملف إلى الداخل. جرّب ذلك مرة في وقت هادئ، حتى لا تكون أول استعادة لك في اليوم الذي تحتاج إليها فيه.

## الـ Bind mounts للملفات التي تعدّلها

الـ **bind mount** يربط مسارًا على جهازك بداخل الـ container. التعديلات على أي جهة تظهر على الأخرى فورًا. هذا ما تريده للملفات التي تعيش في مستودعك، مثل سكربت المخطّط:

```yaml
  db:
    image: postgres:17
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d:ro
```

تشغّل image ‏Postgres كل ملف `.sql` و`.sh` في `/docker-entrypoint-initdb.d`، بترتيب الأسماء، **فقط حين يكون مجلد البيانات فارغًا**. في أول `up` على الإطلاق، ينشئ `db/init/001-schema.sql` الجدول `notes`. وفي كل تشغيل لاحق يُتجاهل المجلد، لأن الـ volume يحتوي أصلًا على قاعدة بيانات مهيّأة. حين تغيّر المخطّط بعد ذلك، اكتب migration يشغّلها التطبيق، أو امسح volume التطوير عن قصد.

اللاحقة `:ro` تجعل الـ mount للقراءة فقط داخل الـ container. أعطِ الـ containers أقل صلاحية تكفي.

للـ bind mounts عيبان مزعجان. على Linux تكون الملفات مملوكة لـ UID مستخدم المضيف، الذي قد لا يطابق المستخدم داخل الـ container، فتفشل الكتابة بـ `EACCES`. وعلى macOS وWindows يعبر الوصول إلى الملفات حدود الآلة الافتراضية فيكون أبطأ، ولهذا يجب ألا تُربط المجلدات الثقيلة مثل `node_modules` من المضيف أبدًا. ستستخدم أداة أفضل لتعديل الكود الحيّ، Compose watch، في الدرس 3.4.

## الـ tmpfs للبيانات المؤقتة

الـ mount من نوع `tmpfs` يعيش في الذاكرة ويختفي حين يتوقّف الـ container. إنه مفيد للملفات المؤقتة التي لا تريدها على القرص أبدًا، أو لقاعدة بيانات اختبار تُحذف بعد الاستخدام حيث تهمّ السرعة أكثر من البقاء:

```yaml
  db-test:
    image: postgres:17
    tmpfs:
      - /var/lib/postgresql/data
```

## الـ Volumes وإصدارات قاعدة البيانات

الـ volume يخزّن صيغة قاعدة البيانات على القرص، وهي تخصّ إصدارًا رئيسيًا واحدًا. إذا رفعت `postgres:17` إلى `postgres:18` وأبقيت الـ volume نفسه، فسيرفض الخادم الجديد البدء على الملفات القديمة. كما أن image ‏Postgres 18 نقلت موقع البيانات الافتراضي: فهي تتوقّع mount واحدًا في `/var/lib/postgresql` (وتحفظ البيانات في مجلد فرعي يحمل رقم الإصدار) بدلًا من `.../data`. وإذا وجدت نقطة دخولها بيانات أو mount في المسار القديم، فإنها تتوقّف برسالة خطأ تشرح هذا التغيير. اقرأ ملاحظات الإصدار الخاصة بالـ image قبل رفع إصدار رئيسي.

:::tip عامل الترقيات الرئيسية كعمليات ترحيل
في التطوير: خذ dump، وارفع الـ image، واحذف الـ volume القديم، وابدأ من جديد، واستعِد الـ dump. في الإنتاج ستخطّط للشيء نفسه باستخدام `pg_upgrade` أو أدوات الترقية في قاعدة البيانات المُدارة، مع مسار للتراجع. وفي الحالتين، ليست مجرد تغيير في الـ tag.
:::

## أي mount لأي مهمة

| الحاجة | الاستخدام |
|---|---|
| ملفات قاعدة بيانات تصمد بعد إعادة التشغيل | named volume |
| سكربتات بيانات أولية أو إعدادات من المستودع | ‏bind mount مع `:ro` |
| مساحة مؤقتة سريعة تُحذف بعد الاستخدام | `tmpfs` |
| الكود المصدري أثناء التطوير | ‏Compose watch (الدرس 3.4) |

بياناتك الآن تعيش أطول من الـ containers. لكن شغّل البيئة من البداية الباردة، وقد ترى الـ API يفشل في أول بضعة طلبات: إنه يبدأ قبل أن يصبح Postgres جاهزًا لقبول الاتصالات. ترتيب الإقلاع هو التالي.
