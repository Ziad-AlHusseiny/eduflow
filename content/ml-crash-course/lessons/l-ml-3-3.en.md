---
summary: Combine many trees with random forests and gradient boosting, use HistGradientBoostingClassifier's built-in handling of missing values, and measure feature importance with permutation importance.
takeaways:
  - "A random forest trains many deep trees on bootstrap samples with random feature subsets and averages their votes, which cancels much of a single tree's variance."
  - "Gradient boosting builds shallow trees one after another, each fitted to the errors of the ensemble so far; `learning_rate` and `max_iter` trade off speed and overfitting."
  - "`HistGradientBoostingClassifier` is scikit-learn's fast boosting model and accepts missing values (NaN) directly."
  - "Impurity-based `feature_importances_` favour features with many distinct values; permutation importance on held-out data measures what the model really relies on."
  - On small tabular datasets, ensembles often add only a few points over a good linear model, so compare them against it rather than assuming they win.
further:
  - title: "Ensembles: Gradient boosting, random forests, bagging"
    url: https://scikit-learn.org/stable/modules/ensemble.html
  - title: HistGradientBoostingClassifier
    url: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingClassifier.html
  - title: "Permutation feature importance"
    url: https://scikit-learn.org/stable/modules/permutation_importance.html
quiz:
  - q: "Why does a random forest usually beat a single unconstrained tree on new data?"
    options:
      - text: Each of its trees is shallower and therefore cannot overfit.
        why: Forest trees are typically grown deep. The benefit comes from averaging, not from limiting each tree.
      - text: It uses gradient descent to tune the trees together.
        why: Forest trees are trained independently; nothing ties them together during training.
      - text: It trains on more data than the single tree.
        why: Each tree sees a bootstrap sample of the same training set, so no extra data is involved.
      - text: Averaging many trees trained on different samples and feature subsets cancels out their individual mistakes.
        why: Correct. Each tree overfits in its own way; the errors are partly independent, so the average is more stable.
    answer: 3
  - q: "In gradient boosting, what does each new tree learn?"
    options:
      - text: To correct the errors that the ensemble built so far still makes.
        why: Correct. Boosting is sequential; every tree targets what's left over.
      - text: The same target as the first tree, on a fresh bootstrap sample.
        why: That describes bagging, the idea behind random forests.
      - text: A random subset of the features, ignoring previous trees.
        why: Random feature subsets are a forest trick. Boosting trees depend on the trees before them.
    answer: 0
  - q: "`avg_satisfaction` is blank for half the customers. Which model can you fit on it with no extra preprocessing?"
    options:
      - text: "`LogisticRegression`, because it ignores missing values."
        why: "It raises `ValueError: Input X contains NaN`. You would need an imputer first."
      - text: "`HistGradientBoostingClassifier`, which learns which branch missing values should follow at each split."
        why: Correct. Native NaN support is one of its main practical advantages.
      - text: "`KNeighborsClassifier`, because it skips missing columns when measuring distance."
        why: k-NN raises an error on NaN too; distances can't be computed with gaps.
    answer: 1
  - q: "A forest's `feature_importances_` ranks `tenure_days` second, but permutation importance on the test set gives it almost zero. What's the most likely explanation?"
    options:
      - text: Permutation importance is broken for random forests.
        why: It works for any model; it only needs predictions and a score.
      - text: The test set is too small to contain `tenure_days`.
        why: Every row has the feature. Small test sets add noise, but this pattern has a known cause.
      - text: The forest used `tenure_days` in many splits that fit training noise, which inflates impurity importance but doesn't help on new data.
        why: Correct. Impurity importance is computed on training data and favours continuous features with many possible thresholds.
      - text: Shuffling `tenure_days` made the model more accurate, which proves the feature is harmful.
        why: A near-zero result means shuffling changed little, not that the model improved.
    answer: 2
---

A single decision tree is easy to read and easy to break: change a few training rows and the branches rearrange. The cure is an old statistical trick. Ask many independent, slightly different estimators and combine their answers. The errors of each one partly cancel, and what's left is more reliable than any single member. Models built this way are **ensembles**, and for tabular data like churn they're what most practitioners reach for after the baselines and a linear model.

## Random forests: many trees, averaged

A random forest grows a few hundred deep trees, each on a different **bootstrap sample** (the training rows sampled with replacement, so each tree sees a slightly different dataset) and, at every split, only a random subset of the features. That second trick stops every tree from opening with the same dominant feature, which makes the trees more different from each other and their mistakes less correlated. To predict, the forest averages the trees' probabilities.

## Gradient boosting: trees that fix each other

Boosting takes the opposite approach. It builds shallow trees one at a time. The first makes rough predictions; the second is fitted to the errors the first one left; the third to what the first two still get wrong, and so on. Each tree's contribution is scaled down by the `learning_rate`, so the ensemble creeps towards a good answer instead of lurching. More trees (`max_iter`) and a higher learning rate fit the training data more closely, and eventually overfit it.

