// HGH Service Worker – cache & push
const CACHE_NAME = 'hgh-cache-v43';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/ED-general-common.css',
  '/hgh-pwa.js',
  '/ED-general-translations-data.js',
  '/ED-general-translation.js',
  '/ED-general-auth.js',
  '/ED-general-profile.js',
  '/ED-general-encrypted-backup.js',
  '/HGH-analytics.js',
  '/hgh-init.js',
  '/hgh-header.html',
  '/hgh-footer.html',
  '/manifest.json'
];

// ----- Helper: send messages to all clients -----
function sendToAllClients(type, data = {}) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type, ...data }));
  });
}

// ----- Forward SW console to client -----
['log','warn','error','info','debug'].forEach(m => {
  const orig = console[m];
  console[m] = function(...args) {
    orig.apply(console, args);
    sendToAllClients('SW_LOG', {
      level: m,
      message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
    });
  };
});

// ----- Install -----
self.addEventListener('install', event => {
  const isUpdate = self.registration.active !== null;
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => {
        self.skipWaiting();
        self.isUpdate = isUpdate;
      })
  );
  sendToAllClients('SW_INSTALL', { isUpdate });
});

// ----- Activate -----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
  if (self.isUpdate) {
    sendToAllClients('NEW_VERSION_READY');
  }
  sendToAllClients('SW_ACTIVATE');
});

// ----- Fetch (offline support) -----
self.addEventListener('fetch', event => {
  // Forward fetch to client (for monitoring)
  sendToAllClients('SW_FETCH', {
    url: event.request.url,
    method: event.request.method
  });
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Try with .html extension, fallback to index
          if (!event.request.url.endsWith('.html')) {
            const withHtml = new URL(event.request.url);
            withHtml.pathname += '.html';
            return caches.match(withHtml).then(htmlCached => htmlCached || caches.match('/index.html'));
          }
          return caches.match('/index.html');
        })
      )
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ----- Push Notifications (using HGH push table) -----
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
      console.debug('Push subscription already exists (expected).');
    } else if (!response.ok) {
      console.error('Failed to save HGH subscription:', response.status);
    }
  } catch (err) {
    console.debug('HGH push subscription save failed (offline)', err);
  }
}

self.addEventListener('push', event => {
  let data = { title: 'HGH Update', body: 'A new version of History & Geography Hub is ready.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  sendToAllClients('SW_PUSH', { data: JSON.stringify(data) });
  event.waitUntil(
    self.registration.showNotification(data.title, {
  body: data.body,
  icon: '/assets/icons/icon-96x96.png',
  badge: '/assets/icons/icon-96x96.png',
  requireInteraction: true
})
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          return;
        }
      }
      return clients.openWindow('/');
    })
  );
});

// ----- Background Sync (optional) -----
self.addEventListener('sync', event => {
  sendToAllClients('SW_SYNC', { tag: event.tag });
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-update') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        const allowed = clients.some(client =>
          client.connection?.effectiveType !== 'cellular' && !client.connection?.saveData
        );
        if (!allowed) return;
        return Promise.all(
          PRECACHE_ASSETS.map(url =>
            fetch(url, { cache: 'no-cache' })
              .then(response => {
                if (response.ok) {
                  return caches.open(CACHE_NAME).then(cache => cache.put(url, response));
                }
              })
              .catch(() => {})
          )
        );
      })
    );
  }
});

// Skip waiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});