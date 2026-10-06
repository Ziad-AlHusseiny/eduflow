---
summary: Move the decision threshold to trade precision for recall, pick it from business costs with TunedThresholdClassifierCV, and handle rare classes with class weights and the right metrics.
takeaways:
  - "`predict` applies a 0.5 threshold to the probability; you can apply any threshold yourself with `predict_proba(X)[:, 1] >= t`."
  - Raising the threshold flags fewer cases, which usually raises precision and lowers recall; lowering it does the opposite.
  - "Choose the threshold from the cost of each mistake, on training data via cross-validation, for example with `TunedThresholdClassifierCV` and a custom scorer."
  - "When the positive class is rare, accuracy is misleading; report precision, recall and average precision instead."
  - "`class_weight=\"balanced\"` makes mistakes on the rare class count more during training, which raises recall at some cost in precision."
further:
  - title: "Tuning the decision threshold for class prediction"
    url: https://scikit-learn.org/stable/modules/classification_threshold.html
  - title: TunedThresholdClassifierCV
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TunedThresholdClassifierCV.html
  - title: precision_recall_curve
    url: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html
quiz:
  - q: "You lower the churn threshold from 0.5 to 0.3. What do you expect?"
    options:
      - text: Precision and recall both rise, because the model sees more churners.
        why: The model itself doesn't change. Flagging more customers catches more churners but also more stayers.
      - text: Accuracy must rise, because more churners are caught.
        why: Accuracy can go either way; the extra false positives may outnumber the extra true positives.
      - text: Nothing changes, because the threshold only affects `predict_proba`.
        why: It's the other way round. Probabilities stay the same; the labels derived from them change.
      - text: More customers are flagged; recall rises and precision usually falls.
        why: Correct. On the churn test set, recall goes from 0.67 to 0.93 while precision drops from 0.79 to 0.69.
    answer: 3
  - q: "Saving a churner is worth +$10 net and contacting a loyal customer costs $20. If the probabilities are well calibrated, above which churn probability is a contact worth it?"
    options:
      - text: "About 0.67, where `p * 10 = (1 - p) * 20`."
        why: Correct. Below 2/3, the expected loss on stayers outweighs the expected gain on churners.
      - text: "0.5, the default threshold."
        why: The default assumes both mistakes cost the same, which isn't the case here.
      - text: "About 0.33, because a churner is worth half what a wasted contact costs."
        why: That reverses the logic; expensive false positives push the threshold up, not down.
    answer: 0
  - q: "On the digits data, 10% of images are a 9. A model scores 98% accuracy. What should you report alongside it?"
    options:
      - text: Nothing; 98% is excellent for any problem.
        why: Predicting "not a 9" for everything already scores 90%, so 98% needs context.
      - text: Precision and recall for the 9s, plus the 90% majority-class baseline.
        why: Correct. Those show how many 9s are found and how many alarms are false, which accuracy hides.
      - text: The training accuracy, to show there's no overfitting.
        why: Useful in general, but it says nothing about how well the rare class is handled.
    answer: 1
  - q: "Why is choosing the threshold that maximises profit on the test set a mistake?"
    options:
      - text: Thresholds can only be chosen before training.
        why: Thresholds are applied after training; choosing one later is normal. The issue is which data you choose it on.
      - text: Profit isn't a valid machine learning metric.
        why: Any function of predictions and outcomes can be a metric; a business metric is often the best one.
      - text: The threshold becomes a tuned hyperparameter, so the test profit you report is optimistic.
        why: Correct. Choose it with cross-validation on training data, then measure once on the test set.
    answer: 2
---

`predict` has been quietly making a decision for you: label a customer a churner when the probability is at least 0.5. That cut-off assumes a missed churner and a wasted offer cost the same. They almost never do. Choosing the threshold on purpose is one of the cheapest, highest-value improvements you can make to a classifier, and it doesn't require retraining anything.

## The threshold is a dial

Probabilities come from the model; the threshold is your policy. Sweep it and watch precision and recall pull against each other.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
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
prob = model.predict_proba(X_test)[:, 1]

for t in [0.3, 0.4, 0.5, 0.6, 0.7, 0.8]:
    flagged = (prob >= t).astype(int)
    print(f"threshold {t:.1f}: flags {flagged.sum():2}  precision {precision_score(y_test, flagged):.2f}"
          f"  recall {recall_score(y_test, flagged):.2f}")
