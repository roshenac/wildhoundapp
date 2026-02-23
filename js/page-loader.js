(function () {
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
    if (typeof window.WH_APP_SHELL === 'string' && window.WH_APP_SHELL.trim()) {
      document.body.innerHTML = window.WH_APP_SHELL;
      return Promise.resolve();
    }
    return Promise.reject(new Error('App shell missing'));
  }

  function boot() {
    injectShell()
      .then(function () { return loadScript('js/codebook.js'); })
      .then(function () { return loadScript('js/events-data.js'); })
      .then(function () { return loadScript('js/app-core.js'); })
      .then(function () { return loadScript('js/app-render.js'); })
      .then(function () { return loadScript('js/app-events.js'); })
      .catch(function (err) {
        document.body.innerHTML = '<main style="padding:16px;font-family:Arial,sans-serif"><h1>Wild Hound</h1><p>Could not load app. ' + String(err && err.message ? err.message : err) + '</p></main>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
