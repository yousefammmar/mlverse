// Module 6 final experiment: choose dataset, target, features, algorithm; train, evaluate, compare, predict, recommend.
import { shell, note, pct, table, emit } from './core.js';
import { visitors, campaigns } from '../data/datasets.js';
import { FIT, splitIdx, clfMetrics, regMetrics } from '../ml.js';

const DS = {
  visitors: { name: 'Website visitors (will they convert?)', rows: visitors, cols: ['duration', 'pages', 'adClicks', 'returning', 'converted'], def: 'converted' },
  campaigns: { name: 'Marketing campaigns (how much revenue?)', rows: campaigns, cols: ['adSpend', 'visitors', 'engagement', 'revenue'], def: 'revenue' }
};
const ALG = { logistic: 'Logistic regression', tree: 'Decision tree', knn: 'K-Nearest Neighbors', linear: 'Linear regression', baseline: 'Baseline (no learning)' };

export function final(el) {
  let ds = 'visitors', target = 'converted', feats = new Set(['duration', 'pages', 'returning']), alg = 'logistic', res = null, inp = {};
  const s = shell(el, 'Work top to bottom, like a real project. Every number comes from models trained live in your browser on synthetic data.', null), box = document.createElement('div'); box.className = 'final'; s.body.append(box);
  const col = (D, c) => D.map(r => r[c]), isBin = (D, c) => col(D, c).every(v => v === 0 || v === 1);
  function render() {
    const D = DS[ds].rows(), cols = DS[ds].cols, bin = isBin(D, target), algs = bin ? ['logistic', 'tree', 'knn'] : ['linear', 'tree', 'knn'];
    if (!algs.includes(alg)) alg = algs[0];
    feats.delete(target);
    box.innerHTML = `
      <div class="fgrid">
        <label>① Dataset<select id="f-ds">${Object.entries(DS).map(([k, d]) => `<option value="${k}"${k === ds ? ' selected' : ''}>${d.name}</option>`).join('')}</select></label>
        <label>② Target<select id="f-t">${cols.map(c => `<option${c === target ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
        <label>④ Algorithm<select id="f-a">${algs.map(a => `<option value="${a}"${a === alg ? ' selected' : ''}>${ALG[a]}</option>`).join('')}</select></label>
      </div>
      <fieldset><legend>③ Features (inputs)</legend>${cols.filter(c => c !== target).map(c => `<label class="chk"><input type="checkbox" value="${c}"${feats.has(c) ? ' checked' : ''}><span>${c}</span></label>`).join('')}</fieldset>
      <p class="wstat">Task: <b>${bin ? 'classification' : 'regression'}</b> (target “${target}” is ${bin ? 'a 0/1 category' : 'a number'}).</p>
      <button type="button" class="wb primary" id="f-go">⑤ Train and evaluate</button><div id="f-out"></div>`;
    box.querySelector('#f-ds').onchange = e => { ds = e.target.value; target = DS[ds].def; feats = new Set(DS[ds].cols.filter(c => c !== target).slice(0, 3)); res = null; render(); };
    box.querySelector('#f-t').onchange = e => { target = e.target.value; res = null; render(); };
    box.querySelector('#f-a').onchange = e => { alg = e.target.value; if (res) run(); };
    box.querySelectorAll('fieldset input').forEach(i => i.onchange = () => { i.checked ? feats.add(i.value) : feats.delete(i.value); res = null; box.querySelector('#f-out').innerHTML = ''; });
    box.querySelector('#f-go').onclick = run; if (res) run();
  }
  function run() {
    const D = DS[ds].rows(), F = [...feats], out = box.querySelector('#f-out'); if (!F.length) { out.innerHTML = '<p class="wout bad">Select at least one feature.</p>'; return; }
    const bin = isBin(D, target), sp = splitIdx(D.length, 0.7, 12), X = D.map(r => F.map(f => r[f])), y = col(D, target), algs = bin ? ['logistic', 'tree', 'knn', 'baseline'] : ['linear', 'tree', 'knn', 'baseline'];
    const yt = sp.test.map(i => y[i]), R = algs.map(a => { const m = FIT[a](sp.train.map(i => X[i]), sp.train.map(i => y[i])), p = sp.test.map(i => m.predict(X[i])); return { a, m, M: bin ? clfMetrics(yt, p) : regMetrics(yt, p) }; });
    const cur = R.find(r => r.a === alg) || R[0], base = R.at(-1).M;
    const cols = bin ? ['Model', 'Accuracy', 'Precision', 'Recall', 'F1'] : ['Model', 'MAE', 'RMSE', 'R²'];
    const rows = R.map(r => [ALG[r.a] + (r.a === alg ? ' ◀' : ''), ...(bin ? [pct(r.M.acc), pct(r.M.prec), pct(r.M.rec), pct(r.M.f1)] : [r.M.mae.toFixed(r.M.mae < 10 ? 2 : 0), r.M.rmse.toFixed(r.M.rmse < 10 ? 2 : 0), r.M.r2.toFixed(2)])]);
    res = true; emit(s.fig, (bin ? cur.M.acc <= base.acc + 0.02 : cur.M.r2 < 0.3) ? 'poor' : 'trained');
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    const rec = bin ? (cur.M.acc <= base.acc + 0.02 ? `<b>Do not act yet.</b> ${ALG[cur.a]} barely beats the baseline accuracy of ${pct(base.acc)}. Try different features or more data.` : `<b>Recommendation:</b> use ${ALG[cur.a]} to rank cases by predicted probability. It finds ${pct(cur.M.rec)} of real “${target}” cases, and ${pct(cur.M.prec)} of the cases it flags are correct. Target the highest-probability group first; if missing a case costs more than a wasted action, lower the threshold below 0.5 and re-check precision.`)
      : (cur.M.r2 < 0.3 ? `<b>Do not act yet.</b> R² is ${cur.M.r2.toFixed(2)}, so the model explains little of ${target}. Add stronger features.` : `<b>Recommendation:</b> ${ALG[cur.a]} explains ${(cur.M.r2 * 100).toFixed(0)}% of the variation in ${target}, and typical predictions are off by about ${cur.M.mae.toFixed(0)} (${(cur.M.mae / mean * 100).toFixed(0)}% of the average). Use it for planning and budgeting, and re-train as new data arrives.`);
    out.innerHTML = `<h3>⑥ Evaluate  ⑦ Compare (test set)</h3>${table(cols, rows)}<h3>⑧ Predict a new case</h3><div class="wbar" id="f-in"></div><p class="wout" id="f-pred"></p><h3>⑨ Business recommendation</h3><p class="wout">${rec}</p>`;
    const inBar = out.querySelector('#f-in'), pred = out.querySelector('#f-pred');
    const upd = () => { const v = cur.m.predict(F.map(f => inp[f])); pred.innerHTML = bin ? `Predicted probability of “${target}”: <b>${pct(v)}</b> → <b>${v >= 0.5 ? 'yes' : 'no'}</b>` : `Predicted ${target}: <b>${Math.round(v).toLocaleString()}</b>`; };
    F.forEach(f => { const v = col(D, f).slice().sort((a, b) => a - b), lo = v[0], hi = v.at(-1), step = isBin(D, f) ? 1 : (hi - lo) / 100; inp[f] = inp[f] >= lo && inp[f] <= hi ? inp[f] : v[Math.floor(v.length / 2)];
      const l = document.createElement('label'); l.innerHTML = `<span>${f}</span><input type="range" min="${lo}" max="${hi}" step="${step}" value="${inp[f]}"><output>${(+inp[f]).toLocaleString(undefined, { maximumFractionDigits: 2 })}</output>`;
      l.querySelector('input').oninput = e => { inp[f] = +e.target.value; l.querySelector('output').textContent = (+e.target.value).toLocaleString(undefined, { maximumFractionDigits: 2 }); upd(); }; inBar.append(l); });
    upd();
  }
  render();
}
