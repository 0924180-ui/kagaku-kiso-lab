const CACHE_NAME = 'kagaku-lab-v9-0';
const ASSETS = [
  './index.html','./study.html','./unit.html','./practice.html','./review.html','./records.html','./auth.html','./admin.html','./test.html',
  './css/style.css','./js/data.js','./js/storage.js','./js/nav.js','./js/home.js','./js/mastery.js','./js/supabase-sync.js',
  './js/study.js','./js/unit.js','./js/practice.js','./js/review.js','./js/records.js','./js/test.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 最新のファイルを優先し、正常なレスポンスだけキャッシュする
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
