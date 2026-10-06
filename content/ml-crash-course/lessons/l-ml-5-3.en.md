---
summary: Explain what a large language model and an embedding are, compare texts with cosine similarity, and decide when an LLM, embeddings or a classic scikit-learn model is the right tool.
takeaways:
  - "A large language model is a transformer network pretrained to predict the next token on huge amounts of text, then tuned to follow instructions."
  - "An LLM's output is sampled text, not a calibrated probability, so it needs the same evaluation discipline as any model: a labelled test set and a baseline."
  - "An embedding model maps a text to a fixed-length vector so that texts with similar meaning land close together; cosine similarity measures how close."
  - "Embeddings turn unstructured text into features that classic tools (k-NN, logistic regression, k-means) can use."
  - "For tabular predictions such as churn, scikit-learn models stay cheaper, faster and easier to validate; LLMs and embeddings earn their place on text."
further:
  - title: "Feature extraction from text"
    url: https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction
  - title: cosine_similarity
    url: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html
quiz:
  - q: "What is a large language model fundamentally trained to do during pretraining?"
    options:
      - text: Look up answers in a database of verified facts.
        why: LLMs don't consult a fact database by default; they generate text from patterns learned in their weights.
      - text: Classify documents into a fixed set of topics.
        why: Classification can be done with an LLM, but it isn't the pretraining objective.
      - text: Translate between languages only.
        why: Translation is one emergent ability, not the training objective.
      - text: Predict the next token of text, over and over, on a huge corpus.
        why: Correct. Instruction following and chat behaviour come from further tuning on top of that.
    answer: 3
  - q: "TF-IDF gives 'My parcel never arrived' and 'The package did not show up' a cosine similarity of 0. An embedding model gives them about 0.9. Why the difference?"
    options:
      - text: TF-IDF only matches shared words, and these two share none; embeddings place texts by meaning.
        why: Correct. Synonyms and paraphrases are exactly where embeddings beat word counts.
      - text: TF-IDF is broken for short texts.
        why: It works as designed; it just has no notion that 'parcel' and 'package' mean the same thing.
      - text: The embedding model memorised these two sentences.
        why: Embedding models generalise from training on huge text collections; they don't need to have seen these exact sentences.
    answer: 0
  - q: "Cartwheel wants to predict churn from the eight numeric columns. A colleague suggests sending each customer's row to an LLM and asking 'will they churn?'. What's the strongest objection?"
    options:
      - text: LLMs can't read numbers.
        why: They can read numbers in text; the problems are calibration, cost and validation, not reading.
      - text: It would be less accurate than any baseline by definition.
        why: Nothing guarantees that; you'd have to measure. The point is you'd pay more for something no better validated.
      - text: The task already has labelled tabular data, where a scikit-learn model is cheaper, faster, testable and gives real probabilities.
        why: Correct. Use the tool that fits the data; an LLM adds cost and uncertainty with no clear gain here.
      - text: LLMs are only allowed for chat applications.
        why: There's no such rule; LLMs are used for many tasks. The question is fit, not permission.
    answer: 2
---

Large language models have changed what software can do with text, and every data team now gets asked "can't we just use an LLM for this?". Sometimes the answer is yes. Often it's "for part of it". To answer well, you need an accurate picture of what LLMs and embeddings are, and that picture is built from ideas you've used all course.

## What an LLM is

A **large language model** is a neural network, almost always a **transformer**, trained on an enormous amount of text with one objective: given the text so far, predict the next **token** (a word or a piece of a word). That's **pretraining**. Done at sufficient scale, next-token prediction forces the network to absorb grammar, facts, styles and a surprising amount of reasoning-like behaviour, because all of it helps predict what comes next.

A pretrained model then gets further training to follow instructions and to give helpful, safe answers, usually with human-written examples and human or AI preference feedback. When you send it a prompt, it computes a probability for every possible next token, picks one (with some randomness, controlled by a **temperature** setting), appends it, and repeats.

Three consequences matter for a data scientist:

- **The output is generated text, not a measured probability.** If you ask "how likely is this customer to churn?" and it says "70%", that number hasn't been calibrated against outcomes the way `predict_proba` was in section 3.
- **It can be confidently wrong.** Fluency isn't accuracy. Anything you build on an LLM needs a labelled test set and a baseline, exactly like a churn model.
- **It costs per call** in money and latency, and it may send data outside your systems. A logistic regression scores a million customers in under a second on a laptop.

## Embeddings: text as coordinates

