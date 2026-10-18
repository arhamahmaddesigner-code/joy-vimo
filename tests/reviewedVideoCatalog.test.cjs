const assert=require('node:assert/strict');
const {VIDEO_ENTRIES,isReviewedVideo,availableReviewedVideos}=require('../lib/reviewedVideoCatalog');
assert.deepEqual(VIDEO_ENTRIES,[]);
const sample={id:'nature-calm-1',title:'Quiet garden tour',topic:'Nature',ageRating:'teen',sourceUrl:'https://media.example.org/video.mp4',rightsProofUrl:'https://rights.example.org/grant',rightsHolder:'Original filmmaker',rightsReviewer:'Content licensing reviewer',contentReviewer:'Age-safety reviewer',reviewedAt:'2026-01-01',approvalState:'approved',durationSeconds:60};
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
