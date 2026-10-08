// Course content. Add a module = add an object; every page renders from this list.
// Section `w` mounts an interactive widget (js/widgets/index.js). `[[id]]` cites js/data/refs.js.
// All examples use digital-analytics scenarios (visitors, campaigns, customers) with synthetic data.
export const MODULES = [
  { id: 'foundations', n: 1, title: 'Foundations of Machine Learning', level: 'Beginner', mins: 35,
    blurb: 'What machine learning is, how data is organised, and the habits that make results trustworthy.',
    sections: [
      { id: 'what', h: 'What is machine learning?', html: `<p>A program learns from experience <i>E</i> on a task <i>T</i> if its performance <i>P</i> at <i>T</i> improves with <i>E</i>.[[mitchell]] In practice: you give an algorithm many past examples, it finds patterns, and you use those patterns to make predictions about cases it has not seen.</p>
        <p>The example we follow through this course: <b>predict whether a website visitor will convert</b>, using what we know about their session.</p>
        <h3>Traditional analytics vs machine learning</h3>
        <div class="tbl"><table><thead><tr><th></th><th>Traditional analytics</th><th>Machine learning</th></tr></thead><tbody>
        <tr><td>Question</td><td>What happened?</td><td>What will probably happen?</td></tr>
        <tr><td>Rules come from</td><td>An analyst writes them (“bounce rate &gt; 70% is bad”)</td><td>The algorithm learns them from data</td></tr>
        <tr><td>Output</td><td>Reports and dashboards</td><td>Predictions for individual cases</td></tr>
        <tr><td>Example</td><td>Conversion rate last month was 3.1%</td><td>This visitor has a 72% chance to convert</td></tr></tbody></table></div>
        <p>They work together: analytics tells you what to measure; machine learning turns those measurements into forecasts.</p>` },
      { id: 'data', h: 'Dataset, rows and columns', html: `<p>A <b>dataset</b> is a table. Each <b>row</b> is one example (a visitor session). Each <b>column</b> is one attribute measured for every row. A single value is a <b>cell</b>. Almost every algorithm in this course takes such a table as input.[[3b1b-la]]</p>
        <h3>Numerical vs categorical data</h3>
        <ul><li><b>Numerical:</b> quantities you can add and average, such as session duration or revenue.</li><li><b>Categorical:</b> labels from a fixed set, such as device (mobile, desktop, tablet) or converted (yes, no).</li></ul>
        <p>The distinction matters: algorithms treat the two kinds differently, and the type of the thing you want to predict decides which family of model to use.</p>`, w: 'structure' },
      { id: 'ft', h: 'Features vs target', html: `<p><b>Features</b> are the input columns the model may look at. The <b>target</b> is the one column you want it to predict. Pick the target for the question you are asking; every other sensible column becomes a feature. Identifier columns (visitor ID) only name a row and are left out.</p>
        <p>Try it: click different columns and watch how the task changes. “No target” is the unsupervised case described next.</p>`, w: 'selector' },
      { id: 'kinds', h: 'Supervised, unsupervised and reinforcement learning', html: `<ul><li><b>Supervised learning:</b> every training example has a known answer (the target). The model learns the mapping from features to answer. Most business prediction is supervised.[[esl]]</li>
        <li><b>Unsupervised learning:</b> there is no target. The algorithm looks for structure by itself, for example groups of similar customers.</li>
        <li><b>Reinforcement learning (brief):</b> an agent takes actions and learns from rewards and penalties over time, like a system that learns which ad to show by observing clicks. It is powerful but needs a different setup, so we only mention it here.</li></ul>
        <h3>Classification vs regression vs clustering</h3>
        <ul><li><b>Classification</b> (supervised): predict a category. <i>Will this visitor convert: yes or no?</i></li><li><b>Regression</b> (supervised): predict a number. <i>How much revenue will this campaign bring?</i></li><li><b>Clustering</b> (unsupervised): find groups. <i>Which natural segments exist among our customers?</i></li></ul>` },
      { id: 'split', h: 'Training, validation and test data', html: `<p>If you grade a model on the same data it learned from, you only measure memory. So the data is divided:</p>
        <ul><li><b>Training data:</b> what the model learns from.</li><li><b>Validation data:</b> used while building, to compare settings or models and choose between them.</li><li><b>Test data:</b> locked away until the end, used once for the final honest score.[[mlcc]]</li></ul>
        <p><b>Why evaluate on unseen data?</b> Because the real goal is predicting <i>tomorrow's</i> visitors, whom the model has never met. A model that scores 99% on data it studied but 70% on new data is not a good model. Drag the sliders to see the trade-off between a bigger training set and a reliable test set.</p>`, w: 'split' },
      { id: 'flow', h: 'The ML workflow', html: `<p>Every project, from a simple regression to a large neural network, follows the same loop. Step through it with a digital-analytics example, then we will expand it to the full 13-step version in Module 6.</p>`, w: 'workflow' }
    ],
    takeaways: ['A dataset is a table: rows are examples, columns are attributes.', 'Features are inputs; the target is what you predict. IDs are neither.', 'Supervised learning has a target (classification or regression); unsupervised has none (clustering).', 'Train to learn, validate to choose, test once to report. Always evaluate on unseen data.', 'Every project follows the same workflow: question, data, split, train, evaluate, act.'],
    quiz: [
      { q: 'You want to predict whether a visitor will purchase. Which column is the target?', o: ['Session duration', 'Purchased (yes / no)', 'Visitor ID'], a: 1, why: 'The target is the outcome you want to predict, the “purchased” column. Duration is a feature and the ID is just a label.' },
      { q: 'Which of these is a feature?', o: ['The number of pages viewed in the session', 'The answer you are trying to predict', 'Nothing: features are only for charts'], a: 0, why: 'Features are the input attributes the model uses. Pages viewed is known during the session.' },
      { q: 'A dataset has no outcome column and you want to discover groups of similar customers. This is…', o: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning'], a: 1, why: 'Without a target the algorithm can only look for structure, which is unsupervised learning.' },
      { q: 'Predicting next month’s revenue in pounds is which task?', o: ['Classification', 'Regression', 'Clustering'], a: 1, why: 'The target is a number, so it is regression. Classification predicts categories; clustering finds groups.' },
      { q: 'Predicting “will churn / will stay” is which task?', o: ['Regression', 'Clustering', 'Classification'], a: 2, why: 'The target is one of two categories, so it is binary classification.' },
      { q: 'Which dataset should be used to report your model’s final score?', o: ['Training data', 'Test data', 'Any data: they are equivalent'], a: 1, why: 'Only the test data is untouched during learning and tuning, so it gives an honest estimate.' },
      { q: 'Why can a model score 99% on training data and still be poor?', o: ['It may have memorised the training data and fail on new data', 'Scores above 90% are always wrong', 'Training data is always incorrect'], a: 0, why: 'High training scores can come from memorisation. Only unseen data shows whether it generalises.' }
    ],
    further: ['ngml', 'isl', 'mlcc', 'glossary', 'kaggleintro', 'ga4pred'] },

  { id: 'regression', n: 2, title: 'Regression for Digital Analytics', level: 'Beginner', mins: 45,
    blurb: 'Predict numbers such as revenue and clicks, and learn to measure how wrong a prediction is.',
    sections: [
      { id: 'what', h: 'What is regression, and when to use it', html: `<p><b>Regression</b> predicts a <b>numerical target</b>. Use it when the answer is “how much?” or “how many?”, not “which category?”. The inputs are the <b>independent variables</b> (features); the thing predicted is the <b>dependent variable</b> (target), because its value depends on the inputs.</p>
        <p>Digital analytics uses: <b>revenue prediction</b>, <b>campaign click prediction</b>, <b>conversion volume prediction</b> and <b>session duration prediction</b>.</p>` },
      { id: 'line', h: 'Simple linear regression', html: `<p>With one feature, regression fits a straight <b>regression line</b>: <code>predicted revenue = intercept + slope × ad spend</code>. The slope says how much revenue changes for each extra £1k of spend.[[sklinear]] Using the line is straightforward: pick an ad spend, read off the <b>prediction</b>.</p>
        <h3>Actual vs predicted, and the error</h3>
        <p>For any known case, the <b>actual value</b> is what really happened and the <b>predicted value</b> is what the line says. The gap, <code>residual = actual − predicted</code>, is the <b>prediction error</b>. The best line is the one that makes these errors small overall.</p>
        <p><b>Interactive lab:</b> drag the points and watch the line and errors update, then enter a new campaign's ad spend to get a prediction. Type an actual revenue to see the error.</p>`, w: 'regline' },
      { id: 'train', h: 'How a model is trained (gradient descent)', html: `<p><b>Training</b> means searching for the line that makes the total error smallest. One beginner-friendly way is <b>gradient descent</b>: start with a poor guess, check how wrong it is, nudge the line in the direction that reduces the error, and repeat. It is like walking downhill in fog by always stepping where the ground slopes down.[[statquest]] The size of each step is the <b>learning rate</b>: too small is slow, too large overshoots and gets worse. No calculus is needed to use it; try the presets.</p>`, w: 'gd' },
      { id: 'fit', h: 'Underfitting and overfitting (introduction)', html: `<p>A straight line through data that is really curved is <b>underfitting</b>: the model is too simple and misses the pattern. At the other extreme, a very flexible model that bends to hit every training point is <b>overfitting</b>: it memorises noise and predicts new data badly.[[biasvar]] We explore this properly in Module 6.</p>` },
      { id: 'eval', h: 'Regression evaluation: MAE, MSE, RMSE and R²', html: `<p>Compute the residual for every test case, then summarise:</p>
        <ul><li><b>MAE</b> (mean absolute error): the average size of the miss, in the target's own units. “On average we are £800 off.” Easy to explain.</li>
        <li><b>MSE</b> (mean squared error): the average of squared misses. Squaring punishes large errors heavily, but the unit is squared (£²), which is hard to read.</li>
        <li><b>RMSE</b>: the square root of MSE, back in £. It is never smaller than MAE; a big gap between them means a few large mistakes.</li>
        <li><b>R²</b>: the share of the variation in the target that the model explains. 1 is perfect, 0 is no better than always predicting the average, and it can be negative for a bad model.[[skmetrics]]</li></ul>
        <p>Always compute these on the <b>test</b> data, never on the data the model trained on.</p>` },
      { id: 'proj', h: 'Mini project: predict campaign revenue', html: `<p><b>Goal:</b> predict a campaign's revenue from its <b>ad spend, visitors and engagement</b>. The widget trains on 70% of 80 past campaigns and scores on the other 30%.</p>
        <ol><li>Start with all three features. Note MAE, RMSE and R².</li><li>Untick features one at a time. Which one hurts R² the most?</li><li>Set the “New campaign” sliders and read the predicted revenue.</li></ol>
        <p>Think: how large is the typical error compared with the budget decisions you would make from this?</p>`, w: 'revenue' }
    ],
    takeaways: ['Regression predicts a number; classification predicts a category.', 'A regression line turns an input into a prediction; the residual is actual − predicted.', 'Training searches for parameters that reduce error. Gradient descent does this by repeated downhill steps.', 'MAE is the average miss; RMSE punishes big misses; R² is the share of variation explained.', 'Evaluate on unseen test data.'],
    quiz: [
      { q: 'Which target needs regression rather than classification?', o: ['Whether a visitor converts', 'Daily revenue in pounds', 'The device type'], a: 1, why: 'Revenue is a number. The other two are categories.' },
      { q: 'A campaign was predicted to earn £10,000 but earned £10,800. The residual is…', o: ['−£800', '+£800', '£10,000'], a: 1, why: 'Residual = actual − predicted = 10,800 − 10,000 = +800.' },
      { q: 'MAE is £500. How do you read it?', o: ['The model is 500% wrong', 'Predictions are off by about £500 on average', 'The model explains 500 observations'], a: 1, why: 'MAE is the average absolute miss in the target’s units.' },
      { q: 'RMSE is much larger than MAE. What does that suggest?', o: ['A few large errors', 'A perfect model', 'Too few features'], a: 0, why: 'Squaring emphasises big mistakes, so RMSE ≫ MAE signals some large misses.' },
      { q: 'R² = 0.82 means…', o: ['82% of predictions are exactly right', 'The model explains about 82% of the variation in the target', 'The error is 82 pounds'], a: 1, why: 'R² measures the share of target variation explained by the model.' },
      { q: 'A straight line fits obviously curved data poorly. This is…', o: ['Overfitting', 'Underfitting', 'Leakage'], a: 1, why: 'The model is too simple to capture the pattern.' },
      { q: 'In gradient descent, a learning rate that is far too large will…', o: ['Overshoot and may make the error grow', 'Make training more accurate', 'Do nothing'], a: 0, why: 'Steps jump past the minimum; the error can increase instead of decrease.' }
    ],
    further: ['isl', 'sklinear', 'ruder', 'momentum'] },

  { id: 'classification', n: 3, title: 'Classification & Conversion Prediction', level: 'Beginner', mins: 45,
    blurb: 'Predict categories such as convert / not convert, and understand probabilities and thresholds.',
    sections: [
      { id: 'try', h: 'Try before you read: draw the boundary', html: `<p>Here are 240 past visitors. Teal dots bought; grey rings did not. <b>Can you teach a machine to guess who will buy?</b> Start by doing it by hand: drag the two handles to split buyers from non-buyers, and watch your accuracy. Then compare your line with what a trained model found.</p>`, w: 'boundary' },
      { id: 'what', h: 'What is classification?', html: `<p><b>Classification</b> predicts a <b>categorical target</b>, a label from a fixed set.</p>
        <ul><li><b>Binary classification:</b> exactly two outcomes, e.g. <i>Convert / Not convert</i>, <i>Churn / Stay</i>.</li>
        <li><b>Multi-class classification:</b> three or more outcomes, e.g. sentiment as <i>Positive / Neutral / Negative</i>.</li></ul>
        <p>Digital analytics uses: <b>conversion prediction</b>, <b>churn prediction</b>, <b>engagement prediction</b>, <b>campaign response prediction</b> and <b>sentiment classification</b>.</p>` },
      { id: 'flow', h: 'The classification workflow and its features', html: `<p>The workflow is the one from Module 1: define the question, prepare data, split, train, evaluate, predict. For visitor conversion the <b>features</b> are what is known about the session: duration, page views, ad clicks, returning or new, device and source. The <b>target</b> is “converted”.</p>` },
      { id: 'prob', h: 'Probability vs final prediction, and the threshold', html: `<p>Most classifiers first output a <b>probability</b>: “this visitor has a 72% chance to convert.” A <b>decision threshold</b> then turns it into the <b>final prediction</b>: probability ≥ threshold means “convert”. The usual threshold is 0.50, but it is a business choice, not a law:</p>
        <ul><li>A <b>low</b> threshold (0.30) flags many visitors: you catch more buyers but also waste more offers.</li><li>A <b>high</b> threshold (0.90) flags few: very few false alarms but many buyers are missed.</li></ul>` },
      { id: 'models', h: 'Three classification ideas (no heavy maths)', html: `<ul><li><b>Logistic regression:</b> weighs the features, adds them up, and squashes the result into a probability between 0 and 1. Its dividing line is straight.[[sklinear]]</li>
        <li><b>Decision tree:</b> a flowchart of yes/no questions (“more than 4 pages?”, “returning visitor?”) that ends in a prediction. Easy to explain; it produces rectangular regions.[[sktree]]</li>
        <li><b>K-Nearest Neighbors (KNN):</b> finds the K most similar past visitors and uses their outcomes (“5 of the 7 most similar visitors converted”).[[skneighbors]]</li></ul>
        <h3>Interactive classification lab</h3>
        <p>The x-axis is <b>session duration</b>, the y-axis is <b>page views</b>, and each dot is a visitor (<span class="mute">teal = converted, grey ring = not</span>). The shaded areas are the model's <b>decision boundary</b>: what it would predict for a visitor at that spot. <b>Click</b> the chart to add a new visitor, read the conversion probability, then switch model and threshold (0.30, 0.50, 0.70, 0.90).</p>`, w: 'classlab' },
      { id: 'proj', h: 'Mini project: will this visitor make a purchase?', html: `<p>Using the lab below (logistic regression only), work through these steps:</p>
        <ol><li>Place a visitor with a short visit (under 60 s, 1–2 pages). What probability do you get?</li><li>Place a visitor with a long visit and many pages. How does it change?</li><li>Set the threshold to 0.30, then 0.90. At which threshold would you show an expensive discount, and why?</li></ol>`, w: 'classlab-mini' }
    ],
    takeaways: ['Classification predicts a category: binary (two) or multi-class (three or more).', 'The model gives a probability; the threshold converts it into a decision.', 'Logistic regression, decision trees and KNN are three different ways to draw the boundary.', 'The right threshold depends on the cost of wrong decisions, not on convention.'],
    quiz: [
      { q: 'Which is a binary classification problem?', o: ['Predicting revenue', 'Predicting churn / stay', 'Grouping customers'], a: 1, why: 'Churn / stay has exactly two categories.' },
      { q: 'Classifying reviews as positive, neutral or negative is…', o: ['Binary classification', 'Multi-class classification', 'Regression'], a: 1, why: 'Three possible categories make it multi-class.' },
      { q: 'A model outputs 0.68 for a visitor. At a threshold of 0.50 the prediction is…', o: ['Not convert', 'Convert', 'Undefined'], a: 1, why: '0.68 ≥ 0.50, so the final prediction is “convert”.' },
      { q: 'The same visitor with probability 0.68 at a threshold of 0.90 is predicted…', o: ['Convert', 'Not convert', 'Both'], a: 1, why: '0.68 < 0.90, so the model does not predict convert at that stricter threshold.' },
      { q: 'You raise the threshold from 0.50 to 0.90. What usually happens?', o: ['More visitors are flagged', 'Fewer visitors are flagged', 'Nothing changes'], a: 1, why: 'Only the most confident cases remain above a higher threshold.' },
      { q: 'Which model answers by asking a series of yes/no questions?', o: ['Decision tree', 'K-Nearest Neighbors', 'Linear regression'], a: 0, why: 'A decision tree is a flowchart of questions about the features.' },
      { q: 'KNN decides a visitor’s class by…', o: ['Fitting a straight line', 'Looking at the most similar past visitors', 'Counting the columns'], a: 1, why: 'K-Nearest Neighbors uses the labels of the K closest examples.' }
    ],
    further: ['isl', 'mlcc', 'sklinear'] },

  { id: 'evaluation', n: 4, title: 'Model Evaluation & the Confusion Matrix', level: 'Intermediate', mins: 45,
    blurb: 'Measure a classifier honestly, understand its kinds of mistakes, and choose models by business cost.',
    sections: [
      { id: 'why', h: 'Why evaluation matters', html: `<p>A model is only useful if it works on new cases. Compare <b>training performance</b> (on data it learned from) with <b>test performance</b> (on unseen data). A big drop means it memorised instead of learning. Beyond that, we need to count how many predictions are <b>correct</b> and <b>incorrect</b>, and what kind of mistakes they are.</p>` },
      { id: 'cm', h: 'The confusion matrix', html: `<p>For a convert / not-convert model every visitor falls into one of four boxes:</p>
        <ul><li><b>True Positive (TP):</b> predicted convert, did convert. A buyer caught.</li><li><b>True Negative (TN):</b> predicted not, did not. Correctly ignored.</li>
        <li><b>False Positive (FP):</b> predicted convert, did <i>not</i>. A wasted offer.</li><li><b>False Negative (FN):</b> predicted not, but <i>did</i> convert. A valuable customer missed.</li></ul>` },
      { id: 'metrics', h: 'Accuracy, precision, recall and F1', html: `<ul><li><b>Accuracy</b> = (TP + TN) / all. The share of correct predictions.</li>
        <li><b>Precision</b> = TP / (TP + FP). When the model says “convert”, how often is it right?</li>
        <li><b>Recall</b> = TP / (TP + FN). Of all real converters, how many did it find?</li>
        <li><b>F1</b> = the harmonic mean of precision and recall; a single number that is low if either is low.[[skmetrics]]</li></ul>
        <h3>Why accuracy alone can mislead</h3>
        <p>With <b>imbalanced data</b>, where only a few visitors convert, a model that always says “not convert” scores a high accuracy and finds nobody.[[saito]] Tick “Rare buyers” in the lab to see accuracy stay high while recall collapses.</p>
        <h3>The precision / recall trade-off and the threshold</h3>
        <p>Lowering the <b>classification threshold</b> flags more visitors: recall rises (fewer FN) but precision falls (more FP). Raising it does the reverse. There is no free lunch; you choose the balance.</p>
        <p><b>Interactive confusion matrix lab:</b> 100 visitors. Move the threshold and watch TP, TN, FP, FN, accuracy, precision, recall and F1 update together.</p>`, w: 'confusion' },
      { id: 'cost', h: 'Business cost of errors', html: `<p>Mistakes rarely cost the same. Digital-analytics example: <b>predict customers likely to convert</b> and send them an offer.</p>
        <ul><li><b>False positive:</b> a customer predicted to convert who does not. You spent an offer (say £2) for nothing.</li><li><b>False negative:</b> a valuable customer the model missed. You lost a sale worth (say) £40.</li></ul>
        <p>Here a missed buyer costs far more than a wasted offer, so you would accept more false positives to reduce false negatives, which means preferring higher <b>recall</b>.</p>` },
      { id: 'compare', h: 'Comparing models', html: `<p>The widget trains <b>logistic regression</b>, a <b>decision tree</b> and <b>KNN</b> on the same training visitors and scores them on the same unseen test visitors. The ★ marks the best accuracy and the lowest business cost. <b>The highest accuracy does not automatically mean the best model</b>; the best model is the one that serves the business goal.[[skcv]]</p>
        <p><b>Mini challenge:</b> choose the best model for a marketing campaign. Set what a missed buyer is worth and what a wasted offer costs, then pick your model and see how close it is to the cheapest one.</p>`, w: 'compare' }
    ],
    takeaways: ['Always compare training and test performance.', 'The confusion matrix counts TP, TN, FP and FN; every metric comes from these four numbers.', 'Precision = right when it says yes; recall = finds the real yeses; F1 balances them.', 'Accuracy misleads on imbalanced data.', 'Threshold trades precision for recall; choose it using the business cost of each error.'],
    quiz: [
      { q: 'A predicted-to-convert visitor who does not convert is a…', o: ['True positive', 'False positive', 'False negative'], a: 1, why: 'The model said positive (convert) but the truth was negative.' },
      { q: 'A valuable converting customer the model failed to flag is a…', o: ['False positive', 'True negative', 'False negative'], a: 2, why: 'The model said negative but the truth was positive: a missed customer.' },
      { q: '90 of 100 visitors never convert. A model that says “not convert” for everyone has accuracy…', o: ['0%', '90%', '100%'], a: 1, why: 'It is right for the 90 non-converters. Yet it catches no buyers, so recall is 0%.' },
      { q: 'Precision answers which question?', o: ['Of everything flagged, how much was right?', 'Of all real buyers, how many were found?', 'How big is the dataset?'], a: 0, why: 'Precision = TP / (TP + FP): correctness among the positive predictions.' },
      { q: 'Recall answers which question?', o: ['Of everything flagged, how much was right?', 'Of all real buyers, how many were found?', 'How fast is the model?'], a: 1, why: 'Recall = TP / (TP + FN): coverage of the real positives.' },
      { q: 'You lower the threshold from 0.5 to 0.3. Typically…', o: ['Recall rises and precision falls', 'Precision rises and recall falls', 'Both rise'], a: 0, why: 'More visitors get flagged: more real buyers are caught, but more wrong flags appear too.' },
      { q: 'Missing a high-value buyer costs far more than a wasted offer. Which metric deserves more weight?', o: ['Recall', 'Precision', 'Neither'], a: 0, why: 'Recall measures how many real buyers are caught; avoiding false negatives is the priority.' },
      { q: 'Model A has the highest accuracy, Model B the lowest business cost. Which should you deploy?', o: ['A, accuracy is all that matters', 'B, it serves the business goal better', 'Neither'], a: 1, why: 'Choose by the metric that reflects the real cost of errors, not by accuracy alone.' }
    ],
    further: ['skmetrics', 'saito', 'rulesml'] },

  { id: 'clustering', n: 5, title: 'Clustering & Customer Segmentation', level: 'Intermediate', mins: 45,
    blurb: 'Discover hidden customer groups with K-Means when there is no right answer to learn from.',
    sections: [
      { id: 'what', h: 'What is clustering?', html: `<p><b>Clustering</b> sorts examples into groups so that members of a group are similar to each other and different from other groups. It is <b>unsupervised learning</b>: there is <b>no target variable</b>, so nothing tells the algorithm what the “right” groups are. It discovers <b>hidden groups</b>.[[skcluster]]</p>
        <h3>Classification vs clustering</h3>
        <ul><li><b>Classification:</b> groups are known in advance (convert / not convert) and labelled examples teach the model to assign them.</li><li><b>Clustering:</b> groups are <i>not</i> known; the algorithm proposes them and people interpret them.</li></ul>` },
      { id: 'dist', h: 'Similarity and distance', html: `<p>Clustering needs a measure of how alike two customers are. The usual one is <b>distance</b>: treat each customer as a point whose coordinates are their feature values; customers close together are similar. Because distance mixes features, they should be on the same scale (see Module 6), otherwise spend in pounds would drown out engagement in percent. The widget scales them for you.</p>` },
      { id: 'kmeans', h: 'K-Means', html: `<p><b>K-Means</b> is the most common clustering algorithm.[[skcluster]]</p>
        <ol><li>Choose <b>K</b>, the number of groups you want.</li><li>Place K <b>centroids</b> (cluster centres) at starting positions.</li><li><b>Assign</b> every customer to the nearest centroid.</li><li><b>Update</b> each centroid to the average position of its customers.</li><li>Repeat steps 3–4 until nothing changes.</li></ol>
        <p>The loop is iterative: each round makes groups tighter. The result can depend on the starting centres, so use <i>Restart</i> to see this.</p>
        <h3>Choosing K</h3>
        <p>More clusters always makes groups tighter, so the total spread keeps falling as K grows. Look for the <b>elbow</b>, where adding another cluster stops helping much, and then check that the groups make business sense.</p>
        <p><b>Interactive K-Means lab:</b> choose K (2–5), press <i>Step</i> to watch assignment and updating alternate, change the axes, and read each cluster's size and centre.</p>`, w: 'kmeans' },
      { id: 'apps', h: 'Digital analytics applications', html: `<p>Clustering supports <b>customer segmentation</b>, <b>website visitor segmentation</b>, <b>campaign audience segmentation</b> and <b>high-value customer discovery</b>. Typical features: <b>sessions</b>, <b>purchase frequency</b>, <b>average spending</b> and <b>engagement rate</b>.</p>
        <h3>Customer profiles and what to do with them</h3>
        <ul><li><b>VIP Customers:</b> high spend and frequency. Reward and retain; do not discount.</li><li><b>Engaged Browsers:</b> lots of activity, little buying. Remove barriers to a first purchase.</li><li><b>Occasional Buyers:</b> mid-level on everything. Encourage repeat purchase.</li><li><b>Low Engagement Users:</b> little of anything. Cheap win-back messaging.</li></ul>
        <p><b>Business interpretation:</b> a cluster is only useful if you can say <i>what you would do differently</i> for it. If two clusters would get the same treatment, you probably chose K too large.</p>` },
      { id: 'proj', h: 'Mini project: segment customers', html: `<p>Use the lab above on 160 customers described by visits, engagement and spending.</p>
        <ol><li>Set K = 4 and press <i>Run to finish</i>. Name each cluster using its centre values.</li><li>Switch the axes to Sessions vs Engagement. Which two groups overlap most there?</li><li>Try K = 2 and K = 5. Which K gives groups you could act on?</li><li>For each profile, write one marketing action.</li></ol>` }
    ],
    takeaways: ['Clustering is unsupervised: there is no target, only structure.', 'K-Means alternates between assigning points to the nearest centroid and moving centroids to the average.', 'K is chosen by the elbow of the spread curve and by business usefulness.', 'Clusters are interpreted by people; value comes from different actions for different groups.'],
    quiz: [
      { q: 'Clustering is a type of…', o: ['Supervised learning', 'Unsupervised learning', 'Regression'], a: 1, why: 'There is no target variable, so it is unsupervised.' },
      { q: 'In K-Means, what does K represent?', o: ['The number of clusters', 'The number of features', 'The learning rate'], a: 0, why: 'K is the number of groups you ask the algorithm to find.' },
      { q: 'What is a centroid?', o: ['The cluster’s centre (average position)', 'The largest customer', 'The target variable'], a: 0, why: 'A centroid is the average position of all points in the cluster.' },
      { q: 'What happens in the “assign” step?', o: ['Each customer joins its nearest centroid', 'Centroids are deleted', 'K is changed'], a: 0, why: 'Every point is attached to the closest centroid.' },
      { q: 'Which statement distinguishes classification from clustering?', o: ['Classification uses known labels; clustering finds groups without labels', 'They are identical', 'Clustering predicts numbers'], a: 0, why: 'Classification learns from labelled examples; clustering discovers unlabelled structure.' },
      { q: 'Total within-cluster spread always falls as K grows. So how do you pick K?', o: ['Always take the biggest K', 'Look for the elbow and check business usefulness', 'Use K = 1'], a: 1, why: 'Choose where extra clusters stop helping much and where the groups are actionable.' },
      { q: 'Customers with high spend and high frequency are best described as…', o: ['Low Engagement Users', 'VIP Customers', 'Engaged Browsers'], a: 1, why: 'High value and frequent purchasing identifies the VIP profile.' }
    ],
    further: ['isl', 'skcluster', 'mluexplain'] },

  { id: 'practical', n: 6, title: 'Overfitting, Feature Selection & Practical ML', level: 'Intermediate', mins: 60,
    blurb: 'Avoid the common traps, prepare data properly, and run a complete project end to end.',
    sections: [
      { id: 'fit', h: 'Underfitting, good fit and overfitting', html: `<ul><li><b>Underfitting:</b> the model is too simple to capture the pattern, so it does badly on both training and test data.</li><li><b>Good fit:</b> it captures the real pattern and performs similarly on training and test data.</li><li><b>Overfitting:</b> it memorises noise: very high training accuracy, much lower testing accuracy.[[biasvar]]</li></ul>
        <p>The ability to perform well on new data is called <b>generalization</b>. <b>Model complexity</b> is how flexible the model is. Higher complexity lowers training error without limit, but test error falls and then rises again, so <b>more complex is not always better</b>.</p>
        <p><b>Interactive complexity slider:</b> compare <i>Too simple</i>, <i>Good fit</i> and <i>Too complex</i>, and watch training error versus test error. Regularization (a penalty on extreme weights) calms an over-complex model.</p>`, w: 'complexity' },
      { id: 'feat', h: 'Feature selection and data leakage', html: `<p><b>Feature selection</b> means choosing which columns the model may use. <b>Relevant features</b> relate to the target and are known at prediction time. <b>Irrelevant features</b> add noise. <b>Identifier columns</b> (visitor ID, order number) are unique per row, so they cannot generalise.</p>
        <h3>Data leakage</h3>
        <p><b>Data leakage</b> is when the model gets information it would not have in real use, usually the answer itself. Classic example: <b>do not use <code>converted</code> to predict <code>converted</code></b>. The same trap hides in columns like “order_total” (only exists after purchase) or in test rows duplicated into training. Leakage gives spectacular test scores and useless real-world models.[[skpitfalls]]</p>
        <h3>Feature importance</h3>
        <p><b>Feature importance</b> shows which inputs drive predictions; here it is the size of each learned weight. It helps explain the model and spots suspicious columns (one feature dominating at near-100% accuracy is a red flag).</p>
        <p>Try it: add the identifier and the leaked column and watch what the accuracy does.</p>`, w: 'leakage' },
      { id: 'prep', h: 'Data preprocessing and encoding', html: `<p>Real data is messy. Typical fixes: <b>missing values</b> (drop the row or fill with the median / “unknown”), <b>duplicates</b> (remove), and <b>invalid values</b> (impossible numbers such as negative duration). Then models need numbers:</p>
        <ul><li><b>Numerical data</b> can be used directly, often after scaling.</li><li><b>Categorical data</b> must be encoded.</li>
        <li><b>Label encoding:</b> each category becomes an integer (UK = 0, US = 1). Only safe when the categories have a natural order.</li><li><b>One-hot encoding:</b> each category gets its own 0/1 column. Safe for unordered categories like device.</li>
        <li><b>Basic scaling:</b> put numbers on a common scale (e.g. mean 0). Essential for distance-based methods such as KNN and K-Means.[[skprep]]</li></ul>
        <p>Apply the steps below in any order and read what each does.</p>`, w: 'clean' },
      { id: 'flow', h: 'The full ML workflow', html: `<p>Putting everything together, a real project runs these 13 steps. Click through them; each has a digital-analytics example. Notice that poor evaluation sends you back to earlier steps.[[rulesml]]</p>`, w: 'workflow-full' },
      { id: 'apps', h: 'Practical digital analytics applications', html: `<ul><li><b>Conversion prediction</b> (classification): who will buy?</li><li><b>Revenue prediction</b> (regression): how much will a campaign earn?</li><li><b>Customer segmentation</b> (clustering): which groups exist?</li><li><b>Churn prediction</b> (classification): who is about to leave?</li><li><b>Sentiment analysis</b> (multi-class classification): are reviews positive, neutral or negative?</li><li><b>Engagement prediction</b> (classification or regression): will they come back, how long will they stay?</li></ul>` },
      { id: 'final', h: 'Final experiment', html: `<p>Run a complete project yourself. <b>Choose a dataset</b>, <b>choose the target</b>, <b>choose features</b>, <b>choose an algorithm</b>, then <b>train</b> and <b>evaluate</b> the model, <b>compare</b> it with others and a no-learning baseline, <b>make a prediction</b>, and read the <b>business recommendation</b>. Try to break it: pick a weak feature set, or a target that is not predictable, and see how the recommendation changes.</p>`, w: 'final' }
    ],
    takeaways: ['Underfit = too simple; overfit = memorised noise; good fit generalises to unseen data.', 'More complexity is not always better; compare training and test results.', 'Choose features that are relevant and known at prediction time; drop identifiers; never leak the target.', 'Clean data first: missing, duplicate and invalid values; encode categories; scale where needed.', 'A project is a loop: question → data → features → split → train → evaluate → compare → predict → decide.'],
    quiz: [
      { q: 'Training accuracy is 99% but testing accuracy is 71%. This is…', o: ['Underfitting', 'Overfitting', 'A good fit'], a: 1, why: 'A large gap with very high training accuracy means the model memorised the training data.' },
      { q: 'Both training and testing accuracy are low. This is most likely…', o: ['Underfitting', 'Overfitting', 'Leakage'], a: 0, why: 'The model is too simple to learn the pattern.' },
      { q: 'Which is an example of data leakage?', o: ['Using “converted” as a feature to predict “converted”', 'Using page views to predict conversion', 'Splitting data into train and test'], a: 0, why: 'The target is being used as an input, so the model is handed the answer.' },
      { q: 'Why remove an identifier column like visitor_id before training?', o: ['It is unique per row, so it cannot generalise', 'It speeds up charts', 'It is categorical'], a: 0, why: 'IDs carry no real signal and invite memorisation.' },
      { q: 'Which encoding is safest for the unordered categories mobile / desktop / tablet?', o: ['Label encoding', 'One-hot encoding', 'No encoding'], a: 1, why: 'One-hot avoids implying that desktop is “greater than” mobile.' },
      { q: 'A visit has a duration of −5 seconds. This is…', o: ['A missing value', 'An invalid value to fix or remove', 'A feature to keep'], a: 1, why: 'Negative durations are impossible, so the row needs fixing or removal.' },
      { q: 'Which scenario most needs feature scaling?', o: ['K-Means on spend (£) and engagement (%)', 'Counting rows', 'Sorting a table'], a: 0, why: 'Distance-based methods are dominated by the column with the largest numbers unless scaled.' },
      { q: 'Put these in the correct order: Train, Collect data, Evaluate, Business question.', o: ['Business question → Collect data → Train → Evaluate', 'Train → Collect data → Business question → Evaluate', 'Evaluate → Train → Collect data → Business question'], a: 0, why: 'Start from the question, gather data, train, then evaluate.' }
    ],
    further: ['skprep', 'skcv', 'kagglecln', 'ngml', 'fastai', 'cs229'] }
];

// Discovery framing for each lesson: an opening question, a real-world problem and a hands-on practice task.
export const HOOKS = {
  foundations: { q: 'Which of your visitors are actually worth chasing?', world: 'A shop logs 10,000 sessions a month. Dashboards describe last month perfectly, but nobody can say who will buy tomorrow.', practice: 'In the selector, make “converted” the target and explain in one sentence why it is classification. Then choose “revenue” and explain why that changes the task.' },
  regression: { q: 'How much revenue will your next campaign bring?', world: 'A marketing lead must set next month’s budget. A forecast that is off by 5% is useful; one that is off by 50% is dangerous.', practice: 'In the lab, drag one point far away and watch the line move. Then try the revenue mini project and drop the weakest feature.' },
  classification: { q: 'Can you teach a machine to guess who will buy a product?', world: 'Your site can show one expensive discount per visitor. Show it to the wrong person and you lose margin; skip the right one and you lose a sale.', practice: 'Place three new visitors in the lab and predict each probability before you read it. How close were you?' },
  evaluation: { q: 'Your model says 90% accurate. Should you celebrate?', world: 'Only 10% of visitors ever buy. A model that always says “no” is also 90% accurate, and useless.', practice: 'Tick “Rare buyers”, then find the threshold with the best F1. Finally, set the cost of a missed buyer to £100 and pick the model with the lowest cost.' },
  clustering: { q: 'What if your customers already belong to groups nobody has named?', world: 'Marketing sends the same email to everyone. Some customers spend a fortune quietly; others click everything and never buy.', practice: 'Run K-Means with K = 2, 3, 4 and 5. Pick the K whose groups you could treat differently, and write one action per group.' },
  practical: { q: 'Why does the model with the best score sometimes fail the worst?', world: 'A churn model hits 99% in testing, goes live and flops. The culprit: a column that only exists after customers leave.', practice: 'In the leakage lab, add “converted_flag” and watch accuracy hit 100%. Then complete the final experiment with honest features.' }
};
