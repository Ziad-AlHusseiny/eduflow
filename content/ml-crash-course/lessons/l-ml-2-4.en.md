---
summary: Control overfitting by penalising large coefficients with Ridge and Lasso, scale features so the penalty is fair, and use Lasso's zeros as automatic feature selection.
takeaways:
  - Regularisation adds a penalty on coefficient size to the loss, so the model trades a little training fit for simpler, more stable coefficients.
  - "Ridge penalises squared coefficients and shrinks them all; Lasso penalises absolute values and sets some exactly to zero."
  - "`alpha` is the strength of the penalty: 0 is plain least squares, very large values flatten the model into underfitting."
  - "Scale features before a penalised model, or the penalty punishes features for their units rather than their usefulness."
  - "Choose `alpha` on validation data or with cross-validation, the same way you choose any hyperparameter."
further:
  - title: "Ridge regression and classification"
    url: https://scikit-learn.org/stable/modules/linear_model.html#ridge-regression-and-classification
  - title: Lasso
    url: https://scikit-learn.org/stable/modules/linear_model.html#lasso
  - title: Ridge
    url: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Ridge.html
quiz:
  - q: "You raise Ridge's `alpha` from 1 to 100,000. What happens to the model?"
    options:
      - text: Coefficients shrink toward zero and predictions approach the mean of the target; the model underfits.
        why: Correct. A huge penalty makes any non-zero coefficient too expensive, so the model falls back to roughly the intercept.
      - text: Coefficients grow so the model fits the training data more closely.
        why: A larger `alpha` makes large coefficients more expensive, not cheaper.
      - text: Most coefficients become exactly zero, leaving a few features.
        why: That's Lasso's behaviour. Ridge shrinks coefficients smoothly but almost never to exactly zero.
    answer: 0
  - q: "Why put `StandardScaler` before `Lasso` in the pipeline?"
    options:
      - text: Lasso can't handle negative numbers without scaling.
        why: Lasso works on any real numbers. The issue is fairness of the penalty.
      - text: The penalty treats all coefficients alike, so features must share a scale for it to judge them on usefulness rather than units.
        why: Correct. A feature measured in large units needs a tiny coefficient and escapes the penalty; one in small units gets punished.
      - text: Scaling makes Lasso converge to the same answer as ordinary least squares.
        why: Scaling doesn't remove the penalty; with `alpha > 0` Lasso still differs from least squares.
    answer: 1
  - q: "You need a churn model that uses as few of 60 candidate features as possible. Which is the natural first choice?"
    options:
      - text: Ridge, because it shrinks all 60 coefficients.
        why: Ridge keeps every feature with a small weight, so you'd still need all 60 inputs at prediction time.
      - text: Plain linear regression, then drop the features with the smallest coefficients.
        why: Unpenalised coefficients of correlated features are unstable, so "smallest" is unreliable.
      - text: An L1 (Lasso-style) penalty, because it drives unhelpful coefficients to exactly zero.
        why: Correct. The zeros are a built-in feature selection; you can then inspect which features survived.
    answer: 2
---

Last lesson, degree-2 polynomial features gave the diabetes model 65 columns, and the test score dropped from 0.49 to 0.42. You could throw the extra columns away. Regularisation offers something better: keep them all, but make the model pay for every unit of coefficient it uses. Columns that earn their keep get weight; the rest get shrunk.

## A penalty on the loss

Ordinary least squares minimises the squared error and nothing else. Regularised regression minimises the squared error **plus** a penalty that grows with the size of the coefficients:

- **Ridge** adds `alpha * sum(coef ** 2)`, the L2 penalty.
- **Lasso** adds `alpha * sum(abs(coef))`, the L1 penalty (scikit-learn also scales the error term slightly differently, which is why good `alpha` values for the two models differ).

`alpha` sets the exchange rate. At 0 you're back to least squares. As it grows, a big coefficient must buy a big reduction in error to be worth it. Coefficients that only fit noise can't, so they shrink. Squared values make Ridge shrink everything smoothly; absolute values make Lasso push weak coefficients all the way to zero.

## Scale first, then penalise

The penalty adds up coefficients as if they were comparable. They only are if the features share a scale. Measure spend in cents instead of dollars and its coefficient becomes 100 times smaller, so the penalty barely notices it. Always put a `StandardScaler` in front of a penalised model.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

def degree2(model):
    return make_pipeline(PolynomialFeatures(degree=2, include_bias=False), StandardScaler(), model)

print("no penalty:", round(degree2(LinearRegression()).fit(X_train, y_train).score(X_test, y_test), 3))
for alpha in [1, 10, 100, 1000]:
    m = degree2(Ridge(alpha=alpha)).fit(X_train, y_train)
    print(f"Ridge alpha={alpha:<5} train {m.score(X_train, y_train):.3f}  test {m.score(X_test, y_test):.3f}")
