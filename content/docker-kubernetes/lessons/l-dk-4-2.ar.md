---
summary: اكتب manifest لـ Deployment خاص بـ notes-api، وافهم كيف يملك الـ ReplicaSets والـ Pods عبر الـ labels والـ selectors، وطبّقه وافحصه ووسّعه انطلاقًا من الملفات.
takeaways:
  - الـ Pod هو container واحد أو أكثر تتشارك هوية شبكية وتخزينًا؛ إنه أصغر شيء يُجدوِله Kubernetes، ويمكن التخلّص منه.
  - نادرًا ما تنشئ Pods مجرّدة؛ فالـ Deployment يدير ReplicaSet، وهذا الأخير يُبقي العدد الصحيح من الـ Pods قيد التشغيل.
  - يجب أن يطابق `spec.selector.matchLabels` في الـ Deployment الـ labels الموجودة في `spec.template.metadata.labels`، ولا يمكن تغيير الـ selector بعد الإنشاء.
  - احفظ الـ manifests في Git وغيّرها بـ `kubectl apply -f`، حتى تبقى الملفات مصدر الحقيقة.
  - استخدم إصدارات الـ API الحالية مثل `apps/v1`؛ فالـ manifests المنسوخة من مقالات قديمة بـ `extensions/v1beta1` لم تعد تعمل.
further:
  - title: Pods
    url: https://kubernetes.io/docs/concepts/workloads/pods/
  - title: Deployments
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
  - title: Labels and Selectors
    url: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
  - title: Recommended Labels
    url: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
quiz:
  - q: لماذا نشغّل notes-api عبر Deployment بدلًا من إنشاء ثلاثة Pods مباشرة؟
    options:
      - text: لأن الـ Pods لا يمكن إنشاؤها من ملفات YAML.
        why: يمكن ذلك. ‏manifest الـ Pod المجرّد صالح؛ لكن لا شيء يديره.
      - text: لأن الـ Pods المنشأة مباشرة لا تستطيع استخدام images من registry.
        why: سحب الـ images يعمل بالطريقة نفسها لأي Pod. الإدارة هي الفرق.
      - text: لأن الـ Deployments تشغّل الـ containers أسرع من الـ Pods المجرّدة.
        why: سرعة البدء متطابقة. الـ containers تعمل بالطريقة نفسها.
      - text: لأن الـ Pod المجرّد لا يُستبدل إذا مات هو أو الـ node الخاص به، ولا يمكن نشر إصدار جديد له تدريجيًا؛ والـ Deployment يتولّى الأمرين.
        why: صحيح. الـ Deployment، عبر الـ ReplicaSet الخاص به، يُبقي العدد صحيحًا ويدير التحديثات.
    answer: 3
  - q: "يرفض `kubectl apply` كائن Deployment بالرسالة: `selector does not match template labels`. ما الخطأ؟"
    options:
      - text: اسم الـ container لا يطابق اسم الـ Deployment.
        why: أسماء الـ containers مستقلة عن اسم الـ Deployment وعن الـ labels.
      - text: "الحقل `spec.selector.matchLabels` يطلب labels لا يضبطها `spec.template.metadata.labels`."
        why: صحيح. يجب أن يستطيع الـ Deployment إيجاد الـ Pods التي ينشئها قالبه، لذا يتحقّق الـ API server من تطابقهما.
      - text: الـ Deployment في namespace مختلف عن الـ Pods الخاصة به.
        why: الـ Pods الخاصة بـ Deployment تُنشأ دائمًا في الـ namespace الخاص به.
      - text: الـ tag الخاص بالـ image ليس قيمة label صالحة.
        why: الـ image ليست label أصلًا؛ ولا تشارك في الاختيار.
    answer: 1
  - q: تشغّل `kubectl get pods` فترى `notes-api-6c8f9d7b5-x2k4q`. ما هو `6c8f9d7b5`؟
    options:
      - text: الـ commit في Git للـ image التي تعمل.
        why: لا يعرف Kubernetes شيئًا عن Git. القيمة تأتي من قالب الـ Pod.
      - text: الـ node الذي يعمل عليه الـ Pod.
        why: أسماء الـ nodes ليست في أسماء الـ Pods. استخدم `kubectl get pods -o wide` لرؤية الـ nodes.
      - text: ‏hash لقالب الـ Pod، يحدّد الـ ReplicaSet الذي أنشأ هذا الـ Pod.
        why: صحيح. كل نسخة من القالب تحصل على ReplicaSet خاص بها، وتحمل الـ Pods التابعة له الـ `pod-template-hash` الخاص به. سترى لماذا يهمّ هذا في التراجع.
      - text: لاحقة عشوائية بلا معنى.
        why: الجزء الأخير وحده (`x2k4q`) عشوائي. أما الجزء الأوسط فمقصود.
    answer: 2
  - q: شغّل أحدهم `kubectl scale deployment/notes-api --replicas=6` أثناء حادث. ماذا يحدث عند `kubectl apply -f k8s/` التالي والملف يضبط `replicas` على 3؟
    options:
      - text: يعود الـ Deployment إلى 3 نسخ، لأن الملف يضبطها على 3.
        why: صحيح. ‏apply يجعل الـ cluster مطابقًا للملف. حدّث الملف حين يجب أن يبقى التغيير، وإلا فسيلغيه الـ deploy التالي.
      - text: يبقى على 6، لأن التغييرات المباشرة تفوز دائمًا.
        why: التغييرات المباشرة مجرد تحديثات عبر الـ API؛ والـ apply التالي يكتب فوق الحقول التي يديرها الملف.
      - text: يفشل apply بتعارض حتى يحلّه أحد.
        why: الـ apply من جهة العميل يضبط الحقل ببساطة. لا تحصل على أي تحذير، وهنا الخطر.
      - text: يأخذ Kubernetes متوسط القيمتين ويشغّل 4 أو 5.
        why: لا يوجد متوسط؛ لكل حقل قيمة واحدة في كل لحظة.
    answer: 0
