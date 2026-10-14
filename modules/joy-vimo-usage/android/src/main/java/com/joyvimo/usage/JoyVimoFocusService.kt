package com.joyvimo.usage

import android.accessibilityservice.AccessibilityService
import android.graphics.Rect
import android.app.AppOpsManager
import android.app.KeyguardManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
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
 * when the user separately enables short-feed blocking, checks a short
 * allowlist of player UI resource IDs for YouTube, Instagram and TikTok.
 * Optional domain rules temporarily inspect the Chrome address bar only after navigation.
 * Full URLs, page content, messages and history are NEVER stored or uploaded.
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
  private val instaPackage = "com.instagram.android"
  private val tiktokPackages = setOf("com.zhiliaoapp.musically","com.ss.android.ugc.trill")
  // Conservative UI resource ID candidates from published Android blocker research.
  // We do not copy source code, content, comments, user text or videos.
  // Exact matches + fullscreen bounds are required. Unknown UI versions fail open.
  private val instagramViewerIds = listOf(
    "clips_viewer_view_pager", "clips_viewer_container",
    "reel_viewer_fragment", "clips_video_container"
  )
  private val tiktokFeedIds = listOf(
    "for_you_feed", "fyp_container"
  )
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
  private var lastPauseLaunchMs=0L
  private var lastScanMs=0L
  private var lastInstagramScanMs=0L
  private var lastTiktokScanMs=0L
  private var activeSessionMs=0L
  private var lastMonotonicTickMs=android.os.SystemClock.elapsedRealtime()
  private var lastTrackedPkg:String?=null
  private val watchdog=object:Runnable {
    override fun run() {
      try {
        prefs.edit().putLong("service_heartbeat_at",System.currentTimeMillis()).apply()
        checkCurrentSession()
      }catch(_:Exception){}
      handler.postDelayed(this,5000L)
    }
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    prefs.edit().putLong("service_connected_at",System.currentTimeMillis())
      .putLong("service_heartbeat_at",System.currentTimeMillis())
      .putBoolean("service_shutdown_cleanly",false).apply()
    lastMonotonicTickMs=android.os.SystemClock.elapsedRealtime()
    handler.removeCallbacks(watchdog)
    handler.postDelayed(watchdog,5000L)
  }
  override fun onDestroy() {
    handler.removeCallbacks(watchdog)
    prefs.edit().putBoolean("service_shutdown_cleanly",true).apply()
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
      // Switches to another app start a fresh monitored session.
      activeSessionMs=0L
      lastTrackedPkg=pkg
      lastMonotonicTickMs=android.os.SystemClock.elapsedRealtime()
      if(pkg!=packageName)recordOpening(pkg,now)
    }
    if(pkg=="com.android.chrome" && protectionRunning() && prefs.getBoolean("domain_rules_enabled",false)) {
      if(now-lastScanMs>=900L) {lastScanMs=now;checkChromeDomain()}
    }
    if(pkg==instaPackage && protectionRunning() && prefs.getBoolean("instagram_reels",false)) {
      if(now-lastInstagramScanMs>=900L) {
        lastInstagramScanMs=now
        if(hasFullscreenPlayerId(pkg,instagramViewerIds)) {
          redirect("Instagram Reels",pkg,"instagram_reels_screen",back=true)
        }
      }
    }
    if(pkg in tiktokPackages && protectionRunning() && prefs.getBoolean("tiktok_feed",false)) {
      if(now-lastTiktokScanMs>=950L) {
        lastTiktokScanMs=now
        if(hasFullscreenPlayerId(pkg,tiktokFeedIds)) {
          redirect("TikTok For You",pkg,"tiktok_feed_screen",back=true)
        }
      }
    }
    if(pkg==ytPackage && protectionRunning() && prefs.getBoolean("youtube_shorts",false)) {
      if(now-lastScanMs>=850L) {
        lastScanMs=now
        if(isShortsPlayerVisible()) redirect("YouTube Shorts",pkg,"shorts_screen",back=true)
      }
    }
  }

  private fun recordOpening(pkg:String,now:Long) {
    val name=tracked[pkg]?:return
    if(!isActive())return
    val safetyUntil=prefs.getLong("safety_pause_until",0L)
    if(now<safetyUntil)return
    if(now<prefs.getLong("opening_bypass_until_"+pkg,0L))return
    val rule=getRule(name)?:return
    if(!rule.optBoolean("enabled",false))return
    if(now-lastEntryMs<800L)return
    lastEntryMs=now
    val day=dayKey()
    // A voluntarily configured 3-denial cooldown, scoped to this app and day.
    // Safety pause, disabling Focus Shield and Android permission revocation win.
    val cooldownEnabled=rule.optBoolean("cooldownEnabled",true)
    val recordedDay=prefs.getString("denied_day_"+pkg,"")
    val cooldown=if(recordedDay==day)prefs.getLong("denied_cooldown_"+pkg,0L)else 0L
    if(cooldownEnabled && now<cooldown){
      redirect(name,pkg,"three_attempt_cooldown")
      return
    }
    val before=if(prefs.getString("day_"+pkg,"")==day)prefs.getInt("opens_"+pkg,0)else 0
    val after=(before+1).coerceAtMost(100000)
    prefs.edit().putString("day_"+pkg,day).putInt("opens_"+pkg,after).apply()
    if(after>rule.optInt("opens",3).coerceIn(1,30)){
      if(!cooldownEnabled){redirect(name,pkg,"opening_limit");return}
      val denialLimit=rule.optInt("denialLimit",3).coerceIn(1,3)
      val cooldownMs=rule.optInt("cooldownMinutes",15).coerceIn(5,30)*60000L
      val denied=if(recordedDay==day)prefs.getInt("denied_attempts_"+pkg,0)else 0
      val nextDenied=(denied+1).coerceAtMost(denialLimit)
      val lockUntil=if(nextDenied>=denialLimit)now+cooldownMs else 0L
      prefs.edit().putString("denied_day_"+pkg,day)
        .putInt("denied_attempts_"+pkg,if(lockUntil>0L)0 else nextDenied)
        .putLong("denied_cooldown_"+pkg,lockUntil).apply()
      redirect(name,pkg,if(lockUntil>0L)"three_attempt_cooldown" else "opening_limit")
      return
    }
    val delay=rule.optInt("delay",0).coerceIn(0,30)
    if(delay>0 && now-lastPauseLaunchMs>2500L){
      lastPauseLaunchMs=now
      prefs.edit().putLong("opening_bypass_until_"+pkg,now+3000L).apply()
      try {
        val screen=Intent(this,JoyVimoOpeningPauseActivity::class.java).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS)
          putExtra("target_package",pkg)
          putExtra("delay_seconds",delay)
        }
        startActivity(screen)
      }catch(_:Exception){
        // Fail open: never trap user if launch restrictions apply.
      }
      return
    }
    checkCurrentSession()
  }
  private fun isActive():Boolean =
    prefs.getBoolean("consented",false)&&prefs.getBoolean("enforcing",false)&&
      prefs.getString("age","kid")!="kid"

  private fun isDeviceAccessible():Boolean {
    val power=getSystemService(Context.POWER_SERVICE) as PowerManager
    val keyguard=getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
    return power.isInteractive && !keyguard.isKeyguardLocked
  }
  private fun protectionRunning():Boolean =
    isActive() && isDeviceAccessible() &&
      System.currentTimeMillis()>=prefs.getLong("safety_pause_until",0L)

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
      // Require a visible substantial player, not just a background tab ID.
      val metrics=resources.displayMetrics
      val screenArea=metrics.widthPixels.toLong()*metrics.heightPixels.toLong()
      shortsPlayerIds.any { id ->
        root.findAccessibilityNodeInfosByViewId("$ytPackage:id/$id")?.any { node ->
          val bounds=Rect()
          node.getBoundsInScreen(bounds)
          bounds.width().toLong()*bounds.height().toLong()*100L>=screenArea*25L &&
            bounds.height()>=metrics.heightPixels/3
        } == true
      }
    }catch(_:Exception){false}
  }
  private fun hasFullscreenPlayerId(pkg:String,candidates:List<String>):Boolean {
    // Privacy: node resource IDs and geometry only. No node.text,
    // contentDescription, image capture, URL or raw view-tree telemetry.
    val root=rootInActiveWindow?:return false
    if(root.packageName?.toString()!=pkg)return false
    val metrics=resources.displayMetrics
    val width=metrics.widthPixels.toLong().coerceAtLeast(1)
    val height=metrics.heightPixels.toLong().coerceAtLeast(1)
    return try {
      candidates.any { id ->
        val nodes=root.findAccessibilityNodeInfosByViewId("$pkg:id/$id")
        nodes?.any { node ->
          val rect=Rect()
          node.getBoundsInScreen(rect)
          val w=rect.width().toLong().coerceAtLeast(0)
          val h=rect.height().toLong().coerceAtLeast(0)
          w*100>=width*45 && h*100>=height*58 &&
            w*h*100>=width*height*34
        } == true
      }
    }catch(_:Exception){false}
  }

  private fun checkChromeDomain(){
    // Only Chrome address bar. No browsing history, logs, stored URLs or text scans.
    val root=rootInActiveWindow?:return
    if(root.packageName?.toString()!="com.android.chrome")return
    val current=try {
      root.findAccessibilityNodeInfosByViewId("com.android.chrome:id/url_bar")
        ?.firstOrNull { !it.isFocused }?.text?.toString()
    }catch(_:Exception){null} ?:return
    val host=domainFromAddress(current)?:return
    val list=try{JSONObject(prefs.getString("domain_rules","{}")?:"{}")}
      catch(_:Exception){JSONObject()}
    val names=list.optJSONArray("domains")?:return
    for(i in 0 until names.length()){
      val rule=names.optString(i,"")
      if(rule.isNotEmpty() && (host==rule || host.endsWith("."+rule))){
        redirect("Restricted website","com.android.chrome","domain_rule",back=true)
        return
      }
    }
  }
  private fun domainFromAddress(address:String):String? {
    // Parse only the hostname and discard the raw string immediately.
    if(address.length>2048 || address.any{it.isWhitespace()})return null
    return try{
      val url=if(address.contains("://"))address else "https://"+address
      val host=android.net.Uri.parse(url).host?.lowercase(java.util.Locale.ROOT)
        ?.trimEnd('.')?.removePrefix("www.")?:return null
      if(host.length>253 || !host.contains('.') || host.contains(".."))null
      else host
    }catch(_:Exception){null}
  }
  private fun inPresetSchedule():Boolean {
    val root=try{JSONObject(prefs.getString("schedules","{}")?:"{}")}catch(_:Exception){JSONObject()}
    val c=Calendar.getInstance()
    val minute=c.get(Calendar.HOUR_OF_DAY)*60+c.get(Calendar.MINUTE)
    val today=c.get(Calendar.DAY_OF_WEEK)-1 // Sunday=0
    val yesterday=(today+6)%7
    for(name in listOf("Sleep","Study","Me time")){
      val entry=root.optJSONObject(name)
      if(entry==null){
        // Legacy boolean schedules remain supported.
        if(root.optBoolean(name,false)){
          if(name=="Sleep"&&(minute>=1320||minute<420))return true
          if(name=="Study"&&minute in 960 until 1080)return true
          if(name=="Me time"&&minute in 1200 until 1260)return true
        }
        continue
      }
      if(!entry.optBoolean("enabled",false))continue
      val begin=toMinute(entry.optString("start",""))?:continue
      val end=toMinute(entry.optString("end",""))?:continue
      if(begin==end)continue
      val days=entry.optJSONArray("days")?:continue
      fun selected(d:Int)= (0 until days.length()).any{days.optInt(it,-1)==d}
      if(begin<end && selected(today) && minute in begin until end)return true
      if(begin>end && ((selected(today)&&minute>=begin)||(selected(yesterday)&&minute<end)))return true
    }
    return false
  }
  private fun toMinute(raw:String):Int?{
    if(!Regex("^(?:[01][0-9]|2[0-3]):[0-5][0-9]$").matches(raw))return null
    return raw.substring(0,2).toInt()*60+raw.substring(3).toInt()
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
    val nowTick=android.os.SystemClock.elapsedRealtime()
    val elapsed=(nowTick-lastMonotonicTickMs).coerceAtLeast(0L)
    lastMonotonicTickMs=nowTick
    val pkg=foregroundPkg?:return
    val name=tracked[pkg]?:return
    // Never count the long gap across device sleep, keyguard, process
    // suspension, or an inaccessible foreground window as active use.
    if(!isDeviceAccessible() || elapsed>12000L || pkg!=lastTrackedPkg)return
    if(!isActive() || System.currentTimeMillis()<prefs.getLong("safety_pause_until",0L))return
    activeSessionMs=(activeSessionMs+elapsed).coerceAtMost(12L*60L*60L*1000L)
    val rule=getRule(name)?:return
    if(!rule.optBoolean("enabled",false))return
    if(inPresetSchedule()) {
      redirect(name,pkg,"focus_schedule")
      return
    }
    val maxMs=rule.optInt("session",10).coerceIn(1,120)*60000L
    if(activeSessionMs>=maxMs){
      redirect(name,pkg,"session_limit")
      return
    }
    if(usageGranted() && minutesUsed(pkg)>=rule.optInt("minutes",30).coerceIn(1,600)) {
      redirect(name,pkg,"daily_minutes")
    }
  }
  private fun redirect(name:String,pkg:String,reason:String,back:Boolean=false) {
    if(!protectionRunning())return
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
      activeSessionMs=0L
      lastTrackedPkg=null
    }
  }
  override fun onInterrupt(){}
  companion object { const val STORE="joy_vimo_focus_qa" }
}
