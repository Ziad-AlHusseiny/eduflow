---
summary: Turn domain knowledge into rates, ratios and log transforms, package them in a FunctionTransformer inside the pipeline, and keep only the features that beat cross-validation noise.
takeaways:
  - "Good features express what an expert would look at: rates per unit of time, ratios between related columns, and flags for meaningful states."
  - "Trees split one column at a time, so they benefit most from ratio features that combine columns; linear models benefit from transforms like logs that straighten relationships."
  - "Put feature code in a `FunctionTransformer` inside the pipeline so training, cross-validation and production compute features identically."
  - A new feature earns its place only if the cross-validated gain is larger than the fold-to-fold spread.
  - After choosing, refit the champion on all training data and score it once on the test set.
further:
  - title: FunctionTransformer
    url: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.FunctionTransformer.html
  - title: "Preprocessing data: custom transformers"
    url: https://scikit-learn.org/stable/modules/preprocessing.html#custom-transformers
quiz:
  - q: "Adding `orders_per_month` lifts a single tree's CV AUC from 0.72 to 0.76 but leaves logistic regression unchanged at 0.81. What's the most likely reason?"
    options:
      - text: The tree couldn't form "orders relative to tenure" from its one-column-at-a-time splits, while the linear model could already approximate it by weighting both columns.
        why: Correct. A tree needs many splits to imitate a ratio; handing it the ratio directly gives it one clean question.
      - text: Logistic regression ignores new features after the first eight.
        why: It uses every column it receives; the new one simply adds little beyond what it already had.
      - text: The tree is overfitting the new feature.
        why: Overfitting would hurt validation scores, not improve them.
      - text: The ratio leaks the target.
        why: Orders and tenure are both known at the snapshot date, so their ratio is safe.
    answer: 0
  - q: "Why compute features inside a `FunctionTransformer` in the pipeline instead of adding columns to the DataFrame up front?"
    options:
      - text: "`FunctionTransformer` makes features faster to compute."
        why: Speed is the same; it's the same pandas code either way.
      - text: The production service then computes exactly the same features from raw input, with no separate code to keep in sync.
        why: Correct. One object holds the feature logic and the model, so they can't drift apart.
      - text: Features added to a DataFrame can't be used by scikit-learn models.
        why: Any numeric DataFrame column can be used; the benefit is consistency.
    answer: 1
  - q: "`total_spent` is strongly right-skewed (a few customers spent thousands). Which transform usually helps a linear model?"
    options:
      - text: Squaring it, to spread the large values further.
        why: Squaring makes the skew worse and gives the extreme customers even more influence.
      - text: One-hot encoding it.
        why: That treats every distinct amount as a separate category, which throws away order and explodes the column count.
      - text: "`np.log1p(total_spent)`, which compresses large values so a $100 difference matters more at $50 than at $3,000."
        why: Correct. Log transforms tame skew and often make relationships closer to linear. Trees don't need them.
    answer: 2
  - q: "A new feature raises mean CV AUC from 0.807 to 0.811, with fold standard deviations around 0.035. What should you do?"
    options:
      - text: Keep it; any improvement is worth having.
        why: Every feature has a running cost (computing, monitoring, explaining), and a gain this size is indistinguishable from noise.
      - text: Report it as a 0.4-point improvement.
        why: That overstates evidence that isn't there.
      - text: Tune the model again until the gap is bigger.
        why: Tuning to widen a noisy gap is overfitting your validation folds.
      - text: Treat it as no change; keep the simpler feature set unless the feature has another reason to exist.
        why: Correct. A gain well inside the spread is noise; the default is to leave the feature out.
    answer: 3
---

Models only see the columns you give them. A support lead looking at a customer doesn't think "4 orders and 600 days of tenure"; they think "orders about once every five months". That rate, not either raw number, is the useful idea. **Feature engineering** turns that kind of domain knowledge into columns, and on tabular data it's often worth more than any amount of tuning.

## Ideas that come from the business

Good churn features usually fall into a few families:

- **Rates**: orders per month of tenure, tickets per order. Raw counts grow with tenure; rates compare customers fairly.
- **Ratios against the customer's own habits**: days since last order divided by their typical gap between orders. Thirty days of silence is alarming for a weekly buyer and normal for someone who orders twice a year.
- **Transforms**: `log1p` of money columns, which squeezes long right tails so that the difference between $50 and $150 counts for more than the difference between $3,000 and $3,100.
- **Flags**: "never answered the survey", "only ever ordered once".

