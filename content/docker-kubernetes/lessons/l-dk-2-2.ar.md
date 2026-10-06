---
summary: اختر base image لـ notes-api بالموازنة بين slim وAlpine وdistroless، وشغّل التطبيق بمستخدم غير root، وأحكِم إغلاق الـ container أكثر وقت التشغيل.
takeaways:
  - كل حزمة في الـ base image شيء عليك ترقيعه وفحصه والدفاع عنه، لذا ابدأ من أصغر base يعمل عليه تطبيقك فعلًا.
  - "الـ image ‏`node:24-slim` خيار افتراضي متين؛ وAlpine تستخدم musl بدلًا من glibc، وdistroless تزيل الـ shell ومدير الحزم كليًا."
  - الـ images الرسمية لـ Node.js تتضمّن مستخدمًا اسمه `node` ‏(UID 1000)؛ انتقل إليه بـ `USER node` بعد الخطوات التي تحتاج إلى root.
  - اترك ملفات التطبيق مملوكة لـ root وللقراءة فقط بالنسبة إلى مستخدم التطبيق، حتى لا تستطيع عملية مخترَقة إعادة كتابة كودها.
  - أضف تحصينات وقت التشغيل مثل `--read-only` و`--cap-drop ALL` و`no-new-privileges`؛ ولـ Kubernetes الضوابط نفسها في `securityContext`.
further:
  - title: "Dockerfile reference: USER"
    url: https://docs.docker.com/reference/dockerfile/#user
  - title: Docker Engine security
    url: https://docs.docker.com/engine/security/
  - title: Building best practices
    url: https://docs.docker.com/build/building/best-practices/
quiz:
  - q: يعتمد notes-api على حزمة فيها إضافة أصلية (native addon). بعد تغيير الـ base من `node:24-slim` إلى `node:24-alpine`، ينهار الـ container عند البدء بخطأ في تحميل ملف `.node`. ما السبب المرجّح؟
    options:
      - text: الـ images المبنية على Alpine لا تدعم Node.js 24.
        why: الـ images الرسمية `node:24-alpine` موجودة وتشغّل Node 24 دون مشاكل. المشكلة في مكتبة C، لا في إصدار Node.
      - text: الـ image تحتاج إلى `EXPOSE` حتى تُحمَّل الوحدات الأصلية.
        why: "التعليمة `EXPOSE` توثيق للمنافذ. لا علاقة لها بتحميل المكتبات المشتركة."
      - text: Alpine تعمل افتراضيًا كمستخدم غير root، وهذا يمنع الوحدات الأصلية.
        why: images ‏Node المبنية على Alpine تعمل كـ root افتراضيًا، مثل images ‏Debian. الصلاحيات ليست المشكلة هنا.
      - text: الإضافة مترجَمة لتعمل مع glibc، وAlpine تستخدم musl، فلا يمكن تحميل الملف التنفيذي.
        why: صحيح. الملفات التنفيذية الجاهزة تستهدف glibc غالبًا. أعِد بناء الإضافة داخل مرحلة بناء على Alpine، أو ابقَ على base يستخدم glibc مثل slim.
    answer: 3
  - q: أي تغيير يجعل notes-api يعمل بمستخدم غير root في الـ image الرسمية لـ Node.js؟
    options:
      - text: أضف `USER node` في مرحلة التشغيل بعد الخطوات التي تحتاج إلى root.
        why: صحيح. الـ image الرسمية تنشئ المستخدم `node` ‏(UID 1000). والتعليمات وعملية الـ container بعد `USER` تعمل بهذا المستخدم.
      - text: أضف `RUN su node` قبل `CMD`.
        why: "الأمر `su` داخل خطوة `RUN` لا يؤثّر إلا في shell تلك الخطوة. الـ container ما زال يبدأ كـ root."
      - text: أضف `ENV USER=node`.
        why: هذا يضبط متغيّر بيئة اسمه `USER`. لا يغيّر المستخدم الذي تعمل به العملية.
      - text: انشر الـ container على منفذ أعلى من 1024.
        why: رقم المنفذ لا يغيّر المستخدم. سيبقى الـ container يعمل كـ root.
    answer: 0
  - q: تنقل notes-api إلى `gcr.io/distroless/nodejs24-debian13:nonroot`. أي `CMD` صحيحة؟
    options:
      - text: '`CMD ["node", "dist/server.js"]`'
        why: نقطة الدخول في image ‏Node من distroless هي `node` أصلًا، فهذا سيشغّل `node node dist/server.js` ويفشل في العثور على وحدة اسمها `node`.
      - text: "`CMD node dist/server.js`"
        why: صيغة shell تحتاج إلى `/bin/sh`، والـ images من نوع distroless لا تحتوي على shell، فلا يستطيع الـ container البدء.
      - text: '`CMD ["dist/server.js"]`'
        why: صحيح. نقطة الدخول هي `node`، فتقدّم `CMD` مسار السكربت وسيطًا (argument) لها.
      - text: '`CMD ["npm", "start"]`'
        why: الـ images الخاصة بـ Node من distroless تشحن الـ runtime الخاص بـ Node، لا npm. وأنت تريد تجنّب npm في موقع PID 1 على أي حال.
    answer: 2
  - q: لماذا نترك ملفات `dist/` في notes-api مملوكة لـ root مع أن العملية تعمل كمستخدم `node`؟
    options:
      - text: لأن Node.js يرفض تنفيذ الملفات المملوكة للمستخدم الحالي.
        why: يشغّل Node الملفات التي تملكها دون أي مشكلة. الأمر يتعلّق بالحدّ من الضرر، لا بقاعدة يفرضها الـ runtime.
      - text: لأن المهاجم إن حصل على تنفيذ كود كمستخدم `node`، يستطيع قراءة الكود لكنه لا يستطيع تعديله أو زرع ملفات فيه.
        why: صحيح. جعل الملفات للقراءة فقط بالنسبة إلى مستخدم التطبيق يقلّص ما يستطيع الاستغلال تغييره. امنح صلاحية الكتابة فقط للمجلدات التي يجب على التطبيق الكتابة فيها.
      - text: لأن الملفات المملوكة لـ root أصغر حجمًا في الـ image.
        why: ملكية الملف بضعة بايتات من البيانات الوصفية في الحالتين.
      - text: لأن Kubernetes يرفض الـ images التي ملفاتها مملوكة لمستخدم غير root.
        why: لا يوجد في Kubernetes قاعدة كهذه. يستطيع أن يشترط أن تكون *العملية* غير root، وهذا ما تفعله أصلًا.
    answer: 1
