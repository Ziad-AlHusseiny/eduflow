---
summary: اكتب Dockerfile يعمل لـ notes-api، وابنِه إلى image لها tag، وشغّله مع منفذ منشور، واعرف وظيفة كل تعليمة فيه.
takeaways:
  - الـ Dockerfile وصفة من التعليمات؛ وكل `FROM` و`COPY` و`RUN` تنتج layer من نظام الملفات داخل الـ image.
  - الـ build context هو المجلد الذي تمرّره إلى `docker build`، و`COPY` لا ترى إلا الملفات الموجودة داخله.
  - "التعليمة `EXPOSE` توثّق المنفذ فقط؛ أما الخيار `-p host:container` في `docker run` فهو ما يجعله قابلًا للوصول."
  - اكتب `CMD` بصيغة exec ‏(`["node", "dist/server.js"]`) حتى يكون تطبيقك هو PID 1 ويستقبل إشارات الإيقاف.
  - الخادم داخل الـ container يجب أن يستمع على `0.0.0.0` لا على `127.0.0.1`، وإلا فلن تصل إليه المنافذ المنشورة.
further:
  - title: Dockerfile reference
    url: https://docs.docker.com/reference/dockerfile/
  - title: Writing a Dockerfile
    url: https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/
  - title: Build checks
    url: https://docs.docker.com/build/checks/
quiz:
  - q: تشغّل `docker build -t notes-api:dev .` من جذر المستودع. ماذا تعني النقطة `.` في النهاية؟
    options:
      - text: سمِّ الـ image بـ tag يحمل اسم المجلد الحالي.
        why: الـ tag يأتي من `-t`. أما المعامل الأخير فيخصّ الملفات، لا الأسماء.
      - text: استخدم المجلد الحالي كـ build context، أي مجموعة الملفات التي تستطيع `COPY` قراءتها.
        why: صحيح. يرسل Docker هذا المجلد إلى أداة البناء؛ ومسارات `COPY` نسبية إليه، ولا شيء خارجه مرئي.
      - text: اكتب الـ image النهائية داخل المجلد الحالي.
        why: تُحفظ الـ images في مخزن Docker المحلي، لا في مجلد عملك. والأمر `docker image ls` يعرضها.
      - text: ابحث عن الـ Dockerfile في المجلد الحالي، لكن خذ الملفات من `/`.
        why: الـ context وموقع الـ Dockerfile شيئان منفصلان (`-f` يحدّد الـ Dockerfile)، لكن `COPY` لا تقرأ أبدًا من `/` على المضيف.
    answer: 1
  - q: في الـ Dockerfile السطر `EXPOSE 3000`. تشغّل `docker run notes-api:dev` ثم يفشل `curl localhost:3000` على جهازك. لماذا؟
    options:
      - text: "التعليمة `EXPOSE` تحتاج إلى اللاحقة `tcp` حتى تعمل."
        why: "البروتوكول `tcp` هو الافتراضي أصلًا. إضافته لا تغيّر شيئًا في إمكانية الوصول."
      - text: الـ container يحتاج إلى إعادة تشغيل قبل أن تُفتح المنافذ المعلنة.
        why: إعادة التشغيل لا تنشر شيئًا. المنافذ تُنشر لحظة إنشاء الـ container.
      - text: المنفذ 3000 محجوز من Docker على المضيف.
        why: لا يحجز Docker منفذًا كهذا. المشكلة أنه لم يُنشر أي منفذ.
      - text: "التعليمة `EXPOSE` مجرد توثيق؛ ما زلت تحتاج إلى `-p 3000:3000` لنشر المنفذ على المضيف."
        why: صحيح. الخيار `-p host:container` هو الذي ينشئ ربط المنافذ الفعلي. أما `EXPOSE` فتخبر القرّاء والأدوات بالمنفذ الذي يستخدمه التطبيق.
    answer: 3
  - q: أي `CMD` تسمح لعملية Node.js باستقبال `SIGTERM` مباشرة عند إيقاف الـ container؟
    options:
      - text: '`CMD ["node", "dist/server.js"]`'
        why: صحيح. صيغة exec تشغّل `node` كـ PID 1 دون shell في المنتصف، فتصل الإشارات مباشرة إلى تطبيقك.
      - text: "`CMD node dist/server.js`"
        why: صيغة shell تغلّف الأمر بـ `/bin/sh -c`، والـ shell لا يمرّر الإشارات. ولهذا السبب تنبّه عليها build checks في Docker.
      - text: '`CMD ["sh", "-c", "node dist/server.js"]`'
        why: هذه صيغة exec، لكن البرنامج الذي تشغّله هو shell، فتعود إلى shell يقف بين Docker وNode.
      - text: "`CMD npm start`"
        why: صيغة shell مع npm تضع عمليتين بين الإشارة وخادمك. شغّل `node` مباشرة.
    answer: 0
  - q: يكتب notes-api في سجلّه `listening on 127.0.0.1:3000` داخل الـ container. نشرت المنفذ بـ `-p 3000:3000`، لكن كل طلب يحصل على `connection reset`. ما الحل؟
    options:
      - text: انشر المنفذ بالصيغة `-p 127.0.0.1:3000:3000`.
        why: هذا يقيّد عنوان المضيف الذي يقبل الاتصالات فقط؛ والتطبيق في الداخل ما زال يستمع على الـ loopback الخاص بالـ container، الذي لا يصل إليه ربط المنافذ.
      - text: أضف `EXPOSE 3000/tcp` إلى الـ Dockerfile.
        why: "التعليمة `EXPOSE` لا تغيّر العنوان الذي يستمع عليه التطبيق."
      - text: اجعل التطبيق يستمع على `0.0.0.0` حتى يقبل الاتصالات من واجهة الشبكة الخاصة بالـ container.
        why: صحيح. الحركة المنشورة تصل إلى واجهة الشبكة الخاصة بالـ container، لا إلى الـ loopback. الاستماع على كل الواجهات يحلّ المشكلة.
      - text: شغّل الـ container بالخيار `--network host` بشكل دائم.
        why: هذا يلتفّ على العَرَض بالتخلّي عن عزل الشبكة. أصلح عنوان الاستماع بدلًا من ذلك.
    answer: 2
