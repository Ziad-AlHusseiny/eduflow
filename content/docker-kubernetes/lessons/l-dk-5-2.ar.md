---
summary: اضبط requests وlimits للمعالج والذاكرة في notes-api انطلاقًا من القياسات، وتوقّع الخنق (throttling) والقتل بسبب نفاد الذاكرة وفئات QoS، ووسّع عدد النسخ تلقائيًا بـ HorizontalPodAutoscaler من autoscaling/v2.
takeaways:
  - الـ requests هي ما يحجزه الـ scheduler للـ container؛ والـ limits هي السقف المفروض وقت التشغيل.
  - تجاوز حدّ المعالج يخنق الـ container؛ وتجاوز حدّ الذاكرة يجعله يُقتل بـ OOM مع رمز الخروج 137.
  - "فئة QoS تُشتقّ من الـ requests والـ limits: ‏Guaranteed (متساوية لكل container)، وBurstable (بعضها مضبوط)، وBestEffort (لا شيء)، والـ Pods من فئة BestEffort تُطرد أولًا."
  - هدف استخدام المعالج في الـ HPA نسبة مئوية من *request* المعالج، فلا يعمل على containers ليس لها request.
  - حين يدير HPA كائن Deployment، احذف `replicas` من manifest الـ Deployment حتى لا يتصارع `kubectl apply` مع الـ autoscaler.
further:
  - title: Resource Management for Pods and Containers
    url: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
  - title: Pod Quality of Service Classes
    url: https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/
  - title: Horizontal Pod Autoscaling
    url: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
quiz:
  - q: '‏Pod من notes-api يُعاد تشغيله عدّة مرات في اليوم. ويعرض `kubectl describe pod` السبب `Reason: OOMKilled` و`Exit Code: 137`. ماذا حدث؟'
    options:
      - text: كان حدّ المعالج منخفضًا جدًا، فقتلت النواة الـ container.
        why: تجاوز حدّ المعالج يؤدّي إلى الخنق (الإبطاء)، لا إلى القتل أبدًا.
      - text: فشل الـ liveness probe فأعاد Kubernetes تشغيل الـ container.
        why: إعادة التشغيل بسبب الـ liveness تُظهر فشل probe في الأحداث، لا `OOMKilled` كسبب.
      - text: استهلك الـ container ذاكرة أكثر من حدّه، فأنهاه الـ OOM killer في النواة.
        why: صحيح. ارفع حدّ الذاكرة ليناسب الاستهلاك الحقيقي، أو ابحث عن التسرّب؛ وفي Node.js ضع أيضًا سقفًا للـ heap في V8 تحت الحدّ.
      - text: نفدت مساحة القرص المخصّصة للسجلات على الـ node.
        why: ضغط القرص يؤدّي إلى الطرد (eviction) بسبب مختلف، لا إلى قتل بسبب نفاد الذاكرة.
    answer: 2
  - q: 'يستهدف HPA استخدامًا للمعالج بنسبة 70%، ويعرض `kubectl get hpa` القيمة `cpu: <unknown>/70%`. ما السبب الأرجح؟'
    options:
      - text: الـ HPA يستخدم `autoscaling/v2`، الذي لا يدعم المعالج.
        why: ‏autoscaling/v2 يدعم المعالج والذاكرة والمقاييس المخصّصة والخارجية.
      - text: containers ‏notes-api ليس لها request للمعالج، فلا يمكن حساب نسبة الاستخدام (أو أن metrics-server غير مثبّت).
        why: صحيح. نسبة الاستخدام هي الاستهلاك مقسومًا على الـ request. لا request، لا نسبة. وتحقّق أيضًا من أن metrics-server يعمل.
      - text: "‏`minReplicas` أعلى من عدد النسخ الحالي."
        why: هذا يجعل الـ HPA يوسّع حتى الحدّ الأدنى؛ ولا يجعل المقاييس مجهولة.
      - text: في الـ Deployment نسخ أكثر من أن يديرها الـ HPA.
        why: لا يوجد حدّ كهذا؛ يستطيع الـ HPA إدارة أي عدد ضمن حدوده.
    answer: 1
  - q: "يضبط notes-api القيم `requests: {cpu: 250m, memory: 256Mi}` و`limits: {memory: 512Mi}`. ما فئة QoS التي يحصل عليها الـ Pod؟"
    options:
      - text: Guaranteed
        why: فئة Guaranteed تحتاج إلى requests مساوية للـ limits في المعالج والذاكرة معًا، في كل container.
      - text: BestEffort
        why: فئة BestEffort تعني عدم وجود أي requests أو limits. وهذا الـ Pod فيه requests.
      - text: Critical
        why: هذه ليست فئة QoS. الفئات الثلاث هي Guaranteed وBurstable وBestEffort.
      - text: Burstable
        why: صحيح. له requests، لكنها لا تساوي الـ limits في كل مورد، فيستطيع تجاوز الـ requests الخاصة به مؤقتًا.
    answer: 3
  - q: 'الـ manifest الخاص بـ Deployment ‏notes-api يقول `replicas: 3`، ووسّعه HPA إلى 9 أثناء ذروة حركة. ماذا يحدث حين يشغّل الـ CI الأمر `kubectl apply -f k8s/`؟'
    options:
      - text: يهبط الـ Deployment إلى 3 نسخ حتى يوسّعه الـ HPA من جديد، فتنخفض السعة في منتصف الذروة.
        why: صحيح. ‏apply يضبط الحقل من الملف. احذف `replicas` من الـ manifest حالما يتولّاه HPA.
      - text: لا شيء؛ الـ HPA يقفل حقل النسخ.
        why: الـ HPA يكتب في الحقل، لكنه لا يقفله. أي شيء آخر يكتب فيه يفوز حتى قرار الـ HPA التالي.
      - text: يفشل apply بخطأ تعارض.
        why: مع الـ apply العادي من جهة العميل لا يوجد خطأ؛ إنه يكتب فوق القيمة بصمت، وهذا ما يجعل الأمر خطيرًا.
      - text: يتغيّر `minReplicas` في الـ HPA إلى 3.
        why: تطبيق Deployment لا يعدّل كائن الـ HPA أبدًا.
    answer: 0
