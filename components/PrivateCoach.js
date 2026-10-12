import React,{useEffect,useMemo,useState} from 'react';
import {Alert,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LinearGradient} from 'expo-linear-gradient';
import {Heart,Wind,ShieldCheck,Sun,CheckCircle2,CalendarDays,ArrowRight,LockKeyhole,RotateCcw,Target} from 'lucide-react-native';
const V='#6737F5',D='#21134C',M='#706B87',S='#F7F5FF',W='#fff',G='#1BB69B';
const KEY='@joyvimo/private-coach-v1';
const STEPS=[
 {id:'notice',name:'Notice the moment',body:'An urge or distraction can feel intense and still pass. You can choose your next step.'},
 {id:'move',name:'Change your surroundings',body:'Stand up, put the phone down, and step into another room for a moment.'},
 {id:'breathe',name:'Slow down for 60 seconds',body:'Inhale gently and exhale a little longer. There is no need to fight the feeling.'},
 {id:'choose',name:'Choose one helpful action',body:'Water, a walk, a short task, or a conversation with someone you trust.'}
];
const PLAN=[
 {id:'set',name:'Choose my boundary',body:'Pick a realistic daily phone goal, then review the apps that pull your attention.'},
 {id:'prepare',name:'Prepare an alternative',body:'Pick an offline activity to try when scrolling or an unwanted habit feels automatic.'},
 {id:'protect',name:'Create an easier environment',body:'Charge your phone away from bed or use focus reminders during vulnerable times.'},
 {id:'practice',name:'Practice a 60-second pause',body:'When a difficult moment arrives, notice it and take one supportive action.'},
 {id:'reflect',name:'Review without judgment',body:'What helped today? What might you change tomorrow? Progress is rarely a straight line.'}
];
function Txt({children,size=14,color=D,bold=false,style}){return <Text style={[{fontSize:size,color,fontWeight:bold?'800':'400',lineHeight:size*1.43},style]}>{children}</Text>}
function Card({children,style}){return <View style={[st.card,style]}>{children}</View>}
function Btn({children,onPress,light=false}){return <Pressable accessibilityRole="button" onPress={onPress} style={[st.btn,light&&{backgroundColor:'#EEE7FF'}]}><Txt color={light?V:W} bold>{children}</Txt><ArrowRight size={17} color={light?V:W}/></Pressable>}
function dayKey(d=new Date()){return String(d.getFullYear())+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function startWeek(){const d=new Date();const n=(d.getDay()+6)%7;d.setDate(d.getDate()-n);d.setHours(0,0,0,0);return d}
export default function PrivateCoach({age,onBack,claims={}}){
 const [tab,setTab]=useState('Now'),[step,setStep]=useState(0),[seconds,setSeconds]=useState(60),[playing,setPlaying]=useState(false);
 const [state,setState]=useState({done:{},plan:{},notes:0}),[loaded,setLoaded]=useState(false);
 useEffect(()=>{let valid=true;AsyncStorage.getItem(KEY).then(x=>{if(valid&&x){try{const v=JSON.parse(x);setState({done:v.done||{},plan:v.plan||{},notes:Number(v.notes)||0})}catch{}}}).finally(()=>{if(valid)setLoaded(true)});return()=>{valid=false}},[]);
 useEffect(()=>{if(loaded)AsyncStorage.setItem(KEY,JSON.stringify(state)).catch(()=>{})},[state,loaded]);
 useEffect(()=>{if(!playing)return;const t=setInterval(()=>setSeconds(n=>n>1?n-1:0),1000);return()=>clearInterval(t)},[playing]);
 useEffect(()=>{if(playing&&seconds===0)setPlaying(false)},[seconds,playing]);
 const key=dayKey(),count=Object.keys(state.done).filter(k=>k.startsWith(key+'-')).length;
 const points=useMemo(()=>{const week=startWeek();const rows=[];for(let i=0;i<7;i++){const d=new Date(week);d.setDate(week.getDate()+i);const k=dayKey(d);const coached=Object.keys(state.done).filter(z=>z.startsWith(k+'-')).length;const actions=Object.keys(claims).filter(z=>z.startsWith(k+'-')).length;rows.push({label:['M','T','W','T','F','S','S'][i],count:coached+actions,date:k})}return rows},[state.done,claims]);
 const mark=(id)=>setState(prev=>({...prev,done:{...prev.done,[key+'-'+id]:true}}));
 const markPlan=id=>setState(prev=>({...prev,plan:{...prev.plan,[id]:!prev.plan[id]}}));
 const reset=()=>{setStep(0);setSeconds(60);setPlaying(false)};
 const completeMoment=()=>{
  mark('intentional-pause');
  setState(prev=>({...prev,done:{...prev.done,[key+'intentional-pause']:true},notes:prev.notes+1}));
  Alert.alert('You chose a helpful step','Your private progress is recorded on this device. You can return whenever you need support.');
  reset();
 };
 return <View>
 <Pressable onPress={onBack} accessibilityRole="button" style={{marginBottom:10,paddingVertical:9}}><Txt bold color={V}>‹ Back to home</Txt></Pressable>
 <Txt size={27} bold>Your support space 💜</Txt>
 <Txt color={M} style={{marginTop:7}}>Short, private tools for difficult moments and more intentional habits.</Txt>
 <View style={st.tabs}>{['Now','My plan','Progress'].map(name=><Pressable key={name} onPress={()=>{setTab(name);setPlaying(false)}} style={[st.tab,tab===name&&{backgroundColor:V}]}><Txt size={12} color={tab===name?W:M} bold>{name}</Txt></Pressable>)}</View>
 {tab==='Now'&&<>
  <LinearGradient colors={['#8155FF','#4C26D0']} style={st.banner}><Heart size={30} color="#FFD4EA"/><Txt color={W} size={22} bold style={{marginTop:12}}>One moment at a time</Txt><Txt color="#EEE5FF" style={{marginTop:8}}>No judgment. You can make a small, helpful choice right now.</Txt></LinearGradient>
  <Card><Txt size={12} color={V} bold>STEP {step+1} OF {STEPS.length}</Txt><Txt size={21} bold style={{marginTop:10}}>{STEPS[step].name}</Txt><Txt color={M} style={{marginTop:8}}>{STEPS[step].body}</Txt>
   {STEPS[step].id==='breathe'&&<View style={st.timer}><Wind size={30} color={V}/><Txt size={30} bold style={{marginTop:6}}>{seconds}s</Txt><Btn light onPress={()=>{if(seconds===0){setSeconds(60);setPlaying(false)}else setPlaying(v=>!v)}}>{playing?'Pause timer':seconds===0?'Restart timer':'Start 60-second timer'}</Btn></View>}
   <View style={{marginTop:16}}>{step<STEPS.length-1?<Btn onPress={()=>setStep(step+1)}>Next helpful step</Btn>:<Btn onPress={completeMoment}>I chose a helpful action</Btn>}</View>
   {step>0?<Btn light onPress={()=>setStep(s=>s-1)}>Previous step</Btn>:null}
  </Card><Txt size={12} color={M} style={{marginTop:11}}>If your habits are causing ongoing distress or interfering with daily life, confidential professional support can complement self-help tools.</Txt>
 </>}
 {tab==='My plan'&&<><Card><Target color={V} size={27}/><Txt bold size={18} style={{marginTop:9}}>My personal plan</Txt><Txt color={M} style={{marginTop:5}}>Choose the actions that feel right for you. You are in control of your own pace.</Txt></Card>
 {PLAN.map(x=><Pressable key={x.id} accessibilityRole="checkbox" accessibilityState={{checked:!!state.plan[x.id]}} onPress={()=>markPlan(x.id)}><Card><View style={{flexDirection:'row',alignItems:'flex-start',gap:13}}><View style={[st.check,state.plan[x.id]&&{backgroundColor:G,borderColor:G}]}>{state.plan[x.id]?<CheckCircle2 size={19} color={W}/>:null}</View><View style={{flex:1}}><Txt bold size={16}>{x.name}</Txt><Txt color={M} style={{marginTop:5}}>{x.body}</Txt></View></View></Card></Pressable>)}
 <Card style={{backgroundColor:'#F0E9FF'}}><LockKeyhole size={22} color={V}/><Txt bold style={{marginTop:9}}>Only on this device</Txt><Txt color={M} style={{marginTop:6}}>This checklist does not ask for explicit sexual history, does not upload details, and can be deleted from Settings.</Txt></Card></>}
 {tab==='Progress'&&<><Card><Txt bold size={19}>This week</Txt><Txt color={M} style={{marginTop:4}}>Positive actions, not a clinical recovery score.</Txt><View style={{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',height:129,marginTop:18}}>{points.map(x=><View key={x.date} style={{alignItems:'center',width:33}}><View style={{height:95,justifyContent:'flex-end'}}><View style={{width:25,height:Math.max(7,Math.min(88,x.count*16)),borderRadius:7,backgroundColor:x.count?V:'#E7E0F7'}}/></View><Txt size={12} color={M} bold style={{marginTop:7}}>{x.label}</Txt></View>)}</View></Card>
 <View style={{flexDirection:'row',gap:12,marginTop:5}}><Card style={{flex:1}}><Sun size={23} color="#EBA23D"/><Txt size={29} bold>{count}</Txt><Txt color={M} size={12}>Helpful moments today</Txt></Card><Card style={{flex:1}}><Heart size={23} color="#ED729B"/><Txt size={29} bold>{state.notes}</Txt><Txt color={M} size={12}>Private pause actions</Txt></Card></View>
 <Card><Txt bold size={18}>How to read progress</Txt><Txt color={M} style={{marginTop:8}}>More check-ins do not necessarily mean more or less compulsive use. Track what improves your sleep, attention, work and wellbeing over several weeks.</Txt></Card></>}
 </View>;
}
const st=StyleSheet.create({card:{backgroundColor:W,borderRadius:21,padding:17,marginTop:13},tabs:{backgroundColor:'#EEE9FA',flexDirection:'row',borderRadius:17,padding:5,gap:5,marginTop:17},tab:{flex:1,paddingVertical:11,alignItems:'center',borderRadius:13},banner:{padding:20,borderRadius:22,marginTop:16},btn:{backgroundColor:V,borderRadius:14,padding:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginTop:10},timer:{alignItems:'center',marginVertical:13,padding:13,backgroundColor:'#F3EEFF',borderRadius:15},check:{height:27,width:27,borderRadius:8,borderColor:'#CABEE8',borderWidth:2,alignItems:'center',justifyContent:'center'}});
