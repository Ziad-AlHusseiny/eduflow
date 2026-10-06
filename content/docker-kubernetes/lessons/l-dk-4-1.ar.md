---
summary: اشرح كيف يحوّل Kubernetes الحالة المرغوبة المصرَّح بها إلى containers تعمل عبر حلقات التحكّم، وسمِّ المكوّنات الرئيسية في الـ cluster، وأنشئ cluster محليًا بـ kind لتعمل فيه.
takeaways:
  - تخبر Kubernetes بالحالة التي تريدها؛ والـ controllers تواصل مقارنتها بالحالة الفعلية وتتصرّف لسدّ الفجوة، إلى الأبد.
  - الـ API server هو الباب الأمامي، وهو المكوّن الوحيد الذي يتحدّث مع etcd، حيث تُخزَّن كل حالة الـ cluster.
  - الـ scheduler يختار node لكل Pod جديد؛ والـ kubelet على ذلك الـ node يشغّل الـ containers الخاصة به عبر الـ container runtime.
  - حذف Pod يديره controller لا يزيله لوقت طويل، لأن الـ controller يرى أن واحدًا ناقص فينشئ بديلًا.
  - تحقّق دائمًا من الـ cluster الذي يشير إليه `kubectl` بالأمر `kubectl config current-context` قبل تغيير أي شيء.
further:
  - title: Kubernetes components
    url: https://kubernetes.io/docs/concepts/overview/components/
  - title: Controllers
    url: https://kubernetes.io/docs/concepts/architecture/controller/
  - title: Install and set up kubectl
    url: https://kubernetes.io/docs/tasks/tools/
quiz:
  - q: ‏Deployment يريد 3 نسخ (replicas). ينهار node ويأخذ معه Pod واحدًا. ما الذي يعيد الـ Pod الثالث؟
    options:
      - text: يلاحظ controller وجود 2 من الـ Pods حيث المطلوب 3، فينشئ واحدًا جديدًا، ويضعه الـ scheduler على node سليم.
        why: صحيح. الـ controller الخاص بالـ ReplicaSet يواصل التوفيق بين الفعلي والمرغوب، فيستبدل الـ Pod المفقود دون أن يشغّل أحد أي أمر.
      - text: يعيد الـ kubelet على الـ node المنهار تشغيل الـ Pod حين يعود الـ node.
        why: إذا ذهب الـ node، ذهب معه الـ kubelet الخاص به. التعافي يجب أن يأتي من مستوى التحكّم.
      - text: لا شيء؛ يجب أن يعيد أحدهم تشغيل `kubectl apply`.
        why: الحالة المرغوبة مخزّنة أصلًا. إعادة تطبيق الملف نفسه لا تغيّر شيئًا لا تفرضه الـ controllers بالفعل.
      - text: يعيد etcd تشغيل الـ Pod من نسخته الاحتياطية.
        why: الـ etcd يخزّن الحالة. لا يشغّل أي شيء ولا يوقفه أبدًا.
    answer: 0
  - q: أي مكوّن هو الوحيد الذي يقرأ etcd ويكتب فيه مباشرة؟
    options:
      - text: الـ scheduler
        why: الـ scheduler يراقب الـ Pods ويحدّثها عبر الـ API server، مثل كل المكوّنات الأخرى.
      - text: الـ kubelet
        why: الـ kubelets تتحدّث مع الـ API server لمعرفة الـ Pods التي يجب تشغيلها وللإبلاغ عن حالتها.
      - text: ‏kubectl
        why: ‏kubectl عميل للـ API server. لا يرى etcd أبدًا.
      - text: الـ API server
        why: صحيح. كل شيء آخر يمرّ عبره، وهناك يحدث التحقّق والمصادقة والتفويض.
    answer: 3
  - q: تحذف Pod أنشأه Deployment بالأمر `kubectl delete pod notes-api-7d9c-xk2lp`. ماذا ترى بعد بضع ثوانٍ في `kubectl get pods`؟
    options:
      - text: ‏Pod أقل بواحد، حتى توسّع الـ Deployment من جديد.
        why: العدد المرغوب في الـ Deployment لم يتغيّر، فيُصحَّح النقص فورًا.
      - text: ‏Pod جديد باسم مختلف، أُنشئ ليحلّ محلّه.
        why: صحيح. يرى الـ controller الخاص بالـ ReplicaSet أن واحدًا ناقص فينشئ بديلًا. لإزالة الـ Pods نهائيًا، غيّر الـ Deployment.
      - text: الـ Pod نفسه، مستعادًا بالاسم نفسه وعنوان IP نفسه.
        why: الـ Pods لا تُستعاد أبدًا. البديل Pod جديد باسم جديد، وغالبًا بعنوان IP جديد.
      - text: خطأ، لأن Pods الـ Deployment لا يمكن حذفها.
        why: تستطيع حذفها. لكن الـ controller لن يسمح ببقاء العدد منخفضًا.
    answer: 1
  - q: قبل تشغيل `kubectl delete deployment notes-api`، ما الذي يجب أن تتحقّق منه؟
    options:
      - text: أن الـ image ما زالت موجودة في الـ registry.
        why: حذف Deployment لا يعتمد على الـ image. أما الـ cluster الذي تتحدّث معه فيهمّ فعلًا.
      - text: أن لدى etcd نسخة احتياطية حديثة.
        why: ممارسة جيدة لمشغّلي الـ clusters، لكن الخطر المباشر هنا هو التصرّف على الـ cluster الخطأ.
      - text: الـ cluster والـ namespace اللذين يشير إليهما kubectl، بالأمر `kubectl config current-context`.
        why: صحيح. يتصرّف kubectl على أي context هو الحالي. الأمر نفسه يعني أشياء مختلفة جدًا في kind وفي الإنتاج.
      - text: أن الـ Deployment فيه أقل من 10 نسخ.
        why: عدد النسخ لا يغيّر كون الحذف آمنًا أم لا.
    answer: 2
