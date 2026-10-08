// Regression: ISSUE-001 — wrong-typed saved data crashed every page that reads progress.
// Found by /qa on 2026-10-08. Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';

const mem = {};
globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
const { store } = await import('../js/store.js');
const put = (k, raw) => { mem['mlverse:' + k] = raw; };

test('returns the saved value when its type matches the default', () => {
  put('done', '["a","b"]'); assert.deepEqual(store.get('done', []), ['a', 'b']);
  put('xp', '42'); assert.equal(store.get('xp', 0), 42);
  put('streak', '{"n":3,"d":"x"}'); assert.deepEqual(store.get('streak', { n: 0 }), { n: 3, d: 'x' });
  put('name', '"Ada"'); assert.equal(store.get('name', ''), 'Ada');
});

test('falls back to the default for wrong-typed or corrupt data', () => {
  put('done', '{}'); assert.deepEqual(store.get('done', []), []);
  put('qok', 'null'); assert.deepEqual(store.get('qok', []), []);
  put('xp', '"abc"'); assert.equal(store.get('xp', 0), 0);
  put('streak', '5'); assert.deepEqual(store.get('streak', { n: 0 }), { n: 0 });
  put('activity', '[1,2]'); assert.deepEqual(store.get('activity', {}), {});
  put('chal', '7'); assert.deepEqual(store.get('chal', []), []);
  put('pixelPrefs', '5'); assert.deepEqual(store.get('pixelPrefs', { mute: false }), { mute: false });
  put('done', '{bad json'); assert.deepEqual(store.get('done', []), []);
  put('xp', 'null'); assert.equal(store.get('xp', 0), 0);
});

test('rejects non-finite numbers', () => {
  put('xp', '1e999'); assert.equal(store.get('xp', 0), 0);
});
