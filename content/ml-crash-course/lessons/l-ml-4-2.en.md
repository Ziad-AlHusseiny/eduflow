---
summary: Build one Pipeline that imputes, scales and one-hot encodes the right columns with ColumnTransformer, so preprocessing is refit inside every cross-validation fold and travels with the model.
takeaways:
  - "A `Pipeline` chains transformers and a final model into one estimator: `fit` fits every step in order, `predict` runs new data through the same steps."
  - "`ColumnTransformer` applies different preprocessing to different columns and concatenates the results."
  - "`OneHotEncoder(handle_unknown=\"ignore\")` turns categories into 0/1 columns and won't crash on a category it never saw in training."
  - "`SimpleImputer(add_indicator=True)` fills gaps and adds a column recording which values were missing."
  - Because the whole pipeline is refit in each fold, preprocessing only ever learns from training rows, which keeps cross-validation honest.
further:
  - title: "Pipelines and composite estimators"
    url: https://scikit-learn.org/stable/modules/compose.html
  - title: ColumnTransformer
    url: https://scikit-learn.org/stable/modules/generated/sklearn.compose.ColumnTransformer.html
  - title: OneHotEncoder
    url: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html
  - title: "Imputation of missing values"
    url: https://scikit-learn.org/stable/modules/impute.html
quiz:
  - q: "During `cross_validate(pipe, X_train, y_train, cv=5)`, where does the `StandardScaler` inside `pipe` get its means from?"
    options:
      - text: From the four training folds of each round only.
        why: Correct. The whole pipeline is cloned and refit per fold, so the validation fold never influences preprocessing.
      - text: From all of `X_train`, computed once before the folds are made.
        why: That's what happens if you scale before cross-validating, and it's the leak pipelines exist to prevent.
      - text: From the validation fold, so validation data is centred correctly.
        why: Fitting anything on the validation fold would leak it into the model.
      - text: From the test set, since that's what will be predicted.
        why: The test set isn't passed to `cross_validate` at all.
    answer: 0
  - q: "A customer from France (absent in training) reaches a pipeline whose `OneHotEncoder` uses the default `handle_unknown`. What happens?"
    options:
      - text: The encoder maps France to the most common country.
        why: No encoder in scikit-learn silently substitutes a category like that.
      - text: The customer's country columns are all zero and prediction continues.
        why: That's the behaviour with `handle_unknown="ignore"`, not the default.
      - text: The encoder adds a new France column on the fly.
        why: The column layout is fixed at fit time; the model's coefficients couldn't use a new column anyway.
      - text: "`transform` raises `ValueError: Found unknown categories ['France']`."
        why: Correct. The default is `"error"`. Use `handle_unknown="ignore"` for anything that will see live data.
    answer: 3
  - q: "Why use `SimpleImputer(strategy=\"median\", add_indicator=True)` for `avg_satisfaction`?"
    options:
      - text: The indicator column lets the model learn that a missing survey is itself informative, while the median fills the gap.
        why: Correct. Missingness is often a signal (customers who never answer surveys may behave differently).
      - text: The median makes the column's distribution normal.
        why: Filling with the median doesn't change the shape of the observed values; it only fills gaps.
      - text: The indicator replaces the original column, so the model ignores satisfaction.
        why: The indicator is added alongside the imputed column, not instead of it.
    answer: 0
  - q: "Adding `country` and `segment` to the logistic pipeline lowers cross-validated ROC AUC from 0.807 to 0.776. What's the best interpretation?"
    options:
      - text: The OneHotEncoder is misconfigured, because more information can't hurt.
        why: Extra features can hurt; each one adds coefficients that can fit noise, especially with a few hundred rows.
      - text: On 298 rows, eleven extra one-hot columns add more noise than signal, so leave them out for now.
        why: Correct. Re-test them when there's more data or a stronger penalty.
      - text: Country causes churn in a way logistic regression can't capture.
        why: Nothing here supports a causal claim, and the drop says the columns aren't helping this model.
    answer: 1
---

Section 3 kept leaving data on the table. `country` and `segment` are text, which no scikit-learn model accepts directly. `avg_satisfaction` has gaps that logistic regression refuses. And you've been scaling by hand, keeping track of `X_train_s` and `X_test_s`. Each of those steps has to be learned from training data only, applied identically to new data, and redone inside every cross-validation fold. Doing that by hand is how leaks and bugs happen. A pipeline does it for you.

## Pipelines bundle steps into one estimator

A `Pipeline` is a list of steps: any number of **transformers** (objects with `fit` and `transform`, such as `StandardScaler`) followed by one final estimator. The pipeline behaves like a single model:

- `pipe.fit(X, y)` fits the first transformer, transforms the data, passes it to the next step, and so on, then fits the model on the result.
- `pipe.predict(X_new)` runs `X_new` through the already-fitted transformers, then predicts.

You've used `make_pipeline`, which names steps automatically (`"standardscaler"`, `"logisticregression"`). `Pipeline([("prep", ...), ("model", ...)])` lets you choose the names, which you'll want next lesson when you tune parameters by name.

The real payoff is in cross-validation. `cross_validate` clones the entire pipeline and refits it in every fold, so the scaler's means, the imputer's medians and the encoder's category list are learned from that fold's training rows only.

## Different columns, different treatment

Not every column needs the same preprocessing. `ColumnTransformer` routes each group of columns through its own transformer and glues the outputs side by side.

