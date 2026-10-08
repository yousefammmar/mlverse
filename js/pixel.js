// PIXEL — the MLVERSE learning companion. Lightweight inline SVG, optional and dismissible.
import { store } from './store.js';

const LINES = {
  return: ['You\'re back! The data missed you.', 'Welcome back. The models stayed up all night waiting.'],
  poor: ['Well… at least the model is confidently confused.', 'That score is a plot twist. Check the features?'],
  overfit: ['Your model memorized the homework. The exam? Not so much.', 'Training error: tiny. Test error: huge. Classic memorizer.'],
  quiz: ['Big brain energy detected.', 'Quiz cleared. Your neurons are showing off.'],
  bug: ['Unexpected plot twist. Let\'s investigate.', 'Something broke. Reload and I\'ll pretend I didn\'t notice.'],
  trained: ['Your model has officially learned something. Unlike my coffee machine.', 'Trained! It now knows more than it did a second ago.'],
  outlier: ['See how one far-away point yanks the whole line? That\'s an outlier.', 'One point, big drama. Least squares hates surprises.'],
  good: ['Nice fit. Training and test are finally on speaking terms.'],
  badge: ['New badge: {name}. Display it with pride.'],
  diverge: ['That learning rate was… ambitious. The loss left the building.'],
  hint: ['Try dragging one point far away.', 'Tip: move a slider and watch what changes first.']
};
const MOODS = { return: 'happy', poor: 'confused', overfit: 'oops', quiz: 'proud', bug: 'oops', trained: 'proud', outlier: 'oops', good: 'happy', badge: 'proud', diverge: 'oops', hint: 'happy' };
let n = 0, last = 0, timer = 0, wrap, btn, bubble;
const prefs = () => store.get('pixelPrefs', { mute: false, calm: false });
const save = p => store.set('pixelPrefs', p);

export function pixelSVG(mood = 'happy') {
  const id = 'pxg' + (++n), eyes = {
    happy: '<ellipse class="eye" cx="24" cy="31" rx="3.6" ry="4.4"/><ellipse class="eye" cx="40" cy="31" rx="3.6" ry="4.4"/><circle class="shine" cx="25.2" cy="29.4" r="1.2"/><circle class="shine" cx="41.2" cy="29.4" r="1.2"/>',
    confused: '<ellipse class="eye" cx="24" cy="31" rx="3" ry="3.4"/><ellipse class="eye" cx="40" cy="30" rx="4.4" ry="5.4"/><circle class="shine" cx="41.4" cy="28" r="1.4"/>',
    proud: '<path class="mouth" d="M19 32q5-7 10 0M35 32q5-7 10 0"/>',
    oops: '<circle cx="24" cy="30" r="5" fill="#fff" stroke="#04201C" stroke-width="2"/><circle cx="40" cy="30" r="5" fill="#fff" stroke="#04201C" stroke-width="2"/><circle class="eye" cx="24.6" cy="30.6" r="1.8"/><circle class="eye" cx="39.4" cy="30.6" r="1.8"/>'
  }[mood] || '';
  const mouth = { happy: '<path class="mouth" d="M26 42q6 6 12 0"/>', confused: '<path class="mouth" d="M25 44q3-3 6 0t6 0"/>', proud: '<path class="mouth" d="M24 41q8 9 16 0"/>', oops: '<ellipse cx="32" cy="45" rx="3" ry="3.6" fill="#04201C"/>' }[mood];
  const extra = mood === 'confused' ? '<text x="49" y="14" font-size="13" font-weight="700" fill="currentColor">?</text>' : mood === 'proud' ? '<path d="M52 12l1.6 3.6 3.6 1.6-3.6 1.6L52 22.4l-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#F7DC77"/>' : '';
  return `<svg viewBox="0 0 64 64" role="img" aria-label="PIXEL the mascot looks ${mood}"><defs><linearGradient id="${id}" x1="12" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#9AF7E2"/><stop offset="1" stop-color="#24DCCB"/></linearGradient></defs>
    <rect x="5" y="9" width="6" height="6" rx="1.6" fill="#67F0D1" opacity=".75" transform="rotate(-14 8 12)"/>
    <path fill="url(#${id})" d="M32 6c13.4 0 23.6 8.4 25 21.4 1.3 11.6-3.6 24.4-14.4 28.8-7.6 3.1-17.7 2.6-24.6-1.7C9.1 48.6 4.9 38.7 8.2 28.2 11.4 16.5 20.2 6 32 6z"/>
    <g class="lid">${eyes}</g>${mouth}${extra}</svg>`;
}

