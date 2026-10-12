const {withAndroidManifest}=require('expo/config-plugins');
module.exports=function withPrivateAndroidSettings(config){
 return withAndroidManifest(config,async config=>{
  const application=config.modResults.manifest.application?.[0];
  if(!application)throw Error('Missing Android application manifest');
  application.$=application.$||{};
  application.$['android:allowBackup']='false';
  application.$['android:fullBackupContent']='false';
  application.$['android:dataExtractionRules']='@xml/joy_vimo_data_extraction_rules';
  return config;
 });
};