:::figure A ColumnTransformer inside a Pipeline
<svg viewBox="0 0 700 280" role="img" aria-labelledby="t1">
  <title id="t1">The raw churn table splits into three column groups. Eight numeric columns go through StandardScaler. avg_satisfaction goes through SimpleImputer with an indicator, then StandardScaler. country and segment go through OneHotEncoder. The outputs are concatenated into 21 columns and fed to LogisticRegression.</title>
  <rect class="d-box" x="10" y="110" width="120" height="56" rx="10"/>
  <text class="d-label" x="70" y="134" text-anchor="middle">raw table</text>
  <text class="d-label-muted" x="70" y="154" text-anchor="middle">11 columns</text>
  <path class="d-arrow" d="M130 125 L190 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M130 138 L190 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M130 151 L190 226" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="195" y="24" width="250" height="52" rx="10"/>
  <text class="d-code" x="320" y="46" text-anchor="middle">8 numeric</text>
  <text class="d-label" x="320" y="66" text-anchor="middle">StandardScaler</text>
  <rect class="d-box-warn" x="195" y="112" width="250" height="52" rx="10"/>
  <text class="d-code" x="320" y="134" text-anchor="middle">avg_satisfaction</text>
  <text class="d-label" x="320" y="154" text-anchor="middle">SimpleImputer + indicator, scaler</text>
  <rect class="d-box-success" x="195" y="200" width="250" height="52" rx="10"/>
  <text class="d-code" x="320" y="222" text-anchor="middle">country, segment</text>
  <text class="d-label" x="320" y="242" text-anchor="middle">OneHotEncoder</text>
  <path class="d-arrow" d="M445 50 L505 125" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M445 138 L505 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M445 226 L505 151" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="510" y="104" width="180" height="68" rx="10"/>
  <text class="d-label" x="600" y="130" text-anchor="middle">21 columns</text>
  <text class="d-label" x="600" y="152" text-anchor="middle">LogisticRegression</text>
</svg>
:::

Three transformers do the work:

- **`OneHotEncoder`** creates one 0/1 column per category: `country_Egypt`, `country_Germany` and so on. Set `handle_unknown="ignore"`; the default raises an error the first time a customer arrives from a country the training data didn't include, which in production means a crashed prediction service.
- **`SimpleImputer`** fills missing values with the mean, median, most frequent value or a constant, learned from training data. With `add_indicator=True` it also adds a column that is 1 where the value was missing. Half of Cartwheel's customers never answered the survey, and that fact may matter more than the score itself.
- **`StandardScaler`**, as before. A small `make_pipeline` lets one column group pass through two steps in order.

```python run
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

churn = pd.read_csv("churn.csv")
X = churn.drop(columns=["customer_id", "churned"])
y = churn["churned"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

numeric = ["tenure_days", "orders", "total_spent", "avg_order_value",
           "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
preprocess = ColumnTransformer([
    ("num", StandardScaler(), numeric),
    ("sat", make_pipeline(SimpleImputer(strategy="median", add_indicator=True), StandardScaler()),
     ["avg_satisfaction"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["country", "segment"]),
])
pipe = Pipeline([("prep", preprocess), ("model", LogisticRegression())])

pipe.fit(X_train, y_train)
names = pipe.named_steps["prep"].get_feature_names_out()
print(len(names), "model inputs, e.g.", list(names[8:12]))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
print("all columns  ROC AUC:", cross_val_score(pipe, X_train, y_train, cv=cv, scoring="roc_auc").mean().round(3))
numeric_only = make_pipeline(StandardScaler(), LogisticRegression())
print("numeric only ROC AUC:", cross_val_score(numeric_only, X_train[numeric], y_train, cv=cv, scoring="roc_auc").mean().round(3))
```

The pipeline accepts the raw DataFrame, text and gaps included, and produces 21 model inputs: eight scaled numbers, the imputed satisfaction score and its missing flag, eight country columns and three segment columns. `get_feature_names_out` lists them with a prefix naming the transformer that made each one, which is how you match coefficients to columns later.

## More columns, worse model

Then the surprise: the full pipeline ranks customers worse than the eight numeric columns alone, 0.776 against 0.807. Eleven one-hot columns and a satisfaction score with half its values imputed give logistic regression more coefficients to fit with only 298 rows, and on this data the extra columns carry more noise than signal. Egypt's churn rate does look higher in the training data, but with 44 Egyptian customers in training that's too thin to bet on.

That's not a failure of the pipeline. It's the pipeline doing its job: it made testing the extra columns a five-line change, and cross-validation gave a clear answer. For now, the numeric model stays the champion. The categorical columns are worth revisiting when Cartwheel has a few thousand customers, or with stronger regularisation.

:::mistake Preprocessing before you split
`StandardScaler().fit_transform(X)` on the full table, then `train_test_split` or `cross_val_score`, means the validation rows helped compute the means and standard deviations. With scaling the leak is small; with imputation, target encoding or feature selection it can be large. Put every learned preprocessing step inside the pipeline and pass raw data to it.
:::

:::tip Reach into a fitted pipeline
`pipe.named_steps["model"].coef_` (or `pipe[-1].coef_`) gets the model; `pipe.named_steps["prep"].named_transformers_["cat"].categories_` shows the categories the encoder learned. Pipelines aren't black boxes; they're containers you can open.
:::

A pipeline also gives every setting an address: `model__C` is the `C` of the step named `model`, and `prep__sat__simpleimputer__strategy` reaches the imputer. Next lesson uses those addresses to search for the best settings automatically.
