const assert=require('node:assert/strict');
const {changeDailyReminder,cancelAllDailyReminders,KEY,MARKER,formatReminderTime,validateReminderTime,ownedIds}=require('../lib/reminderScheduler');
async function run(){
 const data=new Map(),jobs=new Map();let next=0;let lastTrigger=null;
 const notifications={
  getAllScheduledNotificationsAsync:async()=>[...jobs].map(([identifier,content])=>({identifier,content})),
  scheduleNotificationAsync:async({content,trigger})=>{lastTrigger=trigger;const id='joy'+(++next);jobs.set(id,content);return id},
  cancelScheduledNotificationAsync:async id=>{jobs.delete(id)}
 };
 const storage={getItem:async k=>data.get(k)||null,setItem:async(k,v)=>data.set(k,v),removeItem:async k=>data.delete(k)};
 jobs.set('other',{data:{other:true}});
 assert.deepEqual(ownedIds([{identifier:'other',content:{data:{other:true}}}],'other'),[]);
 assert.equal(formatReminderTime(8,15),'08:15');
 assert.throws(()=>validateReminderTime(10,19),/minute/);
 let a=await changeDailyReminder({notifications,storage,previous:null,hour:8,enabled:true});
 assert.equal(a.id,'joy1');assert.equal(jobs.size,2);
 a=await changeDailyReminder({notifications,storage,previous:a,hour:21,minute:45,enabled:true});
 assert.equal(a.id,'joy2');assert.equal(lastTrigger.minute,45);assert.equal(a.minute,45);assert.equal(jobs.has('joy1'),false);assert.equal(jobs.has('other'),true);
 assert.equal(jobs.get('joy2').data[MARKER],true);
 await assert.rejects(()=>changeDailyReminder({notifications,storage,previous:a,hour:30,enabled:true}),/Invalid/);
 await cancelAllDailyReminders({notifications,storage});
 assert.equal(jobs.has('joy2'),false);assert.equal(jobs.has('other'),true);assert.equal(data.has(KEY),false);
 const failed={...notifications,scheduleNotificationAsync:async()=>{throw Error('failure')}};
 await assert.rejects(()=>changeDailyReminder({notifications:failed,storage,previous:null,hour:9,enabled:true}),/failure/);
 console.log('PASS: local reminder replacement, ownership, cancellation and failure handling');
}
run().catch(e=>{console.error(e);process.exitCode=1});