---

في المرة الأولى التي واجه فيها notes-api حركة حقيقية على cluster مشترك، حدث أمران خلال ساعة. مهمّة دفعية (batch job) على الـ node نفسه استهلكت كل الذاكرة، فطُرد أحد Pods ‏notes-api. ثم رفعت قفزة في الحركة استهلاك المعالج إلى أقصاه، وصار زمن الاستجابة بالثواني، وبقي عدد الـ Pods ثلاثة بالضبط لأن أحدًا لم يخبر Kubernetes بأنه يستطيع إضافة المزيد. الإخفاقان جاءا من الفجوة نفسها: لم يكن Kubernetes يعرف ما يحتاج إليه notes-api.

## الـ Requests والـ Limits

يستطيع كل container التصريح برقمين لكل مورد:

```yaml title=k8s/deployment.yaml
        - name: api
          image: ghcr.io/skylane/notes-api:1.4.0
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              memory: 512Mi
```

- الـ **request** (الطلب) هو ما يحجزه الـ scheduler. لا يوضع الـ Pod إلا على node لديه سعة غير محجوزة كافية لكل الـ requests الخاصة به. و`250m` تعني 250 millicores، أي ربع نواة معالج.
- الـ **limit** (الحدّ) هو السقف الذي تفرضه النواة عبر الـ cgroups، الآلية التي تعرّفت إليها في الدرس 1.1.

يتصرّف الموردان بشكل مختلف جدًا حين يبلغ الـ container حدّه:

