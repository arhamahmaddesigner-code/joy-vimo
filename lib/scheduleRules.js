const TIME=/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;
function asMinute(t){return TIME.test(t)?Number(t.slice(0,2))*60+Number(t.slice(3)):null;}
function scheduleActive(item,day,minute){
 if(!item||!item.enabled||!Number.isInteger(day)||day<0||day>6||!Number.isInteger(minute)||minute<0||minute>=1440)return false;
 const start=asMinute(item.start),end=asMinute(item.end);
 if(start===null||end===null||start===end)return false;
 const days=Array.isArray(item.days)?item.days:[];
 if(start<end)return days.includes(day)&&minute>=start&&minute<end;
 return (days.includes(day)&&minute>=start)||(days.includes((day+6)%7)&&minute<end);
}
module.exports={asMinute,scheduleActive};