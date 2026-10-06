---
summary: Grow decision trees on the churn data, read them as plain if/else rules, control their size with max_depth and min_samples_leaf, and know when their probabilities can't be trusted.
takeaways:
  - "A decision tree splits the data with one yes/no question at a time, choosing at each step the question that makes the groups purest."
  - "A fitted tree is a set of readable rules; `export_text` prints them."
  - "Unconstrained trees grow until every leaf is pure, which memorises the training data and produces overconfident 0 or 1 probabilities."
  - "`max_depth` and `min_samples_leaf` limit growth; `min_samples_leaf` stops the tree from spending a split on a handful of customers."
  - "Trees need no feature scaling and capture interactions automatically, but a single tree is unstable: small data changes can reshape it."
further:
  - title: "Decision Trees"
    url: https://scikit-learn.org/stable/modules/tree.html
  - title: export_text
    url: https://scikit-learn.org/stable/modules/generated/sklearn.tree.export_text.html
quiz:
  - q: "A leaf of a churn tree holds 60 customers who stayed and 13 who churned. What does `predict_proba` return for a customer who lands there?"
    options:
      - text: "About `[0.82, 0.18]`: the class shares in that leaf."
        why: Correct. A tree's probability is the fraction of training customers of each class in the leaf.
      - text: "`[1.0, 0.0]`, because the leaf's majority class is 0."
        why: That's what `predict` reports as a label. `predict_proba` keeps the proportions.
      - text: "`[0.5, 0.5]`, because trees don't estimate probabilities."
        why: Trees do estimate them, from leaf proportions, though coarsely.
      - text: It depends on how far the customer is from the split threshold.
        why: Inside a leaf every customer gets the same answer; distance from the threshold plays no part.
    answer: 0
  - q: "An unlimited tree's test predictions contain only two distinct probabilities, 0.0 and 1.0. Why is that a problem?"
    options:
      - text: It means the tree has a bug and must be refitted with another `random_state`.
        why: It's expected behaviour, not a bug. Every leaf of a fully grown tree is pure.
      - text: Probabilities of exactly 0 or 1 can't be used for ranking customers.
        why: They can be sorted, but with only two values almost every customer ties, so the ranking carries no information.
      - text: The tree claims total certainty about every customer, which its test accuracy of 0.72 shows is false.
        why: Correct. Pure leaves produce overconfident probabilities, and the ranking you'd build from them is nearly useless.
    answer: 2
  - q: "Which is a genuine advantage of trees over logistic regression for the churn data?"
    options:
      - text: Trees always generalise better because they can model curves.
        why: Flexibility cuts both ways. On this data a constrained logistic regression does as well or better.
      - text: Trees give smoother, better-calibrated probabilities.
        why: Tree probabilities are coarse leaf proportions, usually less smooth than logistic regression's.
      - text: Trees are stable; retraining on slightly different data gives nearly the same tree.
        why: The opposite is true. A different first split changes everything below it.
      - text: Trees capture interactions such as "few orders matters only for recent customers" without you creating the feature.
        why: Correct. Each branch asks its own follow-up questions, so interactions come for free.
    answer: 3
---

Ask a support lead how they spot customers who are about to leave and you'll get something like: "If they haven't ordered in months, they're gone. If they're recent but only bought once or twice, it's a toss-up. Regulars who ordered recently are fine." That's a decision tree. This lesson grows one from data and checks whether it agrees.

## Twenty questions, chosen by data

A decision tree predicts by asking yes/no questions about one feature at a time. To build it, the algorithm looks at every feature and every possible threshold, and picks the question that splits the training customers into the two purest groups: ideally all churners on one side and all stayers on the other. Purity is measured with the **Gini impurity** by default (0 for a group of one class only, 0.5 for a 50/50 mix). Then it repeats the search inside each group, and so on down.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

