---
summary: وجّه حركة HTTPS العامة إلى notes-api باستخدام Gateway API، وحصّن الـ Pods الخاصة به بـ securityContext، وشخّص الـ Pods المعطوبة بسرعة بالأوامر get وdescribe وlogs وevents وkubectl debug.
takeaways:
  - يقسّم Gateway API الحركة الخارجية إلى GatewayClass (أداة التنفيذ)، وGateway (نقطة الدخول وTLS)، وHTTPRoute (قواعد التوجيه لتطبيق ما)، فيملك كلٌّ من فريق المنصّة وفريق التطبيق جزأه.
  - الـ Ingress ما زال يعمل لكنه مجمَّد، والـ controller المجتمعي ingress-nginx تقاعد في مارس 2026؛ والإعدادات الجديدة يجب أن تستخدم Gateway API.
  - اقرأ حالة الـ Pod أولًا، ثم `kubectl describe` للأحداث، ثم `kubectl logs --previous` للانهيارات؛ فالحالة تخبرك بالأداة التي تلجأ إليها.
  - "الأمر `kubectl debug --target` يُلحق container مؤقتًا فيه أدوات بـ Pod يعمل، وهكذا تفحص الـ images من نوع distroless."
  - ‏Pod الإنتاج يعمل كمستخدم غير root، دون تصعيد للصلاحيات، مع نظام ملفات جذري للقراءة فقط، وبعد إسقاط كل الـ capabilities.
further:
  - title: Gateway API
    url: https://kubernetes.io/docs/concepts/services-networking/gateway/
  - title: Debug Running Pods
    url: https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/
  - title: Configure a Security Context for a Pod or Container
    url: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
  - title: Ingress NGINX Retirement
    url: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/
