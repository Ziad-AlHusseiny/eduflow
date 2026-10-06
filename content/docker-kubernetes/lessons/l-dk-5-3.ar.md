---
summary: اضبط التحديث المتدرّج لـ notes-api حتى لا تقلّل الإصدارات السعة أبدًا، وراقب rollout سيئًا وتراجع عنه بـ kubectl، وغلّف الـ manifests في Helm chart بقيم خاصة بكل بيئة.
takeaways:
  - التحديث المتدرّج يوسّع ReplicaSet جديدًا ويقلّص القديم، بوتيرة يضبطها `maxSurge` و`maxUnavailable`، ولا يتقدّم إلا بقدر ما تسمح به الـ readiness.
  - مع `maxUnavailable` على 0، يتوقّف الإصدار الذي لا تصبح الـ Pods الخاصة به جاهزة أبدًا دون ضرر، بينما يستمر الإصدار القديم في الخدمة.
  - "الأمر `kubectl rollout undo` يعود إلى الـ ReplicaSet السابق خلال ثوانٍ، لكن حدّث Git أيضًا وإلا فسيعيد الـ apply التالي نشر الإصدار السيئ."
  - التراجع عن الكود لا يتراجع عن قاعدة البيانات، لذا يجب أن تعمل تغييرات المخطّط مع الإصدارين القديم والجديد معًا.
  - ‏Helm يغلّف الـ manifests كقوالب مع قيم؛ والأمر `helm upgrade --install` ينشر، و`helm rollback` يعود إلى release revision سابقة.
further:
  - title: Deployments (rolling update and rollback)
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment
  - title: Performing a Rolling Update
    url: https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/
  - title: kubectl rollout
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/
quiz:
  - q: يعمل notes-api بـ 4 نسخ مع `maxSurge 1` و`maxUnavailable 0`. ‏Pods الإصدار 1.5.0 تنهار عند البدء. ماذا يلاحظ المستخدمون؟
    options:
      - text: لا شيء؛ يتوقّف الـ rollout مع Pod جديد واحد فاشل بينما تستمر الـ Pods القديمة الأربعة في الخدمة.
        why: صحيح. حين لا يُسمح بأي نقص في الإتاحة، لا يُزال Pod قديم إلا بعد أن يصبح Pod جديد جاهزًا، وهذا لا يحدث أبدًا.
      - text: انقطاع كامل، لأن الـ ReplicaSet القديم يُحذف أولًا.
        why: هذا وصف لاستراتيجية `Recreate`. التحديثات المتدرّجة تُبقي الـ ReplicaSet القديم حتى يصبح الجديد جاهزًا.
      - text: يفشل نحو ربع الطلبات حتى يتدخّل أحد.
        why: قد يحدث هذا مع `maxUnavailable` أكبر من صفر ودون readiness probe. أما هنا فالـ Pod الفاشل لا يستقبل أي حركة.
      - text: يتراجع Kubernetes تلقائيًا إلى 1.4.0 بعد انتهاء المهلة.
        why: يعلّم Kubernetes الـ rollout بأنه فاشل بعد `progressDeadlineSeconds`، لكنه لا يتراجع من تلقاء نفسه.
    answer: 0
  - q: شغّلت `kubectl rollout undo deployment/notes-api` أثناء حادث فتعافت الخدمة. ما الذي يجب أن يحدث بعد ذلك؟
    options:
      - text: لا شيء؛ التراجع دائم.
        why: الـ cluster أُصلح، لكن الـ manifest في Git ما زال يسمّي الـ image السيئة، والـ deploy التالي يعيدها.
      - text: احذف الـ ReplicaSet القديم حتى لا يُستخدم مجددًا.
        why: الـ ReplicaSets القديمة هي ما يجعل التراجع ممكنًا. احتفظ بها.
      - text: أعِد تشغيل كل الـ Pods لمسح الحالة المخزّنة.
        why: التراجع استبدل الـ Pods أصلًا.
      - text: غيّر الـ image في Git (أو اعكس الـ commit) حتى لا يعيد `kubectl apply` التالي نشر الإصدار المعطوب.
        why: صحيح. يجب أن يتّفق Git والـ cluster. أصلح مصدر الحقيقة قبل أن يشغّل أحد الـ deploy التالي.
    answer: 3
  - q: الإصدار 1.5.0 يعيد تسمية العمود `body` في قاعدة البيانات إلى `content` عبر migration. في 1.5.0 خلل فتتراجع إلى 1.4.0. ماذا يحدث؟
    options:
      - text: التراجع يعكس الـ migration تلقائيًا أيضًا.
        why: لا يعرف Kubernetes شيئًا عن قاعدة بياناتك. الـ Pods وحدها تتغيّر.
      - text: يبدأ 1.4.0 بالفشل، لأنه ما زال يستعلم عن `body`، الذي لم يعد موجودًا.
        why: صحيح. لهذا يجب أن تكون تغييرات المخطّط على نمط التوسعة ثم التقليص (أضف الجديد، ورحّل، واحذف القديم لاحقًا)، حتى يعمل الإصداران المتجاوران كلاهما.
      - text: يعيد Postgres تسمية العمود إلى اسمه القديم حين تصل الاستعلامات القديمة.
        why: قواعد البيانات لا تتراجع عن تغييرات المخطّط استجابة للاستعلامات.
      - text: لا شيء ينكسر، لأن image الإصدار 1.4.0 تتضمّن مخطّطها الخاص.
        why: الـ images تحمل الكود، لا حالة قاعدة البيانات. المخطّط يعيش في Postgres.
    answer: 1
  - q: تريد رؤية YAML ‏Kubernetes الدقيق الذي سينتجه Helm chart للإنتاج قبل تثبيته. أي أمر تستخدم؟
    options:
      - text: "`helm history notes-api`"
        why: هذا يسرد الإصدارات السابقة لـ chart مثبّت، لا الـ manifests المولّدة.
      - text: "`helm rollback notes-api 0`"
        why: هذا يغيّر الـ cluster؛ ولا يعاين أي شيء.
      - text: "`helm template notes-api ./charts/notes-api -f values-prod.yaml`"
        why: صحيح. يولّد القوالب بقيمك محليًا ويطبع الـ YAML، فتستطيع قراءته أو مقارنته.
      - text: "`kubectl get all -n notes`"
        why: هذا يعرض ما يعمل أصلًا، لا ما سينشئه الـ chart.
    answer: 2
