import { mountLayout } from '../layout.js';
import { W } from '../widgets.js';
import { pageHead } from '../components.js';
import { safeMount } from '../insight.js';
import { completeChallenge, challengesDone } from '../xp.js';
import { say, pixelSVG } from '../pixel.js';
import { shell, canvas, button, choice, note, slider, axes, label, css, rng, gauss, clamp, pct, table } from '../widgets/core.js';
import { visitors } from '../data/datasets.js';
import { FIT, kmeans, splitIdx } from '../ml.js';
import { ok, bad } from '../sound.js';
mountLayout('challenges.html');

const win = (id, xp, msg) => { if (completeChallenge(id, xp, msg)) { ok(); say('quiz', {}, true); refreshCards(); } };

// ---------------------------------------------------------------- 1. Outlier Chaos
function outlier(el) {
  const g = document.createElement('div'); g.className = 'goal'; el.append(g); const host = document.createElement('div'); el.append(host); let b0 = null, hit = false;
  g.innerHTML = '<b>Goal:</b> drag <u>one</u> point to change the slope of the line by more than <b>1.5</b>. <span id="oc">Slope change: 0.00</span>';
  W.regline(host, { onChange: ({ b, M }) => { if (b0 === null) { b0 = b; return; } const ch = Math.abs(b - b0); g.querySelector('#oc').textContent = `Slope change: ${ch.toFixed(2)} · R² now ${M.r2.toFixed(2)}`; if (ch > 1.5 && !hit) { hit = true; g.classList.add('won'); g.querySelector('#oc').textContent += ' ✓ One point just rewrote your model. That is why we inspect outliers before trusting a fit.'; win('outlier', 30, 'Outlier Chaos'); } } });
}

// ---------------------------------------------------------------- 2. The Overfitting Trap
function trap(el) {
  const g = document.createElement('div'); g.className = 'goal'; el.append(g); const host = document.createElement('div'); el.append(host); let phase = 1;
  const text = () => g.innerHTML = phase === 1 ? '<b>Step 1 · Spring the trap:</b> make <b>training error &lt; 0.02</b> while <b>test error &gt; 0.5</b>. (Hint: crank up the complexity.)' : '<b>Step 2 · Escape:</b> keep complexity at <b>8 or more</b> but bring <b>test error under 0.2</b>. (Hint: regularization.)';
  text();
  W.complexity(host, { onChange: ({ deg, train, test }) => {
    if (phase === 1 && train < 0.02 && test > 0.5) { phase = 2; g.classList.add('half'); text(); say('overfit', {}, true); }
    else if (phase === 2 && deg >= 8 && test < 0.2) { phase = 3; g.classList.remove('half'); g.classList.add('won'); g.innerHTML = '<b>Escaped ✓</b> A flexible model plus regularization generalises. You traded a bit of training accuracy for much better test performance.'; win('trap', 40, 'Overfitting Trap'); }
  } });
}

// ---------------------------------------------------------------- 3. Cluster Party
function party(el) {
  const s = shell(el, 'A hidden number of customer groups is hiding in this cloud. Guess K, run K-Means, then reveal the truth. Stuck? Peek at the spread curve.', () => draw()), c = canvas(s.body, 340, 'Unlabeled points forming hidden clusters'), out = note(s.body, 'wout');
  let P = [], T = [], trueK = 3, guess = 3, res = null, reveal = false, hint = null; const COL = ['--accent', '--violet', '--amber', '--coral', '--blue'];
  const gen = () => { const r = rng((Math.random() * 1e9) | 0); trueK = 2 + Math.floor(r() * 4); const C = []; while (C.length < trueK) { const p = [.12 + r() * .76, .14 + r() * .72]; if (C.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > .3)) C.push(p); } P = []; T = []; C.forEach((q, j) => { for (let i = 0; i < 34; i++) { P.push([q[0] + gauss(r) * .055, q[1] + gauss(r) * .055]); T.push(j); } }); res = null; reveal = false; hint = null; out.innerHTML = 'How many groups do you see? Pick K, then run K-Means.'; draw(); };
  const best = k => { let b; for (let sd = 1; sd <= 8; sd++) { const m = kmeans(P, k, sd); m.run(); if (!b || m.inertia() < b.inertia()) b = m; } return b; };
  function draw() { const [x, W, H] = c.prep(); axes(x, W, H, 24);
    P.forEach((p, i) => { x.beginPath(); x.arc(30 + p[0] * (W - 50), H - 30 - p[1] * (H - 50), 4.4, 0, 7); if (res) { x.fillStyle = css(COL[res.a[i] % 5]); x.fill(); if (reveal) { x.strokeStyle = css(COL[T[i] % 5]); x.lineWidth = 2; x.beginPath(); x.arc(30 + p[0] * (W - 50), H - 30 - p[1] * (H - 50), 7.4, 0, 7); x.stroke(); } } else { x.fillStyle = css('--mute'); x.globalAlpha = .75; x.fill(); x.globalAlpha = 1; } });
    if (hint) label(x, 'spread for K=2..5: ' + hint.map(v => v.toFixed(1)).join(' → '), 30, 16); }
  choice(s.bar, 'My guess for K:', [2, 3, 4, 5].map(v => [v, String(v)]), guess, v => { guess = v; });
  button(s.bar, 'Run K-Means', () => { res = best(guess); reveal = false; out.innerHTML = `K-Means found ${guess} clusters. Press “Reveal truth”.`; draw(); }, 'primary');
  button(s.bar, 'Reveal truth', () => { if (!res) res = best(guess); reveal = true; const okk = guess === trueK; out.innerHTML = okk ? `<b class="ok">Yes! There were ${trueK} hidden groups.</b> Outer rings show the truth, fill shows what K-Means found.` : `The truth was <b>${trueK}</b> groups, you guessed ${guess}. ${guess < trueK ? 'Too few clusters merges real groups.' : 'Too many clusters splits real groups.'} Try the spread hint next time.`; draw(); if (okk) win('party', 30, 'Cluster Party'); else bad(); }, 'ghost');
  button(s.bar, 'Hint: spread curve', () => { hint = [2, 3, 4, 5].map(k => best(k).inertia()); draw(); }, 'ghost'); button(s.bar, 'New party 🎉', gen);
  gen();
}

