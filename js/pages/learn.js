import { mountLayout } from '../layout.js';
import { MODULES, HOOKS } from '../data/modules.js';
import { store } from '../store.js';
import { done } from '../xp.js';
mountLayout('learn.html');

const q = store.get('qok', []), d = done(), next = MODULES.find(m => !d.includes(m.id));
const pr = m => m.quiz.filter((_, k) => q.includes(`${m.id}:${k}`)).length / m.quiz.length;
const ring = p => `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" fill="none" stroke="var(--line2)" stroke-width="3"/><circle cx="22" cy="22" r="19" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-dasharray="119.4" stroke-dashoffset="${119.4 * (1 - p)}" transform="rotate(-90 22 22)"/></svg>`;
const COL = ['--accent', '--coral', '--violet', '--amber', '--blue', '--coral'];
document.getElementById('main').innerHTML = `
<header class="pagehead"><span class="chip">Learn</span><h1>Explore the <em>universe.</em></h1><p class="lead">Six worlds, one idea each. Start anywhere that sparks your curiosity, though the first world makes the others easier.</p></header>
<ol class="planets">${MODULES.map((m, i) => `<li style="--c:var(${COL[i]});--o:${[0, 1, 0, 1, 0, 1][i]}" class="reveal"><a href="modules.html#${m.id}" class="planet${d.includes(m.id) ? ' done' : ''}"><span class="orbit">${ring(pr(m))}<b>${m.n}</b></span>
  <span class="ptxt"><small>${m.level} · ${m.mins} min</small><b>${m.title}</b><i class="serif">“${HOOKS[m.id].q}”</i><em>${d.includes(m.id) ? '✓ Complete' : Math.round(pr(m) * 100) ? `${Math.round(pr(m) * 100)}% of quiz` : next === m ? 'Start here →' : 'Open →'}</em></span></a></li>`).join('')}</ol>
<section class="sidequests reveal"><div class="sechead"><span class="label">Side quests</span><h2>Rather poke than read?</h2></div>
  <div class="sq-grid"><a class="bc" href="lab.html"><span class="label">The Lab</span><h3>Eight experiments</h3><p>Drag points, train models, break things.</p><span class="more">Open the lab →</span></a><a class="bc" href="challenges.html"><span class="label" style="color:var(--coral)">Challenges</span><h3>Five mini-games</h3><p>Outlier chaos, the overfitting trap, a bug hunt and more.</p><span class="more">Take a challenge →</span></a><a class="bc" href="resources.html"><span class="label" style="color:var(--violet)">References</span><h3>Real sources</h3><p>Every claim traces back to a paper, a book or documentation.</p><span class="more">Browse sources →</span></a></div></section>`;
import('../ui.js').then(u => u.reveal());
