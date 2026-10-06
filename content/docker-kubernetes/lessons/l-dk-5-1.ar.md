---
summary: أضف إلى notes-api فحوص startup وreadiness وliveness تخبر Kubernetes بالحقيقة، وأوقف الـ Pods دون إسقاط الطلبات باستخدام توقّف preStop ومعالج SIGTERM.
takeaways:
  - فشل الـ readiness probe يزيل الـ Pod من endpoints الـ Service؛ وفشل الـ liveness probe يعيد تشغيل الـ container؛ والـ startup probe يؤجّل الاثنين حتى يكتمل بدء التطبيق.
  - الـ liveness يفحص فقط هل العملية نفسها عالقة؛ لا تجعله أبدًا يعتمد على قاعدة بيانات أو خدمة أخرى.
  - الـ readiness بوّابة للتحديثات المتدرّجة، فالإصدار الجديد العاجز عن الخدمة لا يحلّ أبدًا محلّ إصدار يعمل.
  - عند الحذف، تحدث إزالة الـ endpoints وإرسال SIGTERM في الوقت نفسه؛ وتوقّف `preStop` قصير يتيح للحركة أن تنصرف عن الـ Pod قبل أن يبدأ التطبيق بالإيقاف.
  - يجب أن ينهي التطبيق العمل الجاري خلال `terminationGracePeriodSeconds` ‏(30 افتراضيًا)، وإلا فسيُقتل.
further:
  - title: Liveness, Readiness, and Startup Probes
    url: https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/
  - title: Configure Liveness, Readiness and Startup Probes
    url: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
  - title: Pod Lifecycle (termination of Pods)
    url: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination
