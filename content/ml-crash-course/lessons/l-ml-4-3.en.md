---
summary: Tune hyperparameters with GridSearchCV and RandomizedSearchCV using pipeline step names, read cv_results_, and keep the final test score honest after the search.
takeaways:
  - "`GridSearchCV` tries every combination in a grid, cross-validating each; `RandomizedSearchCV` samples a fixed number of combinations from lists or distributions."
  - "Inside a pipeline, parameters are addressed as `step__parameter`, for example `model__C`."
  - "After the search, `best_params_` holds the winner and `best_estimator_` is that model refit on all the training data."
  - "`best_score_` is slightly optimistic because it's the best of many tries; the test set gives the unbiased number."
  - Search on a log scale for parameters like `C`, `alpha` and `learning_rate`, and expect tuning to add points, not miracles.
further:
  - title: "Tuning the hyper-parameters of an estimator"
    url: https://scikit-learn.org/stable/modules/grid_search.html
  - title: GridSearchCV
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html
  - title: RandomizedSearchCV
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.RandomizedSearchCV.html
quiz:
  - q: "Your pipeline is `Pipeline([(\"prep\", preprocess), (\"clf\", LogisticRegression())])`. Which grid tunes the regularisation strength?"
    options:
      - text: "`{\"C\": [0.1, 1, 10]}`"
        why: The pipeline has no parameter called `C`; the search would raise an invalid-parameter error.
      - text: "`{\"LogisticRegression__C\": [0.1, 1, 10]}`"
        why: The prefix is the step's name, not the class name.
      - text: "`{\"clf.C\": [0.1, 1, 10]}`"
        why: scikit-learn uses a double underscore, not a dot, to reach into steps.
      - text: "`{\"clf__C\": [0.1, 1, 10]}`"
        why: Correct. Step name, two underscores, parameter name.
    answer: 3
  - q: "A grid has 5 values for `max_depth` and 5 for `min_samples_leaf`, with `cv=5`. How many models are fitted, including the final refit?"
    options:
      - text: "126: 25 combinations × 5 folds, plus one refit on all the training data."
        why: Correct. With the default `refit=True` the winner is retrained once more at the end.
      - text: "25: one per combination."
        why: Each combination is cross-validated, so it's fitted once per fold.
      - text: "10: five values plus five values."
        why: A grid tries every combination, not each value on its own.
    answer: 0
  - q: "Why might `RandomizedSearchCV` with 20 iterations beat a 400-combination grid on the same budget of time?"
    options:
      - text: Random search uses a smarter optimiser that learns from previous trials.
        why: Plain random search doesn't learn between trials; each sample is independent.
      - text: Random search always finds the true optimum.
        why: It samples, so it can miss the optimum; the point is efficiency, not guarantees.
      - text: When only a few parameters matter, random sampling tries many more distinct values of those parameters than a grid does.
        why: Correct. A grid wastes trials repeating the same values of the important parameter while varying unimportant ones.
    answer: 2
  - q: "The search reports `best_score_ = 0.813`, and the refit model scores 0.805 on the test set. What's going on?"
    options:
      - text: The test set must be leaking, since scores should match exactly.
        why: Scores differ on different data; a leak would push the test score up, not down.
      - text: The best of many cross-validated scores is a little optimistic; the test score is the honest estimate.
        why: Correct. Picking the maximum of noisy scores favours lucky configurations, a winner's curse.
      - text: The refit on all training data made the model worse.
        why: More training data rarely hurts; the gap comes from how the winner was selected.
    answer: 1
---

Every model so far has had settings you picked by hand or left at defaults: `C=1.0`, `max_depth=3`, `min_samples_leaf=5`. Some of those choices matter a lot, some barely at all, and the only way to know is to try. Trying by hand means loops, bookkeeping and the temptation to peek at the test set. scikit-learn's search tools do it properly, with cross-validation built in.

## Grid search

`GridSearchCV` takes an estimator, a dictionary of parameter values and a cross-validation scheme. It cross-validates every combination, picks the one with the best mean score, and refits it on all the training data. Afterwards it behaves like the winning model.

Parameters inside a pipeline are addressed by step name, two underscores, and parameter name. That's why naming your steps pays off.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

pipe = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression())])
search = GridSearchCV(pipe, {"model__C": [0.01, 0.03, 0.1, 0.3, 1, 3, 10]},
                      cv=cv, scoring="roc_auc")
search.fit(X_train, y_train)

results = pd.DataFrame(search.cv_results_)
print(results[["param_model__C", "mean_test_score", "std_test_score"]].round(3))
print("best:", search.best_params_, "CV AUC", round(search.best_score_, 3))
```

`cv_results_` holds every combination's fold scores; as a DataFrame it's easy to scan. Here the scan is the finding: from `C=0.03` to `C=10` the mean AUC moves by less than half a point, far inside the fold-to-fold spread. Eight well-behaved features don't give logistic regression room to overfit, so its penalty barely matters. Tuning can't rescue a model that's already at its ceiling; better features or a different model family might.

Notice the values are spaced by factors of about three. For parameters that act multiplicatively (`C`, `alpha`, learning rates), search on a log scale; 0.01, 0.1, 1, 10 covers far more ground than 1, 2, 3, 4.

## A grid where it matters

Trees are another story. Depth and minimum leaf size control how much a tree can memorise, and the right values depend on the data.

```python run
import pandas as pd
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

