// Device-only Joy Feed feedback. Never transmit reports, activity titles,
// website history, user identifiers or other personal content to a server.
const REPORTS_KEY='@joyvimo/joy-feed-reports-v1';
const HIDDEN_KEY='@joyvimo/joy-feed-hidden-v1';
const REASONS=Object.freeze({
  uncomfortable:'This content makes me uncomfortable',
  irrelevant:'Not useful for me',
  inaccurate:'Content seems inaccurate'
});
const MAX_FLAGS=40;
function normalizeReports(value,knownIds){
  const ids=new Set(knownIds||[]);
  const out={};
  if(!value||typeof value!=='object'||Array.isArray(value))return out;
  for(const [id,reason] of Object.entries(value)){
    if(Object.keys(out).length>=MAX_FLAGS)break;
    if(ids.has(id)&&Object.prototype.hasOwnProperty.call(REASONS,reason))out[id]=reason;
  }
  return out;
}
function flagActivity(existing,id,reason,knownIds){
  if(!knownIds.includes(id)||!Object.prototype.hasOwnProperty.call(REASONS,reason))throw new Error('Invalid local feedback');
  return normalizeReports({...existing,[id]:reason},knownIds);
}
function normalizeHidden(value,knownIds){
  const ids=new Set(knownIds||[]);
  return Array.isArray(value)?[...new Set(value.filter(id=>ids.has(id)))]:[];
}
module.exports={REPORTS_KEY,HIDDEN_KEY,REASONS,normalizeReports,normalizeHidden,flagActivity};

