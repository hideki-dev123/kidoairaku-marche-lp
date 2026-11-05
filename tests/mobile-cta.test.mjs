import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldShowMobileCta } from '../app/mobile-cta.ts';

test('the floating application link appears only between the hero and final application area', () => {
  assert.equal(shouldShowMobileCta(200, 6000, 844), false);
  assert.equal(shouldShowMobileCta(-1, 6000, 844), true);
  assert.equal(shouldShowMobileCta(-2000, 700, 844), false);
  assert.equal(shouldShowMobileCta(-2000, 745, 844), true);
});

