import { mountLayout } from '../layout.js';
import { MODULES } from '../data/modules.js';
import { LABS } from '../insight.js';
import { store } from '../store.js';
import { level, done, snapshot, earned, BADGES, challengesDone, labsTried } from '../xp.js';
import { pixelSVG } from '../pixel.js';
mountLayout('progress.html');

const s = snapshot(), xp = s.xp, lv = level(xp), q = store.get('qok', []), name = store.get('name', '');
const qpct = m => m.quiz.filter((_, k) => q.includes(`${m.id}:${k}`)).length / m.quiz.length;
const total = MODULES.reduce((a, m) => a + m.quiz.length, 0), got = q.filter(k => MODULES.some(m => k.startsWith(m.id + ':'))).length, overall = got / total;
const next = MODULES.find(m => !s.done.includes(m.id)), untriedLab = Object.keys(LABS).find(id => !labsTried().includes(id));
const CHAL = { outlier: 'Outlier Chaos', trap: 'The Overfitting Trap', party: 'Cluster Party', guess: 'Guess the Prediction', bughunt: 'Bug Hunt' }, nextChal = Object.keys(CHAL).find(c => !challengesDone().includes(c));

// last 7 days of real activity
const act = store.get('activity', {}), days = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5); return { k: d.toISOString().slice(0, 10), l: d.toLocaleDateString(undefined, { weekday: 'short' }) }; }), vals = days.map(d => act[d.k] || 0), mx = Math.max(...vals, 1);
const bars = days.map((d, i) => { const h = vals[i] / mx * 120; return `<g><rect class="bar" x="${14 + i * 46}" y="${140 - h}" width="30" height="${Math.max(h, 3)}" rx="9" style="--d:${i * 70}ms" opacity="${vals[i] ? 1 : .25}"><title>${vals[i]} actions</title></rect><text x="${29 + i * 46}" y="158" text-anchor="middle">${d.l}</text>${vals[i] ? `<text x="${29 + i * 46}" y="${134 - h}" text-anchor="middle" class="v">${vals[i]}</text>` : ''}</g>`; }).join('');

// skill radar from real quiz accuracy per module + hands-on exploration
const SK = [['Fundamentals', qpct(MODULES[0])], ['Regression', qpct(MODULES[1])], ['Classification', qpct(MODULES[2])], ['Evaluation', qpct(MODULES[3])], ['Clustering', qpct(MODULES[4])], ['Data prep & practice', qpct(MODULES[5])], ['Hands-on', (labsTried().length + challengesDone().length) / (Object.keys(LABS).length + Object.keys(CHAL).length)]];
const R = 92, cx = 130, cy = 120, pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / SK.length; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
const radar = `<svg viewBox="0 0 260 244" role="img" aria-label="Skill radar">${[.25, .5, .75, 1].map(f => `<polygon points="${SK.map((_, i) => pt(i, R * f).join(',')).join(' ')}" fill="none" stroke="var(--line2)"/>`).join('')}${SK.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}" stroke="var(--line)"/>`).join('')}
  <polygon class="rpoly" points="${SK.map(([, v], i) => pt(i, Math.max(R * v, 3)).join(',')).join(' ')}" fill="color-mix(in srgb,var(--accent) 28%,transparent)" stroke="var(--accent)" stroke-width="2.4" stroke-linejoin="round"/>
  ${SK.map(([l, v], i) => { const [x, y] = pt(i, R + 18); return `<text x="${x}" y="${y}" text-anchor="${x < cx - 8 ? 'end' : x > cx + 8 ? 'start' : 'middle'}" dominant-baseline="middle">${l}</text><circle cx="${pt(i, Math.max(R * v, 3))[0]}" cy="${pt(i, Math.max(R * v, 3))[1]}" r="3.6" fill="var(--accent)"/>`; }).join('')}</svg>`;

const hex = (b, on) => `<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M32 3l26 15v36L32 69 6 54V18z" fill="${on ? `color-mix(in srgb,var(${b.c}) 22%,var(--surface))` : 'var(--surface2)'}" stroke="${on ? `var(${b.c})` : 'var(--line2)'}" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 11l19 11v28L32 61 13 50V22z" fill="none" stroke="${on ? `var(${b.c})` : 'var(--line)'}" stroke-width="1" opacity=".5"/><text x="32" y="43" text-anchor="middle" font-size="22" fill="${on ? `var(${b.c})` : 'var(--mute)'}" opacity="${on ? 1 : .4}">${b.g}</text></svg>`;
const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
const recent = store.get('recent', []).filter(r => LABS[r.id]).slice(0, 4);
const recs = [];
if (next) { const n = MODULES.find(m => m === next), c = Math.round(qpct(n) * n.quiz.length); recs.push([`${c ? 'Finish' : 'Start'} Module ${n.n}: ${n.title}`, c ? `${c}/${n.quiz.length} quiz questions done.` : 'Next unfinished module in the path.', `modules.html#${n.id}`]); }
if (untriedLab) recs.push([`Try the ${LABS[untriedLab].t} lab`, 'You have not opened this experiment yet.', `lab.html#${untriedLab}`]);
if (nextChal) recs.push([`Challenge: ${CHAL[nextChal]}`, 'An unfinished challenge.', `challenges.html#${nextChal}`]);
if (!s.streak || s.streak < 2) recs.push(['Keep your streak alive', 'Answer one quiz question or open a lab today.', 'lab.html']);

