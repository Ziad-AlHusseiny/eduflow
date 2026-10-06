---
summary: Fit a linear regression with scikit-learn, read its intercept and coefficients, and judge it with MAE, RMSE and R² against a mean-predicting baseline.
takeaways:
  - "Linear regression predicts `intercept + coef1 * x1 + coef2 * x2 + …` and picks the numbers that minimise the sum of squared residuals."
  - "A residual is actual minus predicted; every regression metric is a different summary of the residuals."
  - "MAE is the typical miss in the target's own units; RMSE is in the same units but punishes big misses more."
  - "R² is the share of variance explained compared with always predicting the mean: 0 means no better than the mean, and it can go negative."
  - Coefficients of correlated features can be large and opposite in sign, so don't read them as importance or cause.
further:
  - title: "Linear Models: Ordinary Least Squares"
    url: https://scikit-learn.org/stable/modules/linear_model.html#ordinary-least-squares
  - title: "Regression metrics"
    url: https://scikit-learn.org/stable/modules/model_evaluation.html#regression-metrics
  - title: Diabetes dataset
    url: https://scikit-learn.org/stable/datasets/toy_dataset.html#diabetes-dataset
quiz:
  - q: "A model predicting next-year spend has MAE = $40 and RMSE = $150. What does the gap suggest?"
    options:
      - text: The model is biased and predicts too high on average.
        why: Neither metric shows direction; both use absolute or squared misses. You'd look at the mean residual for bias.
      - text: Most misses are small, but a few are very large.
        why: Correct. Squaring makes rare big misses dominate RMSE, while MAE weighs every miss equally.
      - text: RMSE was computed on the training set and MAE on the test set.
        why: Nothing in the numbers says that. RMSE is always at least MAE on the same data; a large gap is about the shape of the errors.
    answer: 1
  - q: "A model scores R² = -0.2 on the test set. What does that mean?"
    options:
      - text: It explains 20% of the variance, in the negative direction.
        why: R² has no direction. A negative value is a comparison with the mean predictor, not a signed share.
      - text: The calculation is broken, because R² is a square and can't be negative.
        why: The name is historical. On test data R² is 1 minus a ratio of errors, and the ratio can exceed 1.
      - text: Its predictions are worse than predicting the mean for everyone.
        why: Correct. R² compares the model's squared error with that of always predicting the mean of the true values; below 0 means the model loses.
    answer: 2
  - q: "In the diabetes model, `s1` has coefficient -918 and `s2` has +508. Both are cholesterol-related blood measurements. What's the safest reading?"
    options:
      - text: "`s1` strongly lowers disease progression, so raising it would help patients."
        why: Coefficients describe the fitted model, not cause and effect, and correlated inputs make them unstable.
      - text: "`s1` is the most important feature because its coefficient is the largest."
        why: Size alone misleads when features are correlated; the two terms largely cancel each other.
      - text: The two features are correlated, so the model balanced large opposite weights; their individual values aren't reliable.
        why: Correct. With correlated features many coefficient combinations fit almost equally well. Regularisation in this section's last lesson tames this.
    answer: 2
---

Churn is a yes/no question, and you'll come back to it in section 3. Regression comes first because its simplest model, a straight line, lets you see exactly what "learning" means: picking numbers so that predictions miss by as little as possible.

The data is scikit-learn's diabetes dataset: 442 patients, ten baseline measurements each (age, sex, body mass index, blood pressure and six blood serum readings `s1`–`s6`), and a target that measures how far the disease progressed one year later. The features are already centred and scaled, which is why they look like small decimals.

## One feature, one line

Start with body mass index alone. Linear regression predicts `progression = intercept + coef * bmi`, and `fit` chooses the two numbers.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