---

تستطيع أن تصف بيئة تشغيل notes-api في جملة واحدة: «Node.js 24، وكودنا المترجَم، واعتمادياتنا، والتشغيل بالأمر `node dist/server.js` على المنفذ 3000». الـ Dockerfile هو هذه الجملة مكتوبة بطريقة تسمح لآلة بتكرارها حرفيًا، على أي جهاز أو خادم بناء، وإلى الأبد.

## التطبيق الذي تغلّفه

المستودع يبدو هكذا:

```text
notes-api/
  package.json
  package-lock.json
  tsconfig.json
  src/
    server.ts
    db.ts
```

الأمر `npm run build` يترجم `src/` إلى `dist/` باستخدام `tsc`، والأمر `npm start` يشغّل `node dist/server.js`. هذا هو الجزء من الخادم الذي يهمّنا في سياق الـ containers:

```ts title=src/server.ts
import express from 'express';
import { pool } from './db.js';

const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => res.send('ok'));
app.get('/readyz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send('ready');
  } catch {
    res.status(503).send('database unreachable');
  }
});
// …notes routes

const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => console.log(`notes-api listening on ${port}`));
```

لاحظ `'0.0.0.0'`، واحفظها في ذهنك؛ سنعود إليها.

## أول Dockerfile

أنشئ ملفًا باسم `Dockerfile` (بحرف D كبير، ودون امتداد) في جذر المستودع:

```dockerfile title=Dockerfile
# syntax=docker/dockerfile:1
FROM node:24-slim
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

سطرًا بسطر:

- `# syntax=docker/dockerfile:1` يثبّت الـ frontend الخاص بالـ Dockerfile على أحدث إصدار من 1.x، فتحصل على الميزات الحديثة مثل أسرار البناء والـ cache mounts.
- `FROM node:24-slim` يبدأ من الـ image الرسمية لـ Node.js 24 فوق أساس Debian مقلّص. كل image تبدأ من image أخرى.
- `WORKDIR /app` ينشئ `/app` إن لزم، ويجعله مجلد العمل لكل تعليمة بعده، وللـ container أثناء التشغيل أيضًا.
- `COPY . .` ينسخ الـ build context إلى `/app`.
- `RUN npm ci` يثبّت بالضبط ما يقوله `package-lock.json`. استخدم `ci` لا `install` داخل الـ images: فهو يفشل إذا تعارض الـ lockfile مع `package.json` بدلًا من أن يعيد كتابة الـ lockfile بصمت.
- `RUN npm run build` يترجم TypeScript إلى `dist/`.
- `EXPOSE 3000` يسجّل أن التطبيق يستمع على المنفذ 3000، لكنه لا ينشر شيئًا.
- `CMD` هو الأمر الافتراضي حين يبدأ الـ container.

لماذا `node:24-slim`؟ لأن Node.js 24 خط دعم طويل الأمد تصله إصلاحات أمنية حتى 2028، والـ image الرسمية يُعاد بناؤها كلما أصدر Node أو Debian تصحيحًا. نسخة `-slim` تستبعد المترجِمات وصفحات الـ man وعشرات الحزم التي تضمّها الـ image الكاملة `node:24` لبناء الوحدات الأصلية (native modules). لا تحتاج إليها لتشغيل JavaScript، وكل حزمة لا تشحنها هي حزمة لن يشتكي منها ماسح الثغرات. وإن احتاجت إحدى الاعتماديات يومًا إلى ترجمة كود أصلي، فستتعامل مع ذلك في build stage منفصلة في القسم القادم.

