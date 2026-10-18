// Serialize on-device preference writes and drain the queue before privacy erasure.
// A paused queue rejects new changes so pending tasks cannot recreate deleted data.
function createLocalWriteQueue(){
 let tail=Promise.resolve();
 let paused=false;
 function enqueue(work){
  if(typeof work!=='function')throw new TypeError('write task required');
  if(paused)return Promise.resolve(false);
  const task=tail.then(async()=>{
   if(paused)return false;
   return work();
  });
  tail=task.catch(()=>{});
  return task;
 }
 async function whenIdle(){await tail}
 async function pauseForErase(){paused=true;await tail}
 function resume(){paused=false}
 function isPaused(){return paused}
 return {enqueue,whenIdle,pauseForErase,resume,isPaused};
}
module.exports={createLocalWriteQueue};
