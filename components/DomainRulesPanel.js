import React,{useState} from 'react';
import {Alert,Pressable,StyleSheet,Switch,Text,TextInput,View} from 'react-native';
import {addDomain,removeDomain} from '../lib/domainRules';
const V='#6737F5',D='#21134C',M='#716C8A';
export default function DomainRulesPanel({age,enabled,onEnabledChange,domains,onDomainsChange}){
 const [value,setValue]=useState('');
 const add=()=>{
  const next=addDomain(domains,value);
  if(!next.ok){Alert.alert('Check domain',next.reason);return;}
  onDomainsChange(next.domains);setValue('');
 };
 const consent=next=>{
  if(!next){onEnabledChange(false);return;}
  Alert.alert('Chrome website blocking · optional',
    'JOY VIMO will briefly read the currently visited Chrome address bar to compare its domain with your private list. The app does not store full URLs or browsing history, but Android Accessibility permission grants access to interface content. Blocked-site detection may be imperfect. You can turn this off at any time.',
    [{text:'Cancel',style:'cancel'},{text:'I agree',onPress:()=>onEnabledChange(true)}]);
 };
 return <View style={st.card}>
  <Text style={st.heading}>Custom websites · experimental</Text>
  <Text style={st.info}>Add domain names without https:// or paths. Only the currently visible Chrome address bar is checked. No history or URLs are saved. Chrome support only; this is not system-wide protection.</Text>
  <View style={st.row}><View style={{flex:1}}>
   <Text style={st.title}>Enable my website list</Text>
   <Text style={st.infoSmall}>Separate, revocable consent. Requires Focus Shield + Android Accessibility.</Text>
   </View><Switch disabled={age==='kid'} value={enabled&&age!=='kid'} onValueChange={consent}/></View>
  <View style={st.row}>
   <TextInput accessibilityLabel="Website domain" value={value} onChangeText={setValue} placeholder="example.com" autoCapitalize="none" autoCorrect={false} maxLength={253} style={st.input}/>
   <Pressable accessibilityRole="button" onPress={add} style={st.add}><Text style={{color:'white',fontWeight:'800'}}>Add</Text></Pressable>
  </View>
  {domains.length===0?<Text style={st.infoSmall}>No custom domains listed yet.</Text>:domains.map(domain=><View key={domain} style={st.domainRow}><Text selectable style={{flex:1,color:D,fontWeight:'700'}}>{domain}</Text><Pressable accessibilityRole="button" accessibilityLabel={'Remove '+domain} onPress={()=>onDomainsChange(removeDomain(domains,domain))}><Text style={{color:'#A73757',fontWeight:'800'}}>Remove</Text></Pressable></View>)}
  <Text style={st.infoSmall}>This list only blocks domains you enter. Private DNS can separately filter many known adult domains, but no filter is 100% reliable. To stop all native protection, turn off Focus Shield in Apps.</Text>
 </View>;
}
const st=StyleSheet.create({card:{backgroundColor:'#F2ECFF',padding:17,borderRadius:19,marginTop:14},heading:{fontSize:18,fontWeight:'800',color:D},info:{fontSize:13,color:M,lineHeight:20,marginTop:10},infoSmall:{fontSize:12,color:M,lineHeight:19,marginTop:7},title:{fontSize:14,fontWeight:'800',color:D},row:{flexDirection:'row',alignItems:'center',gap:10,marginTop:15},input:{backgroundColor:'white',borderColor:'#DDD5F8',borderWidth:1,borderRadius:11,paddingHorizontal:12,minHeight:48,flex:1,color:D},add:{backgroundColor:V,borderRadius:12,paddingHorizontal:16,minHeight:48,alignItems:'center',justifyContent:'center'},domainRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#DDD5F8'}});
