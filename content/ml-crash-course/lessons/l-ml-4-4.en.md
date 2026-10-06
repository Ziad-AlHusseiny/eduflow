---
summary: Recognise the three common kinds of data leakage (target leakage, preprocessing before the split, and overlapping rows or time) and prevent them with snapshots, pipelines and the right splitter.
takeaways:
  - "Leakage is any information available during training or evaluation that won't be available when the model makes real predictions."
  - "Target leakage comes from features recorded after the moment of prediction; ask of every column, would I know this value at prediction time?"
  - "Fitting a scaler, imputer or feature selector before splitting lets validation rows shape the model; put every learned step inside a pipeline."
  - "When rows belong to the same customer or follow each other in time, use `GroupKFold` or `TimeSeriesSplit` instead of a random split."
  - A score that looks too good, or a single feature that dominates permutation importance, is a reason to hunt for leaks before celebrating.
further:
  - title: "Common pitfalls: data leakage"
    url: https://scikit-learn.org/stable/common_pitfalls.html#data-leakage
  - title: "Cross-validation iterators for grouped data"
    url: https://scikit-learn.org/stable/modules/cross_validation.html#group-k-fold
  - title: TimeSeriesSplit
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html
quiz:
  - q: "A teammate adds `refund_issued_in_q4` to the churn features and ROC AUC jumps from 0.81 to 0.97. The prediction is made on 30 September. What's the problem?"
    options:
      - text: The feature describes events after the prediction date, so it won't exist when the model runs; it's target leakage.
        why: Correct. Q4 refunds happen during the outcome window, so the model is partly reading the answer.
      - text: The feature is binary, and binary features always inflate AUC.
        why: Many legitimate features are binary (`used_coupon`). The problem is timing, not type.
      - text: Nothing; refunds are a known driver of churn.
        why: They may well be, but a model can only use what's known at prediction time.
      - text: The model is overfitting and needs a smaller `C`.
        why: A stronger penalty wouldn't stop the model using a feature that encodes the outcome.
    answer: 0
  - q: "On 2,000 columns of pure noise, selecting the 20 'best' columns on all the data and then cross-validating gives 0.75 accuracy. Inside a pipeline it gives 0.48. Why?"
    options:
      - text: The pipeline version uses fewer training rows, so it's weaker.
        why: Both use the same folds; the difference is where selection happens.
      - text: Selecting on all rows picked columns that happen to correlate with the labels of the validation rows too, so those rows were effectively seen during training.
        why: Correct. In the pipeline, selection only sees each fold's training rows, so the noise can't line up with validation labels.
      - text: SelectKBest is random, so the two runs chose different columns.
        why: SelectKBest is deterministic; the difference is which rows it looked at.
    answer: 1
  - q: "The order history has several rows per customer, and you want to predict at order level. Which splitter avoids leakage between folds?"
    options:
      - text: "`StratifiedKFold(shuffle=True)`, because it balances the classes."
        why: Class balance doesn't stop the same customer's orders landing in both training and validation folds.
      - text: "`KFold(shuffle=False)`, so rows keep their order."
        why: Unshuffled folds still split a customer's rows across folds when they aren't contiguous.
      - text: "`GroupKFold` with the customer id as the group, so each customer's rows stay in one fold."
        why: Correct. The model is then always validated on customers it never saw.
    answer: 2
  - q: "Which signal most strongly suggests a leak?"
    options:
      - text: Cross-validated accuracy is a few points above the rule baseline.
        why: That's what a modest, honest model looks like.
      - text: The fold scores vary by five points.
        why: Variation reflects small folds and noise, not leakage.
      - text: Training accuracy is higher than test accuracy.
        why: That's normal for almost every model.
      - text: One unfamiliar feature carries almost all the permutation importance and the score is near perfect.
        why: Correct. Real-world problems rarely have a single near-perfect predictor; when one appears, check when and how it was recorded.
    answer: 3
---

Every experienced data scientist has a story about the model that was too good. Accuracy of 99% in the notebook, coin-flip performance in production. The cause is almost always the same: during training or evaluation the model had access to information it wouldn't have in real life. That's **data leakage**, and it's dangerous because it doesn't look like a bug. It looks like success.

## Target leakage: features from the future

Cartwheel's churn table is a **snapshot**: every feature describes a customer as of 30 September 2025, and `churned` records what happened in the 90 days after. That timeline is the contract the model lives by. At prediction time, you only know what happened before the snapshot.

