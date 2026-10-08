// Module 2 + 6 widgets: gradient descent, interactive regression line, revenue mini project, complexity slider.
import { shell, canvas, slider, button, choice, checks, note, axes, label, css, rng, gauss, reduced, table, tip, emit } from './core.js';
import { campaigns } from '../data/datasets.js';
import { ols, regMetrics, splitIdx } from '../ml.js';

const fmtK = v => '£' + v.toFixed(1) + 'k';

// ---- Interactive regression line: drag points, see the line, errors and a prediction.
export function regline(el, opts = {}) {
  const r = rng(21), pts = Array.from({ length: 10 }, (_, i) => ({ x: 1 + i * 0.9, y: 4.5 * (1 + i * 0.9) + 3 + gauss(r) * 3 })), noise0 = pts.map(p => p.y);
  let showErr = true, xin = 6, actual = '';
  const s = shell(el, 'Drag any teal point. The red line is re-fitted every time (least squares). Grey segments are the prediction errors (residuals).', () => draw());
  const c = canvas(s.body, 300, 'Scatter plot of ad spend against revenue with a fitted line; points are draggable'), out = note(s.body, 'wout');
  const W = () => c.clientWidth, H = 300, px = v => 44 + v / 10 * (W() - 60), py = v => H - 30 - v / 60 * (H - 44), ix = u => (u - 44) / (W() - 60) * 10, iy = u => (H - 30 - u) / (H - 44) * 60;
  const fit = () => { const m = ols(pts.map(p => [p.x]), pts.map(p => p.y)); return { a: m.b, b: m.w[0], f: m.predict }; };
  tip(c, (u, v) => { const m = fit(); let best = 1e9, bp; pts.forEach(p => { const d = Math.hypot(px(p.x) - u, py(p.y) - v); if (d < best) { best = d; bp = p; } }); return best < 16 ? `spend ${fmtK(bp.x)} · revenue ${fmtK(bp.y)}<br>residual ${(bp.y - m.a - m.b * bp.x >= 0 ? '+' : '') + (bp.y - m.a - m.b * bp.x).toFixed(1)}k` : null; });
  function draw() {
    const [x, w] = c.prep(), m = fit(), yh = pts.map(p => m.a + m.b * p.x), M = regMetrics(pts.map(p => p.y), yh);
    axes(x, w, H, 30); label(x, 'Ad spend (£k) →', w - 120, H - 8); label(x, 'Revenue (£k)', 50, 18);
    if (showErr) { x.strokeStyle = css('--mute'); x.lineWidth = 1.5; pts.forEach((p, i) => { x.beginPath(); x.moveTo(px(p.x), py(p.y)); x.lineTo(px(p.x), py(yh[i])); x.stroke(); }); }
    x.strokeStyle = css('--coral'); x.lineWidth = 2.5; x.beginPath(); x.moveTo(px(0), py(m.a)); x.lineTo(px(10), py(m.a + m.b * 10)); x.stroke();
    x.fillStyle = css('--accent'); pts.forEach(p => { x.beginPath(); x.arc(px(p.x), py(p.y), 6, 0, 7); x.fill(); });
    const pred = m.a + m.b * xin; x.strokeStyle = css('--amber'); x.lineWidth = 2; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(px(xin), H - 30); x.lineTo(px(xin), py(pred)); x.stroke(); x.setLineDash([]);
    x.fillStyle = css('--amber'); x.beginPath(); x.arc(px(xin), py(pred), 6, 0, 7); x.fill();
    const a = parseFloat(actual); let msg = `For ad spend <b>${fmtK(xin)}</b> the model <b>predicts</b> revenue ${fmtK(pred)}.`;
    if (isFinite(a)) { x.fillStyle = css('--violet'); x.beginPath(); x.arc(px(xin), py(a), 6, 0, 7); x.fill(); msg += ` Actual ${fmtK(a)} → error (residual) = actual − predicted = <b>${(a - pred >= 0 ? '+' : '') + (a - pred).toFixed(1)}k</b>.`; }
    opts.onChange?.({ a: m.a, b: m.b, M });
    out.innerHTML = `${msg}<br><span class="mute">line: revenue = ${m.a.toFixed(1)} + ${m.b.toFixed(2)} × spend · MAE ${M.mae.toFixed(1)}k · RMSE ${M.rmse.toFixed(1)}k · R² ${M.r2.toFixed(2)}</span>`;
  }
  let drag = -1;
  c.style.touchAction = 'none'; c.style.cursor = 'grab';
  const pos = e => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  c.onpointerdown = e => { const [u, v] = pos(e); let best = 1e9; pts.forEach((p, i) => { const d = Math.hypot(px(p.x) - u, py(p.y) - v); if (d < best) { best = d; drag = i; } }); if (best > 18) drag = -1; else c.setPointerCapture(e.pointerId); };
  c.onpointermove = e => { if (drag < 0) return; const [u, v] = pos(e); pts[drag].x = Math.min(10, Math.max(0, ix(u))); pts[drag].y = Math.min(60, Math.max(0, iy(v))); draw(); };
  c.onpointerup = () => { if (drag >= 0) { const m = fit(), r = pts.map(p => Math.abs(p.y - m.a - m.b * p.x)), mean = r.reduce((a, b) => a + b, 0) / r.length; if (Math.max(...r) > 2.6 * mean) emit(s.fig, 'outlier'); } drag = -1; };
  slider(s.bar, 'New campaign ad spend', { min: 0, max: 10, step: 0.1, value: xin, fmt: fmtK }, v => { xin = v; draw(); });
  const l = document.createElement('label'); l.innerHTML = '<span>Actual revenue £k (optional)</span><input type="number" min="0" max="60" step="0.5" style="width:84px" aria-label="Actual revenue in thousands of pounds">'; l.querySelector('input').oninput = e => { actual = e.target.value; draw(); }; s.bar.append(l);
  s.bar.append(Object.assign(document.createElement('label'), { className: 'chk', innerHTML: '<input type="checkbox" checked><span>Show errors</span>' })); s.bar.lastChild.firstChild.onchange = e => { showErr = e.target.checked; draw(); };
  button(s.bar, 'Reset points', () => { pts.forEach((p, i) => { p.x = 1 + i * 0.9; p.y = noise0[i]; }); draw(); }, 'ghost');
  draw();
}

