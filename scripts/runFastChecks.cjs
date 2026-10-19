const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function run(command,args){
 const result=spawnSync(command,args,{cwd:root,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
}
const files=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.test.cjs')).sort();
if(!files.length)throw Error('No tests discovered');
for(const file of files)run(process.execPath,['tests/'+file]);
run('python3',['scripts/privacy_preflight.py']);
console.log(`PASS: ${files.length} test files and privacy preflight`);
