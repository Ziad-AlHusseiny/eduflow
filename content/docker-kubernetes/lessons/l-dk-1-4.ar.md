---
summary: شغّل notes-api في الخلفية مع المنافذ ومتغيّرات البيئة وحدود الموارد، واقرأ سجلاته، وافتح shell داخله، واجعله يتوقّف توقّفًا نظيفًا عند استقبال SIGTERM.
takeaways:
  - "الخيار `-p 8080:3000` يربط المنفذ 8080 على المضيف بالمنفذ 3000 في الـ container؛ الجهة اليسرى جهازك، والجهة اليمنى التطبيق."
  - مرّر الإعدادات وقت التشغيل بـ `-e` أو `--env-file` حتى تخدم image واحدة كل البيئات.
  - على الـ containers أن تكتب سجلاتها إلى stdout وstderr؛ فمن هناك يجمعها `docker logs` وكل منسّق (orchestrator).
  - "الأمر `docker stop` يرسل SIGTERM، وينتظر 10 ثوانٍ، ثم يرسل SIGKILL؛ ورمز الخروج 137 يعني أن العملية قُتلت."
  - عملية Node.js في موقع PID 1 تحتاج إلى معالج SIGTERM خاص بها، وإلا فستتجاهل الإشارة وتُقتل في منتصف الطلبات.
further:
  - title: docker container run
    url: https://docs.docker.com/reference/cli/docker/container/run/
  - title: Publishing and exposing ports
    url: https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/
  - title: Process signal events in Node.js
    url: https://nodejs.org/api/process.html#signal-events
quiz:
  - q: تشغّل `docker run -d -p 8080:3000 notes-api:dev`. أي عنوان يصل إلى الـ API من جهازك؟
    options:
      - text: "`http://localhost:8080`"
        why: صحيح. الجهة اليسرى من `-p` هي منفذ المضيف؛ ويحوّله Docker إلى المنفذ 3000 داخل الـ container.
      - text: "`http://localhost:3000`"
        why: المنفذ 3000 هو منفذ الـ container. لا شيء على المضيف يستمع عليه ما لم تنشره بوصفه منفذ المضيف.
      - text: "`http://notes-api:8080`"
        why: أسماء الـ containers تُحلّ داخل شبكات Docker، لا في DNS جهازك، و8080 ليس منفذ الـ container أصلًا.
      - text: كلا المنفذين يعمل، لأن Docker يربط الاتجاهين.
        why: ربط المنافذ قاعدة واحدة من منفذ واحد على المضيف إلى منفذ واحد في الـ container.
    answer: 0
  - q: "الأمر `docker stop notes` يستغرق عشر ثوانٍ بالضبط، و`docker ps -a` يعرض `Exited (137)`. ماذا حدث؟"
    options:
      - text: انهار التطبيق باستثناء غير معالَج أثناء الإيقاف.
        why: الاستثناء غير المعالَج يخرج عادةً بالرمز 1. أما 137 فهي 128 + 9، أي رقم إشارة SIGKILL.
      - text: نفدت ذاكرة Docker أثناء إيقاف الـ container.
        why: قد يأتي 137 من الـ OOM killer، لكن التأخير الدقيق لعشر ثوانٍ في `docker stop` يشير إلى مهلة الإيقاف.
      - text: تجاهل التطبيق SIGTERM، فأرسل Docker إشارة SIGKILL بعد مهلة السماح البالغة 10 ثوانٍ.
        why: صحيح. 137 = 128 + 9 ‏(SIGKILL). عملية Node في موقع PID 1 دون معالج SIGTERM تتجاهل الإشارة وتنتظر أن تُقتل.
      - text: خرج الـ container خروجًا نظيفًا؛ و137 هو رمز الإيقاف العادي في Docker.
        why: الخروج النظيف هو 0، أو 143 إذا ماتت العملية بسبب SIGTERM غير معالَجة. أما 137 فيعني أنها قُتلت.
    answer: 2
  - q: أين يجب أن يكتب notes-api سجلات الطلبات داخل الـ container؟
    options:
      - text: في `/var/log/notes-api.log`، حتى تبقى بعد إعادة التشغيل.
        why: لن تبقى. الـ layer القابلة للكتابة تُحذف مع الـ container. ولا أحد يجمع الملفات من داخل الـ containers افتراضيًا.
      - text: في stdout وstderr، حيث يجمعها `docker logs` وKubernetes.
        why: صحيح. الـ runtime يلتقط التدفّقات القياسية (stdout وstderr)، وأدوات شحن السجلات تقرؤها من هناك.
      - text: في ملف داخل volume، تدوّره مهمة cron داخل الـ container.
        why: هذه عملية ثانية ووظيفة ثانية داخل الـ container. اكتب إلى stdout ودع المنصّة تتولّى التخزين.
      - text: مباشرة من التطبيق إلى خدمة السجلات عبر HTTP.
        why: هذا يربط التطبيق بمزوّد واحد ويضيّع السجلات عند أي انقطاع عابر في الشبكة. الـ stdout هو العقد الذي تدعمه كل منصّة.
    answer: 1
  - q: يريد زميلك أن يستخدم `docker exec` لإصلاح خطأ إملائي في ملف إعدادات داخل container الإنتاج الذي يعمل الآن. ما المشكلة؟
    options:
      - text: "الأمر `docker exec` يعمل فقط على الـ containers المتوقّفة."
        why: العكس تمامًا. ‏`exec` يشغّل عملية جديدة داخل container يعمل.
      - text: الملفات داخل الـ containers للقراءة فقط دائمًا.
        why: الـ layer القابلة للكتابة تقبل التغييرات، ما لم تضبط `--read-only`. سينجح التغيير، لفترة قصيرة.
      - text: "الأمر `docker exec` يعيد تشغيل الـ container، فيسبّب توقّفًا للخدمة."
        why: "الأمر `exec` يبدأ عملية إضافية؛ ولا يعيد تشغيل أي شيء."
      - text: التغيير يعيش في الـ layer القابلة للكتابة لذلك الـ container، ويختفي مع الـ deploy التالي أو إعادة التشغيل.
        why: صحيح. أصلح الـ image أو الإعدادات الممرَّرة إلى الـ container، ثم أعِد النشر. التعديلات اليدوية لا يراها أحد غيرك.
    answer: 3
