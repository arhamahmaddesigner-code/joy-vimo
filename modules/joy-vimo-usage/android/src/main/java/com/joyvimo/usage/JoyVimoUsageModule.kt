package com.joyvimo.usage

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
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
    return mapOf(
      "serviceEnabled" to enabled.split(":").any{it.equals(component,ignoreCase=true)},
      "optedIn" to p.getBoolean("consented",false),
      "enforcing" to p.getBoolean("enforcing",false),
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
    Function("getFocusStatus"){focusStatus()}
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
      val scheduleInput=json.optJSONObject("schedules")?:JSONObject()
      val safeSchedules=JSONObject()
      for(name in listOf("Sleep","Study","Me time"))safeSchedules.put(name,scheduleInput.optBoolean(name,false))
      val allowed=JSONObject()
      for(name in listOf("Instagram","TikTok","YouTube","Chrome")){
        val rule=given.optJSONObject(name)?:JSONObject()
        allowed.put(name,JSONObject().apply{
          put("enabled",rule.optBoolean("enabled",false))
          put("opens",rule.optInt("opens",3).coerceIn(1,30))
          put("minutes",rule.optInt("minutes",30).coerceIn(1,600))
          put("session",rule.optInt("session",10).coerceIn(1,120))
        })
      }
      context().getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE)
        .edit().putString("age",age).putBoolean("consented",consent)
        .putBoolean("enforcing",active).putString("rules",allowed.toString())
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
