const CACHE="gym-tracker-v1.7.1";
const ASSETS=["./","./index.html","./styles.css","./enhancements.css","./ui-v16.css","./custom-exercises.css","./app.js","./enhancements.js","./rest-timer.js","./ui-v16.js","./custom-exercises.js","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
