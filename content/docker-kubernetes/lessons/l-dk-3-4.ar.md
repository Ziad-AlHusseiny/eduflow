---
summary: انقل إعدادات notes-api إلى ملفات env وأسرار Compose، وافصل إعدادات التطوير وحدها في ملف override وفي profiles، واحصل على حلقة تعديل سريعة بـ `docker compose watch`.
takeaways:
  - ملف `.env` الخاص بالمشروع يغذّي استبدال `${VAR}` داخل `compose.yaml`؛ بينما `env_file:` و`environment:` تضبطان المتغيّرات داخل الـ containers. إنهما آليتان مختلفتان.
  - "الصيغة `${VAR:?message}` تجعل Compose يفشل سريعًا برسالة واضحة حين تكون قيمة مطلوبة مفقودة."
  - "الأمر `docker compose config` يطبع الملف بعد الدمج والاستبدال الكاملين، وهو أسرع طريقة لتشخيص الإعدادات."
  - "الملف `compose.override.yaml` يُدمج تلقائيًا، لذا أبقِ الإعدادات المشتركة في `compose.yaml` وإعدادات التطوير وحدها في الـ override."
  - "الخيار `develop.watch` مع `sync` ينسخ الملفات المعدّلة إلى الـ container الذي يعمل، ومع `rebuild` يعيد بناء الـ image حين تتغيّر الاعتماديات."
further:
  - title: Set environment variables in Compose
    url: https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/
  - title: Use Compose Watch
    url: https://docs.docker.com/compose/how-tos/file-watch/
  - title: Merge Compose files
    url: https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
  - title: Secrets in Compose
    url: https://docs.docker.com/compose/how-tos/use-secrets/
quiz:
  - q: ملف `.env` في مشروعك يحتوي على `LOG_LEVEL=debug`. خدمة `api` ليس فيها مدخلات `environment:` ولا `env_file:`. ما قيمة `LOG_LEVEL` داخل الـ container؟
    options:
      - text: "‏`debug`، لأن Compose يحمّل `.env` في كل container."
        why: ملف `.env` الخاص بالمشروع مخصّص لاستبدال القيم في ملف Compose نفسه. لا يُحقن في الـ containers ما لم تشر إليه.
      - text: غير مضبوطة، ما لم تمرّرها الخدمة عبر `environment:` أو `env_file:`.
        why: 'صحيح. أضف `LOG_LEVEL: ${LOG_LEVEL}` تحت `environment:`، أو `env_file: .env`، لتمريرها.'
      - text: "‏`debug`، لكن بعد `docker compose restart` فقط."
        why: إعادة التشغيل لا تغيّر طريقة استخدام `.env`. يبقى مخصّصًا للاستبدال فقط.
      - text: خطأ، لأن `.env` يجب أن يكون اسمه `api.env`.
        why: "الاسم `.env` هو الاسم المتعارف عليه الذي يقرؤه Compose للاستبدال. لا يلزم تسمية لكل خدمة."
    answer: 1
  - q: "الملف `compose.yaml` يحتوي على `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set it in .env}` والمتغيّر غير معرّف في أي مكان. ماذا يحدث عند `docker compose up`؟"
    options:
      - text: يبدأ Postgres بكلمة مرور فارغة.
        why: هذا ما كانت ستفعله `${POSTGRES_PASSWORD}` العادية، ولهذا بالضبط وُجدت الصيغة `:?`.
      - text: يطلب منك Compose كتابة كلمة المرور.
        why: لا يطلب Compose إدخال المتغيّرات أبدًا.
      - text: يصبح النصّ الحرفي `${POSTGRES_PASSWORD:?set it in .env}` هو كلمة المرور.
        why: يستبدل Compose التعبير؛ ولا يمرّره حرفيًا.
      - text: يرفض Compose البدء ويطبع `set it in .env`.
        why: صحيح. ‏`:?` تجعل المتغيّر مطلوبًا وتستخدم نصّك رسالةً للخطأ.
    answer: 3
  - q: |
      تعدّل `src/routes.ts`. مع قواعد المراقبة أدناه، ماذا يفعل Compose؟
      ```yaml
      develop:
        watch:
          - action: sync
            path: ./src
            target: /app/src
          - action: rebuild
            path: package-lock.json
      ```
    options:
      - text: يعيد بناء الـ image وإنشاء الـ container.
        why: لا يؤدّي إلى إعادة البناء إلا التغيير في `package-lock.json`. والملف داخل `./src` يطابق قاعدة الـ sync.
      - text: لا شيء حتى تشغّل `docker compose up` من جديد.
        why: وضع المراقبة يتفاعل مع تغييرات الملفات أثناء عمله؛ ولا تعيد تشغيل `up`.
      - text: ينسخ الملف المتغيّر إلى `/app/src` في الـ container الذي يعمل؛ ويلتقطه خادم التطوير في الداخل.
        why: صحيح. ‏`sync` يحدّث الملفات في مكانها خلال ثوانٍ، دون إعادة بناء.
      - text: يعيد تشغيل قاعدة البيانات، لأن الـ API يعتمد عليها.
        why: قواعد المراقبة لا تعمل إلا على الخدمة المعرّفة فيها.
    answer: 2
  - q: تريد خدمة `pgadmin` متاحة للتشخيص المحلي، لكن يجب ألا تبدأ في الـ CI أو عند الزملاء الذين لا يحتاجون إليها. ماذا تستخدم؟
    options:
      - text: "‏`profiles: [tools]` على الخدمة، وتُشغَّل بـ `docker compose --profile tools up`."
        why: صحيح. الخدمات التي لها profile لا تبدأ إلا حين يُفعَّل ذلك الـ profile.
      - text: تعليق يطلب من الناس تشغيلها يدويًا.
        why: التعليقات لا تغيّر السلوك؛ سيحصل الجميع على pgadmin مع كل `up`.
      - text: "‏`deploy: replicas: 0`"
        why: إنه التفاف يُخفي النية ويحتاج إلى تعديل لتشغيله. الـ profiles موجودة لهذا الغرض.
      - text: فرع Git منفصل أُضيف إليه pgadmin.
        why: الفروع المخصّصة للإعدادات تتقادم بسرعة. الـ profiles تُبقي كل شيء في ملف واحد.
    answer: 0
