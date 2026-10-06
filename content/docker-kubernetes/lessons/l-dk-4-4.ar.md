---
summary: انقل إعدادات notes-api إلى ConfigMap وبيانات اعتماده إلى Secret، وضع كل شيء في namespace اسمه `notes`، وشغّل سير عمل apply وdiff قابلًا للمراجعة من مجلد k8s.
takeaways:
  - الـ ConfigMaps تحفظ الإعدادات غير الحسّاسة؛ والـ Secrets تحفظ بيانات الاعتماد، وتُحقن كمتغيّرات بيئة أو كملفات مركّبة.
  - قيم الـ Secret مرمّزة بـ base64 فقط، لا مشفّرة؛ احمِها بـ RBAC، وبالتشفير أثناء التخزين، وبإبقائها خارج Git.
  - متغيّرات البيئة القادمة من ConfigMap أو Secret تُقرأ مرة واحدة عند بدء الـ container، لذا أعِد تشغيل الـ Deployment بعد تغييرها.
  - الـ Namespaces تحدّد نطاق الأسماء والصلاحيات والحصص لفريق أو تطبيق، لكنها لا تعزل حركة الشبكة وحدها.
  - "تشغيل `kubectl diff -f k8s/` قبل `kubectl apply -f k8s/` يُظهر بالضبط ما سيتغيّر، مثل pull request للـ cluster."
further:
  - title: ConfigMaps
    url: https://kubernetes.io/docs/concepts/configuration/configmap/
  - title: Secrets
    url: https://kubernetes.io/docs/concepts/configuration/secret/
  - title: Good practices for Kubernetes Secrets
    url: https://kubernetes.io/docs/concepts/security/secrets-good-practices/
  - title: Namespaces
    url: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
quiz:
  - q: يحفظ زميلك في Git ملف manifest لـ Secret قيم `data` فيه نصوص base64، قائلًا «لا بأس، إنها مرمّزة». ما المشكلة؟
    options:
      - text: قيم base64 يجب أن تكون في `stringData` لا في `data`.
        why: العكس هو الصحيح؛ ‏`data` يأخذ base64 و`stringData` يأخذ نصًّا صريحًا. الصيغة ليست المشكلة.
      - text: الـ base64 ترميز يستطيع أي شخص عكسه بـ `base64 -d`، فبيانات الاعتماد الآن في سجلّ Git وكأنها نصّ صريح.
        why: صحيح. اعتبر السرّ مسرّبًا، ودوّره، وأبقِ قيم الـ Secrets خارج Git (استخدم مدير أسرار أو أدوات تشفير).
      - text: يرفض Kubernetes الـ Secrets المحفوظة في Git.
        why: لا يرى Kubernetes سجلّ Git لديك. سيقبل الـ manifest بكل سرور.
      - text: الـ base64 يجعل القيم أطول من أن تصلح لمتغيّرات البيئة.
        why: يفكّ Kubernetes ترميز القيم قبل حقنها؛ والطول ليس المشكلة.
    answer: 1
  - q: تغيّر `LOG_LEVEL` في الـ ConfigMap ‏`notes-api-config` وتطبّقه. الـ Pods تستهلكه عبر `envFrom`. ماذا يحدث؟
    options:
      - text: يلتقط كل Pod القيمة الجديدة خلال دقيقة.
        why: الـ ConfigMap المركّب *كملفات* هو الذي يتحدّث مع الوقت؛ أما متغيّرات البيئة فلا تتغيّر أبدًا في container يعمل.
      - text: ينشر الـ Deployment تلقائيًا Pods جديدة.
        why: تغيير الـ ConfigMap لا يمسّ قالب الـ Pod في الـ Deployment، فلا يبدأ أي rollout.
      - text: لا شيء يتغيّر في الـ Pods العاملة حتى يُعاد تشغيلها؛ شغّل `kubectl rollout restart deployment/notes-api`.
        why: صحيح. متغيّرات البيئة تُضبط عند بدء الـ container. والـ rollout restart يستبدل الـ Pods تدريجيًا بالقيم الجديدة.
      - text: تنهار الـ Pods لأن بيئتها تغيّرت من تحتها.
        why: العمليات العاملة تحتفظ ببيئتها؛ ولا يُدفع إليها أي شيء.
    answer: 2
  - q: ‏Pod جديد عالق بحالة `CreateContainerConfigError`. ما السبب الأرجح؟
    options:
      - text: الـ Pod يشير إلى مفتاح في Secret أو ConfigMap غير موجود.
        why: صحيح. لا يستطيع الـ kubelet بناء بيئة الـ container، فلا يبدأ أبدًا. والأمر `kubectl describe pod` يسمّي المفتاح المفقود.
      - text: لا يمكن سحب الـ image من الـ registry.
        why: هذا يظهر كـ `ErrImagePull` أو `ImagePullBackOff`.
      - text: انهار التطبيق عند البدء.
        why: الانهيار بعد البدء يظهر كـ `CrashLoopBackOff`، مع سجلات يمكن قراءتها.
      - text: نفدت ذاكرة الـ node.
        why: الـ Pod الذي لا يمكن وضعه لنقص الموارد يبقى `Pending` مع حدث جدولة.
    answer: 0
  - q: ‏notes-api وخدمة مدفوعات يعملان في namespaces منفصلة على الـ cluster نفسه. هل يستطيع Pod من notes-api فتح اتصال بالـ Service الخاص بقاعدة بيانات المدفوعات؟
    options:
      - text: لا، الـ namespaces تحجب كل الحركة بينها.
        why: الـ namespaces تحدّد نطاق الأسماء والصلاحيات. ودون NetworkPolicy تستطيع الـ Pods الوصول إلى الـ Services في أي namespace.
      - text: فقط إذا كان لكلا الـ namespaces الـ labels نفسها.
        why: الـ labels الخاصة بالـ namespace تهمّ في selectors الـ NetworkPolicy، لكن دون سياسة لا يوجد أي تقييد.
      - text: فقط عبر Service من نوع LoadBalancer.
        why: الـ Services من نوع ClusterIP يمكن الوصول إليها من كل namespace في الـ cluster افتراضيًا.
      - text: نعم، افتراضيًا؛ استخدم NetworkPolicy (مع إضافة شبكة تفرضها) لتقييد ذلك.
        why: صحيح. الـ namespaces ليست حدًّا شبكيًا. والـ NetworkPolicies هي طريقة إضافة هذا الحدّ.
    answer: 3
