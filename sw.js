const CACHE = 'teknisi-app-v1';

// File yang di-cache untuk offline
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Install: cache semua aset
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first untuk aset lokal, network-first untuk API eksternal
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Selalu network untuk Telegram, MQTT, CDN, Google Fonts — tidak perlu offline
  if(
    url.includes('api.telegram.org') ||
    url.includes('mosquitto.org') ||
    url.includes('googleapis.com') ||
    url.includes('cdnjs.cloudflare.com') ||
    url.includes('jsdelivr.net') ||
    url.includes('unpkg.com') ||
    url.includes('qrserver.com') ||
    url.includes('ipapi.co') ||
    url.includes('ip-api.com')
  ){
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }

  // Cache-first untuk file lokal (index.html, manifest, icon)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        // Cache response baru
        if(res && res.status === 200 && e.request.method === 'GET'){
          const resClone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, resClone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