:::figure Bagging averages in parallel; boosting corrects in sequence
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">Top row, random forest: three trees trained independently on different samples feed into an average. Bottom row, gradient boosting: tree 1 feeds its errors to tree 2, which feeds its remaining errors to tree 3, and their scaled outputs are summed.</title>
  <text class="d-label-strong" x="10" y="24">Random forest (bagging)</text>
  <rect class="d-box" x="20" y="40" width="110" height="40" rx="8"/><text class="d-label" x="75" y="65" text-anchor="middle">tree on sample 1</text>
  <rect class="d-box" x="150" y="40" width="110" height="40" rx="8"/><text class="d-label" x="205" y="65" text-anchor="middle">tree on sample 2</text>
  <rect class="d-box" x="280" y="40" width="110" height="40" rx="8"/><text class="d-label" x="335" y="65" text-anchor="middle">tree on sample 3</text>
  <path class="d-arrow" d="M390 60 L480 60" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="485" y="40" width="190" height="40" rx="8"/><text class="d-label" x="580" y="65" text-anchor="middle">average the votes</text>
  <text class="d-label-strong" x="10" y="140">Gradient boosting</text>
  <rect class="d-box" x="20" y="160" width="110" height="40" rx="8"/><text class="d-label" x="75" y="185" text-anchor="middle">tree 1</text>
  <path class="d-arrow" d="M130 180 L150 180" marker-end="url(#arrow)"/>
  <rect class="d-box" x="155" y="160" width="110" height="40" rx="8"/><text class="d-label" x="210" y="185" text-anchor="middle">tree 2 on errors</text>
  <path class="d-arrow" d="M265 180 L285 180" marker-end="url(#arrow)"/>
  <rect class="d-box" x="290" y="160" width="110" height="40" rx="8"/><text class="d-label" x="345" y="185" text-anchor="middle">tree 3 on errors</text>
  <path class="d-arrow" d="M400 180 L480 180" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="485" y="160" width="190" height="40" rx="8"/><text class="d-label" x="580" y="185" text-anchor="middle">sum, scaled by learning rate</text>
  <text class="d-label-muted" x="210" y="228" text-anchor="middle">each tree depends on the ones before it</text>
</svg>
:::

## Both on churn, with the missing column back

So far you've left out `avg_satisfaction` because half its values are blank. `HistGradientBoostingClassifier`, scikit-learn's fast boosting implementation, handles missing values natively: at each split it learns which side the blanks should go to. Recent versions of `DecisionTreeClassifier` and `RandomForestClassifier` accept NaN too. `LogisticRegression` and k-NN still don't; they raise `ValueError: Input X contains NaN`.

```python run
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share",
            "avg_satisfaction"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

no_gaps = features[:-1]  # logistic regression can't take the NaNs in avg_satisfaction
models = {
    "logistic (no satisfaction)": (make_pipeline(StandardScaler(), LogisticRegression()), no_gaps),
    "random forest": (RandomForestClassifier(n_estimators=300, min_samples_leaf=5,
                                             random_state=42), features),
    "boosting, defaults": (HistGradientBoostingClassifier(random_state=42), features),
    "boosting, gentle": (HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05,
                                                        max_iter=200, random_state=42), features),
}
for name, (model, cols) in models.items():
    model.fit(X_train[cols], y_train)
    print(f"{name:27} train {model.score(X_train[cols], y_train):.2f}  "
          f"test {model.score(X_test[cols], y_test):.2f}")
```

The forest reaches 0.76 and gently tuned boosting 0.78, against 0.72 for logistic regression and the rule. Boosting with default settings fits the training set almost perfectly (0.99) and does worse than the gentle version: on 298 rows, the defaults are too eager. Shallower trees and a smaller learning rate keep it in check.

Hold these numbers loosely. On a 100-customer test set, two points is two customers. The next lesson adds a metric for ranking quality, and section 4's cross-validation will tell you whether the ensembles' edge survives a different shuffle.

## What do the trees rely on?

Forests offer `feature_importances_`, but those numbers are computed on the training data from how much each feature reduced impurity, and they're biased towards continuous features with many possible thresholds. **Permutation importance** asks a sharper question on held-out data: if I shuffle this one column, breaking its link with the target, how much does the score drop?

```python run
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share",
            "avg_satisfaction"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
forest = RandomForestClassifier(n_estimators=300, min_samples_leaf=5, random_state=42).fit(X_train, y_train)

result = permutation_importance(forest, X_test, y_test, n_repeats=10, random_state=42)
table = pd.DataFrame({"impurity (train)": forest.feature_importances_,
                      "permutation (test)": result.importances_mean}, index=features)
print(table.sort_values("permutation (test)", ascending=False).round(3))
```

Impurity importance ranks `tenure_days` second. Permutation importance on the test set says it barely matters: the forest used it to fit noise in the training data. Shuffling recency costs about 13 points of accuracy; shuffling satisfaction costs nothing (the small negative values are noise). The honest summary for Cartwheel: recency and order count drive the predictions, and the satisfaction survey, in its current half-empty state, adds nothing.

:::mistake Reporting impurity importances as "what drives churn"
Impurity importances describe how one model grew its trees on training data. They inflate continuous, high-cardinality features and split credit arbitrarily between correlated ones. When a stakeholder asks what matters, use permutation importance on held-out data, and still phrase the answer as "what the model relies on", not "what causes churn".
:::

:::tip Default choices for tabular data
After baselines and a logistic regression, try `HistGradientBoostingClassifier` with a modest `learning_rate` (0.05–0.1) and shallow trees. It's fast, handles missing values, and is hard to beat on tables. Use `RandomForestClassifier` when you want a strong model with almost no tuning.
:::

Accuracy has carried you this far, but it treats a missed churner and a false alarm as equally bad, and it ignores the ranking you built for marketing. Next lesson replaces it with metrics that look at each kind of mistake separately.
