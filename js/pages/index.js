import { mountLayout } from '../layout.js';
import { MODULES } from '../data/modules.js';
import { REFS } from '../data/refs.js';
import { heroViz } from '../hero.js';
import { pixelSVG } from '../pixel.js';
import { done } from '../xp.js';
mountLayout('index.html');

const d = done(), next = MODULES.find(m => !d.includes(m.id)), mins = MODULES.reduce((a, m) => a + m.mins, 0);
const labs = new Set(MODULES.flatMap(m => m.sections.map(s => s.w).filter(Boolean))).size;
const resume = d.length && next ? `Continue: ${next.title}` : null;

document.getElementById('main').innerHTML = `
<section class="hero">
  <div class="hero-copy">
    <span class="chip warn rise" style="--i:0">Warning: curiosity may become addictive.</span>
    <h1 class="rise" style="--i:1">Machine Learning.<br>But Make It <em class="serif">Magic.</em></h1>
    <p class="lead rise" style="--i:2">Train models. Break things. Discover patterns. Finally understand what Machine Learning is actually doing.</p>
    <div class="cta rise" style="--i:3"><a class="btn p" data-magnetic href="lab.html">Let's Experiment <span aria-hidden="true">→</span></a><a class="btn" data-magnetic href="learn.html">Explore the Universe</a></div>
    ${resume ? `<p class="rise" style="--i:4;margin:18px 0 0"><a class="resume" href="modules.html#${next.id}">↳ ${resume}</a></p>` : ''}
    <ul class="hero-meta rise" style="--i:5"><li><b>${MODULES.length}</b> modules</li><li><b>${labs}</b> live labs</li><li><b>${Math.round(mins / 6) / 10}</b> hours</li><li><b>${Object.keys(REFS).length}</b> real sources</li></ul>
  </div>
  <div class="hero-viz rise" style="--i:3" id="hv"></div>
</section>

<section class="bento reveal" aria-labelledby="bt"><div class="sechead"><span class="label">Pick a rabbit hole</span><h2 id="bt">Three questions every analyst asks.<br><em class="serif">Three kinds of model.</em></h2></div>
  <div class="bgrid">
    <a class="bc b-cls" href="modules.html#classification"><span class="label">Classification</span><h3>“Will this visitor buy?”</h3><p>Draw the boundary yourself first. Then watch a model draw a better one.</p>
      <svg viewBox="0 0 240 130" aria-hidden="true"><g fill="var(--coral)"><circle cx="30" cy="95" r="5"/><circle cx="52" cy="70" r="5"/><circle cx="70" cy="104" r="5"/><circle cx="88" cy="80" r="5"/><circle cx="46" cy="110" r="5"/></g><g fill="var(--accent)"><circle cx="150" cy="40" r="5"/><circle cx="176" cy="62" r="5"/><circle cx="198" cy="30" r="5"/><circle cx="168" cy="22" r="5"/><circle cx="210" cy="64" r="5"/></g><path class="dash" d="M70 126L170 6" stroke="var(--amber)" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg></a>
    <a class="bc b-reg" href="modules.html#regression"><span class="label">Regression</span><h3>“How much revenue?”</h3><p>Drag a point. Watch the line react.</p>
      <svg viewBox="0 0 240 110" aria-hidden="true"><path d="M14 94L226 20" stroke="var(--coral)" stroke-width="3" stroke-linecap="round"/><g fill="var(--accent)"><circle cx="34" cy="86" r="5"/><circle cx="72" cy="64" r="5"/><circle cx="110" cy="70" r="5"/><circle cx="150" cy="44" r="5"/><circle cx="196" cy="34" r="5"/></g></svg></a>
    <a class="bc b-clu" href="modules.html#clustering"><span class="label">Clustering</span><h3>“Who are our customers?”</h3><p>No labels. Just patterns.</p>
      <svg viewBox="0 0 240 110" aria-hidden="true"><g class="blob"><circle cx="56" cy="60" r="30" fill="var(--violet)" opacity=".25"/><circle cx="120" cy="40" r="26" fill="var(--accent)" opacity=".25"/><circle cx="182" cy="70" r="28" fill="var(--amber)" opacity=".25"/></g><g fill="var(--ink)"><circle cx="50" cy="56" r="3"/><circle cx="64" cy="68" r="3"/><circle cx="114" cy="36" r="3"/><circle cx="128" cy="46" r="3"/><circle cx="178" cy="66" r="3"/><circle cx="190" cy="76" r="3"/></g></svg></a>
    <a class="bc b-lab" href="lab.html"><span class="label">The Lab</span><h3>Eight experiments.<br>Zero consequences.</h3><p>Every chart is a real model running in your browser. Break one on purpose.</p><span class="more">Open the lab →</span></a>
    <div class="bc b-px"><div class="pxbig">${pixelSVG('proud')}</div><p class="serif" style="font-size:1.35rem;line-height:1.3;margin:0">“Big brain energy detected.”</p><span class="mute" style="font-size:.82rem">PIXEL, your guide. Optional, mutable, mostly helpful.</span></div>
  </div></section>

<section class="ivory flow reveal" aria-labelledby="ft"><div class="flow-in">
  <div class="sechead"><span class="label">A lesson, reimagined</span><h2 id="ft">Try first.<br><em class="serif">Theory second.</em></h2><p class="lead">Every module opens with something to poke, then explains what just happened. No wall of text between you and the good part.</p></div>
  <ol class="three-step"><li><b>1</b><h3>Poke it</h3><p>“Can you teach a machine to guess who will buy?” Draw your own boundary on real-looking data.</p></li><li><b>2</b><h3>See what it did</h3><p>Compare your attempt with the model. Accuracy, errors and probabilities update live.</p></li><li><b>3</b><h3>Name the idea</h3><p>Only then: features, labels, training, prediction. Each with a source you can check.</p></li></ol>
</div></section>

<section class="journey reveal" aria-labelledby="jt"><div class="sechead"><span class="label">The journey</span><h2 id="jt">Six chapters from <em class="serif">“what is a dataset?”</em><br>to a full project.</h2></div>
  <ol class="jpath">${MODULES.map((m, i) => `<li style="--o:${[0, 1, 2, 1, 0, 1][i]}"><a href="modules.html#${m.id}" class="${d.includes(m.id) ? 'done' : ''}"><span class="jn">${m.n}</span><span><b>${m.title}</b><small>${m.level} · ${m.mins} min${d.includes(m.id) ? ' · ✓ complete' : ''}</small></span></a></li>`).join('')}</ol></section>

<section class="cta-end reveal"><h2>Ready to train<br>your first <em class="serif">brain?</em></h2><div class="cta" style="justify-content:center"><a class="btn p" data-magnetic href="${next ? 'modules.html#' + next.id : 'lab.html'}">${d.length ? 'Pick up where you left off' : 'Start Module 1'} <span aria-hidden="true">→</span></a><a class="btn" data-magnetic href="challenges.html">Try a challenge</a></div>
  <p class="mute" style="font-size:.85rem;margin-top:28px">Inspired by ideas from <a href="${REFS.mlcc.u}" target="_blank" rel="noopener noreferrer">Google ML Crash Course</a>, <a href="${REFS.mluexplain.u}" target="_blank" rel="noopener noreferrer">MLU-Explain</a> and <a href="${REFS.distill.u}" target="_blank" rel="noopener noreferrer">Distill</a>.</p></section>`;

heroViz(document.getElementById('hv'));
import('../ui.js').then(u => { u.magnetic(); u.reveal(); });
