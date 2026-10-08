// Shared widget helpers: theming, deterministic randomness, DOM builders, canvas.
export const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
export const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const gauss = r => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const pct = v => isFinite(v) ? (v * 100).toFixed(0) + '%' : '—';

// <figure class="widget"> with a control bar, a body and a caption. Redraws on resize / theme change.
export function shell(el, caption, draw) {
  const f = document.createElement('figure'); f.className = 'widget';
  f.innerHTML = '<div class="wbar"></div><div class="wbody"></div>' + (caption ? `<figcaption>${caption}</figcaption>` : '');
  el.append(f);
  if (draw) { addEventListener('resize', draw); addEventListener('themechange', draw); }
  return { bar: f.querySelector('.wbar'), body: f.querySelector('.wbody'), fig: f };
}
export function canvas(body, h = 260, label = '') {
  const c = document.createElement('canvas'); c.style.height = h + 'px'; c.setAttribute('role', 'img'); c.setAttribute('aria-label', label);
  body.append(c); const x = c.getContext('2d');
  c.prep = () => { const r = devicePixelRatio || 1, w = c.clientWidth; c.width = w * r; c.height = h * r; x.setTransform(r, 0, 0, r, 0, 0); x.clearRect(0, 0, w, h); return [x, w, h]; };
  return c;
}
export function slider(bar, label, o, on) {
  const l = document.createElement('label'), fmt = o.fmt || String;
  l.innerHTML = `<span>${label}</span><input type="range" min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}"><output>${fmt(o.value)}</output>`;
  const i = l.querySelector('input'), out = l.querySelector('output');
  i.oninput = () => { out.textContent = fmt(+i.value); on(+i.value); };
  bar.append(l); return { i, set: v => { i.value = v; out.textContent = fmt(+v); } };
}
export function button(bar, text, on, cls = '') { const b = document.createElement('button'); b.type = 'button'; b.className = 'wb ' + cls; b.textContent = text; b.onclick = on; bar.append(b); return b; }
// Group of mutually exclusive buttons; marks the active one with .on.
export function choice(bar, label, opts, active, on) {
  if (label) bar.insertAdjacentHTML('beforeend', `<span class="wlab">${label}</span>`);
  const bs = opts.map(([k, t]) => button(bar, t, () => { bs.forEach(b => b.classList.toggle('on', b === bs[opts.findIndex(o => o[0] === k)])); on(k); }));
  bs[opts.findIndex(o => o[0] === active)]?.classList.add('on'); return bs;
}
export function checks(bar, label, opts, on) {
  if (label) bar.insertAdjacentHTML('beforeend', `<span class="wlab">${label}</span>`);
  return opts.map(([k, t, checked]) => { const l = document.createElement('label'); l.className = 'chk'; l.innerHTML = `<input type="checkbox" value="${k}"${checked ? ' checked' : ''}><span>${t}</span>`; l.querySelector('input').onchange = on; bar.append(l); return l.querySelector('input'); });
}
export function note(body, cls = 'wstat') { const p = document.createElement('p'); p.className = cls; p.setAttribute('role', 'status'); body.append(p); return p; }
export function axes(x, w, h, pad) { x.strokeStyle = css('--line2'); x.lineWidth = 1; x.beginPath(); x.moveTo(pad, 8); x.lineTo(pad, h - pad); x.lineTo(w - 8, h - pad); x.stroke(); }
export const label = (x, t, px, py, col = '--mute') => { x.fillStyle = css(col); x.font = '11px "JetBrains Mono",monospace'; x.fillText(t, px, py); };
export const table = (head, rows, cls = '') => `<div class="tbl"><table class="${cls}"><thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

// Hover tooltip for a canvas: html(u, v) gets pointer coords in CSS px and returns markup or null.
export function tip(c, html) {
  const host = c.parentElement; host.style.position = 'relative'; const t = document.createElement('div'); t.className = 'wtip'; t.hidden = true; host.append(t);
  c.addEventListener('pointermove', e => { const b = c.getBoundingClientRect(), h = html(e.clientX - b.left, e.clientY - b.top); if (!h) { t.hidden = true; return; } t.hidden = false; t.innerHTML = h; const hb = host.getBoundingClientRect(); t.style.left = Math.min(e.clientX - hb.left, hb.width - 190) + 'px'; t.style.top = (e.clientY - hb.top) + 'px'; });
  c.addEventListener('pointerleave', () => t.hidden = true);
}
// Tell the page something notable happened so PIXEL can react (see layout.js).
export const emit = (el, type) => el.dispatchEvent(new CustomEvent('ml', { bubbles: true, detail: { type } }));