---

الأمر المباشر `kubectl create deployment` من الدرس السابق كان جيدًا لعرض توضيحي، وبلا فائدة لفريق. لا أحد يستطيع مراجعته، ولا أحد يعرف أي خيارات استُخدمت، وفي الأسبوع القادم لا أحد يستطيع تكراره. من الآن فصاعدًا، تعيش إعدادات Kubernetes الخاصة بـ notes-api في ملفات YAML تحت `k8s/`، بجوار الـ Dockerfile، وتُراجع مثل الكود.

## الـ Pods: الوحدة التي يشغّلها Kubernetes

الـ **Pod** هو container واحد أو أكثر تُجدوَل معًا على node واحد، وتتشارك network namespace واحدة (عنوان IP واحد، و`localhost` واحد) وأي volumes تصرّح بها. معظم الـ Pods لها container رئيسي واحد. والـ container الثاني يكون لشيء مرتبط بالأول ارتباطًا وثيقًا، مثل أداة شحن سجلات أو proxy يجب أن يعيش ويموت معه.

يبدو manifest الـ Pod الأدنى هكذا:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: notes-api-test
spec:
  containers:
    - name: api
      image: ghcr.io/skylane/notes-api:1.4.0
      ports:
        - containerPort: 3000
```

لن تنشئ Pods بهذه الطريقة عمليًا. الـ Pod المجرّد لا يُستبدل إذا انهار على node ميت، ولا يمكن تغيير عدد نسخه، ولا يمكن تحديثه إلى image جديدة تدريجيًا. الـ Pods قطيع يُستبدل: كل واحد منها يمكن التخلّص منه، ويحصل على اسم وIP جديدين حين يُستبدل، ويديره شيء فوقه.

## الـ Deployments والـ ReplicaSets والـ Pods

الـ **Deployment** هو ذلك الشيء. إنه يملك **ReplicaSet**، ومهمّته الوحيدة إبقاء N من الـ Pods المتطابقة قيد التشغيل. أما مهمّة الـ Deployment فهي إدارة الـ ReplicaSets عبر الزمن: حين تغيّر قالب الـ Pod، ينشئ ReplicaSet جديدًا وينقل الـ Pods إليه، وهذا هو التحديث المتدرّج (rolling update) الذي ستدرسه في القسم الخامس.

```yaml title=k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notes-api
  labels:
    app.kubernetes.io/name: notes-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app.kubernetes.io/name: notes-api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: notes-api
    spec:
      containers:
        - name: api
          image: ghcr.io/skylane/notes-api:1.4.0
          ports:
            - name: http
              containerPort: 3000
          env:
            - name: PORT
              value: "3000"
