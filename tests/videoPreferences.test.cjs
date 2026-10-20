const assert=require('node:assert/strict');
const {videoPreferenceId}=require('../lib/reviewedVideoCatalog');
const {HIDDEN_KEY,REPORTS_KEY,flagActivity,normalizeHidden}=require('../lib/feedFeedback');
const {readFeedPreferences,resetFeedPreferences}=require('../lib/feedPreferenceLoad');
(async()=>{
 const activityId='nature-calm-1',videoId=videoPreferenceId({id:activityId});
 const ids=[activityId,videoId];
 assert.notEqual(videoId,activityId);
 const hidden=normalizeHidden([videoId,videoId,'video:unknown'],ids);
 assert.deepEqual(hidden,[videoId]);
 assert.equal(hidden.includes(activityId),false);
 const flags=flagActivity({},videoId,'uncomfortable',ids);
 const values=new Map([[HIDDEN_KEY,JSON.stringify(hidden)],[REPORTS_KEY,JSON.stringify(flags)],['profile','keep']]);
 const storage={multiGet:async keys=>keys.map(key=>[key,values.get(key)??null]),multiRemove:async keys=>keys.forEach(key=>values.delete(key))};
 const queue={enqueue:async job=>job(),whenIdle:async()=>{}};
 assert.deepEqual(await readFeedPreferences(storage,queue,ids),{hidden:[videoId],reports:{[videoId]:'uncomfortable'}});
 // Restoring hidden content leaves the private feedback record intact.
 values.delete(HIDDEN_KEY);
 assert.deepEqual(await readFeedPreferences(storage,queue,ids),{hidden:[],reports:flags});
 await resetFeedPreferences(storage,queue);
 assert.deepEqual(await readFeedPreferences(storage,queue,ids),{hidden:[],reports:{}});
 assert.equal(values.get('profile'),'keep');
 console.log('PASS: video preferences survive hydration, do not collide with activities, and use existing privacy reset');
})().catch(error=>{console.error(error);process.exitCode=1});
