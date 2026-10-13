import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const URL=process.env.EXPO_PUBLIC_JOY_SUPABASE_URL||'https://hhrpwnsyfrdcrnusahkd.supabase.co';
const KEY=process.env.EXPO_PUBLIC_JOY_SUPABASE_ANON_KEY||'sb_publishable_iwEQfrh-dk_DT6SAXiBG-g_OXqSsK6o';
export const configured=URL.startsWith('https://')&&KEY.length>20;
const AUTH_STORAGE_KEY='joy-vimo-auth-token';
const adapter={
 getItem:async key=>SecureStore.getItemAsync(key),
 setItem:async(key,value)=>SecureStore.setItemAsync(key,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY}),
 removeItem:async key=>SecureStore.deleteItemAsync(key)
};
export const joySupabase=configured?createClient(URL,KEY,{
 auth:{storage:adapter,storageKey:AUTH_STORAGE_KEY,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false,flowType:'pkce'},
 global:{headers:{'X-Client-Info':'joy-vimo-private-android'}}
}):null;
// Only publishable/anon client keys allowed. Never bundle service_role secrets.
export function safelyConfigured(){return !!joySupabase}

// Private "erase device data" must also clear the encrypted auth session.
// This does not delete server records; the online account has a separate Delete action.
export async function eraseLocalAuth(){
  try{await joySupabase?.auth.signOut({scope:'local'});}catch{}
  // Always attempt a device-only token deletion, even if network sign-out fails.
  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}
