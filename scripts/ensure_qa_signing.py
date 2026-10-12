"""QA-only signing. Release APK bundles JS but uses disposable debug test key."""
from pathlib import Path
import re
import subprocess
app=Path("android/app")
gradle=app/"build.gradle"
if not gradle.exists():
    raise SystemExit("Native project not generated")
keyfile=app/"debug.keystore"
if not keyfile.exists():
    subprocess.run(["keytool","-genkeypair","-keystore",str(keyfile),"-alias","androiddebugkey","-keyalg","RSA","-keysize","2048","-validity","365","-storepass","android","-keypass","android","-dname","CN=Android Debug,O=Android,C=US"],check=True)
s=gradle.read_text()
if "signingConfigs" not in s or "release" not in s:
    raise SystemExit("Unexpected native Android template, signing not verified")
pattern=r'(\brelease\s*\{)(?:(?!\n\s*\}).)*?(\n\s*\})'
m=re.search(pattern,s,re.S)
if not m:
    raise SystemExit("Release block missing")
block=m.group(0)
if "signingConfig signingConfigs.debug" not in block:
    if re.search(r'\bsigningConfig\b',block):
        raise SystemExit("Unexpected signing config; refusing to override")
    patched=block.replace(m.group(1),m.group(1)+"\n            // Test-only signature\n            signingConfig signingConfigs.debug",1)
    s=s[:m.start()]+patched+s[m.end():]
    gradle.write_text(s)
print("QA signing ready (test key; not Play Store key)")
