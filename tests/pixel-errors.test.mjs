// Regression: ISSUE-002 — PIXEL announced harmless navigation aborts as bugs. Found by /qa on 2026-10-08.
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const { isBenignError } = await import('../js/pixel.js');

test('ISSUE-002: view-transition aborts and ResizeObserver noise are not bugs', () => {
  assert.equal(isBenignError(new DOMException('Transition was skipped', 'AbortError')), true);
  assert.equal(isBenignError({ name: 'AbortError' }), true);
  assert.equal(isBenignError('ResizeObserver loop completed with undelivered notifications.'), true);
  assert.equal(isBenignError(new TypeError('x is not a function')), false);
  assert.equal(isBenignError(undefined), false);
});