---

بناء الـ image نصف العمل؛ والنصف الآخر هو تشغيلها بالطريقة التي سيشغّلها بها الإنتاج. في العام الماضي، كانت إحدى خدمات Skylane تُسقط بضع مئات من الطلبات مع كل deploy. لم يكن في الكود أي خلل؛ كل ما في الأمر أن العملية كانت تتجاهل إشارة «من فضلك توقّف» المهذّبة، فتُقتل بعد عشر ثوانٍ في منتصف الطلبات. يتناول هذا الدرس جانب التشغيل، ويختم بمسألة الإيقاف تلك.

## شغّله في الخلفية

```bash
docker run -d --name notes \
  -p 8080:3000 \
  -e PORT=3000 \
  -e DATABASE_URL=postgres://notes:notes@host.docker.internal:5432/notes \
  --memory 512m --cpus 1 \
  notes-api:dev
```

- `-d` يشغّل الـ container منفصلًا (detached)، فيعمل في الخلفية ويطبع Docker معرّفه.
- `--name notes` يعطيه اسمًا تكتبه بدلًا من المعرّف.
- `-p 8080:3000` يربط المنفذ 8080 على **المضيف** بالمنفذ 3000 في **الـ container**. اقرأه «خارج:داخل». ويمكن لاثنين من الـ containers أن يستمعا كلاهما على المنفذ 3000 في الداخل، ما داما منشورَين على منفذين مختلفين في المضيف.
- `-e` يضبط متغيّرات البيئة. استخدم `--env-file .env.local` حين تكثر.
- `--memory` و`--cpus` يضبطان حدود الـ cgroups. إذا احتاجت العملية إلى ذاكرة أكثر من ذلك (إضافةً إلى ما يسمح به Docker من swap على المضيفات التي فيها swap)، ينهيها الـ OOM killer في النواة.

الاسم `host.docker.internal` يُحلّ إلى عنوان جهازك من داخل الـ container على Docker Desktop؛ وعلى Linux أضف `--add-host=host.docker.internal:host-gateway`. ستستبدل هذا بشبكة Compose حقيقية في القسم الثالث.

:::why image واحدة لكل البيئات
الإعدادات تُمرَّر وقت التشغيل، ولا تُدمج داخل الـ image أبدًا. الـ image التي اختبرتها في بيئة staging هي البايتات نفسها التي تشغّلها في الإنتاج، مع قيم `-e` مختلفة. إذا أعدت البناء لكل بيئة، فأنت تشحن شيئًا لم تختبره قط.
:::

## انظر إلى ما يعمل وما يقوله

```bash
docker ps                      # running containers
docker logs -f notes           # follow stdout/stderr
docker logs --since 10m notes  # recent output only
docker inspect notes --format '{{.State.Status}} {{.NetworkSettings.Ports}}'
```

الأمر `docker logs` يعرض كل ما كتبته العملية إلى stdout وstderr. هذا هو العقد مع الـ containers: **اكتب السجلات إلى التدفّقات القياسية**، سطرًا لكل حدث، ودع المنصّة تجمعها. الكتابة إلى ملف سجلات داخل الـ container تخفي السجلات عن كل الأدوات وتضيّعها حين يُحذف الـ container.

