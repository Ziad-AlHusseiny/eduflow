---
summary: Replace a single train/test split with k-fold cross-validation, read the mean and spread of the fold scores, and decide whether a difference between models is real or noise.
takeaways:
  - "k-fold cross-validation trains k models, each validated on a different fold, so every training row is used for validation exactly once."
  - The mean of the fold scores estimates performance; their standard deviation tells you how much a single split could mislead you.
  - "Use `StratifiedKFold` with `shuffle=True` and a fixed `random_state` for classification, and pass the same splitter to every model you compare."
  - "`cross_validate` returns several metrics at once, plus fit and score times."
  - Cross-validate on the training set to choose; keep the test set for one final check.
further:
  - title: "Cross-validation: evaluating estimator performance"
    url: https://scikit-learn.org/stable/modules/cross_validation.html
  - title: cross_validate
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_validate.html
  - title: StratifiedKFold
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedKFold.html
quiz:
  - q: "In 5-fold cross-validation on 298 training rows, how many models are fitted and how many rows does each one train on?"
    options:
      - text: "One model, trained on all 298 rows and scored five times."
        why: Scoring one model five times on data it trained on would measure memorisation, not generalisation.
      - text: "Five models, each trained on about 60 rows and validated on the rest."
        why: That's backwards. Each model validates on one fold (about 60 rows) and trains on the other four.
      - text: "Five models, each trained on about 238 rows and validated on the remaining 60."
        why: Correct. Every row sits in the validation fold once and in the training folds four times.
      - text: "Twenty-five models, one for every pair of folds."
        why: Plain k-fold fits one model per fold. Repeated or nested schemes fit more, but that's not what this is.
    answer: 2
  - q: "Model A scores 0.75 ± 0.04 accuracy across five folds; model B scores 0.73 ± 0.05. What's the fair conclusion?"
    options:
      - text: The difference is small compared with the fold-to-fold spread, so treat them as roughly tied.
        why: Correct. A two-point gap inside a four-to-five-point spread could easily reverse with another shuffle.
      - text: A is clearly better, because its mean is higher.
        why: Means alone ignore the noise. With spreads this size, the ranking isn't reliable.
      - text: B is better, because a larger standard deviation means it adapts more.
        why: A larger spread means less stable performance, not a strength.
    answer: 0
  - q: "Why use the same `StratifiedKFold(..., random_state=42)` object for every model you compare?"
    options:
      - text: Different splitters would make some models train faster.
        why: Speed is unaffected; the concern is fairness of the comparison.
      - text: scikit-learn requires a single splitter per script.
        why: There's no such rule; you can create as many as you like.
      - text: It shuffles the data differently for each model, which is fairer.
        why: The opposite. Different shuffles add noise to the comparison.
      - text: Every model is then scored on exactly the same folds, so differences come from the models, not the splits.
        why: Correct. Paired comparisons on identical folds are much less noisy.
    answer: 3
  - q: "After cross-validation picks logistic regression, what should you do with the test set?"
    options:
      - text: Add it to the cross-validation to get more folds.
        why: Then nothing is left for an unbiased final estimate.
      - text: Fit the chosen model on all training data and score it on the test set once.
        why: Correct. The test score is the number you report, and it hasn't influenced any decision.
      - text: Skip it, since the cross-validation score is already unbiased.
        why: The CV score was used to choose between models, so it's slightly optimistic for the winner.
    answer: 1
---

Through section 3 every comparison came with a hedge: "on 100 test customers, two points is two customers". The forest scored 0.76, boosting 0.78, logistic regression 0.72. Was boosting really better, or did it get a lucky test set? One split can't tell you. You need several, and that's what cross-validation gives you.

## Five splits instead of one

**k-fold cross-validation** cuts the training data into k equal folds (5 is the usual default). It trains k models: each one learns from k−1 folds and is scored on the fold it didn't see. You end up with k scores, and every training row has been in a validation fold exactly once.

