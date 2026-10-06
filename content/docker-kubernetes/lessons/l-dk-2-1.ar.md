---
summary: قسّم الـ Dockerfile الخاص بـ notes-api إلى مراحل للبناء والاعتماديات والتشغيل، حتى لا تحتوي الـ image المشحونة إلا على الكود المترجَم واعتماديات الإنتاج، وأبعِد الملفات غير الضرورية عن الـ build context بملف .dockerignore.
takeaways:
  - الـ multi-stage build يستخدم عدّة مراحل `FROM`؛ ولا يتحوّل إلى image إلا المرحلة الأخيرة (أو المرحلة التي تحدّدها بـ `--target`).
  - "التعليمة `COPY --from=<stage>` تسحب ملفات محدّدة من مرحلة سابقة، فلا تصل المترجِمات واعتماديات التطوير إلى الإنتاج أبدًا."
  - ثبّت اعتماديات الإنتاج بـ `npm ci --omit=dev` في مرحلة خاصة بها، وانسخ `node_modules` و`dist` فقط إلى مرحلة التشغيل.
  - ملف `.dockerignore` يُبقي `node_modules` و`.git` وملفات `.env` ومخرجات البناء خارج الـ context، فيصير البناء أسرع وأكثر أمانًا.
further:
  - title: Multi-stage builds
    url: https://docs.docker.com/build/building/multi-stage/
  - title: Build context and .dockerignore
    url: https://docs.docker.com/build/concepts/context/
  - title: "Dockerfile reference: COPY --from"
    url: https://docs.docker.com/reference/dockerfile/#copy---from
quiz:
  - q: في Dockerfile مراحله `build` و`deps` و`runtime` (بهذا الترتيب)، ماذا ينتج الأمر `docker build -t notes-api:1.0.0 .`؟
    options:
      - text: ثلاث images، واحدة لكل مرحلة، وكلها تحمل الـ tag ‏`notes-api:1.0.0`.
        why: البناء الواحد ينتج image واحدة. المراحل السابقة وسيطة ولا توجد إلا في الـ build cache.
      - text: image مبنية من المرحلة الأخيرة `runtime`، ولا تحتوي إلا على ما نسخته تلك المرحلة إليها.
        why: صحيح. المرحلة الأخيرة هي الهدف الافتراضي. وكل ما لم يُنسخ إليها يبقى خلفها.
      - text: image مبنية من المرحلة الأولى، لأن البناء يحدث فيها.
        why: المرحلة الأولى هي الافتراضية فقط حين تكون الوحيدة. مع عدّة مراحل تفوز الأخيرة ما لم تمرّر `--target`.
      - text: image واحدة تحتوي على layers المراحل الثلاث مكدّسة معًا.
        why: المراحل لا تتكدّس. كل `FROM` تبدأ نظام ملفات جديدًا؛ ولا ينقل الملفات بينها إلا `COPY --from` صريحة.
    answer: 1
  - q: لماذا نثبّت اعتماديات الإنتاج في مرحلة `deps` منفصلة بدلًا من تقليمها في مرحلة `build`؟
    options:
      - text: "لأن `npm ci --omit=dev` لا يعمل إلا في مرحلة اسمها `deps`."
        why: أسماء المراحل مجرد تسميات اعتباطية. الخيار يعمل في أي مرحلة.
      - text: لأن المراحل المنفصلة دائمًا أصغر من مرحلة واحدة.
        why: عدد المراحل وحده لا يغيّر الحجم. المهمّ هو ما تنسخه إلى المرحلة الأخيرة.
      - text: لأن مراحل البناء لا تستطيع تشغيل npm scripts.
        why: أي مرحلة تستطيع تشغيل أي أمر؛ ومرحلة البناء نفسها تشغّل `npm run build`.
      - text: لأن مرحلة البناء تحتاج إلى اعتماديات التطوير مثل TypeScript، بينما لا يحتاج التشغيل إلا إلى اعتماديات الإنتاج؛ والتثبيت النظيف بـ `--omit=dev` يعطي هذه المجموعة بالضبط.
        why: صحيح. كما أن هذه المرحلة تُخزَّن في الـ cache مستقلةً، فتغيير اعتمادية خاصة بالتطوير لا يُبطل تثبيت الإنتاج.
    answer: 3
  - q: حجم الـ build context لديك 1.2 غيغابايت، وكل بناء يبدأ بعبارة "transferring context" لمدة 40 ثانية. ما الحل الأرجح؟
    options:
      - text: أضف ملف `.dockerignore` يستبعد `node_modules` و`.git` ومخرجات البناء.
        why: صحيح. هذه المجلدات تشكّل عادةً معظم الـ context، ولا ينبغي إرسال أي منها إلى أداة البناء.
      - text: استخدم `COPY src ./src` بدلًا من `COPY . .`.
        why: النسخ الأضيق يفيد الـ cache ومحتوى الـ image، لكن الـ context كاملًا ما زال يُرسل ما لم تتجاهل الملفات.
      - text: انقل الـ Dockerfile إلى مجلد فرعي.
        why: الـ context هو المجلد الذي تمرّره أيًّا كان، بغضّ النظر عن مكان الـ Dockerfile.
      - text: أضف `--no-cache` لتخطّي نقل الـ context.
        why: "الخيار `--no-cache` يعطّل إعادة استخدام الـ layers. والـ context ما زال يُنقل."
    answer: 0
  - q: كيف تشغّل اختبارات الوحدات لـ notes-api داخل بيئة بناء الـ image دون أن تشحن أدوات الاختبار؟
    options:
      - text: أضف `RUN npm test` إلى مرحلة التشغيل.
        why: مرحلة التشغيل لا تحتوي على اعتماديات التطوير، فلن يكون مشغّل الاختبارات موجودًا؛ وأنت تريد إبقاء الاختبارات خارج الـ image المشحونة على أي حال.
      - text: انسخ ملفات الاختبار إلى مرحلة التشغيل وشغّلها بـ `docker exec`.
        why: هذا يشحن الاختبارات وأدواتها إلى الإنتاج، وهو بالضبط ما تتجنّبه الـ multi-stage builds.
      - text: ابنِ مرحلة `build` وحدها بـ `--target build` وشغّل الاختبارات في container منها.
        why: صحيح. ‏`--target` يتوقّف عند المرحلة المسمّاة، التي تحتوي على اعتماديات التطوير والكود المصدري، ولا يتسرّب منها شيء إلى image التشغيل.
      - text: استخدم Dockerfile ثانيًا ينسخ image التشغيل.
        why: image التشغيل تفتقر عمدًا إلى اعتماديات التطوير، فلا يمكن تشغيل الاختبارات فيها.
    answer: 2