---

حاليًا، الـ Deployment الخاص بـ notes-api مكتوب فيه `PORT`، والـ Deployment الخاص بقاعدة البيانات فيه كلمة المرور نصًّا صريحًا، وكل شيء يعيش في الـ namespace ‏`default` بجوار كل ما يجرّبه الآخرون في هذا الـ cluster. هذه ثلاث طرق لإحداث حادث: غيّر إعدادًا فتضطر إلى تعديل حمل العمل؛ اقرأ المستودع فتحصل على كلمة المرور؛ شغّل `kubectl delete` متهوّرًا في `default` فتصيب عمل شخص آخر.

## ‏namespace لـ notes-api

الـ **namespace** (نطاق الأسماء) نطاق للأسماء. يستطيع فريقان أن يملك كل منهما Deployment اسمه `api` في namespaces مختلفة. والـ namespaces هي أيضًا حيث تربط الصلاحيات (RBAC) وحصص الموارد، ما يجعلها الوحدة الطبيعية لـ «تطبيق واحد» أو «فريق واحد».

```yaml title=k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: notes
```

أضف `namespace: notes` إلى `metadata` في كل كائن آخر في `k8s/`، ثم اجعله الافتراضي لهذا الـ context حتى لا تكتب `-n notes` في كل مرة:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl config set-context --current --namespace=notes
```

ما لا تفعله الـ namespaces هو عزل الشبكة. يستطيع Pod في `notes` الاتصال بـ Service في أي namespace آخر ما لم تقل **NetworkPolicy** غير ذلك، وتفرضها إضافة الشبكة في الـ cluster لديك. لا تعامل الـ namespace كجدار أمني بمفرده.

## الـ ConfigMaps للإعدادات

الـ **ConfigMap** يحفظ إعدادات مفتاح-قيمة غير حسّاسة:

```yaml title=k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: notes-api-config
  namespace: notes
data:
  PORT: "3000"
  LOG_LEVEL: info
```

القيم نصوص دائمًا، ولهذا وُضعت `"3000"` بين علامتَي تنصيص. الآن تستطيع image ‏notes-api نفسها العمل بسجلات `info` في الإنتاج و`debug` في staging، بتطبيق ConfigMap مختلف بدلًا من بناء image مختلفة.

## الـ Secrets لبيانات الاعتماد

الـ **Secret** له شكل الـ ConfigMap نفسه، لكنه مخصّص للقيم الحسّاسة. أنشئه من سطر الأوامر (أو من مدير الأسرار لديك) بدلًا من ملف محفوظ في المستودع:

```bash
kubectl create secret generic notes-db \
  --from-literal=POSTGRES_PASSWORD='dev-only-change-me' \
  --from-literal=DATABASE_URL='postgres://notes:dev-only-change-me@notes-db:5432/notes'
