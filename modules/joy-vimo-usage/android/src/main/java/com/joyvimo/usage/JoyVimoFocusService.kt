package com.joyvimo.usage

import android.accessibilityservice.AccessibilityService
import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.Process
import android.view.accessibility.AccessibilityEvent
import org.json.JSONObject
import java.util.Calendar

/**
 * JOY VIMO Android QA: optional, user-consented focus service.
 * Uses package-level window transitions only. Never inspects UI text,
 * images, messages, passwords, URLs, clipboard or video frames.
 * Can be disabled at any time in-app or through Android Settings.
 */
class JoyVimoFocusService : AccessibilityService() {
  private val packages = mapOf(
    "com.instagram.android" to "Instagram",
    "com.zhiliaoapp.musically" to "TikTok",
    "com.google.android.youtube" to "YouTube",
    "com.android.chrome" to "Chrome"
  )
  private val pref by lazy { getSharedPreferences(STORE,Context.MODE_PRIVATE) }
  private val handler = Handler(Looper.getMainLooper())
  private var foregroundPkg:String?=null
  private var enteredAtMs=0L
  private var lastPackageChangeMs=0L
  private var lastHomeMs=0L
  private val poll=object:Runnable {
    override fun run() {
      try { checkCurrentSession() } catch (_:Exception) { /* never crash device UI */ }
      handler.postDelayed(this, 5000L)
    }
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    handler.removeCallbacks(poll)
    handler.postDelayed(poll,5000L)
  }
  override fun onDestroy() {
    handler.removeCallbacks(poll)
    super.onDestroy()
  }

  override fun onAccessibilityEvent(event:AccessibilityEvent?) {
    if(event?.eventType!=AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED)return
    val pkg=event.packageName?.toString()?:return
    if(pkg=="com.android.systemui"||pkg.contains("inputmethod",true)
       ||pkg.contains("keyboard",true))return
    if(pkg==foregroundPkg)return
    foregroundPkg=pkg
    enteredAtMs=System.currentTimeMillis()
    if(pkg==packageName)return
    val appName=packages[pkg]?:return
    if(!isActive())return
    val rule=rule(appName)?:return
    if(!rule.optBoolean("enabled",false))return
    val now=System.currentTimeMillis()
    if(now-lastPackageChangeMs<800L)return
    lastPackageChangeMs=now
    val today=dayKey()
    val prev=if(pref.getString("day_"+pkg,"")==today)pref.getInt("opens_"+pkg,0)else 0
    val next=(prev+1).coerceAtMost(100000)
    pref.edit().putString("day_"+pkg,today).putInt("opens_"+pkg,next).apply()
    if(next>rule.optInt("opens",3).coerceIn(1,30)){
      redirect(appName,pkg,"opening_limit")
      return
    }
    checkCurrentSession()
  }

  private fun isActive():Boolean {
    return pref.getBoolean("consented",false) &&
      pref.getBoolean("enforcing",false) &&
      pref.getString("age","kid")!="kid"
  }
  private fun rule(name:String):JSONObject? {
    val root=try{ JSONObject(pref.getString("rules","{}")?:"{}") }
      catch(_:Exception){ JSONObject() }
    return root.optJSONObject(name)
  }
  private fun dayKey():String {
    val cal=Calendar.getInstance()
    return cal.get(Calendar.YEAR).toString()+"-"+cal.get(Calendar.DAY_OF_YEAR)
  }
  private fun inSchedule():Boolean {
    val root=try{ JSONObject(pref.getString("schedules","{}")?:"{}") }
      catch(_:Exception){JSONObject()}
    if(root.length()==0)return false
    val c=Calendar.getInstance()
    val minute=c.get(Calendar.HOUR_OF_DAY)*60+c.get(Calendar.MINUTE)
    // User-visible, editable switches for documented preset windows.
    return (root.optBoolean("Sleep",false)&&(minute>=1320||minute<420)) ||
      (root.optBoolean("Study",false)&&minute>=960&&minute<1080) ||
      (root.optBoolean("Me time",false)&&minute>=1200&&minute<1260)
  }
  private fun usageAccess():Boolean {
    val ops=getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    return ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),packageName)==AppOpsManager.MODE_ALLOWED
  }
  private fun usedMinutes(pkg:String):Long=try {
    val today=Calendar.getInstance().apply{
      set(Calendar.HOUR_OF_DAY,0);set(Calendar.MINUTE,0)
      set(Calendar.SECOND,0);set(Calendar.MILLISECOND,0)
    }
    val mgr=getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    (mgr.queryAndAggregateUsageStats(today.timeInMillis,
      System.currentTimeMillis())[pkg]?.totalTimeInForeground?:0L)/60000L
  }catch(_:Exception){0L}
  private fun checkCurrentSession() {
    val pkg=foregroundPkg?:return
    val name=packages[pkg]?:return
    if(!isActive())return
    val power=getSystemService(Context.POWER_SERVICE) as PowerManager
    if(!power.isInteractive)return
    val item=rule(name)?:return
    if(!item.optBoolean("enabled",false))return
    if(inSchedule()){
      redirect(name,pkg,"focus_schedule")
      return
    }
    // Session timer runs only while a watched app remains the last
    // observed foreground package; background/device state can affect accuracy.
    val sessionMs=item.optInt("session",10).coerceIn(1,120)*60000L
    if(enteredAtMs>0&&System.currentTimeMillis()-enteredAtMs>=sessionMs){
      redirect(name,pkg,"session_limit")
      return
    }
    if(usageAccess()&&usedMinutes(pkg)>=item.optInt("minutes",30).coerceIn(1,600)){
      redirect(name,pkg,"daily_minutes")
    }
  }
  private fun redirect(name:String,pkg:String,reason:String) {
    if(!isActive())return
    val now=System.currentTimeMillis()
    if(now-lastHomeMs<2500L)return
    lastHomeMs=now
    pref.edit()
      .putString("last_blocked",name)
      .putString("last_reason",reason)
      .putLong("last_blocked_at",now)
      .putInt("blocks_"+pkg,pref.getInt("blocks_"+pkg,0)+1)
      .apply()
    performGlobalAction(GLOBAL_ACTION_HOME)
    foregroundPkg=null
    enteredAtMs=0L
  }
  override fun onInterrupt() {}
  companion object{const val STORE="joy_vimo_focus_qa"}
}
