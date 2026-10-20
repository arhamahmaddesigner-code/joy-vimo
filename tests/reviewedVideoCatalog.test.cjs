const assert=require('node:assert/strict');
const {VIDEO_ENTRIES,isReviewedVideo,availableReviewedVideos}=require('../lib/reviewedVideoCatalog');
assert.deepEqual(VIDEO_ENTRIES,[]);
const sample={id:'nature-calm-1',title:'Quiet garden tour',topic:'Nature',ageRating:'teen',sourceUrl:'https://media.example.org/video.mp4',rightsProofUrl:'https://rights.example.org/grant',rightsHolder:'Original filmmaker',rightsReviewer:'Content licensing reviewer',contentReviewer:'Age-safety reviewer',reviewedAt:'2026-01-01',approvalState:'approved',rightsValidUntil:'2099-12-31',attributionText:'Synthetic test credit only',appStreamingAllowed:true,commercialUseAllowed:true,territory:'worldwide',durationSeconds:60};
assert.equal(isReviewedVideo(sample),true);
assert.deepEqual(availableReviewedVideos('kid',['Nature'],[sample]),[]);
assert.equal(availableReviewedVideos('teen',['Nature'],[sample]).length,1);
assert.equal(availableReviewedVideos('adult',['Nature'],[sample]).length,1);
for(const bad of [{approvalState:'draft'},{rightsProofUrl:''},{ageRating:'unknown'},{sourceUrl:'http://unsafe.example.org/video.mp4'},{reviewedAt:'invalid'},{contentReviewer:''}]){
 assert.equal(isReviewedVideo({...sample,...bad}),false);
}
assert.deepEqual(availableReviewedVideos('adult',['Nature'],[{...sample,approvalState:'draft'}]),[]);
assert.deepEqual(availableReviewedVideos('adult',['Nature'],[]),[]);
console.log('PASS: licensed and age-reviewed video gate fails closed for empty or unapproved content');


// Calendar rollover, expiry boundary and missing scope must fail closed.
const realNow=Date.now;
try{
 Date.now=()=>Date.parse('2026-10-20T23:59:59.999Z');
 const expiring={...sample,rightsValidUntil:'2026-10-20'};
 assert.equal(isReviewedVideo(expiring),true);
 Date.now=()=>Date.parse('2026-10-21T00:00:00.000Z');
 assert.equal(isReviewedVideo(expiring),false);
 for(const bad of [{reviewedAt:'2026-02-30'},{reviewedAt:'2026-10-22'},{rightsValidUntil:'2099-02-30'},{rightsValidUntil:null},{attributionText:''},{appStreamingAllowed:false},{commercialUseAllowed:false},{territory:'PK'},{approvalState:'revoked'}]){
  assert.equal(isReviewedVideo({...sample,...bad}),false,JSON.stringify(bad));
 }
 assert.deepEqual(availableReviewedVideos('adult',['Nature'],[expiring]),[]);
 assert.equal(availableReviewedVideos('adult',['Nature'],[sample,sample]).length,1);
}finally{Date.now=realNow}
console.log('PASS: exact calendar dates, UTC licence expiry, required rights scope and attribution');
