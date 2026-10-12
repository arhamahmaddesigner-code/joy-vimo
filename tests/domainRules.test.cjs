const assert=require('node:assert/strict');
const {normalizeDomain,addDomain,removeDomain}=require('../lib/domainRules');
for(const [input,expected] of [
 ['Example.COM','example.com'],['  www.example.com. ','example.com'],
 ['sub.example.co.uk','sub.example.co.uk'],['example.com/shorts',null],
 ['https://example.com',null],['example.com:443',null],
 ['foo..com',null],['not a host',null],['localhost',null],
 ['example.com@other.com',null],['evil-example.com','evil-example.com'],
 ['.example.com',null],['example.c',null],['',null],['127.0.0.1',null]
])assert.equal(normalizeDomain(input),expected,input);
assert.deepEqual(addDomain([],'Example.com').domains,['example.com']);
assert.equal(addDomain(['example.com'],'WWW.EXAMPLE.COM').ok,false);
assert.equal(addDomain(['example.com'],'test.org',1).ok,false);
assert.deepEqual(removeDomain(['example.com','test.org'],'test.org'),['example.com']);
console.log('PASS: domain-rule normalization/add/remove assertions');