---

الإصدار الذي علّمني احترام الـ rollouts خرج يوم جمعة في الرابعة عصرًا (أعرف). كان في الإصدار الجديد خطأ إملائي في اسم متغيّر بيئة، فلم يستطع الوصول إلى قاعدة البيانات. لم يكن في الـ Deployment أي readiness probe، وكانت إعدادات الـ rollout افتراضية، فاستبدل Kubernetes بكل سرور كل Pod يعمل بآخر يُرجع أخطاء 500. استغرق الأمر ست دقائق لنلاحظ، وأربعين ثانية لنتراجع. هذا الدرس عن جعل الجزء الأول مستحيلًا والجزء الثاني روتينيًا.

## كيف يعمل التحديث المتدرّج

حين تغيّر أي شيء في قالب الـ Pod في Deployment، وعادةً الـ image، ينشئ الـ Deployment **ReplicaSet جديدًا** للقالب الجديد ويبدأ في نقل النسخ من القديم إلى الجديد. إعدادان يحدّدان الوتيرة:

```yaml title=k8s/deployment.yaml
spec:
  revisionHistoryLimit: 10
  minReadySeconds: 10
  progressDeadlineSeconds: 300
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

- **`maxSurge`**: كم Pod فوق العدد المرغوب يمكن أن يوجد أثناء التحديث. مع 4 نسخ و`maxSurge: 1`، يمكن أن يوجد 5 Pods في وقت واحد.
- **`maxUnavailable`**: كم Pod تحت العدد المرغوب يُتسامح معه. عند `0` لا تنخفض السعة أبدًا.
- **`minReadySeconds`**: يجب أن يبقى الـ Pod الجديد جاهزًا هذه المدة قبل أن يُعدّ متاحًا. هذا يلتقط الإصدارات التي تجتاز الـ readiness ثم تنهار بعد عشر ثوانٍ.
- **`progressDeadlineSeconds`**: إذا لم يحرز الـ rollout أي تقدّم طوال هذه المدة، يُبلغ الـ Deployment بأنه فشل.

القيم الافتراضية هي 25% للزيادة و25% لعدم الإتاحة. أنا أضبط `maxUnavailable: 0` على كل خدمة تواجه المستخدمين: لا يُزال Pod قديم إلا بعد أن يصبح Pod جديد جاهزًا. ومع الـ readiness probe من الدرس 5.1، لا يستطيع إصدار معطوب أخذ الحركة من إصدار يعمل. إنه يتوقّف مع Pod جديد واحد غير جاهز بينما تخدم الـ Pods القديمة.

:::figure تحديث متدرّج مع maxSurge 1 وmaxUnavailable 0
<svg viewBox="0 0 700 240" role="img" aria-labelledby="t1">
  <title id="t1">أربع خطوات من تحديث متدرّج لـ 4 نسخ. كل خطوة تضيف Pod واحدًا من الإصدار الجديد، وتنتظر جاهزيته، ثم تزيل Pod واحدًا من الإصدار القديم، فيوجد دائمًا 4 Pods جاهزة على الأقل.</title>
  <text class="d-label-strong" x="20" y="40">البداية</text>
  <rect class="d-box" x="120" y="22" width="60" height="28" rx="6"/>
  <rect class="d-box" x="190" y="22" width="60" height="28" rx="6"/>
  <rect class="d-box" x="260" y="22" width="60" height="28" rx="6"/>
  <rect class="d-box" x="330" y="22" width="60" height="28" rx="6"/>
  <text class="d-label-strong" x="20" y="95">زيادة</text>
  <rect class="d-box" x="120" y="77" width="60" height="28" rx="6"/>
  <rect class="d-box" x="190" y="77" width="60" height="28" rx="6"/>
  <rect class="d-box" x="260" y="77" width="60" height="28" rx="6"/>
  <rect class="d-box" x="330" y="77" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="400" y="77" width="60" height="28" rx="6"/>
  <text class="d-label-muted" x="480" y="96">‏Pod جديد جاهز</text>
  <text class="d-label-strong" x="20" y="150">تبديل</text>
  <rect class="d-box" x="190" y="132" width="60" height="28" rx="6"/>
  <rect class="d-box" x="260" y="132" width="60" height="28" rx="6"/>
  <rect class="d-box" x="330" y="132" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="400" y="132" width="60" height="28" rx="6"/>
  <text class="d-label-muted" x="480" y="151">إزالة Pod قديم</text>
  <text class="d-label-strong" x="20" y="205">انتهى</text>
  <rect class="d-box-success" x="120" y="187" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="190" y="187" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="260" y="187" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="330" y="187" width="60" height="28" rx="6"/>
  <text class="d-label-muted" x="480" y="206">الـ ReplicaSet القديم عند 0</text>
  <text class="d-label-muted" x="20" y="234">رمادي: 1.4.0 · أخضر: 1.5.0 · كرّر حتى يُستبدل الكل</text>
</svg>
:::

الاستراتيجية الأخرى، `Recreate`، تحذف كل الـ Pods القديمة قبل تشغيل الجديدة. استخدمها فقط حين لا يستطيع الإصداران فعلًا العمل جنبًا إلى جنب، واقبل التوقّف.

## انشر وراقب وتراجع

غيّر الـ image في `k8s/deployment.yaml` وطبّق، ثم راقب:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/notes-api --timeout=5m
```

