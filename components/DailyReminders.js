import React,{useEffect,useState} from 'react';
import {Alert,Pressable,Text,View,StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {changeDailyReminder,cancelAllDailyReminders,formatReminderTime} from '../lib/reminderScheduler';
const KEY='@joyvimo/daily-reminder-v1';
const HOUR_OPTIONS=[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
const MINUTES=[0,15,30,45];
export async function cancelSavedReminder(){
 await cancelAllDailyReminders({notifications:Notifications,storage:AsyncStorage});
}
export default function DailyReminders({age}){
 const [state,setState]=useState({enabled:false,hour:21,minute:0,id:null});
 const [busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
 useEffect(()=>{let alive=true;AsyncStorage.getItem(KEY).then(raw=>{if(raw&&alive){try{const x=JSON.parse(raw);setState({enabled:!!x.enabled,hour:Number.isInteger(x.hour)?x.hour:21,minute:Number.isInteger(x.minute)?x.minute:0,id:x.id||null})}catch{}}}).catch(()=>{}).finally(()=>{if(alive)setLoaded(true)});return()=>{alive=false}},[]);
 async function configure(hour,minute,enabled){
  if(busy||!loaded)return;
  setBusy(true);
  try{
   if(enabled){
    let permission=await Notifications.getPermissionsAsync();
    if(!permission.granted)permission=await Notifications.requestPermissionsAsync();
    if(!permission.granted){Alert.alert('Permission needed','Enable notifications in Android settings to use reminders.');return}
   }
   const next=await changeDailyReminder({notifications:Notifications,storage:AsyncStorage,previous:state,hour,minute,enabled});
   setState(next);
  }catch{Alert.alert('Reminder unavailable','Please retry from Settings.')}
  finally{setBusy(false)}
 }
 if(age==='kid')return null;
 return <View style={s.card}>
  <Text style={s.title}>Daily Joy reminder</Text>
  <Text style={s.note}>Optional local reminder. No private habits or browser information are included in notifications. Delivery can vary with Android battery settings.</Text>
  <Pressable accessibilityRole="switch" accessibilityState={{checked:state.enabled}} disabled={!loaded||busy} onPress={()=>configure(state.hour,state.minute,!state.enabled)} style={s.button}><Text style={s.white}>{state.enabled?'Disable daily reminder':'Enable daily reminder'}</Text></Pressable>
  <Text style={s.note}>Choose reminder time</Text>
  <Text style={s.note}>Hour (08–22)</Text>
  <View style={s.row}>{HOUR_OPTIONS.map(hour=><Pressable accessibilityRole="button" accessibilityState={{selected:state.hour===hour}} key={hour} disabled={!loaded||busy} onPress={()=>configure(hour,state.minute,state.enabled)} style={[s.time,state.hour===hour&&s.selected]}><Text style={{fontWeight:'800',color:state.hour===hour?'white':'#21134C'}}>{String(hour).padStart(2,'0')}</Text></Pressable>)}</View>
  <Text style={s.note}>Minute</Text>
  <View style={s.row}>{MINUTES.map(minute=><Pressable accessibilityRole="button" accessibilityState={{selected:state.minute===minute}} key={minute} disabled={!loaded||busy} onPress={()=>configure(state.hour,minute,state.enabled)} style={[s.time,state.minute===minute&&s.selected]}><Text style={{fontWeight:'800',color:state.minute===minute?'white':'#21134C'}}>{String(minute).padStart(2,'0')}</Text></Pressable>)}</View>
  <Text style={s.note}>{state.enabled?'Reminder enabled':'Reminder off'} · {formatReminderTime(state.hour,state.minute)} device-local time.</Text>
 </View>
}
const s=StyleSheet.create({card:{backgroundColor:'#F0EDFF',borderRadius:20,padding:17,marginTop:13},title:{color:'#21134C',fontSize:18,fontWeight:'800'},note:{color:'#716C8A',fontSize:12,lineHeight:20,marginTop:10},button:{backgroundColor:'#6737F5',padding:13,borderRadius:13,alignItems:'center',marginTop:13,minHeight:48},white:{color:'white',fontWeight:'800'},row:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:10},time:{backgroundColor:'white',borderRadius:12,padding:11},selected:{backgroundColor:'#6737F5'}});