```

As `alpha` rises the training score falls steadily (the model is allowed less freedom) while the test score climbs from 0.42 to 0.50 at `alpha=100`, better than the plain ten-feature model. Push to 1,000 and both scores drop: now the model underfits. Regularisation turns the overfitting/underfitting trade-off into a dial.

## Lasso picks features for you

Run the same experiment with Lasso and count the coefficients that end up at exactly zero.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import Lasso
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

for alpha in [0.1, 1, 2, 5]:
    m = make_pipeline(PolynomialFeatures(degree=2, include_bias=False), StandardScaler(),
                      Lasso(alpha=alpha)).fit(X_train, y_train)
    zeros = (m[-1].coef_ == 0).sum()
    print(f"Lasso alpha={alpha:<4} test R2 {m.score(X_test, y_test):.3f}  zero coefficients: {zeros} of 65")

names = m[0].get_feature_names_out()
kept = [n for n, c in zip(names, m[-1].coef_) if c != 0]
print("kept at alpha=5:", kept)
```

At `alpha=2` Lasso reaches a test R² of 0.53, the best regression score in this section, while ignoring 39 of the 65 columns. At `alpha=5` it keeps 11 columns: BMI, blood pressure and `s5` from the earlier models, plus a few interactions such as `bmi bp`. `m[-1]` reaches the last step of the pipeline, and `m[0].get_feature_names_out()` names the generated columns.

## Taming correlated coefficients

Remember `s1` at -918 and `s2` at +508 in the plain regression, two correlated blood measurements pulling against each other? With standardised features the same story shows up on a smaller scale, and the penalty settles it.

:::figure What happens to two correlated coefficients
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">Coefficients for s1 and s2 on standardised features. Least squares: s1 minus 44, s2 plus 25. Ridge with alpha 10: s1 minus 13, s2 near zero. Lasso with alpha 1: s1 minus 8, s2 exactly zero.</title>
  <line class="d-line" x1="330" y1="20" x2="330" y2="200"/>
  <text class="d-label-muted" x="330" y="220" text-anchor="middle">0</text>
  <text class="d-label" x="20" y="48">Least squares</text>
  <rect class="d-box-warn" x="198" y="30" width="132" height="22" rx="3"/><text class="d-code" x="190" y="46" text-anchor="end">s1 −44</text>
  <rect class="d-box-accent" x="330" y="56" width="74" height="22" rx="3"/><text class="d-code" x="412" y="72">s2 +25</text>
  <text class="d-label" x="20" y="113">Ridge, alpha=10</text>
  <rect class="d-box-warn" x="291" y="95" width="39" height="22" rx="3"/><text class="d-code" x="283" y="111" text-anchor="end">s1 −13</text>
  <rect class="d-box-accent" x="330" y="121" width="2" height="22" rx="1"/><text class="d-code" x="340" y="137">s2 +0.5</text>
  <text class="d-label" x="20" y="178">Lasso, alpha=1</text>
  <rect class="d-box-warn" x="305" y="160" width="25" height="22" rx="3"/><text class="d-code" x="297" y="176" text-anchor="end">s1 −8</text>
  <text class="d-code" x="340" y="198">s2 0 (dropped)</text>
</svg>
:::

Ridge spreads weight sensibly between correlated features instead of letting them cancel each other out; Lasso tends to keep one and drop the other. Either way the coefficients become stable enough that a small change in the training data won't flip them.

:::mistake Tuning alpha on the test set
`alpha` is a hyperparameter like the polynomial degree. Sweeping it and reporting the best test score, as the demos above do to show the shape of the curve, gives an optimistic number. In a real project you pick `alpha` on validation data. `RidgeCV` and `LassoCV` do it with built-in cross-validation, and section 4's `GridSearchCV` does it for any model.
:::

## Ridge or Lasso?

Both cure the same disease, so the choice comes down to what you want from the final model. Ridge usually wins when many features each carry a little signal, which is common with measurements that overlap, like the six blood readings here. Lasso wins when a few features matter and the rest are noise, and it hands you a shorter shopping list of inputs, which matters when every feature has to be collected, cleaned and monitored in production. When features come in correlated groups, Lasso's habit of keeping one member, somewhat arbitrarily, can be unstable from one training run to the next. `ElasticNet` mixes the two penalties for exactly that case. On a dataset this size, the honest answer is to try both on validation data and keep whichever wins, then prefer the simpler one when they tie.

:::tip A sensible default
For a linear model on more than a handful of features, start with `Ridge` inside a pipeline with `StandardScaler`, and treat plain `LinearRegression` as the exception. Reach for `Lasso` when you want fewer features in the final model.
:::

That closes regression. The same penalty idea comes straight back in the next section: `LogisticRegression` is regularised by default, with a parameter `C` that works as the inverse of `alpha`. Section 3 switches the target back to churn, yes or no.