- **المعالج قابل للضغط.** فوق حدّ المعالج يُخنق الـ container: يحصل على وقت معالج أقل ويصبح أبطأ، لكنه يستمر في العمل.
- **الذاكرة ليست كذلك.** فوق حدّ الذاكرة، ينهي الـ OOM killer في النواة العملية. يعرض `kubectl describe pod` السبب `OOMKilled` ورمز الخروج 137، ويُعاد تشغيل الـ container.

إذا ضبطت limit دون request، ينسخ Kubernetes الـ limit إلى الـ request. أما الـ request الأكبر من الـ limit فيُرفض مباشرة.

:::why لماذا لا يوجد حدّ للمعالج في notes-api
هذا أمر خلافي، فإليك منطقي. حدّ المعالج يخنق التطبيق حتى حين تكون لدى الـ node أنوية خاملة، وهذا يظهر كقفزات في زمن الاستجابة لا يستطيع أحد تفسيرها. مع request معقول للمعالج، يضمن الـ scheduler أصلًا لـ notes-api حصّته عند التزاحم، لذا نترك حدّ المعالج ونضبط حدًّا للذاكرة، لأن نفاد الذاكرة يؤذي الـ node كله. بعض المؤسسات تشترط حدود المعالج كسياسة؛ وإن كانت مؤسستك منها، فاضبطها بسخاء وراقب مقاييس الخنق.
:::

في Node.js، أعطِ V8 سقفًا للـ heap تحت حدّ ذاكرة الـ container، مثلًا `NODE_OPTIONS=--max-old-space-size=384` مع حدّ 512Mi. عندها يعمل جامع النفايات بجهد كلما امتلأت الذاكرة، بدلًا من أن تنهي النواة العملية دون إنذار.

## اختيار الأرقام

لا تخمّن. شغّل notes-api تحت حمل واقعي وقِس:

```bash
kubectl top pods -l app.kubernetes.io/name=notes-api
```

يحتاج `kubectl top` إلى metrics-server، الذي تتضمّنه كثير من الـ clusters المُدارة أو تقدّمه كإضافة (add-on)؛ وفي kind تثبّته بنفسك. اضبط request المعالج قرب الاستهلاك المعتاد تحت الحمل العادي، واضبط request الذاكرة وحدّها مع هامش فوق الذروة التي لاحظتها. راجع الأرقام بعد الإصدارات الكبيرة. الـ requests المرتفعة جدًا تهدر المال على حجوزات خاملة؛ والمنخفضة جدًا تجعل الـ Pods تُحشر على nodes لا تستطيع حملها فعلًا.

## فئات QoS والطرد

من الـ requests والـ limits، يشتقّ Kubernetes **فئة جودة الخدمة** (Quality of Service class) لكل Pod:

| الفئة | القاعدة | تُطرد عند ضغط ذاكرة الـ node |
|---|---|---|
| Guaranteed | لكل container ‏requests للمعالج والذاكرة مساوية للـ limits | أخيرًا |
| Burstable | request أو limit واحد على الأقل مضبوط، لكنها ليست Guaranteed | بعد BestEffort، بدءًا بالـ Pods الأكثر تجاوزًا للـ requests الخاصة بها |
| BestEffort | لا requests ولا limits في أي مكان | أولًا |

‏notes-api في الأعلى من فئة Burstable. والمهمّة الدفعية التي سبّبت الطرد كانت BestEffort، فمع وجود الـ requests كانت ستُطرد قبل notes-api. تشغيل أحمال الإنتاج كـ BestEffort يعني أنك تتطوّع بها لتكون أول ما يُطرد.

## التوسّع الأفقي التلقائي للـ Pods

الـ HorizontalPodAutoscaler ‏(HPA) يعدّل عدد نسخ الـ Deployment بناءً على المقاييس. إنه حلقة تحكّم أخرى: كل 15 ثانية تقريبًا يقارن الاستهلاك الملحوظ بالهدف ويحسب عدد النسخ الذي سيعيد الاستهلاك إلى الهدف.

