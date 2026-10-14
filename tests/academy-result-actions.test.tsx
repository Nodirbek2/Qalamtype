import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create, act } from 'react-test-renderer';
import { AcademyResultActions } from '../src/components/AcademyResultActions';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('Enter advances the completed lesson even with retry focused, once per key press, and cleans up', async () => {
  let listener: ((event: any) => void) | undefined;
  let next = 0, retry = 0, focus = 0, scroll = 0, removed = false;
  (globalThis as any).window = {
    addEventListener: (_: string, fn: any, capture: boolean) => { assert.equal(capture, true); listener = fn; },
    removeEventListener: (_: string, fn: any, capture: boolean) => { assert.equal(fn, listener); assert.equal(capture, true); removed = true; },
  };
  let renderer: ReturnType<typeof create>;
  const props = { nextLabel: 'Keyingi mashq', retryLabel: 'Qayta mashq', onNext: () => next++, onRetry: () => retry++ };
  await act(async () => { renderer = create(<AcademyResultActions {...props}/>, { createNodeMock: element => element.type === 'button' ? { focus() { focus++; } } : { closest() { return { scrollIntoView() { scroll++; } }; } } }); });
  assert.equal(focus, 1); assert.equal(scroll, 1);
  const buttons = renderer!.root.findAllByType('button');
  assert.equal(buttons[0].props['aria-keyshortcuts'], 'Enter');
  let prevented = false, stopped = false;
  const key = { key: 'Enter', repeat: false, target: { tagName: 'BUTTON' }, preventDefault() { prevented = true; }, stopPropagation() { stopped = true; } };
  await act(async () => listener!(key));
  assert.equal(next, 1); assert.equal(retry, 0); assert.ok(prevented && stopped);
  for (const override of [{ repeat:true }, { isComposing:true }, { ctrlKey:true }, { shiftKey:true }, { key:'a' }]) listener!({ ...key, ...override });
  assert.equal(next, 1);
  await act(async () => renderer!.update(<AcademyResultActions {...props} onNext={undefined}/>));
  listener!(key); assert.equal(next, 1);
  assert.equal(renderer!.root.findAllByType('button').length, 1);
  await act(async () => renderer!.root.findByType('button').props.onClick());
  assert.equal(retry, 1);
  await act(async () => renderer!.unmount()); assert.ok(removed);
});
