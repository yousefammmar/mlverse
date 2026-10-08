import { mountLayout } from '../layout.js';
import { cite, refItem } from '../components.js';
import { MODULES, HOOKS } from '../data/modules.js';
import { W } from '../widgets.js';
import { safeMount, insightPanel } from '../insight.js';
import { store } from '../store.js';
import { award, done, paint, log, celebrate } from '../xp.js';
import { say } from '../pixel.js';
import { ok as okSound, bad as badSound, tick } from '../sound.js';
mountLayout('modules.html');

const main = document.getElementById('main'), bar = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'progress-top' }));
main.style.maxWidth = '1500px';
const answered = () => store.get('qok', []), wide = matchMedia('(min-width:1280px)');
let spy, placed = [];

function render() {
  spy?.disconnect(); const m = MODULES.find(x => x.id === location.hash.slice(1)) || MODULES[0], i = MODULES.indexOf(m), d = done(), H = HOOKS[m.id] || {};
  document.title = `${m.title} · Module ${m.n} · MLVERSE`;
  const { out, order } = cite(m.sections.map(s => s.html)), further = (m.further || []).filter(id => !order.includes(id)), qdone = m.quiz.filter((_, k) => answered().includes(`${m.id}:${k}`)).length;
  main.innerHTML = `
  <div class="course3">
    <aside class="side" id="side"><button class="tog" type="button" aria-expanded="false">Course progress <span>${d.length}/${MODULES.length}</span></button>
      <h2>Progress · ${d.length}/${MODULES.length}</h2><div class="meter" role="progressbar" aria-valuenow="${d.length}" aria-valuemax="${MODULES.length}"><i style="width:${d.length / MODULES.length * 100}%"></i></div>
      <ol>${MODULES.map(x => `<li class="${d.includes(x.id) ? 'ok' : ''}"><a href="#${x.id}"${x === m ? ' class="on" aria-current="page"' : ''}><span class="dot">${d.includes(x.id) ? '✓' : x.n}</span>${x.title}</a></li>`).join('')}</ol>
      <small>Tip: <kbd>←</kbd> <kbd>→</kbd> switch modules · <kbd>?</kbd> all shortcuts</small></aside>
    <article class="doc">
      <header class="lhead"><span class="chip">Module ${m.n} of ${MODULES.length} · ${m.level} · ${m.mins} min</span><h1>${m.title}</h1>
        ${H.q ? `<p class="hookq serif">“${H.q}”</p>` : ''}${H.world ? `<aside class="world"><span class="label">In the real world</span><p>${H.world}</p></aside>` : ''}
        <ul class="facts"><li>${m.sections.filter(s => s.w).length} live experiments</li><li>${m.quiz.length} quiz questions</li><li>${order.length} cited source${order.length === 1 ? '' : 's'}</li><li>+25 XP on completion</li></ul></header>
      <nav class="otp" aria-label="On this page"><span>On this page</span>${m.sections.map(s => `<a href="#${m.id}" data-go="${s.id}">${s.h.replace(/^Try before you read: /, '')}</a>`).join('')}<a href="#${m.id}" data-go="practice">Practice</a><a href="#${m.id}" data-go="check">Quiz</a><a href="#${m.id}" data-go="refs">References</a></nav>
      ${m.sections.map((s, k) => `<section id="s-${s.id}" data-w="${s.w || ''}"><h2>${s.h}</h2>${out[k]}${s.w ? `<div class="wslot" data-slot="${s.id}"></div>` : ''}</section>`).join('')}
      <section class="key" id="s-key"><h2>Key takeaways</h2><ul>${m.takeaways.map(t => `<li>${t}</li>`).join('')}</ul></section>
      ${H.practice ? `<section class="practice" id="s-practice"><span class="label">Practice activity</span><h2>Now you try</h2><p>${H.practice}</p></section>` : ''}
      <section id="s-check"><h2>Check your understanding <small class="qprog">${qdone}/${m.quiz.length}</small></h2><p class="lead" style="font-size:.95rem">Answer every question correctly to complete the module. Wrong answers are fine: try again.</p>
        ${m.quiz.map((q, k) => `<div class="q" data-k="${k}"><p>${k + 1}. ${q.q}</p><div class="opts">${q.o.map((o, j) => `<button type="button" class="opt" data-j="${j}">${o}</button>`).join('')}</div><p class="why" role="status" aria-live="polite"></p></div>`).join('')}</section>
      <section class="refs" id="s-refs"><h2>References</h2><ol>${order.map(id => refItem(id)).join('')}</ol>${further.length ? `<h3>Further reading</h3><ol start="${order.length + 1}">${further.map(id => refItem(id)).join('')}</ol>` : ''}<p style="font-size:.88rem"><a href="resources.html">Browse all references →</a></p></section>
      <nav class="pager" aria-label="Module navigation">${MODULES[i - 1] ? `<a class="btn" href="#${MODULES[i - 1].id}"><span>← Previous</span>${MODULES[i - 1].title}</a>` : '<span></span>'}${MODULES[i + 1] ? `<a class="btn p" href="#${MODULES[i + 1].id}"><span>Next →</span>${MODULES[i + 1].title}</a>` : `<a class="btn p" href="lab.html"><span>Finished →</span>Go play in the Lab</a>`}</nav>
    </article>
    <aside class="stagecol2" id="stagecol" aria-label="Live experiment"><div class="sc-head"><span class="label">Live experiment</span><b id="sc-title">Scroll to an experiment</b></div><div id="sc-body"></div><p class="sc-empty" id="sc-empty">Experiments appear here as you read.</p></aside>
  </div>`;

  // mount every widget once (state survives moving between stage and inline)
  placed = [...main.querySelectorAll('section[data-w]')].filter(s => s.dataset.w).map(sec => { const box = document.createElement('div'); box.className = 'wbox'; box.dataset.sec = sec.id; safeMount(W[sec.dataset.w], box, sec.dataset.w); return { sec, box, title: sec.querySelector('h2').textContent }; });
  const place = () => { const stage = document.getElementById('sc-body'); if (wide.matches) { placed.forEach(p => { stage.append(p.box); p.box.hidden = true; }); activate(placed[0]); } else { placed.forEach(p => { p.box.hidden = false; p.sec.querySelector('.wslot').append(p.box); }); document.getElementById('sc-empty').hidden = true; } dispatchEvent(new Event('resize')); };
  function activate(p) { if (!p || !wide.matches) return; placed.forEach(x => x.box.hidden = x !== p); document.getElementById('sc-title').textContent = p.title.replace(/^Try before you read: (.)/, (_, c) => c.toUpperCase()); document.getElementById('sc-empty').hidden = true; dispatchEvent(new Event('resize')); }
  place();
  if (wide.matches && placed.length) { spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) activate(placed.find(p => p.sec === e.target)); }), { rootMargin: '-30% 0px -50% 0px' }); placed.forEach(p => spy.observe(p.sec)); }
  document.getElementById('stagecol').hidden = !placed.length;
  document.getElementById('stagecol').addEventListener('input', e => { if (e.target.type === 'range') { const r = e.target; tick(240 + 420 * ((r.value - r.min) / (r.max - r.min || 1))); } });

  answered().forEach(key => { const [id, k] = key.split(':'); if (id === m.id) markOk(main.querySelector(`.q[data-k="${k}"]`), m.quiz[k]); });
  main.querySelectorAll('.q').forEach(box => box.onclick = e => {
    const b = e.target.closest('.opt'); if (!b || b.disabled) return; const q = m.quiz[box.dataset.k];
    if (+b.dataset.j === q.a) { markOk(box, q); okSound(); log(1); store.set('qok', [...new Set([...answered(), `${m.id}:${box.dataset.k}`])]); main.querySelector('.qprog').textContent = `${m.quiz.filter((_, k) => answered().includes(`${m.id}:${k}`)).length}/${m.quiz.length}`; complete(m); }
    else { b.classList.add('no'); b.disabled = true; badSound(); box.querySelector('.why').textContent = 'Not quite. Try another option.'; }
  });
  main.querySelectorAll('.otp a').forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById('s-' + a.dataset.go)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); });
  const side = document.getElementById('side'); side.querySelector('.tog').onclick = e => { const o = side.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
  paint(); onScroll();
}
function markOk(box, q) { if (!box) return; box.querySelectorAll('.opt').forEach((o, j) => { o.disabled = true; o.classList.toggle('ok', j === q.a); o.classList.remove('no'); }); box.querySelector('.why').textContent = '✓ ' + q.why; }
function complete(m) {
  if (done().includes(m.id) || !m.quiz.every((_, k) => answered().includes(`${m.id}:${k}`))) return;
  store.set('done', [...done(), m.id]); award('mod:' + m.id, 25, `${m.title} complete`); say('quiz', {}, true);
  const y = scrollY; render(); scrollTo(0, y); celebrate();
}
function onScroll() { const h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; }
addEventListener('scroll', onScroll, { passive: true });
wide.addEventListener('change', () => render());
addEventListener('hashchange', () => { if (MODULES.some(x => x.id === location.hash.slice(1))) { render(); scrollTo(0, 0); } });
addEventListener('keydown', e => {
  if (e.target.matches?.('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey || document.querySelector('.modal')) return;
  const i = MODULES.findIndex(x => x.id === location.hash.slice(1)), j = i < 0 ? 0 : i;
  if (e.key === 'ArrowRight' && MODULES[j + 1]) location.hash = MODULES[j + 1].id; if (e.key === 'ArrowLeft' && MODULES[j - 1]) location.hash = MODULES[j - 1].id;
});
render();
