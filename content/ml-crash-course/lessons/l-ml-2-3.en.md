---
summary: Add polynomial features to make a linear model bend, watch the training score rise while the test score collapses, and use a validation split to pick model complexity honestly.
takeaways:
  - "`PolynomialFeatures` adds squared and interaction columns, so a linear model can fit curves; the number of columns grows very fast with degree."
  - Underfitting means the model is too simple to capture the pattern; both training and test scores are poor.
  - Overfitting means the model has learned noise in the training rows; the training score is high and the test score much lower.
  - "Choose complexity (degree, depth, number of features) on a validation split carved from the training data, never on the test set."
  - The usual cures for overfitting are a simpler model, more data, fewer features, or regularisation.
further:
  - title: PolynomialFeatures
    url: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.PolynomialFeatures.html
  - title: "Underfitting vs. Overfitting"
    url: https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html
  - title: "Validation curves"
    url: https://scikit-learn.org/stable/modules/learning_curve.html
quiz:
  - q: "A model scores R² 0.52 on training data and 0.49 on test data. A more complex version scores 0.90 and -8.5. Which diagnosis fits?"
    options:
      - text: The simple model underfits and the complex one is better because it learned more.
        why: The complex model's test score is far below zero, so whatever it learned doesn't transfer. A small train/test gap is a healthy sign, not underfitting.
      - text: The complex model overfits; it memorised the training rows and fails on new ones.
        why: Correct. A huge jump in training score paired with a collapse in test score is the signature of overfitting.
      - text: Both models underfit because neither reaches 0.9 on the test set.
        why: Many real problems top out well below 0.9. Underfitting is judged by the training score being poor too, which isn't the case for the complex model.
    answer: 1
  - q: "`PolynomialFeatures(degree=2, include_bias=False)` on two columns `a` and `b` produces which columns?"
    options:
      - text: "`a`, `b`, `a^2`, `a b`, `b^2`"
        why: Correct. Degree 2 adds every square and every pairwise product, the interaction term.
      - text: "`a^2`, `b^2`"
        why: The original columns are kept, and the interaction `a b` is included too.
      - text: "`1`, `a`, `b`, `a^2`, `b^2`"
        why: "`include_bias=False` drops the constant column, and the `a b` interaction is missing from this list."
    answer: 0
  - q: "How should you choose the polynomial degree?"
    options:
      - text: Pick the degree with the highest training score.
        why: The training score keeps rising with degree, so this always picks the most overfit model.
      - text: Pick the degree with the highest test score, then report that score.
        why: That uses the test set to make a decision, so the reported score is optimistic.
      - text: Split a validation set off the training data, pick the degree that scores best there, then measure once on the test set.
        why: Correct. The validation set absorbs the selection; the test set stays an unbiased final check.
    answer: 2
  - q: "Which change is least likely to reduce overfitting?"
    options:
      - text: Collecting more training rows.
        why: More data makes it harder to memorise noise, so it usually helps.
      - text: Adding more polynomial degrees so the model can fit the data more precisely.
        why: Correct. Extra flexibility is what causes overfitting in the first place.
      - text: Lowering the degree or dropping weak features.
        why: A simpler model has less capacity to memorise, which is a direct cure.
      - text: Adding a penalty on large coefficients.
        why: That's regularisation, the subject of the next lesson, and a standard cure.
    answer: 1
---

A straight line is a strong assumption. If disease progression rises faster at high BMI than at low BMI, no straight line can capture that, however long gradient descent runs. The fix sounds harmless: let the model bend. This lesson shows how, and how quickly bending turns into memorising.

## Bending a linear model

The trick is to keep linear regression and change the inputs. If you add a column `bmi²`, a "linear" model in `bmi` and `bmi²` traces a parabola in `bmi`. `PolynomialFeatures` generates these columns: every power up to the chosen degree, plus every product of features (the **interactions**).

```python run
from sklearn.datasets import load_diabetes
from sklearn.preprocessing import PolynomialFeatures

X, y = load_diabetes(return_X_y=True, as_frame=True)
poly = PolynomialFeatures(degree=2, include_bias=False).fit(X[["bmi", "bp"]])
print(poly.get_feature_names_out())

for degree in [1, 2, 3]:
    n = PolynomialFeatures(degree=degree, include_bias=False).fit(X).n_output_features_
    print(f"degree {degree}: {n} columns from 10 features")
```

Two features become five at degree 2. Ten features become 65 at degree 2 and 285 at degree 3. `include_bias=False` drops the constant column, because `LinearRegression` already fits an intercept.

To chain the expansion and the regression, use `make_pipeline`. It creates one estimator that runs each step in order; `fit` fits each step on the training data and `predict` sends new data through the same steps. You'll build richer pipelines in section 4.

## The training score keeps climbing

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

for degree in [1, 2, 3]:
    model = make_pipeline(PolynomialFeatures(degree=degree, include_bias=False),
                          LinearRegression()).fit(X_train, y_train)
    print(f"degree {degree}: train R2 {model.score(X_train, y_train):6.3f}  "
          f"test R2 {model.score(X_test, y_test):7.3f}  "
          f"test MAE {mean_absolute_error(y_test, model.predict(X_test)):6.1f}")
