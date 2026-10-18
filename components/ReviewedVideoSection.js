import React,{useState} from 'react';
import {Pressable,Text,View,StyleSheet} from 'react-native';
import {availableReviewedVideos} from '../lib/reviewedVideoCatalog';
import ApprovedVideoPlayer from './ApprovedVideoPlayer';
// Only license-reviewed entries may be selected; empty catalogue remains unavailable.
export default function ReviewedVideoSection({age,interests}){
 const videos=availableReviewedVideos(age,interests);
 const [selected,setSelected]=useState(null);
 const active=videos.find(v=>v.id===selected)||null;
 return <View style={s.card}>
  <Text style={s.title}>Curated Joy Videos</Text>
  {videos.length===0?
    <Text style={s.note}>Video collection is not available yet. No rights-cleared, age-reviewed videos are approved for this build. Enjoy the offline Joy Feed activities instead.</Text>:
    <View>{active?<ApprovedVideoPlayer key={active.id} video={active} onClose={()=>setSelected(null)}/>:videos.map(v=><Pressable key={v.id} accessibilityRole="button" style={s.play} onPress={()=>setSelected(v.id)}><Text style={s.playText}>Play {v.title} · {v.durationSeconds}s</Text></Pressable>)}</View>}
  <Text style={s.detail}>Videos require confirmed creator rights and age-appropriate content review before they can play here. Playback starts only when you tap Play; no automatic next video or hidden uploads.</Text>
 </View>;
}
const s=StyleSheet.create({play:{minHeight:48,justifyContent:'center',backgroundColor:'#6737F5',borderRadius:12,padding:12,marginTop:10},playText:{color:'#fff',fontWeight:'800'},card:{backgroundColor:'#F1EDFF',padding:16,borderRadius:18,marginTop:14},title:{fontSize:18,fontWeight:'800',color:'#21134C'},note:{fontSize:13,color:'#57427D',lineHeight:20,marginTop:9},detail:{fontSize:12,color:'#716C8A',lineHeight:18,marginTop:8}});
