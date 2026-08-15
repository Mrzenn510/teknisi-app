// NAIKKAN angka versi ini SETIAP KALI upload perubahan ke index.html/manifest.json.
// Ini WAJIB — kalau angkanya tidak berubah, browser (terutama HP) akan terus
// menyajikan versi LAMA dari cache selamanya, walau file di GitHub sudah ter-update.
const CACHE = 'teknisi-app-v2';

// File statis yang boleh dicache untuk offline (jarang berubah)
const STATIC_ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache aset statis saja (index.html SENGAJA tidak di-precache di sini,
// supaya versi yang jalan pertama kali selalu langsung dari network)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: hapus SEMUA cache versi lama (nama cache lama pasti beda dari CACHE saat ini)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch:
// - HTML (index.html / navigasi) -> NETWORK-FIRST. Ini file paling penting untuk
//   selalu up-to-date; cache hanya dipakai sebagai fallback saat offline.
// - API eksternal (Telegram, MQTT broker, CDN, dsb) -> selalu network, tidak dicache.
// - Aset statis lain (manifest, icon) -> cache-first, karena jarang berubah &
//   supaya app tetap bisa dibuka saat offline/sinyal jelek.
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = req.url;

  const isExternalAPI =
    url.includes('api.telegram.org') ||
    url.includes('mosquitto.org') ||
    url.includes('emqx.io') ||
    url.includes('hivemq.com') ||
    url.includes('eclipseprojects.io') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('cdnjs.cloudflare.com') ||
    url.includes('jsdelivr.net') ||
    url.includes('unpkg.com') ||
    url.includes('qrserver.com') ||
    url.includes('ipapi.co') ||
    url.includes('ip-api.com');

  if(isExternalAPI){
    e.respondWith(fetch(req).catch(() => new Response('', {status: 503})));
    return;
  }

  const isHTML = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html') ||
                 url.endsWith('/index.html') || url.endsWith('/');

  if(isHTML){
    e.respondWith(
      fetch(req).then(res => {
        if(res && res.status === 200){
          const resClone = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, resClone));
        }
        return res;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Aset statis lain: cache-first, lalu simpan salinan terbaru di background
  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if(res && res.status === 200 && req.method === 'GET'){
          const resClone = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, resClone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
