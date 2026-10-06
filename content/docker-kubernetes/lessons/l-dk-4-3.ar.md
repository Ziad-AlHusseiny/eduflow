---
summary: أعطِ notes-api وقاعدة بياناته أسماء وعناوين ثابتة بالـ Services، واربط `port` و`targetPort` و`containerPort` بشكل صحيح، واختر بين ClusterIP وNodePort وLoadBalancer.
takeaways:
  - الـ Service يعطي مجموعة متغيّرة من الـ Pods عنوان IP افتراضيًا واسم DNS ثابتين، ويوزّع الاتصالات على الـ Pods الجاهزة التي يطابقها الـ selector الخاص به.
  - "الحقل `port` هو ما يتّصل به العملاء على الـ Service؛ و`targetPort` هو وجهة الحركة على الـ Pod، ويجب أن يطابق المنفذ الذي يستمع عليه الـ container."
  - داخل الـ cluster، تصل الـ Pods إلى الـ Service باسمه، مثل `notes-db` في الـ namespace نفسه أو `notes-db.notes.svc.cluster.local` من أي مكان.
  - استخدم ClusterIP للحركة الداخلية، وLoadBalancer لعرض خدمة واحدة عبر موازن أحمال سحابي، وNodePort للاختبار أساسًا.
  - الـ EndpointSlice الفارغ يعني أن الـ Service لا يطابق أي Pods جاهزة؛ تحقّق من الـ selector والجاهزية أولًا.
further:
  - title: Service
    url: https://kubernetes.io/docs/concepts/services-networking/service/
  - title: DNS for Services and Pods
    url: https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
  - title: Use Port Forwarding to Access Applications in a Cluster
    url: https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/
quiz:
  - q: 'يستمع notes-api على 3000. الـ Service فيه `port: 80` و`targetPort: 3000`. أي عنوان تستخدمه الـ Pods الأخرى في الـ namespace نفسه؟'
    options:
      - text: "`http://notes-api:3000`"
        why: المنفذ 3000 منفذ الـ Pod. عملاء الـ Service يتّصلون بالـ `port` الخاص بالـ Service، وهو 80.
      - text: "`http://<pod-ip>:80`"
        why: عناوين IP الخاصة بالـ Pods تتغيّر مع كل استبدال، ولا شيء في الـ Pod يستمع على 80.
      - text: "`http://notes-api` (المنفذ 80)"
        why: صحيح. اسم الـ Service يُحلّ عبر DNS الخاص بالـ cluster، والمنفذ 80 يُحوَّل إلى 3000 على Pod جاهز.
      - text: "`http://localhost:80`"
        why: "‏`localhost` هو الـ Pod المتّصِل نفسه، لا الـ Service."
    answer: 2
  - q: "الأمر `kubectl get endpointslices -l kubernetes.io/service-name=notes-api` لا يعرض أي endpoints، لكن ثلاثة Pods من notes-api في حالة Running. ما الذي تتحقّق منه أولًا؟"
    options:
      - text: هل يطابق الـ selector الخاص بالـ Service الـ labels الخاصة بالـ Pods، وهل الـ Pods في حالة Ready.
        why: صحيح. الـ endpoints تسرد الـ Pods التي تطابق الـ selector وتجتاز فحص الجاهزية. خطأ إملائي في label أو readiness probe فاشل يتركها فارغة.
      - text: هل نوع الـ Service هو LoadBalancer.
        why: النوع يغيّر طريقة وصول الحركة إلى الـ Service من الخارج، لا الـ Pods التي تقف خلفه.
      - text: هل الـ tag الخاص بالـ image هو `latest`.
        why: الـ tags لا تؤثّر في مطابقة الـ Service.
      - text: هل DNS الخاص بالـ cluster يعمل.
        why: الـ DNS يحلّ اسم الـ Service، لكن الـ endpoints تُحسب من الـ labels والجاهزية، باستقلال عن الـ DNS.
    answer: 0
  - q: تحتاج إلى أن يكون notes-api قابلًا للوصول من الإنترنت على cluster مُدار في AWS، وهو الخدمة العامة الوحيدة. أي نوع Service يناسب؟
    options:
      - text: ClusterIP
        why: الـ ClusterIP لا يمكن الوصول إليه إلا من داخل الـ cluster.
      - text: NodePort، مع اتّصال المستخدمين بعنوان IP لأحد الـ nodes على المنفذ 30080
        why: هذا يعرض كل node على منفذ عالٍ وينكسر حين تُستبدل الـ nodes. إنه لبنة بناء، لا نقطة وصول عامة.
      - text: 'Headless ‏(`clusterIP: None`)'
        why: الـ Services من نوع headless تعطي سجلات DNS لكل Pod، لأشياء مثل قواعد البيانات ذات الهويات الثابتة. لا تعرض شيئًا للخارج.
      - text: LoadBalancer، الذي يجهّز موازن أحمال سحابيًا أمام الـ Service
        why: صحيح. لخدمة عامة واحدة هو الخيار الأبسط. ومع خدمات HTTP كثيرة ستتشارك نقطة دخول واحدة عبر Gateway API بدلًا من ذلك.
    answer: 3
  - q: "أي `targetPort` صحيح لـ container يصرّح بـ `ports: [{ name: http, containerPort: 3000 }]`؟"
    options:
      - text: "`targetPort: 80`، ليطابق منفذ الـ Service."
        why: "الحقل `targetPort` هو المكان الذي تصل إليه الحركة داخل الـ Pod. لا شيء يستمع على 80 هناك."
      - text: "`targetPort: http`، اسم منفذ الـ container (أو `3000`)."
        why: صحيح. المنفذ المسمّى يستمر في العمل حتى لو غيّرت الرقم لاحقًا في مكان واحد.
      - text: "`targetPort: notes-api`، اسم الـ Deployment."
        why: "الحقل `targetPort` يأخذ رقمًا أو اسم منفذ container، لا اسم كائن."
      - text: "`targetPort: 30000`، من نطاق NodePort."
        why: نطاق NodePort يخصّ `nodePort`، وهو حقل مختلف على جهة الـ node.
    answer: 1
