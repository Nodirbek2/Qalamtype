import React, { useState } from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create, act } from 'react-test-renderer';
import { LeaderboardFilter } from '../src/components/LeaderboardFilter';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('leaderboard filter commits one selected value, supports keyboard navigation and dismisses without changing filters', async () => {
  const windowListeners = new Map<string, Function>();
  const documentListeners = new Map<string, Function>();
  (globalThis as any).window = { innerHeight: 800, innerWidth: 390,
    addEventListener: (key: string, fn: Function) => windowListeners.set(key, fn),
    removeEventListener: (key: string) => windowListeners.delete(key),
  };
  (globalThis as any).document = {
    addEventListener: (key: string, fn: Function) => documentListeners.set(key, fn),
    removeEventListener: (key: string) => documentListeners.delete(key),
  };
  const changes: string[] = [];
  const triggerNode = { getBoundingClientRect: () => ({ left: 24, width: 342, top: 650, bottom: 720 }) };
  const rootNode = { contains: (node: unknown) => node === triggerNode };
  let scrolled = 0;
  function Harness() {
    const [value, setValue] = useState('time_30');
    return <LeaderboardFilter label="Mode" icon={null} value={value} onChange={v => { changes.push(v); setValue(v); }} options={[
      { value: 'all', label: 'All modes' }, { value: 'time_15', label: '15 seconds', group: 'Time' },
      { value: 'time_30', label: '30 seconds', group: 'Time' }, { value: 'words', label: 'Words' },
    ]}/>;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness/>, { createNodeMock: e => e.type === 'button' ? triggerNode :
    (e.props as { role?: string }).role === 'listbox' ? { querySelector: () => ({ scrollIntoView: () => scrolled++ }) } : rootNode }); });
  const button = () => renderer!.root.findByProps({ role: 'combobox' });
  const options = () => renderer!.root.findAllByProps({ role: 'option' });
  const press = async (key: string) => { let prevented = false; await act(async () => button().props.onKeyDown({ key,
    nativeEvent: {}, preventDefault() { prevented = true; }, stopPropagation() {} })); return prevented; };
  assert.equal(button().props['aria-expanded'], false);
  await press('ArrowDown');
  assert.equal(button().props['aria-expanded'], true);
  assert.equal(options()[2].props['data-active'], true);
  assert.equal(options()[2].props['aria-selected'], true);
  const list = renderer!.root.findByProps({ role: 'listbox' });
  assert.ok(list.props.style.bottom > 0, 'menu flips upward when space below is limited');
  assert.ok(list.props.style.width <= 366, 'menu stays within mobile viewport');
  await press('ArrowDown'); await press('Enter');
  assert.deepEqual(changes, ['words']); assert.equal(button().props['aria-expanded'], false);
  await press('ArrowUp'); await press('Home');
  assert.equal(options()[0].props['data-active'], true);
  await press('End'); assert.equal(options()[3].props['data-active'], true);
  await press('Escape'); assert.deepEqual(changes, ['words']);
  await press('w'); assert.equal(options()[3].props['data-active'], true);
  assert.equal(await press('Tab'), false); assert.equal(button().props['aria-expanded'], false);
  await act(async () => button().props.onClick());
  await act(async () => options()[1].props.onClick());
  assert.deepEqual(changes, ['words', 'time_15']);
  await act(async () => button().props.onClick());
  await act(async () => documentListeners.get('pointerdown')!({ target: {} }));
  assert.equal(button().props['aria-expanded'], false); assert.deepEqual(changes, ['words', 'time_15']);
  assert.ok(scrolled > 0);
  await act(async () => renderer!.unmount());
  assert.equal(windowListeners.size, 0); assert.equal(documentListeners.size, 0);
});