quiz:
  - q: يبدأ الـ readiness probe لـ notes-api بالفشل على أحد الـ Pods لأنه لا يصل إلى Postgres. ماذا يفعل Kubernetes؟
    options:
      - text: يعيد تشغيل الـ container حتى ينجح الفحص.
        why: إعادات التشغيل تأتي من إخفاقات الـ liveness. الـ readiness يؤثّر في الحركة فقط.
      - text: يحذف الـ Pod ويُجدوِل واحدًا جديدًا على node آخر.
        why: الـ probes لا تحذف الـ Pods أبدًا. يبقى الـ Pod في مكانه.
      - text: لا شيء حتى يفشل الـ liveness probe أيضًا.
        why: الـ readiness يتصرّف وحده، باستقلال عن الـ liveness.
      - text: يزيل الـ Pod من endpoints الـ Service، فلا يحصل على حركة جديدة حتى ينجح الفحص مجددًا.
        why: صحيح. يستمر الـ Pod في العمل ويعود إلى التناوب حالما يصبح جاهزًا، دون إعادة تشغيل.
    answer: 3
  - q: الـ liveness probe لديك يستدعي `/readyz`، الذي يفحص قاعدة البيانات. يُعاد تشغيل Postgres لمدة 20 ثانية. ماذا يحدث؟
    options:
      - text: تفشل كل containers ‏notes-api في فحص الـ liveness وتُعاد تشغيلها دفعة واحدة، فيتحوّل عطل عابر في قاعدة البيانات إلى انقطاع كامل.
        why: صحيح. يجب أن يسأل الـ liveness فقط «هل هذه العملية عالقة؟». فحوص الاعتماديات مكانها الـ readiness.
      - text: تُعلَّم الـ Pods بأنها غير جاهزة وتتعافى حين يعود Postgres.
        why: هذا صحيح لو كان readiness probe. أما إخفاقات الـ liveness فتسبّب إعادات تشغيل.
      - text: يكتشف Kubernetes إعادة تشغيل قاعدة البيانات ويوقف الـ probes مؤقتًا.
        why: لا يعرف Kubernetes شيئًا عن اعتماديات تطبيقك؛ إنه يشغّل الـ probe كما ضُبط.
      - text: يُعاد تشغيل Pod واحد فقط، لأن إخفاقات الـ liveness محدودة المعدّل.
        why: لا يوجد حدّ معدّل كهذا على مستوى الـ cluster. الـ probe في كل Pod يفشل باستقلال، وكلها في الوقت نفسه.
    answer: 0
  - q: يستغرق notes-api حتى 60 ثانية ليبدأ على قاعدة بيانات كبيرة لأنه يسخّن cache. أي إعداد للـ probes يتجنّب حلقة إعادة التشغيل دون إبطاء اكتشاف الأعطال لاحقًا؟
    options:
      - text: "‏`initialDelaySeconds: 60` على الـ liveness probe."
        why: يعمل، لكن كل بدء ينتظر الآن 60 ثانية قبل أن يعمل الـ liveness أصلًا، وينكسر مجددًا حين يستغرق البدء 65 ثانية.
      - text: احذف الـ liveness probe.
        why: عندها لن يُعاد تشغيل العملية العالقة في deadlock أبدًا.
      - text: 'startup probe مع `periodSeconds: 5` و`failureThreshold: 15`، فيحصل التطبيق على ما يصل إلى 75 ثانية للبدء قبل أن يتولّى الـ liveness.'
        why: صحيح. يُؤجَّل الـ liveness والـ readiness حتى ينجح الـ startup probe مرة واحدة؛ وبعدها يعمل الـ liveness بوتيرته العادية.
      - text: "‏`timeoutSeconds: 60` على الـ liveness probe."
        why: هذا يسمح لفحص واحد بالتعليق لمدة دقيقة، فيؤخّر اكتشاف حالات التعليق الحقيقية ولا يحلّ مشكلة البدء.
    answer: 2
  - q: خلال كل rollout تفشل بضعة طلبات إلى notes-api بـ `connection refused`، مع أن التطبيق يعالج SIGTERM. ما الحل المعتاد؟
    options:
      - text: ارفع `terminationGracePeriodSeconds` إلى 300.
        why: التطبيق يتوقّف أصلًا خلال مهلة السماح. الأخطاء تحدث في بداية الإنهاء، لا في نهايته.
      - text: أضف توقّف `preStop` لبضع ثوانٍ حتى تنتشر إزالة الـ endpoints قبل أن يتوقّف التطبيق عن قبول الاتصالات.
        why: صحيح. ‏SIGTERM وإزالة الـ endpoints يحدثان بالتوازي؛ والتوقّف القصير يتيح للـ proxies أن تتوقّف عن توجيه الحركة إلى الـ Pod أولًا.
      - text: 'اضبط `replicas: 1` أثناء الـ rollouts.'
        why: نسخ أقل تجعل أي اتصال ساقط أكثر إيلامًا، لا أقل.
      - text: عطّل الـ readiness probe أثناء الـ rollouts.
        why: الـ readiness هو ما يُبقي الـ Pods غير الجاهزة خارج التناوب؛ وتعطيله يجعل الـ rollouts أسوأ.
    answer: 1
---

لا يستطيع Kubernetes رؤية ما بداخل تطبيقك. إن تُرك وشأنه، يعدّ الـ container سليمًا ما دامت عمليته تعمل، حتى لو كانت تلك العملية عالقة في deadlock، أو ما زالت تسخّن، أو عاجزة عن الوصول إلى قاعدة البيانات. الـ probes (الفحوص) هي طريقة التطبيق لقول الحقيقة عن نفسه. لكن يجب صياغة هذه الحقيقة بعناية، لأن Kubernetes يتصرّف بناءً عليها تلقائيًا وعلى نطاق واسع.

## ثلاثة probes، وثلاث عواقب

| الـ Probe | السؤال الذي يجيب عنه | حين يفشل |
|---|---|---|
| **startup** | هل انتهى التطبيق من البدء؟ | واصل الانتظار حتى الحدّ، ثم أعِد التشغيل |
| **readiness** | هل يجب أن يستقبل هذا الـ Pod حركة الآن؟ | أزِل الـ Pod من endpoints الـ Service؛ دون إعادة تشغيل |
| **liveness** | هل العملية عالقة بلا أمل في التعافي؟ | أعِد تشغيل الـ container |

