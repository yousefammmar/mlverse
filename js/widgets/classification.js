// Module 3 + 4 + 6 widgets: classification lab, confusion matrix, model comparison, data leakage.
import { shell, canvas, slider, button, choice, checks, note, axes, label, css, rng, gauss, clamp, pct, table, tip } from './core.js';
import { visitors } from '../data/datasets.js';
import { FIT, splitIdx, clfMetrics } from '../ml.js';

const MODELS = [['logistic', 'Logistic regression'], ['tree', 'Decision tree'], ['knn', 'K-Nearest Neighbors']];
const DESC = { logistic: 'draws one straight dividing line and turns distance from it into a probability', tree: 'asks a short series of yes/no questions about the features, which makes rectangular regions', knn: 'looks at the 7 most similar past visitors and reports how many converted' };

// ---- Interactive classification lab: boundary, probability, threshold, new visitor.
export function classlab(el, { models = true } = {}) {
  const D = visitors(), X = D.map(r => [r.duration, r.pages]), y = D.map(r => r.converted), sp = splitIdx(D.length, 0.7, 2), fits = {};
  const get = k => fits[k] ||= FIT[k](sp.train.map(i => X[i]), sp.train.map(i => y[i]));
  let kind = 'logistic', thr = 0.5, nv = { d: 300, p: 6 };
  const s = shell(el, 'Each dot is a past visitor: teal = converted, grey ring = did not. The shaded areas show what the model would predict for a new visitor at that spot. Click the chart to place a new visitor.', () => draw());
  const c = canvas(s.body, 330, 'Visitors by session duration and page views, with the model decision regions'), out = note(s.body, 'wout');
  const W = () => c.clientWidth, H = 330, px = d => 44 + d / 600 * (W() - 56), py = p => H - 30 - (p - 1) / 14 * (H - 44);
  function draw() {
    const m = get(kind), [x, w] = c.prep(); axes(x, w, H, 30);
    for (let cx = 44; cx < w - 8; cx += 12) for (let cy = 8; cy < H - 30; cy += 12) {
      const pr = m.predict([(cx + 6 - 44) / (w - 56) * 600, 1 + (H - 30 - (cy + 6)) / (H - 44) * 14]), up = pr >= thr;
      x.globalAlpha = 0.07 + 0.2 * Math.min(1, Math.abs(pr - thr) * 2); x.fillStyle = css(up ? '--accent' : '--coral'); x.fillRect(cx, cy, 12, 12);
    }
    x.globalAlpha = 1;
    D.forEach((r, i) => { x.beginPath(); x.arc(px(r.duration), py(r.pages), 3.6, 0, 7); if (r.converted) { x.fillStyle = css('--accent'); x.fill(); } else { x.strokeStyle = css('--mute'); x.lineWidth = 1.2; x.stroke(); } });
    label(x, 'Session duration (s) →', w - 150, H - 8); label(x, 'Page views', 50, 18);
    const pr = m.predict([nv.d, nv.p]), cls = pr >= thr; x.save(); x.translate(px(nv.d), py(nv.p)); x.rotate(Math.PI / 4); x.fillStyle = css('--amber'); x.strokeStyle = css('--ink'); x.lineWidth = 2; x.fillRect(-7, -7, 14, 14); x.strokeRect(-7, -7, 14, 14); x.restore();
    const tm = clfMetrics(sp.test.map(i => y[i]), sp.test.map(i => m.predict(X[i])), thr);
    out.innerHTML = `<b>New visitor</b> (${Math.round(nv.d)} s, ${Math.round(nv.p)} pages): conversion probability <b>${pct(pr)}</b>. At threshold ${thr.toFixed(2)} the model predicts <b class="${cls ? 'ok' : 'bad'}">${cls ? 'CONVERT' : 'NOT convert'}</b>.<br><span class="mute">${MODELS.find(a => a[0] === kind)[1]} ${DESC[kind]}. Test accuracy at this threshold: ${pct(tm.acc)}.</span>`;
  }
  if (models) choice(s.bar, 'Model:', MODELS, kind, k => { kind = k; draw(); });
  choice(s.bar, 'Threshold:', [[.3, '0.30'], [.5, '0.50'], [.7, '0.70'], [.9, '0.90']], 0.5, v => { thr = v; draw(); });
  const sd = slider(s.bar, 'Duration', { min: 10, max: 600, step: 5, value: nv.d, fmt: v => v + ' s' }, v => { nv.d = v; draw(); }), sp2 = slider(s.bar, 'Pages', { min: 1, max: 15, step: 1, value: nv.p }, v => { nv.p = v; draw(); });
  c.style.cursor = 'crosshair';
  tip(c, (u, v) => { const b = c.getBoundingClientRect(); if (u < 44 || v > H - 30) return null; const d = clamp((u - 44) / (b.width - 56) * 600, 10, 600), p = clamp(1 + (H - 30 - v) / (H - 44) * 14, 1, 15), pr = get(kind).predict([d, p]); return `${Math.round(d)} s · ${p.toFixed(0)} pages<br>P(convert) = ${pct(pr)}`; });
  c.onclick = e => { const b = c.getBoundingClientRect(), u = e.clientX - b.left, v = e.clientY - b.top; nv.d = clamp(Math.round((u - 44) / (b.width - 56) * 600), 10, 600); nv.p = clamp(Math.round(1 + (H - 30 - v) / (H - 44) * 14), 1, 15); sd.set(nv.d); sp2.set(nv.p); draw(); };
  draw();
}

