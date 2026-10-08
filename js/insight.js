// Lab metadata, pictograms and the smart insight panel (live readout + beginner/technical explanations).
import { store } from './store.js';
import { pixelSVG, say } from './pixel.js';
import { tick, ok } from './sound.js';

const S = (b, c = 'currentColor') => `<svg viewBox="0 0 48 48" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
export const LABS = {
  regline: { t: 'Regression Line', cat: 'Regression', c: '--coral', mod: 'regression',
    icon: S('<path d="M7 38L41 12"/><circle cx="12" cy="33" r="2.6" fill="currentColor"/><circle cx="21" cy="29" r="2.6" fill="currentColor"/><circle cx="27" cy="20" r="2.6" fill="currentColor"/><circle cx="36" cy="17" r="2.6" fill="currentColor"/>'),
    why: ['The line sits as close to all the dots as it can. Move a dot and the line shifts to keep everyone’s distance small.', 'Least squares chooses the intercept and slope that minimise Σ(yᵢ − ŷᵢ)². Moving a point changes that sum, so the optimum moves with it.'],
    means: ['A small average miss means the line predicts well. R² close to 1 means it explains most of the ups and downs.', 'MAE = mean|y − ŷ|, RMSE = √mean(y − ŷ)² (always ≥ MAE and more sensitive to big misses), R² = 1 − SSE/SST.'],
    next: ['Drag one point far away from the others. That is an outlier.', 'Untick “Show errors” and guess the biggest miss, then tick it again.', 'Type an actual revenue to see a single residual.'] },
  gd: { t: 'Gradient Descent', cat: 'Optimization', c: '--amber', mod: 'regression',
    icon: S('<path d="M6 12c8 0 10 24 18 24s10-24 18-24"/><circle cx="14" cy="26" r="3.4" fill="currentColor"/><path d="M18 30l4 4"/>'),
    why: ['The model starts with a bad guess and takes small steps downhill on the error. Bigger steps are faster, until they are too big.', 'Each step updates parameters θ ← θ − η∇L(θ). For this quadratic loss it converges only if η < 2/λₘₐₓ of the Hessian; above that the error grows geometrically.'],
    means: ['A falling error curve that flattens means the model has learned what it can.', 'A flat tail indicates convergence to the minimum. A curve that rises, or a line that flies off screen, means η is too large.'],
    next: ['Press “Too small” then Play. How many steps until it settles?', 'Try “Diverges” and watch the error explode.', 'Use the speed slider and pause mid-way.'] },
  classlab: { t: 'Classification', cat: 'Classification', c: '--violet', mod: 'classification',
    icon: S('<circle cx="14" cy="16" r="3.4" fill="currentColor"/><circle cx="20" cy="30" r="3.4" fill="currentColor"/><circle cx="34" cy="14" r="3.4"/><circle cx="36" cy="30" r="3.4"/><path d="M10 38L40 8" stroke-dasharray="3 4"/>'),
    why: ['The model colours the map: teal where it thinks visitors will buy, coral where it thinks they will not. The threshold sets how picky it is.', 'Each model gives a score p̂(x) = P(convert | x). A threshold t turns it into a class (p̂ ≥ t). Logistic regression draws a straight boundary, trees draw rectangles, KNN follows local neighbours.'],
    means: ['A probability is a confidence, not a promise. 70% means “most similar visitors did buy”.', 'Probabilities from KNN are vote shares among k neighbours; from trees, class shares in a leaf; from logistic regression, σ(w·x + b).'],
    next: ['Click the chart to place a new visitor and read the probability.', 'Switch to the decision tree. Why are the regions boxy?', 'Move the threshold to 0.90. Which regions turn coral?'] },
  confusion: { t: 'Confusion Matrix', cat: 'Evaluation', c: '--accent', mod: 'evaluation',
    icon: S('<rect x="9" y="9" width="13" height="13" rx="3" fill="currentColor"/><rect x="26" y="9" width="13" height="13" rx="3"/><rect x="9" y="26" width="13" height="13" rx="3"/><rect x="26" y="26" width="13" height="13" rx="3" fill="currentColor"/>'),
    why: ['Each square is a visitor. Moving the threshold decides who the model calls a buyer, so squares change colour.', 'At threshold t each case lands in TP, FP, FN or TN. Raising t shrinks the predicted-positive set: FP and TP fall, FN rises.'],
    means: ['Precision: when it says “buyer”, how often is it right? Recall: of all real buyers, how many did it find?', 'Precision = TP/(TP+FP), Recall = TP/(TP+FN), F1 = 2PR/(P+R), Accuracy = (TP+TN)/N. Accuracy hides class imbalance; tick “Rare buyers”.'],
    next: ['Tick “Rare buyers”. Watch accuracy stay high while recall collapses.', 'Find the threshold that maximises F1.', 'Which error would cost your business more: FP or FN?'] },
  compare: { t: 'Model Comparison', cat: 'Evaluation', c: '--accent', mod: 'evaluation',
    icon: S('<rect x="8" y="22" width="8" height="18" rx="2"/><rect x="20" y="12" width="8" height="28" rx="2" fill="currentColor"/><rect x="32" y="18" width="8" height="22" rx="2"/>'),
    why: ['Three models take the same test. The best one depends on what mistakes cost you, not just on the highest score.', 'Models are fit on the training split and scored on a held-out test split. Cost = FN·(value of a buyer) + FP·(cost of an offer); the cost-minimising model need not maximise accuracy.'],
    means: ['The ★ marks the best accuracy and the lowest business cost. They can disagree.', 'A large gap between train and test accuracy signals overfitting. Compare models on test data only.'],
    next: ['Set a missed buyer to £100. Does the winner change?', 'Lower the threshold to 0.2 and compare again.', 'Make your pick, then check the cheapest option.'] },
  kmeans: { t: 'K-Means', cat: 'Clustering', c: '--blue', mod: 'clustering',
    icon: S('<circle cx="15" cy="16" r="7" opacity=".6"/><circle cx="33" cy="20" r="7" opacity=".6"/><circle cx="22" cy="34" r="7" opacity=".6"/><path d="M13 14l4 4M17 14l-4 4M31 18l4 4M35 18l-4 4M20 32l4 4M24 32l-4 4"/>'),
    why: ['Each customer joins the nearest centre, then each centre moves to the middle of its group. Repeat until nothing changes.', 'K-Means minimises within-cluster sum of squares by alternating assignment and update. It converges to a local optimum that depends on initialisation, so real implementations run several starts.'],
    means: ['A cluster is a hypothesis about a segment. It is useful only if you would treat that group differently.', 'The elbow in the spread-vs-K chart suggests a sensible K; it is a heuristic, not a proof.'],
    next: ['Press “Restart with new centres” and step through twice. Do you get the same groups?', 'Switch the axes to Sessions vs Engagement.', 'Try K=2 and K=5. Which is easiest to act on?'] },
  complexity: { t: 'Over / Underfitting', cat: 'Generalization', c: '--amber', mod: 'practical',
    icon: S('<path d="M6 30c5-16 8 6 13-8s8 8 13-6 6 4 10-4"/><circle cx="10" cy="26" r="2" fill="currentColor"/><circle cx="24" cy="22" r="2" fill="currentColor"/><circle cx="38" cy="14" r="2" fill="currentColor"/>'),
    why: ['Too simple and the model misses the pattern. Too complex and it memorises the noise. In between is the sweet spot.', 'Training error falls monotonically as complexity grows, while test error is U-shaped (bias–variance trade-off). Regularization adds λ‖w‖² to shrink coefficients and cut variance.'],
    means: ['Look at the gap between train and test error, not at training error alone.', 'High bias → both errors high. High variance → train error low, test error high. Regularization trades a little bias for much less variance.'],
    next: ['Set complexity to 11. Then raise the regularization step by step.', 'Find the lowest test error you can.', 'Can you get training error near 0 with a bad test error? That is the trap.'] },
  final: { t: 'Final Experiment', cat: 'Milestone', c: '--accent', mod: 'practical',
    icon: S('<path d="M24 6l5 12 13 1-10 9 3 13-11-7-11 7 3-13-10-9 13-1z"/>'),
    why: ['Run the whole job like a real analyst: choose data, target, features and model, then check whether it beats guessing.', 'A complete supervised workflow: choose target and features, split, fit, evaluate on held-out data, compare against a baseline, then predict and recommend.'],
    means: ['If a model barely beats the baseline it has learned little, so do not act on it.', 'Classification: accuracy, precision, recall, F1 against a majority-class baseline. Regression: MAE, RMSE and R² against predicting the mean.'],
    next: ['Remove the strongest feature. How much does the score drop?', 'Switch to the campaigns dataset and compare linear regression with KNN.', 'Choose a target that cannot be predicted from the features.'] }
};

const MOOD = t => /overfitting|exploded|diverg|too complex|Do not act/i.test(t) ? 'oops' : /Too good|confus/i.test(t) ? 'confused' : /Recommendation|Good fit|good balance|✓/i.test(t) ? 'proud' : 'happy';
const readout = el => [...el.querySelectorAll('.wout, .kpis, .wstat')].map(n => n.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 2).join(' · ') || 'Interact with the chart to see what changes.';

// Mount an insight panel for `id`, live-bound to widgets inside `stage`.
export function insightPanel(host, id, stage) {
  const L = LABS[id]; let eli = store.get('eli5', true), obs;
  host.innerHTML = `<div class="ins-top"><div class="ins-px" aria-hidden="true"></div><div><span class="label" style="color:var(--${L.c.slice(2)})">${L.cat}</span><h2>${L.t}</h2></div></div>
    <button class="btn sm eli" type="button" aria-pressed="${eli}"></button>
    <div class="ins-sec"><h3>What’s happening</h3><p class="live" aria-live="polite"></p></div>
    <div class="ins-sec"><h3>Why did it change?</h3><p class="why"></p></div>
    <div class="ins-sec"><h3>What does it mean?</h3><p class="means"></p></div>
    <div class="ins-sec"><h3>Try next</h3><ul class="next">${L.next.map(n => `<li>${n}</li>`).join('')}</ul></div>
    <a class="ins-link" href="modules.html#${L.mod}">Read the lesson →</a>`;
  const q = s => host.querySelector(s), btn = q('.eli');
  const paint = () => { q('.why').textContent = L.why[eli ? 0 : 1]; q('.means').textContent = L.means[eli ? 0 : 1]; btn.textContent = eli ? 'Show technical version' : 'Explain Like I’m 5'; btn.setAttribute('aria-pressed', eli); };
  btn.onclick = () => { eli = !eli; store.set('eli5', eli); paint(); };
  let mood = 'happy'; const live = () => { const t = readout(stage); q('.live').textContent = t; const m = MOOD(t); if (m !== mood) { mood = m; q('.ins-px').innerHTML = pixelSVG(m); } };
  q('.ins-px').innerHTML = pixelSVG('happy'); paint(); live();
  let to = 0; obs?.disconnect(); obs = new MutationObserver(() => { clearTimeout(to); to = setTimeout(live, 120); }); obs.observe(stage, { childList: true, subtree: true, characterData: true });
  stage.addEventListener('input', e => { if (e.target.type === 'range') { const r = e.target; tick(240 + 420 * ((r.value - r.min) / (r.max - r.min || 1))); } });
  stage.addEventListener('click', e => { if (e.target.closest('.wb,.opt')) tick(520); });
  return () => obs.disconnect();
}

// Safe widget mount with a friendly error boundary.
export function safeMount(fn, el, id = '') {
  try { fn(el); } catch (err) {
    console.error(err); say('bug', {}, true);
    el.innerHTML = `<div class="wout bad"><b>Unexpected plot twist.</b> This experiment failed to load${id ? ` (${id})` : ''}. <button class="wb" type="button" id="retry">Try again</button></div>`;
    el.querySelector('#retry').onclick = () => { el.replaceChildren(); safeMount(fn, el, id); };
  }
}
