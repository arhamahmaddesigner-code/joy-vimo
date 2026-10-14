// Read-only interpretation of local Android Focus Shield counters.
// No browsing activity or sensitive content is read or uploaded.
function nativeCooldownSummary(status, name, now = Date.now()) {
  if (!status || typeof status !== 'object' || !status.denialCooldowns ||
      typeof status.denialCooldowns !== 'object') return null;
  const record=status.denialCooldowns[name];
  if (!record || typeof record !== 'object') return null;
  const count=Number(record.denials);
  const until=Number(record.cooldownUntil);
  const denials=Number.isInteger(count) && count>=0 ? Math.min(count,3) : 0;
  const cooldownUntil=Number.isFinite(until) && until>0 ? until : 0;
  const remainingMs=Math.max(0,cooldownUntil-now);
  const consented=!!status.optedIn;
  const enforcing=consented && !!status.enforcing;
  const accessibilityEnabled=!!status.serviceEnabled;
  const serviceHealthy=!!status.serviceHealthy;
  const safetyPauseUntil=Number(status.safetyPauseUntil)||0;
  const paused=safetyPauseUntil>now;
  const protectionReady=enforcing && accessibilityEnabled && serviceHealthy && !paused;
  return {denials,cooldownUntil,remainingMinutes:Math.ceil(remainingMs/60000),
    cooldownActive:remainingMs>0,consented,enforcing,accessibilityEnabled,
    serviceHealthy,paused,protectionReady};
}
module.exports={nativeCooldownSummary};