// ---- Confusion matrix lab: 100 visitors, adjustable threshold, live metrics.
export function confusion(el) {
  const mk = rare => { const r = rng(8), pos = rare ? 8 : 30, a = []; for (let i = 0; i < 100; i++) { const y = i < pos ? 1 : 0; a.push({ y, s: clamp((y ? 0.64 : 0.36) + gauss(r) * 0.17, 0.01, 0.99) }); } return a.sort(() => r() - 0.5); };
  let V = mk(false), thr = 0.5, rare = false;
  const s = shell(el, 'Each square is one of 100 visitors, coloured by outcome. The model gives every visitor a score; the threshold decides who is predicted to convert.', () => draw()), g = document.createElement('div'), m = document.createElement('div');
  g.className = 'cells ten'; m.className = 'metrics'; s.body.append(g, m);
  function draw() {
    const M = clfMetrics(V.map(v => v.y), V.map(v => v.s), thr), cls = v => v.y ? (v.s >= thr ? 'TP' : 'FN') : (v.s >= thr ? 'FP' : 'TN');
    g.innerHTML = [...V].sort((a, b) => b.s - a.s).map(v => `<i class="${cls(v)}" title="${cls(v)}: score ${v.s.toFixed(2)}"><span class="sr">${cls(v)}</span></i>`).join('');
    m.innerHTML = `<table class="cm"><caption class="sr">Confusion matrix</caption><tr><th></th><th>Predicted convert</th><th>Predicted not</th></tr><tr><th>Actually converts</th><td class="g">TP ${M.TP}</td><td class="b">FN ${M.FN}</td></tr><tr><th>Actually does not</th><td class="b">FP ${M.FP}</td><td class="g">TN ${M.TN}</td></tr></table>
      <dl class="kpis"><div><dt>Accuracy</dt><dd>${pct(M.acc)}</dd></div><div><dt>Precision</dt><dd>${pct(M.prec)}</dd></div><div><dt>Recall</dt><dd>${pct(M.rec)}</dd></div><div><dt>F1</dt><dd>${pct(M.f1)}</dd></div></dl>
      <p class="wstat"><span class="k TP"></span>TP caught buyer <span class="k TN"></span>TN correctly ignored <span class="k FP"></span>FP wasted offer <span class="k FN"></span>FN missed buyer</p>`;
  }
  slider(s.bar, 'Threshold', { min: 0.05, max: 0.95, step: 0.01, value: thr, fmt: v => (+v).toFixed(2) }, v => { thr = v; draw(); });
  [0.3, 0.5, 0.7].forEach(v => button(s.bar, v.toFixed(2), () => { thr = v; s.bar.querySelector('input').value = v; s.bar.querySelector('output').textContent = v.toFixed(2); draw(); }, 'ghost'));
  checks(s.bar, '', [['r', 'Rare buyers (8 of 100)']], e => { rare = e.target.checked; V = mk(rare); draw(); });
  draw();
}

