const assert=require('node:assert/strict');
const {checkPrivateApkReadiness,run}=require('../scripts/privateApkReleaseGate.cjs');
const manifest=require('../docs/private-apk-release-gates.json');
const blockers=checkPrivateApkReadiness(manifest);
assert.equal(blockers.length>=4,true);
assert.equal(run({env:{JOY_PUBLISH_PRIVATE_APK:'false'}}),true);
assert.throws(()=>run({env:{JOY_PUBLISH_PRIVATE_APK:'true'}}),/conditions are incomplete/);
const workflow=require('node:fs').readFileSync('.github/workflows/android-qa-apk.yml','utf8');
assert.ok(workflow.includes('Enforce full-scope owner APK release gates'));
assert.ok(workflow.indexOf('Enforce full-scope owner APK release gates')<workflow.indexOf('Configure signing'));
const video={id:'test-video',title:'Test video',topic:'Nature',ageRating:'all',sourceUrl:'https://example.com/video.mp4',rightsHolder:'Test holder',rightsProofUrl:'https://example.com/license',contentReviewer:'Test reviewer',rightsReviewer:'Rights reviewer',reviewedAt:'2026-01-01',approvalState:'approved',durationSeconds:30};
const ready={schemaVersion:1,reviewScope:'full-integrated',ownerApprovedPrivateReview:true,ownerApprovalEvidence:'https://example.com/approval',licensedContentRightsVerified:true,rightsReviewEvidence:'https://example.com/rights',liveBackendMultiAccountVerified:true,backendEvidence:'https://example.com/backend',integratedAndroidQaVerified:true,androidQaEvidence:'https://example.com/qa'};
assert.deepEqual(checkPrivateApkReadiness(ready,[video]),[]);
for(const flag of ['ownerApprovedPrivateReview','licensedContentRightsVerified','liveBackendMultiAccountVerified','integratedAndroidQaVerified'])assert.ok(checkPrivateApkReadiness({...ready,[flag]:false},[video]).length>0);
for(const evidence of ['ownerApprovalEvidence','rightsReviewEvidence','backendEvidence','androidQaEvidence'])assert.ok(checkPrivateApkReadiness({...ready,[evidence]:''},[video]).length>0);
assert.ok(checkPrivateApkReadiness(ready,[]).length>0);
assert.ok(checkPrivateApkReadiness(ready,[{...video,approvalState:'pending'}]).length>0);
console.log('PASS: rights, backend, integrated Android QA and conditional owner authorization gate APK distribution');

