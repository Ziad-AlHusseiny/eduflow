# Review: ml-crash-course

## Verdict

This is an unusually strong course. The 23 lessons follow one honest thread: frame the churn question, beat a dummy and a one-line rule, choose metrics by the cost of each mistake, cross-validate inside leak-free pipelines, audit by group, ship and run an experiment. The habit of asking "compared to what?" holds the whole course together, and the final "the simple model won" conclusion is earned rather than staged. I ran every `python run` block and every exercise solution with scikit-learn 1.9.1, and I recomputed the figures quoted in prose and quizzes (fold-by-fold CV scores, the rule's CV accuracy, threshold profits at 0.5 / 0.58 / 2/3, tree depth, the engineered tree's root split, ConvergenceWarning on raw features, the MLP's churn AUC, k-means profiles, PCA variance). Almost all of them match exactly. The metric explanations are correct: precision/recall/F1, ROC AUC as a ranking probability, R², MAE vs RMSE, average precision, calibration and `pos_label`. So are the cross-validation and leakage guidance, the conceptual lessons on neural networks, LLMs and embeddings, and the fairness/drift material (impossibility with unequal base rates, fairness through unawareness, label delay). Every API used exists in scikit-learn 1.5 or earlier: `TunedThresholdClassifierCV` and `FixedThresholdClassifier` arrived in 1.5, `root_mean_squared_error` in 1.4, NaN support in `RandomForestClassifier` in 1.4 and in `DecisionTreeClassifier` in 1.3. Nothing depends on a parameter added after 1.7. The real problems were these. A spot-the-leak exercise had a third, unlisted leak. Some R² wording compared the model with the training-mean dummy instead of the mean of the true values. A few figures and claims were slightly off. Exercises 4-3 and 5-1 (plus 3-2 and 5-4) had checks pinned to exact numbers. In the Arabic, "business" was rendered as أصحاب العمل ("employers") or العمل ("work") in several places, "flag rate" as نسبة التعليم (which reads as "education rate"), and خصائص was used for both features and attributes. Everything was fixed in both languages. No ids, answer positions or structure changed.

## Issues found and fixed

| File | Category | Severity | What was wrong | What changed |
|---|---|---|---|---|
| exercises/l-ml-4-4.json + .en/.ar.json | accuracy | high | Spot-the-leak: line 10 dropped `customer_id`, `churned`, `country` and `segment` but kept the raw `orders_oct_to_dec` column in X. That was a third leak, yet only lines 9 and 11 counted as correct. | Line 10 now also drops `orders_oct_to_dec`, which is a realistic "dropped the raw column, kept the derived one" mistake. The explanation now says why line 9 still leaks. bugLines (9, 11) unchanged. |
| lessons/l-ml-2-1.en/.ar.md | accuracy | medium | Quiz Q2's correct answer said R² < 0 means worse than "predicting the training mean", and the body said R² compares with "the dummy's" error. `r2_score` compares with the mean of the true (test) values. The training-mean dummy itself scores −0.014 here. | Answer, why and body now say "always predicting the mean (of the true values)". |
| exercises/l-ml-4-3.json | accuracy | medium | Checks required exactly `{35, 'uniform'}`, CV AUC 0.795 ± 0.002 and test AUC 0.785 ± 0.002, which is brittle across scikit-learn 1.7 (Pyodide) and 1.9. | Checks now verify that the search used the provided `cv` and ROC AUC with all 10 combinations. `best_params`/`best_cv_auc`/`test_auc` must equal the search's own `best_params_`/`best_score_`/`score(X_test, y_test)`, with best k in {15, 25, 35, 51} and scores in sensible ranges. |
| exercises/l-ml-5-1.json | accuracy | medium | Checks required exact cluster sizes [41, 79, 129, 149] and a highest churn rate of 0.7907 ± 0.001. | Cluster sizes are now compared with a fresh scaled `KMeans(4, n_init=10, random_state=42)` fit, churn rates with `groupby(labels)`, with a 0.7–0.9 range for the highest rate. The PCA tolerance went from 0.002 to 0.005. |
| exercises/l-ml-3-2.json | accuracy | low | `leafy.get_n_leaves() == 13` was hard-coded. | Compared with a fresh `DecisionTreeClassifier(min_samples_leaf=20, random_state=42)` fit. |
| exercises/l-ml-5-4.json | accuracy | low | Exact flag count (218) and consumer recall ± 0.001. Both hinge on probabilities at the 0.5 boundary. | ±2 flags, recall ± 0.01. |
| lessons/l-ml-3-4.en/.ar.md | accuracy | low | Said the logistic regression's "top-20 call list" in lesson 3-1 was so accurate. That lesson shows a top-10 list. | "top-10 list". |
| lessons/l-ml-4-1.en/.ar.md | accuracy | low | Boosting's CV ROC AUC (0.787) was described as "around 0.78". | "around 0.79". |
| lessons/l-ml-2-4.en/.ar.md | accuracy | low | Lasso keeps one correlated feature "at random". Coordinate descent is deterministic. | "somewhat arbitrarily" / باعتباطية إلى حدّ ما. |
| exercises/l-ml-2-1.en/.ar.json | accuracy | low | "slightly better than all ten features". True for R²/RMSE, but MAE is 42.2 against 41.5 for the full model. | "a slightly higher R² than all ten features reach on this split (0.49)". |
| assessments.en/.ar.yaml | accuracy | low | Final Q4: `best_score_` was described as "computed on the training folds". | "computed on validation folds carved from the training data, not on the test set". |
| lessons/l-ml-5-5.en/.ar.md | accuracy | low | The held-out comparison was said to measure "the effect of model plus offer". It measures the offer's effect on the customers the model selects. | Reworded in both languages. |
| lessons/l-ml-5-1.en/.ar.md | pedagogy | low | "k-means assumes round, similar-size clusters, which is why it suits behavioural segments" is a non-sequitur. | "…an assumption that is usually good enough for behavioural segments". |
| lessons/l-ml-3-1.en/.ar.md | pedagogy | low | Quiz distractor read "3.6 times more than spend in dollars per dollar". | "Each extra day of recency matters about 3.6 times as much as each extra dollar of spend", which is the per-unit misreading the why refutes. |
| lessons/l-ml-1-3.ar.md | arabic | medium | خصائص meant "attributes" (`classes_`, …) while lesson 1-1 glosses features as الخصائص. | Attributes are now سمات (attributes), matching السمات الحسّاسة in 5-4. |
| l-ml-3-1, 3-4, 5-1, 5-4, 5-5, 1-1 .ar.md; assessments.ar.yaml; exercises/l-ml-4-4.ar.json | arabic | medium | "The business" was rendered أصحاب العمل ("employers", 4×) or العمل ("work") in about ten places. | Now الشركة / أصحاب القرار في الشركة / الفرق المعنية في الشركة / قرار تجاري / المقياس التجاري as context requires. |
| lessons/l-ml-5-4.ar.md, assessments.ar.yaml | arabic | medium | "Flag rate" was rendered نسبة التعليم, which reads as "education rate". | نسبة العملاء المُعلَّمين (flag rate), consistent with the course's مُعلَّم for "flagged". |
| lessons/l-ml-2-2.ar.md | arabic | low | مصفوفة (the course's word for "array") was used to mean "laid out". | مرتّبةً. |
| lessons/l-ml-2-3.ar.md | arabic | low | "كم سرعان ما يتحوّل" is ungrammatical, and يتضاعف ("doubles") stood for "grows". | "كيف يتحوّل … سريعًا" / يتزايد. |
| lessons/l-ml-4-3.ar.md | arabic | low | Agreement: "يؤتي تسمية خطواتك ثماره". | "تؤتي تسميةُ خطواتك ثمارها". |
| lessons/l-ml-5-5.ar.md | arabic | low | Repeated word "مثل عرض عرض استبقاء". | "مثل إظهار عرض استبقاء". |
| lessons/l-ml-3-5.ar.md | arabic | low | Redundant "لتوقّع الإيرادات المتوقعة". | "لتقدير الإيرادات المتوقعة". |
| lessons/l-ml-5-1.ar.md, exercises/l-ml-5-1.ar.json | arabic | low | The segment name العرَضيون المنقطعون sounded unnatural. | العابرون الغائبون (both files). |
| exercises/l-ml-4-4.ar.json | arabic | low | The prompt read awkwardly ("notebook الانقطاع الخاص بزميلك"), the explanation phrase "فتُحسب الوسيطات وصفوف الاختبار … مشمولة فيها" was clumsy, and "feature" had feminine agreement. | Rewritten naturally; feature is masculine, as elsewhere in the course. |
| lessons/l-ml-5-4.ar.md | arabic | low | Quiz why "التعليم هنا يعني تلقّي عرض". | "أن يُعلَّم العميل هنا يعني أن يتلقّى عرضًا". |

Totals: 25 issues. Accuracy 12 (1 high, 3 medium, 8 low), pedagogy 2 (low), Arabic 11 (3 medium, 8 low). Every English fix was mirrored in the Arabic.

## Verification

- `node scripts/content/validate.mjs ml-crash-course`: 0 errors, 0 warnings.
- `node scripts/content/check-exercises.mjs ml-crash-course`: 20 runnable exercises, 0 problems. Every solution passes and every starter fails.

## Not fixed or not fully verified

- **scikit-learn 1.7 not run locally.** The venv has 1.9.1, no 1.7 wheel is cached, and I didn't download one. The checks in 4-3, 5-1, 3-2 and 5-4 no longer depend on exact version-specific numbers. Other exercises still compare with fixed values, but those come from deterministic algorithms that are stable across 1.7–1.9: tree and k-NN accuracies of 0.73/0.72 within ±0.005, Lasso with 30 zeros, the breast-cancer confusion matrix. Prose numbers could differ in the last digit on Pyodide in rare cases (HistGradientBoosting, MLP). It would be worth one in-browser smoke run of the 4-3, 5-1 and 2-4 exercises.
- **Accuracy terminology.** The Arabic mixes "الـ accuracy" and الدقة for accuracy. Lesson 1-3 glosses accuracy as الدقة, precision always stays in English, and there's no collision, so I left it.
- **Arabic numerals with counted nouns** (for example "4,810 معاملًا") follow common tech-writing practice rather than strict number agreement. I left them as they are.
