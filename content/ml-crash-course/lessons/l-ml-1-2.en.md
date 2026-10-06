---
summary: Turn the churn table into a feature matrix X and a target y, then split it with train_test_split so you can measure a model on customers it has never seen.
takeaways:
  - "Every supervised project follows the same loop: frame, collect labelled data, split, baseline, train, evaluate, then ship and monitor."
  - "X is a table of features with one row per example; y is the matching column of answers."
  - "A model's score on its own training data says how well it memorised, not how well it predicts."
  - "Use `stratify=y` for classification so the train and test sets keep the same class balance, and set `random_state` so the split is repeatable."
  - The test set is for the final check; looking at it while you make decisions turns it into training data.
further:
  - title: train_test_split
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html
  - title: "Common pitfalls and recommended practices"
    url: https://scikit-learn.org/stable/common_pitfalls.html
quiz:
  - q: "You fit a model on all 398 churn rows and it scores 0.99 on those same rows. What can you conclude?"
    options:
      - text: The model will be about 99% accurate on next month's customers.
        why: The model has seen every one of those answers. A high score on seen data is consistent with pure memorisation.
      - text: Very little about future performance; you need rows the model never saw.
        why: Correct. Only held-out data tells you how the model generalises to new customers.
      - text: The model is overfitting, so you should delete features until the score drops.
        why: You can't diagnose overfitting without a held-out score to compare against, and deleting features blindly is not a fix.
    answer: 1
  - q: "What does `stratify=y` change in `train_test_split(X, y, test_size=0.25, stratify=y)`?"
    options:
      - text: It sorts the rows by the target before splitting.
        why: Sorting would put all of one class in one part. Stratifying does the opposite; it keeps classes evenly spread.
      - text: It balances the classes so each part is 50% churned.
        why: Stratifying preserves the original ratio (55% here); it does not rebalance to 50/50.
      - text: It keeps the share of each class the same in the train and test parts.
        why: Correct. With small datasets an unlucky split can skew the test set; stratifying prevents that.
    answer: 2
  - q: "Why drop `customer_id` from the features?"
    options:
      - text: It is an identifier with no causal link to churn, so a model could only memorise it.
        why: Correct. Ids are arbitrary labels. A flexible model can still split on them and learn noise that won't hold for new customers.
      - text: scikit-learn refuses integer columns named `id`.
        why: scikit-learn doesn't inspect column names for meaning. It would happily use the id, which is the problem.
      - text: It is the target, so it must not be in X.
        why: The target is `churned`. The id is a row label, not an answer.
      - text: Ids make training slower because they are large numbers.
        why: Large numbers don't slow training meaningfully. The reason is about what the model can learn, not speed.
    answer: 0
  - q: "You try twenty model settings, keep the one with the best test score, and report that score. What is wrong?"
    options:
      - text: Nothing; that is what the test set is for.
        why: The test set is for one final, unbiased estimate. Choosing among twenty options by it makes it part of training.
      - text: Twenty settings is too few to find a good model.
        why: The number of settings isn't the issue. Any selection based on the test set biases the reported score upward.
      - text: The reported score is optimistic, because you picked the setting that happened to suit this test set.
        why: Correct. Use a validation split or cross-validation to choose, then touch the test set once.
    answer: 2
---

A model that scores 99% is either very good or has seen the answers. You can't tell which from the number alone. The single most useful habit in machine learning is setting aside data the model never sees during training, so that its score on that data means something.

## The workflow, start to finish

Every supervised project you'll work on follows roughly the same loop. The steps are boring on purpose; skipping one is how projects fail.

