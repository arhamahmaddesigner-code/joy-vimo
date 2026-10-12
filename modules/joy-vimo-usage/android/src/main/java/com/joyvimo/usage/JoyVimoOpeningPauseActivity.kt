package com.joyvimo.usage

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Optional mindful launch pause. Displays a local screen before opening
 * a user-selected app. No browsing/activity content is accessed here.
 * The user can always return Home or temporarily pause protection.
 */
class JoyVimoOpeningPauseActivity : Activity() {
  private val handler=Handler(Looper.getMainLooper())
  private var seconds=0
  private var destination=""
  private var completed=false
  private lateinit var countdown:TextView
  private val tick=object:Runnable {
    override fun run() {
      if(isFinishing||completed)return
      seconds=(seconds-1).coerceAtLeast(0)
      countdown.text=if(seconds>0)"$seconds seconds to choose" else "You can continue now"
      if(seconds>0)handler.postDelayed(this,1000L)
      else continueButton.isEnabled=true
    }
  }
  private lateinit var continueButton:Button
  private val prefs by lazy { getSharedPreferences(JoyVimoFocusService.STORE,Context.MODE_PRIVATE) }

  override fun onCreate(savedInstanceState:Bundle?) {
    super.onCreate(savedInstanceState)
    destination=intent.getStringExtra("target_package")?:""
    val allowlist=setOf("com.instagram.android","com.zhiliaoapp.musically",
      "com.google.android.youtube","com.android.chrome")
    if(destination !in allowlist||!prefs.getBoolean("consented",false)
       ||!prefs.getBoolean("enforcing",false)){finish();return}
    seconds=intent.getIntExtra("delay_seconds",5).coerceIn(1,30)
    val panel=LinearLayout(this).apply {
      orientation=LinearLayout.VERTICAL
      gravity=Gravity.CENTER_HORIZONTAL
      setPadding(dp(28),dp(36),dp(28),dp(36))
      setBackgroundColor(Color.rgb(248,246,255))
    }
    fun line(label:String,size:Float,bold:Boolean=false):TextView=TextView(this).apply {
      text=label
      textSize=size
      setTextColor(Color.rgb(37,25,89))
      gravity=Gravity.CENTER
      if(bold)typeface=Typeface.DEFAULT_BOLD
      setPadding(0,dp(9),0,dp(9))
      panel.addView(this,ViewGroup.LayoutParams(-1,-2))
    }
    line("JOY VIMO  ✦",27f,true)
    line("Make this opening intentional",23f,true)
    line("You're in control. Is this the app you want to open right now?",16f)
    countdown=line("$seconds seconds to choose",20f,true)
    fun action(title:String,perform:()->Unit):Button=Button(this).apply {
      text=title
      isAllCaps=false
      setOnClickListener { perform() }
      panel.addView(this,LinearLayout.LayoutParams(-1,dp(55)).apply {topMargin=dp(12)})
    }
    continueButton=action("Continue to app") { continueToApp(false) }.apply {isEnabled=false}
    action("Stay focused · Go Home") {
      completed=true
      finish()
      val home=Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_HOME);addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      startActivity(home)
    }
    action("Safety pause · 15 minutes") { continueToApp(true) }
    line("Emergency pause is always available. No points are deducted.",12f)
    setContentView(panel)
    handler.postDelayed(tick,1000L)
  }
  private fun continueToApp(temporaryPause:Boolean) {
    if(completed)return
    completed=true
    val now=System.currentTimeMillis()
    val edit=prefs.edit()
    if(temporaryPause)edit.putLong("safety_pause_until",now+15*60*1000L)
    edit.putLong("opening_bypass_until_"+destination,now+15000L).apply()
    val launch=packageManager.getLaunchIntentForPackage(destination)
    if(launch!=null){
      try {startActivity(launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED))}
      catch(_:Exception){}
    }
    finish()
  }
  private fun dp(x:Int):Int=(x*resources.displayMetrics.density).toInt()
  override fun onDestroy(){handler.removeCallbacks(tick);super.onDestroy()}
}
