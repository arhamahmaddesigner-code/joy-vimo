// User-controlled positive-action targets. No shame-based penalties.
const DEFAULT_GOALS={dailyActions:2,weeklyActiveDays:4};
function normalizeGoals(value){
 const input=value&&typeof value==='object'?value:{};
 const clamp=(v,low,high,defaultValue)=>{
   const n=Number(v);
   return Number.isInteger(n)&&n>=low&&n<=high?n:defaultValue;
 };
 return {dailyActions:clamp(input.dailyActions,1,4,DEFAULT_GOALS.dailyActions),
  weeklyActiveDays:clamp(input.weeklyActiveDays,1,7,DEFAULT_GOALS.weeklyActiveDays)};
}
function goalProgress(goals,completedToday,activeWeekDays){
 const g=normalizeGoals(goals);
 const today=Math.max(0,Number(completedToday)||0);
 const week=Math.max(0,Number(activeWeekDays)||0);
 return {dailyTarget:g.dailyActions,weeklyTarget:g.weeklyActiveDays,
  dailyDone:Math.min(today,g.dailyActions),weeklyDone:Math.min(week,g.weeklyActiveDays),
  dailyMet:today>=g.dailyActions,weeklyMet:week>=g.weeklyActiveDays};
}
module.exports={DEFAULT_GOALS,normalizeGoals,goalProgress};