---

ملف Compose الخاص بـ notes-api يعمل الآن، وفيه ثلاث مشاكل تصطدم بها الفرق في الأسبوع الثاني. كلمة مرور قاعدة البيانات مكتوبة نصًّا صريحًا في ملف محفوظ في المستودع. وإعدادات التطوير وحدها، مثل منافذ التشخيص، مختلطة بما يحتاج إليه الـ CI. وكل تغيير في الكود يعني `docker compose up --build` وانتظار ثلاثين ثانية. هذا الدرس يصلح الثلاث.

## نوعان من البيئة

لدى Compose آليتان منفصلتان تتعلّق كلتاهما بـ «env»، والخلط بينهما سبب معظم الالتباس في الإعدادات.

**الاستبدال** (interpolation) يملأ العناصر النائبة `${VAR}` *في ملف Compose نفسه*. القيم تأتي من الـ shell لديك، ثم من ملف `.env` في مجلد المشروع:

```ini title=.env
POSTGRES_PASSWORD=change-me-locally
API_PORT=8080
```

```yaml title=compose.yaml
services:
  api:
    ports:
      - "${API_PORT:-8080}:3000"
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD in .env}
```

الصيغة `${API_PORT:-8080}` تستخدم 8080 قيمةً احتياطية إن لم يكن المتغيّر مضبوطًا. والصيغة `${POSTGRES_PASSWORD:?…}` تجعل القيمة مطلوبة: إن كانت مفقودة، يتوقّف Compose برسالتك بدلًا من تشغيل Postgres بكلمة مرور فارغة.

**بيئة الـ container** هي ما تراه العملية في الداخل. وتأتي من `environment:` و`env_file:` في الخدمة:

```yaml
  api:
    env_file: .env.api
    environment:
      DATABASE_URL: postgres://notes:${POSTGRES_PASSWORD}@db:5432/notes
```

ملف `.env` الخاص بالمشروع *لا* يُمرَّر إلى الـ containers من تلقاء نفسه. إذا كان يجب أن تصل قيمة إلى التطبيق، فأشر إليها تحت `environment:` أو اذكر الملف تحت `env_file:`. وحين يأتي المتغيّر نفسه من المصدرين، تفوز `environment:`.

في الاستبدال، المتغيّر المضبوط في الـ shell يتغلّب على نظيره في `.env`، لذا فإن `API_PORT=9090 docker compose up -d` تجاوز سريع لمرة واحدة دون تعديل أي ملف. ولاستخدام ملف مختلف كليًا، مرّر `--env-file .env.staging`. أبقِ عدد هذه الملفات قليلًا؛ فثلاثة ملفات env متشابهة بفروق صغيرة كفيلة بأن تجعل الفريق يشخّص الإعدادات بدلًا من الكود.

