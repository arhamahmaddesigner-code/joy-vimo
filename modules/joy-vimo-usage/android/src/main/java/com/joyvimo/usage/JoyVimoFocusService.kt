package com.joyvimo.usage

import android.accessibilityservice.AccessibilityService
import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Process
import android.view.accessibility.AccessibilityEvent
import org.json.JSONObject
import java.util.Calendar

/** Optional, narrow, on-device package-switch watcher; does not read screen content. */
class JoyVimoFocusService : AccessibilityService() {
  private val names=mapOf(
    "com.instagram.android" to "Instagram",
    "com.zhiliaoapp.musically" to "TikTok",
    "com.google.android.youtube" to "YouTube",
    "com.android.chrome" to "Chrome"
  )
  private val pref by lazy { getSharedPreferences(STORE,Context.MODE_PRIVATE) }
  private var previousPackage:String?=null
  private var lastEntry=0L
  private var lastHome=0L

  override fun onAccessibilityEvent(e:AccessibilityEvent?) {
    if(e?.eventType!=AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED)return
    val pkg=e.packageName?.toString()?:return
    if(pkg==packageName){previousPackage=pkg;return}
    if(pkg=="com.android.systemui" || pkg.contains("inputmethod",true)
      || pkg.contains("keyboard",true))return
    if(previousPackage==pkg)return
    previousPackage=pkg
    val name=names[pkg]?:return
    val now=System.currentTimeMillis()
    if(now-lastEntry<700L)return
    lastEntry=now
    if(!pref.getBoolean("consented",false)||!pref.getBoolean("enforcing",false))return
    if(pref.getString("age","kid")=="kid")return
    val config=try { JSONObject(pref.getString("rules","{}")?:"{}") }catch(_:Exception){JSONObject()}
    val rule=config.optJSONObject(name)?:return
    if(!rule.optBoolean("enabled",false))return
    val maxOpens=rule.optInt("opens",3).coerceIn(1,30)
    val maxMinutes=rule.optInt("minutes",30).coerceIn(1,600)
    val calendar=Calendar.getInstance()
    val day=calendar.get(Calendar.YEAR).toString()+"-"+calendar.get(Calendar.DAY_OF_YEAR)
    val previousCount=if(pref.getString("day_"+pkg,"")==day) pref.getInt("opens_"+pkg,0) else 0
    val count=(previousCount+1).coerceAtMost(99999)
    pref.edit().putString("day_"+pkg,day).putInt("opens_"+pkg,count).apply()
    val overTime=usagePermission()&&usedMinutes(pkg)>=maxMinutes
    if(count>maxOpens||overTime){
      if(now-lastHome<1200L)return
      lastHome=now
      pref.edit().putString("last_blocked",name).putLong("last_blocked_at",now)
        .putInt("blocks_"+pkg,pref.getInt("blocks_"+pkg,0)+1).apply()
      performGlobalAction(GLOBAL_ACTION_HOME)
    }
  }
  private fun usagePermission():Boolean {
    val ops=getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    return ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,Process.myUid(),packageName)==AppOpsManager.MODE_ALLOWED
  }
  private fun usedMinutes(pkg:String):Long=try{
    val c=Calendar.getInstance().apply{
      set(Calendar.HOUR_OF_DAY,0);set(Calendar.MINUTE,0);set(Calendar.SECOND,0);set(Calendar.MILLISECOND,0)}
    val mgr=getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    (mgr.queryAndAggregateUsageStats(c.timeInMillis,System.currentTimeMillis())[pkg]?.totalTimeInForeground?:0L)/60000L
  }catch(_:Exception){0L}
  override fun onInterrupt(){}
  companion object{const val STORE="joy_vimo_focus_qa"}
}
