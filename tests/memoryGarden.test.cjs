const assert=require('node:assert/strict');
const {createMemoryGarden,chooseGardenCard,isMismatch,closeGardenMismatch}=require('../lib/memoryGarden');
const a=createMemoryGarden('2026-10-18'),b=createMemoryGarden('2026-10-18');
assert.deepEqual(a,b);
assert.equal(a.cards.length,8);
assert.equal(new Set(a.cards.map(c=>c.id)).size,8);
assert.equal(new Set(a.cards.map(c=>c.key)).size,4);
let g=a;
for(const key of [...new Set(g.cards.map(x=>x.key))]){
 const indices=g.cards.map((c,i)=>c.key===key?i:-1).filter(i=>i>=0);
 g=chooseGardenCard(g,indices[0]);g=chooseGardenCard(g,indices[1]);
}
assert.equal(g.completed,true);
assert.equal(g.matched.length,8);
assert.equal(g.moves,4);
assert.strictEqual(chooseGardenCard(g,0),g);
let m=createMemoryGarden('different');
const one=0,other=m.cards.findIndex(c=>c.key!==m.cards[one].key);
m=chooseGardenCard(chooseGardenCard(m,one),other);
assert.equal(isMismatch(m),true);
assert.strictEqual(chooseGardenCard(m,2),m);
m=closeGardenMismatch(m);
assert.equal(m.shown.length,0);
assert.equal(m.moves,1);
console.log('PASS: deterministic, finite, offline Memory Garden with matched-pair and mismatch safeguards');
