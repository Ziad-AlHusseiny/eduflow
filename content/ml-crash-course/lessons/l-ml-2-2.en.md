---
summary: Write gradient descent by hand in NumPy to fit a line, see how the learning rate makes it crawl, converge or explode, and explain why features must be scaled.
takeaways:
  - Training a model means searching for the parameter values that make the loss as small as possible.
  - "Gradient descent repeats one step: compute the slope of the loss for each parameter, then move each parameter a little in the downhill direction."
  - "The learning rate sets the step size: too small crawls, too large overshoots and diverges."
  - "Features on very different scales stretch the loss surface, which slows gradient descent and distorts distance-based models such as k-NN."
  - "`StandardScaler` learns each column's mean and standard deviation from the training data and rescales to mean 0, standard deviation 1."
further:
  - title: StandardScaler
    url: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html
  - title: "Stochastic Gradient Descent"
    url: https://scikit-learn.org/stable/modules/sgd.html
  - title: "Importance of feature scaling"
    url: https://scikit-learn.org/stable/auto_examples/preprocessing/plot_scaling_importance.html
quiz:
  - q: "During gradient descent, the gradient of the loss with respect to `w` is positive. What does the update do to `w`?"
    options:
      - text: Increases `w`, because a positive gradient means `w` should grow.
        why: A positive gradient means the loss rises as `w` grows. Moving with it climbs uphill.
      - text: Decreases `w`, because the update subtracts learning rate times gradient.
        why: Correct. Stepping against the gradient is what makes the loss go down.
      - text: Leaves `w` unchanged until the gradient becomes zero.
        why: A non-zero gradient is exactly the signal to move. Only at the minimum is it zero.
    answer: 1
  - q: "You double the learning rate and the printed loss goes 3,900 → 12,000 → 95,000 → 2,000,000. What happened?"
    options:
      - text: The model found a better minimum further away.
        why: A better minimum would show a lower loss, not an exploding one.
      - text: The data has outliers that the larger rate exposed.
        why: Outliers don't make the loss grow without bound step after step. Overshooting does.
      - text: Each step overshoots the minimum by more than the last, so the search diverges.
        why: Correct. Lower the learning rate (or scale the features) until the loss falls steadily.
    answer: 2
  - q: "Where should you fit a `StandardScaler`?"
    options:
      - text: On the training data only, then use it to transform both training and test data.
        why: Correct. The test set must be treated like future data, which you can't see when you fit the scaler.
      - text: On the full dataset before splitting, so both parts use the same mean and standard deviation.
        why: That lets test-set statistics shape your preprocessing, a small leak that makes scores optimistic. Pipelines in section 4 prevent it.
      - text: Separately on the training and test data, so each part has mean 0.
        why: Then the same raw value maps to different scaled values in each part, and the model sees inconsistent inputs.
    answer: 0
  - q: "Which model's predictions change when you rescale `total_spent` from dollars to cents?"
    options:
      - text: A decision tree, because its thresholds are in dollars.
        why: A tree simply learns thresholds in cents instead. The order of values, which is all a split uses, doesn't change.
      - text: k-nearest neighbours, because distances become dominated by `total_spent`.
        why: Correct. Distance-based models treat a 100-fold larger range as 100 times more important.
      - text: Ordinary linear regression, because its coefficient changes.
        why: The coefficient shrinks 100-fold to compensate, and predictions stay identical. Scale matters for regularised models, not plain least squares.
    answer: 1
---

`LinearRegression().fit` returned the best line instantly, with no visible search. For a straight line there's an exact formula, so that's fair. But most models (logistic regression, neural networks, the gradient boosting you'll meet in section 3) have no formula. They find their parameters by search, and nearly all of them use some form of the same search: gradient descent.

## Learning as walking downhill

Take the BMI-only model from last lesson: `prediction = w * x + b`. For any pair of `w` and `b` you can compute the mean squared error on the training data. Picture every possible `w` laid out left to right and the loss for each one as a height. For a straight line with squared error, that picture is a smooth bowl, and the best `w` sits at the bottom.

You can't see the bowl, but at any point you can compute its slope: the **gradient**. If the slope is positive, increasing `w` makes things worse, so decrease it. If negative, increase it. Take a small step against the slope, recompute, repeat. That's **gradient descent**.

:::figure Gradient descent takes steps down the loss curve
<svg viewBox="0 0 680 270" role="img" aria-labelledby="t1">
  <title id="t1">A U-shaped loss curve over the parameter w. Dots mark successive steps from the upper left down toward the minimum, each step shorter than the last as the slope flattens.</title>
  <line class="d-line" x1="40" y1="240" x2="640" y2="240"/>
  <text class="d-label-muted" x="620" y="262">w</text>
  <text class="d-label-muted" x="46" y="30">loss</text>
  <path class="d-line" d="M80 30 Q340 450 600 30" fill="none"/>
  <circle class="d-dot" cx="110" cy="76" r="7"/>
  <circle class="d-dot" cx="190" cy="170" r="7"/>
  <circle class="d-dot" cx="250" cy="215" r="7"/>
  <circle class="d-dot" cx="295" cy="234" r="7"/>
  <circle class="d-dot" cx="325" cy="239" r="7"/>
  <path class="d-arrow" d="M118 84 L180 160" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 177 L240 208" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M260 220 L285 230" marker-end="url(#arrow)"/>
  <text class="d-label" x="140" y="60">big slope, big step</text>
  <text class="d-label" x="360" y="200">flat at the minimum</text>
</svg>
:::

The steps shrink on their own as you approach the bottom, because the slope gets flatter. The size of each step is the gradient multiplied by the **learning rate**, a hyperparameter you choose.

## Gradient descent in eight lines

For squared error, the gradients have short formulas: the slope for `w` is `2 * mean(error * x)` and for `b` it's `2 * mean(error)`, where `error = prediction - actual`. Here it is in NumPy, with BMI standardised to mean 0 and standard deviation 1 first (you'll see why shortly).