Each of these must be computable from information available at the snapshot date. A rate built from tenure and orders is fine; anything that peeks into the outcome window is the leak from last lesson.

## Features inside the pipeline

Write the feature code once, as a function from DataFrame to DataFrame, and wrap it in a `FunctionTransformer`. Inside a pipeline it runs in cross-validation, in the final fit and in production, always the same way.

```python run
import numpy as np
import pandas as pd
from sklearn.preprocessing import FunctionTransformer

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]

def add_features(df):
    df = df.copy()
    months = df["tenure_days"] / 30.4
    df["orders_per_month"] = df["orders"] / months
    df["typical_gap"] = df["tenure_days"] / df["orders"]
    df["overdue"] = df["days_since_last_order"] / df["typical_gap"]
    df["log_spent"] = np.log1p(df["total_spent"])
    return df

engineered = FunctionTransformer(add_features).fit_transform(churn[features])
print(engineered[["orders", "tenure_days", "orders_per_month", "overdue", "log_spent"]].head().round(2))
print("skew of total_spent:", round(churn["total_spent"].skew(), 2),
      "| after log1p:", round(np.log1p(churn["total_spent"]).skew(), 2))
```

`df.copy()` matters: the function shouldn't modify the caller's DataFrame. Since every customer has at least one order and positive tenure, the divisions are safe here; in your own data, guard against zeros.

The function is **stateless**: each row's new values depend only on that row. Stateless features can't leak across folds. A feature like "spend compared with the average customer" is different, because the average is learned from data; it needs a proper transformer with `fit`, or it will quietly use validation rows.

## Do they help? Ask cross-validation

```python run
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def add_features(df):
    df = df.copy()
    df["orders_per_month"] = df["orders"] / (df["tenure_days"] / 30.4)
    df["typical_gap"] = df["tenure_days"] / df["orders"]
    df["overdue"] = df["days_since_last_order"] / df["typical_gap"]
    df["log_spent"] = np.log1p(df["total_spent"])
    return df

models = {"tree": DecisionTreeClassifier(min_samples_leaf=20, random_state=42),
          "logistic": make_pipeline(StandardScaler(), LogisticRegression())}
for name, model in models.items():
    plain = cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc")
    richer = cross_val_score(make_pipeline(FunctionTransformer(add_features), model),
                             X_train, y_train, cv=cv, scoring="roc_auc")
    print(f"{name:8} plain {plain.mean():.3f} ± {plain.std():.3f}   "
          f"engineered {richer.mean():.3f} ± {richer.std():.3f}")
```

The single tree improves from 0.716 to 0.759, and its folds become steadier. Look inside and you'll see why: `orders_per_month` becomes the root question. A tree can only compare one column with a threshold, so "few orders for this much tenure" would take a staircase of splits to imitate. Handed the ratio, it needs one.

Logistic regression moves from 0.807 to 0.811, well inside a spread of ±0.04. That's no change. A linear model can already weigh `orders` against `tenure_days`, and recency, the dominant signal, was there from the start. Different model families need different features: ratios and interactions for trees, straightening transforms for linear models.

:::mistake Keeping every feature that nudges the mean up
With five folds of 60 customers, the mean AUC wobbles by a point or more from noise alone. If you try twenty features and keep each one that raises the mean, you'll keep about half of them by luck and ship a slower, harder-to-explain model. Keep a feature when its gain clearly exceeds the spread, or when it carries a business meaning you need anyway.
:::

## Closing the section: the champion

Section 4 tested ensembles, extra columns, tuning and engineered features with honest cross-validation. Most of them didn't beat the simple model. So the champion is still the scaled logistic regression on eight numeric columns, and now it's time to spend the test set:

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

champion = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
print("test ROC AUC:", round(roc_auc_score(y_test, champion.predict_proba(X_test)[:, 1]), 3))
print("test accuracy:", champion.score(X_test, y_test))
```

Test ROC AUC 0.81 against a cross-validated 0.81: no surprise, which is exactly what a leak-free process looks like. That agreement is what section 4 bought you. Not a higher number, but a number you can stand behind in a meeting.

:::why Why "the simple model won" is a good outcome
A model you can explain in two sentences, retrain in milliseconds and debug with a coefficient table is cheaper to run for years. When the data grows, rerun the same comparisons; the ensembles and the categorical columns may earn their place then. The process, not the winner, is the reusable asset.
:::

Section 5 steps beyond supervised tables: finding structure without labels, a first look at neural networks, where LLMs fit in, and what it takes to put the champion in front of real customers responsibly.