line = LinearRegression().fit(X_train[["bmi"]], y_train)
print("intercept:", round(line.intercept_, 1))
print("coef for bmi:", round(line.coef_[0], 1))
print("first predictions:", line.predict(X_test[["bmi"]])[:3].round(1))
```

The intercept (152) is the prediction for an average BMI, since the feature is centred at 0. The coefficient (975) is the slope: one unit of this scaled BMI adds 975 to the prediction. Note the double brackets in `X_train[["bmi"]]`: scikit-learn wants a 2D table even for one feature.

## Residuals and the loss

How did `fit` choose those numbers? For each patient, the **residual** is the actual value minus the predicted value: the vertical gap between the point and the line. Ordinary least squares picks the intercept and slope that make the sum of squared residuals as small as possible. That sum, the thing being minimised, is the **loss**.

:::figure Residuals are the vertical gaps between points and the line
<svg viewBox="0 0 640 280" role="img" aria-labelledby="t1">
  <title id="t1">Scatter of points around a rising line. Dashed vertical segments join each point to the line; these residuals are squared and summed, and least squares picks the line that makes that sum smallest.</title>
  <line class="d-line" x1="60" y1="240" x2="600" y2="240"/>
  <line class="d-line" x1="60" y1="240" x2="60" y2="20"/>
  <text class="d-label-muted" x="560" y="262">bmi</text>
  <text class="d-label-muted" x="68" y="34">progression</text>
  <path class="d-arrow" d="M80 215 L580 55"/>
  <line class="d-dashed d-line" x1="130" y1="199" x2="130" y2="168"/>
  <circle class="d-dot" cx="130" cy="168" r="6"/>
  <line class="d-dashed d-line" x1="200" y1="177" x2="200" y2="214"/>
  <circle class="d-dot" cx="200" cy="214" r="6"/>
  <line class="d-dashed d-line" x1="270" y1="154" x2="270" y2="120"/>
  <circle class="d-dot" cx="270" cy="120" r="6"/>
  <line class="d-dashed d-line" x1="340" y1="132" x2="340" y2="160"/>
  <circle class="d-dot" cx="340" cy="160" r="6"/>
  <line class="d-dashed d-line" x1="420" y1="106" x2="420" y2="62"/>
  <circle class="d-dot" cx="420" cy="62" r="6"/>
  <line class="d-dashed d-line" x1="500" y1="81" x2="500" y2="120"/>
  <circle class="d-dot" cx="500" cy="120" r="6"/>
  <text class="d-label" x="430" y="90">residual</text>
</svg>
:::

Squaring does two jobs: it makes every miss count as positive, and it makes big misses count much more than small ones. A miss of 20 costs 400; a miss of 40 costs 1,600. Keep that in mind, because it explains the difference between two of the metrics below.

## All ten features

Multiple regression is the same idea with more terms: one coefficient per feature, plus the intercept.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

model = LinearRegression().fit(X_train, y_train)
for name, coef in zip(X.columns, model.coef_):
    print(f"{name:>4} {coef:8.1f}")
```

:::mistake Reading coefficients as importance or cause
`s1` gets -918 and `s2` gets +508. Both measure related cholesterol quantities, so they rise and fall together, and the model can trade weight between them almost freely. Huge opposite coefficients on correlated features are a sign of that, not evidence that `s1` protects patients. Coefficients describe this fitted model; they say nothing about what would happen if you changed a patient's blood chemistry.
:::

## Measuring a regression

`score` gives R², but you should know three metrics and when each one fits.

```python run
from sklearn.datasets import load_diabetes
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

models = {
    "mean (dummy)": (DummyRegressor(), X.columns),
    "bmi only": (LinearRegression(), ["bmi"]),
    "all features": (LinearRegression(), X.columns),
}
for name, (model, cols) in models.items():
    pred = model.fit(X_train[cols], y_train).predict(X_test[cols])
    print(f"{name:13} MAE {mean_absolute_error(y_test, pred):5.1f}  "
          f"RMSE {root_mean_squared_error(y_test, pred):5.1f}  R2 {r2_score(y_test, pred):6.3f}")
```

- **MAE** (mean absolute error) is the average size of a miss, in the target's units. "On average we're off by 42 points" is a sentence a doctor or a manager understands. Use it to communicate.
- **RMSE** (root mean squared error) is the square root of the average squared miss, also in target units. Because of the squaring it's always at least as large as MAE, and much larger when a few predictions are badly wrong. Use it when big misses are disproportionately costly.
- **R²** compares the model's squared error with that of always predicting the mean: 1 is perfect, 0 is no better than predicting the mean, and negative is worse than the mean. It's unitless, so it's handy for comparing models on the same data, but it hides how big the misses are in real terms.

The full model cuts MAE from 65.5 (the mean baseline) to 41.5 and explains about half the variance. That's honest progress, and also a reminder that half of what drives this disease isn't in these ten columns.

:::tip Report MAE next to R²
"R² = 0.48" sounds abstract and, to non-specialists, weak. "Typical miss of 42 points on a scale where patients range from 25 to 346, down from 66 for the naive guess" tells the same story in terms people can act on.
:::

You've used `fit` as a black box that returns the best line. Next lesson opens the box: you'll write the search for the best line yourself, with gradient descent, the same idea that trains neural networks.
