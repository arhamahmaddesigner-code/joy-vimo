import React,{useEffect,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert,Pressable,StyleSheet,Text,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {ACTIVITIES} from '../lib/offlineActivities';
const PURPLE='#6737F5',INK='#21134C',MUTED='#716C8A';
const TOPICS=['Nature','Animals','Creativity','Learning','Comedy','Calm'];
export default function OfflineActivities({interests,onInterestsChange,claims,onComplete}){
 const [current,setCurrent]=useState(null);
 const [step,setStep]=useState(0);
 const [hidden,setHidden]=useState([]);
 useEffect(()=>{let live=true;AsyncStorage.getItem('@joyvimo/joy-feed-hidden-v1').then(raw=>{if(live&&raw){try{const a=JSON.parse(raw);if(Array.isArray(a))setHidden(a.filter(x=>typeof x==='string'))}catch{}}}).catch(()=>{});return()=>{live=false}},[]);
 function hide(id){const next=[...new Set([...hidden,id])];setHidden(next);AsyncStorage.setItem('@joyvimo/joy-feed-hidden-v1',JSON.stringify(next)).catch(()=>{})}
 function restore(){setHidden([]);AsyncStorage.removeItem('@joyvimo/joy-feed-hidden-v1').catch(()=>{})}
 const activities=ACTIVITIES.filter(x=>interests.includes(x.topic)&&!hidden.includes(x.id));
 const today=new Date(),key=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
 // Stable daily pick from the finite, user-selected activity pool. No tracking or recommendation service.
 const dayNumber=Math.floor(new Date(today.getFullYear(),today.getMonth(),today.getDate(),12).getTime()/86400000);
 const dailyPick=activities.length?activities[((dayNumber%activities.length)+activities.length)%activities.length]:null;
 function startActivity(item){setCurrent(item);setStep(0)}
 return <View>
  <Text style={s.heading}>Joy breaks, not infinite scrolling</Text>
  <Text style={s.detail}>Six finite, screen-light activities. No ads, autoplay, login, uploads, algorithmic feed or tracking.</Text>
  {!current&&dailyPick?<View style={s.pickCard}><Text style={s.pickEyebrow}>✦ TODAY\'S JOY PICK</Text><Text style={s.pickTitle}>{dailyPick.emoji}  {dailyPick.title}</Text><Text style={s.pickDetail}>A single optional activity chosen from your selected interests. No endless recommendations.</Text><Pressable accessibilityRole="button" accessibilityLabel="Try today\'s Joy Pick" onPress={()=>startActivity(dailyPick)} style={s.pickButton}><Text style={s.white}>Try today\'s pick →</Text></Pressable></View>:null}
  <View style={s.topics}>{TOPICS.map(t=><Pressable key={t} accessibilityRole="button" onPress={()=>onInterestsChange(interests.includes(t)?interests.filter(x=>x!==t):[...interests,t])} style={[s.topic,interests.includes(t)&&{backgroundColor:PURPLE}]}>
   <Text style={{color:interests.includes(t)?'#fff':INK,fontWeight:'700',fontSize:12}}>{t}</Text>
  </Pressable>)}</View>
  {current? <View style={s.card}>
    <Text style={s.emoji}>{current.emoji}</Text>
    <Text style={s.title}>{current.title}</Text>
    <Text style={s.detail}>{current.body}</Text>
    <View style={s.focus}><Text style={s.small}>STEP {step+1} / {current.steps.length}</Text><Text style={s.instruction}>{current.steps[step]}</Text></View>
    {step<current.steps.length-1?
      <Pressable accessibilityRole="button" onPress={()=>setStep(i=>i+1)} style={s.primary}><Text style={s.white}>Next step →</Text></Pressable>:
      <Pressable accessibilityRole="button" onPress={()=>{
        const id='joy-'+current.id;
        onComplete(id,10);
        setCurrent(null);setStep(0);
      }} style={s.primary}><Text style={s.white}>Finish my joy break</Text></Pressable>}
    <Pressable accessibilityRole="button" onPress={()=>{setCurrent(null);setStep(0)}} style={s.secondary}><Text style={s.secondaryText}>End activity without reward</Text></Pressable>
   </View> : activities.map(item=>{
      const completed=!!claims[key+'-joy-'+item.id];
      return <View key={item.id} style={s.card}>
       <LinearGradient colors={['#EFE7FF','#F9F6FF']} style={s.art}><Text style={s.emoji}>{item.emoji}</Text></LinearGradient>
       <Text style={s.eyebrow}>{item.topic.toUpperCase()} · {Math.ceil(item.duration/60)} MIN</Text>
       <Text style={s.title}>{item.title}</Text>
       <Text style={s.detail}>{item.body}</Text>
       <Pressable accessibilityRole="button" onPress={()=>startActivity(item)} style={s.primary}><Text style={s.white}>{completed?'Enjoy again':'Start activity · +10 XP'}</Text></Pressable>
       <Pressable accessibilityRole="button" onPress={()=>hide(item.id)} style={s.secondary}><Text style={s.secondaryText}>Not interested</Text></Pressable>
      </View>;
   })}
   {!current&&activities.length===0?<View style={s.card}><Text style={s.title}>Choose something that feels right</Text><Text style={s.detail}>Select a topic above or restore hidden activities.</Text></View>:null}
   {!current&&hidden.length>0?<Pressable accessibilityRole="button" onPress={restore} style={s.secondary}><Text style={s.secondaryText}>Restore hidden activities</Text></Pressable>:null}
   <Text style={[s.detail,{marginVertical:16,fontSize:12}]}>Activity completion is self-reported. It is not a medical recovery score and does not monitor what you do in other apps.</Text>
 </View>;
}
const s=StyleSheet.create({pickCard:{backgroundColor:'#EEE8FF',padding:18,marginTop:14,borderRadius:21,borderWidth:1,borderColor:'#DED1FF'},pickEyebrow:{color:PURPLE,fontSize:11,fontWeight:'800',letterSpacing:1},pickTitle:{fontSize:20,color:INK,fontWeight:'800',marginTop:10},pickDetail:{fontSize:13,color:MUTED,lineHeight:20,marginTop:7},pickButton:{backgroundColor:PURPLE,minHeight:47,borderRadius:13,alignItems:'center',justifyContent:'center',marginTop:13},heading:{fontSize:23,color:INK,fontWeight:'800',marginTop:12},detail:{fontSize:14,lineHeight:21,color:MUTED,marginTop:7},topics:{flexDirection:'row',flexWrap:'wrap',gap:8,marginVertical:12},topic:{paddingVertical:10,paddingHorizontal:12,borderRadius:18,backgroundColor:'#E9E4F7'},card:{backgroundColor:'#fff',padding:17,marginTop:13,borderRadius:20},art:{height:145,borderRadius:15,alignItems:'center',justifyContent:'center'},emoji:{fontSize:54,textAlign:'center'},eyebrow:{marginTop:12,fontSize:11,color:PURPLE,fontWeight:'800'},title:{fontSize:19,fontWeight:'800',color:INK,marginTop:9},focus:{backgroundColor:'#F3EFFF',borderRadius:14,padding:16,marginTop:16},small:{color:PURPLE,fontSize:11,fontWeight:'800'},instruction:{fontSize:17,lineHeight:25,color:INK,fontWeight:'700',marginTop:8},primary:{backgroundColor:PURPLE,minHeight:48,borderRadius:14,alignItems:'center',justifyContent:'center',marginTop:14},white:{color:'#fff',fontWeight:'800'},secondary:{minHeight:43,alignItems:'center',justifyContent:'center',marginTop:4},secondaryText:{color:PURPLE,fontWeight:'700'}});
