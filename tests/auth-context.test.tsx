import React from 'react';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create, act } from 'react-test-renderer';
import { build } from 'esbuild';
import { writeFile, unlink } from 'node:fs/promises';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

test('auth requests run outside the callback and failed profile updates reject', async () => {
  let listener: any;
  let insideCallback = false;
  let dbCalls = 0;
  const user = {id:'audit-user',email:'audit@example.invalid',user_metadata:{}};
  const profile = {id:user.id,username:'audit',first_name:'Audit',last_name:'Test',is_profile_complete:true};
  (globalThis as any).__auditSupabase = {
    auth: {
      onAuthStateChange(callback: any) {listener=callback; return {data:{subscription:{unsubscribe(){}}}};},
    },
    from() {
      assert.equal(insideCallback, false, 'database request inside auth callback');
      dbCalls++;
      return {
        select() {return this;}, eq() {return this;},
        maybeSingle: async () => ({data:profile,error:null}),
        upsert() {return this;},
        single: async () => ({data:null,error:new Error('database refused update')}),
      };
    },
  };
  const output = await build({entryPoints:['src/context/AuthContext.tsx'],bundle:true,write:false,platform:'node',format:'esm',external:['react','react/jsx-runtime'],plugins:[{
    name:'mock-supabase',setup(builder){
      builder.onResolve({filter:/lib\/supabase$/},()=>({path:'supabase',namespace:'mock'}));
      builder.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const supabase=globalThis.__auditSupabase; export const isSupabaseConfigured=true;',loader:'js'}));
    },
  }]});
  const path = new URL('./.auth-audit.mjs', import.meta.url);
  await writeFile(path,output.outputFiles[0].text);
  let renderer: ReturnType<typeof create> | undefined;
  try {
    const {AuthProvider,useAuth} = await import(path.href);
    let auth: any;
    function Harness(){auth=useAuth();return null;}
    await act(async()=>{renderer=create(<AuthProvider><Harness /></AuthProvider>);});
    await act(async()=>{insideCallback=true;listener('SIGNED_IN',{user});insideCallback=false;});
    await act(async()=>{await new Promise(resolve=>setTimeout(resolve,20));});
    assert.equal(auth.userProfile.username,'audit');
    assert.ok(dbCalls>0);
    await assert.rejects(auth.updateUserProfile({firstName:'Changed'}), /database refused update/);
    assert.equal(auth.userProfile.firstName,'Audit');
    await act(async()=>{listener('SIGNED_OUT',null);});
    assert.equal(auth.currentUser,null);
    assert.equal(auth.userProfile,null);
  } finally {
    if(renderer) await act(async()=>renderer!.unmount());
    await unlink(path);
    delete (globalThis as any).__auditSupabase;
  }
});
