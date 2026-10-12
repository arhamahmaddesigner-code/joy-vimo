const ASCII_HOST=/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
function normalizeDomain(input){
 if(typeof input!=='string')return null;
 let raw=input.trim().toLowerCase().replace(/\.$/,'');
 if(raw.length<4 || raw.length>253 || !/^[\x21-\x7e]+$/.test(raw))return null;
 if(raw.includes('://')||/[/?#:@\\\s]/.test(raw)||raw.includes('..'))return null;
 raw=raw.replace(/^www\./,'');
 return ASCII_HOST.test(raw)?raw:null;
}
function addDomain(list,value,max=30){
 const name=normalizeDomain(value);
 if(!name)return {ok:false,reason:'Enter a valid domain, for example example.com (not a full URL).',domains:list};
 if(list.includes(name))return {ok:false,reason:'This domain is already listed.',domains:list};
 if(list.length>=max)return {ok:false,reason:'Maximum '+max+' domains per device.',domains:list};
 return {ok:true,reason:null,domains:[...list,name].sort()};
}
function removeDomain(list,value){return list.filter(x=>x!==value);}
module.exports={normalizeDomain,addDomain,removeDomain};