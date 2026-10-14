const assert=require('node:assert/strict');
const {eraseDeviceData,APP_DATA_KEYS,LocalEraseError}=require('../lib/localErase');
async function test(){
 const records=new Map(APP_DATA_KEYS.map(k=>[k,'private']));
 const storage={multiRemove:async keys=>keys.forEach(k=>records.delete(k)),multiGet:async keys=>keys.map(k=>[k,records.get(k)??null])};
 const good={nativeModule:{clearFocusConfig:async()=>true},requireNative:true,cancelReminders:async()=>{},eraseAuth:async()=>{},storage};
 assert.equal(await eraseDeviceData(good),true);
 assert.equal(records.size,0);
 for(const stage of ['focus','reminders','auth','storage']){
  const args={...good,storage:{multiRemove:async()=>{},multiGet:async()=>[['key','still saved']]}};
  if(stage==='focus')args.nativeModule={clearFocusConfig:async()=>{throw Error('test')}};
  if(stage==='reminders')args.cancelReminders=async()=>{throw Error('test')};
  if(stage==='auth')args.eraseAuth=async()=>{throw Error('test')};
  await assert.rejects(()=>eraseDeviceData(args),e=>e instanceof LocalEraseError&&e.stage===stage);
 }
 await assert.rejects(()=>eraseDeviceData({...good,nativeModule:null}),e=>e.stage==='focus');
 console.log('PASS: local data erase only succeeds after native, reminders, auth and storage cleanup');
}
test().catch(e=>{console.error(e);process.exitCode=1});
