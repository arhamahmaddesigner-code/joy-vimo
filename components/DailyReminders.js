import React,{useEffect,useState} from 'react';
import {Alert,Pressable,Text,View,StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
const KEY='@joyvimo/daily-reminder-v1';
const TIMES=[{hour:8,label:'8 AM'},{hour:13,label:'1 PM'},{hour:18,label:'6 PM'},{hour:21,label:'9 PM'}];
export async function cancelSavedReminder(){
 const raw=await AsyncStorage.getItem(KEY);
 if(raw){
  try{const item=JSON.parse(raw);if(item.id)await Notifications.cancelScheduledNotificationAsync(item.id)}catch{}
 }
 await AsyncStorage.removeItem(KEY);
}
export default function DailyReminders({age}){
 const [state,setState]=useState({enabled:false,hour:21,id:null});
 const [busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
 useEffect(()=>{let alive=true;AsyncStorage.getItem(KEY).then(raw=>{if(raw&&alive){try{const x=JSON.parse(raw);setState({enabled:!!x.enabled,hour:Number(x.hour)||21,id:x.id||null})}catch{}}}).catch(()=>{}).finally(()=>{if(alive)setLoaded(true)});return()=>{alive=false}},[]);
 async function configure(hour,enabled){
  if(busy||!loaded)return;
  setBusy(true);
  try{
   let id=null;
   if(enabled){
    let permission=await Notifications.getPermissionsAsync();
    if(!permission.granted)permission=await Notifications.requestPermissionsAsync();
    if(!permission.granted){Alert.alert('Permission needed','Enable notifications in Android settings to use reminders.');return}
    id=await Notifications.scheduleNotificationAsync({
     content:{title:'JOY VIMO',body:'A gentle reminder to take a Joy break or check your daily plan.',sound:false},
     trigger:{type:Notifications.SchedulableTriggerInputTypes.DAILY,hour,minute:0}
    });
   }
   if(state.id)await Notifications.cancelScheduledNotificationAsync(state.id).catch(()=>{});
   const next={enabled,hour,id};
   await AsyncStorage.setItem(KEY,JSON.stringify(next));
   setState(next);
  }catch{Alert.alert('Reminder unavailable','Please retry from Settings.')}
  finally{setBusy(false)}
 }
 if(age==='kid')return null;
 return <View style={s.card}>
  <Text style={s.title}>Daily Joy reminder</Text>
  <Text style={s.note}>Optional local reminder. No private habits or browser information are included in notifications. Delivery can vary with Android battery settings.</Text>
  <Pressable accessibilityRole="switch" accessibilityState={{checked:state.enabled}} disabled={!loaded||busy} onPress={()=>configure(state.hour,!state.enabled)} style={s.button}><Text style={s.white}>{state.enabled?'Disable daily reminder':'Enable daily reminder'}</Text></Pressable>
  <Text style={s.note}>Choose reminder time</Text>
  <View style={s.row}>{TIMES.map(t=><Pressable key={t.hour} disabled={!loaded||busy} onPress={()=>configure(t.hour,state.enabled)} style={[s.time,state.hour===t.hour&&s.selected]}><Text style={{fontWeight:'800',color:state.hour===t.hour?'white':'#21134C'}}>{t.label}</Text></Pressable>)}</View>
  <Text style={s.note}>{state.enabled?'Reminder enabled':'Reminder off'} · Time follows device settings.</Text>
 </View>
}
const s=StyleSheet.create({card:{backgroundColor:'#F0EDFF',borderRadius:20,padding:17,marginTop:13},title:{color:'#21134C',fontSize:18,fontWeight:'800'},note:{color:'#716C8A',fontSize:12,lineHeight:20,marginTop:10},button:{backgroundColor:'#6737F5',padding:13,borderRadius:13,alignItems:'center',marginTop:13,minHeight:48},white:{color:'white',fontWeight:'800'},row:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:10},time:{backgroundColor:'white',borderRadius:12,padding:11},selected:{backgroundColor:'#6737F5'}});