// ---- Gradient descent (visual, beginner-friendly).
export function gd(el, { compact = false, autoplay = false, presets = true } = {}) {
  const X = Array.from({ length: 30 }, (_, i) => i / 3 - 5), r = rng(7), Y = X.map(x => 2 * x + 1 + gauss(r) * 1.5);
  let w, b, hist, lr = 0.03, timer = 0, speed = 45, warned = false;
  const s = shell(el, compact ? '' : 'The optimizer starts with a flat line (w = 0, b = 0) and nudges it downhill on the error surface. The right panel shows the error shrinking; it is capped so divergence is visible.', () => draw());
  const grid = document.createElement('div'); grid.className = 'wgrid'; s.body.append(grid);
  const fit = canvas(grid, 240, 'Scatter plot with fitted line'), lc = canvas(grid, 240, 'Loss over steps'), stat = note(s.body); stat.classList.add('mono');
  const loss = () => X.reduce((a, x, i) => a + (w * x + b - Y[i]) ** 2, 0) / X.length;
  const stop = () => { clearInterval(timer); timer = 0; play.textContent = 'Play'; };
  const reset = () => { stop(); w = 0; b = 0; hist = [loss()]; warned = false; draw(); };
  const step = () => { let gw = 0, gb = 0; X.forEach((x, i) => { const e = w * x + b - Y[i]; gw += 2 * e * x; gb += 2 * e; }); w -= lr * gw / X.length; b -= lr * gb / X.length; hist.push(loss()); };
  function draw() {
    if (w === undefined) return;
    let [x, W, H] = fit.prep(); const px = v => 28 + (v + 6) / 12 * (W - 36), py = v => H / 2 - v * 9;
    axes(x, W, H, 22); x.strokeStyle = css('--line'); x.beginPath(); x.moveTo(24, H / 2); x.lineTo(W - 8, H / 2); x.stroke();
    x.fillStyle = css('--accent'); X.forEach((v, i) => { x.beginPath(); x.arc(px(v), py(Y[i]), 3.5, 0, 7); x.fill(); });
    const y0 = w * -6 + b, y1 = w * 6 + b;
    if (isFinite(y0) && Math.abs(y0) < 1e4 && Math.abs(y1) < 1e4) { x.strokeStyle = css('--coral'); x.lineWidth = 2.5; x.beginPath(); x.moveTo(px(-6), py(y0)); x.lineTo(px(6), py(y1)); x.stroke(); }
    [x, W, H] = lc.prep(); axes(x, W, H, 22);
    const L = loss(), bad = !isFinite(L) || L > 1e5, top = Math.max(hist[0], 1), win = Math.max(hist.length - 1, 40);
    x.strokeStyle = bad ? css('--coral') : css('--blue'); x.lineWidth = 2.5; x.beginPath();
    hist.forEach((v, i) => { const u = isFinite(v) ? Math.min(v, top) : top, X0 = 24 + i / win * (W - 34), Y0 = 10 + (1 - u / top) * (H - 36); i ? x.lineTo(X0, Y0) : x.moveTo(X0, Y0); }); x.stroke();
    label(x, 'error', 30, 18); label(x, 'steps →', W - 62, H - 6);
    { const i = hist.length - 1, v = isFinite(hist[i]) ? Math.min(hist[i], top) : top; x.beginPath(); x.arc(24 + i / win * (W - 34), 10 + (1 - v / top) * (H - 36), 6, 0, 7); x.fillStyle = css('--amber'); x.fill(); x.strokeStyle = css('--bg'); x.lineWidth = 2.5; x.stroke(); }
    if (bad && !warned) { warned = true; emit(s.fig, 'diverge'); }
    stat.textContent = bad ? `step ${hist.length - 1}  error exploded: the learning rate is too high` : `step ${hist.length - 1}  slope=${w.toFixed(2)}  intercept=${b.toFixed(2)}  error=${L.toFixed(3)}`;
  }
  const play = button(s.bar, 'Play', () => { if (timer) return stop(); play.textContent = 'Pause'; timer = setInterval(() => { step(); draw(); const L = hist.at(-1), P = hist.at(-2); if (!isFinite(L) || L > 1e5 || hist.length > 600 || Math.abs(L - P) < 1e-7) stop(); }, speed); }, 'primary');
  button(s.bar, 'Step ×10', () => { for (let i = 0; i < 10; i++) step(); draw(); }); button(s.bar, 'Replay', () => { reset(); play.click(); }); button(s.bar, 'Reset', reset);
  if (!compact) slider(s.bar, 'Speed', { min: 1, max: 5, step: 1, value: 3, fmt: v => ['', 'slow', 'calm', 'normal', 'fast', 'turbo'][v] }, v => { speed = [0, 160, 90, 45, 22, 8][v]; if (timer) { stop(); play.click(); } });
  const sl = slider(s.bar, 'Learning rate', { min: 0.001, max: 0.15, step: 0.001, value: lr, fmt: v => (+v).toFixed(3) }, v => { lr = v; reset(); });
  if (presets && !compact) [['Too small', 0.002], ['Good', 0.03], ['Edge of stable', 0.1], ['Diverges', 0.13]].forEach(([t, v]) => button(s.bar, t, () => { lr = v; sl.set(v); reset(); }, 'ghost'));
  if (compact) s.bar.hidden = true;
  reset(); if (autoplay) { if (reduced()) { for (let i = 0; i < 200; i++) step(); draw(); } else play.click(); }
}