tree = DecisionTreeClassifier(max_depth=2, random_state=42).fit(X_train, y_train)
print(export_text(tree, feature_names=features, show_weights=True))
```

`export_text` prints the rules, and `show_weights=True` adds how many training customers of each class (stayed, churned) reached each leaf.

:::figure The depth-2 churn tree
<svg viewBox="0 0 700 270" role="img" aria-labelledby="t1">
  <title id="t1">Root question: days since last order at most 236.5. If yes, ask orders at most 3.5: yes gives a leaf of 60 stayed and 67 churned, no gives 60 stayed and 13 churned. If no, ask tenure at most 637.5: yes gives 11 stayed and 84 churned, no gives 2 stayed and 1 churned.</title>
  <rect class="d-box-primary" x="235" y="10" width="230" height="44" rx="10"/>
  <text class="d-code" x="350" y="37" text-anchor="middle">days_since_last ≤ 236.5?</text>
  <path class="d-arrow" d="M300 54 L180 100" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 54 L520 100" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="220" y="80">yes</text>
  <text class="d-label-muted" x="470" y="80">no</text>
  <rect class="d-box" x="80" y="104" width="200" height="44" rx="10"/>
  <text class="d-code" x="180" y="131" text-anchor="middle">orders ≤ 3.5?</text>
  <rect class="d-box" x="420" y="104" width="200" height="44" rx="10"/>
  <text class="d-code" x="520" y="131" text-anchor="middle">tenure_days ≤ 637.5?</text>
  <path class="d-arrow" d="M140 148 L80 196" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M220 148 L270 196" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 148 L430 196" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 148 L610 196" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="10" y="200" width="140" height="54" rx="10"/>
  <text class="d-label" x="80" y="222" text-anchor="middle">60 stay / 67 churn</text>
  <text class="d-label-strong" x="80" y="243" text-anchor="middle">toss-up</text>
  <rect class="d-box-success" x="200" y="200" width="140" height="54" rx="10"/>
  <text class="d-label" x="270" y="222" text-anchor="middle">60 stay / 13 churn</text>
  <text class="d-label-strong" x="270" y="243" text-anchor="middle">stays</text>
  <rect class="d-box-accent" x="360" y="200" width="140" height="54" rx="10"/>
  <text class="d-label" x="430" y="222" text-anchor="middle">11 stay / 84 churn</text>
  <text class="d-label-strong" x="430" y="243" text-anchor="middle">churns</text>
  <rect class="d-box" x="540" y="200" width="140" height="54" rx="10"/>
  <text class="d-label" x="610" y="222" text-anchor="middle">2 stay / 1 churn</text>
  <text class="d-label-strong" x="610" y="243" text-anchor="middle">3 customers!</text>
</svg>
:::

Three leaves match the support lead almost word for word. Long-silent customers churn (84 of 95). Recent regulars with four or more orders stay (60 of 73). Recent customers with few orders are a toss-up (67 of 127 churn). The tree also discovered an **interaction** nobody had to code: order count matters, but only among recent customers.

The fourth leaf is a warning. The tree spent a whole question isolating three very long-tenured customers. That's the greedy search at work: it picks the split that helps most right now, even if the help comes from a group too small to mean anything.

## How a tree predicts probabilities

A customer who falls into a leaf gets that leaf's class shares as probabilities. Land in the "regulars" leaf and `predict_proba` returns about `[0.82, 0.18]`. So a depth-2 tree can only ever output four distinct probabilities, one per leaf. That's coarse, but honest. The trouble starts when the tree has no limits.

## Growing too far, and how to stop it

An unconstrained tree keeps splitting until every leaf is pure. On the churn data that's 64 leaves, 11 levels deep, and 100% training accuracy. Every leaf is pure, so every probability is exactly 0 or 1: the tree claims total certainty about every test customer while being right only 72% of the time. Ranked by such probabilities, almost all customers tie, and the call list from last lesson becomes a lottery.

Two hyperparameters do most of the work of keeping a tree honest:

- `max_depth` caps how many questions in a row the tree can ask.
- `min_samples_leaf` refuses any split that would leave fewer than that many training customers in a leaf. It targets exactly the problem in the fourth leaf above, and it lets the tree grow deep where there's plenty of data and stay shallow where there isn't.

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

for settings in [{}, {"max_depth": 3}, {"min_samples_leaf": 20}]:
    t = DecisionTreeClassifier(random_state=42, **settings).fit(X_train, y_train)
    distinct = len(set(t.predict_proba(X_test)[:, 1]))
    print(f"{str(settings):24} leaves {t.get_n_leaves():3}  train {t.score(X_train, y_train):.2f}  "
          f"test {t.score(X_test, y_test):.2f}  distinct probabilities {distinct}")

t = DecisionTreeClassifier(min_samples_leaf=20, random_state=42).fit(X_train, y_train)
print(pd.Series(t.feature_importances_, index=features).sort_values(ascending=False).round(2))
```

`feature_importances_` says how much each feature reduced impurity across all its splits, normalised to sum to 1. Recency takes over half, order count comes second; coupons and support tickets get zero because the tree never used them. Treat these numbers as a description of this tree, not of the world: features the tree didn't need can still be informative, and the next lesson shows a more trustworthy way to measure importance.

:::mistake Trusting one tree's structure
Change `random_state` in `train_test_split` and refit: the root question may stay, but the branches below it often change. A tree's first split decides everything beneath it, so a small change in the data can produce a different-looking tree with a similar score. Read a single tree as one plausible story, not as the truth about your customers.
:::

:::tip What trees don't need
Trees split on the order of values, so they need no scaling, they shrug off outliers in the features, and they handle a mix of large and small numbers without complaint. That's why tree-based models are the default for tabular data in practice, as long as you use many of them together.
:::

That instability is also an opportunity. If one tree is noisy, average many trees grown on slightly different data and the noise cancels out. That's the idea behind random forests and gradient boosting, next.
