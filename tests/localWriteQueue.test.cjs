const assert=require('node:assert/strict');
const {createLocalWriteQueue}=require('../lib/localWriteQueue');
async function main(){
 const q=createLocalWriteQueue(),order=[];let release;
 const hold=new Promise(resolve=>release=resolve);
 const first=q.enqueue(async()=>{order.push('first-start');await hold;order.push('first-end');return true});
 const second=q.enqueue(async()=>{order.push('second');return true});
 release();await Promise.all([first,second]);assert.deepEqual(order,['first-start','first-end','second']);
 let finish;const waiting=new Promise(resolve=>finish=resolve);
 const third=q.enqueue(async()=>{await waiting;order.push('third')});
 const erasing=q.pauseForErase();assert.equal(await q.enqueue(async()=>{throw Error('Should not run')}),false);
 finish();await third;await erasing;assert.equal(q.isPaused(),true);
 q.resume();assert.equal(await q.enqueue(async()=>true),true);
 console.log('PASS: serialized feed write queue, privacy erase barrier and resume');
}
main().catch(e=>{console.error(e);process.exitCode=1});
