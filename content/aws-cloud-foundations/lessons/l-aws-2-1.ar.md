---
summary: ميّز بين مستخدمي IAM والمجموعات والـ roles، واعرف أين تُرفق السياسات القائمة على الهوية والسياسات القائمة على المورد، وتوقّع هل تسمح AWS بطلب ما باستخدام قاعدة الرفض والسماح والرفض.
takeaways:
  - يحمل كل طلب إلى AWS أربعة أشياء، هي الـ principal والإجراء والـ ARN الخاص بالمورد والسياق، ويقيّمها IAM كلها قبل أن يحدث أي شيء.
  - المستخدمون هويات طويلة الأمد، والمجموعات وسيلة لمنح المستخدمين السياسات نفسها، والـ roles هويات بلا بيانات اعتماد طويلة الأمد يتقمّصها principals موثوقون للحصول على بيانات اعتماد مؤقتة.
  - تُرفق السياسات القائمة على الهوية بالمستخدمين والمجموعات والـ roles؛ أما السياسات القائمة على المورد، مثل سياسات الـ buckets في S3، فتُرفق بالمورد وتسمّي principal.
  - كل شيء مرفوض افتراضيًا، ويلزم سماح صريح لإجازة أي طلب، والرفض الصريح في أي مكان ينتصر دائمًا.
further:
  - title: IAM identities (users, user groups, and roles)
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/id.html
  - title: Policy evaluation logic
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html
  - title: IAM identifiers (ARNs)
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-identifiers.html
quiz:
  - q: ليس لدى Sam، المطوّر في Lantern، أي سياسات تذكر DynamoDB. شغّل Sam الأمر `aws dynamodb scan --table-name lantern-rsvps`. ماذا يحدث؟
    options:
      - text: ينجح، لأن لا شيء يرفضه.
        why: يعمل IAM بمبدأ الرفض الافتراضي. يحتاج الطلب إلى سماح صريح من سياسة ما، ولا شيء يسمح بهذا الطلب.
      - text: يُرفض، لأن لا سياسة تسمح بالإجراء (رفض ضمني).
        why: صحيح. في غياب سماح مطابق، يبقى الرفض الافتراضي قائمًا ويعيد الـ CLI خطأ AccessDenied.
      - text: ينجح فقط إذا سجّل Sam الدخول باستخدام MFA.
        why: لا يهمّ MFA إلا عندما يتحقّق منه شرط في سياسة ما. ولا يستطيع أن يخلق صلاحيات لا تمنحها أي سياسة.
    answer: 1
  - q: سياسة تسمح بـ `s3:*` على الـ bucket الخاص بملصقات Lantern لمجموعة Developers، وسياسة ثانية ترفض صراحةً `s3:DeleteBucket` للمجموعة نفسها. حاول مطوّر حذف الـ bucket. ماذا يحدث؟
    options:
      - text: يُرفض، لأن الرفض الصريح يتغلّب على أي سماح.
        why: صحيح. عبارات الرفض تُفحص أولًا وتنتصر دائمًا، ما يجعلها حاجز حماية موثوقًا.
      - text: ينجح، لأن السماح الأعمّ أُرفق أولًا.
        why: ترتيب الإرفاق وترتيب العبارات لا يهمّان. يقيّم IAM كل السياسات المنطبقة معًا.
      - text: ينجح، لأن `s3:*` أقوى من إجراء منفرد.
        why: الرموز البديلة (wildcards) توسّع فقط ما يطابقه السماح. ولا تتفوّق أبدًا على الرفض.
    answer: 0
  - q: أيّ عبارة عن الـ roles في IAM صحيحة؟
    options:
      - text: للـ role كلمة مرور خاصة به، تشاركها مع الفريق الذي يستخدمه.
        why: ليس للـ roles كلمة مرور ولا مفاتيح وصول طويلة الأمد. وهذه ميزتها الأمنية الرئيسية.
      - text: الـ role نوع من المجموعات، لذا تضيف المستخدمين إليه.
        why: المجموعات تحتوي مستخدمين؛ أما الـ roles فلا. يتقمّص الـ principal الـ role ويحصل على صلاحياته طوال الجلسة.
      - text: يتقمّص الـ role principal موثوق، فيحصل على بيانات اعتماد مؤقتة تنتهي صلاحيتها.
        why: صحيح. تحدّد سياسة الثقة (trust policy) الخاصة بالـ role من يحق له تقمّصه، وتُصدر AWS STS بيانات اعتماد تنتهي بعد مدة الجلسة.
      - text: لا يمكن أن تستخدم الـ role إلا خدمات AWS، ولا يستخدمه البشر أبدًا.
        why: يتقمّص الناس الـ roles طوال الوقت، مثلًا عبر IAM Identity Center أو عند تبديل الـ role في الـ console.
    answer: 2
---

