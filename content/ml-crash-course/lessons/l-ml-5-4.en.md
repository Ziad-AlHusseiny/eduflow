---
summary: Audit a model's errors group by group, pick a fairness criterion that matches the harm, and monitor inputs, predictions and outcomes so you notice when the world drifts away from the training data.
takeaways:
  - "Bias enters through the data (historical labels, under-represented groups, proxy features) and through how predictions are used; a good overall score can hide a bad score for one group."
  - "Audit with per-group metrics: selection rate, recall and precision, computed on out-of-fold or test predictions."
  - Fairness definitions such as equal selection rates, equal recall and equal precision usually can't all hold at once; choose the one that matches who is harmed by which error.
  - Dropping a sensitive column doesn't remove bias, because other features act as proxies; keep it available for auditing.
  - "Monitor three things after launch: input distributions (data drift), the distribution of predictions, and real performance once outcomes arrive."
further:
  - title: cross_val_predict
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_predict.html
  - title: "Model evaluation: classification metrics"
    url: https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics
quiz:
  - q: "The churn model's recall is 0.82 for Egyptian customers and 0.71 for Canadian customers. Win-back offers go to flagged customers. Who is disadvantaged?"
    options:
      - text: Canadian churners, who are less likely to be flagged and offered a deal.
        why: Correct. Lower recall means more Canadian churners are missed, so fewer of them receive the benefit.
      - text: Egyptian customers, because more of them are flagged.
        why: Being flagged here means receiving an offer, which is a benefit, not a penalty.
      - text: Nobody, because the overall recall is fine.
        why: An overall average can hide a group that's consistently served worse.
      - text: Canadian customers who stayed, because they're flagged more.
        why: That would be about false positives (precision or false positive rate), not recall.
    answer: 0
  - q: "A teammate removes `country` from the features 'to make the model fair'. Why is that not enough?"
    options:
      - text: Removing a column always lowers accuracy below the baseline.
        why: It might change accuracy a little or not at all; the fairness problem is separate.
      - text: Other features, such as shipping fees or delivery times, can carry the same information, and you can no longer audit by country.
        why: Correct. Proxies let the bias back in, and without the column you can't measure whether it did.
      - text: scikit-learn requires sensitive attributes to stay in the model.
        why: There's no such requirement; the issue is about proxies and auditing.
    answer: 1
  - q: "Two months after launch, the share of customers flagged as churners rises from 47% to 60%, but no churn outcomes are known yet. What's the best first step?"
    options:
      - text: Retrain immediately on the latest data.
        why: You don't have new labels yet, and you don't know whether the model or the world changed.
      - text: Lower the threshold so the flag rate returns to 47%.
        why: That hides the signal instead of explaining it.
      - text: Ignore it until the 90-day outcomes arrive.
        why: Waiting three months for a problem you can investigate today is costly.
      - text: Compare current input distributions with the training data to find which features shifted, then ask the business why.
        why: Correct. Data drift checks work without labels and usually point to a cause, such as a delivery problem or a new app.
    answer: 3
---

Your champion model reached a test ROC AUC of 0.81. That's one number for 100 customers from eight countries and three segments. It's entirely possible for a model to be good on average and poor for one group, and for that group to be the one with the least power to complain. It's also possible for a model that was good in October to be quietly wrong by March. This lesson covers both: fairness before launch, drift after it.

## Where bias comes from

Bias in a model is rarely a line of code. It arrives with the data and with how predictions are used:

- **Historical bias**: labels record past decisions, not ground truth. A model trained on who got approved learns who was approved, including any prejudice in those approvals.
- **Representation**: small groups give the model less to learn from. Cartwheel has 17 Jordanian customers in the whole table; any model will be less reliable for them.
- **Proxies**: removing a sensitive column doesn't remove its information. Shipping fees, delivery times and currency can stand in for country.
- **Use**: the same score means different things depending on the action. A churn flag that triggers a discount helps the flagged customer; a flag that triggers a credit freeze hurts them.

## Auditing a model group by group

To audit fairly you need predictions for many customers that the model didn't train on. `cross_val_predict` gives every row an out-of-fold prediction: each customer is scored by a model trained on the other folds.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
model = make_pipeline(StandardScaler(), LogisticRegression())
prob = cross_val_predict(model, churn[features], churn["churned"], cv=cv, method="predict_proba")[:, 1]
audit = churn.assign(flagged=(prob >= 0.5).astype(int))

def group_report(g):
    return pd.Series({
        "customers": len(g),
        "churn_rate": g["churned"].mean(),
        "flag_rate": g["flagged"].mean(),
        "recall": recall_score(g["churned"], g["flagged"]),
        "precision": precision_score(g["churned"], g["flagged"]),
    })

