import React from 'react';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {create,act} from 'react-test-renderer';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;

test('caret moves in the text layout commit without a second render, and wraps without a diagonal sweep',async()=>{
  let renders=0, row=0;
  let animationFrame: FrameRequestCallback | undefined;
  (globalThis as any).__caretSettings=()=>{renders++;return {smoothCaret:'medium',typingFont:'jetbrains_mono',t:(key:string)=>key}};
  (globalThis as any).window={matchMedia:()=>({matches:false}),requestAnimationFrame(fn:FrameRequestCallback){animationFrame=fn;return 1},cancelAnimationFrame(){animationFrame=undefined},addEventListener(){},removeEventListener(){}};
  (globalThis as any).document={};
  const caret={style:{} as Record<string,string>};
  const container={getBoundingClientRect:()=>({top:0,left:0}),clientHeight:260,scrollTop:0,querySelector:()=>null};
  const output=await build({entryPoints:['src/components/TypingArea.tsx'],bundle:true,write:false,platform:'node',format:'esm',external:['react','react/jsx-runtime','lucide-react'],plugins:[{name:'settings',setup(b){
    b.onResolve({filter:/context\/SettingsContext$/},()=>({path:'settings',namespace:'mock'}));
    b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const useSettings=globalThis.__caretSettings;',loader:'js'}));
  }}]});
  const path=new URL('./.caret-rendering.mjs',import.meta.url);await writeFile(path,output.outputFiles[0].text);
  let renderer:ReturnType<typeof create>|undefined;
  const word=(index:number)=>[{wordIndex:0,originalWord:'abc',typedWord:'abc'.slice(0,index),hasError:false,isCurrentWord:true,chars:[...'abc'].map((char,i)=>({char,status:i<index?'correct':'untouched',globalIndex:i,isCurrent:i===index}))}];
  const props={currentIndex:0,wordsDisplay:word(0),phase:'running',timeLeft:30,mode:'time',duration:30,wordCount:25,difficulty:'easy',language:'english',onRestart(){},onKeyDown(){}};
  const createNodeMock=(el:any)=>{
    if(el.props['data-typing-caret'])return caret;
    if(el.props['data-char-idx']!==undefined)return {getAttribute:(name:string)=>String(name==='data-char-idx'?el.props['data-char-idx']:el.props['data-caret-pos']),getBoundingClientRect:()=>({left:el.props['data-char-idx']*12,right:(el.props['data-char-idx']+1)*12,top:row,height:28})};
    if(el.props.className?.includes('typing-paper'))return container;
    return {getBoundingClientRect:()=>({top:0,left:0}),focus(){}};
  };
  try{
    const {TypingArea}=await import(path.href);
    await act(async()=>{renderer=create(<TypingArea {...props}/>,{createNodeMock})});
    assert.equal(caret.style.transition,undefined);
    const baseline=renders;
    await act(async()=>renderer!.update(<TypingArea {...props} currentIndex={1} wordsDisplay={word(1)}/>));
    assert.equal(renders,baseline+1,'position updates must not cause a second full text render');
    assert.ok(animationFrame);
    animationFrame!(performance.now()+110);
    assert.equal(caret.style.transform,'translate3d(12px, 0px, 0)');
    assert.equal(caret.style.transition,undefined);
    row=42;
    await act(async()=>renderer!.update(<TypingArea {...props} currentIndex={2} wordsDisplay={word(2)}/>));
    assert.equal(caret.style.transition,undefined);
    assert.equal(caret.style.transform,'translate3d(24px, 42px, 0)');
  }finally{
    if(renderer)await act(async()=>renderer!.unmount());
    await unlink(path);delete (globalThis as any).__caretSettings;delete (globalThis as any).window;delete (globalThis as any).document;
  }
});