// ---------------------------------------------------------------- 4. Guess the Prediction
function guess(el) {
  const D = visitors(), F = ['duration', 'pages', 'adClicks', 'returning'], X = D.map(r => F.map(f => r[f])), y = D.map(r => r.converted), sp = splitIdx(D.length, 0.7, 5), m = FIT.logistic(sp.train.map(i => X[i]), sp.train.map(i => y[i]));
  let picks, round, scores, g = 50, locked;
  const s = shell(el, 'Five new visitors. Estimate the chance each one converts before the model answers. Closer guesses score higher.', null), box = document.createElement('div'), out = note(s.body, 'wout'); s.body.prepend(box);
  const start = () => { const r = rng((Math.random() * 1e9) | 0), pool = [...sp.test].sort(() => r() - .5); picks = pool.slice(0, 5); round = 0; scores = []; locked = false; show(); };
  function show() {
    if (round >= 5) { const avg = scores.reduce((a, b) => a + b, 0) / 5; box.innerHTML = `<div class="gp-end"><b>${avg.toFixed(0)}</b><span>/ 100 average</span></div>`; out.innerHTML = avg >= 70 ? '<b class="ok">You think like a model.</b> Your intuition tracks the data.' : 'The model sees patterns that are hard to eyeball. Play again and look at duration, pages and returning status together.'; if (avg >= 70) win('guess', 30, 'Guess the Prediction'); sl.i.disabled = true; return; }
    const v = D[picks[round]]; locked = false; sl.i.disabled = false; sl.set(50); g = 50;
    box.innerHTML = `<div class="gp"><span class="label">Visitor ${round + 1} of 5</span><dl class="kpis"><div><dt>Duration</dt><dd>${v.duration}s</dd></div><div><dt>Pages</dt><dd>${v.pages}</dd></div><div><dt>Ad clicks</dt><dd>${v.adClicks}</dd></div><div><dt>Returning</dt><dd>${v.returning ? 'yes' : 'no'}</dd></div></dl></div>`; out.innerHTML = 'Move the slider to your estimate of P(convert), then lock it in.';
  }
  const sl = slider(s.bar, 'My guess', { min: 0, max: 100, step: 1, value: 50, fmt: v => v + '%' }, v => { g = v; });
  button(s.bar, 'Lock in', () => { if (locked || round >= 5) return; locked = true; const i = picks[round], p = m.predict(X[i]) * 100, sc = Math.max(0, 100 - Math.abs(g - p)); scores.push(sc); out.innerHTML = `Model: <b>${p.toFixed(0)}%</b> · you: ${g}% · score <b>${sc.toFixed(0)}</b>. Actual outcome: <b>${y[i] ? 'converted' : 'did not convert'}</b>. (The model is a probability, not a prophecy.)`; round++; setTimeout(show, 2600); }, 'primary');
  button(s.bar, 'Play again', start, 'ghost'); start();
}

