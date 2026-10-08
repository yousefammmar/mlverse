import { mountLayout } from '../layout.js';
import { pageHead, refItem } from '../components.js';
import { REFS, TYPES } from '../data/refs.js';
mountLayout('resources.html');

const item = ([id, r]) => `<li data-t="${(r.a + r.t + r.v + r.y).toLowerCase()}"><a href="${r.u}" target="_blank" rel="noopener noreferrer">${r.t}</a><span class="go" aria-hidden="true">↗</span><small>${r.a} · ${r.v} · ${r.y}</small></li>`;
document.getElementById('main').innerHTML = `
${pageHead('References', 'Sources &amp; <em>further reading</em>', `${Object.keys(REFS).length} papers, books, courses and interactive explainers cited across the modules. Links open in a new tab.`)}
<div class="filters"><input id="q" type="search" placeholder="Filter by title, author or year…" aria-label="Filter references"></div>
${Object.entries(TYPES).map(([t, label]) => `<section class="rgroup"><h2>${label}</h2><ul class="rlist">${Object.entries(REFS).filter(([, r]) => r.type === t).sort((a, b) => b[1].y - a[1].y).map(item).join('')}</ul></section>`).join('')}
<p id="none" class="lead" hidden style="margin-top:28px">No references match that filter.</p>`;

document.getElementById('q').oninput = e => {
  const t = e.target.value.trim().toLowerCase(); let n = 0;
  document.querySelectorAll('.rlist li').forEach(li => { const ok = !t || li.dataset.t.includes(t); li.hidden = !ok; n += ok; });
  document.querySelectorAll('.rgroup').forEach(g => g.hidden = ![...g.querySelectorAll('li')].some(l => !l.hidden));
  document.getElementById('none').hidden = n > 0;
};
