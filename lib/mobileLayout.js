// Pure layout policy; font-size and usable width are supplied by React Native.
// Real-device and screenshot checks remain necessary for OEM font/rendering variations.
function mobileLayout(width=390,fontScale=1){
  const w=Number.isFinite(width)&&width>0?width:390;
  const scale=Number.isFinite(fontScale)&&fontScale>0?fontScale:1;
  const enlarged=scale>=1.3;
  return {
    horizontalPadding:w<=360?14:19,
    wordmarkWidth:w<=360?138:158,
    tabHeight:scale>=1.5?80:enlarged?70:58,
    tabBarHeight:scale>=1.5?86:enlarged?76:66,
    tabLabelSize:enlarged?10:11
  };
}
module.exports={mobileLayout};
