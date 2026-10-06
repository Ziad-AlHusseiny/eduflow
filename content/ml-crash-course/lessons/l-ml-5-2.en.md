---
summary: Explain what layers, activations, epochs and backpropagation are, train a small neural network with MLPClassifier, and judge honestly when deep learning beats simpler models.
takeaways:
  - "A neuron computes a weighted sum of its inputs plus a bias and passes it through an activation function such as ReLU; a layer is many neurons side by side."
  - Without non-linear activations, any stack of layers collapses into a single linear model.
  - "Training repeats forward pass, loss, backpropagation (gradients for every weight) and an optimiser step; one pass over the training data is an epoch."
  - "`MLPClassifier` is a small fully connected network for tabular-sized problems; real deep learning uses PyTorch, Keras or JAX on GPUs."
  - Neural networks shine on large amounts of raw, unstructured data such as images, audio and text; on small tables, linear models and boosted trees usually match or beat them.
further:
  - title: "Neural network models (supervised)"
    url: https://scikit-learn.org/stable/modules/neural_networks_supervised.html
  - title: MLPClassifier
    url: https://scikit-learn.org/stable/modules/generated/sklearn.neural_network.MLPClassifier.html
quiz:
  - q: "Why do neural networks need non-linear activation functions between layers?"
    options:
      - text: They make training faster on GPUs.
        why: Speed isn't the reason; the reason is what the network can represent at all.
      - text: They keep the outputs between 0 and 1.
        why: That's only true of some activations (sigmoid); ReLU outputs can be any non-negative number.
      - text: They stop the weights from growing too large.
        why: That's regularisation's job (`alpha` in `MLPClassifier`), not the activation's.
      - text: Without them, several linear layers multiply out to one linear function, so depth adds nothing.
        why: Correct. The non-linearity is what lets stacked layers model curves and interactions.
    answer: 3
  - q: "A network trains on 1,347 images with `max_iter=500`, and `n_iter_` reports 164. What happened?"
    options:
      - text: Training stopped after 164 epochs because the loss stopped improving by more than the tolerance.
        why: Correct. For the `adam` and `sgd` solvers, `max_iter` caps the number of epochs, and training stops early once progress stalls.
      - text: It saw only 164 of the 1,347 images.
        why: An epoch is a full pass over all training rows; each of the 164 epochs used every image.
      - text: It crashed at epoch 164 and kept the last good weights.
        why: Stopping early is normal convergence, not a crash; a failure to converge would raise a `ConvergenceWarning` at 500.
    answer: 0
  - q: "On the churn table, a small MLP reaches CV ROC AUC 0.79 while logistic regression reaches 0.81. What's the most sensible reading?"
    options:
      - text: The MLP needs more layers; deep learning always wins with enough depth.
        why: With 298 rows and eight features, extra capacity mostly adds variance. Depth isn't free.
      - text: On a small table of informative features, a simple model is hard to beat; the network adds complexity without signal to use.
        why: Correct. Networks earn their keep when there's a lot of data and raw inputs whose features are hard to design by hand.
      - text: Neural networks can't be used for binary classification.
        why: They handle binary classification routinely; the issue is data size and type.
    answer: 1
---

"Deep learning" gets used as a synonym for AI, and it powers image recognition, speech-to-text and the large language models in the next lesson. Underneath, it's built from pieces you already know: weighted sums like linear regression, a squashing function like the sigmoid, and gradient descent. This lesson assembles them, trains a small network, and then puts it next to logistic regression to see what it's really worth.

## From one neuron to a network

A **neuron** does what logistic regression does without the final squash: multiply each input by a weight, add them up, add a bias. Then it applies an **activation function**. The most common is **ReLU**, which outputs the sum if it's positive and 0 otherwise. A **layer** is a set of neurons that all read the same inputs, each with its own weights. A **network** stacks layers: the outputs of one become the inputs of the next.

:::figure A small fully connected network
<svg viewBox="0 0 640 300" role="img" aria-labelledby="t1">
  <title id="t1">Three input nodes connect to every one of four hidden nodes, which connect to every one of three output nodes. Hidden nodes apply ReLU; outputs apply softmax to give class probabilities.</title>
  <text class="d-label-strong" x="90" y="24" text-anchor="middle">inputs</text>
  <text class="d-label-strong" x="320" y="24" text-anchor="middle">hidden layer (ReLU)</text>
  <text class="d-label-strong" x="550" y="24" text-anchor="middle">outputs (softmax)</text>
  <g class="d-line">
    <path d="M110 90 L300 60 M110 90 L300 125 M110 90 L300 190 M110 90 L300 255"/>
    <path d="M110 155 L300 60 M110 155 L300 125 M110 155 L300 190 M110 155 L300 255"/>
    <path d="M110 220 L300 60 M110 220 L300 125 M110 220 L300 190 M110 220 L300 255"/>
    <path d="M340 60 L530 90 M340 60 L530 155 M340 60 L530 220"/>
    <path d="M340 125 L530 90 M340 125 L530 155 M340 125 L530 220"/>
    <path d="M340 190 L530 90 M340 190 L530 155 M340 190 L530 220"/>
    <path d="M340 255 L530 90 M340 255 L530 155 M340 255 L530 220"/>
  </g>
  <circle class="d-box" cx="90" cy="90" r="20"/><circle class="d-box" cx="90" cy="155" r="20"/><circle class="d-box" cx="90" cy="220" r="20"/>
  <circle class="d-box-primary" cx="320" cy="60" r="20"/><circle class="d-box-primary" cx="320" cy="125" r="20"/><circle class="d-box-primary" cx="320" cy="190" r="20"/><circle class="d-box-primary" cx="320" cy="255" r="20"/>
  <circle class="d-box-accent" cx="550" cy="90" r="20"/><circle class="d-box-accent" cx="550" cy="155" r="20"/><circle class="d-box-accent" cx="550" cy="220" r="20"/>
  <text class="d-label-muted" x="430" y="290" text-anchor="middle">every line is one weight</text>
