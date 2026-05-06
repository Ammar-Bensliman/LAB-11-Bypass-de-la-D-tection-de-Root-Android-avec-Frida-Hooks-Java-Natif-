// bypass_native.js
const SUS = ['/system/bin/su', '/system/xbin/su', '/sbin/su', '/system/su', '/system/bin/busybox'];

function isSuspiciousPath(ptrPath) {
  try { 
    const p = ptrPath.readCString(); 
    return !!p && (SUS.indexOf(p) !== -1 || p.indexOf('/proc/mounts') !== -1); 
  } catch (_) { return false; }
}

function hookFunc(name, argIndexForPath) {
  try {
    const addr = Module.getExportByName(null, name);
    Interceptor.attach(addr, {
      onEnter(args) {
        const pathPtr = argIndexForPath >= 0 ? args[argIndexForPath] : null;
        if (pathPtr && isSuspiciousPath(pathPtr)) {
          this.block = true;
          this.path = pathPtr.readCString();
        }
      },
      onLeave(retval) {
        if (this.block) {
          console.log('[+] Code C Bloqué: ', name, 'sur', this.path);
          retval.replace(ptr(-1)); // Simule une erreur (fichier introuvable)
        }
      }
    });
  } catch (e) { }
}

hookFunc('open', 0);     
hookFunc('openat', 1);   
hookFunc('access', 0);   
hookFunc('stat', 0);