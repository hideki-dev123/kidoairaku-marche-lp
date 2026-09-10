import assert from 'node:assert/strict';
import test from 'node:test';
import { introTimeline } from '../app/intro-timeline.ts';

test('Hero stays hidden throughout the film and final-frame hold', () => {
  for (const progress of [0, 0.2, 0.5, 0.77, 0.78, 0.8, 0.82]) {
    assert.equal(introTimeline(progress, true).reveal, 0);
  }
  assert.equal(introTimeline(0.78, true).video, 1);
});

test('fast scrolling cannot reveal Hero until the final frame has decoded', () => {
  assert.equal(introTimeline(0.95, false).reveal, 0);
  assert.ok(introTimeline(0.95, true).reveal > 0);
  assert.equal(introTimeline(1, true).reveal, 1);
});

test('scrolling backwards reverses the timeline and overscroll is clamped', () => {
  assert.equal(introTimeline(0.39, false).video, 0.5);
  assert.deepEqual(introTimeline(-1, false), { video: 0, reveal: 0 });
  assert.deepEqual(introTimeline(2, true), { video: 1, reveal: 1 });
  assert.equal(introTimeline(0.2, true).reveal, 0);
});
