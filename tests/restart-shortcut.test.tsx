import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, create } from 'react-test-renderer';
import { useTestRestartShortcut } from '../src/hooks/useTestRestartShortcut';
import { useTypingEngine } from '../src/hooks/useTypingEngine';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('Tab then Enter resets running, paused and completed tests once and returns typing focus', async () => {
  const listeners = new Map<string, { fn: Function; capture: boolean }>();
  const frames = new Map<number, FrameRequestCallback>();
  let focusCount = 0;
  let modalOpen = false;
  let restarts = 0;
  let frameId = 0;
  (globalThis as any).window = {
    setInterval, clearInterval, setTimeout, clearTimeout,
    addEventListener: (key: string, fn: Function, capture = false) => listeners.set(key, { fn, capture }),
    removeEventListener: (key: string) => listeners.delete(key),
    requestAnimationFrame: (fn: FrameRequestCallback) => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };
  (globalThis as any).document = { querySelector: (selector: string) => selector.startsWith('[data-typing-input')
    ? { focus: () => focusCount++ } : modalOpen ? {} : null };
  let engine: ReturnType<typeof useTypingEngine>;
  function Harness({ enabled = true }: { enabled?: boolean }) {
    engine = useTypingEngine({ mode: 'time', duration: 30, wordCount: 25, difficulty: 'easy', language: 'english', customText: 'abc def', typingSound: 'mute' });
    const restart = React.useCallback(() => { restarts++; engine!.resetTest(); }, [engine.resetTest]);
    useTestRestartShortcut(enabled, restart);
    return null;
  }
  let renderer: ReturnType<typeof create>;
  const press = async (key: string, extra: Record<string, unknown> = {}) => {
    let prevented = false;
    let stopped = false;
    const event = { key, target: { closest: () => null }, preventDefault: () => { prevented = true; },
      stopImmediatePropagation: () => { stopped = true; }, ...extra } as unknown as KeyboardEvent;
    await act(async () => {
      listeners.get('keydown')?.fn(event);
      if (!stopped && !extra.skipTyping) engine!.handleKeyDown(event);
    });
    return { prevented, stopped };
  };
  try {
    await act(async () => { renderer = create(<Harness />); });
    assert.equal(listeners.get('keydown')?.capture, true, 'runs before input stopPropagation');
    await press('a');
    assert.equal(engine!.phase, 'running');
    await press('Enter');
    assert.equal(restarts, 0, 'Enter alone does not interrupt a test');
    assert.deepEqual(await press('Tab'), { prevented: true, stopped: true });
    assert.equal(restarts, 0, 'Tab alone does not restart');
    assert.equal(engine!.phase, 'running');
    await press('Enter');
    assert.equal(restarts, 1);
    assert.equal(engine!.phase, 'idle');
    assert.equal(engine!.timeLeft, 30);
    assert.deepEqual(engine!.typedChars, []);
    assert.equal(engine!.currentIndex, 0);
    assert.equal(engine!.result, null);
    for (const fn of frames.values()) fn(0);
    frames.clear();
    assert.equal(focusCount, 1);
    await press('a');
    await act(async () => { engine!.pauseTest(); });
    await press('Tab'); await press('Enter');
    assert.equal(restarts, 2);
    assert.equal(engine!.isPaused, false);
    assert.equal(engine!.phase, 'idle');
    await press('a');
    await act(async () => { engine!.finishTest(); });
    assert.equal(engine!.phase, 'completed');
    await press('Tab'); await press('Enter');
    assert.equal(restarts, 3);
    assert.equal(engine!.result, null);
    await press('Tab'); await press('b'); await press('Enter');
    assert.equal(restarts, 3, 'another key cancels the sequence');
    await press('Tab'); listeners.get('pointerdown')!.fn(); await press('Enter');
    await press('Tab'); listeners.get('blur')!.fn(); await press('Enter');
    assert.equal(restarts, 3, 'click and window blur cancel the sequence');
    for (const modifier of ['shiftKey', 'ctrlKey', 'altKey', 'metaKey', 'isComposing']) {
      await press('Tab', { [modifier]: true }); await press('Enter');
    }
    assert.equal(restarts, 3, 'browser shortcuts and IME are preserved');
    modalOpen = true;
    assert.equal((await press('Tab')).stopped, false);
    await press('Enter');
    assert.equal(restarts, 3, 'dialogs own their keyboard input');
    modalOpen = false;
    assert.equal((await press('Tab', { target: { closest: () => ({}) } })).stopped, false);
    await press('Enter');
    assert.equal(restarts, 3, 'form fields and buttons retain native behavior');
    await press('Tab'); await press('Tab', { repeat: true }); await press('Enter');
    assert.equal(restarts, 4, 'holding Tab still restarts only once');
    await act(async () => { renderer!.update(<Harness enabled={false} />); });
    assert.equal(listeners.size, 0, 'other pages and open settings disable the shortcut');
    assert.equal(frames.size, 0);
  } finally {
    await act(async () => { renderer!.unmount(); });
  }
});
