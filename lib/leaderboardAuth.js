// Shared client-side guards for the optional adult leaderboard.
// UI age selection is not age verification: backend protections remain mandatory.
const OTP_RESEND_MS=60000;
function mayUseAdultLeaderboard(age){return age==='adult'}
function requiresOfflineAuthIsolation(age){return age==='kid'||age==='teen'}
const SERVER_REWARD_ACTIONS=Object.freeze(new Set([
 'plan','offline','break','reflect','reset',
 'joy-nature-spot','joy-animal-memory','joy-creative-doodle',
 'joy-learning-spark','joy-comedy-smile','joy-calm-five'
]));
function canPostLeaderboardAction(id){return typeof id==='string'&&SERVER_REWARD_ACTIONS.has(id)}

function normalizeLoginEmail(value){
  const email=String(value||'').trim().toLowerCase();
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return null;
  return email;
}
function normalizeEmailOtp(value){
  const code=String(value||'').trim();
  return /^\d{6,8}$/.test(code)?code:null;
}
function secondsUntilOtpResend(sentAt,now=Date.now()){
  const elapsed=now-Number(sentAt);
  if(!Number.isFinite(elapsed)||elapsed<0||!sentAt)return 0;
  return Math.ceil(Math.max(0,OTP_RESEND_MS-elapsed)/1000);
}
function otpCodeBelongsToEmail(typedEmail,codeSentEmail){
 const email=normalizeLoginEmail(typedEmail);
 return !!email&&email===normalizeLoginEmail(codeSentEmail);
}
function normalizeCountryCode(value){
  const code=String(value||'').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code)?code:null;
}
module.exports={mayUseAdultLeaderboard,normalizeLoginEmail,normalizeEmailOtp,secondsUntilOtpResend,normalizeCountryCode,otpCodeBelongsToEmail,requiresOfflineAuthIsolation,canPostLeaderboardAction,SERVER_REWARD_ACTIONS};
