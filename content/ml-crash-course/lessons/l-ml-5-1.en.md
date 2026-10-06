---
summary: Group customers with k-means, profile the clusters to see whether they mean anything, and compress many correlated columns into a few with PCA.
takeaways:
  - "k-means alternates two steps, assign each point to its nearest centre and move each centre to the mean of its points, until nothing changes."
  - "Clustering uses distances, so scale features first, and set `n_init` and `random_state` for repeatable results."
  - Clusters are only useful if you can describe them; profile each one with group means before giving it a name.
  - "A low silhouette score means the data has no crisp natural groups; segments can still be useful, but they're a choice, not a discovery."
  - "PCA finds new axes that capture the most variance; `explained_variance_ratio_` tells you how much each component keeps."
further:
  - title: "Clustering: K-means"
    url: https://scikit-learn.org/stable/modules/clustering.html#k-means
  - title: KMeans
    url: https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html
  - title: "Principal component analysis (PCA)"
    url: https://scikit-learn.org/stable/modules/decomposition.html#pca
quiz:
  - q: "You run k-means on raw churn columns without scaling. Which column will dominate the clusters?"
    options:
      - text: "`used_coupon`, because binary columns separate groups cleanly."
        why: A 0/1 column contributes at most 1 to a squared distance, which is nothing next to dollar amounts.
      - text: "`days_since_last_order`, because it's the best churn predictor."
        why: k-means never sees the target; it only sees distances, which are driven by scale.
      - text: All columns contribute equally, because k-means normalises internally.
        why: KMeans does no scaling of its own; you have to add a `StandardScaler`.
      - text: "`total_spent`, because its values in the thousands swamp every other distance."
        why: Correct. Unscaled, k-means mostly clusters customers by spend.
    answer: 3
  - q: "Silhouette scores for k = 2 to 7 all sit between 0.25 and 0.27. What does that tell you?"
    options:
      - text: The data has no strong natural grouping, so pick k for usefulness and explainability.
        why: Correct. Flat, low scores mean no k stands out; the segmentation is a modelling choice.
      - text: k = 7 is best because it has the highest score.
        why: Differences this small are noise, and seven segments are harder for a team to use than four.
      - text: k-means has failed and must be replaced by a supervised model.
        why: Weak cluster structure doesn't make clustering useless, and a supervised model needs labels you don't have for segments.
    answer: 0
  - q: "PCA on the 30 breast cancer features gives `explained_variance_ratio_` of 0.44 and 0.19 for the first two components. What does a 2D plot of them show?"
    options:
      - text: The two most important original features.
        why: Components are weighted combinations of all 30 features, not two of the originals.
      - text: A view that keeps about 63% of the variation in the scaled data.
        why: Correct. It's a useful map, but over a third of the variation is not shown.
      - text: The two classes, perfectly separated, because PCA uses the labels.
        why: PCA is unsupervised; it never sees the labels. Any separation you see comes from the data's structure.
    answer: 1
---

Not every question comes with labels. Cartwheel's marketing team asks: "What kinds of customers do we have?" Nobody has tagged customers with types, so there's no target to predict. **Unsupervised learning** looks for structure in the features alone. The two tools you'll use most are clustering, which groups similar rows, and dimensionality reduction, which summarises many columns with a few.

## k-means in two moves

k-means needs one decision from you: the number of clusters, k. Then it repeats two steps:

1. **Assign**: put each customer in the cluster whose centre is nearest.
2. **Update**: move each centre to the average of the customers assigned to it.

When assignments stop changing, it's done. Different starting centres can give different results, so scikit-learn runs the whole thing `n_init` times and keeps the tightest solution.

:::figure One round of k-means
<svg viewBox="0 0 680 240" role="img" aria-labelledby="t1">
  <title id="t1">Left panel: points coloured by their nearest of two centres, shown as large rings. Right panel: each centre has moved to the middle of its assigned points. The two steps repeat until the assignments stop changing.</title>
  <rect class="d-box" x="20" y="20" width="300" height="180" rx="10"/>
  <rect class="d-box" x="360" y="20" width="300" height="180" rx="10"/>
  <text class="d-label-strong" x="170" y="225" text-anchor="middle">1. assign to nearest centre</text>
  <text class="d-label-strong" x="510" y="225" text-anchor="middle">2. move centre to the mean</text>
  <circle class="d-dot" cx="60" cy="60" r="5"/><circle class="d-dot" cx="85" cy="80" r="5"/><circle class="d-dot" cx="70" cy="110" r="5"/><circle class="d-dot" cx="105" cy="65" r="5"/>
  <rect class="d-box-accent" x="215" y="120" width="10" height="10"/><rect class="d-box-accent" x="245" y="150" width="10" height="10"/><rect class="d-box-accent" x="270" y="125" width="10" height="10"/><rect class="d-box-accent" x="230" y="170" width="10" height="10"/>
  <circle class="d-box-primary" cx="140" cy="110" r="14"/>
  <circle class="d-box-accent" cx="200" cy="110" r="14"/>
  <circle class="d-dot" cx="400" cy="60" r="5"/><circle class="d-dot" cx="425" cy="80" r="5"/><circle class="d-dot" cx="410" cy="110" r="5"/><circle class="d-dot" cx="445" cy="65" r="5"/>
  <rect class="d-box-accent" x="555" y="120" width="10" height="10"/><rect class="d-box-accent" x="585" y="150" width="10" height="10"/><rect class="d-box-accent" x="610" y="125" width="10" height="10"/><rect class="d-box-accent" x="570" y="170" width="10" height="10"/>
  <circle class="d-box-primary" cx="420" cy="79" r="14"/>
  <circle class="d-box-accent" cx="585" cy="146" r="14"/>
  <path class="d-arrow" d="M330 110 L350 110" marker-end="url(#arrow)"/>
