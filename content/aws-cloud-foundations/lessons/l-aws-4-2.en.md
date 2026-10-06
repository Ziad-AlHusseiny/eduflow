---
summary: Build Lantern's RSVP API from an Amazon API Gateway HTTP API, an AWS Lambda function with a least-privilege role, and a DynamoDB table, with duplicate protection and costs that fall to near zero when idle.
takeaways:
  - An HTTP API in API Gateway receives the request, invokes Lambda with a JSON event, and returns whatever status code and body the function returns.
  - The Lambda function needs two kinds of permission; its execution role lets it call DynamoDB, and its resource-based policy lets API Gateway invoke it.
  - A conditional write such as attribute_not_exists stops double-clicks and retries from creating duplicate items.
  - Choose HTTP APIs for simple, low-cost APIs, and REST APIs when you need API keys, per-client throttling, request validation, caching or AWS WAF.
  - Every piece bills per request, so an idle API costs close to nothing, and reserved concurrency caps how far a spike can scale.
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
  - q: The function works when tested in the Lambda console, but calls through API Gateway fail because API Gateway is not allowed to invoke it. What is missing?
    options:
      - text: A statement in the function's execution role allowing `apigateway:*`.
        why: The execution role controls what the function may call, not who may call the function.
      - text: A DynamoDB table policy that names API Gateway.
        why: API Gateway never talks to DynamoDB in this design; it only invokes the function.
      - text: An IAM user for API Gateway with an access key.
        why: AWS services act through service principals and roles, never through IAM users with keys.
      - text: A statement in the function's resource-based policy allowing `apigateway.amazonaws.com` to call `lambda:InvokeFunction` for this API.
        why: Correct. Who may invoke a function is set in its resource-based policy, scoped with a source ARN to this API.
    answer: 3
  - q: An organiser double-clicks Submit and two identical RSVP requests arrive within milliseconds. How does the lesson's function avoid storing two RSVPs?
    options:
      - text: The `PutItem` uses `ConditionExpression attribute_not_exists(email)`, so the second write fails with `ConditionalCheckFailedException` and returns 409.
        why: Correct. DynamoDB checks the condition atomically on the item, so exactly one of the two writes succeeds.
      - text: API Gateway removes duplicate requests automatically.
        why: API Gateway forwards every request it receives. Deduplication is the application's job.
      - text: Lambda runs only one copy of the function at a time.
        why: Lambda runs as many copies as there are concurrent requests, so both requests can run at once.
    answer: 0
  - q: Lantern needs API keys so that two partner websites can submit RSVPs, each with its own usage limit. Which API Gateway type fits?
    options:
      - text: An HTTP API, because it is cheaper.
        why: HTTP APIs are cheaper because they leave features out, and API keys with usage plans are one of them.
      - text: A WebSocket API, because partners need a live connection.
        why: WebSocket APIs are for two-way, long-lived connections, and partners submitting forms do not need that.
      - text: A REST API, which supports API keys with usage plans and per-client throttling.
        why: Correct. When you need those API management features, the REST API type is the one that has them.
    answer: 2
---

The front end now loads from edge locations in milliseconds. But an RSVP is not a static file: it has to be checked, stored, and counted. On the old server that was a route in the Node.js app, running all day for the few minutes a week anyone RSVPed. Now it becomes three managed pieces that cost nothing while idle and scale up when an event goes viral.

## The shape of it

:::figure One request through the RSVP API
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">The browser sends POST /events/{eventId}/rsvps to an API Gateway HTTP API. API Gateway invokes the lantern-rsvp Lambda function, which runs with an execution role and writes to the lantern-rsvps DynamoDB table. The function's logs go to CloudWatch Logs.</title>
  <rect class="d-box" x="10" y="70" width="110" height="60" rx="10"/>
  <text class="d-label" x="65" y="105" text-anchor="middle">Browser</text>
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
  <text class="d-label-muted" x="333" y="60" text-anchor="middle">resource policy</text>
  <text class="d-label-muted" x="523" y="60" text-anchor="middle">execution role</text>
</svg>
:::

Two routes are enough for launch:

| Route | Does |
|---|---|
| `POST /events/{eventId}/rsvps` | Stores one RSVP, refuses duplicates |
| `GET /events/{eventId}/rsvps` | Returns the RSVP count for the event |

## The function

API Gateway's HTTP API passes Lambda a JSON event (payload format 2.0) with the path parameters, the method and the body as a string. The function returns a status code, headers and a string body:

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

Notice what is *not* there: no credentials, no table ARN, no connection pool. The SDK finds the execution role's credentials, and the table name comes from an environment variable so the same code runs against dev and production tables. The Node.js runtime includes the AWS SDK for JavaScript v3, but bundle the version you tested with your code so a runtime update can't change it under you.

One honest limit: a single Query reads at most 1 MB, so for an event with an enormous number of RSVPs the count would need pagination, or a separate counter item updated on each write. For Lantern's events, one call is plenty.

:::mistake Letting retries create duplicates
Browsers double-submit, users double-click, and clients retry on timeouts. Without a guard, each one is a new item. The `ConditionExpression` makes the write succeed only if no item with that `eventId` and `email` exists yet, and DynamoDB evaluates it atomically, so two simultaneous requests can't both win.
:::

## The permissions

The function's **execution role** gets exactly what the code calls, on exactly one table, plus the AWS managed `AWSLambdaBasicExecutionRole` policy so it can write logs:

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

The other direction is the function's **resource-based policy**: API Gateway may invoke it. The console adds this when you connect a route; from the CLI it looks like this, scoped to one API by its ARN:

```bash
aws lambda add-permission --function-name lantern-rsvp \
  --statement-id allow-lantern-http-api \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:eu-west-1:111122223333:a1b2c3d4e5/*"
```

## The API

In the API Gateway console, create an **HTTP API**, add the two routes with a Lambda integration to `lantern-rsvp`, and use the auto-deployed `$default` stage. HTTP APIs are the cheaper, simpler type. Choose a **REST API** instead when you need API keys with usage plans, per-client throttling, request validation, response caching or AWS WAF.

Because the site is served from `https://lantern.example` and the API lives on another domain, configure **CORS** on the HTTP API to allow that origin, or add the API as a second origin in the CloudFront distribution under `/api/*` so the browser sees one domain. Then test:

```bash
curl -i -X POST \
  "https://a1b2c3d4e5.execute-api.eu-west-1.amazonaws.com/events/evt-2026-street-food/rsvps" \
  -H "content-type: application/json" \
  -d '{"email":"rita@example.com","name":"Rita"}'
```

The first call returns `201`; send it again and you get `409`.

:::tip Why not a function URL?
Lambda can also give a function its own HTTPS endpoint, a function URL, with no API Gateway in front. That is fine for webhooks and internal tools. Lantern uses API Gateway because it wants separate routes with their own throttling limits, a custom domain next to the site, and the option to add an authorizer later without touching the function code.
:::

## What it costs, and how to cap it

Each piece bills per use: API Gateway per request, Lambda per request and GB-second, DynamoDB on-demand per read and write. A quiet week costs close to nothing, and the festival evening costs a few thousand requests' worth. To make sure a bot can't run up the bill or overload anything downstream, set **reserved concurrency** on the function (a ceiling on simultaneous copies) and a throttling limit on the API's stage.

Next you will watch this API in production: logs, metrics and alarms, and a structured review of the whole design.
