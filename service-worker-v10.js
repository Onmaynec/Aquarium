'use strict';
const CACHE='living-aquarium-v10-command-v1';
const CORE=[
  './v10.html','./bootstrap-v10.js','./v7-expedition.js','./v8-genetics.js','./v9-restoration.js','./v10-command.js',
  './manifest-v10.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png',
  './runtime/chunk-00.js','./runtime/chunk-01a.js','./runtime/chunk-01b.js','./runtime/chunk-01c.js','./runtime/chunk-01d.js',
  './runtime/chunk-01e.js','./runtime/chunk-01f.js','./runtime/chunk-01g.js','./runtime/chunk-01h.js','./runtime/chunk-02.js','./runtime/chunk-03.js'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('living-aquarium-')&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
          return response;
        })
        .catch(()=>caches.match(request).then(hit=>hit||caches.match('./v10.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached=>{
      const network=fetch(request).then(response=>{
        if(response.ok&&new URL(request.url).origin===self.location.origin)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
        return response;
      });
      if(cached){
        event.waitUntil(network.catch(()=>{}));
        return cached;
      }
      return network.catch(()=>new Response('',{status:504,statusText:'Offline'}));
    })
  );
});
