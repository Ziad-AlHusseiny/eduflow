---
summary: Build the two baselines every model must beat, a majority-class dummy and a one-line business rule, and judge a model by its lift over them instead of its raw score.
takeaways:
  - A score means nothing until you compare it with a baseline built on the same split.
  - "`DummyClassifier` predicts the most common class and `DummyRegressor` predicts the mean; they set the floor."
  - A simple rule tuned on the training data is the baseline that keeps you honest about whether a model is worth its cost.
  - "When one class dominates, accuracy rewards ignoring the rare class; a 95% score can mean the model found nothing."
further:
  - title: "Dummy estimators"
    url: https://scikit-learn.org/stable/modules/model_evaluation.html#dummy-estimators
  - title: DummyClassifier
    url: https://scikit-learn.org/stable/modules/generated/sklearn.dummy.DummyClassifier.html
quiz:
  - q: "A fraud model scores 97% accuracy. 3% of transactions are fraud. What should you check first?"
    options:
      - text: Whether the model beats a dummy that predicts "not fraud" for everything.
        why: Correct. That dummy also scores 97%, so the model may have learned nothing about fraud.
      - text: Whether 97% is higher than the industry average for fraud models.
        why: Other companies' numbers come from other data and class balances. The comparison that matters is on your own split.
      - text: Whether the training accuracy is also around 97%.
        why: Comparing train and test checks overfitting, but both can be 97% while the model never catches a single fraud.
    answer: 0
  - q: "Your rule baseline uses a cut-off of 80 days. How should that 80 have been chosen?"
    options:
      - text: By trying several cut-offs and keeping the one with the best test accuracy.
        why: That tunes the baseline on the test set, making it look better than it would on new data, which is the same mistake as tuning a model on it.
      - text: By trying several cut-offs on the training data and keeping the best one there.
        why: Correct. The baseline gets the same treatment as a model; the test set only measures the final result.
      - text: It doesn't matter for a baseline, since baselines aren't shipped.
        why: Rules often are shipped, and an unfairly tuned baseline gives you a wrong verdict on whether the model is worth it.
    answer: 1
  - q: "`DummyRegressor()` on the diabetes data scores an R² of about 0 on the test set. Why?"
    options:
      - text: The dummy failed to converge.
        why: There's nothing to converge. The dummy computes one number, the training mean.
      - text: The diabetes target has no pattern in it.
        why: The dummy never looks at the features, so its score says nothing about whether a pattern exists.
      - text: "R² measures improvement over predicting the mean, and the dummy predicts the mean."
        why: Correct. R² is 0 for the mean predictor by design; a tiny negative number appears because the training mean differs slightly from the test mean.
    answer: 2
  - q: "A tree beats the majority-class dummy by 18 points but a one-line rule by 1 point. What is the most defensible next step?"
    options:
      - text: Ship the tree, since it has the highest score.
        why: One point on 100 test customers is one customer. That isn't evidence the tree is better, and the rule is easier to run and explain.
      - text: Report that the tree is 18 points better than the baseline.
        why: Quoting only the weakest baseline hides that a much simpler option does as well. That's the hype this lesson warns about.
      - text: Keep the rule as the benchmark and only switch when a model beats it clearly and repeatably.
        why: Correct. Section 4's cross-validation tells you whether a gap is real or noise.
    answer: 2
---

Your depth-3 tree predicts churn with 73% accuracy on unseen customers. Before you show that number to anyone, ask the question every experienced data scientist asks first: compared to what? Without a comparison, 73% is neither good nor bad. It's a number.

## The dumbest possible model