The more quietly useful idea is the **embedding**. An embedding model reads a piece of text and returns a fixed-length vector, often several hundred to a few thousand numbers, arranged so that texts with similar meaning get nearby vectors. Cartwheel's support tickets become rows of numbers, and everything you know about rows of numbers applies.

:::figure Texts with similar meaning sit close together in embedding space
<svg viewBox="0 0 640 280" role="img" aria-labelledby="t1">
  <title id="t1">A two-dimensional sketch of embedding space. Delivery complaints cluster in one corner, billing complaints in another, and an address-change question sits apart. A new ticket about a missing parcel lands next to the delivery cluster.</title>
  <rect class="d-box" x="20" y="20" width="600" height="240" rx="12"/>
  <circle class="d-dot" cx="120" cy="80" r="7"/><circle class="d-dot" cx="150" cy="105" r="7"/>
  <text class="d-label" x="165" y="78">parcel never arrived</text>
  <text class="d-label" x="165" y="112">package did not show up</text>
  <circle class="d-dot" cx="460" cy="190" r="7"/><circle class="d-dot" cx="490" cy="215" r="7"/>
  <text class="d-label" x="300" y="182">charged twice</text>
  <text class="d-label" x="310" y="235">refund duplicate payment</text>
  <circle class="d-dot" cx="420" cy="70" r="7"/>
  <text class="d-label" x="435" y="75">change delivery address</text>
  <rect class="d-box-warn" x="92" y="138" width="14" height="14"/>
  <text class="d-label-strong" x="114" y="152">new: "where is my order?"</text>
  <path class="d-arrow" d="M105 138 L128 112" marker-end="url(#arrow)"/>
</svg>
:::

Closeness is measured with **cosine similarity**: the cosine of the angle between two vectors, 1 for the same direction, near 0 for unrelated. Compare that with the word-count features scikit-learn can build on its own:

```python run
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

tickets = ["My parcel never arrived", "The package did not show up",
           "I was charged twice for one order", "Refund the duplicate payment please",
           "How do I change my delivery address"]

tfidf = TfidfVectorizer().fit_transform(tickets)
print("TF-IDF similarity of ticket 0 to the others:", cosine_similarity(tfidf)[0].round(2))

# Illustrative 4-number "embeddings" (real ones come from an embedding model and are far longer)
emb = np.array([[0.90, 0.10, 0.00, 0.20], [0.85, 0.15, 0.05, 0.10],
                [0.05, 0.90, 0.10, 0.00], [0.10, 0.85, 0.20, 0.05],
                [0.30, 0.00, 0.10, 0.90]])
print("embedding similarity of ticket 0 to the others:", cosine_similarity(emb)[0].round(2))
```

TF-IDF counts shared words. "Parcel never arrived" and "package did not show up" share none, so it scores them 0, yet it links ticket 0 to the address question because both contain "my". Embeddings score the two delivery complaints as near-identical. The vectors here are hand-made to show the idea; a real embedding model produces this behaviour from its training, for texts it has never seen.

:::mistake Treating an LLM answer as a measurement
Asking a chat model to score 500 customers "from 0 to 100 for churn risk" gives you numbers that look like model output but have never been checked against outcomes. Before any LLM-produced label or score drives a decision, compare it with ground truth on a held-out sample and with a simple baseline. The workflow from section 1 applies unchanged.
:::

## Where each tool fits at Cartwheel

| Task | Good fit | Why |
|---|---|---|
| Predict churn from customer facts | scikit-learn on the table | Labelled tabular data, needs calibrated, cheap, testable scores |
| Route support tickets to teams | Embeddings + logistic regression, or an LLM | Text input; embeddings make it a classic classifier |
| Find tickets similar to a new one | Embeddings + nearest neighbours | Similarity search is what embeddings are for |
| Summarise a week of complaints for a manager | An LLM | Free-form text output; a person reviews it |
| Add "complaint topic" as a churn feature | Embeddings → k-means, or an LLM label | Turns text into a column the churn model can test |

The last row is where the two worlds meet. Text becomes a feature; cross-validation decides whether it helps. Nothing about the discipline changes because the feature came from a large model.

:::tip Start from the data type
Tables of facts: scikit-learn. Free text you need to search, group or classify: embeddings first, because they're cheap and slot into tools you know. Text you need to generate, or tasks with no labelled data at all: an LLM, evaluated against a sample you labelled yourself.
:::

Whichever model you ship, it will make decisions about people. Next lesson asks whether those decisions are equally good for everyone, and what to watch after launch.
