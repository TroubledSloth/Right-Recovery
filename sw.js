// Caches the page so it opens instantly, even with no signal, after the first visit.
var C='rr-v1';
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(['./'])}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}))}));self.clients.claim()});
self.addEventListener('fetch',function(e){
if(e.request.method!=='GET')return;
// Network first (fresh content), fall back to cache quickly when offline.
e.respondWith(fetch(e.request).then(function(r){var x=r.clone();caches.open(C).then(function(c){c.put(e.request,x)});return r}).catch(function(){return caches.match(e.request).then(function(r){return r||caches.match('./')})}));
});
