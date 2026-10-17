import React,{useState} from 'react';
import {Pressable,Text,View,StyleSheet} from 'react-native';
import {createMemoryGarden,chooseGardenCard,isMismatch,closeGardenMismatch} from '../lib/memoryGarden';
const INK='#21134C',V='#6737F5';
export default function MemoryGarden({onComplete}){
 const [game,setGame]=useState(()=>createMemoryGarden(new Date().toDateString()));
 const [rewarded,setRewarded]=useState(false);
 const select=i=>setGame(g=>chooseGardenCard(g,i));
 const restart=()=>{setGame(createMemoryGarden(Date.now()));setRewarded(false)};
 const finish=()=>{
  if(!game.completed||rewarded)return;
  setRewarded(true);onComplete('memory-garden',10);
 };
 return <View style={s.card}>
  <Text style={s.title}>Memory Garden 🌸</Text>
  <Text style={s.desc}>A calm, finite memory game. Find four matching pairs at your own pace. No countdown or online tracking.</Text>
  <Text style={s.meta}>{game.matched.length/2} of 4 pairs · {game.moves} tries</Text>
  <View style={s.grid}>{game.cards.map((card,i)=>{
   const visible=game.shown.includes(i)||game.matched.includes(i);
   return <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={visible?card.key+' card':'Hidden memory card '+(i+1)}
    accessibilityState={{disabled:game.matched.includes(i)||game.completed||game.shown.length===2}}
    disabled={game.matched.includes(i)||game.completed||game.shown.length===2}
    onPress={()=>select(i)} style={[s.tile,visible&&s.tileOpen]}>
    <Text style={s.tileText}>{visible?card.emoji:'✦'}</Text>
   </Pressable>;
  })}</View>
  {isMismatch(game)?<Pressable accessibilityRole="button" style={s.action} onPress={()=>setGame(g=>closeGardenMismatch(g))}><Text style={s.white}>Try another pair →</Text></Pressable>:null}
  {game.completed?<><Text style={s.success}>Garden complete! Nice work.</Text><Pressable accessibilityRole="button" disabled={rewarded} style={s.action} onPress={finish}><Text style={s.white}>{rewarded?'Reward recorded':'Finish memory challenge · +10 XP'}</Text></Pressable></>:null}
  <Pressable accessibilityRole="button" style={s.secondary} onPress={restart}><Text style={s.link}>Restart memory game</Text></Pressable>
 </View>;
}
const s=StyleSheet.create({card:{backgroundColor:'white',padding:17,borderRadius:20,marginTop:14},title:{fontSize:20,fontWeight:'800',color:INK},desc:{fontSize:13,lineHeight:20,color:'#716C8A',marginTop:8},meta:{fontWeight:'800',color:V,marginTop:12},grid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:14},tile:{width:'22%',minHeight:64,backgroundColor:'#EEE8FF',borderRadius:13,justifyContent:'center',alignItems:'center'},tileOpen:{backgroundColor:'#D5F4E9'},tileText:{fontSize:27},action:{backgroundColor:V,minHeight:48,padding:12,borderRadius:12,alignItems:'center',justifyContent:'center',marginTop:13},white:{color:'#fff',fontWeight:'800'},success:{color:'#196D50',fontWeight:'800',marginTop:14},secondary:{minHeight:48,alignItems:'center',justifyContent:'center',marginTop:5},link:{color:V,fontWeight:'700'}});
