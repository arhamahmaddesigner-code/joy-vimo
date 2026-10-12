import React,{useEffect,useState} from 'react';
import {Alert,AppState,Pressable,StyleSheet,Text,View} from 'react-native';
const HOST='family.cloudflare-dns.com';
export default function FamilyDnsGuide({nativeModule}){
 const [status,setStatus]=useState(null);
 const refresh=()=>{try{setStatus(nativeModule?.getPrivateDnsSummary?.()||null)}catch{setStatus(null)}};
 useEffect(()=>{refresh();const sub=AppState.addEventListener('change',s=>{if(s==='active')refresh()});return()=>sub.remove()},[nativeModule]);
 const open=async()=>{try{await nativeModule?.openNetworkSettings?.()}catch{Alert.alert('Settings','Open Android Settings and search for Private DNS.')}};
 return <View style={s.card}>
 <Text style={s.heading}>Family DNS · optional</Text>
 <Text style={s.note}>Android Private DNS can filter many known adult-content and malware domains. It does not filter individual Instagram/TikTok videos and cannot guarantee that all unwanted content is blocked.</Text>
 <Text style={s.label}>DNS hostname</Text>
 <Text selectable style={s.host}>{HOST}</Text>
 <Text style={s.note}>On Realme C71: Settings → search “Private DNS” → Private DNS provider hostname → enter the hostname above → Save. A VPN or other DNS service may override this setting.</Text>
 <Text style={s.status}>Device setting: {status?.familySelected?'Family DNS hostname selected':status?.host?'Configured for '+status.host:'Not confirmed'}</Text>
 <Text style={s.note}>This reads the device's configured DNS hostname only. It does not check whether every domain request was successfully filtered.</Text>
 <Pressable accessibilityRole="button" onPress={open} style={s.button}><Text style={s.buttonText}>Open Android Network Settings</Text></Pressable>
 <Pressable accessibilityRole="button" onPress={refresh} style={s.secondary}><Text style={s.secondaryText}>Refresh setup status</Text></Pressable>
 </View>;
}
const s=StyleSheet.create({card:{backgroundColor:'#F0EBFF',borderRadius:20,padding:18,marginTop:15},heading:{fontSize:18,fontWeight:'800',color:'#21134C'},note:{color:'#716C8A',fontSize:13,lineHeight:21,marginTop:10},label:{fontWeight:'800',color:'#21134C',marginTop:14},host:{paddingVertical:13,paddingHorizontal:12,backgroundColor:'white',borderRadius:10,fontWeight:'800',color:'#6737F5',marginTop:8},status:{marginTop:13,fontWeight:'800',color:'#4F388E',fontSize:13},button:{backgroundColor:'#6737F5',padding:15,borderRadius:14,alignItems:'center',marginTop:15},buttonText:{color:'white',fontWeight:'800'},secondary:{backgroundColor:'#DFD5FA',padding:14,borderRadius:14,alignItems:'center',marginTop:9},secondaryText:{color:'#6737F5',fontWeight:'800'}});
