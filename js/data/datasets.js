// Synthetic, deterministic digital-analytics datasets (no real people). Generated once, cached.
import { rng, gauss, clamp } from '../widgets/core.js';
const sig = z => 1 / (1 + Math.exp(-z)), cache = {};
const once = (k, f) => cache[k] ||= f();

// Website sessions: will the visitor convert?
export const visitors = () => once('v', () => {
  const r = rng(42), dev = ['mobile', 'desktop', 'tablet'], src = ['organic', 'paid', 'email', 'social'];
  return Array.from({ length: 240 }, (_, i) => {
    const duration = Math.round(clamp(r() ** 1.4 * 600 + 10, 10, 600)), pages = Math.round(clamp(1 + duration / 60 + gauss(r) * 2, 1, 15)),
      adClicks = Math.floor(r() * 4), returning = r() < 0.35 ? 1 : 0, p = sig(-4.4 + 0.006 * duration + 0.24 * pages + 0.35 * adClicks + 1.1 * returning + gauss(r) * 0.4);
    return { visitor: 'V' + (1001 + i), device: dev[Math.floor(r() * 3)], source: src[Math.floor(r() * 4)], duration, pages, adClicks, returning, converted: r() < p ? 1 : 0 };
  });
});
// Marketing campaigns: how much revenue will they generate?
export const campaigns = () => once('c', () => {
  const r = rng(5);
  return Array.from({ length: 80 }, (_, i) => {
    const adSpend = Math.round(500 + r() * 4500), visitorsN = Math.round(clamp(3000 + r() * 12000 + adSpend * 0.5, 1000, 20000)), engagement = +(0.2 + r() * 0.6).toFixed(2);
    return { campaign: 'C' + (101 + i), adSpend, visitors: visitorsN, engagement, revenue: Math.round(1.9 * adSpend + 0.25 * visitorsN + 5000 * engagement + gauss(r) * 900) };
  });
});
// Customers with four hidden groups for clustering.
export const customers = () => once('u', () => {
  const r = rng(11), G = [[22, 6, 380, 80, 25], [24, 1, 35, 85, 45], [9, 2, 120, 50, 50], [3, .5, 25, 15, 40]], out = [];
  G.forEach(([s, f, sp, e, n]) => { for (let i = 0; i < n; i++) out.push({ sessions: Math.round(clamp(s * (1 + gauss(r) * .2), 1, 60)), frequency: +clamp(f * (1 + gauss(r) * .25), 0.1, 12).toFixed(1), spend: Math.round(clamp(sp * (1 + gauss(r) * .22), 5, 800)), engagement: Math.round(clamp(e * (1 + gauss(r) * .18), 2, 100)) }); });
  return out.map((c, i, a) => a[(i * 37) % a.length]); // fixed shuffle
});
