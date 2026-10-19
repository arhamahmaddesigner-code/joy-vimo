"""Fast real-keytool tests; all private material is temporary and never uploaded."""
import base64, os, subprocess, sys, tempfile, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
GRADLE='''android {
 signingConfigs {
  debug {
   storeFile file('debug.keystore')
  }
 }
 buildTypes {
  release {
   signingConfig signingConfigs.debug
  }
 }
}
'''
class Signing(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.keys=tempfile.TemporaryDirectory()
  path=Path(cls.keys.name)/'test.jks'
  env={**os.environ,'TEST_STORE_PASS':'temporary-store-test','TEST_KEY_PASS':'temporary-key-test'}
  subprocess.run(['keytool','-genkeypair','-storetype','JKS','-keystore',str(path),'-alias','joy-test','-keyalg','RSA','-keysize','2048','-validity','2','-dname','CN=Disposable Test','-storepass:env','TEST_STORE_PASS','-keypass:env','TEST_KEY_PASS'],env=env,check=True,capture_output=True)
  cls.encoded=base64.b64encode(path.read_bytes()).decode()
 @classmethod
 def tearDownClass(cls): cls.keys.cleanup()
 def run_signing(self,overrides):
  with tempfile.TemporaryDirectory() as folder:
   root=Path(folder);app=root/'android/app';app.mkdir(parents=True)
   gradle=app/'build.gradle';gradle.write_text(GRADLE)
   env={k:v for k,v in os.environ.items() if not k.startswith('JOY_QA_')}
   env.update({'JOY_PUBLISH_PRIVATE_APK':'true','GITHUB_ENV':str(root/'github-env'),
    'JOY_QA_KEYSTORE_BASE64':self.encoded,'JOY_QA_STORE_PASSWORD':'temporary-store-test',
    'JOY_QA_KEY_ALIAS':'joy-test','JOY_QA_KEY_PASSWORD':'temporary-key-test'})
   env.update(overrides)
   result=subprocess.run([sys.executable,str(ROOT/'scripts/ensure_qa_signing.py')],cwd=root,env=env,capture_output=True,text=True)
   # No keystore or passwords may appear in normal/error output.
   for secret in [self.encoded,'temporary-store-test','temporary-key-test','wrong-key-password']:
    self.assertNotIn(secret,result.stdout+result.stderr)
   return result,gradle.read_text(),(app/'joyvimo-private-qa.keystore').exists()
 def test_valid_reusable_private_key(self):
  result,gradle,exists=self.run_signing({})
  self.assertEqual(result.returncode,0,result.stderr);self.assertTrue(exists)
  self.assertIn('signingConfig signingConfigs.joyVimoPrivateQa',gradle)
 def test_wrong_private_password_fails_before_gradle_and_removes_key(self):
  result,gradle,exists=self.run_signing({'JOY_QA_KEY_PASSWORD':'wrong-key-password'})
  self.assertNotEqual(result.returncode,0);self.assertEqual(gradle,GRADLE);self.assertFalse(exists)
 def test_wrong_store_password_removes_key(self):
  result,gradle,exists=self.run_signing({'JOY_QA_STORE_PASSWORD':'wrong-store-password'})
  self.assertNotEqual(result.returncode,0);self.assertFalse(exists)
 def test_missing_secret_does_not_fallback(self):
  result,gradle,exists=self.run_signing({'JOY_QA_KEY_PASSWORD':''})
  self.assertNotEqual(result.returncode,0);self.assertFalse(exists)
 def test_invalid_base64(self):
  result,gradle,exists=self.run_signing({'JOY_QA_KEYSTORE_BASE64':'invalid!!!'})
  self.assertNotEqual(result.returncode,0);self.assertFalse(exists)
 def test_internal_signing_needs_no_private_material(self):
  result,gradle,exists=self.run_signing({'JOY_PUBLISH_PRIVATE_APK':'false','JOY_QA_KEYSTORE_BASE64':'','JOY_QA_KEY_PASSWORD':''})
  self.assertEqual(result.returncode,0,result.stderr);self.assertFalse(exists)
  self.assertNotIn('joyVimoPrivateQa',gradle)
if __name__=='__main__': unittest.main()
