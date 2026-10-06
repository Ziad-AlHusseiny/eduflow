---
summary: Train a logistic regression on the churn data, read its probabilities and coefficients, and use the probabilities to rank customers so marketing contacts the riskiest first.
takeaways:
  - "Logistic regression computes a linear score and squashes it through the sigmoid into a probability between 0 and 1."
  - "`predict_proba` returns one probability per class; `predict` applies a 0.5 cut-off to it."
  - "On standardised features, each coefficient is the change in log-odds per standard deviation, so its sign and size are comparable across features."
  - "`LogisticRegression` is regularised by default; `C` is the inverse of the penalty strength, so a smaller `C` means a stronger penalty."
  - Ranking customers by probability is often more useful than a yes/no label, because it lets the business choose how many to act on.
further:
  - title: "Logistic regression"
    url: https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression
  - title: LogisticRegression
    url: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
quiz:
  - q: "A customer's linear score inside a logistic regression is 0. What churn probability does the model give?"
    options:
      - text: "0.5, because the sigmoid of 0 is exactly one half."
        why: Correct. A score of 0 means the evidence for and against churn balances.
      - text: "0, because a score of 0 means no churn."
        why: The probability only approaches 0 as the score goes far negative. Zero sits in the middle of the curve.
      - text: It depends on the intercept, which is added after the sigmoid.
        why: The intercept is part of the linear score, added before the sigmoid. Once the score is 0, the output is fixed.
      - text: "1, because the sigmoid of 0 is 1."
        why: "The sigmoid is `1 / (1 + e^-z)`; with z = 0 that's `1 / 2`."
    answer: 0
  - q: "On standardised churn features, `days_since_last_order` has coefficient +0.93 and `total_spent` has -0.26. What can you say?"
    options:
      - text: Each extra day of recency matters about 3.6 times as much as each extra dollar of spend.
        why: The coefficients are per standard deviation, not per dollar or per day, so a per-unit comparison doesn't follow.
      - text: Customers who spent more churn more often.
        why: A negative coefficient means more spending is associated with lower churn odds, holding the other features fixed.
      - text: Raising spend by marketing would cut churn by a known amount.
        why: Coefficients describe associations in this data; they don't tell you the effect of an intervention.
      - text: A one-standard-deviation increase in recency raises churn odds far more than the same increase in spend lowers them.
        why: Correct. On a shared scale, the size of the coefficient compares effects in the fitted model.
    answer: 3
  - q: "You fit `LogisticRegression()` on the raw churn features and get a `ConvergenceWarning`. What is the best first fix?"
    options:
      - text: Ignore it, because the accuracy looks fine.
        why: The optimiser stopped before finishing, so the coefficients are not the ones the model defines. Fix the cause.
      - text: Lower `C` to 0.0001 so the model has less to learn.
        why: A tiny `C` hides the symptom by flattening the model, at the cost of a very different, underfit model.
      - text: Add a `StandardScaler` before the model in a pipeline.
        why: Correct. Features on wildly different scales make the optimiser's job hard; scaling usually removes the warning.
    answer: 2
  - q: "Marketing can call 30 customers this week. What should your model give them?"
    options:
      - text: The 30 customers with the highest predicted churn probability.
        why: Correct. Ranking by probability puts the limited budget where the model is most confident churn is coming.
      - text: Any 30 customers that `predict` labels as 1.
        why: Dozens of customers may be labelled 1. Picking 30 at random among them wastes the ranking the model already computed.
      - text: The 30 customers whose probability is closest to 0.5.
        why: Those are the cases the model is least sure about, not the ones most likely to churn.
    answer: 0
---

The depth-3 tree from section 1 answered "churn" or "stay". Marketing doesn't really want that. They have budget for a few dozen win-back calls a week and want to know who to call first. That needs a score that ranks customers by risk, and the classic model for it is logistic regression.

## From a line to a probability

Logistic regression starts like linear regression: multiply each feature by a coefficient, add them up, add an intercept. That gives a score `z` that can be any number. Then it squashes the score through the **sigmoid** function, `1 / (1 + e^-z)`, which maps any number to a value between 0 and 1. Large positive scores give probabilities near 1, large negative scores near 0, and a score of exactly 0 gives 0.5.

