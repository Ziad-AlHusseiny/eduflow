---
summary: Use any scikit-learn model through the same three calls (fit, predict, score), read what a fitted model learned, and spot memorisation by comparing training and test scores.
takeaways:
  - "Every scikit-learn estimator is created with its settings, learns in `fit(X, y)`, and is used with `predict(X)` and `score(X, y)`."
  - "Hyperparameters such as `max_depth` are set by you before training; parameters such as split thresholds are learned during `fit`."
  - "Fitted attributes end with an underscore (`classes_`, `feature_names_in_`) and only exist after `fit`."
  - "`score` returns accuracy for classifiers and R² for regressors."
  - A large gap between training and test scores means the model memorised its training rows.
further:
  - title: "Getting started: fitting and predicting"
    url: https://scikit-learn.org/stable/getting_started.html
  - title: DecisionTreeClassifier
    url: https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html
  - title: "Glossary: estimator, fit, predict"
    url: https://scikit-learn.org/stable/glossary.html
quiz:
  - q: "What does this print?\n```python\nfrom sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(max_depth=3)\nprint(model.classes_)\n```"
    options:
      - text: "`[0 1]`, the two churn classes."
        why: "`classes_` is learned from `y` during `fit`. This model has never seen any data."
      - text: "`None`, because no classes have been set yet."
        why: scikit-learn doesn't create fitted attributes as `None`. They don't exist until `fit` runs.
      - text: "An `AttributeError`, because `classes_` only exists after `fit`."
        why: Correct. The trailing underscore marks an attribute that `fit` creates.
    answer: 2
  - q: "A tree scores 1.00 on the training set and 0.72 on the test set. A depth-3 tree scores 0.78 and 0.73. Which is the better model for Cartwheel?"
    options:
      - text: The unlimited tree, because 1.00 shows it captured every pattern.
        why: A perfect training score on noisy data like churn means it memorised individual customers. Its test score is lower.
      - text: The depth-3 tree, because it does at least as well on unseen customers and is far simpler.
        why: Correct. Judge on held-out data; when scores tie, prefer the model with fewer moving parts.
      - text: They are equal, because their test scores differ by only 0.01.
        why: Test scores are close, but the depth-3 tree is easier to explain and less likely to swing on new data. That breaks the tie.
    answer: 1
  - q: "Which value is a hyperparameter rather than a learned parameter?"
    options:
      - text: "`max_depth=3` passed to `DecisionTreeClassifier`"
        why: Correct. You choose it before training, and it limits how complex the learned tree can be.
      - text: "The threshold `days_since_last_order <= 236.5` at the root of a fitted tree"
        why: That threshold is found by `fit` from the data. It is a learned parameter.
      - text: "`coef_` of a fitted `LinearRegression`"
        why: Coefficients are learned from the data, which is why they carry the trailing underscore.
    answer: 0
  - q: "You fitted a model on a DataFrame with columns in one order, then call `predict` on a DataFrame with the same columns in a different order. What happens?"
    options:
      - text: scikit-learn reorders the columns for you and predicts correctly.
        why: scikit-learn checks names but does not reorder. It refuses instead of guessing.
      - text: It raises a `ValueError` saying feature names must be in the same order as in fit.
        why: Correct. The check protects you from silently feeding `orders` into the slot the model learned as `tenure_days`.
      - text: It predicts silently, using the columns by position.
        why: That is what happens with a NumPy array, which has no names. With a DataFrame, the name check catches the mismatch.
    answer: 1
---

scikit-learn ships dozens of models, from straight lines to forests of trees, and you use every one of them the same way. Learn three method calls and you can try any of them on the churn data in a few lines. That consistency is the main reason scikit-learn is the default library for classic machine learning.

## Three calls