grid = {"max_depth": [2, 3, 4, 5, None], "min_samples_leaf": [1, 5, 10, 20, 40]}
search = GridSearchCV(DecisionTreeClassifier(random_state=42), grid, cv=cv, scoring="roc_auc")
search.fit(X_train, y_train)

top = pd.DataFrame(search.cv_results_).sort_values("rank_test_score")
print(top[["param_max_depth", "param_min_samples_leaf", "mean_test_score"]].head(5).round(3))
print("worst:", round(top["mean_test_score"].min(), 3))
print("best:", search.best_params_, "| test AUC", round(search.score(X_test, y_test), 3))
```

25 combinations × 5 folds = 125 fits, plus one final refit. The spread is wide: the worst trees (unlimited depth, single-customer leaves) score far below the best. `search.score` uses the same `scoring` as the search, so it reports test ROC AUC here.

## Random search

Grids grow multiplicatively. Four parameters with six values each is 1,296 combinations, times five folds. **`RandomizedSearchCV`** samples a fixed number of combinations (`n_iter`) instead, and it accepts distributions as well as lists.

:::figure Grid search versus random search with the same nine trials
<svg viewBox="0 0 680 270" role="img" aria-labelledby="t1">
  <title id="t1">Two squares with an important parameter on the horizontal axis and an unimportant one on the vertical. The grid places nine points in a 3 by 3 lattice, testing only three distinct values of the important parameter. Random search scatters nine points, testing nine distinct values.</title>
  <rect class="d-box" x="40" y="20" width="240" height="200" rx="6"/>
  <rect class="d-box" x="400" y="20" width="240" height="200" rx="6"/>
  <circle class="d-dot" cx="80" cy="60" r="7"/><circle class="d-dot" cx="160" cy="60" r="7"/><circle class="d-dot" cx="240" cy="60" r="7"/>
  <circle class="d-dot" cx="80" cy="120" r="7"/><circle class="d-dot" cx="160" cy="120" r="7"/><circle class="d-dot" cx="240" cy="120" r="7"/>
  <circle class="d-dot" cx="80" cy="180" r="7"/><circle class="d-dot" cx="160" cy="180" r="7"/><circle class="d-dot" cx="240" cy="180" r="7"/>
  <circle class="d-dot" cx="425" cy="150" r="7"/><circle class="d-dot" cx="452" cy="70" r="7"/><circle class="d-dot" cx="478" cy="195" r="7"/>
  <circle class="d-dot" cx="505" cy="105" r="7"/><circle class="d-dot" cx="532" cy="45" r="7"/><circle class="d-dot" cx="560" cy="170" r="7"/>
  <circle class="d-dot" cx="585" cy="125" r="7"/><circle class="d-dot" cx="608" cy="60" r="7"/><circle class="d-dot" cx="628" cy="200" r="7"/>
  <text class="d-label-strong" x="160" y="245" text-anchor="middle">Grid: 3 values tried</text>
  <text class="d-label-strong" x="520" y="245" text-anchor="middle">Random: 9 values tried</text>
  <text class="d-label-muted" x="340" y="125" text-anchor="middle">important →</text>
</svg>
:::

When only one or two parameters really matter, which is the usual case, random search explores many more distinct values of them for the same budget.

```python run
import pandas as pd
from scipy.stats import randint
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, train_test_split

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

space = {"max_features": [1, 2, 3, 4, "sqrt"], "min_samples_leaf": randint(1, 30)}
search = RandomizedSearchCV(RandomForestClassifier(n_estimators=60, random_state=42), space,
                            n_iter=8, cv=cv, scoring="roc_auc", random_state=42)
search.fit(X_train, y_train)
print("best:", search.best_params_)
print("CV AUC", round(search.best_score_, 3), "| test AUC", round(search.score(X_test, y_test), 3))
```

`randint(1, 30)` from SciPy draws integers from 1 to 29; `loguniform(0.01, 10)` is the usual choice for `C` or learning rates. Set `random_state` on the search so it samples the same candidates each run.

## Searching more than model settings

Because the search tunes the whole pipeline, preprocessing choices are fair game too. A grid entry like `"prep__sat__simpleimputer__strategy": ["mean", "median"]` compares imputation strategies with the same honest folds. You can even pass a list of grids, one per model family, and let the search swap the final step: `[{"model": [LogisticRegression()], "model__C": [0.1, 1]}, {"model": [RandomForestClassifier()], "model__min_samples_leaf": [5, 20]}]`. That's tidy, but it multiplies fits quickly, and it hides the comparison table you'd want to show a colleague. For a handful of candidate models, a plain loop of `cross_validate` calls with the same splitter is often clearer.

:::mistake Believing best_score_
The search reports the best of many cross-validated scores. Some of that "best" is luck: among enough noisy candidates, one will look good by chance. Expect the test score to come in a little lower, as it does here, and report the test score. If you need an unbiased estimate without a test set, nested cross-validation (a search inside each outer fold) gives one, at much higher cost.
:::

:::tip A budget-friendly routine
Start coarse and on a log scale, look at `cv_results_`, then narrow around the best region. Tune the two or three parameters that control complexity (depth, leaf size, `C`, learning rate) and leave the rest at defaults. If the top dozen configurations are within a standard deviation of each other, stop: you're tuning noise.
:::

Searches multiply the number of models you fit, and with them the number of chances for information to leak from validation data into training. Next lesson is a field guide to leakage: how it happens, how to spot it, and why it produces the best scores you'll ever see.
