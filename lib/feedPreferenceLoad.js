// Device-only preference hydration. Keep the whole feed hidden until the
// saved hidden list and feedback have been read and validated successfully.
const {HIDDEN_KEY,REPORTS_KEY,normalizeHidden,normalizeReports}=require('./feedFeedback');
async function readFeedPreferences(storage,queue,knownIds){
 if(queue?.whenIdle)await queue.whenIdle();
 const rows=await storage.multiGet([HIDDEN_KEY,REPORTS_KEY]);
 if(!Array.isArray(rows)||rows.length!==2||
    rows[0]?.[0]!==HIDDEN_KEY||rows[1]?.[0]!==REPORTS_KEY){
  throw new Error('Feed preferences could not be read');
 }
 const hidden=JSON.parse(rows[0][1]||'[]');
 const reports=JSON.parse(rows[1][1]||'{}');
 if(!Array.isArray(hidden)||!reports||typeof reports!=='object'||Array.isArray(reports)){
  throw new Error('Invalid feed preference format');
 }
 return {
  hidden:normalizeHidden(hidden,knownIds),
  reports:normalizeReports(reports,knownIds)
 };
}
// Explicit recovery only: never silently erase user privacy preferences.
async function resetFeedPreferences(storage,queue){
 if(!storage || typeof storage.multiRemove!=='function' || typeof storage.multiGet!=='function' || !queue?.enqueue){
  throw new Error('Feed recovery unavailable');
 }
 const done=await queue.enqueue(async()=>{
  await storage.multiRemove([HIDDEN_KEY,REPORTS_KEY]);
  const rows=await storage.multiGet([HIDDEN_KEY,REPORTS_KEY]);
  if(!Array.isArray(rows)||rows.length!==2||
    rows[0]?.[0]!==HIDDEN_KEY||rows[1]?.[0]!==REPORTS_KEY||
    rows.some(([,value])=>value!==null&&value!==undefined)){
   throw new Error('Feed preference reset could not be confirmed');
  }
  return true;
 });
 if(done!==true)throw new Error('Feed preference reset was paused');
 return true;
}
module.exports={readFeedPreferences,resetFeedPreferences};