// ---- Model comparison with business cost.
export function compare(el) {
  const D = visitors(), F = ['duration', 'pages', 'adClicks', 'returning'], X = D.map(r => F.map(f => r[f])), y = D.map(r => r.converted), sp = splitIdx(D.length, 0.7, 6);
  const fitted = MODELS.map(([k]) => FIT[k](sp.train.map(i => X[i]), sp.train.map(i => y[i]))), yt = sp.test.map(i => y[i]), P = fitted.map(m => sp.test.map(i => m.predict(X[i])));
  let thr = 0.3, missed = 40, waste = 2, pick = null; // default shows accuracy and cost disagreeing
  const s = shell(el, `All three models are trained on the same ${sp.train.length} visitors and scored on the unseen ${sp.test.length}.`+' Business cost = missed buyers × value of a buyer + wasted offers × cost of an offer.', null), out = document.createElement('div'), ch = note(s.body, 'wout'); s.body.prepend(out);
  function draw() {
    const R = MODELS.map(([, n], i) => { const M = clfMetrics(yt, P[i], thr); return { n, i, ...M, tr: clfMetrics(sp.train.map(k => y[k]), sp.train.map(k => fitted[i].predict(X[k])), thr).acc, cost: M.FN * missed + M.FP * waste }; });
    const bestAcc = R.reduce((a, b) => b.acc > a.acc ? b : a), bestCost = R.reduce((a, b) => b.cost < a.cost ? b : a);
    out.innerHTML = table(['Model', 'Train acc.', 'Test acc.', 'Precision', 'Recall', 'F1', 'Missed buyers', 'Wasted offers', 'Business cost'], R.map(r => [r.n, pct(r.tr), pct(r.acc) + (r === bestAcc ? ' ★' : ''), pct(r.prec), pct(r.rec), pct(r.f1), r.FN, r.FP, `£${r.cost.toLocaleString()}` + (r === bestCost ? ' ★' : '')]));
    ch.innerHTML = (bestAcc === bestCost ? `Accuracy and cost both favour <b>${bestCost.n}</b> here. Raise the value of a missed buyer or move the threshold and watch whether the winner changes.` : `<b>Highest accuracy does not mean best model.</b> ${bestAcc.n} has the best accuracy, but ${bestCost.n} costs the business less.`) + (pick === null ? '<br>Mini challenge: pick the best model for this campaign →' : `<br>You picked <b>${R[pick].n}</b>: cost £${R[pick].cost.toLocaleString()}. ${R[pick] === bestCost ? '✓ That is the cheapest option.' : `The cheapest is ${bestCost.n} at £${bestCost.cost.toLocaleString()} (saves £${(R[pick].cost - bestCost.cost).toLocaleString()}).`}`);
  }
  slider(s.bar, 'Missed buyer worth', { min: 5, max: 100, step: 5, value: missed, fmt: v => '£' + v }, v => { missed = v; draw(); });
  slider(s.bar, 'Cost of a wasted offer', { min: 1, max: 20, step: 1, value: waste, fmt: v => '£' + v }, v => { waste = v; draw(); });
  slider(s.bar, 'Threshold', { min: 0.1, max: 0.9, step: 0.05, value: thr, fmt: v => (+v).toFixed(2) }, v => { thr = v; draw(); });
  const row = document.createElement('div'); row.className = 'wbar'; row.style.borderTop = '1px solid var(--line)'; s.body.after(row);
  choice(row, 'Your pick:', MODELS.map(([, n], i) => [i, n]), -1, i => { pick = i; draw(); });
  draw();
}