// ---------------------------------------------------------------- 5. Bug Hunt
const BUGS = [
  { t: 'The suspiciously perfect model', code: ["features = ['duration', 'pages', 'converted']", "target = 'converted'", 'X, y = df[features], df[target]', 'model.fit(X_train, y_train)', "print(accuracy_score(y_test, model.predict(X_test)))  # 100%!"], bug: 0, why: 'The target “converted” is also listed as a feature: data leakage. The model is handed the answer, hence 100% accuracy.' },
  { t: 'Scaling before splitting', code: ['scaler = StandardScaler().fit(X)', 'X_scaled = scaler.transform(X)', 'X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)', 'model.fit(X_train, y_train)', 'print(model.score(X_test, y_test))'], bug: 0, why: 'The scaler is fit on all rows, so test-set statistics leak into training. Split first, then fit the scaler on the training data only (or use a Pipeline).' },
  { t: 'The honest score?', code: ['model = LogisticRegression().fit(X_train, y_train)', 'pred = model.predict(X_train)', 'print("Final accuracy:", accuracy_score(y_train, pred))', 'ship_it(model)'], bug: 2, why: 'This reports accuracy on the training data, which only measures memory. Report the score on unseen test data: accuracy_score(y_test, model.predict(X_test)).' },
  { t: 'The 98% fraud detector', code: ['# only 2% of transactions are fraud', 'model.fit(X_train, y_train)', 'print("Accuracy:", accuracy_score(y_test, model.predict(X_test)))', '# 98% accurate. Ship it!'], bug: 3, why: 'With 2% positives, always predicting “not fraud” is also 98% accurate. Check precision, recall and F1 before shipping.' }
];
function hunt(el) {
  let i = 0, found = new Set();
  const s = shell(el, 'Click the line you think contains the bug. Four snippets, each with one real-world mistake from this course.', null), box = document.createElement('div'), out = note(s.body, 'wout'); s.body.prepend(box);
  const show = () => { const b = BUGS[i]; box.innerHTML = `<h3 class="bh">${i + 1}/${BUGS.length} · ${b.t}${found.has(i) ? ' ✓' : ''}</h3><ol class="code">${b.code.map((l, k) => `<li><button type="button" data-k="${k}"${found.has(i) ? ' disabled' : ''}><code>${l.replace(/</g, '&lt;')}</code></button></li>`).join('')}</ol>`; out.innerHTML = found.has(i) ? '✓ ' + b.why : 'Which line is the bug?';
    box.querySelectorAll('button').forEach(bt => bt.onclick = () => { const k = +bt.dataset.k; if (k === b.bug) { found.add(i); bt.classList.add('good'); ok(); out.innerHTML = '<b class="ok">Found it.</b> ' + b.why; if (found.size === BUGS.length) { out.innerHTML += '<br><b>All bugs squashed.</b>'; win('bughunt', 40, 'Bug Hunt'); } } else { bt.classList.add('wrong'); bad(); out.innerHTML = 'Not that line. Re-read: what could go wrong with data here?'; } }); };
  choice(s.bar, 'Snippet:', BUGS.map((_, k) => [k, String(k + 1)]), 0, k => { i = k; show(); }); show();
}

const CH = [
  { id: 'outlier', t: 'Outlier Chaos', tag: 'Regression', c: '--coral', xp: 30, d: 'Drag one point and watch it hijack the whole regression line.', run: outlier },
  { id: 'trap', t: 'The Overfitting Trap', tag: 'Generalization', c: '--amber', xp: 40, d: 'Build a model that is perfect in training and bad in testing, then fix it.', run: trap },
  { id: 'party', t: 'Cluster Party', tag: 'Clustering', c: '--blue', xp: 30, d: 'Guess how many hidden groups a random cloud contains.', run: party },
  { id: 'guess', t: 'Guess the Prediction', tag: 'Classification', c: '--violet', xp: 30, d: 'Predict the model’s probability before it answers.', run: guess },
  { id: 'bughunt', t: 'Bug Hunt', tag: 'Practice', c: '--accent', xp: 40, d: 'Spot the leakage and evaluation mistakes hiding in code.', run: hunt }
];
const main = document.getElementById('main');
main.innerHTML = `${pageHead('Challenges', 'Break it. <em>Then fix it.</em>', 'Five mini-experiences with a real learning goal each. They use the same models as the lessons.')}
<div class="chgrid" role="tablist">${CH.map((c, i) => `<button role="tab" type="button" class="chc" data-id="${c.id}" style="--c:var(${c.c})"><span class="label" style="color:var(--c)">${c.tag}</span><b>${c.t}</b><span>${c.d}</span><em><i class="tick"></i><span class="st">+${c.xp} XP</span></em></button>`).join('')}</div>
<section class="chstage" id="chs" aria-live="polite"></section>`;
function refreshCards() { const d = challengesDone(); main.querySelectorAll('.chc').forEach(b => { const ok = d.includes(b.dataset.id); b.classList.toggle('done', ok); b.querySelector('.st').textContent = ok ? 'Completed ✓' : `+${CH.find(c => c.id === b.dataset.id).xp} XP`; }); }
function open(id) { const c = CH.find(x => x.id === id); history.replaceState(null, '', '#' + id); main.querySelectorAll('.chc').forEach(b => b.classList.toggle('on', b.dataset.id === id)); const st = document.getElementById('chs'); st.replaceChildren(); st.style.setProperty('--c', `var(${c.c})`); st.insertAdjacentHTML('beforeend', `<div class="chhead"><div class="px">${pixelSVG('happy')}</div><div><span class="label" style="color:var(--c)">${c.tag} · +${c.xp} XP</span><h2>${c.t}</h2></div></div>`); const host = document.createElement('div'); st.append(host); safeMount(c.run, host, id); }
main.querySelectorAll('.chc').forEach(b => b.onclick = () => { open(b.dataset.id); document.getElementById('chs').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });
refreshCards(); open(CH.some(c => c.id === location.hash.slice(1)) ? location.hash.slice(1) : 'outlier');
