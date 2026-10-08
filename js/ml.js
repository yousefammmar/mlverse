// Tiny, dependency-free ML toolkit used by the widgets. Everything is deterministic.
import { rng } from './widgets/core.js';
const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const d2 = (a, b) => a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0);
const sig = z => 1 / (1 + Math.exp(-z));

export function splitIdx(n, frac = 0.7, seed = 1) {
  const r = rng(seed), idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const cut = Math.round(n * frac); return { train: idx.slice(0, cut), test: idx.slice(cut) };
}
export function scaler(X) {
  const p = X[0].length, m = [], s = [];
  for (let j = 0; j < p; j++) { const c = X.map(r => r[j]), mu = mean(c); m.push(mu); s.push(Math.sqrt(mean(c.map(v => (v - mu) ** 2))) || 1); }
  return { m, s, t: r => r.map((v, j) => (v - m[j]) / s[j]) };
}
export function logistic(X, y, { iters = 600, lr = 0.4 } = {}) {
  const sc = scaler(X), Z = X.map(sc.t), p = Z[0].length, w = Array(p).fill(0); let b = 0;
  for (let it = 0; it < iters; it++) {
    const gw = Array(p).fill(0); let gb = 0;
    Z.forEach((z, i) => { const e = sig(dot(w, z) + b) - y[i]; z.forEach((v, j) => gw[j] += e * v); gb += e; });
    for (let j = 0; j < p; j++) w[j] -= lr * gw[j] / Z.length; b -= lr * gb / Z.length;
  }
  return { predict: r => sig(dot(w, sc.t(r)) + b), w };
}
export function knn(X, y, k = 5) {
  const sc = scaler(X), Z = X.map(sc.t);
  return { predict: r => { const z = sc.t(r); return mean(Z.map((q, i) => [d2(z, q), i]).sort((a, b) => a[0] - b[0]).slice(0, k).map(([, i]) => y[i])); } };
}
export function tree(X, y, depth = 3, minLeaf = 5) {
  const sse = ix => { const m = mean(ix.map(i => y[i])); return ix.reduce((s, i) => s + (y[i] - m) ** 2, 0); };
  const build = (ix, d) => {
    const v = mean(ix.map(i => y[i])); if (d === 0 || ix.length < 2 * minLeaf) return { v };
    let best = null; const base = sse(ix);
    for (let f = 0; f < X[0].length; f++) {
      const vals = [...new Set(ix.map(i => X[i][f]))].sort((a, b) => a - b), step = Math.max(1, Math.floor(vals.length / 16));
      for (let q = 0; q + 1 < vals.length; q += step) {
        const t = (vals[q] + vals[q + 1]) / 2, L = ix.filter(i => X[i][f] <= t), R = ix.filter(i => X[i][f] > t);
        if (L.length < minLeaf || R.length < minLeaf) continue;
        const s = sse(L) + sse(R); if (!best || s < best.s) best = { s, f, t, L, R };
      }
    }
    return !best || best.s >= base - 1e-9 ? { v } : { f: best.f, t: best.t, l: build(best.L, d - 1), r: build(best.R, d - 1), v };
  };
  const root = build(X.map((_, i) => i), depth);
  return { predict: r => { let n = root; while (n.f !== undefined) n = r[n.f] <= n.t ? n.l : n.r; return n.v; } };
}
export function ols(X, y, lam = 1e-6) { // multiple linear regression via normal equations
  const n = X[0].length + 1, A = Array.from({ length: n }, () => Array(n + 1).fill(0));
  X.forEach((r, k) => { const p = [1, ...r]; for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += p[i] * p[j]; A[i][n] += p[i] * y[k]; } });
  for (let i = 1; i < n; i++) A[i][i] += lam * A[i][i];
  for (let i = 0; i < n; i++) { let m = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k; [A[i], A[m]] = [A[m], A[i]];
    for (let k = i + 1; k < n; k++) { const q = A[k][i] / A[i][i]; for (let j = i; j <= n; j++) A[k][j] -= q * A[i][j]; } }
  const w = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let v = A[i][n]; for (let j = i + 1; j < n; j++) v -= A[i][j] * w[j]; w[i] = v / A[i][i]; }
  return { b: w[0], w: w.slice(1), predict: r => w[0] + dot(w.slice(1), r) };
}
export const baseline = y => { const m = mean(y); return { predict: () => m }; };
export function clfMetrics(y, p, t = 0.5) {
  let TP = 0, FP = 0, TN = 0, FN = 0; y.forEach((v, i) => { const q = p[i] >= t; v ? (q ? TP++ : FN++) : (q ? FP++ : TN++); });
  const acc = (TP + TN) / y.length, prec = TP / (TP + FP), rec = TP / (TP + FN); return { TP, FP, TN, FN, acc, prec, rec, f1: 2 * prec * rec / (prec + rec) };
}
export function regMetrics(y, p) {
  const e = y.map((v, i) => v - p[i]), my = mean(y), mae = mean(e.map(Math.abs)), mse = mean(e.map(v => v * v));
  return { mae, mse, rmse: Math.sqrt(mse), r2: 1 - e.reduce((s, v) => s + v * v, 0) / (y.reduce((s, v) => s + (v - my) ** 2, 0) || 1) };
}
export function kmeans(X, k, seed = 3) {
  const sc = scaler(X), Z = X.map(sc.t), r = rng(seed); let C = [Z[Math.floor(r() * Z.length)]];
  while (C.length < k) { const D = Z.map(z => Math.min(...C.map(c => d2(z, c)))); let u = r() * D.reduce((a, b) => a + b, 0), i = 0; while ((u -= D[i]) > 0 && i < D.length - 1) i++; C.push(Z[i]); }
  const a = Array(Z.length).fill(-1);
  const assign = () => { let ch = false; Z.forEach((z, i) => { let b = 0, bd = Infinity; C.forEach((c, j) => { const d = d2(z, c); if (d < bd) { bd = d; b = j; } }); if (a[i] !== b) { a[i] = b; ch = true; } }); return ch; };
  const update = () => { C = C.map((c, j) => { const m = Z.filter((_, i) => a[i] === j); return m.length ? c.map((_, f) => mean(m.map(z => z[f]))) : c; }); };
  const run = () => { for (let i = 0; i < 60; i++) { if (!assign()) break; update(); } };
  return { assign, update, run, a, inertia: () => Z.reduce((s, z, i) => s + d2(z, C[a[i]]), 0), z: j => C[j], centroid: j => C[j].map((v, f) => v * sc.s[f] + sc.m[f]), k };
}
export const FIT = { logistic, knn: (X, y) => knn(X, y, 7), tree: (X, y) => tree(X, y, 3, 6), linear: ols, baseline: (X, y) => baseline(y) };
