import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import Svg,{Circle,Path} from 'react-native-svg';

// All reactions are calculated locally from already-earned rewards.
export default function JoyCompanion({xp=0,streak=0,dailyDone=0,dailyTarget=2}){
 const earned=Math.max(0,Number(xp)||0);
 const level=Math.floor(earned/100)+1;
 const progress=earned%100;
 const goal=Math.max(1,Number(dailyTarget)||2);
 const done=Math.max(0,Number(dailyDone)||0);
 const met=done>=goal;
 const expression=met?'proud':progress>=70?'excited':'happy';
 const headline=met?'You reached your daily goal!':streak>0?'Your '+streak+'-day rhythm':'Grow your joy';
 const encouragement=met?'Enjoy this moment. Tomorrow is a fresh start.':done>0?'Nice progress! Every positive action counts.':'Try one small activity when you feel ready.';
 const mouth=expression==='excited'?'M25 45 Q39 65 53 45':expression==='proud'?'M24 47 Q39 61 54 47':'M25 47 Q39 58 53 47';
 return <View style={s.card} accessibilityLabel={'Joy Companion. Level '+level+'. '+encouragement}>
  <View style={s.avatar}>
   <Svg height="82" width="82" viewBox="0 0 82 82">
    <Circle cx="41" cy="41" r="39" fill={met?'#16B99D':'#6737F5'}/>
    <Circle cx="30" cy="35" r="4" fill="#fff"/>
    <Circle cx="52" cy="35" r="4" fill="#fff"/>
    <Path d={mouth} fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
   </Svg>
  </View>
  <View style={s.content}>
   <Text style={s.small}>YOUR JOY COMPANION · LEVEL {level}</Text>
   <Text style={s.title}>{headline}</Text>
   <Text style={s.text}>{encouragement}</Text>
   <View style={s.track} accessibilityLabel={progress+' of 100 XP toward next level'}><View style={[s.fill,{width:progress+'%'}]}/></View>
   <Text style={s.small}>{progress}/100 XP to next level · no penalties</Text>
   <Text style={s.goal}>{Math.min(done,goal)}/{goal} daily positive actions {met?'✓':''}</Text>
  </View>
 </View>;
}
const s=StyleSheet.create({
 card:{backgroundColor:'#fff',padding:14,borderRadius:22,marginTop:14,flexDirection:'row',gap:12,alignItems:'center'},
 avatar:{width:82,height:82,alignItems:'center',justifyContent:'center'},
 content:{flex:1},
 small:{fontSize:11,color:'#6F53A8',fontWeight:'700'},
 title:{fontSize:18,color:'#21134C',fontWeight:'800',marginTop:5},
 text:{fontSize:12,color:'#716C8A',marginTop:4,lineHeight:18},
 track:{height:7,backgroundColor:'#EEE8FF',borderRadius:5,marginTop:9,overflow:'hidden'},
 fill:{height:7,backgroundColor:'#16B99D'},
 goal:{fontSize:12,color:'#6737F5',fontWeight:'700',marginTop:9}
});