---

‏Compose يشغّل بيئتك على جهاز واحد. حين يموت ذلك الجهاز، تموت خدمتك معه، ولا شيء يعيدها حتى يلاحظ أحد. ‏Kubernetes موجود للحالة الأخرى: أجهزة كثيرة، وcontainers يجب أن تستمر في العمل حين يفشل أي جهاز منها، وتغييرات تُنشر دون توقّف للخدمة. لتستخدمه جيدًا، تحتاج إلى فكرة واحدة أكثر من حاجتك إلى أي أمر.

## حلقة التحكّم

في Kubernetes لا تقول «شغّل ثلاثة containers». تقول «يجب أن توجد ثلاث نسخ من notes-api»، وتخزّن ذلك ككائن في الـ cluster (العنقود). ثم يشغّل **controller** حلقة، بلا توقّف:

1. **راقب** الحالة الفعلية: كم Pod من notes-api موجود ويعمل؟
2. **قارن** بينها وبين الحالة المرغوبة في الكائن.
3. **تصرّف** لسدّ الفجوة: أنشئ Pod، أو احذف واحدًا، أو استبدل واحدًا.

الحلقة لا تنتهي أبدًا. إذا مات node وأخذ معه Pod، فالدورة التالية ترى اثنين حيث المطلوب ثلاثة فتنشئ واحدًا. إذا غيّرت العدد المرغوب إلى خمسة، تنشئ اثنين آخرين. وإذا حذف أحدهم Pod يدويًا، يُستبدل خلال ثوانٍ. هذا ما يقصده الناس بـ **التصريحي** (declarative): تصف الوجهة، والنظام يواصل التوجّه نحوها.

تشبيه منظّم الحرارة مفيد هنا. تضبطه على 21°C؛ فلا يشغّل المنظّم سكربتًا ثابتًا من نوع «سخّن لمدة 20 دقيقة». إنه يقيس ويقارن ويشغّل المدفأة أو يطفئها ما دام موصولًا بالكهرباء.

## أجزاء الـ cluster

:::figure كل مكوّن يتحدّث مع الـ API server؛ والـ controllers والـ kubelets توفّق الحالة
<svg viewBox="0 0 700 330" role="img" aria-labelledby="t1">
  <title id="t1">‏kubectl يرسل الكائنات إلى الـ API server، الذي يخزّنها في etcd. الـ scheduler والـ controller manager يراقبان الـ API server. على كل node عامل، يراقب الـ kubelet الـ Pods المسندة إليه ويشغّل الـ containers عبر الـ container runtime.</title>
  <rect class="d-box" x="20" y="40" width="120" height="50" rx="10"/>
  <text class="d-code" x="80" y="70" text-anchor="middle">kubectl</text>
  <rect class="d-box-primary" x="180" y="20" width="500" height="130" rx="14"/>
  <text class="d-label-muted" x="430" y="42" text-anchor="middle">مستوى التحكّم (control plane)</text>
  <rect class="d-box-accent" x="200" y="56" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="275" y="86" text-anchor="middle">API server</text>
  <rect class="d-box-warn" x="200" y="112" width="150" height="32" rx="8"/>
  <text class="d-label" x="275" y="133" text-anchor="middle">etcd</text>
  <rect class="d-box" x="380" y="56" width="130" height="50" rx="10"/>
  <text class="d-label" x="445" y="86" text-anchor="middle">scheduler</text>
  <rect class="d-box" x="530" y="56" width="140" height="50" rx="10"/>
  <text class="d-label" x="600" y="80" text-anchor="middle">controller</text>
  <text class="d-label" x="600" y="98" text-anchor="middle">manager</text>
  <path class="d-arrow" d="M140 65 L198 78" marker-end="url(#arrow)"/>
  <path class="d-line" d="M350 81 L380 81"/>
  <path class="d-line" d="M275 106 L275 112"/>
  <path class="d-line" d="M510 72 L530 72"/>
  <rect class="d-box-success" x="120" y="200" width="250" height="110" rx="12"/>
  <text class="d-label-strong" x="245" y="224" text-anchor="middle">node 1</text>
  <text class="d-label" x="245" y="252" text-anchor="middle">kubelet → containerd</text>
  <text class="d-code" x="245" y="282" text-anchor="middle">pod  pod</text>
  <rect class="d-box-success" x="410" y="200" width="250" height="110" rx="12"/>
  <text class="d-label-strong" x="535" y="224" text-anchor="middle">node 2</text>
  <text class="d-label" x="535" y="252" text-anchor="middle">kubelet → containerd</text>
  <text class="d-code" x="535" y="282" text-anchor="middle">pod</text>
  <path class="d-arrow" d="M260 150 L245 198" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M300 150 L520 198" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="420" y="182" text-anchor="middle">مراقبة: Pods هذا الـ node</text>