:::figure 5-fold cross-validation
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">Five rows, one per round. In each row the training data is shown as five blocks; a different block is highlighted as the validation fold each time, and the other four are used for training. Each round produces one score.</title>
  <text class="d-label-muted" x="20" y="20">round</text>
  <text class="d-label-muted" x="590" y="20">score</text>
  <text class="d-label" x="30" y="52">1</text>
  <rect class="d-box-warn" x="60" y="34" width="96" height="28" rx="4"/><rect class="d-box" x="160" y="34" width="96" height="28" rx="4"/><rect class="d-box" x="260" y="34" width="96" height="28" rx="4"/><rect class="d-box" x="360" y="34" width="96" height="28" rx="4"/><rect class="d-box" x="460" y="34" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="53">0.72</text>
  <text class="d-label" x="30" y="92">2</text>
  <rect class="d-box" x="60" y="74" width="96" height="28" rx="4"/><rect class="d-box-warn" x="160" y="74" width="96" height="28" rx="4"/><rect class="d-box" x="260" y="74" width="96" height="28" rx="4"/><rect class="d-box" x="360" y="74" width="96" height="28" rx="4"/><rect class="d-box" x="460" y="74" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="93">0.75</text>
  <text class="d-label" x="30" y="132">3</text>
  <rect class="d-box" x="60" y="114" width="96" height="28" rx="4"/><rect class="d-box" x="160" y="114" width="96" height="28" rx="4"/><rect class="d-box-warn" x="260" y="114" width="96" height="28" rx="4"/><rect class="d-box" x="360" y="114" width="96" height="28" rx="4"/><rect class="d-box" x="460" y="114" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="133">0.68</text>
  <text class="d-label" x="30" y="172">4</text>
  <rect class="d-box" x="60" y="154" width="96" height="28" rx="4"/><rect class="d-box" x="160" y="154" width="96" height="28" rx="4"/><rect class="d-box" x="260" y="154" width="96" height="28" rx="4"/><rect class="d-box-warn" x="360" y="154" width="96" height="28" rx="4"/><rect class="d-box" x="460" y="154" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="173">0.81</text>
  <text class="d-label" x="30" y="212">5</text>
  <rect class="d-box" x="60" y="194" width="96" height="28" rx="4"/><rect class="d-box" x="160" y="194" width="96" height="28" rx="4"/><rect class="d-box" x="260" y="194" width="96" height="28" rx="4"/><rect class="d-box" x="360" y="194" width="96" height="28" rx="4"/><rect class="d-box-warn" x="460" y="194" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="213">0.68</text>
  <text class="d-label-muted" x="60" y="248">highlighted = validation fold, others = training folds</text>
</svg>
:::

The mean of the k scores is a steadier estimate than any single split. The spread between them is just as valuable: it shows how much a score can move for reasons that have nothing to do with the model.

## Cross-validating the churn models

`cross_val_score` runs the whole loop for one metric; `cross_validate` handles several metrics at once. For classification, pass a `StratifiedKFold` with `shuffle=True` so each fold keeps the 55% churn rate and the rows are mixed first. Create the splitter once and reuse it for every model so they all face exactly the same folds.

```python run
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
models = {
    "dummy": DummyClassifier(),
    "logistic": make_pipeline(StandardScaler(), LogisticRegression()),
    "tree depth 3": DecisionTreeClassifier(max_depth=3, random_state=42),
    "forest": RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=42),
    "boosting": HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05,
                                               max_iter=100, random_state=42),
}
for name, model in models.items():
    r = cross_validate(model, X_train, y_train, cv=cv, scoring=["accuracy", "roc_auc"])
    acc, auc = r["test_accuracy"], r["test_roc_auc"]
    print(f"{name:13} accuracy {acc.mean():.3f} ± {acc.std():.3f}   ROC AUC {auc.mean():.3f} ± {auc.std():.3f}")
```

Read the spreads first. Logistic regression's accuracy ranges from 0.68 to 0.81 across folds, a 13-point swing from nothing but which customers landed where. Against that noise, the accuracy differences between the four real models (0.73 to 0.76) mean very little: every gap is smaller than one standard deviation.

ROC AUC, which grades the full ranking, is more decisive: logistic regression and the forest sit around 0.81, boosting around 0.79, and the depth-3 tree trails at 0.74 with the largest spread. That's a pattern you can act on.

For the 80-day rule, cross-validation means re-choosing the cut-off on each set of training folds and scoring it on the held-out fold. Done that way it averages 0.70 accuracy. Every real model beats it, by a few points.

## What you can conclude

Put together, cross-validation tells a calmer story than section 3's single split did. Boosting's 0.78 test accuracy was partly luck; across five folds it's 0.75, within noise of everything else, and it ranks worse than logistic regression. The forest and logistic regression are tied on ranking. Given a tie, prefer the simpler model: logistic regression trains in milliseconds, its coefficients can be explained, and it has nothing to tune but `C`.

That's the skeptic's payoff. Without cross-validation you'd have shipped boosting because of a lucky number.

:::mistake Comparing models on different splits
Calling `cross_val_score(model, X, y, cv=5)` separately for each model is fine for classifiers (an integer `cv` gives the same unshuffled stratified folds each time). But mixing splitters, using `shuffle=True` without a `random_state`, or comparing one model's CV score with another's single test score makes the comparison noisy or unfair. Create one splitter and pass it to everything.
:::

## Choosing k, and what CV doesn't fix

- **k = 5** is the standard. **k = 10** gives each model more training data and a slightly less pessimistic estimate, at twice the cost. With very small datasets (a few dozen rows), more folds help; with large ones, even 3 folds are plenty.
- The fold scores aren't independent (the training folds overlap), so treat the standard deviation as a rough guide to noise, not a formal error bar.
- Cross-validation doesn't protect you from leakage. If information from the validation fold sneaks into training, every fold is optimistic. [The leakage lesson](lesson:l-ml-4-4) is about exactly that.

:::note Where the test set fits now
Cross-validation runs on `X_train` only. It's your tool for choosing models, features and settings. When you've chosen, fit the winner on all of `X_train` and score it once on `X_test`. That single number is what you report.
:::

So far every model has used the eight numeric columns. The data also has countries, segments and a half-empty satisfaction score that need encoding and imputing first. Next lesson builds a pipeline that does all of that inside each fold, so cross-validation stays honest.
