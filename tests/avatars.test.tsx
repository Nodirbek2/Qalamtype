import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create, act } from 'react-test-renderer';
import { readFile } from 'node:fs/promises';
import { AVATAR_PRESETS, defaultAvatar } from '../src/lib/avatars';
import { UserAvatar } from '../src/components/UserAvatar';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('all default avatars exist and account IDs map to stable, varied characters', async () => {
  for (const path of AVATAR_PRESETS) assert.match(await readFile(`public${path}`, 'utf8'), /<svg/);
  const assigned = Array.from({ length: 100 }, (_, i) => defaultAvatar(`account-${i}`));
  assert.equal(new Set(assigned).size, AVATAR_PRESETS.length);
  assert.equal(defaultAvatar('same-user'), defaultAvatar('same-user'));
});

test('a broken profile photo falls back to the same avatar and accepts a replacement', async () => {
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<UserAvatar uid="member" name="Member" photoURL="broken.jpg"/>); });
  const img = () => renderer!.root.findByType('img');
  assert.equal(img().props.src, 'broken.jpg');
  await act(async () => img().props.onError());
  assert.equal(img().props.src, defaultAvatar('member'));
  await act(async () => renderer!.update(<UserAvatar uid="member" name="Member" photoURL={AVATAR_PRESETS[1]}/>));
  assert.equal(img().props.src, AVATAR_PRESETS[1]);
  await act(async () => renderer!.unmount());
});