الأمر `rollout status` ينتظر حتى يكتمل الـ rollout أو يفشل، ويخرج برمز غير صفري عند الفشل، فيستطيع الـ CI استخدامه كخطوة «هل نجح النشر؟». إذا فشل، أو صارت لوحات المتابعة حمراء بعد نجاحه:

```bash
kubectl rollout history deployment/notes-api
kubectl rollout undo deployment/notes-api
kubectl rollout undo deployment/notes-api --to-revision=7
```

كل ReplicaSet قديم (حتى `revisionHistoryLimit`) هدف تراجع جاهز. الأمر `undo` يوسّع السابق من جديد باستخدام قواعد التحديث المتدرّج نفسها، فيكون التراجع آمنًا مثل التقدّم ويستغرق بضع ثوانٍ. ولتجعل `history` مقروءًا، سجّل سبب وجود كل revision: ‏`kubectl annotate deployment/notes-api kubernetes.io/change-cause="1.5.0: bulk export"`.

بعد الـ undo، يشغّل الـ cluster الإصدار 1.4.0 بينما يقول Git ‏1.5.0. اعكس الـ commit فورًا، وإلا فسيعيد الـ apply الروتيني التالي نشر الخلل.

:::mistake افتراض أن التراجع يلغي كل شيء
الأمر `rollout undo` يبدّل الـ Pods. ولا يمسّ قاعدة بياناتك. إذا أعاد 1.5.0 تسمية عمود، فسيعود 1.4.0 إلى مخطّط لا يفهمه، ويصبح التراجع انقطاعًا ثانيًا. نفّذ تغييرات المخطّط على خطوات توسعة ثم تقليص (expand and contract): أضف العمود الجديد، وانشر كودًا يكتب في الاثنين، واملأ البيانات القديمة، وحوّل القراءات، ولا تحذف العمود القديم إلا بعد إصدار. عندها يستطيع أي إصدارين متجاورين العمل على قاعدة البيانات نفسها، وهذا ما تتطلّبه التحديثات المتدرّجة أصلًا.
:::

