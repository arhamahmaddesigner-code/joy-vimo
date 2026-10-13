import React,{useEffect,useState} from 'react';
import {Alert,Pressable,Text,TextInput,View,StyleSheet,ActivityIndicator} from 'react-native';
import {configured,joySupabase as db} from '../lib/joySupabase';
const V='#6737F5',D='#21134C',M='#706B87';
export default function AdultLeaderboard({age}){
 const [session,setSession]=useState(null),[email,setEmail]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),
 [country,setCountry]=useState('PK'),[scope,setScope]=useState('global'),[rows,setRows]=useState([]),[member,setMember]=useState(false),[loadError,setLoadError]=useState('');
 const adult=age==='adult';
 async function refresh(){
  if(!db)return;
  const {data:{session:s},error:sessionError}=await db.auth.getSession();if(sessionError)throw sessionError;setSession(s);
  if(s){
   const {data:profile,error:profileError}=await db.from('joy_public_profiles').select('visible').eq('user_id',s.user.id).maybeSingle();
   if(profileError)throw profileError;
   setMember(!!profile?.visible);
   if(profile?.visible)await getRankings();else{setRows([]);setLoadError('');}
  }else{setRows([]);setMember(false)}
 }
 async function getRankings(which=scope,region=country){
  if(!db)return;
  const code=region.trim().toUpperCase();
  if(which==='country'&&!/^[A-Z]{2}$/.test(code)){setLoadError('Enter a valid two-letter country code.');return;}
  const {data,error}=await db.rpc('joy_weekly_leaderboard',{p_country:which==='country'?code:null});
  if(error){setLoadError('Unable to load rankings: '+error.message);setRows([]);return;}
  setLoadError('');setRows(data||[]);
 }
 useEffect(()=>{refresh().catch(()=>setLoadError('Could not load your account.'));if(!db)return;
  // Supabase auth callbacks must not synchronously await other Supabase calls.
  const {data:auth}=db.auth.onAuthStateChange(()=>{setTimeout(()=>refresh().catch(()=>{}),0)});
  return()=>auth.subscription.unsubscribe();
 },[]);
 useEffect(()=>{if(session&&member)getRankings().catch(()=>setLoadError('Unable to load rankings.'))},[scope,country,member,session?.user?.id]);
 async function execute(task){setBusy(true);try{await task();await refresh()}catch(e){Alert.alert('Could not complete',e.message||'Try again later')}finally{setBusy(false)}}
 async function signin(){if(!email.includes('@')){Alert.alert('Email required','Enter a valid email to receive a sign-in link.');return;}
  execute(async()=>{const {error}=await db.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:true}});if(error)throw error;Alert.alert('Check your email','Enter the one-time email verification code below. JOY VIMO never asks you to share a password.')})}
 async function verify(){execute(async()=>{const {error}=await db.auth.verifyOtp({email:email.trim(),token:code.trim(),type:'email'});if(error)throw error;setCode('')})}
 async function rpc(name,args={}){const {error}=await db.rpc(name,args);if(error)throw error}
 if(!adult)return <View style={s.card}><Text style={s.title}>Private mode</Text><Text style={s.description}>Public leaderboards are unavailable for minors. Your positive progress remains on your device.</Text></View>;
 if(!configured)return <View style={s.card}><Text style={s.title}>Community leaderboard is not connected yet</Text><Text style={s.description}>Dedicated JOY VIMO backend configuration is pending. Your private offline challenges continue to work. No data is sent to ORYX Development.</Text></View>;
 return <View style={s.card}>
 <Text style={s.title}>Opt-in positive-action leaderboard</Text><Text style={s.description}>Adults only. Shares a random alias, optional country and capped positive-action scores. Never shares pornography history, screen contents or sensitive struggles. Scores are self-reported, not proof of recovery.</Text>
 {!session?<><TextInput style={s.input} placeholder="Email address" accessibilityLabel="Email login address" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
 <Pressable accessibilityRole="button" disabled={busy} onPress={signin} style={s.button}><Text style={s.white}>Email me a login code</Text></Pressable><TextInput style={s.input} placeholder="Email verification code" keyboardType="number-pad" autoCapitalize="none" value={code} onChangeText={setCode}/><Pressable accessibilityRole="button" disabled={busy||!code.trim()} onPress={verify} style={s.button}><Text style={s.white}>Verify email code</Text></Pressable></>:
 <><Text style={s.description}>Signed in privately.</Text>
 {!member?<><TextInput style={s.input} placeholder="Country, e.g. PK" maxLength={2} autoCapitalize="characters" value={country} onChangeText={setCountry}/>
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>Alert.alert('Adult-only public challenge',
 'Your random alias, country and capped positive-action points will be shown on the leaderboard. Only opt in if you are at least 18. This is not a measure of medical recovery.',
 [{text:'Cancel',style:'cancel'},{text:'I am 18+ and opt in',onPress:()=>execute(()=>rpc('joy_join_leaderboard',{p_country:country.toUpperCase()}))}])} style={s.button}><Text style={s.white}>Join voluntarily</Text></Pressable></>:
 <><Text style={s.section}>This week's positive actions</Text>
 <View style={{flexDirection:'row',gap:8,marginTop:13}}>{[['global','Global'],['country','Country']].map(([v,label])=><Pressable key={v} accessibilityRole="button" onPress={()=>setScope(v)} style={[s.secondary,{flex:1,backgroundColor:scope===v?'#6737F5':'#F1EBFC',borderRadius:12,paddingVertical:11}]}><Text style={{color:scope===v?'white':V,fontWeight:'800'}}>{label}</Text></Pressable>)}</View>
 {scope==='country'?<TextInput style={s.input} placeholder="Country code, e.g. PK" maxLength={2} autoCapitalize="characters" value={country} onChangeText={setCountry}/>:null}
 {loadError?<Text style={[s.description,{color:'#AC3355'}]}>{loadError}</Text>:null}
 {rows.length?rows.map((r,i)=><View key={r.alias+'-'+i} style={s.row}><Text style={{color:D,fontWeight:'700',flex:1}}>{r.rank}. {r.alias} · {r.country}</Text><Text style={{color:V,fontWeight:'800'}}>{r.points} pts</Text></View>):<Text style={s.description}>No participants yet.</Text>}
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>execute(()=>rpc('joy_leave_leaderboard'))} style={s.secondary}><Text style={s.link}>Leave public rankings</Text></Pressable></>}
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>Alert.alert('Delete leaderboard data?','Delete your public profile and positive-action records from JOY VIMO’s dedicated database.',[{text:'Cancel',style:'cancel'},{text:'Delete my data',style:'destructive',onPress:()=>execute(()=>rpc('joy_delete_leaderboard_data'))}])} style={s.secondary}><Text style={s.link}>Delete my leaderboard data</Text></Pressable>
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>execute(()=>db.auth.signOut())} style={s.secondary}><Text style={s.link}>Sign out</Text></Pressable></>}
 {busy?<ActivityIndicator color={V} style={{marginTop:10}}/>:null}
 </View>;
}
const s=StyleSheet.create({card:{padding:18,borderRadius:20,backgroundColor:'#fff',marginTop:14},title:{fontSize:19,fontWeight:'800',color:D},description:{fontSize:13,color:M,lineHeight:21,marginTop:10},input:{backgroundColor:'#F2EEFA',borderRadius:10,padding:13,marginTop:14,color:D},button:{backgroundColor:V,borderRadius:12,padding:15,alignItems:'center',marginTop:14},white:{color:'#fff',fontWeight:'800'},section:{fontSize:16,color:D,fontWeight:'800',marginTop:18},row:{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#EEE8FA'},secondary:{padding:14,alignItems:'center'},link:{color:V,fontWeight:'800'}});
