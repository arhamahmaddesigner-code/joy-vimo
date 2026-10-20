import React,{useEffect,useState} from 'react';
import {AppState,Pressable,Text,View,StyleSheet} from 'react-native';
import {VIDEO_ENTRIES,availableReviewedVideos,videoRightsDeadline,videoPreferenceId} from '../lib/reviewedVideoCatalog';
import {REASONS} from '../lib/feedFeedback';
import ApprovedVideoPlayer from './ApprovedVideoPlayer';
// Only license-reviewed entries may be selected; empty catalogue remains unavailable.
export default function ReviewedVideoSection({age,interests,hidden=[],onHide,onFlag}){
 const [clock,setClock]=useState(Date.now);
 // Revalidate on foreground and at the earliest licence expiry, including while playing.
 // An immutable bundled catalogue requires an app update for an earlier revocation.
 useEffect(()=>{
  const subscription=AppState.addEventListener('change',state=>{if(state==='active')setClock(Date.now())});
  return()=>subscription.remove();
 },[]);
 useEffect(()=>{
  const now=Date.now();
  const deadlines=VIDEO_ENTRIES.map(videoRightsDeadline).filter(deadline=>Number.isFinite(deadline)&&deadline>now);
  if(!deadlines.length)return;
  const timer=setTimeout(()=>setClock(Date.now()),Math.min(Math.min(...deadlines)-now+1,2147483647));
  return()=>clearTimeout(timer);
 },[clock]);
 const approved=availableReviewedVideos(age,interests);
 const videos=approved.filter(v=>!hidden.includes(videoPreferenceId(v)));
 const [selected,setSelected]=useState(null);
 const [flagging,setFlagging]=useState(null);
 const active=videos.find(v=>v.id===selected)||null;
 useEffect(()=>{if(selected&&!active)setSelected(null)},[selected,active]);
 function hide(video){setSelected(null);setFlagging(null);onHide(videoPreferenceId(video))}
 function flag(video,reason){setSelected(null);setFlagging(null);onFlag(videoPreferenceId(video),reason)}
 function feedback(video){return <View>
  <Pressable accessibilityRole="button" style={s.secondary} onPress={()=>hide(video)}><Text style={s.link}>Hide this video</Text></Pressable>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:flagging===video.id}} style={s.secondary} onPress={()=>setFlagging(flagging===video.id?null:video.id)}><Text style={s.link}>{flagging===video.id?'Cancel video feedback':'Flag video privately'}</Text></Pressable>
  {flagging===video.id?<View>
   <Text style={s.note}>Choose a reason to hide this video. Saved on this device only; no report is sent to moderators.</Text>
   {Object.entries(REASONS).map(([reason,label])=><Pressable key={reason} accessibilityRole="button" style={s.secondary} onPress={()=>flag(video,reason)}><Text style={s.link}>{label}</Text></Pressable>)}
  </View>:null}
 </View>}
 return <View style={s.card}>
  <Text style={s.title}>Curated Joy Videos</Text>
  {videos.length===0?
    <Text style={s.note}>{approved.length?'All matching videos are hidden. Use Restore hidden activities and videos below to show them again.':'No currently licensed, age-reviewed videos match this experience and its selected topics. Enjoy the offline Joy Feed activities instead.'}</Text>:
    <View>{active?<View><ApprovedVideoPlayer key={active.id} video={active} onClose={()=>setSelected(null)}/>{feedback(active)}</View>:videos.map(v=><View key={v.id}><Pressable accessibilityRole="button" style={s.play} onPress={()=>{setFlagging(null);setSelected(v.id)}}><Text style={s.playText}>Play {v.title} · {v.durationSeconds}s</Text></Pressable>{feedback(v)}</View>)}</View>}
  <Text style={s.detail}>Videos require confirmed creator rights and age-appropriate content review before they can play here. Playback starts only when you tap Play; no automatic next video or hidden uploads.</Text>
 </View>;
}
const s=StyleSheet.create({secondary:{minHeight:48,justifyContent:'center',paddingVertical:8},link:{color:'#6737F5',fontWeight:'700'},play:{minHeight:48,justifyContent:'center',backgroundColor:'#6737F5',borderRadius:12,padding:12,marginTop:10},playText:{color:'#fff',fontWeight:'800'},card:{backgroundColor:'#F1EDFF',padding:16,borderRadius:18,marginTop:14},title:{fontSize:18,fontWeight:'800',color:'#21134C'},note:{fontSize:13,color:'#57427D',lineHeight:20,marginTop:9},detail:{fontSize:12,color:'#716C8A',lineHeight:18,marginTop:8}});

