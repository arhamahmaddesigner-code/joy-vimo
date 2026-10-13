package com.joyvimo.usage

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.os.PowerManager
import android.provider.Settings
import org.json.JSONObject
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Calendar

/* Observes on-device usage only. Never blocks apps or inspects screen contents. */
class JoyVimoUsageModule : Module() {
  private val targets = mapOf(
    "Instagram" to "com.instagram.android",
    "TikTok" to "com.zhiliaoapp.musically",
    "YouTube" to "com.google.android.youtube",
    "Chrome" to "com.android.chrome"
  )
  private fun context(): Context = appContext.reactContext
    ?: throw IllegalStateException("Android context unavailable")
  private fun access(): Boolean {
    val c = context()
    val ops = c.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    return ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(), c.packageName) == AppOpsManager.MODE_ALLOWED
  }
  private fun startToday(): Long = Calendar.getInstance().apply {
    set(Calendar.HOUR_OF_DAY,0);set(Calendar.MINUTE,0)
    set(Calendar.SECOND,0);set(Calendar.MILLISECOND,0)
  }.timeInMillis
  private fun readToday(): Map<String,Any> {
    if (!access()) throw SecurityException("Usage Access not granted")
    val manager=context().getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val start=startToday()
    val now=System.currentTimeMillis()
    val totals=targets.mapValues { mutableMapOf("ms" to 0L,"opens" to 0L) }
    val begun=mutableMapOf<String,Long>()
    val events=manager.queryEvents(start,now)
    val event=UsageEvents.Event()
    while(events.hasNextEvent()) {
      events.getNextEvent(event)
      val pkg=event.packageName ?: continue
      if(!targets.containsValue(pkg)) continue
      val name=targets.entries.firstOrNull{it.value==pkg}?.key ?:continue
      val data=totals[name]?:continue
      when(event.eventType) {
        UsageEvents.Event.ACTIVITY_RESUMED -> {
          if(!begun.containsKey(pkg)) {
            begun[pkg]=event.timeStamp
            data["opens"]=(data["opens"]?:0L)+1L
          }
        }
        UsageEvents.Event.ACTIVITY_PAUSED,UsageEvents.Event.ACTIVITY_STOPPED ->{
          val began=begun.remove(pkg)
          if(began!=null) data["ms"]=(data["ms"]?:0L)+(event.timeStamp-began).coerceAtLeast(0L)
        }
      }
    }
    begun.forEach{(pkg,began)->
      val name=targets.entries.firstOrNull{it.value==pkg}?.key
      if(name!=null) {
        val data=totals[name]
        if(data!=null) data["ms"]=(data["ms"]?:0L)+(now-began).coerceAtLeast(0L)
      }
    }
    return mapOf("rows" to targets.keys.map { name ->
      val data=totals[name]
      mapOf("name" to name,"minutes" to (data?.get("ms")?:0L)/60000L,
        "opens" to (data?.get("opens")?:0L))
    },"observedAtMs" to now)
  }
  private fun focusStatus():Map<String,Any> {
    val enabled=Settings.Secure.getString(context().contentResolver,Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)?:""
    val component=context().packageName+"/com.joyvimo.usage.JoyVimoFocusService"
    val p=context().getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE)
    val power=context().getSystemService(Context.POWER_SERVICE) as PowerManager
    val now=System.currentTimeMillis()
    val heartbeat=p.getLong("service_heartbeat_at",0L)
    val enabledOnSystem=enabled.split(":").any{it.equals(component,ignoreCase=true)}
    return mapOf(
      "heartbeatAt" to heartbeat,
      "serviceHealthy" to (enabledOnSystem && heartbeat>0 && now-heartbeat in 0..20000),
      "batteryOptimizationIgnored" to power.isIgnoringBatteryOptimizations(context().packageName),
      "serviceConnectedAt" to p.getLong("service_connected_at",0L),
      "serviceShutdownCleanly" to p.getBoolean("service_shutdown_cleanly",false),
      "serviceEnabled" to enabled.split(":").any{it.equals(component,ignoreCase=true)},
      "optedIn" to p.getBoolean("consented",false),
      "enforcing" to p.getBoolean("enforcing",false),
      "safetyPauseUntil" to p.getLong("safety_pause_until",0L),
      "strictUntil" to p.getLong("strict_until",0L),
      "youtubeShorts" to p.getBoolean("youtube_shorts",false),
      "instagramReels" to p.getBoolean("instagram_reels",false),
      "tiktokFeed" to p.getBoolean("tiktok_feed",false),
      "domainRulesEnabled" to p.getBoolean("domain_rules_enabled",false),
      "lastBlockedApp" to (p.getString("last_blocked","")?:""),
      "lastReason" to (p.getString("last_reason","")?:""),
      "lastBlockedAt" to p.getLong("last_blocked_at",0L),
      "instagramBlocks" to p.getInt("blocks_com.instagram.android",0),
      "tiktokBlocks" to p.getInt("blocks_com.zhiliaoapp.musically",0),
      "youtubeBlocks" to p.getInt("blocks_com.google.android.youtube",0),
      "chromeBlocks" to p.getInt("blocks_com.android.chrome",0)
    )
  }
  override fun definition() = ModuleDefinition {
    Name("JoyVimoUsage")
    Function("hasUsageAccess"){access()}
    Function("getSupportedAppsInstalled"){
      // Only checks four known packages declared in AndroidManifest queries.
      // No installed-package enumeration or QUERY_ALL_PACKAGES permission.
      targets.mapValues { (_,pkg) ->
        try{ context().packageManager.getLaunchIntentForPackage(pkg)!=null }
        catch(_:Exception){false}
      }
    }
    Function("getPrivateDnsSummary"){
      val c=context()
      val mode=try{Settings.Global.getString(c.contentResolver,"private_dns_mode")?:"unknown"}
        catch(_:Exception){"unknown"}
      val host=try{Settings.Global.getString(c.contentResolver,"private_dns_specifier")?:""}
        catch(_:Exception){""}
      mapOf("mode" to mode,"host" to host,"familySelected" to
        (mode=="hostname" && host.equals("family.cloudflare-dns.com",ignoreCase=true)))
    }
    AsyncFunction("openNetworkSettings"){
      context().startActivity(Intent(Settings.ACTION_WIRELESS_SETTINGS)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    AsyncFunction("startStrictMode"){minutes:Int ->
      val p=context().getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE)
      if(!p.getBoolean("consented",false)||!p.getBoolean("enforcing",false))throw IllegalStateException("Enable Focus Shield first")
      val duration=minutes.coerceIn(15,120)
      val next=System.currentTimeMillis()+duration*60000L
      p.edit().putLong("strict_until",maxOf(next,p.getLong("strict_until",0L))).apply()
      true
    }
    AsyncFunction("pauseFocusSafely"){minutes:Int ->
      val bounded=minutes.coerceIn(1,60)
      context().getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE)
        .edit().putLong("safety_pause_until",System.currentTimeMillis()+bounded*60000L).apply()
      true
    }
    AsyncFunction("clearSafetyPause"){
      context().getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE)
        .edit().remove("safety_pause_until").apply()
      true
    }
    AsyncFunction("clearFocusConfig"){
      context().getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE)
        .edit().clear().commit()
    }
    Function("getFocusStatus"){focusStatus()}
    AsyncFunction("openBatteryOptimizationSettings"){
      context().startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    AsyncFunction("openAccessibilitySettings"){
      context().startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    AsyncFunction("setFocusConfig"){ raw:String ->
      val json=JSONObject(raw)
      val age=json.optString("age","kid")
      val consent=json.optBoolean("consented",false)&&age!="kid"
      val active=consent&&json.optBoolean("enforcing",false)
      val given=json.optJSONObject("rules")?:JSONObject()
      val shorts=json.optBoolean("youtubeShorts",false)
      val instagramReels=json.optBoolean("instagramReels",false)
      val tiktokFeed=json.optBoolean("tiktokFeed",false)
      val domainsOn=json.optBoolean("domainRulesEnabled",false)
      val candidates=json.optJSONArray("domains")?:org.json.JSONArray()
      val validated=org.json.JSONArray()
      val domainPattern=Regex("^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,63}$")
      for(i in 0 until minOf(candidates.length(),30)){
        val name=candidates.optString(i,"").trim().lowercase(java.util.Locale.ROOT)
        if(name.length<=253 && domainPattern.matches(name))validated.put(name)
      }
      val scheduleInput=json.optJSONObject("schedules")?:JSONObject()
      val safeSchedules=JSONObject()
      for(name in listOf("Sleep","Study","Me time")){
        val raw=scheduleInput.opt(name)
        val defaults=when(name){"Sleep"->"22:00" to "07:00";"Study"->"16:00" to "18:00";else->"20:00" to "21:00"}
        val entry=raw as? JSONObject
        val start=entry?.optString("start")?.takeIf{Regex("^(?:[01][0-9]|2[0-3]):[0-5][0-9]$").matches(it)}?:defaults.first
        val end=entry?.optString("end")?.takeIf{Regex("^(?:[01][0-9]|2[0-3]):[0-5][0-9]$").matches(it)}?:defaults.second
        val days=org.json.JSONArray()
        val inputDays=entry?.optJSONArray("days")
        if(inputDays==null){for(d in 0..6)days.put(d)}
        else for(i in 0 until minOf(inputDays.length(),7)){
          val d=inputDays.optInt(i,-1)
          if(d in 0..6 && (0 until days.length()).none{days.optInt(it)==d})days.put(d)
        }
        val enabled=entry?.optBoolean("enabled",false)?:scheduleInput.optBoolean(name,false)
        safeSchedules.put(name,JSONObject().put("enabled",enabled&&start!=end).put("start",start).put("end",end).put("days",days))
      }
      val allowed=JSONObject()
      for(name in listOf("Instagram","TikTok","YouTube","Chrome")){
        val rule=given.optJSONObject(name)?:JSONObject()
        allowed.put(name,JSONObject().apply{
          put("enabled",rule.optBoolean("enabled",false))
          put("opens",rule.optInt("opens",3).coerceIn(1,30))
          put("minutes",rule.optInt("minutes",30).coerceIn(1,600))
          put("session",rule.optInt("session",10).coerceIn(1,120))
          put("delay",rule.optInt("delay",0).coerceIn(0,30))
        })
      }
      val current=context().getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE)
      if(!active)current.edit().remove("strict_until").apply()
      if(active && System.currentTimeMillis()<current.getLong("strict_until",0L)){
        val oldRules=current.getString("rules","{}")?:"{}"
        val oldSchedule=current.getString("schedules","{}")?:"{}"
        val oldDomains=current.getString("domain_rules","{}")?:"{}"
        if(oldRules!=allowed.toString()||oldSchedule!=safeSchedules.toString()
          ||oldDomains!=JSONObject().put("domains",validated).toString()){
          throw IllegalStateException("Commitment window active: rules cannot change until it ends. Emergency pause or revoke consent remain available.")
        }
      }
      context().getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE)
        .edit().putString("age",age).putBoolean("consented",consent)
        .putBoolean("enforcing",active).putBoolean("youtube_shorts",active && shorts)
        .putBoolean("instagram_reels",active && instagramReels)
        .putBoolean("tiktok_feed",active && tiktokFeed)
        .putBoolean("domain_rules_enabled",active && domainsOn)
        .putString("domain_rules",JSONObject().put("domains",validated).toString())
        .putString("rules",allowed.toString())
        .putString("schedules",safeSchedules.toString()).apply()
      true
    }
    AsyncFunction("openUsageSettings"){
      context().startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    AsyncFunction("getTodayUsage"){readToday()}
  }
}
