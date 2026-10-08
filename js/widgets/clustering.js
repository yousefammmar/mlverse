// Module 5 widget: interactive K-Means customer segmentation.
import { shell, canvas, button, choice, note, axes, label, css, table, tip, reduced } from './core.js';
import { customers } from '../data/datasets.js';
import { kmeans } from '../ml.js';

const F = [['sessions', 'Sessions'], ['frequency', 'Purchases / month'], ['spend', 'Avg spend (£)'], ['engagement', 'Engagement (%)']];
const COL = ['--accent', '--blue', '--amber', '--violet', '--coral'];
const PROFILE = z => z[2] > 0.6 && z[1] > 0.4 ? 'VIP Customers' : z[3] > 0.3 && z[2] < 0.3 ? 'Engaged Browsers' : z[3] < -0.3 ? 'Low Engagement Users' : 'Occasional Buyers';
const PLAN = { 'VIP Customers': 'Protect and reward: loyalty perks, early access. Avoid discounting people who already buy.', 'Engaged Browsers': 'They read but rarely buy: first-purchase offers, retargeting, social proof.', 'Occasional Buyers': 'Nudge frequency: reminders, seasonal campaigns, bundles.', 'Low Engagement Users': 'Low-cost win-back email; do not overspend on this group.' };

export function kmeansLab(el) {
  const D = customers(), X = D.map(r => F.map(f => r[f[0]]));
  // Like real K-Means (n_init): try several starts and keep the tightest result.
  const best = k => { let b; for (let sd = 1; sd <= 10; sd++) { const m = kmeans(X, k, sd); m.run(); if (!b || m.inertia() < b.inertia()) b = m; } return b; };
  const elbow = Array.from({ length: 8 }, (_, i) => best(i + 1).inertia());
  let k = 4, ax = 0, ay = 2, seed = 3, km, phase = 'assign', iter = 0, shown = null, raf = 0;
  const s = shell(el, 'Dots are customers. X marks are cluster centres (centroids). Step through the algorithm: assign every customer to the nearest centre, then move each centre to the middle of its group, and repeat.', () => draw());
  const grid = document.createElement('div'); grid.className = 'wgrid'; s.body.append(grid);
  const c = canvas(grid, 300, 'Customers coloured by cluster with centroids'), e = canvas(grid, 300, 'Total within-cluster spread for K from 1 to 8'), info = document.createElement('div'), st = note(s.body); s.body.append(info);
  // Glide centroids to their new positions so the update step is visible.
  const sync = animate => { const target = Array.from({ length: k }, (_, j) => km.centroid(j)); cancelAnimationFrame(raf);
    if (!animate || !shown || shown.length !== k || reduced()) { shown = target; draw(); return; }
    const from = shown.map(a => a.slice()), t0 = performance.now();
    const tk = now => { const t = Math.min(1, (now - t0) / 520), e = 1 - Math.pow(1 - t, 3); shown = target.map((c, j) => c.map((v, f) => from[j][f] + (v - from[j][f]) * e)); draw(); if (t < 1) raf = requestAnimationFrame(tk); }; raf = requestAnimationFrame(tk); };
  tip(c, (u, v) => { const ex = [Math.min(...X.map(r => r[ax])), Math.max(...X.map(r => r[ax]))], ey = [Math.min(...X.map(r => r[ay])), Math.max(...X.map(r => r[ay]))], W = c.clientWidth; let best = 1e9, bi = -1;
    X.forEach((r, i) => { const d = Math.hypot(44 + (r[ax] - ex[0]) / (ex[1] - ex[0] || 1) * (W - 60) - u, 300 - 30 - (r[ay] - ey[0]) / (ey[1] - ey[0] || 1) * (300 - 46) - v); if (d < best) { best = d; bi = i; } });
    return best < 14 ? `customer ${bi + 1}${km.a[bi] >= 0 ? ` · cluster ${km.a[bi] + 1}` : ''}<br>${F.map((f, j) => `${f[1]}: ${X[bi][j]}`).join('<br>')}` : null; });
  const fresh = run => { km = run ? best(k) : kmeans(X, k, seed); phase = 'assign'; iter = 0; shown = null; };
  const sel = (l, v, on) => { const w = document.createElement('label'); w.innerHTML = `<span>${l}</span><select>${F.map(([, t], i) => `<option value="${i}"${i === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`; w.querySelector('select').onchange = ev => { on(+ev.target.value); if (ax === ay) { if (ev.target === xs) ay = (ax + 1) % F.length; else ax = (ay + 1) % F.length; } syncSel(); draw(); }; s.bar.append(w); return w.querySelector('select'); };
  function draw() {
    const [x, W, H] = c.prep(), vx = X.map(r => r[ax]), vy = X.map(r => r[ay]), ex = [Math.min(...vx), Math.max(...vx)], ey = [Math.min(...vy), Math.max(...vy)];
    const px = v => 44 + (v - ex[0]) / (ex[1] - ex[0] || 1) * (W - 60), py = v => H - 30 - (v - ey[0]) / (ey[1] - ey[0] || 1) * (H - 46);
    axes(x, W, H, 30); label(x, F[ax][1] + ' →', W - 150, H - 8); label(x, F[ay][1], 50, 18);
    X.forEach((r, i) => { x.beginPath(); x.arc(px(r[ax]), py(r[ay]), 3.8, 0, 7); const a = km.a[i]; if (a < 0) { x.strokeStyle = css('--mute'); x.lineWidth = 1.2; x.stroke(); } else { x.globalAlpha = .85; x.fillStyle = css(COL[a % 5]); x.fill(); x.globalAlpha = 1; } });
    for (let j = 0; j < k; j++) { const ce = (shown && shown[j]) || km.centroid(j), u = px(ce[ax]), v = py(ce[ay]); x.strokeStyle = css('--ink'); x.lineWidth = 4; x.beginPath(); x.moveTo(u - 8, v - 8); x.lineTo(u + 8, v + 8); x.moveTo(u + 8, v - 8); x.lineTo(u - 8, v + 8); x.stroke(); x.strokeStyle = css(COL[j % 5]); x.lineWidth = 2; x.stroke(); }
    const [y, EW, EH] = e.prep(), mx = Math.max(...elbow); axes(y, EW, EH, 26);
    elbow.forEach((v, i) => { const bw = (EW - 50) / 8 - 8, bx = 36 + i * (bw + 8), bh = v / mx * (EH - 56); y.fillStyle = css(i + 1 === k ? '--accent' : '--line2'); y.fillRect(bx, EH - 26 - bh, bw, bh); label(y, String(i + 1), bx + bw / 2 - 3, EH - 10, i + 1 === k ? '--accent' : '--mute'); });
    label(y, 'spread within clusters (lower = tighter)', 34, 18); label(y, 'K →', EW - 30, EH - 10);
    const sizes = Array.from({ length: k }, (_, j) => km.a.filter(a => a === j).length), done = km.a.every(a => a >= 0);
    st.textContent = done ? `K = ${k} · iteration ${iter} · total spread ${km.inertia().toFixed(0)}` : `K = ${k} · centres placed at random customers. Press Step to assign customers.`;
    info.innerHTML = done ? table(['Cluster', 'Customers', ...F.map(f => f[1]), 'Profile', 'Suggested strategy'], sizes.map((n, j) => { const ce = km.centroid(j), p = PROFILE(km.z(j)); return [`<i class="k" style="background:${css(COL[j % 5])}"></i>${j + 1}`, n, ...ce.map((v, f) => f === 1 ? v.toFixed(1) : Math.round(v)), `<b>${p}</b>`, PLAN[p]]; })) + '<p class="wstat">Profiles are labels this page suggests from each centre; the algorithm itself only finds groups, and people decide what they mean.</p>' : '';
  }
  choice(s.bar, 'K:', [2, 3, 4, 5].map(v => [v, String(v)]), k, v => { k = v; fresh(true); sync(false); });
  button(s.bar, 'Step', () => { if (phase === 'assign') { km.assign(); phase = 'update'; } else { km.update(); phase = 'assign'; iter++; } draw(); sync(true); }, 'primary');
  button(s.bar, 'Run to finish', () => { km.run(); phase = 'assign'; draw(); sync(true); }); button(s.bar, 'Restart with new centres', () => { seed++; fresh(false); sync(false); }, 'ghost');
  const xs = sel('X axis', ax, v => ax = v), ys = sel('Y axis', ay, v => ay = v), syncSel = () => { xs.value = ax; ys.value = ay; };
  fresh(true); draw();
}
