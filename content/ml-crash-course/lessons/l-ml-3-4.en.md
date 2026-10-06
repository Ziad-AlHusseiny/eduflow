---
summary: Read a confusion matrix, compute precision, recall, F1 and ROC AUC with scikit-learn, and pick the metric that matches what each kind of mistake costs the business.
takeaways:
  - "A confusion matrix counts true negatives, false positives, false negatives and true positives; in scikit-learn rows are actual classes and columns are predicted classes."
  - "Precision is the share of flagged cases that are real; recall is the share of real cases that get flagged."
  - "F1 is the harmonic mean of precision and recall, useful when you need one number that punishes neglecting either."
  - "ROC AUC measures ranking quality across all thresholds: the chance that a random positive gets a higher score than a random negative."
  - "Always check which class is the positive one: in `load_breast_cancer`, malignant is 0, so recall for malignant needs `pos_label=0`."
further:
  - title: "Classification metrics"
    url: https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics
  - title: confusion_matrix
    url: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html
  - title: roc_auc_score
    url: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html
quiz:
  - q: "`confusion_matrix(y_test, pred)` returns `[[35, 10], [18, 37]]` for churn (1 = churned). How many churners did the model miss?"
    options:
      - text: "10"
        why: That's the top-right cell, customers who stayed but were flagged as churners (false positives).
      - text: "35"
        why: That's the top-left cell, customers who stayed and were correctly predicted to stay.
      - text: "37"
        why: That's the bottom-right cell, churners the model caught.
      - text: "18"
        why: Correct. Row 1 is actual churners; column 0 is "predicted to stay". Those 18 are false negatives.
    answer: 3
  - q: "Each win-back offer costs $40, so marketing only wants to contact customers who are very likely to churn. Which metric should you watch most closely?"
    options:
      - text: Precision, because it measures how many contacted customers really were churning.
        why: Correct. Every false positive is $40 spent on a customer who would have stayed anyway.
      - text: Recall, because it counts how many churners you reach.
        why: Recall rewards contacting more people, which is exactly what an expensive offer argues against.
      - text: Accuracy, because it balances both kinds of error.
        why: Accuracy weighs both errors equally, but here false positives cost money and false negatives cost nothing extra.
    answer: 0
  - q: "Model A has ROC AUC 0.81 and model B has 0.77, but both have accuracy 0.72 at the default threshold. What does that tell you?"
    options:
      - text: The AUC difference must be a calculation error, since accuracy is equal.
        why: The two metrics measure different things. Accuracy looks at one threshold; AUC looks at the whole ranking.
      - text: B is better because it reaches the same accuracy with a weaker ranking.
        why: A weaker ranking is a disadvantage; it means B's scores separate churners from stayers less well.
      - text: A ranks customers better, so it will give a better call list at most list sizes.
        why: Correct. AUC summarises ranking quality, which is what a top-N list depends on.
    answer: 2
  - q: "A model on `load_breast_cancer` reports `recall_score(y_test, pred) = 0.99`. Why might that number mislead a doctor?"
    options:
      - text: Recall can't be above 0.95 on medical data, so it's a bug.
        why: There's no such ceiling; this dataset is genuinely easy to separate.
      - text: Label 1 is benign here, so that's recall for benign tumours, not the malignant ones the doctor cares about.
        why: Correct. Pass `pos_label=0` (or read the per-class report) to get recall for malignant.
      - text: Recall ignores the false negatives, which are what matter in medicine.
        why: Recall is built from false negatives; the problem is which class it's computed for.
    answer: 1
---

Logistic regression and the 80-day rule both score 0.72 accuracy on the churn test set. Are they equally good? Accuracy says yes. Marketing would disagree as soon as they see who each one flags. Accuracy blends two very different mistakes into one number, and throws away the ranking that made the call list useful. This lesson takes them apart.

## Four outcomes

Every prediction on a yes/no problem lands in one of four cells. Call churners **positives** (they're the class you're trying to find).

- **True positive (TP)**: predicted churn, did churn. Marketing reached the right person.
- **False positive (FP)**: predicted churn, stayed. An offer wasted on a loyal customer.
- **False negative (FN)**: predicted stay, churned. A customer lost without a fight.
- **True negative (TN)**: predicted stay, stayed. Correctly left alone.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
pred = model.predict(X_test)
rule = (X_test["days_since_last_order"] > 80).astype(int)

