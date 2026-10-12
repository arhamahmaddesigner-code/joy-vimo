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
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONObject
import java.util.Calendar

/**
 * JOY VIMO private Android focus service.
 * Consent required. Observes selected foreground package changes and, only
 * when the user separately enables YouTube Shorts blocking, checks a short
 * allowlist of player UI resource IDs in the YouTube app.
 * It NEVER reads node text, URLs, messages, passwords or video frames.
 * No telemetry or network requests.
 */
class JoyVimoFocusService : AccessibilityService() {
  private val tracked = mapOf(
    "com.instagram.android" to "Instagram",
    "com.zhiliaoapp.musically" to "TikTok",
    "com.google.android.youtube" to "YouTube",
    "com.android.chrome" to "Chrome"
  )
  private val ytPackage = "com.google.android.youtube"
  // Inspired by the technique documented in the MIT AppBlock project.
  // Signatures drift across YouTube versions; never claim a guaranteed block.
  private val shortsPlayerIds = listOf(
    "reel_recycler", "reel_watch_player", "reel_player_page_container",
    "shorts_video_container", "reel_progress_bar"
  )
  private val prefs by lazy { getSharedPreferences(STORE,Context.MODE_PRIVATE) }
  private val handler=Handler(Looper.getMainLooper())
  private var foregroundPkg:String?=null
  private var enteredAtMs=0L
  private var lastEntryMs=0L
  private var lastRedirectMs=0L
  private var lastScanMs=0L
  private val watchdog=object:Runnable {
    override fun run() {
      try { checkCurrentSession() }catch(_:Exception){}
      handler.postDelayed(this,5000L)
    }
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    handler.removeCallbacks(watchdog)
    handler.postDelayed(watchdog,5000L)
  }
  override fun onDestroy() {
    handler.removeCallbacks(watchdog)
    super.onDestroy()
  }

  override fun onAccessibilityEvent(e:AccessibilityEvent?) {
    if(e==null)return
    val kind=e.eventType
    if(kind!=AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED &&
       kind!=AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED)return
    val pkg=e.packageName?.toString()?:return
    if(pkg=="com.android.systemui"||pkg.contains("inputmethod",true)||pkg.contains("keyboard",true))return
    val now=System.currentTimeMillis()
    if(kind==AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED && pkg!=foregroundPkg) {
      foregroundPkg=pkg
      enteredAtMs=now
      if(pkg!=packageName)recordOpening(pkg,now)
    }
    if(pkg==ytPackage && isActive() && prefs.getBoolean("youtube_shorts",false)) {
      if(now-lastScanMs>=850L) {
        lastScanMs=now
        if(isShortsPlayerVisible()) redirect("YouTube Shorts",pkg,"shorts_screen",back=true)
      }
    }
  }

  private fun recordOpening(pkg:String,now:Long) {
    val name=tracked[pkg]?:return
    if(!isActive())return
    val rule=getRule(name)?:return
    if(!rule.optBoolean("enabled",false))return
    if(now-lastEntryMs<800L)return
    lastEntryMs=now
    val day=dayKey()
    val before=if(prefs.getString("day_"+pkg,"")==day)prefs.getInt("opens_"+pkg,0)else 0
    val after=(before+1).coerceAtMost(100000)
    prefs.edit().putString("day_"+pkg,day).putInt("opens_"+pkg,after).apply()
    if(after>rule.optInt("opens",3).coerceIn(1,30)){
      redirect(name,pkg,"opening_limit")
      return
    }
    checkCurrentSession()
  }
  private fun isActive():Boolean =
    prefs.getBoolean("consented",false)&&prefs.getBoolean("enforcing",false)&&
      prefs.getString("age","kid")!="kid"

  private fun getRule(name:String):JSONObject? {
    val rules=try{JSONObject(prefs.getString("rules","{}")?:"{}")}catch(_:Exception){JSONObject()}
    return rules.optJSONObject(name)
  }
  private fun dayKey():String {
    val c=Calendar.getInstance()
    return c.get(Calendar.YEAR).toString()+"-"+c.get(Calendar.DAY_OF_YEAR)
  }
  private fun isShortsPlayerVisible():Boolean {
    // Reads only YouTube resource IDs. Does not read view text or view contents.
    val root=rootInActiveWindow?:return false
    if(root.packageName?.toString()!=ytPackage)return false
    return try {
      shortsPlayerIds.any { id ->
        root.findAccessibilityNodeInfosByViewId("$ytPackage:id/$id")?.isNotEmpty()==true
      }
    }catch(_:Exception){false}
  }
  private fun inPresetSchedule():Boolean {
    val schedules=try{JSONObject(prefs.getString("schedules","{}")?:"{}")}catch(_:Exception){JSONObject()}
    val c=Calendar.getInstance()
    val nowMinute=c.get(Calendar.HOUR_OF_DAY)*60+c.get(Calendar.MINUTE)
    return (schedules.optBoolean("Sleep",false)&&(nowMinute>=1320||nowMinute<420))||
      (schedules.optBoolean("Study",false)&&nowMinute>=960&&nowMinute<1080)||
      (schedules.optBoolean("Me time",false)&&nowMinute>=1200&&nowMinute<1260)
  }
  private fun usageGranted():Boolean {
    val ops=getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    return ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,Process.myUid(),packageName)==AppOpsManager.MODE_ALLOWED
  }
  private fun minutesUsed(pkg:String):Long=try {
    val c=Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY,0);set(Calendar.MINUTE,0)
      set(Calendar.SECOND,0);set(Calendar.MILLISECOND,0)
    }
    val mgr=getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    (mgr.queryAndAggregateUsageStats(c.timeInMillis,System.currentTimeMillis())[pkg]
      ?.totalTimeInForeground?:0L)/60000L
  }catch(_:Exception){0L}

  private fun checkCurrentSession() {
    val pkg=foregroundPkg?:return
    val name=tracked[pkg]?:return
    if(!isActive())return
    val power=getSystemService(Context.POWER_SERVICE) as PowerManager
    if(!power.isInteractive)return
    val rule=getRule(name)?:return
    if(!rule.optBoolean("enabled",false))return
    if(inPresetSchedule()) {
      redirect(name,pkg,"focus_schedule")
      return
    }
    val maxMs=rule.optInt("session",10).coerceIn(1,120)*60000L
    if(enteredAtMs>0 && System.currentTimeMillis()-enteredAtMs>=maxMs){
      redirect(name,pkg,"session_limit")
      return
    }
    if(usageGranted() && minutesUsed(pkg)>=rule.optInt("minutes",30).coerceIn(1,600)) {
      redirect(name,pkg,"daily_minutes")
    }
  }
  private fun redirect(name:String,pkg:String,reason:String,back:Boolean=false) {
    if(!isActive())return
    val now=System.currentTimeMillis()
    if(now-lastRedirectMs<3000L)return
    lastRedirectMs=now
    prefs.edit()
      .putString("last_blocked",name)
      .putString("last_reason",reason)
      .putLong("last_blocked_at",now)
      .putInt("blocks_"+pkg,prefs.getInt("blocks_"+pkg,0)+1).apply()
    val worked=if(back)performGlobalAction(GLOBAL_ACTION_BACK)else false
    if(!worked)performGlobalAction(GLOBAL_ACTION_HOME)
    if(!back) {
      foregroundPkg=null
      enteredAtMs=0L
    }
  }
  override fun onInterrupt(){}
  companion object { const val STORE="joy_vimo_focus_qa" }
}
