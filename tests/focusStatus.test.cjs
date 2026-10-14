const assert=require('node:assert/strict');
const {nativeCooldownSummary}=require('../lib/focusStatus');
const now=1000000;
assert.equal(nativeCooldownSummary(null,'TikTok',now),null);
assert.equal(nativeCooldownSummary({},'TikTok',now),null);
const status={optedIn:true,enforcing:true,serviceEnabled:true,serviceHealthy:true,
  safetyPauseUntil:0,denialCooldowns:{TikTok:{denials:2,cooldownUntil:now+61000}}};
let s=nativeCooldownSummary(status,'TikTok',now);
assert.equal(s.denials,2);
assert.equal(s.cooldownActive,true);
assert.equal(s.remainingMinutes,2);
assert.equal(s.protectionReady,true);
assert.equal(nativeCooldownSummary({...status,serviceHealthy:false},'TikTok',now).protectionReady,false);
assert.equal(nativeCooldownSummary({...status,optedIn:false},'TikTok',now).protectionReady,false);
assert.equal(nativeCooldownSummary({...status,safetyPauseUntil:now+10000},'TikTok',now).protectionReady,false);
assert.equal(nativeCooldownSummary({...status,denialCooldowns:{TikTok:{denials:-5,cooldownUntil:0}}},'TikTok',now).denials,0);
assert.equal(nativeCooldownSummary(status,'Instagram',now),null);
console.log('PASS: truthful native cooldown status presentation');
