---
summary: ابنِ الـ API الخاص بتأكيد الحضور في Lantern من HTTP API في Amazon API Gateway، ودالة AWS Lambda بـ role يتبع أقل الصلاحيات، وجدول DynamoDB، مع حماية من التكرار وتكاليف تهبط إلى ما يقارب الصفر عند الخمول.
takeaways:
  - يستقبل الـ HTTP API في API Gateway الطلب، ويستدعي Lambda بحدث JSON، ويعيد أيّ رمز حالة ومحتوى تعيدهما الدالة.
  - تحتاج دالة Lambda إلى نوعين من الصلاحيات؛ الـ execution role يتيح لها استدعاء DynamoDB، وسياستها القائمة على المورد تتيح لـ API Gateway استدعاءها.
  - الكتابة المشروطة مثل attribute_not_exists تمنع النقرات المزدوجة وإعادة المحاولات من إنشاء عناصر مكرّرة.
  - اختر HTTP APIs للـ APIs البسيطة منخفضة التكلفة، وREST APIs حين تحتاج إلى API keys، أو تحديد معدّل لكل عميل، أو التحقّق من الطلبات، أو التخزين المؤقت، أو AWS WAF.
  - كل قطعة تُحتسب لكل طلب، فالـ API الخامل لا يكاد يكلّف شيئًا، والـ reserved concurrency يضع سقفًا لمدى توسّع الذروة.
further:
  - title: Choose between REST APIs and HTTP APIs
    url: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html
  - title: Create AWS Lambda proxy integrations for HTTP APIs
    url: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
  - title: Condition expressions in DynamoDB
    url: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
  - title: "Tutorial: Create a CRUD HTTP API with Lambda and DynamoDB"
    url: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-dynamo-db.html
quiz:
  - q: تعمل الدالة عند اختبارها في console الـ Lambda، لكن الاستدعاءات عبر API Gateway تفشل لأن API Gateway غير مسموح له باستدعائها. ما الناقص؟
    options:
      - text: عبارة في الـ execution role الخاص بالدالة تسمح بـ `apigateway:*`.
        why: يتحكّم الـ execution role فيما تستطيع الدالة استدعاءه، لا فيمن يستطيع استدعاء الدالة.
      - text: سياسة لجدول DynamoDB تسمّي API Gateway.
        why: لا يتحدّث API Gateway إلى DynamoDB أبدًا في هذا التصميم؛ إنه يستدعي الدالة فقط.
      - text: مستخدم IAM لـ API Gateway مع مفتاح وصول.
        why: تعمل خدمات AWS عبر service principals وroles، ولا تعمل أبدًا عبر مستخدمي IAM بمفاتيح.
      - text: عبارة في السياسة القائمة على المورد الخاصة بالدالة تسمح لـ `apigateway.amazonaws.com` باستدعاء `lambda:InvokeFunction` لهذا الـ API.
        why: صحيح. من يحق له استدعاء الدالة يُحدَّد في سياستها القائمة على المورد، مقيّدًا بـ source ARN لهذا الـ API.
    answer: 3
  - q: نقر أحد المنظّمين على زر الإرسال مرتين، فوصل طلبا تأكيد حضور متطابقان خلال أجزاء من الألف من الثانية. كيف تتجنّب دالة الدرس تخزين تأكيدَي حضور؟
    options:
      - text: يستخدم `PutItem` العبارة `ConditionExpression attribute_not_exists(email)`، فتفشل الكتابة الثانية بـ `ConditionalCheckFailedException` وتعيد 409.
        why: صحيح. يتحقّق DynamoDB من الشرط بشكل ذرّي (atomic) على العنصر، فتنجح كتابة واحدة بالضبط من الاثنتين.
      - text: يزيل API Gateway الطلبات المكرّرة تلقائيًا.
        why: يمرّر API Gateway كل طلب يستقبله. إزالة التكرار مهمة التطبيق.
      - text: تشغّل Lambda نسخة واحدة فقط من الدالة في كل مرة.
        why: تشغّل Lambda نسخًا بعدد الطلبات المتزامنة، فيمكن أن يعمل الطلبان في الوقت نفسه.
    answer: 0
  - q: يحتاج Lantern إلى API keys كي يستطيع موقعان شريكان إرسال تأكيدات الحضور، لكلٍّ منهما حد استخدام خاص به. أيّ نوع من API Gateway يناسب ذلك؟
    options:
      - text: HTTP API، لأنه أرخص.
        why: الـ HTTP APIs أرخص لأنها تستغني عن بعض الميزات، والـ API keys مع خطط الاستخدام (usage plans) من بينها.
      - text: WebSocket API، لأن الشريكين يحتاجان إلى اتصال حي.
        why: الـ WebSocket APIs للاتصالات ثنائية الاتجاه طويلة الأمد، والشريكان اللذان يرسلان نماذج لا يحتاجان إلى ذلك.
      - text: REST API، الذي يدعم API keys مع خطط الاستخدام وتحديد المعدّل لكل عميل.
        why: صحيح. حين تحتاج إلى ميزات إدارة الـ API هذه، فنوع REST API هو الذي يوفّرها.
    answer: 2
