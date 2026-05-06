// bypass_root.js
function safeContains(str, needle) {
  try { return (str || "").toLowerCase().indexOf((needle||"").toLowerCase()) !== -1; } catch (_) { return false; }
}

const suspiciousPaths = [
  "/system/bin/su", "/system/xbin/su", "/sbin/su", "/system/su",
  "/system/app/Superuser.apk", "/system/app/SuperSU.apk",
  "/system/bin/.ext/.su", "/system/usr/we-need-root/",
  "/system/xbin/daemonsu", "/system/etc/init.d/99SuperSUDaemon",
  "/system/bin/busybox", "/system/xbin/busybox"
];

Java.perform(function () {
  try {
    const Build = Java.use('android.os.Build');
    Object.defineProperty(Build, 'TAGS', { get: function() { return 'release-keys'; } });
    console.log('[+] Hook Build.TAGS -> release-keys');
  } catch (e) { }

  try {
    const RootBeer = Java.use('com.scottyab.rootbeer.RootBeer');
    RootBeer.isRooted.implementation = function () { return false; };
    if (RootBeer.isRootedWithBusyBoxCheck) {
      RootBeer.isRootedWithBusyBoxCheck.implementation = function () { return false; };
    }
    console.log('[+] RootBeer bypass installé');
  } catch (e) { }

  try {
    const File = Java.use('java.io.File');
    const origExists = File.exists;
    File.exists.implementation = function () {
      const path = this.getAbsolutePath();
      if (suspiciousPaths.indexOf(path) !== -1) {
        console.log('[+] File.exists bypass for', path);
        return false;
      }
      return origExists.call(this);
    };
  } catch (e) { }

  try {
    const Runtime = Java.use('java.lang.Runtime');
    const JString = Java.use('java.lang.String');

    Runtime.exec.overload('java.lang.String').implementation = function (cmd) {
      if (safeContains(cmd, ' su') || cmd.trim().toLowerCase().startsWith('su') || safeContains(cmd, 'busybox')) {
        console.log('[+] Blocked Runtime.exec:', cmd);
        return this.exec(JString.$new('echo'));
      }
      return this.exec(cmd);
    };
    console.log('[+] Runtime.exec hook installé');
  } catch (e) { }

  console.log('[*] Java layer bypass prêt !');
});