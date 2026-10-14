const APPS=['Instagram','TikTok','YouTube','Chrome'];
function todayKey(d=new Date()){return String(d.getFullYear())+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function createInitial(){return {age:null,interests:['Nature','Animals','Calm'],rules:Object.fromEntries(APPS.map(n=>[n,{enabled:false,minutes:30,opens:3,session:10,delay:10,cooldownEnabled:true,denialLimit:3,cooldownMinutes:15}])),schedules:{Sleep:false,Study:false,'Me time':false},domainRulesEnabled:false,domains:[],xp:0,claims:{},leaderboard:false};}
function claimAction(state,id,points,date=new Date()){
 const token=todayKey(date)+'-'+id;
 if(state.claims[token])return {awarded:false,state};
 if(!Number.isFinite(points)||points<0||points>25)throw new Error('Unexpected XP amount');
 return {awarded:true,state:{...state,xp:(Number(state.xp)||0)+points,claims:{...state.claims,[token]:true}}};
}
function canJoinPublicRanking(age){return age==='adult';}
function openingAllowed(rule,used){return !!rule.enabled&&Number.isInteger(used)&&used<rule.opens;}
module.exports={APPS,todayKey,createInitial,claimAction,canJoinPublicRanking,openingAllowed};