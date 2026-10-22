type Point = { x: number; y: number };
type Scheduler = {
  request: (callback: FrameRequestCallback) => number;
  cancel: (id: number) => void;
  now: () => number;
};

// A gentle symmetric glide distributes movement across the entire animation.
// Unlike a steep ease-out, the first frame does not cover most of a letter.
export function caretEase(progress: number): number {
  const t = Math.max(0, Math.min(1, progress));
  return t < 0.5 ? Math.pow(t * 2, 1.25) / 2 : 1 - Math.pow((1 - t) * 2, 1.25) / 2;
}

export function createCaretMotion(paint: (position: Point) => void, scheduler: Scheduler) {
  let current: Point = { x: 0, y: 0 };
  let from = current, target = current;
  let started = 0, duration = 0;
  let frame: number | null = null;
  let initialized = false;

  const sample = (now: number) => {
    const progress = duration ? Math.min(1, Math.max(0, (now - started) / duration)) : 1;
    const eased = caretEase(progress);
    current = { x: from.x + (target.x - from.x) * eased, y: from.y + (target.y - from.y) * eased };
    return progress;
  };
  const tick = (now: number) => {
    frame = null;
    const progress = sample(now);
    paint(current);
    if (progress < 1) frame = scheduler.request(tick);
  };

  return {
    move(next: Point, milliseconds: number, snap = false) {
      // Repeated resize/font notifications must not restart an in-flight glide.
      if (initialized && next.x === target.x && next.y === target.y && !snap) return;
      if (frame !== null) scheduler.cancel(frame);
      frame = null;
      const now = scheduler.now();
      if (initialized) sample(now);
      target = next;
      if (!initialized || snap || milliseconds === 0) {
        current = from = target;
        duration = 0;
        initialized = true;
        paint(current);
        return;
      }
      from = current;
      started = now;
      duration = milliseconds;
      frame = scheduler.request(tick);
    },
    stop() {
      if (frame !== null) scheduler.cancel(frame);
      frame = null;
    },
  };
}
