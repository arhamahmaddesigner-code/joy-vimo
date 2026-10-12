import React,{useEffect,useState} from 'react';
import {Alert,Pressable,Text,TextInput,View,StyleSheet,ActivityIndicator} from 'react-native';
import {configured,joySupabase as db} from '../lib/joySupabase';
const V='#6737F5',D='#21134C',M='#706B87';
export default function AdultLeaderboard({age}){
 const [session,setSession]=useState(null),[email,setEmail]=useState(''),[busy,setBusy]=useState(false),
 [country,setCountry]=useState('PK'),[rows,setRows]=useState([]),[member,setMember]=useState(false);
 const adult=age==='adult';
 async function refresh(){
  if(!db)return;
  const {data:{session:s}}=await db.auth.getSession();setSession(s);
  if(s){
   const [{data:profile},{data:rankings}]=await Promise.all([
    db.from('joy_public_profiles').select('visible').eq('user_id',s.user.id).maybeSingle(),
    db.rpc('joy_weekly_leaderboard',{p_country:null})
   ]);
   setMember(!!profile?.visible);setRows(rankings||[]);
  }else{setRows([]);setMember(false)}
 }
 useEffect(()=>{refresh().catch(()=>{});if(!db)return;
  const {data:auth}=db.auth.onAuthStateChange(()=>{refresh().catch(()=>{})});
  return()=>auth.subscription.unsubscribe()},[]);
 async function execute(task){setBusy(true);try{await task();await refresh()}catch(e){Alert.alert('Could not complete',e.message||'Try again later')}finally{setBusy(false)}}
 async function signin(){if(!email.includes('@')){Alert.alert('Email required','Enter a valid email to receive a sign-in link.');return;}
  execute(async()=>{const {error}=await db.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:true}});if(error)throw error;Alert.alert('Check your email','Use your private login link. JOY VIMO never asks you to share a password.')})}
 async function rpc(name,args={}){const {error}=await db.rpc(name,args);if(error)throw error}
 if(!adult)return <View style={s.card}><Text style={s.title}>Private mode</Text><Text style={s.description}>Public leaderboards are unavailable for minors. Your positive progress remains on your device.</Text></View>;
 if(!configured)return <View style={s.card}><Text style={s.title}>Community leaderboard is not connected yet</Text><Text style={s.description}>Dedicated JOY VIMO backend configuration is pending. Your private offline challenges continue to work. No data is sent to ORYX Development.</Text></View>;
 return <View style={s.card}>
 <Text style={s.title}>Opt-in positive-action leaderboard</Text><Text style={s.description}>Adults only. Shares a random alias, optional country and capped positive-action scores. Never shares pornography history, screen contents or sensitive struggles. Scores are self-reported, not proof of recovery.</Text>
 {!session?<><TextInput style={s.input} placeholder="Email address" accessibilityLabel="Email login address" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
 <Pressable accessibilityRole="button" disabled={busy} onPress={signin} style={s.button}><Text style={s.white}>Email me a sign-in link</Text></Pressable></>:
 <><Text style={s.description}>Signed in privately.</Text>
 {!member?<><TextInput style={s.input} placeholder="Country, e.g. PK" maxLength={2} autoCapitalize="characters" value={country} onChangeText={setCountry}/>
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>Alert.alert('Adult-only public challenge',
 'Your random alias, country and capped positive-action points will be shown on the leaderboard. Only opt in if you are at least 18. This is not a measure of medical recovery.',
 [{text:'Cancel',style:'cancel'},{text:'I am 18+ and opt in',onPress:()=>execute(()=>rpc('joy_join_leaderboard',{p_country:country.toUpperCase()}))}])} style={s.button}><Text style={s.white}>Join voluntarily</Text></Pressable></>:
 <><Text style={s.section}>This week's public positive actions</Text>
 {rows.length?rows.map((r,i)=><View key={r.alias+'-'+i} style={s.row}><Text style={{color:D,fontWeight:'700',flex:1}}>{r.rank}. {r.alias} · {r.country}</Text><Text style={{color:V,fontWeight:'800'}}>{r.points} pts</Text></View>):<Text style={s.description}>No participants yet.</Text>}
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>execute(()=>rpc('joy_leave_leaderboard'))} style={s.secondary}><Text style={s.link}>Leave public rankings</Text></Pressable></>}
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>Alert.alert('Delete leaderboard data?','Delete your public profile and positive-action records from JOY VIMO’s dedicated database.',[{text:'Cancel',style:'cancel'},{text:'Delete my data',style:'destructive',onPress:()=>execute(()=>rpc('joy_delete_leaderboard_data'))}])} style={s.secondary}><Text style={s.link}>Delete my leaderboard data</Text></Pressable>
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>execute(()=>db.auth.signOut())} style={s.secondary}><Text style={s.link}>Sign out</Text></Pressable></>}
 {busy?<ActivityIndicator color={V} style={{marginTop:10}}/>:null}
 </View>;
}
const s=StyleSheet.create({card:{padding:18,borderRadius:20,backgroundColor:'#fff',marginTop:14},title:{fontSize:19,fontWeight:'800',color:D},description:{fontSize:13,color:M,lineHeight:21,marginTop:10},input:{backgroundColor:'#F2EEFA',borderRadius:10,padding:13,marginTop:14,color:D},button:{backgroundColor:V,borderRadius:12,padding:15,alignItems:'center',marginTop:14},white:{color:'#fff',fontWeight:'800'},section:{fontSize:16,color:D,fontWeight:'800',marginTop:18},row:{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#EEE8FA'},secondary:{padding:14,alignItems:'center'},link:{color:V,fontWeight:'800'}});
