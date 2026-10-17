const assert=require('node:assert/strict');
const {REPORTS_KEY,REASONS,normalizeReports,normalizeHidden,flagActivity}=require('../lib/feedFeedback');
const ids=['nature','calm'];
assert.equal(REPORTS_KEY,'@joyvimo/joy-feed-reports-v1');
assert.equal(Object.keys(REASONS).length,3);
assert.deepEqual(normalizeHidden(['nature','nature','unknown'],ids),['nature']);
assert.deepEqual(normalizeReports({nature:'uncomfortable',unknown:'irrelevant',calm:'invalid'},ids),{nature:'uncomfortable'});
assert.deepEqual(flagActivity({},'calm','irrelevant',ids),{calm:'irrelevant'});
assert.throws(()=>flagActivity({},'missing','irrelevant',ids));
assert.throws(()=>flagActivity({},'calm','invalid',ids));
// The Android native Alert API cannot reliably render four action buttons.
const fs=require('node:fs');
const screen=fs.readFileSync('components/OfflineActivities.js','utf8');
assert.match(screen,/flaggingId===item\.id/);
assert.match(screen,/Object\.entries\(REASONS\)\.map/);
assert.match(screen,/accessibilityLabel="Cancel private activity feedback"/);
assert.match(screen,/Your feedback stays on this device/);
assert.doesNotMatch(screen,/Alert\.alert\('Flag this activity on my device'/);
console.log('PASS: local-only Joy Feed feedback and Android-accessible inline reason choices');
