import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caretEase, createCaretMotion } from '../src/lib/caretMotion';

function harness() {
  let now = 0, serial = 0;
  const pending = new Map<number, FrameRequestCallback>();
  const positions: { x: number; y: number }[] = [];
  const motion = createCaretMotion(point => positions.push(point), {
    request(fn) { pending.set(++serial, fn); return serial; },
    cancel(id) { pending.delete(id); }, now: () => now,
  });
  return { motion, positions, pending, frame(time: number) {
    now = time;
    const callbacks = [...pending.values()]; pending.clear();
    callbacks.forEach(fn => fn(time));
  } };
}

test('movement paints intermediate positions at both 60 and 120 Hz, finishing exactly at its target', () => {
  for (const hz of [60, 120]) {
    const h = harness(); h.motion.move({ x: 0, y: 2 }, 100);
    h.motion.move({ x: 16, y: 2 }, 100);
    for (let i = 1; i <= hz / 10; i++) h.frame(i * 1000 / hz);
    h.frame(101);
    assert.ok(h.positions.filter(p => p.x > 0 && p.x < 16).length >= hz / 10 - 1);
    assert.deepEqual(h.positions.at(-1), { x: 16, y: 2 });
    assert.equal(h.pending.size, 0);
  }
  assert.equal(caretEase(0.5), 0.5);
  assert.ok(caretEase(1 / 6) < 0.2, 'first 60 Hz frame should not jump most of a letter');
});

test('rapid typing retargets from the visible position without queued jumps or animation restarts', () => {
  const h = harness(); h.motion.move({ x: 0, y: 0 }, 100);
  h.motion.move({ x: 16, y: 0 }, 100); h.frame(50);
  assert.equal(h.positions.at(-1)!.x, 8);
  h.motion.move({ x: 32, y: 0 }, 100); h.frame(100);
  assert.equal(h.positions.at(-1)!.x, 20);
  h.motion.move({ x: 32, y: 0 }, 100); h.frame(150);
  assert.equal(h.positions.at(-1)!.x, 32);
  assert.equal(h.pending.size, 0);
  h.motion.move({ x: 0, y: 40 }, 100, true);
  assert.deepEqual(h.positions.at(-1), { x: 0, y: 40 });
  h.motion.move({ x: 16, y: 40 }, 100); h.motion.stop();
  assert.equal(h.pending.size, 0);
});