---

شغّل `kubectl get pods -o wide` مرتين، مع rollout بينهما، وستجد كل عنوان IP مختلفًا. الـ Pods تُستبدل باستمرار: إصدارات جديدة، وإعادة جدولة، وتوسّع. كل ما كان يتذكّر عنوان IP لـ Pod صار يشير إلى لا شيء. الـ Service هو الشيء الثابت الذي تشير إليه بدلًا من ذلك.

## Service لـ notes-api

```yaml title=k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: notes-api
  labels:
    app.kubernetes.io/name: notes-api
spec:
  selector:
    app.kubernetes.io/name: notes-api
  ports:
    - name: http
      port: 80
      targetPort: http
```

هذا ينشئ عنوان IP افتراضيًا واسم DNS، ‏`notes-api`، يدومان ما دام الـ Service موجودًا. الاتصالات إليه تُوزَّع على الـ Pods التي يطابقها الـ `selector` الخاص به، وهو استعلام الـ labels نفسه الذي يستخدمه الـ Deployment. يتتبّع Kubernetes المجموعة الحالية من الـ Pods *الجاهزة* المطابقة في **EndpointSlices** ويحدّثها كلما جاءت Pods وذهبت. والعملاء لا يلاحظون شيئًا.

الـ ClusterIP ليس جهازًا، ولا تستمع عليه أي عملية. طبقة الشبكة في كل node ‏(kube-proxy، أو بديل مبني على eBPF في كثير من الـ clusters) تبرمج قواعد تعيد كتابة الحزم المرسلة إلى عنوان IP الخاص بالـ Service ومنفذه لتذهب إلى أحد الـ Pods الجاهزة. لهذا لا تستطيع تنفيذ `ping` على عنوان IP الخاص بـ Service، ولا داعي للقلق حين لا يجيب: المنافذ المصرَّح بها هي وحدها الموجودة. ولهذا أيضًا لا يكلّف الـ Service شيئًا تقريبًا، فأنشئ واحدًا لكل حمل عمل يستقبل حركة.

