// Hero visualization: real KNN + logistic regression on synthetic visitor data (an educational demo, labelled as such).
import { visitors } from './data/datasets.js';
import { css, reduced, clamp, rng } from './widgets/core.js';
import { scaler, logistic } from './ml.js';
import { say } from './pixel.js';

export function heroViz(el) {
  const D = visitors().slice(0, 90), still = reduced() || document.documentElement.hasAttribute('data-calm');
  el.innerHTML = `<div class="hv"><canvas role="img" aria-label="Interactive scatter of 90 synthetic website visitors. Hover to see a K-nearest-neighbours prediction, click a point to flip its label, press Train to fit logistic regression."></canvas>
    <div class="hv-bar"><button class="wb primary" type="button" id="hv-train">Train model</button><button class="wb" type="button" id="hv-paint" aria-pressed="false">Paint: converted</button><button class="wb ghost" type="button" id="hv-reset">Reset</button></div>
    <p class="hv-note mono" id="hv-note" role="status"></p><p class="hv-cap">Educational demo · 90 synthetic visitors · hover = K-nearest neighbours (k=5) · Train = logistic regression</p></div>`;
  const c = el.querySelector('canvas'), x = c.getContext('2d'), note = el.querySelector('#hv-note'), H = 400;
  let pts, W = 600, mouse = null, model = null, paint = 1, anim = 0, t0 = performance.now(), sc;
  const init = () => { pts = D.map((r, i) => ({ x: r.duration, y: r.pages, c: r.converted, i, ph: i * 1.7 })); model = null; refit(); };
  const refit = () => { sc = scaler(pts.map(p => [p.x, p.y])); };
  const P = p => [34 + (p.x - 10) / 590 * (W - 60), H - 34 - (p.y - 1) / 14 * (H - 60)];
  const unP = (u, v) => [10 + (u - 34) / (W - 60) * 590, 1 + (H - 34 - v) / (H - 60) * 14];
  const knn = (mx, my, k = 5) => { const z = sc.t([mx, my]); return pts.map(p => [Math.hypot(...sc.t([p.x, p.y]).map((v, j) => v - z[j])), p]).sort((a, b) => a[0] - b[0]).slice(0, k).map(a => a[1]); };
  function draw(now) {
    const dpr = devicePixelRatio || 1; W = c.clientWidth; if (c.width !== W * dpr) { c.width = W * dpr; c.height = H * dpr; } x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    const t = (now - t0) / 1000, cv = css('--accent'), nc = css('--coral'), mu = css('--mute');
    if (model) for (let u = 30; u < W - 10; u += 14) for (let v = 6; v < H - 30; v += 14) { const [a, b] = unP(u + 7, v + 7), pr = model.predict([a, b]); x.globalAlpha = .05 + .16 * Math.min(1, Math.abs(pr - .5) * 2); x.fillStyle = pr >= .5 ? cv : nc; x.fillRect(u, v, 14, 14); } x.globalAlpha = 1;
    // constellation links between nearby points
    x.lineWidth = 1; x.strokeStyle = css('--line2'); x.globalAlpha = .5; pts.forEach((p, i) => { const [a, b] = P(p); for (let j = i + 1; j < Math.min(pts.length, i + 6); j++) { const [u, v] = P(pts[j]); if (Math.hypot(a - u, b - v) < 46) { x.beginPath(); x.moveTo(a, b); x.lineTo(u, v); x.stroke(); } } }); x.globalAlpha = 1;
    let near = []; if (mouse) { const [mx, my] = unP(mouse[0], mouse[1]); near = knn(mx, my); }
    pts.forEach(p => {
      const age = still ? 1 : clamp((now - t0 - p.i * 14) / 420, 0, 1); if (age <= 0) return; let [a, b] = P(p); if (!still) { a += Math.sin(t * .7 + p.ph) * 1.6; b += Math.cos(t * .6 + p.ph) * 1.6; }
      const hot = near.includes(p); x.beginPath(); x.arc(a, b, (hot ? 7 : 5) * (0.4 + age * .6), 0, 7); x.fillStyle = p.c ? cv : nc; x.globalAlpha = age * (hot || !mouse ? 1 : .55); x.fill(); x.globalAlpha = 1;
      if (hot) { x.strokeStyle = css('--ink'); x.lineWidth = 1.4; x.stroke(); }
    });
    if (mouse) { const [mx, my] = unP(mouse[0], mouse[1]); x.strokeStyle = css('--ink'); x.lineWidth = 1; x.globalAlpha = .55; x.setLineDash([3, 4]); near.forEach(p => { const [a, b] = P(p); x.beginPath(); x.moveTo(mouse[0], mouse[1]); x.lineTo(a, b); x.stroke(); }); x.setLineDash([]); x.globalAlpha = 1;
      const pr = near.reduce((s, p) => s + p.c, 0) / near.length; x.beginPath(); x.arc(mouse[0], mouse[1], 9, 0, 7); x.fillStyle = css('--amber'); x.fill(); x.strokeStyle = css('--bg'); x.lineWidth = 3; x.stroke();
      note.innerHTML = model ? `Logistic regression: <b>${(model.predict([mx, my]) * 100).toFixed(0)}%</b> chance this visitor converts` : `KNN: ${near.filter(p => p.c).length} of 5 nearest visitors converted → <b>${pr >= .5 ? 'predict convert' : 'predict not convert'}</b>`; }
    else if (!model) note.textContent = 'Move your pointer over the cloud. A new visitor appears and the model votes.';
    if (anim || !still) requestAnimationFrame(draw);
  }
  const pos = e => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  c.addEventListener('pointermove', e => { mouse = pos(e); if (still) draw(performance.now()); });
  c.addEventListener('pointerleave', () => { mouse = null; if (still) draw(performance.now()); });
  c.addEventListener('click', e => { const [u, v] = pos(e); let best = 1e9, bp; pts.forEach(p => { const [a, b] = P(p), d = Math.hypot(a - u, b - v); if (d < best) { best = d; bp = p; } });
    if (best < 14) bp.c = bp.c ? 0 : 1; else { const [a, b] = unP(u, v); pts.push({ x: clamp(a, 10, 600), y: clamp(b, 1, 15), c: paint, i: 0, ph: Math.random() * 6 }); }
    refit(); if (model) fit(false); else if (still) draw(performance.now()); });
  function fit(animate = true) {
    const X = pts.map(p => [p.x, p.y]), y = pts.map(p => p.c);
    if (!animate || still) { model = logistic(X, y, { iters: 300 }); draw(performance.now()); return; }
    let it = 0; anim = 1; const step = () => { it += 6; model = logistic(X, y, { iters: it, lr: .25 }); if (it < 120) requestAnimationFrame(step); else { anim = 0; say('trained'); } }; step();
  }
  el.querySelector('#hv-train').onclick = () => fit(true);
  el.querySelector('#hv-paint').onclick = e => { paint = paint ? 0 : 1; e.target.textContent = paint ? 'Paint: converted' : 'Paint: not converted'; e.target.setAttribute('aria-pressed', !paint); };
  el.querySelector('#hv-reset').onclick = () => { init(); if (still) draw(performance.now()); };
  addEventListener('themechange', () => still && draw(performance.now()));
  init(); t0 = performance.now(); requestAnimationFrame(draw);
}