quiz:
  - q: يشغّل فريق المنصّة لديكم Gateway مشتركًا في الـ namespace ‏`infra`. ماذا تنشئ أنت، بصفتك فريق notes-api، لعرض `notes.skylane.example`؟
    options:
      - text: ‏GatewayClass جديدًا لـ notes-api.
        why: الـ GatewayClasses تصف أداة تنفيذ (implementation)، ويضبطها فريق المنصّة عادةً مرة واحدة لكل cluster.
      - text: ‏HTTPRoute في الـ namespace ‏`notes` يشير إلى الـ Gateway المشترك في `parentRefs` وإلى الـ Service ‏`notes-api` في `backendRefs`.
        why: صحيح. الـ Routes تخصّ فرق التطبيقات؛ والـ Gateway يقرّر (عبر `allowedRoutes`) أي namespaces يمكنها الارتباط به.
      - text: ‏Gateway ثانيًا يستمع على المنفذ 443.
        why: هذا يكرّر نقطة الدخول الخاصة بالمنصّة وإعداد TLS فيها. اربط route بالـ Gateway الموجود.
      - text: ‏Service من نوع LoadBalancer لـ notes-api.
        why: هذا يتجاوز نقطة الدخول المشتركة ويعطيك عنوانًا عامًا منفصلًا عليك إدارته.
    answer: 1
  - q: ‏Pod يُظهر الحالة `ImagePullBackOff`. ما الخطوة التالية الأكثر فائدة؟
    options:
      - text: "`kubectl logs <pod>`"
        why: الـ container لم يبدأ أصلًا، فلا توجد سجلات لقراءتها.
      - text: "`kubectl rollout restart deployment/notes-api`"
        why: الـ Pods الجديدة ستفشل في سحب الـ image نفسها بالطريقة نفسها.
      - text: "`kubectl debug -it <pod> --image=busybox:1.37`"
        why: لا يوجد container يعمل لتلتحق به، والمشكلة في السحب، لا في تشغيل الـ Pod.
      - text: "الأمر `kubectl describe pod <pod>` ثم قراءة خطأ السحب في الأحداث، كـ tag خاطئ، أو بيانات اعتماد registry مفقودة، أو عدم وجود image لهذه المعمارية."
        why: صحيح. الأحداث تذكر بالضبط لماذا لم يستطع الـ kubelet السحب.
    answer: 3
  - q: ‏notes-api في حالة `CrashLoopBackOff`. والأمر `kubectl logs <pod>` لا يعرض إلا سطرًا أو اثنين من مخرجات البدء. ماذا تشغّل؟
    options:
      - text: "‏`kubectl logs <pod> --previous`، لقراءة مخرجات نسخة الـ container التي انهارت."
        why: صحيح. النسخة الحالية ربما بدأت للتوّ. أما `--previous` فيعرض مخرجات النسخة السابقة، بما فيها الخطأ الذي قتلها.
      - text: "‏`kubectl delete pod <pod>`، حتى يبدأ من جديد."
        why: البديل يشغّل الـ image نفسها بالإعدادات نفسها وينهار بالطريقة نفسها، وتكون قد أضعت الأدلّة.
      - text: "`kubectl scale deployment/notes-api --replicas=0`"
        why: هذا يوقف حلقة الانهيار بإيقاف الخدمة، دون أن يخبرك بأي شيء.
      - text: "`kubectl get nodes`"
        why: صحة الـ nodes نادرًا ما تسبّب حلقة انهيار في تطبيق واحد؛ مخرجات التطبيق نفسه هي نقطة البداية.
    answer: 0
  - q: الـ image الخاصة بـ notes-api من نوع distroless، فيفشل `kubectl exec -it <pod> -- sh`. كيف تتحقّق من تحليل DNS من داخل الـ Pod؟
    options:
      - text: أعِد بناء الـ image مع shell، وانشرها، ثم حاول مجددًا.
        why: هذا يغيّر الشيء الذي تشخّصه ويستغرق دورة إصدار كاملة.
      - text: استخدم `kubectl port-forward` وشغّل `nslookup` على حاسوبك.
        why: هذا يحلّ الأسماء بـ DNS حاسوبك، لا بـ DNS الـ Pod.
      - text: "‏`kubectl debug -it <pod> --image=busybox:1.37 --target=api`، ثم شغّل `nslookup notes-db` داخل container التشخيص."
        why: صحيح. الـ ephemeral container يتشارك الـ network namespace الخاصة بالـ Pod (ومع `--target` يرى عملياته أيضًا)، ويجلب الأدوات التي تفتقر إليها الـ image.
      - text: اقرأ `/etc/resolv.conf` بـ `kubectl logs`.
        why: السجلات تعرض ما طبعته العملية، لا الملفات داخل الـ container.
    answer: 2
---

شيئان يقفان بين notes-api والمستخدمين الحقيقيين. لا يمكن الوصول إليه من الإنترنت بعد، وحين ينكسر شيء في الثالثة فجرًا، تحتاج إلى معرفة ما هو خلال دقائق. هذا الدرس يغطّي الأمرين، وينتهي بإعدادات الأمان التي تكمل صورة الإنتاج.

## إدخال حركة HTTP

‏Service من نوع `LoadBalancer` لكل تطبيق يصلح لخدمة واحدة. أما مع عشر خدمات، فأنت تدفع ثمن عشرة موازنات أحمال، وتدير عشر شهادات، والتوجيه حسب اسم المضيف أو المسار مستحيل. ما تريده نقطة دخول واحدة مشتركة توجّه طلبات HTTP إلى الـ Service الصحيح.

لسنوات كانت الإجابة **Ingress**. ما زال يعمل، لكن واجهة Ingress البرمجية مجمَّدة ولا تحصل على ميزات جديدة، والـ controller المجتمعي الواسع الانتشار ingress-nginx تقاعد في مارس 2026: لا إصدارات جديدة ولا إصلاحات أمنية. مشروع Kubernetes يوجّه العمل الجديد نحو **Gateway API**، المتاح رسميًا (GA) بالإصدار `gateway.networking.k8s.io/v1`. يُثبَّت كإضافة (الـ CRDs الخاصة به مع أداة تنفيذ (implementation)، مثل controller موازن الأحمال في منصّتك السحابية، أو Envoy Gateway، أو Cilium، أو Istio)، وكثير من الـ clusters المُدارة توفّره جاهزًا.