---

في 2024 فشلت image لـ Skylane في مراجعة أمنية أجراها أحد العملاء، مع 140 نتيجة. أقل من خمس منها كانت في كود كتبناه أو استدعيناه. والباقي في حزم صادف أن الـ base image تتضمّنها: مكتبة XML، ومحوّل صور، ووكيل لنقل البريد. لا شيء منها كان يعمل، وكلها كانت مشكلتنا. الـ base image اعتمادية ترثها بالجملة، فاخترها عن قصد.

## اختيار الـ base

| الـ Base | ما بداخلها | مناسبة لـ | انتبه إلى |
|---|---|---|---|
| `node:24` | Debian كاملة، ومترجِمات، ومكتبات كثيرة | مراحل البناء التي تترجم إضافات أصلية | كبيرة؛ وفيها الكثير ليُفحص |
| `node:24-slim` | Debian مصغّرة + Node | معظم images التشغيل | ما زال فيها shell و`apt` |
| `node:24-alpine` | Alpine Linux ‏(musl) + Node | images صغيرة جدًا | الفروق بين musl وglibc |
| `gcr.io/distroless/nodejs24-debian13` | Node ومكتبات تشغيله فقط | images إنتاج محصّنة | لا shell ولا مدير حزم |

خياري الافتراضي لفريق جديد على الـ containers هو **slim**: صغيرة، ومبنية على glibc فتعمل الوحدات الأصلية الجاهزة، وما زلت تستطيع الدخول إليها بـ `docker exec` وفتح shell فيها حين تقع أزمة في الإنتاج.

تعطيك **Alpine** images أصغر، لكنها تستخدم مكتبة C ‏musl بدلًا من glibc. الإضافات الأصلية الجاهزة المترجَمة لـ glibc تفشل في التحميل، أما الفروق الدقيقة في تحليل أسماء DNS وفي حجز الذاكرة فقد سبّبت لفرق كثيرة متاعب في الإنتاج. اخترها حين تكون قد اختبرت شجرة اعتمادياتك كاملة عليها، لا لأن الرقم في صفحة الـ tags أصغر.

الـ images من نوع **Distroless** تحتوي على Node.js والمكتبات التي يحتاج إليها، ولا شيء غير ذلك: لا shell، ولا `apt`، ولا `curl`. المهاجم الذي يحصل على تنفيذ كود يجد القليل جدًا ليعمل به، والماسح يجد القليل جدًا ليُبلغ عنه. الثمن هو صعوبة التشخيص. لا تستطيع فتح shell داخلها بـ `exec`، وستتعلّم طريقة Kubernetes للالتفاف على ذلك، `kubectl debug`، في الدرس الأخير من هذه الدورة.