ما دام startup probe مضبوطًا ولم ينجح بعد، لا يعمل الاثنان الآخران. وحالما ينجح، لا يعمل مرة أخرى أبدًا لذلك الـ container.

لدى notes-api أصلًا المساران (endpoints) اللذان يحتاج إليهما هذا. ‏`/healthz` يُرجع `ok` إذا كانت حلقة الأحداث (event loop) تستطيع الإجابة عن طلب أصلًا. و`/readyz` يفحص أيضًا مجمّع اتصالات قاعدة البيانات ويُرجع 503 إذا تعذّر الوصول إلى Postgres.

```yaml title=k8s/deployment.yaml
        - name: api
          image: ghcr.io/skylane/notes-api:1.4.0
          ports:
            - name: http
              containerPort: 3000
          startupProbe:
            httpGet:
              path: /healthz
              port: http
            periodSeconds: 2
            failureThreshold: 30      # up to 60 s to start
          readinessProbe:
            httpGet:
              path: /readyz
              port: http
            periodSeconds: 5
            failureThreshold: 2
          livenessProbe:
            httpGet:
              path: /healthz
              port: http
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
```

أي حالة HTTP من 200 إلى 399 تُعدّ نجاحًا. وإلى جانب `httpGet` توجد probes من نوع `tcpSocket` و`grpc` و`exec`؛ فضّل HTTP لخدمات الويب، لأنه يختبر المسار الذي تسلكه الحركة الحقيقية. القيم الافتراضية، إن تركت الحقول، هي `periodSeconds: 10` و`timeoutSeconds: 1` و`failureThreshold: 3`. مهلة الثانية الواحدة تفاجئ التطبيقات البطيئة، فاضبطها عن قصد.

## الـ Readiness مفتاح للحركة

الـ readiness هو الـ probe الأهمّ في العمل اليومي. الـ Pod الذي يبدأ، أو المُثقل، أو المقطوع عن قاعدة بياناته يُبلغ بأنه غير جاهز ويخرج من endpoints الـ Service حتى يتعافى. وهو أيضًا **بوّابة للـ rollouts**: لا يُحسب الـ Pod الجديد متاحًا إلا حين يصبح جاهزًا، ولا يزيل التحديث المتدرّج الـ Pods القديمة إلا بقدر ما تصبح الجديدة متاحة. الإصدار الذي لا يصل إلى قاعدة البيانات لا يأخذ الحركة أبدًا من إصدار يصل إليها. لهذا فإن الـ Deployment الذي لا readiness probe فيه هو أول ما أنبّه عليه في كل مراجعة.

:::mistake ‏liveness probe يفحص الاعتماديات
توجيه الـ liveness إلى `/readyz` يبدو دقيقًا وشاملًا. ثم يُعاد تشغيل Postgres لمدة 20 ثانية، فتفشل كل containers ‏notes-api في الـ liveness في اللحظة نفسها، ويعيد Kubernetes تشغيلها كلها. وحين تعود، تعيد الاتصال كلها دفعة واحدة. صار عطل عابر في قاعدة البيانات مدّته 20 ثانية انقطاعًا مدّته خمس دقائق. الـ liveness يسأل سؤالًا ضيّقًا واحدًا: هل هذه العملية عالقة؟ وكل ما يخصّ الأنظمة الأخرى مكانه الـ readiness.
:::

## البدء دون حلقات إعادة تشغيل

قبل وجود الـ startup probes، كانت التطبيقات بطيئة البدء تُحمى بـ `initialDelaySeconds` على الـ liveness. هذا يؤخّر الفحص الأول في *كل* بدء بمقدار أسوأ زمن بدء، وينكسر مجددًا حين يصبح البدء أبطأ. أما الـ startup probe فيعطي التطبيق `periodSeconds × failureThreshold` (هنا 2 × 30 = 60 ثانية) لينهض، مع فحص متكرّر حتى يُكتشف البدء السريع بسرعة، ثم يسلّم الأمر إلى الـ liveness بوتيرته العادية.

