// Atomic-ish local reminder replacement with compensating cancellation.
// Notifications are local only. Never cancel an unrelated scheduled notification.
const KEY='@joyvimo/daily-reminder-v1';
const MARKER='joyVimoDailyReminder';
function ownedIds(requests,previousId){
 // The saved identifier alone is not proof of ownership. It might be stale,
 // corrupted or accidentally refer to a notification from another feature.
 // Only cancel notifications positively marked by JOY VIMO.
 const ids=new Set();
 for(const request of requests||[]){
  if(request?.content?.data?.[MARKER]===true&&typeof request.identifier==='string'&&request.identifier){
   ids.add(request.identifier);
  }
 }
 return [...ids];
}
function validateReminderTime(hour,minute=0){
 if(!Number.isInteger(hour)||hour<0||hour>23)throw Error('Invalid reminder hour');
 if(!Number.isInteger(minute)||minute<0||minute>59||minute%15!==0)throw Error('Invalid reminder minute');
 return {hour,minute};
}
function formatReminderTime(hour,minute=0){
 validateReminderTime(hour,minute);
 return String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0');
}
async function changeDailyReminder({notifications,storage,previous,hour,minute=0,enabled}){
 validateReminderTime(hour,minute);
 const scheduled=await notifications.getAllScheduledNotificationsAsync();
 const oldIds=ownedIds(scheduled,previous?.id);
 let newId=null;
 try{
  if(enabled){
   newId=await notifications.scheduleNotificationAsync({
    content:{title:'JOY VIMO',body:'A gentle reminder to take a Joy break or check your daily plan.',sound:false,data:{[MARKER]:true}},
    trigger:{type:'daily',hour,minute}
   });
   if(typeof newId!=='string'||!newId)throw Error('Reminder scheduling did not return an ID');
  }
  for(const id of oldIds){
   if(id!==newId)await notifications.cancelScheduledNotificationAsync(id);
  }
  const next={enabled:!!enabled,hour,minute,id:enabled?newId:null};
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
module.exports={KEY,MARKER,ownedIds,validateReminderTime,formatReminderTime,changeDailyReminder,cancelAllDailyReminders};
