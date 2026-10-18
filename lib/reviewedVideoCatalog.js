// Human reviewed, rights-cleared JOY VIMO video catalogue.
// No example/social-media URLs may be presented as licensed videos.
// Add entries only after documentary licensing and age/content review.
const VIDEO_ENTRIES=Object.freeze([]);
const AGE_ACCESS=Object.freeze({kid:0,teen:1,adult:2});
const RATINGS=Object.freeze({all:0,teen:1,adult:2});
const APPROVED_TOPICS=new Set(['Nature','Animals','Creativity','Learning','Comedy','Calm']);
function isHttpsUrl(raw){
 try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname&&u.searchParams.size===0}catch{return false}
}
function isReviewedVideo(video){
 if(!video||typeof video!=='object')return false;
 const {id,title,topic,ageRating,sourceUrl,rightsHolder,rightsProofUrl,contentReviewer,rightsReviewer,reviewedAt,approvalState,durationSeconds}=video;
 return typeof id==='string'&&/^[a-z0-9-]{3,60}$/.test(id)&&
 typeof title==='string'&&title.trim().length>=3&&title.length<=100&&
 APPROVED_TOPICS.has(topic)&&Object.hasOwn(RATINGS,ageRating)&&
 isHttpsUrl(sourceUrl)&&isHttpsUrl(rightsProofUrl)&&
 typeof rightsHolder==='string'&&rightsHolder.trim().length>2&&
 typeof contentReviewer==='string'&&contentReviewer.trim().length>2&&
 typeof rightsReviewer==='string'&&rightsReviewer.trim().length>2&&
 /^\d{4}-\d{2}-\d{2}$/.test(String(reviewedAt))&&
 !Number.isNaN(Date.parse(reviewedAt))&&Date.parse(reviewedAt)<=Date.now()&&
 approvalState==='approved'&&Number.isInteger(durationSeconds)&&
 durationSeconds>=5&&durationSeconds<=180;
}
function availableReviewedVideos(age,topics,entries=VIDEO_ENTRIES){
 const level=AGE_ACCESS[age];if(level===undefined)return [];
 if(!Array.isArray(topics)||!Array.isArray(entries))return [];
 const topicsAllowed=new Set(topics.filter(t=>APPROVED_TOPICS.has(t)));
 const seen=new Set();
 return entries.filter(v=>{
  if(!isReviewedVideo(v)||RATINGS[v.ageRating]>level||!topicsAllowed.has(v.topic)||seen.has(v.id))return false;
  seen.add(v.id);return true;
 }).slice(0,12);
}
module.exports={VIDEO_ENTRIES,isReviewedVideo,availableReviewedVideos};
