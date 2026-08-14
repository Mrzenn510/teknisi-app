// Naikkan nomor versi ini SETIAP KALI kamu update index.html / manifest.json
// dan upload ulang ke hosting (GitHub Pages dll). Ini memaksa browser
// mengenali service worker sebagai "berubah" dan mengambil versi terbaru.
const CACHE = 'teknisi-app-v2';

// File yang di-cache untuk offline
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Install: cache semua aset (bypass HTTP cache supaya benar-benar fresh)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(ASSETS.map(url =>
        fetch(url, {cache: 'no-store'}).then(res => cache.put(url, res)).catch(()=>{})
      ))
    )
  );
  self.skipWaiting();
});

// Activate: hapus SEMUA cache lama (nama versi apapun selain yang aktif sekarang)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: NETWORK-FIRST untuk file lokal (index.html, manifest, icon) supaya
// PWA yang sudah ter-install selalu dapat versi terbaru saat online, dan
// baru pakai cache sebagai fallback kalau benar-benar offline.
self.addEventListener('fetch', e => {
  const url = e.request.url;

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

  if(e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request, {cache: 'no-store'})
      .then(res => {
        if(res && res.status === 200){
          const resClone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(cached => cached || caches.match('./index.html'))
      )
  );
});
