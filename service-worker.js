const CACHE = 'futbol-feed-v1'
const OFFLINE_URL = '/'
const ASSETS = [
'/',
'/index.html',
'/styles.css',
'/app.js'
]
self.addEventListener('install', (e)=>{
e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))
self.skipWaiting()
})
self.addEventListener('activate', (e)=>{
e.waitUntil(self.clients.claim())
})
self.addEventListener('fetch', (e)=>{
if(e.request.method !== 'GET') return
e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request).then(resp=>{
const copy = resp.clone()
caches.open(CACHE).then(cache=>cache.put(e.request, copy))
return resp
}).catch(()=>caches.match(OFFLINE_URL))))
})