A model in scikit-learn is an **estimator**: a Python object you create with its settings, train with `fit`, and use with `predict` and `score`.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X, y = churn[features], churn["churned"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

model = DecisionTreeClassifier(max_depth=3, random_state=42)  # 1. create
model.fit(X_train, y_train)                                    # 2. learn
print(model.predict(X_test)[:10])                              # 3. use
print("train accuracy:", round(model.score(X_train, y_train), 3))
print("test accuracy: ", round(model.score(X_test, y_test), 3))
```

What each call does:

- **The constructor** takes **hyperparameters**: choices you make before training. `max_depth=3` says the tree may ask at most three questions in a row. `random_state=42` makes tie-breaking repeatable.
- **`fit(X_train, y_train)`** looks at the examples and learns the model's **parameters**. For a tree, those are the questions and thresholds ("is `days_since_last_order` above 236.5?"). It returns the model itself, so `model = DecisionTreeClassifier().fit(X, y)` also works.
- **`predict(X)`** returns one prediction per row: here an array of 0s and 1s.
- **`score(X, y)`** predicts and compares with the true answers. For classifiers it returns **accuracy**, the share of correct predictions. For regressors it returns R², which you'll meet in section 2.

:::figure The life of an estimator
<svg viewBox="0 0 680 190" role="img" aria-labelledby="t1">
  <title id="t1">An estimator is created with hyperparameters, fit on training data to learn parameters stored in attributes ending with an underscore, and then used to predict on new data or score against known answers.</title>
  <rect class="d-box" x="20" y="60" width="150" height="64" rx="12"/>
  <text class="d-code" x="95" y="88" text-anchor="middle">Model(max_depth=3)</text>
  <text class="d-label-muted" x="95" y="110" text-anchor="middle">hyperparameters</text>
  <path class="d-arrow" d="M170 92 L250 92" marker-end="url(#arrow)"/>
  <text class="d-code" x="210" y="80" text-anchor="middle">fit</text>
  <rect class="d-box-primary" x="255" y="60" width="170" height="64" rx="12"/>
  <text class="d-label" x="340" y="88" text-anchor="middle">Fitted model</text>
  <text class="d-code" x="340" y="110" text-anchor="middle">classes_, tree_ …</text>
  <path class="d-arrow" d="M425 80 L505 40" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M425 104 L505 146" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="510" y="16" width="150" height="48" rx="10"/>
  <text class="d-code" x="585" y="45" text-anchor="middle">predict(X)</text>
  <rect class="d-box-success" x="510" y="122" width="150" height="48" rx="10"/>
  <text class="d-code" x="585" y="151" text-anchor="middle">score(X, y)</text>
</svg>
:::

## What a fitted model knows

Everything a model learns during `fit` is stored in attributes whose names end with an underscore. They don't exist before `fit`; asking for one raises an `AttributeError`, and calling `predict` on an unfitted model raises `NotFittedError`.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
model = DecisionTreeClassifier(max_depth=3, random_state=42).fit(X_train, y_train)

print(model.classes_)            # the labels it saw: [0 1]
print(model.n_features_in_)      # 8
print(model.feature_names_in_[:3])

new_customer = pd.DataFrame([{
    "tenure_days": 400, "orders": 2, "total_spent": 180.0, "avg_order_value": 90.0,
    "days_since_last_order": 150, "used_coupon": 0, "support_tickets": 1,
    "mobile_share": 0.5}])
print(model.predict(new_customer))        # [1]: likely to churn
print(model.predict_proba(new_customer))  # [[0.36 0.64]]
```

`predict_proba` gives the model's estimated probability for each class, in the order of `classes_`. This customer gets 64% for churn. You'll lean on probabilities heavily in section 3, because they let you choose how cautious to be.

## The training score lies

Now remove the depth limit and watch what happens. An unlimited tree keeps asking questions until every training customer sits in a leaf with only their own class.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

for model in [DecisionTreeClassifier(max_depth=3, random_state=42),
              DecisionTreeClassifier(random_state=42),
              KNeighborsClassifier(n_neighbors=5)]:
    model.fit(X_train, y_train)
    print(f"{model!r:55} train {model.score(X_train, y_train):.2f}  test {model.score(X_test, y_test):.2f}")
```

The unlimited tree is perfect on the 298 customers it studied and worse than the shallow tree on the 100 it didn't. It memorised quirks of individual customers. This gap between training and test performance is **overfitting**, and you'll spend much of section 2 learning to control it.

Notice also the third model. k-nearest neighbours works nothing like a tree (it predicts by looking at the five most similar training customers), yet the code is identical. Swapping models costs one line.

## Same contract, different assumptions

The shared API hides very different ideas about the world. A tree assumes churn can be described by a handful of yes/no questions with sharp cut-offs. k-nearest neighbours assumes customers who look alike behave alike, where "look alike" means close together when every column is treated as a distance. Neither assumption is right; each is useful in some situations and wrong in others. That's why you try several models on the same split rather than arguing about which one ought to win.

Regression models keep the same contract. `DecisionTreeRegressor` or `LinearRegression` take a numeric `y`, `predict` returns numbers instead of classes, and `score` returns R² instead of accuracy. Everything you learn about one estimator carries over to the rest.

Two details save confusion later. Calling `fit` a second time throws away what the model learned before and starts from scratch; it doesn't add to the old knowledge. And the settings you passed to the constructor stay readable as plain attributes (`model.max_depth`), so you can always check what a fitted model was told to do.

:::mistake Feeding predict a differently shaped table
`predict` needs the same columns, in the same order, as `fit`. Pass a DataFrame with the columns shuffled and scikit-learn raises `ValueError: The feature names should match those that were passed during fit`. Pass a bare NumPy array and it can't check names at all: it warns and uses the columns by position, which silently gives wrong answers if your order differs. Build prediction inputs from the same `features` list you trained with.
:::

You now have a model at 73% test accuracy. Is that good? You can't say yet, because you haven't asked what a model with no intelligence at all would score. That's the next lesson.