```

Read the three rows slowly. Degree 2 improves the training score and worsens the test score. Degree 3 is a disaster dressed as a success: training R² of 0.90, test R² of -8.5, and a typical test miss of 151 points, worse than predicting the average for everyone. With 285 columns and only 331 training patients, the model has nearly enough knobs to pass through every training point. It has learned the noise.

## Underfitting and overfitting

Those three rows map to a picture you'll see in every ML course, because it's the central trade-off of the field.

:::figure Underfitting, a good fit, and overfitting
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">Three panels of the same curved scatter. Left: a straight line misses the curve (underfit). Middle: a gentle curve follows the trend (good fit). Right: a wiggly line passes through every point (overfit).</title>
  <rect class="d-box" x="10" y="10" width="220" height="170" rx="10"/>
  <rect class="d-box-success" x="240" y="10" width="220" height="170" rx="10"/>
  <rect class="d-box" x="470" y="10" width="220" height="170" rx="10"/>
  <circle class="d-dot" cx="40" cy="150" r="4"/><circle class="d-dot" cx="70" cy="118" r="4"/><circle class="d-dot" cx="100" cy="112" r="4"/><circle class="d-dot" cx="130" cy="88" r="4"/><circle class="d-dot" cx="160" cy="86" r="4"/><circle class="d-dot" cx="190" cy="60" r="4"/>
  <path class="d-arrow" d="M30 140 L210 70"/>
  <circle class="d-dot" cx="270" cy="150" r="4"/><circle class="d-dot" cx="300" cy="118" r="4"/><circle class="d-dot" cx="330" cy="112" r="4"/><circle class="d-dot" cx="360" cy="88" r="4"/><circle class="d-dot" cx="390" cy="86" r="4"/><circle class="d-dot" cx="420" cy="60" r="4"/>
  <path class="d-arrow" d="M260 160 Q330 90 440 50" fill="none"/>
  <circle class="d-dot" cx="500" cy="150" r="4"/><circle class="d-dot" cx="530" cy="118" r="4"/><circle class="d-dot" cx="560" cy="112" r="4"/><circle class="d-dot" cx="590" cy="88" r="4"/><circle class="d-dot" cx="620" cy="86" r="4"/><circle class="d-dot" cx="650" cy="60" r="4"/>
  <path class="d-arrow" d="M490 165 C495 140 500 150 500 150 C515 100 525 125 530 118 C545 95 550 125 560 112 C575 60 580 95 590 88 C605 110 610 80 620 86 C635 95 640 40 650 60 C660 75 665 40 670 30" fill="none"/>
  <text class="d-label-strong" x="120" y="205" text-anchor="middle">Underfit</text>
  <text class="d-label-strong" x="350" y="205" text-anchor="middle">Good fit</text>
  <text class="d-label-strong" x="580" y="205" text-anchor="middle">Overfit</text>
</svg>
:::

- **Underfitting** (high bias): the model is too simple for the pattern. Training and test scores are both poor and close together. More flexibility helps.
- **Overfitting** (high variance): the model is flexible enough to chase noise. Training score is high, test score much lower. Less flexibility, more data or regularisation helps.

You diagnose which side you're on by comparing the two scores, never by looking at the training score alone. A small gap with poor scores says "add capacity"; a big gap says "take it away".

The amount of data shifts the balance. With 331 patients, 285 columns is reckless; with 300,000 patients, the same degree-3 model would have far less room to memorise, because noise in individual rows averages out across so many examples. That's why "collect more data" is a legitimate cure for overfitting and a useless one for underfitting: a model that can't express the pattern doesn't get better at it by seeing more of it. When you're unsure which side you're on, a learning curve (training and validation scores plotted against the number of training rows) settles it: two curves that meet low need a richer model, two that stay apart need more data or a simpler model.

:::mistake Choosing complexity with the test set
It's tempting to loop over degrees 1 to 6 and keep whichever scores best on the test set. That turns the test set into a tuning tool, and the score you report is no longer an honest estimate. Carve a **validation** set out of the training data, choose the degree there, then refit on all the training data and touch the test set once.
:::

## Choosing the degree honestly

Here's that recipe with three features. The validation split comes from `X_train`; the test set isn't touched until the very last line.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

X, y = load_diabetes(return_X_y=True, as_frame=True)
X = X[["bmi", "bp", "s5"]]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
X_fit, X_val, y_fit, y_val = train_test_split(X_train, y_train, test_size=0.25, random_state=0)

def poly_model(degree):
    return make_pipeline(PolynomialFeatures(degree=degree, include_bias=False), LinearRegression())

val_scores = {d: poly_model(d).fit(X_fit, y_fit).score(X_val, y_val) for d in range(1, 7)}
for d, s in val_scores.items():
    print(f"degree {d}: validation R2 {s:6.3f}")
best = max(val_scores, key=val_scores.get)
final = poly_model(best).fit(X_train, y_train)
print("chosen degree", best, "| test R2", round(final.score(X_test, y_test), 3))
```

Validation picks degree 1, the straight line. On this data the curve isn't worth its extra variance. That's a common and useful outcome: the honest procedure often prefers the simple model that a peek at the test set would have talked you out of.

One validation split of about 80 patients is itself noisy; a different `random_state` could favour degree 2. Section 4 replaces it with cross-validation, which averages over several splits. The principle stays the same.

Lowering the degree is a blunt way to control complexity: you either have the `bmi × bp` column or you don't. Next lesson keeps all the columns and instead penalises the model for using them heavily, which is a finer dial.
