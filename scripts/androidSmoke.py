"""Internal emulator-only UI smoke. Never connects a physical owner phone."""
from pathlib import Path
import os, re, subprocess, time, xml.etree.ElementTree as ET
PACKAGE='com.joyvimo.app'
OUT=Path('qa-evidence'); OUT.mkdir(exist_ok=True)
SERIAL=os.environ.get('ANDROID_SERIAL','emulator-5554')
if not SERIAL.startswith('emulator-'):
    raise SystemExit('Smoke tests may clear data only on a disposable emulator')

def adb(*args, binary=False):
    return subprocess.check_output(['adb','-s',SERIAL,*args],timeout=45,text=not binary)

def hierarchy():
    adb('shell','uiautomator','dump','/sdcard/joy-smoke.xml')
    raw=adb('shell','cat','/sdcard/joy-smoke.xml')
    (OUT/'last-screen.xml').write_text(raw)
    return ET.fromstring(raw)

def find(label,scroll=False):
    for attempt in range(12):
        root=hierarchy()
        for node in root.iter('node'):
            values=[node.get('text',''),node.get('content-desc','')]
            if any(label in value for value in values):
                coords=list(map(int,re.findall(r'\d+',node.get('bounds',''))))
                if len(coords)==4 and coords[2]>coords[0] and coords[3]>coords[1]:
                    return node,coords
        if scroll and attempt>=2:
            # Resolution is deliberately set to dp at density 160 below.
            adb('shell','input','swipe','180','650','180','250','250')
        time.sleep(1)
    raise AssertionError('UI not found: '+label)

def tap(label,scroll=False):
    node,(x1,y1,x2,y2)=find(label,scroll)
    if node.get('enabled')=='false': raise AssertionError('Disabled: '+label)
    adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))

def screenshot(name):
    (OUT/(name+'.png')).write_bytes(adb('exec-out','screencap','-p',binary=True))

def launch():
    output=adb('shell','am','start','-W','-n',PACKAGE+'/.MainActivity')
    if 'Error:' in output: raise AssertionError(output)

try:
    apk=next(Path('android/app/build/outputs/apk/release').glob('*.apk'))
    adb('install','-r',str(apk))
    adb('logcat','-c')
    adb('shell','svc','wifi','disable'); adb('shell','svc','data','disable')
    for mode,age,width,scale in [('adult','18+',360,'1.0'),('teen','13–17',390,'1.3'),('kid','10–12',430,'1.5')]:
        adb('shell','am','force-stop',PACKAGE)
        adb('shell','pm','clear',PACKAGE)
        adb('shell','wm','size',str(width)+'x900')
        adb('shell','wm','density','160')
        adb('shell','settings','put','system','font_scale',scale)
        launch()
        tap('Get started',scroll=True)
        find('Choose your experience')
        tap(age)
        if mode=='kid': tap('I am the parent/caregiver',scroll=True)
        tap('Continue',scroll=True)
        find('What brings you joy?')
        tap('Start my journey',scroll=True)
        find('Your week')
        screenshot(mode+'-home-'+str(width)+'dp-font-'+scale)
        tap('Feed'); find('Joy Feed')
        screenshot(mode+'-feed')
        tap('Progress'); find('Your progress')
        tap('Community privacy and rankings',scroll=True)
        if mode=='adult': find('Opt-in positive-action leaderboard')
        else:
            find('Public leaderboards are unavailable for minors.')
            raw=ET.tostring(hierarchy(),encoding='unicode')
            if 'Email me a login code' in raw: raise AssertionError('Minor login exposed')
        screenshot(mode+'-privacy')
        adb('shell','am','force-stop',PACKAGE)
        launch(); find('Your week')
        print('PASS: offline onboarding/navigation/persistence '+mode+' '+str(width)+'dp font '+scale,flush=True)
    crash=adb('logcat','-d','-b','crash')
    (OUT/'crash-log.txt').write_text(crash)
    if PACKAGE in crash: raise AssertionError('JOY VIMO crash found')
    (OUT/'smoke-result.txt').write_text('PASS: three age modes, offline navigation, minor ranking restriction, persisted onboarding.\nNot proof of OTP, physical Realme behavior, all font/layout combinations, or full accessibility.\n')
except Exception:
    try: screenshot('failure')
    except Exception: pass
    try: (OUT/'crash-log.txt').write_text(adb('logcat','-d','-b','crash'))
    except Exception: pass
    raise
finally:
    adb('shell','wm','size','reset'); adb('shell','wm','density','reset')
    adb('shell','settings','put','system','font_scale','1.0')