```yaml title=k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: notes-api
  namespace: notes
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: notes-api
  minReplicas: 3
  maxReplicas: 12
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

القيمة `averageUtilization: 70` تعني «أبقِ متوسط استهلاك المعالج عند 70% من **request** المعالج». مع request قدره 250m، هذا نحو 175m لكل Pod. عند ستة Pods بمتوسط 350m، يحسب الـ HPA ‏6 × 350 / 175 = 12 فيوسّع إلى الحدّ الأقصى. والكتلة `behavior` تجعل التقليص ينتظر خمس دقائق من الحمل المنخفض باستمرار، حتى لا يُزيل هدوءٌ عابر سعةً ستحتاج إليها بعد دقيقة. والدقائق الخمس هي القيمة الافتراضية أصلًا؛ لكن كتابتها صراحةً تجعل القرار ظاهرًا وسهل الضبط.

:::figure الـ HPA حلقة تحكّم تعمل على عدد نسخ الـ Deployment
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">يجمع metrics-server استهلاك المعالج من الـ Pods. يقرؤه الـ HPA، ويقارنه بـ 70 بالمئة من الـ requests، ويحدّث عدد نسخ الـ Deployment، فيتغيّر عدد الـ Pods.</title>
  <rect class="d-box" x="20" y="80" width="150" height="60" rx="10"/>
  <text class="d-label" x="95" y="115" text-anchor="middle">metrics-server</text>
  <rect class="d-box-primary" x="240" y="80" width="200" height="60" rx="10"/>
  <text class="d-label-strong" x="340" y="106" text-anchor="middle">HPA</text>
  <text class="d-code" x="340" y="128" text-anchor="middle">الهدف 70% من الـ request</text>
  <rect class="d-box-accent" x="510" y="80" width="170" height="60" rx="10"/>
  <text class="d-label" x="595" y="106" text-anchor="middle">Deployment</text>
  <text class="d-code" x="595" y="128" text-anchor="middle">replicas: 3 → 6</text>
  <path class="d-arrow" d="M170 110 L238 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 110 L508 110" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="300" y="170" width="250" height="40" rx="8"/>
  <text class="d-label" x="425" y="195" text-anchor="middle">Pods ‏notes-api</text>
  <path class="d-arrow" d="M595 140 L520 168" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M300 190 L95 142" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="170" y="185" text-anchor="middle">استهلاك المعالج</text>
  <text class="d-label-muted" x="350" y="60" text-anchor="middle">كل ~15 ثانية</text>
</svg>
:::

:::mistake مالكان لحقل واحد
حالما يدير HPA ‏notes-api، احذف `replicas:` من `k8s/deployment.yaml`. وإلا فكل `kubectl apply` يعيد العدد إلى قيمة الملف، ربما 3 في منتصف ذروة حركة عند 9، ويضطر الـ HPA إلى التسلّق من جديد بينما ينتظر المستخدمون. حقل واحد، مالك واحد.
:::

راقبه وهو يعمل بـ `kubectl get hpa notes-api --watch` أثناء تشغيل اختبار حمل. إذا أظهر عمود الأهداف `<unknown>`، فإمّا أن الـ containers ليس لها request للمعالج، أو أن metrics-server لا يعمل.

المعالج يناسب notes-api لأن عمله معالجة طلبات مرتبطة بالمعالج. أما الخدمات التي يظهر حملها في مكان آخر، مثل عمق الطابور أو عدد الطلبات في الثانية، فتستطيع التوسّع على مقاييس مخصّصة أو خارجية عبر قائمة `metrics` نفسها، مع adapter مثبّت في الـ cluster.

لدى notes-api الآن الموارد التي يحتاج إليها، وينمو مع الحمل. الدرس التالي يغيّر الـ image بأمان: التحديثات المتدرّجة، والتراجع، وتغليف كل شيء بـ Helm.
