import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create, act } from 'react-test-renderer';
import { useAcademyGuide } from '../src/hooks/useAcademyGuide';
import { AcademyGuideModal } from '../src/components/AcademyGuideModal';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('first visit opens guide, dismissal persists, replay works, and unavailable storage does not block lessons', async () => {
  const values = new Map<string, string>();
  (globalThis as any).window = { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } };
  let guide: ReturnType<typeof useAcademyGuide>;
  function Harness() { guide = useAcademyGuide(); return null; }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness />); });
  assert.equal(guide!.guideOpen, true);
  await act(async () => guide!.dismissGuide());
  assert.equal(guide!.guideOpen, false);
  assert.equal(values.get('qalamtype_academy_guide_dismissed_v1'), '1');
  await act(async () => renderer!.unmount());
  await act(async () => { renderer = create(<Harness />); });
  assert.equal(guide!.guideOpen, false);
  await act(async () => guide!.replayGuide());
  assert.equal(guide!.guideOpen, true);
  (globalThis as any).window.localStorage.setItem = () => { throw new Error('storage blocked'); };
  await act(async () => guide!.dismissGuide());
  assert.equal(guide!.guideOpen, false);
  await act(async () => renderer!.unmount());
});

test('guide exposes skip and completion exits and stops playback/restores scroll and focus on close', async () => {
  let modalOpened = 0, modalClosed = 0, paused = 0, dismissed = 0, focused = 0;
  class FakeElement { focus() { focused++; } }
  (globalThis as any).HTMLElement = FakeElement;
  (globalThis as any).document = { body: { style: { overflow: 'auto' } }, activeElement: new FakeElement() };
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<AcademyGuideModal language="uzbek_latin" onDismiss={() => dismissed++} />, {
    createNodeMock: element => element.type === 'dialog' ? { showModal() { modalOpened++; }, close() { modalClosed++; } } : element.type === 'video' ? { pause() { paused++; }, load() {} } : null,
  }); });
  assert.equal(modalOpened, 1);
  assert.equal((globalThis as any).document.body.style.overflow, 'hidden');
  const root = renderer!.root;
  assert.equal(root.findByType('video').props.preload, 'metadata');
  assert.equal(root.findByType('video').props.autoPlay, undefined);
  await act(async () => root.findByProps({ className: 'academy-guide-skip' }).props.onClick());
  assert.equal(dismissed, 1);
  await act(async () => root.findByType('video').props.onEnded());
  assert.equal(dismissed, 2);
  let prevented = false;
  await act(async () => root.findByType('dialog').props.onCancel({ preventDefault() { prevented = true; } }));
  assert.equal(prevented, true);
  assert.equal(dismissed, 3);
  await act(async () => renderer!.unmount());
  assert.equal(paused, 1);
  assert.equal(modalClosed, 1);
  assert.equal(focused, 1);
  assert.equal((globalThis as any).document.body.style.overflow, 'auto');
});
