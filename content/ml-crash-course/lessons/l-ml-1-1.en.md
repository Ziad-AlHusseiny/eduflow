---
kind: intro
summary: Explain what machine learning does differently from hand-written rules, tell supervised from unsupervised problems, and describe the churn question this course answers.
takeaways:
  - Machine learning takes examples of inputs with known answers and produces a function that predicts answers for new inputs.
  - Supervised learning needs a labelled target column; unsupervised learning looks for structure in data with no target.
  - Predicting a number is regression; predicting a category is classification.
  - If a short rule or a SQL query answers the question well enough, you do not need a model.
further:
  - title: "scikit-learn: An introduction to machine learning"
    url: https://scikit-learn.org/stable/tutorial/basic/tutorial.html
  - title: scikit-learn User Guide
    url: https://scikit-learn.org/stable/user_guide.html
quiz:
  - q: Cartwheel wants to group its customers into a few shopping styles, but nobody has labelled any customer with a style. What kind of problem is this?
    options:
      - text: Supervised classification, because the output is a category.
        why: Classification needs examples where the right category is already known. Here there are no labels to learn from.
      - text: Unsupervised learning, because there is no target column to learn from.
        why: Correct. Finding groups in unlabelled data is clustering, a classic unsupervised task.
      - text: Regression, because customer data is mostly numbers.
        why: Regression is about the output being a number, not the inputs. Numeric inputs are normal for every kind of model.
    answer: 1
  - q: Which question is a regression problem?
    options:
      - text: Will this customer place another order in the next 90 days?
        why: The answer is yes or no, a category. That makes it classification.
      - text: Which of five support teams should handle this ticket?
        why: Five possible teams is still a set of categories, so this is multi-class classification.
      - text: How much will this customer spend over the next year?
        why: Correct. The target is a continuous amount of money, which makes it regression.
    answer: 2
  - q: "A teammate proposes a model to flag orders over $10,000 for manual review. What is the best response?"
    options:
      - text: Train a classifier on past flagged orders so it can learn the pattern.
        why: The rule is already known and exact. A model can only approximate it, and adds training, monitoring and error.
      - text: Write the rule `total > 10000`; no learning is needed when you can state the rule.
        why: Correct. Machine learning earns its cost when the rule is unknown or too complex to write by hand.
      - text: Use clustering to find which orders look large.
        why: Clustering finds groups by similarity. It cannot know your business threshold, which you already have.
    answer: 1
---

Cartwheel, the online store you will work with in this course, has a problem every subscription-free shop has. Customers drift away without saying goodbye. Nobody cancels anything; they stop ordering. The marketing team wants to send a win-back offer to customers who are about to go quiet, before they are gone. Which customers?

You could write a rule: "if a customer hasn't ordered in 90 days, send the offer". That rule is a fine start, and you will measure it properly in a later lesson. But churn depends on more than one number. A customer with fifteen orders who went quiet for a month is different from a one-time buyer who went quiet for a month. Writing rules for every combination of tenure, order count, spend, coupons and support tickets gets out of hand fast.

## Rules from examples

Machine learning flips the job around. Instead of writing the rules, you collect examples where you already know the answer, and an algorithm finds a rule that fits them. For Cartwheel, that means past customers, what they looked like on a given date, and whether they ordered again in the following 90 days.

:::figure Classic programming versus machine learning
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">In classic programming, rules and data go in and answers come out. In machine learning, data and known answers go in and a learned rule, the model, comes out.</title>
  <text class="d-label-strong" x="20" y="30">Classic programming</text>
  <rect class="d-box" x="20" y="45" width="130" height="44" rx="10"/>
  <text class="d-label" x="85" y="72" text-anchor="middle">Rules</text>
  <rect class="d-box" x="170" y="45" width="130" height="44" rx="10"/>
  <text class="d-label" x="235" y="72" text-anchor="middle">Data</text>
  <path class="d-arrow" d="M310 67 L400 67" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="410" y="45" width="150" height="44" rx="10"/>
  <text class="d-label" x="485" y="72" text-anchor="middle">Answers</text>
  <text class="d-label-strong" x="20" y="140">Machine learning</text>
  <rect class="d-box" x="20" y="155" width="130" height="44" rx="10"/>
  <text class="d-label" x="85" y="182" text-anchor="middle">Data</text>
  <rect class="d-box" x="170" y="155" width="130" height="44" rx="10"/>
  <text class="d-label" x="235" y="182" text-anchor="middle">Answers</text>
  <path class="d-arrow" d="M310 177 L400 177" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="410" y="155" width="150" height="44" rx="10"/>
  <text class="d-label" x="485" y="182" text-anchor="middle">Rules (a model)</text>
</svg>
:::

The learned rule is called a **model**. Once you have it, you feed it new customers and it predicts their answer. That is the whole idea; the rest of this course is about doing it well and knowing when the predictions deserve trust.

Here is the table you will spend most of the course with. Each row is a customer, each column is something known about them on 30 September 2025, and `churned` records what happened next.

```python run
import pandas as pd

churn = pd.read_csv("churn.csv")
print(churn.shape)
print(churn[["orders", "days_since_last_order", "support_tickets", "churned"]].head())
print("Churn rate:", round(churn["churned"].mean(), 3))
```

398 customers, 55% of whom did not order again within 90 days. The columns you predict from are the **features**; the column you predict is the **target** (or label).

## Kinds of learning

**Supervised learning** has a target column. The examples come with answers, and the model learns to map features to the answer. Two flavours, depending on the target:

- **Classification**: the target is a category. Will this customer churn, yes or no? Is this tumour benign or malignant? Which digit is in this image?
- **Regression**: the target is a number. How much will this customer spend next year? How far will a disease progress?

**Unsupervised learning** has no target. You ask the data a looser question: which customers resemble each other? Can thirty columns be summarised by two? You will meet clustering and PCA, the two workhorses, in section 5.

:::mistake Reaching for a model when a rule will do
If you can write the rule down and it is right, write it down. "Orders over $10,000 need review" is a rule, not a learning problem. Models cost data, training, monitoring and explanations. They pay off when the pattern is real but too tangled to state by hand.
:::

## How this course works

You will build everything in scikit-learn, the standard Python library for classic machine learning, and run it in the browser. Each section adds one layer:

1. The workflow, the train/test split, the scikit-learn API and baselines.
2. Regression on a medical dataset, with the loss function and gradient descent pictured.
3. Classification on churn: logistic regression, trees, ensembles, and the metrics that matter.
4. The habits that keep you honest: cross-validation, pipelines, tuning, leakage.
5. Clustering, neural networks, where LLMs fit, fairness, and shipping.

One habit runs through all of it. Before you believe a score, you ask "compared to what?". A model that is 73% accurate sounds good until you learn that guessing "churned" for everyone gets 55%, and a one-line rule gets 72%. Next lesson starts with the most important step in that habit: setting data aside so you can measure honestly.
