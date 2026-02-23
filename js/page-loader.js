(function () {
  function getShellUrl() {
    var cfg = (typeof window !== 'undefined' && window.WH_CONFIG && typeof window.WH_CONFIG === 'object')
      ? window.WH_CONFIG
      : {};
    return String(cfg.appShellUrl || 'app-shell.html');
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function injectShell() {
    var shellUrl = getShellUrl();
    if (typeof fetch === 'function' && typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
      return fetch(shellUrl, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('Shell fetch failed');
          return res.text();
        })
        .then(function (html) {
          if (!html || !html.trim()) throw new Error('Shell is empty');
          document.body.innerHTML = html;
        })
        .catch(function () {
          if (typeof window.WH_APP_SHELL === 'string' && window.WH_APP_SHELL.trim()) {
            document.body.innerHTML = window.WH_APP_SHELL;
            return;
          }
          throw new Error('App shell missing');
        });
    }
    if (typeof window.WH_APP_SHELL === 'string' && window.WH_APP_SHELL.trim()) {
      document.body.innerHTML = window.WH_APP_SHELL;
      return Promise.resolve();
    }
    return Promise.reject(new Error('App shell missing'));
  }

  function boot() {
    injectShell()
      .then(function () { return loadScript('js/config.js'); })
      .then(function () { return loadScript('js/validators.js'); })
      .then(function () { return loadScript('js/services/state-store.js'); })
      .then(function () { return loadScript('js/services/codebook-service.js'); })
      .then(function () { return loadScript('js/services/events-service.js'); })
      .then(function () { return loadScript('js/services/backup-service.js'); })
      .then(function () { return loadScript('js/services/points-service.js'); })
      .then(function () { return loadScript('js/codebook.js'); })
      .then(function () { return loadScript('js/events-data.js'); })
      .then(function () { return loadScript('js/app-core.js'); })
      .then(function () { return loadScript('js/app-render.js'); })
      .then(function () { return loadScript('js/app-events.js'); })
      .then(function () {
        var cfg = (typeof window !== 'undefined' && window.WH_CONFIG && typeof window.WH_CONFIG === 'object')
          ? window.WH_CONFIG
          : {};
        var enabled = cfg.serviceWorkerEnabled !== false;
        var swPath = String(cfg.serviceWorkerPath || 'service-worker.js');
        if (!enabled || !('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register(swPath).catch(function () {});
      })
      .catch(function (err) {
        document.body.innerHTML = '<main style="padding:16px;font-family:Arial,sans-serif"><h1>Wild Hound Club App</h1><p>Could not load app. ' + String(err && err.message ? err.message : err) + '</p></main>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
