// Fail-closed contract for the ONE consolidated owner-review Android APK.
// This gate is not a substitute for testing proof, and it never reads secrets.
const fs=require('node:fs');
const path=require('node:path');
const {VIDEO_ENTRIES,isReviewedVideo}=require('../lib/reviewedVideoCatalog');
const defaultManifest=path.join(__dirname,'../docs/private-apk-release-gates.json');
function reliableEvidence(url){
 if(typeof url!=='string'||url.length>1000)return false;
 try{const parsed=new URL(url);return parsed.protocol==='https:'&&!!parsed.hostname&&!parsed.username&&!parsed.password}catch{return false}
}
function checkPrivateApkReadiness(manifest,catalog=VIDEO_ENTRIES){
 const issues=[];
 if(!manifest||manifest.schemaVersion!==1||manifest.reviewScope!=='full-integrated'){
  issues.push('Full-integrated review scope is not selected');return issues;
 }
 if(manifest.ownerApprovedPrivateReview!==true||!reliableEvidence(manifest.ownerApprovalEvidence)){
  issues.push('Owner private-review scope approval and evidence are pending');
 }
 if(manifest.licensedContentRightsVerified!==true||!reliableEvidence(manifest.rightsReviewEvidence)){
  issues.push('Licensed video rights and age review evidence are pending');
 }
 if(!Array.isArray(catalog)||catalog.length===0||!catalog.every(isReviewedVideo)){
  issues.push('No fully rights-reviewed, age-reviewed in-app video catalogue is available');
 }
 if(manifest.liveBackendMultiAccountVerified!==true||!reliableEvidence(manifest.backendEvidence)){
  issues.push('Live OTP, adult leaderboard and cross-account security verification are pending');
 }
 if(manifest.integratedAndroidQaVerified!==true||!reliableEvidence(manifest.androidQaEvidence)){
  issues.push('Integrated pre-owner Android QA evidence is pending');
 }
 return issues;
}
function run({env=process.env,manifestFile=defaultManifest,catalog=VIDEO_ENTRIES}={}){
 if(env.JOY_PUBLISH_PRIVATE_APK!=='true'){
  console.log('Internal-only compile: final private APK release gates not requested.');
  return true;
 }
 let manifest;
 try{manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'))}
 catch{throw Error('Final private APK blocked: release evidence manifest is missing or invalid')}
 const issues=checkPrivateApkReadiness(manifest,catalog);
 if(issues.length){
  console.error('Final private APK blocked:');
  for(const issue of issues)console.error('- '+issue);
  throw Error('JOY VIMO full-scope private APK release conditions are incomplete');
 }
 console.log('Release evidence manifest checks passed; stable signing and private APK verification are still required.');
 return true;
}
if(require.main===module){try{run()}catch(e){console.error(e.message);process.exitCode=1}}
module.exports={reliableEvidence,checkPrivateApkReadiness,run};

