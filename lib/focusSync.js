// Build the native Focus Shield payload from saved preferences while preserving
// separately opted-in Android controls. Do not activate under-13 protection.
function makeFocusPayload(data,status){
  if(!data || (data.age!=='adult' && data.age!=='teen') || !status?.optedIn)return null;
  return {
    age:data.age,
    consented:true,
    enforcing:!!status.enforcing,
    rules:data.rules || {},
    schedules:data.schedules || {},
    youtubeShorts:!!status.youtubeShorts,
    instagramReels:!!status.instagramReels,
    tiktokFeed:!!status.tiktokFeed,
    domainRulesEnabled:!!data.domainRulesEnabled,
    domains:Array.isArray(data.domains)?data.domains:[]
  };
}
module.exports={makeFocusPayload};