// ---- Feature selection + data leakage.
export function leakage(el) {
  const D = visitors(), sp = splitIdx(D.length, 0.7, 9);
  const F = [['duration', 'Session duration', r => r.duration], ['pages', 'Page views', r => r.pages], ['adClicks', 'Ad clicks', r => r.adClicks], ['returning', 'Returning visitor', r => r.returning], ['id', 'visitor_id (identifier)', (r, i) => i], ['leak', 'converted_flag (copy of the target)', r => r.converted]];
  const NOTE = { id: 'An identifier is unique per row; it cannot generalise to new visitors.', leak: 'This column is the answer in disguise. It would not exist before the visitor decides, so the model is cheating.', duration: 'Legitimate: known during the session.', pages: 'Legitimate: known during the session.', adClicks: 'Legitimate, if recorded before conversion.', returning: 'Legitimate: known when the session starts.' };
  let use = { duration: true, pages: true, adClicks: false, returning: true, id: false, leak: false };
  const y = D.map(r => r.converted), base = Math.max(...[0, 1].map(c => sp.test.filter(i => y[i] === c).length)) / sp.test.length;
  const s = shell(el, 'Tick the columns the model may use. Watch what happens when you include the identifier or the leaked column.', () => draw()), out = document.createElement('div'); s.body.append(out);
  function draw() {
    const ks = F.filter(f => use[f[0]]); if (!ks.length) { out.innerHTML = '<p class="wstat">Select at least one feature.</p>'; return; }
    const X = D.map((r, i) => ks.map(f => f[2](r, i))), m = FIT.logistic(sp.train.map(i => X[i]), sp.train.map(i => y[i])), acc = idx => clfMetrics(idx.map(i => y[i]), idx.map(i => m.predict(X[i]))).acc;
    const a = acc(sp.train), b = acc(sp.test), mx = Math.max(...m.w.map(Math.abs), 1e-9), leak = use.leak && b > 0.97;
    out.innerHTML = `<dl class="kpis"><div><dt>Train accuracy</dt><dd>${pct(a)}</dd></div><div><dt>Test accuracy</dt><dd>${pct(b)}</dd></div><div><dt>Always-guess-majority</dt><dd>${pct(base)}</dd></div></dl>
      ${leak ? '<p class="wout bad"><b>Too good to be true.</b> Near-perfect accuracy from a few columns is a classic sign of data leakage. Remove converted_flag.</p>' : ''}
      <p class="wstat">Feature importance (size of the learned weight, scaled):</p>${ks.map((f, j) => `<div class="arow wide"><span>${f[1]}</span><i style="width:${Math.abs(m.w[j]) / mx * 100}%"></i><b class="mono">${(Math.abs(m.w[j]) / mx * 100).toFixed(0)}</b></div><p class="wstat" style="margin:0 0 6px">${NOTE[f[0]]}</p>`).join('')}`;
  }
  checks(s.bar, 'Features:', F.map(([k, t]) => [k, t, use[k]]), e => { use[e.target.value] = e.target.checked; draw(); });
  draw();
}