يقسّم Gateway API المهمّة حسب الأدوار:

- **GatewayClass**: أي أداة تنفيذ تتولّى الحركة. يضبطه مرة واحدة من يشغّل الـ cluster.
- **Gateway**: نقطة دخول فيها listeners ومنافذ وأسماء مضيفات وشهادات TLS. يملكها فريق المنصّة.
- **HTTPRoute**: قواعد التوجيه لتطبيق واحد، مرتبطة بـ Gateway. يملكها فريق التطبيق.

:::figure كل فريق يملك طبقته، والـ routes ترتبط بـ Gateway مشترك
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">مشغّل الـ cluster يختار الـ GatewayClass. الـ Gateway المسمّى public في الـ namespace ‏infra ينهي TLS على المنفذ 443. الـ HTTPRoute ‏notes-api في الـ namespace ‏notes يرتبط به ويرسل طلبات notes.skylane.example إلى الـ Service ‏notes-api، الذي يحوّلها إلى الـ Pods.</title>
  <rect class="d-box" x="10" y="80" width="120" height="60" rx="10"/>
  <text class="d-label" x="70" y="106" text-anchor="middle">GatewayClass</text>
  <text class="d-label-muted" x="70" y="126" text-anchor="middle">مشغّل الـ cluster</text>
  <rect class="d-box-primary" x="155" y="80" width="130" height="60" rx="10"/>
  <text class="d-label" x="220" y="106" text-anchor="middle">Gateway :443</text>
  <text class="d-label-muted" x="220" y="126" text-anchor="middle">فريق المنصّة</text>
  <rect class="d-box-accent" x="310" y="80" width="140" height="60" rx="10"/>
  <text class="d-label" x="380" y="106" text-anchor="middle">HTTPRoute</text>
  <text class="d-label-muted" x="380" y="126" text-anchor="middle">فريق notes</text>
  <rect class="d-box-success" x="475" y="80" width="100" height="60" rx="10"/>
  <text class="d-label" x="525" y="115" text-anchor="middle">Service</text>
  <rect class="d-box-success" x="600" y="80" width="90" height="60" rx="10"/>
  <text class="d-label" x="645" y="115" text-anchor="middle">Pods</text>
  <path class="d-arrow" d="M130 110 L153 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M285 110 L308 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M450 110 L473 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M575 110 L598 110" marker-end="url(#arrow)"/>
  <text class="d-code" x="380" y="175" text-anchor="middle">notes.skylane.example → notes-api:80</text>
</svg>
:::

الـ Gateway الخاص بفريق المنصّة، مرة واحدة لكل cluster:

```yaml title=infra/gateway.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: public
  namespace: infra
spec:
  gatewayClassName: skylane-lb        # provided by your implementation
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      hostname: "*.skylane.example"
      tls:
        mode: Terminate
        certificateRefs:
          - name: skylane-wildcard-tls
      allowedRoutes:
        namespaces:
          from: All
```

والـ route الخاص بك، في الـ namespace ‏`notes`:

```yaml title=k8s/httproute.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: notes-api
  namespace: notes
spec:
  parentRefs:
    - name: public
      namespace: infra
  hostnames:
    - notes.skylane.example
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: notes-api
          port: 80
```

الأمر `kubectl describe httproute notes-api` يُظهر تحت `Status` هل قبل الـ Gateway هذا الـ route. وإذا كنت تنقل كائنات Ingress موجودة، فالأداة `ingress2gateway` تحوّلها، بما في ذلك كثير من annotations الخاصة بـ ingress-nginx.

## دليل التشخيص

حين يسيء notes-api التصرّف، قاوم التخمين. اتّبع الترتيب نفسه في كل مرة، ودع كل خطوة تختار التالية:

```bash
kubectl get pods -l app.kubernetes.io/name=notes-api
kubectl describe pod <pod>
kubectl logs <pod> --previous
kubectl events --for pod/<pod> --types=Warning
```