```

اقرأه على نصفين. النصف العلوي هو الـ Deployment نفسه: اسمه، وعدد النسخ، والـ Pods التي يملكها (`selector`). وكل ما تحت `template` هو مواصفات Pod، المخطّط الذي تُطبع منه كل نسخة. لاحظ أن `apiVersion` يختلف حسب النوع: الـ Pods في `v1` الأساسية، والـ Deployments في `apps/v1`.

:::figure الـ Deployment يملك ReplicaSets، والـ ReplicaSet يملك Pods، والـ labels تربطها معًا
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">الـ Deployment ‏notes-api يملك ReplicaSet مسمّى بـ hash القالب. الـ ReplicaSet يملك ثلاثة Pods، لكل منها الـ label ‏app.kubernetes.io/name=notes-api، الذي يطابقه الـ selector.</title>
  <rect class="d-box-primary" x="240" y="16" width="220" height="56" rx="10"/>
  <text class="d-label-strong" x="350" y="40" text-anchor="middle">Deployment</text>
  <text class="d-code" x="350" y="60" text-anchor="middle">notes-api</text>
  <path class="d-arrow" d="M350 72 L350 98" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="220" y="100" width="260" height="56" rx="10"/>
  <text class="d-label-strong" x="350" y="124" text-anchor="middle">ReplicaSet</text>
  <text class="d-code" x="350" y="144" text-anchor="middle">notes-api-6c8f9d7b5</text>
  <path class="d-arrow" d="M300 156 L140 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M350 156 L350 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 156 L560 188" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="40" y="190" width="200" height="50" rx="10"/>
  <text class="d-code" x="140" y="220" text-anchor="middle">pod …-x2k4q</text>
  <rect class="d-box-success" x="250" y="190" width="200" height="50" rx="10"/>
  <text class="d-code" x="350" y="220" text-anchor="middle">pod …-p8mzr</text>
  <rect class="d-box-success" x="460" y="190" width="200" height="50" rx="10"/>
  <text class="d-code" x="560" y="220" text-anchor="middle">pod …-c4tq9</text>
  <text class="d-label-muted" x="350" y="256" text-anchor="middle">كل Pod: app.kubernetes.io/name=notes-api</text>
</svg>
:::

## الـ Labels والـ Selectors

كائنات Kubernetes لا يشير بعضها إلى بعض بالاسم. إنها تجد بعضها عبر **الـ labels** (الوسوم)، وهي أزواج مفتاح-قيمة في `metadata.labels`، وعبر **الـ selectors** (المحدِّدات)، وهي استعلامات على تلك الـ labels. يعدّ الـ ReplicaSet الـ Pods الخاصة به بتشغيل الـ selector الخاص به؛ وفي الدرس التالي سيجد Service الـ Pods التي يرسل إليها الحركة بالطريقة نفسها.

لهذا يجب أن يطابق `selector.matchLabels` في الـ Deployment الحقل `template.metadata.labels`: يجب أن يستطيع الـ Deployment إيجاد الـ Pods التي ينشئها قالبه. يتحقّق الـ API server من ذلك ويرفض عدم التطابق. والـ selector أيضًا **غير قابل للتغيير** (immutable) بعد وجود الـ Deployment، فاختره بعناية. المفتاح `app.kubernetes.io/name` أحد الـ labels الموصى بها في Kubernetes؛ تفهمه الأدوات ولوحات المتابعة، واستخدامه باتّساق يؤتي ثماره.

:::mistake نسخ manifest قديم
ما زالت نتائج البحث تُظهر manifests للـ Deployments بـ `apiVersion: extensions/v1beta1` أو `apps/v1beta2`. هذه الإصدارات أُزيلت منذ سنوات، ويفشل `kubectl apply` برسالة `no matches for kind "Deployment" in version …`. استخدم `apps/v1`، وتحقّق من أي حقل لست متأكّدًا منه بـ `kubectl explain deployment.spec`.
:::

## طبّق وافحص ووسّع

```bash
kind load docker-image ghcr.io/skylane/notes-api:1.4.0 --name notes
kubectl apply -f k8s/deployment.yaml
kubectl get deploy,rs,pods -l app.kubernetes.io/name=notes-api
kubectl describe deployment notes-api
```

الأمر `kind load` ينسخ الـ image إلى الـ cluster باسمها الكامل، فيستطيع الـ manifest استخدام المرجع نفسه الذي سيستخدمه الإنتاج. و`-l` يصفّي حسب الـ label، وهي الآلية نفسها التي تستخدمها الـ controllers. انظر إلى أسماء الـ Pods: ‏`notes-api-6c8f9d7b5-x2k4q` هو اسم الـ Deployment، ثم الـ `pod-template-hash` الخاص بالـ ReplicaSet، ثم لاحقة عشوائية. غيّر أي شيء في القالب وستحصل على ReplicaSet جديد بـ hash جديد.

لزيادة عدد النسخ، غيّر `replicas: 3` إلى `5` في الملف وطبّق مجددًا. يقارن `kubectl apply` ملفك بما هو مخزّن ولا يرسل إلا الفرق. والأمر `kubectl diff -f k8s/` يعرض ذلك الفرق قبل أن تلتزم به، ويجب أن تعتاد تشغيله.

الأمر `kubectl scale deployment/notes-api --replicas=5` يعمل أيضًا، وله مكانه في حالات الطوارئ. لكن الملف ما زال يقول 3، فيُرجع الـ `apply` الروتيني التالي العدد إلى 3 بصمت. كل ما تغيّره يدويًا، غيّره في Git مباشرة بعده.

:::tip شخّص الـ Pod، لا الـ Deployment
حين يكون هناك خلل، لا يخبرك الـ Deployment إلا بالأعداد. أما `kubectl describe pod <name>` فيعرض أحداث ذلك الـ Pod: قرارات الجدولة، وسحب الـ images، وإعادات تشغيل الـ containers وأسبابها. إنه أول أمر تلجأ إليه، والقسم الخامس يبني دليل عمل كاملًا حوله.
:::

الـ Pods لديك تعمل، لكن كلًّا منها يملك عنوان IP خاصًا يتغيّر في كل مرة يُستبدل فيها. لا شيء يستطيع الوصول إليها بشكل موثوق بعد. وهذا ما وُجدت الـ Services من أجله.
