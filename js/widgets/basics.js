// Module 1 + 6 widgets: dataset structure, feature/target selector, split, workflow, data cleaning.
import { shell, slider, button, choice, note, table } from './core.js';
import { visitors } from '../data/datasets.js';

export function structure(el) {
  const rows = visitors().slice(0, 6), cols = [['visitor', 'text'], ['device', 'cat'], ['duration', 'num'], ['pages', 'num'], ['source', 'cat'], ['converted', 'cat']];
  const TXT = { rows: 'Each <b>row</b> is one example (here, one visitor session).', cols: 'Each <b>column</b> is one attribute measured for every example.', cell: 'Each <b>cell</b> is a single value: one attribute of one example.', types: '<b>Numerical</b> columns (#) hold quantities you can average. <b>Categorical</b> columns (Abc) hold labels from a fixed set. The ID column only names the row, so it carries no signal.' };
  const s = shell(el, '', null), t = document.createElement('div'), n = note(s.body); s.body.prepend(t); n.setAttribute('aria-live', 'polite');
  const show = m => { t.className = 'dsv ' + m; n.innerHTML = TXT[m]; };
  t.innerHTML = table(cols.map(([c, k]) => `${c} <small>${k === 'num' ? '#' : k === 'cat' ? 'Abc' : 'ID'}</small>`), rows.map(r => cols.map(([c]) => c === 'converted' ? (r[c] ? 'yes' : 'no') : r[c])));
  t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, j) => td.dataset.t = cols[j][1]));
  choice(s.bar, 'Highlight:', [['rows', 'Rows'], ['cols', 'Columns'], ['cell', 'Cells'], ['types', 'Data types']], 'rows', show); show('rows');
}

export function selector(el) {
  const C = [['visitor_id', 'id', 'Identifier'], ['device', 'cat', 'Categorical'], ['duration', 'num', 'Numerical'], ['pages', 'num', 'Numerical'], ['source', 'cat', 'Categorical'], ['revenue', 'num', 'Numerical'], ['converted', 'cat', 'Categorical']];
  let tgt = 'converted';
  const s = shell(el, 'Click a column to make it the target. Identifier columns are never used as features.', null), n = note(s.body); n.className = 'wout'; n.setAttribute('aria-live', 'polite');
  const bs = [];
  const draw = () => {
    bs.forEach(b => { b.classList.toggle('on', b.dataset.c === tgt); });
    const c = C.find(x => x[0] === tgt), feats = C.filter(x => x[1] !== 'id' && x[0] !== tgt).map(x => x[0]);
    const task = !c ? 'Unsupervised learning (no target) → clustering: find groups with no right answers to learn from.' : c[1] === 'num' ? `Supervised <b>regression</b>: predict a number (${tgt}).` : c[1] === 'cat' ? `Supervised <b>classification</b>: predict a category (${tgt}).` : 'An identifier is not a sensible target.';
    n.innerHTML = `<b>Target:</b> ${tgt || 'none'}<br><b>Features:</b> ${(tgt ? feats : C.filter(x => x[1] !== 'id').map(x => x[0])).join(', ')}<br>${task}`;
  };
  [...C.map(c => c[0]), null].forEach(c => { const b = button(s.bar, c || 'No target', () => { tgt = c; draw(); }); b.dataset.c = c; bs.push(b); });
  draw();
}

export function split(el) {
  let tr = 70, va = 15;
  const s = shell(el, '100 examples assigned to the three sets (shuffled before splitting).', null), g = document.createElement('div'); g.className = 'cells'; s.body.append(g);
  const n = note(s.body); n.classList.add('mono');
  const draw = () => {
    const te = 100 - tr - va;
    g.innerHTML = Array.from({ length: 100 }, (_, i) => `<i class="${i < tr ? 'tr' : i < tr + va ? 'va' : 'te'}"></i>`).join('');
    n.innerHTML = `<span class="k tr"></span>train ${tr}   <span class="k va"></span>validation ${va}   <span class="k te"></span>test ${te}${te < 10 ? '   ← test set is tiny: its score will be noisy' : ''}${tr < 50 ? '   ← little data left to learn from' : ''}`;
  };
  const a = slider(s.bar, 'Train', { min: 40, max: 90, step: 5, value: tr, fmt: v => v + '%' }, v => { tr = v; if (tr + va > 95) { va = 95 - tr; b.set(va); } draw(); });
  const b = slider(s.bar, 'Validation', { min: 0, max: 30, step: 5, value: va, fmt: v => v + '%' }, v => { va = v; if (tr + va > 95) { tr = 95 - va; a.set(tr); } draw(); });
  draw();
}

