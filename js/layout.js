// Shared floating navigation + footer, injected so every page stays in sync.
import { store } from './store.js';
import { touchStreak, paint } from './xp.js';
import { initPixel, say } from './pixel.js';
import { THEMES, getTheme, setTheme, magnetic, reveal, shortcuts, profile, initKeys } from './ui.js';
import { soundOn, setSound } from './sound.js';

const NAV = [['index.html', 'Home'], ['learn.html', 'Learn'], ['modules.html', 'Modules'], ['lab.html', 'Lab'], ['challenges.html', 'Challenges'], ['progress.html', 'Progress']];
const LOGO = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><defs><linearGradient id="lg" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stop-color="#9AF7E2"/><stop offset="1" stop-color="#24DCCB"/></linearGradient></defs><rect width="48" height="48" rx="15" fill="url(#lg)"/><g stroke="#04201C" stroke-width="2.4" stroke-linecap="round"><path d="M13 16l11 8M13 32l11-8M24 24l11-8M24 24l11 8"/></g><g fill="#04201C"><circle cx="13" cy="16" r="3.4"/><circle cx="13" cy="32" r="3.4"/><circle cx="24" cy="24" r="3.8"/><circle cx="35" cy="16" r="3.4"/><circle cx="35" cy="32" r="3.4"/></g></svg>`;
const I = { menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>', palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.6-1.200.2-2.500 1.700-2.500H17a4 4 0 0 0 4-4C21 6.500 17 3 12 3z"/><circle cx="7.500" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.500" r="1"/>' };
const ic = n => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

export function mountLayout(page) {
  setTheme(getTheme());
  document.body.insertAdjacentHTML('afterbegin', `
  <a class="skip" href="#main">Skip to content</a>
  <header class="top">
    <a class="brand" href="index.html" aria-label="MLVERSE home">${LOGO}<span>ML<b>VERSE</b></span></a>
    <nav id="nav" aria-label="Main"><span id="navind" aria-hidden="true"></span>${NAV.map(([h, t]) => `<a href="${h}"${h === page ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}
      <span class="morewrap"><button class="more" type="button" aria-haspopup="true" aria-expanded="false">More ▾</button></span></nav>
    <div class="nright">
      <span class="pill streak" id="streak" title="Daily streak"></span>
      <a class="orb" id="orb" href="progress.html"><svg viewBox="0 0 38 38" aria-hidden="true"><circle class="t" cx="19" cy="19" r="16" fill="none" stroke-width="3"/><circle class="p" cx="19" cy="19" r="16" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="100.5" stroke-dashoffset="100.5"/></svg><b>1</b></a>
      <button class="iconbtn" id="themebtn" type="button" aria-label="Choose theme" aria-haspopup="true" aria-expanded="false">${ic('palette')}</button>
      <button class="iconbtn" id="profbtn" type="button" aria-label="Profile">${ic('user')}</button>
      <button class="iconbtn" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav">${ic('menu')}</button>
    </div>
  </header>`);
  document.body.insertAdjacentHTML('beforeend', `
  <footer>
    <div><a class="brand" href="index.html">${LOGO.replace('id="lg"', 'id="lg2"').replace('url(#lg)', 'url(#lg2)')}<span>ML<b>VERSE</b></span></a>
      <p>The Living Lab: an interactive introduction to machine learning for digital analytics. Concepts link to primary sources on <a href="resources.html">References</a>.</p></div>
    <nav aria-label="Footer">${NAV.slice(1).map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="resources.html">References</a></nav>
    <span class="sig">Yousef Odeh<small>designed &amp; built by</small></span>
  </footer>`);
  document.addEventListener('ml', e => say(e.detail.type));
  touchStreak(); paint(); initPixel(); initKeys(); magnetic(); reveal();

  // sliding indicator
  const nav = document.getElementById('nav'), ind = document.getElementById('navind'), on = nav.querySelector('a.on');
  const place = () => { if (!on || getComputedStyle(ind).display === 'none') { ind.style.opacity = 0; return; } ind.style.opacity = 1; ind.style.width = on.offsetWidth + 'px'; ind.style.transform = `translateX(${on.offsetLeft}px)`; };
  place(); addEventListener('resize', place); document.fonts?.ready.then(place);

  // popover menus
  const close = () => { document.querySelectorAll('.menu').forEach(m => m.remove()); document.querySelectorAll('[aria-haspopup]').forEach(b => b.setAttribute('aria-expanded', 'false')); };
  const pop = (btn, html, host, bind) => { const had = host.querySelector('.menu'); close(); if (had) return; const m = document.createElement('div'); m.className = 'menu'; m.innerHTML = html; host.append(m); btn.setAttribute('aria-expanded', 'true'); bind(m); };
  nav.querySelector('.more').onclick = e => { e.stopPropagation(); pop(e.currentTarget, `<a href="resources.html">References<small>sources</small></a><button type="button" data-a="keys">Keyboard shortcuts<small>?</small></button><button type="button" data-a="sound">Interaction sounds<small>${soundOn() ? 'on' : 'off'}</small></button>`, nav.querySelector('.morewrap'), m => m.onclick = ev => { const a = ev.target.closest('[data-a]')?.dataset.a; if (a === 'keys') { close(); shortcuts(); } if (a === 'sound') { setSound(!soundOn()); close(); } }); };
  document.getElementById('themebtn').onclick = e => { e.stopPropagation(); const h = e.currentTarget; h.parentElement.style.position = 'relative'; pop(h, THEMES.map(([k, t]) => `<button type="button" data-t="${k}">${t}<small>${getTheme() === k ? '●' : ''}</small></button>`).join(''), h.parentElement, m => m.onclick = ev => { const k = ev.target.closest('[data-t]')?.dataset.t; if (k) { setTheme(k); close(); } }); };
  document.getElementById('profbtn').onclick = () => { close(); profile(); };
  addEventListener('click', e => { if (!e.target.closest('.menu')) close(); });
  const bg = document.getElementById('burger'); bg.onclick = () => { const o = nav.classList.toggle('open'); bg.setAttribute('aria-expanded', o); };
}
