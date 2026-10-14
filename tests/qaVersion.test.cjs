const assert = require('node:assert/strict');
const { qaVersionCode } = require('../scripts/qaVersion.cjs');
assert.equal(qaVersionCode(1,10),10001);
assert.equal(qaVersionCode('27',10),10027);
assert.ok(qaVersionCode(28,10)>qaVersionCode(27,10));
for (const invalid of [undefined,0,-1,1.5,'bad']) assert.throws(()=>qaVersionCode(invalid,10));
assert.throws(()=>qaVersionCode(1,10001));
assert.throws(()=>qaVersionCode(1,2100000001));
console.log('PASS: monotonic private QA Android version codes');
