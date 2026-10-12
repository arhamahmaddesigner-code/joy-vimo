const MS_DAY=86400000;
const BADGES=[
 {threshold:0,title:'First step',description:'Every journey begins somewhere'},
 {threshold:60,title:'Curious explorer',description:'Small positive actions add up'},
 {threshold:150,title:'Growing stronger',description:'Keep choosing what helps you'},
 {threshold:350,title:'Steady progress',description:'A collection of mindful choices'},
 {threshold:700,title:'Bright momentum',description:'Building a habit of showing up'}
];
function localDateKey(date){
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
}
function claimsByDay(claims){
 const out={};
 for(const [key,awarded] of Object.entries(claims||{})){
  if(!awarded || !/^\d{4}-\d{2}-\d{2}-/.test(key))continue;
  const day=key.slice(0,10);
  out[day]=(out[day]||0)+1;
 }
 return out;
}
function computeProgress(claims,xp,now=new Date()){
 const counts=claimsByDay(claims);
 const days=Object.keys(counts).sort();
 const completed=days.length;
 let streak=0;
 const cur=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
 if(!counts[localDateKey(cur)])cur.setDate(cur.getDate()-1);
 while(counts[localDateKey(cur)]){
  streak++;cur.setDate(cur.getDate()-1);
  if(streak>3660)break;
 }
 const current=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
 const dayOfWeek=(current.getDay()+6)%7;
 current.setDate(current.getDate()-dayOfWeek);
 const weekly=Array.from({length:7},(_,i)=>{
  const d=new Date(current);d.setDate(current.getDate()+i);
  const key=localDateKey(d);
  return {key,label:['M','T','W','T','F','S','S'][i],count:counts[key]||0,done:!!counts[key]};
 });
 const experience=Math.max(0,Number(xp)||0);
 const level=Math.floor(experience/100)+1;
 return {completedDays:completed,streak,weekly,level,experience,badges:BADGES.map(b=>({...b,unlocked:experience>=b.threshold}))};
}
module.exports={localDateKey,claimsByDay,computeProgress,BADGES};