العمود `STATUS` يخبرك أين تنظر:

| الحالة | ماذا تعني | أين تنظر |
|---|---|---|
| `Pending` | لا يوجد node يستطيع استقبال الـ Pod | ‏`describe`: أحداث مثل `Insufficient cpu` أو node selectors غير مطابقة |
| `ImagePullBackOff` | لا يستطيع الـ kubelet سحب الـ image | ‏`describe`: ‏tag خاطئ، أو بيانات اعتماد سحب مفقودة، أو معمارية خاطئة |
| `CreateContainerConfigError` | مفتاح ConfigMap أو Secret مُشار إليه مفقود | ‏`describe` يسمّي المفتاح |
| `CrashLoopBackOff` | التطبيق يبدأ ويخرج، مرارًا | ‏`logs --previous`، مع رمز الخروج في `describe` ‏(137 = نفاد ذاكرة أو قتل) |
| `Running` مع `0/1` جاهز | الـ readiness probe يفشل | ‏`describe` يُظهر إخفاقات الـ probe؛ تحقّق مما يعتمد عليه `/readyz` |

إذا كانت الـ Pods سليمة لكن الطلبات تفشل، فاعمل من الداخل إلى الخارج: ‏`kubectl get endpointslices -l kubernetes.io/service-name=notes-api` (الفراغ يعني مشكلة في الـ selector أو الجاهزية)، ثم حالة الـ route، ثم الـ Gateway.

الـ images من نوع distroless لا تحتوي على shell، فلا يفيد `kubectl exec`. ألحِق **ephemeral debug container** (container تشخيص مؤقتًا) بدلًا من ذلك. ينضمّ إلى الـ network namespace الخاصة بالـ Pod، ومع `--target` يستطيع رؤية عمليات التطبيق أيضًا:

```bash
kubectl debug -it <pod> --image=busybox:1.37 --target=api
# inside: nslookup notes-db, wget -qO- localhost:3000/readyz, ps
```

:::mistake حذف الأدلّة
ردّ الفعل التلقائي أثناء الحادث هو `kubectl delete pod` «ليُعاد تشغيله نظيفًا». البديل ينهار بالطريقة نفسها، وسجلات الـ container السابق وأحداثه تذهب مع الـ Pod القديم. اقرأ `describe` و`logs --previous` أولًا. إعادة التشغيل تأتي بعد أن تعرف السبب.
:::

## القطعة الأخيرة: الـ securityContext

في الدرس 2.2 شغّلت الـ image كمستخدم غير root ووعدت بفرض ذلك في الـ cluster. ها هو ذا، على container ‏notes-api:

```yaml title=k8s/deployment.yaml
          securityContext:
            runAsNonRoot: true
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
```

الحقل `runAsNonRoot` يجعل الـ kubelet يرفض بدء الـ container إذا كانت الـ image ستعمل بـ UID 0. إنه يفحص UID رقميًا، لذا فإن image يكون فيها `USER` اسمًا مثل `node` تفشل بـ `CreateContainerConfigError`؛ اكتب `USER 1000` في الـ Dockerfile أو أضف `runAsUser: 1000` هنا. وأعطِ التطبيق volume من نوع `emptyDir` في `/tmp` إن احتاج إلى مساحة مؤقتة تحت نظام ملفات جذري للقراءة فقط.

بهذا يكتمل مسار notes-api: بناء multi-stage يستفيد من الـ cache، وimage صغيرة بمستخدم غير root مثبّتة بالـ digest ومفحوصة، وبيئة Compose للتطوير، وDeployment مع probes وموارد وتوسّع تلقائي وrollouts آمنة وroute عبر Gateway وsecurity context محصّن. كل واحد من هذه الإعدادات موجود في الملف لأن حادثًا ما علّم أحدهم أنه ضروري. حافظ على هذه العادة: حين ينكسر شيء، اسأل أي إعداد كان سيجعله مستحيلًا، وأضِفه.