</svg>
:::

Because "nearest" is a distance, the same lesson from k-nearest neighbours applies: scale first, or `total_spent` in thousands decides everything.

## Segmenting Cartwheel's customers

Use behaviour columns only and leave `churned` out: a segmentation should describe customers, not their outcome. You'll look at churn afterwards to see whether the segments mean anything.

```python run
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
behaviour = ["orders", "total_spent", "avg_order_value", "days_since_last_order",
             "tenure_days", "mobile_share"]
X = StandardScaler().fit_transform(churn[behaviour])
for k in range(2, 7):
    labels = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(X)
    print(f"k={k}  silhouette {silhouette_score(X, labels):.3f}")

segments = make_pipeline(StandardScaler(), KMeans(n_clusters=4, n_init=10, random_state=42))
churn["segment_id"] = segments.fit_predict(churn[behaviour])
profile = churn.groupby("segment_id").agg(
    customers=("orders", "size"), orders=("orders", "mean"),
    avg_order=("avg_order_value", "mean"), days_since=("days_since_last_order", "mean"),
    tenure=("tenure_days", "mean"), churn_rate=("churned", "mean"))
print(profile.round(2))
```

First, the honest part. The **silhouette score** measures how much closer each customer is to its own cluster than to the next one, from -1 to 1. Scores around 0.25 for every k mean the customers don't fall into crisp natural groups; they form a continuum. That's typical for behavioural data. It doesn't make clustering useless, but it means k is your choice, made for usefulness, not a fact you discovered.

Then the useful part. Profiling the four clusters gives segments a marketer can name:

- **Lapsed occasionals** (129): two orders, last one about 310 days ago. 79% churn.
- **Big-ticket buyers** (41): few orders averaging $600. 66% churn.
- **Regulars** (79): eight orders, the last about 100 days ago. 33% churn.
- **New and recent** (149): short tenure, ordered about two months ago. 44% churn.

Churn rates differ sharply between segments even though k-means never saw `churned`. That's evidence the segments capture something real, and it gives marketing four different conversations to have instead of one.

k-means isn't the only option. It assumes roughly round clusters of similar size, an assumption that is usually good enough for behavioural segments. Hierarchical clustering (`AgglomerativeClustering`) shows how groups merge at different levels, and `DBSCAN` finds dense regions of any shape and labels outliers as noise. Start with k-means for segmentation; switch when its assumptions clearly don't fit your data.

:::mistake Naming clusters before profiling them
k-means always returns k groups, even from random noise. Cluster numbers have no meaning, and they can change between runs. Before you call a cluster "VIPs", print its averages and sizes, check it's stable across a couple of `random_state` values, and confirm it matters for something the business cares about.
:::

## PCA: fewer columns, most of the information

Many datasets have dozens of correlated columns. The breast cancer data has 30 measurements of cell nuclei, many of them variations on size. **Principal component analysis** finds new axes, each a weighted mix of the original columns, ordered by how much of the data's variation they capture. Keep the first few and you have a compact summary.

```python run
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
pca = make_pipeline(StandardScaler(), PCA()).fit(X)
ratios = pca[-1].explained_variance_ratio_
print("first two components keep:", ratios[:2].round(3), "=", round(ratios[:2].sum(), 3))
print("components needed for 90%:", int(np.argmax(np.cumsum(ratios) >= 0.90)) + 1)

coords = make_pipeline(StandardScaler(), PCA(n_components=2)).fit_transform(X)
for label, name in [(0, "malignant"), (1, "benign")]:
    print(name, "average position:", coords[y == label].mean(axis=0).round(2))
```

Two components keep 63% of the variation in 30 scaled columns, and seven keep 90%. Plot the two coordinates and malignant and benign tumours sit on opposite sides of the first axis, even though PCA never saw the labels. That's why a 2D PCA plot is a standard first look at any wide dataset.

:::note When PCA helps a model
PCA can also be a pipeline step before a model, to cut noise or speed up training on very wide data. On tables with a dozen meaningful columns, like churn, it usually costs interpretability and gains nothing. Use it for exploration first; add it to a model only when cross-validation says it helps.
:::

Both techniques here are classic and cheap. The next lesson is about models that learn their own features from raw inputs: neural networks.
