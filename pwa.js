// BizScale PWA — service worker registration + install prompt

(function() {
  'use strict';

  // Register service worker
  if ('serviceWorker' in navigator) {
    // Determine correct SW path (works from both root and /modules/ subdirectory)
    const swPath = location.pathname.includes('/modules/') ? '../sw.js' : './sw.js';
    navigator.serviceWorker.register(swPath, { scope: location.pathname.includes('/modules/') ? '../' : './' })
      .catch(function() {});
  }

  // Install prompt
  var deferredPrompt = null;
  var installBanner = null;

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    if (localStorage.getItem('fw_pwa_dismissed')) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    installBanner = document.createElement('div');
    installBanner.id = 'fwInstallBanner';
    installBanner.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;flex:1">' +
        '<span style="font-size:1.4rem">📈</span>' +
        '<div>' +
          '<div style="font-size:.85rem;font-weight:800;color:#fff">Install BizScale App</div>' +
          '<div style="font-size:.75rem;color:#94a3b8">Analyze, Fund, Grow · Works offline</div>' +
        '</div>' +
      '</div>' +
      '<button id="fwInstallBtn" style="background:#6366f1;color:#fff;border:none;border-radius:7px;padding:7px 16px;font-size:.8rem;font-weight:800;cursor:pointer;flex-shrink:0">Install</button>' +
      '<button id="fwInstallDismiss" style="background:none;border:none;color:#64748b;font-size:1.1rem;cursor:pointer;padding:4px 8px;flex-shrink:0">×</button>';

    Object.assign(installBanner.style, {
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: '99999',
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      maxWidth: '380px',
      width: 'calc(100% - 32px)',
    });

    document.body.appendChild(installBanner);

    document.getElementById('fwInstallBtn').addEventListener('click', function() {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(result) {
        deferredPrompt = null;
        if (installBanner) installBanner.remove();
      });
    });

    document.getElementById('fwInstallDismiss').addEventListener('click', function() {
      localStorage.setItem('fw_pwa_dismissed', '1');
      if (installBanner) installBanner.remove();
    });
  }

  // Already installed
  window.addEventListener('appinstalled', function() {
    if (installBanner) installBanner.remove();
    deferredPrompt = null;
  });

  // Offline / online status banner
  function updateOnlineStatus() {
    var existing = document.getElementById('fwOfflineBanner');
    if (!navigator.onLine) {
      if (existing) return;
      var banner = document.createElement('div');
      banner.id = 'fwOfflineBanner';
      banner.textContent = '⚠️ You are offline — showing cached data';
      Object.assign(banner.style, {
        position: 'fixed', top: '0', left: '0', right: '0',
        background: '#d97706', color: '#fff', textAlign: 'center',
        padding: '8px', fontSize: '.8rem', fontWeight: '700',
        zIndex: '999999',
      });
      document.body.prepend(banner);
    } else {
      if (existing) existing.remove();
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

})();
