---
summary: Save the champion pipeline with joblib, wrap it in a validated prediction function, serve it as a nightly batch job or an API, and measure whether it changes business outcomes.
takeaways:
  - "Save the whole fitted pipeline, not only the model, so preprocessing travels with it; store the feature list, a version and the scikit-learn version alongside."
  - "`joblib` and `pickle` files can run code when loaded, so only load model files you created or trust, and load them with the same scikit-learn version."
  - Validate inputs before predicting: required fields, types and sensible ranges, so bad data fails loudly instead of producing a confident wrong score.
  - Many business models, churn included, are best shipped as a scheduled batch job; an online API is for decisions that must happen during a request.
  - "The real test of a model is a controlled experiment: compare outcomes for flagged customers who got the offer with a randomly held-out group who didn't."
further:
  - title: "Model persistence"
    url: https://scikit-learn.org/stable/model_persistence.html
  - title: "pickle: security warning"
    url: https://docs.python.org/3/library/pickle.html
quiz:
  - q: "Why save the fitted pipeline rather than only the `LogisticRegression` step?"
    options:
      - text: The pipeline file is smaller.
        why: It's slightly larger, if anything; size isn't the reason.
      - text: The scaler's learned means and standard deviations are part of the model; without them, new data would be scaled differently.
        why: Correct. The pipeline guarantees production applies exactly the preprocessing the model was trained with.
      - text: joblib can't save a LogisticRegression on its own.
        why: It can save any picklable object; the issue is consistency, not capability.
      - text: Pipelines load faster than single estimators.
        why: Load time is negligible either way.
    answer: 1
  - q: "A colleague emails you `model.joblib` from an unknown source and asks you to evaluate it. What's the risk?"
    options:
      - text: Loading it can execute arbitrary code on your machine.
        why: Correct. joblib uses pickle, which can run code during loading. Only load files from sources you trust.
      - text: It might use too much memory to open.
        why: Possible but minor; the serious risk is code execution.
      - text: It will silently retrain on your data.
        why: Loading doesn't train anything. The danger is what the file can run while being loaded.
    answer: 0
  - q: "Marketing contacts every customer the model flags, and churn among them drops from 79% to 60%. Can you credit the model and the offer?"
    options:
      - text: Yes; churn fell after launch, so the system works.
        why: Churn might have fallen anyway (season, a competitor's problem). Without a comparison group you can't tell.
      - text: Yes, as long as test-set ROC AUC was above 0.8.
        why: AUC shows the model ranks well; it says nothing about whether the offer changes behaviour.
      - text: No, because churn should be measured over 30 days, not 90.
        why: The window is a business definition; the problem is the missing comparison.
      - text: Not yet; you need a randomly held-out group of flagged customers who got no offer to compare against.
        why: Correct. The difference between the two groups is the effect of the offer.
    answer: 3
---

A model in a notebook helps nobody. To change what Cartwheel does, the champion pipeline has to run on fresh customer data, on a schedule or on request, and its scores have to reach the people who send the win-back offers. This lesson covers the last mile: saving the model, guarding its inputs, choosing between a batch job and an API, and proving it works.

## Save the pipeline, not just the model

The thing to ship is the whole fitted pipeline. The scaler's means and standard deviations are as much a part of the model as the coefficients; without them, production would scale new customers differently and every score would be off.

scikit-learn's model persistence guide covers several formats (pickle, joblib, skops, ONNX); `joblib` is the most common when Python both saves and loads the model. Save a small bundle with what someone will need later: the pipeline, the exact feature list, a version label and the library version it was trained with.

```python run
import os
import tempfile

import joblib
import pandas as pd
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
champion = make_pipeline(StandardScaler(), LogisticRegression()).fit(churn[features], churn["churned"])

bundle = {"model": champion, "features": features,
          "version": "churn-2025-09-30.1", "sklearn_version": sklearn.__version__}

with tempfile.TemporaryDirectory() as folder:
    path = os.path.join(folder, "churn_model.joblib")
    joblib.dump(bundle, path)
    print("saved", os.path.getsize(path), "bytes")

    loaded = joblib.load(path)
    same = (loaded["model"].predict_proba(churn[features]) == champion.predict_proba(churn[features])).all()
    print("identical predictions after reload:", same, "| trained with scikit-learn", loaded["sklearn_version"])
```

Notice the final model is fitted on all 398 labelled customers. The test set's job was to measure the modelling process; once you've measured it, retraining on every labelled row gives the deployed model a little more to learn from. Record that you did it, and keep the reported metric from the test-set evaluation.

:::mistake Loading a model file you didn't make
`joblib` files are pickles, and loading a pickle can execute arbitrary code. Treat a model file like a program: only load ones you produced or that come from a trusted, access-controlled store. Also load with the same scikit-learn version you trained with; a different version may warn with `InconsistentVersionWarning` or behave differently. Pin the version in your requirements.
:::

## Guard the inputs

A model will happily score nonsense. A customer with `orders = 0`, a `mobile_share` of 7, or a missing column produces a probability that looks as confident as any other. Put a thin layer in front of `predict_proba` that checks the input and fails loudly:

```python
# assumes `import pandas as pd` and a loaded `bundle` as above
def predict_churn(record: dict, bundle: dict) -> float:
    missing = [f for f in bundle["features"] if f not in record]
    if missing:
        raise ValueError(f"missing fields: {missing}")
    if not 0 <= record["mobile_share"] <= 1:
        raise ValueError("mobile_share must be between 0 and 1")
    row = pd.DataFrame([record])[bundle["features"]]
    return float(bundle["model"].predict_proba(row)[0, 1])
```

Selecting `[bundle["features"]]` fixes the column order, which, as section 1 showed, scikit-learn insists on.

## Batch job or API?

There are two common ways to put a model to work:

- **Batch scoring**: a scheduled job (nightly or weekly) loads the model, scores every active customer from the warehouse and writes the probabilities to a table. Marketing's tools read the table. Simple, cheap, easy to monitor, and right for churn, where a decision a day later costs nothing.
- **Online API**: a web service scores one customer per request, in milliseconds. Needed when the decision happens during a user's session, such as showing a retention offer on the cancellation page.

:::figure From training to decisions
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">A training pipeline produces a versioned model file. The model file feeds either a nightly batch job that writes scores to a table for marketing, or an online API that answers single requests. Both log inputs and predictions to monitoring, which feeds back into retraining.</title>
  <rect class="d-box" x="10" y="95" width="130" height="56" rx="10"/>
  <text class="d-label" x="75" y="120" text-anchor="middle">training</text>
  <text class="d-label-muted" x="75" y="140" text-anchor="middle">pipeline + CV</text>
  <path class="d-arrow" d="M140 123 L178 123" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="182" y="95" width="130" height="56" rx="10"/>
  <text class="d-code" x="247" y="120" text-anchor="middle">model.joblib</text>
  <text class="d-label-muted" x="247" y="140" text-anchor="middle">versioned</text>
  <path class="d-arrow" d="M312 110 L360 62" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M312 136 L360 184" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="364" y="30" width="160" height="56" rx="10"/>
  <text class="d-label" x="444" y="55" text-anchor="middle">nightly batch job</text>
  <text class="d-label-muted" x="444" y="75" text-anchor="middle">scores → table</text>
  <rect class="d-box-accent" x="364" y="160" width="160" height="56" rx="10"/>
  <text class="d-label" x="444" y="185" text-anchor="middle">online API</text>
  <text class="d-label-muted" x="444" y="205" text-anchor="middle">one request, ms</text>
  <path class="d-arrow" d="M524 58 L568 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M524 188 L568 136" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="572" y="95" width="118" height="56" rx="10"/>
  <text class="d-label" x="631" y="120" text-anchor="middle">monitoring</text>
  <text class="d-label-muted" x="631" y="140" text-anchor="middle">logs, drift</text>
  <path class="d-dashed d-line" d="M631 151 C631 240 75 240 75 151" fill="none"/>
  <text class="d-label-muted" x="350" y="244" text-anchor="middle">retrain when monitoring says so</text>
</svg>
:::

If you do need an API, a small FastAPI service is a common choice in Python. This sketch isn't runnable in the browser, but it's complete enough to run locally with `uvicorn app:app`:

```python title=app.py
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

# joblib uses pickle: load only model files from your own trusted, access-controlled store
bundle = joblib.load("churn_model.joblib")
app = FastAPI()

class Customer(BaseModel):
    tenure_days: int = Field(ge=0)
    orders: int = Field(ge=1)
    total_spent: float = Field(ge=0)
    avg_order_value: float = Field(ge=0)
    days_since_last_order: int = Field(ge=0)
    used_coupon: int = Field(ge=0, le=1)
    support_tickets: int = Field(ge=0)
    mobile_share: float = Field(ge=0, le=1)

@app.post("/predict")
def predict(customer: Customer):
    row = pd.DataFrame([customer.model_dump()])[bundle["features"]]
    prob = float(bundle["model"].predict_proba(row)[0, 1])
    return {"churn_probability": round(prob, 3), "model_version": bundle["version"]}
```

The Pydantic model does the input validation declaratively: a request with `orders: 0` or a missing field gets a 422 error before the model ever sees it. Returning the model version with every answer makes it possible to trace any prediction back to the exact model that made it. Log every request and response; those logs are what the drift checks from the previous lesson run on.

## Did it work? Run an experiment

A good ROC AUC means the model ranks customers well. It doesn't mean the win-back offer changes anyone's mind. To measure that, hold out a random slice of flagged customers (say 20%) who don't get the offer. After 90 days, compare churn between the contacted and held-out groups. The difference is the effect of the offer on the customers the model picks, and multiplied by customer value it's the number the business actually cares about. Without the held-out group, any drop in churn could be the season, a competitor's stumble or luck.

:::why Why the held-out group is worth the lost revenue
Withholding offers from some at-risk customers feels expensive. But without it, you can't tell a system that saves customers from one that only spends money on discounts, and you'll never know when it stops working.
:::

## Where you are now

You started with a question and a table, and you now have a process that holds up: frame the problem, split before you look, beat a majority-class dummy and a rule, choose metrics by the cost of each mistake, compare models with cross-validation inside leak-free pipelines, check who the model serves worse, and ship something you can monitor and test. The champion turned out to be the simplest serious model, and you know exactly why. That habit of asking "compared to what?" is the most valuable thing this course had to teach, and it applies unchanged to the next model you build, whatever it is.