```

وهنا الجزء المزعج. انظر إلى ما هو مخزّن:

```bash
kubectl get secret notes-db -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d
```

تعود القيمة مباشرة. بيانات الـ Secret **مرمّزة بـ base64، لا مشفّرة**. ما يجعل الـ Secrets أكثر أمانًا من الـ ConfigMaps هو كل ما يحيط بها: يستطيع RBAC منح صلاحية قراءة الـ ConfigMaps دون الـ Secrets، ويستطيع الـ cluster تشفير الـ Secrets أثناء تخزينها في etcd (والمزوّدون المُدارون يفعلون ذلك عادةً)، ولا تستلم الـ kubelets إلا الـ Secrets الخاصة بالـ Pods المُجدولة على الـ node الخاص بها.

:::mistake ملفات Secret في Git
ملف YAML لـ Secret بقيم base64 في مستودع هو كلمة مرور صريحة مع خطوة إضافية واحدة. دوّرت بيانات اعتماد لهذا السبب أكثر من أي سبب آخر. أبقِ القيم الحقيقية خارج Git: أنشئ الـ Secrets من مدير أسرار عبر أداة مثل External Secrets Operator، أو احفظ فقط صيغًا مشفّرة بأداة مبنية لذلك، واعتبر كل ما حُفظ سابقًا مسرّبًا.
:::

## ربطها بـ notes-api

حدّث الـ container في `k8s/deployment.yaml`:

```yaml title=k8s/deployment.yaml
      containers:
        - name: api
          image: ghcr.io/skylane/notes-api:1.4.0
          ports:
            - name: http
              containerPort: 3000
          envFrom:
            - configMapRef:
                name: notes-api-config
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: notes-db
                  key: DATABASE_URL
```

الحقل `envFrom` يحوّل كل مفتاح في الـ ConfigMap إلى متغيّر بيئة. و`secretKeyRef` يسحب مفتاحًا واحدًا من الـ Secret. وفي `k8s/db.yaml`، استبدل القيمة الحرفية لـ `POSTGRES_PASSWORD` بـ `secretKeyRef` إلى الـ Secret نفسه.

إذا لم يكن المفتاح المُشار إليه موجودًا، فلن يبدأ الـ container أبدًا. يُظهر الـ Pod الحالة `CreateContainerConfigError`، ويسمّي `kubectl describe pod` المفتاح المفقود.

يمكن أيضًا **تركيب** الـ Secrets والـ ConfigMaps **كملفات** عبر volume. الملفات المركّبة تتحدّث في الـ Pods العاملة بعد تأخير قصير؛ أما متغيّرات البيئة فثابتة منذ بدء الـ container. بعد تغيير إعدادات تصل عبر متغيّرات البيئة، أعِد تشغيل الـ Pods تدريجيًا:

```bash
kubectl rollout restart deployment/notes-api
```

## سير العمل اليومي

مجلد `k8s/` لديك يحتوي الآن على `namespace.yaml` و`configmap.yaml` و`db.yaml` و`deployment.yaml` و`service.yaml`. والحلقة لكل تغيير هي نفسها:

```bash
kubectl diff -f k8s/
kubectl apply -f k8s/
kubectl get all -l app.kubernetes.io/name=notes-api
```

الأمر `diff` هو خطوة المراجعة: يُظهر ما سيتغيّر على الـ cluster الحيّ، حقلًا بحقل، قبل أن تغيّره. اجعله عادة وستلتقط التعديل الشارد الذي كان سيعيد ضبط إصلاح طارئ أجراه أحدهم. وحين تحتاج إلى قيم مختلفة لكل بيئة، فإن Kustomize (المدمج في kubectl كـ `kubectl apply -k`) يضع طبقات صغيرة (overlays) فوق هذه الملفات الأساسية؛ وHelm، في الدرس 5.3، هو الإجابة الشائعة الأخرى.

:::tip الـ Labels لغة الاستعلام لديك
ضع `app.kubernetes.io/name` على كل شيء، و`app.kubernetes.io/part-of: notes` إذا كان التطبيق مكوّنًا من عدّة مكوّنات. عندها يعرض `kubectl get all,cm,secret -l app.kubernetes.io/part-of=notes` النظام كاملًا بأمر واحد، ويصبح التنظيف على بُعد `kubectl delete -l` واحد.
:::

يعمل notes-api الآن على Kubernetes بشبكة وإعدادات سليمة. لكنه ليس جاهزًا للإنتاج بعد: لا يعرف Kubernetes هل هو سليم، ولا كم يحتاج من المعالج، ولا كيف يحدّثه بأمان. القسم الخامس يغطّي الثلاثة.