// ---- Mini project: predict campaign revenue from ad spend, visitors and engagement.
export function revenue(el) {
  const D = campaigns(), F = [['adSpend', 'Ad spend (£)', 500, 5000, 50], ['visitors', 'Visitors', 1000, 20000, 250], ['engagement', 'Engagement rate', 0.2, 0.8, 0.01]], sp = splitIdx(D.length, 0.7, 4);
  let use = [true, true, true], inp = [3000, 9000, 0.5], model, M;
  const s = shell(el, 'Tick the features the model may use. It learns on 70% of 80 past campaigns and is scored on the 30% it has never seen.', () => draw());
  const grid = document.createElement('div'); grid.className = 'wgrid'; s.body.append(grid);
  const c = canvas(grid, 260, 'Actual against predicted revenue on test campaigns'), side = document.createElement('div'); grid.append(side);
  function fit() {
    const ix = F.map((_, j) => j).filter(j => use[j]); if (!ix.length) { model = null; return; }
    const X = i => ix.map(j => D[i][F[j][0]]); model = { ix, m: ols(sp.train.map(X), sp.train.map(i => D[i].revenue)) };
    const yhat = sp.test.map(i => model.m.predict(X(i))); M = { ...regMetrics(sp.test.map(i => D[i].revenue), yhat), yhat };
  }
  function draw() {
    fit(); const [x, w, H] = c.prep(); axes(x, w, H, 30);
    if (!model) { side.innerHTML = '<p class="wstat">Select at least one feature.</p>'; return; }
    const act = sp.test.map(i => D[i].revenue), mx = Math.max(...act, ...M.yhat) * 1.05, px = v => 40 + v / mx * (w - 52), py = v => H - 30 - v / mx * (H - 42);
    x.strokeStyle = css('--mute'); x.setLineDash([5, 5]); x.beginPath(); x.moveTo(px(0), py(0)); x.lineTo(px(mx), py(mx)); x.stroke(); x.setLineDash([]);
    x.fillStyle = css('--accent'); act.forEach((a, i) => { x.beginPath(); x.arc(px(a), py(M.yhat[i]), 4, 0, 7); x.fill(); });
    label(x, 'Actual revenue →', w - 124, H - 8); label(x, 'Predicted', 46, 18);
    const names = model.ix.map(j => F[j][0]), p = model.m.predict(model.ix.map(j => inp[j]));
    side.innerHTML = `<dl class="kpis"><div><dt>MAE</dt><dd>£${Math.round(M.mae)}</dd></div><div><dt>RMSE</dt><dd>£${Math.round(M.rmse)}</dd></div><div><dt>R²</dt><dd>${M.r2.toFixed(2)}</dd></div></dl>
      <p class="wstat">Typical miss on unseen campaigns: about <b>£${Math.round(M.mae)}</b>. The model explains <b>${(M.r2 * 100).toFixed(0)}%</b> of the variation in revenue.</p>
      <p class="wstat mono">revenue = ${model.m.b.toFixed(0)} ${names.map((n, k) => `${model.m.w[k] >= 0 ? '+' : '−'} ${Math.abs(model.m.w[k]).toFixed(2)}×${n}`).join(' ')}</p>
      <p class="wout"><b>New campaign → predicted revenue £${Math.round(p).toLocaleString()}</b></p>`;
  }
  checks(s.bar, 'Features:', F.map(([k, t], j) => [j, t, true]), e => { use[+e.target.value] = e.target.checked; draw(); });
  const row = document.createElement('div'); row.className = 'wbar'; row.style.borderTop = '1px solid var(--line)'; s.body.before(row);
  F.forEach(([k, t, mn, mxv, st], j) => slider(row, 'New: ' + t, { min: mn, max: mxv, step: st, value: inp[j], fmt: v => j === 2 ? (+v).toFixed(2) : Math.round(v).toLocaleString() }, v => { inp[j] = v; draw(); }));
  draw();
}

