const fs=require('node:fs');
const parser=require('@babel/parser');
const files=['App.js',...['components','lib','plugins'].flatMap(dir=>fs.readdirSync(dir).filter(f=>f.endsWith('.js')).map(f=>dir+'/'+f))];
for(const file of files)parser.parse(fs.readFileSync(file,'utf8'),{sourceType:'unambiguous',plugins:['jsx']});
console.log('PASS: '+files.length+' JavaScript/JSX source files parsed');
