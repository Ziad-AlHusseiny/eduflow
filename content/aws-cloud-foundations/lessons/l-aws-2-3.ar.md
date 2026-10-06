---
summary: امنح الأشخاص الوصول عبر IAM Identity Center، وامنح الكود الوصول عبر الـ roles في IAM، كي يعمل Lantern دون أي مفاتيح وصول طويلة الأمد على الحواسيب أو الخوادم أو في Git.
takeaways:
  - يمنح IAM Identity Center كل شخص تسجيل دخول واحدًا، مع MFA، إلى كل حساب يحتاجه، ويوزّع بيانات اعتماد قصيرة الأمد عبر حزم الصلاحيات (permission sets).
  - تحصل أحمال العمل على صلاحياتها من الـ roles، مثل الـ execution role في Lambda أو الـ instance profile في EC2، وتعثر حزم AWS SDK على بيانات الاعتماد المؤقتة هذه دون أي كود.
  - للـ role سياستان؛ سياسة الثقة تحدّد من يحق له تقمّصه، وسياسة الصلاحيات تحدّد ما يحق له فعله بعد ذلك.
  - مفاتيح الوصول طويلة الأمد في الكود أو ملفات الإعداد أو متغيّرات البيئة من أكثر الطرق شيوعًا لاختراق حسابات AWS.
  - عند التخلّص من مفتاح وصول قديم، تأكّد من أنه غير مستخدم عبر تاريخ آخر استخدام له، ثم عطّله، ولا تحذفه إلا بعد ذلك.
further:
  - title: What is IAM Identity Center?
    url: https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html
  - title: Configuring IAM Identity Center authentication with the AWS CLI
    url: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html
  - title: Defining Lambda function permissions with an execution role
    url: https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html
  - title: Manage access keys for IAM users
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html
quiz:
  - q: يجب أن تكتب دالة تأكيد الحضور في Lantern إلى DynamoDB. كيف يجب أن تحصل على بيانات الاعتماد؟
    options:
      - text: خزّن مفتاح وصول لمستخدم IAM في متغيّرات البيئة الخاصة بالدالة.
        why: كل من يستطيع قراءة إعدادات الدالة يستطيع قراءة المفتاح، وهو لا تنتهي صلاحيته أبدًا. متغيّرات البيئة ليست مخزنًا للأسرار.
      - text: امنح الدالة execution role بسياسة صلاحيات للجدول؛ وتلتقط الـ SDK بيانات اعتماده المؤقتة.
        why: صحيح. تتقمّص Lambda الـ role نيابة عنك وتسلّم كل بيئة تنفيذ بيانات اعتماد قصيرة الأمد، فلا يوجد ما يتسرّب أو يحتاج إلى تدوير.
      - text: استخدم بيانات اعتماد مستخدم الجذر، لأن الدالة تحتاج إلى وصول موثوق.
        why: بيانات اعتماد الجذر غير مقيّدة ولا يجب أن توجد كمفاتيح وصول أصلًا، فضلًا عن وجودها داخل الكود.
    answer: 1
  - q: سياسة الصلاحيات الخاصة بـ role تسمح بـ `dynamodb:PutItem` على جدول تأكيدات الحضور، لكن الـ instances في EC2 تفشل في تقمّص الـ role. أيّ سياسة هي الخاطئة على الأرجح؟
    options:
      - text: سياسة الثقة، التي يجب أن تسمّي `ec2.amazonaws.com` كـ principal مسموح له باستدعاء `sts:AssumeRole`.
        why: صحيح. من يحق له تقمّص الـ role تقرّره سياسة الثقة وحدها. أما سياسة الصلاحيات فلا تهمّ إلا بعد تقمّص الـ role.
      - text: سياسة الصلاحيات، التي يجب أن تسمح أيضًا بـ `sts:AssumeRole`.
        why: لا يحتاج الـ role إلى صلاحية لتقمّص نفسه. هذه مهمة سياسة الثقة.
      - text: سياسة جدول DynamoDB، التي يجب أن تسرد معرّف الـ instance في EC2.
        why: الـ instance ليست أبدًا الـ principal في استدعاءات DynamoDB؛ بل جلسة الـ role المتقمَّص. ثم إن التقمّص يفشل قبل أن تدخل DynamoDB في الصورة.
    answer: 0
  - q: لدى Lantern الآن حسابان منفصلان للتطوير والإنتاج وستة متطوّعين. ما أفضل طريقة لمنح المتطوّعين وصولًا إلى الـ console والـ CLI؟
    options:
      - text: مستخدم IAM لكل متطوّع في كل حساب، لكلٍّ منهم كلمة مرور وMFA خاصان به.
        why: هذه اثنتا عشرة مجموعة من بيانات الاعتماد عليك إدارتها وإلغاؤها. الطريقة تعمل، لكنها لا تتوسّع جيدًا وتخلّف وراءها بيانات اعتماد طويلة الأمد.
      - text: مستخدم IAM واحد مشترك لكل حساب بكلمة مرور قوية محفوظة في مدير كلمات مرور.
        why: المستخدمون المشتركون يقضون على المساءلة، ويجعلون إزالة شخص واحد مستحيلة دون تغيير وصول الجميع.
      - text: مستخدمون في IAM Identity Center، مع حزم صلاحيات مسندة لكل حساب، يسجّلون الدخول عبر بوابة الوصول و`aws sso login`.
        why: صحيح. لكل شخص هوية واحدة وMFA، والوصول قصير الأمد، وإزالة أي شخص تغيير واحد.
    answer: 2