هذا الملف يعمل، لكن فيه مشكلة أداء ستصلحها في الدرس التالي. شغّله أولًا.

## البناء والتشغيل

```bash
docker build -t notes-api:dev .
docker run --rm -p 3000:3000 notes-api:dev
```

الخيار `-t notes-api:dev` يسمّي الـ image ‏(`repository:tag`). والنقطة `.` في النهاية هي الـ **build context** (سياق البناء): المجلد الذي يسلّمه Docker إلى أداة البناء. لا تستطيع `COPY` قراءة إلا الملفات الموجودة داخله، ولهذا يفشل `COPY ../shared .`.

الأمر `docker run` ينشئ container من الـ image. الخيار `--rm` يحذفه عند توقّفه، فلا تتراكم لديك containers ميتة. والخيار `-p 3000:3000` يربط المنفذ 3000 على جهازك بالمنفذ 3000 داخل الـ container. في terminal آخر:

```bash
curl localhost:3000/healthz
```

تحصل على `ok`. أما `/readyz` فيُرجع 503 لأنه لا توجد قاعدة بيانات بعد؛ وسيحلّ Compose ذلك في القسم الثالث.

## صيغة exec، ولماذا تهمّ

للتعليمة `CMD` صيغتان. صيغة exec، ‏`CMD ["node", "dist/server.js"]`، تشغّل `node` مباشرة كـ PID 1. وصيغة shell، ‏`CMD node dist/server.js`، تشغّل `/bin/sh -c "node dist/server.js"`، ومرجع الـ Dockerfile يحذّر من أن الأمر المُشغَّل بهذه الطريقة لن يستقبل إشارات Unix. حين يطلب Docker أو Kubernetes من تطبيقك أن يتوقّف، يرسل `SIGTERM` إلى PID 1. فإذا كان PID 1 هو shell لا يمرّر الإشارة، فلن يسمعها تطبيقك أبدًا، وسيُقتل قسرًا بعد انتهاء المهلة، ويُسقط الطلبات التي كان يخدمها.

و`CMD npm start` هي المشكلة نفسها مع عملية إضافية في السلسلة. شغّل `node` مباشرة.

:::tip دع أداة البناء تراجع عملك
شغّل `docker build --check .` لتقييم الـ Dockerfile وفق build checks الخاصة بـ Docker دون بناء فعلي. ستنبّهك إلى `CMD` المكتوبة بصيغة shell تحت الاسم `JSONArgsRecommended`، وإلى أسماء الـ stages غير المتطابقة، وصيغة `KEY value` القديمة لمتغيّرات البيئة، وغير ذلك. يستغرق الأمر ثانية واحدة؛ أضفه إلى الـ CI.
:::

:::mistake الاستماع على localhost داخل الـ container
كثير من خوادم التطوير تستمع افتراضيًا على `127.0.0.1`. داخل الـ container هذا هو الـ loopback الخاص بالـ container نفسه، بينما تصل المنافذ المنشورة إلى واجهة الشبكة. والعَرَض يثير الجنون: المنفذ مربوط، والتطبيق يكتب «listening»، ومع ذلك يحصل كل طلب على `connection reset`. اجعل التطبيق يستمع على `0.0.0.0`.
:::

## انظر إلى ما بنيته

```bash
docker image ls notes-api
docker image inspect notes-api:dev --format '{{.Config.Cmd}} {{.Config.ExposedPorts}}'
```

الـ `CMD` قيمة افتراضية فقط. أي شيء تكتبه بعد اسم الـ image يحلّ محلّها، وهذا مفيد للفحوص السريعة:

```bash
docker run --rm notes-api:dev node --version
docker run --rm notes-api:dev ls dist
```

هناك أيضًا `ENTRYPOINT`، التي تثبّت الملف التنفيذي وتعامل `CMD` كمعاملاته الافتراضية. بعض الـ images تستخدمها (ستقابل في القسم القادم image نقطة دخولها هي `node` نفسه). أما في images تطبيقاتك أنت، فتعليمة `CMD` عادية بصيغة exec هي أبسط حلّ يؤدّي الغرض، وتُبقي استبدالها سهلًا كما في الأمثلة أعلاه.

حجم الـ image بضع مئات من الميغابايتات: Node.js، وأساس Debian، واعتماديات التطوير (بما فيها TypeScript)، والكود المصدري. القسم الثاني سيقلّص ذلك. لكن قبل هذا، كل تغيير في `server.ts` يعيد حاليًا تثبيت كل الاعتماديات، وهذا موضوع الدرس التالي.
