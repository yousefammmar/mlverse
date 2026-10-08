import { mountLayout } from '../layout.js';
import { W } from '../widgets.js';
import { LABS, insightPanel, safeMount } from '../insight.js';
import { noteLab, labsTried } from '../xp.js';
mountLayout('lab.html');

const IDS = ['regline', 'gd', 'classlab', 'confusion', 'compare', 'kmeans', 'complexity', 'final'], main = document.getElementById('main');
main.style.maxWidth = '1500px';
main.innerHTML = `
<div class="labshell">
  <aside class="rail" aria-label="Experiments"><div class="rail-head"><span class="label">The Living Lab</span><p>Eight experiments. Zero consequences.</p></div>
    <div class="rail-list" role="tablist" aria-orientation="vertical">${IDS.map((id, i) => { const L = LABS[id]; return `<button role="tab" type="button" class="rcard" data-id="${id}" style="--c:var(${L.c})"><span class="rico">${L.icon}</span><span class="rtxt"><small>${String(i + 1).padStart(2, '0')} · ${L.cat}</small><b>${L.t}</b></span><i class="seen" aria-hidden="true"></i></button>`; }).join('')}</div>
    <p class="rail-tip">Nothing here is graded. Break things.</p></aside>
  <section class="stagecol"><header class="stagehead"><div><span class="label" id="lcat"></span><h1 id="lt"></h1></div></header><div class="stage" id="w" aria-live="polite"></div></section>
  <aside class="insight" id="ins" aria-label="Insight panel"></aside>
</div>`;

let stop = () => {};
function show(id) {
  const L = LABS[id]; history.replaceState(null, '', '#' + id); document.title = `${L.t} · The Lab · MLVERSE`;
  main.querySelectorAll('.rcard').forEach(b => { const on = b.dataset.id === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); b.classList.toggle('visited', labsTried().includes(b.dataset.id)); if (on) b.scrollIntoView({ block: 'nearest', inline: 'center' }); });
  document.getElementById('lcat').textContent = L.cat; document.getElementById('lt').textContent = L.t;
  const stage = document.getElementById('w'); stop(); stage.replaceChildren(); stage.style.setProperty('--c', `var(${L.c})`);
  safeMount(W[id], stage, id); stop = insightPanel(document.getElementById('ins'), id, stage); noteLab(id);
  main.querySelector(`.rcard[data-id="${id}"]`).classList.add('visited');
}
main.querySelectorAll('.rcard').forEach(b => b.onclick = () => show(b.dataset.id));
main.querySelector('.rail-list').addEventListener('keydown', e => { const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!k) return; e.preventDefault(); const i = IDS.indexOf(location.hash.slice(1)); show(IDS[(i + k + IDS.length) % IDS.length]); main.querySelector('.rcard.on').focus(); });
addEventListener('hashchange', () => IDS.includes(location.hash.slice(1)) && show(location.hash.slice(1)));
show(IDS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'regline');