// ---- Under/over-fitting: polynomial complexity slider.
export function complexity(el, opts = {}) {
  const f0 = x => Math.sin(Math.PI * x), r = rng(11), r2 = rng(99);
  const tr = Array.from({ length: 12 }, (_, i) => { const x = -1 + 2 * (i + 0.5) / 12; return [x, f0(x) + gauss(r) * 0.25]; });
  const te = Array.from({ length: 200 }, () => { const x = r2() * 2 - 1; return [x, f0(x) + gauss(r2) * 0.25]; });
  let deg = 1, lam = 0, first = true;
  const s = shell(el, 'Dashed grey = the true pattern. Teal dots = 12 training points. Red = what the model learned. Test error uses 200 fresh points.', () => draw());
  const c = canvas(s.body, 280, 'Polynomial fit to noisy points'), st = note(s.body); st.classList.add('mono');
  function solve(d, lam) {
    const n = d + 1, A = Array.from({ length: n }, () => Array(n + 1).fill(0));
    tr.forEach(([x, y]) => { const p = Array.from({ length: n }, (_, k) => x ** k); for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += p[i] * p[j]; A[i][n] += p[i] * y; } });
    for (let i = 0; i < n; i++) A[i][i] += lam;
    for (let i = 0; i < n; i++) { let m = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k; [A[i], A[m]] = [A[m], A[i]]; for (let k = i + 1; k < n; k++) { const q = A[k][i] / A[i][i]; for (let j = i; j <= n; j++) A[k][j] -= q * A[i][j]; } }
    const w = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let v = A[i][n]; for (let j = i + 1; j < n; j++) v -= A[i][j] * w[j]; w[i] = v / A[i][i]; } return w;
  }
  const ev = (w, x) => w.reduce((a, c, k) => a + c * x ** k, 0), mse = (w, D) => D.reduce((a, [x, y]) => a + (ev(w, x) - y) ** 2, 0) / D.length;
  function draw() {
    const [x, W, H] = c.prep(), px = v => 20 + (v + 1) / 2 * (W - 30), py = v => H / 2 - v * (H / 5.2), w = solve(deg, lam); axes(x, W, H, 16);
    x.setLineDash([5, 5]); x.strokeStyle = css('--mute'); x.lineWidth = 1.5; x.beginPath(); for (let i = 0; i <= 100; i++) { const v = -1 + i / 50; i ? x.lineTo(px(v), py(f0(v))) : x.moveTo(px(v), py(f0(v))); } x.stroke(); x.setLineDash([]);
    x.save(); x.beginPath(); x.rect(20, 0, W - 20, H); x.clip(); x.strokeStyle = css('--coral'); x.lineWidth = 2.5; x.beginPath(); for (let i = 0; i <= 200; i++) { const v = -1 + i / 100, y = ev(w, v); i ? x.lineTo(px(v), py(y)) : x.moveTo(px(v), py(y)); } x.stroke(); x.restore();
    x.fillStyle = css('--accent'); tr.forEach(([a, b]) => { x.beginPath(); x.arc(px(a), py(b), 4.2, 0, 7); x.fill(); });
    const a = mse(w, tr), b = mse(w, te), zone = deg <= 2 && !lam ? 'Too simple (underfitting)' : b > 3 * a + 0.05 ? 'Too complex (overfitting)' : 'Good fit';
    opts.onChange?.({ deg, lam, train: a, test: b });
    if (!first) { if (zone.startsWith('Too complex')) emit(s.fig, 'overfit'); else if (zone === 'Good fit') emit(s.fig, 'good'); } first = false;
    st.innerHTML = `<b>${zone}</b>   complexity ${deg}${lam ? `, penalty ${lam}` : ''}   train error ${a.toFixed(3)}   test error <b class="${b > 0.4 ? 'bad' : ''}">${b > 1e3 ? '>1000' : b.toFixed(3)}</b>`;
  }
  slider(s.bar, 'Model complexity', { min: 1, max: 11, step: 1, value: 1 }, v => { deg = v; draw(); });
  slider(s.bar, 'Regularization', { min: 0, max: 4, step: 1, value: 0, fmt: v => v ? (10 ** (v - 5)).toExponential(0) : 'off' }, v => { lam = v ? 10 ** (v - 5) : 0; draw(); });
  [['Too simple', 1], ['Good fit', 3], ['Too complex', 10]].forEach(([t, v]) => button(s.bar, t, () => { deg = v; s.bar.querySelector('input').value = v; s.bar.querySelector('output').textContent = v; draw(); }, 'ghost'));
  draw();
}
