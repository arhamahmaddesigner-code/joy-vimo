"""Build-only ephemeral signing, or stable secret-backed private QA signing.

Never commit signing material; never upload disposable-signed owner APKs.
Internal compile jobs can use a temporary key but produce no owner artifact.
"""
from __future__ import annotations
import base64
import binascii
import os
from pathlib import Path
import re
import subprocess

app = Path("android/app")
gradle = app / "build.gradle"
if not gradle.exists():
    raise SystemExit("Native Android project has not been generated")

publish = os.environ.get("JOY_PUBLISH_PRIVATE_APK", "false").lower() == "true"

def block(text: str, name: str, start: int = 0, stop: int | None = None):
    m = re.search(r"(?m)^\s*" + re.escape(name) + r"\s*\{", text[start:stop])
    if not m:
        raise SystemExit(f"Cannot safely locate Gradle {name} block")
    opener = start + m.end() - 1
    depth = 0
    for i in range(opener, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return opener, i
    raise SystemExit(f"Unterminated Gradle {name} block")

s = gradle.read_text()
if "signingConfigs" not in s or "buildTypes" not in s:
    raise SystemExit("Unexpected Android Gradle project")

if publish:
    keys = ["JOY_QA_KEYSTORE_BASE64", "JOY_QA_STORE_PASSWORD",
            "JOY_QA_KEY_ALIAS", "JOY_QA_KEY_PASSWORD"]
    if any(not os.environ.get(k) for k in keys):
        raise SystemExit("Stable signing secrets missing. NOT uploading a disposable-signed APK.")
    try:
        data = base64.b64decode(os.environ["JOY_QA_KEYSTORE_BASE64"], validate=True)
    except (ValueError, binascii.Error):
        raise SystemExit("Stable keystore secret must be valid base64")
    if len(data) < 1024:
        raise SystemExit("Stable keystore file is too small")
    keystore = app / "joyvimo-private-qa.keystore"
    keystore.write_bytes(data)
    os.chmod(keystore, 0o600)
    try:
        subprocess.run([
            "keytool", "-list", "-keystore", str(keystore),
            "-alias", os.environ["JOY_QA_KEY_ALIAS"],
            "-storepass:env", "JOY_QA_STORE_PASSWORD"
        ], check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError:
        raise SystemExit("Cannot unlock/verify stable signing keystore alias")
    sign_name = "joyVimoPrivateQa"
    key_block = """
        joyVimoPrivateQa {
            storeFile file(System.getenv("JOY_QA_KEYSTORE_PATH"))
            storePassword System.getenv("JOY_QA_STORE_PASSWORD")
            keyAlias System.getenv("JOY_QA_KEY_ALIAS")
            keyPassword System.getenv("JOY_QA_KEY_PASSWORD")
        }
"""
    start, end = block(s, "signingConfigs")
    if "joyVimoPrivateQa" in s[start:end]:
        raise SystemExit("Unexpected duplicate private signing config")
    s = s[:end] + key_block + s[end:]
    env_file = os.environ.get("GITHUB_ENV")
    if env_file:
        with open(env_file, "a", encoding="utf-8") as fp:
            fp.write("JOY_QA_KEYSTORE_PATH=" + str(keystore.resolve()) + "\n")
    else:
        raise SystemExit("A private QA build needs GitHub Actions secure environment")
else:
    # An internal compile may use generated debug signing only; never upload it.
    sign_name = "debug"

b_start, b_end = block(s, "buildTypes")
r_start, r_end = block(s, "release", b_start + 1, b_end)
release = s[r_start + 1:r_end]
release = re.sub(r"(?m)^\s*signingConfig\s+[^\n]*", "", release)
release = "\n            signingConfig signingConfigs." + sign_name + "\n" + release
s = s[:r_start + 1] + release + s[r_end:]
gradle.write_text(s)
print("Private QA signing configured from reusable protected secrets"
      if publish else "Internal compile signing configured (NO artifact upload)")