print("model:\n", confusion_matrix(y_test, pred))
print("rule:\n", confusion_matrix(y_test, rule))
```

scikit-learn lays the matrix out with actual classes as rows and predicted classes as columns, both in sorted order (0 then 1). So the model's `[[35, 10], [18, 37]]` reads like this:

:::figure The logistic regression's confusion matrix on 100 test customers
<svg viewBox="0 0 560 280" role="img" aria-labelledby="t1">
  <title id="t1">Two by two grid. Actual stayed, predicted stay: 35 true negatives. Actual stayed, predicted churn: 10 false positives. Actual churned, predicted stay: 18 false negatives. Actual churned, predicted churn: 37 true positives.</title>
  <text class="d-label-strong" x="330" y="24" text-anchor="middle">predicted</text>
  <text class="d-label" x="250" y="50" text-anchor="middle">stay (0)</text>
  <text class="d-label" x="420" y="50" text-anchor="middle">churn (1)</text>
  <text class="d-label-strong" x="40" y="170" text-anchor="middle" transform="rotate(-90 40 170)">actual</text>
  <text class="d-label" x="150" y="115" text-anchor="end">stayed (0)</text>
  <text class="d-label" x="150" y="215" text-anchor="end">churned (1)</text>
  <rect class="d-box-success" x="170" y="64" width="160" height="90" rx="8"/>
  <text class="d-label-strong" x="250" y="105" text-anchor="middle">35</text>
  <text class="d-label" x="250" y="130" text-anchor="middle">true negatives</text>
  <rect class="d-box-warn" x="340" y="64" width="160" height="90" rx="8"/>
  <text class="d-label-strong" x="420" y="105" text-anchor="middle">10</text>
  <text class="d-label" x="420" y="130" text-anchor="middle">false positives</text>
  <rect class="d-box-warn" x="170" y="164" width="160" height="90" rx="8"/>
  <text class="d-label-strong" x="250" y="205" text-anchor="middle">18</text>
  <text class="d-label" x="250" y="230" text-anchor="middle">false negatives</text>
  <rect class="d-box-success" x="340" y="164" width="160" height="90" rx="8"/>
  <text class="d-label-strong" x="420" y="205" text-anchor="middle">37</text>
  <text class="d-label" x="420" y="230" text-anchor="middle">true positives</text>
</svg>
:::

The rule's matrix is `[[31, 14], [14, 41]]`. Same 72 correct predictions, different mistakes: the model wastes fewer offers (10 against 14) and misses more churners (18 against 14). Which is better depends on what each mistake costs, and accuracy can't tell you.

## Precision, recall and F1

Two ratios turn the matrix into questions a manager asks:

- **Precision** = TP / (TP + FP): of the customers we flagged, how many were really leaving? The model: 37 / 47 = 0.79. The rule: 0.75.
- **Recall** = TP / (TP + FN): of the customers who left, how many did we flag? The model: 37 / 55 = 0.67. The rule: 0.75.

There's a built-in tension. Flag more people and recall rises while precision usually falls; flag fewer and the reverse. **F1** is the harmonic mean of the two, `2 * P * R / (P + R)`. It's high only when both are, so a model can't game it by maximising one. Use it when you need a single number and both errors matter roughly equally.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)

print(classification_report(y_test, model.predict(X_test), target_names=["stayed", "churned"]))
print("model ROC AUC:", round(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]), 3))
print("rule  ROC AUC:", round(roc_auc_score(y_test, X_test["days_since_last_order"]), 3))
```

`classification_report` prints precision, recall and F1 for each class, with support (the number of true cases). Read the "churned" row for the business question; the "stayed" row is the same analysis with the roles swapped.

## ROC AUC: grading the ranking

Precision and recall depend on the 0.5 cut-off. **ROC AUC** doesn't use a cut-off at all. It asks: if you pick one churner and one stayer at random, how often does the model give the churner the higher score? 0.5 means the scores are no better than a coin; 1.0 means every churner outranks every stayer.

`roc_auc_score` takes scores, not labels: pass `predict_proba(...)[:, 1]`. Any score that orders customers works, so you can grade the rule by its raw `days_since_last_order`. The rule gets 0.77; logistic regression gets 0.81. That gap is the real difference between them, hidden by the accuracy tie: the model's ranking is meaningfully better, which is why its top-10 list in [the logistic regression lesson](lesson:l-ml-3-1) was so accurate.

:::mistake Not knowing which class is "positive"
`precision_score` and `recall_score` treat label 1 as positive unless you say otherwise. In `load_breast_cancer`, 0 is malignant and 1 is benign, so a reported recall of 0.99 is recall for **benign** tumours. For the class a doctor cares about, pass `pos_label=0` or read the malignant row of `classification_report`. Check `target_names` before quoting any per-class metric.
:::

## Choosing a metric

Start from the cost of each mistake, then pick:

| Situation | Watch | Why |
|---|---|---|
| Missing a case is costly (cancer screening, fraud) | Recall | Every false negative is the expensive error |
| Acting on a case is costly (pricey offers, account bans) | Precision | Every false positive wastes money or trust |
| You'll act on the top N by score | ROC AUC, or the hit rate in the top N | Ranking quality is what matters |
| Both errors matter, one number needed | F1 | Punishes neglecting either |

:::tip Report a pair, not a single score
"Precision 0.79 and recall 0.67 at the default threshold, ROC AUC 0.81" tells a stakeholder what the model does and leaves room to talk about trade-offs. A lone F1 or accuracy figure ends the conversation too early.
:::

Precision and recall moved in opposite directions between the model and the rule because they effectively use different cut-offs. You can move that cut-off yourself, on purpose, and that's next lesson.
