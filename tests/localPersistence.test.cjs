const assert=require('node:assert/strict');
const {createLocalPersistence}=require('../lib/localPersistence');
async function run(){
 const writes=[];
 let unblock;
 const gate=new Promise(resolve=>unblock=resolve);
 const storage={setItem:async(k,v)=>{await gate;writes.push([k,v])}};
 const persistence=createLocalPersistence(storage,'profile');
 const pending=persistence.save({age:'adult',xp:10});
 const erasing=persistence.pauseForErase();
 assert.equal(await persistence.save({age:'adult',xp:20}),false);
 unblock();
 assert.equal(await pending,false);
 await erasing;
 assert.equal(writes.length,0);
 assert.equal(await persistence.save({age:'adult',xp:30}),false);
 persistence.resume();
 assert.equal(await persistence.save({age:null,xp:0}),false);
 assert.equal(writes.length,0);
 assert.equal(await persistence.save({age:'adult',xp:40}),true);
 assert.equal(writes.length,1);
 console.log('PASS: serialized local profile persistence and erasure write barrier');
}
run().catch(e=>{console.error(e);process.exitCode=1});
