const fs = require('node:fs');
const path = require('node:path');

// Each manual QA workflow run gets a distinct, increasing Android versionCode.
// Preserve the package ID and the stable signing certificate for device upgrades.
function qaVersionCode(runNumber, baseCode = 10) {
  const run = Number(runNumber);
  const base = Number(baseCode);
  if (!Number.isSafeInteger(run) || run < 1 || !Number.isSafeInteger(base) || base < 1) {
    throw new Error('Invalid QA run number or app versionCode');
  }
  const code = 10000 + run;
  if (code <= base || code > 2100000000) {
    throw new Error('QA versionCode cannot safely advance');
  }
  return code;
}
if (require.main === module) {
  const name = path.join(process.cwd(), 'app.json');
  const app = JSON.parse(fs.readFileSync(name, 'utf8'));
  if (app.expo?.android?.package !== 'com.joyvimo.app') throw new Error('Unexpected Android package');
  app.expo.android.versionCode = qaVersionCode(process.env.GITHUB_RUN_NUMBER, app.expo.android.versionCode);
  fs.writeFileSync(name, JSON.stringify(app, null, 2) + '\n');
  console.log('Private QA Android versionCode: ' + app.expo.android.versionCode);
}
module.exports = { qaVersionCode };
