// Render real React components with native/video adapters replaced by in-memory fakes.
// This checks lifecycle wiring, not Android decoding or the legality of fixture media.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const React=require('react');
const {act,create}=require('react-test-renderer');
const {transformSync}=require('@babel/core');
const catalog=require('../lib/reviewedVideoCatalog');
global.IS_REACT_ACT_ENVIRONMENT=true;
const fixture={id:'fixture-only',title:'Fictional fixture',topic:'Nature',ageRating:'teen',sourceUrl:'https://example.org/fixture.mp4',rightsProofUrl:'https://example.org/fixture-rights',rightsHolder:'Fictional holder',rightsReviewer:'Fictional reviewer',contentReviewer:'Fictional reviewer',reviewedAt:'2026-01-01',rightsValidUntil:'2026-10-20',approvalState:'approved',durationSeconds:30,attributionText:'Fictional test credit',appStreamingAllowed:true,commercialUseAllowed:true,territory:'worldwide'};
const listeners=new Set(),timers=new Set(),players=[];
const native={View:'View',Text:'Text',Pressable:'Pressable',StyleSheet:{create:value=>value},AppState:{addEventListener:(_,callback)=>{listeners.add(callback);return{remove:()=>listeners.delete(callback)}}}};
function load(relative,overrides={}){
 const filename=path.resolve(relative),mod={exports:{}};
 const {code}=transformSync(fs.readFileSync(filename,'utf8'),{filename,babelrc:false,configFile:false,plugins:['@babel/plugin-transform-react-jsx','@babel/plugin-transform-modules-commonjs']});
 const req=id=>id==='react-native'?native:Object.hasOwn(overrides,id)?overrides[id]:require(id.startsWith('.')?path.resolve(path.dirname(filename),id):id);
 new Function('require','module','exports','setTimeout','clearTimeout',code)(req,mod,mod.exports,(callback,delay)=>{const timer={callback,delay};timers.add(timer);return timer},timer=>timers.delete(timer));
 return mod.exports.default;
}
const Player=load('components/ApprovedVideoPlayer.js',{
 expo:{useEvent:()=>({status:'readyToPlay'})},
 'expo-video':{VideoView:'VideoView',useVideoPlayer:(_,initialize)=>React.useMemo(()=>{const player={loop:true,pauses:0,pause(){this.pauses++},replaceAsync:async()=>{}};players.push(player);initialize(player);return player},[])}
});
const Section=load('components/ReviewedVideoSection.js',{
 '../lib/reviewedVideoCatalog':{...catalog,VIDEO_ENTRIES:[fixture],availableReviewedVideos:(age,topics)=>catalog.availableReviewedVideos(age,topics,[fixture])},
 './ApprovedVideoPlayer':Player
});
function strings(node){if(typeof node==='string')return node;return(node.children||[]).map(strings).join('')}
(async()=>{
 const originalNow=Date.now;
 let clock=Date.parse('2026-10-20T23:59:59.000Z'),renderer;
 Date.now=()=>clock;
 const hidden=[],flags=[];
 const props={age:'adult',interests:['Nature'],hidden,onHide:id=>hidden.push(id),onFlag:(id,reason)=>flags.push([id,reason])};
 const update=async extra=>act(()=>renderer.update(React.createElement(Section,{...props,...extra})));
 const press=async label=>{const button=renderer.root.findAllByType('Pressable').find(node=>strings(node)===label);assert.ok(button,'Button: '+label);await act(()=>button.props.onPress())};
 const playerCount=()=>renderer.root.findAllByType('VideoView').length;
 try{
  await act(()=>{renderer=create(React.createElement(Section,props))});
  assert.equal(playerCount(),0);
  assert.equal([...timers][0].delay,1001);
  await press('Play Fictional fixture · 30s');
  assert.equal(playerCount(),1);
  assert.equal(players.at(-1).loop,false);
  assert.ok(strings(renderer.root).includes('Fictional test credit'));
  const first=players.at(-1),before=first.pauses;
  await act(()=>{for(const listener of listeners)listener('background')});
  assert.ok(first.pauses>before,'background pauses actual player component');
  await press('Hide this video');
  assert.equal(playerCount(),0);
  assert.deepEqual(hidden,['video:fixture-only']);
  await update({});
  assert.ok(strings(renderer.root).includes('All matching videos are hidden'));
  hidden.length=0;await update({});
  await press('Play Fictional fixture · 30s');
  await update({age:'kid'});
  assert.equal(playerCount(),0,'age downgrade releases player');
  await update({age:'adult'});
  assert.equal(playerCount(),0,'returning to adult never auto-selects a previous video');
  await press('Play Fictional fixture · 30s');
  await press('Flag video privately');
  await press('This content makes me uncomfortable');
  assert.deepEqual(flags,[['video:fixture-only','uncomfortable']]);
  assert.equal(playerCount(),0);
  await press('Play Fictional fixture · 30s');
  const expiring=players.at(-1),pauses=expiring.pauses;
  clock=Date.parse('2026-10-21T00:00:00.001Z');
  await act(()=>{for(const timer of [...timers])timer.callback()});
  assert.equal(playerCount(),0,'expiry releases active native player');
  assert.ok(expiring.pauses>pauses);
  assert.equal(timers.size,0);
  assert.equal(renderer.root.findAllByType('Pressable').length,0,'expired media cannot restart');
  await act(()=>renderer.unmount());
  renderer=null;
  assert.equal(listeners.size,0);
  console.log('PASS: rendered video manual start, attribution, background pause, hide/flag, age downgrade and expiry cleanup');
 }finally{if(renderer)await act(()=>renderer.unmount());Date.now=originalNow;delete global.IS_REACT_ACT_ENVIRONMENT}
})().catch(error=>{console.error(error);process.exitCode=1});
