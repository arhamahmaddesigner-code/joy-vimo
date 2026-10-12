import React,{useEffect,useState} from 'react';
import {Alert,AppState,StyleSheet,Switch,Text,View} from 'react-native';

const MODES=[
 {key:'instagramReels',label:'Instagram Reels',detail:'Detect certain fullscreen Reels view IDs; app versions may differ.'},
 {key:'tiktokFeed',label:'TikTok For You',detail:'Detect certain fullscreen feed view IDs; some versions are unsupported.'}
];
export default function FeedInterruptionControls({
 nativeModule,age,rules,schedules,domainRulesEnabled,domains
}){
 const [status,setStatus]=useState(null);
 const [busy,setBusy]=useState(false);
 function refresh(){try{setStatus(nativeModule?.getFocusStatus?.()||null)}catch{setStatus(null)}}
 useEffect(()=>{
  refresh();
  const sub=AppState.addEventListener('change',v=>{if(v==='active')refresh()});
  return()=>sub.remove();
 },[nativeModule]);
 async function change(key,value){
  if(!status?.optedIn||!status?.enforcing||!status?.serviceEnabled)return;
  setBusy(true);
  try{
   await nativeModule.setFocusConfig(JSON.stringify({
    age,consented:true,enforcing:true,rules,schedules,
    youtubeShorts:!!status.youtubeShorts,
    instagramReels:key==='instagramReels'?value:!!status.instagramReels,
    tiktokFeed:key==='tiktokFeed'?value:!!status.tiktokFeed,
    domainRulesEnabled:!!domainRulesEnabled,domains:domains||[]
   }));
   refresh();
  }catch{Alert.alert('Unable to save','Please try again.');}
  finally{setBusy(false)}
 }
 function toggle(key,next){
  if(!next){change(key,false);return;}
  const name=MODES.find(x=>x.key===key)?.label||'Feed';
  Alert.alert('Optional '+name+' interruption',
   'This experimental feature checks selected app screen resource IDs and dimensions. It does not inspect video frames, messages or visible text. It may miss feeds or interrupt an unexpected screen. It is not adult-content classification, and you can disable it at any time.',
   [{text:'Cancel',style:'cancel'},{text:'Enable',onPress:()=>change(key,true)}]);
 }
 const active=age!=='kid'&&status?.optedIn&&status?.enforcing&&status?.serviceEnabled;
 return <View style={s.card}>
  <Text style={s.heading}>Short-feed controls · experimental</Text>
  <Text style={s.help}>Each control is separate and optional. First enable Focus Shield and Android Accessibility above. These controls try to interrupt selected feed screens only; they do not change recommendations or identify explicit videos.</Text>
  {MODES.map(m=><View key={m.key} style={s.row}>
   <View style={{flex:1}}>
    <Text style={s.label}>{m.label}</Text>
    <Text style={s.help}>{m.detail}</Text>
   </View>
   <Switch accessibilityLabel={'Enable '+m.label+' interruption'}
    value={!!status?.[m.key]&&!!active}
    disabled={!active||busy} onValueChange={v=>toggle(m.key,v)}/>
  </View>)}
  <Text style={s.hint}>{active?'You can disable either feed detector at any time.':'Inactive — enable Focus Shield first.'}</Text>
 </View>;
}
const s=StyleSheet.create({
 card:{padding:17,borderRadius:20,backgroundColor:'#F1EDFF',marginTop:13},
 heading:{color:'#21134C',fontSize:18,fontWeight:'800'},
 row:{flexDirection:'row',gap:12,alignItems:'center',marginTop:17},
 label:{color:'#21134C',fontSize:14,fontWeight:'800'},
 help:{color:'#716C8A',fontSize:12,lineHeight:19,marginTop:7},
 hint:{fontSize:12,color:'#6737F5',fontWeight:'700',marginTop:16}
});