document.getElementById('main').innerHTML = `
<div class="dash">
  <section class="d-hero"><div class="dh-text"><span class="label">${name ? name + ' · ' : ''}Level ${lv}</span><h1>Look at you,<br><em class="serif">training brains.</em></h1>
    <div class="dh-stats"><div><b>${xp}</b><span>XP</span></div><div><b>${s.streak}</b><span>day streak</span></div><div><b>${s.done.length}/${MODULES.length}</b><span>modules</span></div><div><b>${challengesDone().length}/5</b><span>challenges</span></div></div>
    <div class="lvbar"><i style="width:${xp % 100}%"></i></div><p class="mute" style="margin:6px 0 18px;font-size:.84rem">${100 - xp % 100} XP to level ${lv + 1} · ${Math.round(overall * 100)}% of all quiz questions answered</p>
    <a class="btn p" data-magnetic href="${next ? 'modules.html#' + next.id : 'lab.html'}">${s.done.length ? 'Continue learning' : 'Start learning'} <span aria-hidden="true">→</span></a></div>
    <div class="dh-px">${pixelSVG(xp ? 'proud' : 'happy')}</div></section>

  <section class="card d-act"><h2>This week</h2><p class="mute">Quiz answers, lab openings and XP awards, per day.</p>${vals.some(Boolean) ? `<svg viewBox="0 0 328 168" class="actchart" role="img" aria-label="Activity in the last 7 days">${bars}</svg>` : '<div class="empty"><div>' + pixelSVG('confused') + '</div><p>No activity yet this week. Answer a quiz question or open a lab and this chart will come alive.</p></div>'}</section>
  <section class="card d-radar"><h2>Skill radar</h2><p class="mute">Quiz accuracy per topic, plus hands-on exploration.</p><div class="radarwrap">${radar}</div></section>
  <section class="card d-recent"><h2>Recent experiments</h2>${recent.length ? `<ul class="rec">${recent.map(r => `<li><span class="rico" style="--c:var(${LABS[r.id].c})">${LABS[r.id].icon}</span><span><b>${LABS[r.id].t}</b><small>${ago(r.t)}</small></span><a class="btn sm" href="lab.html#${r.id}">Resume</a></li>`).join('')}</ul>` : '<div class="empty"><p>No experiments yet. The lab is waiting.</p><a class="btn sm" href="lab.html">Open the lab</a></div>'}</section>
  <section class="card d-next"><h2>Suggested next</h2><p class="mute">Rule-based suggestions from your progress. No AI involved.</p><ul class="rec">${recs.map(r => `<li><span><b>${r[0]}</b><small>${r[1]}</small></span><a class="btn sm" href="${r[2]}">Go →</a></li>`).join('') || '<li><span><b>You have done everything.</b><small>Revisit the lab and break something.</small></span></li>'}</ul></section>
  <section class="card d-badges"><h2>Achievements <small class="mute">${earned().length}/${BADGES.length}</small></h2><ul class="badges">${BADGES.map(b => { const on = b.t(s); return `<li class="${on ? 'on' : ''}" title="${b.d}">${hex(b, on)}<b>${b.n}</b><small>${on ? 'Earned' : b.d}</small></li>`; }).join('')}</ul></section>
</div>`;
