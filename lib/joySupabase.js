import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const URL=process.env.EXPO_PUBLIC_JOY_SUPABASE_URL||'';
const KEY=process.env.EXPO_PUBLIC_JOY_SUPABASE_ANON_KEY||'';
export const configured=URL.startsWith('https://')&&KEY.length>20;
const adapter={
 getItem:async key=>SecureStore.getItemAsync(key),
 setItem:async(key,value)=>SecureStore.setItemAsync(key,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY}),
 removeItem:async key=>SecureStore.deleteItemAsync(key)
};
export const joySupabase=configured?createClient(URL,KEY,{
 auth:{storage:adapter,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false,flowType:'pkce'},
 global:{headers:{'X-Client-Info':'joy-vimo-private-android'}}
}):null;
// Only publishable/anon client keys allowed. Never bundle service_role secrets.
export function safelyConfigured(){return !!joySupabase}