print(audit.groupby("segment")[["churned", "flagged"]].apply(group_report).round(2))
print(audit.groupby("country")[["churned", "flagged"]].apply(group_report).round(2))
```

Read across the columns:

- **Flag rate** (selection rate): how often each group gets the offer.
- **Recall**: of each group's churners, how many the model catches. Here that's the share of at-risk customers who get help.
- **Precision**: of each group's flagged customers, how many were really leaving. Low precision means discounts going to people who'd have stayed.

Recall ranges from 0.71 (Canada, UAE, UK) to 0.82 (Egypt, Jordan). Precision for small businesses is 0.66 against 0.78 for consumers. Some gaps are noise: Jordan's numbers rest on 17 customers, so a single customer moves them by several points. Others deserve a closer look as data grows. The point of the audit isn't a pass/fail stamp; it's knowing where the model is weaker, so you can decide whether that's acceptable.

## Choosing what "fair" means

There are several reasonable definitions, and when groups have different base rates (Egypt churns at 67%, Germany at 45%) they can't all hold at once:

- **Equal selection rates** (demographic parity): every group flagged at the same rate.
- **Equal recall** (equal opportunity): every group's true churners caught at the same rate.
- **Equal precision**: a flag means the same risk in every group.

Pick by asking who is harmed by which error. For win-back offers the harm is a churner who never gets the offer, so equal recall is the natural target. For a model that freezes accounts, the harm is a false positive, and you'd look at false positive rates instead. Write the choice down; it's a business and ethical decision, not a technical default.

:::mistake Deleting the sensitive column and declaring victory
"We don't use country, so the model can't be biased by it" is called fairness through unawareness, and it fails whenever other features correlate with country. Worse, without the column you can't run the audit above. Keep sensitive attributes out of the model if policy requires, but keep them in the evaluation data.
:::

## After launch: drift

The model learned from customers as they were on 30 September 2025. The world moves. **Data drift** is a change in the inputs: a new mobile app shifts `mobile_share`, a courier strike stretches `days_since_last_order`. **Concept drift** is a change in the relationship itself: a competitor's loyalty scheme makes even recent customers leave. And churn has **label delay**: you only learn whether a prediction was right 90 days later.

:::figure Monitoring a deployed churn model
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">A loop with four stages. Daily: check input distributions against training data. Daily: track the share of customers flagged. After 90 days: compare predictions with real outcomes. When checks fail: investigate, then retrain and re-audit, which feeds back to the deployed model.</title>
  <rect class="d-box-primary" x="250" y="10" width="180" height="46" rx="10"/>
  <text class="d-label" x="340" y="38" text-anchor="middle">deployed model</text>
  <rect class="d-box-accent" x="20" y="92" width="190" height="56" rx="10"/>
  <text class="d-label" x="115" y="116" text-anchor="middle">input drift checks</text>
  <text class="d-label-muted" x="115" y="137" text-anchor="middle">daily, no labels needed</text>
  <rect class="d-box-accent" x="245" y="92" width="190" height="56" rx="10"/>
  <text class="d-label" x="340" y="116" text-anchor="middle">prediction mix</text>
  <text class="d-label-muted" x="340" y="137" text-anchor="middle">flag rate per group</text>
  <rect class="d-box-warn" x="470" y="92" width="190" height="56" rx="10"/>
  <text class="d-label" x="565" y="116" text-anchor="middle">real performance</text>
  <text class="d-label-muted" x="565" y="137" text-anchor="middle">after 90 days</text>
  <rect class="d-box-success" x="250" y="178" width="180" height="46" rx="10"/>
  <text class="d-label" x="340" y="206" text-anchor="middle">investigate, retrain, re-audit</text>
  <path class="d-arrow" d="M290 56 L150 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 56 L340 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 56 L530 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M115 148 L250 195" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M565 148 L430 195" marker-end="url(#arrow)"/>
</svg>
:::

Input drift can be checked every day, without labels, by comparing each feature's recent values with the training data. The two-sample Kolmogorov–Smirnov test from SciPy is a simple start:

```python run
import numpy as np
import pandas as pd
from scipy.stats import ks_2samp

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
training = churn[features]

# Simulate next quarter: a courier problem delays orders and a new app shifts shopping to mobile
rng = np.random.default_rng(7)
recent = training.sample(150, random_state=1).copy()
recent["days_since_last_order"] += rng.integers(20, 60, len(recent))
recent["mobile_share"] = (recent["mobile_share"] + 0.3).clip(0, 1)

for col in features:
    stat, p = ks_2samp(training[col], recent[col])
    flag = "DRIFT" if p < 0.01 else ""
    print(f"{col:22} KS {stat:.2f}  p={p:.3g} {flag}")
```

The two columns that changed light up; the rest don't. In production you'd run this on a schedule, alert on sustained drift rather than a single bad day, and pair it with the flag rate per group and, once outcomes arrive, recall and precision per group. When real performance drops, retrain on recent data and rerun this lesson's audit before redeploying.

:::tip Write a model card
Keep a one-page record next to the model: what it predicts and for whom, the training data dates, metrics overall and per group, the fairness criterion you chose and why, known weaknesses (17 Jordanian customers), and what is monitored. It's the document someone will need when the model surprises them in a year.
:::

Monitoring assumes the model is running somewhere. The last lesson packages the champion pipeline, puts it behind an API and closes the loop.