في نهاية القسم الأول شغّلت `aws sts get-caller-identity` فأجابت AWS. خلف تلك الإجابة، وخلف كل استدعاء آخر، يقف **AWS Identity and Access Management (IAM)**. إنه يجيب عن سؤال واحد مليارات المرات يوميًا: هل يحق لـ *هذا* الـ principal أن ينفّذ *هذا* الإجراء على *هذا* المورد، الآن؟ كان لخادم Lantern القديم جواب واحد لكل شيء: من يملك مفتاح SSH يستطيع فعل أي شيء. يمنحك هذا الدرس المفردات اللازمة لتفعل ما هو أفضل.

## تشريح الطلب

كل طلب إلى AWS، سواء من الـ console أو الـ CLI أو الكود، يحمل أربعة أشياء:

- **الـ principal (الجهة الطالبة)**: من يسأل. مستخدم، أو جلسة role، أو خدمة من خدمات AWS.
- **الإجراء (action)**: ما يريده، ويُكتب بالشكل `service:Operation`، مثل `s3:GetObject` أو `dynamodb:PutItem`.
- **المورد (resource)**: ما يريد تنفيذ الإجراء عليه، ويُعرَّف بـ **ARN** (اسم مورد Amazon).
- **السياق (context)**: كل ما يستطيع IAM رؤيته غير ذلك، مثل عنوان IP المصدر، والوقت، وهل استُخدم MFA، وهل استخدم الطلب TLS.

تتبع الـ ARNs النمط `arn:partition:service:region:account-id:resource`. وتبقى بعض الأجزاء فارغة حين لا تنطبق:

```text
arn:aws:iam::111122223333:user/amara
arn:aws:s3:::lantern-posters/2026/street-food-festival.jpg
arn:aws:dynamodb:eu-west-1:111122223333:table/lantern-rsvps
```

IAM خدمة عامّة (global)، لذا لا يحتوي ARN المستخدم على Region. وأسماء الـ buckets في S3 فريدة على مستوى AWS كلها، لذا لا يحتوي ARN الخاص بـ S3 على Region ولا على حساب. أما جداول DynamoDB فإقليمية وتنتمي إلى حساب، لذا يحتوي الـ ARN الخاص بها على الاثنين. ستكتب الـ ARNs باستمرار في الدرس القادم.

## الهويات

**المستخدمون (users)** هويات طويلة الأمد لشخص واحد، أو لتطبيق واحد في الإعدادات القديمة. يمكن أن يكون للمستخدم كلمة مرور للـ console وما يصل إلى مفتاحَي وصول. المستخدمون أقدم أجزاء IAM، وفي القسم الأول أنشأت واحدًا فقط، هو المدير.

**المجموعات (groups)** تجمّعات من المستخدمين. ترفق السياسات بالمجموعة، فيحصل عليها كل أعضائها. ينشئ Lantern المجموعات `Admins` و`Developers` و`Billing`، فعندما ينضم متطوّع أو يغادر، تغيّر عضوية واحدة بدلًا من البحث في الصلاحيات الفردية. المجموعات ليست principals: لا يمكنك تسجيل الدخول كمجموعة، ولا تسمية مجموعة في سياسة bucket.

**الـ roles** هويات لها صلاحيات لكن **بلا بيانات اعتماد طويلة الأمد**. يتقمّص principal موثوق الـ role، فتعيد AWS Security Token Service (STS) بيانات اعتماد مؤقتة تنتهي صلاحيتها. وتحدّد **سياسة الثقة (trust policy)** الخاصة بالـ role من يحق له تقمّصه: دالة Lambda، أو instance في EC2، أو مستخدم في حساب آخر، أو أشخاص سجّلوا الدخول عبر IAM Identity Center. الـ roles هي الطريقة التي يحصل بها الكود على صلاحيات دون أسرار، والدرس الثالث من هذا القسم يبني عليها.

```bash
aws iam create-group --group-name Developers
aws iam attach-group-policy --group-name Developers \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
aws iam add-user-to-group --group-name Developers --user-name sam
```

## أين تعيش السياسات

**السياسة (policy)** مستند JSON من العبارات (statements) التي تسمح بإجراءات على موارد أو ترفضها. ومكان إرفاقها يغيّر طريقة قراءتها:

- **السياسات القائمة على الهوية (identity-based policies)** تُرفق بمستخدم أو مجموعة أو role، وتصف ما يحق لـ *تلك الهوية* فعله. وتأتي على شكل سياسات تديرها AWS (مثل `ReadOnlyAccess`)، أو سياسات يديرها العميل تكتبها وتعيد استخدامها، أو سياسات مضمّنة (inline) مدمجة في هوية واحدة.
- **السياسات القائمة على المورد (resource-based policies)** تُرفق بمورد وتسمّي **الـ principal** الذي تنطبق عليه. سياسة الـ bucket في S3، وسياسة المورد الخاصة بدالة Lambda، وسياسة الثقة الخاصة بالـ role، كلها قائمة على المورد.

داخل حساب واحد، يُسمح بالطلب إذا سمح به أيٌّ من النوعين ولم يرفضه شيء. أما عبر الحسابات، فيجب أن يسمح به الطرفان.

## كيف يقرّر IAM