:::figure Features must come from before the prediction date
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">A timeline. Customer history up to the 30 September snapshot is where features may come from. The 90 days after the snapshot are the outcome window that defines churned. A feature computed from events inside the outcome window, such as recency measured at year end, is a leak.</title>
  <line class="d-line" x1="30" y1="110" x2="650" y2="110"/>
  <rect class="d-box-success" x="30" y="70" width="360" height="40" rx="6"/>
  <text class="d-label" x="210" y="95" text-anchor="middle">history: features come from here</text>
  <rect class="d-box-warn" x="390" y="70" width="260" height="40" rx="6"/>
  <text class="d-label" x="520" y="95" text-anchor="middle">outcome window (90 days)</text>
  <line class="d-line" x1="390" y1="50" x2="390" y2="140"/>
  <text class="d-label-strong" x="390" y="40" text-anchor="middle">30 Sep: predict</text>
  <text class="d-label-muted" x="650" y="160" text-anchor="end">29 Dec: churned known</text>
  <path class="d-arrow" d="M560 180 L470 125" marker-end="url(#arrow)"/>
  <text class="d-label" x="560" y="200" text-anchor="middle">"recency at year end" leaks</text>
</svg>
:::

Now imagine an analyst rebuilds the table in January and computes `days_since_last_order` as of the export date instead of the snapshot date. For churners, who didn't order in the window, the value is 92 days larger. For customers who stayed, it's small, because they ordered recently. The column now encodes the answer:

```python run
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
rng = np.random.default_rng(1)
# Recency measured at export time (year end), not at the 30 September snapshot
churn["recency_at_export"] = np.where(churn["churned"] == 1,
                                      churn["days_since_last_order"] + 92,
                                      rng.integers(0, 92, len(churn)))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
model = make_pipeline(StandardScaler(), LogisticRegression())
for cols in [features, features + ["recency_at_export"]]:
    auc = cross_val_score(model, churn[cols], churn["churned"], cv=cv, scoring="roc_auc").mean()
    print(f"{len(cols)} features: ROC AUC {auc:.3f}")
```

ROC AUC jumps from 0.81 to 0.999. Nothing in the code is wrong; cross-validation is done properly. The leak lives in how the data was built, which is why you have to look for it in the data's history, not the model.

Target leaks hide in innocent names: `account_status`, `last_contact_reason`, `refund_amount`, `total_orders` (counted at export, including future orders). The test for every column is one question: **would I know this value, exactly as stored, at the moment I make the prediction?**

## Preprocessing before the split

The second kind of leak happens in code. Any step that learns from data (scaling, imputing, encoding, selecting features) must learn from training rows only. Do it on the whole dataset first and the validation rows have shaped the model.

With scaling, the damage is usually small. With feature selection it can be enormous. Here's a dataset of pure noise: 200 rows, 2,000 random columns, random labels. No model should beat 50%.

```python run
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = rng.normal(size=(200, 2000))
y = rng.integers(0, 2, size=200)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

X_selected = SelectKBest(f_classif, k=20).fit_transform(X, y)   # selection saw every label
leaky = cross_val_score(LogisticRegression(), X_selected, y, cv=cv).mean()

pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
honest = cross_val_score(pipe, X, y, cv=cv).mean()
print(f"select then CV: {leaky:.3f}   select inside CV: {honest:.3f}")
```

Selecting on all 200 rows finds 20 columns that happen to line up with the labels of every row, including the ones later used for validation. Cross-validation then confirms a pattern that only exists because it was chosen using those very rows: 0.75 accuracy on noise. Inside a pipeline, selection sees only training folds and the score falls back to chance.

:::mistake "I only scaled the whole dataset, that's harmless"
Sometimes it nearly is. But the habit is what matters: the same code shape with an imputer, a target encoder or a feature selector produces leaks that inflate scores by 10 or 20 points. Make "every learned step lives in the pipeline" a rule with no exceptions, and the question never comes up.
:::

## Rows that know each other

The third kind comes from how rows relate. Random splits assume rows are independent. When they aren't, the test set contains near-copies of training rows.

- **Repeated entities.** If a table has several rows per customer, patient or device, a random split puts the same customer on both sides, and the model gets graded partly on people it has memorised. Use `GroupKFold` (or `GroupShuffleSplit`) with the customer id as `groups`.
- **Time.** If you're predicting the future, a random split lets the model learn from rows after the ones it's tested on. Use `TimeSeriesSplit`, or a simple cut-off date: train on the past, validate on later periods.
- **Duplicates.** Exact duplicate rows split across train and test are free answers. Drop them before splitting.

Cartwheel's churn table has one row per customer and a single snapshot date, so a stratified random split is fine. Change either of those and it isn't.

:::tip A leak-hunting checklist
Be suspicious when a score jumps after adding one column, when a model beats the business's best experts by a mile, or when permutation importance puts nearly everything on one feature with a vague name. Then trace that column back to the query that created it and check its timestamp against the prediction date.
:::

With leaks closed off, you can trust cross-validation to judge new ideas, and the most productive new ideas are usually better features. Next lesson builds some from domain knowledge and tests whether they earn their place.