---

أصبحت الواجهة الأمامية تُحمَّل من مواقع الحافة خلال أجزاء من الألف من الثانية. لكن تأكيد الحضور ليس ملفًا ثابتًا: يجب التحقّق منه، وتخزينه، وعدّه. على الخادم القديم كان ذلك مسارًا (route) في تطبيق Node.js، يعمل طوال اليوم من أجل الدقائق القليلة في الأسبوع التي يؤكّد فيها أحدهم حضوره. أما الآن فيصبح ثلاث قطع مُدارة لا تكلّف شيئًا وهي خاملة، وتتوسّع حين تنتشر فعالية ما.

## الصورة العامة

:::figure طلب واحد عبر الـ API الخاص بتأكيد الحضور
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">يرسل المتصفّح POST /events/{eventId}/rsvps إلى HTTP API في API Gateway. يستدعي API Gateway دالة Lambda المسمّاة lantern-rsvp، التي تعمل بـ execution role وتكتب في جدول DynamoDB المسمّى lantern-rsvps. وتذهب سجلات الدالة إلى CloudWatch Logs.</title>
  <rect class="d-box" x="10" y="70" width="110" height="60" rx="10"/>
  <text class="d-label" x="65" y="105" text-anchor="middle">المتصفّح</text>
  <rect class="d-box-accent" x="170" y="70" width="140" height="60" rx="10"/>
  <text class="d-label" x="240" y="97" text-anchor="middle">API Gateway</text>
  <text class="d-label-muted" x="240" y="117" text-anchor="middle">HTTP API</text>
  <rect class="d-box-primary" x="360" y="70" width="140" height="60" rx="10"/>
  <text class="d-label" x="430" y="97" text-anchor="middle">Lambda</text>
  <text class="d-label-muted" x="430" y="117" text-anchor="middle">lantern-rsvp</text>
  <rect class="d-box-success" x="550" y="70" width="120" height="60" rx="10"/>
  <text class="d-label" x="610" y="97" text-anchor="middle">DynamoDB</text>
  <text class="d-label-muted" x="610" y="117" text-anchor="middle">lantern-rsvps</text>
  <rect class="d-box-warn" x="360" y="170" width="140" height="40" rx="8"/>
  <text class="d-label" x="430" y="195" text-anchor="middle">CloudWatch Logs</text>
  <path class="d-arrow" d="M120 100 L166 100" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M310 100 L356 100" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M500 100 L546 100" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M430 130 L430 166" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="333" y="60" text-anchor="middle">سياسة المورد</text>
  <text class="d-label-muted" x="523" y="60" text-anchor="middle">execution role</text>
</svg>
:::

مساران يكفيان للإطلاق:

| المسار | ما يفعله |
|---|---|
| `POST /events/{eventId}/rsvps` | يخزّن تأكيد حضور واحدًا، ويرفض التكرار |
| `GET /events/{eventId}/rsvps` | يعيد عدد تأكيدات الحضور للفعالية |

## الدالة

يمرّر الـ HTTP API في API Gateway إلى Lambda حدث JSON (بصيغة الحمولة 2.0) يحتوي على معاملات المسار (path parameters) والطريقة (method) والمحتوى كنص. وتعيد الدالة رمز حالة وترويسات ومحتوى نصيًا:

```js title=rsvp/index.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Created once per execution environment and reused across invocations.
// removeUndefinedValues: an RSVP without a "name" is stored without that attribute.
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const TABLE = process.env.TABLE_NAME;

const reply = (statusCode, data) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(data),
});

export const handler = async (event) => {
  const eventId = event.pathParameters?.eventId;

  if (event.requestContext.http.method === "GET") {
    const res = await db.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "eventId = :e",
      ExpressionAttributeValues: { ":e": eventId },
      Select: "COUNT",
    }));
    return reply(200, { eventId, count: res.Count });
  }

  const { email, name } = JSON.parse(event.body ?? "{}");
  if (typeof email !== "string" || !email.includes("@")) {
    return reply(400, { error: "A valid email is required" });
  }

  try {
    await db.send(new PutCommand({
      TableName: TABLE,
      Item: { eventId, email: email.toLowerCase(), name, createdAt: new Date().toISOString() },
      ConditionExpression: "attribute_not_exists(email)",
    }));
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return reply(409, { error: "You have already RSVPed to this event" });
    }
    throw err;
  }
  return reply(201, { eventId, email });
};
```

لاحظ ما ليس موجودًا: لا بيانات اعتماد، ولا ARN للجدول، ولا مجمّع اتصالات (connection pool). تعثر الـ SDK على بيانات اعتماد الـ execution role، ويأتي اسم الجدول من متغيّر بيئة كي يعمل الكود نفسه على جداول التطوير والإنتاج. تتضمّن بيئة تشغيل Node.js الإصدار v3 من AWS SDK for JavaScript، لكن احزم مع الكود الخاص بك الإصدار الذي اختبرته، كي لا يغيّره تحديث لبيئة التشغيل من تحت قدميك.

