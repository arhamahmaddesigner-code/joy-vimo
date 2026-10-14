// Atomic-ish local reminder replacement with compensating cancellation.
// Notifications are local only. Never cancel an unrelated scheduled notification.
const KEY='@joyvimo/daily-reminder-v1';
const MARKER='joyVimoDailyReminder';
function ownedIds(requests,previousId){
 const ids=new Set();
 if(typeof previousId==='string'&&previousId)ids.add(previousId);
 for(const request of requests||[]){
  if(request?.content?.data?.[MARKER]===true&&typeof request.identifier==='string')ids.add(request.identifier);
 }
 return [...ids];
}
async function changeDailyReminder({notifications,storage,previous,hour,enabled}){
 if(!Number.isInteger(hour)||hour<0||hour>23)throw Error('Invalid reminder hour');
 const scheduled=await notifications.getAllScheduledNotificationsAsync();
 const oldIds=ownedIds(scheduled,previous?.id);
 let newId=null;
 try{
  if(enabled){
   newId=await notifications.scheduleNotificationAsync({
    content:{title:'JOY VIMO',body:'A gentle reminder to take a Joy break or check your daily plan.',sound:false,data:{[MARKER]:true}},
    trigger:{type:'daily',hour,minute:0}
   });
   if(typeof newId!=='string'||!newId)throw Error('Reminder scheduling did not return an ID');
  }
  for(const id of oldIds){
   if(id!==newId)await notifications.cancelScheduledNotificationAsync(id);
  }
  const next={enabled,hour,id:enabled?newId:null};
  await storage.setItem(KEY,JSON.stringify(next));
  return next;
 }catch(error){
  if(newId)await notifications.cancelScheduledNotificationAsync(newId).catch(()=>{});
  throw error;
 }
}
async function cancelAllDailyReminders({notifications,storage}){
 const raw=await storage.getItem(KEY);
 let saved;
 if(raw){
  try{saved=JSON.parse(raw)}catch{throw Error('Saved reminder record is unreadable')}
 }
 const scheduled=await notifications.getAllScheduledNotificationsAsync();
 const ids=ownedIds(scheduled,saved?.id);
 for(const id of ids)await notifications.cancelScheduledNotificationAsync(id);
 await storage.removeItem(KEY);
}
module.exports={KEY,MARKER,ownedIds,changeDailyReminder,cancelAllDailyReminders};