:::figure The supervised learning workflow
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">Seven steps in a loop: frame the question, collect labelled data, split, baseline, train, evaluate, then ship and monitor, with an arrow from evaluate back to train for iteration.</title>
  <rect class="d-box-primary" x="10" y="30" width="86" height="56" rx="10"/>
  <text class="d-label" x="53" y="63" text-anchor="middle">Frame</text>
  <rect class="d-box" x="108" y="30" width="86" height="56" rx="10"/>
  <text class="d-label" x="151" y="63" text-anchor="middle">Collect</text>
  <rect class="d-box-warn" x="206" y="30" width="86" height="56" rx="10"/>
  <text class="d-label" x="249" y="63" text-anchor="middle">Split</text>
  <rect class="d-box" x="304" y="30" width="86" height="56" rx="10"/>
  <text class="d-label" x="347" y="63" text-anchor="middle">Baseline</text>
  <rect class="d-box" x="402" y="30" width="86" height="56" rx="10"/>
  <text class="d-label" x="445" y="63" text-anchor="middle">Train</text>
  <rect class="d-box" x="500" y="30" width="86" height="56" rx="10"/>
  <text class="d-label" x="543" y="63" text-anchor="middle">Evaluate</text>
  <rect class="d-box-success" x="598" y="30" width="92" height="56" rx="10"/>
  <text class="d-label" x="644" y="63" text-anchor="middle">Ship</text>
  <path class="d-arrow" d="M96 58 L106 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M194 58 L204 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M292 58 L302 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 58 L400 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M488 58 L498 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M586 58 L596 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M543 90 C543 150 445 150 445 92" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="494" y="165" text-anchor="middle">iterate</text>
</svg>
:::

**Frame** the question precisely: what is predicted, for whom, at what moment, and what action follows. For Cartwheel: "On 30 September, for every customer who has ordered before, predict whether they will order in the next 90 days, so marketing can target win-back offers." **Collect** examples where the answer is known: that's `churn.csv`. **Split** off a test set. Build a **baseline** (next lesson but one). **Train** models, **evaluate** them, iterate, and only then **ship** and keep watching.

## Features and target

scikit-learn expects two things: a feature matrix `X`, one row per example and one column per feature, and a target `y` with one answer per row. A pandas DataFrame works as `X` and a Series works as `y`.

For now you'll use the eight numeric columns. Text columns such as `country` need encoding first (section 4 handles that), and `avg_satisfaction` has gaps that some models can't accept yet.

```python run
import pandas as pd

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X = churn[features]
y = churn["churned"]
print(X.shape, y.shape)
print(y.value_counts())
```

`customer_id` stays out. An id is an arbitrary label, and a flexible model could still find splits on it that fit the training rows by coincidence. Anything that wouldn't make sense to a person explaining churn shouldn't be a feature.

## Holding out a test set

`train_test_split` shuffles the rows and cuts them into two parts. You train on one and measure on the other.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X, y = churn[features], churn["churned"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)
print("train:", X_train.shape, "churn rate", round(y_train.mean(), 3))
print("test: ", X_test.shape, "churn rate", round(y_test.mean(), 3))
```

Three arguments do the work:

- `test_size=0.25` keeps a quarter of the rows back: 100 customers for testing, 298 for training. With a few hundred rows, 20–30% is a sensible test share; with millions, 1–5% is plenty.
- `random_state=42` fixes the shuffle so you get the same split every run. Without it, every rerun reshuffles and your score wobbles for reasons that have nothing to do with your model.
- `stratify=y` keeps the churn rate the same in both parts (55%). With 100 test rows, an unlucky shuffle could otherwise give you a test set that's 45% or 62% churned, and every number you compute on it would shift.

The order of the four returned values is fixed: `X_train, X_test, y_train, y_test`. Mixing them up is a common source of nonsense scores.

:::mistake Peeking at the test set
The test set is only honest the first time you use it to make a decision. If you try ten ideas and keep whichever scores best on the test set, you have tuned to those 100 customers, and the score you report will be too optimistic. Make choices with the training data (section 4 shows how with cross-validation) and look at the test score once, at the end.
:::

:::note Random splits assume the future looks like the past
A random split mixes old and new rows. If your data changes over time, a random split lets the model peek at patterns from "later". For forecasting-style problems, split by date: train on earlier periods, test on later ones. The leakage lesson in section 4 comes back to this.
:::

## What the split buys you

Think of the split as a contract with your future self. Everything you do from here on (choosing features, choosing models, tuning settings) happens on the training part. The test part stays sealed until you're ready to report a result. With `X_train` and `y_train` you can fit any model you like. With `X_test` and `y_test` you get one honest answer to "how well does this work on customers it hasn't seen?". That's the number that predicts what happens when marketing uses your model in December. Next lesson you'll fit the first model and see how big the gap between those two numbers can be.