## ثلاثة منافذ، وثلاثة معانٍ

هنا تعيش معظم أخطاء الـ Services.

- **`containerPort`** في مواصفات الـ Pod هو المنفذ الذي تستمع عليه عمليتك: 3000. إنه معلوماتي، مثل `EXPOSE`، لكن تسميته (`name: http`) تتيح للكائنات الأخرى الإشارة إليه.
- **`targetPort`** في الـ Service هو المكان الذي تُسلَّم إليه الحركة على الـ Pod. يجب أن يطابق المكان الذي يستمع عليه التطبيق فعلًا. وهنا يستخدم الاسم `http`، الذي يُحلّ إلى 3000.
- **`port`** في الـ Service هو ما يتّصل به العملاء: 80.

:::figure العملاء يستخدمون منفذ الـ Service؛ والـ Service يحوّل إلى targetPort على Pod جاهز
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">‏Pod عميل يستدعي notes-api على المنفذ 80. الـ Service يحوّل إلى targetPort ‏http، وهو containerPort ‏3000، على أحد ثلاثة Pods جاهزة من notes-api يختارها الـ label.</title>
  <rect class="d-box" x="20" y="95" width="130" height="60" rx="10"/>
  <text class="d-label" x="85" y="121" text-anchor="middle">Pod عميل</text>
  <text class="d-code" x="85" y="143" text-anchor="middle">notes-api:80</text>
  <path class="d-arrow" d="M150 125 L228 125" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="230" y="80" width="190" height="90" rx="12"/>
  <text class="d-label-strong" x="325" y="106" text-anchor="middle">Service notes-api</text>
  <text class="d-code" x="325" y="130" text-anchor="middle">port: 80</text>
  <text class="d-code" x="325" y="152" text-anchor="middle">targetPort: http</text>
  <path class="d-arrow" d="M420 110 L508 52" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 125 L508 125" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 140 L508 198" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="510" y="28" width="170" height="48" rx="10"/>
  <text class="d-code" x="595" y="57" text-anchor="middle">pod :3000</text>
  <rect class="d-box-success" x="510" y="101" width="170" height="48" rx="10"/>
  <text class="d-code" x="595" y="130" text-anchor="middle">pod :3000</text>
  <rect class="d-box-success" x="510" y="174" width="170" height="48" rx="10"/>
  <text class="d-code" x="595" y="203" text-anchor="middle">pod :3000</text>
  <text class="d-label-muted" x="325" y="200" text-anchor="middle">selector: app.kubernetes.io/name=notes-api</text>
  <text class="d-label-muted" x="595" y="242" text-anchor="middle">containerPort http = 3000</text>
</svg>
:::

:::mistake ‏targetPort يشير إلى المنفذ الخطأ
الإعداد `port: 80, targetPort: 80` هو الخطأ الكلاسيكي. يبدو متناظرًا ومرتّبًا، وللـ Service ‏endpoints، وكل طلب يفشل بـ `connection refused`، لأن لا شيء في الـ Pod يستمع على 80. وجّه `targetPort` إلى المنفذ المسمّى في الـ container، فلا يمكن أن يفترق الرقمان أبدًا.
:::

## إيجاد الـ Services بالاسم

يعطي DNS الخاص بالـ cluster كل Service اسمًا بالشكل `<service>.<namespace>.svc.cluster.local`. من Pod في الـ namespace نفسه يكفي الاسم القصير `notes-api`؛ ومن namespace آخر استخدم `notes-api.notes` أو الاسم الكامل.

يحتاج notes-api إلى قاعدة بيانات، فأعطه واحدة بالطريقة نفسها. للتدرّب في kind، شغّل Postgres كـ Deployment بنسخة واحدة مع Service من نوع ClusterIP:

