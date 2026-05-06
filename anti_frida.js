// anti_frida.js
Java.perform(function() {
  try {
    const Socket = Java.use('java.net.Socket');
    Socket.connect.overload('java.net.SocketAddress').implementation = function (addr) {
      const s = addr.toString();
      if (s.indexOf(':27042') !== -1 || s.indexOf(':27043') !== -1) {
        console.log('[+] Blocage détection port Frida');
        throw new Error('Connection refused');
      }
      return this.connect(addr);
    };
  } catch (e) {}
});