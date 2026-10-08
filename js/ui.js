// Cross-page UI behaviours: magnetic buttons, reveal-on-scroll, shortcuts panel, profile, themes.
import { store } from './store.js';
import { level, snapshot } from './xp.js';

export const THEMES = [['midnight', 'Midnight Lab'], ['soft', 'Soft Discovery'], ['forest', 'Forest Studio']];
const LEGACY = { dark: 'midnight', light: 'soft' };
export const getTheme = () => { const t = store.get('theme', null); return THEMES.some(x => x[0] === t) ? t : LEGACY[t] || (matchMedia('(prefers-color-scheme:light)').matches ? 'soft' : 'midnight'); };
export function setTheme(t) { document.documentElement.dataset.theme = t; store.set('theme', t); dispatchEvent(new Event('themechange')); }
const calm = () => matchMedia('(prefers-reduced-motion:reduce)').matches || document.documentElement.hasAttribute('data-calm');

export function magnetic(root = document) {
  if (matchMedia('(pointer:coarse)').matches) return;
  root.querySelectorAll('[data-magnetic]').forEach(b => {
    b.addEventListener('pointermove', e => { if (calm()) return; const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.x - r.width / 2) * .18}px,${(e.clientY - r.y - r.height / 2) * .28}px)`; });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });
}
export function reveal(root = document) {
  const els = root.querySelectorAll('.reveal:not(.in)'); if (!('IntersectionObserver' in window) || calm()) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  els.forEach(e => io.observe(e));
}

function modal(html) {
  const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div role="dialog" aria-modal="true">${html}</div>`;
  const close = () => { m.remove(); removeEventListener('keydown', esc); }, esc = e => e.key === 'Escape' && close();
  m.onclick = e => { if (e.target === m || e.target.closest('[data-close]')) close(); }; addEventListener('keydown', esc); document.body.append(m);
  m.querySelector('input,button')?.focus(); return m;
}
export function shortcuts() {
  modal(`<h2>Keyboard shortcuts</h2><dl class="keys">
    <dt><kbd>?</kbd></dt><dd>This panel</dd><dt><kbd>←</kbd><kbd>→</kbd></dt><dd>Previous / next module (on a lesson)</dd>
    <dt><kbd>g</kbd> <kbd>h</kbd></dt><dd>Go home</dd><dt><kbd>g</kbd> <kbd>l</kbd></dt><dd>Go to the Lab</dd><dt><kbd>g</kbd> <kbd>m</kbd></dt><dd>Go to Modules</dd>
    <dt><kbd>g</kbd> <kbd>c</kbd></dt><dd>Go to Challenges</dd><dt><kbd>g</kbd> <kbd>p</kbd></dt><dd>Go to Progress</dd>
    <dt><kbd>t</kbd></dt><dd>Cycle theme</dd><dt><kbd>Esc</kbd></dt><dd>Close dialogs</dd></dl><p style="margin:18px 0 0"><button class="btn sm" data-close type="button">Got it</button></p>`);
}
export function profile() {
  const s = snapshot(), name = store.get('name', '');
  const m = modal(`<h2>Your profile</h2><label class="field"><span class="label">Display name</span><input id="pf-n" maxlength="24" value="${name.replace(/"/g, '&quot;')}" placeholder="Anonymous learner"></label>
    <p class="lead" style="font-size:.95rem">Level ${level(s.xp)} · ${s.xp} XP · ${s.streak}-day streak · ${s.done.length}/6 modules. Everything is stored only in this browser.</p>
    <p style="display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 0"><button class="btn p sm" id="pf-s" type="button">Save</button><button class="btn sm" id="pf-r" type="button" style="color:var(--coral)">Reset all progress…</button></p>`);
  m.querySelector('#pf-s').onclick = () => { store.set('name', m.querySelector('#pf-n').value.trim()); m.querySelector('[data-close]')?.click(); m.remove(); };
  m.querySelector('#pf-r').onclick = () => { if (confirm('Erase all MLVERSE progress in this browser? This cannot be undone.')) { Object.keys(localStorage).filter(k => k.startsWith('mlverse:') && !/theme|pixelPrefs|sound/.test(k)).forEach(k => localStorage.removeItem(k)); location.reload(); } };
}
export function initKeys() {
  let g = 0; const R = { h: 'index.html', l: 'lab.html', m: 'modules.html', c: 'challenges.html', p: 'progress.html', n: 'learn.html' };
  addEventListener('keydown', e => {
    if (e.target.matches?.('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey || document.querySelector('.modal')) return;
    if (e.key === '?') { e.preventDefault(); shortcuts(); }
    else if (e.key === 't') { const i = THEMES.findIndex(x => x[0] === getTheme()); setTheme(THEMES[(i + 1) % 3][0]); }
    else if (e.key === 'g') { g = Date.now(); }
    else if (g && Date.now() - g < 1200 && R[e.key]) { g = 0; location.href = R[e.key]; }
  });
}