قاعدة التقييم تتّسع لها بطاقة صغيرة، وهي تفسّر تقريبًا كل خطأ AccessDenied ستصادفه.

:::figure الرفض الصريح ينتصر، ثم أي سماح، وإلا فالرفض الافتراضي
<svg viewBox="0 0 660 250" role="img" aria-labelledby="t1">
  <title id="t1">مخطّط انسيابي. يفحص الطلب أولًا وجود أي رفض صريح؛ فإن وُجد كانت النتيجة الرفض. وإلا يفحص وجود أي سماح؛ فإن وُجد كانت النتيجة السماح، وإلا كانت النتيجة رفضًا ضمنيًا.</title>
  <rect class="d-box" x="20" y="96" width="120" height="56" rx="10"/>
  <text class="d-label" x="80" y="129" text-anchor="middle">الطلب</text>
  <path class="d-arrow" d="M140 124 L186 124" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="190" y="90" width="150" height="68" rx="10"/>
  <text class="d-label" x="265" y="119" text-anchor="middle">Deny صريح</text>
  <text class="d-label" x="265" y="139" text-anchor="middle">في أي مكان؟</text>
  <path class="d-arrow" d="M265 90 L265 50" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="278" y="74">نعم</text>
  <rect class="d-box-warn" x="200" y="10" width="130" height="38" rx="8"/>
  <text class="d-label-strong" x="265" y="35" text-anchor="middle">مرفوض</text>
  <path class="d-arrow" d="M340 124 L386 124" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="352" y="114">لا</text>
  <rect class="d-box-primary" x="390" y="90" width="150" height="68" rx="10"/>
  <text class="d-label" x="465" y="119" text-anchor="middle">هل يطابق</text>
  <text class="d-label" x="465" y="139" text-anchor="middle">أيُّ Allow؟</text>
  <path class="d-arrow" d="M540 124 L580 124" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="546" y="114">نعم</text>
  <rect class="d-box-success" x="584" y="105" width="70" height="38" rx="8"/>
  <text class="d-label-strong" x="619" y="130" text-anchor="middle">مسموح</text>
  <path class="d-arrow" d="M465 158 L465 196" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="476" y="182">لا</text>
  <rect class="d-box" x="380" y="200" width="170" height="40" rx="8"/>
  <text class="d-label-strong" x="465" y="225" text-anchor="middle">مرفوض ضمنيًا</text>
</svg>
:::

1. **الرفض الافتراضي.** كل طلب يبدأ مرفوضًا.
2. **الرفض الصريح ينتصر.** إذا احتوت أي سياسة منطبقة على `Deny` مطابق، فالجواب لا. ولا شيء يستطيع تجاوزه.
3. **السماح الصريح يُجيز.** وإلا، إذا احتوت سياسة على `Allow` مطابق، فالجواب نعم.
4. **لا تطابق يعني لا.** إذا لم يسمح بالطلب شيء، يبقى الرفض الافتراضي قائمًا. ويُسمّى هذا الرفض الضمني (implicit deny).

وتضيف الإعدادات الأكبر طبقات أخرى لا تستطيع إلا تضييق ما هو مسموح، مثل سياسات التحكّم في الخدمات (service control policies) في AWS Organizations، وحدود الصلاحيات (permissions boundaries) على مستخدمين وroles بعينهم. تظل القاعدة أعلاه صحيحة؛ كل ما تفعله تلك الطبقات أنها تضيف أماكن أخرى قد يأتي منها الرفض.

يمكنك أن تطلب من IAM تقييم طلب دون تنفيذه:

```bash
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::111122223333:user/sam \
  --action-names s3:DeleteBucket \
  --resource-arns arn:aws:s3:::lantern-posters \
  --query "EvaluationResults[].EvalDecision"
```

يكون الجواب `allowed` أو `explicitDeny` أو `implicitDeny`، فيخبرك لا بـ *هل* فقط، بل بـ *لماذا* أيضًا.

:::mistake مستخدم IAM واحد مشترك للفريق كله
كانت عادة Lantern القديمة مفتاح SSH واحدًا يتداوله الجميع. والنسخة السحابية من ذلك مستخدم IAM واحد يعرف الجميع كلمة مروره. تفقد بذلك أي سجل لمن فعل ماذا، ولا تستطيع إزالة وصول شخص واحد دون تغيير بيانات الجميع، وينتهي الـ MFA على هاتف شخص واحد. هوية واحدة لكل إنسان، والصلاحيات عبر المجموعات، دائمًا.
:::

:::tip تكلفة IAM
لا رسوم على IAM نفسه. ما يظهر هو تكلفة الخطأ فيه: بيانات اعتماد مسرّبة تشغّل برنامج تعدين عملات مشفّرة لحساب شخص آخر على فاتورتك. الصلاحيات المحكمة أداة للتحكّم في التكلفة بقدر ما هي أداة أمان.
:::

أصبحت تستطيع قراءة من يسأل وكيف يُتّخذ القرار. في الدرس التالي تكتب السياسات نفسها، سطرًا سطرًا.