// Ordered workflow stepper. opts.full → 13-step version for Module 6.
export function workflow(el, { full = false } = {}) {
  const S = full ? [
    ['Business question', 'What decision are we trying to improve?', 'Which visitors are worth a discount offer?'],
    ['Collect data', 'Gather the records that describe past outcomes.', 'Export sessions from your analytics tool.'],
    ['Clean data', 'Fix missing, duplicate and invalid values.', 'Drop bot sessions with 0-second duration.'],
    ['Select features', 'Choose inputs that are known <i>before</i> the outcome and relate to it.', 'Session duration, pages, returning visitor.'],
    ['Select target', 'Choose the one column you want to predict.', 'converted (yes / no).'],
    ['Train/Test split', 'Hold back unseen data for an honest score.', '70% train, 30% test.'],
    ['Select model', 'Pick candidate algorithms matching the task.', 'Logistic regression, decision tree, KNN.'],
    ['Train', 'Let each algorithm learn patterns from the training set.', 'Fit each model on the training rows.'],
    ['Evaluate', 'Score on the test set with metrics that fit the goal.', 'Precision, recall, F1.'],
    ['Compare', 'Put models side by side, including business cost.', 'Which model wastes the fewest offers?'],
    ['Predict', 'Score new, unseen cases.', 'Probability this live visitor converts.'],
    ['Interpret', 'Understand what drives predictions and where the model fails.', 'Returning visitors and page depth matter most.'],
    ['Business decision', 'Turn predictions into an action and measure it.', 'Show the offer to visitors above 0.7.']
  ] : [
    ['Ask a question', 'Start from the decision, not the algorithm.', 'Will this visitor convert?'],
    ['Get and prepare data', 'Collect examples and clean them.', 'Sessions with their outcomes.'],
    ['Split', 'Keep unseen data aside.', 'Train 70% / test 30%.'],
    ['Train a model', 'Learn patterns from the training set.', 'Fit on the training sessions.'],
    ['Evaluate', 'Score on the unseen test set.', 'How many converters did we catch?'],
    ['Predict and act', 'Use the model on new cases and decide.', 'Offer help to likely buyers.']
  ];
  const s = shell(el, 'Click a step. Real projects loop back: poor evaluation often sends you back to the data or the features.', null), ol = document.createElement('ol'); ol.className = 'wflow'; s.body.append(ol);
  const d = note(s.body, 'wout'); d.setAttribute('aria-live', 'polite');
  S.forEach(([t, w, ex], i) => { const li = document.createElement('li'), b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<i>${i + 1}</i>${t}`; li.append(b); ol.append(li);
    b.onclick = () => { ol.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); d.innerHTML = `<b>${i + 1}. ${t}.</b> ${w}<br><span class="mute">Digital analytics example: ${ex}</span>`; }; });
  ol.querySelector('button').click();
}

// Data cleaning + encoding + scaling on a tiny table.
export function clean(el) {
  const BASE = [{ u: 'U1', device: 'mobile', country: 'UK', dur: 120, spend: 30 }, { u: 'U2', device: 'desktop', country: 'US', dur: 340, spend: null }, { u: 'U3', device: 'mobile', country: 'UK', dur: 95, spend: 12 },
    { u: 'U3', device: 'mobile', country: 'UK', dur: 95, spend: 12 }, { u: 'U4', device: 'tablet', country: 'DE', dur: -5, spend: 0 }, { u: 'U5', device: 'desktop', country: 'US', dur: 410, spend: 88 }, { u: 'U6', device: null, country: 'DE', dur: 200, spend: 45 }];
  let rows, cols, log;
  const s = shell(el, 'Apply the steps in any order and read what each one does. Reset to start again.', null), t = document.createElement('div'), n = note(s.body); n.className = 'wout'; s.body.prepend(t);
  const reset = () => { rows = BASE.map(r => ({ ...r })); cols = ['u', 'device', 'country', 'dur', 'spend']; log = 'Raw data has 4 problems: missing values (blank), a duplicate row (U3), an impossible value (duration −5) and text columns the model cannot read yet.'; draw(); };
  const draw = () => { t.innerHTML = table(cols, rows.map(r => cols.map(c => r[c] == null ? '<span class="bad">∅ missing</span>' : (typeof r[c] === 'number' && !Number.isInteger(r[c]) ? r[c].toFixed(2) : (c === 'dur' && r[c] < 0 ? `<span class="bad">${r[c]}</span>` : r[c]))))); n.innerHTML = log; };
  const act = (name, f) => button(s.bar, name, () => { f(); draw(); });
  act('Drop rows with missing values', () => { const b = rows.length; rows = rows.filter(r => cols.every(c => r[c] != null)); log = `Removed ${b - rows.length} row(s) with missing values. Alternative: fill with the median (numbers) or "unknown" (categories) to keep the row.`; });
  act('Remove duplicates', () => { const b = rows.length, seen = new Set(); rows = rows.filter(r => { const k = JSON.stringify(r); return seen.has(k) ? false : seen.add(k); }); log = `Removed ${b - rows.length} duplicate row(s). Duplicates over-count some visitors and can leak between train and test.`; });
  act('Fix invalid values', () => { const b = rows.length; rows = rows.filter(r => !(r.dur < 0)); log = `Removed ${b - rows.length} row(s) with an impossible value (negative duration). Always check ranges against what is physically possible.`; });
  act('Label-encode country', () => { if (!cols.includes('country')) return; const m = {}; rows.forEach(r => r.country = m[r.country] ??= Object.keys(m).length); log = 'Label encoding turns each category into one integer. Use it only when the order is meaningful (e.g. small/medium/large); otherwise the model sees "DE > UK" as real.'; });
  act('One-hot encode device', () => { if (!cols.includes('device')) return; const cats = [...new Set(rows.map(r => r.device).filter(Boolean))]; cats.forEach(c => rows.forEach(r => r['device_' + c] = r.device === c ? 1 : 0)); rows.forEach(r => delete r.device); cols = cols.filter(c => c !== 'device').concat(cats.map(c => 'device_' + c)); log = 'One-hot encoding gives each category its own 0/1 column, so no false order is implied.'; });
  act('Scale duration', () => { const v = rows.map(r => r.dur).filter(x => x != null), m = v.reduce((a, b) => a + b, 0) / v.length, sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) || 1; rows.forEach(r => { if (r.dur != null) r.dur = (r.dur - m) / sd; }); log = 'Standardising puts duration on the same scale as other numbers (mean 0, spread 1). Distance-based models like KNN and K-Means need this.'; });
  button(s.bar, 'Reset', reset, 'ghost'); reset();
}
