// Small markup helpers shared by pages.
import { REFS } from './data/refs.js';
export const pageHead = (chip, title, lead = '') =>
  `<header class="pagehead"><span class="chip">${chip}</span><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</header>`;

// Replace [[id]] markers with numbered superscript citations; returns html + ordered ids.
export function cite(htmls) {
  const order = [];
  const out = htmls.map(h => h.replace(/\[\[([\w-]+)\]\]/g, (_, id) => {
    if (!REFS[id]) return '';
    if (!order.includes(id)) order.push(id);
    return `<sup class="cite"><a href="#ref-${id}" aria-label="Reference ${order.indexOf(id) + 1}">${order.indexOf(id) + 1}</a></sup>`;
  }));
  return { out, order };
}
export const refItem = (id, n) => { const r = REFS[id];
  return `<li id="ref-${id}"${n ? ` value="${n}"` : ''}>${r.a} (${r.y}). <a href="${r.u}" target="_blank" rel="noopener noreferrer"><cite>${r.t}</cite></a>. ${r.v}.</li>`; };
