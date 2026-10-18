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
module.exports={readFeedPreferences};