The first baseline ignores the features entirely. For classification, it predicts the most common class for everyone. For regression, it predicts the average. scikit-learn ships both as real estimators, so they fit into the same code as any model.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
print("dummy predicts:", dummy.predict(X_test)[:5])
print("dummy accuracy:", dummy.score(X_test, y_test))
```

Predicting "churned" for every customer is right 55% of the time, because 55% of customers churned. That's the floor. Your tree's 73% is 18 points above it, which is real progress, but you're not done asking.

:::mistake Comparing with a coin flip
People often treat 50% as the baseline for a yes/no problem. It isn't, unless the classes are balanced. If 95% of transactions are legitimate, a "model" that says "legitimate" every time scores 95% accuracy and catches zero fraud. Always compute the majority-class score on your own test set, and be suspicious of any accuracy close to it.
:::

## The rule a person would write

The second baseline is the one that hurts. Before machine learning, someone at Cartwheel would have written a rule: "if the customer hasn't ordered in N days, they're churning". You choose N the way you'd train a model: on the training data only.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

def rule_accuracy(days, X, y):
    predicted = (X["days_since_last_order"] > days).astype(int)
    return (predicted == y).mean()

candidates = range(30, 301, 10)
best_days = max(candidates, key=lambda d: rule_accuracy(d, X_train, y_train))
print("best cut-off on training data:", best_days, "days")
print("rule accuracy on test data:", rule_accuracy(best_days, X_test, y_test))
```

The rule gets 72% on the test set. The tree gets 73%. On 100 test customers that's a difference of one person.

:::figure Accuracy on the same 100 test customers
<svg viewBox="0 0 640 230" role="img" aria-labelledby="t1">
  <title id="t1">Bar chart of test accuracy: majority-class dummy 55%, 80-day rule 72%, depth-3 tree 73%.</title>
  <line class="d-line" x1="190" y1="20" x2="190" y2="190"/>
  <text class="d-label" x="180" y="55" text-anchor="end">Dummy</text>
  <rect class="d-box" x="190" y="34" width="231" height="32" rx="4"/>
  <text class="d-label-strong" x="431" y="56">55%</text>
  <text class="d-label" x="180" y="110" text-anchor="end">80-day rule</text>
  <rect class="d-box-warn" x="190" y="89" width="302" height="32" rx="4"/>
  <text class="d-label-strong" x="502" y="111">72%</text>
  <text class="d-label" x="180" y="165" text-anchor="end">Depth-3 tree</text>
  <rect class="d-box-primary" x="190" y="144" width="307" height="32" rx="4"/>
  <text class="d-label-strong" x="507" y="166">73%</text>
  <text class="d-label-muted" x="190" y="215">bar length = accuracy (0% at the axis, 100% at 610)</text>
</svg>
:::

That isn't a failure. It's the most useful thing you've learned so far. It tells you that most of the signal for churn lives in one column, recency, and that an eight-feature tree has so far added almost nothing on top of it. It also gives you a target: from here on, a model has to beat 72%, not 55%, to be worth deploying, explaining and monitoring.

:::why Why the rule baseline matters
A model has running costs: a pipeline to feed it, retraining, monitoring, and a meeting every time it does something odd. A rule costs one line of SQL. When a stakeholder asks "why not just use the rule?", you want to have measured the answer before they asked.
:::

## Baselines for regression

The regression counterpart is `DummyRegressor`, which predicts the training mean for every row. Its `score` (R²) on test data is close to 0, because R² is defined as improvement over predicting the mean. You'll use it in section 2.

```python run
from sklearn.datasets import load_diabetes
from sklearn.dummy import DummyRegressor
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
dummy = DummyRegressor(strategy="mean").fit(X_train, y_train)
print("predicts", round(dummy.predict(X_test)[0], 1), "for everyone")
print("R² on test:", round(dummy.score(X_test, y_test), 3))
```

## Lift, not score

From now on, report a model as lift over its baselines: "73% accuracy, against 55% for the majority class and 72% for the 80-day rule". That one sentence tells a reader more than any single number, and it protects you from fooling yourself.

Keep the baselines in your code, next to the models, and rerun them whenever the data or the split changes. A baseline computed once on an old split and quoted forever is worse than none, because it looks like evidence. In practice the comparison table at the end of a notebook should have the dummy at the top, the best rule below it, and every model after that, all scored on exactly the same test rows.

Be honest about noise, too. With 100 test customers, one customer is one percentage point, so differences of two or three points can appear or vanish with a different shuffle. Section 4 replaces the single split with cross-validation, which tells you how much a score wobbles. Until then, treat small gaps as ties.

Accuracy is also not the only way to compare. A model that ranks customers by churn risk can hand marketing the 30 most likely churners, which a yes/no rule can't do. Section 3 measures exactly that. First, section 2 opens up the simplest model of all, a straight line, to see what "learning" means in numbers.