---

الـ image من القسم الأول تشحن إلى الإنتاج TypeScript، وتعريفات الأنواع، ومشغّل الاختبارات، ومجلد `src/`، وكل اعتمادية تطوير أخرى. لا شيء من هذا يعمل في الإنتاج. وكله سطح هجوم إضافي، ووقت سحب إضافي، وضجيج في تقارير الفحص. الحل أن تبني في مكان وتشحن من مكان آخر.

## Dockerfile واحد، ومراحل عدّة

كل `FROM` تبدأ **مرحلة** (stage) جديدة بنظام ملفات جديد. سمِّ المراحل بـ `AS`، وانسخ الملفات بينها بـ `COPY --from`. والمرحلة الأخيرة وحدها هي التي تصبح الـ image التي تضع عليها الـ tag.

```dockerfile title=Dockerfile
# syntax=docker/dockerfile:1

# 1. Compile TypeScript (needs dev dependencies)
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 2. Production dependencies only
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# 3. What actually ships
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

مرحلة `runtime` تحصل على ثلاثة أشياء بالضبط: `package.json`، و`node_modules` الخاص بالإنتاج، و`dist/` المترجَم. أما TypeScript و`src/` وذاكرة تنزيلات npm فتبقى في مراحل لا يشحنها أحد.

:::figure المراحل تُبنى بالتوازي، ومرحلة التشغيل تنسخ ما تحتاج إليه فقط
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">مرحلة build تترجم src إلى dist مع كل الاعتماديات. مرحلة deps تثبّت اعتماديات الإنتاج فقط. مرحلة runtime تنسخ dist من build وnode_modules من deps.</title>
  <rect class="d-box-accent" x="20" y="30" width="250" height="90" rx="10"/>
  <text class="d-label-strong" x="145" y="56" text-anchor="middle">build</text>
  <text class="d-code" x="145" y="80" text-anchor="middle">npm ci  (all deps)</text>
  <text class="d-code" x="145" y="102" text-anchor="middle">tsc: src → dist</text>
  <rect class="d-box-accent" x="20" y="150" width="250" height="80" rx="10"/>
  <text class="d-label-strong" x="145" y="178" text-anchor="middle">deps</text>
  <text class="d-code" x="145" y="204" text-anchor="middle">npm ci --omit=dev</text>
  <rect class="d-box-success" x="430" y="70" width="250" height="130" rx="10"/>
  <text class="d-label-strong" x="555" y="98" text-anchor="middle">runtime (تُشحن)</text>
  <text class="d-code" x="555" y="126" text-anchor="middle">package.json</text>
  <text class="d-code" x="555" y="150" text-anchor="middle">node_modules (prod)</text>
  <text class="d-code" x="555" y="174" text-anchor="middle">dist/</text>
  <path class="d-arrow" d="M270 80 L428 140" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="92" text-anchor="middle">dist/</text>
  <path class="d-arrow" d="M270 190 L428 160" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="200" text-anchor="middle">node_modules</text>
  <text class="d-label-muted" x="145" y="252" text-anchor="middle">يبقى خلفها: TypeScript وsrc/ وذاكرة تنزيلات npm</text>
</svg>
:::

يحسب BuildKit مخطّط الاعتماديات بين المراحل بنفسه. لا تعتمد `build` و`deps` إحداهما على الأخرى، فتعملان بالتوازي، وأي مرحلة لا يحتاج إليها الهدف تُتخطّى كليًا.

في notes-api قلّص هذا حجم الـ image بنحو الثلث، وفحص الثغرات الذي ستشغّله لاحقًا في هذا القسم انتقل من عشرات النتائج في أدوات التطوير إلى بضع نتائج فقط في بيئة التشغيل. الدرس التالي يقلّص الـ base image نفسها.

لماذا ننسخ `package.json` إلى مرحلة التشغيل أصلًا؟ لأن `package.json` في notes-api يحتوي على `"type": "module"`، الذي يطلب من Node أن يعامل ملفات `.js` على أنها ES modules. إن حذفته، فسيفشل الـ container عند البدء برسالة `SyntaxError: Cannot use import statement outside a module`، وهي تبدو خللًا في البناء لكنها في الحقيقة ملف مفقود. إذا كان مشروعك يستخدم CommonJS فيمكنك تخطّيه، لكنه لا يكلّف شيئًا ويُبقي البيانات الوصفية لـ `npm` متاحة.

قد ترى نمطًا مختلفًا: مرحلة واحدة تشغّل `npm ci`، ثم تبني، ثم تشغّل `npm prune --omit=dev` قبل نسخ `node_modules` إلى الخارج. هذا يعمل، ويوفّر عملية تثبيت واحدة. أنا أفضّل مرحلة `deps` المنفصلة لأنها تُخزَّن في الـ cache مستقلةً: ترقية أداة خاصة بالتطوير مثل الـ linter لا تُبطل layer اعتماديات الإنتاج، فيُعاد استخدام تلك الـ layer عبر عمليات بناء كثيرة، وتتغيّر image التشغيل بوتيرة أقل.

## استخدام المراحل الوسيطة عن قصد

المراحل أهداف مفيدة أيضًا. شغّل مجموعة الاختبارات في البيئة التي تحتوي على اعتماديات التطوير، دون لمس الـ image المشحونة:

```bash
docker build --target build -t notes-api:test .
docker run --rm notes-api:test npm test
```

الخيار `--target build` يتوقّف عند مرحلة `build`. يستطيع الـ CI تشغيل هذا قبل بناء image التشغيل، ويتشارك البناءان الـ cache نفسه.

:::mistake نسخ مرحلة البناء بأكملها
السطر `COPY --from=build /app ./` هو أكثر أخطاء الـ multi-stage شيوعًا في المراجعات التي أجريها. يبدو مرتّبًا، لكنه يشحن كل ما حاولت تركه خلفك: اعتماديات التطوير، و`src/`، وبيانات الاختبار، وأحيانًا ملف `.env`. انسخ مسارات مسمّاة، ولا تنسخ أبدًا مجلد العمل الكامل لمرحلة ما.
:::

## ملف ‎.dockerignore: تحكّم فيما تراه أداة البناء

حين تشغّل `docker build .`، يُرسل المجلد كاملًا إلى أداة البناء بوصفه الـ context، مطروحًا منه كل ما يطابق `.dockerignore`. من دونه، ينتقل إلى أداة البناء `node_modules` المحلي لديك (مئات الميغابايتات، وربما فيه وحدات أصلية (native modules) مترجَمة لـ macOS)، ومجلد `.git`، وأي ملف `.env` فيه بيانات اعتماد حقيقية. وأي `COPY . .` يضعها كلها في layer.

```text title=.dockerignore
node_modules
dist
coverage
.git
.env
.env.*
*.log
Dockerfile
compose*.yaml
```

ثلاثة مكاسب دفعة واحدة: يهبط الـ context من مئات الميغابايتات إلى بضع مئات من الكيلوبايتات، ولا تعود تعديلات الملفات المتجاهَلة تُبطل الـ cache، ولا يمكن نسخ الأسرار الموجودة في مجلد عملك إلى image بالخطأ.

:::why ملف ‎.env الذي صار عامًا
فريق عملت معه دفع image إلى registry عام، وقد بناها بـ `COPY . .` ودون `.dockerignore`. كان ملف `.env` لديهم يحتوي على كلمة مرور قاعدة بيانات الإنتاج. بقيت الـ image عامة نحو ست ساعات. وتطلّب تدوير بيانات الاعتماد يومًا كاملًا من العمل الحذر. ملف `.dockerignore` من عشرة أسطر كان سيمنع ذلك كله.
:::

الصيغة تشبه `.gitignore`: نمط واحد في كل سطر، والرمزان `*` و`**` للمطابقة، و`!` لإعادة تضمين شيء ما. أبقِه في جذر الـ build context. وإن احتجت رغم ذلك إلى ملف واحد من الملفات المتجاهَلة، فأعِد تضمينه تحت القاعدة العامة، مثلًا `.env.*` يليه `!.env.example`، حتى يمكن نسخ ملف القالب بينما لا يمكن نسخ الملفات الحقيقية.

عند الشك، افحص ما استلمته أداة البناء فعلًا: الأمر `docker build --progress=plain .` يطبع حجم الـ context المنقول في أسطره الأولى. إذا كان هذا الرقم بالميغابايتات لـ API صغير، فهناك شيء ناقص في `.dockerignore`.

في الدرس التالي ستستبدل الـ base image بأخرى أصغر، وتكفّ عن تشغيل التطبيق بالمستخدم root.
