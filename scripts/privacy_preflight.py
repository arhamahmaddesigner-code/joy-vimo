#!/usr/bin/env python3
"""Private JOY VIMO QA: privacy/release static gate, not proof of device behavior."""
from pathlib import Path
import json, sys
root=Path(__file__).resolve().parents[1]
app=(root/"App.js").read_text()
module=(root/"modules/joy-vimo-usage/android/src/main/java/com/joyvimo/usage/JoyVimoUsageModule.kt").read_text()
service=(root/"modules/joy-vimo-usage/android/src/main/java/com/joyvimo/usage/JoyVimoFocusService.kt").read_text()
manifest=(root/"modules/joy-vimo-usage/android/src/main/AndroidManifest.xml").read_text()
config=(root/"modules/joy-vimo-usage/android/src/main/res/xml/joy_vimo_accessibility_config.xml").read_text()
workflow=(root/".github/workflows/android-qa-apk.yml").read_text()
package=json.loads((root/"package.json").read_text())
app_cfg=json.loads((root/"app.json").read_text())
errors=[]
def must(check,why):
    if not check:errors.append(why)
must("clearFocusConfig" in module and "clearFocusConfig" in app,"Native focus settings must be wiped on data deletion")
must("consented" in module and "consented" in service,"Native enforcement requires recorded opt-in")
must('age!="kid"' in module and 'getString("age","kid")!="kid"' in service,"Parent-supported mode must fail closed")
must('android:canRetrieveWindowContent="true"' in config and 'flagReportViewIds' in config,"YouTube screen resource-ID capability must be declared")
must("youtubeShorts" in (root/"components/FocusControl.js").read_text() or "setShorts" in (root/"components/FocusControl.js").read_text(),"Separate YouTube Shorts opt-in must exist")
must("checkChromeDomain" in service and "domain_rules_enabled" in service,"Website rules must remain opt-in")
must("findAccessibilityNodeInfosByViewId" in service and "com.android.chrome:id/url_bar" in service,"Limit domain inspection to Chrome URL bar")
must("getText()" not in service and "Log." not in service,"Do not log or broadly read Accessibility node content")
must("domainRulesEnabled" in (root/"components/DomainRulesPanel.js").read_text() or "onEnabledChange" in (root/"components/DomainRulesPanel.js").read_text(),"Website rule control must exist")
must("android.permission.BIND_ACCESSIBILITY_SERVICE" in manifest,"Accessibility must use system-protected binding permission")
must("Accessibility" in (root/"components/FocusControl.js").read_text(),"Consent UI must explain Accessibility")
must("workflow_dispatch:" in workflow and "\n  push:" not in workflow,"APK workflow must stay manual-only")
must(app_cfg["expo"]["android"]["package"]=="com.joyvimo.app","QA package ID unexpectedly changed")
must("expo" in package["dependencies"],"Missing Expo dependency")
for hazard in ["READ_SMS","READ_CONTACTS","QUERY_ALL_PACKAGES","REQUEST_INSTALL_PACKAGES","READ_CALL_LOG"]:
    must(hazard not in manifest,"Unexpected sensitive permission in manifest: "+hazard)
if errors:
    for e in errors:print("FAIL:",e)
    sys.exit(1)
print("PASS: static privacy preflight (does NOT verify OS enforcement or APK security).")