ولإلقاء نظرة في الداخل:

```bash
docker exec -it notes sh
```

الأمر `exec` يبدأ عملية إضافية في الـ container الذي يعمل؛ و`-it` يعطيك terminal تفاعليًا. هذا للنظر، لا للإصلاح. في القسم الثاني ستنتقل إلى base image لا تحتوي على shell أصلًا، وستتعلّم طرقًا أخرى للدخول.

## الإيقاف: SIGTERM ثم SIGKILL

الأمر `docker stop notes` يرسل `SIGTERM` إلى PID 1 وينتظر 10 ثوانٍ (غيّرها بـ `-t`). إذا بقيت العملية حيّة، يرسل Docker إشارة `SIGKILL`، التي لا يمكن التقاطها. رموز الخروج تخبرك بما حدث:

| رمز الخروج | المعنى |
|---|---|
| 0 | خرج التطبيق بنظافة من تلقاء نفسه |
| 143 | ‏128 + 15: ماتت العملية بسبب SIGTERM دون أن تعالجها |
| 137 | ‏128 + 9: قُتلت بـ SIGKILL (انتهاء مهلة الإيقاف أو نفاد الذاكرة) |

يعامل Linux العملية ذات المعرّف PID 1 معاملة خاصة: الإشارة التي لم تسجّل لها العملية معالجًا تُتجاهل بدلًا من أن تقتلها. ولا يسجّل Node.js معالجًا لـ `SIGTERM` افتراضيًا، لذا فإن `node dist/server.js` في موقع PID 1 يتجاهل `docker stop` ويُقتل بعد 10 ثوانٍ. وتموت معه الطلبات الجارية.

عالِج الإشارة: توقّف عن قبول الاتصالات، وأنهِ ما هو جارٍ، وأغلق مجمّع اتصالات قاعدة البيانات، ثم اخرج.

```ts title=src/server.ts
const server = app.listen(port, '0.0.0.0', () => console.log(`notes-api listening on ${port}`));

process.on('SIGTERM', () => {
  console.log('SIGTERM received, draining');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  // Safety net: don't hang forever on a stuck keep-alive connection
  setTimeout(() => process.exit(1), 8000).unref();
});
```

صار `docker stop` ينتهي الآن في أقل بكثير من ثانية، ويخرج الـ container بالرمز 0. وهذا المعالج أهمّ في Kubernetes، الذي يرسل الإشارة نفسها مع كل deploy، وكل تقليص لعدد النسخ (scale-down)، وكل تفريغ (drain) لأحد الـ nodes.

:::mistake الاعتماد على ‎--init وإهمال المعالج
الأمر `docker run --init` يضع عملية init صغيرة في موقع PID 1 تمرّر الإشارات وتنظّف العمليات الميتة (zombies). هذا مفيد، لكن تمرير SIGTERM إلى تطبيق بلا معالج لا يفعل سوى أن يجعله يموت فورًا بدلًا من أن يموت بعد 10 ثوانٍ. وتبقى الطلبات تسقط. المعالج في كودك هو ما يجعل الإيقاف آمنًا.
:::

## سياسات إعادة التشغيل ونموّ السجلات

على خادم واحد دون منسّق، يطلب `--restart unless-stopped` من Docker إعادة الـ container بعد انهياره أو بعد إعادة تشغيل المضيف، إلا إذا أوقفته أنت بنفسك. لـ Kubernetes وCompose إعدادات إعادة تشغيل خاصة بهما، لذا نادرًا ما ستضبط هذا على جهازك، لكنه أول ما تفحصه على تلك الآلة الافتراضية القديمة التي لا يريد أحد لمسها.

على مضيفات Linux طويلة العمر، راقب حجم السجلات أيضًا. برنامج تشغيل السجلات (logging driver) الافتراضي `json-file` يحتفظ بكل ما يطبعه الـ container ما لم تضبط `max-size` و`max-file` في إعدادات الـ daemon. وقد يملأ container ثرثار قرصًا كاملًا في عطلة نهاية أسبوع واحدة؛ وقد استُدعيت في مناوبة لهذا السبب بالضبط.

## التنظيف

```bash
docker rm -f notes          # stop and remove
docker container prune      # remove all stopped containers
docker image prune          # remove dangling images
docker system df            # what's using disk
```

تستطيع الآن بناء container وتشغيله ومراقبته وإيقافه كما يجب. القسم الثاني يحوّل هذه الـ image إلى image ترتاح لشحنها: أصغر، وبمستخدم غير root، وذات إصدار واضح، ومفحوصة.