</svg>
:::

- الـ **API server** هو الباب الأمامي. ‏kubectl والـ controllers والـ kubelets كلها تتحدّث معه، وهو يتحقّق من صحة كل طلب ومن هوية مرسله وصلاحياته.
- الـ **etcd** مخزن مفتاح-قيمة متّسق يحفظ كل الكائنات. لا يتحدّث معه إلا الـ API server.
- الـ **scheduler** (المُجدوِل) يراقب الـ Pods التي لا node لها ويختار لها واحدًا، بناءً على الموارد الحرّة والقيود والتوزيع.
- الـ **controller manager** يشغّل الـ controllers المدمجة: الـ Deployments، والـ ReplicaSets، والـ Jobs، وصحة الـ nodes، وغيرها.
- على كل node (عقدة) عامل، يراقب الـ **kubelet** الـ Pods المسندة إلى الـ node الخاص به ويشغّل الـ containers الخاصة بها عبر **container runtime**، وهو عادةً containerd. الـ images التي بنيتها بـ Docker تعمل هناك دون تغيير، لأن الـ images تتبع معيار OCI.

الخدمات المُدارة مثل Amazon EKS تشغّل مستوى التحكّم نيابة عنك. لكنك ما زلت تحتاج إلى فهمه، لأن كل رسالة خطأ ستقرؤها تشير إلى أحد هذه الأجزاء.

## cluster على حاسوبك

‏kind ‏("Kubernetes in Docker") يشغّل cluster كاملًا داخل containers في Docker. إنشاؤه سريع والتخلّص منه سريع، وهذا بالضبط ما تريده للتعلّم:

```bash
kind create cluster --name notes
kubectl config current-context      # kind-notes
kubectl get nodes
kind load docker-image notes-api:1.0.0 --name notes
```

الأمر الأخير ينسخ الـ image المحلية إلى الـ node في kind، فيستطيع الـ cluster تشغيلها دون registry. يعمل minikube وKubernetes المدمج في Docker Desktop أيضًا؛ وأوامر `kubectl` في هذه الدورة هي نفسها في كل مكان.

في kind، يعمل مستوى التحكّم نفسه كـ Pods على الـ node المخصّص له. شغّل `kubectl get pods -n kube-system` وسترى الـ API server وetcd والـ scheduler والـ controller manager مدرجة مثل أي حمل عمل آخر، ومعها DNS الخاص بالـ cluster ‏(CoreDNS) وkube-proxy. أما في cluster مُدار فلن ترى مستوى التحكّم هناك، لأن المزوّد يشغّله بعيدًا عن الأنظار.

## راقب الحلقة وهي تعمل

أنشئ Deployment بالأوامر المباشرة، مرة واحدة، لترى التوفيق بعينيك:

```bash
kubectl create deployment notes-api --image=notes-api:1.0.0 --replicas=3
kubectl get pods
kubectl delete pod <one-of-the-pod-names>
kubectl get pods --watch
```

خلال ثوانٍ يظهر Pod جديد باسم جديد. لم تطلبه؛ الـ controller أدّى عمله. والآن انظر إلى ما أنشأته:

```bash
kubectl get deployment notes-api -o yaml
kubectl explain deployment.spec.replicas
kubectl delete deployment notes-api
```

الخيار `-o yaml` يعرض الكائن الكامل الذي خزّنه Kubernetes، بما فيه قيم افتراضية كثيرة لم تضبطها. والأمر `kubectl explain` يوثّق أي حقل من الـ cluster نفسه؛ إنه أسرع مرجع لديك. بدءًا من الدرس التالي ستكتب هذه الكائنات كملفات وتطبّقها، وهكذا تعمل الفرق الحقيقية.

:::mistake الـ context الخطأ
يتصرّف kubectl على الـ *context الحالي*. الذين يعملون مع عدّة clusters يشغّلون في النهاية أمر حذف على الإنتاج وهم يظنون أنهم في staging. تحقّق بـ `kubectl config current-context`، واعرض الـ context في الـ prompt الخاص بالـ shell، وبدّل عن قصد بـ `kubectl config use-context kind-notes`. بعض الفرق تعطي الإنتاج ملف kubeconfig منفصلًا كليًا.
:::

التالي: الكائنات التي لمحتها للتوّ، مكتوبة كما يجب. الـ Pods والـ ReplicaSets والـ Deployments.
