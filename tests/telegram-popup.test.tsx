import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create, act } from 'react-test-renderer';
import { build } from 'esbuild';
import { writeFile, unlink } from 'node:fs/promises';
import { localDay, TELEGRAM_PROMPT_KEY } from '../src/lib/telegramPrompt';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('display is counted before dismissal, repeats only after another completed exercise on a later day', async () => {
  const stored = new Map<string, string>();
  let timer: (() => void) | undefined;
  (globalThis as any).localStorage = { getItem: (key: string) => stored.get(key) || null, setItem: (key: string, value: string) => stored.set(key, value) };
  (globalThis as any).window = {
    setTimeout(fn: () => void, delay: number) { assert.equal(delay, 2000); timer = fn; return 1; },
    clearTimeout() { timer = undefined; }, addEventListener() {}, removeEventListener() {},
  };
  const output = await build({ entryPoints: ['src/components/TelegramBlogPrompt.tsx'], bundle: true, write: false, platform: 'node', format: 'esm', external: ['react', 'react/jsx-runtime', 'lucide-react'], plugins: [{ name: 'settings', setup(builder) {
    builder.onResolve({filter:/context\/SettingsContext$/},()=>({path:'settings',namespace:'mock'}));
    builder.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:"export const useSettings=()=>({siteLanguage:'uzbek_latin'});",loader:'js'}));
  } }] });
  const path = new URL('./.telegram-popup.mjs', import.meta.url);
  await writeFile(path, output.outputFiles[0].text);
  let renderer: ReturnType<typeof create> | undefined;
  let displays = 0;
  const createNodeMock = () => ({open:false, showModal() { this.open=true; displays++; }, close() { this.open=false; }});
  try {
    const { TelegramBlogPrompt } = await import(path.href);
    const mount = async () => { await act(async()=>{renderer=create(<TelegramBlogPrompt/>,{createNodeMock});}); };
    const unmount = async () => { await act(async()=>renderer!.unmount()); renderer=undefined; };
    await mount(); assert.equal(stored.size, 0);
    await act(async()=>timer!());
    assert.equal(displays, 1);
    assert.equal(stored.get(TELEGRAM_PROMPT_KEY), localDay());
    await unmount(); await mount();
    assert.equal(timer, undefined); assert.equal(displays, 1);
    await unmount();
    stored.set(TELEGRAM_PROMPT_KEY, '2020-01-01');
    await mount(); await act(async()=>timer!()); assert.equal(displays, 2);
    await act(async()=>renderer!.root.findByProps({'aria-label':'Yopish'}).props.onClick());
    assert.equal(stored.get(TELEGRAM_PROMPT_KEY), localDay());
  } finally {
    if (renderer) await act(async()=>renderer!.unmount());
    await unlink(path); delete (globalThis as any).window; delete (globalThis as any).localStorage;
  }
});