```python run
import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
x = ((X_train["bmi"] - X_train["bmi"].mean()) / X_train["bmi"].std(ddof=0)).to_numpy()
target = y_train.to_numpy()

w, b, learning_rate = 0.0, 0.0, 0.1
for step in range(101):
    error = (w * x + b) - target
    if step % 25 == 0:
        print(f"step {step:3}  loss {np.mean(error ** 2):9.1f}  w {w:6.2f}  b {b:7.2f}")
    w -= learning_rate * 2 * np.mean(error * x)
    b -= learning_rate * 2 * np.mean(error)

exact = LinearRegression().fit(x.reshape(-1, 1), target)
print("LinearRegression:", exact.coef_.round(2), round(exact.intercept_, 2))
```

The loss falls from about 29,900 to 3,931 within 25 steps and then stops moving. The `w` and `b` it settles on match `LinearRegression` to two decimals. You've trained a model by hand.

## The learning rate decides everything

Change `learning_rate` and rerun. With `0.01`, a hundred steps reach only `w ≈ 40` and `b ≈ 134`: the search crawls. With `0.5`, it lands in a single step. With `1.05`, each step overshoots the bottom by more than the last, and after a hundred steps the loss is in the trillions. That's **divergence**, and when you see a loss that grows instead of shrinking, a too-large learning rate is the first suspect.

:::mistake Blaming the model when the loss explodes
A loss that rises every step, or turns into `nan`, rarely means the model is wrong for the data. It usually means the learning rate is too large for the scale of the features. Lower the rate by a factor of ten, or scale the features, before changing anything else.
:::

## Why scale features

Real tables mix scales. In the churn data, `total_spent` ranges into the thousands while `used_coupon` is 0 or 1. With two features like that, the loss surface is no longer a round bowl but a long, narrow valley. A learning rate small enough to stay stable along the steep direction is painfully slow along the flat one, and the path zig-zags across the valley.

Scale also hits models that never use gradients. k-nearest neighbours measures distance between customers, and a $300 difference in spend swamps a difference of four support tickets. Standardising every column to mean 0 and standard deviation 1 puts them on equal footing.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

scaler = StandardScaler().fit(X_train)          # learn means and stds from TRAIN only
X_train_s, X_test_s = scaler.transform(X_train), scaler.transform(X_test)
print("learned means:", scaler.mean_[:3].round(1))

raw = KNeighborsClassifier().fit(X_train, y_train).score(X_test, y_test)
scaled = KNeighborsClassifier().fit(X_train_s, y_train).score(X_test_s, y_test)
print(f"k-NN raw {raw:.2f}  scaled {scaled:.2f}")
```

Scaling alone takes k-NN from 0.72 to 0.75, past the 80-day rule from section 1. Same model, same data; the only change is that every feature now gets a fair vote.

A scaler is an estimator too. It has `fit` (learn each column's mean and standard deviation) and `transform` (apply them), and the same rule applies as for models: fit on training data only. Juggling `X_train_s` and `X_test_s` by hand gets error-prone, so section 4 bundles scaler and model into a single pipeline object.

:::note Not every model cares
Decision trees and the ensembles built from them split on one feature at a time, using only the order of values, so scaling doesn't change their predictions. Plain least squares adjusts its coefficients to compensate. Scaling matters for gradient-trained models, distance-based models, and any model with a penalty on coefficient size, which is exactly what this section's last lesson adds.
:::

Gradient descent will find the best line, but "best on the training data" can be a trap when the model is flexible. Next lesson makes the line bend, and watches it bend too far.