:::figure The sigmoid turns a score into a probability
<svg viewBox="0 0 640 260" role="img" aria-labelledby="t1">
  <title id="t1">An S-shaped curve. The horizontal axis is the linear score z from minus 6 to plus 6; the vertical axis is probability from 0 to 1. The curve passes through 0.5 at z equals 0 and flattens toward 0 and 1 at the extremes.</title>
  <line class="d-line" x1="40" y1="220" x2="600" y2="220"/>
  <line class="d-line" x1="320" y1="20" x2="320" y2="225"/>
  <line class="d-dashed d-line" x1="40" y1="40" x2="600" y2="40"/>
  <line class="d-dashed d-line" x1="40" y1="130" x2="600" y2="130"/>
  <text class="d-label-muted" x="606" y="44">1.0</text>
  <text class="d-label-muted" x="606" y="134">0.5</text>
  <text class="d-label-muted" x="606" y="224">0.0</text>
  <text class="d-label-muted" x="40" y="244">z = −6</text>
  <text class="d-label-muted" x="320" y="244" text-anchor="middle">0</text>
  <text class="d-label-muted" x="600" y="244" text-anchor="end">+6</text>
  <path class="d-arrow" d="M40 219.6 C200 219 250 200 320 130 C390 60 440 41 600 40.4" fill="none"/>
  <circle class="d-dot" cx="320" cy="130" r="6"/>
  <text class="d-label" x="80" y="200">likely stays</text>
  <text class="d-label" x="470" y="70">likely churns</text>
</svg>
:::

During training, the model adjusts the coefficients so that churners get high probabilities and non-churners low ones. The loss it minimises is **log loss**, which punishes confident wrong answers hard: predicting 0.99 for a customer who stayed costs far more than predicting 0.6. There's no exact formula for the minimum, so scikit-learn finds it with an iterative optimiser, a refined cousin of the gradient descent you wrote last section.

## Fitting it on churn

Because the optimiser is iterative and the model has a penalty (more on that below), scale the features first. A pipeline keeps the scaler and the model together.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
print("test accuracy:", model.score(X_test, y_test))
print(model.predict_proba(X_test)[:4].round(2))
print(model.predict(X_test)[:4])
```

`predict_proba` returns two columns, one per class in the order of `classes_`: probability of staying, probability of churning. They add up to 1. `predict` is a shortcut that labels a row 1 when the churn probability is at least 0.5. That 0.5 is a default, not a law, and section 3's last lesson is about choosing it on purpose.

Accuracy is 0.72, level with the 80-day rule. Don't stop reading there: the probabilities carry information accuracy throws away.

## Reading the coefficients

With standardised features, each coefficient says how much one standard deviation of that feature moves the score `z` (the log-odds of churn). That makes them comparable across features.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)

coefs = pd.Series(model[-1].coef_[0], index=features).sort_values()
print(coefs.round(2))

ranked = X_test.assign(churn_prob=model.predict_proba(X_test)[:, 1], churned=y_test)
top10 = ranked.sort_values("churn_prob", ascending=False).head(10)
print(top10[["days_since_last_order", "orders", "churn_prob", "churned"]].round(2))
print("share of the top 10 who really churned:", top10["churned"].mean())
```

Recency (`days_since_last_order`, +0.93) dominates, which matches what the rule baseline told you. Longer tenure also pushes towards churn, while more orders, more spend, coupon use and even more support tickets push away from it. Customers who contact support are engaged customers; it's the silent ones who leave. That's the kind of finding worth taking back to the business, with the caveat that it's an association, not a cause.

Then the payoff: of the ten customers the model ranks riskiest, nine really churned. A yes/no rule can't produce that list; a probability can.

:::mistake Skipping the scaler
Fit `LogisticRegression()` on the raw features and you get a `ConvergenceWarning`: the optimiser hit its iteration limit before finishing, because `total_spent` in thousands and `used_coupon` in 0/1 make the loss surface a long, narrow valley. The coefficients you get are unfinished. Scale first; it also makes the penalty treat all features fairly.
:::

## The penalty you didn't ask for

`LogisticRegression` is regularised by default with an L2 penalty, the same idea as Ridge. Its strength is set by `C`, which is the **inverse** of Ridge's `alpha`: small `C` means a strong penalty, large `C` means a weak one. The default `C=1.0` is a reasonable start. On this data, values from 0.01 to 100 all land within a couple of points of each other, a sign that eight well-behaved features don't give the model much room to overfit. With hundreds of features, `C` matters a lot, and you'd tune it with the tools in section 4.

:::tip When logistic regression is the right first model
It's fast, its probabilities are usually sensible out of the box, and its coefficients can be explained to a manager. Make it your first real model on any tabular classification problem, right after the baselines. More flexible models have to beat it to earn their place.
:::

Logistic regression draws one straight boundary through the feature space. Next lesson's model makes no such assumption: it asks a series of yes/no questions and can carve the space into boxes.