وهناك حدّ واحد يجب ذكره بصراحة: يقرأ Query الواحد 1 MB كحد أقصى، لذا فإن فعالية بعدد هائل من تأكيدات الحضور ستحتاج في العدّ إلى تقسيم إلى صفحات (pagination)، أو إلى عنصر عدّاد منفصل يُحدَّث مع كل كتابة. أما لفعاليات Lantern، فاستدعاء واحد أكثر من كافٍ.

:::mistake ترك إعادة المحاولات تُنشئ تكرارات
المتصفّحات ترسل النماذج مرتين، والمستخدمون ينقرون مرتين، والعملاء يعيدون المحاولة عند انتهاء المهلة. دون حارس، يصبح كل واحد منها عنصرًا جديدًا. تجعل `ConditionExpression` الكتابة تنجح فقط إن لم يوجد بعدُ عنصر بذلك الـ `eventId` والـ `email`، ويقيّمها DynamoDB بشكل ذرّي، فلا يمكن أن ينجح الطلبان المتزامنان كلاهما.
:::

## الصلاحيات

يحصل **الـ execution role** الخاص بالدالة على ما يستدعيه الكود بالضبط، على جدول واحد بالضبط، إضافة إلى السياسة المُدارة من AWS `AWSLambdaBasicExecutionRole` كي يستطيع كتابة السجلات:

```json title=rsvp-role-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RsvpTable",
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:Query"],
      "Resource": "arn:aws:dynamodb:eu-west-1:111122223333:table/lantern-rsvps"
    }
  ]
}
```

والاتجاه الآخر هو **السياسة القائمة على المورد** الخاصة بالدالة: يحق لـ API Gateway استدعاؤها. يضيف الـ console هذه السياسة حين تربط مسارًا؛ ومن الـ CLI تبدو هكذا، مقيّدة بـ API واحد عبر الـ ARN الخاص به:

```bash
aws lambda add-permission --function-name lantern-rsvp \
  --statement-id allow-lantern-http-api \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:eu-west-1:111122223333:a1b2c3d4e5/*"
```

## الـ API

في console الـ API Gateway، أنشئ **HTTP API**، وأضف المسارين مع تكامل Lambda (Lambda integration) إلى `lantern-rsvp`، واستخدم المرحلة `$default` التي تُنشر تلقائيًا. الـ HTTP APIs هي النوع الأرخص والأبسط. واختر **REST API** بدلًا منها حين تحتاج إلى API keys مع خطط الاستخدام، أو تحديد معدّل لكل عميل، أو التحقّق من الطلبات، أو التخزين المؤقت للاستجابات، أو AWS WAF.

لأن الموقع يُقدَّم من `https://lantern.example` والـ API يعيش على نطاق آخر، اضبط **CORS** على الـ HTTP API للسماح بذلك الـ origin، أو أضف الـ API كـ origin ثانٍ في الـ distribution الخاص بـ CloudFront تحت `/api/*` كي يرى المتصفّح نطاقًا واحدًا. ثم اختبر:

```bash
curl -i -X POST \
  "https://a1b2c3d4e5.execute-api.eu-west-1.amazonaws.com/events/evt-2026-street-food/rsvps" \
  -H "content-type: application/json" \
  -d '{"email":"rita@example.com","name":"Rita"}'
```

يعيد الاستدعاء الأول `201`؛ أرسله مرة أخرى فتحصل على `409`.

:::tip لماذا لا نستخدم function URL؟
تستطيع Lambda أيضًا أن تمنح الدالة نقطة نهاية HTTPS خاصة بها، تُسمّى function URL، دون API Gateway أمامها. وهذا مناسب للـ webhooks والأدوات الداخلية. يستخدم Lantern الـ API Gateway لأنه يريد مسارات منفصلة بحدود معدّل خاصة بكلٍّ منها، ونطاقًا مخصّصًا بجوار الموقع، وإمكانية إضافة authorizer لاحقًا دون لمس كود الدالة.
:::

## كم يكلّف، وكيف تضع له سقفًا

كل قطعة تُحتسب حسب الاستخدام: API Gateway لكل طلب، وLambda لكل طلب ولكل GB-second، وDynamoDB بنمط on-demand لكل قراءة وكتابة. الأسبوع الهادئ لا يكاد يكلّف شيئًا، وأمسية المهرجان تكلّف ما يعادل بضعة آلاف من الطلبات. وللتأكّد من أن بوتًا لا يستطيع تضخيم الفاتورة أو إغراق أي شيء في المراحل التالية، اضبط **reserved concurrency** على الدالة (سقف لعدد النسخ المتزامنة) وحدًّا للمعدّل (throttling) على مرحلة الـ API.

في الدرس التالي ستراقب هذا الـ API في الإنتاج: السجلات والمقاييس والإنذارات، ومراجعة منظّمة للتصميم كله.
