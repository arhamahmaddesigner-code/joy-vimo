import React,{useEffect,useState} from 'react';
import {useEvent} from 'expo';
import {AppState,Pressable,Text,View,StyleSheet} from 'react-native';
import {useVideoPlayer,VideoView} from 'expo-video';
// Only mounted for a catalog entry that passed licensing + audience filtering.
export default function ApprovedVideoPlayer({video,onClose}){
 const player=useVideoPlayer(video.sourceUrl,p=>{p.loop=false;p.pause()});
 const {status}=useEvent(player,'statusChange',{status:player.status});
 const [retrying,setRetrying]=useState(false),[retryFailed,setRetryFailed]=useState(false);
 async function retry(){
  if(retrying)return;
  setRetrying(true);setRetryFailed(false);
  try{
   player.pause();
   await player.replaceAsync(video.sourceUrl);
   player.pause();
  }catch{
   setRetryFailed(true);
  }finally{setRetrying(false)}
 }
 useEffect(()=>{
  const subscription=AppState.addEventListener('change',state=>{if(state!=='active')player.pause()});
  return()=>{subscription.remove();player.pause()};
 },[player]);
 return <View style={s.container}>
  <Text style={s.heading}>{video.title}</Text>
  <Text style={s.note}>Creator / rights holder: {video.rightsHolder}</Text>
  <Text style={s.note}>{video.attributionText}</Text>
  <Text style={s.note}>Tap play to begin. No autoplay, loop, or next video.</Text>
  {status==='loading'?<Text accessibilityLiveRegion="polite" style={s.note}>Loading video…</Text>:null}
  {status==='error'||retryFailed?<View accessibilityLiveRegion="polite">
   <Text style={s.error}>Video could not load. Check your connection and retry, or close this video.</Text>
   <Pressable accessibilityRole="button" disabled={retrying} onPress={retry} style={s.retry}><Text style={s.retryText}>{retrying?'Retrying…':'Retry video'}</Text></Pressable>
  </View>:null}
  <VideoView player={player} style={s.video} nativeControls contentFit="contain"/>
  <Pressable accessibilityRole="button" onPress={()=>{player.pause();onClose()}} style={s.close}>
   <Text style={s.closeText}>Close video</Text>
  </Pressable>
 </View>;
}
const s=StyleSheet.create({container:{marginTop:12},heading:{fontSize:16,fontWeight:'800',color:'#21134C'},note:{fontSize:12,color:'#716C8A',marginVertical:9},video:{width:'100%',aspectRatio:16/9,backgroundColor:'#21134C',borderRadius:14},close:{minHeight:48,justifyContent:'center',alignItems:'center',marginTop:10},closeText:{color:'#6737F5',fontWeight:'800'},error:{color:'#AC3355',fontSize:13,lineHeight:20,marginVertical:6},retry:{minHeight:48,justifyContent:'center',alignItems:'center',backgroundColor:'#EEE8FF',borderRadius:12,marginBottom:10},retryText:{fontWeight:'800',color:'#6737F5'}});

