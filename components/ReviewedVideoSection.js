import React from 'react';
import {Text,View,StyleSheet} from 'react-native';
import {availableReviewedVideos} from '../lib/reviewedVideoCatalog';
// This section deliberately has no streaming URLs until licenses are verified.
// Actual video playback must be added and device-tested before a video release.
export default function ReviewedVideoSection({age,interests}){
 const videos=availableReviewedVideos(age,interests);
 return <View style={s.card}>
  <Text style={s.title}>Curated Joy Videos</Text>
  {videos.length===0?
    <Text style={s.note}>Video collection is not available yet. No rights-cleared, age-reviewed videos are approved for this build. Enjoy the offline Joy Feed activities instead.</Text>:
    <Text style={s.note}>{videos.length} reviewed video record(s) catalogued. In-app playback is not enabled in this build.</Text>}
  <Text style={s.detail}>Videos require confirmed creator rights and age-appropriate content review before they can play here. No endless autoplay or hidden uploads.</Text>
 </View>;
}
const s=StyleSheet.create({card:{backgroundColor:'#F1EDFF',padding:16,borderRadius:18,marginTop:14},title:{fontSize:18,fontWeight:'800',color:'#21134C'},note:{fontSize:13,color:'#57427D',lineHeight:20,marginTop:9},detail:{fontSize:12,color:'#716C8A',lineHeight:18,marginTop:8}});
