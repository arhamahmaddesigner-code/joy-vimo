import React from 'react';
import {Alert,Pressable,StyleSheet,Switch,Text,TextInput,View} from 'react-native';
const presets={Sleep:{start:'22:00',end:'07:00',days:[0,1,2,3,4,5,6]},Study:{start:'16:00',end:'18:00',days:[0,1,2,3,4,5,6]},'Me time':{start:'20:00',end:'21:00',days:[0,1,2,3,4,5,6]}};
const valid=t=>/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(t);
const days=['Su','Mo','Tu','We','Th','Fr','Sa'];
export default function ScheduleEditor({value,onChange}){
 const data=value||{};
 function item(name){let x=data[name];if(typeof x==='boolean')return {...presets[name],enabled:x};return {...presets[name],...(x||{}),enabled:!!x?.enabled}}
 function edit(name,part){onChange({...data,[name]:{...item(name),...part}})}
 return <View style={s.box}><Text style={s.head}>Custom focus routines</Text>
 <Text style={s.hint}>Local-time schedules for apps with enabled Focus Shield rules. Overnight windows and selected weekdays are supported. You can disable any schedule or use Safety Pause.</Text>
 {Object.keys(presets).map(name=>{const x=item(name);return <View key={name} style={s.card}>
  <View style={s.row}><Text style={s.title}>{name}</Text><Switch value={x.enabled} onValueChange={v=>edit(name,{enabled:v})}/></View>
  <View style={s.row}><View style={{flex:1}}><Text style={s.hint}>Start (24h)</Text><TextInput accessibilityLabel={name+' start time'} style={s.input} value={x.start} maxLength={5} onChangeText={v=>edit(name,{start:v})} onEndEditing={()=>{if(!valid(item(name).start)){Alert.alert('Invalid time','Use HH:MM, 00:00–23:59');edit(name,{start:presets[name].start})}}}/></View>
  <View style={{flex:1}}><Text style={s.hint}>End (24h)</Text><TextInput accessibilityLabel={name+' end time'} style={s.input} value={x.end} maxLength={5} onChangeText={v=>edit(name,{end:v})} onEndEditing={()=>{if(!valid(item(name).end)){Alert.alert('Invalid time','Use HH:MM, 00:00–23:59');edit(name,{end:presets[name].end})}}}/></View></View>
  <View style={s.row}>{days.map((d,i)=><Pressable key={i} onPress={()=>{const next=x.days.includes(i)?x.days.filter(y=>y!==i):[...x.days,i];edit(name,{days:next})}} style={[s.day,x.days.includes(i)&&s.on]}><Text style={{fontSize:11,fontWeight:'800',color:x.days.includes(i)?'#fff':'#554783'}}>{d}</Text></Pressable>)}</View>
  <Text style={s.hint}>{x.start===x.end?'Choose different start and end times.':Number(x.end.slice(0,2))*60+Number(x.end.slice(3))<Number(x.start.slice(0,2))*60+Number(x.start.slice(3))?'Runs overnight into the following morning.':'Runs on the selected days.'}</Text>
 </View>})}</View>
}
const s=StyleSheet.create({box:{marginTop:8},head:{fontSize:19,fontWeight:'800',color:'#21134C'},hint:{color:'#716C8A',fontSize:12,lineHeight:19,marginTop:6},card:{backgroundColor:'#fff',padding:16,borderRadius:18,marginTop:12},row:{flexDirection:'row',alignItems:'center',gap:9,justifyContent:'space-between',marginTop:10},title:{fontSize:17,fontWeight:'800',color:'#21134C'},input:{backgroundColor:'#F3EFFF',borderRadius:10,padding:10,marginTop:6,color:'#21134C',fontSize:16,fontWeight:'700'},day:{paddingVertical:11,flex:1,alignItems:'center',borderRadius:11,backgroundColor:'#EEE9F7'},on:{backgroundColor:'#6737F5'}});