</svg>
:::

The activation is the whole trick. Without it, a layer is a linear function, and a linear function of a linear function is still linear: ten layers would be no more powerful than one logistic regression. With ReLU in between, each layer can bend and combine what the previous one produced, so the network can represent curves and interactions you never wrote down. In effect, the hidden layers **learn their own features**.

For classification, the output layer has one neuron per class and a **softmax**, which turns the outputs into probabilities that sum to 1, the multi-class cousin of the sigmoid.

## How a network learns

Training repeats four steps:

1. **Forward pass**: run a batch of examples through the network to get predictions.
2. **Loss**: measure how wrong they are, with log loss for classification.
3. **Backpropagation**: compute the gradient of the loss with respect to every weight, working backwards from the output layer with the chain rule.
4. **Optimiser step**: nudge every weight against its gradient. `adam`, the default, is gradient descent with a per-weight adaptive learning rate.

One pass through the whole training set is an **epoch**. Training runs for many epochs, and you watch the loss fall exactly as it did in your hand-written gradient descent in section 2, just across thousands of weights instead of two.

## A network on handwritten digits

The digits dataset holds 1,797 images of handwritten digits, each 8×8 pixels flattened into 64 numbers. scikit-learn's `MLPClassifier` (multi-layer perceptron) is a small fully connected network.

```python run
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_digits(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

net = make_pipeline(StandardScaler(),
                    MLPClassifier(hidden_layer_sizes=(64,), max_iter=500, random_state=42))
net.fit(X_train, y_train)
mlp = net[-1]
print("weight matrices:", [w.shape for w in mlp.coefs_])
print("parameters:", sum(w.size for w in mlp.coefs_) + sum(b.size for b in mlp.intercepts_))
print("epochs run:", mlp.n_iter_, "| loss first, 10th, last:",
      [round(float(mlp.loss_curve_[i]), 3) for i in (0, 9, -1)])
print("network test accuracy: ", round(net.score(X_test, y_test), 3))

linear = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)).fit(X_train, y_train)
print("logistic test accuracy:", round(linear.score(X_test, y_test), 3))
```

One hidden layer of 64 neurons means two weight matrices: 64×64 from pixels to hidden units and 64×10 from hidden units to digits, 4,810 parameters with the biases. The loss falls from 2.31 (a uniform guess over ten classes) to under 0.01, and training stops on its own after 164 epochs because the improvement has stalled. Test accuracy: 98%.

And logistic regression? Also about 98%. On 8×8 images with a few hundred examples per class, a straight boundary is already enough. The network's extra power has almost nothing to work on. Try it on churn and the result is the same, slightly worse: around 0.79 ROC AUC against 0.81 for logistic regression.

:::mistake Expecting a neural network to beat everything
Networks have more parameters than rows in many tabular datasets, need scaled inputs, and are sensitive to settings (layer sizes, learning rate, `alpha` for L2 regularisation, epochs). On small or medium tables with designed features, regularised linear models and gradient boosting are usually as good and far easier to run and explain. Reach for deep learning when the data is large and raw.
:::

## Where deep learning wins

The networks behind modern AI differ from `MLPClassifier` in scale and in architecture. **Convolutional networks** reuse the same small filters across an image, so they learn edges, then shapes, then objects. **Transformers**, behind today's language models, let every word in a text weigh every other word. Both are trained on millions or billions of examples, on GPUs, with libraries such as PyTorch, Keras or JAX, not scikit-learn.

What they share with your 4,810-weight network is everything conceptual: layers, activations, a loss, backpropagation, epochs, overfitting, a validation set. When a deep learning paper says "we trained for 20 epochs with early stopping on validation loss", you now know what every word means.

:::tip When to switch tools
If your inputs are pixels, audio samples or raw text, or you have hundreds of thousands of labelled examples, it's time for a deep learning framework or, increasingly, a pretrained model you adapt. If your inputs are a table of customer facts, stay with scikit-learn.
:::

Pretrained models are the bridge between the two worlds, and the most visible of them are large language models. Next lesson explains what they do, how embeddings turn text into the kind of vectors you've been feeding models all course, and where they fit next to a churn model.