## الإيقاف دون إسقاط الطلبات

حين يُحذف Pod، أثناء rollout أو تقليص للنسخ أو تفريغ لـ node، يبدأ شيئان **في الوقت نفسه**: يُزال الـ Pod من endpoints الـ Service، ويبدأ الـ kubelet في إنهاء الـ container. إزالة الـ endpoints يجب أن تنتشر إلى قواعد الشبكة في كل node وإلى أي موازن أحمال، وهذا يستغرق لحظة. إذا توقّف تطبيقك عن قبول الاتصالات لحظة وصول SIGTERM، فالطلبات الموجّهة إليه في تلك اللحظة تُرفض.

:::figure إزالة الـ endpoints والإنهاء يبدآن معًا؛ وتوقّف preStop يغطّي الفجوة
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">عند حذف الـ Pod، تنتشر إزالة الـ endpoints خلال بضع ثوانٍ بينما يعمل توقّف preStop. ثم تُرسل SIGTERM فيفرّغ التطبيق الطلبات الجارية ويخرج، وكل ذلك خلال مهلة السماح البالغة 30 ثانية، وبعدها كانت ستُرسل SIGKILL.</title>
  <path class="d-line" d="M40 40 L40 210"/>
  <text class="d-label-strong" x="46" y="30">حذف الـ Pod</text>
  <rect class="d-box-warn" x="40" y="60" width="200" height="40" rx="6"/>
  <text class="d-label" x="140" y="85" text-anchor="middle">إزالة الـ endpoints</text>
  <rect class="d-box-accent" x="40" y="120" width="160" height="40" rx="6"/>
  <text class="d-label" x="120" y="145" text-anchor="middle">preStop sleep 5s</text>
  <path class="d-arrow" d="M200 140 L236 140" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="240" y="120" width="230" height="40" rx="6"/>
  <text class="d-label" x="355" y="145" text-anchor="middle">SIGTERM: تفريغ، ثم exit 0</text>
  <path class="d-line d-dashed" d="M40 190 L650 190"/>
  <path class="d-line" d="M650 110 L650 200"/>
  <text class="d-label-muted" x="345" y="215" text-anchor="middle">terminationGracePeriodSeconds: 30</text>
  <text class="d-label-strong" x="650" y="100" text-anchor="middle">SIGKILL</text>
</svg>
:::

للحل نصفان. في مواصفات الـ Pod، توقّف قبل SIGTERM حتى يلحق التوجيه بالتغيير:

```yaml title=k8s/deployment.yaml
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          lifecycle:
            preStop:
              sleep:
                seconds: 5
```

الإجراء `sleep` يعمل داخل الـ kubelet، فيعمل حتى في image من نوع distroless لا تحتوي على ملف `sleep` التنفيذي. وفي التطبيق، أبقِ معالج SIGTERM من الدرس 1.4: توقّف عن قبول اتصالات جديدة، وأنهِ الطلبات الجارية، وأغلق مجمّع اتصالات قاعدة البيانات، ثم اخرج. يجب أن يتّسع توقّف preStop والتفريغ معًا داخل `terminationGracePeriodSeconds`، وإلا فسيرسل الـ kubelet إشارة SIGKILL عند انتهاء المهلة.

:::tip اختبره ولا تكتفِ بالثقة
شغّل مولّد حمل على الـ Service، وأطلِق `kubectl rollout restart deployment/notes-api`. عُدّ الأخطاء. الوصول إلى صفر أخطاء ممكن، وحالما تراه ستلاحظ فورًا حين يكسره تغيير ما.
:::

يعرف Kubernetes الآن متى يكون notes-api سليمًا وكيف يوقفه بأمان. التالي: يحتاج إلى معرفة كم يستهلك notes-api من المعالج والذاكرة، وكيف يضيف Pods حين تنمو الحركة.
