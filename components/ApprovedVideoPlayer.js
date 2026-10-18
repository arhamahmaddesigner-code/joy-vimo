import React,{useEffect} from 'react';
import {AppState,Pressable,Text,View,StyleSheet} from 'react-native';
import {useVideoPlayer,VideoView} from 'expo-video';
// Only mounted for a catalog entry that passed licensing + audience filtering.
export default function ApprovedVideoPlayer({video,onClose}){
 const player=useVideoPlayer(video.sourceUrl,p=>{p.loop=false;p.pause()});
 useEffect(()=>{
  const subscription=AppState.addEventListener('change',state=>{if(state!=='active')player.pause()});
  return()=>{subscription.remove();player.pause()};
 },[player]);
 return <View style={s.container}>
  <Text style={s.heading}>{video.title}</Text>
  <Text style={s.note}>Tap play to begin. No autoplay, loop, or next video.</Text>
  <VideoView player={player} style={s.video} nativeControls contentFit="contain"/>
  <Pressable accessibilityRole="button" onPress={()=>{player.pause();onClose()}} style={s.close}>
   <Text style={s.closeText}>Close video</Text>
  </Pressable>
 </View>;
}
const s=StyleSheet.create({container:{marginTop:12},heading:{fontSize:16,fontWeight:'800',color:'#21134C'},note:{fontSize:12,color:'#716C8A',marginVertical:9},video:{width:'100%',aspectRatio:16/9,backgroundColor:'#21134C',borderRadius:14},close:{minHeight:48,justifyContent:'center',alignItems:'center',marginTop:10},closeText:{color:'#6737F5',fontWeight:'800'}});
