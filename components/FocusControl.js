import React,{useCallback,useEffect,useState} from 'react';
import {Alert,AppState,Pressable,StyleSheet,Switch,Text,View} from 'react-native';

const accent='#6737F5',ink='#21134C',muted='#716C8A';
const disclosure='Optional Android Accessibility is a powerful permission. JOY VIMO observes selected app openings and, only with separate opt-ins, checks YouTube/Instagram/TikTok screen resource IDs or temporarily reads the Chrome address-bar hostname for your custom domain rules. The app does not save full URLs, browsing history, messages, passwords, screen text from social feeds, or video frames. It may interrupt a selected app after its configured limit. Android can grant broader UI access than these implemented checks use. You can turn protection off, revoke consent, or use the emergency safety pause at any time.'

export default function FocusControl({nativeModule,age,rules,schedules,domainRulesEnabled=false,domains=[]}) {
  const [consent,setConsent]=useState(false);
  const [enabled,setEnabled]=useState(false);
  const [shorts,setShorts]=useState(false);
  const [status,setStatus]=useState(null);
  const [busy,setBusy]=useState(false);
  const allowed=age==='adult'||age==='teen';
  const refresh=useCallback(()=>{
    try {
      const response=nativeModule?.getFocusStatus?.();
      if(response){
        setStatus(response);
        setConsent(!!response.optedIn);
        setEnabled(!!response.enforcing);
        setShorts(!!response.youtubeShorts);
      }
    }catch(error){setStatus(null);}
  },[nativeModule]);
  useEffect(()=>{refresh()},[refresh,age]);
  useEffect(()=>{
    const subscription=AppState.addEventListener('change',value=>{if(value==='active')refresh()});
    return()=>subscription.remove();
  },[refresh]);
  async function save(nextConsent,nextEnabled,nextShorts=shorts){
    if(!allowed||!nativeModule?.setFocusConfig)return;
    setBusy(true);
    try{
      await nativeModule.setFocusConfig(JSON.stringify({
        age,consented:nextConsent,enforcing:nextConsent&&nextEnabled,rules,schedules,youtubeShorts:nextConsent&&nextEnabled&&nextShorts,instagramReels:nextConsent&&nextEnabled&&!!status?.instagramReels,tiktokFeed:nextConsent&&nextEnabled&&!!status?.tiktokFeed,domainRulesEnabled,domains
      }));
      refresh();
    }catch(error){Alert.alert('Cannot update Focus Shield','Please try again.');}
    finally{setBusy(false);}
  }
  // Native rule/schedule synchronization is owned by AppMain, which debounces
  // settings changes. Keep only explicit permission/consent switch writes here
  // to avoid racing an older configuration against a newer one.
  async function askConsent(){
    if(consent){await save(false,false);return;}
    Alert.alert('Optional Android Accessibility permission',disclosure,[
      {text:'Not now',style:'cancel'},
      {text:'I understand and opt in',onPress:()=>save(true,false)}
    ]);
  }
  function toggleEnforcement(next){
    if(!next){save(consent,false);return;}
    if(!status?.serviceEnabled){
      Alert.alert('Enable Android permission first','Open Android Accessibility settings and enable JOY VIMO Focus Shield. Return here to activate it.',[
        {text:'Cancel',style:'cancel'},
        {text:'Open settings',onPress:openSettings}
      ]);
      return;
    }
    Alert.alert('Start experimental protection?','Only selected apps with enabled goals are affected. A limit may return you to Home. You can always switch this off here.',[
      {text:'Cancel',style:'cancel'},
      {text:'Start protection',onPress:()=>save(true,true)}
    ]);
  }
  async function openSettings(){
    try{await nativeModule?.openAccessibilitySettings?.();}
    catch(error){Alert.alert('Open device settings','Settings → Accessibility → Installed Apps → JOY VIMO Focus Shield');}
  }
  return <View style={styles.card}>
    <Text style={styles.heading}>Real Focus Shield · experimental</Text>
    <Text style={styles.description}>{disclosure}</Text>
    {!allowed?<Text style={styles.warning}>Under-13 parent-supported mode: device enforcement is not enabled in this QA version.</Text>:null}
    {allowed&&!nativeModule?<Text style={styles.warning}>Native service is unavailable in this installation.</Text>:null}
    {allowed&&nativeModule?<React.Fragment>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>I understand and opt in</Text>
          <Text style={styles.hint}>Off by default. Revocable any time.</Text>
        </View>
        <Switch disabled={busy} accessibilityLabel="Consent to Focus Shield" value={consent} onValueChange={askConsent}/>
      </View>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>Enforce my selected rules</Text>
          <Text style={styles.hint}>Requires consent and Android permission.</Text>
        </View>
        <Switch disabled={busy||!consent} accessibilityLabel="Enable Focus Shield enforcement" value={enabled} onValueChange={toggleEnforcement}/>
      </View>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>Interrupt YouTube Shorts (experimental)</Text>
          <Text style={styles.hint}>Separately optional; examines YouTube player view IDs only. Detection may fail after YouTube updates.</Text>
        </View>
        <Switch disabled={busy||!consent||!enabled} accessibilityLabel="Enable YouTube Shorts detection" value={shorts} onValueChange={v=>{
          if(!v){save(consent,enabled,false);return;}
          Alert.alert('Additional Accessibility capability','To identify a YouTube Shorts player, JOY VIMO must inspect YouTube accessibility view resource IDs. If you enable website rules separately, JOY VIMO temporarily reads the Chrome address bar to compare domains, without storing URL history. It does not read messages, video frames or other browsing content. Continue?',[
            {text:'Cancel',style:'cancel'},
            {text:'Enable',onPress:()=>save(consent,enabled,true)}
          ]);
        }}/>
      </View>
      <Text style={[styles.status,{color:status?.serviceEnabled?'#12866F':'#A36724'}]}>
        Android Accessibility: {status?.serviceEnabled?'Enabled':'Not enabled'}
      </Text>
      <Text style={styles.status}>Service heartbeat: {status?.serviceHealthy?'Healthy recently':status?.serviceEnabled?'Not responding recently — check battery settings':'Service disabled'}</Text>
      <Text style={styles.status}>Battery optimization: {status?.batteryOptimizationIgnored?'Unrestricted':'May restrict background reliability'}</Text>
      <Pressable accessibilityRole="button" onPress={async()=>{try{await nativeModule?.openBatteryOptimizationSettings?.()}catch{Alert.alert('Battery settings','Open Android Settings and search for Battery Optimization, then review JOY VIMO.')}}} style={styles.secondary}>
        <Text style={styles.secondaryText}>Review Android battery restrictions</Text>
      </Pressable>
      <Text style={styles.status}>Rule enforcement: {enabled&&status?.serviceEnabled?'On (experimental)':'Off'}</Text>
      {status?.lastBlockedApp?<Text style={styles.status}>Last redirected app: {status.lastBlockedApp} ({status.lastReason||'configured limit'})</Text>:null}
      <Pressable accessibilityRole="button" onPress={openSettings} style={styles.button}>
        <Text style={styles.buttonText}>Open Android Accessibility settings</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={()=>{
        Alert.alert('Pause protection for 15 minutes?',
          'This is an always-available safety bypass. Your personal rules stay saved and resume automatically.',
          [{text:'Cancel',style:'cancel'},{text:'Pause 15 minutes',onPress:async()=>{
            try{await nativeModule?.pauseFocusSafely?.(15);refresh();}
            catch{Alert.alert('Unable to pause','Disable Focus Shield using the switch or Android Accessibility settings.')}
          }}]);
      }} style={styles.secondary}><Text style={styles.secondaryText}>Safety pause · 15 minutes</Text></Pressable>
      {status?.safetyPauseUntil>Date.now()?<Text style={styles.status}>Safety pause active until {new Date(status.safetyPauseUntil).toLocaleTimeString()}</Text>:null}
      <Pressable accessibilityRole="button" onPress={()=>{
        Alert.alert('Commit to current focus rules for 30 minutes?',
         'Strict Mode temporarily prevents changing your saved limits and schedules. It will not block emergency safety pause, turning off protection, or revoking Android permission.',
         [{text:'Cancel',style:'cancel'},{text:'Start 30-minute commitment',onPress:async()=>{
           try{await nativeModule?.startStrictMode?.(30);refresh();}
           catch{Alert.alert('Unavailable','Enable Focus Shield first, then try again.')}
         }}]);
      }} style={styles.secondary}><Text style={styles.secondaryText}>Start voluntary Strict Mode · 30 minutes</Text></Pressable>
      {status?.strictUntil>Date.now()?<Text style={styles.status}>Commitment ends at {new Date(status.strictUntil).toLocaleTimeString()}. Emergency pause remains available.</Text>:null}
      <Pressable accessibilityRole="button" onPress={refresh} style={styles.secondary}>
        <Text style={styles.secondaryText}>Refresh permission status</Text>
      </Pressable>
      {(consent||enabled)?<Pressable accessibilityRole="button" onPress={()=>save(false,false)} style={styles.stop}>
        <Text style={styles.stopText}>Stop and revoke in-app consent</Text>
      </Pressable>:null}
    </React.Fragment>:null}
  </View>;
}
const styles=StyleSheet.create({
  card:{backgroundColor:'#EDFBF7',borderRadius:20,padding:17,marginTop:13},
  heading:{color:ink,fontSize:18,fontWeight:'800'},
  description:{color:muted,fontSize:13,lineHeight:21,marginTop:10},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:18,gap:12},
  copy:{flex:1},
  label:{color:ink,fontSize:14,fontWeight:'800'},
  hint:{color:muted,fontSize:12,lineHeight:18,marginTop:5},
  status:{fontSize:12,fontWeight:'700',marginTop:11,color:muted},
  button:{backgroundColor:accent,padding:14,borderRadius:14,marginTop:15,alignItems:'center'},
  buttonText:{color:'white',fontWeight:'800'},
  secondary:{backgroundColor:'#DFD7F7',padding:14,borderRadius:14,marginTop:9,alignItems:'center'},
  secondaryText:{color:accent,fontWeight:'800'},
  stop:{padding:12,marginTop:9,alignItems:'center'},
  stopText:{color:'#A53658',fontWeight:'800'},
  warning:{color:'#A05557',marginTop:11,lineHeight:19}
});