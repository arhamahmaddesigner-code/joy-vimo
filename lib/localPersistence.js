// Serialize on-device profile writes so a pending save cannot recreate personal
// data after the user confirms device erasure.
function createLocalPersistence(storage,key){
  let pending=Promise.resolve();
  let paused=false;
  function save(state){
    if(!state?.age || paused)return Promise.resolve(false);
    const json=JSON.stringify(state);
    const task=pending.then(async()=>{
      if(paused)return false;
      await storage.setItem(key,json);
      return true;
    });
    pending=task.catch(()=>{});
    return task;
  }
  async function pauseForErase(){
    paused=true;
    await pending;
  }
  function resume(){paused=false}
  return {save,pauseForErase,resume};
}
module.exports={createLocalPersistence};