---

انتهى القسم الأول بمستخدم مدير واحد لشخص واحد في حساب واحد. أما Lantern الآن فلديه ستة متطوّعين، وحساب للتطوير وآخر للإنتاج، ودالة Lambda، ومهمة ليلية على EC2. إذا احتاج كل واحد من هؤلاء إلى مستخدم IAM بمفاتيح وصول، فستنتهي بنحو اثني عشر سرًّا طويل الأمد مبعثرة على الحواسيب والخوادم. هذا الدرس يزيلها كلها إلا القليل.

## الأشخاص: IAM Identity Center

**AWS IAM Identity Center** هو المكان الذي يسجّل فيه فريق عملك الدخول. يحصل كل شخص على هوية **واحدة**، إما في الدليل المدمج في Identity Center أو مُزامَنة من مزوّد هوية مثل Microsoft Entra ID أو Okta أو Google Workspace. يسجّل الشخص الدخول مرة واحدة، مع MFA، عبر رابط **بوابة وصول AWS (AWS access portal)**، فيرى كل حساب مسموح له بدخوله.

ما يستطيع فعله في كل حساب يأتي من **حزم الصلاحيات (permission sets)**: حزمة مسمّاة من السياسات، مثل `DeveloperAccess` أو `ReadOnly`. عندما تُسند "المتطوّعة Rita، حزمة الصلاحيات `DeveloperAccess`، الحساب `lantern-dev`"، ينشئ Identity Center role مطابقًا في ذلك الحساب، وتتقمّصه جلسة Rita. لا أحد لديه مستخدم IAM؛ ولا أحد لديه مفتاح طويل الأمد.

صُمِّم Identity Center ليعمل مع **AWS Organizations**، الذي يجمع حسابات Lantern تحت حساب إدارة واحد. انتبه إلى عقبة عملية واحدة: في خطة الحساب المجانية، يؤدّي الانضمام إلى مؤسسة (organisation) إلى ترقية الحساب إلى الخطة المدفوعة، لذا فهذه خطوة لوقت انتقال Lantern إلى الإنتاج.

في الـ CLI، يكتب `aws configure sso` الـ profile، ويفتح `aws sso login` المتصفّح لتسجيل الدخول:

```ini title=~/.aws/config
[sso-session lantern]
sso_start_url = https://lantern.awsapps.com/start
sso_region = eu-west-1
sso_registration_scopes = sso:account:access

[profile lantern-dev]
sso_session = lantern
sso_account_id = 444455556666
sso_role_name = DeveloperAccess
region = eu-west-1
```

```bash
aws sso login --sso-session lantern
aws sts get-caller-identity --profile lantern-dev
```

الـ `Arn` الذي يعود الآن يُقرأ `assumed-role/AWSReservedSSO_DeveloperAccess_…/rita`: جلسة role، لا مستخدم.

## أحمال العمل: roles لا مفاتيح

يحتاج الكود إلى بيانات اعتماد أيضًا، والجواب دائمًا **role** تتقمّصه المنصّة نيابة عنك:

- **Lambda**: لكل دالة **execution role** (role التنفيذ).
- **EC2**: يوصل **الـ instance profile** بيانات اعتماد الـ role عبر خدمة البيانات الوصفية للـ instance (instance metadata service).
- **Amazon ECS**: **task role** لكل task definition.
- **الـ CI/CD خارج AWS**، مثل GitHub Actions: مزوّد هوية OpenID Connect في IAM، فيستبدل الـ pipeline الـ token الخاص به بجلسة role.

للـ role سياستان دائمًا. **سياسة الثقة (trust policy)** تحدّد من يحق له تقمّصه:

```json title=trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

و**سياسة الصلاحيات (permissions policy)** تحدّد ما يحق للـ role فعله بعد تقمّصه، وتُكتب تمامًا مثل سياسات الدرس السابق.

:::figure تتقمّص Lambda الـ execution role الخاص بها، ثم تستدعي DynamoDB ببيانات اعتماد مؤقتة
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">تطلب خدمة Lambda من STS تقمّص الـ role المسمّى lantern-rsvp. يفحص STS سياسة الثقة ويعيد بيانات اعتماد مؤقتة. يستخدمها كود الدالة لاستدعاء DynamoDB، حيث يفحص IAM سياسة صلاحيات الـ role.</title>
  <rect class="d-box-primary" x="20" y="80" width="150" height="64" rx="10"/>
  <text class="d-label" x="95" y="108" text-anchor="middle">Lambda</text>
  <text class="d-label-muted" x="95" y="128" text-anchor="middle">دالة rsvp</text>
  <rect class="d-box-accent" x="265" y="20" width="150" height="64" rx="10"/>
  <text class="d-label" x="340" y="48" text-anchor="middle">AWS STS</text>
  <text class="d-label-muted" x="340" y="68" text-anchor="middle">يفحص سياسة الثقة</text>
  <rect class="d-box-success" x="510" y="140" width="150" height="64" rx="10"/>
  <text class="d-label" x="585" y="168" text-anchor="middle">DynamoDB</text>
  <text class="d-label-muted" x="585" y="188" text-anchor="middle">يفحص الصلاحيات</text>
  <path class="d-arrow" d="M170 96 L262 56" marker-end="url(#arrow)"/>
  <text class="d-label" x="160" y="58">1 AssumeRole</text>
  <path class="d-arrow d-dashed" d="M265 72 L174 112" marker-end="url(#arrow)"/>
  <text class="d-label" x="232" y="120">2 بيانات اعتماد مؤقتة</text>
  <path class="d-arrow" d="M170 134 L506 170" marker-end="url(#arrow)"/>
  <text class="d-label" x="300" y="176">3 PutItem موقَّع</text>
</svg>
:::

عندئذٍ لا يحتوي الكود الخاص بك على **أي بيانات اعتماد على الإطلاق**. تستخدم حزم AWS SDK سلسلة بيانات اعتماد افتراضية (default credential chain) تعثر على بيانات اعتماد الـ role المؤقتة تلقائيًا:

```js title=rsvp/index.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// No keys here: the SDK finds the execution role's temporary credentials.
const client = new DynamoDBClient({});
// …handler code that calls client.send(…)
```

## الخطأ الذي ينتهي بفاتورة ضخمة

:::mistake مفاتيح وصول في الكود أو الإعدادات أو Git
سطر مثل `accessKeyId: "AKIA…"` في الكود المصدري، أو ملف `.env` مرفوع في commit، أو مفتاح لُصق في متغيّر CI "مؤقتًا"، من أكثر الطرق التي تُخترق بها حسابات AWS شيوعًا. تمسح البوتات المستودعات العامة باستمرار، وقد يكون مفتاح مسرّب يشغّل instances باهظة خلال دقائق. قد ترفق AWS سياسة حجر (quarantine policy) بمفتاح تجده مكشوفًا، لكن ذلك يحدّ من الضرر بعد وقوعه. الإصلاح بنيوي: roles لأحمال العمل، وIdentity Center أو `aws login` للأشخاص، وأداة لفحص الأسرار في المستودع.
:::

أحيانًا يكون مفتاح الوصول أمرًا لا مفرّ منه فعلًا، كأداة خارجية لا تقبل إلا المفاتيح. عندئذٍ: مستخدم IAM واحد لكل أداة، وسياسة بأقل الصلاحيات، وشرط `aws:SourceIp` إذا كانت للأداة عناوين ثابتة، وتدوير للمفتاح وفق جدول زمني.

التخلّص من مفتاح موجود تسلسل دقيق، لأن حذف مفتاح ما زال شيء ما يستخدمه يعطّل الإنتاج. تحقّق من آخر مرة استُخدم فيها:

```bash
aws iam get-access-key-last-used --access-key-id AKIAIOSFODNN7EXAMPLE
```

بمجرد أن يثبت أن لا شيء استخدمه منذ تشغيل البديل، **عطّله** أولًا (وهذا قابل للتراجع)، وانتظر، ولا **تحذفه** إلا حين لا يشكو شيء. أما المفتاح الذي تشكّ في تسرّبه فأمره مختلف: عطّله فورًا، ثم حقّق في الأمر بعد ذلك.

:::why التكلفة والأمان حديث واحد
المفتاح المسرّب يكلّف مالًا أولًا وسمعةً ثانيًا. كل مفتاح تستبدله بـ role هو سطر يُحذف من فاتورتك في أسوأ الاحتمالات.
:::

بهذا تكتمل الهوية. يضعها القسم الثالث موضع التطبيق وأنت تختار قطع الحوسبة والتخزين وقاعدة البيانات والشبكة لـ Lantern.
