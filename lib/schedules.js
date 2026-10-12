// Local-only editable schedule rules. Weekdays: 0=Sun through 6=Sat.
// Use local device time; an overnight window continues into the next day.
const DEFAULT_SCHEDULES={
  Sleep:{enabled:false,startMinute:22*60,endMinute:7*60,weekdays:[0,1,2,3,4,5,6]},
  Study:{enabled:false,startMinute:16*60,endMinute:18*60,weekdays:[1,2,3,4,5]},
  'Me time':{enabled:false,startMinute:20*60,endMinute:21*60,weekdays:[0,1,2,3,4,5,6]}
};
function parseTime(text){
 if(typeof text!=='string'||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text))return null;
 const [h,m]=text.split(':').map(Number);
 return h*60+m;
}
function formatTime(minutes){
 if(!Number.isInteger(minutes)||minutes<0||minutes>=1440)return '--:--';
 return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
}
function normaliseSchedule(name,value){
 const base=DEFAULT_SCHEDULES[name];if(!base)return null;
 if(typeof value==='boolean')return {...base,enabled:value,weekdays:[...base.weekdays]};
 if(!value||typeof value!=='object')return {...base,weekdays:[...base.weekdays]};
 const weekdays=Array.isArray(value.weekdays)?[...new Set(value.weekdays.filter(x=>Number.isInteger(x)&&x>=0&&x<=6))].sort():[...base.weekdays];
 const start=Number.isInteger(value.startMinute)&&value.startMinute>=0&&value.startMinute<1440?value.startMinute:base.startMinute;
 const end=Number.isInteger(value.endMinute)&&value.endMinute>=0&&value.endMinute<1440?value.endMinute:base.endMinute;
 return {enabled:!!value.enabled,startMinute:start,endMinute:end,weekdays};
}
function normaliseSchedules(all){
 return Object.fromEntries(Object.keys(DEFAULT_SCHEDULES).map(name=>[name,normaliseSchedule(name,all?.[name])]));
}
function activeNow(rule,date=new Date()){
 if(!rule?.enabled||!rule.weekdays?.length)return false;
 const minute=date.getHours()*60+date.getMinutes(),day=date.getDay();
 const prev=(day+6)%7,days=rule.weekdays,start=rule.startMinute,end=rule.endMinute;
 if(start===end)return days.includes(day);
 if(start<end)return days.includes(day)&&minute>=start&&minute<end;
 return (days.includes(day)&&minute>=start)||(days.includes(prev)&&minute<end);
}
module.exports={DEFAULT_SCHEDULES,parseTime,formatTime,normaliseSchedule,normaliseSchedules,activeNow};