```yaml title=k8s/db.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notes-db
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: notes-db
  template:
    metadata:
      labels:
        app.kubernetes.io/name: notes-db
    spec:
      containers:
        - name: postgres
          image: postgres:17
          env:
            - name: POSTGRES_USER
              value: notes
            - name: POSTGRES_PASSWORD
              value: notes          # moved to a Secret in the next lesson
            - name: POSTGRES_DB
              value: notes
          ports:
            - name: postgres
              containerPort: 5432
---
apiVersion: v1
kind: Service
metadata:
  name: notes-db
spec:
  selector:
    app.kubernetes.io/name: notes-db
  ports:
    - name: postgres
      port: 5432
      targetPort: postgres
```

المضيف في `DATABASE_URL` الخاص بـ notes-api صار الآن `notes-db`، تمامًا كما كان `db` في Compose. والفاصل `---` يفصل بين كائنين في ملف واحد.

:::note قواعد البيانات في الإنتاج
قاعدة بيانات التدريب هذه تحفظ بياناتها داخل الـ Pod، فتضيع كلما استُبدل الـ Pod. في الإنتاج، استخدم قاعدة بيانات مُدارة مثل Amazon RDS، أو شغّل Postgres بـ StatefulSet وpersistent volumes تحت operator يصونه أناس يعرفون Postgres جيدًا. التطبيقات عديمة الحالة (stateless) هي حيث يكون Kubernetes سهلًا؛ أما ذات الحالة (stateful) فتحتاج إلى تصميم متعمَّد.
:::

## أنواع الـ Services

| النوع | يمكن الوصول إليه من | استخدمه لـ |
|---|---|---|
| `ClusterIP` (الافتراضي) | داخل الـ cluster | الحركة بين الخدمات، مثل notes-api ← notes-db |
| `NodePort` | عنوان IP لكل node على منفذ ضمن 30000–32767 | الاختبارات السريعة، أو كلبنة بناء لموازنات الأحمال الخارجية |
| `LoadBalancer` | عنوان موازن أحمال سحابي | عرض خدمة واحدة للعموم على cluster مُدار |

وهناك أيضًا الـ Service من نوع **headless**، مع `clusterIP: None`. لا يحصل على عنوان IP افتراضي؛ بل يُرجع اسم الـ DNS الخاص به عناوين IP للـ Pods المفردة. تستخدمه قواعد البيانات والأنظمة العنقودية الأخرى حين يحتاج كل عضو إلى أن يُخاطَب مباشرة. لن تحتاج إليه لـ notes-api.

يُبنى `LoadBalancer` فوق النوعين الآخرين: ينشئ مزوّد السحابة موازن أحمال يحوّل في العادة إلى منافذ الـ nodes، وهذه تحوّل إلى الـ Service (وبعض الـ controllers يرسل الحركة مباشرة إلى عناوين IP الخاصة بالـ Pods بدلًا من ذلك). واحد لكل خدمة عامة يصبح مكلفًا ومتكرّرًا حين تكون لديك خدمات HTTP كثيرة؛ والدرس 5.4 يغطّي Gateway API، الذي يضع مسارات كثيرة خلف نقطة دخول واحدة.

## الوصول إليه من حاسوبك

```bash
kubectl apply -f k8s/
kubectl get svc
kubectl get endpointslices -l kubernetes.io/service-name=notes-api
kubectl port-forward svc/notes-api 8080:80
curl localhost:8080/readyz
```

الأمر `port-forward` يحفر نفقًا من منفذ محلي إلى الـ Service عبر الـ API server. إنه للتشخيص، لا للحركة الحقيقية. إذا لم يسرد الـ EndpointSlice أي عناوين، فالـ Service لا يطابق أي Pods جاهزة: قارن الـ selector بمخرجات `kubectl get pods --show-labels`، ثم تحقّق من الجاهزية.

مشكلتان صارتا ظاهرتين الآن في الـ YAML: كلمة مرور مكتوبة نصًّا صريحًا، وإعدادات مخلوطة داخل الـ Deployment. الدرس التالي يُخرج الاثنتين.