احفظ في المستودع ملف `.env.example` بقيم وهمية، وأضف `.env` إلى `.gitignore`. ينسخ الزملاء الجدد ملف المثال ويملؤونه.

:::tip انظر إلى ما يراه Compose
الأمر `docker compose config` يطبع الإعدادات النهائية بعد دمج الملفات واستبدال المتغيّرات. حين لا تكون قيمة ما كما تتوقّع، شغّله قبل أي شيء آخر. عشر ثوانٍ معه وفّرت عليّ ساعات من التخمين.
:::

## أسرار Compose

متغيّرات البيئة مرئية في `docker inspect` ولكل عملية داخل الـ container. لكلمات المرور، يستطيع Compose تركيب ملف بدلًا من ذلك:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

يظهر السرّ داخل الـ container في `/run/secrets/db_password`. تقرأ image ‏Postgres المتغيّر `POSTGRES_PASSWORD_FILE`، وكثير من الـ images الرسمية تدعم عرف `_FILE` نفسه. أما في تطبيقك، فاقرأ الملف عند البدء. الـ Kubernetes Secrets المركّبة كملفات تعمل بالطريقة نفسها، فتنتقل العادة معك.

## ملف أساسي مع override

يدمج Compose تلقائيًا `compose.override.yaml` فوق `compose.yaml` إن وُجد. استخدم هذا الفصل عن قصد:

- `compose.yaml`: ما تحتاج إليه كل بيئة، بما فيها الـ CI.
- `compose.override.yaml`: وسائل الراحة للمطوّرين، مثل منافذ قاعدة البيانات المنشورة، وخيارات التشخيص، وقواعد المراقبة.

يستطيع الـ CI عندها التشغيل بالملف الأساسي وحده: `docker compose -f compose.yaml up -d --wait`. حين تمرّر `-f`، لا يُحمَّل الـ override تلقائيًا.

**الـ Profiles** تغطّي الخدمات الاختيارية. container ‏pgAdmin لا يريده إلا بعض الناس يحصل على `profiles: [tools]`، ولا يبدأ إلا مع `docker compose --profile tools up`.

## وضع Watch: حلقة تعديل سريعة

إعادة بناء الـ image مع كل تعديل بطيئة. وربط المشروع كاملًا بـ bind mount هشّ: ‏`node_modules` على المضيف (المبني لـ macOS) يحجب نظيره في الـ container (المبني لـ Linux)، والوصول إلى الملفات عبر آلة Docker Desktop الافتراضية بطيء. **Compose watch** يحلّ المشكلتين بمزامنة الملفات التي تختارها فقط إلى الـ container الذي يعمل.

```yaml title=compose.override.yaml
services:
  api:
    build:
      context: .
      target: build
    command: ["npm", "run", "dev"]
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
        - action: rebuild
          path: package.json
        - action: rebuild
          path: package-lock.json
```

للتطوير، يبني الـ override مرحلة `build` (التي تحتوي على اعتماديات التطوير) ويشغّل `npm run dev`، وهو في notes-api ‏`tsx watch src/server.ts`، أداة لتشغيل TypeScript تعيد التشغيل عند التغييرات. ثم:

```bash
docker compose up --watch
```

عدّل `src/routes.ts` فيُنسخ الملف إلى `/app/src` خلال ثانية؛ ويعيد `tsx` تشغيل الخادم. غيّر `package-lock.json` فيعيد Compose بناء الـ image ويستبدل الـ container، لأن الاعتماديات الجديدة تحتاج إلى تثبيت حقيقي. وهناك إجراء ثالث، `sync+restart`، يزامن الملفات ويعيد تشغيل الـ container، ويناسب ملفات الإعدادات التي لا يقرؤها التطبيق إلا عند البدء. والأمر `docker compose watch` يفعل ما يفعله `up --watch` مع مخرجات أهدأ.

:::mistake شحن إعدادات التطوير
الـ override يشغّل مرحلة `build` مع npm في موقع PID 1 ومراقب للملفات. هذا جيد على حاسوبك وخاطئ في أي مكان آخر. أبقِ إعدادات التطوير وحدها في `compose.override.yaml`، وتأكّد من أن الـ CI وأي نشر على خادم يستخدمان `-f compose.yaml` صراحة، حتى تكون الـ image بشكلها الإنتاجي هي التي تُختبر.
:::

اكتمل القسم الثالث: بيئة محلية قابلة للتكرار، ببيانات دائمة، وإقلاع مرتّب، وإعدادات آمنة، وحلقة تعديل سريعة. في القسم التالي ستأخذ الـ image نفسها إلى Kubernetes، بدءًا بطريقة تفكير Kubernetes.