```

:::figure Precision and recall as the threshold moves (churn test set)
<svg viewBox="0 0 680 270" role="img" aria-labelledby="t1">
  <title id="t1">Line chart over thresholds 0.3 to 0.8. Precision rises gently from 0.69 to 0.86. Recall falls steeply from 0.93 to 0.33. The default threshold 0.5 is marked with a dashed vertical line.</title>
  <line class="d-line" x1="80" y1="220" x2="620" y2="220"/>
  <line class="d-line" x1="80" y1="20" x2="80" y2="220"/>
  <text class="d-label-muted" x="70" y="24" text-anchor="end">1.0</text>
  <text class="d-label-muted" x="70" y="124" text-anchor="end">0.5</text>
  <text class="d-label-muted" x="70" y="224" text-anchor="end">0</text>
  <text class="d-label-muted" x="100" y="242" text-anchor="middle">0.3</text>
  <text class="d-label-muted" x="300" y="242" text-anchor="middle">0.5</text>
  <text class="d-label-muted" x="600" y="242" text-anchor="middle">0.8</text>
  <text class="d-label-muted" x="350" y="264" text-anchor="middle">threshold</text>
  <line class="d-dashed d-line" x1="300" y1="20" x2="300" y2="220"/>
  <path class="d-arrow" d="M100 82 L200 76 L300 62 L400 56 L500 58 L600 48" fill="none"/>
  <path class="d-line" d="M100 34 L200 60 L300 86 L400 100 L500 130 L600 154" fill="none"/>
  <circle class="d-dot" cx="300" cy="62" r="5"/>
  <circle class="d-dot" cx="300" cy="86" r="5"/>
  <text class="d-label" x="610" y="44">precision</text>
  <text class="d-label" x="610" y="160">recall</text>
</svg>
:::

At 0.3 the model flags 74 customers and catches 93% of churners, but 31% of the flags are wrong. At 0.8 it flags 21, and 86% of them are right, but it catches only a third of the churners. Neither end is "better". The right point depends on money.

## Let the costs pick the threshold

Cartwheel's numbers: a win-back offer costs $20 in discount and handling. Contacting a real churner saves them 30% of the time, and a saved customer is worth $100 in margin, so each contacted churner is worth `0.3 * 100 - 20 = +$10` on average. Contacting a loyal customer wastes the $20. Profit is `10 * TP - 20 * FP`.

If the probabilities were perfectly calibrated, you could solve for the break-even point: contact when `p * 10 > (1 - p) * 20`, which is when `p > 2/3`. Real probabilities are rarely that well calibrated, so the more reliable approach is to search for the threshold that maximises profit, using cross-validation on the training data. `TunedThresholdClassifierCV` does exactly that.

```python run
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import make_scorer
from sklearn.model_selection import TunedThresholdClassifierCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

def profit(y_true, y_pred):
    y_true, y_pred = np.asarray(y_true), np.asarray(y_pred)
    tp = ((y_pred == 1) & (y_true == 1)).sum()
    fp = ((y_pred == 1) & (y_true == 0)).sum()
    return 10 * tp - 20 * fp

base = make_pipeline(StandardScaler(), LogisticRegression())
tuned = TunedThresholdClassifierCV(base, scoring=make_scorer(profit), cv=5).fit(X_train, y_train)
print("chosen threshold:", round(tuned.best_threshold_, 2))

default = base.fit(X_train, y_train)
print("test profit, contact everyone: ", profit(y_test, np.ones(len(y_test))))
print("test profit, threshold 0.5:    ", profit(y_test, default.predict(X_test)))
print("test profit, tuned threshold:  ", profit(y_test, tuned.predict(X_test)))
```

Contacting all 100 test customers loses $350. The default threshold makes $170; the tuned one, about 0.58, makes $180 while contacting fewer people. The theoretical 0.67 would have made less, because the model's probabilities are a little off: a reminder to trust measured results over tidy formulas. `make_scorer` turns any `(y_true, y_pred)` function into something scikit-learn's tuning tools can maximise.

A probability is **calibrated** when, among all customers scored at 0.7, about 70% really churn. Logistic regression is often close; boosted trees and forests are often further off. When you need the probabilities themselves to be right (for an expected-revenue forecast rather than a ranking), scikit-learn's `CalibratedClassifierCV` can rescale them. For choosing a threshold, tuning directly on the business metric sidesteps the question.

:::mistake Tuning the threshold on the test set
The table of thresholds above was computed on the test set to show the trade-off. Picking a threshold from it and reporting that test profit would be optimistic, the same peeking problem as with any hyperparameter. `TunedThresholdClassifierCV` chooses using cross-validation folds of the training data only; the test set is used once, to report.
:::

## When the positive class is rare

Churn is 55% of customers, so both classes are well represented. Many real problems aren't like that: fraud, defects, rare diseases. Take the digits dataset and ask "is this a 9?". Only 10% of images are, so a model that always answers "no" scores 90% accuracy.

```python run
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, digit = load_digits(return_X_y=True)
y = (digit == 9).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
print("share of 9s:", round(y.mean(), 3))

for weights in [None, "balanced"]:
    m = make_pipeline(StandardScaler(), LogisticRegression(class_weight=weights, max_iter=1000))
    m.fit(X_train, y_train)
    pred, prob = m.predict(X_test), m.predict_proba(X_test)[:, 1]
    print(f"class_weight={weights!s:9} accuracy {m.score(X_test, y_test):.3f}  "
          f"precision {precision_score(y_test, pred):.2f}  recall {recall_score(y_test, pred):.2f}  "
          f"avg precision {average_precision_score(y_test, prob):.3f}")
```

Accuracy barely moves, from 0.98 to 0.97, and tells you nothing useful. Precision and recall tell the real story. `class_weight="balanced"` weights each class inversely to its frequency during training, so a missed 9 costs about nine times as much as a false alarm. Recall rises from 0.82 to 0.91, precision falls from 0.97 to 0.82. **Average precision** (the area under the precision-recall curve) summarises ranking quality with a focus on the rare class; it's usually more informative than ROC AUC when positives are scarce.

:::tip Weights or threshold?
Both move the same trade-off. Class weights change what the model learns; a threshold changes how you act on its scores. Start with the threshold, because it's cheaper, reversible and tied directly to costs. Add class weights when the rare class is so rare that the model barely learns it at all.
:::

You've been comparing models and thresholds on one 100-customer test set and hedging every gap as "maybe noise". Section 4 replaces that single split with cross-validation, so you can finally say how big a difference has to be before it's real.
