// Progress: XP, streak, level, activity log, lab history, achievements. All state in localStorage via store.
import { store } from './store.js';
import { say } from './pixel.js';

const day = d => new Date(d).toISOString().slice(0, 10);
export const level = xp => Math.floor(xp / 100) + 1;
export const done = () => store.get('done', []);
export const LABS = ['regline', 'gd', 'classlab', 'confusion', 'compare', 'kmeans', 'complexity', 'final'];

export function touchStreak() {
  const s = store.get('streak', { n: 0, d: '' }), t = day(Date.now());
  if (s.d === t) return;
  store.set('streak', { n: s.d === day(Date.now() - 864e5) ? s.n + 1 : 1, d: t });
}
// Count one learning action for today (drives the weekly activity chart).
export function log(n = 1) { const a = store.get('activity', {}), t = day(Date.now()); a[t] = (a[t] || 0) + n; store.set('activity', a); }
export function noteLab(id) {
  const r = store.get('recent', []).filter(x => x.id !== id); r.unshift({ id, t: Date.now() }); store.set('recent', r.slice(0, 12));
  const seen = new Set(store.get('labs', [])); if (!seen.has(id)) { seen.add(id); store.set('labs', [...seen]); }
  log(1); paint();
}
export const labsTried = () => store.get('labs', []);
export const challengesDone = () => store.get('chal', []);
export function completeChallenge(id, xp, msg) { if (challengesDone().includes(id)) return false; store.set('chal', [...challengesDone(), id]); award('chal:' + id, xp, msg); return true; }

// Award XP once per key so re-answering never farms points.
export function award(key, n, msg) {
  const got = store.get('awarded', []); if (got.includes(key)) return;
  const before = level(store.get('xp', 0));
  store.set('awarded', [...got, key]); store.set('xp', store.get('xp', 0) + n); log(2);
  const lvl = level(store.get('xp', 0));
  toast(`+${n} XP · ${msg}${lvl > before ? ` · Level ${lvl}` : ''}`); celebrate(); paint(); checkBadges();
}
export function toast(text) {
  const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = text;
  document.body.append(d); setTimeout(() => d.remove(), 3400);
}
export function celebrate(x = innerWidth / 2, y = innerHeight * .6) {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches || document.documentElement.hasAttribute('data-calm')) return;
  const cols = ['--accent', '--coral', '--amber', '--violet'].map(v => getComputedStyle(document.documentElement).getPropertyValue(v));
  for (let i = 0; i < 34; i++) {
    const b = document.createElement('i'), a = Math.random() * 6.28, d = 80 + Math.random() * 180; b.className = 'bit';
    b.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % 4]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 60}px;--rot:${Math.random() * 540}deg`;
    document.body.append(b); setTimeout(() => b.remove(), 1500);
  }
}

// ---- achievements (rule-based, derived from real progress) ----
export const BADGES = [
  { id: 'first', n: 'First Spark', d: 'Answer a quiz question correctly.', c: '--accent', g: '✦', t: s => s.q >= 1 },
  { id: 'm1', n: 'Data Whisperer', d: 'Complete Module 1.', c: '--accent', g: '▦', t: s => s.done.includes('foundations') },
  { id: 'm2', n: 'Line Drawer', d: 'Complete Module 2.', c: '--coral', g: '⟋', t: s => s.done.includes('regression') },
  { id: 'm3', n: 'Boundary Breaker', d: 'Complete Module 3.', c: '--violet', g: '◐', t: s => s.done.includes('classification') },
  { id: 'm4', n: 'Metric Maestro', d: 'Complete Module 4.', c: '--amber', g: '▤', t: s => s.done.includes('evaluation') },
  { id: 'm5', n: 'Cluster Captain', d: 'Complete Module 5.', c: '--violet', g: '◍', t: s => s.done.includes('clustering') },
  { id: 'm6', n: 'Full Stack Learner', d: 'Complete Module 6.', c: '--coral', g: '★', t: s => s.done.includes('practical') },
  { id: 'streak3', n: 'On a Roll', d: 'Reach a 3-day streak.', c: '--amber', g: '🔥', t: s => s.streak >= 3 },
  { id: 'labs5', n: 'Lab Rat', d: 'Open 5 different experiments.', c: '--accent', g: '⚗', t: s => s.labs.length >= 5 },
  { id: 'chal1', n: 'Challenger', d: 'Complete a challenge.', c: '--coral', g: '⚑', t: s => s.chal.length >= 1 },
  { id: 'chal5', n: 'Trap Dodger', d: 'Complete all 5 challenges.', c: '--violet', g: '♛', t: s => s.chal.length >= 5 },
  { id: 'lvl5', n: 'Level 5', d: 'Reach level 5.', c: '--amber', g: '5', t: s => level(s.xp) >= 5 }
];
export const snapshot = () => ({ xp: store.get('xp', 0), streak: store.get('streak', { n: 0 }).n, done: done(), q: store.get('qok', []).length, labs: store.get('labs', []), chal: challengesDone() });
export const earned = () => BADGES.filter(b => b.t(snapshot()));
function checkBadges() {
  const had = new Set(store.get('badges', [])), now = earned().filter(b => !had.has(b.id));
  if (now.length) { store.set('badges', [...had, ...now.map(b => b.id)]); setTimeout(() => { toast(`Achievement: ${now[0].n}`); say('badge', { name: now[0].n }); }, 700); }
}
export { checkBadges };

export function paint() {
  const xp = store.get('xp', 0), n = store.get('streak', { n: 0 }).n, lv = level(xp), into = xp % 100;
  const s = document.getElementById('streak'); if (s) s.innerHTML = `🔥 <span>${n}</span>`;
  const o = document.getElementById('orb'); if (o) { o.querySelector('b').textContent = lv; o.querySelector('circle.p').style.strokeDashoffset = 100.5 * (1 - into / 100); o.title = `Level ${lv} · ${into}/100 XP to next level · ${xp} XP total`; o.setAttribute('aria-label', o.title); }
}
