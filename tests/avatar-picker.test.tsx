import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create, act } from 'react-test-renderer';
import { build } from 'esbuild';
import { writeFile, unlink } from 'node:fs/promises';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('preset and gallery choices save to the profile; failed saves keep the current avatar', async () => {
  const saved: string[] = [];
  let fail = false, uploads = 0;
  const state = {
    currentUser: { id: 'member' },
    userProfile: { uid: 'member', username: 'member', firstName: 'Test', lastName: 'Member', createdAt: '2026-01-01', photoURL: '/avatars/character-1.svg' },
    async updateUserProfile(data: any) {
      if (fail) throw new Error('save refused');
      saved.push(data.photoURL);
      state.userProfile = { ...state.userProfile, ...data };
    },
    checkUsernameAvailability: async () => true,
  };
  (globalThis as any).__avatarAccount = state;
  (globalThis as any).__avatarUpload = async (uid: string, file: any) => {
    assert.equal(uid, 'member'); assert.equal(file.name, 'portrait.png'); uploads++;
    return 'https://example.invalid/portrait.jpg';
  };
  const output = await build({ entryPoints: ['src/components/AccountView.tsx'], bundle: true, write: false, platform: 'node', format: 'esm', external: ['react', 'react/jsx-runtime', 'lucide-react'], plugins: [{
    name: 'avatar-fixtures', setup(builder) {
      builder.onResolve({ filter: /context\/(AuthContext|SettingsContext)$|lib\/resultsService$|^recharts$/ }, args => ({ path: args.path, namespace: 'mock' }));
      builder.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ loader: 'js', contents:
        args.path.endsWith('AuthContext') ? 'export const useAuth=()=>globalThis.__avatarAccount;' :
        args.path.endsWith('SettingsContext') ? "export const useSettings=()=>({t:key=>key,siteLanguage:'uzbek_latin'});" :
        args.path.endsWith('resultsService') ? 'export const uploadAvatarImage=globalThis.__avatarUpload; export const subscribeToUserResults=(_,callback)=>{callback([]);return ()=>{}};' :
        'export const ResponsiveContainer=()=>null,LineChart=()=>null,Line=()=>null,XAxis=()=>null,YAxis=()=>null,Tooltip=()=>null,CartesianGrid=()=>null;'
      }));
    },
  }] });
  const path = new URL('./.avatar-picker.mjs', import.meta.url);
  await writeFile(path, output.outputFiles[0].text);
  let renderer: ReturnType<typeof create> | undefined;
  try {
    const { AccountView } = await import(path.href);
    await act(async () => { renderer = create(<AccountView/>); });
    const choice = () => renderer!.root.findAllByType('button').find(button => button.props['aria-label'] === 'Avatar 2')!;
    await act(async () => choice().props.onClick());
    assert.equal(saved[0], '/avatars/character-2.svg');
    assert.equal(choice().props['aria-pressed'], true);
    const fileInput = renderer!.root.findAllByType('input').find(input => input.props.type === 'file')!;
    await act(async () => fileInput.props.onChange({ target: { files: [{ name: 'portrait.png', type: 'image/png', size: 100 }] } }));
    assert.equal(uploads, 1);
    assert.equal(saved[1], 'https://example.invalid/portrait.jpg');
    fail = true;
    await act(async () => choice().props.onClick());
    assert.equal(state.userProfile.photoURL, 'https://example.invalid/portrait.jpg');
    assert.ok(renderer!.root.findByProps({role:'alert'}));
  } finally {
    if (renderer) await act(async () => renderer!.unmount());
    await unlink(path);
    delete (globalThis as any).__avatarAccount;
    delete (globalThis as any).__avatarUpload;
  }
});
