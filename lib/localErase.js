// Device-only erase coordinator. Never claim success when local protection,
// reminders, secure auth, or saved data could not be cleared.
const APP_DATA_KEYS=[
  '@joyvimo/v07',
  '@joyvimo/qa-v06',
  '@joyvimo/private-coach-v1',
  '@joyvimo/joy-feed-hidden-v1',
  '@joyvimo/daily-reminder-v1'
];
class LocalEraseError extends Error {
  constructor(stage){
    super('JOY VIMO local data erase incomplete: '+stage);
    this.name='LocalEraseError';
    this.stage=stage;
  }
}
async function eraseDeviceData({nativeModule,requireNative=false,cancelReminders,eraseAuth,storage}){
  if(requireNative && typeof nativeModule?.clearFocusConfig!=='function'){
    throw new LocalEraseError('focus');
  }
  try{
    if(typeof nativeModule?.clearFocusConfig==='function'){
      const result=await nativeModule.clearFocusConfig();
      if(result===false)throw new Error('Native focus reset failed');
    }
  }catch{throw new LocalEraseError('focus')}
  try{await cancelReminders()}catch{throw new LocalEraseError('reminders')}
  try{await eraseAuth()}catch{throw new LocalEraseError('auth')}
  try{
    await storage.multiRemove(APP_DATA_KEYS);
    const remaining=await storage.multiGet(APP_DATA_KEYS);
    if(remaining.some(([,value])=>value!==null && value!==undefined)){
      throw new Error('Some local entries remain');
    }
  }catch{throw new LocalEraseError('storage')}
  return true;
}
module.exports={APP_DATA_KEYS,LocalEraseError,eraseDeviceData};
