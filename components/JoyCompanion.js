import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import Svg,{Circle,Path} from 'react-native-svg';
export default function JoyCompanion({xp=0,streak=0}){
 const level=Math.floor(Math.max(0,Number(xp)||0)/100)+1;
 const progress=Math.max(0,Number(xp)||0)%100;
 return <View style={s.card}>
  <Svg height="78" width="78" viewBox="0 0 78 78"><Circle cx="39" cy="39" r="36" fill="#6737F5"/><Circle cx="29" cy="34" r="4" fill="#fff"/><Circle cx="49" cy="34" r="4" fill="#fff"/><Path d="M25 47 Q39 60 53 47" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></Svg>
  <View style={{flex:1}}><Text style={s.small}>YOUR JOY COMPANION · LEVEL {level}</Text><Text style={s.title}>{streak?'Your '+streak+'-day rhythm':'Grow your joy'}</Text><Text style={s.text}>Every helpful choice moves you forward.</Text><View style={s.track}><View style={[s.fill,{width:progress+'%'}]}/></View><Text style={s.small}>{progress}/100 XP to next level · no penalties</Text></View>
 </View>;
}
const s=StyleSheet.create({card:{backgroundColor:'#fff',padding:14,borderRadius:22,marginTop:14,flexDirection:'row',gap:12,alignItems:'center'},small:{fontSize:11,color:'#6F53A8',fontWeight:'700'},title:{fontSize:18,color:'#21134C',fontWeight:'800',marginTop:5},text:{fontSize:12,color:'#716C8A',marginTop:4},track:{height:7,backgroundColor:'#EEE8FF',borderRadius:5,marginTop:9,overflow:'hidden'},fill:{height:7,backgroundColor:'#16B99D'}});