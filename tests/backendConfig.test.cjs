const assert=require('node:assert/strict');
const {JOY_PROJECT_URL,isJoyBackendConfig}=require('../lib/backendConfig');
const key='sb_publishable_'+'a'.repeat(30);
assert.equal(isJoyBackendConfig(JOY_PROJECT_URL,key),true);
for(const url of ['https://other-project.supabase.co',JOY_PROJECT_URL+'.attacker.com',JOY_PROJECT_URL+'/proxy','http://hhrpwnsyfrdcrnusahkd.supabase.co',JOY_PROJECT_URL+'?redirect=1',null]){
 assert.equal(isJoyBackendConfig(url,key),false);
}
for(const unsafe of ['sb_secret_'+'a'.repeat(30),'service_role',null,'',key+'\n']){
 assert.equal(isJoyBackendConfig(JOY_PROJECT_URL,unsafe),false);
}
console.log('PASS: JOY VIMO client refuses other projects and non-publishable keys');
