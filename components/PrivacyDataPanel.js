import React,{useState} from 'react';
import {Alert,Pressable,Share,StyleSheet,Text,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const KEYS=['@joyvimo/v07','@joyvimo/private-coach-v1','@joyvimo/joy-feed-hidden-v1','@joyvimo/joy-feed-reports-v1','@joyvimo/daily-reminder-v1'];
export default function PrivacyDataPanel(){
 const [busy,setBusy]=useState(false);
 async function exportLocal(includeDomains=false){
  setBusy(true);
  try{
   const rows=await AsyncStorage.multiGet(KEYS);
   const state={};
   for(const [key,raw] of rows)if(raw){
    try{state[key]=JSON.parse(raw)}catch{state[key]={unreadable:true}}
   }
   if(!includeDomains&&state[KEYS[0]]){
    state[KEYS[0]]={...state[KEYS[0]],domains:[]};
   }
   const payload={
    format:'JOY VIMO local private data export v1',
    exportedAt:new Date().toISOString(),
    note:'Manual user-initiated share; includes private local wellbeing information. Online leaderboard profile and scores are not included.',
    customDomainsIncluded:includeDomains,
    data:state
   };
   await Share.share({title:'JOY VIMO private backup',message:JSON.stringify(payload,null,2)});
  }catch(e){Alert.alert('Unable to export','Could not open the device share sheet. Your local data has not been deleted.');}
  finally{setBusy(false)}
 }
 return <View style={s.card}>
  <Text style={s.title}>My privacy & data</Text>
  <Text style={s.note}>Your local challenges, settings and personal plan stay on this device. You decide whether to share an export. Android's share sheet may send your data to another app, so choose a trusted destination.</Text>
  <Pressable disabled={busy} accessibilityRole="button" onPress={()=>exportLocal(false)} style={s.button}><Text style={s.white}>Export private progress (no website list)</Text></Pressable>
  <Pressable disabled={busy} accessibilityRole="button" onPress={()=>Alert.alert('Include your custom domains?','Your website list may reveal personal preferences. Only share the complete backup somewhere you trust.',[{text:'Cancel',style:'cancel'},{text:'Export complete local data',onPress:()=>exportLocal(true)}])} style={s.sub}><Text style={s.link}>Export full settings, including my domains</Text></Pressable>
  <Text style={s.note}>To delete online leaderboard data, visit Community & privacy and select “Delete my leaderboard data”. Local export does not include online account records.</Text>
 </View>
}
const s=StyleSheet.create({card:{backgroundColor:'white',borderRadius:20,padding:17,marginTop:13},title:{color:'#21134C',fontSize:18,fontWeight:'800'},note:{color:'#716C8A',fontSize:12,lineHeight:20,marginTop:10},button:{backgroundColor:'#6737F5',minHeight:48,padding:11,borderRadius:12,alignItems:'center',justifyContent:'center',marginTop:13},white:{color:'white',fontWeight:'800',textAlign:'center'},sub:{padding:13,alignItems:'center'},link:{fontWeight:'800',color:'#6737F5',textAlign:'center'}});