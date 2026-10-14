const assert=require('node:assert/strict');
const {mobileLayout}=require('../lib/mobileLayout');
for(const width of [360,390,430])for(const scale of [1,1.3,1.5]){const a=mobileLayout(width,scale);assert.ok(a.horizontalPadding>=14);assert.ok(a.tabHeight>=58);assert.ok(a.tabBarHeight>=a.tabHeight);assert.ok(width-2*a.horizontalPadding>=300);}
assert.equal(mobileLayout(360,1.5).wordmarkWidth,138);
assert.equal(mobileLayout(390,1).wordmarkWidth,158);
assert.ok(mobileLayout(390,1.5).tabHeight>mobileLayout(390,1).tabHeight);
console.log('PASS: responsive navigation policy for widths 360/390/430dp and font scale 1/1.3/1.5');
