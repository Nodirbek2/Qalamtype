import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create, act } from 'react-test-renderer';
import { useTypingEngine } from '../src/hooks/useTypingEngine';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).window = globalThis;
const pause = () => new Promise(resolve => setTimeout(resolve, 20));

test('short academy text completes and includes its final character in statistics', async () => {
  let engine: ReturnType<typeof useTypingEngine>;
  function Harness() {
    engine = useTypingEngine({ mode: 'words', duration: 60, wordCount: 100, difficulty: 'easy', language: 'english', customText: 'ab cd', typingSound: 'mute' });
    return null;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness />); });
  for (const key of 'ab cd') {
    await act(async () => { engine!.handleKeyDown({key, preventDefault() {}} as KeyboardEvent); });
  }
  await act(async () => { await pause(); });
  assert.equal(engine!.phase, 'completed');
  assert.equal(engine!.result?.correctChars, 5);
  assert.equal(engine!.result?.accuracy, 100);
  assert.equal(engine!.result?.wordCount, 2);
  await act(async () => { renderer!.unmount(); });
});

test('completed-word mistakes remain incorrect, skipped characters are missed, shortcuts are ignored', async () => {
  let engine: ReturnType<typeof useTypingEngine>;
  function Harness() {
    engine = useTypingEngine({ mode: 'words', duration: 60, wordCount: 100, difficulty: 'easy', language: 'english', customText: 'abc def', typingSound: 'mute' });
    return null;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness />); });
  await act(async () => { engine!.handleKeyDown({key:'r', ctrlKey:true, preventDefault() {}} as KeyboardEvent); });
  assert.equal(engine!.phase, 'idle');
  for (const key of 'ax def') {
    await act(async () => { engine!.handleKeyDown({key, preventDefault() {}} as KeyboardEvent); });
  }
  await act(async () => { await pause(); });
  assert.equal(engine!.result?.incorrectChars, 1);
  assert.equal(engine!.result?.missedChars, 1);
  assert.equal(engine!.result?.correctChars, 5);
  await act(async () => { renderer!.unmount(); });
});

test('live WPM has a sensible first-second floor and reflects elapsed time without another key', async () => {
  let engine: ReturnType<typeof useTypingEngine>;
  const originalNow = Date.now;
  let now = 100000;
  Date.now = () => now;
  function Harness() {
    engine = useTypingEngine({mode:'words',duration:60,wordCount:100,difficulty:'easy',language:'english',customText:'abc def',typingSound:'mute'});
    return null;
  }
  let renderer: ReturnType<typeof create> | undefined;
  try {
    await act(async () => {renderer=create(<Harness/>);});
    await act(async () => {engine!.handleKeyDown({key:'a',preventDefault(){}} as KeyboardEvent);});
    assert.equal(engine!.getLiveStats().wpm,12);
    now += 6000;
    assert.equal(engine!.getLiveStats().wpm,2);
    await act(async () => {engine!.pauseTest();});
    now += 6000;
    assert.equal(engine!.getLiveStats().wpm,2);
  } finally {
    if(renderer) await act(async()=>renderer!.unmount());
    Date.now=originalNow;
  }
});