// ---- Discovery activity: draw your own boundary, then compare with a trained model.
export function boundary(el) {
  const D = visitors(), X = D.map(r => [r.duration, r.pages]), y = D.map(r => r.converted), sp = splitIdx(D.length, 0.7, 2), model = FIT.logistic(sp.train.map(i => X[i]), sp.train.map(i => y[i]));
  let A = { d: 60, p: 9 }, B = { d: 420, p: 1.5 }, flip = false, reveal = false, drag = null;
  const s = shell(el, 'Drag the two white handles to place a straight line. Visitors on the shaded side are predicted to convert. Then see what a trained model found.', () => draw()), c = canvas(s.body, 320, 'Visitors by duration and pages with a line you can drag'), out = note(s.body, 'wout');
  const H = 320, W = () => c.clientWidth, px = d => 44 + d / 600 * (W() - 56), py = p => H - 30 - (p - 1) / 14 * (H - 44), ix = u => clamp((u - 44) / (W() - 56) * 600, 0, 600), iy = v => clamp(1 + (H - 30 - v) / (H - 44) * 14, 0, 16);
  const side = (d, p) => ((B.d - A.d) * (p - A.p) - (B.p - A.p) * (d - A.d) > 0) !== flip; // true = predicted convert
  const acc = idx => idx.filter(i => (side(X[i][0], X[i][1]) ? 1 : 0) === y[i]).length / idx.length;
  function draw() {
    const [x, w] = c.prep(); axes(x, w, H, 30);
    for (let cx = 44; cx < w - 8; cx += 14) for (let cy = 8; cy < H - 30; cy += 14) { if (side((cx + 7 - 44) / (w - 56) * 600, 1 + (H - 30 - (cy + 7)) / (H - 44) * 14)) { x.globalAlpha = .1; x.fillStyle = css('--accent'); x.fillRect(cx, cy, 14, 14); } } x.globalAlpha = 1;
    D.forEach(r => { x.beginPath(); x.arc(px(r.duration), py(r.pages), 3.6, 0, 7); if (r.converted) { x.fillStyle = css('--accent'); x.fill(); } else { x.strokeStyle = css('--mute'); x.lineWidth = 1.2; x.stroke(); } });
    if (reveal) { x.strokeStyle = css('--violet'); x.lineWidth = 3; x.beginPath(); let first = true; for (let u = 44; u < w - 8; u += 4) { const d = ix(u); let found = null, prev = model.predict([d, 0.5]) - .5; for (let v = H - 30; v > 8; v -= 3) { const cur = model.predict([d, iy(v)]) - .5; if (cur * prev <= 0 && cur !== prev) { found = v; break; } prev = cur; } if (found !== null) { first ? x.moveTo(u, found) : x.lineTo(u, found); first = false; } } x.stroke(); label(x, 'model boundary', w - 120, 20, '--violet'); }
    x.strokeStyle = css('--amber'); x.lineWidth = 3; const dx = B.d - A.d, dy = B.p - A.p; x.beginPath(); x.moveTo(px(A.d - dx * 3), py(A.p - dy * 3)); x.lineTo(px(B.d + dx * 3), py(B.p + dy * 3)); x.stroke();
    [A, B].forEach(h => { x.beginPath(); x.arc(px(h.d), py(h.p), 9, 0, 7); x.fillStyle = css('--ink'); x.fill(); x.strokeStyle = css('--amber'); x.lineWidth = 3; x.stroke(); });
    const mine = acc(sp.test), m = clfMetrics(sp.test.map(i => y[i]), sp.test.map(i => model.predict(X[i]))).acc;
    out.innerHTML = `Your line: <b>${pct(mine)}</b> correct on ${sp.test.length} held-out visitors.` + (reveal ? ` Trained model: <b>${pct(m)}</b>. ${mine >= m ? 'You matched or beat it. Nice eye!' : `It beats you by ${((m - mine) * 100).toFixed(0)} points. Training finds the best straight line by minimising error instead of eyeballing.`}` : ' Can you beat a trained model? Press “Show what the model found”.');
  }
  const pos = e => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  c.style.touchAction = 'none'; c.style.cursor = 'grab';
  c.onpointerdown = e => { const [u, v] = pos(e), da = Math.hypot(px(A.d) - u, py(A.p) - v), db = Math.hypot(px(B.d) - u, py(B.p) - v); if (Math.min(da, db) < 22) { drag = da < db ? A : B; c.setPointerCapture(e.pointerId); } };
  c.onpointermove = e => { if (!drag) return; const [u, v] = pos(e); drag.d = ix(u); drag.p = iy(v); draw(); };
  c.onpointerup = () => drag = null;
  button(s.bar, 'Show what the model found', () => { reveal = !reveal; draw(); }, 'primary'); button(s.bar, 'Flip sides', () => { flip = !flip; draw(); }); button(s.bar, 'Reset line', () => { A = { d: 60, p: 9 }; B = { d: 420, p: 1.5 }; flip = false; draw(); }, 'ghost');
  draw();
}
