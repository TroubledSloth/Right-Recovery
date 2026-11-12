// Saves the site on the phone: it opens fast on a weak signal and works with no signal after the first visit.
var C='rr-v2';
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(C).then(function(c){return c.addAll(['./'])}));
  self.skipWaiting();
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var q=e.request;
  if(q.method!=='GET'||new URL(q.url).origin!==location.origin)return;
  var nav=q.mode==='navigate';
  function saved(){
    return caches.match(q).then(function(r){return r||(nav?caches.match('./'):undefined)});
  }
  // Fetch a fresh copy and save it for next time.
  var saving;
  var net=fetch(q).then(function(r){
    if(r.ok){var x=r.clone();saving=caches.open(C).then(function(c){return c.put(q,x)})}
    return r;
  });
  e.waitUntil(net.then(function(){return saving},function(){}));
  e.respondWith(new Promise(function(ok){
    var done=false;
    function use(r){if(r&&!done){done=true;ok(r)}}
    // Wait up to 3 seconds for the network; on a slow or dead signal, show the saved copy instead.
    var t=setTimeout(function(){saved().then(use)},3000);
    net.then(function(r){clearTimeout(t);use(r)},function(){
      clearTimeout(t);
      saved().then(function(r){use(r||Response.error())});
    });
  }));
});
