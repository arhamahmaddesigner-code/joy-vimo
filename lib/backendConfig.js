// A build-time override must never redirect JOY VIMO to another project.
const JOY_PROJECT_REF='hhrpwnsyfrdcrnusahkd';
const JOY_PROJECT_URL='https://'+JOY_PROJECT_REF+'.supabase.co';
function isJoyBackendConfig(url,key){
 return typeof url==='string' && url===JOY_PROJECT_URL &&
   typeof key==='string' && key.trim()===key && /^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key);
}
module.exports={JOY_PROJECT_REF,JOY_PROJECT_URL,isJoyBackendConfig};
