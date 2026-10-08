// Regression: ISSUE-004 — Soft Discovery accent text (blue/amber/coral) fell below WCAG AA (4.5:1).
// Found by /qa on 2026-10-08. Run: node --test tests/contrast.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/base.css', import.meta.url), 'utf8');
const block = name => { const m = css.match(new RegExp(`${name.replace(/[[\]]/g, '\\$&')}\\s*\\{([^}]*)\\}`)); assert.ok(m, `theme block ${name}`); return Object.fromEntries([...m[1].matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(x => [x[1], x[2]])); };
const lum = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const THEMES = { midnight: ':root,:root[data-theme=midnight]', soft: ':root[data-theme=soft]', forest: ':root[data-theme=forest]' };

for (const [name, sel] of Object.entries(THEMES)) {
  test(`${name}: text and accent tokens reach AA on the page and surface backgrounds`, () => {
    const t = block(sel);
    for (const fg of ['--ink', '--mute', '--accent', '--coral', '--violet', '--amber', '--blue'])
      for (const bg of ['--bg', '--surface']) assert.ok(ratio(t[fg], t[bg]) >= 4.5, `${name} ${fg} on ${bg} = ${ratio(t[fg], t[bg]).toFixed(2)}`);
    assert.ok(ratio(t['--accent-ink'], t['--accent']) >= 4.5, `${name} accent-ink on accent`);
  });
}
