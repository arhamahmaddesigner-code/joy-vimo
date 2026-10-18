const assert=require('node:assert/strict');
const {readFeedPreferences}=require('../lib/feedPreferenceLoad');
const {HIDDEN_KEY,REPORTS_KEY}=require('../lib/feedFeedback');
async function main(){
 const known=['nature','calm'];
 const rows=[[HIDDEN_KEY,'["nature","nature","unknown"]'],[REPORTS_KEY,'{"calm":"irrelevant"}']];
 const storage={multiGet:async()=>rows};
 assert.deepEqual(await readFeedPreferences(storage,null,known),{hidden:['nature'],reports:{calm:'irrelevant'}});
 await assert.rejects(()=>readFeedPreferences({multiGet:async()=>{throw Error('disk')}},null,known));
 await assert.rejects(()=>readFeedPreferences({multiGet:async()=>[[HIDDEN_KEY,'garbled'],[REPORTS_KEY,'{}']]},null,known));
 await assert.rejects(()=>readFeedPreferences({multiGet:async()=>[[HIDDEN_KEY,'{}'],[REPORTS_KEY,'{}']]},null,known));
 let waited=false;
 await readFeedPreferences(storage,{whenIdle:async()=>{waited=true}},known);
 assert.equal(waited,true);
 const ui=require('node:fs').readFileSync('components/OfflineActivities.js','utf8');
 assert.match(ui,/if\(feedStatus!=='ready'\)return/);
 assert.match(ui,/Retry loading Joy Feed/);
 console.log('PASS: Joy Feed remains hidden until private preferences load and validates malformed storage');
}
main().catch(e=>{console.error(e);process.exitCode=1});
