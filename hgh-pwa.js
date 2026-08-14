// hgh-pwa.js – PWA & push for History & Geography Hub
(function () {
  'use strict';
  let deferredPrompt;
  let isSyncActive = false;

  // Helper: get translation or fallback
  function t(key, fallback) {
    if (window.t) {
      const translated = window.t(key);
      if (translated) return translated;
    }
    return fallback || key;
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function saveSubscription(subscription) {
    const SUPABASE_URL = 'https://hmjbzzuresgzwzefjpyt.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtamJ6enVyZXNnend6ZWZqcHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMjczNDUsImV4cCI6MjA5NTYwMzM0NX0.44Q-Hkl4Rr9LuQhwryrQklFi809xYGteHgsS9nMG0ro';
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/hgh_push_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ subscription }),
      });
      if (response.status === 409) {
        console.debug('HGH push subscription already exists');
      } else if (!response.ok) {
        console.error('Failed to save HGH subscription:', response.status);
      }
    } catch (err) {
      console.debug('HGH push save failed (offline)', err);
    }
  }

  async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await saveSubscription(existingSubscription);
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BO2xV3C8PcVFX-2SqsAyHZgzyDBaC0N7GzDktpoX2J5Pj5Cz9IazAcybQqxe13xYqGnEpoVmXM2jHFqmjXko1kw'
        ),
      });
      await saveSubscription(subscription);
    } catch (err) {
      console.debug('HGH push subscription error:', err);
    }
  }

  // Update the notification button text and visibility
  function updateNotificationUI() {
    const btn = document.getElementById('enableNotifications');
    if (!btn) return;
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        btn.style.display = 'inline-block';
        btn.textContent = t('enableNotificationsBtn', 'Enable Notifications');
      } else {
        btn.style.display = 'none';
        if (Notification.permission === 'granted') {
          subscribeToPush().catch(() => {});
        }
      }
    } else {
      btn.style.display = 'none';
    }
  }

  // Update the background sync button text
  function refreshSyncButtonText() {
    const btn = document.getElementById('enablePeriodicSync');
    if (!btn) return;
    const key = isSyncActive ? 'disablePeriodicSyncBtn' : 'enablePeriodicSyncBtn';
    btn.textContent = t(key, isSyncActive ? 'Disable Background Updates' : 'Enable Background Updates');
  }

  function setupInstallPrompt() {
    const installBtn = document.getElementById('installBtn');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) installBtn.style.display = 'inline-flex';
    });
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    }
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (installBtn) installBtn.style.display = 'none';
    });
  }

  function setupOfflineBanner() {
    const offlineBanner = document.getElementById('offline-banner');
    if (!offlineBanner) return;
    window.addEventListener('offline', () => offlineBanner.style.display = 'block');
    window.addEventListener('online', () => offlineBanner.style.display = 'none');
    if (!navigator.onLine) offlineBanner.style.display = 'block';
  }

  function setupServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    function showUpdateBanner() {
      const banner = document.getElementById('update-banner');
      if (banner) banner.style.display = 'flex';
    }
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'NEW_VERSION_READY') {
        showUpdateBanner();
      }
    });
    function registerSW() {
      if (document.readyState !== 'complete') {
        window.addEventListener('load', registerSW);
        return;
      }
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('HGH SW registered:', reg.scope))
        .catch(err => console.warn('SW registration failed:', err.message));
    }
    setTimeout(registerSW, 0);
  }

  function setupUpdateBanner() {
    const reloadBtn = document.getElementById('update-reload-btn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => window.location.reload());
    }
  }

  function setupPeriodicSync() {
    const periodicBtn = document.getElementById('enablePeriodicSync');
    if (!periodicBtn) return;

    // Check if browser supports Periodic Background Sync
    if (!('serviceWorker' in navigator) || !('periodicSync' in ServiceWorkerRegistration.prototype)) {
      periodicBtn.style.display = 'none';
      return;
    }

    periodicBtn.style.display = 'inline-block';

    async function checkRegistrationState() {
      try {
        const reg = await navigator.serviceWorker.ready;
        if ('periodicSync' in reg) {
          const tags = await reg.periodicSync.getTags();
          isSyncActive = tags.includes('periodic-update');
        }
      } catch (e) {
        isSyncActive = localStorage.getItem('hghPeriodicSyncActive') === 'true';
      }
      localStorage.setItem('hghPeriodicSyncActive', isSyncActive);
      refreshSyncButtonText();
    }

    checkRegistrationState();

    periodicBtn.addEventListener('click', async () => {
      const reg = await navigator.serviceWorker.ready;
      if (!('periodicSync' in reg)) return;
      if (isSyncActive) {
        try {
          await reg.periodicSync.unregister('periodic-update');
          isSyncActive = false;
        } catch (err) {
          console.error('Unregister failed:', err);
          alert('Could not disable background updates.');
          return;
        }
      } else {
        try {
          const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
          if (status.state !== 'granted') {
            alert(t('periodicSyncDenied', 'Permission not granted. Please check site settings.'));
            return;
          }
          await reg.periodicSync.register('periodic-update', { minInterval: 6 * 60 * 60 * 1000 });
          isSyncActive = true;
        } catch (err) {
          console.error('Register failed:', err);
          alert(t('periodicSyncDenied', 'Permission not granted.'));
          return;
        }
      }
      localStorage.setItem('hghPeriodicSyncActive', isSyncActive);
      refreshSyncButtonText();
      alert(isSyncActive
        ? t('periodicSyncEnabled', 'Background updates enabled!')
        : t('periodicSyncDisabled', 'Background updates disabled!'));
    });
  }

  // Refresh both buttons when the language changes
  function onLanguageChange() {
    updateNotificationUI();
    refreshSyncButtonText();
  }

  function init() {
    setupInstallPrompt();
    setupOfflineBanner();
    setupServiceWorker();
    setupUpdateBanner();
    updateNotificationUI();
    setupPeriodicSync();

    // Attach click to notification button
    const notifBtn = document.getElementById('enableNotifications');
    if (notifBtn) {
      notifBtn.addEventListener('click', async () => {
        await subscribeToPush();
        updateNotificationUI();
      });
    }

    // Listen for language changes
    document.addEventListener('translationsApplied', onLanguageChange);
  }

  window.EDPWA = {
    init,
    subscribeToPush,
    updateNotificationUI,
    refreshButtons: function () {
      updateNotificationUI();
      refreshSyncButtonText();
    }
  };
})();