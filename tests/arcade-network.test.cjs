const fs=require('node:fs');const {stripTypeScriptTypes}=require('node:module');const assert=require('node:assert/strict');
const src=fs.readFileSync('src/components/GamesView.tsx','utf8');
const body=src.split('  const startOnline = useCallback(async () => {')[1].split('  },[beginCountdown,cleanupChannels,makeText,playerName,typingLanguage,difficulty]);')[0];
const js=stripTypeScriptTypes('async function startOnline(){'+body+'}\n');
const factory=new Function('ctx','with(ctx){'+js+';return startOnline}');
function simulation(dropAck=false){
 let now=1000,id=0;const timers=new Map(),channels=[];
 const later=(fn,delay,repeat=0)=>{const key=++id;timers.set(key,{fn,at:now+delay,repeat});return key};
 const win={setTimeout:(fn,delay)=>later(fn,delay),setInterval:(fn,delay)=>later(fn,delay,delay),clearInterval:k=>timers.delete(k),clearTimeout:k=>timers.delete(k)};
 const sync=topic=>channels.filter(c=>c.topic===topic&&!c.closed).forEach(c=>later(()=>c.events.filter(e=>e.type==='presence').forEach(e=>e.fn({})),1));
 const supabase={channel(topic){
  const c={topic,closed:false,subscribed:false,presence:null,events:[],on(type,filter,fn){this.events.push({type,event:filter.event,fn});return this},subscribe(fn){later(()=>{if(!this.closed){this.subscribed=true;fn('SUBSCRIBED')}},1);return this},track(p){this.presence=p;sync(topic);return Promise.resolve()},untrack(){this.presence=null;sync(topic);return Promise.resolve()},presenceState(){return Object.fromEntries(channels.filter(o=>o.topic===topic&&!o.closed&&o.presence).map(o=>[o.presence.id,[o.presence]]))},send({event,payload}){if(dropAck && event==='start-ack'){dropAck=false;return Promise.resolve()};channels.filter(o=>o!==this&&!o.closed&&o.subscribed&&o.topic===topic).forEach(o=>later(()=>{if(!o.closed)o.events.filter(e=>e.type==='broadcast'&&e.event===event).forEach(e=>e.fn({payload}))},1));return Promise.resolve()}};channels.push(c);return c;
 },removeChannel(c){c.closed=true;c.presence=null;sync(c.topic);return Promise.resolve()}};
 function client(name,lang='english'){
  const refs={lobbyRef:{current:null},raceRef:{current:null},handshakeTimerRef:{current:null},matchTimerRef:{current:null}};
  const ctx={...refs,generation:{current:0},CLIENT_ID:name,playerName:name,typingLanguage:lang,difficulty:'medium',window:win,Date:{now:()=>now},supabase,BOT_NAMES:['Aziz','Madina','Bek','a','b','c','d','Nilufar','Diyor'],makeText:()=>lang+' Three sentences.',started:[],setPhase:v=>ctx.phase=v,setOnline:v=>ctx.online=v,setTyped:()=>{},setMessage:()=>{},setPlayers:()=>{},clamp:x=>Math.max(0,Math.min(100,x))};
  ctx.clear=()=>{win.clearInterval(refs.handshakeTimerRef.current);win.clearTimeout(refs.matchTimerRef.current)};
  ctx.cleanupChannels=async()=>{ctx.generation.current++;ctx.clear();for(const ref of [refs.raceRef,refs.lobbyRef]){if(ref.current)supabase.removeChannel(ref.current);ref.current=null}};
  ctx.beginCountdown=(text,players,startsAt)=>{ctx.clear();ctx.started.push({text,players,startsAt})};ctx.start=factory(ctx);return ctx;
 }
 function advance(ms){const end=now+ms;let limit=10000;while(limit--){const entries=[...timers].filter(([k,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0]);if(!entries.length)break;const[k,t]=entries[0];now=t.at;if(t.repeat)timers.set(k,{...t,at:now+t.repeat});else timers.delete(k);t.fn()}assert.ok(limit>0,'timer loop bounded');now=end}
 return{client,advance};
}
(async()=>{
 for(const loss of [false,true]){const sim=simulation(loss);const a=sim.client('a'),b=sim.client('b');await Promise.all([a.start(),b.start()]);sim.advance(11000);assert.equal(a.started.length,1);assert.equal(b.started.length,1);assert.equal(a.started[0].text,b.started[0].text);assert.equal(a.started[0].startsAt,b.started[0].startsAt);assert.equal(a.online,true);assert.equal(b.online,true);}
 {const sim=simulation();const a=sim.client('a');await a.start();sim.advance(13000);assert.equal(a.started.length,1);assert.equal(a.online,false);assert.equal(a.started[0].players.filter(p=>p.isBot).length,3)}
 {const sim=simulation();const a=sim.client('a');const pending=a.start();await a.cleanupChannels();await pending;sim.advance(15000);assert.equal(a.started.length,0)}
 {const sim=simulation();const a=sim.client('a','english'),b=sim.client('b','russian');await Promise.all([a.start(),b.start()]);sim.advance(15000);assert.equal(a.online,false);assert.equal(b.online,false);assert.notEqual(a.started[0].text,b.started[0].text)}
 console.log('PASS: two-client handshake, lost acknowledgement recovery, bot fallback, cancellation during cleanup, separate language queues');
})().catch(e=>{console.error(e);process.exitCode=1});