function mount() {
  if (wrap) return; wrap = document.createElement('div'); wrap.className = 'pixel-wrap'; wrap.setAttribute('role', 'complementary'); wrap.setAttribute('aria-label', 'PIXEL, your learning companion');
  wrap.innerHTML = `<button class="pixel-btn pixel" type="button" aria-label="PIXEL settings" aria-expanded="false"></button>`;
  btn = wrap.firstChild; btn.innerHTML = pixelSVG('happy'); btn.classList.toggle('calm', prefs().calm);
  btn.onclick = menu; document.body.append(wrap);
  addEventListener('pointermove', e => { if (prefs().calm) return; const r = btn.getBoundingClientRect(), dx = Math.max(-1, Math.min(1, (e.clientX - r.x - 32) / 400)) * 2.4, dy = Math.max(-1, Math.min(1, (e.clientY - r.y - 32) / 400)) * 2; btn.querySelectorAll('.eye,.shine').forEach(el => el.style.transform = `translate(${dx}px,${dy}px)`); }, { passive: true });
}
function menu() {
  const open = wrap.querySelector('.pixel-menu'); if (open) { open.remove(); btn.setAttribute('aria-expanded', 'false'); return; }
  const p = prefs(), m = document.createElement('div'); m.className = 'pixel-menu';
  m.innerHTML = `<h3>PIXEL says…</h3><label>Mute comments<input type="checkbox" id="px-m"${p.mute ? ' checked' : ''}></label><label>Calm animation<input type="checkbox" id="px-c"${p.calm ? ' checked' : ''}></label><label style="cursor:pointer" id="px-t">Give me a tip<span aria-hidden="true">→</span></label>`;
  wrap.append(m); btn.setAttribute('aria-expanded', 'true');
  m.querySelector('#px-m').onchange = e => { save({ ...prefs(), mute: e.target.checked }); if (e.target.checked) bubble?.remove(); };
  m.querySelector('#px-c').onchange = e => { save({ ...prefs(), calm: e.target.checked }); btn.classList.toggle('calm', e.target.checked); };
  m.querySelector('#px-t').onclick = () => { m.remove(); say('hint', {}, true); };
}

// Say something. Rate-limited, optional, never blocks the UI. `force` bypasses mute for explicit requests.
export function say(key, ctx = {}, force = false) {
  mount(); const p = prefs(); if ((p.mute && !force) || (!force && Date.now() - last < 7000)) return;
  const pool = LINES[key] || [key], text = pool[Math.floor(Math.random() * pool.length)].replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? '');
  last = Date.now(); bubble?.remove(); clearTimeout(timer);
  btn.innerHTML = pixelSVG(MOODS[key] || 'happy');
  bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.setAttribute('role', 'status');
  bubble.innerHTML = `<span></span><button type="button" aria-label="Dismiss">×</button>`; bubble.firstChild.textContent = text;
  bubble.querySelector('button').onclick = () => bubble.remove(); wrap.append(bubble);
  timer = setTimeout(() => { bubble?.remove(); btn.innerHTML = pixelSVG('happy'); }, 7000);
}

export function initPixel() {
  mount();
  const t = Date.now(), prev = store.get('last', 0); store.set('last', t);
  if (prev && t - prev > 4 * 36e5) setTimeout(() => say('return'), 1200);
  addEventListener('error', () => say('bug'));
  addEventListener('unhandledrejection', () => say('bug'));
}