## التغليف بـ Helm

صار مجلد `k8s/` الخاص بـ notes-api ستة ملفات، وبيئة staging تحتاج إلى عدد نسخ وموارد وtags مختلفة عن الإنتاج. **Helm** يغلّف الـ manifests في **chart**: قوالب فيها عناصر نائبة، مع ملف `values.yaml` للقيم الافتراضية تتجاوزه كل بيئة.

```text
charts/notes-api/
  Chart.yaml
  values.yaml
  templates/
    deployment.yaml
    service.yaml
    hpa.yaml
    configmap.yaml
```

```yaml title=charts/notes-api/templates/deployment.yaml
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

```yaml title=charts/notes-api/values-prod.yaml
image:
  repository: ghcr.io/skylane/notes-api
  tag: "1.5.1"
resources:
  requests: { cpu: 250m, memory: 256Mi }
  limits: { memory: 512Mi }
```

الأوامر تحاكي ما فعلته بـ kubectl:

```bash
helm lint charts/notes-api
helm template notes-api charts/notes-api -f charts/notes-api/values-prod.yaml
helm upgrade --install notes-api charts/notes-api -n notes -f charts/notes-api/values-prod.yaml
helm history notes-api -n notes
helm rollback notes-api 4 -n notes
```

الأمر `helm template` يولّد الـ YAML محليًا حتى تراجعه. و`upgrade --install` يثبّت في المرة الأولى ويرقّي بعدها، مسجّلًا **release revision** مرقّمة في كل مرة. و`helm rollback` يعيد تطبيق المجموعة الكاملة من manifests ‏revision سابقة، بما فيها الـ ConfigMap، وهذا أوسع من `kubectl rollout undo`. ‏Helm 4، الصادر أواخر 2025، أعاد تسمية بعض الخيارات؛ فمثلًا `--atomic`، الذي يتراجع تلقائيًا حين تفشل الترقية، صار الآن `--rollback-on-failure`.

:::tip ابدأ بـ manifests عادية
يستحق Helm مكانه حين تكون لديك عدّة بيئات أو تريد استهلاك charts ينشرها الآخرون، مثل منظومة مقاييس. أما لخدمة واحدة في بيئة واحدة، فـ YAML عادي مع `kubectl diff` أسهل في القراءة والتشخيص. القوالب التي لا تستطيع توليدها في ذهنك تُبطئ كل حادث.
:::

تستطيع الآن شحن إصدار ومراقبته وعكسه بثقة. الدرس الأخير يُدخل الحركة إلى الـ cluster كما يجب، ويجمع دليل التشخيص لتلك اللحظات التي يحدث فيها خلل رغم كل شيء.
