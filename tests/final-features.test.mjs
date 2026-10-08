// Regression: ISSUE-003 — final experiment lost its features when the target changed. Found by /qa on 2026-10-08.
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const { nextFeatures } = await import('../js/widgets/final.js');

const cols = ['duration', 'pages', 'adClicks', 'returning', 'converted'];
test('ISSUE-003: changing target keeps remaining selected features', () => {
  assert.deepEqual([...nextFeatures(cols, 'adClicks', new Set(['duration', 'pages', 'adClicks']))].sort(), ['duration', 'pages']);
});
test('ISSUE-003: never ends up with an empty feature set', () => {
  assert.deepEqual([...nextFeatures(cols, 'adClicks', new Set(['adClicks']))].sort(), ['converted', 'duration', 'pages', 'returning']);
  assert.deepEqual([...nextFeatures(cols, 'converted', new Set())].sort(), ['adClicks', 'duration', 'pages', 'returning']);
});
test('ISSUE-003: the target is never its own feature', () => {
  assert.equal(nextFeatures(cols, 'pages', new Set(cols)).has('pages'), false);
});