## توقّف عن التشغيل بصلاحيات root

افتراضيًا، تعمل العملية داخل الـ container كـ root، أي UID 0. الـ namespaces تحدّ ما يستطيع هذا الـ root رؤيته، لكنه يبقى root في نظر النواة. وإذا اجتمع ذلك مع خلل في النواة أو mount مضبوط خطأً، فهكذا يتحوّل اختراق الـ container إلى اختراق للمضيف. التشغيل كمستخدم بلا صلاحيات يحوّل كثيرًا من تلك الثغرات إلى طرق مسدودة.

تأتي الـ images الرسمية لـ Node.js بمستخدم اسمه `node` رقمه UID 1000. انتقل إليه في مرحلة التشغيل، بعد كل ما يحتاج إلى root:

```dockerfile title=Dockerfile
# …build and deps stages from the previous lesson

FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

لاحظ ما *ليس* موجودًا: لا `--chown=node:node` على عمليات النسخ. تبقى الملفات مملوكة لـ root وقابلة للقراءة من الجميع، فيستطيع التطبيق قراءة كوده لكنه لا يستطيع تغييره. إذا وجد مهاجم ثغرة تنفيذ كود عن بُعد، فلن يستطيع إعادة كتابة `dist/server.js` ليبقى داخل النظام. امنح التطبيق صلاحية الكتابة فقط حيث يحتاج إليها حقًا، وفضّل `/tmp` أو volume مُركّبًا لذلك.

:::mistake إصلاح خطأ صلاحيات بـ USER root
يحتاج التطبيق إلى كتابة ملف مؤقت، فيحصل على `EACCES`، فيضيف أحدهم `USER root` في نهاية الـ Dockerfile «مؤقتًا». يُشحن هكذا، ويبقى. أصلح الحاجة الفعلية بدلًا من ذلك: أنشئ المجلد الوحيد الذي يكتب فيه التطبيق وسلّمه لمستخدم التطبيق، أو وجّه التطبيق إلى `/tmp`.

```dockerfile
RUN mkdir -p /app/tmp && chown node:node /app/tmp
USER node
```
:::

## نسخة distroless

هذه مرحلة التشغيل نفسها على distroless. الـ tag ‏`:nonroot` يعمل بـ UID 65532 دون أي إعداد إضافي، ونقطة الدخول في الـ image هي `node` أصلًا، لذا لا تذكر `CMD` إلا السكربت:

```dockerfile title=Dockerfile
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["dist/server.js"]
```

ما زالت مرحلتا build وdeps تستخدمان `node:24-slim`؛ وحدها المرحلة المشحونة تتغيّر. أبقِ الإصدار الرئيسي لـ Node متطابقًا عبر المراحل؛ وإلا فإن الوحدات الأصلية (native modules) المترجَمة وفق الـ ABI الخاص بإصدار معيّن من Node ستُحمَّل في إصدار آخر وتفشل عند بدء التشغيل.

تستطيع التأكّد من المستخدم الذي سيعمل به الـ container دون تشغيله:

```bash
docker image inspect notes-api:1.0.0 --format '{{.Config.User}}'
```

## أحكِم الإغلاق وقت التشغيل

الـ image تضبط القيم الافتراضية؛ والـ runtime يستطيع تشديدها أكثر:

```bash
docker run --rm -p 8080:3000 \
  --read-only --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  notes-api:1.0.0
```

الخيار `--read-only` يجعل نظام الملفات الجذري للـ container غير قابل للتعديل، ولا يبقى قابلًا للكتابة إلا `/tmp` بوصفه mount صغيرًا في الذاكرة. والخيار `--cap-drop ALL` يزيل صلاحيات Linux ‏(capabilities) التي تحتاج إليها العمليات المميّزة الخاصة بالـ root. و`no-new-privileges` يمنع العملية من اكتساب صلاحيات عبر ملفات setuid التنفيذية. في القسم الخامس ستضبط الأشياء نفسها في `securityContext` ضمن Kubernetes، حيث تصبح سياسة لكل Pod.

:::tip المنافذ تحت 1024
أبقِ التطبيقات على منافذ عالية مثل 3000 أو 8080 داخل الـ container. ما زلت تستطيع نشرها على 80 أو 443 عند الحافة؛ لأن الربط يحدث خارج العملية، فلا يحتاج التطبيق أبدًا إلى صلاحيات من أجله.
:::

الـ image لديك الآن صغيرة وبلا صلاحيات. التالي: كيف تسمّيها بحيث يكون ما تنشره هو بالضبط ما اختبرته.
