import React,{useState,useEffect,useRef} from 'react';
import {View,Text,ScrollView,SafeAreaView,StatusBar,Pressable,Switch,StyleSheet,Alert,Platform,AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {requireOptionalNativeModule} from 'expo-modules-core';

const violet='#6C3BFF',navy='#17113F',lavender='#F5F2FF',light='#FFFFFF',muted='#767192',mint='#24CCB2',pink='#FF6397';
const APPS=['Instagram','TikTok','YouTube','Chrome'];
const INTERESTS=['Nature','Comedy','Animals','Creativity','Learning','Calm'];
const INIT={
  started:false,interests:['Nature','Comedy','Animals'],focus:{},
  rules:Object.fromEntries(APPS.map(n=>[n,{enabled:false,minutes:30,opens:3,session:10}])),
  xp:0,claims:{},leaderboard:false,
};
const key='@joyvimo/qa-v06';
function Button({children,onPress,secondary=false,small=false,disabled=false}){
 return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.btn,secondary&&styles.btnSecondary,small&&{paddingVertical:11},disabled&&{opacity:.45}]}><Text style={[styles.btnText,secondary&&{color:violet}]}>{children}</Text></Pressable>;
}
function Panel({children,style}){return <View style={[styles.panel,style]}>{children}</View>;}
function Title({children}){return <Text style={styles.title}>{children}</Text>;}
function Sub({children}){return <Text style={styles.sub}>{children}</Text>;}
function Row({children}){return <View style={styles.row}>{children}</View>;}
function Chip({children,active,onPress}){return <Pressable accessibilityRole="button" accessibilityState={{selected:!!active}} onPress={onPress} style={[styles.chip,active&&{backgroundColor:violet}]}><Text style={[styles.chipTxt,active&&{color:light}]}>{children}</Text></Pressable>;}
export default function App(){
 const [ready,setReady]=useState(false),[s,setS]=useState(INIT),[tab,setTab]=useState('Home');
 const [selected,setSelected]=useState('Instagram'),[observed,setObserved]=useState(null),[perm,setPerm]=useState('not-granted');
 const [sim,setSim]=useState({}),[reset,setReset]=useState(30),[running,setRunning]=useState(false);
 const [feedHidden,setFeedHidden]=useState([]);const clock=useRef(null);
 const native=useRef(null);
 if(native.current===null&&Platform.OS==='android'){try{native.current=requireOptionalNativeModule('JoyVimoUsage')||false;}catch{native.current=false;}}
 useEffect(()=>{let live=true;AsyncStorage.getItem(key).then(v=>{if(v&&live){try{const x=JSON.parse(v);if(x&&typeof x==='object')setS({...INIT,...x,rules:{...INIT.rules,...x.rules}});}catch{}}}).finally(()=>{if(live)setReady(true)});return()=>{live=false}},[]);
 useEffect(()=>{if(ready)AsyncStorage.setItem(key,JSON.stringify(s)).catch(()=>{});},[s,ready]);
 useEffect(()=>{if(!running)return;clock.current=setInterval(()=>setReset(v=>{if(v<=1){setRunning(false);return 0;}return v-1}),1000);return()=>clearInterval(clock.current)},[running]);
 async function refresh(){
  const n=native.current;if(!n){setPerm('unavailable');setObserved(null);return;}
  try{if(!n.hasUsageAccess()){setPerm('not-granted');setObserved(null);return;}
   setPerm('granted');let res=await n.getTodayUsage();setObserved(res);
  }catch{setPerm('error');setObserved(null);}
 }
 useEffect(()=>{if(ready)refresh()},[ready,tab]);
 useEffect(()=>{const x=AppState.addEventListener('change',v=>{if(v==='active')refresh()});return()=>x.remove()},[]);
 function write(patch){setS(old=>({...old,...patch}));}
 function updateRule(name,change){setS(old=>({...old,rules:{...old.rules,[name]:{...old.rules[name],...change}}}));}
 function claim(id,points){const day=new Date().toLocaleDateString('en-CA');const claimKey=day+'-'+id;
  if(s.claims[claimKey]){Alert.alert('Already completed','You earned this XP earlier today.');return;}
  write({xp:s.xp+points,claims:{...s.claims,[claimKey]:true}});
  Alert.alert('A small win!','+'+points+' XP. Your earned XP stays yours.');
 }
 function simulate(){const today=new Date().toLocaleDateString('en-CA');const old=sim[selected]||{day:today,count:0};const count=old.day===today?old.count:0;const rule=s.rules[selected];
  if(!rule.enabled){Alert.alert('Rule disabled','Enable the rule to simulate opening attempts.');return;}
  if(count>=rule.opens){Alert.alert('Demo opening denied','Limit reached. This demo cannot block the real '+selected+' app.');return;}
  setSim(v=>({...v,[selected]:{day:today,count:count+1}}));Alert.alert('Demo opening allowed',String(rule.opens-count-1)+' simulated opening(s) remain.');
 }
 function usage(name){return observed&&Array.isArray(observed.rows)?observed.rows.find(x=>x.name===name):null;}
 const today=new Date().toLocaleDateString('en-CA');
 const dailyClaims=Object.keys(s.claims).filter(k=>k.startsWith(today)).length;
 const observedMins=observed?.rows?.reduce((n,r)=>n+(Number(r.minutes)||0),0)||0;
 if(!ready)return <SafeAreaView style={styles.onboard}><Text style={styles.onboardBrand}>JOY VIMO</Text></SafeAreaView>;
 if(!s.started)return <SafeAreaView style={styles.onboard}><StatusBar barStyle="light-content" backgroundColor="#26117B"/><ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:28}}>
  <Text style={styles.orb}>✦</Text><Text style={styles.onboardBrand}>JOY VIMO</Text><Text style={styles.onboardHead}>A calmer mind.{'\n'}A brighter you.</Text>
  <Text style={styles.onboardCopy}>Use your favorite apps more intentionally. Set boundaries, stay aware, and celebrate progress.</Text>
  <Panel style={{backgroundColor:'#4227A5',borderWidth:0}}><Text style={{color:'#fff',lineHeight:27}}>✧  Private screen-time goals{'\n'}✧  Daily challenges and positive rewards{'\n'}✧  Optional reminders and focus practices</Text></Panel>
  <Button onPress={()=>write({started:true})}>I'm 18+ · Get started →</Button><Text style={{color:'#DAD0FF',marginTop:14,textAlign:'center'}}>Android testing build only. Does not block other apps yet.</Text>
 </ScrollView></SafeAreaView>;
 return <SafeAreaView style={styles.page}><StatusBar barStyle="dark-content" backgroundColor={lavender}/>
 <View style={styles.header}><Text style={styles.brand}>JOY <Text style={{color:violet}}>VIMO ✦</Text></Text><Pressable accessibilityRole="button" onPress={()=>setTab('Settings')}><Text style={{fontSize:22}}>⚙</Text></Pressable></View>
 <ScrollView key={tab} contentContainerStyle={styles.content}>
 {tab==='Home'&&<>
  <Text style={styles.greeting}>Good morning! ☀️</Text><Sub>Make today count, at your own pace.</Sub>
  <Row><Panel style={{flex:1,alignItems:'center'}}><Text style={styles.big}>{Math.min(100,Math.round(100/(1+observedMins/180)))}</Text><Sub>Demo balance score</Sub></Panel><Panel style={{flex:1,alignItems:'center'}}><Text style={styles.big}>{s.xp}</Text><Sub>Permanent XP</Sub></Panel></Row>
  <Panel style={{backgroundColor:violet}}><Text style={{color:'#DACFFF',fontWeight:'700'}}>✦  FOCUS SHIELD</Text><Text style={styles.whiteTitle}>Make time for what matters</Text><Text style={{color:'#E6DFFF',marginBottom:15}}>Plan app budgets and monitor usage after granting permission.</Text><Button secondary onPress={()=>setTab('Shield')}>Open Focus Shield →</Button></Panel>
  <Title>Quick actions</Title><Row><Panel style={{flex:1}}><Text style={styles.featureEmoji}>🛡</Text><Text style={styles.featureTitle}>Set limits</Text><Button small secondary onPress={()=>setTab('Shield')}>Open</Button></Panel><Panel style={{flex:1}}><Text style={styles.featureEmoji}>🌿</Text><Text style={styles.featureTitle}>Quick reset</Text><Button small secondary onPress={()=>setTab('Reset')}>Open</Button></Panel></Row>
  <Panel><Title>Today's small win</Title><Sub>Choose one positive action. Rewards are private and never punished.</Sub><Button onPress={()=>claim('mindful',15)}>Complete mindful break · +15 XP</Button></Panel>
  <Text style={styles.note}>Usage stats are advisory. JOY VIMO does not enforce social-app limits yet.</Text>
 </>}
 {tab==='Shield'&&<>
  <Text style={styles.greeting}>Focus Shield 🛡</Text><Sub>Plan limits for the apps you already use.</Sub>
  <Panel><Title>Android Usage Access</Title>
   <Sub>{perm==='granted'?'Permission granted. Observed usage below is approximate.':perm==='unavailable'?'Native module unavailable in this build.':'Permission needed to read approximate usage.'}</Sub>
   {perm!=='granted'?<Button onPress={async()=>{try{await native.current?.openUsageSettings()}catch{Alert.alert('Open settings','Settings → Special app access → Usage access → JOY VIMO')}}}>Open Android Usage Settings</Button>:<Button secondary onPress={refresh}>Refresh device usage</Button>}
  </Panel>
  {APPS.map(n=>{const r=s.rules[n],u=usage(n);return <Panel key={n}><Row><View style={{flex:1}}><Text style={styles.featureTitle}>{n}</Text><Sub>{u?'Observed today: '+u.minutes+' min · '+u.opens+' opens':'Usage not available'}</Sub></View><Switch value={r.enabled} onValueChange={v=>updateRule(n,{enabled:v})} trackColor={{true:'#AE91FF'}} thumbColor={violet}/></Row>
   <Row><View style={{flex:1}}><Text style={styles.note}>Daily budget</Text><Row>{[15,30,60].map(v=><Chip key={v} active={r.minutes===v} onPress={()=>updateRule(n,{minutes:v})}>{v}m</Chip>)}</Row></View></Row>
   <Text style={styles.note}>Allowed opens (simulation)</Text><Row>{[1,3,5].map(v=><Chip key={v} active={r.opens===v} onPress={()=>updateRule(n,{opens:v})}>{v}</Chip>)}</Row>
   {u&&r.enabled&&(u.minutes>r.minutes||u.opens>r.opens)?<Text style={styles.warning}>Goal exceeded · reminder only; real app is not blocked.</Text>:null}
  </Panel>})}
  <Panel><Title>Opening-limit simulator</Title><Row>{APPS.map(n=><Chip key={n} active={selected===n} onPress={()=>setSelected(n)}>{n==='Instagram'?'IG':n==='YouTube'?'YT':n==='Chrome'?'Web':'TikTok'}</Chip>)}</Row>
  <Sub>Try three demo opens. The 4th will be denied inside JOY VIMO only.</Sub><Button onPress={simulate}>Simulate {selected} open</Button>
  <Text style={styles.note}>Real app blocking and adult-site filtering are not implemented yet.</Text></Panel>
 </>}
 {tab==='Feed'&&<>
  <Text style={styles.greeting}>My Joy Feed ✨</Text><Sub>Finite, user-selected ideas. No autoplay.</Sub>
  <Row>{INTERESTS.slice(0,3).map(n=><Chip key={n} active={s.interests.includes(n)} onPress={()=>write({interests:s.interests.includes(n)?s.interests.filter(x=>x!==n):[...s.interests,n]})}>{n}</Chip>)}</Row>
  {INTERESTS.filter(n=>s.interests.includes(n)&&!feedHidden.includes(n)).map((n,i)=><Panel key={n}><View style={[styles.feedArt,{backgroundColor:['#E9E2FF','#DFFAF2','#FFE3EF','#FFF3CE'][i%4]}]}><Text style={{fontSize:55}}>{({Nature:'🏔️',Comedy:'😄',Animals:'🐕',Creativity:'🎨',Learning:'💡',Calm:'🪷'})[n]}</Text></View><Text style={styles.featureTitle}>{n}: A little joy today</Text><Sub>Sample editorial card. No third-party videos loaded.</Sub><Button secondary small onPress={()=>setFeedHidden(v=>[...v,n])}>Not interested</Button></Panel>)}
  <Button secondary onPress={()=>setFeedHidden([])}>Restore hidden demo cards</Button><Text style={styles.note}>JOY VIMO does not alter Instagram or TikTok recommendation algorithms.</Text>
 </>}
 {tab==='Progress'&&<>
  <Text style={styles.greeting}>Your Progress 🏆</Text><Sub>Real-life progress over screen time.</Sub>
  <Row><Panel style={{flex:1}}><Text style={styles.big}>{s.xp}</Text><Sub>Total XP</Sub></Panel><Panel style={{flex:1}}><Text style={styles.big}>{dailyClaims}</Text><Sub>Actions today</Sub></Panel></Row>
  <Panel><Title>Daily achievements</Title><Sub>Finish positive actions once per day. No XP deductions for missed goals.</Sub><Button onPress={()=>claim('offline',20)}>I took an offline break · +20 XP</Button><Button secondary onPress={()=>claim('plan',10)}>I reviewed my goals · +10 XP</Button></Panel>
  <Panel><Title>Weekly leaderboard</Title><Sub>Not live yet. Your sensitive habits will never appear in public rankings.</Sub><Row><Text style={styles.featureTitle}>Public competition</Text><Switch value={s.leaderboard} onValueChange={v=>write({leaderboard:v})}/></Row><Text style={styles.note}>{s.leaderboard?'Preference saved locally; no account or live leaderboard is connected.':'Disabled by default. Choose privacy first.'}</Text></Panel>
 </>}
 {tab==='Reset'&&<>
  <Text style={styles.greeting}>Breathe. Focus. Reset.</Text><Sub>A moment to choose your next action.</Sub>
  <Panel style={{alignItems:'center',paddingVertical:40}}><Text style={styles.resetCircle}>✦</Text><Text style={styles.big}>{reset}s</Text><Sub>Inhale slowly · Exhale gently</Sub></Panel>
  <Button onPress={()=>{setRunning(v=>!v);if(reset===0)setReset(30)}}>{running?'Pause breathing':reset===0?'Start again':'Start / Continue'}</Button>
  <Button secondary onPress={()=>{setRunning(false);setReset(30);claim('reset',15)}}>Finish & log a mindful reset · +15 XP</Button>
  <Panel><Title>When you feel an urge</Title><Sub>Notice it without judgment. Change your environment, take a short walk, message a friend, or return to what matters to you.</Sub></Panel>
 </>}
 {tab==='Settings'&&<>
  <Text style={styles.greeting}>Settings & Privacy</Text><Panel><Title>Local-first experience</Title><Sub>Current progress stays on this phone in local AsyncStorage. This test build does not upload intimate habits, browsing history, or content.</Sub></Panel>
  <Panel><Title>Android protection status</Title><Sub>Usage measurement: {perm==='granted'?'permission enabled':perm}</Sub><Sub>Actual app blocking: not implemented</Sub><Sub>Website filtering: not implemented</Sub><Sub>Global leaderboard: not implemented</Sub></Panel>
  <Panel><Title>Your data</Title><Button secondary onPress={()=>Alert.alert('Erase local data?','Delete local settings, progress, demo events and preferences?',[
    {text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{await AsyncStorage.removeItem(key);setS(INIT);setTab('Home');setSim({});setFeedHidden([]);}}
   ])}>Erase local data</Button></Panel><Text style={styles.note}>This is an internal Android QA build. Do not interpret its metrics as medical advice.</Text>
 </>}
 </ScrollView>
 <View style={styles.tabs}>{[['Home','⌂'],['Shield','🛡'],['Feed','✦'],['Progress','▥'],['Reset','◉']].map(([name,icon])=><Pressable key={name} accessibilityRole="tab" accessibilityState={{selected:tab===name}} onPress={()=>setTab(name)} style={styles.tab}><Text style={{fontSize:22,color:tab===name?violet:'#AAA6C6'}}>{icon}</Text><Text style={[styles.tabText,tab===name&&{color:violet}]}>{name}</Text></Pressable>)}</View>
 </SafeAreaView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:lavender},header:{padding:17,paddingHorizontal:22,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},brand:{fontSize:23,fontWeight:'900',color:navy},content:{padding:18,paddingBottom:36,gap:13},
 greeting:{fontSize:27,fontWeight:'900',color:navy},sub:{color:muted,fontSize:13,lineHeight:21,marginTop:4},title:{fontSize:18,fontWeight:'800',color:navy,marginBottom:7},
 panel:{backgroundColor:light,padding:17,borderRadius:20,gap:8,borderWidth:1,borderColor:'#EAE5FF',marginTop:4},
 row:{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'},
 big:{fontSize:33,color:violet,fontWeight:'900'},whiteTitle:{color:light,fontSize:21,fontWeight:'900'},
 btn:{marginTop:12,borderRadius:16,backgroundColor:violet,paddingVertical:15,paddingHorizontal:16,alignItems:'center'},
 btnSecondary:{backgroundColor:'#EFE9FF',borderColor:'#E4D7FF',borderWidth:1},
 btnText:{fontSize:14,fontWeight:'800',color:light},chip:{paddingHorizontal:12,paddingVertical:10,borderRadius:30,backgroundColor:'#EEE9FA',marginRight:2,marginVertical:3},
 chipTxt:{color:navy,fontWeight:'700',fontSize:12},featureTitle:{color:navy,fontSize:17,fontWeight:'800'},
 featureEmoji:{fontSize:28},note:{color:muted,fontSize:12,lineHeight:19,marginTop:5},
 warning:{color:'#B24A57',fontSize:12,fontWeight:'700'},feedArt:{height:155,borderRadius:17,justifyContent:'center',alignItems:'center'},
 tabs:{flexDirection:'row',justifyContent:'space-around',backgroundColor:'#fff',paddingVertical:12,borderTopColor:'#E6E2F7',borderTopWidth:1},
 tab:{flex:1,alignItems:'center'},tabText:{fontSize:10,fontWeight:'700',color:muted,marginTop:3},
 onboard:{flex:1,backgroundColor:'#251174'},onboardBrand:{fontWeight:'900',color:'#fff',fontSize:38,textAlign:'center'},
 orb:{fontSize:92,color:'#F6D25C',textAlign:'center',marginBottom:10},
 onboardHead:{fontSize:37,fontWeight:'900',color:light,textAlign:'center',marginVertical:20},
 onboardCopy:{color:'#E0D8FF',textAlign:'center',fontSize:16,lineHeight:25,marginBottom:20},
 resetCircle:{height:180,width:180,borderRadius:100,borderWidth:20,borderColor:'#BD7AFF',alignItems:'center',justifyContent:'center',textAlign:'center',textAlignVertical:'center',fontSize:58,color:violet}
});
